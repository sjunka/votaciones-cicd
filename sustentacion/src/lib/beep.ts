let ctx: AudioContext | null = null

/** Pitido corto. Solo suena si el navegador ya permite audio (después de un clic). */
export function pitido(tipo: 'ok' | 'fail') {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = tipo === 'ok' ? 'sine' : 'sawtooth'
    o.frequency.value = tipo === 'ok' ? 880 : 200
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (tipo === 'ok' ? 0.18 : 0.4))
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.45)
  } catch {
    /* sin audio disponible */
  }
}
