import { HttpServer } from "../infrastructure/webserver/HttpServer.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";
import { createFrameworkContext } from "../core/index.js";

interface DevAppOptions {
	port?: number;
	root?: string;
}

export async function devApp(options: DevAppOptions): Promise<void> {
	const framework = await createFrameworkContext(options.root ?? process.cwd());
	const { config } = framework;
	const mode = ServerMode.Development;
	const server = new HttpServer(config, mode, {
		port: options.port,
	});
	server.start(); //Llamamos su metodo start

	//Procesar las señales de terminacion
	process.on("SIGINT", () => server.handleSessionStop("SIGINT"));
	process.on("SIGTERM", () => server.handleSessionStop("SIGTERM"));
}
