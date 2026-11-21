import { Slide, Tarjeta } from '../components/Slide'

const mods = [
  {
    n: 1,
    t: 'DevSecOps: gitleaks y Trivy',
    cambia: 'build-and-test busca secretos en el código y en el historial (gitleaks) y escanea las 2 imágenes (Trivy). Falla si hay vulnerabilidades críticas.',
    evidencia: 'Los pasos "Run gitleaks (Secrets)" y "Trivy scan" en verde del run 44348025068.',
    url: 'https://github.com/sjunka/votaciones-cicd/actions/runs/44348025068',
    color: 'var(--s2)',
  },
  {
    n: 2,
    t: 'Versionado SemVer y GitHub Releases',
    cambia: 'Cada versión que pasa producción queda como Release v1.0.N con notas automáticas. El rollback vuelve a esas Releases.',
    evidencia: 'Releases v1.0.3, v1.0.8, v1.0.12, v1.0.18 y v1.0.20, y la versión en el banner de la app y en /api/health.',
    url: 'https://github.com/sjunka/votaciones-cicd/releases',
    color: 'var(--s3)',
  },
  {
    n: 3,
    t: 'Workflow reutilizable deploy.yml',
    cambia: 'Staging, producción, el rollback automático y el botón de pánico llaman al mismo deploy.yml (workflow_call). En el Taller 3 cada despliegue era un job propio.',
    evidencia: 'Los jobs "deploy-staging / deploy" y "deploy-production / deploy" del run 44348025068 y "rollback / deploy" del run 44344815777.',
    url: 'https://github.com/sjunka/votaciones-cicd/actions/runs/44344815777',
    color: 'var(--s5)',
  },
]

const extras = [
  'Arquitectura nueva frente al Taller 3: dos servicios ECS detrás de un balanceador con regla /api/* y una tabla de DynamoDB.',
  'Avisos a Discord (notify-failure, notify-rollback, notify): funcionando: el run 44840313582 publicó en #general el aviso de la v1.0.20.',
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
            <div className="mt-sm"><a href={m.url} target="_blank" rel="noreferrer" className="break-all font-mono text-[15px] text-primary-active underline">{m.url}</a></div>
          </Tarjeta>
        ))}
      </div>
      <h2 className="mt-xl text-[24px]">Además</h2>
      <ul className="mt-sm grid gap-xs text-[18px] text-body">
        {extras.map((e) => (
          <li key={e} className="rounded-lg border border-hairline bg-card p-md">{e}</li>
        ))}
      </ul>
    </Slide>
  )
}
