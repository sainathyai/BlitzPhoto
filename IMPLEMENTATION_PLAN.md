# RapidPhotoUpload - Detailed Implementation Plan

## Executive Summary

This document outlines a comprehensive, phase-based implementation plan for the RapidPhotoUpload system. The plan emphasizes clean architecture, AWS-native services, responsive UI/UX, and a systematic branching strategy to ensure quality at every step.

---

## Table of Contents

1. [Tech Stack & AWS Architecture](#tech-stack--aws-architecture)
2. [Branching Strategy](#branching-strategy)
3. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
4. [Clean Code Standards](#clean-code-standards)
5. [Testing Strategy](#testing-strategy)
6. [Missing Considerations](#missing-considerations)

---

## Tech Stack & AWS Architecture

### Backend Stack (Java Spring Boot)

#### Core Dependencies
```xml
<!-- Spring Boot Core -->
- spring-boot-starter-web (REST API)
- spring-boot-starter-webflux (Reactive/Async operations)
- spring-boot-starter-data-jpa (PostgreSQL integration)
- spring-boot-starter-security (JWT authentication)
- spring-boot-starter-validation (Input validation)

<!-- AWS Integration -->
- aws-java-sdk-s3 (S3 file storage)
- aws-java-sdk-sqs (Message queue for async processing)
- aws-java-sdk-cloudwatch (Monitoring & logging)

<!-- Database -->
- postgresql (Database driver)
- flyway-core (Database migrations)

<!-- Concurrency & Performance -->
- reactor-core (Reactive streams)
- caffeine (In-memory caching)

<!-- Testing -->
- spring-boot-starter-test
- testcontainers (PostgreSQL & LocalStack for AWS)
- mockito-core
- junit-jupiter

<!-- Utilities -->
- lombok (Reduce boilerplate)
- mapstruct (Object mapping)
- jjwt (JWT token handling)
```

#### Architecture Layers
```
src/main/java/com/rapidphoto/
├── domain/                    # Domain Layer (DDD)
│   ├── model/
│   │   ├── Photo.java
│   │   ├── UploadJob.java
│   │   ├── User.java
│   │   └── UploadStatus.java (Enum)
│   ├── repository/           # Repository interfaces
│   └── service/              # Domain services
│
├── application/              # Application Layer (CQRS)
│   ├── commands/
│   │   ├── UploadPhotoCommand.java
│   │   ├── UploadPhotoCommandHandler.java
│   │   ├── DeletePhotoCommand.java
│   │   └── UpdatePhotoMetadataCommand.java
│   ├── queries/
│   │   ├── GetPhotoQuery.java
│   │   ├── GetPhotoQueryHandler.java
│   │   ├── GetUploadStatusQuery.java
│   │   └── ListPhotosQuery.java
│   └── dto/                  # Data Transfer Objects
│
├── infrastructure/           # Infrastructure Layer
│   ├── config/
│   │   ├── AwsConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── AsyncConfig.java
│   │   └── CorsConfig.java
│   ├── persistence/
│   │   ├── JpaPhotoRepository.java
│   │   └── entity/           # JPA entities
│   ├── storage/
│   │   ├── S3StorageService.java
│   │   └── PresignedUrlService.java
│   └── messaging/
│       └── SqsMessageHandler.java
│
├── api/                      # API Layer (Vertical Slices)
│   ├── upload/
│   │   ├── UploadController.java
│   │   ├── UploadRequest.java
│   │   └── UploadResponse.java
│   ├── photo/
│   │   ├── PhotoController.java
│   │   └── PhotoQueryController.java
│   ├── auth/
│   │   ├── AuthController.java
│   │   └── JwtAuthenticationFilter.java
│   └── health/
│       └── HealthCheckController.java
│
└── shared/                   # Shared utilities
    ├── exception/
    ├── validation/
    └── util/
```

### Frontend Stack

#### Web Application (TypeScript + React)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",                    // Fast build tool
    "react-router-dom": "^6.20.0",       // Routing
    "axios": "^1.6.0",                   // HTTP client
    "react-query": "^5.0.0",             // Server state management
    "zustand": "^4.4.0",                 // Client state management
    "aws-sdk": "^2.1500.0",              // Direct S3 upload support
    "@aws-amplify/ui-react": "^6.0.0",   // AWS Amplify UI components
    
    // UI & Styling
    "tailwindcss": "^3.3.0",             // Utility-first CSS
    "shadcn-ui": "latest",               // Beautiful components
    "framer-motion": "^10.0.0",          // Animations
    "lucide-react": "^0.300.0",          // Icons
    
    // File Upload
    "react-dropzone": "^14.2.0",         // Drag-and-drop
    "uppy": "^3.20.0",                   // Advanced upload handling
    "@uppy/aws-s3": "^3.6.0",            // S3 direct uploads
    "@uppy/status-bar": "^3.3.0",        // Upload progress
    
    // Real-time
    "socket.io-client": "^4.6.0",        // WebSocket for real-time updates
    
    // Utilities
    "date-fns": "^2.30.0",               // Date handling
    "zod": "^3.22.0",                    // Schema validation
    "react-hook-form": "^7.48.0"         // Form handling
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",             // E2E testing
    "msw": "^2.0.0"                      // API mocking
  }
}
```

#### Mobile Application (React Native)
```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "typescript": "^5.0.0",
    "expo": "^50.0.0",                   // Expo framework
    
    // Navigation
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    
    // State Management
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    
    // AWS & Upload
    "aws-sdk": "^2.1500.0",
    "@aws-amplify/react-native": "^1.1.0",
    "react-native-fs": "^2.20.0",        // File system access
    "react-native-image-picker": "^7.0.0", // Camera/gallery
    "react-native-background-upload": "^6.7.0", // Background uploads
    
    // UI Components
    "react-native-paper": "^5.11.0",     // Material Design
    "react-native-reanimated": "^3.6.0", // Smooth animations
    "react-native-gesture-handler": "^2.14.0",
    
    // Utilities
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "react-native-dotenv": "^3.4.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "detox": "^20.13.0",                 // E2E testing
    "jest": "^29.7.0"
  }
}
```

### AWS Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Web App        │         │   Mobile App     │         │
│  │   (React/TS)     │         │  (React Native)  │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                     │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS CloudFront (CDN)                      │
│              - Cache static assets                           │
│              - HTTPS termination                             │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌───────────────────────┐   ┌──────────────────────┐
│  AWS API Gateway      │   │  AWS S3 Bucket       │
│  - REST API           │   │  - Direct uploads    │
│  - WebSocket API      │   │  - Pre-signed URLs   │
│  - Rate limiting      │   │  - Lifecycle policy  │
│  - JWT validation     │   └──────────────────────┘
└──────────┬────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Elastic Load Balancer (ALB)                     │
│              - SSL/TLS termination                           │
│              - Health checks                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   ECS Task   │  │   ECS Task   │  │   ECS Task   │
│  (Container) │  │  (Container) │  │  (Container) │
│              │  │              │  │              │
│  Spring Boot │  │  Spring Boot │  │  Spring Boot │
│    Backend   │  │    Backend   │  │    Backend   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌───────────────────────┐   ┌──────────────────────┐
│  AWS RDS PostgreSQL   │   │  AWS SQS Queue       │
│  - Multi-AZ           │   │  - Upload jobs       │
│  - Automated backups  │   │  - Async processing  │
│  - Read replicas      │   │  - Dead letter queue │
└───────────────────────┘   └──────────────────────┘
            │                         │
            ▼                         ▼
┌───────────────────────┐   ┌──────────────────────┐
│  AWS CloudWatch       │   │  AWS Lambda          │
│  - Logs               │   │  - Image processing  │
│  - Metrics            │   │  - Thumbnails        │
│  - Alarms             │   │  - Async handlers    │
└───────────────────────┘   └──────────────────────┘
            │
            ▼
┌───────────────────────┐
│  AWS X-Ray            │
│  - Distributed trace  │
│  - Performance        │
└───────────────────────┘
```

#### AWS Services Breakdown

1. **Amazon S3**
   - Store uploaded photos
   - Generate pre-signed URLs for secure direct uploads
   - Lifecycle policies for cost optimization
   - S3 Transfer Acceleration for faster uploads

2. **AWS ECS (Elastic Container Service)**
   - Run Spring Boot backend in Docker containers
   - Auto-scaling based on CPU/memory
   - Fargate for serverless container management

3. **AWS RDS (PostgreSQL)**
   - Store photo metadata, user info, upload jobs
   - Multi-AZ deployment for high availability
   - Automated backups and point-in-time recovery

4. **AWS API Gateway**
   - REST API endpoints
   - WebSocket API for real-time progress updates
   - Request throttling and rate limiting
   - JWT token validation

5. **AWS SQS (Simple Queue Service)**
   - Queue upload processing jobs
   - Decouple upload handling from API
   - Enable retry logic and error handling
   - Dead-letter queue for failed jobs

6. **AWS Lambda**
   - Generate thumbnails on photo upload
   - Process images (compression, format conversion)
   - Clean up orphaned files
   - Async notification handlers

7. **AWS CloudFront**
   - CDN for static assets (web app)
   - Cache photo thumbnails
   - Reduce latency globally

8. **AWS CloudWatch**
   - Centralized logging
   - Custom metrics (upload success rate, latency)
   - Alarms for error rates and performance

9. **AWS Secrets Manager**
   - Store database credentials
   - JWT secret keys
   - API keys

10. **AWS X-Ray**
    - Distributed tracing
    - Performance bottleneck identification
    - Request flow visualization

11. **AWS Cognito** (Optional Enhancement)
    - User authentication and authorization
    - OAuth2/OIDC support
    - User pool management

---

## Branching Strategy

### Strategy: **Git Flow with Phase-Based Long-Lived Feature Branches**

This approach balances clean separation of work phases with flexibility for concurrent development.

```
main (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── phase-1/foundation
  │     │     ├── pr/phase1-aws-infrastructure
  │     │     ├── pr/phase1-backend-scaffold
  │     │     ├── pr/phase1-database-schema
  │     │     └── pr/phase1-auth-jwt
  │     │
  │     ├── phase-2/core-upload
  │     │     ├── pr/phase2-s3-integration
  │     │     ├── pr/phase2-upload-command
  │     │     ├── pr/phase2-async-processing
  │     │     └── pr/phase2-upload-controller
  │     │
  │     ├── phase-3/web-client
  │     │     ├── pr/phase3-web-setup
  │     │     ├── pr/phase3-upload-ui
  │     │     ├── pr/phase3-progress-tracking
  │     │     └── pr/phase3-photo-gallery
  │     │
  │     ├── phase-4/mobile-client
  │     │     ├── pr/phase4-mobile-setup
  │     │     ├── pr/phase4-camera-integration
  │     │     ├── pr/phase4-background-upload
  │     │     └── pr/phase4-mobile-gallery
  │     │
  │     └── phase-5/optimization
  │           ├── pr/phase5-performance-tuning
  │           ├── pr/phase5-monitoring
  │           └── pr/phase5-documentation
```

### Branch Naming Convention

```
Phase branches:    phase-{number}/{phase-name}
PR branches:       pr/phase{number}-{feature-name}
Hotfix branches:   hotfix/{issue-description}
Release branches:  release/v{version}
```

### Workflow

1. **Phase Branch Creation**
   - Create from `develop`: `git checkout -b phase-1/foundation develop`
   - Phase branches live throughout the entire phase
   - Multiple PRs merge into the phase branch

2. **PR Branch Creation**
   - Create from phase branch: `git checkout -b pr/phase1-backend-scaffold phase-1/foundation`
   - Focused on single feature/component
   - Small, reviewable chunks (~300-500 lines)

3. **PR Review & Merge**
   - PRs merge into their phase branch
   - Require: 
     - All tests passing
     - Code review approval
     - No merge conflicts
     - Lint checks passing
   - Use squash merge for clean history

4. **Phase Completion**
   - Merge phase branch into `develop`
   - Create PR: `phase-1/foundation` → `develop`
   - Run full integration test suite
   - Tag the merge: `git tag phase-1-complete`

5. **Release to Main**
   - When ready for production: `develop` → `main`
   - Use release branches for final QA
   - Tag releases: `v1.0.0`, `v1.1.0`, etc.

### Branch Protection Rules

**`main` branch:**
- Require PR reviews (2 approvers)
- Require status checks (CI/CD, tests)
- Require up-to-date branches
- No force push
- No deletion

**`develop` branch:**
- Require PR reviews (1 approver)
- Require status checks
- Allow rebase and merge

**Phase branches:**
- Require status checks
- Allow squash merge
- Auto-delete after merge to develop

---

## Phase-by-Phase Implementation

### Phase 1: Foundation & Infrastructure (Days 1-2)

**Goal:** Set up AWS infrastructure, backend scaffold, authentication, and database

#### PR 1.1: AWS Infrastructure Setup
**Branch:** `pr/phase1-aws-infrastructure`

**Tasks:**
- Create AWS account structure (IAM roles, policies)
- Set up VPC, subnets, security groups
- Provision RDS PostgreSQL instance
- Create S3 buckets (uploads, thumbnails)
- Configure CloudWatch log groups
- Set up SQS queues
- Create ECR repository for Docker images
- Infrastructure as Code (Terraform or CloudFormation)

**Files:**
```
infrastructure/
├── terraform/
│   ├── main.tf
│   ├── vpc.tf
│   ├── rds.tf
│   ├── s3.tf
│   ├── ecs.tf
│   ├── sqs.tf
│   ├── iam.tf
│   └── variables.tf
├── docker/
│   └── Dockerfile
└── README.md
```

**Acceptance Criteria:**
- [ ] All AWS resources provisioned successfully
- [ ] RDS instance accessible from local environment
- [ ] S3 bucket created with proper CORS configuration
- [ ] IAM roles have least-privilege access
- [ ] Infrastructure can be torn down and recreated

---

#### PR 1.2: Backend Project Scaffold
**Branch:** `pr/phase1-backend-scaffold`

**Tasks:**
- Initialize Spring Boot project with Maven/Gradle
- Set up project structure (DDD layers)
- Configure application.yml (dev, test, prod profiles)
- Add core dependencies
- Set up logging configuration
- Create base domain models
- Implement exception handling framework
- Add Swagger/OpenAPI documentation

**Files:**
```
backend/
├── src/main/java/com/rapidphoto/
│   ├── RapidPhotoApplication.java
│   ├── domain/
│   │   └── model/
│   ├── application/
│   ├── infrastructure/
│   │   └── config/
│   │       ├── AwsConfig.java
│   │       ├── AsyncConfig.java
│   │       └── OpenApiConfig.java
│   ├── api/
│   └── shared/
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── ResourceNotFoundException.java
│           └── BusinessException.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── logback-spring.xml
└── pom.xml
```

**Acceptance Criteria:**
- [ ] Application starts successfully
- [ ] Health check endpoint responds
- [ ] Swagger UI accessible at /swagger-ui.html
- [ ] Logging outputs structured JSON
- [ ] Exception handler catches and formats errors

---

#### PR 1.3: Database Schema & Migrations
**Branch:** `pr/phase1-database-schema`

**Tasks:**
- Design PostgreSQL schema
- Create Flyway migration scripts
- Implement JPA entities
- Create repository interfaces
- Add database indexes for performance
- Set up connection pooling (HikariCP)

**Database Schema:**
```sql
-- V1__init_schema.sql

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_photos INT NOT NULL,
    completed_photos INT NOT NULL DEFAULT 0,
    failed_photos INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_job_id UUID NOT NULL REFERENCES upload_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(1000) NOT NULL UNIQUE,
    s3_bucket VARCHAR(255) NOT NULL,
    thumbnail_s3_key VARCHAR(1000),
    width INT,
    height INT,
    upload_status VARCHAR(50) NOT NULL, -- UPLOADING, COMPLETED, FAILED
    upload_progress INT DEFAULT 0,
    error_message TEXT,
    tags TEXT[], -- Array of tags
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_upload_job_id ON photos(upload_job_id);
CREATE INDEX idx_photos_upload_status ON photos(upload_status);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_upload_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);
```

**Files:**
```
backend/src/main/resources/db/migration/
├── V1__init_schema.sql
└── V2__add_indexes.sql

backend/src/main/java/com/rapidphoto/infrastructure/persistence/
├── entity/
│   ├── UserEntity.java
│   ├── UploadJobEntity.java
│   └── PhotoEntity.java
└── JpaPhotoRepository.java
```

**Acceptance Criteria:**
- [ ] Migrations run successfully on fresh database
- [ ] All tables created with proper constraints
- [ ] Indexes improve query performance
- [ ] JPA entities map correctly to tables
- [ ] Repository tests pass with Testcontainers

---

#### PR 1.4: JWT Authentication & Security
**Branch:** `pr/phase1-auth-jwt`

**Tasks:**
- Implement JWT token generation and validation
- Create authentication endpoints (login, register)
- Set up Spring Security configuration
- Implement password hashing (BCrypt)
- Create JWT authentication filter
- Add CORS configuration
- Implement user registration/login logic

**Files:**
```
backend/src/main/java/com/rapidphoto/
├── api/auth/
│   ├── AuthController.java
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── RegisterRequest.java
│   └── RegisterResponse.java
├── infrastructure/config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── JwtConfig.java
├── infrastructure/security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── UserPrincipal.java
└── application/commands/
    ├── RegisterUserCommand.java
    └── RegisterUserCommandHandler.java
```

**API Endpoints:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

**Acceptance Criteria:**
- [ ] Users can register with email/password
- [ ] Users can login and receive JWT token
- [ ] JWT tokens validated on protected endpoints
- [ ] Passwords hashed with BCrypt
- [ ] CORS allows requests from web/mobile clients
- [ ] Integration tests for auth flow

---

### Phase 2: Core Upload System (Days 2-3)

**Goal:** Implement asynchronous photo upload with S3 integration, CQRS handlers, and real-time status

#### PR 2.1: S3 Storage Service
**Branch:** `pr/phase2-s3-integration`

**Tasks:**
- Implement S3 upload service
- Generate pre-signed URLs for direct upload
- Configure multipart upload support
- Implement S3 client with retry logic
- Add file validation (type, size)
- Create thumbnail storage logic
- Add S3 event notifications

**Files:**
```
backend/src/main/java/com/rapidphoto/infrastructure/storage/
├── S3StorageService.java
├── PresignedUrlService.java
├── S3Config.java
├── MultipartUploadHandler.java
└── FileValidator.java

backend/src/test/java/com/rapidphoto/infrastructure/storage/
└── S3StorageServiceTest.java (with LocalStack)
```

**Key Methods:**
```java
public interface StorageService {
    // Generate pre-signed URL for direct client upload
    PresignedUrl generateUploadUrl(String fileName, String contentType);
    
    // Upload from backend (for mobile background uploads)
    String uploadFile(InputStream inputStream, String fileName, String contentType);
    
    // Multipart upload for large files
    MultipartUpload initiateMultipartUpload(String fileName);
    
    // Get download URL
    String getDownloadUrl(String s3Key);
    
    // Delete file
    void deleteFile(String s3Key);
}
```

**Acceptance Criteria:**
- [ ] Can upload files to S3 bucket
- [ ] Pre-signed URLs generated successfully
- [ ] Multipart upload works for files >5MB
- [ ] File type validation (JPEG, PNG, HEIC)
- [ ] File size validation (max 50MB)
- [ ] Tests with LocalStack container

---

#### PR 2.2: Upload Command & Domain Logic
**Branch:** `pr/phase2-upload-command`

**Tasks:**
- Create Photo domain model
- Create UploadJob domain model
- Implement InitiateUploadCommand (CQRS)
- Implement CompleteUploadCommand
- Implement UploadCommandHandlers
- Add domain validation rules
- Create upload job status tracking

**Files:**
```
backend/src/main/java/com/rapidphoto/
├── domain/
│   ├── model/
│   │   ├── Photo.java
│   │   ├── UploadJob.java
│   │   ├── User.java
│   │   └── UploadStatus.java (enum)
│   ├── repository/
│   │   ├── PhotoRepository.java
│   │   └── UploadJobRepository.java
│   └── service/
│       └── UploadDomainService.java
├── application/commands/
│   ├── InitiateUploadCommand.java
│   ├── InitiateUploadCommandHandler.java
│   ├── CompleteUploadCommand.java
│   ├── CompleteUploadCommandHandler.java
│   ├── UpdateUploadProgressCommand.java
│   └── UpdateUploadProgressCommandHandler.java
└── application/dto/
    ├── PhotoDto.java
    ├── UploadJobDto.java
    └── UploadInitiationResponse.java
```

**Domain Models:**
```java
@Entity
@Table(name = "photos")
public class Photo {
    @Id
    private UUID id;
    private UUID uploadJobId;
    private UUID userId;
    private String filename;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private String s3Key;
    private String s3Bucket;
    private String thumbnailS3Key;
    private Integer width;
    private Integer height;
    @Enumerated(EnumType.STRING)
    private UploadStatus uploadStatus;
    private Integer uploadProgress;
    private String errorMessage;
    private String[] tags;
    private Instant uploadedAt;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Business logic methods
    public void markAsCompleted() { ... }
    public void markAsFailed(String error) { ... }
    public void updateProgress(int progress) { ... }
}
```

**Acceptance Criteria:**
- [ ] Upload job created with metadata
- [ ] Photo records created in database
- [ ] Domain validation prevents invalid states
- [ ] Command handlers transactional
- [ ] Unit tests for domain logic
- [ ] Integration tests for command handlers

---

#### PR 2.3: Async Processing with SQS
**Branch:** `pr/phase2-async-processing`

**Tasks:**
- Implement SQS message sender
- Create SQS message listeners
- Implement async upload processing
- Add retry logic with exponential backoff
- Create dead-letter queue handler
- Add message deduplication
- Implement batch processing

**Files:**
```
backend/src/main/java/com/rapidphoto/infrastructure/messaging/
├── SqsMessageSender.java
├── SqsMessageListener.java
├── UploadJobMessageHandler.java
├── DeadLetterQueueHandler.java
└── SqsConfig.java

backend/src/main/java/com/rapidphoto/application/events/
├── PhotoUploadedEvent.java
├── PhotoUploadFailedEvent.java
└── UploadJobCompletedEvent.java
```

**Message Flow:**
```
1. Client initiates upload → Create UploadJob → Send SQS message
2. SQS Listener receives message → Process upload
3. Update photo status in DB → Send progress event
4. On completion → Update UploadJob → Send completion event
5. On failure → Retry (3 times) → Move to DLQ
```

**Acceptance Criteria:**
- [ ] Messages sent to SQS queue
- [ ] Listeners process messages asynchronously
- [ ] Failed messages retry with backoff
- [ ] Dead-letter queue captures permanent failures
- [ ] Idempotent message processing
- [ ] Integration tests with LocalStack SQS

---

#### PR 2.4: Upload REST API Controllers
**Branch:** `pr/phase2-upload-controller`

**Tasks:**
- Create UploadController endpoints
- Implement multipart file upload endpoint
- Create pre-signed URL endpoint
- Add upload status polling endpoint
- Implement batch upload initiation
- Add request validation
- Create response DTOs
- Add rate limiting

**Files:**
```
backend/src/main/java/com/rapidphoto/api/upload/
├── UploadController.java
├── InitiateUploadRequest.java
├── InitiateUploadResponse.java
├── CompleteUploadRequest.java
├── UploadStatusResponse.java
└── BatchUploadRequest.java
```

**API Endpoints:**
```
POST   /api/v1/upload/initiate           // Initiate upload job, get pre-signed URLs
POST   /api/v1/upload/complete           // Mark upload as complete
POST   /api/v1/upload/file               // Direct file upload (alternative)
GET    /api/v1/upload/status/{jobId}     // Get upload job status
PATCH  /api/v1/upload/progress/{photoId} // Update individual photo progress
DELETE /api/v1/upload/{photoId}          // Cancel/delete upload
```

**Request/Response Examples:**
```json
// POST /api/v1/upload/initiate
{
  "photos": [
    { "fileName": "image1.jpg", "fileSize": 2048576, "mimeType": "image/jpeg" },
    { "fileName": "image2.png", "fileSize": 1048576, "mimeType": "image/png" }
  ]
}

// Response
{
  "uploadJobId": "550e8400-e29b-41d4-a716-446655440000",
  "uploads": [
    {
      "photoId": "660e8400-e29b-41d4-a716-446655440001",
      "presignedUrl": "https://s3.amazonaws.com/...",
      "s3Key": "uploads/user123/550e8400/image1.jpg",
      "expiresAt": "2025-11-08T10:30:00Z"
    }
  ]
}
```

**Acceptance Criteria:**
- [ ] All endpoints respond correctly
- [ ] Request validation works
- [ ] Pre-signed URLs generated
- [ ] Upload status tracked accurately
- [ ] Rate limiting prevents abuse
- [ ] API documentation in Swagger
- [ ] Integration tests for all endpoints

---

### Phase 3: Web Client (Days 3-4)

**Goal:** Build responsive React web application with beautiful UI, drag-drop upload, and real-time progress

#### PR 3.1: Web Application Setup
**Branch:** `pr/phase3-web-setup`

**Tasks:**
- Initialize Vite + React + TypeScript project
- Configure Tailwind CSS + shadcn/ui
- Set up project structure
- Configure Axios instance with interceptors
- Set up React Query
- Configure Zustand stores
- Set up routing (React Router)
- Create authentication context
- Add environment configuration

**Files:**
```
web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── config/
│   │   └── env.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   └── useAuth.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── uploadStore.ts
│   ├── types/
│   │   └── api.types.ts
│   ├── routes/
│   │   └── index.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── NotFoundPage.tsx
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx
│       │   └── Layout.tsx
│       └── ui/ (shadcn components)
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Design System:**
- Primary Color: Indigo (#4F46E5)
- Secondary Color: Purple (#9333EA)
- Accent: Sky Blue (#0EA5E9)
- Typography: Inter font family
- Spacing: 4px base unit
- Border Radius: 8px default

**Acceptance Criteria:**
- [ ] Development server runs smoothly
- [ ] Tailwind CSS configured and working
- [ ] Routing works between pages
- [ ] Authentication state persisted
- [ ] API client configured with JWT interceptor
- [ ] No console errors
- [ ] TypeScript strict mode enabled

---

#### PR 3.2: Upload UI with Drag-Drop
**Branch:** `pr/phase3-upload-ui`

**Tasks:**
- Create upload dropzone component
- Implement file selection (browser + drag-drop)
- Add file preview thumbnails
- Implement file list with remove option
- Add file validation UI
- Create upload button with loading state
- Add batch size indicator (100 max)
- Implement responsive design

**Files:**
```
web/src/components/upload/
├── UploadDropzone.tsx
├── FilePreview.tsx
├── FileList.tsx
├── FileItem.tsx
├── UploadButton.tsx
└── UploadValidation.tsx

web/src/hooks/
├── useFileUpload.ts
└── useFileValidation.ts
```

**UI Features:**
- Drag-drop zone with hover effects
- File type icons (image preview or icon)
- File size display (human-readable)
- Remove button per file
- Batch progress indicator
- Error messages per file
- Smooth animations (Framer Motion)

**Acceptance Criteria:**
- [ ] Files can be selected via browser dialog
- [ ] Files can be drag-dropped into zone
- [ ] Thumbnails generated for images
- [ ] Invalid files rejected with error message
- [ ] Max 100 files enforced
- [ ] Responsive on mobile screens
- [ ] Accessible (keyboard navigation, ARIA labels)

---

#### PR 3.3: Real-Time Progress Tracking
**Branch:** `pr/phase3-progress-tracking`

**Tasks:**
- Implement WebSocket connection (Socket.io)
- Create progress bar component
- Display individual file upload progress
- Show overall batch progress
- Display upload speed and time remaining
- Handle upload success/failure states
- Add retry logic for failed uploads
- Create upload status notifications

**Files:**
```
web/src/components/upload/
├── ProgressBar.tsx
├── UploadProgress.tsx
├── UploadStats.tsx
└── UploadNotification.tsx

web/src/services/
├── uploadService.ts
├── websocketService.ts
└── s3UploadService.ts

web/src/hooks/
├── useUploadProgress.ts
└── useWebSocket.ts
```

**Features:**
- Per-file progress bar (0-100%)
- Overall batch progress
- Upload speed (MB/s)
- Time remaining estimate
- Success/error icons
- Retry button for failed uploads
- Cancel individual uploads
- Toast notifications

**Progress Display:**
```
┌──────────────────────────────────────────────┐
│  Uploading 37 of 100 photos                   │
│  ████████████░░░░░░░░░░░░░░░░░░░░  37%       │
│  📸 15.2 MB/s • 2m 15s remaining             │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  ✓ image001.jpg    2.1 MB   [████████] 100%  │
│  ⟳ image002.png    1.8 MB   [███░░░░░]  40%  │
│  ✗ image003.heic   3.2 MB   Failed            │
│     └─ Retry                                  │
└──────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Progress updates in real-time
- [ ] WebSocket reconnects on disconnect
- [ ] Progress persists on page refresh
- [ ] Failed uploads can be retried
- [ ] Upload can be cancelled
- [ ] Notifications appear for completion
- [ ] No memory leaks on unmount

---

#### PR 3.4: Photo Gallery & Management
**Branch:** `pr/phase3-photo-gallery`

**Tasks:**
- Create photo gallery grid view
- Implement infinite scroll/pagination
- Add photo detail modal
- Implement search and filter
- Add tagging functionality
- Create download button
- Add delete functionality
- Implement photo metadata display

**Files:**
```
web/src/components/gallery/
├── PhotoGallery.tsx
├── PhotoGrid.tsx
├── PhotoCard.tsx
├── PhotoModal.tsx
├── PhotoDetails.tsx
├── TagInput.tsx
└── FilterBar.tsx

web/src/pages/
└── GalleryPage.tsx

web/src/hooks/
├── usePhotos.ts
├── useInfinitePhotos.ts
└── usePhotoTags.ts
```

**Gallery Features:**
- Masonry/grid layout
- Lazy loading images
- Lightbox for full-size view
- Download original photo
- Delete with confirmation
- Add/remove tags
- Filter by date, tag, upload status
- Search by filename

**API Integration:**
```
GET    /api/v1/photos?page=0&size=20&sort=createdAt,desc
GET    /api/v1/photos/{id}
PATCH  /api/v1/photos/{id}/tags
DELETE /api/v1/photos/{id}
GET    /api/v1/photos/download/{id}
```

**Acceptance Criteria:**
- [ ] Gallery displays photos in grid
- [ ] Infinite scroll loads more photos
- [ ] Modal shows full-size image
- [ ] Photos can be tagged
- [ ] Photos can be deleted
- [ ] Photos can be downloaded
- [ ] Search/filter works correctly
- [ ] Responsive on all screen sizes

---

### Phase 4: Mobile Client (Days 4-5)

**Goal:** Build React Native mobile app with camera integration, background uploads, and native feel

#### PR 4.1: Mobile Application Setup
**Branch:** `pr/phase4-mobile-setup`

**Tasks:**
- Initialize React Native project (Expo)
- Configure TypeScript
- Set up navigation (React Navigation)
- Configure state management (Zustand + React Query)
- Set up API client (Axios)
- Configure environment variables
- Set up authentication flow
- Create base components and theme

**Files:**
```
mobile/
├── App.tsx
├── app.json
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── GalleryScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── uploadStore.ts
│   ├── hooks/
│   ├── types/
│   ├── constants/
│   │   └── theme.ts
│   └── utils/
├── package.json
└── tsconfig.json
```

**Theme:**
```typescript
export const theme = {
  colors: {
    primary: '#4F46E5',
    secondary: '#9333EA',
    accent: '#0EA5E9',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
```

**Acceptance Criteria:**
- [ ] App runs on iOS and Android
- [ ] Navigation works smoothly
- [ ] Authentication flow complete
- [ ] API client configured
- [ ] Theme applied consistently
- [ ] No TypeScript errors
- [ ] Development build stable

---

#### PR 4.2: Camera & Gallery Integration
**Branch:** `pr/phase4-camera-integration`

**Tasks:**
- Implement camera access
- Implement photo library access
- Create photo picker UI
- Add permission handling
- Implement multi-select (up to 100)
- Generate thumbnails locally
- Add photo preview before upload
- Handle EXIF data extraction

**Files:**
```
mobile/src/components/camera/
├── CameraButton.tsx
├── PhotoPicker.tsx
├── PermissionRequest.tsx
└── PhotoPreview.tsx

mobile/src/hooks/
├── useCamera.ts
├── usePhotoPicker.ts
└── usePermissions.ts

mobile/src/utils/
├── imageUtils.ts
└── exifUtils.ts
```

**Features:**
- Take photo button
- Select from gallery button
- Multi-select with count indicator
- Permission prompts (camera, photos)
- Thumbnail generation
- Photo metadata extraction
- Selected photos grid
- Remove selected photos

**Permissions:**
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow RapidPhotoUpload to access your photos",
          "cameraPermission": "Allow RapidPhotoUpload to use your camera"
        }
      ]
    ]
  }
}
```

**Acceptance Criteria:**
- [ ] Can take photos with camera
- [ ] Can select from photo library
- [ ] Multi-select up to 100 photos
- [ ] Permissions requested properly
- [ ] Thumbnails generated efficiently
- [ ] EXIF data extracted (location, date)
- [ ] Works on iOS and Android
- [ ] No performance issues with 100 photos

---

#### PR 4.3: Background Upload System
**Branch:** `pr/phase4-background-upload`

**Tasks:**
- Implement background upload service
- Use native background transfer (iOS/Android)
- Implement upload queue management
- Add upload retry logic
- Handle app background/foreground transitions
- Implement local upload state persistence
- Add upload notifications
- Handle network connectivity changes

**Files:**
```
mobile/src/services/
├── backgroundUploadService.ts
├── uploadQueueManager.ts
├── networkMonitor.ts
└── notificationService.ts

mobile/src/hooks/
├── useBackgroundUpload.ts
└── useUploadQueue.ts

mobile/src/store/
└── uploadQueueStore.ts
```

**Background Upload Flow:**
```
1. User selects photos
2. Photos added to upload queue
3. Queue persisted to AsyncStorage
4. Background service initiated
5. Upload photos to S3 via pre-signed URLs
6. Update progress in local state
7. Send completion events to backend
8. Show notification on completion
9. Handle failures with retry
```

**Features:**
- Upload continues in background
- Upload continues when app closed
- Retry failed uploads
- Pause/resume uploads
- Cancel uploads
- Network-aware (WiFi-only option)
- Local notifications for completion
- Queue survives app restart

**Acceptance Criteria:**
- [ ] Uploads continue in background
- [ ] Uploads persist across app restarts
- [ ] Failed uploads retry automatically
- [ ] Network changes handled gracefully
- [ ] Notifications show progress
- [ ] Can pause/resume uploads
- [ ] Works reliably on iOS and Android
- [ ] Battery-efficient

---

#### PR 4.4: Mobile Gallery & UI Polish
**Branch:** `pr/phase4-mobile-gallery`

**Tasks:**
- Create photo gallery screen
- Implement infinite scroll
- Add pull-to-refresh
- Create photo detail screen
- Add photo management (delete, tag)
- Implement offline mode indicators
- Add haptic feedback
- Polish UI/UX with animations

**Files:**
```
mobile/src/screens/
├── GalleryScreen.tsx
├── PhotoDetailScreen.tsx
└── UploadScreen.tsx

mobile/src/components/gallery/
├── PhotoGrid.tsx
├── PhotoCard.tsx
├── PhotoDetails.tsx
└── UploadProgress.tsx

mobile/src/hooks/
├── usePhotos.ts
└── useInfinitePhotos.ts
```

**Gallery Features:**
- Grid layout (3 columns)
- Fast scroll with thumbnails
- Pull-to-refresh
- Tap to view full-size
- Pinch to zoom
- Swipe between photos
- Delete with confirmation
- Add tags
- Share photo
- Download to device

**UI Polish:**
- Smooth animations (React Native Reanimated)
- Haptic feedback on interactions
- Loading skeletons
- Error states with retry
- Empty states with illustrations
- Optimistic updates
- Gesture handling

**Acceptance Criteria:**
- [ ] Gallery loads photos efficiently
- [ ] Infinite scroll works smoothly
- [ ] Pull-to-refresh reloads data
- [ ] Photo detail view polished
- [ ] Animations smooth (60fps)
- [ ] Haptics feel natural
- [ ] Works offline (cached data)
- [ ] Native feel on iOS and Android

---

### Phase 5: Optimization & Production Ready (Day 5)

**Goal:** Performance tuning, monitoring, documentation, deployment automation

#### PR 5.1: Performance Optimization
**Branch:** `pr/phase5-performance-tuning`

**Tasks:**
- Optimize database queries (indexes, N+1)
- Implement caching (Redis/Caffeine)
- Add CDN for static assets (CloudFront)
- Optimize S3 uploads (Transfer Acceleration)
- Implement response compression (gzip)
- Add database connection pooling tuning
- Optimize frontend bundle size
- Add lazy loading for components
- Implement image optimization (thumbnails)
- Add database query profiling

**Backend Optimizations:**
```java
// Caffeine cache configuration
@Bean
public Cache<String, PhotoDto> photoCache() {
    return Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .recordStats()
        .build();
}

// Async processing optimization
@Async("uploadTaskExecutor")
public CompletableFuture<UploadResult> processUploadAsync(Photo photo) {
    // Process upload asynchronously
}

// Database query optimization
@Query("SELECT p FROM Photo p JOIN FETCH p.uploadJob WHERE p.userId = :userId")
List<Photo> findByUserIdWithUploadJob(@Param("userId") UUID userId);
```

**Frontend Optimizations:**
```typescript
// Code splitting
const Gallery = lazy(() => import('./pages/GalleryPage'));

// Image optimization
<img 
  src={photo.thumbnailUrl} 
  loading="lazy"
  srcSet={`${photo.thumbnailUrl} 1x, ${photo.url} 2x`}
/>

// Virtual scrolling for large lists
import { FixedSizeGrid } from 'react-window';
```

**Acceptance Criteria:**
- [ ] API response time <200ms (p95)
- [ ] Database query time <50ms (p95)
- [ ] Frontend bundle size <500KB
- [ ] Images load progressively
- [ ] Cache hit rate >80%
- [ ] No memory leaks
- [ ] Mobile app size <50MB

---

#### PR 5.2: Monitoring & Observability
**Branch:** `pr/phase5-monitoring`

**Tasks:**
- Configure CloudWatch logs and metrics
- Implement custom metrics (upload success rate)
- Set up CloudWatch alarms
- Implement X-Ray distributed tracing
- Add health check endpoints
- Create monitoring dashboard
- Implement error tracking (Sentry optional)
- Add performance metrics

**Monitoring Setup:**
```java
// Custom metrics
@Autowired
private MeterRegistry meterRegistry;

public void recordUploadSuccess() {
    meterRegistry.counter("upload.success.total").increment();
}

public void recordUploadDuration(long durationMs) {
    meterRegistry.timer("upload.duration").record(durationMs, TimeUnit.MILLISECONDS);
}

// Health checks
@Component
public class S3HealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check S3 connectivity
    }
}
```

**CloudWatch Metrics:**
- Upload success rate
- Upload duration (p50, p95, p99)
- API error rate
- Database connection pool usage
- S3 upload failures
- Active users
- Queue depth (SQS)

**Alarms:**
- Error rate >5%
- API latency >500ms
- Database CPU >80%
- SQS queue depth >1000
- Upload failure rate >10%

**Acceptance Criteria:**
- [ ] All logs sent to CloudWatch
- [ ] Custom metrics tracked
- [ ] Alarms configured and tested
- [ ] X-Ray traces visible
- [ ] Dashboard shows key metrics
- [ ] Health checks respond correctly

---

#### PR 5.3: Documentation & Deployment
**Branch:** `pr/phase5-documentation`

**Tasks:**
- Write comprehensive README
- Document API endpoints (OpenAPI/Swagger)
- Create architecture diagrams
- Write deployment guide
- Document environment variables
- Create CI/CD pipeline (GitHub Actions)
- Write testing guide
- Document troubleshooting steps

**Documentation Structure:**
```
docs/
├── README.md
├── ARCHITECTURE.md
├── API.md
├── DEPLOYMENT.md
├── DEVELOPMENT.md
├── TESTING.md
├── TROUBLESHOOTING.md
└── diagrams/
    ├── architecture.png
    ├── upload-flow.png
    └── database-schema.png
```

**CI/CD Pipeline:**
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run tests
        run: ./mvnw test
      - name: Integration tests
        run: ./mvnw verify
      - name: Code coverage
        run: ./mvnw jacoco:report

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t rapidphoto-backend .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker push rapidphoto-backend

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: aws ecs update-service --cluster prod --service backend
```

**Acceptance Criteria:**
- [ ] README comprehensive and clear
- [ ] API fully documented
- [ ] Architecture diagrams accurate
- [ ] Deployment automated
- [ ] CI/CD pipeline working
- [ ] All environment variables documented
- [ ] Troubleshooting guide helpful

---

## Clean Code Standards

### Backend (Java/Spring Boot)

#### 1. Package Structure
```
✅ DO: Feature-based (Vertical Slices)
com.rapidphoto.api.upload.UploadController
com.rapidphoto.api.upload.UploadService
com.rapidphoto.api.upload.UploadRequest

❌ DON'T: Type-based
com.rapidphoto.controllers.UploadController
com.rapidphoto.services.UploadService
com.rapidphoto.dto.UploadRequest
```

#### 2. Naming Conventions
```java
✅ DO: Clear, intention-revealing names
public class InitiateUploadCommandHandler implements CommandHandler<InitiateUploadCommand, UploadJobDto>

❌ DON'T: Abbreviated or unclear names
public class IUCmdHndlr implements CH<IUCmd, UJDto>
```

#### 3. Single Responsibility
```java
✅ DO: One responsibility per class
public class S3StorageService {
    public String uploadFile(InputStream stream, String key) { ... }
}

public class PresignedUrlService {
    public PresignedUrl generateUploadUrl(String key) { ... }
}

❌ DON'T: Kitchen sink classes
public class S3Service {
    public String uploadFile(...) { ... }
    public PresignedUrl generateUrl(...) { ... }
    public void deleteFile(...) { ... }
    public List<String> listFiles(...) { ... }
    public byte[] downloadFile(...) { ... }
}
```

#### 4. Dependency Injection
```java
✅ DO: Constructor injection
@Service
@RequiredArgsConstructor
public class UploadService {
    private final PhotoRepository photoRepository;
    private final S3StorageService storageService;
}

❌ DON'T: Field injection
@Service
public class UploadService {
    @Autowired
    private PhotoRepository photoRepository;
}
```

#### 5. Error Handling
```java
✅ DO: Specific, actionable exceptions
public class PhotoNotFoundException extends BusinessException {
    public PhotoNotFoundException(UUID photoId) {
        super(String.format("Photo with id %s not found", photoId));
    }
}

❌ DON'T: Generic exceptions
throw new Exception("Error");
```

#### 6. Domain Logic in Domain
```java
✅ DO: Domain models with behavior
public class Photo {
    public void markAsCompleted() {
        if (this.uploadStatus != UploadStatus.UPLOADING) {
            throw new IllegalStateException("Can only complete uploading photos");
        }
        this.uploadStatus = UploadStatus.COMPLETED;
        this.uploadedAt = Instant.now();
    }
}

❌ DON'T: Anemic domain models
public class Photo {
    // Only getters and setters
}

// Logic in service
public class PhotoService {
    public void completeUpload(Photo photo) {
        photo.setUploadStatus(UploadStatus.COMPLETED);
        photo.setUploadedAt(Instant.now());
    }
}
```

### Frontend (TypeScript/React)

#### 1. Component Structure
```typescript
✅ DO: Small, focused components
function UploadButton({ onUpload, isLoading }: UploadButtonProps) {
  return (
    <button onClick={onUpload} disabled={isLoading}>
      {isLoading ? <Spinner /> : 'Upload'}
    </button>
  );
}

❌ DON'T: Massive components
function UploadPage() {
  // 500 lines of mixed concerns
}
```

#### 2. Custom Hooks
```typescript
✅ DO: Extract reusable logic
function useUploadProgress(uploadJobId: string) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const socket = connectWebSocket();
    socket.on(`upload:${uploadJobId}:progress`, setProgress);
    return () => socket.disconnect();
  }, [uploadJobId]);
  
  return progress;
}

❌ DON'T: Duplicate logic in components
```

#### 3. Type Safety
```typescript
✅ DO: Strict types
interface Photo {
  id: string;
  url: string;
  uploadStatus: 'uploading' | 'completed' | 'failed';
  uploadedAt: Date;
}

function PhotoCard({ photo }: { photo: Photo }) { ... }

❌ DON'T: Any types
function PhotoCard({ photo }: { photo: any }) { ... }
```

#### 4. State Management
```typescript
✅ DO: Colocate state
function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  // Use files only in this component
}

✅ DO: Global state for shared data
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

❌ DON'T: Prop drilling 5 levels deep
```

#### 5. Async Handling
```typescript
✅ DO: Use React Query for server state
function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
  });
}

❌ DON'T: Manual fetch in useEffect
function PhotoList() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/photos')
      .then(res => res.json())
      .then(setPhotos)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
}
```

### General Principles

1. **DRY (Don't Repeat Yourself)**
   - Extract common logic into functions/classes
   - Use composition over duplication

2. **KISS (Keep It Simple, Stupid)**
   - Prefer simple solutions
   - Avoid premature optimization

3. **YAGNI (You Aren't Gonna Need It)**
   - Don't build features before they're needed
   - Focus on current requirements

4. **Boy Scout Rule**
   - Leave code better than you found it
   - Refactor as you go

5. **Code Reviews**
   - Every PR reviewed by at least one person
   - Focus on logic, readability, tests
   - Use automated linting

---

## Testing Strategy

### Backend Testing

#### 1. Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class InitiateUploadCommandHandlerTest {
    @Mock
    private PhotoRepository photoRepository;
    
    @Mock
    private S3StorageService storageService;
    
    @InjectMocks
    private InitiateUploadCommandHandler handler;
    
    @Test
    void shouldCreatePhotosAndGeneratePresignedUrls() {
        // Given
        var command = new InitiateUploadCommand(userId, files);
        
        // When
        var result = handler.handle(command);
        
        // Then
        assertThat(result.getUploads()).hasSize(files.size());
        verify(photoRepository, times(files.size())).save(any());
    }
}
```

#### 2. Integration Tests
```java
@SpringBootTest
@Testcontainers
class UploadControllerIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Container
    static LocalStackContainer localstack = new LocalStackContainer(
        DockerImageName.parse("localstack/localstack:latest")
    ).withServices(LocalStackContainer.Service.S3, LocalStackContainer.Service.SQS);
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldUploadPhotoEndToEnd() throws Exception {
        // Test full upload flow
        mockMvc.perform(
            post("/api/v1/upload/initiate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "photos": [{"fileName": "test.jpg", "fileSize": 1024, "mimeType": "image/jpeg"}]
                    }
                """)
        ).andExpect(status().isOk());
    }
}
```

#### 3. Performance Tests
```java
@Test
void shouldHandlesConcurrentUploads() throws InterruptedException {
    ExecutorService executor = Executors.newFixedThreadPool(100);
    CountDownLatch latch = new CountDownLatch(100);
    
    for (int i = 0; i < 100; i++) {
        executor.submit(() -> {
            try {
                uploadService.initiateUpload(createCommand());
            } finally {
                latch.countDown();
            }
        });
    }
    
    boolean completed = latch.await(90, TimeUnit.SECONDS);
    assertTrue(completed, "Should complete 100 uploads in 90 seconds");
}
```

### Frontend Testing

#### 1. Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadButton } from './UploadButton';

describe('UploadButton', () => {
  it('should call onUpload when clicked', () => {
    const onUpload = jest.fn();
    render(<UploadButton onUpload={onUpload} isLoading={false} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onUpload).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when loading', () => {
    render(<UploadButton onUpload={jest.fn()} isLoading={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### 2. Hook Tests
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUploadProgress } from './useUploadProgress';

describe('useUploadProgress', () => {
  it('should update progress on WebSocket event', async () => {
    const { result } = renderHook(() => useUploadProgress('job-123'));
    
    // Simulate WebSocket event
    mockSocket.emit('upload:job-123:progress', 50);
    
    await waitFor(() => {
      expect(result.current).toBe(50);
    });
  });
});
```

#### 3. E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('should upload photos successfully', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Upload photos
  await page.setInputFiles('input[type="file"]', ['./test-images/photo1.jpg']);
  await page.click('button:has-text("Upload")');
  
  // Verify upload completed
  await expect(page.locator('.upload-success')).toBeVisible();
});
```

### Testing Requirements

- **Backend:**
  - Unit test coverage: >80%
  - Integration tests for all critical paths
  - Performance test for 100 concurrent uploads

- **Frontend:**
  - Component test coverage: >70%
  - E2E tests for main user flows
  - Accessibility tests (axe-core)

- **Mobile:**
  - Unit tests for business logic
  - E2E tests with Detox
  - Manual testing on real devices

---

## Missing Considerations

### Security

1. **Input Validation**
   - File type validation (magic numbers, not just extension)
   - File size limits enforced
   - SQL injection prevention (parameterized queries)
   - XSS prevention (input sanitization)

2. **Authentication & Authorization**
   - JWT token expiration (15 min access, 7 day refresh)
   - Secure token storage (HttpOnly cookies web, Keychain/KeyStore mobile)
   - Rate limiting (10 upload jobs per user per hour)
   - CORS properly configured

3. **Data Protection**
   - Encrypt S3 buckets at rest (AES-256)
   - Encrypt data in transit (TLS 1.3)
   - Database credentials in AWS Secrets Manager
   - Rotate credentials regularly

4. **S3 Bucket Security**
   - Block public access
   - Bucket policies restrict access to backend IAM role
   - Pre-signed URLs expire in 15 minutes
   - Enable S3 versioning for recovery

### Scalability

1. **Horizontal Scaling**
   - Stateless backend (no session state)
   - Load balancer distributes traffic
   - Auto-scaling based on CPU/memory
   - Database read replicas for queries

2. **Caching Strategy**
   - CloudFront CDN for static assets
   - Redis/Caffeine for API responses
   - Browser caching for images
   - Pre-fetch thumbnails on gallery load

3. **Database Optimization**
   - Connection pooling (HikariCP)
   - Indexes on frequently queried columns
   - Partitioning for large tables (by date)
   - Archive old uploads to S3

### Reliability

1. **Error Handling**
   - Retry logic with exponential backoff
   - Circuit breaker for external services
   - Graceful degradation (queue when S3 down)
   - Dead-letter queue for failed messages

2. **Data Consistency**
   - Transactional database operations
   - Idempotent API endpoints
   - Eventual consistency for async operations
   - Reconciliation job for orphaned records

3. **Monitoring & Alerts**
   - Error rate threshold alerts
   - Latency threshold alerts
   - Disk space monitoring
   - Database connection pool monitoring

### User Experience

1. **Performance**
   - Progressive image loading
   - Optimistic UI updates
   - Virtual scrolling for large lists
   - Lazy loading components

2. **Offline Support**
   - Service worker for web app
   - Local storage for upload queue (mobile)
   - Sync when connection restored
   - Clear offline indicators

3. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast ratios

### Compliance & Legal

1. **GDPR/Privacy**
   - User data deletion endpoint
   - Data export functionality
   - Privacy policy
   - Cookie consent (web)

2. **Content Moderation**
   - Consider AWS Rekognition for content filtering
   - Report inappropriate content
   - Admin moderation panel (future)

### DevOps

1. **Infrastructure as Code**
   - Terraform for AWS resources
   - Version control infrastructure
   - Environment parity (dev/staging/prod)

2. **CI/CD**
   - Automated testing on PR
   - Automated deployment to staging
   - Manual approval for production
   - Rollback capability

3. **Backup & Recovery**
   - Daily RDS snapshots
   - S3 versioning enabled
   - Disaster recovery plan
   - RTO: 4 hours, RPO: 1 hour

### Cost Optimization

1. **AWS Cost Management**
   - S3 lifecycle policies (move to Glacier after 90 days)
   - Right-size EC2/ECS instances
   - Use Spot instances for non-critical tasks
   - Delete orphaned resources

2. **Monitoring Costs**
   - CloudWatch cost dashboard
   - Budget alerts
   - Resource tagging for cost allocation

---

## Summary

This implementation plan provides:

✅ **Phase-based branching strategy** with clear PR boundaries
✅ **Detailed tech stack** with AWS-native services
✅ **Clean code standards** for Java, TypeScript, React
✅ **Comprehensive testing** at all levels
✅ **Security, scalability, reliability** considerations
✅ **Beautiful, responsive UI** for web and mobile
✅ **Production-ready** monitoring and deployment

### Estimated Timeline

- **Phase 1:** 1.5 days (Foundation)
- **Phase 2:** 1.5 days (Core Upload)
- **Phase 3:** 1 day (Web Client)
- **Phase 4:** 1.5 days (Mobile Client)
- **Phase 5:** 0.5 days (Optimization)

**Total:** ~5-6 days with focused development

### Success Metrics

- [ ] 100 concurrent uploads complete in <90 seconds
- [ ] API response time <200ms (p95)
- [ ] Zero data loss
- [ ] Web and mobile apps fully functional
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Clean, maintainable codebase

---

**Next Steps:**
1. Review and approve this plan
2. Set up AWS account and infrastructure (Phase 1)
3. Create repository and initial branches
4. Begin Phase 1 PRs
5. Daily standup to track progress

