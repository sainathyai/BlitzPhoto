package com.blitzphoto.application.command;

import com.blitzphoto.application.dto.CompleteUploadResponse;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.infrastructure.aws.SqsService;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * CompleteUploadCommandHandler
 * 
 * CQRS Command Handler for completing photo uploads.
 * Handles write operations (commands) and sends SQS message to trigger async processing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CompleteUploadCommandHandler {

    private final UploadJobRepository uploadJobRepository;
    private final SqsService sqsService;

    /**
     * Handle CompleteUploadCommand
     * 
     * Verifies the upload job exists, updates its status, and sends SQS message
     * to trigger async processing of the uploaded photos.
     * 
     * @param command The command to handle
     * @return CompleteUploadResponse
     */
    public CompleteUploadResponse handle(CompleteUploadCommand command) {
        log.info("Handling CompleteUploadCommand for upload job {} and user {}", 
                command.getUploadJobId(), command.getUserId());
        
        // Load upload job
        UploadJob uploadJob = uploadJobRepository.findById(command.getUploadJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Upload job not found: " + command.getUploadJobId()));
        
        // Verify user matches
        if (!uploadJob.getUserId().equals(command.getUserId())) {
            log.warn("User mismatch for upload job: jobId={}, expectedUserId={}, actualUserId={}", 
                    command.getUploadJobId(), uploadJob.getUserId(), command.getUserId());
            throw new IllegalArgumentException("User mismatch for upload job");
        }
        
        // Update upload job status to IN_PROGRESS (processing will happen async)
        uploadJob.setStatus(UploadJob.UploadJobStatus.IN_PROGRESS);
        uploadJob = uploadJobRepository.save(uploadJob);
        
        // Send SQS message to trigger async processing
        try {
            String messageId = sqsService.publishUploadJobMessage(
                    command.getUploadJobId(), 
                    command.getUserId());
            log.info("Sent SQS message for upload job processing: jobId={}, messageId={}", 
                    command.getUploadJobId(), messageId);
        } catch (Exception e) {
            log.error("Failed to send SQS message for upload job: jobId={}", 
                    command.getUploadJobId(), e);
            // Don't fail the request - the job status is already updated
            // Processing can be retried manually if needed
        }
        
        log.info("Completed upload job: jobId={}, status={}", 
                uploadJob.getId(), uploadJob.getStatus());
        
        return CompleteUploadResponse.builder()
                .uploadJobId(uploadJob.getId())
                .userId(uploadJob.getUserId())
                .status(uploadJob.getStatus().name())
                .message("Upload job completed. Processing started.")
                .completedAt(Instant.now())
                .build();
    }
}

