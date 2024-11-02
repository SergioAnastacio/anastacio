// src/infrastructure/repositories/ServerRepository.ts
import type { IServerRepository } from "../../domain/interfaces/IServerRepository.js";
import type { Server } from "../../domain/entities/Server.js";

export class ServerRepository implements IServerRepository {
	private servers: Server[] = [];

	public create(server: Server): void {
		this.servers.push(server);
	}

	public read(): Server[] {
		return this.servers;
	}

	public update(server: Server): void {
		const index = this.servers.findIndex((s) => s.id === server.id);
		if (index !== -1) {
			this.servers[index] = server;
		}
	}

	public delete(server: Server): void {
		this.servers = this.servers.filter((s) => s.id !== server.id);
	}
}
