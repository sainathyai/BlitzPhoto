# RapidPhotoUpload - AWS Infrastructure Setup Script (PowerShell)
# This script helps you provision AWS infrastructure using Terraform

Write-Host ""
Write-Host "🚀 RapidPhotoUpload - AWS Infrastructure Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not installed" -ForegroundColor Red
    Write-Host "Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check Terraform
try {
    $terraformVersion = terraform --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Terraform installed: $terraformVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Terraform not installed" -ForegroundColor Red
    Write-Host "Install from: https://www.terraform.io/downloads" -ForegroundColor Yellow
    Write-Host "Or use: choco install terraform" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✅ AWS credentials configured" -ForegroundColor Green
    Write-Host "   Account ID: $($identity.Account)" -ForegroundColor Gray
} catch {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📂 Setting up Terraform..." -ForegroundColor Yellow
Set-Location terraform

# Check if terraform.tfvars exists
if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "⚠️  terraform.tfvars not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "terraform.tfvars.example" "terraform.tfvars"
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit terraform.tfvars and set a strong db_password!" -ForegroundColor Red
    Write-Host "   File location: infrastructure\terraform\terraform.tfvars" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after you've edited terraform.tfvars"
}

# Initialize Terraform
Write-Host ""
Write-Host "🔧 Initializing Terraform..." -ForegroundColor Yellow
terraform init

# Validate configuration
Write-Host ""
Write-Host "✓ Validating Terraform configuration..." -ForegroundColor Yellow
terraform validate

# Show plan
Write-Host ""
Write-Host "📋 Terraform Plan (what will be created):" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
terraform plan

# Confirm
Write-Host ""
Write-Host "⚠️  This will create AWS resources that may incur costs (~`$20-25/month for dev)." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Do you want to proceed with infrastructure creation? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Aborted. No resources were created." -ForegroundColor Red
    exit 0
}

# Apply
Write-Host ""
Write-Host "🚀 Creating AWS infrastructure..." -ForegroundColor Green
Write-Host "   This will take ~10-15 minutes ⏰" -ForegroundColor Yellow
Write-Host ""
terraform apply -auto-approve

# Save outputs
Write-Host ""
Write-Host "💾 Saving outputs..." -ForegroundColor Yellow
terraform output | Out-File -FilePath "outputs.txt" -Encoding UTF8
terraform output -json | Out-File -FilePath "outputs.json" -Encoding UTF8
Write-Host "   Saved to: infrastructure\terraform\outputs.txt" -ForegroundColor Gray

# Display important outputs
Write-Host ""
Write-Host "✅ Infrastructure created successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Important Information:" -ForegroundColor Cyan
Write-Host ""
Write-Host "RDS Endpoint:" -ForegroundColor Yellow
terraform output -raw rds_endpoint
Write-Host ""
Write-Host ""
Write-Host "Database Name:" -ForegroundColor Yellow
terraform output -raw rds_database_name
Write-Host ""
Write-Host ""
Write-Host "S3 Uploads Bucket:" -ForegroundColor Yellow
terraform output -raw s3_uploads_bucket
Write-Host ""
Write-Host ""
Write-Host "S3 Thumbnails Bucket:" -ForegroundColor Yellow
terraform output -raw s3_thumbnails_bucket
Write-Host ""
Write-Host ""
Write-Host "SQS Queue URL:" -ForegroundColor Yellow
terraform output -raw sqs_upload_queue_url
Write-Host ""
Write-Host ""
Write-Host "📋 All outputs saved to: infrastructure\terraform\outputs.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test database connectivity:" -ForegroundColor White
Write-Host "   psql -h <rds_endpoint> -U rapidphoto_admin -d rapidphoto" -ForegroundColor Gray
Write-Host "2. Create .env file for backend with these values" -ForegroundColor White
Write-Host "3. Start working on PR 1.3: Database Schema" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to build! Let's go!" -ForegroundColor Green

