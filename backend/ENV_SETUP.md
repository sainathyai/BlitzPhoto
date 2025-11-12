# Environment Configuration Guide

## Quick Setup

1. **Copy the template:**
   ```bash
   cp .env.template .env
   ```

2. **Edit .env with your values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

## Required Environment Variables

### Database Configuration

Get these from Terraform outputs:

```bash
cd infrastructure/terraform
terraform output rds_endpoint
terraform output rds_database_name
```

Then set in `.env`:

```properties
DB_HOST=your-rds-endpoint-here.rds.amazonaws.com
DB_PORT=5432
DB_NAME=rapidphoto
DB_USERNAME=rapidphoto_admin
DB_PASSWORD=your-database-password-here
```

### AWS Configuration

```properties
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key  # Or use IAM role
AWS_SECRET_ACCESS_KEY=your-secret-key  # Or use IAM role
```

**Best Practice:** Use IAM roles when running on EC2/ECS instead of hardcoding credentials.

### S3 Buckets

Get from Terraform:

```bash
terraform output s3_uploads_bucket
terraform output s3_thumbnails_bucket
```

Set in `.env`:

```properties
S3_UPLOADS_BUCKET=rapidphoto-uploads-dev-123456789012
S3_THUMBNAILS_BUCKET=rapidphoto-thumbnails-dev-123456789012
```

### SQS Queue

Get from Terraform:

```bash
terraform output sqs_upload_queue_url
```

Set in `.env`:

```properties
SQS_UPLOAD_QUEUE_URL=https://sqs.us-west-2.amazonaws.com/123456789012/rapidphoto-upload-queue-dev
```

### JWT Security

Generate a strong secret (at least 32 characters):

```bash
# Generate random secret
openssl rand -base64 32
```

Set in `.env`:

```properties
JWT_SECRET=your-generated-secret-here-at-least-32-characters
ADMIN_PASSWORD=your-admin-password-here
```

### CORS Origins

For development:

```properties
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

For production:

```properties
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Complete .env Example

Create a file named `.env` in the `backend/` directory with this content:

```properties
# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Server
SERVER_PORT=8080

# Database
DB_HOST=rapidphoto-db-dev.abcdefg.us-west-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=rapidphoto
DB_USERNAME=rapidphoto_admin
DB_PASSWORD=MyStr0ng!Password123

# AWS
AWS_REGION=us-west-2
# AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx  # Optional: Use IAM role instead
# AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxx  # Optional: Use IAM role instead

# S3
S3_UPLOADS_BUCKET=rapidphoto-uploads-dev-123456789012
S3_THUMBNAILS_BUCKET=rapidphoto-thumbnails-dev-123456789012

# SQS
SQS_UPLOAD_QUEUE_URL=https://sqs.us-west-2.amazonaws.com/123456789012/rapidphoto-upload-queue-dev

# JWT
JWT_SECRET=bXlTdXBlclNlY3JldEtleUZvckpXVFRva2VuQXRMZWFzdDMyQ2hhcnM=
ADMIN_PASSWORD=admin-password-change-me

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Verification

Test your configuration:

```bash
# Test database connection
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME
# Enter password when prompted

# Test AWS credentials
aws s3 ls s3://$S3_UPLOADS_BUCKET

# Test SQS
aws sqs get-queue-attributes --queue-url $SQS_UPLOAD_QUEUE_URL

# Run the application
./mvnw spring-boot:run
```

## Loading Environment Variables

### Option 1: Export to shell (Temporary)

```bash
export $(cat .env | xargs)
./mvnw spring-boot:run
```

### Option 2: IntelliJ IDEA

1. Run → Edit Configurations
2. Select your Spring Boot configuration
3. Environment Variables → Load from file
4. Select `.env`

### Option 3: VS Code

Install "DotENV" extension, then `.env` will be automatically loaded.

### Option 4: Docker

```bash
docker run --env-file .env -p 8080:8080 rapidphoto-backend
```

## Security Notes

⚠️ **NEVER commit .env to Git!**

The `.gitignore` is already configured to exclude:
- `.env`
- `.env.*`

But keep:
- `.env.template` (safe, no real values)
- `ENV_SETUP.md` (this file)

## Different Environments

### Development (.env)

```properties
SPRING_PROFILES_ACTIVE=dev
DB_HOST=localhost  # Or RDS endpoint
CORS_ALLOWED_ORIGINS=*  # Allow all in dev
```

### Testing (.env.test)

```properties
SPRING_PROFILES_ACTIVE=test
DB_HOST=localhost
# Tests use Testcontainers, so DB config is optional
```

### Production (.env.prod)

```properties
SPRING_PROFILES_ACTIVE=prod
DB_HOST=your-production-rds-endpoint
CORS_ALLOWED_ORIGINS=https://yourproductiondomain.com  # Strict!
# Use AWS Secrets Manager for sensitive values
```

## Troubleshooting

### Issue: Application can't find .env

**Solution:** Make sure .env is in the `backend/` directory, not the project root.

```
✅ Correct:   backend/.env
❌ Wrong:     .env (project root)
```

### Issue: Database connection fails

**Solution:** Check these:

1. RDS security group allows your IP
2. Database password is correct
3. Database name exists
4. RDS endpoint is correct

```bash
# Test connection manually
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME
```

### Issue: AWS credentials not found

**Solution:**

1. Set in .env, OR
2. Use `aws configure`, OR
3. Use IAM role (recommended for EC2/ECS)

```bash
# Check current credentials
aws sts get-caller-identity
```

### Issue: JWT token validation fails

**Solution:** Ensure JWT_SECRET is at least 256 bits (32 characters):

```bash
# Generate new secret
openssl rand -base64 32
```

---

**Environment configured! Ready to run the application! 🚀**

