#!/bin/bash
# BlitzPhoto Backend Status Checker

echo "════════════════════════════════════════════════"
echo "  BlitzPhoto Backend Status Monitor"
echo "════════════════════════════════════════════════"
echo ""

# Check if Java process is running
echo "[1/3] Checking Java process..."
if pgrep -f "spring-boot:run" > /dev/null 2>&1 || pgrep -f "mvn" > /dev/null 2>&1; then
    echo "  ✅ Maven/Java process is running"
    ps aux | grep -E "java|mvn" | grep -v grep | head -3
else
    echo "  ⏳ Maven/Java not running yet"
fi

echo ""

# Check if port 8080 is listening
echo "[2/3] Checking port 8080..."
if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN" || ss -ltn 2>/dev/null | grep -q ":8080"; then
    echo "  ✅ Port 8080 is LISTENING"
else
    echo "  ⏳ Port 8080 not listening yet"
fi

echo ""

# Check health endpoint
echo "[3/3] Checking API health..."
if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "  ✅ Backend is UP and RUNNING!"
    echo ""
    echo "╔════════════════════════════════════════════════╗"
    echo "║          🎉 BACKEND SUCCESSFULLY STARTED!     ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 Access Points:"
    echo "  • API Base:    http://localhost:8080/api/v1"
    echo "  • Swagger UI:  http://localhost:8080/swagger-ui.html"
    echo "  • Health:      http://localhost:8080/actuator/health"
    echo "  • API Docs:    http://localhost:8080/api-docs"
    echo ""
    echo "📝 Port Configuration:"
    echo "  ✅ Backend:   8080 (Running)"
    echo "  ⏸️  Frontend:  5173 (Not started - use: cd web && npm run dev)"
    echo "  ⏸️  Mobile:    19000 (Not started - use: cd mobile && npx expo start)"
    echo "  ❌ Avoided:   3000, 8000"
else
    echo "  ⏳ API not ready yet"
    echo ""
    echo "Status: Application is starting..."
    echo "This usually takes 1-2 minutes on first run."
    echo ""
    echo "Run this script again in 30 seconds to check status:"
    echo "  bash check-backend.sh"
fi

echo ""
echo "════════════════════════════════════════════════"






