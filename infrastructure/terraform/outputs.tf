output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.postgres.db_name
}

output "s3_uploads_bucket" {
  description = "S3 bucket for uploads"
  value       = aws_s3_bucket.uploads.id
}

output "s3_thumbnails_bucket" {
  description = "S3 bucket for thumbnails"
  value       = aws_s3_bucket.thumbnails.id
}

output "sqs_upload_queue_url" {
  description = "SQS upload queue URL"
  value       = aws_sqs_queue.upload_queue.url
}

output "sqs_upload_dlq_url" {
  description = "SQS dead letter queue URL"
  value       = aws_sqs_queue.upload_dlq.url
}

output "backend_security_group_id" {
  description = "Backend security group ID"
  value       = aws_security_group.backend.id
}

output "backend_iam_role_arn" {
  description = "Backend IAM role ARN"
  value       = aws_iam_role.backend.arn
}

output "backend_instance_profile_name" {
  description = "Backend instance profile name"
  value       = aws_iam_instance_profile.backend.name
}

# Sensitive outputs
output "rds_username" {
  description = "RDS master username"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}

output "connection_string" {
  description = "Database connection string"
  value       = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
  sensitive   = true
}

