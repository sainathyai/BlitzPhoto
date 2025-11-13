-- Delete all photos with PENDING status
-- This will also clean up orphaned upload jobs if they have no photos left

-- First, delete all photos with PENDING status
DELETE FROM photos WHERE status = 'PENDING';

-- Optional: Delete upload jobs that have no photos left
DELETE FROM upload_jobs 
WHERE id NOT IN (SELECT DISTINCT upload_job_id FROM photos WHERE upload_job_id IS NOT NULL);

-- Show count of remaining photos by status
SELECT status, COUNT(*) as count 
FROM photos 
GROUP BY status 
ORDER BY status;

