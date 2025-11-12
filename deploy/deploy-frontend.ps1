# PowerShell script to deploy BlitzPhoto Frontend to S3 + CloudFront

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-west-2" }
$PROJECT_NAME = if ($env:PROJECT_NAME) { $env:PROJECT_NAME } else { "sainathyai" }
$ENVIRONMENT = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "dev" }

$S3_BUCKET = "${PROJECT_NAME}-frontend-${ENVIRONMENT}"
$CLOUDFRONT_DISTRIBUTION_ID = if ($env:CLOUDFRONT_DISTRIBUTION_ID) { $env:CLOUDFRONT_DISTRIBUTION_ID } else { "" }

# Use CloudFront HTTPS URL for production API (to avoid Mixed Content errors)
# The frontend is served via CloudFront, so API calls should also go through CloudFront
$API_URL = "https://blitzphoto.sainathyai.com"
Write-Host "Using CloudFront HTTPS URL for API: $API_URL" -ForegroundColor Cyan

Write-Host "Deploying frontend to S3" -ForegroundColor Green
Write-Host "S3 Bucket: $S3_BUCKET"
Write-Host "API URL: $API_URL"
Write-Host ""

# Navigate to web directory
$WebPath = Join-Path $PSScriptRoot "..\web"
Set-Location $WebPath

# Check if bucket exists, create if not
try {
    aws s3 ls "s3://$S3_BUCKET" 2>$null | Out-Null
} catch {
    Write-Host "Creating S3 bucket: $S3_BUCKET" -ForegroundColor Yellow
    if ($AWS_REGION -eq "us-east-1") {
        aws s3api create-bucket --bucket $S3_BUCKET --region $AWS_REGION
    } else {
        aws s3api create-bucket --bucket $S3_BUCKET --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION
    }
    
    # Enable static website hosting
    aws s3 website "s3://$S3_BUCKET" `
        --index-document index.html `
        --error-document index.html `
        --region $AWS_REGION
    
    # Set bucket policy for public read access
    $bucketPolicy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Sid = "PublicReadGetObject"
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "arn:aws:s3:::$S3_BUCKET/*"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $bucketPolicyFile = Join-Path $env:TEMP "bucket-policy.json"
    $bucketPolicy | Out-File -FilePath $bucketPolicyFile -Encoding utf8
    $bucketPolicyPath = $bucketPolicyFile.Replace('\', '/')
    aws s3api put-bucket-policy --bucket $S3_BUCKET --policy "file:///$bucketPolicyPath"
    Remove-Item $bucketPolicyFile
}

# Build frontend with production API URL
Write-Host "Building frontend..." -ForegroundColor Yellow
# Set the API URL environment variable for the build
# This ensures the production build always uses the production API
$env:VITE_API_URL = "$API_URL/api/v1"
Write-Host "VITE_API_URL set to: $env:VITE_API_URL" -ForegroundColor Cyan
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "Error: Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

# Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Yellow

# Upload static assets with long cache
Get-ChildItem -Path dist -Recurse -File | Where-Object { $_.Extension -ne ".html" } | ForEach-Object {
    aws s3 cp $_.FullName "s3://$S3_BUCKET/$($_.FullName.Replace((Resolve-Path dist).Path + '\', '').Replace('\', '/'))" `
        --region $AWS_REGION `
        --cache-control "public, max-age=31536000, immutable"
}

# Upload HTML files with no cache
Get-ChildItem -Path dist -Filter "*.html" -Recurse | ForEach-Object {
    aws s3 cp $_.FullName "s3://$S3_BUCKET/$($_.FullName.Replace((Resolve-Path dist).Path + '\', '').Replace('\', '/'))" `
        --region $AWS_REGION `
        --cache-control "no-cache, no-store, must-revalidate"
}

Write-Host "Frontend deployed to S3" -ForegroundColor Green

# Invalidate CloudFront cache if distribution ID is provided
if ($CLOUDFRONT_DISTRIBUTION_ID) {
    Write-Host "Invalidating CloudFront cache..." -ForegroundColor Yellow
    $invalidationId = aws cloudfront create-invalidation `
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID `
        --paths "/*" `
        --query 'Invalidation.Id' `
        --output text
    Write-Host "CloudFront invalidation created: $invalidationId" -ForegroundColor Green
}

# Get S3 website endpoint
$S3_ENDPOINT = "http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
Write-Host "Frontend URL: $S3_ENDPOINT" -ForegroundColor Green

if ($CLOUDFRONT_DISTRIBUTION_ID) {
    $cloudfrontUrl = aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text
    Write-Host "CloudFront URL: https://$cloudfrontUrl" -ForegroundColor Green
}

