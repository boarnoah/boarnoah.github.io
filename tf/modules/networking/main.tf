resource "aws_route53_zone" "this" {
  name = var.domain
}

resource "aws_route53_record" "static_site" {
  name    = var.domain
  type    = "A"
  zone_id = aws_route53_zone.this.zone_id
  alias {
    evaluate_target_health = false
    name                   = var.site_cdn_address
    zone_id                = var.site_cdn_zone
  }
}

resource "aws_route53_record" "www" {
  name    = "www"
  type    = "CNAME"
  zone_id = aws_route53_zone.this.zone_id
  ttl     = "86400"
  records = [aws_route53_record.static_site.name]
}
