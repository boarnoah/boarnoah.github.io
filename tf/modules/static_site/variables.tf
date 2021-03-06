variable "namespace" {
  type = string
}

variable "app" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "domain" {
  type        = string
  description = "Domain name for website"
}

variable "site_acm_arn" {
  type        = string
  description = "ARN of ACM Certificate for website"
}
