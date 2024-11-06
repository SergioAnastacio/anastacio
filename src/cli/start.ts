import { HttpServer } from "../infrastructure/webserver/HttpServer.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";

interface startAppOptions {
	port: number;
}
export async function startApp(options: startAppOptions): Promise<void> {
	//Configuracion del server
	const hostname = "127.0.0.1"; // o localhost
	const port = options.port;
	const wsPort = 3001;
	const mode = ServerMode.Production;
	// Instanciar el server
	const server = new HttpServer(hostname, port, wsPort, mode);
	server.start(); //Llamamos su metodo start
	//Procesar las señales de terminacion
	process.on("SIGINT", () => server.handleSessionStop("SIGINT"));
	process.on("SIGTERM", () => server.handleSessionStop("SIGTERM"));
}
