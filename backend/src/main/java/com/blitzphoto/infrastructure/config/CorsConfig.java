package com.blitzphoto.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration
 * 
 * Configures Cross-Origin Resource Sharing for web and mobile clients.
 */
@Configuration
public class CorsConfig {

    @Value("${blitzphoto.security.cors.allowed-origins:${CORS_ALLOWED_ORIGINS:http://localhost:5173}}")
    private String allowedOrigins;

    @Value("${blitzphoto.security.cors.allowed-methods}")
    private String allowedMethods;

    @Value("${blitzphoto.security.cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${blitzphoto.security.cors.allow-credentials}")
    private boolean allowCredentials;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse allowed origins
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
        
        // For React Native/Expo: Use origin patterns to allow requests without Origin header
        // React Native doesn't send Origin header, so we use patterns instead of exact origins
        // This allows both browser clients (with Origin) and React Native (without Origin)
        if (origins.isEmpty() || origins.contains("*")) {
            // Allow all origins (development only) - supports React Native
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        } else {
            // Use origin patterns to support React Native (which doesn't send Origin header)
            // Add all origins as patterns, plus wildcard patterns for local network
            List<String> originPatterns = new java.util.ArrayList<>(origins);
            // Add wildcard patterns for local development (React Native compatibility)
            originPatterns.add("http://*:*");
            originPatterns.add("https://*:*");
            configuration.setAllowedOriginPatterns(originPatterns);
            // Also set exact origins for browser clients that send Origin header
            configuration.setAllowedOrigins(origins);
        }
        
        // Parse allowed methods
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // Parse allowed headers
        if ("*".equals(allowedHeaders)) {
            configuration.addAllowedHeader("*");
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(","));
            configuration.setAllowedHeaders(headers);
        }
        
        configuration.setAllowCredentials(allowCredentials);
        configuration.addAllowedHeader(CorsConfiguration.ALL);
        configuration.addExposedHeader("Authorization");
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}

