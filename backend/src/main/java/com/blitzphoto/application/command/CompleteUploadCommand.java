package com.blitzphoto.application.command;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

/**
 * CompleteUploadCommand
 * 
 * CQRS Command for completing a photo upload after files have been uploaded to S3.
 * Commands are immutable and represent write operations.
 */
@Value
@Builder
public class CompleteUploadCommand {
    
    UUID uploadJobId;
    UUID userId;
}

