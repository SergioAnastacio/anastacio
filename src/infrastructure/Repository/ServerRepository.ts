// src/Infrastructure/Repository/ServerRepository.ts

import type { Server } from "../../dominio/entities/Server.js";
import type { IServerRepository } from "../IRepository/IServerRepository.js";

export class ServerRepository implements IServerRepository {
	private servers: Server[] = [];

	addServer(server: Server): void {
		this.servers.push(server);
	}

	getServers(): Server[] {
		return this.servers;
	}
}
