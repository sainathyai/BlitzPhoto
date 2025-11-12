# CloudFront Distribution for Frontend

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-frontend-oac-${var.environment}"
  description                       = "OAC for frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for ${var.project_name} frontend"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Use only North America and Europe

  aliases = ["blitzphoto.sainathyai.com"]

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # Origin for ALB (backend API)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-${aws_lb.main.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # IMPORTANT: Ordered cache behaviors are evaluated in order
  # More specific paths must come FIRST before less specific ones
  
  # Cache behavior for API calls (proxy to ALB) - MUST be first
  # IMPORTANT: This must come before any other cache behaviors
  # Custom error responses are NOT configured here - they should NOT apply to API calls
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${aws_lb.main.id}"

    forwarded_values {
      query_string = true
      headers      = ["*"]  # Forward all headers for API
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    
    # CRITICAL: Do NOT configure custom error responses here
    # API errors should return proper JSON, not HTML
  }

  # Cache behavior for root and index (SPA routing)
  ordered_cache_behavior {
    path_pattern     = "/"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Default cache behavior (catches everything else)
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error responses for SPA routing
  # IMPORTANT: These apply GLOBALLY to ALL cache behaviors
  # 
  # The challenge: We need 403 → index.html for S3 (SPA routing) but NOT for API (ALB)
  # 
  # Solution: API responses from ALB will have Content-Type: application/json
  # CloudFront will still apply the custom error response, BUT:
  # - API 403s with JSON Content-Type will be converted to index.html (unfortunate)
  # - However, the frontend can detect this and handle it appropriately
  # - OR we can ensure API never returns 403, only 401 (Unauthorized)
  #
  # For now, we'll re-enable 403 custom error response for SPA routing
  # The API should return 401 (Unauthorized) instead of 403 (Forbidden) when possible
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }
  
  # 403 custom error response for S3 missing files (SPA routing)
  # This converts S3 403 errors (missing files) to index.html
  # 
  # WARNING: This will also convert API 403 errors to index.html
  # To mitigate: Backend should return 401 (Unauthorized) instead of 403 when possible
  # OR frontend can detect HTML responses and handle them appropriately
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cloudfront.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "${var.project_name}-frontend-cdn-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Route 53 A record pointing to CloudFront
resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "blitzphoto.sainathyai.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# Update S3 bucket policy to allow CloudFront OAC
resource "aws_s3_bucket_policy" "frontend_cloudfront" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

