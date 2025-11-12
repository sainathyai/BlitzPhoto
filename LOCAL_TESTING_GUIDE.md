# 🧪 Local Testing Guide - BlitzPhoto

## Prerequisites

Before testing locally, ensure you have:

1. **Java 21 LTS** - Installed and configured
2. **PostgreSQL 17.6** - Running locally or via Docker
3. **Maven 3.9+** - For building the backend
4. **Node.js 18+** - For frontend (optional)
5. **AWS CLI** - Configured with credentials (or use local S3 alternatives)
6. **Docker** (optional) - For running PostgreSQL and other services

---

## Step 1: Database Setup

### Option A: Local PostgreSQL

1. **Install PostgreSQL 17.6** (if not already installed)
2. **Create database:**
   ```sql
   CREATE DATABASE blitzphoto;
   CREATE USER rapidphoto WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE blitzphoto TO rapidphoto;
   ```

### Option B: Docker PostgreSQL

```bash
docker run --name blitzphoto-postgres \
  -e POSTGRES_DB=blitzphoto \
  -e POSTGRES_USER=rapidphoto \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:17.6
```

---

## Step 2: AWS Configuration

### Option A: Real AWS (Recommended for full testing)

1. **Configure AWS CLI:**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-west-2)
   ```

2. **Set environment variables:**
   ```bash
   export AWS_REGION=us-west-2
   export S3_UPLOADS_BUCKET=your-uploads-bucket
   export S3_THUMBNAILS_BUCKET=your-thumbnails-bucket
   export SQS_UPLOAD_QUEUE_URL=your-sqs-queue-url
   ```

### Option B: LocalStack (For local S3/SQS testing)

```bash
# Install LocalStack
pip install localstack

# Start LocalStack
localstack start

# Create S3 buckets
aws --endpoint-url=http://localhost:4566 s3 mb s3://blitzphoto-uploads
aws --endpoint-url=http://localhost:4566 s3 mb s3://blitzphoto-thumbnails

# Create SQS queue
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name blitzphoto-upload-queue
```

---

## Step 3: Backend Configuration

1. **Create `backend/src/main/resources/application-local.yml`:**
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/blitzphoto
       username: rapidphoto
       password: your_password
   
   blitzphoto:
     aws:
      region: ${AWS_REGION:us-west-2}
       s3:
         uploads-bucket: ${S3_UPLOADS_BUCKET:blitzphoto-uploads}
         thumbnails-bucket: ${S3_THUMBNAILS_BUCKET:blitzphoto-thumbnails}
       sqs:
         upload-queue-url: ${SQS_UPLOAD_QUEUE_URL:http://localhost:4566/000000000000/blitzphoto-upload-queue}
   
     security:
       jwt:
         secret: local-testing-secret-key-change-me-in-production-at-least-256-bits-long
   ```

2. **Set environment variables:**
   ```bash
   export SPRING_PROFILES_ACTIVE=local
   export DB_PASSWORD=your_password
   export JWT_SECRET=local-testing-secret-key-change-me-in-production-at-least-256-bits-long
   ```

---

## Step 4: Build and Run Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   Or with profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

4. **Verify the application is running:**
   - Health check: http://localhost:8080/api/v1/health
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - API Docs: http://localhost:8080/api-docs

---

## Step 5: Test API Endpoints

### 1. Register a User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

Save the `accessToken` from the response.

### 3. Initiate Upload

```bash
curl -X POST http://localhost:8080/api/v1/uploads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "photos": [
      {
        "fileName": "test-photo.jpg",
        "mimeType": "image/jpeg",
        "fileSize": 1024000
      }
    ]
  }'
```

### 4. Get Upload Status

```bash
curl -X GET http://localhost:8080/api/v1/uploads/{uploadJobId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Search Photos

```bash
curl -X GET "http://localhost:8080/api/v1/search/photos?fileName=test&page=0&size=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get Analytics

```bash
curl -X GET http://localhost:8080/api/v1/analytics/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Step 6: Test Web Frontend (Optional)

1. **Navigate to web directory:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   ```bash
   export VITE_API_URL=http://localhost:8080/api/v1
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - http://localhost:5173

---

## Step 7: Test Mobile App (Optional)

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update `app.json` with local API URL:**
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://localhost:8080/api/v1"
       }
     }
   }
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

---

## Troubleshooting

### Database Connection Issues

- **Check PostgreSQL is running:**
  ```bash
  psql -U rapidphoto -d blitzphoto -h localhost
  ```

- **Check connection string in `application.yml`**

### AWS Credentials Issues

- **Verify AWS credentials:**
  ```bash
  aws sts get-caller-identity
  ```

- **Check environment variables are set**

### Port Already in Use

- **Change port in `application.yml`:**
  ```yaml
  server:
    port: 8081
  ```

### Flyway Migration Issues

- **Check database exists and user has permissions**
- **Review migration files in `src/main/resources/db/migration/`**

---

## Quick Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/v1"

# Register
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword123"
  }')

echo $REGISTER_RESPONSE | jq .

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "Token: $TOKEN"

# Health check
echo "Health check..."
curl -s $BASE_URL/health | jq .

echo "✅ Local testing setup complete!"
```

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend running
3. ✅ API endpoints tested
4. ⬜ Web frontend tested (optional)
5. ⬜ Mobile app tested (optional)
6. ⬜ Integration tests passed

---

*Happy Testing! 🚀*

