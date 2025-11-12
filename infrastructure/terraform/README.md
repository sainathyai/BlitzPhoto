# AWS Infrastructure with Terraform

This directory contains Terraform configuration to provision all AWS resources for RapidPhotoUpload.

## Prerequisites

1. **AWS Account** with admin access
2. **AWS CLI** installed and configured
3. **Terraform** installed (>= 1.0)

## Quick Start

### 1. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-west-2
# Enter output format: json
```

### 2. Set Up Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:
- `db_password` to a strong password
- Other variables as needed

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Preview Changes

```bash
terraform plan
```

### 5. Apply (Create Infrastructure)

```bash
terraform apply
```

Type `yes` when prompted. This will create:
- ✅ VPC with public/private subnets
- ✅ RDS PostgreSQL instance
- ✅ S3 buckets (uploads + thumbnails)
- ✅ SQS queues
- ✅ IAM roles and policies
- ✅ Security groups
- ✅ CloudWatch log groups

**This takes ~10-15 minutes** ⏰

### 6. Save Outputs

```bash
terraform output > outputs.txt
terraform output -json > outputs.json
```

Save these files - you'll need the values for backend configuration!

## Important Outputs

After `terraform apply`, note these values:

```bash
# Database connection
terraform output rds_endpoint
terraform output connection_string

# S3 buckets
terraform output s3_uploads_bucket
terraform output s3_thumbnails_bucket

# SQS queue
terraform output sqs_upload_queue_url

# IAM role
terraform output backend_iam_role_arn
```

## Connecting to RDS from Local Machine

```bash
# Get connection details
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
DB_NAME=$(terraform output -raw rds_database_name)
DB_USER=$(terraform output -raw rds_username)

# Connect with psql
psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME
# Enter password from terraform.tfvars
```

## Testing S3 Access

```bash
# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://$(terraform output -raw s3_uploads_bucket)/test.txt

# Verify upload
aws s3 ls s3://$(terraform output -raw s3_uploads_bucket)/

# Download
aws s3 cp s3://$(terraform output -raw s3_uploads_bucket)/test.txt test-downloaded.txt

# Delete test file
aws s3 rm s3://$(terraform output -raw s3_uploads_bucket)/test.txt
```

## Destroying Infrastructure

⚠️ **Warning: This deletes everything!**

```bash
terraform destroy
```

Type `yes` to confirm deletion.

## Cost Estimation

**Development (t3.micro, no Multi-AZ):**
- RDS: ~$15/month
- S3: ~$1/month (for ~100GB)
- SQS: Free tier (first million requests)
- Data transfer: ~$5/month
- **Total: ~$20-25/month**

**Production (with Multi-AZ, larger instances):**
- Could be $100-300/month depending on usage

## Troubleshooting

### Issue: "Error creating DB Instance: InvalidParameterValue"
**Solution:** DB password must be at least 8 characters

### Issue: "AccessDenied when calling AssumeRole"
**Solution:** Check AWS credentials: `aws sts get-caller-identity`

### Issue: "Bucket name already exists"
**Solution:** S3 bucket names are globally unique. Change `project_name` in variables

### Issue: Can't connect to RDS
**Solution:** 
1. Check security group allows your IP
2. Verify RDS is `publicly_accessible = true` (dev only!)
3. Check VPC/subnet configuration

## Security Notes

🔒 **For Production:**
1. Set `publicly_accessible = false` for RDS
2. Use VPN or bastion host to access RDS
3. Restrict S3 CORS to your domain only
4. Enable MFA delete for S3
5. Use AWS Secrets Manager for passwords
6. Enable deletion protection on RDS
7. Review IAM policies (principle of least privilege)

## Next Steps

After infrastructure is provisioned:
1. Note all output values
2. Create `backend/.env` with connection details
3. Test RDS connectivity
4. Test S3 upload/download
5. Move to PR 1.2: Backend Project Scaffold

---

**Infrastructure provisioned! Time to build the backend! 🚀**

