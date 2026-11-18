import { useState, type ReactNode } from 'react'
import Diagrama from './Diagrama'
import type { Arista, Escenario, Nodo } from '../lib/tipos'

interface Props {
  titulo: string
  ancho: number
  alto: number
  nodos: Nodo[]
  aristas: Arista[]
  escenarios: Escenario[]
  children?: ReactNode
}

/** Pestañas de escenario (?esc=id en la URL) y el diagrama del escenario elegido. */
export default function Escenarios({ titulo, ancho, alto, nodos, aristas, escenarios, children }: Props) {
  const [id, setId] = useState(() => {
    const e = new URLSearchParams(location.hash.split('?')[1] ?? '').get('esc')
    return escenarios.find((x) => x.id === e)?.id ?? escenarios[0].id
  })
  const esc = escenarios.find((e) => e.id === id)!
  return (
    <section>
      <h1 className="mb-sm text-[36px] leading-tight">{titulo}</h1>
      <div className="mb-sm flex flex-wrap gap-xs" role="tablist">
        {escenarios.map((e) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={e.id === id}
            onClick={() => setId(e.id)}
            className={`h-10 rounded-md px-md text-[15px] font-medium ${e.id === id ? (e.falla ? 'bg-err text-white' : 'bg-ink text-canvas') : 'border border-hairline text-ink hover:bg-card'}`}
          >
            {e.nombre}
          </button>
        ))}
      </div>
      <Diagrama key={esc.id} ancho={ancho} alto={alto} nodos={nodos} aristas={aristas} pasos={esc.pasos} />
      {children}
    </section>
  )
}
