import type { ServerMode } from "./ServerMode.js";

// src/Infrastructure/webserver/IHttpServer.ts
export interface IHttpServer {
	hostname: string;
	port: number;
	mode: ServerMode;
	init(): void;
	start(): void;
	notifyClients(): void;
	closeServers(): void;
	handleSessionStop(signal: string): void;
}
