// src/applications/use-cases/ServeStaticFile.ts
import type { IFileSystemRepository } from "../../infrastructure/IRepository/IFileSystemRepository.js";
import { File } from "../../dominio/entities/File.js";
import path from "node:path";

export class ServeStaticFile {
	constructor(private fileSystemRepository: IFileSystemRepository) {}

	async execute(filePath: string): Promise<File> {
		const fileContent = await this.fileSystemRepository.readFile(filePath);
		const contentType = this.fileSystemRepository.getContentType(filePath);
		return new File(filePath, fileContent, contentType);
	}

	async serveFileOrIndex(filePath: string, rootFolder: string): Promise<File> {
		try {
			return await this.execute(filePath);
		} catch (error) {
			if ((error as { code: string }).code === "ENOENT") {
				const indexPath = path.join(rootFolder, "index.html");
				return await this.execute(indexPath);
			}
			throw error;
		}
	}
}
