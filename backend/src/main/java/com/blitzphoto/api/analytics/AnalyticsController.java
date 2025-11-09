package com.blitzphoto.api.analytics;

import com.blitzphoto.application.service.AnalyticsService;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Analytics Controller
 * 
 * REST endpoints for analytics and statistics.
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics", description = "Analytics and statistics endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get user statistics
     * 
     * @param userDetails Authenticated user details
     * @return User statistics
     */
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user statistics", description = "Retrieves statistics for the authenticated user")
    public ResponseEntity<AnalyticsService.UserStatistics> getUserStatistics(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = UUID.fromString(userDetails.getUsername());
        AnalyticsService.UserStatistics statistics = analyticsService.getUserStatistics(userId);
        
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get system statistics (admin only)
     * 
     * @return System statistics
     */
    @GetMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system statistics", description = "Retrieves system-wide statistics (admin only)")
    public ResponseEntity<AnalyticsService.SystemStatistics> getSystemStatistics() {
        AnalyticsService.SystemStatistics statistics = analyticsService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
    }
}

