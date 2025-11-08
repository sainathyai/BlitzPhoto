# 🚀 QuickStart - Get Running in 15 Minutes

## Step-by-Step Commands

### 1. Provision AWS Infrastructure (10 mins)

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Set db_password
terraform init
terraform apply -auto-approve
terraform output > outputs.txt
cd ../..
```

### 2. Configure Backend (2 mins)

```bash
cd backend
cp .env.template .env
nano .env  # Paste Terraform outputs

# Quick config (replace with your values):
# DB_HOST=<from terraform output rds_endpoint>
# DB_PASSWORD=<your password>
# S3_UPLOADS_BUCKET=<from terraform output>
# SQS_UPLOAD_QUEUE_URL=<from terraform output>
# JWT_SECRET=<run: openssl rand -base64 32>
```

### 3. Run Backend (3 mins)

```bash
./mvnw clean install
./mvnw spring-boot:run
```

### 4. Verify (30 secs)

```bash
# In another terminal:
curl http://localhost:8080/api/v1/health

# Open browser:
open http://localhost:8080/swagger-ui.html
```

---

## Done! 🎉

Your backend is running with:
- ✅ AWS infrastructure (RDS, S3, SQS)
- ✅ Spring Boot application
- ✅ Health checks
- ✅ Swagger documentation

---

## Quick Commands Reference

### Backend

```bash
# Build
./mvnw clean install

# Run (dev mode)
./mvnw spring-boot:run

# Run with hot reload
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Run tests
./mvnw test

# Run with coverage
./mvnw clean test jacoco:report

# Build Docker image
docker build -t rapidphoto-backend .

# Run Docker container
docker run -p 8080:8080 --env-file .env rapidphoto-backend
```

### Database

```bash
# Connect to RDS
psql -h $(terraform output -raw rds_endpoint) -U rapidphoto_admin -d rapidphoto

# Run migrations
./mvnw flyway:migrate

# Check migration status
./mvnw flyway:info
```

### AWS

```bash
# Test S3 access
aws s3 ls s3://$(terraform output -raw s3_uploads_bucket)

# Test SQS
aws sqs get-queue-attributes --queue-url $(terraform output -raw sqs_upload_queue_url)

# Check CloudWatch logs
aws logs tail /aws/rapidphoto/backend-dev --follow
```

### Terraform

```bash
# Show current state
terraform show

# Show outputs
terraform output

# Destroy everything
terraform destroy
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
tail -f backend/logs/rapidphoto.log

# Verify database
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME

# Verify AWS credentials
aws sts get-caller-identity
```

### Tests fail

```bash
# Ensure Docker is running (for Testcontainers)
docker ps

# Run with debug
./mvnw test -X
```

### Can't connect to RDS

```bash
# Check security group allows your IP
# In AWS Console: RDS → Databases → Your DB → Security → Inbound rules
# Add rule: PostgreSQL (5432) from Your IP
```

---

## Next Steps

1. **Complete PR 1.3:** Database Schema & Migrations
2. **Complete PR 1.4:** JWT Authentication
3. **Start Phase 2:** Core Upload System

---

## Essential URLs

- **Health Check:** http://localhost:8080/api/v1/health
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Actuator:** http://localhost:8080/actuator
- **API Docs (JSON):** http://localhost:8080/api-docs

---

## Environment Variables Cheat Sheet

```bash
# Minimum required:
export DB_HOST="your-rds-endpoint"
export DB_PASSWORD="your-password"
export S3_UPLOADS_BUCKET="your-bucket"
export SQS_UPLOAD_QUEUE_URL="your-queue-url"
export JWT_SECRET="$(openssl rand -base64 32)"

# Run with env vars
export $(cat backend/.env | xargs) && ./mvnw spring-boot:run
```

---

## Git Commands

```bash
# Create PR branch
git checkout -b pr/phase1-backend-scaffold

# Add and commit
git add .
git commit -m "feat(backend): implement backend scaffold with DDD/CQRS/VSA"

# Push
git push origin pr/phase1-backend-scaffold
```

---

**That's it! You're running! 🎉**

Full documentation: See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

