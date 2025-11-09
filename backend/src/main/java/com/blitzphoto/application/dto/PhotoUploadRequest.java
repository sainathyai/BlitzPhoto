package com.blitzphoto.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

/**
 * Photo Upload Request DTO
 * 
 * Represents a request to upload a single photo.
 */
@Builder
public record PhotoUploadRequest(
        @NotBlank(message = "File name is required")
        String fileName,
        
        @NotBlank(message = "MIME type is required")
        String mimeType,
        
        @NotNull(message = "File size is required")
        @Positive(message = "File size must be positive")
        Long fileSize // in bytes
) {
}

