import { createFrameworkContext } from "../core/index.js";
import { HttpServer } from "../infrastructure/webserver/HttpServer.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";

interface startAppOptions {
	port?: number;
	root?: string;
}
export async function startApp(options: startAppOptions): Promise<void> {
	const framework = await createFrameworkContext(options.root ?? process.cwd());
	const { config } = framework;
	const mode = ServerMode.Production;
	const server = new HttpServer(config, mode, {
		port: options.port,
	});
	server.start(); //Llamamos su metodo start
	//Procesar las señales de terminacion
	process.on("SIGINT", () => server.handleSessionStop("SIGINT"));
	process.on("SIGTERM", () => server.handleSessionStop("SIGTERM"));
}
