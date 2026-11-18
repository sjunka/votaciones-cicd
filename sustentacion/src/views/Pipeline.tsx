import Escenarios from '../components/Escenarios'
import GuionVista from '../components/GuionVista'
import { ALTO, ANCHO, aristas, escenarios, nodos } from '../data/pipeline'

export default function Pipeline() {
  return (
    <>
      <Escenarios titulo="Pipeline ci-cd.yml" ancho={ANCHO} alto={ALTO} nodos={nodos} aristas={aristas} escenarios={escenarios}>
        <ul className="mt-md grid gap-xs text-[15px] text-body md:grid-cols-3">
          <li><b className="text-ink">Modificación 1:</b> DevSecOps con gitleaks y Trivy.</li>
          <li><b className="text-ink">Modificación 2:</b> versión 1.0.N y GitHub Releases como puntos de restauración.</li>
          <li><b className="text-ink">Modificación 3:</b> avisos a Discord al desplegar, al fallar y al hacer rollback.</li>
        </ul>
      </Escenarios>
      <GuionVista vistas={['pipeline']} />
    </>
  )
}
