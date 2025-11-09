package com.blitzphoto.infrastructure.aws;

import com.blitzphoto.domain.model.PresignedUrl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * S3Service Test
 * 
 * Unit tests for S3 presigned URL generation.
 */
@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private PresignedPutObjectRequest presignedRequest;

    private S3Service s3Service;

    @BeforeEach
    void setUp() {
        s3Service = new S3Service(s3Presigner);
        ReflectionTestUtils.setField(s3Service, "uploadsBucket", "test-uploads-bucket");
        ReflectionTestUtils.setField(s3Service, "thumbnailsBucket", "test-thumbnails-bucket");
        ReflectionTestUtils.setField(s3Service, "presignedUrlExpirationMinutes", 15);
    }

    @Test
    void testGeneratePresignedUploadUrl() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        String fileName = "test-photo.jpg";
        String contentType = "image/jpeg";
        Long fileSize = 1024L;

        URL mockUrl = new URL("https://test-uploads-bucket.s3-accelerate.amazonaws.com/users/test-key");
        when(presignedRequest.url()).thenReturn(mockUrl);
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class)))
                .thenReturn(presignedRequest);

        // Act
        S3Service.PresignedUrlResult result = s3Service.generatePresignedUploadUrl(
                userId, fileName, contentType, fileSize
        );

        // Assert
        assertNotNull(result);
        assertNotNull(result.getS3Key());
        assertTrue(result.getS3Key().startsWith("users/"));
        assertTrue(result.getS3Key().contains(userId.toString()));
        
        PresignedUrl presignedUrl = result.getPresignedUrl();
        assertNotNull(presignedUrl);
        assertEquals("PUT", presignedUrl.getHttpMethod());
        assertEquals(contentType, presignedUrl.getContentType());
        assertEquals(fileSize, presignedUrl.getContentLength());
        assertFalse(presignedUrl.isExpired());
    }

    @Test
    void testGeneratePresignedThumbnailUrl() throws Exception {
        // Arrange
        String thumbnailS3Key = "thumbnails/test-thumbnail.jpg";
        
        URL mockUrl = new URL("https://test-thumbnails-bucket.s3-accelerate.amazonaws.com/" + thumbnailS3Key);
        software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest getRequest = 
                software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest.builder()
                        .url(mockUrl)
                        .build();
        
        when(s3Presigner.presignGetObject(any(software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.class)))
                .thenReturn(getRequest);

        // Act
        PresignedUrl result = s3Service.generatePresignedThumbnailUrl(thumbnailS3Key);

        // Assert
        assertNotNull(result);
        assertEquals("GET", result.getHttpMethod());
        assertEquals("image/jpeg", result.getContentType());
        assertFalse(result.isExpired());
    }
}

