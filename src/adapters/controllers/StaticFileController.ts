import type { IncomingMessage, ServerResponse } from "node:http";
import { compressResponse } from "./CompressResponse.js";
import { serveStaticAsset } from "../../infrastructure/webserver/serveStaticAsset.js";

export const staticFileController = (rootFolder: string) => {
	return async (req: IncomingMessage, res: ServerResponse) => {
		const parsedUrl = new URL(req.url || "/", `http://${req.headers.host}`);

		try {
			const asset = await serveStaticAsset(rootFolder, parsedUrl.pathname);
			const acceptEncoding = req.headers["accept-encoding"] || "";

			if (acceptEncoding.includes("gzip")) {
				compressResponse(res, asset.content, asset.contentType);
				return;
			}

			res.writeHead(200, { "Content-Type": asset.contentType });
			res.end(asset.content);
		} catch (error) {
			console.error("Error serving static asset:", error);
			res.writeHead(404, { "Content-Type": "text/html" });
			res.end("<h1>404 Not Found</h1>");
		}
	};
};
