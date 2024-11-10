import type { IncomingMessage, ServerResponse } from "node:http";
import { ServeStaticFile } from "../../applications/use-cases/ServeStaticFiles.js";
import { FileSystemRepository } from "../../infrastructure/Repository/FileSystemRepository.js";
import path from "node:path";
import { compressResponse } from "./CompressResponse.js";
import fs from "node:fs/promises";

const fileSystemRepository = new FileSystemRepository();
const serveStaticFile = new ServeStaticFile(fileSystemRepository);

export const staticFileController = (rootFolder: string) => {
	return async (req: IncomingMessage, res: ServerResponse) => {
		const parsedUrl = new URL(req.url || "", `http://${req.headers.host}`);
		const filePath =
			parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
		const fullPath = path.join(rootFolder, filePath);

		try {
			// Verificar si el archivo existe
			await fs.access(fullPath);
			const file = await serveStaticFile.execute(fullPath);
			const acceptEncoding = req.headers["accept-encoding"] || "";
			if (acceptEncoding.includes("gzip")) {
				compressResponse(res, file.content, file.contentType);
			} else {
				res.writeHead(200, { "Content-Type": file.contentType });
				res.end(file.content);
			}
		} catch (error) {
			if ((error as { code: string }).code === "ENOENT") {
				// Si el archivo no existe, servir index.html
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
					console.error("Error:", indexError);
					res.writeHead(404, { "Content-Type": "text/html" });
					res.end("<h1>404 Not Found</h1>");
				}
			} else {
				console.error("Error:", error);
				res.writeHead(404, { "Content-Type": "text/html" });
				res.end("<h1>404 Not Found</h1>");
			}
		}
	};
};
