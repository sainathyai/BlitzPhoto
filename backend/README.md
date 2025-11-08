# BlitzPhotoUpload Backend

High-performance photo upload system built with **Java 17** and **Spring Boot 3**, supporting 100 concurrent uploads with real-time progress tracking.

## Architecture

- **DDD (Domain-Driven Design):** Rich domain models with business logic
- **CQRS (Command Query Responsibility Segregation):** Separate read/write operations
- **VSA (Vertical Slice Architecture):** Feature-based organization

## Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 3.2.0
- **Database:** PostgreSQL 15
- **Cloud:** AWS (S3, SQS, CloudWatch)
- **Build Tool:** Maven
- **Testing:** JUnit 5, Testcontainers

## Project Structure

```
backend/
├── src/main/java/com/blitzphoto/
│   ├── BlitzPhotoApplication.java      # Main application
│   │
│   ├── domain/                          # Domain Layer (DDD)
│   │   ├── model/                       # Domain entities & value objects
│   │   ├── repository/                  # Repository interfaces
│   │   └── service/                     # Domain services
│   │
│   ├── application/                     # Application Layer (CQRS)
│   │   ├── commands/                    # Write operations
│   │   ├── queries/                     # Read operations
│   │   └── dto/                         # Data Transfer Objects
│   │
│   ├── infrastructure/                  # Infrastructure Layer
│   │   ├── config/                      # Configuration classes
│   │   ├── persistence/                 # JPA repositories
│   │   ├── storage/                     # S3 integration
│   │   └── messaging/                   # SQS integration
│   │
│   ├── api/                            # API Layer (Vertical Slices)
│   │   ├── upload/                      # Upload feature
│   │   ├── photo/                       # Photo query feature
│   │   ├── auth/                        # Authentication feature
│   │   └── health/                      # Health check
│   │
│   └── shared/                         # Shared utilities
│       ├── exception/                   # Exception handling
│       └── util/                        # Utility classes
│
└── src/main/resources/
    ├── application.yml                  # Main configuration
    ├── application-dev.yml              # Dev profile
    ├── application-prod.yml             # Production profile
    └── db/migration/                    # Flyway migrations
```

## Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **PostgreSQL 15** (or use AWS RDS)
- **AWS Account** with configured credentials
- **Docker** (optional, for local development)

## Getting Started

### 1. Clone Repository

```bash
cd backend
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your AWS and database credentials (from Terraform outputs):

```properties
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PASSWORD=your-password
S3_UPLOADS_BUCKET=your-bucket-name
SQS_UPLOAD_QUEUE_URL=your-queue-url
JWT_SECRET=your-secret-key
```

### 3. Build the Project

```bash
./mvnw clean install
```

### 4. Run the Application

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Or with environment variables:

```bash
export $(cat .env | xargs) && ./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

### 5. Verify It's Running

```bash
curl http://localhost:8080/api/v1/health
```

Expected response:

```json
{
  "status": "UP",
  "timestamp": "2025-11-08T10:00:00Z",
  "service": "BlitzPhotoUpload Backend",
  "version": "1.0.0"
}
```

### 6. Access Swagger UI

Open your browser: http://localhost:8080/swagger-ui.html

## Development

### Running Tests

```bash
# Unit tests
./mvnw test

# Integration tests (with Testcontainers)
./mvnw verify

# With coverage report
./mvnw clean test jacoco:report
# Report: target/site/jacoco/index.html
```

### Database Migrations

Migrations are managed by Flyway and run automatically on startup.

```bash
# Check migration status
./mvnw flyway:info

# Run migrations manually
./mvnw flyway:migrate

# Rollback last migration
./mvnw flyway:undo
```

### Code Style

```bash
# Format code
./mvnw spring-javaformat:apply

# Check code style
./mvnw spring-javaformat:validate
```

## Configuration

### Profiles

- **dev:** Development (verbose logging, H2 in-memory option)
- **test:** Testing (Testcontainers, mocked AWS)
- **prod:** Production (minimal logging, stricter security)

Set profile via environment variable:

```bash
export SPRING_PROFILES_ACTIVE=dev
```

### Key Configuration Properties

| Property | Description | Default |
|----------|-------------|---------|
| `server.port` | Server port | 8080 |
| `blitzphoto.upload.max-files-per-job` | Max files per upload job | 100 |
| `blitzphoto.upload.max-file-size-mb` | Max file size (MB) | 50 |
| `blitzphoto.aws.s3.presigned-url-expiration-minutes` | Pre-signed URL expiration | 15 |
| `blitzphoto.security.jwt.expiration-ms` | JWT token expiration | 900000 (15 min) |

## API Endpoints

### Health Check

```
GET /api/v1/health
GET /api/v1/health/ping
```

### Upload (Phase 2)

```
POST   /api/v1/upload/initiate
POST   /api/v1/upload/complete
GET    /api/v1/upload/status/{jobId}
```

### Authentication (Phase 1 PR 1.4)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
```

### Photos (Phase 2)

```
GET    /api/v1/photos
GET    /api/v1/photos/{id}
PATCH  /api/v1/photos/{id}/tags
DELETE /api/v1/photos/{id}
```

## Troubleshooting

### Issue: Cannot connect to database

**Solution:** Check that:
1. PostgreSQL is running
2. Database credentials in `.env` are correct
3. Database `blitzphoto` exists
4. Network security group allows connections

### Issue: AWS credentials not found

**Solution:** 
1. Set AWS credentials in `.env`
2. Or use AWS CLI: `aws configure`
3. Or use IAM role (recommended for EC2/ECS)

### Issue: Tests fail with Testcontainers

**Solution:**
1. Ensure Docker is running
2. Give Docker enough resources (4GB RAM recommended)

### Issue: Application won't start

**Solution:**
1. Check logs: `tail -f logs/blitzphoto.log`
2. Verify all required environment variables are set
3. Check port 8080 is not in use: `lsof -i :8080`

## Docker

### Build Docker Image

```bash
docker build -t blitzphoto-backend .
```

### Run with Docker

```bash
docker run -p 8080:8080 \
  -e DB_HOST=your-rds-endpoint \
  -e DB_PASSWORD=your-password \
  -e S3_UPLOADS_BUCKET=your-bucket \
  -e SQS_UPLOAD_QUEUE_URL=your-queue-url \
  blitzphoto-backend
```

### Docker Compose (Local Development)

```bash
docker-compose up
```

## Performance

### Concurrency

- Supports **100 concurrent uploads** via thread pool
- Async processing with Spring `@Async`
- SQS for decoupled upload processing

### Database

- Connection pooling (HikariCP)
- Optimized queries with JPA
- Database indexes for performance

### Caching

- Caffeine in-memory cache
- Cache photo metadata and pre-signed URLs

## Contributing

1. Follow clean code standards (see `IMPLEMENTATION_PLAN.md`)
2. Write tests for new features
3. Update API documentation
4. Run tests before committing: `./mvnw verify`

## Next Steps

- [ ] Complete PR 1.3: Database Schema & Migrations
- [ ] Complete PR 1.4: JWT Authentication
- [ ] Complete PR 2.1: S3 Integration
- [ ] Complete PR 2.2: Upload Commands (CQRS)

---

**Built with ❤️ by BlitzPhoto Team**

