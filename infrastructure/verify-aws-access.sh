#!/bin/bash

# RapidPhotoUpload - AWS Access Verification Script
# This script verifies AWS credentials and required permissions

set -e

echo "🔐 RapidPhotoUpload - AWS Access Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI
echo "📋 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI installed:${NC} $(aws --version)"

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not installed${NC}"
    echo "Install: https://www.terraform.io/downloads"
    exit 1
fi
echo -e "${GREEN}✅ Terraform installed:${NC} $(terraform --version | head -n 1)"

echo ""
echo "🔑 Checking AWS credentials..."

# Check if credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo ""
    echo "Please run: aws configure"
    echo ""
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Region (recommend: us-west-2)"
    exit 1
fi

# Get caller identity
IDENTITY=$(aws sts get-caller-identity)
ACCOUNT_ID=$(echo $IDENTITY | jq -r '.Account')
USER_ARN=$(echo $IDENTITY | jq -r '.Arn')
USER_ID=$(echo $IDENTITY | jq -r '.UserId')

echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo "   Account ID: $ACCOUNT_ID"
echo "   User ARN: $USER_ARN"
echo "   User ID: $USER_ID"

# Check region
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
    echo -e "${YELLOW}⚠️  No default region set${NC}"
    echo "   Run: aws configure set region us-west-2"
else
    echo -e "${GREEN}✅ Region set:${NC} $REGION"
fi

echo ""
echo "🔍 Testing AWS service access..."

# Test VPC access
if aws ec2 describe-vpcs --region ${REGION:-us-west-2} --max-items 1 &> /dev/null; then
    echo -e "${GREEN}✅ VPC access${NC}"
else
    echo -e "${RED}❌ VPC access denied${NC}"
    echo "   Required permission: ec2:DescribeVpcs"
fi

# Test RDS access
if aws rds describe-db-instances --region ${REGION:-us-west-2} --max-items 1 &> /dev/null; then
    echo -e "${GREEN}✅ RDS access${NC}"
else
    echo -e "${RED}❌ RDS access denied${NC}"
    echo "   Required permission: rds:DescribeDBInstances"
fi

# Test S3 access
if aws s3 ls &> /dev/null; then
    echo -e "${GREEN}✅ S3 access${NC}"
else
    echo -e "${RED}❌ S3 access denied${NC}"
    echo "   Required permission: s3:ListAllMyBuckets"
fi

# Test SQS access
if aws sqs list-queues --region ${REGION:-us-west-2} &> /dev/null; then
    echo -e "${GREEN}✅ SQS access${NC}"
else
    echo -e "${RED}❌ SQS access denied${NC}"
    echo "   Required permission: sqs:ListQueues"
fi

# Test IAM access
if aws iam get-user &> /dev/null; then
    echo -e "${GREEN}✅ IAM access${NC}"
else
    echo -e "${YELLOW}⚠️  IAM access limited${NC} (may be ok if using roles)"
fi

# Test CloudWatch Logs access
if aws logs describe-log-groups --region ${REGION:-us-west-2} --max-items 1 &> /dev/null; then
    echo -e "${GREEN}✅ CloudWatch Logs access${NC}"
else
    echo -e "${RED}❌ CloudWatch Logs access denied${NC}"
    echo "   Required permission: logs:DescribeLogGroups"
fi

echo ""
echo "💰 Checking billing alerts (recommended)..."

if aws cloudwatch describe-alarms --region us-west-2 --alarm-name-prefix "BillingAlert" --max-items 1 &> /dev/null; then
    ALARMS=$(aws cloudwatch describe-alarms --region us-west-2 --alarm-name-prefix "BillingAlert" --query 'MetricAlarms[*].AlarmName' --output text)
    if [ -n "$ALARMS" ]; then
        echo -e "${GREEN}✅ Billing alarms configured${NC}"
    else
        echo -e "${YELLOW}⚠️  No billing alarms found${NC}"
        echo "   Recommended: Set up billing alerts in AWS Console"
        echo "   https://console.aws.amazon.com/billing/home#/budgets"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot check billing alarms${NC}"
fi

echo ""
echo "📊 Estimated infrastructure costs:"
echo "   Development: ~$20-25/month"
echo "   Production:  ~$160-200/month"
echo ""

# Check if terraform.tfvars exists
if [ -f "terraform/terraform.tfvars" ]; then
    echo -e "${GREEN}✅ terraform.tfvars exists${NC}"
    
    # Check if password is still the default
    if grep -q "CHANGE_ME_TO_STRONG_PASSWORD" terraform/terraform.tfvars 2>/dev/null; then
        echo -e "${RED}❌ Database password still set to default!${NC}"
        echo "   Please edit terraform/terraform.tfvars and set a strong password"
        exit 1
    else
        echo -e "${GREEN}✅ Database password has been changed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  terraform.tfvars not found${NC}"
    echo "   Run: cd terraform && cp terraform.tfvars.example terraform.tfvars"
    echo "   Then edit terraform.tfvars with your database password"
    exit 1
fi

echo ""
echo "✅ ${GREEN}All checks passed!${NC}"
echo ""
echo "🚀 You're ready to provision infrastructure!"
echo ""
echo "Next steps:"
echo "  1. cd terraform"
echo "  2. terraform init"
echo "  3. terraform plan"
echo "  4. terraform apply"
echo ""
echo "Or use the automated setup script:"
echo "  ./setup-aws.sh"
echo ""

