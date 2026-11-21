import Pendiente from '../components/Pendiente'
import { Slide } from '../components/Slide'
import { capturas, dora, enlacesExternos } from '../data/pendientes'

const base = import.meta.env.BASE_URL

export default function Evidencia() {
  return (
    <Slide titulo="Evidencia" sub="Runs, capturas y enlaces por ambiente.">
      <h2 className="text-[28px]">Enlaces</h2>
      <ul className="mt-sm grid gap-sm md:grid-cols-2">
        {enlacesExternos.map((e) => (
          <li key={e.titulo} className="flex flex-wrap items-center gap-sm rounded-lg border border-hairline bg-card p-md">
            <span className="min-w-[200px] text-[18px] font-medium text-ink">{e.titulo}</span>
            {e.url ? <a href={e.url} target="_blank" rel="noreferrer" className="break-all font-mono text-[15px] text-primary-active underline">{e.url}</a> : <Pendiente />}
          </li>
        ))}
      </ul>

      <h2 className="mt-xl text-[28px]">Capturas</h2>
      <ul className="mt-sm grid gap-sm md:grid-cols-2">
        {capturas.map((c) => (
          <li key={c.titulo} className="rounded-lg border border-hairline bg-card p-md">
            <div className="flex flex-wrap items-center gap-sm">
              <span className="text-[18px] font-medium text-ink">{c.titulo}</span>
              {!c.ruta && <Pendiente />}
            </div>
            {c.ruta && <img src={`${base}${c.ruta}`} alt={c.titulo} className="mt-sm max-w-full rounded-md border border-hairline" />}
          </li>
        ))}
      </ul>

      <h2 className="mt-xl text-[28px]">Métricas DORA del proyecto</h2>
      <ul className="mt-sm grid gap-sm md:grid-cols-2">
        {dora.map((d) => (
          <li key={d.metrica} className="flex flex-wrap items-center gap-sm rounded-lg border border-hairline bg-card p-md">
            <span className="min-w-[200px] text-[18px] font-medium text-ink">{d.metrica}</span>
            {d.valor ? <span className="text-[18px]">{d.valor}</span> : <Pendiente />}
          </li>
        ))}
      </ul>
    </Slide>
  )
}
