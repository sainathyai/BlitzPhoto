# Route 53 Configuration for blitzphoto.sainathyai.com

# Get the hosted zone for sainathyai.com
data "aws_route53_zone" "main" {
  name         = "sainathyai.com"
  private_zone = false
}

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "cloudfront" {
  provider = aws.us_east_1

  domain_name       = "blitzphoto.sainathyai.com"
  validation_method = "DNS"

  subject_alternative_names = [
    "*.blitzphoto.sainathyai.com"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-cloudfront-cert-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Certificate validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cloudfront.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "cloudfront" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

