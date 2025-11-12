package com.blitzphoto.application.command;

import com.blitzphoto.application.dto.InitiateUploadResponse;
import com.blitzphoto.application.dto.PhotoUploadResponse;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.PresignedUrl;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.model.User;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.domain.repository.UserRepository;
import com.blitzphoto.domain.service.UploadDomainService;
import com.blitzphoto.infrastructure.aws.S3Service;
import com.blitzphoto.infrastructure.aws.SqsService;
import com.blitzphoto.application.service.UploadValidationService;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * InitiateUploadCommandHandler
 * 
 * CQRS Command Handler for initiating photo uploads.
 * Handles write operations (commands) and generates presigned URLs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InitiateUploadCommandHandler {

    private final UserRepository userRepository;
    private final UploadJobRepository uploadJobRepository;
    private final UploadDomainService uploadDomainService;
    private final S3Service s3Service;
    private final SqsService sqsService;
    private final UploadValidationService uploadValidationService;

    @Value("${blitzphoto.upload.multipart-threshold-mb:5}")
    private int multipartThresholdMb;

    /**
     * Handle InitiateUploadCommand
     * 
     * @param command The command to handle
     * @return InitiateUploadResponse with presigned URLs
     */
    public InitiateUploadResponse handle(InitiateUploadCommand command) {
        log.info("Handling InitiateUploadCommand for user {} with {} photos", 
                command.getUserId(), command.getPhotos().size());
        
        // Validate upload request
        uploadValidationService.validateUploadRequest(command.getPhotos());
        
        // Load user
        User user = userRepository.findById(command.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + command.getUserId()));
        
        // Convert command photos to domain service metadata
        List<UploadDomainService.PhotoMetadata> photoMetadata = command.getPhotos().stream()
                .map(photo -> new UploadDomainService.PhotoMetadata(
                        photo.fileName(),
                        photo.mimeType(),
                        photo.fileSize()
                ))
                .toList();
        
        // Create upload job using domain service
        UploadJob uploadJob = uploadDomainService.createUploadJob(user, photoMetadata);
        
        // Generate S3 keys and presigned URLs for each photo
        List<PhotoUploadResponse> photoResponses = uploadJob.getPhotos().stream()
                .map(photo -> {
                    // Generate presigned URL
                    S3Service.PresignedUrlResult result = s3Service.generatePresignedUploadUrl(
                            command.getUserId(),
                            photo.getFileName(),
                            photo.getContentType(),
                            photo.getFileSize()
                    );
                    
                    // Set S3 key on photo entity
                    photo.setS3Key(result.getS3Key());
                    
                    // Check if multipart upload is required (>5MB)
                    boolean requiresMultipart = photo.getFileSize() > (multipartThresholdMb * 1024 * 1024L);
                    
                    return PhotoUploadResponse.builder()
                            .photoId(photo.getId())
                            .fileName(photo.getFileName())
                            .mimeType(photo.getContentType())
                            .fileSize(photo.getFileSize())
                            .s3Key(result.getS3Key())
                            .presignedUrl(result.getPresignedUrl())
                            .requiresMultipart(requiresMultipart)
                            .build();
                })
                .collect(Collectors.toList());
        
        // Save upload job with updated photos
        uploadJob = uploadJobRepository.save(uploadJob);
        
        // Note: SQS message will be sent after files are uploaded to S3
        // This is triggered by the frontend calling the complete upload endpoint
        
        // Get expiration time from first presigned URL (all expire at same time)
        Instant expiresAt = photoResponses.isEmpty() 
                ? Instant.now().plusSeconds(900) // Default 15 minutes
                : photoResponses.get(0).presignedUrl().getExpiresAt();
        
        log.info("Created upload job {} for user {} with {} photos and presigned URLs", 
                uploadJob.getId(), command.getUserId(), photoResponses.size());
        
        return InitiateUploadResponse.builder()
                .uploadJobId(uploadJob.getId())
                .userId(command.getUserId())
                .status(uploadJob.getStatus().name())
                .photos(photoResponses)
                .createdAt(uploadJob.getCreatedAt())
                .expiresAt(expiresAt)
                .build();
    }

}

