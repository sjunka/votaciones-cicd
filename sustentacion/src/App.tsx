import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import { vistas } from './views'

export default function App() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-lg py-lg">
        <Routes>
          {vistas.map((v) => (
            <Route key={v.id} path={v.ruta} element={<v.componente />} />
          ))}
        </Routes>
      </main>
    </>
  )
}
