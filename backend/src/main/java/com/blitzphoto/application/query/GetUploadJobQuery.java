package com.blitzphoto.application.query;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

/**
 * GetUploadJobQuery
 * 
 * CQRS Query for retrieving an upload job.
 */
@Value
@Builder
public class GetUploadJobQuery {
    
    UUID uploadJobId;
    UUID userId; // For authorization check
}

