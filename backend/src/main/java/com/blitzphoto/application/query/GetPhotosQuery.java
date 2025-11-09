package com.blitzphoto.application.query;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

/**
 * GetPhotosQuery
 * 
 * CQRS Query for retrieving photos.
 * Queries are immutable and represent read operations.
 */
@Value
@Builder
public class GetPhotosQuery {
    
    UUID userId;
    Integer page;
    Integer size;
    String sortBy;
    String sortDirection;
    
    /**
     * Default values
     */
    public static GetPhotosQuery defaultQuery(UUID userId) {
        return GetPhotosQuery.builder()
                .userId(userId)
                .page(0)
                .size(20)
                .sortBy("createdAt")
                .sortDirection("DESC")
                .build();
    }
}

