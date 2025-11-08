package com.blitzphoto.domain.model;

import lombok.Value;

import java.time.Instant;

/**
 * PresignedUrl Value Object
 * 
 * Immutable value object representing a presigned S3 URL.
 * This is a value object (no identity, immutable).
 */
@Value
public class PresignedUrl {
    
    String url;
    Instant expiresAt;
    String httpMethod;
    String contentType;
    Long contentLength;
    
    /**
     * Business Logic: Check if URL is expired
     * 
     * @return true if URL is expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }
    
    /**
     * Business Logic: Check if URL is valid
     * 
     * @return true if URL is not expired
     */
    public boolean isValid() {
        return !isExpired();
    }
    
    /**
     * Business Logic: Get time until expiration in seconds
     * 
     * @return seconds until expiration, or 0 if expired
     */
    public long getSecondsUntilExpiration() {
        if (isExpired()) {
            return 0;
        }
        
        return Instant.now().until(this.expiresAt, java.time.temporal.ChronoUnit.SECONDS);
    }
}

