// src/infrastructure/websocket/HotReloadServer.ts
import { WebSocketServer } from "ws";

export class HotReloadServer {
	private wss: WebSocketServer;

	// Crear un servidor WebSocket en el puerto especificado
	constructor(port: number) {
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
}
