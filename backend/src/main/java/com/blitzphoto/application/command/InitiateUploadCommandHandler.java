package com.blitzphoto.application.command;

import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.model.User;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.domain.repository.UserRepository;
import com.blitzphoto.domain.service.UploadDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * InitiateUploadCommandHandler
 * 
 * CQRS Command Handler for initiating photo uploads.
 * Handles write operations (commands).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InitiateUploadCommandHandler {

    private final UserRepository userRepository;
    private final UploadJobRepository uploadJobRepository;
    private final UploadDomainService uploadDomainService;

    /**
     * Handle InitiateUploadCommand
     * 
     * @param command The command to handle
     * @return The created upload job ID
     */
    public UUID handle(InitiateUploadCommand command) {
        log.info("Handling InitiateUploadCommand for user {} with {} photos", 
                command.getUserId(), command.getPhotos().size());
        
        // Load user
        User user = userRepository.findById(command.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + command.getUserId()));
        
        // Convert command photos to domain service metadata
        List<UploadDomainService.PhotoMetadata> photoMetadata = command.getPhotos().stream()
                .map(photo -> new UploadDomainService.PhotoMetadata(
                        photo.getFileName(),
                        photo.getContentType(),
                        photo.getFileSize()
                ))
                .toList();
        
        // Create upload job using domain service
        UploadJob uploadJob = uploadDomainService.createUploadJob(user, photoMetadata);
        
        // Save upload job
        uploadJob = uploadJobRepository.save(uploadJob);
        
        log.info("Created upload job {} for user {}", uploadJob.getId(), command.getUserId());
        
        return uploadJob.getId();
    }
}

