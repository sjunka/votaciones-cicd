# Decisiones del pipeline: proyecto final CI/CD

Integrante: Sergio Junca y Valeria Cardona Urrea (respuestas recomendadas)

Fecha: 2026-11-18

Respondidas: 28 de 28. Coinciden con la recomendación: 28. Decisiones de esfuerzo alto: 0.

## Mínimos del enunciado

- [x] CI: Checkout y build
- [x] CI: Test: pruebas estáticas
- [x] CI: Test: unitarias y cobertura
- [x] CI: Release: artefacto versionado
- [x] CI: Logs en GitHub Actions (evidencia)
- [x] CD: IaC
- [x] CD: Deploy infra y app en 2 o más ambientes
- [x] CD: Tests pre-producción
- [x] CD: Tests post-producción (smoke)
- [x] CD: Rollback ante fallo de smoke tests
- [x] CD: Rollback manual (botón de pánico)
- [x] Proyecto: App distinta con 2 o más componentes
- [x] Proyecto: Estrategia de ramas sustentada
- [x] Proyecto: 3 o más modificaciones o introducciones

## Decisiones

### 1. Plataforma y artefacto

1. ¿Con qué herramienta orquestamos el CI/CD?
   Elegida: GitHub Actions (recomendada). Esfuerzo bajo.
2. ¿Un repositorio o uno por componente?
   Elegida: Un solo repositorio con `web/`, `api/`, `infra/` y `tests/` (recomendada). Esfuerzo bajo.
3. ¿Dónde publicamos el artefacto (las imágenes Docker)?
   Elegida: Docker Hub (recomendada). Esfuerzo bajo.
4. ¿Con qué herramienta hacemos la IaC?
   Elegida: Terraform con estado en S3 y workspaces (recomendada). Esfuerzo bajo.
5. ¿Dónde corre la app?
   Elegida: ECS Fargate detrás de un ALB (recomendada). Esfuerzo bajo.
6. ¿Cuántos ambientes?
   Elegida: Staging y producción (recomendada). Esfuerzo bajo.

### 2. Ramas y versiones

7. ¿Qué estrategia de ramificación usamos?
   Elegida: Trunk-based: `main` + ramas cortas `feature/*` con PR y 1 aprobación (recomendada). Esfuerzo bajo.
8. ¿Cómo versionamos el artefacto?
   Elegida: SHA + SemVer automático `1.0.N` (N = número de ejecución) y GitHub Release al pasar producción (recomendada). Esfuerzo medio.
9. ¿Qué evento dispara cada parte?
   Elegida: PR: solo CI. Push a `main`: CI, release y CD. Manual: botón de pánico. (recomendada). Esfuerzo bajo.
10. ¿Cómo pasa una versión de staging a producción?
   Elegida: Aprobación manual: Required reviewers en el ambiente `production` (Entrega Continua) (recomendada). Esfuerzo bajo.

### 3. Pruebas

11. ¿Qué pruebas estáticas corren en CI?
   Elegida: Black, Flake8 y Pylint (API), ESLint (web) y quality gate de SonarCloud (recomendada). Esfuerzo bajo.
12. ¿Qué umbral de cobertura exigimos?
   Elegida: 80% en pytest (API) y en Vitest (web), más el quality gate de Sonar (recomendada). Esfuerzo medio.
13. ¿Cómo probamos la base de datos en CI, sin AWS?
   Elegida: moto: simula DynamoDB dentro de pytest (recomendada). Esfuerzo bajo.
14. ¿Qué pruebas corren en staging (pre-producción)?
   Elegida: Integración de la API (pytest + requests) y aceptación E2E con Selenium (recomendada). Esfuerzo medio.
15. ¿Qué pruebas corren en producción (post-producción)?
   Elegida: Smoke de solo lectura: la web carga y `/api/health` responde ok, con la versión esperada y la base conectada (recomendada). Esfuerzo bajo.

### 4. Rollback

16. ¿Qué dispara el rollback automático?
   Elegida: Falla de las smoke (o del deploy) en producción: job `rollback-production`. Además queda el circuit breaker de ECS. (recomendada). Esfuerzo medio.
17. ¿A qué versión vuelve el rollback?
   Elegida: A la última GitHub Release (solo se crea cuando producción pasó las smoke) (recomendada). Esfuerzo bajo.
18. ¿Cómo se ejecuta el rollback?
   Elegida: El mismo deploy con Terraform, pero con la imagen anterior (workflow reutilizable) (recomendada). Esfuerzo medio.
19. ¿Cómo es el botón de pánico (rollback manual)?
   Elegida: Workflow Rollback de emergencia con `workflow_dispatch`: se elige ambiente y versión (por defecto, la Release anterior) (recomendada). Esfuerzo bajo.
20. ¿El rollback necesita aprobación?
   Elegida: No: el rollback usa un ambiente aparte (`production-rollback`) sin revisores (recomendada). Esfuerzo bajo.

### 5. Las 3 modificaciones

21. ¿Cuáles son nuestras modificaciones o introducciones?
   Elegida: DevSecOps: gitleaks (secretos) y Trivy (vulnerabilidades críticas en las imágenes) (recomendada). Esfuerzo bajo.
   Elegida: SemVer automático y GitHub Releases como puntos de restauración (recomendada). Esfuerzo medio.
   Elegida: Avisos a Discord o Slack al desplegar, al fallar y en el rollback (recomendada). Esfuerzo bajo.
22. Si hay avisos, ¿por dónde llegan?
   Elegida: Discord (webhook) (recomendada). Esfuerzo bajo.

### 6. La app

23. ¿Qué app construimos? (puntaje estimado sobre 10)
   Elegida: Votación en vivo con QR · 8,8 (recomendada). Esfuerzo medio.
24. ¿Con qué hacemos el front?
   Elegida: React + Vite, web pensada para celular (recomendada). Esfuerzo bajo.
25. ¿Con qué hacemos la API?
   Elegida: Python (FastAPI o Flask) (recomendada). Esfuerzo bajo.
26. ¿Dónde guardamos los datos?
   Elegida: DynamoDB bajo demanda, creada con Terraform (recomendada). Esfuerzo bajo.
27. ¿Cómo desplegamos los componentes?
   Elegida: Dos servicios ECS (web y api) detrás del mismo ALB, con la regla `/api/*` (recomendada). Esfuerzo medio.

### 7. Demo

28. ¿Cómo mostramos el rollback en la presentación?
   Elegida: Video del rollback automático + botón de pánico en vivo, lanzado al inicio de la demo (recomendada). Esfuerzo bajo.

