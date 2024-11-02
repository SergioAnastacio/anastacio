

>[!IMPORTANT] Version BETA Actualmente en Desarollo
> La version BETA esta en pruebas y pronto se pasara a RC

# Anastacio
[![npm version](https://img.shields.io/npm/v/anastacio-beta.svg)](https://www.npmjs.com/package/anastacio-beta
)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/SergioAnastacio/anastacio/main.yml)

Anastacio es un framework para la creación de aplicaciones en React + Typescript  y APIS con Express.js + Typescript.


## Estructura del Proyecto
La estructura del proyecto sigue el patrón de arquitectura limpia y se divide en las siguientes capas:
```
anastacio/ 
├── src/ 
│   ├── application/ 
│   ├── use-cases/ 
│   │   └── CreateServer.ts 
│   ├── bin/ 
│   │   └── cli.ts 
│   ├── cli/ 
│   │   ├── build.ts 
│   │   ├── dev.ts 
│   │   └── start.ts 
│   ├── domain/ 
│   │   ├── entities/ 
│   │   │   └── Server.ts 
│   │   ├── interfaces/ 
│   │   │   └── IServerRepository.ts 
│   │   └── services/ 
│   │       └── ServerService.ts 
│   ├── infrastructure/ 
│   │   └── repositories/ 
│   │       └── ServerRepository.ts 
│   ├── presentation/ 
│   │   └── controllers/ 
│   │       └── ServerController.ts 
│   └── server.ts 
├── package.json 
├── README.md 
├── tsconfig-paths.json 
└── tsconfig.json

```
- **Dominio**: Contiene las reglas de negocio y lógica de la aplicación.
- **Infraestructura**: Incluye la configuración de la base de datos, servidores y otros servicios externos.
- **Aplicación**: Maneja la lógica de la aplicación, casos de uso y servicios.
- **Presentación**: Gestiona la interfaz de usuario y la interacción con el cliente.


## Instalación

Para instalar el framework usa el siguiente comando de NPX:

```bash
    npx create-anastacio-app myapp
```

## Uso

>[!NOTE] Uso de el comando Node  en la Version 22.10.0
> Puedes usar el comando 
> ```bash
>   node --run script
> ```
Para instalar las dependencias del proyecto, ejecute el siguiente comando:

### Start
Para iniciar el servidor, utilice el siguiente comando:

```bash
    node --run start
```
### Dev
Para iniciar el servidor, de desarollo utilice el siguiente comando:

```bash
    node --run dev
```
### Build

Para compilar el proyecto, utiliza el siguiente comando:
### Test
Para ejecutar las pruebas, utiliza el siguiente comando:
### Test coverage
Para generar un informe de cobertura de pruebas, utiliza el siguiente comando:
### Test E2E
Para ejecutar pruebas end-to-end, utiliza el siguiente comando:
### Lint
Para analizar el código en busca de errores y problemas de estilo, utiliza el siguiente comando:
### Formatt
Para formatear el código, utiliza el siguiente comando:

## Contribución

Si desea contribuir a este proyecto, por favor siga los siguientes pasos:

1. Haga un fork del repositorio.
2. Cree una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realice los cambios necesarios y haga commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Empuje los cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5. Cree un Pull Request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulte el archivo `LICENSE` para obtener más detalles.

## Características

- **Modularidad**: Estructura modular que facilita la escalabilidad y el mantenimiento.
- **TypeScript**: Escrito en TypeScript para aprovechar sus características de tipado estático.
- **Arquitectura Limpia**: Sigue el patrón de arquitectura limpia para una separación clara de responsabilidades.
- **Facilidad de Uso**: Comandos simples para iniciar, desarrollar y construir el proyecto.

## Requisitos
>[!WARNING] Error con Node 23.0
>  Existe un error con Node 23.0  que no permite usar el comando npx Recomendamos usar la version 22.10.0
- Node.js >= v22.10.0 
- npm >= 10.9.0

## Documentación

> [!CAUTION] Documentacion incompleta
> Documentacion en Camino ... cuando se termine de desarollar el core.

Para más detalles sobre cómo utilizar Anastacio, por favor consulte la [documentación oficial](https://example.com/docs).

## Roadmap

- [ ] Completar la documentación
- [ ] Añadir más pruebas unitarias
- [ ] Mejorar la cobertura de pruebas E2E
- [ ] Implementar nuevas características solicitadas por la comunidad

## Agradecimientos

Agradecemos a todos los contribuyentes y a la comunidad por su apoyo y colaboración en el desarrollo de Anastacio.
