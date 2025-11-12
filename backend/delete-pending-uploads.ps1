# Quick script to delete PENDING upload photos using Docker

# Step 1: Start PostgreSQL container (if not running)
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker run -d --name postgres `
    -e POSTGRES_USER=rapidphoto `
    -e POSTGRES_PASSWORD=changeme `
    -e POSTGRES_DB=blitzphoto `
    -p 5432:5432 `
    postgres:15-alpine 2>$null

# Wait a moment for container to be ready
Start-Sleep -Seconds 3

# Step 2: Delete all PENDING photos
Write-Host "Deleting PENDING photos..." -ForegroundColor Yellow
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"

# Step 3: Show result
Write-Host "Checking remaining photos..." -ForegroundColor Yellow
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "SELECT status, COUNT(*) as count FROM photos GROUP BY status;"

Write-Host "Done!" -ForegroundColor Green

