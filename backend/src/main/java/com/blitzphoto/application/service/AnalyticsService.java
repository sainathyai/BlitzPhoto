package com.blitzphoto.application.service;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.PhotoRepository;
import com.blitzphoto.domain.repository.UploadJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Analytics Service
 * 
 * Provides analytics and statistics for users and the system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PhotoRepository photoRepository;
    private final UploadJobRepository uploadJobRepository;

    /**
     * Get user statistics
     * 
     * @param userId User ID
     * @return User statistics
     */
    public UserStatistics getUserStatistics(UUID userId) {
        log.debug("Getting user statistics for user: {}", userId);

        // Get all photos for user
        List<Photo> photos = photoRepository.findByUserId(userId);

        // Calculate statistics
        long totalPhotos = photos.size();
        long completedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.COMPLETED)
                .count();
        long failedPhotos = photos.stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.FAILED)
                .count();
        long totalSize = photos.stream()
                .mapToLong(Photo::getFileSize)
                .sum();

        // Get upload jobs
        List<UploadJob> uploadJobs = uploadJobRepository.findByUserId(userId);
        long totalJobs = uploadJobs.size();
        long completedJobs = uploadJobs.stream()
                .filter(j -> j.getStatus() == UploadJob.UploadJobStatus.COMPLETED)
                .count();

        // Calculate average photos per job
        double avgPhotosPerJob = totalJobs > 0 ? (double) totalPhotos / totalJobs : 0;

        // Calculate average file size
        double avgFileSize = totalPhotos > 0 ? (double) totalSize / totalPhotos : 0;

        // Get photos by content type
        Map<String, Long> photosByType = new HashMap<>();
        photos.forEach(photo -> {
            String contentType = photo.getContentType();
            photosByType.put(contentType, photosByType.getOrDefault(contentType, 0L) + 1);
        });

        // Get photos uploaded in last 30 days
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        long photosLast30Days = photos.stream()
                .filter(p -> p.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        return new UserStatistics(
                userId,
                totalPhotos,
                completedPhotos,
                failedPhotos,
                totalSize,
                totalJobs,
                completedJobs,
                avgPhotosPerJob,
                avgFileSize,
                photosByType,
                photosLast30Days
        );
    }

    /**
     * Get system statistics
     * 
     * @return System statistics
     */
    public SystemStatistics getSystemStatistics() {
        log.debug("Getting system statistics");

        // Get all photos
        long totalPhotos = photoRepository.count();
        long completedPhotos = photoRepository.findAll().stream()
                .filter(p -> p.getStatus() == Photo.UploadStatus.COMPLETED)
                .count();

        // Get all upload jobs
        long totalJobs = uploadJobRepository.count();
        long completedJobs = uploadJobRepository.findAll().stream()
                .filter(j -> j.getStatus() == UploadJob.UploadJobStatus.COMPLETED)
                .count();

        // Calculate total storage used
        long totalStorage = photoRepository.findAll().stream()
                .mapToLong(Photo::getFileSize)
                .sum();

        // Calculate average photos per job
        double avgPhotosPerJob = totalJobs > 0 ? (double) totalPhotos / totalJobs : 0;

        // Get photos uploaded in last 24 hours
        Instant twentyFourHoursAgo = Instant.now().minus(24, ChronoUnit.HOURS);
        long photosLast24Hours = photoRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().isAfter(twentyFourHoursAgo))
                .count();

        return new SystemStatistics(
                totalPhotos,
                completedPhotos,
                totalJobs,
                completedJobs,
                totalStorage,
                avgPhotosPerJob,
                photosLast24Hours
        );
    }

    /**
     * User Statistics Value Object
     */
    public record UserStatistics(
            UUID userId,
            long totalPhotos,
            long completedPhotos,
            long failedPhotos,
            long totalSize,
            long totalJobs,
            long completedJobs,
            double avgPhotosPerJob,
            double avgFileSize,
            Map<String, Long> photosByType,
            long photosLast30Days
    ) {}

    /**
     * System Statistics Value Object
     */
    public record SystemStatistics(
            long totalPhotos,
            long completedPhotos,
            long totalJobs,
            long completedJobs,
            long totalStorage,
            double avgPhotosPerJob,
            long photosLast24Hours
    ) {}
}

