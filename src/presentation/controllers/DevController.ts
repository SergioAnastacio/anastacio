// src/presentation/controllers/DevController.ts
import type { StartDevServer } from "../../application/use-cases/StartDevServer.js";

export class DevController {
	constructor(private startDevServer: StartDevServer) {}

	public async start(): Promise<void> {
		await this.startDevServer.execute();
	}

	public close(): void {
		this.startDevServer.closeServers();
	}
}
