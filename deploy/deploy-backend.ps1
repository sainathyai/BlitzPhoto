# PowerShell script to deploy BlitzPhoto Backend to ECS

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-west-2" }
$PROJECT_NAME = if ($env:PROJECT_NAME) { $env:PROJECT_NAME } else { "sainathyai" }
$ENVIRONMENT = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "dev" }

$REPO_NAME = "${PROJECT_NAME}-backend-${ENVIRONMENT}"
$CLUSTER_NAME = "${PROJECT_NAME}-cluster-${ENVIRONMENT}"
$SERVICE_NAME = "${PROJECT_NAME}-backend-${ENVIRONMENT}"
$TASK_FAMILY = "${PROJECT_NAME}-backend-${ENVIRONMENT}"

Write-Host "Deploying backend to ECS" -ForegroundColor Green
Write-Host "Repository: $REPO_NAME"
Write-Host "Cluster: $CLUSTER_NAME"
Write-Host "Service: $SERVICE_NAME"
Write-Host ""

# Get ECR repository URI
try {
    $REPO_URI = aws ecr describe-repositories --repository-names $REPO_NAME --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text
    if (-not $REPO_URI) {
        Write-Host "Error: ECR repository $REPO_NAME not found" -ForegroundColor Red
        Write-Host "Run setup-ecr.ps1 first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error: ECR repository $REPO_NAME not found" -ForegroundColor Red
    Write-Host "Run setup-ecr.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
$BackendPath = Join-Path $PSScriptRoot "..\backend"
Set-Location $BackendPath

# Login to ECR
Write-Host "Logging in to ECR..." -ForegroundColor Yellow
$loginCommand = aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URI
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to login to ECR" -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t "${REPO_NAME}:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

# Tag image
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker tag "${REPO_NAME}:latest" "${REPO_URI}:latest"
docker tag "${REPO_NAME}:latest" "${REPO_URI}:${timestamp}"

# Push to ECR
Write-Host "Pushing image to ECR..." -ForegroundColor Yellow
docker push "${REPO_URI}:latest"
docker push "${REPO_URI}:${timestamp}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed" -ForegroundColor Red
    exit 1
}

# Get current task definition
Write-Host "Updating ECS task definition..." -ForegroundColor Yellow
$taskDefJson = aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $AWS_REGION --output json | ConvertFrom-Json

# Update image in task definition
$taskDefJson.taskDefinition.containerDefinitions[0].image = "${REPO_URI}:latest"

# Remove fields that can't be in register-task-definition
$taskDef = $taskDefJson.taskDefinition
$taskDef.PSObject.Properties.Remove('taskDefinitionArn')
$taskDef.PSObject.Properties.Remove('revision')
$taskDef.PSObject.Properties.Remove('status')
$taskDef.PSObject.Properties.Remove('requiresAttributes')
$taskDef.PSObject.Properties.Remove('compatibilities')
$taskDef.PSObject.Properties.Remove('registeredAt')
$taskDef.PSObject.Properties.Remove('registeredBy')

# Convert to JSON and register
$taskDefJsonString = $taskDef | ConvertTo-Json -Depth 10
$tempFile = New-TemporaryFile
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($tempFile.FullName, $taskDefJsonString, $utf8NoBom)
try {
    $newTaskDefArn = aws ecs register-task-definition `
        --region $AWS_REGION `
        --cli-input-json file://$($tempFile.FullName) `
        --query 'taskDefinition.taskDefinitionArn' `
        --output text
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host "New task definition registered: $newTaskDefArn" -ForegroundColor Green

# Update ECS service
Write-Host "Updating ECS service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $CLUSTER_NAME `
    --service $SERVICE_NAME `
    --task-definition $newTaskDefArn `
    --region $AWS_REGION `
    --force-new-deployment | Out-Null

Write-Host "Service update initiated" -ForegroundColor Green
Write-Host "Waiting for service to stabilize..." -ForegroundColor Yellow

# Wait for service to stabilize (with timeout)
$timeout = 600 # 10 minutes
$elapsed = 0
$interval = 10

do {
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    $service = aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0]' | ConvertFrom-Json
    
    if ($service.runningCount -eq $service.desiredCount -and $service.deployments.Count -eq 1) {
        Write-Host "Service is stable!" -ForegroundColor Green
        break
    }
    
    Write-Host "Waiting... (${elapsed}s)" -ForegroundColor Yellow
} while ($elapsed -lt $timeout)

if ($elapsed -ge $timeout) {
    Write-Host "Warning: Service stabilization timeout" -ForegroundColor Yellow
}

Write-Host "Deployment complete!" -ForegroundColor Green

# Get ALB DNS name
$albDns = aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, '${PROJECT_NAME}-alb-${ENVIRONMENT}')].DNSName" --output text

if ($albDns) {
    Write-Host "Backend URL: http://$albDns" -ForegroundColor Green
}

