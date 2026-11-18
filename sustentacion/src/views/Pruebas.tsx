import { Slide } from '../components/Slide'

const filas: [string, string, string, string, string][] = [
  ['Formato y lint', 'CI', 'Black, Flake8, Pylint, ESLint', 'Estilo y errores comunes', 'Tarda segundos: falla rápido'],
  ['Secretos', 'CI', 'gitleaks', 'Que no haya llaves en el código ni en el historial', 'Antes de publicar cualquier cosa'],
  ['IaC', 'CI', 'terraform fmt y validate', 'Infraestructura bien escrita', 'Antes de tocar AWS, sin credenciales'],
  ['Unitarias y cobertura 80 %', 'CI', 'pytest + moto, Vitest', 'Reglas de la encuesta', 'Rápidas y aisladas, sin AWS'],
  ['Calidad', 'CI', 'SonarCloud con quality gate', 'Bugs, vulnerabilidades y duplicación', 'El gate bloquea el PR'],
  ['Imagen', 'CI', 'Trivy', 'CVE críticos en las dos imágenes', 'No publicar un artefacto vulnerable'],
  ['Integración API', 'Staging', 'pytest + requests', 'API real con DynamoDB real, errores 400, 404 y 409', 'Primer ambiente con infraestructura real'],
  ['E2E', 'Staging', 'Selenium', 'Crear, votar y ver el resultado', 'Valida el sistema antes de pedir la aprobación'],
  ['Smoke', 'Producción', 'pytest + requests', 'Web carga, health ok, versión esperada, solo lectura', 'No ensucia datos reales. Si falla, hay rollback'],
  ['Smoke tras rollback', 'Producción', 'Las mismas', 'La versión restaurada responde', 'Cierra el ciclo del rollback'],
  ['Health check', 'Staging y producción', 'ALB + circuit breaker de ECS', 'Que cada tarea responde', 'Si la tarea no queda sana, ECS vuelve a la anterior'],
]

const color: Record<string, string> = { CI: 'var(--s4)', Staging: 'var(--s3)', Producción: 'var(--s6)', 'Staging y producción': 'var(--s5)' }

export default function Pruebas() {
  return (
    <Slide titulo="Pruebas" sub="Once pruebas. Cada una corre donde puede fallar más barato.">
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[900px] border-collapse text-left text-[17px]">
          <thead className="bg-soft text-[15px] text-muted">
            <tr>{['Prueba', 'Ambiente', 'Herramienta', 'Qué valida', 'Por qué ahí'].map((h) => <th key={h} className="p-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f[0]} className="border-t border-hairline align-top">
                <td className="p-sm font-semibold text-ink">{f[0]}</td>
                <td className="p-sm"><span className="whitespace-nowrap rounded-md px-xs py-[2px] text-[15px] font-semibold text-white" style={{ background: color[f[1]] }}>{f[1]}</span></td>
                <td className="p-sm font-mono text-[15px]">{f[2]}</td>
                <td className="p-sm">{f[3]}</td>
                <td className="p-sm text-body">{f[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-md text-[18px] text-body">
        Selenium corre con <code className="break-all">--disable-features=HttpsFirstBalancedModeAutoEnable</code>: Chrome 157 deja en blanco los sitios solo HTTP.
      </p>
    </Slide>
  )
}
