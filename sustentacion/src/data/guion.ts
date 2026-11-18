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

export const TOTAL_OBJETIVO_SEG = 900
export const PALABRAS_POR_MIN = 130

const s = (dice: string): Linea => ({ quien: 'Sergio', dice })
const v = (dice: string): Linea => ({ quien: 'Valeria', dice })
const a = (accion: string): Linea => ({ accion })

export const guion: Seccion[] = [
  {
    vista: 'intro',
    titulo: 'Qué hicimos',
    quien: 'Sergio',
    ruta: '#/',
    captura: 'capturas/1-inicio.png',
    tiempoSeg: 33,
    lineas: [
      a('Abrir Inicio. Tener a mano la lista de vistas.'),
      s('Buenos días. Soy Sergio Junca y con Valeria Cardona presentamos el proyecto final.'),
      s('Construimos el pipeline de CI/CD de una app de votación en vivo. El público escanea un QR y vota desde el celular.'),
      s('Partimos del Taller 3: Terraform, ECS Fargate, staging y producción. Ahora la app tiene dos componentes y sumamos rollback y tres modificaciones.'),
      s('Primero va un resumen de una pantalla. Después seguimos el orden de la rúbrica.'),
    ],
  },
  {
    vista: 'resumen',
    titulo: 'Resumen ejecutivo',
    quien: 'Sergio',
    ruta: '#/resumen',
    captura: 'capturas/2-resumen.png',
    tiempoSeg: 59,
    lineas: [
      a('Abrir Resumen. Recorrer las tarjetas de arriba hacia abajo y terminar en la línea de tiempo.'),
      s('El problema: publicar una versión nueva sin subirla a mano, y volver atrás rápido si sale mal.'),
      s('La solución es un solo repositorio, votaciones-cicd, con web, api, infra y tests. GitHub Actions corre el archivo ci-cd.yml en cada cambio.'),
      s('Lo construido: dos imágenes Docker en Docker Hub, infraestructura con Terraform en AWS y dos ambientes, staging y producción.'),
      s('Tres particularidades. La imagen se construye una vez y se promueve. Producción pide aprobación manual. Si las pruebas de humo fallan, un job vuelve a la última Release.'),
      s('Hay dos entradas manuales: la aprobación de producción y el botón de pánico.'),
      a('Señalar la línea de tiempo.'),
      s('La evolución: el Taller 1 fue GitHub Actions, el 2 sumó pruebas, Docker y SonarCloud, el 3 desplegó en ECS. El proyecto cambia la app y suma rollback.'),
    ],
  },
  {
    vista: 'artefacto',
    titulo: 'El artefacto: votación en vivo',
    quien: 'Sergio',
    ruta: '#/artefacto',
    captura: 'capturas/3-artefacto.png',
    tiempoSeg: 55,
    lineas: [
      a('Abrir Artefacto. Señalar las 3 piezas.'),
      s('Alguien crea una pregunta con dos a seis opciones. La app muestra un QR y el público vota desde el celular.'),
      s('Los resultados se refrescan cada dos segundos. Quien creó la encuesta la cierra con un código de administrador.'),
      s('Son tres piezas: la web en React con nginx, la API en Python con Flask y la tabla de DynamoDB.'),
      s('Es complejidad media porque son dos servicios detrás de un mismo balanceador, con una base de datos fuera del contenedor.'),
      s('Las reglas de negocio dan qué probar: un voto por persona, encuesta cerrada, opción inexistente y porcentajes que suman 100.'),
      s('Los votos viven en DynamoDB. Un deploy o un rollback no los borra, porque el esquema no cambia entre versiones.'),
    ],
    preguntas: [
      {
        pregunta: '¿Por qué esta app y no una app nativa?',
        respuesta: 'Una app nativa se distribuye por tiendas, no por ECS, y el salón no la puede instalar. Con el QR nadie instala nada.',
      },
      {
        pregunta: '¿Cuenta como complejidad media?',
        respuesta: 'Son dos servicios, web y api, más DynamoDB. Es nuestra lectura de "dos o más componentes". Se lo preguntamos al profe y falta su confirmación.',
      },
    ],
  },
  {
    vista: 'ramas',
    titulo: 'Ramas y versiones',
    quien: 'Sergio',
    ruta: '#/ramas?esc=pr&paso=3',
    captura: 'capturas/4-ramas.png',
    tiempoSeg: 61,
    lineas: [
      a('Abrir Ramas, escenario Pull request. Paso 1: la rama feature. Pasos 2 a 4: el PR, el check y el ruleset.'),
      s('Usamos trunk-based: una rama main y ramas cortas feature/*. La imagen se construye una sola vez y esa misma se promueve a producción.'),
      s('Cada cambio entra con un pull request. El ruleset proteger-main pide una aprobación y que pase el check build-and-test.'),
      s('En el pull request solo corre build-and-test. No publica ni despliega.'),
      s('Un cambio roto no llega a main, porque el check en rojo bloquea el merge.'),
      a('Cambiar al escenario Merge a main. Paso 1 en adelante; paso 5: nace la Release.'),
      s('Con el merge a main corre todo: publica las imágenes, despliega staging, espera la aprobación y despliega producción.'),
      s('La versión es 1.0.N. El 1.0 sale del archivo VERSION y N es el número de ejecución del run. Cada imagen lleva también el SHA completo.'),
      s('Un cambio solo de documentación no dispara nada, por paths-ignore. Valeria sigue con el pipeline.'),
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
    tiempoSeg: 79,
    lineas: [
      a('Abrir Pipeline, escenario Flujo normal. Pasos 1 a 4: build-and-test.'),
      v('Este es ci-cd.yml. Tiene siete jobs y los mismos nombres del Taller 3.'),
      v('build-and-test corre Black, Flake8, Pylint, ESLint, gitleaks y terraform validate. Después las pruebas con 80 por ciento de cobertura y SonarCloud.'),
      v('Ese nombre no se puede cambiar, porque el ruleset lo exige como check.'),
      v('Construye las dos imágenes y Trivy las escanea. Solo en main las sube a Docker Hub, con la etiqueta 1.0.N y el SHA.'),
      a('Paso 5: deploy-staging.'),
      v('deploy-staging llama a deploy.yml. Ese workflow hace terraform apply en el workspace staging y espera la versión en /api/health.'),
      v('La espera importa. terraform apply puede terminar antes de que la tarea nueva responda, y sin la espera probaríamos la versión vieja.'),
      a('Paso 6: test-staging.'),
      v('test-staging corre las pruebas de integración y Selenium contra el balanceador de staging.'),
      a('Paso 7: señalar la aprobación manual.'),
      v('Aquí espera una persona. deploy-production usa el ambiente production, con Sergio y yo como revisores.'),
      v('Cada job necesita al anterior con needs. Si uno falla, los siguientes no corren.'),
      a('Pasos 8 a 10: deploy-production, smoke y publish-release.'),
      v('Producción repite el apply. smoke-test-production verifica la versión. Si pasa, publish-release crea la Release v1.0.N y avisa a Discord.'),
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
    vista: 'pipeline',
    titulo: 'Cuando el pipeline falla',
    quien: 'Valeria',
    ruta: '#/pipeline?esc=trivy&paso=2',
    captura: 'capturas/6-fallos.png',
    tiempoSeg: 42,
    lineas: [
      a('Cambiar al escenario Falla Trivy en CI. Paso 2: Trivy encuentra el CVE y el job queda en rojo. Paso 3: no hay push ni despliegue.'),
      v('Primer caso. Si Trivy encuentra una vulnerabilidad crítica en una de las imágenes, build-and-test queda en rojo.'),
      v('No se publica nada y no se despliega nada.'),
      v('Trivy corre antes del push a Docker Hub, así que una imagen vulnerable no llega al registro.'),
      a('Cambiar al escenario Falla de smoke en producción. Paso 2: smoke en rojo. Paso 4: se dispara rollback-production.'),
      v('Segundo caso. Si smoke-test-production falla, corre rollback-production.'),
      v('Producción vuelve a la última Release sin que nadie apruebe nada.'),
      v('El run queda en rojo aunque producción esté sana. Es a propósito: el fallo existió y tiene que verse.'),
      v('Sergio sigue con la arquitectura y después con el rollback en detalle.'),
    ],
  },
  {
    vista: 'arquitectura',
    titulo: 'La arquitectura en AWS',
    quien: 'Sergio',
    ruta: '#/arquitectura?esc=ambiente&paso=1',
    captura: 'capturas/7-arquitectura.png',
    tiempoSeg: 69,
    lineas: [
      a('Abrir Arquitectura, escenario Ambiente. Paso 1 en adelante, de izquierda a derecha.'),
      s('Cada ambiente es igual. Entra un Application Load Balancer, votaciones-staging-alb, por el puerto 80.'),
      s('Una regla manda /api/* al target group de la API. Todo lo demás va al de la web.'),
      s('La web llama a la API con rutas relativas. No hay CORS y la misma imagen sirve en los dos ambientes.'),
      s('Cada servicio corre en Fargate con 256 de CPU y 512 de memoria. La API guarda en la tabla votaciones-staging de DynamoDB.'),
      s('Fuera del ambiente: Docker Hub con las imágenes, S3 con el estado de Terraform y CloudWatch con los logs. Las tareas usan el rol LabRole.'),
      s('Los logs de cada servicio van a un grupo de CloudWatch, por ejemplo /ecs/votaciones-staging-api.'),
      s('Si una tarea nueva no queda sana, el circuit breaker de ECS vuelve a la anterior.'),
      a('Cambiar al escenario Dos ambientes.'),
      s('Producción es igual y usa la misma imagen. El banner de la app cambia: amarillo en staging, verde en producción.'),
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
    tiempoSeg: 72,
    lineas: [
      a('Abrir Pruebas. Recorrer la tabla por la columna Dónde.'),
      v('Son once pruebas. Cada una corre en el lugar más barato donde puede fallar.'),
      v('En CI van seis: formato y lint, gitleaks, terraform validate, las unitarias con 80 por ciento, SonarCloud y Trivy. Ninguna toca AWS.'),
      v('Si la cobertura baja de 80 por ciento en la API o en la web, el build falla.'),
      v('Las unitarias de la API usan moto, que simula DynamoDB dentro de pytest.'),
      v('En staging van dos: integración con pytest y requests contra la API real y DynamoDB real, y Selenium, que crea una encuesta, vota y mira el resultado.'),
      v('Selenium usa Chrome con la bandera HttpsFirstBalancedModeAutoEnable desactivada. En el Taller 3 Chrome 157 dejó en blanco el sitio HTTP y falló test-staging.'),
      v('En producción solo corren las smoke, de solo lectura: la web carga, /api/health dice ok y la versión es la esperada. No ensucian datos reales.'),
      v('Las mismas smoke corren después de un rollback. Sergio sigue con el rollback.'),
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
    ],
  },
  {
    vista: 'rollback',
    titulo: 'Rollback automático y botón de pánico',
    quien: 'Sergio',
    ruta: '#/rollback?esc=auto&paso=1',
    captura: 'capturas/9-rollback.png',
    tiempoSeg: 74,
    lineas: [
      a('Abrir Rollback, escenario Rollback automático. Paso 1 en adelante.'),
      s('Los dos caminos usan el mismo deploy.yml, el que ya probamos para ir hacia adelante.'),
      s('Por eso confiamos en el camino de vuelta: ya lo usamos en cada despliegue.'),
      s('Automático: si falla deploy-production o smoke-test-production, corre rollback-production. Busca la última Release de GitHub.'),
      s('Esa Release es la versión buena anterior. La nueva todavía no la tiene, porque la Release se crea solo cuando pasan las smoke.'),
      s('Despliega esa versión, repite las smoke y avisa a Discord. El run termina en rojo a propósito, porque hubo un fallo.'),
      a('Cambiar al escenario Botón de pánico.'),
      s('El botón es el workflow Rollback de emergencia, con workflow_dispatch. Se elige el ambiente y la versión.'),
      s('Si la versión va vacía, usa la Release anterior a la que responde hoy en /api/health.'),
      s('El rollback usa el ambiente production-rollback, sin revisores. La aprobación protege el avance, no el regreso.'),
      s('Revierte la imagen, no la infraestructura. Un cambio malo de infraestructura se revierte con git revert y el pipeline normal.'),
      s('Valeria sigue con las modificaciones.'),
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
        respuesta: 'El rollback avisa y falla. Por eso antes de exponer tienen que existir al menos 2 Releases. Además, el circuit breaker de ECS vuelve a la tarea anterior si la nueva no arranca.',
      },
    ],
  },
  {
    vista: 'modificaciones',
    titulo: 'Las tres modificaciones',
    quien: 'Valeria',
    ruta: '#/modificaciones',
    captura: 'capturas/10-modificaciones.png',
    tiempoSeg: 64,
    lineas: [
      a('Abrir Modificaciones. Una tarjeta por modificación, con el enlace a su evidencia. La de Discord sigue pendiente: falta el webhook.'),
      v('Son tres modificaciones frente al Taller 3. El rollback y el botón de pánico son mínimos del enunciado, no los contamos.'),
      v('Una, DevSecOps. gitleaks busca secretos en el código y en el historial. Trivy escanea las dos imágenes y falla con una vulnerabilidad crítica.'),
      v('Los dos corren dentro de build-and-test, así que bloquean el pull request antes del merge.'),
      v('Dos, versionado SemVer. Cada versión que pasa producción queda como Release v1.0.N, con notas automáticas. Son los puntos a los que vuelve el rollback.'),
      v('La Release la crea publish-release con gh release create.'),
      v('Tres, avisos a Discord. Llega un mensaje al desplegar, al fallar y al hacer rollback, con el enlace al run.'),
      v('La evidencia de la una son los pasos de gitleaks y Trivy en verde, y la de la dos, las Releases v1.0.3 y v1.0.8. La de Discord queda pendiente hasta tener el webhook.'),
    ],
    preguntas: [
      {
        pregunta: '¿Trivy y gitleaks cuentan como modificación si se vieron en teoría?',
        respuesta: 'El CI del Taller 3 no tenía ninguno. Son pasos nuevos en build-and-test, con evidencia en los logs. Falta la confirmación del profe. Si no los acepta, la reserva es el workflow reutilizable deploy.yml.',
      },
    ],
  },
  {
    vista: 'evidencia',
    titulo: 'Evidencia en GitHub Actions',
    quien: 'Valeria',
    ruta: '#/evidencia',
    captura: 'capturas/11-evidencia.png',
    tiempoSeg: 75,
    lineas: [
      a('Abrir Evidencia. Están los enlaces a los runs, a las Releases y las capturas de cada ambiente.'),
      v('Ahora abrimos el run del merge a main en GitHub Actions, el 44342859850.'),
      v('Se ven los jobs en verde, la aprobación de producción y los logs de cada uno. Duró 9 minutos 52 segundos, con la aprobación manual incluida.'),
      v('Después el run 44340166676, con smoke-test-production en rojo, rollback-production en verde y producción de vuelta en la v1.0.3 en unos 3 minutos. Ese cambio roto era a propósito.'),
      v('Y las Releases v1.0.3 y v1.0.8. Un run antes, el 44336684960, el rollback no corrió por una condición mal escrita. La corregimos en el pull request 3. El canal de Discord sigue pendiente. Sergio hace la demo de la app.'),
    ],
  },
  {
    vista: 'evidencia',
    titulo: 'Demo en vivo',
    quien: 'Sergio',
    ruta: '#/evidencia',
    captura: 'capturas/12-demo.png',
    tiempoSeg: 150,
    lineas: [
      a('Orden de la demo. Producción: http://votaciones-production-alb-267954360.us-east-1.elb.amazonaws.com. Staging: http://votaciones-staging-alb-1433721465.us-east-1.elb.amazonaws.com. Encuesta de la demo en producción: /p/G8mR9uj4.'),
      a('Paso 1: mostrar el QR de producción con la pregunta "¿GitHub Actions o CircleCI?". El salón vota.'),
      s('Escaneen el QR y voten. Los porcentajes se mueven cada dos segundos.'),
      a('Paso 2: staging al lado de producción, los dos en la versión 1.0.8.'),
      s('Staging tiene el banner amarillo y la versión nueva. Producción tiene el verde.'),
      a('Paso 3: lanzar el botón de pánico al inicio de la demo. Mientras corre, Valeria explica las pruebas.'),
      s('Lanzo Rollback de emergencia sobre producción. Mientras corre, Valeria vuelve a las pruebas.'),
      a('Paso 4: cuando termina, el banner de producción muestra la versión anterior, suena Discord y los votos siguen. Los votos viven en DynamoDB.'),
      s('Producción volvió a la versión anterior. El número del banner cambió y los votos siguen ahí.'),
      a('Paso 5: reproducir el video del rollback automático, con las smoke en rojo y el rollback en verde. Pendiente: grabar el video; si no hay, abrir el run 44340166676.'),
    ],
  },
  {
    vista: 'aprendizajes',
    titulo: 'Desafíos y aprendizajes',
    quien: 'Sergio',
    ruta: '#/aprendizajes',
    captura: 'capturas/13-aprendizajes.png',
    tiempoSeg: 61,
    lineas: [
      a('Abrir Aprendizajes. Turnarse tarjeta por tarjeta.'),
      s('El primer desafío. test-staging falló con NoSuchElementException aunque el balanceador respondía.'),
      v('Chrome 157 activa HTTPS-First y deja en blanco los sitios solo HTTP. En local pasaba porque localhost no se afecta. Agregamos la bandera al fixture de Selenium.'),
      s('El primer análisis de SonarCloud da Quality Gate NONE y falla el escaneo. Se corrige con gh run rerun --failed, como dice la guía.'),
      v('Al diseñar el rollback vimos otra cosa: la aprobación protege el avance, no el regreso. Por eso existe production-rollback.'),
      s('También que el rollback revierte la imagen, no la infraestructura.'),
      v('Y la cuenta de AWS. Sergio usa su cuenta personal, no Academy. Creamos LabRole a mano y un usuario IAM solo para el pipeline, con llaves permanentes.'),
      s('Esa cuenta cuesta dinero real. Por eso destruimos todo con terraform destroy al terminar.'),
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
    tiempoSeg: 20,
    lineas: [
      a('Abrir Rúbrica. Señalar los chips de estado.'),
      v('Esta pantalla muestra cada punto de la rúbrica con su vista y su estado. Lo que dice pendiente es el canal de Discord.'),
      s('Un repositorio, siete jobs en ci-cd.yml, dos ambientes y dos formas de volver atrás.'),
      s('Quedamos atentos a las preguntas.'),
    ],
  },
]

const palabras = (t: string) => t.trim().split(/\s+/).length
export const palabrasSeccion = (sec: Seccion) => sec.lineas.reduce((n, l) => ('dice' in l ? n + palabras(l.dice) : n), 0)
export const totalSeg = guion.reduce((t, b) => t + b.tiempoSeg, 0)
export const totalPalabras = guion.reduce((t, b) => t + palabrasSeccion(b), 0)
export const fmtTiempo = (seg: number) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
