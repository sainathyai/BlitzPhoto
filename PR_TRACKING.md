# PR Tracking - RapidPhotoUpload

## Branching Strategy Visualization

```
main (production)
  ↑
  └── merge when ready for production
        ↑
      develop (integration)
        ↑
        ├── phase-1/foundation ────────────────────────┐
        │     ↑                                         │
        │     ├── pr/phase1-aws-infrastructure         │ Merge to develop
        │     ├── pr/phase1-backend-scaffold           │ when phase complete
        │     ├── pr/phase1-database-schema            │
        │     └── pr/phase1-auth-jwt                   │
        │                                               │
        ├── phase-2/core-upload ───────────────────────┤
        │     ↑                                         │
        │     ├── pr/phase2-s3-integration             │
        │     ├── pr/phase2-upload-command             │
        │     ├── pr/phase2-async-processing           │
        │     └── pr/phase2-upload-controller          │
        │                                               │
        ├── phase-3/web-client ────────────────────────┤
        │     ↑                                         │
        │     ├── pr/phase3-web-setup                  │
        │     ├── pr/phase3-upload-ui                  │
        │     ├── pr/phase3-progress-tracking          │
        │     └── pr/phase3-photo-gallery              │
        │                                               │
        ├── phase-4/mobile-client ─────────────────────┤
        │     ↑                                         │
        │     ├── pr/phase4-mobile-setup               │
        │     ├── pr/phase4-camera-integration         │
        │     ├── pr/phase4-background-upload          │
        │     └── pr/phase4-mobile-gallery             │
        │                                               │
        └── phase-5/optimization ──────────────────────┘
              ↑
              ├── pr/phase5-performance-tuning
              ├── pr/phase5-monitoring
              └── pr/phase5-documentation
```

---

## Phase 1: Foundation & Infrastructure

### Status Overview
| PR # | Name | Status | Owner | Reviewer | Priority | Est. Hours |
|------|------|--------|-------|----------|----------|------------|
| 1.1  | AWS Infrastructure Setup | ⚪ Pending | TBD | TBD | P0 | 6h |
| 1.2  | Backend Project Scaffold | ⚪ Pending | TBD | TBD | P0 | 4h |
| 1.3  | Database Schema & Migrations | ⚪ Pending | TBD | TBD | P0 | 4h |
| 1.4  | JWT Authentication & Security | ⚪ Pending | TBD | TBD | P0 | 4h |

**Legend:**
- ⚪ Pending
- 🔵 In Progress
- 🟢 Approved
- 🟡 Changes Requested
- ✅ Merged

---

### PR 1.1: AWS Infrastructure Setup
**Branch:** `pr/phase1-aws-infrastructure` → `phase-1/foundation`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] VPC and subnets created
- [ ] RDS PostgreSQL provisioned
- [ ] S3 buckets created (uploads, thumbnails)
- [ ] SQS queue created
- [ ] ECR repository created
- [ ] IAM roles configured
- [ ] CloudWatch log groups set up
- [ ] Terraform/CloudFormation validated
- [ ] Infrastructure can be torn down/recreated
- [ ] Documentation updated

**Testing:**
- [ ] Can connect to RDS from local machine
- [ ] Can upload test file to S3
- [ ] Can send/receive SQS message
- [ ] IAM roles have correct permissions

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 1.2: Backend Project Scaffold
**Branch:** `pr/phase1-backend-scaffold` → `phase-1/foundation`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Spring Boot project initialized
- [ ] DDD folder structure created
- [ ] Dependencies added to pom.xml
- [ ] application.yml configured (dev, test, prod)
- [ ] Exception handling framework implemented
- [ ] Logging configuration set up
- [ ] Swagger/OpenAPI configured
- [ ] Health check endpoint works
- [ ] Docker image builds successfully
- [ ] README with setup instructions

**Testing:**
- [ ] Application starts without errors
- [ ] Health check returns 200 OK
- [ ] Swagger UI accessible
- [ ] Logs output correctly

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 1.3: Database Schema & Migrations
**Branch:** `pr/phase1-database-schema` → `phase-1/foundation`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Flyway migration scripts created
- [ ] Users table created
- [ ] Upload_jobs table created
- [ ] Photos table created
- [ ] Indexes added for performance
- [ ] Foreign key constraints defined
- [ ] JPA entities created
- [ ] Repository interfaces created
- [ ] Entity mapping validated
- [ ] Migration rollback tested

**Testing:**
- [ ] Migrations run successfully
- [ ] JPA entities save/retrieve correctly
- [ ] Foreign key constraints work
- [ ] Testcontainers tests pass
- [ ] Database seeding works

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 1.4: JWT Authentication & Security
**Branch:** `pr/phase1-auth-jwt` → `phase-1/foundation`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] JWT token generation implemented
- [ ] JWT validation filter created
- [ ] Spring Security configured
- [ ] BCrypt password hashing
- [ ] Register endpoint implemented
- [ ] Login endpoint implemented
- [ ] Refresh token endpoint implemented
- [ ] CORS configuration added
- [ ] Security tests written
- [ ] API documentation updated

**Testing:**
- [ ] User can register
- [ ] User can login and receive token
- [ ] Token validated on protected endpoints
- [ ] Invalid tokens rejected
- [ ] CORS allows frontend requests
- [ ] Integration tests pass

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

## Phase 2: Core Upload System

### Status Overview
| PR # | Name | Status | Owner | Reviewer | Priority | Est. Hours |
|------|------|--------|-------|----------|----------|------------|
| 2.1  | S3 Storage Service | ⚪ Pending | TBD | TBD | P0 | 6h |
| 2.2  | Upload Command & Domain Logic | ⚪ Pending | TBD | TBD | P0 | 6h |
| 2.3  | Async Processing with SQS | ⚪ Pending | TBD | TBD | P0 | 6h |
| 2.4  | Upload REST API Controllers | ⚪ Pending | TBD | TBD | P0 | 4h |

---

### PR 2.1: S3 Storage Service
**Branch:** `pr/phase2-s3-integration` → `phase-2/core-upload`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 1.1, PR 1.2  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] S3StorageService implemented
- [ ] PresignedUrlService implemented
- [ ] Multipart upload support
- [ ] File validation (type, size)
- [ ] Retry logic with exponential backoff
- [ ] S3 configuration externalized
- [ ] LocalStack tests written
- [ ] Error handling comprehensive
- [ ] Performance optimized
- [ ] Documentation complete

**Testing:**
- [ ] Can upload file to S3
- [ ] Pre-signed URLs generated correctly
- [ ] Pre-signed URLs expire properly
- [ ] Multipart upload works for large files
- [ ] File validation rejects invalid files
- [ ] LocalStack integration tests pass

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 2.2: Upload Command & Domain Logic
**Branch:** `pr/phase2-upload-command` → `phase-2/core-upload`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 1.3  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Photo domain model created
- [ ] UploadJob domain model created
- [ ] Domain validation rules implemented
- [ ] InitiateUploadCommand created
- [ ] InitiateUploadCommandHandler created
- [ ] CompleteUploadCommand created
- [ ] CompleteUploadCommandHandler created
- [ ] UpdateProgressCommand created
- [ ] Repository implementations complete
- [ ] Unit tests for domain logic

**Testing:**
- [ ] Domain validation prevents invalid states
- [ ] Commands execute successfully
- [ ] Command handlers are transactional
- [ ] Unit tests cover all scenarios
- [ ] Integration tests pass

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 2.3: Async Processing with SQS
**Branch:** `pr/phase2-async-processing` → `phase-2/core-upload`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 1.1, PR 2.2  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] SqsMessageSender implemented
- [ ] SqsMessageListener implemented
- [ ] Message handler logic complete
- [ ] Retry logic with exponential backoff
- [ ] Dead-letter queue configured
- [ ] Idempotent message processing
- [ ] Batch processing support
- [ ] Error handling robust
- [ ] LocalStack SQS tests
- [ ] Performance validated

**Testing:**
- [ ] Messages sent to SQS
- [ ] Listeners process messages
- [ ] Failed messages retry
- [ ] DLQ receives permanent failures
- [ ] No message loss
- [ ] Idempotency prevents duplicates

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 2.4: Upload REST API Controllers
**Branch:** `pr/phase2-upload-controller` → `phase-2/core-upload`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 2.1, PR 2.2  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] UploadController implemented
- [ ] Initiate upload endpoint
- [ ] Complete upload endpoint
- [ ] Upload status endpoint
- [ ] Progress update endpoint
- [ ] Request validation
- [ ] Response DTOs created
- [ ] Rate limiting configured
- [ ] Swagger documentation
- [ ] Integration tests complete

**Testing:**
- [ ] All endpoints respond correctly
- [ ] Request validation works
- [ ] Pre-signed URLs returned
- [ ] Upload status tracked
- [ ] Rate limiting enforced
- [ ] Integration tests pass

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

## Phase 3: Web Client

### Status Overview
| PR # | Name | Status | Owner | Reviewer | Priority | Est. Hours |
|------|------|--------|-------|----------|----------|------------|
| 3.1  | Web Application Setup | ⚪ Pending | TBD | TBD | P0 | 4h |
| 3.2  | Upload UI with Drag-Drop | ⚪ Pending | TBD | TBD | P0 | 6h |
| 3.3  | Real-Time Progress Tracking | ⚪ Pending | TBD | TBD | P0 | 6h |
| 3.4  | Photo Gallery & Management | ⚪ Pending | TBD | TBD | P1 | 4h |

---

### PR 3.1: Web Application Setup
**Branch:** `pr/phase3-web-setup` → `phase-3/web-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 1.4 (Auth API)  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Vite + React + TypeScript initialized
- [ ] Tailwind CSS configured
- [ ] shadcn/ui components installed
- [ ] Project structure created
- [ ] Axios instance configured
- [ ] React Query set up
- [ ] Zustand stores created
- [ ] Routing configured
- [ ] Authentication context
- [ ] Environment variables

**Testing:**
- [ ] Dev server runs
- [ ] No console errors
- [ ] TypeScript strict mode enabled
- [ ] Routing works
- [ ] API calls succeed

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 3.2: Upload UI with Drag-Drop
**Branch:** `pr/phase3-upload-ui` → `phase-3/web-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 3.1  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Upload dropzone component
- [ ] File selection (browser + drag-drop)
- [ ] File preview thumbnails
- [ ] File list with remove
- [ ] File validation UI
- [ ] Upload button with loading state
- [ ] Batch size indicator
- [ ] Responsive design
- [ ] Accessibility features
- [ ] Component tests

**Testing:**
- [ ] Files can be selected
- [ ] Drag-drop works
- [ ] Thumbnails displayed
- [ ] Invalid files rejected
- [ ] Max 100 files enforced
- [ ] Responsive on mobile
- [ ] Keyboard accessible

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 3.3: Real-Time Progress Tracking
**Branch:** `pr/phase3-progress-tracking` → `phase-3/web-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 3.2, PR 2.4 (Upload API)  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] WebSocket connection (Socket.io)
- [ ] Progress bar component
- [ ] Individual file progress
- [ ] Overall batch progress
- [ ] Upload speed display
- [ ] Time remaining estimate
- [ ] Success/failure states
- [ ] Retry functionality
- [ ] Cancel functionality
- [ ] Toast notifications

**Testing:**
- [ ] Progress updates in real-time
- [ ] WebSocket reconnects
- [ ] Failed uploads can retry
- [ ] Cancel works correctly
- [ ] No memory leaks
- [ ] Notifications appear

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 3.4: Photo Gallery & Management
**Branch:** `pr/phase3-photo-gallery` → `phase-3/web-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 3.1  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Photo gallery grid view
- [ ] Infinite scroll/pagination
- [ ] Photo detail modal
- [ ] Search and filter
- [ ] Tagging functionality
- [ ] Download button
- [ ] Delete functionality
- [ ] Photo metadata display
- [ ] Responsive design
- [ ] Component tests

**Testing:**
- [ ] Gallery displays photos
- [ ] Infinite scroll works
- [ ] Modal shows full-size
- [ ] Photos can be tagged
- [ ] Photos can be deleted
- [ ] Photos can be downloaded
- [ ] Search/filter works
- [ ] Responsive on all screens

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

## Phase 4: Mobile Client

### Status Overview
| PR # | Name | Status | Owner | Reviewer | Priority | Est. Hours |
|------|------|--------|-------|----------|----------|------------|
| 4.1  | Mobile Application Setup | ⚪ Pending | TBD | TBD | P0 | 4h |
| 4.2  | Camera & Gallery Integration | ⚪ Pending | TBD | TBD | P0 | 6h |
| 4.3  | Background Upload System | ⚪ Pending | TBD | TBD | P0 | 8h |
| 4.4  | Mobile Gallery & UI Polish | ⚪ Pending | TBD | TBD | P1 | 6h |

---

### PR 4.1: Mobile Application Setup
**Branch:** `pr/phase4-mobile-setup` → `phase-4/mobile-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 1.4 (Auth API)  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] React Native (Expo) initialized
- [ ] TypeScript configured
- [ ] Navigation set up
- [ ] State management (Zustand + React Query)
- [ ] API client configured
- [ ] Environment variables
- [ ] Authentication flow
- [ ] Theme configuration
- [ ] Base components
- [ ] Runs on iOS and Android

**Testing:**
- [ ] App runs on iOS
- [ ] App runs on Android
- [ ] Navigation works
- [ ] Authentication flow complete
- [ ] No TypeScript errors

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 4.2: Camera & Gallery Integration
**Branch:** `pr/phase4-camera-integration` → `phase-4/mobile-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 4.1  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Camera access implemented
- [ ] Photo library access
- [ ] Photo picker UI
- [ ] Permission handling
- [ ] Multi-select (up to 100)
- [ ] Local thumbnail generation
- [ ] Photo preview
- [ ] EXIF data extraction
- [ ] Works on iOS
- [ ] Works on Android

**Testing:**
- [ ] Can take photos
- [ ] Can select from gallery
- [ ] Multi-select works
- [ ] Permissions requested
- [ ] Thumbnails generated
- [ ] EXIF data extracted
- [ ] No performance issues

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 4.3: Background Upload System
**Branch:** `pr/phase4-background-upload` → `phase-4/mobile-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 4.2, PR 2.4 (Upload API)  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Background upload service
- [ ] Native background transfer
- [ ] Upload queue management
- [ ] Retry logic
- [ ] Background/foreground handling
- [ ] Local state persistence
- [ ] Upload notifications
- [ ] Network connectivity handling
- [ ] Battery-efficient
- [ ] Works on iOS and Android

**Testing:**
- [ ] Uploads continue in background
- [ ] Uploads persist on restart
- [ ] Failed uploads retry
- [ ] Network changes handled
- [ ] Notifications work
- [ ] Can pause/resume
- [ ] Battery-efficient

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 4.4: Mobile Gallery & UI Polish
**Branch:** `pr/phase4-mobile-gallery` → `phase-4/mobile-client`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** PR 4.1  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Photo gallery screen
- [ ] Infinite scroll
- [ ] Pull-to-refresh
- [ ] Photo detail screen
- [ ] Photo management (delete, tag)
- [ ] Offline mode indicators
- [ ] Haptic feedback
- [ ] Smooth animations (60fps)
- [ ] Works on iOS
- [ ] Works on Android

**Testing:**
- [ ] Gallery loads efficiently
- [ ] Infinite scroll smooth
- [ ] Pull-to-refresh works
- [ ] Photo detail polished
- [ ] Animations smooth
- [ ] Haptics natural
- [ ] Works offline

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

## Phase 5: Optimization & Production Ready

### Status Overview
| PR # | Name | Status | Owner | Reviewer | Priority | Est. Hours |
|------|------|--------|-------|----------|----------|------------|
| 5.1  | Performance Optimization | ⚪ Pending | TBD | TBD | P0 | 6h |
| 5.2  | Monitoring & Observability | ⚪ Pending | TBD | TBD | P0 | 4h |
| 5.3  | Documentation & Deployment | ⚪ Pending | TBD | TBD | P0 | 4h |

---

### PR 5.1: Performance Optimization
**Branch:** `pr/phase5-performance-tuning` → `phase-5/optimization`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** All Phase 1-4 PRs  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] Database query optimization
- [ ] Caching implemented (Redis/Caffeine)
- [ ] CDN configured (CloudFront)
- [ ] S3 Transfer Acceleration
- [ ] Response compression (gzip)
- [ ] Connection pool tuning
- [ ] Frontend bundle optimization
- [ ] Lazy loading components
- [ ] Image optimization
- [ ] Performance benchmarks met

**Testing:**
- [ ] API response <200ms (p95)
- [ ] Database query <50ms (p95)
- [ ] Frontend bundle <500KB
- [ ] Cache hit rate >80%
- [ ] No memory leaks
- [ ] 100 uploads in <90 seconds

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 5.2: Monitoring & Observability
**Branch:** `pr/phase5-monitoring` → `phase-5/optimization`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** All Phase 1-4 PRs  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] CloudWatch logs configured
- [ ] Custom metrics implemented
- [ ] CloudWatch alarms set up
- [ ] X-Ray tracing enabled
- [ ] Health check endpoints
- [ ] Monitoring dashboard created
- [ ] Error tracking (optional Sentry)
- [ ] Performance metrics tracked
- [ ] Alerts tested
- [ ] Documentation complete

**Testing:**
- [ ] Logs sent to CloudWatch
- [ ] Metrics visible
- [ ] Alarms trigger correctly
- [ ] X-Ray traces visible
- [ ] Dashboard shows data
- [ ] Health checks respond

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

### PR 5.3: Documentation & Deployment
**Branch:** `pr/phase5-documentation` → `phase-5/optimization`

**Owner:** _________  
**Reviewer:** _________  
**Status:** ⚪ Pending  
**Dependencies:** All Phase 1-5 PRs  
**Started:** _________  
**Completed:** _________  

**Checklist:**
- [ ] README comprehensive
- [ ] API fully documented
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Environment variables documented
- [ ] CI/CD pipeline created
- [ ] Testing guide
- [ ] Troubleshooting guide
- [ ] Pipeline working
- [ ] All documentation reviewed

**Testing:**
- [ ] CI/CD pipeline runs
- [ ] Tests pass in pipeline
- [ ] Docker builds succeed
- [ ] Deployment automated
- [ ] Documentation accurate

**Blockers/Issues:**
_None_

**Notes:**
_Add any relevant notes here_

---

## Sprint Schedule (5-Day Plan)

### Day 1: Foundation
- **Morning:** PR 1.1 (AWS Infrastructure)
- **Afternoon:** PR 1.2 (Backend Scaffold)
- **Evening:** PR 1.3 (Database Schema)

### Day 2: Core Backend
- **Morning:** PR 1.4 (JWT Auth)
- **Midday:** PR 2.1 (S3 Integration)
- **Afternoon:** PR 2.2 (Upload Commands)
- **Evening:** PR 2.3 (Async Processing)

### Day 3: Backend + Web
- **Morning:** PR 2.4 (Upload Controllers)
- **Midday:** PR 3.1 (Web Setup)
- **Afternoon:** PR 3.2 (Upload UI)
- **Evening:** PR 3.3 (Progress Tracking)

### Day 4: Web + Mobile
- **Morning:** PR 3.4 (Photo Gallery)
- **Midday:** PR 4.1 (Mobile Setup)
- **Afternoon:** PR 4.2 (Camera Integration)
- **Evening:** PR 4.3 (Background Upload)

### Day 5: Mobile + Optimization
- **Morning:** PR 4.4 (Mobile Gallery)
- **Midday:** PR 5.1 (Performance)
- **Afternoon:** PR 5.2 (Monitoring)
- **Evening:** PR 5.3 (Documentation)

---

## Daily Standup Template

**Date:** __________

**Completed Yesterday:**
- 

**Working on Today:**
- 

**Blockers:**
- 

**Notes:**
- 

---

## Notes Section

### Team Decisions
_Document any architectural or implementation decisions here_

### Lessons Learned
_Document any lessons learned during implementation_

### Future Enhancements
_Ideas for future improvements_

---

**Last Updated:** __________

