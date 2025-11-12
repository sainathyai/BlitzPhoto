package com.blitzphoto.application.messaging;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.PhotoRepository;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.infrastructure.aws.S3Service;
import com.blitzphoto.infrastructure.image.ImageProcessingService;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.util.List;
import java.util.UUID;

/**
 * Upload Job Message Handler
 * 
 * Handles async processing of upload jobs from SQS.
 * This service processes uploads after they've been uploaded to S3.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UploadJobMessageHandler {

    private final UploadJobRepository uploadJobRepository;
    private final PhotoRepository photoRepository;
    private final S3Service s3Service;
    private final ImageProcessingService imageProcessingService;
    private final S3Client s3Client;

    @Value("${blitzphoto.aws.s3.uploads-bucket}")
    private String uploadsBucket;

    /**
     * Process upload job message
     * 
     * This method is called asynchronously when a message is received from SQS.
     * It processes the upload job, verifies S3 uploads, and updates photo statuses.
     * 
     * @param uploadJobId Upload job ID
     * @param userId User ID
     */
    @Async
    @Transactional
    public void processUploadJob(UUID uploadJobId, UUID userId) {
        log.info("Processing upload job: jobId={}, userId={}", uploadJobId, userId);

        try {
            // Load upload job with photos
            UploadJob uploadJob = uploadJobRepository.findById(uploadJobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Upload job not found: " + uploadJobId));

            // Verify user matches
            if (!uploadJob.getUserId().equals(userId)) {
                log.warn("User mismatch for upload job: jobId={}, expectedUserId={}, actualUserId={}", 
                        uploadJobId, uploadJob.getUserId(), userId);
                throw new IllegalArgumentException("User mismatch for upload job");
            }

            // Process each photo in the job
            List<Photo> photos = photoRepository.findByUploadJobId(uploadJobId);
            log.debug("Processing {} photos for upload job: jobId={}", photos.size(), uploadJobId);

            for (Photo photo : photos) {
                processPhoto(photo);
            }

            // Update upload job status based on photo statuses
            updateUploadJobStatus(uploadJob);

            log.info("Completed processing upload job: jobId={}, status={}", 
                    uploadJobId, uploadJob.getStatus());

        } catch (Exception e) {
            log.error("Failed to process upload job: jobId={}", uploadJobId, e);
            // The message will be retried by SQS (up to 3 times)
            // After 3 retries, it will be sent to the dead-letter queue
            throw new RuntimeException("Failed to process upload job", e);
        }
    }

    /**
     * Process individual photo
     * 
     * Verifies the photo exists in S3 and updates its status.
     */
    private void processPhoto(Photo photo) {
        log.debug("Processing photo: photoId={}, s3Key={}, status={}", photo.getId(), photo.getS3Key(), photo.getStatus());

        try {
            // Verify photo has S3 key
            if (photo.getS3Key() == null || photo.getS3Key().isEmpty()) {
                log.warn("Photo has no S3 key: photoId={}", photo.getId());
                photo.markAsFailed("S3 key is missing");
                return;
            }

            // Check if S3 object exists
            boolean s3ObjectExists = checkS3ObjectExists(photo.getS3Key());
            
            if (!s3ObjectExists) {
                // S3 object doesn't exist yet
                if (photo.getStatus() == Photo.UploadStatus.PENDING) {
                    // File hasn't been uploaded yet, skip processing (will be retried later)
                    log.debug("S3 object not found for PENDING photo: photoId={}, s3Key={}. Skipping - will retry when file is uploaded.", 
                            photo.getId(), photo.getS3Key());
                    return;
                } else {
                    // Photo was marked as UPLOADING but file doesn't exist - mark as failed
                    log.warn("S3 object not found for UPLOADING photo: photoId={}, s3Key={}", photo.getId(), photo.getS3Key());
                    photo.markAsFailed("S3 object not found - upload may have failed");
                    return;
                }
            }

            // S3 object exists - process the photo
            if (photo.getStatus() == Photo.UploadStatus.PENDING) {
                // Mark as uploading now that we've verified the file exists
                photo.markAsUploading();
            }

            // Verify S3 object exists and process image
            if (photo.getStatus() == Photo.UploadStatus.UPLOADING) {
                // Generate thumbnail and extract metadata
                try {
                    String thumbnailS3Key = generateThumbnailS3Key(photo.getS3Key());
                    imageProcessingService.generateAndUploadThumbnail(photo.getS3Key(), thumbnailS3Key);
                    
                    // Extract image metadata
                    ImageProcessingService.ImageMetadata metadata = 
                            imageProcessingService.extractImageMetadata(photo.getS3Key());
                    
                    Integer width = metadata != null ? metadata.width() : null;
                    Integer height = metadata != null ? metadata.height() : null;
                    
                    // Mark as completed with all metadata
                    photo.markAsCompleted(photo.getS3Key(), thumbnailS3Key, width, height);
                    log.info("Successfully processed photo: photoId={}", photo.getId());
                } catch (Exception e) {
                    log.error("Failed to process photo: photoId={}", photo.getId(), e);
                    photo.markAsFailed("Failed to process image: " + e.getMessage());
                }
            }

            log.debug("Processed photo: photoId={}, status={}", photo.getId(), photo.getStatus());

        } catch (Exception e) {
            log.error("Failed to process photo: photoId={}", photo.getId(), e);
            photo.markAsFailed("Failed to process photo: " + e.getMessage());
        }
    }

    /**
     * Check if S3 object exists
     * 
     * @param s3Key S3 key to check
     * @return true if object exists, false otherwise
     */
    private boolean checkS3ObjectExists(String s3Key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(uploadsBucket)
                    .key(s3Key)
                    .build();
            
            s3Client.headObject(headRequest);
            log.debug("S3 object exists: s3Key={}", s3Key);
            return true;
        } catch (NoSuchKeyException e) {
            log.debug("S3 object does not exist: s3Key={}", s3Key);
            return false;
        } catch (Exception e) {
            log.error("Error checking S3 object existence: s3Key={}", s3Key, e);
            // Assume it doesn't exist if we can't check
            return false;
        }
    }

    /**
     * Update upload job status based on photo statuses
     */
    private void updateUploadJobStatus(UploadJob uploadJob) {
        List<Photo> photos = photoRepository.findByUploadJobId(uploadJob.getId());

        long totalPhotos = photos.size();
        long completedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.COMPLETED)
                .count();
        long failedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.FAILED)
                .count();
        long inProgressPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.UPLOADING || 
                             p.getStatus() == Photo.UploadStatus.PROCESSING)
                .count();

        log.debug("Upload job status update: jobId={}, total={}, completed={}, failed={}, inProgress={}", 
                uploadJob.getId(), totalPhotos, completedPhotos, failedPhotos, inProgressPhotos);

        // Update job status based on photo statuses
        if (inProgressPhotos == 0) {
            if (failedPhotos == 0) {
                // All photos completed
                uploadJob.setStatus(UploadJob.UploadJobStatus.COMPLETED);
            } else if (completedPhotos > 0) {
                // Some photos completed, some failed
                uploadJob.setStatus(UploadJob.UploadJobStatus.PARTIALLY_COMPLETED);
            } else {
                // All photos failed
                uploadJob.setStatus(UploadJob.UploadJobStatus.FAILED);
            }
        } else {
            // Still processing
            uploadJob.setStatus(UploadJob.UploadJobStatus.IN_PROGRESS);
        }

        uploadJobRepository.save(uploadJob);
    }

    /**
     * Generate thumbnail S3 key from original S3 key
     */
    private String generateThumbnailS3Key(String originalS3Key) {
        // Replace uploads bucket path with thumbnails path
        // Format: thumbnails/{userId}/{timestamp}-{uuid}-{filename}.jpg
        String thumbnailKey = originalS3Key.replace("users/", "thumbnails/");
        
        // Ensure .jpg extension for thumbnails
        if (!thumbnailKey.endsWith(".jpg")) {
            int lastDot = thumbnailKey.lastIndexOf('.');
            if (lastDot > 0) {
                thumbnailKey = thumbnailKey.substring(0, lastDot) + ".jpg";
            } else {
                thumbnailKey = thumbnailKey + ".jpg";
            }
        }
        
        return thumbnailKey;
    }
}

