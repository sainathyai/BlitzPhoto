package com.blitzphoto.application.dto;

import com.blitzphoto.domain.model.PresignedUrl;
import lombok.Builder;

import java.util.UUID;

/**
 * Photo Upload Response DTO
 * 
 * Contains the presigned URL and photo metadata for upload.
 */
@Builder
public record PhotoUploadResponse(
        UUID photoId,
        String fileName,
        String mimeType,
        Long fileSize,
        String s3Key,
        PresignedUrl presignedUrl,
        boolean requiresMultipart // true if file requires multipart upload (>5MB)
) {
}

