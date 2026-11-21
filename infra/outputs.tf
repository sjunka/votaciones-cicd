# infra/outputs.tf
output "alb_url" {
  description = "URL pública con HTTPS (CloudFront delante del ALB)"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "dynamodb_table_name" {
  description = "Tabla DynamoDB con las encuestas y los votos"
  value       = aws_dynamodb_table.votes.name
}
