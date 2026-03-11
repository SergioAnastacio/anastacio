# Anastacio v2 - Vision de Producto, Arquitectura Inicial y MVP Endurecido

## 1. North Star del producto

**Anastacio v2** sera un framework **agent-first para aplicaciones React + TypeScript**,
disenado para que proyectos complejos puedan ser:

- entendidos con rapidez;
- inspeccionados con precision;
- evolucionados con seguridad;
- operados mejor por humanos y agentes.

Anastacio v2 no debe competir por ser el framework React mas completo.
Debe competir por ser uno de los frameworks React mas **inspeccionables** y
mas **seguros de evolucionar**.

Su diferenciador no sera una capa de IA superficial, sino una arquitectura
que pueda **explicar la estructura del proyecto como dato**.

## 2. Problema que resuelve

Muchos proyectos React funcionan, pero presentan problemas recurrentes:

- requieren demasiado contexto tacito;
- tienen convenciones inconsistentes;
- dificultan el onboarding;
- complican el analisis de impacto;
- vuelven fragil la generacion o refactorizacion asistida.

Anastacio v2 nace para resolver eso:

> no solo compilar una app, sino volver visible y operable su estructura.

## 3. Tesis del producto

Anastacio v2 sera un framework para React orientado a agentes, centrado en:

- arquitectura explicita;
- convenciones inspeccionables;
- diagnosticos utiles;
- manifests estructurados;
- evolucion segura del codigo.

### Propuesta de valor

1. **DX para humanos**
   Estructura mas clara, menor ambiguedad y mejores rutas de diagnostico.

2. **DX para agentes**
   Salidas estructuradas, contratos y comandos semanticos que reduzcan
   interpretaciones fragiles.

3. **Arquitectura observable**
   El framework debe poder responder con precision:
   que rutas existen, como se organizan, que convenciones aplican y donde
   hay riesgos estructurales.

## 4. Principios de diseno

### 4.1 Explicit over magic

La magia solo es aceptable si puede inspeccionarse, explicarse y validarse.

### 4.2 Convention with escape hatches

Debe existir un camino principal claro, pero con mecanismos formales para
salirse de la convencion cuando haga falta.

### 4.3 Human-first, agent-amplified

Todo lo que ayude a un agente debe ayudar todavia mas al desarrollador.

### 4.4 Structured outputs everywhere

Toda decision importante del framework debe poder exponerse como dato
estructurado y no solo como logs.

### 4.5 Safe evolution

Inspeccionar, mover, renombrar y extender deben ser operaciones confiables
y verificables.

## 5. No-objetivos iniciales

Para mantener foco en v2 inicial, no seran prioridad:

- SSR complejo;
- streaming server rendering;
- edge runtimes avanzados;
- server components completos;
- sistema de deploy opinionado;
- reemplazar todo el ecosistema de bundlers;
- competir desde el inicio por amplitud de features.

## 6. Posicionamiento estrategico

### Lo que Anastacio v2 si sera

- un framework React + TypeScript;
- un runtime y dev server ligeros;
- un pipeline de build basado en esbuild;
- un sistema de routing por archivos;
- una base para inspeccion y diagnostico de proyecto;
- una plataforma preparada para tooling agent-first real.

### Lo que Anastacio v2 no quiere ser

- un clon de Next.js;
- un clon de Vite con otro nombre;
- una coleccion de scripts sin modelo interno;
- una feature de IA pegada encima sin contratos.

## 7. MVP endurecido

### 7.1 Objetivo del MVP

El primer objetivo de Anastacio v2 no es cubrir todo el espacio de un
meta-framework moderno. Su primer objetivo es este:

> permitir ejecutar una app React + TypeScript, resolver sus rutas por
> archivos y exponer una representacion estructurada minima de su
> arquitectura.

### 7.2 Capacidades que si entran al MVP

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

### 7.3 Capacidades que salen del MVP inicial

Estas capacidades no se descartan, pero no deben entrar en la primera
batalla:

- server actions;
- generadores semanticos completos;
- `graph` profundo con hotspots avanzados;
- `explain <target>` rico en contexto;
- `doctor --fix`;
- SSR;
- prerender;
- data loading formal;
- separacion inmediata en muchos paquetes publicos.

### 7.4 Criterio de exito del MVP

Un equipo debe poder:

- arrancar una app con `dev`;
- compilarla con `build`;
- listar rutas reales con precision;
- obtener salida JSON estable desde `inspect`;
- detectar problemas estructurales simples con `doctor`;
- entender la forma general del proyecto sin depender de conocimiento tribal.

## 8. Experiencia agent-first minima

La tesis agent-first debe aparecer desde el MVP, pero en forma concreta.

### 8.1 Artefactos requeridos en la primera etapa

#### `routes.manifest.json`

Debe describir al menos:

- path;
- archivo fuente;
- layout asociado si existe;
- parametros dinamicos;
- indicadores como `hasLoading`, `hasErrorBoundary`, `hasNotFound`.

#### `project-context.md`

Debe explicar:

- estructura general de la app;
- rutas detectadas;
- convenciones activas;
- comandos disponibles;
- observaciones y riesgos basicos.

#### `diagnostics.json` minimo

Puede estar desde la primera iteracion con reglas simples:

- rutas faltantes o invalidas;
- layouts rotos;
- conflictos de nombres;
- archivos esperados pero ausentes.

### 8.2 Artefactos que pasan a fases posteriores

- `modules.manifest.json`
- `actions.manifest.json`
- `project.graph.json` completo
- diagnosticos cruzados mas profundos

## 9. Arquitectura inicial recomendada

La arquitectura objetivo sigue siendo modular, pero el error seria
fragmentarla demasiado pronto. Antes de extraer paquetes, Anastacio necesita
contratos internos estables y un modelo de datos central.

### Modulos internos recomendados

#### `cli`

Responsable de:

- parsing de argumentos;
- comandos runtime;
- comandos de inspeccion;
- salida para humanos y JSON.

#### `core`

Responsable de:

- carga de configuracion;
- contexto compartido;
- contratos internos;
- ciclo de vida del framework.

#### `compiler`

Responsable de:

- integracion con esbuild;
- pipeline de build;
- watchers;
- diferencias entre dev y build.

#### `router`

Responsable de:

- file-based routing;
- layouts;
- rutas dinamicas;
- generacion de `routes.manifest.json`.

#### `inspector`

Responsable de:

- lectura estructural del proyecto;
- generacion de `project-context.md`;
- salida de `inspect`;
- base para futuros manifests.

#### `doctor`

Responsable de:

- reglas diagnosticas;
- validaciones de estructura;
- emision de `diagnostics.json`.

#### `shared`

Responsable de:

- tipos compartidos;
- helpers puros;
- contratos serializables.

### Extraccion a paquetes

La extraccion a paquetes publicos debe ocurrir solo cuando:

- los contratos ya sean estables;
- existan pruebas por modulo;
- la separacion mejore mantenibilidad real;
- no obligue a congelar disenos todavia inmaduros.

## 10. Estructura recomendada de una app Anastacio

```text
my-app/
  src/
    app/
      page.tsx
      layout.tsx
      admin/
        users/
          page.tsx
      customers/
        [id]/
          page.tsx
    shared/
      ui/
      lib/
      contracts/
  public/
  tests/
  anastacio.config.ts
  package.json
  tsconfig.json
  .anastacio/
    routes.manifest.json
    diagnostics.json
    project-context.md
```

La carpeta `features/` sigue siendo una direccion deseable, pero no debe ser
requisito del primer release del framework.

## 11. Comandos CLI por etapa

### Fase 1 - Runtime e inspeccion minima

- `anastacio dev`
- `anastacio build`
- `anastacio inspect`
- `anastacio inspect --json`

### Fase 2 - Diagnostico e introspeccion util

- `anastacio doctor`
- `anastacio graph` basico o experimental

### Fase 3 - Automatizacion segura

- `anastacio explain <target>`
- `anastacio generate route <route>`
- `anastacio generate feature <name>`

`anastacio preview` puede existir, pero no debe condicionar el alcance del
MVP si no agrega valor diferencial.

## 12. Contratos base

Los contratos deben definirse temprano porque seran la base de manifests,
CLI y futuras capacidades agent-first.

### Contrato de plugin

```ts
export interface AnastacioPlugin {
  name: string;
  setup?(context: FrameworkContext): Promise<void> | void;
  onConfigResolved?(config: AnastacioConfig): Promise<void> | void;
  onRoutesResolved?(routes: RouteDefinition[]): Promise<void> | void;
  onBuildStart?(ctx: BuildContext): Promise<void> | void;
  onBuildEnd?(result: BuildResult): Promise<void> | void;
  onDiagnostics?(report: DiagnosticReport): Promise<void> | void;
}
```

### Contrato de ruta

```ts
export interface RouteDefinition {
  path: string;
  file: string;
  layout?: string;
  dynamicParams?: string[];
  hasLoading?: boolean;
  hasErrorBoundary?: boolean;
  hasNotFound?: boolean;
}
```

### Contrato diagnostico minimo

```ts
export interface Diagnostic {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  file?: string;
  suggestion?: string;
}
```

## 13. Roadmap sugerido

### Fase 1 - Core utilizable

Objetivo:
tener una app corriendo y una primera capa de estructura visible.

Incluye:

- CLI minima;
- config loader;
- dev server;
- build pipeline;
- routing por archivos;
- `routes.manifest.json`;
- `inspect --json`.

### Fase 2 - Introspeccion util

Objetivo:
hacer que el framework explique el proyecto de forma util para humanos.

Incluye:

- `project-context.md`;
- `diagnostics.json`;
- `doctor`;
- grafo simple de dependencias;
- deteccion basica de ciclos.

### Fase 3 - Agent-first madura

Objetivo:
habilitar automatizacion segura con mejor contexto estructural.

Incluye:

- `explain <target>`;
- generadores iniciales;
- contratos de acciones;
- validaciones cruzadas mas fuertes;
- manifests mas ricos.

### Fase 4 - Capacidades avanzadas

Objetivo:
expandir el framework sin comprometer la claridad estructural.

Incluye:

- SSR opcional;
- prerender selectivo;
- data loading formal;
- optimizaciones por ruta.

## 14. Riesgos y mitigaciones

### Riesgo 1: perder foco

Si el MVP intenta cubrir runtime, actions, generators, graph rico y SSR,
la propuesta se diluye.

**Mitigacion:** priorizar estructura visible antes que amplitud funcional.

### Riesgo 2: agent-first superficial

Si no existen manifests utiles ni inspeccion real, el discurso agent-first
se vuelve solo narrativa.

**Mitigacion:** hacer de `inspect` y `doctor` features troncales.

### Riesgo 3: magia excesiva

Si las convenciones no se representan como datos, la experiencia pierde
explicabilidad.

**Mitigacion:** toda convencion importante debe reflejarse en manifests.

### Riesgo 4: separar paquetes demasiado pronto

Extraer paquetes con contratos inmaduros puede congelar malas decisiones.

**Mitigacion:** primero modulos internos con fronteras claras; despues
extraccion.

## 15. Decision recomendada

La direccion recomendada para Anastacio v2 es esta:

**framework React con introspeccion nativa como feature principal,
con core ligero y evolucion incremental hacia automatizacion segura.**

Eso permite:

- foco tecnico;
- valor diferencial real;
- arquitectura mas clara;
- mejor onboarding;
- una base creible para tooling agent-first.

## 16. Resumen ejecutivo

La propuesta original de v2 tiene una buena tesis, pero su MVP estaba
sobrecargado.

La version endurecida mantiene la ambicion y corrige el foco:

1. correr y compilar;
2. exponer estructura;
3. diagnosticar;
4. automatizar.

Anastacio v2 no debe ganar por cantidad de features.
Debe ganar por claridad estructural, inspeccion y evolucion segura.
