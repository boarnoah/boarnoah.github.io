
resource "aws_acm_certificate" "website" {
  domain_name = var.domain
  subject_alternative_names = [
    "www.${var.domain}"
  ]
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "website_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

// TODO: Fix after route53 record issue is resolved https://github.com/terraform-providers/terraform-provider-aws/issues/14447
resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.website_validation : record.fqdn]
}
