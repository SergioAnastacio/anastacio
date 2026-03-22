import type { ServerMode } from "./ServerMode.js";

// src/Infrastructure/webserver/IHttpServer.ts
export interface IHttpServer {
	hostname: string;
	port: number;
	mode: ServerMode;
	init(): Promise<void>;
	start(): void;
	notifyClients(): void;
	closeServers(): void;
	handleSessionStop(signal: string): Promise<void>;
}
