package com.blitzphoto.api.auth;

import com.blitzphoto.application.dto.AuthRequest;
import com.blitzphoto.application.dto.AuthResponse;
import com.blitzphoto.application.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * 
 * REST endpoints for user authentication and registration.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;

    /**
     * Register a new user
     * 
     * @param request Registration request
     * @return Auth response with tokens
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT tokens")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest.RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        AuthResponse response = authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user
     * 
     * @param request Login request
     * @return Auth response with tokens
     */
    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user and returns JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest.LoginRequest request) {
        log.info("Login request for: {}", request.getEmailOrUsername());
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh access token
     * 
     * @param request Refresh token request
     * @return New auth response with tokens
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generates new access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody AuthRequest.RefreshTokenRequest request) {
        log.debug("Refresh token request");
        AuthResponse response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user info
     * 
     * @return Current user information
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns current authenticated user information")
    public ResponseEntity<?> getCurrentUser() {
        // This will be implemented with @AuthenticationPrincipal
        return ResponseEntity.ok().build();
    }
}

