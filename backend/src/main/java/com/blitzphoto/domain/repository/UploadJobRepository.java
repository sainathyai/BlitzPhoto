package com.blitzphoto.domain.repository;

import com.blitzphoto.domain.model.UploadJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * UploadJob Repository Interface
 * 
 * Spring Data JPA repository for UploadJob aggregate root.
 */
@Repository
public interface UploadJobRepository extends JpaRepository<UploadJob, UUID> {

    /**
     * Find all upload jobs by user ID
     * 
     * @param userId The user ID
     * @return List of upload jobs
     */
    List<UploadJob> findByUserId(UUID userId);

    /**
     * Find upload job by ID with photos loaded
     * 
     * @param id The upload job ID
     * @return Optional upload job with photos
     */
    @Query("SELECT uj FROM UploadJob uj LEFT JOIN FETCH uj.photos WHERE uj.id = :id")
    Optional<UploadJob> findByIdWithPhotos(@Param("id") UUID id);

    /**
     * Find all upload jobs by user ID ordered by creation date descending
     * 
     * @param userId The user ID
     * @return List of upload jobs
     */
    List<UploadJob> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find all upload jobs by user ID and status
     * 
     * @param userId The user ID
     * @param status The upload job status
     * @return List of upload jobs
     */
    List<UploadJob> findByUserIdAndStatus(UUID userId, UploadJob.UploadJobStatus status);

    /**
     * Count upload jobs by user ID
     * 
     * @param userId The user ID
     * @return Count of upload jobs
     */
    long countByUserId(UUID userId);
}

