# BlitzPhoto Local Testing Script
# This script helps set up and test the application locally

Write-Host "`n🧪 BlitzPhoto Local Testing Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "1. Checking Prerequisites..." -ForegroundColor Yellow

# Check Java
Write-Host "   - Java: " -NoNewline
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Found" -ForegroundColor Green
} catch {
    Write-Host "❌ Not found - Please install Java 21 LTS" -ForegroundColor Red
}

# Check Maven
Write-Host "   - Maven: " -NoNewline
try {
    $mavenVersion = mvn -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Found" -ForegroundColor Green
} catch {
    Write-Host "❌ Not found - Please install Maven 3.9+" -ForegroundColor Red
}

# Check PostgreSQL
Write-Host "   - PostgreSQL: " -NoNewline
try {
    $pgVersion = psql --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not found - Will need to set up database" -ForegroundColor Yellow
}

# Check Node.js
Write-Host "   - Node.js: " -NoNewline
try {
    $nodeVersion = node --version
    Write-Host "✅ Found ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not found - Optional for frontend testing" -ForegroundColor Yellow
}

# Check AWS CLI
Write-Host "   - AWS CLI: " -NoNewline
try {
    $awsVersion = aws --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not found - Will need AWS credentials or LocalStack" -ForegroundColor Yellow
}

Write-Host "`n2. Setting up environment variables..." -ForegroundColor Yellow

# Set environment variables for local testing
$env:SPRING_PROFILES_ACTIVE = "local"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "blitzphoto"
$env:DB_USERNAME = "rapidphoto"
$env:DB_PASSWORD = "changeme"
$env:JWT_SECRET = "local-testing-secret-key-change-me-in-production-at-least-256-bits-long-for-security"

Write-Host "   ✅ Environment variables set" -ForegroundColor Green

Write-Host "`n3. Next Steps:" -ForegroundColor Yellow
Write-Host "   a) Set up PostgreSQL database:" -ForegroundColor White
Write-Host "      CREATE DATABASE blitzphoto;" -ForegroundColor Gray
Write-Host "      CREATE USER rapidphoto WITH PASSWORD 'changeme';" -ForegroundColor Gray
Write-Host "      GRANT ALL PRIVILEGES ON DATABASE blitzphoto TO rapidphoto;" -ForegroundColor Gray

Write-Host "`n   b) Configure AWS (choose one):" -ForegroundColor White
Write-Host "      - Real AWS: Set S3_UPLOADS_BUCKET and S3_THUMBNAILS_BUCKET" -ForegroundColor Gray
Write-Host "      - LocalStack: Start LocalStack and use local endpoints" -ForegroundColor Gray

Write-Host "`n   c) Build and run backend:" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      mvn clean install" -ForegroundColor Gray
Write-Host "      mvn spring-boot:run -Dspring-boot.run.profiles=local" -ForegroundColor Gray

Write-Host "`n   d) Test API:" -ForegroundColor White
Write-Host "      curl http://localhost:8080/api/v1/health" -ForegroundColor Gray
Write-Host "      Open Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray

Write-Host "`n✅ Setup script complete! See LOCAL_TESTING_GUIDE.md for detailed instructions." -ForegroundColor Green

