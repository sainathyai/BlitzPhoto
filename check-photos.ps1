# PowerShell script to check photos in database via Docker

Write-Host "`n=== CHECKING PHOTOS IN DATABASE ===" -ForegroundColor Cyan

$dbEndpoint = "sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com"
$dbName = "blitzphoto"
$dbUser = "rapidphoto_admin"
$dbPassword = "RapidPhoto!Secure2025#DB"

Write-Host "`n1. Getting user ID for sainatha.yatham@gmail.com..." -ForegroundColor Yellow

$getUserIdQuery = @"
SELECT id, email, username 
FROM users 
WHERE email = 'sainatha.yatham@gmail.com';
"@

Write-Host "   Executing query..." -ForegroundColor Cyan
$userIdResult = docker run --rm postgres:15-alpine psql "postgresql://$dbUser`:$dbPassword@$dbEndpoint:5432/$dbName?sslmode=require" -t -c $getUserIdQuery 2>&1

if ($userIdResult -match "error|Error|ERROR") {
    Write-Host "   Error connecting to database: $userIdResult" -ForegroundColor Red
    Write-Host "`n   Alternative: Use AWS RDS Query Editor or pgAdmin" -ForegroundColor Yellow
    exit 1
}

Write-Host "   User info: $userIdResult" -ForegroundColor Green

Write-Host "`n2. Counting photos for this user..." -ForegroundColor Yellow

$countPhotosQuery = @"
SELECT COUNT(*) 
FROM photos p
JOIN upload_jobs uj ON p.upload_job_id = uj.id
JOIN users u ON uj.user_id = u.id
WHERE u.email = 'sainatha.yatham@gmail.com';
"@

$countResult = docker run --rm postgres:15-alpine psql "postgresql://$dbUser`:$dbPassword@$dbEndpoint:5432/$dbName?sslmode=require" -t -c $countPhotosQuery 2>&1

Write-Host "   Photo count: $countResult" -ForegroundColor $(if ($countResult -match "^\s*0\s*$") { "Red" } else { "Green" })

Write-Host "`n3. Listing photos with status..." -ForegroundColor Yellow

$listPhotosQuery = @"
SELECT 
    p.id as photo_id,
    p.file_name,
    p.status,
    p.s3_key,
    p.created_at,
    uj.id as upload_job_id
FROM photos p
JOIN upload_jobs uj ON p.upload_job_id = uj.id
JOIN users u ON uj.user_id = u.id
WHERE u.email = 'sainatha.yatham@gmail.com'
ORDER BY p.created_at DESC
LIMIT 10;
"@

$photosResult = docker run --rm postgres:15-alpine psql "postgresql://$dbUser`:$dbPassword@$dbEndpoint:5432/$dbName?sslmode=require" -c $listPhotosQuery 2>&1

Write-Host "   Photos:" -ForegroundColor Cyan
Write-Host $photosResult

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "If photos exist but aren't showing:" -ForegroundColor Yellow
Write-Host "  1. Check JWT token is valid and being sent" -ForegroundColor White
Write-Host "  2. Verify userId matches between frontend and backend" -ForegroundColor White
Write-Host "  3. Check photo status is COMPLETED (not PENDING)" -ForegroundColor White
Write-Host "  4. Verify S3 keys exist in S3 bucket" -ForegroundColor White

