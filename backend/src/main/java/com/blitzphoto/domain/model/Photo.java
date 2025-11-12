package com.blitzphoto.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Photo Domain Model (Rich Domain Model)
 * 
 * Represents a photo in the system with business logic encapsulated.
 * This is part of the UploadJob aggregate.
 */
@Entity
@Table(name = "photos")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upload_job_id", nullable = false)
    @Setter
    private UploadJob uploadJob;
    
    @Column(name = "upload_job_id", nullable = false, insertable = false, updatable = false)
    private UUID uploadJobId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UploadStatus status = UploadStatus.PENDING;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "thumbnail_s3_key")
    private String thumbnailS3Key;

    private Integer width;
    private Integer height;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    /**
     * Business Logic: Mark photo as completed
     * 
     * @param s3Key The S3 key where the photo is stored
     * @param thumbnailS3Key The S3 key for the thumbnail (optional)
     * @param width Photo width in pixels
     * @param height Photo height in pixels
     */
    public void markAsCompleted(String s3Key, String thumbnailS3Key, Integer width, Integer height) {
        if (this.status == UploadStatus.COMPLETED) {
            throw new IllegalStateException("Photo is already completed");
        }
        
        this.status = UploadStatus.COMPLETED;
        this.s3Key = s3Key;
        this.thumbnailS3Key = thumbnailS3Key;
        this.width = width;
        this.height = height;
        this.uploadedAt = Instant.now();
        this.errorMessage = null;
    }

    /**
     * Business Logic: Mark photo as failed
     * 
     * @param errorMessage The error message describing the failure
     */
    public void markAsFailed(String errorMessage) {
        if (this.status == UploadStatus.COMPLETED) {
            throw new IllegalStateException("Cannot mark completed photo as failed");
        }
        
        this.status = UploadStatus.FAILED;
        this.errorMessage = errorMessage;
        this.updatedAt = Instant.now();
    }

    /**
     * Business Logic: Mark photo as uploading
     */
    public void markAsUploading() {
        if (this.status == UploadStatus.COMPLETED) {
            throw new IllegalStateException("Cannot mark completed photo as uploading");
        }
        
        this.status = UploadStatus.UPLOADING;
        this.updatedAt = Instant.now();
    }

    /**
     * Business Logic: Check if photo can be retried
     * 
     * @return true if photo can be retried
     */
    public boolean canBeRetried() {
        return this.status == UploadStatus.FAILED;
    }

    /**
     * Business Logic: Retry failed photo
     */
    public void retry() {
        if (!canBeRetried()) {
            throw new IllegalStateException("Photo cannot be retried. Current status: " + this.status);
        }
        
        this.status = UploadStatus.PENDING;
        this.errorMessage = null;
        this.updatedAt = Instant.now();
    }

    /**
     * Business Logic: Check if photo is in a terminal state
     * 
     * @return true if photo is completed or failed
     */
    public boolean isInTerminalState() {
        return this.status == UploadStatus.COMPLETED || this.status == UploadStatus.FAILED;
    }

    /**
     * Upload Status Enum
     */
    public enum UploadStatus {
        PENDING,      // Waiting to be uploaded
        UPLOADING,    // Currently being uploaded
        PROCESSING,   // Upload complete, processing (thumbnail generation, etc.)
        COMPLETED,    // Successfully uploaded and processed
        FAILED        // Upload or processing failed
    }
}

