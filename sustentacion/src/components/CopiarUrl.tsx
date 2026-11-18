import { useState } from 'react'

export default function CopiarUrl({ url }: { url: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(url).then(() => { setOk(true); setTimeout(() => setOk(false), 1500) }).catch(() => {})
      }}
      className="h-9 rounded-md border border-hairline bg-canvas px-md text-[14px] font-medium text-ink hover:bg-card"
    >
      {ok ? 'Copiado' : 'Copiar'}
    </button>
  )
}
