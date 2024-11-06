import { HttpServer } from "../infrastructure/webserver/HttpServer.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";

interface DevAppOptions {
	port: number;
}

export async function devApp(options: DevAppOptions): Promise<void> {
	//Instanciar un servidor en modo desarollo
	//Configuracion
	const hostname = "127.0.0.1"; // o localhost
	const port = options.port;
	const wsPort = 3001;
	const mode = ServerMode.Development;
	//Instanciar el server
	const server = new HttpServer(hostname, port, wsPort, mode);
	server.start(); //Llamamos su metodo start

	//Procesar las señales de terminacion
	process.on("SIGINT", () => server.handleSessionStop("SIGINT"));
	process.on("SIGTERM", () => server.handleSessionStop("SIGTERM"));
}
