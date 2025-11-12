#!/bin/bash
# BlitzPhoto Backend - Environment Setup Script
# This script sets up environment variables for connecting to AWS RDS

echo "🚀 BlitzPhoto - Setting up AWS RDS environment..."

# Spring Profile
export SPRING_PROFILES_ACTIVE=dev

# AWS RDS PostgreSQL Configuration
export DB_HOST=sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=blitzphoto
export DB_USERNAME=rapidphoto
export DB_PASSWORD='RapidPhoto!Secure2025#DB'

# AWS Configuration
export AWS_REGION=us-west-2

# S3 Buckets
export S3_UPLOADS_BUCKET=sainathyai-uploads-dev-us-west-2-971422717446
export S3_THUMBNAILS_BUCKET=sainathyai-thumbnails-dev-us-west-2-971422717446

# SQS Queue
export SQS_UPLOAD_QUEUE_URL=https://sqs.us-west-2.amazonaws.com/971422717446/sainathyai-upload-queue-dev

# Security
export JWT_SECRET=dev-secret-key-blitzphoto-2025-change-in-production-at-least-256-bits

# Server
export SERVER_PORT=8080

# CORS
export CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:19006

echo "✅ Environment variables set successfully!"
echo ""
echo "📊 Configuration Summary:"
echo "  Database: $DB_HOST"
echo "  S3 Uploads: $S3_UPLOADS_BUCKET"
echo "  S3 Thumbnails: $S3_THUMBNAILS_BUCKET"
echo "  SQS Queue: $SQS_UPLOAD_QUEUE_URL"
echo "  Server Port: $SERVER_PORT"
echo ""
echo "🎯 Ready to run the backend!"
echo ""
echo "Next steps:"
echo "  1. cd backend"
echo "  2. mvn spring-boot:run"
echo ""




