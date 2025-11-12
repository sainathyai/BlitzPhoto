# Deployment Errors Log

## Error 1: Logback FILE Appender
- **Description**: Backend crashing with `FileNotFoundException: logs/blitzphoto.log` - ECS container doesn't have logs directory
- **Tries**: 3 attempts to fix logback configuration
- **Resolution**: Removed FILE appender from logback-spring.xml for dev/prod profiles, kept only CONSOLE appender (CloudWatch captures console logs)

## Error 2: CORS Policy Blocked
- **Description**: `Access-Control-Allow-Origin` header missing - frontend couldn't call backend API
- **Tries**: 2 attempts (updated application-dev.yml, then ECS environment variable)
- **Resolution**: Added S3 frontend URL and CloudFront domain to CORS_ALLOWED_ORIGINS in both application-dev.yml and ECS task definition

## Error 3: Database DNS Resolution Failure
- **Description**: `UnknownHostException: sainathyai-db-dev...:5432` - port included in hostname causing DNS failure
- **Tries**: 1 attempt
- **Resolution**: Changed Terraform from `aws_db_instance.postgres.endpoint` (includes port) to `aws_db_instance.postgres.address` (hostname only)

## Error 4: PostgreSQL Authentication Failure
- **Description**: `FATAL: no pg_hba.conf entry, no encryption` - RDS requires SSL but connection had SSL disabled
- **Tries**: 1 attempt
- **Resolution**: Changed `sslmode` from `disable` to `require` in application.yml datasource URL

## Error 5: Mixed Content Error
- **Description**: HTTPS frontend trying to call HTTP API endpoint - browser blocked insecure requests
- **Tries**: 1 attempt
- **Resolution**: Updated frontend env.ts to detect CloudFront domain and use HTTPS API URL (`https://blitzphoto.sainathyai.com/api/v1`), rebuilt and deployed

## Error 6: S3 Static Hosting 404 on Routes
- **Description**: Direct access to `/login` returns 404 - S3 doesn't support client-side routing
- **Tries**: N/A (expected behavior)
- **Resolution**: Configured CloudFront with custom error responses (404/403 → index.html) and SPA routing support

