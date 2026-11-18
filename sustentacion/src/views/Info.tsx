import CopiarUrl from '../components/CopiarUrl'
import GuionVista from '../components/GuionVista'
import Pendiente from '../components/Pendiente'
import { enlacesExternos } from '../data/pendientes'
import { urlCompleta, vistas } from '../views'

export default function Info() {
  return (
    <section className="max-w-[1100px]">
      <h1 className="text-[48px] leading-[1.1]">Proyecto final CI/CD: votaciones en vivo</h1>
      <p className="mt-md text-[20px]">Integración y Entrega Continua de Software, EAFIT. Equipo: Sergio Alfredo Junca Valero y Valeria Cardona Urrea.</p>
      <p className="mt-xs text-[18px] text-body">
        Reparto de la exposición: Sergio abre y lleva ramas, arquitectura y rollback. Valeria lleva pipeline, pruebas, modificaciones y evidencia. Aprendizajes y cierre, los dos. Es una propuesta, falta confirmar.
      </p>

      <h2 className="mt-xxl text-[28px]">Vistas</h2>
      <ul className="mt-md grid gap-sm">
        {vistas.map((v) => {
          const url = urlCompleta(v.ruta)
          return (
            <li key={v.id} className="flex flex-wrap items-center gap-md rounded-lg border border-hairline bg-card p-md">
              <div className="min-w-[260px] flex-1">
                <div className="text-[19px] font-medium text-ink">{v.titulo}</div>
                <div className="text-[16px] text-body">{v.descripcion}</div>
                <a href={url} className="break-all font-mono text-[14px] text-primary-active underline">{url}</a>
              </div>
              <CopiarUrl url={url} />
            </li>
          )
        })}
      </ul>

      <h2 className="mt-xxl text-[28px]">Enlaces externos</h2>
      <ul className="mt-md grid gap-sm">
        {enlacesExternos.map((e) => (
          <li key={e.titulo} className="flex flex-wrap items-center gap-md rounded-lg border border-hairline bg-card p-md">
            <span className="min-w-[200px] text-[18px] font-medium text-ink">{e.titulo}</span>
            {e.url ? (
              <>
                <a href={e.url} target="_blank" rel="noreferrer" className="break-all font-mono text-[14px] text-primary-active underline">{e.url}</a>
                <span className="ml-auto"><CopiarUrl url={e.url} /></span>
              </>
            ) : <Pendiente />}
          </li>
        ))}
      </ul>

      <GuionVista vistas={['intro']} />
    </section>
  )
}
