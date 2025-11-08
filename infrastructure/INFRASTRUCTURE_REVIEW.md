# Infrastructure Review & Completeness Check

## 📋 Infrastructure Components Review

### ✅ What's Included

#### 1. Networking (vpc.tf)
- [x] **VPC** - CIDR: 10.0.0.0/16
- [x] **Internet Gateway** - For public internet access
- [x] **Public Subnets** - 2 subnets across 2 AZs
- [x] **Private Subnets** - 2 subnets for RDS (Multi-AZ)
- [x] **Route Tables** - Public routing configured
- [x] **Security Groups** - Backend and RDS
  - Backend SG: 8080 (API), 443 (HTTPS)
  - RDS SG: 5432 (PostgreSQL) from backend + dev access

#### 2. Database (rds.tf)
- [x] **RDS PostgreSQL 15.4**
- [x] **Instance Type**: db.t3.micro (Free tier eligible)
- [x] **Storage**: 20GB initial, auto-scales to 100GB
- [x] **Backup**: Configurable retention (1-7 days)
- [x] **Multi-AZ**: Optional (disabled by default for dev)
- [x] **Monitoring**: Enhanced monitoring with IAM role
- [x] **CloudWatch Logs**: PostgreSQL and upgrade logs
- [x] **Subnet Group**: For private subnet deployment

#### 3. Storage (s3.tf)
- [x] **Uploads Bucket**
  - Versioning enabled
  - Server-side encryption (AES256)
  - Block public access
  - CORS configuration for direct uploads
  - Lifecycle policy (Glacier after 90 days, delete after 365)
- [x] **Thumbnails Bucket**
  - Server-side encryption
  - CORS configuration
  - Block public access

#### 4. Message Queue (sqs.tf)
- [x] **Upload Queue**
  - Message retention: 1 day
  - Visibility timeout: 5 minutes
  - Long polling enabled
- [x] **Dead Letter Queue**
  - Message retention: 14 days
  - Captures failed messages after 3 retries
- [x] **Queue Policy** - Backend IAM role access

#### 5. IAM & Security (iam.tf)
- [x] **Backend IAM Role**
  - S3 access (uploads and thumbnails buckets)
  - SQS access (send, receive, delete messages)
  - CloudWatch Logs access
- [x] **Instance Profile** - For EC2/ECS attachment
- [x] **RDS Monitoring Role** - Enhanced monitoring

#### 6. Monitoring (cloudwatch.tf)
- [x] **Backend Log Group** - Application logs
- [x] **Upload Processing Log Group** - Upload job logs
- [x] **Log Retention** - 7 days (dev), 30 days (prod)

#### 7. Configuration (variables.tf, outputs.tf)
- [x] **Input Variables** - All configurable
- [x] **Output Values** - All critical values exported
- [x] **Environment Support** - Dev, staging, prod

---

## ⚠️ What's Missing (Intentionally or for Later Phases)

### Not Required for Initial Setup

#### Application Deployment Infrastructure
- [ ] **ECS Cluster** - Not needed yet (Phase 5)
- [ ] **ECS Service** - Not needed yet (Phase 5)
- [ ] **ECS Task Definition** - Not needed yet (Phase 5)
- [ ] **Application Load Balancer** - Not needed yet (Phase 5)
- [ ] **Target Groups** - Not needed yet (Phase 5)
- [ ] **Auto Scaling** - Not needed yet (Phase 5)

**Why not included?** We can run the backend locally or on a simple EC2 instance for now. ECS deployment comes in Phase 5 (Optimization & Deployment).

#### Advanced Services
- [ ] **Lambda Functions** - For thumbnail generation (Phase 2 optional)
- [ ] **API Gateway** - Not needed if using ALB
- [ ] **CloudFront** - CDN for production (Phase 5)
- [ ] **Route53** - DNS (Phase 5, if custom domain)
- [ ] **ACM Certificate** - SSL cert (Phase 5, if custom domain)
- [ ] **ElastiCache Redis** - Caching (Phase 5 optimization)
- [ ] **AWS Secrets Manager** - Better than env vars (Phase 5)

**Why not included?** These are optimization and production-readiness features. For a 5-day demo, they're overkill.

---

## 🔍 Infrastructure Completeness: ✅ COMPLETE

**Verdict:** The infrastructure is **100% complete** for Phases 1-4!

### What You Can Do Now:
1. ✅ Store photos in S3
2. ✅ Access PostgreSQL database
3. ✅ Send/receive SQS messages
4. ✅ Log to CloudWatch
5. ✅ Run backend with proper IAM permissions

### What You'll Add Later:
- **Phase 5**: ECS deployment, load balancer, auto-scaling
- **Production**: CloudFront, Secrets Manager, Redis caching

---

## 📊 Cost Estimate

### Development Environment (Current Setup)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **RDS PostgreSQL** | db.t3.micro, 20GB | ~$15 |
| **S3** | 100GB storage, 1000 requests | ~$3 |
| **SQS** | 1 million requests | Free tier |
| **CloudWatch** | 5GB logs, basic metrics | ~$2 |
| **Data Transfer** | 10GB out | ~$1 |
| **VPC** | Standard networking | Free |
| **IAM** | Roles and policies | Free |
| **Total** | | **~$20-25/month** |

### Production Environment (With ECS, ALB, Multi-AZ)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **RDS PostgreSQL** | db.t3.small, Multi-AZ, 100GB | ~$60 |
| **ECS Fargate** | 2 tasks, 0.5vCPU, 1GB | ~$30 |
| **Application Load Balancer** | 1 ALB | ~$20 |
| **S3** | 500GB storage, 10k requests | ~$15 |
| **CloudFront** | 100GB transfer | ~$10 |
| **SQS** | 10 million requests | ~$4 |
| **CloudWatch** | 20GB logs, detailed metrics | ~$10 |
| **Data Transfer** | 100GB out | ~$10 |
| **Total** | | **~$160-200/month** |

---

## 🚀 Pre-Flight Checklist

Before running `terraform apply`, verify:

### AWS Account Setup
- [ ] AWS account created
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws sts get-caller-identity`
- [ ] Correct region set: `aws configure get region` (should be us-east-1)

### Terraform Setup
- [ ] Terraform installed: `terraform --version` (should be 1.0+)
- [ ] In correct directory: `cd infrastructure/terraform`
- [ ] Variables file created: `cp terraform.tfvars.example terraform.tfvars`
- [ ] Database password set in `terraform.tfvars` (strong password!)

### Permissions Check
- [ ] Can create VPC: `aws ec2 describe-vpcs`
- [ ] Can create RDS: `aws rds describe-db-instances`
- [ ] Can create S3: `aws s3 ls`
- [ ] Can create SQS: `aws sqs list-queues`

### Cost Management
- [ ] Set up billing alerts in AWS Console
- [ ] Understand estimated costs (~$20-25/month for dev)
- [ ] Know how to destroy resources: `terraform destroy`

---

## 🎯 Step-by-Step Provisioning Guide

### Step 1: Verify AWS Credentials

```bash
# Check identity
aws sts get-caller-identity

# Expected output:
{
    "UserId": "AIDAXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### Step 2: Configure Terraform Variables

```bash
cd infrastructure/terraform

# Copy template
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

**Minimum required changes in `terraform.tfvars`:**
```hcl
aws_region  = "us-east-1"
environment = "dev"
project_name = "rapidphoto"

# ⚠️ CHANGE THIS! Use a strong password
db_password = "MyStr0ng!DatabasePassword123"

# Optional: Change these if you want
db_username = "rapidphoto_admin"
vpc_cidr = "10.0.0.0/16"
enable_multi_az = false  # Keep false for dev to save costs
```

### Step 3: Initialize Terraform

```bash
terraform init
```

**Expected output:**
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.x.x...

Terraform has been successfully initialized!
```

### Step 4: Validate Configuration

```bash
terraform validate
```

**Expected output:**
```
Success! The configuration is valid.
```

### Step 5: Plan Infrastructure

```bash
terraform plan
```

**Review the plan carefully!** You should see:
- ~25-30 resources to be created
- VPC, subnets, internet gateway, route tables
- RDS instance
- 2 S3 buckets
- 2 SQS queues
- IAM roles and policies
- Security groups
- CloudWatch log groups

### Step 6: Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

**This will take ~10-15 minutes!** ⏰

RDS instance creation is the slowest part (~10 mins).

### Step 7: Save Outputs

```bash
# Save to file
terraform output > outputs.txt
terraform output -json > outputs.json

# View specific outputs
terraform output rds_endpoint
terraform output s3_uploads_bucket
terraform output sqs_upload_queue_url
```

### Step 8: Test Infrastructure

```bash
# Test RDS connectivity
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
psql -h $RDS_ENDPOINT -U rapidphoto_admin -d rapidphoto
# Enter password when prompted

# Test S3 access
S3_BUCKET=$(terraform output -raw s3_uploads_bucket)
echo "test" > test.txt
aws s3 cp test.txt s3://$S3_BUCKET/test.txt
aws s3 ls s3://$S3_BUCKET/

# Test SQS
SQS_URL=$(terraform output -raw sqs_upload_queue_url)
aws sqs get-queue-attributes --queue-url $SQS_URL
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Terraform initialization fails

**Error:** `Error installing provider`

**Solution:**
```bash
# Clear Terraform cache
rm -rf .terraform .terraform.lock.hcl

# Re-initialize
terraform init
```

### Issue 2: S3 bucket name already exists

**Error:** `BucketAlreadyExists`

**Solution:**
S3 bucket names are globally unique. Change `project_name` in `terraform.tfvars`:
```hcl
project_name = "rapidphoto-yourname"  # Add your name or random string
```

### Issue 3: Insufficient permissions

**Error:** `UnauthorizedOperation` or `AccessDenied`

**Solution:**
```bash
# Check your permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME

# You need AdministratorAccess or PowerUserAccess for initial setup
```

### Issue 4: RDS instance creation timeout

**Error:** `Error waiting for RDS Instance to be ready`

**Solution:**
This usually resolves itself. If it persists:
```bash
# Check RDS status in AWS Console
aws rds describe-db-instances --db-instance-identifier rapidphoto-db-dev

# If stuck, destroy and recreate
terraform destroy -target=aws_db_instance.postgres
terraform apply
```

### Issue 5: Cannot connect to RDS

**Error:** Connection timeout

**Solution:**
```bash
# Check security group rules
aws ec2 describe-security-groups --filters "Name=tag:Name,Values=rapidphoto-rds-sg-dev"

# RDS security group should allow:
# - Port 5432 from backend security group
# - Port 5432 from 0.0.0.0/0 (for dev access)

# If needed, manually add your IP:
# AWS Console → EC2 → Security Groups → rapidphoto-rds-sg-dev → Inbound rules → Add rule
# Type: PostgreSQL (5432), Source: My IP
```

---

## ✅ Success Indicators

You know it's working when:

1. **Terraform apply completes without errors**
   ```
   Apply complete! Resources: 28 added, 0 changed, 0 destroyed.
   ```

2. **RDS endpoint is accessible**
   ```bash
   psql -h <rds-endpoint> -U rapidphoto_admin -d rapidphoto
   # Connects successfully
   ```

3. **S3 buckets exist and are accessible**
   ```bash
   aws s3 ls  # Shows your buckets
   ```

4. **SQS queue responds**
   ```bash
   aws sqs get-queue-attributes --queue-url <queue-url>
   # Returns queue attributes
   ```

5. **All outputs display correctly**
   ```bash
   terraform output
   # Shows all resource details
   ```

---

## 🎯 Next Steps After Infrastructure Is Ready

1. **Save outputs to backend .env**
   ```bash
   cd ../../backend
   cp .env.template .env
   # Paste RDS endpoint, S3 bucket names, SQS URL from Terraform outputs
   ```

2. **Test database connection**
   ```bash
   psql -h <rds-endpoint> -U rapidphoto_admin -d rapidphoto
   ```

3. **Run backend application**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Proceed to PR 1.3: Database Schema & Migrations**

---

## 📞 Need Help?

- **Terraform issues:** See [Terraform README](terraform/README.md)
- **AWS credentials:** See [AWS_CREDENTIALS_SETUP.md](AWS_CREDENTIALS_SETUP.md)
- **Backend setup:** See [../backend/README.md](../backend/README.md)

---

## 🎉 Summary

**Infrastructure Status:** ✅ **COMPLETE AND READY**

You have everything needed for Phases 1-4:
- ✅ Networking (VPC, subnets, security groups)
- ✅ Database (RDS PostgreSQL)
- ✅ Storage (S3 buckets)
- ✅ Message Queue (SQS)
- ✅ Monitoring (CloudWatch)
- ✅ IAM (Roles and policies)

**Optional for Phase 5:**
- ECS cluster and services
- Application Load Balancer
- CloudFront CDN
- Lambda functions

**You're ready to provision! 🚀**

