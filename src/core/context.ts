import { loadAnastacioConfig } from "./config/index.js";
import { resolveRoutes } from "../router/index.js";
import type { AnastacioConfig, RouteDefinition } from "../shared/contracts/index.js";

export interface AnastacioFrameworkContext {
	rootDir: string;
	config: AnastacioConfig;
	routes: RouteDefinition[];
}

export async function createFrameworkContext(
	projectRoot = process.cwd(),
): Promise<AnastacioFrameworkContext> {
	const config = await loadAnastacioConfig(projectRoot);
	const routes = resolveRoutes(config);

	return {
		rootDir: config.rootDir,
		config,
		routes,
	};
}
