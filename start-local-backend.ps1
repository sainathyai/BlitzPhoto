# Quick Start Script for Local Backend Testing
# This starts PostgreSQL and Backend locally for fast testing

Write-Host "`n=== STARTING LOCAL BACKEND ===" -ForegroundColor Cyan
Write-Host "`nThis will start:" -ForegroundColor Yellow
Write-Host "  - PostgreSQL on port 5432" -ForegroundColor White
Write-Host "  - Backend API on http://localhost:8080" -ForegroundColor White
Write-Host "`nStarting services...`n" -ForegroundColor Yellow

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start services
docker-compose -f docker-compose.local.yml up -d

Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if backend is running
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "`n✅✅✅ BACKEND IS RUNNING! ✅✅✅" -ForegroundColor Green
        Write-Host "`nLocal Endpoints:" -ForegroundColor Cyan
        Write-Host "  Backend API: http://localhost:8080/api/v1" -ForegroundColor Green
        Write-Host "  Health Check: http://localhost:8080/api/v1/health" -ForegroundColor Green
        Write-Host "  Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Green
        Write-Host "`nTo stop services: docker-compose -f docker-compose.local.yml down" -ForegroundColor Yellow
        break
    } catch {
        Write-Host "  Attempt ${attempt}/${maxAttempts}: Waiting for backend..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "`n⚠️  Backend is taking longer than expected to start." -ForegroundColor Yellow
    Write-Host "Check logs: docker-compose -f docker-compose.local.yml logs backend" -ForegroundColor Yellow
}

