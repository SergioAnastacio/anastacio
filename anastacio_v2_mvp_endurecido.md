# Anastacio v2 — MVP Endurecido

## 1. Objetivo

Este documento reduce la propuesta original de Anastacio v2 a una version
mas enfocada, ejecutable y defendible desde producto y arquitectura.

La idea central se mantiene:

> Anastacio v2 no debe competir por ser el framework React mas completo,
> sino por ser uno de los frameworks React mas inspeccionables y mas
> seguros de evolucionar.

## 2. Tesis endurecida

Anastacio v2 sera un framework React + TypeScript con:

- runtime y build ligeros;
- routing por archivos;
- introspeccion nativa del proyecto;
- salidas estructuradas para humanos y agentes.

Su valor diferencial no estara en SSR avanzado, edge runtime o magia
excesiva. Estara en hacer visible la estructura del sistema y convertirla
en una interfaz operable.

## 3. Que se conserva de la propuesta original

- Enfoque agent-first, pero aterrizado en artifacts reales.
- Principio `explicit over magic`.
- Core inspirado en tooling Vite-like.
- Convenciones utiles con escape hatches.
- Arquitectura orientada a contratos.
- No-objetivos iniciales que preservan foco.

## 4. Que se recorta del MVP

Para evitar sobrecarga temprana, estas capacidades salen del MVP inicial:

- server actions;
- generadores semanticos completos;
- `graph` profundo con hotspots avanzados;
- `explain <target>` con analisis contextual rico;
- `doctor --fix`;
- SSR, prerender y data loading formal;
- separacion inmediata en muchos paquetes publicos.

Nada de lo anterior se descarta. Solo se mueve a fases posteriores.

## 5. MVP reescrito

### 5.1 Enunciado del MVP

Anastacio v2 debe permitir crear o ejecutar una app React + TypeScript,
resolver sus rutas por archivos y exponer una representacion estructurada
de su arquitectura minima mediante manifests y comandos de inspeccion.

### 5.2 Capacidades del MVP

- `anastacio dev`
- `anastacio build`
- config loader basico
- routing por archivos
- layouts basicos
- generacion de `routes.manifest.json`
- generacion de `project-context.md`
- `anastacio inspect`
- `anastacio inspect --json`
- `anastacio doctor` minimo

### 5.3 Lo que no entra al MVP

- `anastacio preview` como feature prioritaria
- actions con contratos formales
- `modules.manifest.json` completo
- `actions.manifest.json`
- `project.graph.json` rico
- generacion de features/rutas/acciones
- refactors automaticos

## 6. Artefactos minimos requeridos

El MVP no necesita todos los manifests propuestos. Solo necesita estos dos
como base real:

### `routes.manifest.json`

Debe incluir:

- path;
- archivo fuente;
- layout asociado si existe;
- parametros dinamicos;
- indicadores simples como `hasLoading`, `hasErrorBoundary`, `hasNotFound`.

### `project-context.md`

Debe explicar:

- estructura global de la app;
- rutas detectadas;
- convenciones activas;
- comandos disponibles;
- observaciones o riesgos basicos.

### `diagnostics.json` minimo

Puede existir desde la primera iteracion, pero solo con reglas simples:

- rutas faltantes o invalidas;
- layouts rotos;
- conflictos de nombres;
- archivos esperados pero ausentes.

## 7. Arquitectura recomendada para arrancar

No conviene partir de inmediato en demasiados paquetes. Primero conviene
estabilizar contratos internos dentro de un monorepo simple o incluso un
solo paquete con modulos internos claros.

La division conceptual inicial deberia ser:

- `cli`
- `core`
- `compiler`
- `router`
- `inspector`
- `doctor`
- `shared`

La extraccion a paquetes publicos debe ocurrir solo cuando:

- los contratos ya sean estables;
- existan pruebas por modulo;
- la separacion mejore mantenibilidad real y no solo la presentacion.

## 8. Roadmap ejecutable

### Fase 1 — Core utilizable

Objetivo:
tener una app corriendo y un primer nivel de estructura visible.

Incluye:

- CLI minima;
- config loader;
- dev server;
- build pipeline;
- router por archivos;
- `routes.manifest.json`;
- `inspect --json`.

### Fase 2 — Introspeccion util

Objetivo:
hacer que el framework ya explique el proyecto de forma util para humanos.

Incluye:

- `project-context.md`;
- `diagnostics.json`;
- `doctor`;
- grafo simple de dependencias;
- deteccion basica de ciclos.

### Fase 3 — Automatizacion segura

Objetivo:
habilitar operaciones semanticas y mejor soporte para agentes.

Incluye:

- `explain <target>`;
- generadores iniciales;
- contratos de acciones;
- validaciones cruzadas mas fuertes.

## 9. Criterios de exito

El MVP no se considera exitoso solo porque compila. Debe cumplir esto:

- una app nueva puede arrancar con `dev` y compilar con `build`;
- el framework puede enumerar rutas reales sin ambiguedad;
- `inspect --json` produce salida estable y util;
- `doctor` detecta errores estructurales reales;
- un desarrollador nuevo puede entender la forma general del proyecto sin
  depender de conocimiento tribal.

## 10. Riesgos principales

### Riesgo 1: perder foco

Si el MVP intenta cubrir runtime, actions, generators, graph rico y SSR,
la propuesta se diluye.

Mitigacion:
priorizar estructura visible antes que amplitud funcional.

### Riesgo 2: agent-first superficial

Si no hay manifests utiles ni inspeccion real, "agent-first" se vuelve
solo narrativa.

Mitigacion:
hacer que `inspect` y `doctor` sean features troncales, no addons.

### Riesgo 3: paquetes demasiado pronto

Separar todo desde el inicio puede congelar contratos inmaduros.

Mitigacion:
primero modulos internos con fronteras claras; despues extraccion.

## 11. Decision recomendada

La direccion correcta para Anastacio v2 es:

**framework React con introspeccion nativa como feature principal.**

No debe ganar por cantidad de features ni por parecerse a Next.js.
Debe ganar por claridad estructural, inspeccion y evolucion segura.

## 12. Resumen ejecutivo

La propuesta original tiene una buena tesis, pero el MVP estaba cargado.
La version endurecida mantiene la ambicion, pero la convierte en una
secuencia realista:

1. correr y compilar;
2. exponer estructura;
3. diagnosticar;
4. automatizar.

Si Anastacio v2 logra que `inspect` y `doctor` sean realmente utiles,
ya tendra un diferencial serio y creible.
