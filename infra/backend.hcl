# infra/backend.hcl
bucket       = "tfstate-votaciones-sjunka"
key          = "votaciones/terraform.tfstate"
region       = "us-east-1"
use_lockfile = true
