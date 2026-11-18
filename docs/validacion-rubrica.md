# Validación contra la diapositiva del proyecto final

Fuente: diapositiva "Proyecto final en grupos" (foto en `material/proyecto-final-enunciado.jpeg` del repo del curso y la misma lámina en las diapositivas de la Unidad 3). Revisada el 2026-11-18. Autor: Sergio Junca.

Exposición: 10 minutos más 5 de preguntas. El guion suma 9:10 (vista Guion de la app).

## Los 10 puntos de la presentación

| # | Punto | Cumple | Dónde se muestra |
|---|---|---|---|
| 1 | Artefacto: propósito, funcionalidades, complejidad | Sí | Vista Artefacto |
| 2 | Estrategia de ramas con el porqué | Sí | Vista Ramas, pregunta "trunk-based y no GitFlow" |
| 3 | Flujograma con cada paso y su herramienta | Sí | Vista Pipeline |
| 4 | Cómo se integra el versionamiento al pipeline (rama o evento) | Sí | Vista Ramas, tabla "Qué corre en cada evento" |
| 5 | Diagrama de arquitectura (ECS, ALB, DynamoDB) | Sí | Vista Arquitectura |
| 6 | Pruebas: ambiente, qué valida y por qué | Sí | Vista Pruebas |
| 7 | Evidencia de pipelines exitosos en GitHub Actions | Sí | Runs 44348025068 y 44340166676 (vista Evidencia) |
| 8 | Evidencia de las 3 modificaciones | Sí | Vista Modificaciones: DevSecOps, SemVer con Releases y `deploy.yml` reutilizable |
| 9 | App funcional en cada ambiente | Sí | Staging y producción en la v1.0.12 (vista Evidencia y demo) |
| 10 | Desafíos y aprendizajes | Sí | Vista Aprendizajes |

## Mínimo del pipeline

| Etapa | Cumple | Cómo |
|---|---|---|
| CI: Checkout | Sí | `actions/checkout` en `build-and-test` |
| CI: Build | Sí | `npm ci` y build de Vite, `docker build` de las 2 imágenes |
| CI: Test estáticas | Sí | Black, Flake8, Pylint, ESLint, gitleaks, `terraform validate`, SonarCloud |
| CI: Unitarias y cobertura | Sí | pytest + moto y Vitest, mínimo 80 %; Sonar muestra 98,5 % |
| CI: Release | Sí | Imágenes `1.0.N` y SHA en Docker Hub, Release `v1.0.N` en GitHub |
| CD: IaC | Sí | Terraform con estado en S3 y workspaces |
| CD: Deploy infra y app en 2 ambientes | Sí | `deploy-staging` y `deploy-production` |
| CD: Tests pre-prod | Sí | `test-staging`: integración y Selenium |
| CD: Tests post-prod | Sí | `smoke-test-production` |
| CD: Rollback automático ante smoke fallido | Sí | Run 44340166676 |
| CD: Rollback manual (botón de pánico) | Sí | Runs 44344815777 y 44345534299 |

## Riesgos que quedan

- Discord: implementado, sin webhook, sin mensajes. No cuenta entre las 3 modificaciones.
- Falta confirmar con el profe que `deploy.yml`, DevSecOps y SemVer valen como modificaciones, y que web + API + DynamoDB vale como complejidad media.
- Reparto del guion entre Sergio y Valeria: propuesta sin confirmar.
- SonarCloud general con Security D (46 issues, casi todos de los workflows). El quality gate pasa.
- La demo depende de que AWS siga arriba el sábado a las 8 am.
