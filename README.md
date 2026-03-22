# Anastacio

Anastacio es un framework React + TypeScript orientado a agentes, enfocado
en arquitectura explicita, inspeccion nativa y evolucion segura del codigo.

La apuesta de v2 no es competir por ser el framework mas completo. La apuesta
es construir un framework que pueda explicar la estructura del proyecto como
dato, de forma util para humanos y para tooling automatizado.

## Estado del repositorio

Este repositorio esta en transicion hacia **Anastacio v2**.

La linea de trabajo de v2 vive en la rama `dev`. El objetivo actual no es
cerrar todas las capacidades de un meta-framework moderno, sino consolidar un
MVP enfocado y ejecutable.

## Direccion de v2

Anastacio v2 se apoya en estas ideas:

- `explicit over magic`
- routing por archivos
- manifests estructurados
- diagnosticos utiles
- comandos semanticos
- evolucion segura del proyecto

La idea central es simple:

> Anastacio v2 debe ganar por claridad estructural, no por cantidad de
> features.

## Foco actual del MVP

La primera etapa de v2 esta enfocada en:

- `anastacio dev`
- `anastacio build`
- config loader basico
- routing por archivos
- layouts basicos
- `routes.manifest.json`
- `project-context.md`
- `anastacio inspect`
- `anastacio inspect --json`
- `anastacio doctor` minimo

Capacidades como server actions, generadores avanzados, graph profundo y SSR
quedan para fases posteriores.

## Documentos base

La direccion actual de producto y arquitectura esta documentada aqui:

- [Vision y arquitectura v2](./anastacio_v2_vision_y_arquitectura.md)
- [MVP endurecido](./anastacio_v2_mvp_endurecido.md)
- [Backlog Fase 1](./anastacio_v2_fase1_tareas.md)

## Roadmap resumido

### Fase 1

Core utilizable e inspeccion minima:

- CLI minima
- build y dev server
- router por archivos
- `routes.manifest.json`
- `inspect --json`

### Fase 2

Introspeccion util:

- `project-context.md`
- `diagnostics.json`
- `doctor`
- grafo simple de dependencias

### Fase 3

Automatizacion segura:

- `explain <target>`
- generadores iniciales
- contratos de acciones

## Comandos actuales del repositorio

Mientras el core de v2 madura, estos scripts siguen disponibles:

```bash
npm run build
npm run lint
npm run format
```

## Contribucion

Si vas a trabajar sobre v2:

1. parte desde una rama de feature basada en la linea v2 activa;
2. alinea cambios con la arquitectura v2 y el backlog de Fase 1;
3. evita introducir features fuera del foco del MVP sin cerrar antes los
   contratos base.

## Arquitectura oficial v2

A partir de esta migracion, los modulos oficiales de Anastacio v2 son:

- `src/core`
- `src/router`
- `src/inspector`
- `src/doctor`
- `src/shared`

Las carpetas heredadas (`src/adapters`, `src/applications`, `src/dominio` y
partes antiguas de `src/infrastructure`) deben considerarse transicionales.
No deben recibir nuevas capacidades estructurales mientras la migracion a v2
este en curso.

## Licencia

MIT
