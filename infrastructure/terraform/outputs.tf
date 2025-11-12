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

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.backend.name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = aws_ecs_task_definition.backend.arn
}

# ALB Outputs
output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_target_group_arn" {
  description = "ALB target group ARN"
  value       = aws_lb_target_group.backend.arn
}

# ECR Repository (will be created via script)
output "ecr_repository_url" {
  description = "ECR repository URL for backend"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project_name}-backend-${var.environment}"
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Frontend URL (HTTPS)"
  value       = "https://blitzphoto.sainathyai.com"
}

