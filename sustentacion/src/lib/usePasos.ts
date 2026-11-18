import { useEffect, useState } from 'react'

export function usePasos(total: number, ms = 7000) {
  // #/ruta?paso=3 abre directo en ese paso (útil para enlazar o para capturas).
  const [i, setI] = useState(() => {
    const n = Number(new URLSearchParams(location.hash.split('?')[1] ?? '').get('paso'))
    return Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : 0
  })
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      if (i >= total - 1) setPlaying(false)
      else setI(i + 1)
    }, ms)
    return () => clearTimeout(t)
  }, [playing, i, total, ms])

  const ir = (n: number) => setI(Math.max(0, Math.min(total - 1, n)))
  const toggle = () => {
    if (!playing && i >= total - 1) setI(0)
    setPlaying((p) => !p)
  }
  return { i, playing, ir, toggle, sig: () => ir(i + 1), ant: () => ir(i - 1), reiniciar: () => { setI(0); setPlaying(false) } }
}
