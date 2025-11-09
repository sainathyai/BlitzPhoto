package com.blitzphoto.application.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Initiate Upload Response DTO
 * 
 * Response after initiating an upload job with presigned URLs for all photos.
 */
@Builder
public record InitiateUploadResponse(
        UUID uploadJobId,
        UUID userId,
        String status,
        List<PhotoUploadResponse> photos,
        Instant createdAt,
        Instant expiresAt // When presigned URLs expire
) {
}

