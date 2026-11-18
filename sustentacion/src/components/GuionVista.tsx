import { colorQuien, fmtTiempo, guion, type Quien, type Seccion, type Vista } from '../data/guion'

const base = import.meta.env.BASE_URL

export function Chip({ quien }: { quien: Quien }) {
  return (
    <span className="mr-xs inline-block rounded px-xs font-mono text-[13px] font-bold text-white" style={{ background: colorQuien[quien] }}>
      {quien}
    </span>
  )
}

export function SeccionGuion({ s, n }: { s: Seccion; n: number }) {
  const min = fmtTiempo(s.tiempoSeg)
  return (
    <section className="guion-seccion grid gap-md rounded-xl border p-md break-inside-avoid lg:grid-cols-[1fr_1.15fr]" style={{ background: `${colorQuien[s.quien]}14`, borderColor: colorQuien[s.quien], borderLeftWidth: 10 }}>
      <a href={s.ruta} className="self-start">
        <img src={base + s.captura} alt={`Pantalla ${n}: ${s.titulo}`} className="w-full rounded-lg border border-hairline" />
        <span className="mt-xxs block break-all text-[14px] text-muted">Abrir: {s.ruta}</span>
      </a>
      <div>
        <div className="flex flex-wrap items-center gap-sm">
          <span className="rounded-md px-sm py-xxs text-[20px] font-bold text-white" style={{ background: colorQuien[s.quien] }}>{s.quien}</span>
          <span className="font-mono text-[14px] font-semibold" style={{ color: colorQuien[s.quien] }}>PANTALLA {n} · ~{min} min</span>
        </div>
        <h2 className="mt-xxs text-[24px] leading-tight">{s.titulo}</h2>
        {s.lineas.map((l, i) =>
          'accion' in l ? (
            <p key={i} className="mt-sm text-[16px] italic text-muted">{l.accion}</p>
          ) : (
            <p key={i} className="mt-sm border-l-[5px] pl-sm text-[18px] leading-relaxed text-body" style={{ borderColor: colorQuien[l.quien] }}>
              <Chip quien={l.quien} />"{l.dice}"
            </p>
          ),
        )}
        {s.preguntas?.map((q) => (
          <div key={q.pregunta} className="mt-sm rounded-md border-l-[5px] border-[#e07a1f] bg-[#fff7ec] px-sm py-xs text-[16px] text-[#3d3d3a]">
            <b>Si preguntan "{q.pregunta}":</b> "{q.respuesta}"
          </div>
        ))}
      </div>
    </section>
  )
}

export default function GuionVista({ vistas }: { vistas: Vista[] }) {
  return (
    <details className="mt-lg rounded-xl border border-hairline bg-soft p-md">
      <summary className="cursor-pointer text-[16px] font-medium text-ink">Guion de esta vista</summary>
      <div className="mt-md grid gap-sm">
        {guion.map((s, i) => (vistas.includes(s.vista) ? <SeccionGuion key={i} s={s} n={i + 1} /> : null))}
      </div>
    </details>
  )
}
