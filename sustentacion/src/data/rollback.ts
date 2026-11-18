import type { Arista, Escenario, Nodo } from '../lib/tipos'

export const ANCHO = 1200
export const ALTO = 525

// Flujo de rollback-production (ci-cd.yml) y panic-rollback.yml; ambos llaman a deploy.yml.
export const nodos: Nodo[] = [
  { id: 'sm', x: 15, y: 30, w: 240, h: 120, titulo: 'Falla en producción', sub: ['smoke-test-production o', 'deploy-production en rojo'] },
  { id: 'rb', x: 315, y: 30, w: 250, h: 120, titulo: 'rollback-production', monoTitulo: true, sub: ['if: failure()', 'job de ci-cd.yml'] },
  { id: 'pan', x: 15, y: 190, w: 240, h: 120, titulo: 'Botón de pánico', sub: ['workflow_dispatch', 'ambiente y versión'], logo: 'githubactions' },
  { id: 'rbp', x: 315, y: 190, w: 250, h: 120, titulo: 'rollback', monoTitulo: true, sub: ['panic-rollback.yml', 'Rollback de emergencia'] },

  { id: 'rel', x: 625, y: 105, w: 240, h: 130, titulo: 'GitHub Release', sub: ['la última Release', 'o la versión elegida'], logo: 'release' },
  { id: 'dep', x: 925, y: 105, w: 270, h: 130, titulo: 'deploy.yml', monoTitulo: true, sub: ['ambiente y versión', 'terraform apply'], logo: 'terraform' },

  { id: 'prod', x: 925, y: 380, w: 270, h: 120, titulo: 'Ambiente elegido', sub: ['ECS Fargate, DynamoDB', 'imagen de la Release'], logo: 'ecs' },
  { id: 'sm2', x: 625, y: 380, w: 240, h: 120, titulo: 'Smoke tests', sub: ['las mismas de siempre', 'solo lectura'], logo: 'pytest' },
  { id: 'dis', x: 315, y: 380, w: 250, h: 120, titulo: 'Discord', sub: ['aviso con enlace al run'], logo: 'discord' },
  { id: 'red', x: 15, y: 380, w: 240, h: 120, titulo: 'Run en rojo', sub: ['a propósito', 'hubo un fallo'] },
]

export const aristas: Arista[] = [
  { id: 'a1', de: 'sm', a: 'rb', ld: 'r', la: 'l', etiqueta: 'falla' },
  { id: 'a2', de: 'rb', a: 'rel', ld: 'r', la: 'l', oa: -20 },
  { id: 'b1', de: 'pan', a: 'rbp', ld: 'r', la: 'l', etiqueta: 'clic' },
  { id: 'b2', de: 'rbp', a: 'rel', ld: 'r', la: 'l', oa: 20 },
  { id: 'c1', de: 'rel', a: 'dep', ld: 'r', la: 'l' },
  { id: 'c2', de: 'dep', a: 'prod', ld: 'b', la: 't', etiqueta: 'apply' },
  { id: 'c3', de: 'prod', a: 'sm2', ld: 'l', la: 'r' },
  { id: 'c4', de: 'sm2', a: 'dis', ld: 'l', la: 'r', etiqueta: 'aviso' },
  { id: 'c5', de: 'dis', a: 'red', ld: 'l', la: 'r' },
]

const soloManual = ['pan', 'rbp']
const soloAuto = ['sm', 'rb', 'red']

export const escenarios: Escenario[] = [
  {
    id: 'auto',
    nombre: 'Rollback automático',
    falla: true,
    pasos: [
      { titulo: 'Las smoke de producción fallan', texto: 'deploy-production termina bien o mal, pero smoke-test-production sale en rojo: la versión nueva no responde como debe.', nodos: ['sm'], aristas: [], omitidos: soloManual, estado: 'fail', aviso: 'Smoke de producción en rojo' },
      { titulo: 'Se dispara rollback-production', texto: 'El job tiene if: failure() y mira el resultado de deploy-production y smoke-test-production. Corre cuando falla alguno de los dos, no cuando falla algo anterior.', nodos: ['sm', 'rb'], aristas: ['a1'], omitidos: soloManual, estado: 'fail', aviso: 'Rollback automático en marcha' },
      { titulo: 'Busca la última Release', texto: 'La versión nueva no pasó las smoke, así que no tiene Release. La última Release es la versión buena anterior.', nodos: ['rb', 'rel'], aristas: ['a2'], omitidos: soloManual },
      { titulo: 'deploy.yml con production-rollback', texto: 'Llama al mismo deploy.yml con esa versión, en el workspace production de Terraform y con el ambiente de GitHub production-rollback. Ese ambiente no tiene revisores: volver no espera aprobación.', nodos: ['rel', 'dep', 'prod'], aristas: ['c1', 'c2'], omitidos: soloManual },
      { titulo: 'Repite las smoke', texto: 'Las mismas smoke de siempre contra la versión restaurada: web, /api/health y la versión esperada.', nodos: ['prod', 'sm2'], aristas: ['c3'], omitidos: soloManual, estado: 'ok', aviso: 'Producción responde la versión anterior' },
      { titulo: 'Aviso a Discord', texto: 'Discord recibe el mensaje con el enlace al run (extra).', nodos: ['sm2', 'dis'], aristas: ['c4'], omitidos: soloManual },
      { titulo: 'El run termina en rojo a propósito', texto: 'Hubo un fallo, aunque producción ya esté sana. El rojo deja constancia de que la versión nueva no pasó.', nodos: ['dis', 'red'], aristas: ['c5'], omitidos: soloManual, estado: 'fail', aviso: 'Run en rojo a propósito' },
    ],
  },
  {
    id: 'panico',
    nombre: 'Botón de pánico',
    pasos: [
      { titulo: 'Run workflow en Actions', texto: 'En Actions se elige Rollback de emergencia y Run workflow. Es un workflow_dispatch: solo lo ve quien tiene permiso de escritura en el repo y GitHub registra quién lo usó.', nodos: ['pan'], aristas: [], omitidos: soloAuto },
      { titulo: 'Se elige ambiente y versión', texto: 'Entradas: ambiente (production o staging) y versión. Si la versión va vacía, usa la Release anterior a la versión que hoy responde /api/health del ambiente.', nodos: ['pan', 'rbp'], aristas: ['b1'], omitidos: soloAuto },
      { titulo: 'Toma esa Release', texto: 'Si no hay una Release previa, el workflow avisa y falla. Por eso antes de la demo debe haber al menos 2 Releases.', nodos: ['rbp', 'rel'], aristas: ['b2'], omitidos: soloAuto },
      { titulo: 'Mismo deploy.yml', texto: 'Llama al mismo deploy.yml que el rollback automático y que el deploy normal: el camino para volver es el que ya probamos para ir.', nodos: ['rel', 'dep', 'prod'], aristas: ['c1', 'c2'], omitidos: soloAuto },
      { titulo: 'Repite las smoke', texto: 'Las mismas smoke contra el ambiente elegido.', nodos: ['prod', 'sm2'], aristas: ['c3'], omitidos: soloAuto, estado: 'ok', aviso: 'El ambiente responde la versión elegida' },
      { titulo: 'Aviso con el nombre de quién lo lanzó', texto: 'Discord recibe "Rollback manual por <usuario>" con el enlace al run.', nodos: ['sm2', 'dis'], aristas: ['c4'], omitidos: soloAuto, estado: 'ok', aviso: 'Rollback manual avisado' },
    ],
  },
]

export const notas: { titulo: string; texto: string }[] = [
  { titulo: 'Revierte la imagen, no la infraestructura', texto: 'Un cambio malo de infraestructura se arregla con git revert y el pipeline normal.' },
  { titulo: 'El circuit breaker de ECS sigue activo', texto: 'Si la versión nueva no arranca, ECS vuelve sola a la anterior, el apply falla y rollback-production deja todo en la última Release.' },
]
