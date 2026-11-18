# Qué pide el profe en el proyecto final

Fuentes: foto de la diapositiva "Proyecto final en grupos" y el mensaje del profe del 2026-11-17. Autor: Sergio Junca.

## Qué hay que entregar

Un artefacto de software distinto al de clase, con complejidad media (al menos dos componentes), un pipeline completo de CI/CD y una presentación final. El pipeline debe tener al menos tres modificaciones o introducciones a nivel de pipeline o arquitectura.

## Cómo es la presentación

- Sábado 2026-11-21, al inicio de la clase de las 8 am. La diapositiva dice "25 de abril": es la fecha de la cohorte anterior, el profe ya confirmó el 21 de noviembre.
- Unos 15 minutos por equipo en total: 10 de exposición y 5 de preguntas (ajuste del guion al 2026-11-18).
- El profe pide un par de slides o un demo con el contexto de la solución, lo construido y las particularidades de los pipelines (resumen ejecutivo).
- Después de las presentaciones, la segunda parte de la clase es el foro sobre DORA.

## Los 10 puntos de la presentación

1. Explicación del artefacto: propósito, funcionalidades y complejidad.
2. Estrategia de versionamiento o ramificación, con el porqué.
3. Diseño y componentes del pipeline, con un flujograma visual de cada paso y la herramienta de cada paso.
4. Cómo se integra el versionamiento a los pipelines: en qué rama o evento se ejecuta qué.
5. Diagrama de arquitectura de software (ECS, ECR, ALB, Lambdas, lo que se haya usado).
6. Pruebas implementadas: completitud, en qué ambiente corre cada una, qué valida y por qué.
7. Evidencia de los pipelines ejecutados con éxito: entrar a GitHub Actions y mostrar los logs.
8. Evidencia de las tres modificaciones o introducciones.
9. Demostración de la app funcionando en cada ambiente.
10. Desafíos y aprendizajes.

## Mínimo del pipeline

- CI: Checkout, Build, Test (estáticas, unitarias y cobertura), Release (creación del artefacto a desplegar).
- CD: IaC, Deploy Infra (2 o más ambientes), Deploy App (2 o más ambientes), Tests pre-prod, Tests post-prod, Rollback (automático ante fallo de smoke tests y manual, el botón de pánico).

## Peso y entrega

- 25 % de la nota, en equipo.
- Se presenta en clase. Falta confirmar si además se sube la URL del repo a Interactiva (pregunta pendiente para el profe).

## Dónde queda cada punto en nuestra solución

| Punto | Vista de la app de sustentación |
|---|---|
| 1 | Artefacto |
| 2 y 4 | Ramas |
| 3 | Pipeline |
| 5 | Arquitectura |
| 6 | Pruebas |
| 7 y 9 | Evidencia |
| 8 | Modificaciones |
| 10 | Aprendizajes |
| Rollback | Rollback |
