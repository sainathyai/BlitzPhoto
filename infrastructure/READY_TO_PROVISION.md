# 🚀 Ready to Provision AWS Infrastructure

You have AWS CLI access! Let's get your infrastructure running.

---

## ⚡ Quick Start (5 Commands)

```bash
# 1. Verify AWS access (2 mins)
cd infrastructure
chmod +x verify-aws-access.sh
./verify-aws-access.sh

# 2. Configure Terraform (1 min)
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Set db_password

# 3. Provision infrastructure (10-15 mins)
chmod +x ../setup-aws.sh
../setup-aws.sh
```

**That's it! Infrastructure will be provisioned automatically.**

---

## 📋 Step-by-Step Guide

### Step 1: Verify Your AWS Access (IMPORTANT!)

```bash
cd infrastructure

# Make script executable
chmod +x verify-aws-access.sh

# Run verification
./verify-aws-access.sh
```

**What this checks:**
- ✅ AWS CLI installed
- ✅ Terraform installed
- ✅ AWS credentials configured
- ✅ Correct region set
- ✅ Permissions for VPC, RDS, S3, SQS, IAM, CloudWatch
- ✅ terraform.tfvars exists
- ✅ Database password changed from default

**Expected output:**
```
🔐 RapidPhotoUpload - AWS Access Verification
==============================================

✅ AWS CLI installed: aws-cli/2.x.x
✅ Terraform installed: Terraform v1.x.x
✅ AWS credentials configured
   Account ID: 123456789012
   User ARN: arn:aws:iam::123456789012:user/your-name
✅ Region set: us-east-1
✅ VPC access
✅ RDS access
✅ S3 access
✅ SQS access
✅ IAM access
✅ CloudWatch Logs access
✅ terraform.tfvars exists
✅ Database password has been changed

✅ All checks passed!

🚀 You're ready to provision infrastructure!
```

---

### Step 2: Configure Terraform Variables

```bash
cd terraform

# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

**Required changes in `terraform.tfvars`:**

```hcl
aws_region  = "us-east-1"          # Or your preferred region
environment = "dev"                 # Keep as dev
project_name = "rapidphoto"         # Or customize

# ⚠️ IMPORTANT: Change this to a strong password!
db_username = "rapidphoto_admin"
db_password = "YourStr0ng!Password123"  # CHANGE THIS!

vpc_cidr = "10.0.0.0/16"           # Keep default
enable_multi_az = false             # Keep false for dev (saves money)
```

**Password requirements:**
- At least 8 characters
- Include uppercase, lowercase, numbers, special characters
- Example: `MyS3cur3P@ssw0rd!2025`

**Generate strong password:**
```bash
# Option 1: OpenSSL
openssl rand -base64 16

# Option 2: pwgen (if installed)
pwgen -s 20 1

# Option 3: Manual
# Use: MyStr0ng!DatabaseP@ssword2025
```

---

### Step 3: Provision Infrastructure

#### Option A: Automated Setup Script (Recommended)

```bash
# From infrastructure/ directory
chmod +x setup-aws.sh
./setup-aws.sh
```

This script will:
1. Check prerequisites
2. Initialize Terraform
3. Validate configuration
4. Show you the plan
5. Ask for confirmation
6. Provision all infrastructure (~10-15 minutes)
7. Save outputs to files

#### Option B: Manual Steps

```bash
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# See what will be created
terraform plan

# Create infrastructure (type 'yes' when prompted)
terraform apply

# Save outputs
terraform output > outputs.txt
terraform output -json > outputs.json
```

---

## ⏱️ What to Expect

### Timeline
- **Terraform init**: 30 seconds
- **Terraform plan**: 10 seconds
- **Terraform apply**: 10-15 minutes
  - VPC & networking: 1-2 minutes
  - S3 buckets: 30 seconds
  - SQS queues: 30 seconds
  - IAM roles: 30 seconds
  - **RDS instance: 8-10 minutes** ⏰ (slowest part)
  - CloudWatch: 30 seconds

### Resources Created
- 1 VPC
- 4 Subnets (2 public, 2 private)
- 1 Internet Gateway
- 1 Route Table
- 2 Security Groups
- 1 RDS PostgreSQL instance
- 2 S3 buckets
- 2 SQS queues
- 3 IAM roles
- 2 CloudWatch log groups

**Total: ~28 resources**

---

## 📊 After Provisioning: Save Important Outputs

### View All Outputs

```bash
cd infrastructure/terraform
terraform output
```

### Critical Values You Need

```bash
# Database connection
terraform output rds_endpoint
terraform output connection_string

# S3 buckets
terraform output s3_uploads_bucket
terraform output s3_thumbnails_bucket

# SQS queue
terraform output sqs_upload_queue_url

# IAM
terraform output backend_iam_role_arn
```

### Save to Files

```bash
# Already saved by setup-aws.sh, but you can re-save:
terraform output > outputs.txt
terraform output -json > outputs.json

# View sensitive outputs
terraform output connection_string
```

**⚠️ Don't commit these files to Git!** (Already in .gitignore)

---

## ✅ Verify Infrastructure

### Test 1: RDS Connectivity

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Connect with psql
psql -h $RDS_ENDPOINT -U rapidphoto_admin -d rapidphoto
# Enter your password when prompted

# If connected successfully:
postgres=> \dt  # List tables (should be empty initially)
postgres=> \q   # Quit
```

**Expected result:** Successfully connected, can run SQL commands

### Test 2: S3 Access

```bash
# Get bucket name
S3_BUCKET=$(terraform output -raw s3_uploads_bucket)

# Upload test file
echo "Hello RapidPhoto!" > test.txt
aws s3 cp test.txt s3://$S3_BUCKET/test.txt

# List bucket contents
aws s3 ls s3://$S3_BUCKET/

# Download test file
aws s3 cp s3://$S3_BUCKET/test.txt test-downloaded.txt
cat test-downloaded.txt

# Clean up
aws s3 rm s3://$S3_BUCKET/test.txt
rm test.txt test-downloaded.txt
```

**Expected result:** File uploaded, listed, downloaded successfully

### Test 3: SQS Access

```bash
# Get queue URL
SQS_URL=$(terraform output -raw sqs_upload_queue_url)

# Get queue attributes
aws sqs get-queue-attributes --queue-url $SQS_URL

# Send test message
aws sqs send-message \
  --queue-url $SQS_URL \
  --message-body "Test message from RapidPhotoUpload"

# Receive message
aws sqs receive-message --queue-url $SQS_URL

# Expected: Your test message appears
```

**Expected result:** Message sent and received successfully

---

## 🎯 Next Steps: Configure Backend

### Create Backend .env File

```bash
cd ../../backend
cp .env.template .env
nano .env
```

### Fill in Values from Terraform Outputs

```bash
# In another terminal, get outputs:
cd infrastructure/terraform

echo "DB_HOST=$(terraform output -raw rds_endpoint | cut -d: -f1)"
echo "S3_UPLOADS_BUCKET=$(terraform output -raw s3_uploads_bucket)"
echo "S3_THUMBNAILS_BUCKET=$(terraform output -raw s3_thumbnails_bucket)"
echo "SQS_UPLOAD_QUEUE_URL=$(terraform output -raw sqs_upload_queue_url)"
```

**Copy these values into backend/.env:**

```properties
# Database (from Terraform outputs)
DB_HOST=rapidphoto-db-dev.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=rapidphoto
DB_USERNAME=rapidphoto_admin
DB_PASSWORD=YourStr0ng!Password123  # Same as terraform.tfvars

# S3 Buckets
S3_UPLOADS_BUCKET=rapidphoto-uploads-dev-123456789012
S3_THUMBNAILS_BUCKET=rapidphoto-thumbnails-dev-123456789012

# SQS
SQS_UPLOAD_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/rapidphoto-upload-queue-dev

# JWT (generate new secret)
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=your-admin-password

# AWS (already configured via AWS CLI)
AWS_REGION=us-east-1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🚀 Run Backend Application

```bash
cd backend

# Build
./mvnw clean install

# Run
./mvnw spring-boot:run
```

**Expected output:**
```
Started RapidPhotoApplication in 8.5 seconds
```

### Verify Backend

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Expected:
{
  "status": "UP",
  "timestamp": "2025-11-08T10:00:00Z",
  "service": "RapidPhotoUpload Backend",
  "version": "1.0.0"
}

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 💰 Cost Management

### Monitor Costs

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost

# View by service
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Set Up Billing Alerts

1. Go to: https://console.aws.amazon.com/billing/home#/budgets
2. Click "Create budget"
3. Choose "Cost budget"
4. Set threshold: $30/month
5. Add email notification

### Destroy Infrastructure (When Done)

```bash
cd infrastructure/terraform

# See what will be destroyed
terraform plan -destroy

# Destroy everything (type 'yes' to confirm)
terraform destroy
```

**⚠️ This will delete all data! Make backups first.**

---

## 🐛 Troubleshooting

### Issue: verify-aws-access.sh fails

**Check AWS credentials:**
```bash
aws sts get-caller-identity

# If fails, reconfigure:
aws configure
```

### Issue: Terraform apply fails with "BucketAlreadyExists"

**Solution:** S3 bucket names are globally unique. Change `project_name`:
```hcl
# In terraform.tfvars
project_name = "rapidphoto-yourname"  # Add suffix
```

### Issue: Cannot connect to RDS

**Solution:** Add your IP to security group:
1. Get your IP: `curl ifconfig.me`
2. AWS Console → EC2 → Security Groups → rapidphoto-rds-sg-dev
3. Edit inbound rules → Add rule
4. Type: PostgreSQL (5432), Source: My IP

### Issue: Insufficient permissions

**Solution:** Your IAM user needs these policies:
- `AdministratorAccess` (recommended for dev)
- Or individual policies for EC2, RDS, S3, SQS, IAM, CloudWatch

Check policies:
```bash
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

---

## ✅ Success Checklist

Before moving to PR 1.3, verify:

- [ ] `verify-aws-access.sh` passes all checks
- [ ] `terraform.tfvars` configured with strong password
- [ ] `terraform apply` completed successfully
- [ ] All outputs saved to files
- [ ] Can connect to RDS with psql
- [ ] Can upload/download from S3
- [ ] Can send/receive SQS messages
- [ ] Backend `.env` configured with Terraform outputs
- [ ] Backend application starts successfully
- [ ] Health check returns "UP"
- [ ] Swagger UI accessible

---

## 🎉 Summary

**What You've Accomplished:**
✅ AWS credentials configured
✅ Infrastructure provisioned (~28 resources)
✅ Database accessible
✅ S3 buckets ready
✅ SQS queues operational
✅ Backend configured and running

**What's Next:**
➡️ **PR 1.3: Database Schema & Migrations**
- Create database tables
- Add Flyway migrations
- Create JPA entities
- Set up repositories

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `./verify-aws-access.sh` | Check AWS access |
| `terraform init` | Initialize Terraform |
| `terraform plan` | Preview changes |
| `terraform apply` | Create infrastructure |
| `terraform output` | View outputs |
| `terraform destroy` | Delete infrastructure |
| `psql -h <endpoint> -U rapidphoto_admin -d rapidphoto` | Connect to DB |
| `aws s3 ls s3://<bucket>` | List S3 files |

---

**You're all set! Infrastructure is ready! 🚀**

**Ready to proceed with database schema?** Let me know!

