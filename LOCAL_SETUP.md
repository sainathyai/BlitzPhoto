# 🧪 Local Testing Setup Guide

This guide will help you set up and test BlitzPhoto in your local environment.

## Prerequisites Check

Before starting, ensure you have:

- ✅ **Java 21** (or higher)
- ✅ **Maven 3.8+**
- ✅ **Node.js 18+** and npm
- ✅ **PostgreSQL 17.6** (or use Docker)
- ⚠️ **Docker** (optional, for PostgreSQL)

## Quick Setup

### Option 1: With Docker (Recommended)

If you have Docker installed:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Verify it's running
docker ps
```

### Option 2: Without Docker

If you have PostgreSQL installed locally:

1. **Create Database:**
```sql
CREATE DATABASE blitzphoto;
CREATE USER rapidphoto WITH PASSWORD 'rapidphoto123';
GRANT ALL PRIVILEGES ON DATABASE blitzphoto TO rapidphoto;
```

2. **Update `backend/.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blitzphoto
DB_USERNAME=rapidphoto
DB_PASSWORD=rapidphoto123
```

## Step-by-Step Setup

### 1. Start Database

**With Docker:**
```bash
docker-compose up -d postgres
```

**Without Docker:**
Ensure PostgreSQL is running on `localhost:5432`

### 2. Set Up Backend

```bash
cd backend

# Create .env file (if not exists)
# Copy the values from .env.example

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

**Verify:**
```bash
curl http://localhost:8080/api/v1/health
```

### 3. Set Up Web Frontend

```bash
# Open a new terminal
cd web

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env

# Start development server
npm run dev
```

**Web app will start on:** `http://localhost:5173`

### 4. Test the Application

1. **Open browser:** `http://localhost:5173`
2. **Register a new user**
3. **Login**
4. **Upload photos**
5. **View gallery**

## Testing Endpoints

### Health Check

```bash
curl http://localhost:8080/api/v1/health
```

### Register User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Swagger UI

Open browser: `http://localhost:8080/swagger-ui.html`

## Troubleshooting

### Issue: Cannot connect to database

**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Check database exists: `psql -U rapidphoto -d blitzphoto`

### Issue: Port 8080 already in use

**Solution:**
1. Find process: `netstat -ano | findstr :8080` (Windows)
2. Kill process or change port in `application.yml`

### Issue: Frontend cannot connect to backend

**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/v1/health`
2. Check CORS in `application.yml`
3. Verify `VITE_API_URL` in `web/.env`

### Issue: AWS credentials not found

**For local testing without AWS:**
- The app will work but S3 uploads won't work
- You can test authentication and other features
- For full testing, use LocalStack or AWS credentials

## Next Steps

1. ✅ Database is running
2. ✅ Backend is running
3. ✅ Web frontend is running
4. ✅ Test authentication
5. ✅ Test upload (requires AWS or LocalStack)
6. ✅ Test search and analytics

---

**Ready to test! 🚀**

