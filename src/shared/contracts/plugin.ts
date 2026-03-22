import type { AnastacioConfig } from "./config.js";
import type { DiagnosticReport } from "./diagnostics.js";
import type { RouteDefinition } from "./routes.js";

export interface FrameworkContext {
	projectRoot: string;
	config: AnastacioConfig;
}

export interface BuildContext extends FrameworkContext {
	mode: string;
	entryPoints: string[];
	outfile: string;
}

export interface BuildResult {
	mode: string;
	outfile: string;
}

export interface AnastacioPlugin {
	name: string;
	setup?(context: FrameworkContext): Promise<void> | void;
	onConfigResolved?(config: AnastacioConfig): Promise<void> | void;
	onRoutesResolved?(routes: RouteDefinition[]): Promise<void> | void;
	onBuildStart?(ctx: BuildContext): Promise<void> | void;
	onBuildEnd?(result: BuildResult): Promise<void> | void;
	onDiagnostics?(report: DiagnosticReport): Promise<void> | void;
}
