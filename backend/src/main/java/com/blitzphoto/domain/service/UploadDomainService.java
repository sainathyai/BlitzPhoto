package com.blitzphoto.domain.service;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Upload Domain Service
 * 
 * Domain service for upload-related business logic that doesn't naturally
 * fit in a single aggregate. This service coordinates between aggregates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UploadDomainService {

    /**
     * Business Logic: Create an upload job for a user
     * 
     * @param user The user creating the upload job
     * @param photoMetadata List of photo metadata (fileName, contentType, fileSize)
     * @return The created upload job
     */
    public UploadJob createUploadJob(User user, List<PhotoMetadata> photoMetadata) {
        // Business rule: User must be active
        if (!user.canUpload()) {
            throw new IllegalStateException("User is not active and cannot upload photos");
        }
        
        // Business rule: Must have at least one photo
        if (photoMetadata == null || photoMetadata.isEmpty()) {
            throw new IllegalArgumentException("Upload job must contain at least one photo");
        }
        
        // Business rule: Maximum 100 photos per job (Blitz Speed requirement)
        if (photoMetadata.size() > 100) {
            throw new IllegalArgumentException("Upload job cannot contain more than 100 photos");
        }
        
        // Create upload job
        UploadJob uploadJob = UploadJob.builder()
                .userId(user.getId())
                .status(UploadJob.UploadJobStatus.CREATED)
                .build();
        
        // Add photos to the job
        for (PhotoMetadata metadata : photoMetadata) {
            Photo photo = Photo.builder()
                    .fileName(metadata.fileName())
                    .contentType(metadata.contentType())
                    .fileSize(metadata.fileSize())
                    .status(Photo.UploadStatus.PENDING)
                    .build();
            
            uploadJob.addPhoto(photo);
        }
        
        log.info("Created upload job {} for user {} with {} photos", 
                uploadJob.getId(), user.getId(), photoMetadata.size());
        
        return uploadJob;
    }

    /**
     * Photo Metadata Value Object
     */
    public record PhotoMetadata(
            String fileName,
            String contentType,
            Long fileSize
    ) {}
}

