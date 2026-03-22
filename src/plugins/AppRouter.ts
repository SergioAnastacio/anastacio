import type { Plugin } from "esbuild";
import { existsSync, mkdirSync } from "node:fs";
import { relative } from "node:path";
import {
	resolveRoutes,
	writeGeneratedAppRouter,
	writeRoutesManifest,
} from "../router/index.js";
import type { AnastacioConfig } from "../shared/contracts/index.js";

export const RouterPlugin = (config: AnastacioConfig): Plugin => ({
	name: "router-plugin",
	setup(build) {
		build.onStart(() => {
			if (!existsSync(config.paths.appDir)) {
				throw new Error(
					`The app directory does not exist: ${relative(config.rootDir, config.paths.appDir)}.`,
				);
			}

			if (!existsSync(config.paths.srcDir)) {
				mkdirSync(config.paths.srcDir, { recursive: true });
			}

			const routes = resolveRoutes(config);
			writeRoutesManifest(config, routes);
			writeGeneratedAppRouter(config, routes);
		});
	},
});
