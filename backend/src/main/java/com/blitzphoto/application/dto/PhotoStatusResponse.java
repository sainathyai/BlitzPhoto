package com.blitzphoto.application.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Photo Status Response DTO
 * 
 * Response for individual photo status.
 */
@Builder
public record PhotoStatusResponse(
        UUID photoId,
        String fileName,
        String mimeType,
        Long fileSize,
        String status,
        String s3Key,
        String errorMessage,
        Instant uploadedAt,
        Instant processedAt,
        Instant createdAt
) {
}

