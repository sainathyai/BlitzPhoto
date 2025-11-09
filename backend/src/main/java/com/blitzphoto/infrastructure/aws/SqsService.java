package com.blitzphoto.infrastructure.aws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.util.UUID;

/**
 * SQS Service
 * 
 * Handles SQS message publishing for async upload processing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SqsService {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;

    @Value("${blitzphoto.aws.sqs.upload-queue-url}")
    private String uploadQueueUrl;

    /**
     * Publish upload job message to SQS
     * 
     * @param uploadJobId Upload job ID
     * @param userId User ID
     * @return Message ID
     */
    public String publishUploadJobMessage(UUID uploadJobId, UUID userId) {
        try {
            log.debug("Publishing upload job message: jobId={}, userId={}", uploadJobId, userId);

            UploadJobMessage message = UploadJobMessage.builder()
                    .uploadJobId(uploadJobId.toString())
                    .userId(userId.toString())
                    .timestamp(System.currentTimeMillis())
                    .build();

            String messageBody = objectMapper.writeValueAsString(message);

            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(uploadQueueUrl)
                    .messageBody(messageBody)
                    .build();

            SendMessageResponse response = sqsClient.sendMessage(request);

            log.info("Published upload job message: jobId={}, messageId={}", uploadJobId, response.messageId());

            return response.messageId();
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize upload job message: jobId={}", uploadJobId, e);
            throw new RuntimeException("Failed to publish upload job message", e);
        } catch (Exception e) {
            log.error("Failed to publish upload job message: jobId={}", uploadJobId, e);
            throw new RuntimeException("Failed to publish upload job message", e);
        }
    }

    /**
     * Upload Job Message DTO
     */
    @lombok.Value
    @lombok.Builder
    public static class UploadJobMessage {
        String uploadJobId;
        String userId;
        Long timestamp;
    }
}

