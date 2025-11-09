package com.blitzphoto.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

/**
 * Authentication Request DTOs
 */
public class AuthRequest {

    /**
     * Login Request
     */
    @Value
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Email or username is required")
        String emailOrUsername;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password;
    }

    /**
     * Register Request
     */
    @Value
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email;

        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password;
    }

    /**
     * Refresh Token Request
     */
    @Value
    @Builder
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        String refreshToken;
    }
}

