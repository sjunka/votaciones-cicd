// Los 14 criterios de la rúbrica del profe (2026-11-20), como fichas de repaso para las memofichas.
export interface Criterio {
  criterio: string
  respuesta: string[]
  pantalla: string
  captura: string
}

export const criterios: Criterio[] = [
  { criterio: 'Explica el artefacto: propósito, funcionalidades y complejidad', pantalla: 'Artefacto', captura: 'capturas/3-artefacto.png',
    respuesta: ['Votación en vivo: QR y se vota desde el celular', 'React + nginx, Flask, DynamoDB', 'Complejidad media: 2 servicios tras un ALB'] },
  { criterio: 'Sustenta la estrategia de versionamiento o ramificación', pantalla: 'Ramas', captura: 'capturas/4-ramas.png',
    respuesta: ['Trunk-based: main + feature/* cortas', 'Ruleset proteger-main: PR + build-and-test', 'Versión 1.0.N + SHA en cada imagen'] },
  { criterio: 'Presenta flujograma del pipeline CI/CD y herramientas', pantalla: 'Pipeline', captura: 'capturas/5-pipeline.png',
    respuesta: ['Flujograma de ci-cd.yml, 7 jobs', 'GitHub Actions, Docker, Terraform, SonarCloud', 'Trivy, gitleaks, pytest, Selenium, AWS'] },
  { criterio: 'Explica integración entre ramas/eventos y pipelines', pantalla: 'Ramas', captura: 'capturas/4-ramas.png',
    respuesta: ['Pull request: solo CI', 'Push a main: CI y CD', 'workflow_dispatch: rollback manual', 'Cambios de docs no disparan nada'] },
  { criterio: 'Presenta arquitectura de software e infraestructura', pantalla: 'Arquitectura', captura: 'capturas/7-arquitectura.png',
    respuesta: ['ALB: /api/* a la API, el resto a la web', 'Fargate por servicio, DynamoDB por ambiente', 'Docker Hub, S3 (tfstate), CloudWatch'] },
  { criterio: 'CI incluye Checkout, Build, Test y Release', pantalla: 'Pipeline', captura: 'capturas/5-pipeline.png',
    respuesta: ['Checkout del código', 'Test: lint, gitleaks, validate, unitarias, Sonar', 'Build: 2 imágenes, Trivy', 'Release: Docker Hub con 1.0.N'] },
  { criterio: 'CD incluye IaC, despliegue de infra y app en ≥2 ambientes', pantalla: 'Pipeline', captura: 'capturas/5-pipeline.png',
    respuesta: ['deploy.yml + Terraform (IaC)', 'Crea red, ALB, ECS y DynamoDB', 'Staging y producción, un workspace cada uno'] },
  { criterio: 'Presenta pruebas completas: estáticas, unitarias, cobertura, pre y post prod', pantalla: 'Pruebas', captura: 'capturas/8-pruebas.png',
    respuesta: ['Estáticas: lint, gitleaks, validate, Sonar, Trivy', 'Unitarias: pytest + moto, Vitest', 'Cobertura: mín. 80 %, Sonar 98,5 %', 'Pre-prod: integración + Selenium. Post-prod: smoke'] },
  { criterio: 'Muestra ejecución exitosa de pipelines y logs en GitHub Actions', pantalla: 'Evidencia', captura: 'capturas/11-evidencia.png',
    respuesta: ['Run 44348025068: todo verde', 'Run 44340166676: rollback automático', 'Run 44840313582: v1.0.20 + Discord'] },
  { criterio: 'Evidencia las 3 mejoras de pipeline o arquitectura', pantalla: 'Modificaciones', captura: 'capturas/10-modificaciones.png',
    respuesta: ['1. DevSecOps: gitleaks + Trivy', '2. SemVer: Release v1.0.N', '3. Workflow reutilizable deploy.yml'] },
  { criterio: 'Demuestra aplicación funcional en todos los ambientes', pantalla: 'Demo', captura: 'capturas/12-demo.png',
    respuesta: ['Staging (amarillo) y producción (verde)', 'Los dos en 1.0.20', 'QR de producción: /p/G8mR9uj4'] },
  { criterio: 'Muestra estrategia de rollback automático y manual', pantalla: 'Rollback', captura: 'capturas/9-rollback.png',
    respuesta: ['Automático: smoke fallan, vuelve a la última Release', 'Manual: botón de pánico, workflow_dispatch', 'Ambos usan deploy.yml y production-rollback'] },
  { criterio: 'Socializa desafíos, decisiones y aprendizajes', pantalla: 'Aprendizajes', captura: 'capturas/13-aprendizajes.png',
    respuesta: ['crypto.randomUUID falla por HTTP', 'always() para que corra el rollback', 'Aprobación protege avance, no regreso', 'AWS personal: se destruye al terminar'] },
  { criterio: 'Respuestas técnicas durante preguntas del jurado', pantalla: 'Preguntas', captura: 'capturas/14-cierre.png',
    respuesta: ['Responde quien tenía esa pantalla', 'Si no sabemos, lo decimos', 'Respaldo: vistas Guion y Alternativas'] },
]
