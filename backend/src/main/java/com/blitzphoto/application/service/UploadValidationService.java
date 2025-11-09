package com.blitzphoto.application.service;

import com.blitzphoto.application.dto.PhotoUploadRequest;
import com.blitzphoto.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Upload Validation Service
 * 
 * Validates upload requests according to business rules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UploadValidationService {

    @Value("${blitzphoto.upload.max-files-per-job:100}")
    private int maxFilesPerJob;

    @Value("${blitzphoto.upload.max-file-size-mb:50}")
    private int maxFileSizeMb;

    @Value("${blitzphoto.upload.allowed-mime-types:image/jpeg,image/png,image/heic,image/webp}")
    private String allowedMimeTypesConfig;

    private static final int MAX_FILE_NAME_LENGTH = 255;
    private static final long BYTES_PER_MB = 1024 * 1024L;

    /**
     * Validate upload request
     * 
     * @param photos List of photo upload requests
     * @throws BusinessException if validation fails
     */
    public void validateUploadRequest(List<PhotoUploadRequest> photos) {
        if (photos == null || photos.isEmpty()) {
            throw new BusinessException("Upload request must contain at least one photo");
        }

        // Validate file count
        validateFileCount(photos);

        // Validate each photo
        for (int i = 0; i < photos.size(); i++) {
            PhotoUploadRequest photo = photos.get(i);
            validatePhoto(photo, i);
        }

        // Validate total size
        validateTotalSize(photos);

        log.debug("Upload request validated successfully: {} photos", photos.size());
    }

    /**
     * Validate file count
     */
    private void validateFileCount(List<PhotoUploadRequest> photos) {
        if (photos.size() > maxFilesPerJob) {
            throw new BusinessException(
                    String.format("Upload job cannot contain more than %d photos. Found: %d", 
                            maxFilesPerJob, photos.size())
            );
        }
    }

    /**
     * Validate individual photo
     */
    private void validatePhoto(PhotoUploadRequest photo, int index) {
        // Validate file name
        validateFileName(photo.fileName(), index);

        // Validate file size
        validateFileSize(photo.fileSize(), index);

        // Validate MIME type
        validateMimeType(photo.mimeType(), index);
    }

    /**
     * Validate file name
     */
    private void validateFileName(String fileName, int index) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new BusinessException(
                    String.format("Photo at index %d: File name is required", index)
            );
        }

        if (fileName.length() > MAX_FILE_NAME_LENGTH) {
            throw new BusinessException(
                    String.format("Photo at index %d: File name exceeds maximum length of %d characters", 
                            index, MAX_FILE_NAME_LENGTH)
            );
        }

        // Check for invalid characters
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new BusinessException(
                    String.format("Photo at index %d: File name contains invalid characters", index)
            );
        }
    }

    /**
     * Validate file size
     */
    private void validateFileSize(Long fileSize, int index) {
        if (fileSize == null || fileSize <= 0) {
            throw new BusinessException(
                    String.format("Photo at index %d: File size must be positive", index)
            );
        }

        long maxFileSizeBytes = maxFileSizeMb * BYTES_PER_MB;
        if (fileSize > maxFileSizeBytes) {
            throw new BusinessException(
                    String.format("Photo at index %d: File size (%d MB) exceeds maximum allowed size (%d MB)", 
                            index, fileSize / BYTES_PER_MB, maxFileSizeMb)
            );
        }
    }

    /**
     * Validate MIME type
     */
    private void validateMimeType(String mimeType, int index) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            throw new BusinessException(
                    String.format("Photo at index %d: MIME type is required", index)
            );
        }

        Set<String> allowedMimeTypes = getAllowedMimeTypes();
        if (!allowedMimeTypes.contains(mimeType.toLowerCase())) {
            throw new BusinessException(
                    String.format("Photo at index %d: MIME type '%s' is not allowed. Allowed types: %s", 
                            index, mimeType, String.join(", ", allowedMimeTypes))
            );
        }
    }

    /**
     * Validate total size of all photos
     */
    private void validateTotalSize(List<PhotoUploadRequest> photos) {
        long totalSize = photos.stream()
                .mapToLong(PhotoUploadRequest::fileSize)
                .sum();

        // Optional: Add total size limit if needed
        // For now, we only validate individual file sizes
        log.debug("Total upload size: {} MB", totalSize / BYTES_PER_MB);
    }

    /**
     * Get allowed MIME types from configuration
     */
    private Set<String> getAllowedMimeTypes() {
        return Set.of(allowedMimeTypesConfig.split(","))
                .stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    /**
     * Validate file extension matches MIME type
     * 
     * @param fileName File name
     * @param mimeType MIME type
     * @param index Photo index
     */
    public void validateFileExtension(String fileName, String mimeType, int index) {
        String extension = getFileExtension(fileName).toLowerCase();
        String expectedExtension = getExpectedExtension(mimeType);

        if (!extension.equals(expectedExtension) && !isValidExtension(extension, mimeType)) {
            log.warn("Photo at index {}: File extension '{}' may not match MIME type '{}'", 
                    index, extension, mimeType);
        }
    }

    /**
     * Get file extension from file name
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot == -1 || lastDot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(lastDot + 1);
    }

    /**
     * Get expected extension for MIME type
     */
    private String getExpectedExtension(String mimeType) {
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/heic" -> "heic";
            case "image/webp" -> "webp";
            default -> "";
        };
    }

    /**
     * Check if extension is valid for MIME type
     */
    private boolean isValidExtension(String extension, String mimeType) {
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg" -> extension.equals("jpg") || extension.equals("jpeg");
            case "image/png" -> extension.equals("png");
            case "image/heic" -> extension.equals("heic") || extension.equals("heif");
            case "image/webp" -> extension.equals("webp");
            default -> false;
        };
    }
}

