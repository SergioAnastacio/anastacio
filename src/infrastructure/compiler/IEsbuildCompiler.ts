// src/infrastructure/compiler/IEsbuildCompiler.ts

import type { AnastacioConfig } from "../../shared/contracts/index.js";
import type { ServerMode } from "../webserver/ServerMode.js";

export interface IEsbuildCompiler {
	config: AnastacioConfig;
	entryPoints: string[];
	outfile: string;
	mode: ServerMode;
	compile(): Promise<void>;
}
