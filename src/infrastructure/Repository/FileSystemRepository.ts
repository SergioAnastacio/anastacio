// src/Infrastructure/Repository/FileSystemRepository.ts
import type { IFileSystemRepository } from "../IRepository/IFileSystemRepository.js";
import fs from "node:fs/promises";
import path from "node:path";

export class FileSystemRepository implements IFileSystemRepository {
	async readFile(filePath: string): Promise<Buffer> {
		return fs.readFile(filePath);
	}

	getContentType(filePath: string): string {
		const extname = path.extname(filePath);
		const mimeTypes: { [key: string]: string } = {
			".html": "text/html",
			".js": "text/javascript",
			".css": "text/css",
			".png": "image/png",
			".jpg": "image/jpeg",
			".gif": "image/gif",
			".svg": "image/svg+xml",
			".ico": "image/x-icon",
		};
		return mimeTypes[extname] || "application/octet-stream";
	}
}
