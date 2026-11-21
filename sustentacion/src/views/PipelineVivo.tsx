import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { QRCodeSVG } from 'qrcode.react'

/** Lambda de solo lectura (sustentacion/lambda/pipeline-vivo.mjs): tiene el token de GitHub y cachea 4 s para todos los celulares. */
const API = 'https://qxytkq2b4dkfxdbjpmrhzx2xh40wbrxf.lambda-url.us-east-1.on.aws/'
const CADA_MS = 3000

type Est = 'ok' | 'bad' | 'run' | 'wait' | 'queue' | 'skip' | 'cancel'
interface Paso { name: string; status: string; conclusion: string | null; started: string | null; completed: string | null }
interface Job extends Paso { url?: string; steps: Paso[]; ghost?: boolean }
interface RunCorto { id: number; title: string; event: string; branch: string; status: string; conclusion: string | null }
interface Run extends RunCorto { sha: string; url: string; started: string; updated: string; pr: number | null; actor: string }
interface Estado { now: number; runs: RunCorto[]; run: Run; jobs: Job[] }

// Orden fijo del ci-cd.yml: el grafo completo se ve desde el primer segundo del run.
const PRINCIPAL = ['build-and-test', 'deploy-staging', 'test-staging', 'deploy-production', 'smoke-test-production', 'publish-release']
const SI_FALLA = ['find-rollback-release', 'rollback-production', 'smoke-test-rollback', 'notify-rollback', 'notify-failure']
const NOMBRES: Record<string, string> = {
  'build-and-test': 'Build y pruebas', 'deploy-staging': 'Deploy staging', 'test-staging': 'Pruebas en staging',
  'deploy-production': 'Deploy producción', 'smoke-test-production': 'Smoke test producción', 'publish-release': 'Publicar release',
  'find-rollback-release': 'Buscar versión estable', 'rollback-production': 'Rollback producción', 'smoke-test-rollback': 'Smoke test rollback',
  'notify-rollback': 'Aviso de rollback', 'notify-failure': 'Aviso de falla a Discord',
}
const TXT: Record<Est, string> = { ok: 'Exitoso', bad: 'Falló', run: 'En curso', wait: 'Esperando aprobación', queue: 'En cola', skip: 'Omitido', cancel: 'Cancelado' }

const base = (n: string) => n.split(' / ')[0]
const nombre = (n: string) => NOMBRES[base(n)] ?? n
const est = (x: { status: string; conclusion: string | null }): Est =>
  x.status === 'completed'
    ? ({ success: 'ok', failure: 'bad', timed_out: 'bad', cancelled: 'cancel' } as Record<string, Est>)[x.conclusion ?? ''] ?? 'skip'
    : x.status === 'in_progress' ? 'run' : x.status === 'waiting' ? 'wait' : 'queue'
const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function useAhora() {
  const [t, setT] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(i) }, [])
  return t
}

function usePipeline(run: string) {
  const [data, setData] = useState<Estado | null>(null)
  const [error, setError] = useState('')
  const [at, setAt] = useState(0)
  useEffect(() => {
    let vivo = true, timer = 0
    const leer = async () => {
      if (!document.hidden) { // pestaña oculta: no gasta llamadas
        try {
          const r = await fetch(API + (run ? `?run=${run}` : ''))
          const j = await r.json()
          if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
          if (vivo) { setData(j); setError(''); setAt(Date.now()) }
        } catch (e) { if (vivo) setError(e instanceof Error ? e.message : String(e)) }
      }
      if (vivo) timer = window.setTimeout(leer, CADA_MS)
    }
    leer()
    return () => { vivo = false; clearTimeout(timer) }
  }, [run])
  return { data, error, at }
}

function Icono({ e, className = 'size-5' }: { e: Est; className?: string }) {
  const p = { className: `${className} shrink-0 text-[var(--c)]`, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (e === 'ok') return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path d="m7.5 12.5 3 3 6-6.5" /></svg>
  if (e === 'bad') return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path d="m9 9 6 6m0-6-6 6" /></svg>
  if (e === 'run') return <svg {...p} className={`${p.className} animate-spin [animation-duration:1.6s] motion-reduce:animate-none`}><circle cx="12" cy="12" r="9" strokeOpacity={0.25} /><path d="M21 12a9 9 0 0 0-9-9" /></svg>
  if (e === 'wait') return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path d="M10 9v6m4-6v6" /></svg>
  if (e === 'queue') return <svg {...p}><circle cx="12" cy="12" r="9" strokeWidth={2} strokeDasharray="3 3" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path d="M8 12h8" /></svg>
}

function Tiempo({ s, e, ahora }: { s: string | null; e?: string | null; ahora: number }) {
  if (!s) return <span className="font-mono text-[var(--pv-sub)]">—</span>
  return <span className="font-mono tabular-nums">{fmt((e ? Date.parse(e) : ahora) - Date.parse(s))}</span>
}

export default function PipelineVivo() {
  const [fijo, setFijo] = useState('')
  const [elegido, setElegido] = useState<string | null>(null)
  const { data, error, at } = usePipeline(fijo)
  const reloj = useAhora()
  const qr = useRef<HTMLDialogElement>(null)
  const runId = data?.run.id
  useEffect(() => setElegido(null), [runId]) // run nuevo: vuelve a seguir el paso en vivo

  const ahora = data ? reloj + (data.now - at) : reloj
  const viejo = error || (at && reloj - at > 15000)
  const header = (
    <div className="flex flex-wrap items-center gap-sm">
      <div className="mr-auto">
        <h1 className="text-[22px] md:text-[28px]">Pipeline en vivo</h1>
        <p role="status" className="mt-xxs flex items-center gap-xs text-[14px] text-[var(--pv-sub)]">
          <span className={`size-2 rounded-full ${viejo ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} aria-hidden />
          {!at ? 'Conectando con GitHub…' : viejo ? 'Sin conexión, reintentando…' : `Actualizado hace ${Math.max(0, Math.round((reloj - at) / 1000))} s`}
        </p>
      </div>
      <button onClick={() => qr.current?.showModal()} className="pv-btn">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>
        Compartir QR
      </button>
    </div>
  )

  return (
    <div className="pv -mx-lg -my-lg min-h-[calc(100dvh-64px)] px-md py-md md:px-lg md:py-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-md">
        {header}
        {data ? <Tablero data={data} ahora={ahora} elegido={elegido} setElegido={setElegido} fijo={fijo} setFijo={setFijo} /> : error && <p className="pv-card text-[#EF4444]">No hay datos: {error}</p>}
      </div>
      <Qr refDialog={qr} />
    </div>
  )
}

function Tablero({ data, ahora, elegido, setElegido, fijo, setFijo }: { data: Estado; ahora: number; elegido: string | null; setElegido: (n: string | null) => void; fijo: string; setFijo: (v: string) => void }) {
  const r = data.run, pr = r.event === 'pull_request', fin = r.status === 'completed'
  const porBase = new Map(data.jobs.map((j) => [base(j.name), j]))
  const fantasma = (b: string): Job => ({ name: b, ghost: true, status: fin ? 'completed' : 'queued', conclusion: fin ? 'skipped' : null, started: null, completed: null, steps: [] })
  const principal = PRINCIPAL.map((b) => porBase.get(b) ?? fantasma(b))
  const siFalla = SI_FALLA.map((b) => porBase.get(b) ?? fantasma(b))
  const otros = data.jobs.filter((j) => ![...PRINCIPAL, ...SI_FALLA].includes(base(j.name)))
  const todos = [...principal, ...otros, ...siFalla]
  const vivo = todos.find((j) => ['run', 'wait'].includes(est(j))) ?? todos.find((j) => est(j) === 'bad')
    ?? (!fin ? todos.find((j) => !j.ghost && est(j) === 'queue') : undefined) ?? [...todos].reverse().find((j) => est(j) === 'ok') ?? todos[0]
  const visto = (elegido && todos.find((j) => j.name === elegido)) || vivo
  const etapas = principal.filter((j) => est(j) === 'ok').length
  const omitido = (enFalla: boolean) => (pr ? 'Solo en main' : !fin ? (enFalla ? 'Solo si falla' : 'Pendiente') : enFalla ? 'No hizo falta' : 'Omitido')

  // Qué pasa ahora, en una frase
  const ev = est(vivo), paso = vivo.steps.find((s) => s.status === 'in_progress'), n = vivo.steps.indexOf(paso!) + 1
  let b: { e: Est; k: string; v: string; s: string; t: ReactNode; extra?: ReactNode }
  if (!fin && ev === 'run') b = { e: 'run', k: 'Ejecutando ahora', v: nombre(vivo.name) + (paso ? ` › ${paso.name}` : ''), s: paso ? `Paso ${n} de ${vivo.steps.length}` : 'Preparando el job', t: <Tiempo s={paso?.started ?? vivo.started} ahora={ahora} /> }
  else if (!fin && ev === 'wait') b = { e: 'wait', k: 'Esperando aprobación manual', v: nombre(vivo.name), s: 'Un revisor del environment debe aprobar el despliegue', t: <Tiempo s={vivo.started} ahora={ahora} />, extra: <a href={r.url} target="_blank" rel="noreferrer" className="pv-btn mt-sm">Aprobar en GitHub</a> }
  else if (!fin) b = { e: 'queue', k: 'En cola', v: nombre(vivo.name), s: 'Esperando un runner disponible', t: null }
  else if (r.conclusion === 'success') {
    const k = todos.filter((j) => est(j) === 'ok').length
    b = { e: 'ok', k: 'Pipeline exitoso', v: pr ? 'Build y pruebas en verde: listo para merge' : 'Desplegado en staging y producción', s: `${k} ${k === 1 ? 'job' : 'jobs'} en verde`, t: <Tiempo s={r.started} e={r.updated} ahora={ahora} /> }
  } else {
    const fj = todos.find((j) => est(j) === 'bad') ?? vivo, fp = fj.steps.find((s) => est(s) === 'bad'), cancel = est(r) === 'cancel'
    b = { e: cancel ? 'cancel' : 'bad', k: cancel ? 'Pipeline cancelado' : 'Pipeline falló', v: nombre(fj.name) + (fp ? ` › ${fp.name}` : ''), s: 'Revisa los logs del paso en rojo', t: <Tiempo s={r.started} e={r.updated} ahora={ahora} />, extra: <a href={fj.url ?? r.url} target="_blank" rel="noreferrer" className="pv-btn mt-sm">Ver logs</a> }
  }

  const tarjeta = (j: Job, i: number, enFalla: boolean) => {
    const e = est(j), apagado = e === 'skip' || (j.ghost && e === 'queue'), sel = j === visto
    return (
      <li key={j.name}>
        <button onClick={() => setElegido(j.name)} aria-pressed={sel}
          className={`st-${e} pv-job ${apagado ? 'pv-off' : ''} ${sel ? 'pv-sel' : ''}`}>
          {!enFalla && <span className="font-mono text-[13px] text-[var(--pv-sub)]">{i + 1}</span>}
          <Icono e={e} />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[15px] font-semibold">{nombre(j.name)}</span>
            <span className="block text-[13px] text-[var(--pv-sub)]">{apagado ? omitido(enFalla) : TXT[e]}</span>
          </span>
          {['run', 'wait', 'ok', 'bad'].includes(e) && <span className="text-[14px]"><Tiempo s={j.started} e={j.completed} ahora={ahora} /></span>}
        </button>
      </li>
    )
  }

  const ve = est(visto), hechos = visto.steps.filter((s) => s.status === 'completed').length
  return (
    <>
      <section className="pv-card flex flex-col gap-sm">
        <div className="flex flex-wrap gap-xs text-[13px]">
          <span className="pv-chip">{pr ? (r.pr ? `PR #${r.pr}` : 'pull request') : r.event}</span>
          <span className="pv-chip">{r.branch}</span>
          <span className="pv-chip font-mono">{r.sha}</span>
        </div>
        <div className="flex items-end justify-between gap-md">
          <a href={r.url} target="_blank" rel="noreferrer" className="min-w-0 text-[17px] font-semibold leading-snug hover:underline md:text-[20px]">{r.title}</a>
          <div className="shrink-0 text-right">
            <div className="text-[26px] font-bold leading-none md:text-[34px]"><Tiempo s={r.started} e={fin ? r.updated : null} ahora={ahora} /></div>
            <div className="text-[12px] text-[var(--pv-sub)]">duración total</div>
          </div>
        </div>
        <label className="flex flex-col gap-xxs text-[13px] text-[var(--pv-sub)]">
          Run a mostrar
          <select value={fijo} onChange={(e) => setFijo(e.target.value)} className="pv-select">
            <option value="">Seguir el más reciente (automático)</option>
            {data.runs.map((x) => <option key={x.id} value={x.id}>{TXT[est(x)]} · {x.event === 'pull_request' ? 'PR' : x.event} · {x.title.slice(0, 50)}</option>)}
          </select>
        </label>
      </section>

      <section role="status" aria-live="polite" className={`st-${b.e} pv-card border-l-[6px] border-l-[var(--c)]`}>
        <div className="flex items-start gap-sm">
          <Icono e={b.e} className="mt-xxs size-7" />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold uppercase tracking-[.08em] text-[var(--c)]">{b.k}</div>
            <div className="mt-xxs break-words text-[20px] font-semibold leading-tight md:text-[26px]">{b.v}</div>
            <div className="mt-xxs text-[15px] text-[var(--pv-sub)]">{b.s}</div>
            {b.extra}
          </div>
          {b.t && <div className="text-[24px] font-bold text-[var(--c)] md:text-[32px]">{b.t}</div>}
        </div>
      </section>

      <section>
        <h2 className="pv-h">Pipeline principal <span className="font-normal text-[var(--pv-sub)]">· {etapas} de {principal.length} etapas</span></h2>
        <div className="mb-sm h-1.5 overflow-hidden rounded-full bg-[var(--pv-muted)]" aria-hidden>
          <div className="h-full rounded-full bg-[#22C55E] transition-[width] duration-500" style={{ width: `${(etapas / principal.length) * 100}%` }} />
        </div>
        <ol className="grid gap-xs md:grid-cols-3">{principal.map((j, i) => tarjeta(j, i, false))}</ol>
        {otros.length > 0 && <ol className="mt-xs grid gap-xs md:grid-cols-3">{otros.map((j, i) => tarjeta(j, i, true))}</ol>}
      </section>

      <section>
        <h2 className="pv-h">Si algo falla <span className="font-normal text-[var(--pv-sub)]">· rollback automático y aviso</span></h2>
        <ol className="grid gap-xs sm:grid-cols-2 xl:grid-cols-5">{siFalla.map((j, i) => tarjeta(j, i, true))}</ol>
      </section>

      <section className={`st-${ve} pv-card !p-0`}>
        <div className="flex flex-wrap items-center gap-x-sm gap-y-xxs border-b border-[var(--pv-border)] px-md py-sm">
          <Icono e={ve} />
          <h2 className="text-[18px]">{nombre(visto.name)}</h2>
          <span className="text-[14px] text-[var(--pv-sub)]">{hechos} de {visto.steps.length} pasos</span>
          <span className="flex-1" />
          {elegido && <button onClick={() => setElegido(null)} className="pv-link">Seguir en vivo</button>}
          {visto.url && <a href={visto.url} target="_blank" rel="noreferrer" className="pv-link">Logs</a>}
        </div>
        <ol className="px-xs py-xs md:columns-2 md:gap-md">
          {visto.steps.length ? visto.steps.map((s, i) => {
            const e = est(s)
            return (
              <li key={i} className={`st-${e} pv-step ${e === 'run' ? 'bg-[#F59E0B1f] font-semibold' : e === 'bad' ? 'bg-[#EF44441f] font-semibold' : ''} ${e === 'queue' || e === 'skip' ? 'text-[var(--pv-sub)]' : ''}`}>
                <Icono e={e} className="size-4" />
                <span className="min-w-0 flex-1 break-words">{i + 1}. {s.name}</span>
                <span className="text-[13px] text-[var(--pv-sub)]">{e === 'skip' || e === 'queue' ? '—' : <Tiempo s={s.started} e={s.completed} ahora={ahora} />}</span>
              </li>
            )
          }) : <li className="p-sm text-[var(--pv-sub)]">{visto.ghost ? (pr ? 'Este job solo corre al hacer merge a main.' : 'Este job no se ejecutó en este run.') : 'El job todavía no empieza.'}</li>}
        </ol>
      </section>
    </>
  )
}

function Qr({ refDialog }: { refDialog: RefObject<HTMLDialogElement | null> }) {
  const [url, setUrl] = useState('')
  const [copiado, setCopiado] = useState(false)
  useEffect(() => {
    const d = refDialog.current
    const abrir = () => setUrl(location.href)
    d?.addEventListener('toggle', abrir)
    return () => d?.removeEventListener('toggle', abrir)
  }, [refDialog])
  return (
    <dialog ref={refDialog} onClick={(e) => e.target === refDialog.current && refDialog.current?.close()}
      className="pv m-auto w-[min(92vw,420px)] rounded-xl border border-[var(--pv-border)] p-0 backdrop:bg-black/70">
      <div className="flex flex-col items-center gap-md p-lg text-center">
        <h2 className="text-[20px]">Sigue el pipeline desde tu celular</h2>
        <div className="rounded-lg bg-white p-sm"><QRCodeSVG value={url || location.href} size={260} marginSize={1} /></div>
        <p className="break-all font-mono text-[13px] text-[var(--pv-sub)]">{url}</p>
        <div className="flex w-full gap-xs">
          <button className="pv-btn flex-1 justify-center" onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500) }).catch(() => {})}>{copiado ? 'Copiado' : 'Copiar enlace'}</button>
          <button className="pv-btn flex-1 justify-center" onClick={() => refDialog.current?.close()} autoFocus>Cerrar</button>
        </div>
      </div>
    </dialog>
  )
}
