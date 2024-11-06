// src/infrastructure/compiler/IEsbuildCompiler.ts

import type { ServerMode } from "../webserver/ServerMode.js";

export interface IEsbuildCompiler {
	entryPoints: string[];
	outdir: string;
	mode: ServerMode;
	compile(): void;
}
