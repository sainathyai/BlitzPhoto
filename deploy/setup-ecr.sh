#!/bin/bash
# Setup ECR repositories for BlitzPhoto

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
PROJECT_NAME="${PROJECT_NAME:-sainathyai}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

REPO_NAME="${PROJECT_NAME}-backend-${ENVIRONMENT}"

echo -e "${GREEN}Setting up ECR repository: ${REPO_NAME}${NC}"

# Check if repository exists
if aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" 2>/dev/null; then
    echo -e "${YELLOW}Repository ${REPO_NAME} already exists${NC}"
else
    echo -e "${GREEN}Creating ECR repository: ${REPO_NAME}${NC}"
    aws ecr create-repository \
        --repository-name "${REPO_NAME}" \
        --region "${AWS_REGION}" \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
    
    echo -e "${GREEN}Repository created successfully${NC}"
fi

# Get repository URI
REPO_URI=$(aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" --query 'repositories[0].repositoryUri' --output text)

echo -e "${GREEN}ECR Repository URI: ${REPO_URI}${NC}"
echo ""
echo -e "${YELLOW}To login to ECR, run:${NC}"
echo "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${REPO_URI}"

