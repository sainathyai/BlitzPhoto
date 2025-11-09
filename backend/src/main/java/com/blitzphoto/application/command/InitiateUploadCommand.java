package com.blitzphoto.application.command;

import com.blitzphoto.application.dto.PhotoUploadRequest;
import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

/**
 * InitiateUploadCommand
 * 
 * CQRS Command for initiating a photo upload.
 * Commands are immutable and represent write operations.
 */
@Value
@Builder
public class InitiateUploadCommand {
    
    UUID userId;
    List<PhotoUploadRequest> photos;
}

