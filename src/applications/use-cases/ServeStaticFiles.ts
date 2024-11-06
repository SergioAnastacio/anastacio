// src/applications/use-cases/ServeStaticFile.ts
import type { IFileSystemRepository } from "../../infrastructure/IRepository/IFileSystemRepository.js";
import { File } from "../../dominio/entities/File.js";

export class ServeStaticFile {
	constructor(private fileSystemRepository: IFileSystemRepository) {}

	async execute(filePath: string): Promise<File> {
		const fileContent = await this.fileSystemRepository.readFile(filePath);
		const contentType = this.fileSystemRepository.getContentType(filePath);
		return new File(filePath, fileContent, contentType);
	}
}
