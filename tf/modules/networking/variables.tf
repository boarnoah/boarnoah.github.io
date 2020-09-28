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

variable "site_cdn_address" {
  type        = string
  description = "Address for static site CDN"
}

variable "site_cdn_zone" {
  type        = string
  description = "Hosted zone ID for static site CDN"
}
