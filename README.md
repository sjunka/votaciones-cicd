# Votaciones CI/CD

Votación en vivo con QR. Alguien crea una encuesta, la pantalla muestra un código QR, el público lo escanea con el celular, vota y las barras de resultado se mueven cada 2 segundos. Es el proyecto final del curso Integración y Entrega Continua de Software (SI6008, EAFIT) y reutiliza el pipeline de los talleres 1 a 3.

Autor: Sergio Junca. Estado al 2026-11-20: el pipeline corrió completo en AWS (staging y producción en la versión 1.0.20), con rollback automático y botón de pánico probados, y avisos a Discord activos.

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
| API | `cd api && pip install -r requirements-dev.txt && pytest` | pytest con moto (21 pruebas, 97,32 %), cobertura mínima de 80 % |
| API (estilo) | `cd api && black --check . && flake8 && pylint app` | formato y lint |
| Web | `cd web && npm ci && npm run lint && npm test` | ESLint y Vitest (12 pruebas, 100 %) con cobertura mínima de 80 % |
| Integración | `APP_BASE_URL=http://localhost:8080 pytest tests/integration` | la API real detrás del gateway |
| E2E | `APP_BASE_URL=http://localhost:8080 pytest tests/e2e` | Selenium con Chrome sin ventana |
| Smoke | `APP_BASE_URL=http://localhost:8080 EXPECTED_VERSION=dev pytest tests/smoke` | solo lectura |

Las pruebas de `tests/` (11: integración, E2E y smoke) necesitan `pip install -r tests/requirements.txt`. Pasan contra `docker compose` y contra staging dentro del pipeline.

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
3. Workflow reutilizable `deploy.yml`: staging, producción, el rollback automático y el botón de pánico lo llaman.

Extras: la arquitectura nueva (dos servicios ECS, regla `/api/*` del balanceador y DynamoDB) y los avisos a Discord, activos en el canal #general.

## Estrategia de ramas

Trunk-based. `main` es la única rama larga y está protegida por el ruleset `proteger-main` (activo): PR obligatorio, 1 aprobación, check `build-and-test` en verde, sin borrar ni force push. El rol admin puede saltarlo (ver `docs/pipeline.md`). Los cambios van en ramas cortas.

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

Estado al 2026-11-20: están cargados todos: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DOCKERHUB_TOKEN`, `SONAR_TOKEN`, `DISCORD_WEBHOOK_URL`, `DOCKERHUB_USERNAME` y `SONAR_HOST_URL`.

Ambientes de GitHub: `staging`, `production` (revisor `sjunka`; `valri2104` está invitada como colaboradora y la invitación sigue pendiente, cuando acepte se agrega como segunda revisora) y `production-rollback` (sin revisores). Los pasos completos están en `docs/pasos-para-activar.md`.

## Enlaces

| Qué | Dónde |
|---|---|
| Repositorio | https://github.com/sjunka/votaciones-cicd |
| Sustentación | https://sjunka.github.io/votaciones-cicd/ |
| Releases | https://github.com/sjunka/votaciones-cicd/releases (v1.0.3, v1.0.8, v1.0.12, v1.0.18 y v1.0.20 al 2026-11-20) |
| Actions | https://github.com/sjunka/votaciones-cicd/actions |
| Staging | http://votaciones-staging-alb-1433721465.us-east-1.elb.amazonaws.com |
| Producción | http://votaciones-production-alb-267954360.us-east-1.elb.amazonaws.com |
| SonarCloud | proyecto `sjunka_votaciones-cicd`, quality gate Passed |
| Docker Hub | `sjunka/votaciones-api` y `sjunka/votaciones-web` |

Runs de referencia (`https://github.com/sjunka/votaciones-cicd/actions/runs/<id>`):

| Id | Qué muestra |
|---|---|
| 44334394911 | Run completo en verde con aprobación manual (Release v1.0.3) |
| 44340166676 | Rollback automático: smoke en rojo, producción vuelve a la 1.0.3 |
| 44342859850 | Run completo en verde, 9 min 52 s (Release v1.0.8) |
| 44344815777 | Botón de pánico sin versión: vuelve a la v1.0.3 |

Las capturas están en `sustentacion/public/evidencias/`.

## Hallazgos abiertos

- SonarCloud, análisis general: Security D (46 issues, casi todos de los workflows: acciones sin fijar a un SHA y `pip install` sin hashes) y Reliability C (7). El quality gate (Sonar way, sobre código nuevo) pasa.
- Discord: activo, aviso de la v1.0.20 en el run 44840313582.
- Valeria no ha aceptado la invitación, así que aún no aprueba PR ni producción.

## Destruir todo

Cuesta dinero real en la cuenta AWS de Sergio: dos ALB y 4 servicios ECS Fargate corren ahora (unos US$3 al día). Destruir después de exponer:

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
3. Borrar el usuario IAM `github-cicd-votaciones` con sus llaves, y el rol `LabRole`.
4. Revocar los tokens de Docker Hub (`EAFIT_PROYECTO`, sin vencimiento) y SonarCloud (`EAFIT_PROYECTO`, 30 días).
