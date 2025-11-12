#!/bin/bash
# Deploy BlitzPhoto Frontend to S3 + CloudFront

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

S3_BUCKET="${PROJECT_NAME}-frontend-${ENVIRONMENT}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

# Get ALB DNS name from Terraform outputs or AWS
ALB_DNS=$(aws elbv2 describe-load-balancers --region "${AWS_REGION}" --query "LoadBalancers[?contains(LoadBalancerName, '${PROJECT_NAME}-alb-${ENVIRONMENT}')].DNSName" --output text 2>/dev/null || echo "")

if [ -z "$ALB_DNS" ]; then
    echo -e "${YELLOW}Warning: Could not find ALB DNS. You may need to set API_URL manually.${NC}"
    API_URL="http://localhost:8080"
else
    API_URL="http://${ALB_DNS}"
fi

echo -e "${GREEN}Deploying frontend to S3${NC}"
echo -e "S3 Bucket: ${S3_BUCKET}"
echo -e "API URL: ${API_URL}"
echo ""

# Navigate to web directory
cd "$(dirname "$0")/../web" || exit 1

# Check if bucket exists, create if not
if ! aws s3 ls "s3://${S3_BUCKET}" 2>/dev/null; then
    echo -e "${YELLOW}Creating S3 bucket: ${S3_BUCKET}${NC}"
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3 mb "s3://${S3_BUCKET}" --region "${AWS_REGION}"
    else
        aws s3 mb "s3://${S3_BUCKET}" --region "${AWS_REGION}" --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    fi
    
    # Enable static website hosting
    aws s3 website "s3://${S3_BUCKET}" \
        --index-document index.html \
        --error-document index.html \
        --region "${AWS_REGION}"
    
    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
    }
  ]
}
EOF
    aws s3api put-bucket-policy --bucket "${S3_BUCKET}" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
fi

# Build frontend with production API URL
echo -e "${YELLOW}Building frontend...${NC}"
export VITE_API_URL="${API_URL}/api/v1"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

# Upload to S3
echo -e "${YELLOW}Uploading to S3...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}" \
    --delete \
    --region "${AWS_REGION}" \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.html"

# Upload HTML files with no cache
aws s3 sync dist/ "s3://${S3_BUCKET}" \
    --delete \
    --region "${AWS_REGION}" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --exclude "*" \
    --include "*.html"

echo -e "${GREEN}Frontend deployed to S3${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}CloudFront invalidation created: ${INVALIDATION_ID}${NC}"
fi

# Get S3 website endpoint
S3_ENDPOINT="http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
echo -e "${GREEN}Frontend URL: ${S3_ENDPOINT}${NC}"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution --id "${CLOUDFRONT_DISTRIBUTION_ID}" --query 'Distribution.DomainName' --output text)
    echo -e "${GREEN}CloudFront URL: https://${CLOUDFRONT_URL}${NC}"
fi

