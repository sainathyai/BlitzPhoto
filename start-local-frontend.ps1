# Quick Start Script for Local Frontend Testing
# This starts the frontend pointing to local backend

Write-Host "`n=== STARTING LOCAL FRONTEND ===" -ForegroundColor Cyan
Write-Host "`nSetting API URL to local backend...`n" -ForegroundColor Yellow

$env:VITE_API_URL = "http://localhost:8080/api/v1"

Write-Host "API URL: $env:VITE_API_URL" -ForegroundColor Green
Write-Host "`nStarting frontend dev server...`n" -ForegroundColor Yellow

Set-Location web
npm run dev

