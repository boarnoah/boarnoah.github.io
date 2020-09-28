variable "namespace" {
  type = string
}

variable "app" {
  type = string
}

variable "domain" {
  type        = string
  description = "Domain name for website"
}

variable "zone_id" {
  type        = string
  description = "ID of Route53 Zone in which to place these certificate validation records"
}
