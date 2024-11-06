// src/dominio/entities/File.ts
export class File {
	constructor(
		public path: string,
		public content: Buffer,
		public contentType: string,
	) {}
}
