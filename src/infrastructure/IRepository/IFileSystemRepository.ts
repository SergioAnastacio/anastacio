// src/Infrastructure/IRepository/IFileSystemRepository.ts
export interface IFileSystemRepository {
	readFile(filePath: string): Promise<Buffer>;
	getContentType(filePath: string): string;
}
