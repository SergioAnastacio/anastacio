// src/domain/services/ServerService.ts
import type { IServerRepository } from "../interfaces/IServerRepository.js";
import { Server } from "../entities/Server.js";

export class ServerService {
	constructor(private serverRepository: IServerRepository) {}

	public createServer(name: string, port: number): Server {
		const server = new Server(Date.now().toString(), name, port);
		this.serverRepository.create(server);
		return server;
	}

	public changeServerPort(serverId: string, newPort: number): void {
		const server = this.serverRepository.read().find((s) => s.id === serverId);
		if (!server) {
			throw new Error("Server not found");
		}
		server.changePort(newPort);
		this.serverRepository.update(server);
	}
}
