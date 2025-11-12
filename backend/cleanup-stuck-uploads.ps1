# PowerShell script to run PostgreSQL container and cleanup stuck uploads

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "blitzphoto"
$DB_USER = "rapidphoto"
$DB_PASSWORD = "changeme"

Write-Host "=== BlitzPhoto - Cleanup Stuck Uploads ===" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL container is running
Write-Host "Checking for PostgreSQL container..." -ForegroundColor Yellow
$container = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if (-not $container) {
    Write-Host "PostgreSQL container not found. Starting container..." -ForegroundColor Yellow
    
    # Try to start existing container
    docker start postgres 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "No existing container found. Creating new PostgreSQL container..." -ForegroundColor Yellow
        docker run -d `
            --name postgres `
            -e POSTGRES_USER=$DB_USER `
            -e POSTGRES_PASSWORD=$DB_PASSWORD `
            -e POSTGRES_DB=$DB_NAME `
            -p ${DB_PORT}:5432 `
            postgres:15-alpine
        
        Write-Host "Waiting for PostgreSQL to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "PostgreSQL container '$container' is running." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Checking stuck uploads ===" -ForegroundColor Cyan

# Check stuck uploads
$checkQuery = @"
SELECT 
    uj.id as upload_job_id,
    uj.user_id,
    uj.status as job_status,
    COUNT(p.id) as total_photos,
    COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending_photos
FROM upload_jobs uj
LEFT JOIN photos p ON p.upload_job_id = uj.id
WHERE p.status = 'PENDING' OR uj.status = 'IN_PROGRESS'
GROUP BY uj.id, uj.user_id, uj.status;
"@

Write-Host "Stuck uploads:" -ForegroundColor Yellow
docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c $checkQuery

Write-Host ""
Write-Host "=== Deleting stuck PENDING photos ===" -ForegroundColor Cyan

# Delete stuck PENDING photos
$deleteQuery = "DELETE FROM photos WHERE status = 'PENDING';"

$confirm = Read-Host "Are you sure you want to delete ALL PENDING photos? (yes/no)"
if ($confirm -eq "yes") {
    docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c $deleteQuery
    Write-Host "Deleted stuck PENDING photos." -ForegroundColor Green
    
    # Update upload job statuses
    Write-Host ""
    Write-Host "=== Updating upload job statuses ===" -ForegroundColor Cyan
    $updateQuery = @"
UPDATE upload_jobs 
SET status = 'FAILED',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT uj.id 
    FROM upload_jobs uj
    LEFT JOIN photos p ON p.upload_job_id = uj.id AND p.status != 'PENDING'
    GROUP BY uj.id
    HAVING COUNT(p.id) = 0
);
"@
    docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c $updateQuery
    Write-Host "Updated upload job statuses." -ForegroundColor Green
} else {
    Write-Host "Cancelled. No photos deleted." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Cleanup complete ===" -ForegroundColor Green
Write-Host "You can now restart your backend server." -ForegroundColor Cyan

