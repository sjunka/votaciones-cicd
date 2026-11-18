# Votaciones CI/CD

Votación en vivo con QR. Alguien crea una encuesta, la pantalla muestra un código QR, el público lo escanea con el celular, vota y las barras de resultado se mueven cada 2 segundos. Es el proyecto final del curso Integración y Entrega Continua de Software (SI6008, EAFIT) y reutiliza el pipeline de los talleres 1 a 3.

Autor: Sergio Junca.

## Integrantes

- Sergio Alfredo Junca Valero (GitHub `sjunka`)
- Valeria Cardona Urrea (GitHub `valri2104`)

## Qué hace la app

- Crear una encuesta con una pregunta y de 2 a 6 opciones.
- Votar una sola vez por votante. Una encuesta cerrada o una opción inexistente se rechaza.
- Los porcentajes suman siempre 100.
- Cerrar la encuesta con un código de administrador que solo recibe quien la crea.
- La página `/acerca` muestra versión, commit y ambiente. Un banner fijo indica STAGING o PRODUCCIÓN.

Los votos viven en DynamoDB. Un deploy o un rollback cambia el contenedor, no los datos.

## Arquitectura

```
Internet (celulares, navegador)
          |
   ALB del ambiente (HTTP 80)
     /api/*          resto
       |               |
  servicio api    servicio web
  (Flask, 8000)   (nginx + React, 80)
  ECS Fargate     ECS Fargate
       |
  DynamoDB votaciones-<ambiente>
```

Fuera de cada ambiente: GitHub Actions (pipeline y botón de pánico), Docker Hub (imágenes `votaciones-api` y `votaciones-web`), un bucket S3 con el estado de Terraform, CloudWatch Logs, el rol `LabRole` de las tareas, SonarCloud y Discord. Detalle en `docs/arquitectura.md`.

## Estructura del repo

```
VERSION                      MAJOR.MINOR a mano (hoy 1.0); el PATCH es el número de ejecución
api/                         API en Python 3.13, Flask, boto3 y gunicorn
web/                         React, Vite, Vitest y nginx
infra/                       Terraform: ALB, ECS Fargate, DynamoDB, logs
tests/                       integración, E2E (Selenium) y smoke contra una URL
scripts/                     utilidades del pipeline
docker-compose.yml           stack local con DynamoDB Local y un gateway nginx
sonar-project.properties     configuración de SonarCloud
.github/workflows/           ci-cd.yml, deploy.yml, panic-rollback.yml, pages.yml
docs/                        arquitectura, pipeline, pasos para activar y reporte
sustentacion/                app de la presentación (GitHub Pages)
```

## Correrlo en local

Requisitos: Docker con Compose.

```
docker compose up --build
```

Abrir http://localhost:8080. El servicio `gateway` hace de ALB: manda `/api/` a la API y el resto a la web. DynamoDB Local reemplaza a DynamoDB y la API crea la tabla al arrancar.

Pruebas por componente:

| Componente | Comando | Qué corre |
|---|---|---|
| API | `cd api && pip install -r requirements-dev.txt && pytest` | pytest con moto, cobertura mínima de 80 % |
| API (estilo) | `cd api && black --check . && flake8 && pylint app` | formato y lint |
| Web | `cd web && npm ci && npm run lint && npm test` | ESLint y Vitest con cobertura mínima de 80 % |
| Integración | `APP_BASE_URL=http://localhost:8080 pytest tests/integration` | la API real detrás del gateway |
| E2E | `APP_BASE_URL=http://localhost:8080 pytest tests/e2e` | Selenium con Chrome sin ventana |
| Smoke | `APP_BASE_URL=http://localhost:8080 EXPECTED_VERSION=dev pytest tests/smoke` | solo lectura |

Las pruebas de `tests/` necesitan `pip install -r tests/requirements.txt`.

## Pipeline

Orquestador: GitHub Actions. Archivo principal: `.github/workflows/ci-cd.yml` (nombre `CI/CD Pipeline`).

| Job | Qué hace | Herramienta |
|---|---|---|
| `build-and-test` | Lint, secretos, validación de Terraform, pruebas con cobertura, quality gate, build de las 2 imágenes, escaneo y publicación (solo en `main`) | Black, Flake8, Pylint, ESLint, gitleaks, Terraform, pytest, Vitest, SonarCloud, Docker, Trivy, Docker Hub |
| `deploy-staging` | Despliega infraestructura y app en el workspace `staging` y espera la versión en `/api/health` | Terraform, ECS, `deploy.yml` |
| `test-staging` | Integración de la API y E2E contra staging | pytest, requests, Selenium |
| `deploy-production` | Igual que staging en el workspace `production`, tras la aprobación manual | Terraform, ambiente `production` |
| `smoke-test-production` | Smoke de solo lectura con la versión esperada | pytest, requests |
| `publish-release` | Crea la Release `v1.0.N` y avisa a Discord | `gh release create`, webhook |
| `find-rollback-release`, `rollback-production`, `smoke-test-rollback`, `notify-rollback` | Si falla el deploy o el smoke de producción: buscan la última Release, la despliegan, repiten el smoke y avisan | `scripts/resolver-release.sh`, `deploy.yml`, Discord |
| `notify-failure` | Avisa a Discord si algo falló antes de producción | webhook |

`panic-rollback.yml` (nombre `Rollback de emergencia`) es el botón de pánico: se lanza a mano desde Actions con el ambiente y, si se quiere, la versión. Detalle en `docs/pipeline.md`.

Las tres modificaciones respecto al Taller 3:

1. DevSecOps: gitleaks busca secretos y Trivy escanea las 2 imágenes (falla con CVE críticos).
2. SemVer `1.0.N` y GitHub Releases como puntos de restauración.
3. Avisos a Discord al desplegar, al fallar y al hacer rollback.

## Estrategia de ramas

Trunk-based. `main` es la única rama larga y está protegida por el ruleset `proteger-main`: PR obligatorio, 1 aprobación y el check `build-and-test` en verde. Los cambios van en ramas cortas `feature/*`.

- Pull request a `main`: corre solo `build-and-test`. No publica ni despliega.
- Push a `main`: pipeline completo. Se ignoran los cambios que solo tocan `**.md`, `docs/**` o `sustentacion/**`.
- La imagen se construye una vez y se promueve a staging y a producción sin reconstruirla.

## Secretos y variables

Se crean en GitHub, Settings, Secrets and variables, Actions. Los valores no van en el repo.

| Nombre | Tipo | Se crea con |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | secreto | llave de acceso del usuario IAM de CI (consola de AWS, IAM) |
| `AWS_SECRET_ACCESS_KEY` | secreto | la misma llave de acceso |
| `DOCKERHUB_TOKEN` | secreto | token de acceso en Docker Hub, Account settings, Security |
| `SONAR_TOKEN` | secreto | token en SonarCloud, My Account, Security |
| `DISCORD_WEBHOOK_URL` | secreto | webhook del canal, Editar canal, Integraciones |
| `DOCKERHUB_USERNAME` | variable | nombre de usuario de Docker Hub |
| `SONAR_HOST_URL` | variable | `https://sonarcloud.io` |

Ambientes de GitHub: `staging`, `production` (revisores: Sergio y Valeria) y `production-rollback` (sin revisores). Los pasos completos están en `docs/pasos-para-activar.md`.

## Enlaces

| Qué | Dónde |
|---|---|
| Repositorio | https://github.com/sjunka/votaciones-cicd (pendiente: crearlo y subir) |
| Sustentación | https://sjunka.github.io/votaciones-cicd/ (pendiente: activar Pages) |
| Releases | https://github.com/sjunka/votaciones-cicd/releases (pendiente) |
| Actions | https://github.com/sjunka/votaciones-cicd/actions (pendiente) |
| Staging | pendiente |
| Producción | pendiente |
| SonarCloud | pendiente |
| Docker Hub | pendiente |

## Destruir todo

Cuesta dinero real en la cuenta AWS de Sergio. Al terminar:

1. Desde `infra/`, por cada workspace:
   ```
   terraform init -backend-config=backend.hcl
   terraform workspace select production
   terraform destroy -var environment_name=production -var api_image_uri=x -var web_image_uri=x -var app_version=x -var app_commit=x
   terraform workspace select staging
   terraform destroy -var environment_name=staging -var api_image_uri=x -var web_image_uri=x -var app_version=x -var app_commit=x
   ```
   Los valores `x` solo satisfacen las variables obligatorias, el destroy no los usa.
2. Vaciar y borrar el bucket del estado (tiene versionado, hay que borrar también las versiones):
   ```
   aws s3 rb s3://tfstate-votaciones-sjunka --force
   ```
   Si el bucket tiene versiones, `--force` no basta: borrarlas desde la consola o con `aws s3api delete-objects`.
3. Borrar el usuario IAM de CI y sus llaves, y el rol `LabRole`.
4. Revocar los tokens de Docker Hub y SonarCloud.
