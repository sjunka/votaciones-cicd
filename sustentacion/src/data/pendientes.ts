/**
 * Datos que todavía no existen (AWS, Docker Hub, SonarCloud y Discord están apagados).
 * null = pendiente. La app muestra un chip "pendiente" y nunca inventa un valor.
 * Cuando haya el dato real, se escribe aquí y no se toca nada más.
 */
export const URL_REPO_EQUIPO: string | null = 'https://github.com/sjunka/votaciones-cicd'
export const URL_STAGING: string | null = null
export const URL_PRODUCCION: string | null = null
export const URL_DOCKERHUB: string | null = null
export const URL_SONARCLOUD: string | null = null
export const URL_RUN_EXITOSO: string | null = null
export const URL_RUN_ROLLBACK_AUTOMATICO: string | null = null
export const URL_RUN_BOTON_PANICO: string | null = null
export const URL_RELEASES: string | null = null
export const URL_DISCORD: string | null = null

/** Rutas de capturas dentro de public/ (por ejemplo 'evidencias/produccion.png'). */
export const capturas: { titulo: string; ruta: string | null }[] = [
  { titulo: 'App en staging (banner amarillo y versión)', ruta: null },
  { titulo: 'App en producción (banner verde y versión)', ruta: null },
  { titulo: 'Run exitoso con todos los jobs en verde', ruta: null },
  { titulo: 'Run con rollback automático', ruta: null },
  { titulo: 'Página de Releases', ruta: null },
  { titulo: 'Mensajes en el canal de Discord', ruta: null },
  { titulo: 'SonarCloud: quality gate y cobertura', ruta: null },
]

/** Métricas DORA del proyecto, sacadas de los runs (gh run list). Solo datos reales. */
export const dora: { metrica: string; valor: string | null }[] = [
  { metrica: 'Despliegues por día', valor: null },
  { metrica: 'Tiempo del commit a producción', valor: null },
  { metrica: 'Tasa de fallos de despliegue', valor: null },
  { metrica: 'Tiempo de recuperación con el rollback', valor: null },
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
  { titulo: 'Canal de Discord', url: URL_DISCORD },
]
