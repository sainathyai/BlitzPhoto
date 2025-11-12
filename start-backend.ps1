# BlitzPhoto Backend Startup Script
param(
    [switch]$SkipTests = $true
)

Write-Host "+------------------------------------------------+" -ForegroundColor Cyan
Write-Host "|     BlitzPhoto Backend Startup Script          |" -ForegroundColor Cyan
Write-Host "+------------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
Write-Host "[1/5] Setting environment variables..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_HOST = "sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com"
$env:DB_PORT = "5432"
$env:DB_NAME = "blitzphoto"
$env:DB_USERNAME = "rapidphoto"
$env:DB_PASSWORD = "RapidPhoto!Secure2025#DB"
$env:AWS_REGION = "us-west-2"
$env:S3_UPLOADS_BUCKET = "sainathyai-uploads-dev-us-west-2-971422717446"
$env:S3_THUMBNAILS_BUCKET = "sainathyai-thumbnails-dev-us-west-2-971422717446"
$env:SQS_UPLOAD_QUEUE_URL = "https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev"
$env:JWT_SECRET = "dev-secret-key-blitzphoto-2025-change-in-production"
$env:SERVER_PORT = "8080"
$env:DB_SSLMODE = "require"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:5174,http://localhost:19006"
Write-Host "  [OK] Environment configured" -ForegroundColor Green

# Check AWS credentials
Write-Host "`n[2/5] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "  [OK] AWS Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] AWS credentials not found!" -ForegroundColor Red
    Write-Host "  Run 'aws configure' first" -ForegroundColor Yellow
    exit 1
}

# Check Maven
Write-Host "`n[3/5] Checking Maven..." -ForegroundColor Yellow
try {
    $mvnVersion = mvn --version 2>&1 | Select-Object -First 1
    Write-Host "  [OK] $mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Maven not found!" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host "`n[4/5] Navigating to backend directory..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "  [OK] In backend directory" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Backend directory not found at: $backendPath" -ForegroundColor Red
    exit 1
}

# Start the backend
Write-Host "`n[5/5] Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "  Port: 8080" -ForegroundColor Cyan
Write-Host "  Profile: dev" -ForegroundColor Cyan
Write-Host "  Skip Tests: $SkipTests" -ForegroundColor Cyan
Write-Host ""
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host "  This will take 1-2 minutes for first startup" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host ""

if ($SkipTests) {
    mvn spring-boot:run -DskipTests
} else {
    mvn spring-boot:run
}




