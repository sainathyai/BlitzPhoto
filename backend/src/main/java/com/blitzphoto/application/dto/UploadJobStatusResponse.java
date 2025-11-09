package com.blitzphoto.application.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Upload Job Status Response DTO
 * 
 * Response for upload job status queries.
 */
@Builder
public record UploadJobStatusResponse(
        UUID uploadJobId,
        UUID userId,
        String status,
        double progressPercentage,
        int totalPhotos,
        int completedPhotos,
        int failedPhotos,
        int inProgressPhotos,
        List<PhotoStatusResponse> photos,
        Instant createdAt,
        Instant updatedAt
) {
}

