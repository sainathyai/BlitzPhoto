# AWS RDS Configuration Guide

## ✅ Infrastructure Status

Your AWS infrastructure is **FULLY PROVISIONED** and ready to use!

## 📊 AWS Resources

### RDS PostgreSQL Database
- **Endpoint:** `sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com:5432`
- **Database Name:** `blitzphoto`
- **Username:** `rapidphoto`
- **Password:** `RapidPhoto!Secure2025#DB`
- **Engine:** PostgreSQL 17.6
- **Instance Class:** db.t3.micro (Free Tier)
- **Storage:** 20GB (autoscaling up to 100GB)
- **Publicly Accessible:** Yes (for development)
- **Multi-AZ:** Disabled (dev environment)

### S3 Buckets
- **Uploads:** `sainathyai-uploads-dev-971422717446`
- **Thumbnails:** `sainathyai-thumbnails-dev-971422717446`

### SQS Queues
- **Upload Queue:** `https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev`
- **Dead Letter Queue:** `https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-dlq-dev`

### IAM Resources
- **Backend IAM Role:** `arn:aws:iam::971422717446:role/sainathyai-backend-role-dev`
- **Instance Profile:** `sainathyai-backend-instance-profile-dev`

### VPC & Networking
- **VPC ID:** `vpc-024b70e550cf81f27`
- **Public Subnets:** `subnet-02be9a3035264dcce`, `subnet-0a69f7863a8fdaedf`
- **Private Subnets:** `subnet-0d6c7cc6882b9f1c4`, `subnet-0de2e5664d50c70f8`
- **Security Group:** `sg-07dca6c4d7356cc54`

## 🚀 Quick Start

### 1. Environment Setup

The `.env` file has been created with your AWS RDS configuration:

```bash
cd backend
# The .env file is already configured with your RDS credentials
```

### 2. Configure AWS Credentials

**Option A: AWS CLI Profile (Recommended)**
```bash
# If you haven't configured AWS CLI yet:
aws configure

# Or use a specific profile:
export AWS_PROFILE=your-profile-name
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-west-2
```

### 3. Test Database Connection

```bash
# Using psql
psql "postgresql://rapidphoto:RapidPhoto!Secure2025#DB@sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com:5432/blitzphoto"

# Or using environment variables
export PGPASSWORD='RapidPhoto!Secure2025#DB'
psql -h sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -p 5432 -U rapidphoto -d blitzphoto
```

### 4. Run Backend Application

```bash
cd backend

# Load environment variables and run
mvn spring-boot:run

# Or with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The application will:
1. Connect to AWS RDS PostgreSQL
2. Run Flyway migrations automatically
3. Start on port 8080
4. Be ready to accept API requests

### 5. Verify Setup

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

## 🔧 Configuration Files

### Environment Variables (backend/.env)
Contains all AWS RDS and service configurations.

### Spring Profiles
- **application.yml** - Base configuration (uses environment variables)
- **application-dev.yml** - Development profile (detailed logging)
- **application-prod.yml** - Production profile (optimized settings)
- **application-test.yml** - Test profile (H2 in-memory database)
- **application-local.yml** - Local testing (optional, for LocalStack)

## 📝 Database Migrations

Flyway migrations will run automatically on startup:

```
backend/src/main/resources/db/migration/
├── V1__Create_users_table.sql
├── V2__Create_upload_jobs_table.sql
├── V3__Create_photos_table.sql
├── V4__Create_indexes_for_performance.sql
└── V5__Add_thumbnail_and_metadata.sql
```

To run migrations manually:
```bash
mvn flyway:migrate
```

To check migration status:
```bash
mvn flyway:info
```

## 🔐 Security Notes

### ⚠️ Development Environment
- RDS is **publicly accessible** for development
- Security group allows connections from your IP
- **DO NOT** use these settings in production

### ✅ Production Recommendations
1. Set `publicly_accessible = false` in `infrastructure/terraform/rds.tf`
2. Use AWS Secrets Manager for credentials
3. Enable Multi-AZ for high availability
4. Enable deletion protection
5. Configure automated backups
6. Use VPN or bastion host for database access
7. Rotate credentials regularly

## 🔍 Troubleshooting

### Cannot Connect to RDS
1. **Check Security Group Rules**
   ```bash
   aws ec2 describe-security-groups --group-ids sg-07dca6c4d7356cc54
   ```

2. **Verify RDS is Running**
   ```bash
   aws rds describe-db-instances --db-instance-identifier sainathyai-db-dev
   ```

3. **Test Network Connectivity**
   ```bash
   telnet sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com 5432
   # Or on Windows:
   Test-NetConnection -ComputerName sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -Port 5432
   ```

### Application Won't Start
1. Check environment variables are loaded
2. Verify AWS credentials are configured
3. Check application logs for connection errors
4. Ensure Flyway migrations are valid

### S3 Access Issues
1. Verify IAM role has S3 permissions
2. Check bucket names are correct
3. Ensure AWS region is set to `us-west-2`
3. Ensure AWS region is set to `us-west-2`

### SQS Connection Issues
1. Verify queue URL is correct
2. Check IAM permissions for SQS
3. Ensure AWS region matches

## 📊 Monitoring

### CloudWatch Logs
- PostgreSQL logs: `/aws/rds/instance/sainathyai-db-dev/postgresql`
- Application logs: Check CloudWatch Logs console

### RDS Performance Insights
Enable in AWS Console for detailed performance metrics.

### Enhanced Monitoring
Already enabled with 60-second granularity.

## 💰 Cost Monitoring

Current setup (dev environment):
- **RDS:** ~$15-20/month (db.t3.micro)
- **S3:** Pay per use (minimal with free tier)
- **SQS:** First 1M requests free per month
- **CloudWatch:** Basic monitoring free

**Note:** Free tier eligible for first 12 months if new AWS account.

## 🧹 Cleanup

To destroy all infrastructure when no longer needed:
```bash
cd infrastructure/terraform
terraform destroy
```

**⚠️ WARNING:** This will delete all data in RDS and S3. Ensure you have backups!

## 📚 Additional Resources

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [Spring Boot with AWS](https://spring.io/guides/gs/accessing-data-aws/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Last Updated:** November 9, 2025  
**Environment:** Development  
**Region:** us-west-2




