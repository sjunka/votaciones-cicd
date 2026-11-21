import type { ComponentType } from 'react'
import Info from './views/Info'
import Resumen from './views/Resumen'
import Rubrica from './views/Rubrica'
import Artefacto from './views/Artefacto'
import Ramas from './views/Ramas'
import Pipeline from './views/Pipeline'
import Arquitectura from './views/Arquitectura'
import Pruebas from './views/Pruebas'
import Rollback from './views/Rollback'
import Modificaciones from './views/Modificaciones'
import Evidencia from './views/Evidencia'
import Aprendizajes from './views/Aprendizajes'
import Alternativas from './views/Alternativas'
import Guion from './views/Guion'

export interface Vista {
  id: string
  ruta: string
  titulo: string
  descripcion: string
  tipo: 'diagrama' | 'slide' | 'guion'
  componente: ComponentType
}

/** Registro de vistas. La barra de navegación, las rutas y la página Info salen de aquí. */
export const vistas: Vista[] = [
  { id: 'info', ruta: '/', titulo: 'Inicio', descripcion: 'Equipo, enlaces a cada vista y a la evidencia.', tipo: 'slide', componente: Info },
  { id: 'resumen', ruta: '/resumen', titulo: 'Resumen', descripcion: 'Resumen ejecutivo: qué construimos y cómo evolucionó desde los talleres 1 a 3.', tipo: 'slide', componente: Resumen },
  { id: 'rubrica', ruta: '/rubrica', titulo: 'Rúbrica', descripcion: 'Los 10 puntos de la presentación y los mínimos del pipeline, con la vista que cubre cada uno.', tipo: 'slide', componente: Rubrica },
  { id: 'artefacto', ruta: '/artefacto', titulo: 'Artefacto', descripcion: 'La app de votación en vivo: propósito, funcionalidades y complejidad.', tipo: 'slide', componente: Artefacto },
  { id: 'ramas', ruta: '/ramas', titulo: 'Ramas', descripcion: 'Trunk-based, versiones 1.0.N y qué corre en cada rama o evento.', tipo: 'diagrama', componente: Ramas },
  { id: 'pipeline', ruta: '/pipeline', titulo: 'Pipeline', descripcion: 'Flujograma de CI y CD con la herramienta de cada paso.', tipo: 'diagrama', componente: Pipeline },
  { id: 'arquitectura', ruta: '/arquitectura', titulo: 'Arquitectura', descripcion: 'ALB, dos servicios ECS, DynamoDB y los servicios de apoyo.', tipo: 'diagrama', componente: Arquitectura },
  { id: 'pruebas', ruta: '/pruebas', titulo: 'Pruebas', descripcion: 'Qué prueba cada suite, en qué ambiente y por qué.', tipo: 'slide', componente: Pruebas },
  { id: 'rollback', ruta: '/rollback', titulo: 'Rollback', descripcion: 'Rollback automático y botón de pánico.', tipo: 'diagrama', componente: Rollback },
  { id: 'modificaciones', ruta: '/modificaciones', titulo: 'Modificaciones', descripcion: 'Las 3 modificaciones al pipeline y su evidencia.', tipo: 'slide', componente: Modificaciones },
  { id: 'evidencia', ruta: '/evidencia', titulo: 'Evidencia', descripcion: 'Runs, capturas y enlaces por ambiente.', tipo: 'slide', componente: Evidencia },
  { id: 'aprendizajes', ruta: '/aprendizajes', titulo: 'Aprendizajes', descripcion: 'Desafíos que tuvimos y qué aprendimos.', tipo: 'slide', componente: Aprendizajes },
  { id: 'alternativas', ruta: '/alternativas', titulo: 'Alternativas', descripcion: 'Decisiones tomadas y alternativas descartadas (respaldo para preguntas).', tipo: 'slide', componente: Alternativas },
  { id: 'guion', ruta: '/guion', titulo: 'Guion', descripcion: 'Guion de 10 minutos para dos voces, con las preguntas probables para los 5 minutos finales.', tipo: 'guion', componente: Guion },
]

export const URL_BASE = 'https://sjunka.github.io/votaciones-cicd/'
export const urlCompleta = (ruta: string) => `${URL_BASE}#${ruta}`
