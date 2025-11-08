#!/bin/bash

# RapidPhotoUpload - AWS Infrastructure Setup Script
# This script helps you provision AWS infrastructure using Terraform

set -e

echo "🚀 RapidPhotoUpload - AWS Infrastructure Setup"
echo "=============================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Install it first: https://aws.amazon.com/cli/"
    exit 1
fi
echo "✅ AWS CLI installed"

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform not installed. Install it first: https://www.terraform.io/downloads"
    exit 1
fi
echo "✅ Terraform installed"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials configured"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "   AWS Account ID: $ACCOUNT_ID"

echo ""
echo "📂 Setting up Terraform..."
cd infrastructure/terraform

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  terraform.tfvars not found. Creating from example..."
    cp terraform.tfvars.example terraform.tfvars
    echo ""
    echo "⚠️  IMPORTANT: Edit terraform.tfvars and set a strong db_password!"
    echo "   File location: infrastructure/terraform/terraform.tfvars"
    echo ""
    read -p "Press Enter after you've edited terraform.tfvars..."
fi

# Initialize Terraform
echo ""
echo "🔧 Initializing Terraform..."
terraform init

# Validate configuration
echo ""
echo "✓ Validating Terraform configuration..."
terraform validate

# Show plan
echo ""
echo "📋 Terraform Plan (what will be created):"
echo "=========================================="
terraform plan

# Confirm
echo ""
echo "⚠️  This will create AWS resources that may incur costs (~$20-25/month for dev)."
echo ""
read -p "Do you want to proceed with infrastructure creation? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted. No resources were created."
    exit 0
fi

# Apply
echo ""
echo "🚀 Creating AWS infrastructure..."
echo "   This will take ~10-15 minutes ⏰"
echo ""
terraform apply -auto-approve

# Save outputs
echo ""
echo "💾 Saving outputs..."
terraform output > outputs.txt
terraform output -json > outputs.json
echo "   Saved to: infrastructure/terraform/outputs.txt"

# Display important outputs
echo ""
echo "✅ Infrastructure created successfully!"
echo "======================================"
echo ""
echo "📝 Important Information:"
echo ""
echo "RDS Endpoint:"
terraform output -raw rds_endpoint
echo ""
echo ""
echo "Database Name:"
terraform output -raw rds_database_name
echo ""
echo ""
echo "S3 Uploads Bucket:"
terraform output -raw s3_uploads_bucket
echo ""
echo ""
echo "S3 Thumbnails Bucket:"
terraform output -raw s3_thumbnails_bucket
echo ""
echo ""
echo "SQS Queue URL:"
terraform output -raw sqs_upload_queue_url
echo ""
echo ""
echo "Connection String (sensitive):"
terraform output connection_string
echo ""
echo ""
echo "📋 All outputs saved to: infrastructure/terraform/outputs.txt"
echo ""
echo "🎉 Next Steps:"
echo "1. Test database connectivity: psql -h <rds_endpoint> -U rapidphoto_admin -d rapidphoto"
echo "2. Create .env file for backend with these values"
echo "3. Start working on PR 1.2: Backend Project Scaffold"
echo ""
echo "🚀 Ready to build! Let's go!"

