package com.blitzphoto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * RapidPhotoUpload - Main Application
 * 
 * High-performance photo upload system supporting 100 concurrent uploads
 * with real-time progress tracking.
 * 
 * Architecture:
 * - DDD (Domain-Driven Design)
 * - CQRS (Command Query Responsibility Segregation)
 * - VSA (Vertical Slice Architecture)
 * 
 * @author RapidPhoto Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableCaching
@EnableJpaAuditing
@EnableScheduling
public class BlitzPhotoApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlitzPhotoApplication.class, args);
    }
}

