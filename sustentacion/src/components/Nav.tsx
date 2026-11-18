import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { vistas } from '../views'

export default function Nav() {
  const [oscuro, setOscuro] = useState(document.documentElement.dataset.theme === 'dark')
  const cambiar = () => {
    const t = oscuro ? 'light' : 'dark'
    document.documentElement.dataset.theme = t
    try { localStorage.setItem('tema', t) } catch { /* sin almacenamiento */ }
    setOscuro(!oscuro)
  }
  return (
    <header className="border-b border-hairline bg-canvas">
      <nav className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-xs px-lg py-sm">
        <span className="mr-md font-serif text-[22px] text-ink">Proyecto final</span>
        {vistas.map((v) => (
          <NavLink
            key={v.id}
            to={v.ruta}
            end
            className={({ isActive }) => `rounded-md px-sm py-xs text-[15px] font-medium ${isActive ? 'bg-primary text-white' : 'text-ink hover:bg-card'}`}
          >
            {v.titulo}
          </NavLink>
        ))}
        <button onClick={cambiar} className="ml-auto h-9 rounded-md border border-hairline px-md text-[14px] font-medium text-ink hover:bg-card">
          Tema: {oscuro ? 'oscuro' : 'claro'}
        </button>
      </nav>
    </header>
  )
}
