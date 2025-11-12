package com.blitzphoto.application.service;

import com.blitzphoto.application.dto.AuthRequest;
import com.blitzphoto.application.dto.AuthResponse;
import com.blitzphoto.domain.model.User;
import com.blitzphoto.domain.repository.UserRepository;
import com.blitzphoto.infrastructure.security.jwt.JwtTokenProvider;
import com.blitzphoto.shared.exception.BusinessException;
import com.blitzphoto.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Authentication Service
 * 
 * Handles user authentication, registration, and token management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    /**
     * Register a new user
     * 
     * @param request Registration request
     * @return Auth response with tokens
     */
    public AuthResponse register(AuthRequest.RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("User with email already exists: " + request.getEmail());
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("User with username already exists: " + request.getUsername());
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        user = userRepository.save(user);

        log.info("User registered successfully: {}", user.getId());

        // Generate tokens
        return generateAuthResponse(user);
    }

    /**
     * Authenticate user and generate tokens
     * 
     * @param request Login request
     * @return Auth response with tokens
     */
    public AuthResponse login(AuthRequest.LoginRequest request) {
        log.info("Authenticating user: {}", request.getEmailOrUsername());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Load user
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .orElseGet(() -> userRepository.findByUsername(request.getEmailOrUsername())
                        .orElseThrow(() -> new UnauthorizedException("User not found")));

        // Check if user is active
        if (!user.canUpload()) {
            throw new UnauthorizedException("User is not active");
        }

        // Record login
        user.recordLogin();
        userRepository.save(user);

        log.info("User authenticated successfully: {}", user.getId());

        // Generate tokens
        return generateAuthResponse(user);
    }

    /**
     * Refresh access token
     * 
     * @param refreshToken Refresh token
     * @return New auth response with tokens
     */
    public AuthResponse refreshToken(String refreshToken) {
        log.debug("Refreshing token");

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByUsername(username)
                        .orElseThrow(() -> new UnauthorizedException("User not found")));

        if (!user.canUpload()) {
            throw new UnauthorizedException("User is not active");
        }

        // Generate new tokens
        return generateAuthResponse(user);
    }

    /**
     * Generate authentication response with tokens
     * 
     * @param user User entity
     * @return Auth response
     */
    private AuthResponse generateAuthResponse(User user) {
        // Create UserDetails for token generation
        org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPasswordHash(),
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );

        // Create authentication for token generation
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.success(
                accessToken,
                refreshToken,
                900000L, // 15 minutes
                user.getId(),
                user.getEmail(),
                user.getUsername()
        );
    }
}

