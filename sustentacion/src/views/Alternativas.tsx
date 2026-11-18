import { Slide, Tarjeta } from '../components/Slide'

const comp: [string, string, string][] = [
  ['Lo que pide la diapositiva', 'Literal: mostrar los logs en GitHub Actions', 'Hay que justificar el cambio y el profe revisa en otra plataforma'],
  ['Lo visto en clase', 'Talleres 1, 2 y 3', 'No se vio'],
  ['Reuso', 'El ci-cd.yml del Taller 3 ya tenía 5 de los 7 jobs', 'Reescribir todo en .circleci/config.yml'],
  ['Integración con GitHub', 'Checks requeridos, Environments con revisores y GITHUB_TOKEN para las Releases', 'GitHub App, aprobación como job type: approval, token aparte para Releases'],
  ['Botón de pánico', 'workflow_dispatch con entradas', 'Punto a favor: rollback pipeline nativo en el Overview'],
  ['Secretos', 'Por repositorio y por ambiente', 'Contexts por organización'],
  ['Costo', 'Gratis en repo público con runners estándar', 'Plan Free con créditos mensuales (verificar en circleci.com/pricing)'],
  ['Funciones avanzadas', 'Matrix, workflows reutilizables, actions/cache', 'Punto a favor: caché y paralelismo de pruebas, SSH a un job, Insights'],
  ['Curva en 8 días', 'Ninguna', 'Cuenta nueva y sintaxis nueva'],
]

const puntaje: [string, string, string][] = [
  ['Total (de 0 a 10, estimación nuestra)', '9,4', '5,3'],
]

const decisiones: [string, string][] = [
  ['GitHub Actions', 'CircleCI (la diapositiva pide GitHub Actions) y el híbrido (doble configuración y doble manejo de secretos)'],
  ['El Taller 3 como base', 'Empezar de cero'],
  ['Votación en vivo con QR', 'React Native nativo (su CD no encaja con ECS y el público no puede instalarla) y el panel de artefactos como app principal (depende de la API de GitHub y de un token)'],
  ['Monorepo: web/, api/, infra/ y tests/', 'Un repo por componente (dos pipelines y la evidencia repartida)'],
  ['Web en React + Vite, API en Python y DynamoDB, 2 servicios ECS y 1 ALB', 'RDS (lento de crear y más caro), datos en memoria (cada deploy borra los votos) y el front en S3 (CORS y un rollback distinto)'],
  ['Dos ambientes', 'Tres (más costo, no suma frente al mínimo) y ambientes temporales por PR'],
  ['Trunk-based', 'GitFlow: producción recibiría un artefacto que no se probó en staging'],
  ['SemVer 1.0.N y Releases', 'Solo el SHA (no se lee en la demo ni deja lista de versiones buenas) y release-please (exige disciplina en cada commit)'],
  ['Aprobación manual antes de producción', 'Despliegue continuo sin aprobación: en la demo no se controlaría el momento'],
  ['Rollback con el mismo deploy y la imagen anterior, en un ambiente sin revisores', 'aws ecs update-service (deja a Terraform desalineado) y blue/green con CodeDeploy (mucho trabajo)'],
  ['Botón de pánico con workflow_dispatch', 'Un botón dentro de la app (obliga a guardar un token de GitHub en la app)'],
  ['Llaves de un usuario IAM de CI en GitHub Secrets', 'OIDC (no lo probamos)'],
  ['Pruebas de la base en CI con moto', 'DynamoDB Local en Docker (más lento) y la tabla real desde CI'],
]

export default function Alternativas() {
  return (
    <Slide titulo="Alternativas evaluadas" sub="Respaldo para preguntas: GitHub Actions frente a CircleCI y las decisiones descartadas.">
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[800px] border-collapse text-left text-[17px]">
          <thead className="bg-soft text-[15px] text-muted">
            <tr><th className="p-sm">Criterio</th><th className="p-sm">GitHub Actions</th><th className="p-sm">CircleCI</th></tr>
          </thead>
          <tbody>
            {comp.map((r) => (
              <tr key={r[0]} className="border-t border-hairline align-top">
                <td className="p-sm font-semibold text-ink">{r[0]}</td><td className="p-sm">{r[1]}</td><td className="p-sm">{r[2]}</td>
              </tr>
            ))}
            {puntaje.map((r) => (
              <tr key={r[0]} className="border-t-2 border-hairline bg-soft font-semibold text-ink">
                <td className="p-sm">{r[0]}</td><td className="p-sm">{r[1]}</td><td className="p-sm">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-md rounded-lg border-l-[6px] border-[#e07a1f] bg-[#fff7ec] p-md text-[18px] text-[#3d3d3a]">
        El puntaje es una estimación nuestra, no una medición. Si el curso no pidiera GitHub Actions, CircleCI sería una opción seria por su botón de rollback y su caché.
      </div>

      <h2 className="mt-xl text-[28px]">Decisiones tomadas y alternativas descartadas</h2>
      <div className="mt-md grid gap-sm lg:grid-cols-2">
        {decisiones.map(([e, d], i) => (
          <Tarjeta key={e}>
            <div className="text-[19px] font-semibold text-ink">{i + 1}. {e}</div>
            <div className="mt-xxs text-[17px]"><span className="text-muted">Descartado: </span>{d}</div>
          </Tarjeta>
        ))}
      </div>
    </Slide>
  )
}
