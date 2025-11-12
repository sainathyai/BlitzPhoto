# 🚀 BlitzPhoto - Port Configuration

## Active Ports

### Backend (Java Spring Boot)
- **Port:** `8080`
- **Status:** ✅ Running
- **URLs:**
  - API Base: `http://localhost:8080`
  - Swagger UI: `http://localhost:8080/swagger-ui.html`
  - Health Check: `http://localhost:8080/actuator/health`
  - API Docs: `http://localhost:8080/api-docs`

### Frontend Web (React + Vite)
- **Port:** `5173` (Vite default)
- **Alternative:** `5174` if 5173 is in use
- **Status:** Not started yet
- **URL:** `http://localhost:5173`

### Mobile App (React Native + Expo)
- **Port:** `19000` (Expo Metro bundler)
- **Status:** Not started yet
- **URL:** `exp://localhost:19000`

## Avoided Ports
As requested, these ports are NOT used:
- ❌ Port 3000 (avoided)
- ❌ Port 8000 (avoided)

## CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:5173` (Web frontend - Vite)
- `http://localhost:5174` (Web frontend - alternative)
- `http://localhost:19006` (Mobile Expo)
- Additional origins can be added via `CORS_ALLOWED_ORIGINS` environment variable

## How to Start Each Service

### 1. Backend (Already Running) ✅
```powershell
. .\setup-environment.ps1
cd backend
mvn spring-boot:run
```
**Port:** 8080

### 2. Web Frontend
```bash
cd web
npm install
npm run dev
```
**Port:** 5173 (Vite will auto-increment if in use)

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start
```
**Port:** 19000 (Metro bundler)

## Testing the Backend

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### Swagger UI (Interactive API Documentation)
Open in browser: `http://localhost:8080/swagger-ui.html`

### Test API Endpoints

**Register a new user:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Port Conflicts

### Check if a port is in use (Windows):
```powershell
netstat -ano | findstr :8080
```

### Kill a process using a port:
```powershell
# Find the PID
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Environment-Specific Ports

### Development
- Backend: 8080
- Web: 5173
- Mobile: 19000

### Production
- Backend: Typically 80/443 (behind load balancer)
- Web: Served as static files via CDN
- Mobile: Compiled to native app (no local port)

## Firewall Configuration

If you need to access from another device on your network:

**Windows Firewall:**
```powershell
# Allow port 8080 inbound
New-NetFirewallRule -DisplayName "BlitzPhoto Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

## Summary

✅ **Backend:** Port **8080** (Running)  
🔄 **Web Frontend:** Port **5173** (Not started)  
🔄 **Mobile App:** Port **19000** (Not started)  
❌ **Avoided:** Ports 3000 and 8000 as requested

---

*Last Updated: November 9, 2025*


