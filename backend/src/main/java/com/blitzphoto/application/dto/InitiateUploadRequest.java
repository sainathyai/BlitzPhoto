package com.blitzphoto.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

/**
 * Initiate Upload Request DTO
 * 
 * Request for initiating a photo upload job.
 */
@Builder
public record InitiateUploadRequest(
        @NotNull(message = "User ID is required")
        UUID userId,
        
        @NotEmpty(message = "At least one photo is required")
        @Valid
        List<PhotoUploadRequest> photos
) {
}

