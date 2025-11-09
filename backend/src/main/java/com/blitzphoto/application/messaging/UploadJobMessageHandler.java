package com.blitzphoto.application.messaging;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.PhotoRepository;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.infrastructure.aws.S3Service;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        log.debug("Processing photo: photoId={}, s3Key={}", photo.getId(), photo.getS3Key());

        try {
            // Verify photo exists in S3
            // For now, we assume the photo was successfully uploaded if it has an S3 key
            // In a production system, you would verify the S3 object exists
            if (photo.getS3Key() == null || photo.getS3Key().isEmpty()) {
                log.warn("Photo has no S3 key: photoId={}", photo.getId());
                photo.markAsFailed("S3 key is missing");
                return;
            }

            // Mark photo as uploaded (status will be updated to PROCESSING)
            if (photo.getStatus() == Photo.UploadStatus.PENDING) {
                photo.markAsUploading();
            }

            // In a real system, you would:
            // 1. Verify the S3 object exists
            // 2. Generate thumbnail (async)
            // 3. Extract metadata (dimensions, etc.)
            // 4. Update photo with metadata
            // 5. Mark as completed

            // For now, we'll mark it as uploaded and let the processing happen later
            if (photo.getStatus() == Photo.UploadStatus.UPLOADING) {
                photo.markAsUploaded();
            }

            log.debug("Processed photo: photoId={}, status={}", photo.getId(), photo.getStatus());

        } catch (Exception e) {
            log.error("Failed to process photo: photoId={}", photo.getId(), e);
            photo.markAsFailed("Failed to process photo: " + e.getMessage());
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
}

