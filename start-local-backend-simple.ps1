# Simple Local Backend Start (Maven - Fastest)
# This runs backend directly with Maven (no Docker build needed)

Write-Host "`n=== STARTING LOCAL BACKEND (MAVEN) ===" -ForegroundColor Cyan
Write-Host "`nThis will start backend on: http://localhost:8080`n" -ForegroundColor Yellow

Set-Location backend

# Set environment variables for local testing
$env:SPRING_PROFILES_ACTIVE = "local"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "blitzphoto"
$env:DB_USERNAME = "rapidphoto"
$env:DB_PASSWORD = "changeme"
$env:DB_SSLMODE = "disable"

# Get AWS credentials from environment or use defaults
if (-not $env:AWS_ACCESS_KEY_ID) {
    Write-Host "⚠️  AWS credentials not set. Using defaults (may need AWS CLI configured)" -ForegroundColor Yellow
}

# Use actual AWS buckets from Terraform
$env:AWS_REGION = "us-west-2"
$env:S3_UPLOADS_BUCKET = "sainathyai-uploads-dev-us-west-2-971422717446"
$env:S3_THUMBNAILS_BUCKET = "sainathyai-thumbnails-dev-us-west-2-971422717446"
$env:SQS_UPLOAD_QUEUE_URL = "https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev"
$env:JWT_SECRET = "local-testing-secret-key-change-me-in-production-at-least-256-bits-long-for-security"

Write-Host "Starting backend with Maven..." -ForegroundColor Yellow
Write-Host "Profile: local" -ForegroundColor Cyan
Write-Host "Database: localhost:5432" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop`n" -ForegroundColor Yellow

# Run with Maven
.\mvnw.cmd spring-boot:run

