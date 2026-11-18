import { Link } from 'react-router-dom'
import Pendiente, { Listo } from '../components/Pendiente'
import { Slide } from '../components/Slide'

type Fila = { n?: number; texto: string; ruta: string; vista: string; pendiente?: string }

const puntos: Fila[] = [
  { n: 1, texto: 'Artefacto: propósito, funcionalidades y complejidad', ruta: '/artefacto', vista: 'Artefacto' },
  { n: 2, texto: 'Estrategia de ramas y versionamiento, con el porqué', ruta: '/ramas', vista: 'Ramas' },
  { n: 3, texto: 'Diseño del pipeline, con la herramienta de cada paso', ruta: '/pipeline', vista: 'Pipeline' },
  { n: 4, texto: 'Versionamiento en el pipeline: qué corre en qué evento', ruta: '/ramas', vista: 'Ramas' },
  { n: 5, texto: 'Diagrama de arquitectura de software', ruta: '/arquitectura', vista: 'Arquitectura' },
  { n: 6, texto: 'Pruebas: ambiente, qué valida y por qué', ruta: '/pruebas', vista: 'Pruebas' },
  { n: 7, texto: 'Pipelines ejecutados con éxito, con logs', ruta: '/evidencia', vista: 'Evidencia', pendiente: 'falta el run real' },
  { n: 8, texto: 'Evidencia de las 3 modificaciones', ruta: '/modificaciones', vista: 'Modificaciones', pendiente: 'faltan logs, Releases y Discord' },
  { n: 9, texto: 'App funcionando en cada ambiente', ruta: '/evidencia', vista: 'Evidencia', pendiente: 'faltan las URLs de AWS' },
  { n: 10, texto: 'Desafíos y aprendizajes', ruta: '/aprendizajes', vista: 'Aprendizajes' },
]

const minimos: Fila[] = [
  { texto: 'CI: Checkout, Build, Test (estáticas, unitarias y cobertura) y Release', ruta: '/pipeline', vista: 'Pipeline' },
  { texto: 'CD: IaC, Deploy Infra y Deploy App en 2 ambientes', ruta: '/arquitectura', vista: 'Arquitectura', pendiente: 'falta el run en AWS' },
  { texto: 'CD: Tests pre-prod y post-prod (smoke)', ruta: '/pruebas', vista: 'Pruebas' },
  { texto: 'Rollback automático ante fallo de smoke', ruta: '/rollback', vista: 'Rollback', pendiente: 'falta el run con rollback' },
  { texto: 'Rollback manual (botón de pánico)', ruta: '/rollback', vista: 'Rollback', pendiente: 'falta usarlo en AWS' },
  { texto: 'Estrategia de ramas sustentada', ruta: '/ramas', vista: 'Ramas' },
  { texto: '3 modificaciones o introducciones', ruta: '/modificaciones', vista: 'Modificaciones', pendiente: 'faltan logs, Releases y Discord' },
]

function Lista({ filas }: { filas: Fila[] }) {
  return (
    <ul className="grid gap-sm">
      {filas.map((f) => (
        <li key={f.texto} className="flex flex-wrap items-center gap-md rounded-lg border border-hairline bg-card p-md">
          {f.n !== undefined && <span className="w-[36px] font-serif text-[30px] text-primary-active">{f.n}</span>}
          <span className="min-w-[260px] flex-1 text-[19px] text-ink">{f.texto}</span>
          <Link to={f.ruta} className="text-[18px] font-medium text-primary-active underline">{f.vista}</Link>
          <Listo />
          {f.pendiente && <Pendiente texto={`pendiente: ${f.pendiente}`} />}
        </li>
      ))}
    </ul>
  )
}

export default function Rubrica() {
  return (
    <Slide titulo="Rúbrica" sub="Los 10 puntos de la presentación, en el orden del profe, y los mínimos del pipeline.">
      <Lista filas={puntos} />
      <h2 className="mt-xl text-[28px]">Mínimos del pipeline</h2>
      <div className="mt-sm"><Lista filas={minimos} /></div>
      <p className="mt-md text-[16px] text-muted">
        "Listo en la app" significa que la vista está hecha. "Pendiente" es la evidencia real que depende de correr el pipeline en AWS.
      </p>
    </Slide>
  )
}
