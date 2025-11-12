package com.blitzphoto.application.command;

import com.blitzphoto.application.dto.DeletePhotosResponse;
import com.blitzphoto.application.dto.DeletePhotosResponse.DeleteStatus;
import com.blitzphoto.application.dto.DeletePhotosResponse.PhotoDeleteResult;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.PhotoRepository;
import com.blitzphoto.infrastructure.aws.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * DeletePhotosCommandHandler
 *
 * Handles bulk photo deletion while ensuring ownership validation and S3 cleanup.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DeletePhotosCommandHandler {

    private final PhotoRepository photoRepository;
    private final S3Service s3Service;

    public DeletePhotosResponse handle(DeletePhotosCommand command) {
        List<UUID> requestedPhotoIds = command.getPhotoIds();
        if (requestedPhotoIds == null || requestedPhotoIds.isEmpty()) {
            return DeletePhotosResponse.builder()
                    .requestedCount(0)
                    .deletedCount(0)
                    .results(List.of())
                    .build();
        }

        log.info("Deleting {} photos for user {}", requestedPhotoIds.size(), command.getUserId());

        // Fetch all photos by IDs (regardless of ownership) to detect unauthorized selections
        List<Photo> allPhotos = photoRepository.findAllById(requestedPhotoIds);
        Map<UUID, Photo> photoById = allPhotos.stream()
                .collect(Collectors.toMap(Photo::getId, photo -> photo));

        List<Photo> photosOwnedByUser = photoRepository.findByIdsAndUserId(requestedPhotoIds, command.getUserId());
        Set<UUID> ownedPhotoIds = photosOwnedByUser.stream()
                .map(Photo::getId)
                .collect(Collectors.toSet());

        Set<UUID> unauthorizedPhotoIds = photoById.keySet().stream()
                .filter(photoId -> !ownedPhotoIds.contains(photoId))
                .collect(Collectors.toSet());

        List<Photo> photosToDelete = new ArrayList<>(photosOwnedByUser);

        // Prepare default results map
        Map<UUID, PhotoDeleteResult.PhotoDeleteResultBuilder> resultBuilders = new HashMap<>();
        for (UUID photoId : requestedPhotoIds) {
            resultBuilders.put(photoId, PhotoDeleteResult.builder()
                    .photoId(photoId)
                    .status(DeleteStatus.NOT_FOUND)
                    .message("Photo not found"));
        }

        // Mark unauthorized selections
        for (UUID unauthorizedId : unauthorizedPhotoIds) {
            resultBuilders.computeIfPresent(unauthorizedId, (id, builder) -> builder
                    .status(DeleteStatus.UNAUTHORIZED)
                    .message("You do not have permission to delete this photo"));
        }

        // Collect S3 keys for deletion
        List<String> uploadKeys = photosToDelete.stream()
                .map(Photo::getS3Key)
                .filter(key -> key != null && !key.isBlank())
                .toList();

        List<String> thumbnailKeys = photosToDelete.stream()
                .map(Photo::getThumbnailS3Key)
                .filter(key -> key != null && !key.isBlank())
                .toList();

        // Delete from S3 buckets
        Set<String> failedUploadKeys = new HashSet<>(s3Service.deleteUploadObjects(uploadKeys));
        Set<String> failedThumbnailKeys = new HashSet<>(s3Service.deleteThumbnailObjects(thumbnailKeys));

        // Filter photos that had successful S3 deletions
        List<Photo> successfullyDeletedPhotos = new ArrayList<>();
        for (Photo photo : photosToDelete) {
            String uploadKey = photo.getS3Key();
            String thumbnailKey = photo.getThumbnailS3Key();

            boolean uploadDeleted = uploadKey == null || !failedUploadKeys.contains(uploadKey);
            boolean thumbnailDeleted = thumbnailKey == null || !failedThumbnailKeys.contains(thumbnailKey);

            if (uploadDeleted && thumbnailDeleted) {
                successfullyDeletedPhotos.add(photo);
            } else {
                resultBuilders.computeIfPresent(photo.getId(), (id, builder) -> builder
                        .status(DeleteStatus.FAILED)
                        .message("Failed to delete photo assets from storage"));
            }
        }

        // Remove photo entities from database
        if (!successfullyDeletedPhotos.isEmpty()) {
            successfullyDeletedPhotos.forEach(photo -> {
                UploadJob uploadJob = photo.getUploadJob();
                if (uploadJob != null) {
                    uploadJob.getPhotos().remove(photo);
                }
            });

            photoRepository.deleteAll(successfullyDeletedPhotos);

            successfullyDeletedPhotos.forEach(photo -> {
                resultBuilders.computeIfPresent(photo.getId(), (id, builder) -> builder
                        .status(DeleteStatus.DELETED)
                        .message("Photo deleted successfully"));
            });
        }

        // Handle remaining photos (not found or previously marked)
        for (UUID photoId : requestedPhotoIds) {
            if (!photoById.containsKey(photoId) && !unauthorizedPhotoIds.contains(photoId)) {
                // Already defaulted to NOT_FOUND; ensure message is clear
                resultBuilders.computeIfPresent(photoId, (id, builder) -> builder
                        .status(DeleteStatus.NOT_FOUND)
                        .message("Photo not found"));
            }
        }

        List<PhotoDeleteResult> results = resultBuilders.values().stream()
                .map(PhotoDeleteResult.PhotoDeleteResultBuilder::build)
                .toList();

        int deletedCount = (int) results.stream()
                .filter(result -> result.status() == DeleteStatus.DELETED)
                .count();

        return DeletePhotosResponse.builder()
                .requestedCount(requestedPhotoIds.size())
                .deletedCount(deletedCount)
                .results(results)
                .build();
    }
}

