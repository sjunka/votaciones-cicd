import type { Arista, Escenario, Nodo } from '../lib/tipos'

export const ANCHO = 1200
export const ALTO = 575

// Hechos del plan (secciones 5.1 y 5.3) y de ci-cd.yml: eventos, ruleset proteger-main, versión 1.0.N.
export const nodos: Nodo[] = [
  { id: 'dev', x: 15, y: 30, w: 160, h: 110, titulo: 'Equipo', sub: ['Sergio', 'y Valeria'], logo: 'laptop' },
  { id: 'feature', x: 235, y: 30, w: 190, h: 110, titulo: 'feature/*', monoTitulo: true, sub: ['rama corta', 'sale de main'], logo: 'github' },
  { id: 'pr', x: 505, y: 30, w: 220, h: 110, titulo: 'Pull request', sub: ['hacia main', '1 aprobación'], logo: 'github' },
  { id: 'main', x: 825, y: 30, w: 360, h: 110, titulo: 'main', monoTitulo: true, sub: ['rama protegida por el ruleset', 'no se hace push directo'], logo: 'github' },

  { id: 'rules', x: 15, y: 240, w: 300, h: 110, titulo: 'Ruleset proteger-main', sub: ['PR obligatorio, 1 aprobación', 'check build-and-test'], logo: 'lock' },
  { id: 'chk', x: 495, y: 240, w: 240, h: 110, titulo: 'build-and-test', monoTitulo: true, sub: ['check del PR', 'verde o rojo'], logo: 'githubactions' },
  { id: 'ci', x: 825, y: 240, w: 360, h: 110, titulo: 'ci-cd.yml', monoTitulo: true, sub: ['7 jobs', 'build, staging, producción'], logo: 'githubactions' },

  { id: 'pan', x: 15, y: 430, w: 260, h: 110, titulo: 'Botón de pánico', sub: ['workflow_dispatch', 'vuelve a una Release'], logo: 'githubactions' },
  { id: 'rel', x: 435, y: 430, w: 290, h: 110, titulo: 'Release v1.0.N', sub: ['punto de restauración', 'notas automáticas'], logo: 'release' },
  { id: 'ver', x: 825, y: 430, w: 360, h: 110, titulo: 'Versión 1.0.N', sub: ['N es el número de ejecución', 'imágenes con 1.0.N y SHA'], logo: 'docker' },
]

export const aristas: Arista[] = [
  { id: 'e1', de: 'dev', a: 'feature', ld: 'r', la: 'l', etiqueta: 'push' },
  { id: 'e2', de: 'feature', a: 'pr', ld: 'r', la: 'l', etiqueta: 'abre PR' },
  { id: 'e3', de: 'pr', a: 'main', ld: 'r', la: 'l', etiqueta: 'merge' },
  { id: 'e4', de: 'pr', a: 'chk', ld: 'b', la: 't', etiqueta: 'pull_request' },
  { id: 'e5', de: 'rules', a: 'chk', ld: 'r', la: 'l', etiqueta: 'exige' },
  { id: 'e6', de: 'main', a: 'ci', ld: 'b', la: 't', etiqueta: 'push a main' },
  { id: 'e7', de: 'ci', a: 'ver', ld: 'b', la: 't', etiqueta: 'etiqueta' },
  { id: 'e8', de: 'ver', a: 'rel', ld: 'l', la: 'r', etiqueta: 'smoke ok' },
  { id: 'e9', de: 'rel', a: 'pan', ld: 'l', la: 'r', etiqueta: 'restaura' },
]

const soloPr = ['ci', 'ver', 'rel', 'pan']

export const escenarios: Escenario[] = [
  {
    id: 'pr',
    nombre: 'Pull request',
    pasos: [
      {
        titulo: 'Una rama corta por cambio',
        texto: 'Trabajamos con trunk-based: cada cambio sale de main en una rama feature/* de vida corta. Nadie hace push directo a main.',
        nodos: ['dev', 'feature'], aristas: ['e1'], omitidos: soloPr,
      },
      {
        titulo: 'Se abre el pull request',
        texto: 'La rama feature/* se propone hacia main con un PR. Ahí se revisa el código y se ven los checks.',
        nodos: ['feature', 'pr'], aristas: ['e2'], omitidos: soloPr,
      },
      {
        titulo: 'En el PR corre solo build-and-test',
        texto: 'El evento pull_request ejecuta un job: build-and-test, con lint, gitleaks, pruebas, Sonar y Trivy. No publica imágenes ni despliega: los demás jobs salen omitidos.',
        nodos: ['pr', 'chk'], aristas: ['e4'], omitidos: soloPr, estado: 'ok', aviso: 'Check verde en el PR',
      },
      {
        titulo: 'El ruleset decide si se puede mezclar',
        texto: 'El ruleset proteger-main exige PR, 1 aprobación y el check build-and-test en verde. Sin eso, GitHub no deja hacer merge.',
        nodos: ['rules', 'chk'], aristas: ['e5'], omitidos: soloPr, estado: 'espera', aviso: 'Falta 1 aprobación para mezclar',
      },
    ],
  },
  {
    id: 'merge',
    nombre: 'Merge a main',
    pasos: [
      {
        titulo: 'Se mezcla el PR',
        texto: 'Con el check verde y 1 aprobación, el PR se mezcla en main.',
        nodos: ['pr', 'main'], aristas: ['e3'], omitidos: ['pan'], estado: 'ok', aviso: 'Merge permitido por el ruleset',
      },
      {
        titulo: 'El push a main dispara ci-cd.yml',
        texto: 'Ahora sí corren los 7 jobs: build-and-test, deploy-staging, test-staging, aprobación manual, deploy-production, smoke-test-production y, según el resultado, publish-release o rollback-production.',
        nodos: ['main', 'ci'], aristas: ['e6'], omitidos: ['pan'],
      },
      {
        titulo: 'Un push solo de documentación no corre nada',
        texto: 'ci-cd.yml ignora los cambios que solo tocan **.md, docs/**, sustentacion/** o pages.yml (paths-ignore). Por eso esta sustentación se publica sin disparar el pipeline.',
        nodos: ['main'], aristas: [], omitidos: ['ci', 'ver', 'rel', 'pan', 'chk', 'rules'],
      },
      {
        titulo: 'La versión es 1.0.N',
        texto: 'El archivo VERSION trae 1.0 (lo cambiamos a mano) y el PATCH N es el número de ejecución del run. Se construye una vez y las imágenes llevan las etiquetas 1.0.N y el SHA completo.',
        nodos: ['ci', 'ver'], aristas: ['e7'], omitidos: ['pan'],
      },
      {
        titulo: 'Pasa producción: nace la Release v1.0.N',
        texto: 'Si smoke-test-production sale verde, publish-release crea la Release v1.0.N con notas automáticas. Es la modificación 2: cada Release es un punto de restauración.',
        nodos: ['ver', 'rel'], aristas: ['e8'], omitidos: ['pan'], estado: 'ok', aviso: 'Release v1.0.N creada',
      },
      {
        titulo: 'El botón de pánico también lee las Releases',
        texto: 'Rollback de emergencia es un workflow_dispatch en panic-rollback.yml. Vuelve a la versión que elijamos o, si la dejamos vacía, a la Release anterior.',
        nodos: ['rel', 'pan'], aristas: ['e9'], omitidos: ['rules', 'chk'],
      },
    ],
  },
]

export const eventos: { evento: string; rama: string; jobs: string; resultado: string }[] = [
  { evento: 'pull_request', rama: 'feature/* hacia main', jobs: 'build-and-test', resultado: 'Check verde o rojo en el PR. No publica ni despliega: los demás jobs salen omitidos.' },
  { evento: 'push (merge del PR)', rama: 'main', jobs: 'build-and-test, deploy-staging, test-staging, aprobación, deploy-production, smoke-test-production, y luego publish-release o rollback-production', resultado: 'Versión 1.0.N en los dos ambientes y Release v1.0.N, o rollback automático.' },
  { evento: 'push solo de documentación (**.md, docs/**)', rama: 'main', jobs: 'Ninguno', resultado: 'paths-ignore: no se dispara ci-cd.yml.' },
  { evento: 'workflow_dispatch en panic-rollback.yml', rama: 'main', jobs: 'rollback', resultado: 'El ambiente elegido vuelve a la versión elegida (por defecto, la Release anterior).' },
]
