# Anastacio v2 - Fase 1 a tareas

## Objetivo de Fase 1

Construir un core utilizable que permita:

- correr una app con `anastacio dev`;
- compilar con `anastacio build`;
- resolver rutas por archivos;
- generar `routes.manifest.json`;
- exponer `inspect --json`.

## Resultado esperado

Al cierre de Fase 1, un proyecto minimo debe poder arrancar, compilarse e
informar su estructura de rutas sin ambiguedad.

## Backlog tecnico

### 1. Definir el modelo base del framework

- Crear tipos base para config, rutas, manifests y diagnosticos minimos.
- Definir la interfaz de plugin y el contexto compartido del framework.
- Separar los contratos serializables en un modulo `shared`.

Entregable:
- tipos y contratos base en codigo;
- estructura interna clara para `core`, `router` e `inspector`.

### 2. Introducir un config loader minimo

- Definir `anastacio.config.ts` como entrada oficial.
- Implementar carga con defaults claros.
- Validar errores de configuracion con mensajes accionables.

Entregable:
- loader funcional;
- contrato tipado de configuracion;
- fallback cuando no exista config.

### 3. Endurecer la CLI minima

- Consolidar `dev`, `build` e `inspect` como comandos oficiales.
- Separar parsing de argumentos de la logica de ejecucion.
- Asegurar salidas legibles para humano y JSON cuando aplique.

Entregable:
- CLI consistente;
- contrato minimo para opciones;
- punto de entrada estable para nuevas capacidades.

### 4. Reorganizar el pipeline de compilacion

- Separar responsabilidades de `compiler` y `dev server`.
- Eliminar supuestos duros del repo que hoy mezclan framework con app.
- Hacer que el build consuma config y puntos de entrada definidos.

Entregable:
- pipeline de build con fronteras mas limpias;
- menor acoplamiento entre runtime y estructura del repo.

### 5. Formalizar el router por archivos

- Definir reglas para `page`, `layout`, rutas dinamicas y rutas index.
- Reemplazar heuristicas fragiles por un modelo `RouteDefinition`.
- Generar rutas desde disco de forma deterministica.

Entregable:
- router estable;
- contrato de ruta;
- casos base soportados.

### 6. Generar `routes.manifest.json`

- Serializar rutas resueltas al directorio `.anastacio/`.
- Incluir path, archivo fuente, layout y parametros dinamicos.
- Asegurar que el manifest sea estable entre ejecuciones.

Entregable:
- manifest util y versionable;
- base para `inspect`.

### 7. Implementar `inspect`

- Leer el modelo de rutas y exponer salida para humano.
- Agregar `--json` con formato estable.
- Dejar preparado el camino para futuros manifests.

Entregable:
- `anastacio inspect`
- `anastacio inspect --json`

### 8. Preparar `project-context.md` minimo

- Generar un resumen de estructura del proyecto.
- Incluir rutas detectadas, convenciones activas y observaciones basicas.
- Mantener el formato simple y legible.

Entregable:
- primer artefacto narrativo generado por el framework.

### 9. Introducir diagnosticos minimos

- Detectar archivos requeridos faltantes.
- Detectar rutas invalidas o colisiones simples.
- Emitir una estructura base para futuros reportes.

Entregable:
- base de `diagnostics.json`;
- insumos para un `doctor` simple en Fase 2.

### 10. Crear fixture o app de ejemplo

- Separar claramente framework y app de prueba.
- Mover ejemplos a `examples/` o `fixtures/`.
- Validar el flujo real de `dev`, `build` e `inspect` sobre esa app.

Entregable:
- ejemplo minimo reproducible;
- menor confusion entre codigo del framework y codigo de app.

## Orden recomendado de ejecucion

1. modelo base del framework
2. config loader
3. CLI minima
4. pipeline de build
5. router por archivos
6. `routes.manifest.json`
7. `inspect --json`
8. `project-context.md`
9. diagnosticos minimos
10. fixture de ejemplo y validacion

## Criterios de cierre de Fase 1

- existe una configuracion minima estable;
- `dev` y `build` funcionan sobre una app de ejemplo;
- el router genera una salida deterministica;
- `routes.manifest.json` se escribe en `.anastacio/`;
- `inspect --json` expone informacion util y estable;
- el repo ya no mezcla tanto codigo del framework con supuestos de una app.
