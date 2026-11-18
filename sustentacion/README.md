# Proyecto final CI/CD - Sustentación

App web (React, Vite, Tailwind, TypeScript) para presentar el proyecto final del curso de Integración y Entrega Continua: votación en vivo con QR, entregada con un pipeline de GitHub Actions hacia AWS (ECS Fargate, ALB y DynamoDB).

En vivo (cuando se publique): https://sjunka.github.io/votaciones-cicd/

## Vistas

14 vistas, registradas en `src/views.ts`: Inicio, Resumen, Rúbrica, Artefacto, Ramas, Pipeline, Arquitectura, Pruebas, Rollback, Modificaciones, Evidencia, Aprendizajes, Alternativas y Guion. Los diagramas se reproducen con Play/Pausa, Anterior/Siguiente o el teclado. `#/pipeline?esc=<id>&paso=N` salta a un escenario y un paso.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # tsc + vite build, genera dist/
npx vite preview --port 4182
```

El tema oscuro se fuerza con `?theme=dark`.

## Datos pendientes

Todo lo que aún no existe (URLs de staging y producción, runs, Releases, Discord, SonarCloud, Docker Hub, capturas y métricas DORA) está en `src/data/pendientes.ts`. Mientras valga `null`, la app muestra un chip "pendiente". Cuando haya el dato real, se escribe ahí y no hay que tocar nada más. Las capturas de evidencia van en `public/` y se referencian por ruta relativa.

## Guion y capturas

El guion está en `src/data/guion.ts` (una sección por pantalla, con expositor, ruta, captura, tiempo, líneas y preguntas). La vista Guion tiene el botón Imprimir, con estilos de impresión.

Las capturas del guion (`public/capturas/N-nombre.png`) salen de la propia lista del guion:

```bash
npm run build && npx vite preview --port 4182 &
node scripts/capturas.mjs            # todas, contra el puerto 4182
node scripts/capturas.mjs 4182 pipeline   # solo las rutas que contienen "pipeline"
```

Usa Chrome headless a 1400x900. Con otra ruta de Chrome: `CHROME=/ruta/a/chrome node scripts/capturas.mjs`. Revisar cada PNG a ojo (nada cortado, sin scroll a medias) y repetir las que no sirvan.

## Cómo agregar un diagrama

1. Crear `src/data/mi-diagrama.ts` con `ANCHO`, `ALTO`, `nodos`, `aristas` y `pasos` (tipos en `src/lib/tipos.ts`).
2. Crear `src/views/MiDiagrama.tsx` con `<Diagrama ... />` y, si tiene guion, `<GuionVista vistas={[...]} />`.
3. Agregar una línea en `src/views.ts`.

## Logos

Los logos son SVG en `src/assets/logos/` y se registran en `src/lib/logos.ts`. No se carga nada de CDN en tiempo de ejecución, salvo las tipografías de Google Fonts.
