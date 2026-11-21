import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { colorQuien, fmtTiempo, guion } from '../data/guion'
import { criterios } from '../data/criterios'

const base = import.meta.env.BASE_URL
const colorRubrica = '#cc785c'
// Ícono Material menu_book (libro), 24x24: vuelve a la sustentación
const libro = 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z'

interface Ficha { titulo: string; captura: string; clave: string[]; idea: string; etiqueta: string; color: string; meta: string }

const mazos: Record<'guion' | 'rubrica', Ficha[]> = {
  guion: guion.map((s, i) => ({
    titulo: s.titulo, captura: s.captura, clave: s.ficha.clave, idea: s.ficha.idea,
    etiqueta: s.quien, color: colorQuien[s.quien],
    meta: `empieza en ${fmtTiempo(guion.slice(0, i).reduce((t, g) => t + g.tiempoSeg, 0))} · dura ${fmtTiempo(s.tiempoSeg)}`,
  })),
  rubrica: criterios.map((c) => ({
    titulo: `${c.n}. ${c.criterio}`, captura: c.captura, clave: c.respuesta, idea: `Se muestra en: ${c.pantalla}`,
    etiqueta: 'Rúbrica', color: colorRubrica, meta: `criterio ${c.n} de 14 · en orden de la exposición`,
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
  // Cambia de mazo y salta a la ficha del mismo momento de la exposición
  const cambiar = () => {
    if (mazo === 'guion') {
      const k = criterios.findIndex((c) => c.seccion >= i)
      setPos((p) => ({ ...p, rubrica: k < 0 ? criterios.length - 1 : k }))
      setMazo('rubrica')
    } else {
      setPos((p) => ({ ...p, guion: criterios[i].seccion }))
      setMazo('guion')
    }
  }

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
          <p className="mt-auto mr-[72px] rounded-md border-l-4 bg-card px-sm py-xs text-[16px] font-semibold" style={{ borderColor: f.color }}>
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
        onClick={cambiar}
        onTouchStart={parar}
        onTouchEnd={parar}
        aria-label={mazo === 'guion' ? 'Ver los 14 criterios de este momento' : 'Volver a la sustentación'}
        title={mazo === 'guion' ? '14 criterios' : 'Sustentación'}
        className="fixed bottom-[16px] right-[16px] grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg active:scale-95"
        style={{ background: mazo === 'guion' ? colorRubrica : colorQuien.Sergio }}
      >
        {mazo === 'guion'
          ? <span className="text-[22px] font-bold leading-none">14</span>
          : <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d={libro} /></svg>}
      </button>
    </div>
  )
}
