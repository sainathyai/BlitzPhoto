package com.blitzphoto.application.command;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

/**
 * DeletePhotosCommand
 *
 * CQRS command representing a bulk delete request for photos belonging to a user.
 */
@Value
@Builder
public class DeletePhotosCommand {

    UUID userId;
    List<UUID> photoIds;
}

