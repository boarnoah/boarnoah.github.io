output "site_bucket_name" {
  value = aws_s3_bucket.this.bucket
}

output "site_bucket_arn" {
  value = aws_s3_bucket.this.arn
}
