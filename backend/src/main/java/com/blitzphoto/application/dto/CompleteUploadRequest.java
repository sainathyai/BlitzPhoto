package com.blitzphoto.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

/**
 * Complete Upload Request DTO
 * 
 * Request for completing an upload job after files have been uploaded to S3.
 */
@Builder
public record CompleteUploadRequest(
        @NotNull(message = "Upload job ID is required")
        UUID uploadJobId,
        
        @NotNull(message = "User ID is required")
        UUID userId
) {
}

