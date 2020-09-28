provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
  version = "~> 2.70"
}

module "networking" {
  source           = "./modules/networking"
  app              = var.app
  namespace        = var.namespace
  domain           = var.domain
  site_cdn_address = module.static_site.site_cdn_address
  site_cdn_zone    = module.static_site.site_cdn_zone
}

module "static_site" {
  source     = "./modules/static_site"
  app        = var.app
  namespace  = var.namespace
  aws_region = var.aws_region
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
