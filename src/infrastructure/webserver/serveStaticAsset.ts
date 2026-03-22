import fs from "node:fs/promises";
import path from "node:path";

export interface StaticAsset {
	filePath: string;
	content: Buffer;
	contentType: string;
}

export async function serveStaticAsset(
	rootFolder: string,
	requestPath: string,
): Promise<StaticAsset> {
	const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
	const resolvedPath = path.join(rootFolder, normalizedPath);

	try {
		return await readStaticAsset(resolvedPath);
	} catch (error) {
		if ((error as { code?: string }).code !== "ENOENT") {
			throw error;
		}

		return readStaticAsset(path.join(rootFolder, "index.html"));
	}
}

async function readStaticAsset(filePath: string): Promise<StaticAsset> {
	const content = await fs.readFile(filePath);
	return {
		filePath,
		content,
		contentType: getContentType(filePath),
	};
}

function getContentType(filePath: string): string {
	switch (path.extname(filePath).toLowerCase()) {
		case ".html":
			return "text/html";
		case ".js":
			return "text/javascript";
		case ".css":
			return "text/css";
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".gif":
			return "image/gif";
		case ".svg":
			return "image/svg+xml";
		case ".ico":
			return "image/x-icon";
		case ".webp":
			return "image/webp";
		case ".avif":
			return "image/avif";
		case ".json":
			return "application/json";
		default:
			return "application/octet-stream";
	}
}
