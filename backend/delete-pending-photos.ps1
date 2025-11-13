# Delete all PENDING photos from the database
# This script connects to the RDS database and deletes all photos with PENDING status

$env:PGPASSWORD = "RapidPhoto!Secure2025#DB"

Write-Host "Deleting all PENDING photos from database..." -ForegroundColor Yellow

$sql = @"
-- Delete all photos with PENDING status
DELETE FROM photos WHERE status = 'PENDING';

-- Optional: Delete upload jobs that have no photos left
DELETE FROM upload_jobs 
WHERE id NOT IN (SELECT DISTINCT upload_job_id FROM photos WHERE upload_job_id IS NOT NULL);

-- Show count of remaining photos by status
SELECT status, COUNT(*) as count 
FROM photos 
GROUP BY status 
ORDER BY status;
"@

$sql | psql -h sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -U rapidphoto -d blitzphoto -c

Write-Host "Done!" -ForegroundColor Green

