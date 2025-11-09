package com.blitzphoto.application.command;

import com.blitzphoto.application.dto.InitiateUploadResponse;
import com.blitzphoto.application.dto.PhotoUploadRequest;
import com.blitzphoto.application.service.UploadValidationService;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.PresignedUrl;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.model.User;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.domain.repository.UserRepository;
import com.blitzphoto.domain.service.UploadDomainService;
import com.blitzphoto.infrastructure.aws.S3Service;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * InitiateUploadCommandHandler Test
 * 
 * Unit tests for upload command handler.
 */
@ExtendWith(MockitoExtension.class)
class InitiateUploadCommandHandlerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UploadJobRepository uploadJobRepository;

    @Mock
    private UploadDomainService uploadDomainService;

    @Mock
    private S3Service s3Service;

    @Mock
    private UploadValidationService uploadValidationService;

    @InjectMocks
    private InitiateUploadCommandHandler handler;

    private UUID userId;
    private User user;
    private UploadJob uploadJob;
    private Photo photo;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("test@example.com")
                .username("testuser")
                .isActive(true)
                .build();

        photo = Photo.builder()
                .id(UUID.randomUUID())
                .fileName("test-photo.jpg")
                .contentType("image/jpeg")
                .fileSize(1024L)
                .status(Photo.UploadStatus.PENDING)
                .build();

        uploadJob = UploadJob.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .status(UploadJob.UploadJobStatus.CREATED)
                .build();
        uploadJob.getPhotos().add(photo);

        ReflectionTestUtils.setField(handler, "multipartThresholdMb", 5);
    }

    @Test
    void testHandle_Success() {
        // Arrange
        List<PhotoUploadRequest> photoRequests = List.of(
                PhotoUploadRequest.builder()
                        .fileName("test-photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(1024L)
                        .build()
        );

        InitiateUploadCommand command = InitiateUploadCommand.builder()
                .userId(userId)
                .photos(photoRequests)
                .build();

        PresignedUrl presignedUrl = new PresignedUrl(
                "https://bucket.s3-accelerate.amazonaws.com/users/test-key",
                Instant.now().plusSeconds(900),
                "PUT",
                "image/jpeg",
                1024L
        );

        S3Service.PresignedUrlResult presignedUrlResult = new S3Service.PresignedUrlResult(
                "users/test-key",
                presignedUrl
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(uploadDomainService.createUploadJob(any(), any())).thenReturn(uploadJob);
        when(s3Service.generatePresignedUploadUrl(any(), any(), any(), any()))
                .thenReturn(presignedUrlResult);
        when(uploadJobRepository.save(any(UploadJob.class))).thenReturn(uploadJob);

        // Act
        InitiateUploadResponse response = handler.handle(command);

        // Assert
        assertNotNull(response);
        assertEquals(uploadJob.getId(), response.uploadJobId());
        assertEquals(userId, response.userId());
        assertEquals(1, response.photos().size());
        assertNotNull(response.photos().get(0).presignedUrl());
        assertFalse(response.photos().get(0).requiresMultipart());

        verify(uploadValidationService).validateUploadRequest(photoRequests);
        verify(userRepository).findById(userId);
        verify(uploadDomainService).createUploadJob(any(), any());
        verify(s3Service).generatePresignedUploadUrl(any(), any(), any(), any());
        verify(uploadJobRepository).save(any(UploadJob.class));
    }

    @Test
    void testHandle_UserNotFound() {
        // Arrange
        List<PhotoUploadRequest> photoRequests = List.of(
                PhotoUploadRequest.builder()
                        .fileName("test-photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(1024L)
                        .build()
        );

        InitiateUploadCommand command = InitiateUploadCommand.builder()
                .userId(userId)
                .photos(photoRequests)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, 
                () -> handler.handle(command));
        assertTrue(exception.getMessage().contains("User not found"));

        verify(uploadValidationService).validateUploadRequest(photoRequests);
        verify(userRepository).findById(userId);
        verify(uploadDomainService, never()).createUploadJob(any(), any());
        verify(s3Service, never()).generatePresignedUploadUrl(any(), any(), any(), any());
    }

    @Test
    void testHandle_MultipartUpload() {
        // Arrange
        long largeFileSize = 6 * 1024 * 1024L; // 6MB
        List<PhotoUploadRequest> photoRequests = List.of(
                PhotoUploadRequest.builder()
                        .fileName("large-photo.jpg")
                        .mimeType("image/jpeg")
                        .fileSize(largeFileSize)
                        .build()
        );

        InitiateUploadCommand command = InitiateUploadCommand.builder()
                .userId(userId)
                .photos(photoRequests)
                .build();

        photo.setFileSize(largeFileSize);

        PresignedUrl presignedUrl = new PresignedUrl(
                "https://bucket.s3-accelerate.amazonaws.com/users/test-key",
                Instant.now().plusSeconds(900),
                "PUT",
                "image/jpeg",
                largeFileSize
        );

        S3Service.PresignedUrlResult presignedUrlResult = new S3Service.PresignedUrlResult(
                "users/test-key",
                presignedUrl
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(uploadDomainService.createUploadJob(any(), any())).thenReturn(uploadJob);
        when(s3Service.generatePresignedUploadUrl(any(), any(), any(), any()))
                .thenReturn(presignedUrlResult);
        when(uploadJobRepository.save(any(UploadJob.class))).thenReturn(uploadJob);

        // Act
        InitiateUploadResponse response = handler.handle(command);

        // Assert
        assertNotNull(response);
        assertTrue(response.photos().get(0).requiresMultipart());
    }
}

