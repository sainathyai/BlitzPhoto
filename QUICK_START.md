# 🚀 Quick Start Guide

## Prerequisites Check

Run this to check what's installed:
```powershell
java -version
mvn -version
node --version
psql --version
docker --version
```

## If Prerequisites Are Missing

See `SETUP_PREREQUISITES.md` for installation instructions.

## Quick Start (Once Prerequisites Are Installed)

### 1. Start Database

**With Docker:**
```powershell
docker-compose up -d postgres
```

**Without Docker:**
Ensure PostgreSQL is running on `localhost:5432`

### 2. Start Backend

```powershell
cd backend

# Create .env file
@"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blitzphoto
DB_USERNAME=rapidphoto
DB_PASSWORD=rapidphoto123
JWT_SECRET=your-secret-key-change-me-in-production-at-least-256-bits
"@ | Out-File -FilePath .env -Encoding utf8

# Build and run
mvn clean install
mvn spring-boot:run
```

**Backend runs on:** `http://localhost:8080`

### 3. Start Web Frontend

**Open a new terminal:**
```powershell
cd web

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Web app runs on:** `http://localhost:5173`

### 4. Test the Application

1. Open browser: `http://localhost:5173`
2. Register a new user
3. Login
4. Upload photos
5. View gallery

## Verify Everything Works

### Backend Health Check
```powershell
curl http://localhost:8080/api/v1/health
```

### Swagger UI
Open: `http://localhost:8080/swagger-ui.html`

### Test Authentication
```powershell
# Register
curl -X POST http://localhost:8080/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"password123\"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file exists and has correct credentials
- Check port 8080 is not in use

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:8080/api/v1/health`
- Verify `VITE_API_URL` in `web/.env` is `http://localhost:8080/api/v1`

### Database connection error
- Check PostgreSQL is running
- Verify database `blitzphoto` exists
- Check credentials in `backend/.env`

## Next Steps

- See `LOCAL_SETUP.md` for detailed setup
- See `LOCAL_TESTING.md` for testing guide
- See `SETUP_PREREQUISITES.md` if prerequisites are missing

---

**Ready to go! 🎉**

