import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { colorQuien, fmtTiempo, guion } from '../data/guion'

const base = import.meta.env.BASE_URL

// Memofichas para el celular en horizontal: cubren toda la pantalla (tapan la barra de navegación).
// Pasar: deslizar, tocar la mitad derecha o izquierda, o flechas del teclado.
export default function Memofichas() {
  const [i, setI] = useState(0)
  const x0 = useRef<number | null>(null)
  const ir = (d: number) => setI((n) => Math.min(guion.length - 1, Math.max(0, n + d)))

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [])

  const s = guion[i]
  const color = colorQuien[s.quien]
  const acumulado = guion.slice(0, i).reduce((t, g) => t + g.tiempoSeg, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex select-none flex-col bg-canvas text-ink"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (x0.current === null) return
        const dx = e.changedTouches[0].clientX - x0.current
        x0.current = null
        if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
        else ir(e.changedTouches[0].clientX > window.innerWidth / 2 ? 1 : -1)
      }}
    >
      <div className="flex items-center gap-sm px-sm pt-xs text-[13px]">
        <span className="rounded-sm px-xs font-semibold text-white" style={{ background: color }}>{s.quien}</span>
        <span className="font-mono text-muted">{i + 1}/{guion.length}</span>
        <span className="font-mono text-muted">empieza en {fmtTiempo(acumulado)} · dura {fmtTiempo(s.tiempoSeg)}</span>
        <Link to="/guion" className="ml-auto text-muted underline" onTouchEnd={(e) => e.stopPropagation()}>salir</Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-sm p-sm landscape:flex-row">
        <img
          src={base + s.captura}
          alt={`Pantalla: ${s.titulo}`}
          className="max-h-[35vh] w-auto self-start rounded-md border border-hairline object-contain landscape:max-h-full landscape:w-[38%]"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="font-serif text-[22px] leading-tight" style={{ color }}>{s.titulo}</h1>
          <ul className="mt-xs list-disc space-y-[2px] pl-md text-[16px] leading-snug text-body">
            {s.ficha.clave.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-auto rounded-md border-l-4 bg-card px-sm py-xs text-[16px] font-semibold" style={{ borderColor: color }}>
            {s.ficha.idea}
          </p>
        </div>
      </div>

      <div className="flex gap-[3px] px-sm pb-xs">
        {guion.map((g, n) => (
          <span key={n} className="h-[4px] flex-1 rounded-full" style={{ background: n <= i ? colorQuien[g.quien] : 'var(--hairline)' }} />
        ))}
      </div>
    </div>
  )
}
