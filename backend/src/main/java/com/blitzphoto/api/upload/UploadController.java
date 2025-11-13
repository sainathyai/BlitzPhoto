package com.blitzphoto.api.upload;

import com.blitzphoto.application.command.CompleteUploadCommand;
import com.blitzphoto.application.command.CompleteUploadCommandHandler;
import com.blitzphoto.application.command.DeletePhotosCommand;
import com.blitzphoto.application.command.DeletePhotosCommandHandler;
import com.blitzphoto.application.command.InitiateUploadCommand;
import com.blitzphoto.application.command.InitiateUploadCommandHandler;
import com.blitzphoto.application.dto.*;
import com.blitzphoto.application.messaging.UploadJobMessageHandler;
import com.blitzphoto.application.query.GetPhotosQuery;
import com.blitzphoto.application.query.GetPhotosQueryHandler;
import com.blitzphoto.application.query.GetUploadJobQuery;
import com.blitzphoto.application.query.GetUploadJobQueryHandler;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.model.User;
import com.blitzphoto.domain.repository.UserRepository;
import com.blitzphoto.infrastructure.aws.S3Service;
import com.blitzphoto.infrastructure.aws.SqsService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final CompleteUploadCommandHandler completeUploadCommandHandler;
    private final DeletePhotosCommandHandler deletePhotosCommandHandler;
    private final GetUploadJobQueryHandler getUploadJobQueryHandler;
    private final GetPhotosQueryHandler getPhotosQueryHandler;
    private final S3Service s3Service;
    private final SqsService sqsService;
    private final UploadJobMessageHandler uploadJobMessageHandler;
    private final UserRepository userRepository;

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
                    "Supports unlimited photos per job with Blitz Speed uploads."
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
     * Complete an upload job
     * 
     * Called after all files have been uploaded to S3. This triggers async processing
     * of the uploaded photos (thumbnail generation, metadata extraction, etc.).
     * 
     * @param request Complete upload request with upload job ID and user ID
     * @return CompleteUploadResponse
     */
    @PostMapping("/complete")
    @Operation(
            summary = "Complete upload job",
            description = "Marks an upload job as complete after files have been uploaded to S3. " +
                    "This triggers async processing of the uploaded photos."
    )
    public ResponseEntity<CompleteUploadResponse> completeUpload(
            @Valid @RequestBody CompleteUploadRequest request
    ) {
        log.info("Completing upload job {} for user {}", 
                request.uploadJobId(), request.userId());

        // Convert request to command
        CompleteUploadCommand command = CompleteUploadCommand.builder()
                .uploadJobId(request.uploadJobId())
                .userId(request.userId())
                .build();

        // Handle command
        CompleteUploadResponse response = completeUploadCommandHandler.handle(command);

        return ResponseEntity.ok(response);
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
     * Users can only access their own photos.
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
            description = "Returns paginated list of photos for a user. Users can only access their own photos."
    )
    public ResponseEntity<Page<PhotoStatusResponse>> getUserPhotos(
            @Parameter(description = "User ID (optional, defaults to current user)") @RequestParam(required = false) String userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        // Get current authenticated user
        UUID currentUserId = getCurrentUserId();
        
        // If userId is not provided, use current user's ID
        UUID targetUserId;
        if (userId != null && !userId.isBlank()) {
            try {
                targetUserId = UUID.fromString(userId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid userId format: {}", userId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        } else {
            targetUserId = currentUserId;
        }

        log.debug("Getting photos for user: requestedUserId={}, currentUserId={}, targetUserId={}, page={}, size={}", 
                userId, currentUserId, targetUserId, page, size);

        // Authorization: users can only view their own photos
        if (!currentUserId.equals(targetUserId)) {
            log.warn("User {} attempted to access photos for user {}", currentUserId, targetUserId);
            // Return 401 (Unauthorized) instead of 403 (Forbidden) to avoid CloudFront converting to HTML
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Create query
        GetPhotosQuery query = GetPhotosQuery.builder()
                .userId(targetUserId)
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
     * Delete multiple photos for the current user.
     *
     * @param request Bulk delete request containing photo IDs.
     * @return Bulk delete response with per-photo results.
     */
    @DeleteMapping("/photos")
    @Operation(
            summary = "Delete photos",
            description = "Deletes one or more photos owned by the authenticated user."
    )
    public ResponseEntity<DeletePhotosResponse> deletePhotos(
            @Valid @RequestBody DeletePhotosRequest request
    ) {
        UUID currentUserId = getCurrentUserId();

        DeletePhotosCommand command = DeletePhotosCommand.builder()
                .userId(currentUserId)
                .photoIds(request.photoIds())
                .build();

        DeletePhotosResponse response = deletePhotosCommandHandler.handle(command);

        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current authenticated user ID
     * 
     * @return Current user ID
     * @throws org.springframework.security.access.AccessDeniedException if user is not authenticated
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            // Load user by username (email) to get the user ID
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
            return user.getId();
        }
        
        throw new org.springframework.security.access.AccessDeniedException("Unable to determine current user");
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
        // Generate presigned URL for photo access
        // Only generate URL for COMPLETED photos
        String photoUrl = null;
        if (photo.getS3Key() != null && photo.getStatus() == Photo.UploadStatus.COMPLETED) {
            try {
                photoUrl = s3Service.generatePresignedPhotoUrl(photo.getS3Key()).getUrl();
            } catch (Exception e) {
                log.warn("Failed to generate presigned URL for photo {}: {}", photo.getId(), e.getMessage());
            }
        }
        
        return PhotoStatusResponse.builder()
                .photoId(photo.getId())
                .fileName(photo.getFileName())
                .mimeType(photo.getContentType())
                .fileSize(photo.getFileSize())
                .status(photo.getStatus().name())
                .s3Key(photo.getS3Key())
                .photoUrl(photoUrl)
                .errorMessage(photo.getErrorMessage())
                .uploadedAt(photo.getUploadedAt())
                .processedAt(photo.getUploadedAt()) // Use uploadedAt as processedAt since processing happens during upload completion
                .createdAt(photo.getCreatedAt())
                .build();
    }
}

