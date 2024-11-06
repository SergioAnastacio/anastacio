// src/Infrastructure/Repository/ServerRepository.ts
import type { IServerRepository } from "../IRepository/IServerRepository.js";
import type { Server } from "../../dominio/entities/Server.js";

export class ServerRepository implements IServerRepository {
	private servers: Server[] = [];

	addServer(server: Server): void {
		this.servers.push(server);
	}

	getServers(): Server[] {
		return this.servers;
	}
}
