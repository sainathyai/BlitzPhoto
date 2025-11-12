# 🧪 Local Testing Guide

This guide will help you set up and test BlitzPhoto in your local environment.

## Prerequisites

- **Java 21** (or higher)
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **PostgreSQL 17.6** (or use Docker Compose)

## Quick Start

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d postgres

# Verify PostgreSQL is running
docker ps
```

### 2. Set Up Backend

```bash
cd backend

# Copy environment file (if not exists)
cp .env.example .env

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Set Up Web Frontend

```bash
# Open a new terminal
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will start on `http://localhost:5173`

### 4. Verify Everything is Running

```bash
# Test backend health endpoint
curl http://localhost:8080/api/v1/health

# Test Swagger UI
# Open browser: http://localhost:8080/swagger-ui.html
```

## Detailed Setup

### Database Setup

#### Option 1: Docker Compose (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Stop PostgreSQL
docker-compose down
```

#### Option 2: Local PostgreSQL Installation

1. Install PostgreSQL 17.6
2. Create database:
```sql
CREATE DATABASE blitzphoto;
CREATE USER rapidphoto WITH PASSWORD 'rapidphoto123';
GRANT ALL PRIVILEGES ON DATABASE blitzphoto TO rapidphoto;
```

### Backend Configuration

1. **Environment Variables**

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blitzphoto
DB_USERNAME=rapidphoto
DB_PASSWORD=rapidphoto123
JWT_SECRET=your-secret-key-change-me-in-production-at-least-256-bits
```

2. **Build and Run**

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

3. **Verify Backend**

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Expected response:
# {
#   "status": "UP",
#   "timestamp": "2025-11-09T...",
#   "service": "BlitzPhoto Backend",
#   "version": "1.0.0"
# }
```

### Web Frontend Configuration

1. **Environment Variables**

Edit `web/.env`:
```env
VITE_API_URL=http://localhost:8080/api/v1
```

2. **Install and Run**

```bash
cd web
npm install
npm run dev
```

3. **Verify Web App**

Open browser: `http://localhost:5173`

### Mobile App (Optional)

```bash
cd mobile
npm install
npm start
```

## Testing Workflow

### 1. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test Upload (Without AWS)

**Note:** For local testing without AWS, you may need to:
- Use LocalStack for S3/SQS mocking
- Or modify the code to skip S3 operations for testing

### 3. Test Search

```bash
# Search photos (requires authentication token)
curl -X GET "http://localhost:8080/api/v1/search/photos?fileName=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Analytics

```bash
# Get user statistics (requires authentication token)
curl -X GET http://localhost:8080/api/v1/analytics/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## LocalStack Setup (For AWS Services)

If you want to test AWS services locally:

```bash
# Install LocalStack
pip install localstack

# Start LocalStack
localstack start

# Create S3 buckets
aws --endpoint-url=http://localhost:4566 s3 mb s3://blitzphoto-uploads-local
aws --endpoint-url=http://localhost:4566 s3 mb s3://blitzphoto-thumbnails-local

# Create SQS queue
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name upload-queue
```

Update `backend/.env`:
```env
AWS_REGION=us-west-2
S3_UPLOADS_BUCKET=blitzphoto-uploads-local
S3_THUMBNAILS_BUCKET=blitzphoto-thumbnails-local
SQS_UPLOAD_QUEUE_URL=http://localhost:4566/000000000000/upload-queue
```

## Troubleshooting

### Issue: Cannot connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue: Port 8080 already in use

**Solution:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                  # Mac/Linux

# Kill the process or change port in application.yml
```

### Issue: Database migrations fail

**Solution:**
```bash
# Check database connection
psql -h localhost -U rapidphoto -d blitzphoto

# Manually run migrations
cd backend
./mvnw flyway:migrate
```

### Issue: Frontend cannot connect to backend

**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/v1/health`
2. Check CORS configuration in `backend/src/main/resources/application.yml`
3. Verify `VITE_API_URL` in `web/.env`

### Issue: AWS credentials not found

**Solution:**
For local testing without AWS:
- Use LocalStack (see above)
- Or modify code to skip AWS operations
- Or set dummy AWS credentials in `.env`

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run with coverage
./mvnw clean test jacoco:report
```

### Frontend Tests

```bash
cd web

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Next Steps

1. ✅ Database is running
2. ✅ Backend is running
3. ✅ Web frontend is running
4. ✅ Test authentication
5. ✅ Test upload (with LocalStack or AWS)
6. ✅ Test search and analytics

---

**Happy Testing! 🚀**

