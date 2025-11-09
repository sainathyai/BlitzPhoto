package com.blitzphoto.infrastructure.aws;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * SqsService Test
 * 
 * Unit tests for SQS message publishing.
 */
@ExtendWith(MockitoExtension.class)
class SqsServiceTest {

    @Mock
    private SqsClient sqsClient;

    @InjectMocks
    private SqsService sqsService;

    private ObjectMapper objectMapper;
    private String uploadQueueUrl;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        uploadQueueUrl = "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue";

        ReflectionTestUtils.setField(sqsService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(sqsService, "uploadQueueUrl", uploadQueueUrl);
    }

    @Test
    void testPublishUploadJobMessage_Success() {
        // Arrange
        UUID uploadJobId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        SendMessageResponse response = SendMessageResponse.builder()
                .messageId("test-message-id")
                .build();

        when(sqsClient.sendMessage(any(SendMessageRequest.class))).thenReturn(response);

        // Act
        String messageId = sqsService.publishUploadJobMessage(uploadJobId, userId);

        // Assert
        assertNotNull(messageId);
        assertEquals("test-message-id", messageId);
        verify(sqsClient, times(1)).sendMessage(any(SendMessageRequest.class));
    }

    @Test
    void testPublishUploadJobMessage_Failure() {
        // Arrange
        UUID uploadJobId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(sqsClient.sendMessage(any(SendMessageRequest.class)))
                .thenThrow(new RuntimeException("SQS error"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> sqsService.publishUploadJobMessage(uploadJobId, userId));
        assertTrue(exception.getMessage().contains("Failed to publish upload job message"));
        verify(sqsClient, times(1)).sendMessage(any(SendMessageRequest.class));
    }
}

