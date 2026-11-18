import type { Arista, Escenario, Nodo, Paso } from '../lib/tipos'

export const ANCHO = 1215
export const ALTO = 730

// Jobs y needs de ci-cd.yml (contrato del proyecto, plan secciones 5.2 y 5.3).
export const nodos: Nodo[] = [
  { id: 'gci', x: 5, y: 5, w: 1205, h: 225, titulo: 'Job 1: build-and-test (PR y push a main)', tipo: 'grupo' },
  { id: 'c1', x: 20, y: 45, w: 190, h: 170, titulo: 'Checkout', logo: 'github', vertical: true, sub: ['actions/checkout', 'setup-python', 'setup-node'] },
  { id: 'c2', x: 260, y: 45, w: 210, h: 170, titulo: 'Build', logo: 'vite', vertical: true, sub: ['pip install y npm ci', 'build del front con Vite'] },
  { id: 'c3', x: 520, y: 45, w: 310, h: 170, titulo: 'Test', logo: 'pytest', vertical: true, mod: 'Modificación 1', sub: ['gitleaks, Black, Flake8, Pylint', 'ESLint, terraform fmt y validate', 'pytest + moto, Vitest (80 %)', 'SonarCloud con quality gate'] },
  { id: 'c4', x: 885, y: 45, w: 320, h: 170, titulo: 'Release', logo: 'docker', vertical: true, mod: 'Modificación 1', sub: ['docker build de las 2 imágenes', 'Trivy: falla si hay CRITICAL', 'push 1.0.N y SHA a Docker Hub'] },

  { id: 'j2', x: 910, y: 275, w: 270, h: 100, titulo: 'deploy-staging', monoTitulo: true, num: 2, logo: 'terraform', sub: ['terraform apply', 'workspace staging'] },
  { id: 'j3', x: 630, y: 275, w: 230, h: 100, titulo: 'test-staging', monoTitulo: true, num: 3, logo: 'selenium', sub: ['pytest + requests', 'Selenium (E2E)'] },
  { id: 'gate', x: 360, y: 275, w: 220, h: 100, titulo: 'Aprobación', tipo: 'puerta', logo: 'lock', sub: ['manual, revisores', 'ambiente production'] },
  { id: 'j4', x: 30, y: 275, w: 280, h: 100, titulo: 'deploy-production', monoTitulo: true, num: 4, logo: 'terraform', sub: ['terraform apply', 'workspace production'] },

  { id: 'j5', x: 30, y: 430, w: 340, h: 100, titulo: 'smoke-test-production', monoTitulo: true, num: 5, logo: 'pytest', sub: ['pytest, solo lectura', 'verifica la versión esperada'] },
  { id: 'j6', x: 440, y: 430, w: 300, h: 100, titulo: 'publish-release', monoTitulo: true, num: 6, logo: 'release', mod: 'Modificación 2', sub: ['gh release create', 'notas automáticas'] },

  { id: 'j7', x: 30, y: 580, w: 340, h: 100, titulo: 'rollback-production', monoTitulo: true, num: 7, logo: 'github', sub: ['última Release, deploy.yml', 'smoke y aviso'] },
  { id: 'rel', x: 450, y: 580, w: 280, h: 100, titulo: 'GitHub Release', mod: 'Modificación 2', logo: 'release', sub: ['v1.0.N', 'punto de restauración'] },
  { id: 'dis', x: 800, y: 580, w: 250, h: 100, titulo: 'Discord', mod: 'Modificación 3', logo: 'discord', sub: ['aviso con enlace al run'] },
]

export const aristas: Arista[] = [
  { id: 'k1', de: 'c1', a: 'c2', ld: 'r', la: 'l' },
  { id: 'k2', de: 'c2', a: 'c3', ld: 'r', la: 'l' },
  { id: 'k3', de: 'c3', a: 'c4', ld: 'r', la: 'l' },
  { id: 'r2', de: 'c4', a: 'j2', ld: 'b', la: 't', etiqueta: 'solo main' },
  { id: 'n23', de: 'j2', a: 'j3', ld: 'l', la: 'r' },
  { id: 'n3g', de: 'j3', a: 'gate', ld: 'l', la: 'r' },
  { id: 'g4', de: 'gate', a: 'j4', ld: 'l', la: 'r', etiqueta: 'ok' },
  { id: 'n45', de: 'j4', a: 'j5', ld: 'b', la: 't', od: 30, etiqueta: 'needs' },
  { id: 'ok6', de: 'j5', a: 'j6', ld: 'r', la: 'l', etiqueta: 'ok' },
  { id: 'f7', de: 'j5', a: 'j7', ld: 'b', la: 't', etiqueta: 'falla' },
  { id: 'f7b', de: 'j4', a: 'j7', ld: 'l', la: 'l', bend: 14 },
  { id: 'cr', de: 'j6', a: 'rel', ld: 'b', la: 't', etiqueta: 'crea' },
  { id: 'ur', de: 'j7', a: 'rel', ld: 'r', la: 'l', etiqueta: 'última' },
  { id: 'av6', de: 'j6', a: 'dis', ld: 'r', la: 't', etiqueta: 'aviso' },
  { id: 'av7', de: 'j7', a: 'dis', ld: 'b', la: 'b', bend: 705, etiqueta: 'aviso' },
]

const ci = ['c1', 'c2', 'c3', 'c4']
const cd = ['j2', 'j3', 'gate', 'j4', 'j5', 'j6', 'j7', 'rel', 'dis']
const sinRollback = ['j7', 'rel', 'dis']

const p = (titulo: string, texto: string, nodos: string[], aristas: string[], extra: Partial<Paso> = {}): Paso => ({ titulo, texto, nodos, aristas, ...extra })

export const escenarios: Escenario[] = [
  {
    id: 'normal',
    nombre: 'Flujo normal',
    pasos: [
      p('Checkout y entorno', 'build-and-test corre en cada PR y en cada push a main. Empieza con actions/checkout y deja listos Python y Node con setup-python y setup-node.', ['c1'], [], { omitidos: cd }),
      p('Build', 'Instala las dependencias de la API (pip) y de la web (npm ci) y compila el front con Vite. Es una sola vez: todo lo que sigue usa ese resultado.', ['c2'], ['k1'], { omitidos: cd }),
      p('Test: calidad, secretos y pruebas', 'Black, Flake8, Pylint y ESLint revisan el estilo. gitleaks busca llaves en el código y el historial. terraform fmt y validate revisan la infraestructura sin tocar AWS. pytest con moto y Vitest piden 80 % de cobertura y SonarCloud aplica su quality gate.', ['c3'], ['k2'], { omitidos: cd, estado: 'ok', aviso: 'Pruebas y quality gate en verde' }),
      p('Release: imágenes escaneadas y publicadas', 'docker build de las 2 imágenes (api y web), Trivy sobre cada una y, solo en main, push a Docker Hub con las etiquetas 1.0.N y el SHA. Se construye una vez y se promueve la misma imagen.', ['c4'], ['k3'], { omitidos: cd, estado: 'ok', aviso: 'Imágenes publicadas en Docker Hub' }),
      p('deploy-staging: infraestructura y app', 'Llama a deploy.yml con el workspace staging. Un terraform apply crea o actualiza ALB, ECS y DynamoDB y despliega la versión; luego espera hasta 5 minutos a que /api/health devuelva la versión nueva.', ['j2', 'c4'], ['r2'], { omitidos: ['j7', 'rel', 'dis', 'j6'] }),
      p('test-staging: pruebas con la infraestructura real', 'Integración de la API con pytest y requests (errores 400, 404 y 409 contra DynamoDB real) y flujo completo con Selenium: crear, votar y ver el resultado.', ['j3'], ['n23'], { omitidos: sinRollback, estado: 'ok', aviso: 'Integración y E2E en verde en staging' }),
      p('Aprobación manual para producción', 'El ambiente production de GitHub tiene revisores (Sergio y Valeria). El pipeline se detiene hasta que uno apruebe.', ['gate'], ['n3g'], { omitidos: sinRollback, estado: 'espera', aviso: 'Esperando la aprobación de un revisor' }),
      p('deploy-production: el mismo deploy', 'Mismo deploy.yml, workspace production. Es la imagen que ya pasó por staging.', ['j4'], ['g4'], { omitidos: sinRollback }),
      p('smoke-test-production: solo lectura', 'La web carga, /api/health responde ok con la base conectada y la versión esperada. No escribe datos.', ['j5'], ['n45'], { omitidos: ['j7', 'rel'], estado: 'ok', aviso: 'Smoke en verde: la versión quedó en producción' }),
      p('publish-release y aviso', 'Con las smoke en verde, publish-release crea la Release v1.0.N con notas automáticas (modificación 2) y avisa a Discord (modificación 3).', ['j6', 'rel', 'dis'], ['ok6', 'cr', 'av6'], { omitidos: ['j7'], estado: 'ok', aviso: 'Release v1.0.N publicada y aviso enviado' }),
    ],
  },
  {
    id: 'trivy',
    nombre: 'Falla Trivy en CI',
    falla: true,
    pasos: [
      p('Hasta Test todo pasa', 'Checkout, build y pruebas salen en verde. Hasta aquí es un run normal.', ['c1', 'c2', 'c3'], ['k1', 'k2'], { omitidos: cd, estado: 'ok', aviso: 'Pruebas y quality gate en verde' }),
      p('Trivy encuentra un CVE crítico', 'Después del docker build, Trivy escanea cada imagen y está configurado para fallar con severidad CRITICAL. El job build-and-test termina en rojo (modificación 1).', ['c4'], ['k3'], { omitidos: cd, estado: 'fail', aviso: 'Trivy: CVE crítico en la imagen' }),
      p('No hay push ni despliegue', 'El push a Docker Hub es un paso posterior del mismo job, así que no llega a ejecutarse. Los jobs de CD tienen needs: build-and-test: quedan omitidos. En un PR, el check rojo bloquea el merge por el ruleset.', ['c4'], [], { omitidos: cd, estado: 'fail', aviso: 'Nada se publica ni se despliega' }),
      p('Se corrige y vuelve a correr', 'Se actualiza la dependencia o la imagen base en un PR nuevo. Con Trivy en verde, el pipeline sigue como en el flujo normal.', ['c4', 'c3'], ['k3'], { omitidos: cd, estado: 'ok', aviso: 'Trivy en verde' }),
    ],
  },
  {
    id: 'smoke',
    nombre: 'Falla de smoke en producción',
    falla: true,
    pasos: [
      p('El deploy a producción termina', 'deploy-production aplica la versión nueva en el workspace production, después de la aprobación manual.', ['j4'], ['g4'], { omitidos: ci.concat(['j6', 'rel']) }),
      p('smoke-test-production falla', 'La web no carga, /api/health no responde ok o la versión no es la esperada. El job termina en rojo.', ['j5'], ['n45'], { omitidos: ci.concat(['j6', 'rel']), estado: 'fail', aviso: 'Smoke de producción en rojo' }),
      p('publish-release queda omitido', 'publish-release tiene needs: smoke-test-production y if: success(). La versión que falló no recibe Release, así que la última Release es la versión buena anterior.', ['j6'], [], { omitidos: ['j6'] }),
      p('rollback-production se dispara', 'Tiene if: failure(): corre cuando falla el deploy o las smoke de producción, y no cuando falla algo anterior.', ['j7'], ['f7', 'f7b'], { omitidos: ['j6'], estado: 'fail', aviso: 'Rollback automático en marcha' }),
      p('Busca la última Release', 'Consulta las Releases de GitHub y toma la última: es la versión buena anterior.', ['j7', 'rel'], ['ur'], { omitidos: ['j6'] }),
      p('Despliega esa versión y repite las smoke', 'Llama a deploy.yml con esa versión, en el workspace production pero con el ambiente production-rollback, que no tiene revisores. Después repite las smoke.', ['j7', 'j5'], [], { omitidos: ['j6'], estado: 'ok', aviso: 'Producción vuelve a responder la versión anterior' }),
      p('Aviso a Discord', 'Avisa con el enlace al run (modificación 3). El run termina en rojo a propósito: hubo un fallo, aunque producción ya esté sana.', ['j7', 'dis'], ['av7'], { omitidos: ['j6'], estado: 'fail', aviso: 'Run en rojo a propósito' }),
    ],
  },
]
