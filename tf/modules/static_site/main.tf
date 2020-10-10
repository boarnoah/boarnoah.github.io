locals {
  site_origin_id = "${var.namespace}=${var.app}-static-site"
}

provider "aws" {
  alias = "us_e_1"
}

resource "aws_s3_bucket" "this" {
  bucket = "${var.namespace}-${var.app}-statics"
}

resource "aws_cloudfront_origin_access_identity" "this" {
  comment = "${var.namespace}-${var.app} cloudfront access"
}

data "aws_iam_policy_document" "cdn_s3_access" {
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
  policy = data.aws_iam_policy_document.cdn_s3_access.json
}

# Friendly URL rewrite lambda
data "aws_iam_policy_document" "prettify_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
      type        = "Service"
    }
    effect = "Allow"
  }
}

resource "aws_iam_role" "this" {
  name               = "${var.app}-${var.namespace}-prettify-url-exec"
  description        = "Exec role for lambda that prettifies URLs for website"
  assume_role_policy = data.aws_iam_policy_document.prettify_assume.json
}

data "archive_file" "main" {
  type        = "zip"
  source_file = "${path.module}/rewrite-lambda/index.js"
  output_path = "${path.module}/rewrite-lambda/index.zip"
}

resource "aws_lambda_function" "this" {
  function_name    = "${var.namespace}-${var.app}-cdn-prettify-urls"
  handler          = "index.handler"
  role             = aws_iam_role.this.arn
  runtime          = "nodejs12.x"
  filename         = data.archive_file.main.output_path
  source_code_hash = data.archive_file.main.output_base64sha256
  publish          = true
  provider         = aws.us_e_1
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
    lambda_function_association {
      event_type = "origin-request"
      lambda_arn = aws_lambda_function.this.qualified_arn
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
