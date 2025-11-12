#!/bin/bash
# Deploy BlitzPhoto Backend to ECS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
PROJECT_NAME="${PROJECT_NAME:-sainathyai}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

REPO_NAME="${PROJECT_NAME}-backend-${ENVIRONMENT}"
CLUSTER_NAME="${PROJECT_NAME}-cluster-${ENVIRONMENT}"
SERVICE_NAME="${PROJECT_NAME}-backend-${ENVIRONMENT}"
TASK_FAMILY="${PROJECT_NAME}-backend-${ENVIRONMENT}"

# Get ECR repository URI
REPO_URI=$(aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" --query 'repositories[0].repositoryUri' --output text)

if [ -z "$REPO_URI" ]; then
    echo -e "${RED}Error: ECR repository ${REPO_NAME} not found${NC}"
    echo -e "${YELLOW}Run setup-ecr.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}Deploying backend to ECS${NC}"
echo -e "Repository: ${REPO_URI}"
echo -e "Cluster: ${CLUSTER_NAME}"
echo -e "Service: ${SERVICE_NAME}"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REPO_URI}"

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t "${REPO_NAME}:latest" .

# Tag image
docker tag "${REPO_NAME}:latest" "${REPO_URI}:latest"
docker tag "${REPO_NAME}:latest" "${REPO_URI}:$(date +%Y%m%d-%H%M%S)"

# Push to ECR
echo -e "${YELLOW}Pushing image to ECR...${NC}"
docker push "${REPO_URI}:latest"
docker push "${REPO_URI}:$(date +%Y%m%d-%H%M%S)"

# Get current task definition
echo -e "${YELLOW}Updating ECS task definition...${NC}"
TASK_DEF=$(aws ecs describe-task-definition --task-definition "${TASK_FAMILY}" --region "${AWS_REGION}")

# Update image in task definition
NEW_TASK_DEF=$(echo "$TASK_DEF" | jq --arg IMAGE "${REPO_URI}:latest" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')

# Register new task definition
NEW_TASK_DEF_ARN=$(echo "$NEW_TASK_DEF" | aws ecs register-task-definition --region "${AWS_REGION}" --cli-input-json file:///dev/stdin --query 'taskDefinition.taskDefinitionArn' --output text)

echo -e "${GREEN}New task definition registered: ${NEW_TASK_DEF_ARN}${NC}"

# Update ECS service
echo -e "${YELLOW}Updating ECS service...${NC}"
aws ecs update-service \
    --cluster "${CLUSTER_NAME}" \
    --service "${SERVICE_NAME}" \
    --task-definition "${NEW_TASK_DEF_ARN}" \
    --region "${AWS_REGION}" \
    --force-new-deployment > /dev/null

echo -e "${GREEN}Service update initiated${NC}"
echo -e "${YELLOW}Waiting for service to stabilize...${NC}"

# Wait for service to stabilize
aws ecs wait services-stable \
    --cluster "${CLUSTER_NAME}" \
    --services "${SERVICE_NAME}" \
    --region "${AWS_REGION}"

echo -e "${GREEN}Deployment complete!${NC}"

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --region "${AWS_REGION}" --query "LoadBalancers[?contains(LoadBalancerName, '${PROJECT_NAME}-alb-${ENVIRONMENT}')].DNSName" --output text)

if [ -n "$ALB_DNS" ]; then
    echo -e "${GREEN}Backend URL: http://${ALB_DNS}${NC}"
fi

