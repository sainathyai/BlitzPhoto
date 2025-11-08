# SQS Queue for Upload Processing
resource "aws_sqs_queue" "upload_queue" {
  name                       = "${var.project_name}-upload-queue-${var.environment}"
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  message_retention_seconds  = 86400  # 1 day
  receive_wait_time_seconds  = 10     # Long polling
  visibility_timeout_seconds = 300    # 5 minutes

  # Dead Letter Queue
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.upload_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "${var.project_name}-upload-queue-${var.environment}"
  }
}

# Dead Letter Queue
resource "aws_sqs_queue" "upload_dlq" {
  name                      = "${var.project_name}-upload-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name = "${var.project_name}-upload-dlq-${var.environment}"
  }
}

# SQS Queue Policy (allow backend to send messages)
resource "aws_sqs_queue_policy" "upload_queue" {
  queue_url = aws_sqs_queue.upload_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowBackendSendMessage"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.backend.arn
        }
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.upload_queue.arn
      }
    ]
  })
}

