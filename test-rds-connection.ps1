# Test RDS Connection Script
param(
    [string]$DBInstanceId = "test-postgres-connection"
)

Write-Host "Waiting for RDS instance to be available..." -ForegroundColor Yellow

# Wait for RDS to be available
$maxWait = 600
$elapsed = 0
$status = "creating"

while ($status -ne "available" -and $elapsed -lt $maxWait) {
    Start-Sleep -Seconds 30
    $elapsed += 30
    $status = aws rds describe-db-instances --db-instance-identifier $DBInstanceId --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
    Write-Host "Status: $status (waited $elapsed seconds)" -ForegroundColor Cyan
    
    if ($status -eq "available") {
        break
    }
}

if ($status -ne "available") {
    Write-Host "RDS instance not available after $maxWait seconds" -ForegroundColor Red
    exit 1
}

# Get endpoint
$endpoint = aws rds describe-db-instances --db-instance-identifier $DBInstanceId --query "DBInstances[0].Endpoint.Address" --output text
$port = aws rds describe-db-instances --db-instance-identifier $DBInstanceId --query "DBInstances[0].Endpoint.Port" --output text

Write-Host "`n✅ RDS instance is ready!" -ForegroundColor Green
Write-Host "Endpoint: $endpoint" -ForegroundColor Cyan
Write-Host "Port: $port" -ForegroundColor Cyan

# Test connection
Write-Host "`nTesting connection..." -ForegroundColor Yellow
$testResult = Test-NetConnection -ComputerName $endpoint -Port $port -WarningAction SilentlyContinue

if ($testResult.TcpTestSucceeded) {
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host "   Network is NOT blocked" -ForegroundColor Green
} else {
    Write-Host "❌ Connection failed!" -ForegroundColor Red
    Write-Host "   Network IS blocked" -ForegroundColor Red
    Write-Host "   This confirms VPN/Firewall is blocking port $port" -ForegroundColor Yellow
}

# Check CloudTrail for connection attempts
Write-Host "`nChecking CloudTrail logs..." -ForegroundColor Yellow
aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=$DBInstanceId --max-results 10 --query "Events[*].{Time:EventTime,Name:EventName}" --output table



