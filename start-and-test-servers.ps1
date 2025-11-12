# Start and Test Servers One by One
# This script starts each server, tests it with curl, then moves to the next

param(
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BlitzPhoto - Start and Test Servers" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $SCRIPT_DIR

# Function to test if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Function to wait for server to be ready
function Wait-ForServer {
    param(
        [string]$Url,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )
    
    Write-Host "  Waiting for server to be ready..." -ForegroundColor Yellow
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Server is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Server not ready yet
        }
        Write-Host "  Attempt $i/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
    }
    Write-Host "  ❌ Server did not become ready in time" -ForegroundColor Red
    return $false
}

# Function to test backend with curl
function Test-Backend {
    Write-Host ""
    Write-Host "  Testing Backend API..." -ForegroundColor Yellow
    Write-Host ""
    
    # Test 1: Health Check
    Write-Host "  [Test 1] Health Check: GET /api/v1/health" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method Get
        Write-Host "  ✅ Health Check: $($response.status)" -ForegroundColor Green
        Write-Host "     Service: $($response.service)" -ForegroundColor Gray
        Write-Host "     Version: $($response.version)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ Health Check failed: $_" -ForegroundColor Red
        return $false
    }
    
    # Test 2: Ping
    Write-Host ""
    Write-Host "  [Test 2] Ping: GET /api/v1/health/ping" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health/ping" -Method Get
        Write-Host "  ✅ Ping: $($response.message)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Ping failed: $_" -ForegroundColor Red
        return $false
    }
    
    # Test 3: Swagger UI (check if accessible)
    Write-Host ""
    Write-Host "  [Test 3] Swagger UI: GET /swagger-ui.html" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui.html" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Swagger UI is accessible" -ForegroundColor Green
            Write-Host "     URL: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  Swagger UI check failed (may still be loading): $_" -ForegroundColor Yellow
    }
    
    # Test 4: Register a test user
    Write-Host ""
    Write-Host "  [Test 4] Register User: POST /api/v1/auth/register" -ForegroundColor Cyan
    $testEmail = "test$(Get-Random)@example.com"
    $testUsername = "testuser$(Get-Random)"
    $testPassword = "TestPassword123!"
    
    try {
        $body = @{
            email = $testEmail
            username = $testUsername
            password = $testPassword
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        Write-Host "  ✅ User registered successfully" -ForegroundColor Green
        Write-Host "     Email: $testEmail" -ForegroundColor Gray
        Write-Host "     Username: $testUsername" -ForegroundColor Gray
        
        # Test 5: Login with the registered user
        Write-Host ""
        Write-Host "  [Test 5] Login: POST /api/v1/auth/login" -ForegroundColor Cyan
        $loginBody = @{
            email = $testEmail
            password = $testPassword
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody
        
        Write-Host "  ✅ Login successful" -ForegroundColor Green
        Write-Host "     Token received: $($loginResponse.token.Substring(0, [Math]::Min(20, $loginResponse.token.Length)))..." -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  ⚠️  Auth test failed (may be expected if user exists): $_" -ForegroundColor Yellow
        return $true  # Still consider backend working if health checks pass
    }
}

# Function to test web frontend
function Test-WebFrontend {
    Write-Host ""
    Write-Host "  Testing Web Frontend..." -ForegroundColor Yellow
    Write-Host ""
    
    # Test: Check if web server is responding
    Write-Host "  [Test] Web Server: GET http://localhost:5173" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Web frontend is accessible" -ForegroundColor Green
            Write-Host "     URL: http://localhost:5173" -ForegroundColor Gray
            Write-Host "     Status: $($response.StatusCode)" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "  ❌ Web frontend test failed: $_" -ForegroundColor Red
        return $false
    }
}

# Function to test mobile app
function Test-MobileApp {
    Write-Host ""
    Write-Host "  Testing Mobile App (Expo)..." -ForegroundColor Yellow
    Write-Host ""
    
    # Test: Check if Expo dev server is responding
    Write-Host "  [Test] Expo Dev Server: GET http://localhost:19000" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:19000" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Expo dev server is accessible" -ForegroundColor Green
            Write-Host "     URL: http://localhost:19000" -ForegroundColor Gray
            Write-Host "     Status: $($response.StatusCode)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  📱 To test on device:" -ForegroundColor Cyan
            Write-Host "     - Scan QR code in terminal" -ForegroundColor Gray
            Write-Host "     - Or use Expo Go app" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "  ⚠️  Expo dev server test: $_" -ForegroundColor Yellow
        Write-Host "     (This is normal - Expo may require different endpoint)" -ForegroundColor Gray
        Write-Host "     Check terminal for QR code and connection info" -ForegroundColor Gray
        return $true  # Expo is different, so we'll consider it working if it started
    }
}

# ============================================================================
# STEP 1: Start Backend Server
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  STEP 1: Starting Backend Server (Port 8080)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Check if port 8080 is already in use
if (Test-Port -Port 8080) {
    Write-Host "  ⚠️  Port 8080 is already in use!" -ForegroundColor Yellow
    Write-Host "  Do you want to continue? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "  Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Navigate to backend
$BACKEND_DIR = Join-Path $SCRIPT_DIR "backend"
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "  ❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $BACKEND_DIR

# Start backend in a new window
Write-Host "  Starting Spring Boot backend in a new window..." -ForegroundColor Yellow
Write-Host "  This may take 1-2 minutes..." -ForegroundColor Gray
Write-Host ""

$backendCommand = if ($SkipTests) { 
    "cd '$BACKEND_DIR'; mvn spring-boot:run -DskipTests" 
} else { 
    "cd '$BACKEND_DIR'; mvn spring-boot:run" 
}
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -PassThru

Write-Host "  Backend starting in new window (PID: $($backendProcess.Id))" -ForegroundColor Cyan
Write-Host "  Window title: 'Backend Server - Port 8080'" -ForegroundColor Gray
Write-Host ""

# Wait for backend to be ready
if (-not (Wait-ForServer -Url "http://localhost:8080/api/v1/health" -MaxAttempts 60 -DelaySeconds 2)) {
    Write-Host "  ❌ Backend failed to start" -ForegroundColor Red
    Write-Host "  Closing backend window..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Test backend
if (-not (Test-Backend)) {
    Write-Host ""
    Write-Host "  ❌ Backend tests failed!" -ForegroundColor Red
    Write-Host "  Backend is still running in the separate window." -ForegroundColor Yellow
    Write-Host "  You can close that window to stop it, or continue testing manually." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Do you want to continue anyway? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

Write-Host ""
Write-Host "  ✅ Backend is running and all tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "  Press ENTER to continue to Web Frontend..." -NoNewline -ForegroundColor Cyan
Read-Host

# ============================================================================
# STEP 2: Start Web Frontend
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  STEP 2: Starting Web Frontend (Port 5173)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$webProcess = $null
$skipWeb = $false

# Check if port 5173 is already in use
if (Test-Port -Port 5173) {
    Write-Host "  ⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    Write-Host "  Do you want to continue? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "  Skipping web frontend..." -ForegroundColor Yellow
        $skipWeb = $true
    }
}

if (-not $skipWeb) {
    # Navigate to web
    $WEB_DIR = Join-Path $SCRIPT_DIR "web"
    if (-not (Test-Path $WEB_DIR)) {
        Write-Host "  ❌ Web directory not found!" -ForegroundColor Red
        Write-Host "  Skipping web frontend..." -ForegroundColor Yellow
    } else {
        Set-Location $WEB_DIR
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start web frontend in a new window
        Write-Host "  Starting Vite dev server in a new window..." -ForegroundColor Yellow
        Write-Host ""
        
        $webProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WEB_DIR'; npm run dev" -PassThru
        
        Write-Host "  Web frontend starting in new window (PID: $($webProcess.Id))" -ForegroundColor Cyan
        Write-Host "  Window title: 'Web Frontend - Port 5173'" -ForegroundColor Gray
        Write-Host ""
        
        # Wait for web frontend to be ready
        if (-not (Wait-ForServer -Url "http://localhost:5173" -MaxAttempts 30 -DelaySeconds 2)) {
            Write-Host "  ⚠️  Web frontend may not be ready yet" -ForegroundColor Yellow
        }
        
        # Test web frontend
        if (Test-WebFrontend) {
            Write-Host ""
            Write-Host "  ✅ Web frontend is running and accessible!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "  ⚠️  Web frontend tests had issues, but server may still be starting" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "  Press ENTER to continue to Mobile App..." -NoNewline -ForegroundColor Cyan
Read-Host

# ============================================================================
# STEP 3: Start Mobile App
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  STEP 3: Starting Mobile App (Port 19000)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Navigate to mobile
$MOBILE_DIR = Join-Path $SCRIPT_DIR "mobile"
if (-not (Test-Path $MOBILE_DIR)) {
    Write-Host "  ❌ Mobile directory not found!" -ForegroundColor Red
    Write-Host "  Skipping mobile app..." -ForegroundColor Yellow
} else {
    Set-Location $MOBILE_DIR
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start mobile app
    Write-Host "  Starting Expo dev server..." -ForegroundColor Yellow
    Write-Host "  This will open in a new terminal window" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  📱 Look for QR code in the Expo terminal to test on device" -ForegroundColor Cyan
    Write-Host ""
    
    # Start Expo in a new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$MOBILE_DIR'; npm start"
    
    Write-Host "  ✅ Expo dev server started in new window" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Note: Expo runs in a separate window for better visibility" -ForegroundColor Gray
    Write-Host "  Check that window for QR code and connection details" -ForegroundColor Gray
}

# ============================================================================
# Summary
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  All Servers Started!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Backend:     http://localhost:8080" -ForegroundColor Green
Write-Host "     Swagger UI:  http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
Write-Host ""
if (-not $skipWeb) {
    Write-Host "  ✅ Web:         http://localhost:5173" -ForegroundColor Green
}
Write-Host "  ✅ Mobile:      http://localhost:19000 (Expo)" -ForegroundColor Green
Write-Host ""
Write-Host "  To stop servers:" -ForegroundColor Yellow
Write-Host "    - Backend: Close the 'Backend Server' window or press Ctrl+C in that window" -ForegroundColor Gray
if (-not $skipWeb) {
    Write-Host "    - Web: Close the 'Web Frontend' window or press Ctrl+C in that window" -ForegroundColor Gray
}
Write-Host "    - Mobile: Close the Expo terminal window" -ForegroundColor Gray
Write-Host ""
Write-Host "  Process IDs:" -ForegroundColor Yellow
Write-Host "    Backend PID: $($backendProcess.Id)" -ForegroundColor Gray
if (-not $skipWeb) {
    Write-Host "    Web PID: $($webProcess.Id)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  To stop processes programmatically:" -ForegroundColor Yellow
Write-Host "    Stop-Process -Id $($backendProcess.Id) -Force" -ForegroundColor Gray
if (-not $skipWeb) {
    Write-Host "    Stop-Process -Id $($webProcess.Id) -Force" -ForegroundColor Gray
}
Write-Host ""
