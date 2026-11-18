import puppeteer from 'puppeteer-core'
const [,, url, w, h, out] = process.argv
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await b.newPage(); await p.setViewport({ width: +w, height: +h })
await p.goto(url, { waitUntil: 'networkidle0' })
const [btn] = await p.$$('xpath/.//button[normalize-space()="Siguiente"]'); await btn.click()
await new Promise(r => setTimeout(r, 1500))
const r = await p.evaluate(() => { const s = document.querySelector('svg[aria-label="Diagrama"]').getBoundingClientRect(); const c = document.querySelector('h3').getBoundingClientRect(); return { svgTop: s.top, svgBottom: s.bottom, cardBottom: c.bottom, vh: innerHeight } })
console.log(out, JSON.stringify(r), r.svgTop >= 0 && r.svgBottom <= r.vh && r.cardBottom <= r.vh ? 'VISIBLE' : 'CORTADO')
await p.screenshot({ path: out }); await b.close()
