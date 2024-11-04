#!/usr/bin/env node

import { StartDevServer } from "../application/use-cases/StartDevServer.js";
import { DevController } from "../presentation/controllers/DevController.js";

interface DevAppOptions {
	port?: number;
}

export async function devApp(options: DevAppOptions): Promise<void> {
	const startDevServer = new StartDevServer(options);
	const devController = new DevController(startDevServer);

	try {
		await devController.start();
	} catch (err) {
		console.error("Failed to start dev server:", err);
	}

	// Escuchar señales de terminación para cerrar los servidores
	process.on("SIGINT", () => {
		devController.close();
		process.exit();
	});
	process.on("SIGTERM", () => {
		devController.close();
		process.exit();
	});
}

