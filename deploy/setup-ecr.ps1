# PowerShell script to setup ECR repositories for BlitzPhoto

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-west-2" }
$PROJECT_NAME = if ($env:PROJECT_NAME) { $env:PROJECT_NAME } else { "sainathyai" }
$ENVIRONMENT = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "dev" }

$REPO_NAME = "${PROJECT_NAME}-backend-${ENVIRONMENT}"

Write-Host "Setting up ECR repository: $REPO_NAME" -ForegroundColor Green

# Check if repository exists
try {
    $existing = aws ecr describe-repositories --repository-names $REPO_NAME --region $AWS_REGION 2>$null
    if ($existing) {
        Write-Host "Repository $REPO_NAME already exists" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Creating ECR repository: $REPO_NAME" -ForegroundColor Green
    aws ecr create-repository `
        --repository-name $REPO_NAME `
        --region $AWS_REGION `
        --image-scanning-configuration scanOnPush=true `
        --encryption-configuration encryptionType=AES256
    
    Write-Host "Repository created successfully" -ForegroundColor Green
}

# Get repository URI
$REPO_URI = aws ecr describe-repositories --repository-names $REPO_NAME --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text

Write-Host "ECR Repository URI: $REPO_URI" -ForegroundColor Green
Write-Host ""
Write-Host "To login to ECR, run:" -ForegroundColor Yellow
Write-Host "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URI"

