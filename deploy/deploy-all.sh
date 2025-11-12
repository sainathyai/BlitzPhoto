#!/bin/bash
# Master deployment script for BlitzPhoto

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
PROJECT_NAME="${PROJECT_NAME:-sainathyai}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BlitzPhoto Deployment${NC}"
echo -e "${BLUE}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}  Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Setup ECR
echo -e "${YELLOW}Step 1: Setting up ECR repository...${NC}"
bash "${SCRIPT_DIR}/setup-ecr.sh"
echo ""

# Step 2: Deploy Infrastructure (if needed)
read -p "Do you want to update Terraform infrastructure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Step 2: Updating Terraform infrastructure...${NC}"
    cd "${SCRIPT_DIR}/../infrastructure/terraform"
    terraform init
    terraform plan
    read -p "Apply these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply
    fi
    cd - > /dev/null
    echo ""
fi

# Step 3: Deploy Backend
echo -e "${YELLOW}Step 3: Deploying backend to ECS...${NC}"
bash "${SCRIPT_DIR}/deploy-backend.sh"
echo ""

# Step 4: Deploy Frontend
echo -e "${YELLOW}Step 4: Deploying frontend to S3...${NC}"
bash "${SCRIPT_DIR}/deploy-frontend.sh"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Get deployment URLs
ALB_DNS=$(aws elbv2 describe-load-balancers --region "${AWS_REGION}" --query "LoadBalancers[?contains(LoadBalancerName, '${PROJECT_NAME}-alb-${ENVIRONMENT}')].DNSName" --output text 2>/dev/null || echo "")
S3_BUCKET="${PROJECT_NAME}-frontend-${ENVIRONMENT}"
S3_ENDPOINT="http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"

echo ""
echo -e "${GREEN}Deployment URLs:${NC}"
if [ -n "$ALB_DNS" ]; then
    echo -e "  Backend API: ${BLUE}http://${ALB_DNS}${NC}"
fi
echo -e "  Frontend: ${BLUE}${S3_ENDPOINT}${NC}"
echo ""

