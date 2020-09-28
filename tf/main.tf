provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
  version = "~> 2.70"
}

provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile
  version = "~> 2.70"
  alias   = "us_e_1"
}

module "networking" {
  source           = "./modules/networking"
  app              = var.app
  namespace        = var.namespace
  domain           = var.domain
  site_cdn_address = module.static_site.site_cdn_address
  site_cdn_zone    = module.static_site.site_cdn_zone
}

module "https" {
  source    = "./modules/https"
  app       = var.app
  namespace = var.namespace
  domain    = var.domain
  zone_id   = module.networking.zone_id
  providers = {
    aws = aws.us_e_1
  }
}
module "static_site" {
  source       = "./modules/static_site"
  app          = var.app
  namespace    = var.namespace
  aws_region   = var.aws_region
  domain       = var.domain
  site_acm_arn = module.https.site_acm_arn
}

module "codepipeline" {
  source           = "./modules/codepipeline"
  app              = var.app
  namespace        = var.namespace
  aws_region       = var.aws_region
  repo_branch      = "release"
  site_bucket_name = module.static_site.site_bucket_name
  site_bucket_arn  = module.static_site.site_bucket_arn
}
