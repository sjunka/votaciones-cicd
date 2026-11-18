export type Lado = 't' | 'b' | 'l' | 'r'
export type LogoId =
  | 'github' | 'githubactions' | 'docker' | 'python' | 'laptop' | 'lock'
  | 'ecs' | 'elb' | 's3' | 'cloudwatch' | 'terraform' | 'fargate'
  | 'react' | 'vite' | 'pytest' | 'selenium' | 'discord' | 'dynamodb' | 'release' | 'internet'

export interface Nodo {
  id: string
  x: number
  y: number
  w: number
  h: number
  titulo: string
  sub?: string[]
  logo?: LogoId
  /** Logo arriba y texto centrado (nodos angostos). */
  vertical?: boolean
  /** El título va en monoespaciada (nombres de jobs). */
  monoTitulo?: boolean
  /** Las líneas sub van en monoespaciada. */
  monoSub?: boolean
  /** Número de paso mostrado en la esquina. */
  num?: number
  tipo?: 'normal' | 'grupo' | 'puerta'
  /** Etiqueta de modificación del proyecto (por ejemplo, "Modificación 1"). */
  mod?: string
}

export interface Arista {
  id: string
  de: string
  a: string
  ld?: Lado
  la?: Lado
  etiqueta?: string
  /** Coordenada del tramo intermedio (x si sale horizontal, y si sale vertical). */
  bend?: number
  /** Desplazamiento del punto de salida y de llegada a lo largo del lado. */
  od?: number
  oa?: number
}

export interface Paso {
  titulo: string
  texto: string
  nodos: string[]
  aristas: string[]
  estado?: 'info' | 'ok' | 'fail' | 'espera'
  omitidos?: string[]
  /** Aviso grande y visible sobre el diagrama. */
  aviso?: string
}

export interface Escenario {
  id: string
  nombre: string
  /** Escenario de falla: la pestaña se pinta de rojo. */
  falla?: boolean
  pasos: Paso[]
}
