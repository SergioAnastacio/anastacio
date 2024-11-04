#!/usr/bin/env node

import { StartProdServer } from "../application/use-cases/StartProdServer.js";
import { ProdController } from "../presentation/controllers/ProdController.js";

interface StartAppOptions {
	port?: number;
}

export async function startApp(options: StartAppOptions): Promise<void> {
	const startProdServer = new StartProdServer(options);
	const prodController = new ProdController(startProdServer);

	try {
		await prodController.start();
	} catch (err) {
		console.error("Failed to start prod server:", err);
	}

	// Escuchar señales de terminación para cerrar los servidores
	process.on("SIGINT", () => {
		prodController.close();
		process.exit();
	});
	process.on("SIGTERM", () => {
		prodController.close();
		process.exit();
	});
}

