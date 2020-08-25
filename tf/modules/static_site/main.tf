resource "aws_s3_bucket" "this" {
  bucket = "${var.namespace}-${var.app}-statics"
  region = var.aws_region
}
