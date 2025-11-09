package com.blitzphoto.application.query;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * SearchPhotosQuery
 * 
 * CQRS Query for advanced photo search with filters.
 */
@Value
@Builder
public class SearchPhotosQuery {
    UUID userId;
    String fileName; // Partial match
    String contentType; // Exact match
    Integer minWidth;
    Integer maxWidth;
    Integer minHeight;
    Integer maxHeight;
    Long minFileSize;
    Long maxFileSize;
    Instant fromDate;
    Instant toDate;
    Integer page;
    Integer size;
    String sortBy;
    String sortDirection;
}

