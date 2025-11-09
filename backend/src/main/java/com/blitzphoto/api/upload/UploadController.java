package com.blitzphoto.api.upload;

import com.blitzphoto.application.command.InitiateUploadCommand;
import com.blitzphoto.application.command.InitiateUploadCommandHandler;
import com.blitzphoto.application.dto.*;
import com.blitzphoto.application.query.GetPhotosQuery;
import com.blitzphoto.application.query.GetPhotosQueryHandler;
import com.blitzphoto.application.query.GetUploadJobQuery;
import com.blitzphoto.application.query.GetUploadJobQueryHandler;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Upload Controller
 * 
 * REST endpoints for photo upload operations.
 */
@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Uploads", description = "Photo upload and status tracking endpoints")
public class UploadController {

    private final InitiateUploadCommandHandler initiateUploadCommandHandler;
    private final GetUploadJobQueryHandler getUploadJobQueryHandler;
    private final GetPhotosQueryHandler getPhotosQueryHandler;

    /**
     * Initiate a photo upload job
     * 
     * Creates an upload job and returns presigned URLs for direct S3 uploads.
     * 
     * @param request Upload request with photos metadata
     * @return InitiateUploadResponse with presigned URLs
     */
    @PostMapping
    @Operation(
            summary = "Initiate photo upload",
            description = "Creates an upload job and returns presigned URLs for direct S3 uploads. " +
                    "Supports up to 100 photos per job with Blitz Speed uploads."
    )
    public ResponseEntity<InitiateUploadResponse> initiateUpload(
            @Valid @RequestBody InitiateUploadRequest request
    ) {
        log.info("Initiating upload for user {} with {} photos", 
                request.userId(), request.photos().size());

        // Convert request to command
        InitiateUploadCommand command = InitiateUploadCommand.builder()
                .userId(request.userId())
                .photos(request.photos())
                .build();

        // Handle command
        InitiateUploadResponse response = initiateUploadCommandHandler.handle(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get upload job status
     * 
     * Returns the current status and progress of an upload job.
     * 
     * @param uploadJobId Upload job ID
     * @param userId User ID (for authorization)
     * @return UploadJobStatusResponse with status and progress
     */
    @GetMapping("/{uploadJobId}")
    @Operation(
            summary = "Get upload job status",
            description = "Returns the current status and progress of an upload job."
    )
    public ResponseEntity<UploadJobStatusResponse> getUploadJobStatus(
            @Parameter(description = "Upload job ID") @PathVariable UUID uploadJobId,
            @Parameter(description = "User ID") @RequestParam UUID userId
    ) {
        log.debug("Getting upload job status: jobId={}, userId={}", uploadJobId, userId);

        // Create query
        GetUploadJobQuery query = GetUploadJobQuery.builder()
                .uploadJobId(uploadJobId)
                .userId(userId)
                .build();

        // Handle query
        UploadJob uploadJob = getUploadJobQueryHandler.handle(query);

        // Convert to response
        UploadJobStatusResponse response = toUploadJobStatusResponse(uploadJob);

        return ResponseEntity.ok(response);
    }

    /**
     * Get upload job progress
     * 
     * Returns the progress percentage and status of an upload job.
     * 
     * @param uploadJobId Upload job ID
     * @param userId User ID (for authorization)
     * @return UploadJobStatusResponse with progress
     */
    @GetMapping("/{uploadJobId}/progress")
    @Operation(
            summary = "Get upload job progress",
            description = "Returns the progress percentage and status of an upload job."
    )
    public ResponseEntity<UploadJobStatusResponse> getUploadJobProgress(
            @Parameter(description = "Upload job ID") @PathVariable UUID uploadJobId,
            @Parameter(description = "User ID") @RequestParam UUID userId
    ) {
        log.debug("Getting upload job progress: jobId={}, userId={}", uploadJobId, userId);

        // Create query
        GetUploadJobQuery query = GetUploadJobQuery.builder()
                .uploadJobId(uploadJobId)
                .userId(userId)
                .build();

        // Handle query
        UploadJob uploadJob = getUploadJobQueryHandler.handle(query);

        // Convert to response
        UploadJobStatusResponse response = toUploadJobStatusResponse(uploadJob);

        return ResponseEntity.ok(response);
    }

    /**
     * Get user photos
     * 
     * Returns paginated list of photos for a user.
     * 
     * @param userId User ID
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Sort field
     * @param sortDirection Sort direction (ASC/DESC)
     * @return Page of photos
     */
    @GetMapping("/photos")
    @Operation(
            summary = "Get user photos",
            description = "Returns paginated list of photos for a user."
    )
    public ResponseEntity<Page<PhotoStatusResponse>> getUserPhotos(
            @Parameter(description = "User ID") @RequestParam UUID userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        log.debug("Getting photos for user: userId={}, page={}, size={}", userId, page, size);

        // Create query
        GetPhotosQuery query = GetPhotosQuery.builder()
                .userId(userId)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        // Handle query
        Page<Photo> photos = getPhotosQueryHandler.handle(query);

        // Convert to response
        Page<PhotoStatusResponse> response = photos.map(this::toPhotoStatusResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Convert UploadJob to UploadJobStatusResponse
     */
    private UploadJobStatusResponse toUploadJobStatusResponse(UploadJob uploadJob) {
        List<Photo> photos = uploadJob.getPhotos();
        
        int totalPhotos = photos.size();
        long completedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.COMPLETED)
                .count();
        long failedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.FAILED)
                .count();
        long inProgressPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.UPLOADING || 
                             p.getStatus() == Photo.UploadStatus.PROCESSING)
                .count();

        double progressPercentage = uploadJob.getProgressPercentage();

        List<PhotoStatusResponse> photoResponses = photos.stream()
                .map(this::toPhotoStatusResponse)
                .collect(Collectors.toList());

        return UploadJobStatusResponse.builder()
                .uploadJobId(uploadJob.getId())
                .userId(uploadJob.getUserId())
                .status(uploadJob.getStatus().name())
                .progressPercentage(progressPercentage)
                .totalPhotos(totalPhotos)
                .completedPhotos((int) completedPhotos)
                .failedPhotos((int) failedPhotos)
                .inProgressPhotos((int) inProgressPhotos)
                .photos(photoResponses)
                .createdAt(uploadJob.getCreatedAt())
                .updatedAt(uploadJob.getUpdatedAt())
                .build();
    }

    /**
     * Convert Photo to PhotoStatusResponse
     */
    private PhotoStatusResponse toPhotoStatusResponse(Photo photo) {
        return PhotoStatusResponse.builder()
                .photoId(photo.getId())
                .fileName(photo.getFileName())
                .mimeType(photo.getContentType())
                .fileSize(photo.getFileSize())
                .status(photo.getStatus().name())
                .s3Key(photo.getS3Key())
                .errorMessage(photo.getErrorMessage())
                .uploadedAt(photo.getUploadedAt())
                .processedAt(photo.getProcessedAt())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}

