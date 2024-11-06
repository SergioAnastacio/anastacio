// src/dominio/Ientities/IFile.ts
export interface IFile {
	path: string;
	content: Buffer;
	contentType: string;
}
