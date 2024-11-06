// src/Infrastructure/IRepository/IServerRepository.ts
import type { Server } from "../../dominio/entities/Server.js";

export interface IServerRepository {
	addServer(server: Server): void;
	getServers(): Server[];
}
