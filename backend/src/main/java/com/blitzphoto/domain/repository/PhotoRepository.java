package com.blitzphoto.domain.repository;

import com.blitzphoto.domain.model.Photo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Photo Repository Interface
 * 
 * Spring Data JPA repository for Photo aggregate.
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, UUID>, JpaSpecificationExecutor<Photo> {

    /**
     * Find all photos by upload job ID
     * 
     * @param uploadJobId The upload job ID
     * @return List of photos
     */
    List<Photo> findByUploadJobId(UUID uploadJobId);

    /**
     * Find all photos by user ID
     * 
     * @param userId The user ID
     * @return List of photos
     */
    @Query("SELECT p FROM Photo p JOIN UploadJob uj ON p.uploadJob.id = uj.id WHERE uj.userId = :userId")
    List<Photo> findByUserId(@Param("userId") UUID userId);

    /**
     * Find all photos by user ID with pagination
     * 
     * @param userId The user ID
     * @param pageable Pageable for pagination
     * @return Page of photos
     */
    @Query("SELECT p FROM Photo p JOIN UploadJob uj ON p.uploadJob.id = uj.id WHERE uj.userId = :userId")
    Page<Photo> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find all photos by user ID and status
     * 
     * @param userId The user ID
     * @param status The photo status
     * @return List of photos
     */
    @Query("SELECT p FROM Photo p JOIN UploadJob uj ON p.uploadJob.id = uj.id WHERE uj.userId = :userId AND p.status = :status")
    List<Photo> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") Photo.UploadStatus status);

    /**
     * Count photos by upload job ID
     * 
     * @param uploadJobId The upload job ID
     * @return Count of photos
     */
    long countByUploadJobId(UUID uploadJobId);
}

