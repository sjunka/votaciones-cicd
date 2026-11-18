# infra/variables.tf
variable "aws_region" {
  description = "Región de AWS donde se desplegarán los recursos"
  type        = string
  default     = "us-east-1"
}

variable "environment_name" {
  description = "Nombre del ambiente (staging o production)"
  type        = string

  validation {
    condition     = contains(["staging", "production"], var.environment_name)
    error_message = "environment_name debe ser \"staging\" o \"production\"."
  }
}

variable "api_image_uri" {
  description = "URI completa de la imagen de la API (ej: usuario/votaciones-api:1.0.7)"
  type        = string
}

variable "web_image_uri" {
  description = "URI completa de la imagen de la web (ej: usuario/votaciones-web:1.0.7)"
  type        = string
}

variable "app_version" {
  description = "Versión desplegada (1.0.N). La API la expone en /api/health"
  type        = string
  default     = "manual"
}

variable "app_commit" {
  description = "SHA del commit de la versión desplegada"
  type        = string
  default     = "manual"
}
