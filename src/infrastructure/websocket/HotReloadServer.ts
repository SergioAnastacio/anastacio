// src/infrastructure/websocket/HotReloadServer.ts
import { WebSocketServer } from "ws";

export class HotReloadServer {
	private wss: WebSocketServer;
	private currentPort: number;

	// Crear un servidor WebSocket en el puerto especificado
	constructor(port: number) {
		this.currentPort = port;
		this.wss = new WebSocketServer({ port });
		this.wss.on("connection", (_ws) => {
			console.log(`Client connected for hot-reload on port ${port}`);
		});
	}

	// Notificar a los clientes conectados que deben recargar la página
	public notifyClients() {
		for (const client of this.wss.clients) {
			if (client.readyState === client.OPEN) {
				client.send("reload");
			}
		}
	}

	// Cerrar el servidor WebSocket
	public close() {
		this.wss.close(() => {
			console.log("WebSocket server closed");
		});
	}

	// Cambiar el puerto del servidor WebSocket
	public async changePort(newPort: number) {
		this.close();
		this.currentPort = newPort;
		this.wss = new WebSocketServer({ port: newPort });
		this.wss.on("connection", (_ws) => {
			console.log(`Client connected for hot-reload on port ${newPort}`);
		});
		console.log(`WebSocket server port changed to ${newPort}`);
	}
}
