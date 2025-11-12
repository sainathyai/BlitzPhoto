package com.blitzphoto.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

/**
 * DeletePhotosRequest
 *
 * Request payload for deleting one or more photos.
 */
@Builder
public record DeletePhotosRequest(
        @NotEmpty(message = "At least one photoId must be provided")
        @Size(max = 10000, message = "Cannot delete more than 10000 photos at once")
        List<UUID> photoIds
) {
}

