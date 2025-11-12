# AWS Credentials Setup for Terraform

## Method 1: AWS CLI (Recommended for Local Development)

### Step 1: Configure AWS CLI

```bash
aws configure
```

You'll be prompted for:
```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-west-2
Default output format [None]: json
```

### Step 2: Verify Credentials

```bash
# Check current identity
aws sts get-caller-identity

# Expected output:
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### Step 3: Test Permissions

```bash
# Test S3 access
aws s3 ls

# Test RDS access
aws rds describe-db-instances --region us-west-2

# Test VPC access
aws ec2 describe-vpcs --region us-west-2
```

---

## Method 2: Environment Variables

```bash
# Set credentials
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="us-west-2"

# Verify
aws sts get-caller-identity
```

---

## Method 3: AWS Credentials File

Terraform automatically reads from `~/.aws/credentials`:

```bash
# View credentials file
cat ~/.aws/credentials
```

Should contain:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

And `~/.aws/config`:
```ini
[default]
region = us-west-2
output = json
```

---

## Required IAM Permissions

Your AWS user/role needs these permissions:

### VPC & Networking
- `ec2:CreateVpc`
- `ec2:CreateSubnet`
- `ec2:CreateInternetGateway`
- `ec2:CreateRouteTable`
- `ec2:CreateSecurityGroup`
- `ec2:AuthorizeSecurityGroupIngress`
- `ec2:DescribeVpcs`
- `ec2:DescribeSubnets`
- `ec2:DescribeAvailabilityZones`

### RDS
- `rds:CreateDBInstance`
- `rds:CreateDBSubnetGroup`
- `rds:DescribeDBInstances`
- `rds:ModifyDBInstance`
- `rds:DeleteDBInstance`

### S3
- `s3:CreateBucket`
- `s3:PutBucketPolicy`
- `s3:PutBucketVersioning`
- `s3:PutEncryptionConfiguration`
- `s3:PutBucketCORS`
- `s3:DeleteBucket`

### SQS
- `sqs:CreateQueue`
- `sqs:SetQueueAttributes`
- `sqs:GetQueueAttributes`
- `sqs:DeleteQueue`

### IAM
- `iam:CreateRole`
- `iam:PutRolePolicy`
- `iam:CreateInstanceProfile`
- `iam:AddRoleToInstanceProfile`
- `iam:PassRole`

### CloudWatch
- `logs:CreateLogGroup`
- `logs:PutRetentionPolicy`
- `logs:DeleteLogGroup`

### Recommended: Use Admin Policy for Initial Setup

For development, use `AdministratorAccess` policy:

```bash
# Check your current permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

---

## Creating IAM User for Terraform (If Needed)

If you need to create a new IAM user:

```bash
# Create user
aws iam create-user --user-name terraform-user

# Attach admin policy (for dev)
aws iam attach-user-policy \
  --user-name terraform-user \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Create access key
aws iam create-access-key --user-name terraform-user

# Save the output! You'll need AccessKeyId and SecretAccessKey
```

---

## Security Best Practices

### 1. Never Commit Credentials

Already configured in `.gitignore`:
```
.aws/
*.tfvars
.env
```

### 2. Use MFA (Multi-Factor Authentication)

```bash
# Enable MFA for your user in AWS Console
# IAM → Users → Your User → Security credentials → MFA
```

### 3. Rotate Access Keys Regularly

```bash
# Create new key
aws iam create-access-key --user-name YOUR_USERNAME

# Delete old key
aws iam delete-access-key --user-name YOUR_USERNAME --access-key-id OLD_KEY_ID
```

### 4. Use IAM Roles (Production)

For production, use IAM roles instead of access keys:
- EC2 instance roles
- ECS task roles
- Lambda execution roles

---

## Troubleshooting

### Issue: "Unable to locate credentials"

**Solution:**
```bash
# Check if credentials exist
cat ~/.aws/credentials

# If not, run:
aws configure
```

### Issue: "Access Denied"

**Solution:**
```bash
# Check your permissions
aws iam get-user-policy --user-name YOUR_USERNAME --policy-name YOUR_POLICY

# Or check attached policies
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Issue: "Invalid credentials"

**Solution:**
```bash
# Test credentials
aws sts get-caller-identity

# If fails, reconfigure
aws configure
```

---

## Verification Checklist

Before running Terraform, verify:

- [ ] AWS CLI installed: `aws --version`
- [ ] Credentials configured: `aws sts get-caller-identity`
- [ ] Correct region: `aws configure get region`
- [ ] Sufficient permissions: Can create VPC, RDS, S3, SQS
- [ ] MFA enabled (recommended)

---

## Ready to Proceed!

Once credentials are set up, you can run:

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

Terraform will automatically use your AWS CLI credentials!

