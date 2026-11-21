/**
 * Datos de ejecución del proyecto, tomados del 2026-11-18. Discord activo desde el 2026-11-20.
 * null = pendiente. La app muestra un chip "pendiente" y nunca inventa un valor.
 * Cuando haya el dato real, se escribe aquí y no se toca nada más.
 */
export const URL_REPO_EQUIPO: string | null = 'https://github.com/sjunka/votaciones-cicd'
export const URL_STAGING: string | null = 'http://votaciones-staging-alb-1433721465.us-east-1.elb.amazonaws.com'
export const URL_PRODUCCION: string | null = 'http://votaciones-production-alb-267954360.us-east-1.elb.amazonaws.com'
export const URL_DOCKERHUB: string | null = 'https://hub.docker.com/r/sjunka/votaciones-api'
export const URL_SONARCLOUD: string | null = 'https://sonarcloud.io/project/overview?id=sjunka_votaciones-cicd'
export const URL_RUN_EXITOSO: string | null = 'https://github.com/sjunka/votaciones-cicd/actions/runs/44348025068'
export const URL_RUN_ROLLBACK_AUTOMATICO: string | null = 'https://github.com/sjunka/votaciones-cicd/actions/runs/44340166676'
export const URL_RUN_BOTON_PANICO: string | null = 'https://github.com/sjunka/votaciones-cicd/actions/runs/44344815777'
export const URL_RELEASES: string | null = 'https://github.com/sjunka/votaciones-cicd/releases'
export const URL_DISCORD: string | null = 'https://discord.gg/jcHPz3tJ2'

/** Rutas de capturas dentro de public/. */
export const capturas: { titulo: string; ruta: string | null }[] = [
  { titulo: 'App en staging (banner amarillo, encuesta de prueba con 4 votos)', ruta: 'evidencias/staging-encuesta.png' },
  { titulo: 'App en producción (banner verde, encuesta de la demo)', ruta: 'evidencias/produccion-encuesta.png' },
  { titulo: 'Acerca de esta versión en producción (versión y commit)', ruta: 'evidencias/produccion-acerca.png' },
  { titulo: 'Run exitoso: jobs en verde y la aprobación a producción', ruta: 'evidencias/run-exitoso.png' },
  { titulo: 'Run con rollback automático', ruta: 'evidencias/run-rollback-automatico.png' },
  { titulo: 'Run del botón de pánico', ruta: 'evidencias/run-boton-panico.png' },
  { titulo: 'Página de Releases', ruta: 'evidencias/releases.png' },
  { titulo: 'SonarCloud: quality gate Passed y cobertura 98,5 %', ruta: 'evidencias/sonarcloud.png' },
  { titulo: 'Docker Hub: imágenes con etiquetas 1.0.N y SHA', ruta: 'evidencias/dockerhub.png' },
  { titulo: 'Mensajes en el canal de Discord', ruta: 'evidencias/discord.png' },
]

/** Métricas DORA del proyecto, sacadas de los runs (gh run list). Solo datos reales. */
export const dora: { metrica: string; valor: string | null }[] = [
  { metrica: 'Despliegues a producción', valor: '5 intentos el 2026-11-18, 3 buenos (v1.0.3, v1.0.8 y v1.0.12)' },
  { metrica: 'Tiempo del commit a producción', valor: '9 min 42 s en el run 44348025068 (incluye la aprobación manual)' },
  { metrica: 'Tasa de fallos de despliegue', valor: '2 de 5, los dos por la falla provocada para probar el rollback' },
  { metrica: 'Tiempo de recuperación con el rollback', valor: 'unos 3 min en el run 44340166676 (smoke en rojo hasta smoke del rollback en verde)' },
]

export const enlacesExternos: { titulo: string; url: string | null }[] = [
  { titulo: 'Repositorio del equipo', url: URL_REPO_EQUIPO },
  { titulo: 'Staging (ALB)', url: URL_STAGING },
  { titulo: 'Producción (ALB)', url: URL_PRODUCCION },
  { titulo: 'Run exitoso en GitHub Actions', url: URL_RUN_EXITOSO },
  { titulo: 'Run con rollback automático', url: URL_RUN_ROLLBACK_AUTOMATICO },
  { titulo: 'Run del botón de pánico', url: URL_RUN_BOTON_PANICO },
  { titulo: 'Releases', url: URL_RELEASES },
  { titulo: 'Docker Hub', url: URL_DOCKERHUB },
  { titulo: 'SonarCloud', url: URL_SONARCLOUD },
  { titulo: 'Run donde el rollback no corrió (condición corregida en el PR 3)', url: 'https://github.com/sjunka/votaciones-cicd/actions/runs/44336684960' },
  { titulo: 'PR 3: corrige la condición del rollback', url: 'https://github.com/sjunka/votaciones-cicd/pull/3' },
  { titulo: 'Servidor de Discord (canal #general)', url: URL_DISCORD },
]
