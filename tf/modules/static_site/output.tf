output "site_bucket_name" {
  value = aws_s3_bucket.this.bucket
}

output "site_bucket_arn" {
  value = aws_s3_bucket.this.arn
}

output "site_cdn_address" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "site_cdn_zone" {
  value = aws_cloudfront_distribution.this.hosted_zone_id
}
