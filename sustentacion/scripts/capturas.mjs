// Toma una captura por pantalla del guion con Chrome headless (1400x900).
// Uso: node scripts/capturas.mjs [puerto] [filtro]   (puerto por defecto 4182; filtro opcional: texto de la ruta)
// Requiere la app servida: npm run build && npx vite preview --port 4182
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const puerto = process.argv[2] ?? '4182'
const filtro = process.argv[3] ?? ''
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Lee pares ruta/captura de src/data/guion.ts para no duplicar la lista.
const fuente = readFileSync(join(raiz, 'src/data/guion.ts'), 'utf8')
const pares = [...fuente.matchAll(/ruta: '([^']+)',\s*\n\s*captura: '([^']+)'/g)].map((m) => ({ ruta: m[1], captura: m[2] }))

mkdirSync(join(raiz, 'public/capturas'), { recursive: true })
for (const { ruta, captura } of pares) {
  if (filtro && !ruta.includes(filtro)) continue
  const salida = join(raiz, 'public', captura)
  const url = `http://localhost:${puerto}/votaciones-cicd/${ruta}`
  execFileSync(chrome, ['--headless=new', '--hide-scrollbars', `--screenshot=${salida}`, '--window-size=1400,900', '--virtual-time-budget=5000', url], { stdio: 'ignore' })
  console.log(`${captura}  <-  ${url}`)
}
console.log(`${pares.length} pantallas en el guion.`)
