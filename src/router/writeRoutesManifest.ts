import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type {
	AnastacioConfig,
	RouteDefinition,
	RoutesManifest,
} from "../shared/contracts/index.js";

export function writeRoutesManifest(
	config: AnastacioConfig,
	routes: RouteDefinition[],
): string {
	mkdirSync(config.paths.internalDir, { recursive: true });

	const manifestPath = join(config.paths.internalDir, "routes.manifest.json");
	const manifest: RoutesManifest = {
		kind: "routes-manifest",
		version: 1,
		appDir: normalizePath(relative(config.rootDir, config.paths.appDir)),
		routes,
	};

	writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

	return manifestPath;
}

function normalizePath(value: string): string {
	return value.split(sep).join("/");
}
