# Cleanup Test Resources Script
# Run this after the test RDS instance is fully deleted

Write-Host "Cleaning up test resources..." -ForegroundColor Yellow

# Wait for test RDS to be fully deleted
Write-Host "`nChecking if test RDS is deleted..." -ForegroundColor Cyan
$status = aws rds describe-db-instances --db-instance-identifier test-postgres-connection --query "DBInstances[0].DBInstanceStatus" --output text 2>$null

if ($status) {
    Write-Host "Test RDS still exists with status: $status" -ForegroundColor Yellow
    Write-Host "Wait for it to be fully deleted, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Test RDS is deleted" -ForegroundColor Green

# Delete test security group
Write-Host "`nDeleting test security group..." -ForegroundColor Cyan
aws ec2 delete-security-group --group-id sg-0e041a1428d44c4e3 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test security group deleted" -ForegroundColor Green
} else {
    Write-Host "⚠️  Security group may still be in use" -ForegroundColor Yellow
}

# Delete test DB subnet group
Write-Host "`nDeleting test DB subnet group..." -ForegroundColor Cyan
aws rds delete-db-subnet-group --db-subnet-group-name test-db-subnet-group 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test DB subnet group deleted" -ForegroundColor Green
} else {
    Write-Host "⚠️  Subnet group may still be in use" -ForegroundColor Yellow
}

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green




