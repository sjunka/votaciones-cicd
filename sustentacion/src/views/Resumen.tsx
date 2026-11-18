import { Slide, Tarjeta } from '../components/Slide'

const linea = [
  { t: 'Taller 1', d: 'GitHub y GitHub Actions: un workflow en cada push.' },
  { t: 'Taller 2', d: 'CI: pruebas, cobertura, imagen Docker y SonarCloud.' },
  { t: 'Taller 3', d: 'CD: Terraform, ECS Fargate, ALB, staging, producción, aprobación y smoke.' },
  { t: 'Proyecto', d: 'App nueva con 2 componentes y DynamoDB, rollback automático, botón de pánico y 3 modificaciones.' },
]

export default function Resumen() {
  return (
    <Slide titulo="Resumen ejecutivo" sub="Votaciones en vivo con QR, entregadas con un pipeline de CI/CD en GitHub Actions.">
      <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
        <Tarjeta titulo="Problema" borde="var(--s1)">Publicar una versión sin subirla a mano y volver atrás rápido si sale mal.</Tarjeta>
        <Tarjeta titulo="Solución" borde="var(--s2)">Un repositorio, <code>votaciones-cicd</code>, con <code>web/</code>, <code>api/</code>, <code>infra/</code> y <code>tests/</code>. <code>ci-cd.yml</code> corre en cada cambio.</Tarjeta>
        <Tarjeta titulo="Lo construido" borde="var(--s4)">Dos imágenes en Docker Hub, infraestructura con Terraform en AWS y dos ambientes: staging y producción.</Tarjeta>
        <Tarjeta titulo="Particularidades" borde="var(--s5)">
          <ul className="list-disc pl-lg">
            <li>La imagen se construye una vez y se promueve.</li>
            <li>Producción pide aprobación manual.</li>
            <li>Si fallan las smoke, <code>rollback-production</code> vuelve a la última Release.</li>
            <li>Botón de pánico con <code>workflow_dispatch</code>.</li>
          </ul>
        </Tarjeta>
      </div>

      <h2 className="mt-xl text-[30px]">De los talleres al proyecto</h2>
      <ol className="mt-md grid gap-md md:grid-cols-2 xl:grid-cols-4">
        {linea.map((p, i) => (
          <li key={p.t} className="relative rounded-xl border border-hairline bg-soft p-md" style={{ borderLeft: `6px solid var(--s${i + 1})` }}>
            <div className="font-mono text-[14px] font-semibold text-muted">{i + 1} de 4</div>
            <div className="text-[24px] font-semibold text-ink">{p.t}</div>
            <p className="mt-xxs text-[18px] leading-snug text-body">{p.d}</p>
          </li>
        ))}
      </ol>
    </Slide>
  )
}
