# Quick Reference Guide - RapidPhotoUpload

## 🚀 Quick Start Commands

### Backend (Spring Boot)
```bash
# Development
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Tests
./mvnw test                    # Unit tests
./mvnw verify                  # Integration tests
./mvnw jacoco:report          # Coverage report

# Build Docker
docker build -t rapidphoto-backend .
docker run -p 8080:8080 rapidphoto-backend
```

### Web (React + Vite)
```bash
# Development
cd web
npm install
npm run dev                    # Start dev server (http://localhost:5173)

# Tests
npm test                       # Unit tests
npm run test:e2e              # Playwright E2E tests
npm run test:coverage         # Coverage report

# Build
npm run build                 # Production build
npm run preview               # Preview production build
```

### Mobile (React Native + Expo)
```bash
# Development
cd mobile
npm install
npx expo start                # Start Metro bundler

# Run on devices
npx expo start --ios          # iOS simulator
npx expo start --android      # Android emulator
npx expo start --tunnel       # Physical device via tunnel

# Tests
npm test                      # Jest tests
npx detox test               # E2E tests
```

---

## 📋 PR Checklist

Before submitting a PR, ensure:

### Code Quality
- [ ] Code follows clean code standards
- [ ] No console.log / System.out.println in production code
- [ ] Meaningful variable/function names
- [ ] Comments for complex logic only
- [ ] No magic numbers (use constants)
- [ ] Error handling implemented

### Testing
- [ ] Unit tests added for new code
- [ ] Integration tests for API endpoints
- [ ] All existing tests pass
- [ ] Test coverage maintained/improved
- [ ] Edge cases covered

### Documentation
- [ ] Code self-documenting where possible
- [ ] Complex logic commented
- [ ] API endpoints documented in Swagger
- [ ] README updated if needed
- [ ] Environment variables documented

### Security
- [ ] No hardcoded secrets/credentials
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevented
- [ ] XSS prevention in place

### Performance
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Async operations where needed
- [ ] No blocking operations on main thread
- [ ] Memory leaks checked

---

## 🌳 Git Workflow

### Creating a PR Branch
```bash
# 1. Update develop
git checkout develop
git pull origin develop

# 2. Create phase branch (if doesn't exist)
git checkout -b phase-1/foundation develop

# 3. Create PR branch from phase branch
git checkout -b pr/phase1-backend-scaffold phase-1/foundation

# 4. Work on your feature
# ... make changes ...

# 5. Commit changes
git add .
git commit -m "feat: implement backend scaffold with DDD structure"

# 6. Push to remote
git push origin pr/phase1-backend-scaffold

# 7. Create PR: pr/phase1-backend-scaffold → phase-1/foundation
```

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `style`: Code style (formatting)
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(upload): implement S3 pre-signed URL generation
fix(auth): resolve JWT token expiration issue
refactor(photo): extract upload logic to service
test(upload): add integration tests for upload controller
docs(api): update Swagger documentation for upload endpoints
```

### Merging Phase Branch to Develop
```bash
# 1. Ensure phase branch is up to date
git checkout phase-1/foundation
git pull origin phase-1/foundation

# 2. Merge develop into phase branch (resolve conflicts)
git merge develop

# 3. Run full test suite
./mvnw verify      # Backend
npm test           # Web
npm test           # Mobile

# 4. Create PR: phase-1/foundation → develop

# 5. After merge, tag the completion
git checkout develop
git pull origin develop
git tag phase-1-complete
git push origin phase-1-complete
```

---

## 🔧 Environment Variables

### Backend (.env or application.yml)
```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rapidphoto
DB_USERNAME=admin
DB_PASSWORD=<from-secrets-manager>

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<iam-role-or-access-key>
AWS_SECRET_ACCESS_KEY=<from-secrets-manager>
S3_BUCKET_NAME=rapidphoto-uploads
S3_THUMBNAIL_BUCKET=rapidphoto-thumbnails
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/.../upload-queue

# JWT
JWT_SECRET=<from-secrets-manager>
JWT_EXPIRATION_MS=900000          # 15 minutes
JWT_REFRESH_EXPIRATION_MS=604800000  # 7 days

# Application
SERVER_PORT=8080
MAX_UPLOAD_SIZE=52428800          # 50MB
MAX_CONCURRENT_UPLOADS=100
```

### Web (.env)
```properties
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_AWS_REGION=us-east-1
VITE_S3_BUCKET=rapidphoto-uploads
VITE_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

### Mobile (.env)
```properties
API_BASE_URL=https://api.rapidphoto.com
WS_URL=wss://api.rapidphoto.com/ws
AWS_REGION=us-east-1
S3_BUCKET=rapidphoto-uploads
```

---

## 🧪 Testing Commands

### Backend
```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UploadControllerTest

# Run with Testcontainers (integration tests)
./mvnw verify

# Run with code coverage
./mvnw clean test jacoco:report
# Report: target/site/jacoco/index.html

# Run performance tests
./mvnw test -Dtest=UploadPerformanceTest
```

### Web
```bash
# Unit tests (Vitest)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui

# Specific test file
npm test -- UploadButton.test.tsx
```

### Mobile
```bash
# Unit tests (Jest)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# E2E tests (Detox)
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug

# Run on Android
npx detox build --configuration android.emu.debug
npx detox test --configuration android.emu.debug
```

---

## 📊 Monitoring & Debugging

### Backend Logs
```bash
# Tail logs (local)
tail -f logs/application.log

# CloudWatch Logs (production)
aws logs tail /aws/ecs/rapidphoto-backend --follow

# Filter errors
aws logs tail /aws/ecs/rapidphoto-backend --filter-pattern "ERROR"
```

### Metrics
```bash
# CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace RapidPhoto \
  --metric-name UploadSuccessRate \
  --start-time 2025-11-08T00:00:00Z \
  --end-time 2025-11-08T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### Database Queries
```bash
# Connect to RDS
psql -h <rds-endpoint> -U admin -d rapidphoto

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### S3 Debugging
```bash
# List objects in bucket
aws s3 ls s3://rapidphoto-uploads/

# Check bucket size
aws s3 ls s3://rapidphoto-uploads --recursive --summarize | grep "Total Size"

# Test pre-signed URL
curl -X PUT "<presigned-url>" --upload-file test-image.jpg
```

---

## 🐛 Common Issues & Solutions

### Issue: "Access Denied" on S3 Upload
**Solution:**
1. Check IAM role has `s3:PutObject` permission
2. Verify S3 bucket policy allows uploads
3. Check pre-signed URL hasn't expired
4. Ensure CORS configuration on S3 bucket

### Issue: Database Connection Pool Exhausted
**Solution:**
```properties
# Increase pool size in application.yml
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.connection-timeout=30000
```

### Issue: JWT Token Invalid
**Solution:**
1. Check token expiration time
2. Verify JWT_SECRET matches between requests
3. Ensure clock sync on servers
4. Check token format (Bearer <token>)

### Issue: WebSocket Connection Failed
**Solution:**
1. Check CORS configuration allows WebSocket
2. Verify WebSocket endpoint URL
3. Check firewall/proxy settings
4. Use secure WebSocket (wss://) in production

### Issue: Mobile Upload Stuck in Background
**Solution:**
1. Check network connectivity
2. Verify upload queue in AsyncStorage
3. Check background permissions
4. Clear upload queue and retry

---

## 📦 Deployment

### Deploy Backend to ECS
```bash
# 1. Build Docker image
docker build -t rapidphoto-backend .

# 2. Tag image
docker tag rapidphoto-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/rapidphoto-backend:latest

# 3. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# 4. Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/rapidphoto-backend:latest

# 5. Update ECS service
aws ecs update-service \
  --cluster rapidphoto-cluster \
  --service backend-service \
  --force-new-deployment
```

### Deploy Web to S3 + CloudFront
```bash
# 1. Build production bundle
npm run build

# 2. Sync to S3
aws s3 sync dist/ s3://rapidphoto-web-prod/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

### Deploy Mobile (via EAS)
```bash
# 1. Build for iOS
eas build --platform ios --profile production

# 2. Build for Android
eas build --platform android --profile production

# 3. Submit to App Store
eas submit --platform ios

# 4. Submit to Play Store
eas submit --platform android
```

---

## 🎯 Performance Benchmarks

### Backend
- **Upload Initiation:** <50ms (p95)
- **Pre-signed URL Generation:** <20ms
- **Database Query:** <30ms (p95)
- **Concurrent Uploads:** 100 in <90 seconds

### Web
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Bundle Size:** <500KB (gzipped)
- **Lighthouse Score:** >90

### Mobile
- **App Launch Time:** <2s
- **Upload Initiation:** <1s
- **Gallery Load (100 photos):** <2s
- **Memory Usage:** <100MB

---

## 🔐 Security Checklist

### Backend
- [ ] All endpoints authenticated (except public)
- [ ] Input validation on all requests
- [ ] SQL parameterized queries only
- [ ] Secrets in AWS Secrets Manager
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers set

### Frontend
- [ ] JWT stored securely (HttpOnly cookies)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF protection
- [ ] Content Security Policy
- [ ] Sensitive data not in localStorage
- [ ] HTTPS enforced
- [ ] Dependency vulnerabilities checked

### AWS
- [ ] S3 buckets not publicly accessible
- [ ] IAM roles follow least privilege
- [ ] VPC security groups restricted
- [ ] CloudWatch logging enabled
- [ ] Encryption at rest and in transit
- [ ] Regular security audits
- [ ] AWS GuardDuty enabled

---

## 📞 Team Contacts & Resources

### Documentation
- **API Docs:** http://localhost:8080/swagger-ui.html
- **Architecture:** See `docs/ARCHITECTURE.md`
- **Deployment:** See `docs/DEPLOYMENT.md`

### Resources
- **AWS Console:** https://console.aws.amazon.com
- **CloudWatch Dashboard:** [Link to dashboard]
- **Monitoring (Grafana):** [Link if applicable]
- **Error Tracking (Sentry):** [Link if applicable]

### Code Review Guidelines
- Review within 24 hours
- Focus on logic, not style (automated)
- Test the changes locally if significant
- Approve only if comfortable with changes
- Request changes if concerns exist

---

**Last Updated:** November 8, 2025
**Version:** 1.0

