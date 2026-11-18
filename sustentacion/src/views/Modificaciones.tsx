import Pendiente from '../components/Pendiente'
import { Slide, Tarjeta } from '../components/Slide'

const mods = [
  {
    n: 1,
    t: 'DevSecOps: gitleaks y Trivy',
    cambia: 'build-and-test busca secretos en el código y en el historial (gitleaks) y escanea las 2 imágenes (Trivy). Falla si hay vulnerabilidades críticas.',
    evidencia: 'Logs de los dos pasos. Idea: un run en rojo por una vulnerabilidad y el PR que la arregla.',
    color: 'var(--s2)',
  },
  {
    n: 2,
    t: 'Versionado SemVer y GitHub Releases',
    cambia: 'Cada versión que pasa producción queda como Release v1.0.N con notas automáticas. El rollback vuelve a esas Releases.',
    evidencia: 'Página de Releases, y la versión en el banner de la app y en /api/health.',
    color: 'var(--s3)',
  },
  {
    n: 3,
    t: 'Avisos a Discord',
    cambia: 'Un mensaje al desplegar, al fallar y al hacer rollback, con el enlace al run.',
    evidencia: 'Canal de Discord con los mensajes.',
    color: 'var(--s5)',
  },
]

export default function Modificaciones() {
  return (
    <Slide titulo="Tres modificaciones" sub="Frente al Taller 3. El rollback y el botón de pánico son mínimos del enunciado y no cuentan.">
      <div className="grid gap-md lg:grid-cols-3">
        {mods.map((m) => (
          <Tarjeta key={m.n} titulo={`${m.n}. ${m.t}`} borde={m.color}>
            <div className="text-[15px] font-semibold text-muted">Qué cambia</div>
            <p>{m.cambia}</p>
            <div className="mt-sm text-[15px] font-semibold text-muted">Evidencia que vamos a mostrar</div>
            <p>{m.evidencia}</p>
            <div className="mt-sm"><Pendiente texto="pendiente: evidencia real" /></div>
          </Tarjeta>
        ))}
      </div>
      <p className="mt-lg text-[18px] text-body">
        Reserva si el profe no acepta alguna: el workflow reutilizable <code>deploy.yml</code>, que usan staging, producción y los 2 rollbacks.
      </p>
    </Slide>
  )
}
