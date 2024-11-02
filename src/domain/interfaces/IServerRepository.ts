// src/domain/interfaces/IServerRepository.ts
import type { Server } from "../entities/Server.js";

export interface IServerRepository {
	create(server: Server): void;
	read(): Server[];
	update(server: Server): void;
	delete(server: Server): void;
}
