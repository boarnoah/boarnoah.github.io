resource "aws_s3_bucket" "this" {
  bucket = "${var.namespace}-${var.app}-codepipeline"
  region = var.aws_region
}

resource "aws_codecommit_repository" "this" {
  repository_name = "${var.namespace}-${var.app}"
}

data "aws_iam_policy_document" "codepipeline_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      identifiers = ["codepipeline.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "codepipeline_exec" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketVersioning",
      "s3:PutObject"
    ]
    resources = [
      "${aws_s3_bucket.this.arn}",
      "${aws_s3_bucket.this.arn}/*"
    ]
  }
  statement {
    resources = [aws_codecommit_repository.this.arn]
    actions = [
      "codecommit:GetBranch",
      "codecommit:GetCommit",
      "codecommit:UploadArchive",
      "codecommit:GetUploadArchiveStatus",
      "codecommit:CancelUploadArchive"
    ]
  }
  statement {
    resources = [
      aws_codebuild_project.this.arn
    ]
    actions = [
      "codebuild:BatchGetProjects",
      "codebuild:StopBuild",
      "codebuild:ListBuildsForProject",
      "codebuild:StartBuild",
      "codebuild:BatchGetBuilds"
    ]
  }
}

data "aws_iam_policy_document" "codebuild_exec" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketVersioning",
      "s3:PutObject"
    ]
    resources = [
      "${aws_s3_bucket.this.arn}",
      "${aws_s3_bucket.this.arn}/*"
    ]
  }
  statement {
    resources = [
      "*"
    ]
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeVpcs",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups"
    ]
  }
  statement {
    resources = [
      "*"
    ]
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
  }
}

data "aws_iam_policy_document" "codebuild_assume" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      identifiers = [
        "codebuild.amazonaws.com"
      ]
      type = "Service"
    }
  }
}

resource "aws_iam_role" "codepipeline_exec" {
  assume_role_policy = data.aws_iam_policy_document.codepipeline_assume.json
}

resource "aws_iam_role_policy" "codepipeline_exec" {
  policy = data.aws_iam_policy_document.codepipeline_exec.json
  role   = aws_iam_role.codepipeline_exec.id
}

resource "aws_iam_role" "codebuild_exec" {
  assume_role_policy = data.aws_iam_policy_document.codebuild_assume.json
}

resource "aws_iam_role_policy" "codebuild_exec" {
  policy = data.aws_iam_policy_document.codebuild_exec.json
  role   = aws_iam_role.codebuild_exec.id
}

resource "aws_codebuild_project" "this" {
  name         = "${var.namespace}-${var.app}"
  service_role = aws_iam_role.codebuild_exec.arn
  artifacts {
    type = "CODEPIPELINE"
  }
  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "jekyll/jekyll:3.0.4"
    type         = "LINUX_CONTAINER"
  }
  source {
    type = "CODEPIPELINE"
  }
}

resource "aws_codepipeline" "this" {
  name     = "${var.namespace}-${var.app}"
  role_arn = aws_iam_role.codepipeline_exec.arn
  artifact_store {
    location = aws_s3_bucket.this.bucket
    type     = "S3"
  }
  stage {
    name = "Source"
    action {
      category         = "Source"
      name             = "Source"
      owner            = "AWS"
      provider         = "CodeCommit"
      version          = "1"
      output_artifacts = ["source"]
      configuration = {
        RepositoryName = aws_codecommit_repository.this.repository_name
        BranchName     = var.repo_branch
      }
    }
  }
  stage {
    name = "Build"
    action {
      category         = "Build"
      name             = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source"]
      output_artifacts = ["build"]
      configuration = {
        ProjectName = "${var.namespace}-${var.app}"
      }
    }
  }
}
