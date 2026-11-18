# Pasos para activar el pipeline

Autor: Sergio Junca. Estado al 2026-11-18: casi todo está hecho. Los pasos de abajo quedan como registro y como guía para repetirlo. Los comandos `aws` asumen un perfil con permisos de administrador en la cuenta personal de Sergio (278835524469). Reemplazar `<...>` por el valor real.

## Lo que falta

1. Discord: crear el webhook (hay que iniciar sesión en Discord) y guardarlo con `gh secret set DISCORD_WEBHOOK_URL --repo sjunka/votaciones-cicd`. Después, probar que llegan los avisos (paso 12).
2. Valeria acepta la invitación en https://github.com/sjunka/votaciones-cicd/invitations. Luego agregarla como segunda revisora del ambiente `production` y que apruebe un PR.
3. Definir con el profesor si hace falta algo más en Interactiva.
4. Después de exponer: destruir todo y revocar tokens (pasos 24 a 26).

## Hecho (2026-11-18)

- Repo público creado: https://github.com/sjunka/votaciones-cicd. Pages activo: https://sjunka.github.io/votaciones-cicd/ (pasos 1 y 15).
- AWS: bucket `tfstate-votaciones-sjunka`, rol `LabRole` creado a mano, usuario IAM `github-cicd-votaciones` con sus llaves en secretos (pasos 3 a 7). Primer intento: la llave secreta quedó vacía y se regeneraron las llaves.
- Docker Hub: token y variable `DOCKERHUB_USERNAME`; repos `sjunka/votaciones-api` y `sjunka/votaciones-web` con etiquetas `1.0.N` y SHA (paso 8).
- SonarCloud: proyecto `sjunka_votaciones-cicd`, análisis automático apagado, quality gate Passed; `SONAR_TOKEN` y `SONAR_HOST_URL` cargados. El primer análisis dio Quality Gate NONE y se relanzó con `gh run rerun --failed` (pasos 9 a 11).
- Ambientes `staging`, `production` (revisor `sjunka`) y `production-rollback` (sin revisores), y ruleset `proteger-main` activo (pasos 13 y 14). La invitación a Valeria está enviada, falta que la acepte (paso 2).
- Primer run, runs verdes y 2 Releases (v1.0.3, v1.0.8 y v1.0.12) (pasos 16 a 18). Run completo en verde de 9 min 52 s.
- Rollback automático probado con una falla de demostración (run 44340166676) y botón de pánico probado (runs 44344815777 y 44345534299) (pasos 19 y 20).
- Capturas en `sustentacion/public/evidencias/` (paso 21). Enlaces del README y del reporte actualizados (paso 23).

## Registro de pasos

## A. Repositorio

1. Crear el repo público y subir el código desde `assignments/04-proyecto-final/votaciones-cicd/` (ya tiene git en `main`, sin commits):
   ```
   gh repo create sjunka/votaciones-cicd --public --source=. --remote=origin
   git add -A && git commit -m "Proyecto final: votaciones CI/CD"
   git push -u origin main
   ```
   El primer push dispara `ci-cd.yml` y fallará por los secretos que aún no existen. Es esperado. Para evitarlo, hacer los pasos B a F antes de empujar a `main`.
2. Invitar a Valeria como colaboradora con permiso de escritura:
   ```
   gh api -X PUT repos/sjunka/votaciones-cicd/collaborators/valri2104 -f permission=push
   ```
   Valeria acepta la invitación desde su correo o desde https://github.com/sjunka/votaciones-cicd/invitations.

## B. Cuenta AWS personal

3. Bucket del estado, con versionado y acceso público bloqueado:
   ```
   aws s3api create-bucket --bucket tfstate-votaciones-sjunka --region us-east-1
   aws s3api put-bucket-versioning --bucket tfstate-votaciones-sjunka --versioning-configuration Status=Enabled
   aws s3api put-public-access-block --bucket tfstate-votaciones-sjunka --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
   ```
4. Rol `LabRole` para las tareas ECS (Terraform lo lee con un data source, no lo crea):
   ```
   cat > trust.json <<'JSON'
   {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}
   JSON
   aws iam create-role --role-name LabRole --assume-role-policy-document file://trust.json
   aws iam attach-role-policy --role-name LabRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
   aws iam attach-role-policy --role-name LabRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
   ```
   Si el rol ya existe del Taller 3, solo agregar la política de DynamoDB (la última línea) y borrar `trust.json`.
5. Rol vinculado de ECS (si el Taller 3 ya lo creó, el comando responde que existe y se sigue):
   ```
   aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
   ```
6. Usuario IAM de CI con los permisos del Taller 3: `PowerUserAccess` más `iam:GetRole` e `iam:PassRole` sobre `LabRole`. Sin `AWS_SESSION_TOKEN`: las llaves son permanentes.
   ```
   aws iam create-user --user-name github-cicd-votaciones
   aws iam attach-user-policy --user-name github-cicd-votaciones --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
   ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
   aws iam put-user-policy --user-name github-cicd-votaciones --policy-name labrole-passrole --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"iam:GetRole\",\"iam:PassRole\"],\"Resource\":\"arn:aws:iam::${ACCOUNT}:role/LabRole\"}]}"
   aws iam create-access-key --user-name github-cicd-votaciones
   ```
   La salida del último comando muestra `AccessKeyId` y `SecretAccessKey` una sola vez. El nombre `github-cicd-votaciones` es una propuesta mía: el Taller 3 usó `github-cicd-taller3`, se puede reutilizar ese usuario si sigue vivo. No sé si `PowerUserAccess` basta para crear el rol vinculado de ELB en una cuenta nueva; si el primer `apply` pide `iam:CreateServiceLinkedRole`, ejecutar `aws iam create-service-linked-role --aws-service-name elasticloadbalancing.amazonaws.com` con el perfil de administrador.
7. Guardar las llaves como secretos (lo hace el comando, sin pegarlas en el chat ni en archivos):
   ```
   gh secret set AWS_ACCESS_KEY_ID --repo sjunka/votaciones-cicd
   gh secret set AWS_SECRET_ACCESS_KEY --repo sjunka/votaciones-cicd
   ```
   El comando pide el valor por la terminal.

## C. Docker Hub

8. Crear un token de acceso con permiso de lectura y escritura: https://app.docker.com/settings/personal-access-tokens. Guardarlo y definir el usuario:
   ```
   gh secret set DOCKERHUB_TOKEN --repo sjunka/votaciones-cicd
   gh variable set DOCKERHUB_USERNAME --repo sjunka/votaciones-cicd --body "<usuario de Docker Hub>"
   ```
   Los repositorios `votaciones-api` y `votaciones-web` se crean solos con el primer push.

## D. SonarCloud

9. Importar el repo en https://sonarcloud.io (Analyze new project). Dejar el análisis automático apagado y definir el código nuevo en 30 días, como en el Taller 2. Anotar la organización y la clave del proyecto: deben coincidir con `sonar-project.properties` (no sé los valores definitivos: los fija el agente de infra y hay que revisarlos).
10. Crear el token en SonarCloud, My Account, Security, y guardarlo:
   ```
   gh secret set SONAR_TOKEN --repo sjunka/votaciones-cicd
   gh variable set SONAR_HOST_URL --repo sjunka/votaciones-cicd --body "https://sonarcloud.io"
   ```
11. El primer análisis da Quality Gate `NONE` ("Not computed") y el job falla. No es un error del código. Relanzar solo el job caído:
   ```
   gh run list --repo sjunka/votaciones-cicd --limit 1
   gh run rerun <id del run> --repo sjunka/votaciones-cicd --failed
   ```

## E. Discord

12. En el servidor, Editar canal, Integraciones, Webhooks, Nuevo webhook. Copiar la URL y guardarla:
    ```
    gh secret set DISCORD_WEBHOOK_URL --repo sjunka/votaciones-cicd
    ```
    Sin este secreto el pipeline corre igual: el paso de Discord no falla.

## F. Ambientes y protección de `main`

13. Crear los 3 ambientes de GitHub. El id de usuario numérico de cada revisor sale de `gh api users/sjunka --jq .id` y `gh api users/valri2104 --jq .id`:
    ```
    gh api -X PUT repos/sjunka/votaciones-cicd/environments/staging
    gh api -X PUT repos/sjunka/votaciones-cicd/environments/production --input - <<JSON
    {"reviewers":[{"type":"User","id":<id de sjunka>},{"type":"User","id":<id de valri2104>}]}
    JSON
    gh api -X PUT repos/sjunka/votaciones-cicd/environments/production-rollback
    ```
    `production-rollback` va sin revisores a propósito: el regreso no espera aprobación. Se pueden crear también desde Settings, Environments.
14. Ruleset `proteger-main` (Settings, Rules, Rulesets, New branch ruleset): destino `main`; exigir pull request con 1 aprobación; exigir el check de estado `build-and-test`. Hacerlo después del primer run verde, porque el check solo aparece en la lista cuando ya corrió una vez. Si se activa antes, hay que empujar la primera versión por el PR.

## G. GitHub Pages

15. Settings, Pages, Source: "GitHub Actions". El workflow `pages.yml` publica en https://sjunka.github.io/votaciones-cicd/ en el siguiente push que toque `sustentacion/**` (o con `gh workflow run pages.yml`).

## H. Primer run y evidencias

16. Empujar a `main` (o lanzar `gh workflow run ci-cd.yml --ref main`) y seguirlo con `gh run watch`. En `deploy-production`, el run se detiene en "Waiting for review": Sergio o Valeria aprueban en la pestaña del run.
17. Cuando termine en verde, anotar la URL de staging y la de producción: salen del paso de Terraform y de `terraform output alb_url` en cada workspace.
18. Crear al menos 2 Releases antes de exponer. El rollback necesita una versión anterior. Cada run verde crea una (`v1.0.N`), así que bastan dos runs verdes. Cambiar algo menor en `web/` por PR (con aprobación de Valeria) y repetir.
19. Probar el rollback automático rompiendo una versión a propósito. Hay que romper algo que pase staging y falle en producción, y eso no está definido todavía: decidirlo con el código real a la vista (el smoke de producción revisa la web, `/api/health` y la versión esperada). Si no se encuentra una rotura que pase por staging, una alternativa es rechazar el despliegue a propósito con una imagen que no arranca y mostrar el circuit breaker de ECS. Resultado esperado: `smoke-test-production` en rojo, `rollback-production` en verde, run en rojo, aviso en Discord.
20. Probar el botón de pánico: Actions, "Rollback de emergencia", Run workflow, `environment` = `production`, `version` vacía. Comprobar que el banner de la app baja a la versión anterior y que los votos siguen ahí.
21. Tomar las capturas: run verde, run con rollback, pantalla del pánico, Releases, mensajes de Discord, SonarCloud, Docker Hub, app en staging (banner amarillo) y en producción (banner verde).
22. Cargar los datos en `sustentacion/src/data/pendientes.ts` (hoy están en `null`): URL de staging, URL de producción, URL del repo, run exitoso, run con rollback, uso del botón de pánico, Releases, mensajes de Discord, SonarCloud, imágenes en Docker Hub, capturas y métricas DORA. Poner capturas en `sustentacion/public/capturas/`. Empujar: `pages.yml` republica la app.
23. Actualizar los enlaces `pendiente` de `README.md` y `docs/reporte-proyecto-final.html`, y regenerar el PDF.

## I. Al terminar

24. Destruir todo (ver `README.md`, sección "Destruir todo"): `terraform destroy` en `production` y en `staging`, vaciar y borrar el bucket `tfstate-votaciones-sjunka`, borrar el usuario IAM de CI con sus llaves y el rol `LabRole`.
25. Revocar los tokens: Docker Hub, SonarCloud y el webhook de Discord.
26. Borrar los secretos del repo si se va a dejar público: `gh secret delete <NOMBRE> --repo sjunka/votaciones-cicd`.
