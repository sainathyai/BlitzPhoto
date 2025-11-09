package com.blitzphoto.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * UploadJob Aggregate Root
 * 
 * Represents a batch upload job containing multiple photos.
 * This is the aggregate root that manages the Photo entities.
 */
@Entity
@Table(name = "upload_jobs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UploadJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UploadJobStatus status = UploadJobStatus.CREATED;

    @OneToMany(mappedBy = "uploadJob", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    private Instant completedAt;

    /**
     * Business Logic: Add a photo to this upload job
     * 
     * @param photo The photo to add
     */
    public void addPhoto(Photo photo) {
        if (this.status == UploadJobStatus.COMPLETED) {
            throw new IllegalStateException("Cannot add photos to completed upload job");
        }
        
        if (this.status == UploadJobStatus.FAILED) {
            throw new IllegalStateException("Cannot add photos to failed upload job");
        }
        
        photo.setUploadJob(this);
        this.photos.add(photo);
        this.updatedAt = Instant.now();
        
        // Update job status based on photo count
        if (this.status == UploadJobStatus.CREATED && !this.photos.isEmpty()) {
            this.status = UploadJobStatus.IN_PROGRESS;
        }
    }

    /**
     * Business Logic: Mark a photo as completed
     * 
     * @param photoId The ID of the photo that completed
     */
    public void photoCompleted(UUID photoId) {
        Photo photo = findPhotoById(photoId);
        if (photo == null) {
            throw new IllegalArgumentException("Photo not found in this upload job: " + photoId);
        }
        
        // Check if all photos are completed
        boolean allCompleted = this.photos.stream()
                .allMatch(p -> p.getStatus() == Photo.UploadStatus.COMPLETED);
        
        if (allCompleted) {
            this.status = UploadJobStatus.COMPLETED;
            this.completedAt = Instant.now();
        }
        
        this.updatedAt = Instant.now();
    }

    /**
     * Business Logic: Mark a photo as failed
     * 
     * @param photoId The ID of the photo that failed
     * @param errorMessage The error message
     */
    public void photoFailed(UUID photoId, String errorMessage) {
        Photo photo = findPhotoById(photoId);
        if (photo == null) {
            throw new IllegalArgumentException("Photo not found in this upload job: " + photoId);
        }
        
        // Check if all photos are in terminal state (completed or failed)
        boolean allTerminal = this.photos.stream()
                .allMatch(Photo::isInTerminalState);
        
        if (allTerminal) {
            // If all are failed, mark job as failed
            boolean allFailed = this.photos.stream()
                    .allMatch(p -> p.getStatus() == Photo.UploadStatus.FAILED);
            
            if (allFailed) {
                this.status = UploadJobStatus.FAILED;
            } else {
                // Some completed, some failed - mark as partially completed
                this.status = UploadJobStatus.PARTIALLY_COMPLETED;
            }
        }
        
        this.updatedAt = Instant.now();
    }

    /**
     * Business Logic: Get progress percentage
     * 
     * @return Progress percentage (0-100)
     */
    public int getProgressPercentage() {
        if (this.photos.isEmpty()) {
            return 0;
        }
        
        long completedCount = this.photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.COMPLETED)
                .count();
        
        return (int) ((completedCount * 100) / this.photos.size());
    }

    /**
     * Business Logic: Check if job can be retried
     * 
     * @return true if job can be retried
     */
    public boolean canBeRetried() {
        return this.status == UploadJobStatus.FAILED || 
               this.status == UploadJobStatus.PARTIALLY_COMPLETED;
    }

    /**
     * Business Logic: Retry failed photos
     */
    public void retryFailedPhotos() {
        if (!canBeRetried()) {
            throw new IllegalStateException("Upload job cannot be retried. Current status: " + this.status);
        }
        
        this.photos.stream()
                .filter(Photo::canBeRetried)
                .forEach(Photo::retry);
        
        this.status = UploadJobStatus.IN_PROGRESS;
        this.updatedAt = Instant.now();
    }

    /**
     * Helper: Find photo by ID
     */
    private Photo findPhotoById(UUID photoId) {
        return this.photos.stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Upload Job Status Enum
     */
    public enum UploadJobStatus {
        CREATED,              // Job created, no photos added yet
        IN_PROGRESS,          // Photos being uploaded
        COMPLETED,            // All photos successfully uploaded
        PARTIALLY_COMPLETED,  // Some photos completed, some failed
        FAILED                // All photos failed
    }
}

