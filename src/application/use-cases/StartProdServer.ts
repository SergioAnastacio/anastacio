import http from "node:http";
import { ServerRepository } from "../../infrastructure/repositories/ServerRepository.js";
import { ServerService } from "../../domain/services/ServerService.js";
import { CreateServer } from "./CreateServer.js";
import { ServerController } from "../../presentation/controllers/ServerController.js";
import { FindFreePort } from "./FindFreePort.js";

interface StartAppOptions {
	port?: number;
}

export class StartProdServer {
	private httpServer?: http.Server;

	constructor(private options: StartAppOptions) {}

	public async execute(): Promise<void> {
		const serverRepository = new ServerRepository();
		const serverService = new ServerService(serverRepository);
		const createServer = new CreateServer(serverService);
		const serverController = new ServerController(createServer);

		const findFreePort = new FindFreePort();

		try {
			const freePort = await findFreePort.execute(this.options.port || 3000);

			this.httpServer = http.createServer(
				(req: http.IncomingMessage, res: http.ServerResponse): void => {
					if (req.method === "POST" && req.url === "/servers") {
						serverController.create(req, res);
					} else {
						serverController.handleStaticFiles(req, res);
					}
				},
			);

			this.httpServer.listen(freePort, (): void => {
				console.log(`Server running at http://localhost:${freePort}`);
			});

			// Manejar la terminación del proceso para cerrar los servidores
			process.on("SIGINT", () => this.closeServer());
			process.on("SIGTERM", () => this.closeServer());
		} catch (err) {
			console.error("Error finding free port:", err);
		}
	}

	public closeServer(): void {
		if (this.httpServer) {
			this.httpServer.close(() => {
				console.log("HTTP server closed");
			});
		}
	}
}
