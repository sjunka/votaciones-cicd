import { Slide, Tarjeta } from '../components/Slide'

const items = [
  { t: 'Chrome 157 y HTTPS-First', p: 'En el Taller 3, test-staging falló con NoSuchElementException aunque el ALB respondía. Chrome deja en blanco los sitios solo HTTP.', h: 'Bandera --disable-features=HttpsFirstBalancedModeAutoEnable en Selenium. En local pasaba porque localhost no se afecta.' },
  { t: 'Quality Gate NONE en SonarCloud', p: 'El primer análisis da Quality Gate NONE (Not computed) y falla el escaneo.', h: 'gh run rerun <id> --failed, como dice la guía.' },
  { t: 'La aprobación protege el avance, no el regreso', p: 'Si el rollback usara el ambiente production, se quedaría esperando un revisor.', h: 'Ambiente production-rollback sin revisores, sobre el mismo workspace de Terraform.' },
  { t: 'El rollback revierte la imagen, no la infraestructura', p: 'Volver a la Release anterior no deshace un cambio de Terraform.', h: 'Un cambio de infraestructura malo se revierte con git revert y el pipeline normal.' },
  { t: 'Cuenta personal y no Academy', p: 'Sergio usa su cuenta personal de AWS. La cuenta no trae LabRole y cuesta dinero real.', h: 'LabRole creado a mano, un usuario IAM solo para el pipeline con llaves permanentes y terraform destroy al terminar.' },
]

export default function Aprendizajes() {
  return (
    <Slide titulo="Desafíos y aprendizajes" sub="Lo que nos pasó en los talleres y lo que decidimos por eso.">
      <div className="grid gap-md lg:grid-cols-2">
        {items.map((i, n) => (
          <Tarjeta key={i.t} titulo={i.t} borde={`var(--s${n + 1})`}>
            <p><b className="text-ink">Qué vimos: </b>{i.p}</p>
            <p className="mt-xs"><b className="text-ink">Qué hicimos: </b>{i.h}</p>
          </Tarjeta>
        ))}
      </div>
    </Slide>
  )
}
