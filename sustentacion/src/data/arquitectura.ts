import type { Arista, Escenario, Nodo } from '../lib/tipos'

export const ANCHO = 1200
export const ALTO = 745

// Recursos de infra/main.tf según el contrato: ALB, 2 target groups, regla /api/*, 2 servicios Fargate, DynamoDB.
export const nodos: Nodo[] = [
  { id: 'users', x: 15, y: 145, w: 150, h: 130, titulo: 'Celulares', sub: ['escanean el QR'], logo: 'internet', vertical: true },

  { id: 'amb', x: 190, y: 10, w: 1010, h: 385, titulo: 'Ambiente staging (production es igual)', tipo: 'grupo' },
  { id: 'alb', x: 215, y: 145, w: 150, h: 130, titulo: 'ALB', sub: ['HTTP, puerto 80'], logo: 'elb', vertical: true },
  { id: 'tgA', x: 470, y: 55, w: 170, h: 130, titulo: 'Target group api', sub: ['health: /api/health'], logo: 'elb', vertical: true },
  { id: 'tgW', x: 470, y: 230, w: 170, h: 130, titulo: 'Target group web', sub: ['health: /'], logo: 'elb', vertical: true },
  { id: 'svcA', x: 720, y: 55, w: 190, h: 130, titulo: 'Fargate api', sub: ['Python y Flask', '256 CPU, 512 MB'], logo: 'python', vertical: true },
  { id: 'svcW', x: 720, y: 230, w: 190, h: 130, titulo: 'Fargate web', sub: ['nginx y React', '256 CPU, 512 MB'], logo: 'react', vertical: true },
  { id: 'db', x: 985, y: 55, w: 190, h: 130, titulo: 'DynamoDB', sub: ['tabla por ambiente', 'votaciones-<amb>'], logo: 'dynamodb', vertical: true },

  { id: 'gha', x: 100, y: 450, w: 300, h: 100, titulo: 'GitHub Actions', sub: ['ci-cd.yml, deploy.yml', 'panic-rollback.yml'], logo: 'githubactions' },
  { id: 'hub', x: 470, y: 450, w: 210, h: 100, titulo: 'Docker Hub', sub: ['votaciones-api', 'votaciones-web'], logo: 'docker' },
  { id: 'role', x: 750, y: 450, w: 210, h: 100, titulo: 'LabRole', sub: ['rol de las tareas'], logo: 'lock' },
  { id: 'cw', x: 990, y: 450, w: 200, h: 100, titulo: 'CloudWatch', sub: ['logs por servicio'], logo: 'cloudwatch' },

  { id: 's3', x: 100, y: 600, w: 220, h: 100, titulo: 'Bucket S3', sub: ['estado de Terraform'], logo: 's3' },
  { id: 'dis', x: 470, y: 600, w: 230, h: 100, titulo: 'Discord', sub: ['avisos al desplegar,', 'fallar o revertir'], logo: 'discord' },
  { id: 'amb2', x: 770, y: 600, w: 420, h: 100, titulo: 'Ambiente production', sub: ['mismo código y mismos recursos', 'tabla, ALB y servicios propios'], logo: 'ecs' },
]

export const aristas: Arista[] = [
  { id: 'u1', de: 'users', a: 'alb', ld: 'r', la: 'l', etiqueta: 'HTTP' },
  { id: 'a1', de: 'alb', a: 'tgA', ld: 'r', la: 'l', od: -25, etiqueta: '/api/*' },
  { id: 'a2', de: 'alb', a: 'tgW', ld: 'r', la: 'l', od: 25, etiqueta: 'resto' },
  { id: 't1', de: 'tgA', a: 'svcA', ld: 'r', la: 'l', etiqueta: 'tareas' },
  { id: 't2', de: 'tgW', a: 'svcW', ld: 'r', la: 'l', etiqueta: 'tareas' },
  { id: 'd1', de: 'svcA', a: 'db', ld: 'r', la: 'l', etiqueta: 'boto3' },

  { id: 'g1', de: 'gha', a: 'amb', ld: 't', la: 'b', oa: -445, etiqueta: 'workspace staging' },
  { id: 'g3', de: 'gha', a: 'hub', ld: 'r', la: 'l', etiqueta: 'push' },
  { id: 'g4', de: 'hub', a: 'amb', ld: 't', la: 'b', oa: -120, etiqueta: 'pull de imágenes' },
  { id: 'g5', de: 'role', a: 'amb', ld: 't', la: 'b', oa: 160, etiqueta: 'rol de las tareas' },
  { id: 'g6', de: 'amb', a: 'cw', ld: 'b', la: 't', od: 395, etiqueta: 'logs' },
  { id: 'g2', de: 'gha', a: 's3', ld: 'b', la: 't', od: -40, etiqueta: 'estado' },
  { id: 'g7', de: 'gha', a: 'dis', ld: 'b', la: 'l', od: 90, etiqueta: 'aviso' },
  { id: 'g8', de: 'gha', a: 'amb2', ld: 'b', la: 'b', od: 120, bend: 728, etiqueta: 'workspace production' },
]

const sin2 = ['amb2']

export const escenarios: Escenario[] = [
  {
    id: 'ambiente',
    nombre: 'Ambiente',
    pasos: [
      { titulo: 'El público llega por el ALB', texto: 'Cada persona escanea el QR y abre la encuesta en el celular. Todo entra por el ALB del ambiente, en HTTP por el puerto 80.', nodos: ['users', 'alb'], aristas: ['u1'], omitidos: sin2 },
      { titulo: 'Regla /api/*: va a la API', texto: 'El listener del ALB tiene una regla: si la ruta empieza por /api/ la manda al target group api, que revisa /api/health, y de ahí a la tarea Fargate de la API (Python y Flask).', nodos: ['alb', 'tgA', 'svcA'], aristas: ['a1', 't1'], omitidos: sin2 },
      { titulo: 'La API guarda en DynamoDB', texto: 'La API usa boto3 para leer y escribir en la tabla votaciones-<ambiente>. Los votos viven ahí, no en el contenedor: sobreviven a un deploy y a un rollback.', nodos: ['svcA', 'db'], aristas: ['d1'], omitidos: sin2 },
      { titulo: 'Todo lo demás: va a la web', texto: 'La acción por defecto del listener es el target group web, que revisa /, y de ahí a la tarea Fargate con nginx y el build de React. La web llama a la API con rutas relativas /api/..., por el mismo ALB: no hay CORS.', nodos: ['alb', 'tgW', 'svcW'], aristas: ['a2', 't2'], omitidos: sin2 },
      { titulo: 'Las imágenes vienen de Docker Hub', texto: 'Las dos tareas descargan votaciones-api y votaciones-web de Docker Hub con la etiqueta 1.0.N. GitHub Actions las publicó en el job build-and-test.', nodos: ['gha', 'hub', 'amb'], aristas: ['g3', 'g4'], omitidos: sin2 },
      { titulo: 'LabRole y CloudWatch', texto: 'Las tareas usan el rol LabRole, que se crea a mano. Cada servicio escribe sus logs en su propio grupo de CloudWatch.', nodos: ['role', 'cw', 'amb'], aristas: ['g5', 'g6'], omitidos: sin2 },
      { titulo: 'Terraform crea el ambiente', texto: 'deploy.yml corre terraform apply en el workspace staging y guarda el estado en el bucket de S3.', nodos: ['gha', 'amb', 's3'], aristas: ['g1', 'g2'], omitidos: sin2 },
      { titulo: 'Discord recibe los avisos', texto: 'GitHub Actions avisa a Discord al desplegar, al fallar y al hacer rollback (extra, falta el webhook).', nodos: ['gha', 'dis'], aristas: ['g7'], omitidos: sin2 },
    ],
  },
  {
    id: 'dos',
    nombre: 'Dos ambientes',
    pasos: [
      { titulo: 'Un solo código para los dos ambientes', texto: 'La carpeta infra/ es la misma para staging y para production. Lo único que cambia es el workspace de Terraform.', nodos: ['gha', 'amb', 'amb2'], aristas: ['g1', 'g8'] },
      { titulo: 'Staging: workspace staging', texto: 'terraform apply en el workspace staging crea tabla votaciones-staging, ALB, 2 target groups, 2 servicios y sus logs.', nodos: ['gha', 'amb'], aristas: ['g1'], omitidos: sin2 },
      { titulo: 'Production: workspace production', texto: 'Después de la aprobación manual, el mismo apply en el workspace production crea los mismos recursos con el nombre votaciones-production. Sus datos no se mezclan con los de staging.', nodos: ['gha', 'amb2'], aristas: ['g8'], omitidos: ['amb'] },
      { titulo: 'El estado de cada ambiente, en S3', texto: 'Un solo bucket guarda el estado de Terraform, un archivo por workspace. Así staging y production no se pisan.', nodos: ['gha', 's3'], aristas: ['g2'] },
      { titulo: 'La misma imagen en los dos', texto: 'Se construye una vez y se promueve: la imagen 1.0.N que probamos en staging es la que llega a production.', nodos: ['hub', 'amb', 'amb2'], aristas: ['g4'] },
    ],
  },
]
