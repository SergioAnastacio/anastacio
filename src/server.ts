// src/server.ts
import http from "node:http";
import { ServerRepository } from "./infrastructure/repositories/ServerRepository.js";
import { ServerService } from "./domain/services/ServerService.js";
import { CreateServer } from "./application/use-cases/CreateServer.js";
import { ServerController } from "./presentation/controllers/ServerController.js";

// Configurar el repositorio, servicio y casos de uso
const serverRepository = new ServerRepository();
const serverService = new ServerService(serverRepository);
const createServer = new CreateServer(serverService);
const serverController = new ServerController(createServer);

// Función para configurar el servidor HTTP
function createHttpServer() {
	return http.createServer((req, res) => {
		if (req.method === "POST" && req.url === "/servers") {
			serverController.create(req, res);
		} else {
			serverController.handleStaticFiles(req, res);
		}
	});
}

// Crear y configurar el servidor HTTP
const httpServer = createHttpServer();

// Iniciar el servidor HTTP
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
