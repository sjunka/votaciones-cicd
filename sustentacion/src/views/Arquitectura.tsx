import Escenarios from '../components/Escenarios'
import GuionVista from '../components/GuionVista'
import { ALTO, ANCHO, aristas, escenarios, nodos } from '../data/arquitectura'

export default function Arquitectura() {
  return (
    <>
      <Escenarios titulo="Arquitectura en AWS" ancho={ANCHO} alto={ALTO} nodos={nodos} aristas={aristas} escenarios={escenarios} />
      <GuionVista vistas={['arquitectura']} />
    </>
  )
}
