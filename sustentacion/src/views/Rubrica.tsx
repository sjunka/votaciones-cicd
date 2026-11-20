import { Link } from 'react-router-dom'
import Pendiente, { Listo } from '../components/Pendiente'
import { Slide } from '../components/Slide'

type Fila = { n?: number; texto: string; ruta: string; vista: string; pendiente?: string }

const puntos: Fila[] = [
  { n: 1, texto: 'Explica el artefacto: propósito, funcionalidades y complejidad', ruta: '/artefacto', vista: 'Artefacto' },
  { n: 2, texto: 'Sustenta la estrategia de versionamiento o ramificación', ruta: '/ramas', vista: 'Ramas' },
  { n: 3, texto: 'Flujograma del pipeline CI/CD y herramientas', ruta: '/pipeline', vista: 'Pipeline' },
  { n: 4, texto: 'Integración entre ramas/eventos y pipelines', ruta: '/ramas', vista: 'Ramas' },
  { n: 5, texto: 'Arquitectura de software e infraestructura', ruta: '/arquitectura', vista: 'Arquitectura' },
  { n: 6, texto: 'CI: Checkout, Build, Test y Release', ruta: '/pipeline', vista: 'Pipeline' },
  { n: 7, texto: 'CD: IaC, infraestructura y app en 2 ambientes', ruta: '/arquitectura', vista: 'Arquitectura' },
  { n: 8, texto: 'Pruebas: estáticas, unitarias, cobertura, pre y post prod', ruta: '/pruebas', vista: 'Pruebas' },
  { n: 9, texto: 'Pipelines en verde y logs en GitHub Actions', ruta: '/evidencia', vista: 'Evidencia' },
  { n: 10, texto: 'Evidencia de las 3 mejoras', ruta: '/modificaciones', vista: 'Modificaciones' },
  { n: 11, texto: 'App funcionando en todos los ambientes', ruta: '/evidencia', vista: 'Evidencia' },
  { n: 12, texto: 'Rollback automático y manual', ruta: '/rollback', vista: 'Rollback' },
  { n: 13, texto: 'Desafíos, decisiones y aprendizajes', ruta: '/aprendizajes', vista: 'Aprendizajes' },
  { n: 14, texto: 'Respuestas técnicas a las preguntas del jurado', ruta: '/alternativas', vista: 'Alternativas' },
]

const minimos: Fila[] = [
  { texto: 'CI: Checkout, Build, Test (estáticas, unitarias y cobertura) y Release', ruta: '/pipeline', vista: 'Pipeline' },
  { texto: 'CD: IaC, Deploy Infra y Deploy App en 2 ambientes', ruta: '/arquitectura', vista: 'Arquitectura' },
  { texto: 'CD: Tests pre-prod y post-prod (smoke)', ruta: '/pruebas', vista: 'Pruebas' },
  { texto: 'Rollback automático ante fallo de smoke', ruta: '/rollback', vista: 'Rollback' },
  { texto: 'Rollback manual (botón de pánico)', ruta: '/rollback', vista: 'Rollback' },
  { texto: 'Estrategia de ramas sustentada', ruta: '/ramas', vista: 'Ramas' },
  { texto: '3 modificaciones o introducciones', ruta: '/modificaciones', vista: 'Modificaciones' },
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
    <Slide titulo="Rúbrica" sub="Los 14 criterios de la rúbrica que mandó el profe, y los mínimos del pipeline.">
      <Lista filas={puntos} />
      <h2 className="mt-xl text-[28px]">Mínimos del pipeline</h2>
      <div className="mt-sm"><Lista filas={minimos} /></div>
      <p className="mt-md text-[16px] text-muted">
        "Listo en la app" significa que la vista está hecha. Lo único sin evidencia son los mensajes de Discord, que no cuentan entre las tres modificaciones.
      </p>
    </Slide>
  )
}
