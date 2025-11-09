package com.blitzphoto.api.upload;

import com.blitzphoto.application.command.InitiateUploadCommand;
import com.blitzphoto.application.command.InitiateUploadCommandHandler;
import com.blitzphoto.application.dto.*;
import com.blitzphoto.application.query.GetPhotosQueryHandler;
import com.blitzphoto.application.query.GetUploadJobQueryHandler;
import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.PresignedUrl;
import com.blitzphoto.domain.model.UploadJob;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * UploadController Test
 * 
 * Unit tests for upload REST endpoints.
 */
@WebMvcTest(UploadController.class)
class UploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InitiateUploadCommandHandler initiateUploadCommandHandler;

    @MockBean
    private GetUploadJobQueryHandler getUploadJobQueryHandler;

    @MockBean
    private GetPhotosQueryHandler getPhotosQueryHandler;

    private UUID userId;
    private UUID uploadJobId;
    private UUID photoId;
    private InitiateUploadRequest initiateRequest;
    private InitiateUploadResponse initiateResponse;
    private UploadJob uploadJob;
    private Photo photo;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        uploadJobId = UUID.randomUUID();
        photoId = UUID.randomUUID();

        initiateRequest = InitiateUploadRequest.builder()
                .userId(userId)
                .photos(List.of(
                        PhotoUploadRequest.builder()
                                .fileName("test-photo.jpg")
                                .mimeType("image/jpeg")
                                .fileSize(1024L)
                                .build()
                ))
                .build();

        PresignedUrl presignedUrl = new PresignedUrl(
                "https://bucket.s3-accelerate.amazonaws.com/users/test-key",
                Instant.now().plusSeconds(900),
                "PUT",
                "image/jpeg",
                1024L
        );

        PhotoUploadResponse photoResponse = PhotoUploadResponse.builder()
                .photoId(photoId)
                .fileName("test-photo.jpg")
                .mimeType("image/jpeg")
                .fileSize(1024L)
                .s3Key("users/test-key")
                .presignedUrl(presignedUrl)
                .requiresMultipart(false)
                .build();

        initiateResponse = InitiateUploadResponse.builder()
                .uploadJobId(uploadJobId)
                .userId(userId)
                .status("CREATED")
                .photos(List.of(photoResponse))
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(900))
                .build();

        photo = Photo.builder()
                .id(photoId)
                .fileName("test-photo.jpg")
                .contentType("image/jpeg")
                .fileSize(1024L)
                .s3Key("users/test-key")
                .status(Photo.UploadStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        uploadJob = UploadJob.builder()
                .id(uploadJobId)
                .userId(userId)
                .status(UploadJob.UploadJobStatus.CREATED)
                .build();
        uploadJob.getPhotos().add(photo);
    }

    @Test
    void testInitiateUpload_Success() throws Exception {
        // Arrange
        when(initiateUploadCommandHandler.handle(any(InitiateUploadCommand.class)))
                .thenReturn(initiateResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/uploads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initiateRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.uploadJobId").value(uploadJobId.toString()))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.photos").isArray())
                .andExpect(jsonPath("$.photos[0].photoId").value(photoId.toString()));
    }

    @Test
    void testGetUploadJobStatus_Success() throws Exception {
        // Arrange
        when(getUploadJobQueryHandler.handle(any()))
                .thenReturn(uploadJob);

        // Act & Assert
        mockMvc.perform(get("/api/v1/uploads/{uploadJobId}", uploadJobId)
                        .param("userId", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadJobId").value(uploadJobId.toString()))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void testGetUploadJobProgress_Success() throws Exception {
        // Arrange
        when(getUploadJobQueryHandler.handle(any()))
                .thenReturn(uploadJob);

        // Act & Assert
        mockMvc.perform(get("/api/v1/uploads/{uploadJobId}/progress", uploadJobId)
                        .param("userId", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadJobId").value(uploadJobId.toString()))
                .andExpect(jsonPath("$.progressPercentage").exists());
    }

    @Test
    void testGetUserPhotos_Success() throws Exception {
        // Arrange
        Page<Photo> photoPage = new PageImpl<>(
                List.of(photo),
                PageRequest.of(0, 20),
                1
        );

        when(getPhotosQueryHandler.handle(any()))
                .thenReturn(photoPage);

        // Act & Assert
        mockMvc.perform(get("/api/v1/uploads/photos")
                        .param("userId", userId.toString())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].photoId").value(photoId.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}

