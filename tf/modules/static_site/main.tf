locals {
  site_origin_id = "${var.namespace}=${var.app}-static-site"
}

resource "aws_s3_bucket" "this" {
  bucket = "${var.namespace}-${var.app}-statics"
  region = var.aws_region
}

resource "aws_cloudfront_origin_access_identity" "this" {
  comment = "${var.namespace}-${var.app} cloudfront access"
}

data "aws_iam_policy_document" "this" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
    principals {
      identifiers = [aws_cloudfront_origin_access_identity.this.iam_arn]
      type        = "AWS"
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.bucket
  policy = data.aws_iam_policy_document.this.json
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  default_root_object = "index.html"
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    target_origin_id       = local.site_origin_id
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  origin {
    domain_name = aws_s3_bucket.this.bucket_domain_name
    origin_id   = local.site_origin_id
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.this.cloudfront_access_identity_path
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    acm_certificate_arn      = var.site_acm_arn
    minimum_protocol_version = "TLSv1.2_2018"
    ssl_support_method       = "sni-only"
  }
  aliases = [var.domain, "www.${var.domain}"]
}
