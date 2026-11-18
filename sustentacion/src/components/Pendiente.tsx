export default function Pendiente({ texto = 'pendiente' }: { texto?: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-warn px-sm py-[2px] text-[14px] font-medium text-warn">
      {texto}
    </span>
  )
}

export function Listo({ texto = 'listo en la app' }: { texto?: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-ok px-sm py-[2px] text-[14px] font-medium text-ok">
      {texto}
    </span>
  )
}
