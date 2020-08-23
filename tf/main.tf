provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
  version = "~> 2.70"
}

module "codepipeline" {
  source           = "./modules/codepipeline"
  app              = var.app
  namespace        = var.namespace
  aws_region       = var.aws_region
  repo_branch      = "release"
}
