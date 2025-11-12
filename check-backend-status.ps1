# BlitzPhoto Backend Status Checker

Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BlitzPhoto Backend Status Monitor" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Java process is running
Write-Host "[1/3] Checking Java process..." -ForegroundColor Yellow
$javaProcs = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcs) {
    Write-Host "  ✅ Java is running (PID: $($javaProcs[0].Id))" -ForegroundColor Green
    $memoryMB = [math]::Round($javaProcs[0].WorkingSet64 / 1MB, 2)
    Write-Host "  Memory: $memoryMB MB" -ForegroundColor Gray
} else {
    Write-Host "  ⏳ Java not running yet (Maven downloading dependencies...)" -ForegroundColor Yellow
}

# Check if port 8080 is listening
Write-Host "`n[2/3] Checking port 8080..." -ForegroundColor Yellow
$port8080 = netstat -ano | Select-String ":8080.*LISTENING"
if ($port8080) {
    Write-Host "  ✅ Port 8080 is LISTENING" -ForegroundColor Green
} else {
    Write-Host "  ⏳ Port 8080 not listening yet" -ForegroundColor Yellow
}

# Check health endpoint
Write-Host "`n[3/3] Checking API health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    
    Write-Host "  ✅ Backend is UP and RUNNING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          🎉 BACKEND SUCCESSFULLY STARTED!     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access Points:" -ForegroundColor Cyan
    Write-Host "  • API Base:    http://localhost:8080/api/v1" -ForegroundColor White
    Write-Host "  • Swagger UI:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host "  • Health:      http://localhost:8080/actuator/health" -ForegroundColor White
    Write-Host "  • API Docs:    http://localhost:8080/api-docs" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Port Configuration:" -ForegroundColor Yellow
    Write-Host "  ✅ Backend:   8080 (Running)" -ForegroundColor Green
    Write-Host "  ⏸️  Frontend:  5173 (Not started - use: cd web && npm run dev)" -ForegroundColor Gray
    Write-Host "  ⏸️  Mobile:    19000 (Not started - use: cd mobile && npx expo start)" -ForegroundColor Gray
    Write-Host "  ❌ Avoided:   3000, 8000" -ForegroundColor Red
    Write-Host ""
    
} catch {
    Write-Host "  ⏳ API not ready yet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Status: Application is starting..." -ForegroundColor Yellow
    Write-Host "This usually takes 1-2 minutes on first run." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run this script again in 30 seconds to check status." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Gray





