import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createFrameworkContext } from "../core/index.js";
import { writeRoutesManifest } from "../router/index.js";
import type {
	AnastacioConfig,
	RouteDefinition,
} from "../shared/contracts/index.js";

export interface InspectionReport {
	rootDir: string;
	paths: {
		appDir: string;
		entryFile: string;
		outDir: string;
		internalDir: string;
	};
	artifacts: {
		routesManifest: string;
		projectContext: string;
	};
	routes: RouteDefinition[];
}

export async function inspectProject(
	projectRoot = process.cwd(),
): Promise<InspectionReport> {
	const framework = await createFrameworkContext(projectRoot);
	const { config, routes } = framework;
	const routesManifestPath = writeRoutesManifest(config, routes);
	const projectContextPath = writeProjectContext(config, routes);

	return {
		rootDir: config.rootDir,
		paths: {
			appDir: toProjectRelative(config.rootDir, config.paths.appDir),
			entryFile: toProjectRelative(config.rootDir, config.paths.entryFile),
			outDir: toProjectRelative(config.rootDir, config.paths.outDir),
			internalDir: toProjectRelative(config.rootDir, config.paths.internalDir),
		},
		artifacts: {
			routesManifest: toProjectRelative(config.rootDir, routesManifestPath),
			projectContext: toProjectRelative(config.rootDir, projectContextPath),
		},
		routes,
	};
}

export function formatInspectionReport(report: InspectionReport): string {
	const lines = [
		"Anastacio Inspect",
		`root: ${report.rootDir}`,
		`appDir: ${report.paths.appDir}`,
		`entryFile: ${report.paths.entryFile}`,
		`outDir: ${report.paths.outDir}`,
		`routes: ${report.routes.length}`,
		`routes.manifest.json: ${report.artifacts.routesManifest}`,
		`project-context.md: ${report.artifacts.projectContext}`,
	];

	if (report.routes.length === 0) {
		lines.push("No routes were detected.");
		return lines.join("\n");
	}

	lines.push("");
	for (const route of report.routes) {
		lines.push(
			`${route.path} -> ${route.file}${route.layout ? ` [layout: ${route.layout}]` : ""}`,
		);
	}

	return lines.join("\n");
}

function writeProjectContext(
	config: AnastacioConfig,
	routes: RouteDefinition[],
): string {
	mkdirSync(config.paths.internalDir, { recursive: true });

	const outputPath = join(config.paths.internalDir, "project-context.md");
	const lines = [
		"# Anastacio Project Context",
		"",
		"## Structure",
		"",
		`- root: \`${config.rootDir}\``,
		`- appDir: \`${toProjectRelative(config.rootDir, config.paths.appDir)}\``,
		`- entryFile: \`${toProjectRelative(config.rootDir, config.paths.entryFile)}\``,
		`- outDir: \`${toProjectRelative(config.rootDir, config.paths.outDir)}\``,
		"",
		"## Routes",
		"",
	];

	if (routes.length === 0) {
		lines.push("- No routes detected.");
	} else {
		for (const route of routes) {
			const details = [
				`path: \`${route.path}\``,
				`file: \`${route.file}\``,
				...(route.layout ? [`layout: \`${route.layout}\``] : []),
				...(route.dynamicParams?.length
					? [`params: \`${route.dynamicParams.join(", ")}\``]
					: []),
			];
			lines.push(`- ${details.join(" | ")}`);
		}
	}

	lines.push("");
	lines.push("## Conventions");
	lines.push("");
	lines.push(
		`- File-based routing under \`${toProjectRelative(config.rootDir, config.paths.appDir)}\` by default.`,
	);
	lines.push("- Layout inheritance uses the nearest `layout.tsx`.");
	lines.push("- Route manifests are written to `.anastacio/`.");

	writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

	return outputPath;
}

function toProjectRelative(projectRoot: string, filePath: string): string {
	return normalizePath(relative(projectRoot, filePath));
}

function normalizePath(value: string): string {
	return value.split(sep).join("/");
}
