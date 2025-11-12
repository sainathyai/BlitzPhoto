# Test Servers Script
# Tests all running servers with curl/HTTP requests

param(
    [switch]$BackendOnly,
    [switch]$WebOnly,
    [switch]$MobileOnly,
    [int]$BackendPort = 8080,
    [int]$WebPort = 5173,
    [int]$MobilePort = 19000
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Colors for output
function Write-Step { param($msg) Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan; Write-Host "  $msg" -ForegroundColor Yellow; Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "  ℹ️  $msg" -ForegroundColor Cyan }

# Test backend
function Test-Backend {
    Write-Step "Testing Backend Server (Port $BackendPort)"
    
    # Test 1: Health Check
    Write-Info "Test 1: Health Check - GET http://localhost:$BackendPort/api/v1/health"
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/v1/health" -Method Get
        Write-Success "Health Check: $($response.status)"
        Write-Host "    Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } catch {
        Write-Error "Health Check failed: $_"
        return $false
    }
    
    # Test 2: Ping
    Write-Info "Test 2: Ping - GET http://localhost:$BackendPort/api/v1/health/ping"
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/v1/health/ping" -Method Get
        Write-Success "Ping: $($response.message)"
    } catch {
        Write-Error "Ping failed: $_"
        return $false
    }
    
    # Test 3: Register User
    Write-Info "Test 3: Register User - POST http://localhost:$BackendPort/api/v1/auth/register"
    try {
        $registerBody = @{
            email = "test$(Get-Random)@example.com"
            username = "testuser$(Get-Random)"
            password = "TestPassword123!"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/v1/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $registerBody
        
        Write-Success "User registered: $($registerBody | ConvertFrom-Json | Select-Object -ExpandProperty email)"
        $script:testToken = $response.accessToken
        $script:testUserId = $response.user.id
        Write-Host "    User ID: $($script:testUserId)" -ForegroundColor Gray
        Write-Host "    Token: $($script:testToken.Substring(0, [Math]::Min(30, $script:testToken.Length)))..." -ForegroundColor Gray
    } catch {
        Write-Error "Registration failed: $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "    Response: $responseBody" -ForegroundColor Red
        }
        return $false
    }
    
    # Test 4: Login
    Write-Info "Test 4: Login - POST http://localhost:$BackendPort/api/v1/auth/login"
    try {
        $loginBody = @{
            emailOrUsername = ($registerBody | ConvertFrom-Json).email
            password = ($registerBody | ConvertFrom-Json).password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/v1/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody
        
        Write-Success "Login successful"
        $script:testToken = $response.accessToken
        Write-Host "    Token: $($script:testToken.Substring(0, [Math]::Min(30, $script:testToken.Length)))..." -ForegroundColor Gray
    } catch {
        Write-Error "Login failed: $_"
        return $false
    }
    
    # Test 5: Swagger UI
    Write-Info "Test 5: Swagger UI - GET http://localhost:$BackendPort/swagger-ui.html"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/swagger-ui.html" -Method Get -UseBasicParsing -ErrorAction Stop
        Write-Success "Swagger UI accessible (Status: $($response.StatusCode))"
    } catch {
        Write-Error "Swagger UI check failed: $_"
    }
    
    Write-Success "All backend tests passed!"
    return $true
}

# Test web frontend
function Test-WebFrontend {
    Write-Step "Testing Web Frontend (Port $WebPort)"
    
    # Test 1: Server Response
    Write-Info "Test 1: Server Response - GET http://localhost:$WebPort"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$WebPort" -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Web server responding (Status: $($response.StatusCode))"
    } catch {
        Write-Error "Web server not responding: $_"
        return $false
    }
    
    # Test 2: HTML Content
    Write-Info "Test 2: HTML Content Check"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$WebPort" -Method Get -UseBasicParsing -ErrorAction Stop
        if ($response.Content -match "<!DOCTYPE html|<!doctype html|<html") {
            Write-Success "Valid HTML content returned"
        } else {
            Write-Error "Invalid HTML content"
            return $false
        }
    } catch {
        Write-Error "HTML check failed: $_"
        return $false
    }
    
    Write-Success "Web frontend tests passed!"
    return $true
}

# Test mobile app
function Test-MobileApp {
    Write-Step "Testing Mobile App (Port $MobilePort)"
    
    # Test 1: Metro Bundler Status
    Write-Info "Test 1: Metro Bundler Status - GET http://localhost:$MobilePort/status"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$MobilePort/status" -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Metro bundler is running (Status: $($response.StatusCode))"
    } catch {
        Write-Error "Metro bundler not responding: $_"
        return $false
    }
    
    Write-Success "Mobile app tests passed!"
    return $true
}

# Main execution
Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     BlitzPhoto - Server Test Script                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$allPassed = $true

# Test Backend
if (-not $WebOnly -and -not $MobileOnly) {
    if (Test-Backend) {
        Write-Success "Backend tests passed!"
    } else {
        Write-Error "Backend tests failed!"
        $allPassed = $false
    }
}

# Test Web
if (-not $BackendOnly -and -not $MobileOnly) {
    if (Test-WebFrontend) {
        Write-Success "Web frontend tests passed!"
    } else {
        Write-Error "Web frontend tests failed!"
        $allPassed = $false
    }
}

# Test Mobile
if (-not $BackendOnly -and -not $WebOnly) {
    if (Test-MobileApp) {
        Write-Success "Mobile app tests passed!"
    } else {
        Write-Error "Mobile app tests failed!"
        $allPassed = $false
    }
}

# Summary
Write-Host "`n"
Write-Step "Test Summary"
if ($allPassed) {
    Write-Success "All tests passed! 🎉"
    exit 0
} else {
    Write-Error "Some tests failed. Please check the servers."
    exit 1
}

