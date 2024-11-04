// src/presentation/controllers/ProdController.ts
import type { StartProdServer } from "../../application/use-cases/StartProdServer.js";

export class ProdController {
	constructor(private startProdServer: StartProdServer) {}

	public async start(): Promise<void> {
		await this.startProdServer.execute();
	}

	public close(): void {
		this.startProdServer.closeServer();
	}
}
