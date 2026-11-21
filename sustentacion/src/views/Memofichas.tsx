import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { colorQuien, fmtTiempo, guion } from '../data/guion'
import { criterios } from '../data/criterios'

const base = import.meta.env.BASE_URL
const colorRubrica = '#cc785c'

interface Ficha { titulo: string; captura: string; clave: string[]; idea: string; etiqueta: string; color: string; meta: string }

const mazos: Record<'guion' | 'rubrica', Ficha[]> = {
  guion: guion.map((s, i) => ({
    titulo: s.titulo, captura: s.captura, clave: s.ficha.clave, idea: s.ficha.idea,
    etiqueta: s.quien, color: colorQuien[s.quien],
    meta: `empieza en ${fmtTiempo(guion.slice(0, i).reduce((t, g) => t + g.tiempoSeg, 0))} · dura ${fmtTiempo(s.tiempoSeg)}`,
  })),
  rubrica: criterios.map((c, i) => ({
    titulo: `${i + 1}. ${c.criterio}`, captura: c.captura, clave: c.respuesta, idea: `Se muestra en: ${c.pantalla}`,
    etiqueta: 'Rúbrica', color: colorRubrica, meta: 'repaso para el jurado',
  })),
}

// Memofichas para el celular en horizontal: cubren toda la pantalla (tapan la barra de navegación).
// Pasar: deslizar, tocar la mitad derecha o izquierda, o flechas del teclado. El botón flotante cambia de mazo.
export default function Memofichas() {
  const [mazo, setMazo] = useState<'guion' | 'rubrica'>('guion')
  const [pos, setPos] = useState({ guion: 0, rubrica: 0 })
  const x0 = useRef<number | null>(null)
  const fichas = mazos[mazo]
  const i = pos[mazo]
  const ir = (d: number) => setPos((p) => ({ ...p, [mazo]: Math.min(fichas.length - 1, Math.max(0, p[mazo] + d)) }))

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  const f = fichas[i]
  const parar = (e: React.TouchEvent) => e.stopPropagation()

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
        <span className="rounded-sm px-xs font-semibold text-white" style={{ background: f.color }}>{f.etiqueta}</span>
        <span className="font-mono text-muted">{i + 1}/{fichas.length}</span>
        <span className="font-mono text-muted">{f.meta}</span>
        <Link to="/guion" className="ml-auto text-muted underline" onTouchStart={parar} onTouchEnd={parar}>salir</Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-sm p-sm landscape:flex-row">
        <img
          src={base + f.captura}
          alt={`Pantalla: ${f.titulo}`}
          className="max-h-[35vh] w-auto self-start rounded-md border border-hairline object-contain landscape:max-h-full landscape:w-[38%]"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="font-serif text-[22px] leading-tight" style={{ color: f.color }}>{f.titulo}</h1>
          <ul className="mt-xs list-disc space-y-[2px] pl-md text-[16px] leading-snug text-body">
            {f.clave.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-auto mr-[96px] rounded-md border-l-4 bg-card px-sm py-xs text-[16px] font-semibold" style={{ borderColor: f.color }}>
            {f.idea}
          </p>
        </div>
      </div>

      <div className="flex gap-[3px] px-sm pb-xs">
        {fichas.map((g, n) => (
          <span key={n} className="h-[4px] flex-1 rounded-full" style={{ background: n <= i ? g.color : 'var(--hairline)' }} />
        ))}
      </div>

      <button
        onClick={() => setMazo(mazo === 'guion' ? 'rubrica' : 'guion')}
        onTouchStart={parar}
        onTouchEnd={parar}
        className="fixed bottom-[18px] right-[14px] rounded-full px-md py-sm text-[14px] font-semibold text-white shadow-lg"
        style={{ background: mazo === 'guion' ? colorRubrica : '#2f6fe4' }}
      >
        {mazo === 'guion' ? 'Ver 14 criterios' : 'Ver guion'}
      </button>
    </div>
  )
}
