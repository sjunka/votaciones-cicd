import Escenarios from '../components/Escenarios'
import GuionVista from '../components/GuionVista'
import { ALTO, ANCHO, aristas, escenarios, nodos, notas } from '../data/rollback'

export default function Rollback() {
  return (
    <>
      <Escenarios titulo="Rollback" ancho={ANCHO} alto={ALTO} nodos={nodos} aristas={aristas} escenarios={escenarios}>
        <div className="mt-md grid gap-sm md:grid-cols-2">
          {notas.map((n) => (
            <div key={n.titulo} className="rounded-xl border border-hairline bg-soft p-md">
              <h3 className="text-[18px] font-semibold">{n.titulo}</h3>
              <p className="mt-xxs text-[16px] text-body">{n.texto}</p>
            </div>
          ))}
        </div>
      </Escenarios>
      <GuionVista vistas={['rollback']} />
    </>
  )
}
