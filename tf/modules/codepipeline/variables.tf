variable "namespace" {
  type = string
}

variable "app" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "repo_branch" {
  type = string
}

variable "site_bucket_name" {
  type        = string
  description = "Name of bucket to send built site's static content to"
}

variable "site_bucket_arn" {
  type        = string
  description = "ARN of bucket to send built site's static content to"
}
