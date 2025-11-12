# BlitzPhoto Deployment Guide

This directory contains scripts and configurations for deploying BlitzPhoto to AWS.

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **Docker** installed and running

3. **Terraform** installed (>= 1.0)

4. **Node.js** and npm installed (for frontend build)

5. **Terraform infrastructure** already deployed
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform apply
   ```

## Quick Start

### Option 1: Deploy Everything (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy-all.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

### Option 2: Deploy Step by Step

#### 1. Setup ECR Repository

**Windows:**
```powershell
.\setup-ecr.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-ecr.sh
./setup-ecr.sh
```

#### 2. Deploy Backend

**Windows:**
```powershell
.\deploy-backend.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

#### 3. Deploy Frontend

**Windows:**
```powershell
.\deploy-frontend.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## Configuration

Set environment variables to customize deployment:

```bash
export AWS_REGION=us-west-2
export PROJECT_NAME=sainathyai
export ENVIRONMENT=dev
export CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id  # Optional
```

**PowerShell:**
```powershell
$env:AWS_REGION = "us-west-2"
$env:PROJECT_NAME = "sainathyai"
$env:ENVIRONMENT = "dev"
$env:CLOUDFRONT_DISTRIBUTION_ID = "your-distribution-id"  # Optional
```

## What Gets Deployed

### Backend (ECS Fargate)
- Spring Boot application containerized with Docker
- Deployed to ECS Fargate cluster
- Exposed via Application Load Balancer (ALB)
- Auto-scaling enabled
- Health checks configured

### Frontend (S3 + CloudFront)
- React/Vite application built as static files
- Uploaded to S3 bucket
- Served via S3 website hosting
- Optional CloudFront CDN distribution

## Deployment Process

1. **ECR Setup**: Creates ECR repository for Docker images
2. **Backend Build**: Builds Docker image from backend Dockerfile
3. **Backend Push**: Pushes image to ECR
4. **Backend Deploy**: Updates ECS task definition and service
5. **Frontend Build**: Builds React app with production API URL
6. **Frontend Upload**: Uploads static files to S3
7. **Cache Invalidation**: Invalidates CloudFront cache (if configured)

## Verification

After deployment, verify:

1. **Backend Health Check:**
   ```bash
   curl http://<ALB_DNS>/api/v1/health
   ```

2. **Frontend Access:**
   ```bash
   curl http://<S3_BUCKET>.s3-website-<REGION>.amazonaws.com
   ```

3. **ECS Service Status:**
   ```bash
   aws ecs describe-services \
     --cluster sainathyai-cluster-dev \
     --services sainathyai-backend-dev \
     --region us-west-2
   ```

## Troubleshooting

### Backend Deployment Issues

**Issue: ECR login fails**
```bash
# Manually login to ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.us-west-2.amazonaws.com
```

**Issue: ECS service not starting**
```bash
# Check ECS service events
aws ecs describe-services \
  --cluster sainathyai-cluster-dev \
  --services sainathyai-backend-dev \
  --region us-west-2 \
  --query 'services[0].events[:5]'
```

**Issue: Task definition errors**
- Check CloudWatch logs: `/ecs/sainathyai-backend-dev`
- Verify secrets in AWS Secrets Manager
- Check IAM role permissions

### Frontend Deployment Issues

**Issue: S3 bucket doesn't exist**
- Script will create it automatically
- Ensure you have S3 permissions

**Issue: Build fails**
- Check Node.js version (requires Node 18+)
- Run `npm install` in web directory
- Check for TypeScript errors

**Issue: API URL incorrect**
- Set `VITE_API_URL` environment variable before build
- Check ALB DNS name is correct

## Rollback

### Backend Rollback

1. List previous task definitions:
   ```bash
   aws ecs list-task-definitions \
     --family-prefix sainathyai-backend-dev \
     --region us-west-2
   ```

2. Update service to previous revision:
   ```bash
   aws ecs update-service \
     --cluster sainathyai-cluster-dev \
     --service sainathyai-backend-dev \
     --task-definition sainathyai-backend-dev:<PREVIOUS_REVISION> \
     --region us-west-2
   ```

### Frontend Rollback

1. List S3 object versions:
   ```bash
   aws s3api list-object-versions \
     --bucket sainathyai-frontend-dev \
     --prefix index.html
   ```

2. Restore previous version:
   ```bash
   aws s3api restore-object \
     --bucket sainathyai-frontend-dev \
     --key index.html \
     --version-id <VERSION_ID>
   ```

## Cost Optimization

- **Development**: Use minimal ECS resources (0.5 vCPU, 1GB RAM)
- **Production**: Scale based on actual load
- **S3**: Enable lifecycle policies for old objects
- **CloudFront**: Use appropriate cache TTLs
- **ECS**: Use Fargate Spot for non-critical workloads (future)

## Security Notes

- Secrets are stored in AWS Secrets Manager
- IAM roles follow least privilege principle
- Security groups restrict access appropriately
- HTTPS should be enabled in production (requires ACM certificate)
- Enable WAF for production deployments

## Next Steps

1. Set up custom domain with Route 53
2. Configure ACM certificate for HTTPS
3. Enable CloudFront distribution
4. Set up monitoring and alerts
5. Configure auto-scaling policies
6. Set up CI/CD pipeline (GitHub Actions, etc.)

