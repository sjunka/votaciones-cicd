import { Slide, Tarjeta } from '../components/Slide'

const funciones = [
  'Crear una encuesta con una pregunta y de 2 a 6 opciones.',
  'QR grande de la encuesta: el público vota desde el celular.',
  'Barras con porcentaje que se refrescan cada 2 segundos.',
  'Cierre con código de administrador.',
  'Banner con el ambiente y la versión; la página Acerca de esta versión muestra versión, commit y ambiente.',
]

const reglas = ['Un voto por persona (409)', 'Encuesta cerrada (409)', 'Opción inexistente (400)', 'Porcentajes que suman 100']

export default function Artefacto() {
  return (
    <Slide titulo="Artefacto: votación en vivo" sub="El público escanea un QR y vota. Los resultados se mueven en el proyector.">
      <div className="grid gap-md lg:grid-cols-2">
        <Tarjeta titulo="Propósito" borde="var(--s1)">
          Votar sin instalar nada. Sirve de ejemplo para un pipeline porque tiene reglas de negocio que se pueden probar.
        </Tarjeta>
        <Tarjeta titulo="Funcionalidades" borde="var(--s2)">
          <ul className="list-disc pl-lg">{funciones.map((f) => <li key={f}>{f}</li>)}</ul>
        </Tarjeta>
      </div>

      <h2 className="mt-xl text-[30px]">Tres piezas, complejidad media</h2>
      <div className="mt-md grid gap-md md:grid-cols-3">
        <Tarjeta titulo="Web" borde="var(--s4)">React + Vite, servida por nginx en el puerto 80. Llama a <code>/api/...</code> con rutas relativas.</Tarjeta>
        <Tarjeta titulo="API" borde="var(--s3)">Python 3.13, Flask y boto3, con gunicorn en el puerto 8000.</Tarjeta>
        <Tarjeta titulo="DynamoDB" borde="var(--s5)">Tabla <code>votaciones-&lt;ambiente&gt;</code> bajo demanda. Los votos sobreviven a un deploy o a un rollback.</Tarjeta>
      </div>
      <p className="mt-md text-[20px] text-ink">Es complejidad media: dos servicios detrás de un mismo ALB y una base de datos fuera del contenedor.</p>

      <h2 className="mt-xl text-[30px]">Reglas de negocio que se prueban</h2>
      <ul className="mt-md flex flex-wrap gap-sm">
        {reglas.map((r) => <li key={r} className="rounded-lg border border-hairline bg-soft px-md py-xs text-[18px] text-ink">{r}</li>)}
      </ul>
    </Slide>
  )
}
