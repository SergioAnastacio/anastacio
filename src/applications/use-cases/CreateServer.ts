// src/applications/use-cases/CreateServer.ts
import { Interface } from "node:readline";
import { Server } from "../../dominio/entities/Server.js";
import type { IServerRepository } from "../../infrastructure/IRepository/IServerRepository.js";

interface ICreateServer {
	hostname: string;
	port: number;
	mode: "development" | "production";
}
export class CreateServer {
	constructor(private serverRepository: IServerRepository) {}

	execute(hostname: string, port: number): void {
		const server = new Server(hostname, port);
		this.serverRepository.addServer(server);
	}
}
