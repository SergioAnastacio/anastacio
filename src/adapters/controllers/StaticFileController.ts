// src/adapters/controllers/StaticFileController.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { ServeStaticFile } from "../../applications/use-cases/ServeStaticFiles.js";
import { FileSystemRepository } from "../../infrastructure/Repository/FileSystemRepository.js";
import path from "node:path";
import { compressResponse } from "./CompressResponse.js";
import { join } from "node:path";

const fileSystemRepository = new FileSystemRepository();
const serveStaticFile = new ServeStaticFile(fileSystemRepository);

export const staticFileController = async (
	req: IncomingMessage,
	res: ServerResponse,
) => {
	const parsedUrl = new URL(req.url || "", `http://${req.headers.host}`);
	const filePath =
		parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
	const rootFolder = join(process.cwd(), "dist");
	const fullPath = path.join(rootFolder, filePath);

	try {
		const file = await serveStaticFile.execute(fullPath);
		const acceptEncoding = req.headers["accept-encoding"] || "";
		if (acceptEncoding.includes("gzip")) {
			compressResponse(res, file.content, file.contentType);
		} else {
			res.writeHead(200, { "Content-Type": file.contentType });
			res.end(file.content);
		}
	} catch (error) {
		// Si no se encuentra el archivo, servir index.html para permitir que React maneje las rutas
		const indexPath = path.join(rootFolder, "index.html");
		try {
			const indexFile = await serveStaticFile.execute(indexPath);
			const acceptEncoding = req.headers["accept-encoding"] || "";
			if (acceptEncoding.includes("gzip")) {
				compressResponse(res, indexFile.content, indexFile.contentType);
			} else {
				res.writeHead(200, { "Content-Type": indexFile.contentType });
				res.end(indexFile.content);
			}
		} catch (indexError) {
			res.writeHead(404, { "Content-Type": "text/html" });
			res.end("<h1>404 Not Found</h1>");
		}
	}
};
