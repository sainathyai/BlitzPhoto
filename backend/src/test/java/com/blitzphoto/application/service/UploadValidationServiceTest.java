package com.blitzphoto.application.service;

import com.blitzphoto.application.dto.PhotoUploadRequest;
import com.blitzphoto.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * UploadValidationService Test
 * 
 * Unit tests for upload validation.
 */
@ExtendWith(MockitoExtension.class)
class UploadValidationServiceTest {

    @InjectMocks
    private UploadValidationService uploadValidationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(uploadValidationService, "maxFilesPerJob", 100);
        ReflectionTestUtils.setField(uploadValidationService, "maxFileSizeMb", 50);
        ReflectionTestUtils.setField(uploadValidationService, "allowedMimeTypesConfig", 
                "image/jpeg,image/png,image/heic,image/webp");
    }

    @Test
    void testValidateUploadRequest_Success() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("photo1.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(1024L)
                        .build()
        );

        // Act & Assert
        assertDoesNotThrow(() -> uploadValidationService.validateUploadRequest(photos));
    }

    @Test
    void testValidateUploadRequest_EmptyList() {
        // Arrange
        List<PhotoUploadRequest> photos = new ArrayList<>();

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("at least one photo"));
    }

    @Test
    void testValidateUploadRequest_NullList() {
        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(null));
        assertTrue(exception.getMessage().contains("at least one photo"));
    }

    @Test
    void testValidateUploadRequest_ExceedsMaxFiles() {
        // Arrange
        List<PhotoUploadRequest> photos = new ArrayList<>();
        for (int i = 0; i < 101; i++) {
            photos.add(PhotoUploadRequest.builder()
                    .fileName("photo" + i + ".jpg")
                    .mimeType("image/jpeg")
                    .fileSize(1024L)
                    .build());
        }

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("more than 100 photos"));
    }

    @Test
    void testValidateUploadRequest_ExceedsMaxFileSize() {
        // Arrange
        long maxFileSizeBytes = 50 * 1024 * 1024L; // 50MB
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("large-photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(maxFileSizeBytes + 1)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("exceeds maximum allowed size"));
    }

    @Test
    void testValidateUploadRequest_InvalidMimeType() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("photo.pdf")
                        .mimeType("application/pdf")
                        .fileSize(1024L)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("not allowed"));
    }

    @Test
    void testValidateUploadRequest_InvalidFileName() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("../etc/passwd")
                        .mimeType("image/jpeg")
                        .fileSize(1024L)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("invalid characters"));
    }

    @Test
    void testValidateUploadRequest_EmptyFileName() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("")
                        .mimeType("image/jpeg")
                        .fileSize(1024L)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("File name is required"));
    }

    @Test
    void testValidateUploadRequest_NullFileSize() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(null)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("File size must be positive"));
    }

    @Test
    void testValidateUploadRequest_ZeroFileSize() {
        // Arrange
        List<PhotoUploadRequest> photos = List.of(
                PhotoUploadRequest.builder()
                        .fileName("photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(0L)
                        .build()
        );

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
                () -> uploadValidationService.validateUploadRequest(photos));
        assertTrue(exception.getMessage().contains("File size must be positive"));
    }
}

