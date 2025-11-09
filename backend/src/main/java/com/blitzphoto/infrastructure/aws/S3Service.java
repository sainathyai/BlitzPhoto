package com.blitzphoto.infrastructure.aws;

import com.blitzphoto.domain.model.PresignedUrl;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * S3 Service
 * 
 * Handles S3 operations including presigned URL generation for Blitz Speed uploads.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Presigner s3Presigner;

    @Value("${blitzphoto.aws.s3.uploads-bucket}")
    private String uploadsBucket;

    @Value("${blitzphoto.aws.s3.thumbnails-bucket}")
    private String thumbnailsBucket;

    @Value("${blitzphoto.aws.s3.presigned-url-expiration-minutes:15}")
    private int presignedUrlExpirationMinutes;

    /**
     * Generate presigned URL for photo upload
     * 
     * @param userId User ID
     * @param fileName Original file name
     * @param contentType Content type (e.g., image/jpeg)
     * @param contentLength File size in bytes
     * @return PresignedUrlResult containing both S3 key and presigned URL
     */
    public PresignedUrlResult generatePresignedUploadUrl(
            UUID userId,
            String fileName,
            String contentType,
            Long contentLength
    ) {
        log.debug("Generating presigned URL for user {}: {} ({} bytes)", userId, fileName, contentLength);

        // Generate unique S3 key
        String s3Key = generateS3Key(userId, fileName);

        // Create presigned PUT request
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(uploadsBucket)
                .key(s3Key)
                .contentType(contentType)
                .contentLength(contentLength)
                .serverSideEncryption(software.amazon.awssdk.services.s3.model.ServerSideEncryption.AES256)
                .build();

        // Generate presigned URL with Transfer Acceleration endpoint
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
                        .putObjectRequest(putObjectRequest)
                        .build()
        );

        String presignedUrl = presignedRequest.url().toString();
        
        // Use Transfer Acceleration endpoint if enabled
        // Replace s3.amazonaws.com with s3-accelerate.amazonaws.com
        if (presignedUrl.contains("s3.amazonaws.com")) {
            presignedUrl = presignedUrl.replace("s3.amazonaws.com", "s3-accelerate.amazonaws.com");
        }

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(presignedUrlExpirationMinutes));

        log.debug("Generated presigned URL for {}: expires at {}", s3Key, expiresAt);

        return new PresignedUrlResult(
                s3Key,
                new PresignedUrl(
                        presignedUrl,
                        expiresAt,
                        "PUT",
                        contentType,
                        contentLength
                )
        );
    }

    /**
     * Generate presigned URL for multipart upload (for large files >5MB)
     * 
     * @param userId User ID
     * @param fileName Original file name
     * @param contentType Content type
     * @param contentLength File size in bytes
     * @param partNumber Part number (1-based)
     * @param uploadId Multipart upload ID
     * @return Presigned URL value object
     */
    public PresignedUrl generatePresignedMultipartUploadUrl(
            UUID userId,
            String fileName,
            String contentType,
            Long contentLength,
            int partNumber,
            String uploadId
    ) {
        log.debug("Generating presigned multipart URL for user {}: {} part {} (uploadId: {})", 
                userId, fileName, partNumber, uploadId);

        String s3Key = generateS3Key(userId, fileName);

        // Create presigned PUT request for multipart upload part
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(uploadsBucket)
                .key(s3Key)
                .contentType(contentType)
                .serverSideEncryption(software.amazon.awssdk.services.s3.model.ServerSideEncryption.AES256)
                .build();

        // Generate presigned URL
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
                        .putObjectRequest(putObjectRequest)
                        .build()
        );

        String presignedUrl = presignedRequest.url().toString();
        
        // Use Transfer Acceleration endpoint if enabled
        if (presignedUrl.contains("s3.amazonaws.com")) {
            presignedUrl = presignedUrl.replace("s3.amazonaws.com", "s3-accelerate.amazonaws.com");
        }

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(presignedUrlExpirationMinutes));

        return new PresignedUrl(
                presignedUrl,
                expiresAt,
                "PUT",
                contentType,
                contentLength
        );
    }

    /**
     * Generate presigned URL for thumbnail download
     * 
     * @param thumbnailS3Key Thumbnail S3 key
     * @return Presigned URL value object
     */
    public PresignedUrl generatePresignedThumbnailUrl(String thumbnailS3Key) {
        log.debug("Generating presigned thumbnail URL: {}", thumbnailS3Key);

        software.amazon.awssdk.services.s3.model.GetObjectRequest getObjectRequest = 
                software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                        .bucket(thumbnailsBucket)
                        .key(thumbnailS3Key)
                        .build();

        software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest presignedRequest = 
                s3Presigner.presignGetObject(
                        software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                                .signatureDuration(Duration.ofMinutes(60)) // Thumbnails valid for 1 hour
                                .getObjectRequest(getObjectRequest)
                                .build()
                );

        String presignedUrl = presignedRequest.url().toString();
        
        // Use Transfer Acceleration endpoint if enabled
        if (presignedUrl.contains("s3.amazonaws.com")) {
            presignedUrl = presignedUrl.replace("s3.amazonaws.com", "s3-accelerate.amazonaws.com");
        }

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(60));

        return new PresignedUrl(
                presignedUrl,
                expiresAt,
                "GET",
                "image/jpeg", // Thumbnails are JPEG
                null
        );
    }

    /**
     * Generate unique S3 key for photo
     * 
     * @param userId User ID
     * @param fileName Original file name
     * @return S3 key
     */
    private String generateS3Key(UUID userId, String fileName) {
        // Format: users/{userId}/{timestamp}-{uuid}-{filename}
        // This ensures uniqueness and organizes by user
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String uuid = UUID.randomUUID().toString();
        String sanitizedFileName = sanitizeFileName(fileName);
        
        return String.format("users/%s/%s-%s-%s", userId, timestamp, uuid, sanitizedFileName);
    }

    /**
     * Sanitize file name for S3
     * 
     * @param fileName Original file name
     * @return Sanitized file name
     */
    private String sanitizeFileName(String fileName) {
        // Remove path separators and special characters
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /**
     * Get uploads bucket name
     * 
     * @return Uploads bucket name
     */
    public String getUploadsBucket() {
        return uploadsBucket;
    }

    /**
     * Get thumbnails bucket name
     * 
     * @return Thumbnails bucket name
     */
    public String getThumbnailsBucket() {
        return thumbnailsBucket;
    }

    /**
     * Presigned URL Result
     * 
     * Contains both the S3 key and the presigned URL.
     */
    @Value
    public static class PresignedUrlResult {
        String s3Key;
        PresignedUrl presignedUrl;
    }
}

