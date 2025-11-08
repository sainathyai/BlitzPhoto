# CloudWatch Log Group for Backend Application
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/aws/${var.project_name}/backend-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "${var.project_name}-backend-logs-${var.environment}"
  }
}

# CloudWatch Log Group for Upload Processing
resource "aws_cloudwatch_log_group" "upload_processing" {
  name              = "/aws/${var.project_name}/upload-processing-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "${var.project_name}-upload-processing-logs-${var.environment}"
  }
}

