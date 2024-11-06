// src/adapters/controllers/ServerController.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { CreateServer } from "../../applications/use-cases/CreateServer.js";
import { ServerRepository } from "../../infrastructure/Repository/ServerRepository.js";

const serverRepository = new ServerRepository();
const createServer = new CreateServer(serverRepository);

export const serverController = (req: IncomingMessage, res: ServerResponse) => {
	if (req.method === "POST" && req.url === "/create-server") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			const { hostname, port } = JSON.parse(body);
			createServer.execute(hostname, port);
			res.writeHead(201, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: "Server created successfully" }));
		});
	} else {
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ message: "Not Found" }));
	}
};
