import { Chip, SeccionGuion } from '../components/GuionVista'
import { fmtTiempo, guion, palabrasSeccion, totalPalabras, totalSeg } from '../data/guion'

// Estilos de impresión: sin barra de navegación, fondo blanco y secciones sin partir.
const imprimir = `
@media print {
  header, .no-print { display: none !important; }
  html, body { background: #fff !important; color: #000 !important; }
  main { padding: 0 !important; max-width: none !important; }
  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  section.guion-seccion { break-inside: avoid; page-break-inside: avoid; margin-bottom: 10px; }
  section.guion-seccion img { max-width: 260px; }
  .guion-seccion { grid-template-columns: 270px 1fr !important; }
  h1 { font-size: 24px !important; }
  h2 { font-size: 18px !important; }
  .guion-seccion p { font-size: 12.5px !important; line-height: 1.35 !important; }
  .guion-seccion div { font-size: 12.5px !important; }
  @page { size: Letter; margin: 12mm; }
}
`

export default function Guion() {
  return (
    <section className="max-w-[1200px]">
      <style>{imprimir}</style>
      <div className="flex flex-wrap items-center gap-md">
        <h1 className="text-[36px] leading-tight">Guion de la sustentación</h1>
        <button onClick={() => window.print()} className="no-print ml-auto h-10 rounded-md border border-hairline bg-canvas px-md text-[15px] font-medium text-ink hover:bg-card">
          Imprimir
        </button>
      </div>
      <p className="mt-xs text-[18px] text-body">
        {fmtTiempo(totalSeg)} min (objetivo máximo 10:00; los otros 5 minutos son preguntas) y unas {totalPalabras} palabras dichas, a 130 por minuto. Entre <Chip quien="Sergio" /> y <Chip quien="Valeria" />.
        Lo que va entre comillas se dice. Lo gris en cursiva es lo que se muestra o se hace. El recuadro naranja es una pregunta probable y la responde quien tiene esa pantalla.
        Clic en la imagen abre la pantalla en el paso indicado. Los números de paso de los diagramas son supuestos hasta cerrar los diagramas.
      </p>
      <p className="mt-xs rounded-md border border-warn px-sm py-xs text-[17px] text-ink">
        Reparto propuesto, falta confirmar. Sergio: intro, resumen, artefacto, ramas, arquitectura, rollback y demo. Valeria: pipeline, pruebas, modificaciones y evidencia. Los dos: aprendizajes y cierre.
      </p>
      <table className="mt-md w-full max-w-[640px] text-left text-[15px]">
        <tbody>
          {guion.map((s, i) => (
            <tr key={i} className="border-t border-hairline">
              <td className="py-[2px] pr-sm font-mono">{i + 1}</td>
              <td className="py-[2px] pr-sm text-ink">{s.titulo}</td>
              <td className="py-[2px] pr-sm font-semibold" style={{ color: s.quien === 'Sergio' ? '#2f6fe4' : '#b0397a' }}>{s.quien}</td>
              <td className="py-[2px] pr-sm font-mono">{fmtTiempo(s.tiempoSeg)}</td>
              <td className="py-[2px] font-mono text-muted">{palabrasSeccion(s)} pal.</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-lg grid gap-lg">
        {guion.map((s, i) => <SeccionGuion key={i} s={s} n={i + 1} />)}
      </div>
    </section>
  )
}
