package com.blitzphoto.infrastructure.aws;

import com.blitzphoto.application.messaging.UploadJobMessageHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.*;

import java.util.List;
import java.util.UUID;

/**
 * SQS Message Listener
 * 
 * Polls SQS queue for upload job messages and processes them asynchronously.
 * This listener runs on a schedule to consume messages from the queue.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SqsMessageListener {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;
    private final UploadJobMessageHandler uploadJobMessageHandler;

    @Value("${blitzphoto.aws.sqs.upload-queue-url}")
    private String uploadQueueUrl;

    @Value("${blitzphoto.aws.sqs.max-receive-count:3}")
    private int maxReceiveCount;

    /**
     * Poll SQS queue for messages
     * 
     * This method runs on a schedule (every 10 seconds) to poll the queue.
     * It processes messages asynchronously and deletes them after successful processing.
     */
    @Scheduled(fixedDelay = 10000) // Poll every 10 seconds
    public void pollQueue() {
        try {
            log.debug("Polling SQS queue for messages: queueUrl={}", uploadQueueUrl);

            ReceiveMessageRequest request = ReceiveMessageRequest.builder()
                    .queueUrl(uploadQueueUrl)
                    .maxNumberOfMessages(10) // Process up to 10 messages at a time
                    .waitTimeSeconds(10) // Long polling
                    .visibilityTimeoutSeconds(300) // 5 minutes visibility timeout
                    .build();

            ReceiveMessageResponse response = sqsClient.receiveMessage(request);
            List<Message> messages = response.messages();

            if (messages.isEmpty()) {
                log.debug("No messages in queue");
                return;
            }

            log.info("Received {} messages from SQS queue", messages.size());

            for (Message message : messages) {
                processMessage(message);
            }

        } catch (Exception e) {
            log.error("Error polling SQS queue", e);
        }
    }

    /**
     * Process individual message
     */
    private void processMessage(Message message) {
        String messageId = message.messageId();
        String receiptHandle = message.receiptHandle();

        try {
            log.debug("Processing message: messageId={}", messageId);

            // Parse message body
            SqsService.UploadJobMessage uploadJobMessage = objectMapper.readValue(
                    message.body(), 
                    SqsService.UploadJobMessage.class
            );

            UUID uploadJobId = UUID.fromString(uploadJobMessage.getUploadJobId());
            UUID userId = UUID.fromString(uploadJobMessage.getUserId());

            // Process upload job asynchronously
            uploadJobMessageHandler.processUploadJob(uploadJobId, userId);

            // Delete message from queue after successful processing
            deleteMessage(receiptHandle);

            log.info("Successfully processed message: messageId={}, jobId={}", messageId, uploadJobId);

        } catch (Exception e) {
            log.error("Failed to process message: messageId={}", messageId, e);

            // Check if message should be sent to DLQ
            int receiveCount = getReceiveCount(message);
            if (receiveCount >= maxReceiveCount) {
                log.warn("Message exceeded max receive count: messageId={}, receiveCount={}, maxReceiveCount={}", 
                        messageId, receiveCount, maxReceiveCount);
                // Message will be automatically sent to DLQ by SQS
                deleteMessage(receiptHandle);
            } else {
                // Make message visible again for retry
                changeMessageVisibility(receiptHandle, 0);
            }
        }
    }

    /**
     * Delete message from queue
     */
    private void deleteMessage(String receiptHandle) {
        try {
            DeleteMessageRequest request = DeleteMessageRequest.builder()
                    .queueUrl(uploadQueueUrl)
                    .receiptHandle(receiptHandle)
                    .build();

            sqsClient.deleteMessage(request);
            log.debug("Deleted message from queue: receiptHandle={}", receiptHandle);

        } catch (Exception e) {
            log.error("Failed to delete message from queue: receiptHandle={}", receiptHandle, e);
        }
    }

    /**
     * Change message visibility timeout
     */
    private void changeMessageVisibility(String receiptHandle, int visibilityTimeout) {
        try {
            ChangeMessageVisibilityRequest request = ChangeMessageVisibilityRequest.builder()
                    .queueUrl(uploadQueueUrl)
                    .receiptHandle(receiptHandle)
                    .visibilityTimeout(visibilityTimeout)
                    .build();

            sqsClient.changeMessageVisibility(request);
            log.debug("Changed message visibility: receiptHandle={}, visibilityTimeout={}", 
                    receiptHandle, visibilityTimeout);

        } catch (Exception e) {
            log.error("Failed to change message visibility: receiptHandle={}", receiptHandle, e);
        }
    }

    /**
     * Get receive count from message attributes
     */
    private int getReceiveCount(Message message) {
        try {
            String receiveCountStr = message.attributes().get(MessageSystemAttributeName.APPROXIMATE_RECEIVE_COUNT);
            return receiveCountStr != null ? Integer.parseInt(receiveCountStr) : 0;
        } catch (Exception e) {
            log.warn("Failed to get receive count from message", e);
            return 0;
        }
    }
}

