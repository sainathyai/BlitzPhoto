#!/bin/bash
# BlitzPhoto Backend Startup Script

echo "╔════════════════════════════════════════════════╗"
echo "║     BlitzPhoto Backend Startup Script          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Set environment variables
echo "[1/5] Setting environment variables..."
export SPRING_PROFILES_ACTIVE=dev
export DB_HOST=sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=blitzphoto
export DB_USERNAME=rapidphoto
export DB_PASSWORD='RapidPhoto!Secure2025#DB'
export AWS_REGION=us-west-2
export S3_UPLOADS_BUCKET=sainathyai-uploads-dev-us-west-2-971422717446
export S3_THUMBNAILS_BUCKET=sainathyai-thumbnails-dev-us-west-2-971422717446
export SQS_UPLOAD_QUEUE_URL=https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev
export JWT_SECRET=dev-secret-key-blitzphoto-2025-change-in-production
export SERVER_PORT=8080
export CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:19006
echo "  ✅ Environment configured"

# Check AWS credentials
echo ""
echo "[2/5] Checking AWS credentials..."
if aws sts get-caller-identity &>/dev/null; then
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo "  ✅ AWS Account: $ACCOUNT"
else
    echo "  ❌ AWS credentials not found!"
    echo "  Run 'aws configure' first"
    exit 1
fi

# Check Maven
echo ""
echo "[3/5] Checking Maven..."
if command -v mvn &>/dev/null; then
    MVN_VERSION=$(mvn --version | head -n 1)
    echo "  ✅ $MVN_VERSION"
else
    echo "  ❌ Maven not found!"
    exit 1
fi

# Navigate to backend directory
echo ""
echo "[4/5] Navigating to backend directory..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    echo "  ✅ In backend directory"
else
    echo "  ❌ Backend directory not found at: $BACKEND_DIR"
    exit 1
fi

# Start the backend
echo ""
echo "[5/5] Starting Spring Boot application..."
echo "  Port: 8080"
echo "  Profile: dev"
echo "  Skip Tests: yes"
echo ""
echo "═══════════════════════════════════════════════"
echo "  This will take 1-2 minutes for first startup"
echo "  Press Ctrl+C to stop the server"
echo "═══════════════════════════════════════════════"
echo ""

mvn spring-boot:run -DskipTests





