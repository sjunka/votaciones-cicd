import type { ReactNode } from 'react'

/** Encabezado común de las vistas tipo slide: título grande y una línea de contexto. */
export function Slide({ titulo, sub, children }: { titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section className="max-w-[1300px]">
      <h1 className="text-[40px] leading-[1.1]">{titulo}</h1>
      {sub && <p className="mt-xs text-[20px] text-body">{sub}</p>}
      <div className="mt-lg">{children}</div>
    </section>
  )
}

export function Tarjeta({ titulo, children, borde }: { titulo?: string; children: ReactNode; borde?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-md" style={borde ? { borderTop: `6px solid ${borde}` } : undefined}>
      {titulo && <h3 className="mb-xs text-[24px] leading-tight">{titulo}</h3>}
      <div className="text-[18px] leading-snug text-body">{children}</div>
    </div>
  )
}
