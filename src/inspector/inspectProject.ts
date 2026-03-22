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
	summary: {
		routeCount: number;
		dynamicRouteCount: number;
		layoutCount: number;
		routesWithLoading: number;
		routesWithErrorBoundary: number;
		routesWithNotFound: number;
	};
	conventions: string[];
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
	const summary = buildSummary(routes);
	const conventions = buildConventions(config);

	return {
		rootDir: config.rootDir,
		paths: {
			appDir: toProjectRelative(config.rootDir, config.paths.appDir),
			entryFile: toProjectRelative(config.rootDir, config.paths.entryFile),
			outDir: toProjectRelative(config.rootDir, config.paths.outDir),
			internalDir: toProjectRelative(config.rootDir, config.paths.internalDir),
		},
		summary,
		conventions,
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
		`routes: ${report.summary.routeCount}`,
		`dynamicRoutes: ${report.summary.dynamicRouteCount}`,
		`layouts: ${report.summary.layoutCount}`,
		`routesWithLoading: ${report.summary.routesWithLoading}`,
		`routesWithErrorBoundary: ${report.summary.routesWithErrorBoundary}`,
		`routesWithNotFound: ${report.summary.routesWithNotFound}`,
		`routes.manifest.json: ${report.artifacts.routesManifest}`,
		`project-context.md: ${report.artifacts.projectContext}`,
	];

	if (report.routes.length === 0) {
		lines.push("No routes were detected.");
		return lines.join("\n");
	}

	lines.push("");
	lines.push("Routes:");
	for (const route of report.routes) {
		const flags = [
			route.layout ? `layout=${route.layout}` : "no-layout",
			route.dynamicParams?.length
				? `params=${route.dynamicParams.join(",")}`
				: null,
			route.hasLoading ? "loading" : null,
			route.hasErrorBoundary ? "error" : null,
			route.hasNotFound ? "notFound" : null,
		]
			.filter(Boolean)
			.join(" | ");
		lines.push(`- ${route.path} -> ${route.file}${flags ? ` [${flags}]` : ""}`);
	}

	lines.push("");
	lines.push("Conventions:");
	for (const convention of report.conventions) {
		lines.push(`- ${convention}`);
	}

	return lines.join("\n");
}

function writeProjectContext(
	config: AnastacioConfig,
	routes: RouteDefinition[],
): string {
	mkdirSync(config.paths.internalDir, { recursive: true });

	const outputPath = join(config.paths.internalDir, "project-context.md");
	const summary = buildSummary(routes);
	const conventions = buildConventions(config);
	const lines = [
		"# Anastacio Project Context",
		"",
		"## Structure",
		"",
		`- root: \`${config.rootDir}\``,
		`- appDir: \`${toProjectRelative(config.rootDir, config.paths.appDir)}\``,
		`- entryFile: \`${toProjectRelative(config.rootDir, config.paths.entryFile)}\``,
		`- outDir: \`${toProjectRelative(config.rootDir, config.paths.outDir)}\``,
		`- internalDir: \`${toProjectRelative(config.rootDir, config.paths.internalDir)}\``,
		"",
		"## Summary",
		"",
		`- routes: **${summary.routeCount}**`,
		`- dynamic routes: **${summary.dynamicRouteCount}**`,
		`- unique layouts: **${summary.layoutCount}**`,
		`- routes with loading: **${summary.routesWithLoading}**`,
		`- routes with error boundary: **${summary.routesWithErrorBoundary}**`,
		`- routes with not-found handling: **${summary.routesWithNotFound}**`,
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
				...(route.hasLoading ? ["loading: `yes`"] : []),
				...(route.hasErrorBoundary ? ["errorBoundary: `yes`"] : []),
				...(route.hasNotFound ? ["notFound: `yes`"] : []),
			];
			lines.push(`- ${details.join(" | ")}`);
		}
	}

	lines.push("");
	lines.push("## Conventions");
	lines.push("");
	for (const convention of conventions) {
		lines.push(`- ${convention}`);
	}

	lines.push("");
	lines.push("## Observations");
	lines.push("");
	if (summary.routeCount === 0) {
		lines.push(
			"- The project currently exposes no routes. Add `page.tsx` files under the app directory to make the application structure visible.",
		);
	} else {
		if (summary.dynamicRouteCount > 0) {
			lines.push(
				`- Dynamic routing is active through ${summary.dynamicRouteCount} route(s), which is useful for inspect/doctor tooling and future agent-oriented manifests.`,
			);
		}
		if (summary.layoutCount === 0) {
			lines.push(
				"- No layout files were resolved for the current routes. Consider adding a root `layout.tsx` if you want explicit shared application chrome.",
			);
		} else {
			lines.push(
				`- Layout inheritance is already in use across ${summary.layoutCount} unique layout file(s).`,
			);
		}
		if (summary.routesWithLoading === 0) {
			lines.push(
				"- No route currently exposes `loading.tsx`, so loading-state conventions are still minimal.",
			);
		}
		if (summary.routesWithErrorBoundary === 0) {
			lines.push(
				"- No route currently exposes an error boundary file, so runtime error handling is still implicit.",
			);
		}
	}

	writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

	return outputPath;
}

function buildSummary(routes: RouteDefinition[]): InspectionReport["summary"] {
	return {
		routeCount: routes.length,
		dynamicRouteCount: routes.filter((route) => route.dynamicParams?.length)
			.length,
		layoutCount: new Set(
			routes
				.map((route) => route.layout)
				.filter((layout): layout is string => Boolean(layout)),
		).size,
		routesWithLoading: routes.filter((route) => route.hasLoading).length,
		routesWithErrorBoundary: routes.filter((route) => route.hasErrorBoundary)
			.length,
		routesWithNotFound: routes.filter((route) => route.hasNotFound).length,
	};
}

function buildConventions(config: AnastacioConfig): string[] {
	return [
		`File-based routing under \`${toProjectRelative(config.rootDir, config.paths.appDir)}\` by default.`,
		"Layout inheritance uses the nearest `layout.tsx`.",
		"Dynamic route segments are declared with bracket syntax such as `[id]` and emitted as `:id` in route metadata.",
		"Route manifests and contextual artifacts are written to `.anastacio/`.",
		`The runtime entry file is \`${toProjectRelative(config.rootDir, config.paths.entryFile)}\`.`,
	];
}

function toProjectRelative(projectRoot: string, filePath: string): string {
	return normalizePath(relative(projectRoot, filePath));
}

function normalizePath(value: string): string {
	return value.split(sep).join("/");
}
