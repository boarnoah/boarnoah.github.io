provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
  version = "~> 2.70"
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
