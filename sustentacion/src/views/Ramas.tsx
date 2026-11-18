import Escenarios from '../components/Escenarios'
import GuionVista from '../components/GuionVista'
import { ALTO, ANCHO, aristas, escenarios, eventos, nodos } from '../data/ramas'

export default function Ramas() {
  return (
    <>
      <Escenarios titulo="Ramas y versiones" ancho={ANCHO} alto={ALTO} nodos={nodos} aristas={aristas} escenarios={escenarios}>
        <h2 className="mb-sm mt-lg text-[26px]">Qué corre en cada evento</h2>
        <div className="overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="bg-soft text-ink">
              <tr>
                <th className="p-sm font-semibold">Evento</th>
                <th className="p-sm font-semibold">Rama</th>
                <th className="p-sm font-semibold">Jobs que corren</th>
                <th className="p-sm font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.evento} className="border-t border-hairline align-top">
                  <td className="p-sm font-mono text-[14px] text-ink">{e.evento}</td>
                  <td className="p-sm text-body">{e.rama}</td>
                  <td className="p-sm text-body">{e.jobs}</td>
                  <td className="p-sm text-body">{e.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Escenarios>
      <GuionVista vistas={['ramas']} />
    </>
  )
}
