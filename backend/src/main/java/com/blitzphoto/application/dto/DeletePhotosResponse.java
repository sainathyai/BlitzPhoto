package com.blitzphoto.application.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

/**
 * DeletePhotosResponse
 *
 * Response payload describing the outcome of a bulk photo deletion request.
 */
@Builder
public record DeletePhotosResponse(
        int requestedCount,
        int deletedCount,
        List<PhotoDeleteResult> results
) {

    @Builder
    public record PhotoDeleteResult(
            UUID photoId,
            DeleteStatus status,
            String message
    ) {
    }

    public enum DeleteStatus {
        DELETED,
        NOT_FOUND,
        UNAUTHORIZED,
        FAILED
    }
}

