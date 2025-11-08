# IAM Role for Backend Application
resource "aws_iam_role" "backend" {
  name = "${var.project_name}-backend-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-backend-role-${var.environment}"
  }
}

# IAM Policy for S3 Access
resource "aws_iam_role_policy" "backend_s3" {
  name = "${var.project_name}-backend-s3-policy-${var.environment}"
  role = aws_iam_role.backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*",
          aws_s3_bucket.thumbnails.arn,
          "${aws_s3_bucket.thumbnails.arn}/*"
        ]
      }
    ]
  })
}

# IAM Policy for SQS Access
resource "aws_iam_role_policy" "backend_sqs" {
  name = "${var.project_name}-backend-sqs-policy-${var.environment}"
  role = aws_iam_role.backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
        Resource = [
          aws_sqs_queue.upload_queue.arn,
          aws_sqs_queue.upload_dlq.arn
        ]
      }
    ]
  })
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_role_policy" "backend_cloudwatch" {
  name = "${var.project_name}-backend-cloudwatch-policy-${var.environment}"
  role = aws_iam_role.backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/${var.project_name}/*"
      }
    ]
  })
}

# Instance Profile (for EC2)
resource "aws_iam_instance_profile" "backend" {
  name = "${var.project_name}-backend-instance-profile-${var.environment}"
  role = aws_iam_role.backend.name
}

