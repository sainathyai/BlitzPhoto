package com.blitzphoto.application.command;

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
    
    /**
     * Photo Upload Request
     */
    @Value
    @Builder
    public static class PhotoUploadRequest {
        String fileName;
        String contentType;
        Long fileSize;
    }
}

