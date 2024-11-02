#!/usr/bin/env node

import http from "node:http";
import { ServerRepository } from "../infrastructure/repositories/ServerRepository.js";
import { ServerService } from "../domain/services/ServerService.js";
import { CreateServer } from "../application/use-cases/CreateServer.js";
import { ServerController } from "../presentation/controllers/ServerController.js";

interface StartAppOptions {
	port?: number;
}

export function startApp(options: StartAppOptions): void {
	const serverRepository = new ServerRepository();
	const serverService = new ServerService(serverRepository);
	const createServer = new CreateServer(serverService);
	const serverController = new ServerController(createServer);

	const server = http.createServer(
		(req: http.IncomingMessage, res: http.ServerResponse) => {
			if (req.method === "POST" && req.url === "/servers") {
				serverController.create(req, res);
			} else {
				serverController.handleStaticFiles(req, res);
			}
		},
	);

	const PORT = options.port || 3000;
	server.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});
}
