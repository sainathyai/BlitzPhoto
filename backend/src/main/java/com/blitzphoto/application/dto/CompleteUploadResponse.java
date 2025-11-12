package com.blitzphoto.application.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Complete Upload Response DTO
 * 
 * Response after completing an upload job.
 */
@Builder
public record CompleteUploadResponse(
        UUID uploadJobId,
        UUID userId,
        String status,
        String message,
        Instant completedAt
) {
}

