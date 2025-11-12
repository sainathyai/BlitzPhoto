# Test Database Connection Script
# This script tests if we can connect to PostgreSQL databases

Write-Host "Testing PostgreSQL Connection Capabilities..." -ForegroundColor Cyan
Write-Host ""

# Test 1: AWS RDS
Write-Host "[1] Testing AWS RDS Connection..." -ForegroundColor Yellow
$rdsTest = Test-NetConnection -ComputerName sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -Port 5432 -WarningAction SilentlyContinue
if ($rdsTest.TcpTestSucceeded) {
    Write-Host "  ✅ AWS RDS: Connection successful" -ForegroundColor Green
} else {
    Write-Host "  ❌ AWS RDS: Connection failed" -ForegroundColor Red
    Write-Host "     Error: $($rdsTest.TcpTestSucceeded)" -ForegroundColor Gray
}

# Test 2: Public PostgreSQL test server
Write-Host "`n[2] Testing Public PostgreSQL Server..." -ForegroundColor Yellow
$publicTest = Test-NetConnection -ComputerName postgres.pgconfig.org -Port 5432 -WarningAction SilentlyContinue -InformationLevel Quiet
if ($publicTest.TcpTestSucceeded) {
    Write-Host "  ✅ Public PostgreSQL: Connection successful" -ForegroundColor Green
} else {
    Write-Host "  ❌ Public PostgreSQL: Connection failed" -ForegroundColor Red
    Write-Host "     This suggests a network/VPN/firewall issue" -ForegroundColor Yellow
}

# Test 3: Check if PostgreSQL client is available
Write-Host "`n[3] Checking PostgreSQL Client..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "  ✅ psql found at: $($psqlPath.Source)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  psql not found (optional)" -ForegroundColor Yellow
}

# Test 4: Check Windows Firewall
Write-Host "`n[4] Checking Windows Firewall..." -ForegroundColor Yellow
$firewallProfiles = Get-NetFirewallProfile
foreach ($profile in $firewallProfiles) {
    Write-Host "  $($profile.Name): Enabled=$($profile.Enabled), Outbound=$($profile.DefaultOutboundAction)" -ForegroundColor Cyan
}

Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "If all connections fail, check:" -ForegroundColor Yellow
Write-Host "  1. VPN connection status" -ForegroundColor White
Write-Host "  2. Corporate firewall rules" -ForegroundColor White
Write-Host "  3. Windows Firewall outbound rules" -ForegroundColor White
Write-Host "  4. Network proxy settings" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray



