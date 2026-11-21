import { useEffect, useMemo, useRef, useState } from 'react'
import type { Arista, Lado, Nodo, Paso } from '../lib/tipos'
import { logos } from '../lib/logos'
import { usePasos } from '../lib/usePasos'
import { pitido } from '../lib/beep'

type P = { x: number; y: number }
const horizontal = (l: Lado) => l === 'l' || l === 'r'

function ancla(n: Nodo, l: Lado, off = 0): P {
  if (l === 't') return { x: n.x + n.w / 2 + off, y: n.y }
  if (l === 'b') return { x: n.x + n.w / 2 + off, y: n.y + n.h }
  if (l === 'l') return { x: n.x, y: n.y + n.h / 2 + off }
  return { x: n.x + n.w, y: n.y + n.h / 2 + off }
}

function ladoAuto(a: Nodo, b: Nodo): [Lado, Lado] {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2)
  const dy = b.y + b.h / 2 - (a.y + a.h / 2)
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? ['r', 'l'] : ['l', 'r']
  return dy > 0 ? ['b', 't'] : ['t', 'b']
}

function ruta(a: P, b: P, ld: Lado, la: Lado, bend?: number): P[] {
  if (horizontal(ld) && horizontal(la)) {
    if (Math.abs(a.y - b.y) < 1) return [a, b]
    const mx = bend ?? (a.x + b.x) / 2
    return [a, { x: mx, y: a.y }, { x: mx, y: b.y }, b]
  }
  if (!horizontal(ld) && !horizontal(la)) {
    if (Math.abs(a.x - b.x) < 1) return [a, b]
    const my = bend ?? (a.y + b.y) / 2
    return [a, { x: a.x, y: my }, { x: b.x, y: my }, b]
  }
  return horizontal(ld) ? [a, { x: b.x, y: a.y }, b] : [a, { x: a.x, y: b.y }, b]
}

const d = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')

function flecha(pts: P[]): string {
  const b = pts[pts.length - 1]
  const a = pts[pts.length - 2]
  const ang = Math.atan2(b.y - a.y, b.x - a.x)
  const L = 14
  const W = 7
  const bx = b.x - Math.cos(ang) * L
  const by = b.y - Math.sin(ang) * L
  const nx = -Math.sin(ang) * W
  const ny = Math.cos(ang) * W
  return `${b.x},${b.y} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`
}

function medio(pts: P[]): P {
  let best = 0
  let mejor: P = pts[0]
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.abs(pts[i].x - pts[i + 1].x) + Math.abs(pts[i].y - pts[i + 1].y)
    if (len > best) {
      best = len
      mejor = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 }
    }
  }
  return mejor
}

const PALETA = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)', 'var(--s7)', 'var(--s8)']
const colorDe = (p: Paso, i: number) => (p.estado === 'fail' ? 'var(--error)' : PALETA[i % PALETA.length])

interface Props {
  ancho: number
  alto: number
  nodos: Nodo[]
  aristas: Arista[]
  pasos: Paso[]
  ms?: number
}

export default function Diagrama({ ancho, alto, nodos, aristas, pasos, ms }: Props) {
  const dur = ms ?? 3000
  const { i, playing, ir, toggle, sig, ant, reiniciar } = usePasos(pasos.length, dur)
  const fin = i >= pasos.length - 1
  const [sonido, setSonido] = useState(true)
  const paso = pasos[i]
  const color = colorDe(paso, i)
  const mapa = useMemo(() => Object.fromEntries(nodos.map((n) => [n.id, n])), [nodos])
  const lista = useRef<HTMLOListElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  // Regla: diagrama + explicación completos en pantalla. Cualquier control lleva el escenario a la vista.
  const verEscenario = () => {
    const r = raiz.current?.getBoundingClientRect()
    if (r && (r.top < 0 || r.top > 8 || r.bottom > window.innerHeight)) raiz.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Atajos de teclado: flechas y barra espaciadora.
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight') sig()
      else if (e.key === 'ArrowLeft') ant()
      else if (e.key === ' ') { e.preventDefault(); verEscenario(); toggle() }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  })

  // Auto-scroll de la lista al paso activo y pitido en pasos de éxito o falla.
  useEffect(() => {
    const ol = lista.current
    const li = ol?.children[i] as HTMLElement | undefined
    if (ol && li) ol.scrollTo({ top: li.offsetTop - ol.clientHeight / 2 + li.clientHeight / 2, behavior: 'smooth' })
    // Regla: el diagrama y la explicación del paso deben quedar completos en pantalla.
    if (primera.current) { primera.current = false; return }
    verEscenario()
    if (sonido && (paso.estado === 'fail' || paso.estado === 'ok')) pitido(paso.estado)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  const omit = new Set(paso.omitidos ?? [])
  const aviso = paso.aviso
  const tonoAviso = paso.estado === 'fail' ? '#b93838' : paso.estado === 'ok' ? '#2f7d46' : '#8a6508'

  return (
    <div ref={raiz} className="scroll-mt-2">
      <div className="-mx-1 mb-sm flex flex-wrap items-center gap-xs bg-canvas/95 px-1 py-sm backdrop-blur">
        <Boton onClick={() => { verEscenario(); toggle() }} primario>{playing ? '❚❚ Pausa' : fin ? '↻ Repetir' : '▶ Reproducir'}</Boton>
        <Boton onClick={ant} desactivado={i === 0}>← Anterior</Boton>
        <Boton onClick={sig} desactivado={fin} primario={!playing && !fin}>Siguiente →</Boton>
        <Boton onClick={reiniciar}>Reiniciar</Boton>
        <Boton onClick={() => setSonido(!sonido)}>Sonido: {sonido ? 'sí' : 'no'}</Boton>
        <span className="ml-auto text-[15px] font-medium text-ink">{fin ? '✓ Fin · ' : ''}Paso {i + 1} de {pasos.length}</span>
        {/* Barra: cuánto falta para el siguiente paso cuando se reproduce. */}
        <div className="h-1 w-full overflow-hidden rounded bg-hairline">
          {playing && !fin && <div key={i} className="barra h-full bg-primary" style={{ animationDuration: `${dur}ms` }} />}
          {fin && <div className="h-full w-full" style={{ background: "var(--success)" }} />}
        </div>
      </div>

      <div className="grid gap-md md:grid-cols-[minmax(0,1fr)_320px] md:items-start xl:grid-cols-[minmax(0,1fr)_380px]">
      <svg style={{ maxHeight: 'calc(100vh - 84px)' }} viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto block w-full rounded-xl border border-hairline bg-soft" role="img" aria-label="Diagrama">
        {nodos.filter((n) => n.tipo === 'grupo').map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={14} fill="var(--canvas)" fillOpacity={0.5} stroke={paso.nodos.includes(n.id) ? color : 'var(--muted)'} strokeWidth={paso.nodos.includes(n.id) ? 3 : 1.5} strokeDasharray="8 6" />
            <text x={n.x + 16} y={n.y + 26} fontSize={16} fontWeight={600} fill="var(--ink)">{n.titulo}</text>
          </g>
        ))}

        {aristas.map((e) => {
          const a = mapa[e.de]
          const b = mapa[e.a]
          const [ad, aa] = ladoAuto(a, b)
          const ld = e.ld ?? ad
          const la = e.la ?? aa
          const pts = ruta(ancla(a, ld, e.od), ancla(b, la, e.oa), ld, la, e.bend)
          const activa = paso.aristas.includes(e.id)
          const apagada = omit.has(e.de) || omit.has(e.a)
          const c = activa ? color : 'var(--muted)'
          const m = medio(pts)
          const ancho_et = e.etiqueta ? e.etiqueta.length * 7.8 + 14 : 0
          return (
            <g key={e.id} opacity={apagada ? 0.25 : 1}>
              <path key={activa ? `a${i}` : 'q'} d={d(pts)} fill="none" stroke={c} strokeWidth={activa ? 4 : 2.5} strokeLinejoin="round" pathLength={activa ? 1 : undefined} className={activa ? 'traza' : ''} opacity={activa ? 1 : 0.7} />
              <polygon key={activa ? `p${i}` : 'qp'} points={flecha(pts)} fill={c} className={activa ? 'punta' : ''} />
              {activa && (
                <circle key={`c${i}`} r={6} fill={color}>
                  <animateMotion dur="0.6s" repeatCount="1" fill="freeze" path={d(pts)} />
                </circle>
              )}
              {e.etiqueta && (
                <g>
                  <rect x={m.x - ancho_et / 2} y={m.y - 13} width={ancho_et} height={26} rx={13} fill="var(--canvas)" stroke={c} strokeWidth={activa ? 2 : 1} />
                  <text x={m.x} y={m.y + 5} fontSize={14} fontWeight={activa ? 600 : 500} textAnchor="middle" fill={activa ? 'var(--ink)' : 'var(--body)'}>{e.etiqueta}</text>
                </g>
              )}
            </g>
          )
        })}

        {nodos.filter((n) => n.tipo !== 'grupo').map((n) => {
          const activo = paso.nodos.includes(n.id)
          const falla = activo && paso.estado === 'fail'
          const apagado = omit.has(n.id)
          const c = falla ? 'var(--error)' : activo ? color : 'var(--hairline)'
          const logo = n.logo ? logos[n.logo] : null
          const cx = n.x + n.w / 2
          return (
            <g key={n.id} opacity={apagado ? 0.35 : 1}>
              {activo && <rect x={n.x - 6} y={n.y - 6} width={n.w + 12} height={n.h + 12} rx={18} fill={c} className="pulso" />}
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={12} fill="var(--surface-card)" stroke={c} strokeWidth={activo ? 3.5 : 1.5} strokeDasharray={apagado ? '6 5' : undefined} />
              {n.mod && (
                <g>
                  <rect x={n.x + 12} y={n.y - 13} width={n.mod.length * 8.2 + 18} height={26} rx={13} fill="var(--primary)" />
                  <text x={n.x + 12 + (n.mod.length * 8.2 + 18) / 2} y={n.y + 5} fontSize={14} fontWeight={700} textAnchor="middle" fill="#fff">{n.mod}</text>
                </g>
              )}
              {n.tipo === 'puerta' && <rect x={n.x} y={n.y} width={8} height={n.h} rx={4} fill="var(--warning)" />}
              {n.vertical ? (
                <>
                  {logo && <image href={logo.src} x={cx - 18} y={n.y + 12} width={36} height={36} className={logo.inv ? 'inv' : ''} />}
                  <text x={cx} y={n.y + (logo ? 72 : 34)} fontSize={17} fontWeight={600} textAnchor="middle" fill="var(--ink)" fontFamily={n.monoTitulo ? 'var(--font-mono)' : undefined}>{n.titulo}</text>
                  {n.sub?.map((s, k) => (
                    <text key={k} x={cx} y={n.y + (logo ? 94 : 56) + k * 20} fontSize={n.monoSub ? 13 : 14} textAnchor="middle" fill="var(--body)" fontFamily={n.monoSub ? 'var(--font-mono)' : undefined}>{s}</text>
                  ))}
                </>
              ) : (
                <>
                  {logo && <image href={logo.src} x={n.x + 14} y={n.y + 14} width={38} height={38} className={logo.inv ? 'inv' : ''} />}
                  <text x={n.x + (logo ? 62 : 18)} y={n.y + 33} fontSize={17} fontWeight={600} fill="var(--ink)" fontFamily={n.monoTitulo ? 'var(--font-mono)' : undefined}>{n.titulo}</text>
                  {n.sub?.map((s, k) => (
                    <text key={k} x={n.x + (logo ? 62 : 18)} y={n.y + 58 + k * 21} fontSize={n.monoSub ? 13 : 14} fill="var(--body)" fontFamily={n.monoSub ? 'var(--font-mono)' : undefined}>{s}</text>
                  ))}
                </>
              )}
              {n.num && (
                <g>
                  <circle cx={n.x + n.w - 18} cy={n.y + 18} r={13} fill={activo ? c : 'var(--muted)'} />
                  <text x={n.x + n.w - 18} y={n.y + 24} fontSize={15} fontWeight={600} textAnchor="middle" fill="#fff">{n.num}</text>
                </g>
              )}
              {falla && (
                <g className="latido">
                  <circle cx={n.x + n.w - 8} cy={n.y + n.h - 8} r={16} fill="var(--error)" />
                  <path d={`M${n.x + n.w - 14} ${n.y + n.h - 14} l12 12 M${n.x + n.w - 2} ${n.y + n.h - 14} l-12 12`} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
                </g>
              )}
              {activo && paso.estado === 'ok' && (
                <g className="latido">
                  <circle cx={n.x + n.w - 8} cy={n.y + n.h - 8} r={16} fill="var(--success)" />
                  <path d={`M${n.x + n.w - 15} ${n.y + n.h - 8} l5 5 l9 -10`} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
            </g>
          )
        })}
      </svg>

      <div className="flex flex-col gap-sm md:max-h-[calc(100vh-84px)]">
      <div className="shrink-0 overflow-hidden rounded-xl border border-hairline bg-card" style={{ borderLeft: `8px solid ${color}` }}>
        {aviso && (
          <div role="alert" className="px-md py-xs text-[17px] font-semibold text-white" style={{ background: tonoAviso }}>
            {paso.estado === 'fail' ? 'Falla: ' : paso.estado === 'ok' ? 'Listo: ' : 'En pausa: '}
            {aviso}
          </div>
        )}
        <div className="p-md">
          <div className="text-[14px] font-medium uppercase tracking-[1.5px] text-muted">Paso {i + 1} de {pasos.length}</div>
          <h3 className="mt-xxs text-[21px] leading-tight">{paso.titulo}</h3>
          <p className="mt-xs text-[16px] leading-relaxed text-body">{paso.texto}</p>
        </div>
      </div>

      <ol ref={lista} className="relative max-h-[220px] md:max-h-none md:min-h-0 md:flex-1 overflow-y-auto rounded-xl border border-hairline bg-card p-xs">
        {pasos.map((p, k) => (
          <li key={k}>
            <button onClick={() => ir(k)} className={`flex w-full items-start gap-sm rounded-md px-sm py-xs text-left text-[16px] ${k === i ? 'bg-canvas font-semibold text-ink' : 'text-body hover:bg-canvas'}`}>
              <span className="mt-[5px] h-3 w-3 shrink-0 rounded-full" style={{ background: colorDe(p, k), opacity: k === i ? 1 : 0.5 }} />
              <span>{p.titulo}</span>
            </button>
          </li>
        ))}
      </ol>
      </div>
      </div>
    </div>
  )
}

function Boton({ children, onClick, primario, desactivado }: { children: React.ReactNode; onClick: () => void; primario?: boolean; desactivado?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={desactivado}
      className={`h-10 rounded-md px-md text-[14px] font-medium transition-colors disabled:opacity-40 ${primario ? 'bg-primary text-white hover:bg-primary-active' : 'border border-hairline bg-canvas text-ink hover:bg-card'}`}
    >
      {children}
    </button>
  )
}
