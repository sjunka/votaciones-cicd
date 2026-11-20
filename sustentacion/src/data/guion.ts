// Guion de la sustentación del proyecto final. Una sección por pantalla, con su captura.
// Línea con `dice`: lo que se dice en voz alta. Línea con `accion`: qué mostrar o qué clic hacer.
// Los pasos "Paso N" salen de src/data/{ramas,pipeline,arquitectura,rollback}.ts.
// El reparto entre expositores es una propuesta, falta confirmar.
export type Quien = 'Sergio' | 'Valeria'
export type Vista = 'intro' | 'resumen' | 'artefacto' | 'ramas' | 'pipeline' | 'arquitectura' | 'pruebas' | 'rollback' | 'modificaciones' | 'evidencia' | 'aprendizajes' | 'cierre'

export type Linea = { quien: Quien; dice: string } | { accion: string }

export interface Seccion {
  vista: Vista
  titulo: string
  quien: Quien
  ruta: string // ruta de la app a abrir, con escenario y paso
  captura: string // archivo en public/capturas/
  tiempoSeg: number
  lineas: Linea[]
  preguntas?: { pregunta: string; respuesta: string }[]
}

export const colorQuien: Record<Quien, string> = { Sergio: '#2f6fe4', Valeria: '#b0397a' }

// 10 minutos de exposición; los otros 5 del turno son preguntas
export const TOTAL_OBJETIVO_SEG = 600
export const PALABRAS_POR_MIN = 130

const s = (dice: string): Linea => ({ quien: 'Sergio', dice })
const v = (dice: string): Linea => ({ quien: 'Valeria', dice })
const a = (accion: string): Linea => ({ accion })

export const guion: Seccion[] = [
  {
    vista: 'resumen',
    titulo: 'Qué construimos',
    quien: 'Sergio',
    ruta: '#/resumen',
    captura: 'capturas/2-resumen.png',
    tiempoSeg: 45,
    lineas: [
      a('Abrir Resumen. Recorrer las tarjetas y terminar en la línea de tiempo.'),
      s('Buenos días. Soy Sergio Junca y con Valeria Cardona presentamos el proyecto final.'),
      s('Hicimos el pipeline de CI/CD de una app de votación en vivo. El público escanea un QR y vota desde el celular.'),
      s('Un solo repositorio, votaciones-cicd, con web, api, infra y tests. GitHub Actions corre ci-cd.yml en cada cambio y despliega a staging y producción en AWS.'),
      s('Venimos del Taller 3. Ahora hay dos componentes más una base de datos, y sumamos rollback automático, botón de pánico y tres modificaciones.'),
    ],
  },
  {
    vista: 'artefacto',
    titulo: 'El artefacto: votación en vivo',
    quien: 'Sergio',
    ruta: '#/artefacto',
    captura: 'capturas/3-artefacto.png',
    tiempoSeg: 40,
    lineas: [
      a('Abrir Artefacto. Señalar las 3 piezas.'),
      s('Alguien crea una pregunta con dos a seis opciones. La app muestra un QR y los resultados se refrescan cada dos segundos.'),
      s('Son tres piezas: la web en React con nginx, la API en Python con Flask y la tabla de DynamoDB. Dos servicios detrás de un balanceador: eso es complejidad media.'),
      s('Hay reglas que probar: un voto por persona, encuesta cerrada, opción inexistente y porcentajes que suman 100.'),
      s('Los votos viven en DynamoDB, así que un deploy o un rollback no los borra.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué esta app y no una app nativa?',
        respuesta: 'Una app nativa se distribuye por tiendas, no por ECS, y el salón no la puede instalar. Con el QR nadie instala nada.',
      },
      {
        pregunta: '¿Cuenta como complejidad media?',
        respuesta: 'Son dos servicios, web y api, más DynamoDB. Es nuestra lectura de "dos o más componentes".',
      },
    ],
  },
  {
    vista: 'ramas',
    titulo: 'Ramas y versiones',
    quien: 'Sergio',
    ruta: '#/ramas?esc=pr&paso=3',
    captura: 'capturas/4-ramas.png',
    tiempoSeg: 45,
    lineas: [
      a('Abrir Ramas, escenario Pull request. Pasos 1 a 4: la rama, el PR, el check y el ruleset.'),
      s('Usamos trunk-based: una rama main y ramas cortas feature/*. El ruleset proteger-main pide un pull request y que pase build-and-test.'),
      s('En el pull request solo corre build-and-test. No publica ni despliega.'),
      a('Cambiar al escenario Merge a main. Paso 4: la versión.'),
      s('Con el merge a main corre todo: publica las imágenes, despliega staging, espera la aprobación y despliega producción.'),
      s('La versión es 1.0.N: el 1.0 sale del archivo VERSION y N es el número de ejecución. Cada imagen lleva también el SHA. Un cambio solo de documentación no dispara nada.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué trunk-based y no GitFlow?',
        respuesta: 'Con GitFlow, develop iría a staging y main a producción. El merge a main reconstruiría la imagen y producción recibiría un artefacto que no se probó en staging. Nosotros la construimos una vez y promovemos esa misma.',
      },
      {
        pregunta: '¿Por qué solo el SHA no alcanza?',
        respuesta: 'El SHA no se lee en una demo y no deja una lista de versiones buenas. Con 1.0.N y las Releases, el rollback sabe a dónde volver.',
      },
    ],
  },
  {
    vista: 'pipeline',
    titulo: 'El pipeline ci-cd.yml',
    quien: 'Valeria',
    ruta: '#/pipeline?esc=normal&paso=1',
    captura: 'capturas/5-pipeline.png',
    tiempoSeg: 65,
    lineas: [
      a('Abrir Pipeline, escenario Flujo normal. Pasos 1 a 4: build-and-test.'),
      v('Este es ci-cd.yml, con los mismos nombres de job del Taller 3. build-and-test corre lint, gitleaks, terraform validate, las pruebas con 80 por ciento de cobertura y SonarCloud.'),
      v('Después construye las dos imágenes, Trivy las escanea y solo en main las sube a Docker Hub.'),
      a('Pasos 5 y 6: deploy-staging y test-staging.'),
      v('deploy-staging llama a deploy.yml: terraform apply en el workspace staging y espera la versión nueva en /api/health. test-staging corre integración y Selenium.'),
      a('Paso 7: señalar la aprobación manual.'),
      v('Aquí espera una persona. El ambiente production tiene revisores.'),
      a('Pasos 8 a 10: deploy-production, smoke y publish-release.'),
      v('Producción repite el apply. Si las smoke pasan, publish-release crea la Release v1.0.N. Si fallan, entra el rollback, que le explica Sergio.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué GitHub Actions y no CircleCI?',
        respuesta: 'La diapositiva pide mostrar los logs en GitHub Actions y el Taller 3 ya era la base: reusamos 5 de los 7 jobs. CircleCI tiene botón de rollback nativo y mejor caché, y es un punto a su favor. Con 8 días no justificaba migrar. La tabla con nuestro puntaje está en Alternativas.',
      },
      {
        pregunta: '¿Por qué una sola imagen para los dos ambientes?',
        respuesta: 'Se construye en build-and-test y se promueve. Lo que probamos en staging es lo mismo que llega a producción. La web llama a /api con rutas relativas, así que no depende del ambiente.',
      },
    ],
  },
  {
    vista: 'arquitectura',
    titulo: 'La arquitectura en AWS',
    quien: 'Sergio',
    ruta: '#/arquitectura?esc=ambiente&paso=1',
    captura: 'capturas/7-arquitectura.png',
    tiempoSeg: 50,
    lineas: [
      a('Abrir Arquitectura, escenario Ambiente. Pasos 1 a 4, de izquierda a derecha.'),
      s('Cada ambiente es igual. Entra un Application Load Balancer por el puerto 80. Una regla manda /api/* al target group de la API y lo demás al de la web.'),
      s('Cada servicio corre en Fargate. La API guarda en una tabla de DynamoDB por ambiente.'),
      a('Paso 5 en adelante: Docker Hub, S3, CloudWatch.'),
      s('Fuera del ambiente están Docker Hub con las imágenes, S3 con el estado de Terraform y CloudWatch con los logs.'),
      a('Cambiar al escenario Dos ambientes.'),
      s('Producción es igual y usa la misma imagen. El banner cambia: amarillo en staging, verde en producción.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué DynamoDB y no RDS?',
        respuesta: 'RDS tarda en crear y cuesta más. DynamoDB va bajo demanda y Terraform la crea con el resto de la infraestructura.',
      },
      {
        pregunta: '¿Por qué HTTP y no HTTPS?',
        respuesta: 'El ALB escucha en el puerto 80, como en el Taller 3. Algunos celulares avisan "no seguro". Es una limitación y la decimos al público.',
      },
    ],
  },
  {
    vista: 'pruebas',
    titulo: 'Las pruebas',
    quien: 'Valeria',
    ruta: '#/pruebas',
    captura: 'capturas/8-pruebas.png',
    tiempoSeg: 45,
    lineas: [
      a('Abrir Pruebas. Recorrer la tabla por la columna Dónde.'),
      v('Cada prueba corre en el lugar más barato donde puede fallar.'),
      v('En CI van seis y ninguna toca AWS: lint, gitleaks, terraform validate, unitarias con moto, SonarCloud y Trivy.'),
      v('En staging van dos, contra la API real y DynamoDB real: integración con pytest y el flujo completo con Selenium.'),
      v('En producción solo corren las smoke, de solo lectura: la web carga, /api/health dice ok y la versión es la esperada. No ensucian datos reales.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué moto y no DynamoDB Local?',
        respuesta: 'moto corre dentro de pytest, sin contenedor extra. La prueba contra DynamoDB real ocurre en staging.',
      },
      {
        pregunta: '¿Por qué las smoke son de solo lectura?',
        respuesta: 'Producción tiene datos reales. Las smoke tardan segundos y no crean encuestas. Si fallan, hay rollback.',
      },
      {
        pregunta: '¿Qué encontró el E2E en staging?',
        respuesta: 'Un bug real: crypto.randomUUID no existe por HTTP, así que nadie podía votar por el balanceador. En local pasaba porque localhost cuenta como contexto seguro. Lo corregimos en el pull request 1.',
      },
    ],
  },
  {
    vista: 'rollback',
    titulo: 'Rollback automático y botón de pánico',
    quien: 'Sergio',
    ruta: '#/rollback?esc=auto&paso=1',
    captura: 'capturas/9-rollback.png',
    tiempoSeg: 55,
    lineas: [
      a('Abrir Rollback, escenario Rollback automático. Pasos 1 a 3.'),
      s('Automático: si fallan las smoke de producción, corre rollback-production. Busca la última Release, que es la versión buena anterior, porque la Release se crea solo cuando pasan las smoke.'),
      s('Despliega esa versión, repite las smoke y el run termina en rojo a propósito.'),
      a('Cambiar al escenario Botón de pánico.'),
      s('El botón es el workflow Rollback de emergencia: se elige ambiente y versión. Sin versión, vuelve a la Release anterior a la actual.'),
      s('Los dos caminos usan el mismo deploy.yml que usamos para avanzar. Y usan el ambiente production-rollback, sin revisores: la aprobación protege el avance, no el regreso.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué el rollback usa otro ambiente?',
        respuesta: 'Porque production tiene revisores. Si el rollback usara ese ambiente, se quedaría esperando una aprobación mientras producción está caída. production-rollback apunta al mismo workspace de Terraform pero no pide revisores.',
      },
      {
        pregunta: '¿Qué pasa con los votos al hacer rollback?',
        respuesta: 'Siguen ahí. Los votos están en DynamoDB, fuera del contenedor, y el esquema no cambia entre versiones. El rollback solo cambia la imagen.',
      },
      {
        pregunta: '¿Y si no hay una Release previa?',
        respuesta: 'El rollback avisa y falla. Hoy hay tres Releases. Además, el circuit breaker de ECS vuelve a la tarea anterior si la nueva no arranca.',
      },
      {
        pregunta: '¿El rollback revierte la infraestructura?',
        respuesta: 'No, revierte la imagen. Un cambio malo de infraestructura se revierte con git revert y el pipeline normal.',
      },
    ],
  },
  {
    vista: 'modificaciones',
    titulo: 'Las tres modificaciones',
    quien: 'Valeria',
    ruta: '#/modificaciones',
    captura: 'capturas/10-modificaciones.png',
    tiempoSeg: 45,
    lineas: [
      a('Abrir Modificaciones. Una tarjeta por modificación, con su enlace.'),
      v('Tres modificaciones frente al Taller 3. El rollback y el botón de pánico son mínimos del enunciado, no los contamos.'),
      v('Una, DevSecOps: gitleaks busca secretos en el código y el historial, y Trivy escanea las dos imágenes. Los dos corren en build-and-test.'),
      v('Dos, versionado SemVer: cada versión que pasa producción queda como Release v1.0.N. Hoy hay cuatro.'),
      v('Tres, un workflow reutilizable: deploy.yml lo usan staging, producción, el rollback automático y el botón de pánico.'),
      v('Además la arquitectura es nueva: dos servicios con una regla del balanceador y DynamoDB. Y dejamos avisos a Discord implementados, a la espera del webhook.'),
    ],
    preguntas: [
      {
        pregunta: '¿Trivy y gitleaks cuentan como modificación si se vieron en teoría?',
        respuesta: 'El CI del Taller 3 no tenía ninguno. Son pasos nuevos en build-and-test, con evidencia en los logs del run 44348025068.',
      },
      {
        pregunta: '¿Y los avisos a Discord?',
        respuesta: 'Los jobs notify-failure, notify-rollback y notify están implementados y no fallan sin webhook. Falta crear el webhook, así que todavía no hay mensajes que mostrar. No los contamos entre las tres.',
      },
    ],
  },
  {
    vista: 'evidencia',
    titulo: 'Evidencia en GitHub Actions',
    quien: 'Valeria',
    ruta: '#/evidencia',
    captura: 'capturas/11-evidencia.png',
    tiempoSeg: 40,
    lineas: [
      a('Abrir Evidencia. Abrir el run 44348025068 y luego el 44340166676.'),
      v('Este es el run del merge a main, el 44348025068: todos los jobs en verde, la aprobación de producción y los logs. Duró 9 minutos 42 segundos con la aprobación incluida.'),
      v('Y este es el run 44340166676: smoke en rojo, rollback-production en verde y producción de vuelta en la v1.0.3 en unos 3 minutos. El cambio roto era a propósito.'),
      v('En el run anterior, el 44336684960, el rollback no corrió por una condición mal escrita. La corregimos con el pull request 3.'),
    ],
  },
  {
    vista: 'evidencia',
    titulo: 'Demo en vivo',
    quien: 'Sergio',
    ruta: '#/evidencia',
    captura: 'capturas/12-demo.png',
    tiempoSeg: 75,
    lineas: [
      a('Orden de la demo. Producción: http://votaciones-production-alb-267954360.us-east-1.elb.amazonaws.com. Staging: http://votaciones-staging-alb-1433721465.us-east-1.elb.amazonaws.com. Encuesta de producción: /p/G8mR9uj4.'),
      a('Paso 1: mostrar el QR de producción con la pregunta "¿GitHub Actions o CircleCI?".'),
      s('Escaneen el QR y voten. Los porcentajes se mueven cada dos segundos.'),
      a('Paso 2: staging al lado de producción, los dos en la versión 1.0.12.'),
      s('Staging tiene el banner amarillo y producción el verde. Los dos corren la misma versión.'),
      a('Paso 3 (opcional si hay tiempo): lanzar el botón de pánico en producción y mostrar el banner con la versión anterior. Tarda unos 4 minutos: mejor abrir el run 44344815777 ya hecho.'),
    ],
  },
  {
    vista: 'aprendizajes',
    titulo: 'Desafíos y aprendizajes',
    quien: 'Sergio',
    ruta: '#/aprendizajes',
    captura: 'capturas/13-aprendizajes.png',
    tiempoSeg: 35,
    lineas: [
      a('Abrir Aprendizajes. Turnarse tarjeta por tarjeta.'),
      s('Primero, el E2E contra el balanceador nos mostró un bug que en local no existía: crypto.randomUUID no funciona por HTTP.'),
      v('Segundo, el primer rollback automático no corrió. El if por defecto de un job exige que todos los ancestros pasen. Con always() quedó probado.'),
      s('Tercero, la aprobación protege el avance, no el regreso. Por eso existe production-rollback.'),
      v('Y la cuenta de AWS es la personal de Sergio, no Academy: cuesta dinero real, así que destruimos todo al terminar.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué llaves permanentes y no OIDC?',
        respuesta: 'Usamos un usuario IAM de CI con llaves guardadas en GitHub Secrets, como en el Taller 3. No probamos OIDC.',
      },
    ],
  },
  {
    vista: 'cierre',
    titulo: 'Cierre',
    quien: 'Valeria',
    ruta: '#/rubrica',
    captura: 'capturas/14-cierre.png',
    tiempoSeg: 10,
    lineas: [
      a('Abrir Rúbrica.'),
      v('Un repositorio, siete jobs en ci-cd.yml, dos ambientes y dos formas de volver atrás. Quedamos atentos a las preguntas.'),
    ],
  },
]

const palabras = (t: string) => t.trim().split(/\s+/).length
export const palabrasSeccion = (sec: Seccion) => sec.lineas.reduce((n, l) => ('dice' in l ? n + palabras(l.dice) : n), 0)
export const totalSeg = guion.reduce((t, b) => t + b.tiempoSeg, 0)
export const totalPalabras = guion.reduce((t, b) => t + palabrasSeccion(b), 0)
export const fmtTiempo = (seg: number) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
