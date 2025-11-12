# BlitzPhoto Backend - Environment Setup Script
# This script sets up environment variables for connecting to AWS RDS

Write-Host "================================" -ForegroundColor Cyan
Write-Host "BlitzPhoto - AWS RDS Environment Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Spring Profile
$env:SPRING_PROFILES_ACTIVE = "dev"

# AWS RDS PostgreSQL Configuration
$env:DB_HOST = "sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com"
$env:DB_PORT = "5432"
$env:DB_NAME = "blitzphoto"
$env:DB_USERNAME = "rapidphoto"
$env:DB_PASSWORD = "RapidPhoto!Secure2025#DB"

# AWS Configuration
$env:AWS_REGION = "us-west-2"

# S3 Buckets
$env:S3_UPLOADS_BUCKET = "sainathyai-uploads-dev-us-west-2-971422717446"
$env:S3_THUMBNAILS_BUCKET = "sainathyai-thumbnails-dev-us-west-2-971422717446"

# SQS Queue
$env:SQS_UPLOAD_QUEUE_URL = "https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev"

# Security
$env:JWT_SECRET = "dev-secret-key-blitzphoto-2025-change-in-production-at-least-256-bits"

# Server
$env:SERVER_PORT = "8080"

# CORS
$env:CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:5173,http://localhost:19006"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  Database Host: $env:DB_HOST" -ForegroundColor White
Write-Host "  S3 Uploads Bucket: $env:S3_UPLOADS_BUCKET" -ForegroundColor White
Write-Host "  S3 Thumbnails Bucket: $env:S3_THUMBNAILS_BUCKET" -ForegroundColor White
Write-Host "  SQS Queue: $env:SQS_UPLOAD_QUEUE_URL" -ForegroundColor White
Write-Host "  Server Port: $env:SERVER_PORT" -ForegroundColor White
Write-Host ""
Write-Host "Ready to run the backend!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd backend"
Write-Host "  2. mvn spring-boot:run"
Write-Host ""
