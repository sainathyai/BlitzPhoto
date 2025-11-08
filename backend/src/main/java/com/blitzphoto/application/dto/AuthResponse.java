package com.blitzphoto.application.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Authentication Response DTO
 */
@Value
@Builder
public class AuthResponse {
    
    String accessToken;
    String refreshToken;
    String tokenType;
    Long expiresIn;
    UUID userId;
    String email;
    String username;
    Instant issuedAt;
    Instant expiresAt;
    
    /**
     * Create successful auth response
     */
    public static AuthResponse success(
            String accessToken,
            String refreshToken,
            Long expiresIn,
            UUID userId,
            String email,
            String username
    ) {
        Instant now = Instant.now();
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .userId(userId)
                .email(email)
                .username(username)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn / 1000))
                .build();
    }
}

