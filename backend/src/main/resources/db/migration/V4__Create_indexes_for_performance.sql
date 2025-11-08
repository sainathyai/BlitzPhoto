-- Additional indexes for performance optimization
-- These indexes support common query patterns for Blitz Speed ⚡

-- Index for finding photos by user (through upload_jobs join)
-- This supports GetPhotosQuery which queries photos by userId
CREATE INDEX idx_photos_user_lookup ON photos(upload_job_id)
    INCLUDE (id, file_name, status, created_at, s3_key, thumbnail_s3_key);

-- Index for finding failed photos that can be retried
CREATE INDEX idx_photos_retryable ON photos(upload_job_id, status, updated_at)
    WHERE status = 'FAILED';

-- Index for finding in-progress upload jobs
CREATE INDEX idx_upload_jobs_in_progress ON upload_jobs(user_id, status, updated_at)
    WHERE status IN ('CREATED', 'IN_PROGRESS');

-- Index for finding completed photos by user (for gallery queries)
CREATE INDEX idx_photos_user_completed ON photos(upload_job_id, status, created_at DESC)
    WHERE status = 'COMPLETED';

-- Add comment
COMMENT ON INDEX idx_photos_user_lookup IS 'Optimized index for user photo queries (supports GetPhotosQuery)';
COMMENT ON INDEX idx_photos_retryable IS 'Index for finding failed photos that can be retried';
COMMENT ON INDEX idx_upload_jobs_in_progress IS 'Index for finding active upload jobs';
COMMENT ON INDEX idx_photos_user_completed IS 'Index for gallery queries (completed photos only)';

