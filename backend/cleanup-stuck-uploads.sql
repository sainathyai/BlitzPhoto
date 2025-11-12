-- Cleanup Stuck Uploads
-- Use these SQL commands to clean up uploads stuck in PENDING status

-- 1. First, check what's stuck
SELECT 
    uj.id as upload_job_id,
    uj.user_id,
    uj.status as job_status,
    uj.created_at as job_created_at,
    COUNT(p.id) as total_photos,
    COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending_photos,
    COUNT(CASE WHEN p.status = 'UPLOADING' THEN 1 END) as uploading_photos,
    COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed_photos,
    COUNT(CASE WHEN p.status = 'FAILED' THEN 1 END) as failed_photos
FROM upload_jobs uj
LEFT JOIN photos p ON p.upload_job_id = uj.id
WHERE p.status = 'PENDING' OR uj.status = 'IN_PROGRESS'
GROUP BY uj.id, uj.user_id, uj.status, uj.created_at
ORDER BY uj.created_at DESC;

-- 2. View specific stuck photos
SELECT 
    p.id as photo_id,
    p.file_name,
    p.status,
    p.s3_key,
    p.created_at,
    uj.id as upload_job_id,
    uj.user_id
FROM photos p
JOIN upload_jobs uj ON p.upload_job_id = uj.id
WHERE p.status = 'PENDING'
ORDER BY p.created_at DESC;

-- 3. Delete photos stuck in PENDING status (for a specific upload job)
-- Replace 'YOUR_UPLOAD_JOB_ID' with the actual upload job ID
-- DELETE FROM photos WHERE upload_job_id = 'YOUR_UPLOAD_JOB_ID' AND status = 'PENDING';

-- 4. Delete ALL photos stuck in PENDING status (use with caution!)
-- DELETE FROM photos WHERE status = 'PENDING';

-- 5. Delete upload jobs that have no photos or only PENDING photos
-- This will also delete associated photos due to CASCADE
-- DELETE FROM upload_jobs 
-- WHERE id IN (
--     SELECT uj.id 
--     FROM upload_jobs uj
--     LEFT JOIN photos p ON p.upload_job_id = uj.id
--     GROUP BY uj.id
--     HAVING COUNT(p.id) = 0 OR COUNT(CASE WHEN p.status != 'PENDING' THEN 1 END) = 0
-- );

-- 6. Mark stuck photos as FAILED instead of deleting (safer option)
-- UPDATE photos 
-- SET status = 'FAILED', 
--     error_message = 'Manually marked as failed - stuck in PENDING status',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE status = 'PENDING' 
--   AND created_at < NOW() - INTERVAL '1 hour';  -- Only mark old ones as failed

-- 7. Update upload job status after cleaning up photos
-- This will update jobs that have no remaining photos
-- UPDATE upload_jobs 
-- SET status = 'FAILED',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE id IN (
--     SELECT uj.id 
--     FROM upload_jobs uj
--     LEFT JOIN photos p ON p.upload_job_id = uj.id AND p.status != 'PENDING'
--     GROUP BY uj.id
--     HAVING COUNT(p.id) = 0
-- );

