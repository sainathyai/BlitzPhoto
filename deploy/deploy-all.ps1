# Master deployment script for BlitzPhoto (PowerShell)

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-west-2" }
$PROJECT_NAME = if ($env:PROJECT_NAME) { $env:PROJECT_NAME } else { "sainathyai" }
$ENVIRONMENT = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "dev" }

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BlitzPhoto Deployment" -ForegroundColor Cyan
Write-Host "  Environment: $ENVIRONMENT" -ForegroundColor Cyan
Write-Host "  Region: $AWS_REGION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Setup ECR
Write-Host "Step 1: Setting up ECR repository..." -ForegroundColor Yellow
& "$SCRIPT_DIR\setup-ecr.ps1"
Write-Host ""

# Step 2: Deploy Infrastructure (if needed)
$updateInfra = Read-Host "Do you want to update Terraform infrastructure? (y/n)"
if ($updateInfra -eq "y" -or $updateInfra -eq "Y") {
    Write-Host "Step 2: Updating Terraform infrastructure..." -ForegroundColor Yellow
    $terraformDir = Join-Path $SCRIPT_DIR "..\infrastructure\terraform"
    Set-Location $terraformDir
    terraform init
    terraform plan
    $apply = Read-Host "Apply these changes? (y/n)"
    if ($apply -eq "y" -or $apply -eq "Y") {
        terraform apply
    }
    Set-Location $SCRIPT_DIR
    Write-Host ""
}

# Step 3: Deploy Backend
Write-Host "Step 3: Deploying backend to ECS..." -ForegroundColor Yellow
& "$SCRIPT_DIR\deploy-backend.ps1"
Write-Host ""

# Step 4: Deploy Frontend
Write-Host "Step 4: Deploying frontend to S3..." -ForegroundColor Yellow
& "$SCRIPT_DIR\deploy-frontend.ps1"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Get deployment URLs
try {
    $ALB_DNS = aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, '${PROJECT_NAME}-alb-${ENVIRONMENT}')].DNSName" --output text 2>$null
} catch {
    $ALB_DNS = ""
}

$S3_BUCKET = "${PROJECT_NAME}-frontend-${ENVIRONMENT}"
$S3_ENDPOINT = "http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"

Write-Host ""
Write-Host "Deployment URLs:" -ForegroundColor Green
if ($ALB_DNS) {
    Write-Host "  Backend API: http://$ALB_DNS" -ForegroundColor Cyan
}
Write-Host "  Frontend: $S3_ENDPOINT" -ForegroundColor Cyan
Write-Host ""

