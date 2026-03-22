import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createFrameworkContext, findAnastacioConfigPath } from "../core/index.js";
import { writeRoutesManifest } from "../router/index.js";
import type {
	AnastacioConfig,
	Diagnostic,
	DiagnosticReport,
	RouteDefinition,
} from "../shared/contracts/index.js";

export interface DoctorReport {
	rootDir: string;
	paths: {
		configFile: string | null;
		appDir: string;
		entryFile: string;
		internalDir: string;
	};
	artifacts: {
		diagnostics: string;
		routesManifest: string;
	};
	diagnostics: Diagnostic[];
}

export async function diagnoseProject(
	projectRoot = process.cwd(),
): Promise<DoctorReport> {
	const configPath = findAnastacioConfigPath(projectRoot);
	const framework = await createFrameworkContext(projectRoot);
	const { config, routes } = framework;
	const diagnostics = collectDiagnostics(config, routes, configPath);
	const routesManifestPath = writeRoutesManifest(config, routes);
	const diagnosticsPath = writeDiagnosticsReport(config, diagnostics);

	return {
		rootDir: config.rootDir,
		paths: {
			configFile: configPath
				? toProjectRelative(config.rootDir, configPath)
				: null,
			appDir: toProjectRelative(config.rootDir, config.paths.appDir),
			entryFile: toProjectRelative(config.rootDir, config.paths.entryFile),
			internalDir: toProjectRelative(config.rootDir, config.paths.internalDir),
		},
		artifacts: {
			diagnostics: toProjectRelative(config.rootDir, diagnosticsPath),
			routesManifest: toProjectRelative(config.rootDir, routesManifestPath),
		},
		diagnostics,
	};
}

export function formatDoctorReport(report: DoctorReport): string {
	const errorCount = report.diagnostics.filter(
		(diagnostic) => diagnostic.severity === "error",
	).length;
	const warningCount = report.diagnostics.filter(
		(diagnostic) => diagnostic.severity === "warning",
	).length;
	const infoCount = report.diagnostics.filter(
		(diagnostic) => diagnostic.severity === "info",
	).length;

	const lines = [
		"Anastacio Doctor",
		`root: ${report.rootDir}`,
		`configFile: ${report.paths.configFile ?? "(defaults)"}`,
		`appDir: ${report.paths.appDir}`,
		`entryFile: ${report.paths.entryFile}`,
		`diagnostics.json: ${report.artifacts.diagnostics}`,
		`routes.manifest.json: ${report.artifacts.routesManifest}`,
		`errors: ${errorCount} | warnings: ${warningCount} | info: ${infoCount}`,
	];

	if (report.diagnostics.length === 0) {
		lines.push("No issues detected.");
		return lines.join("\n");
	}

	lines.push("");
	for (const diagnostic of report.diagnostics) {
		const location = diagnostic.file ? ` (${diagnostic.file})` : "";
		const suggestion = diagnostic.suggestion
			? ` -> ${diagnostic.suggestion}`
			: "";
		lines.push(
			`${diagnostic.severity.toUpperCase()} ${diagnostic.code}${location}: ${diagnostic.message}${suggestion}`,
		);
	}

	return lines.join("\n");
}

function collectDiagnostics(
	config: AnastacioConfig,
	routes: RouteDefinition[],
	configPath: string | null,
): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];
	const appDir = config.paths.appDir;
	const entryFile = config.paths.entryFile;

	if (!configPath) {
		diagnostics.push({
			code: "CONFIG_FILE_MISSING",
			severity: "info",
			message:
				"No anastacio.config.* file was found. The project is running on implicit defaults.",
			suggestion:
				"Add an anastacio.config.ts file to make paths and dev settings explicit.",
		});
	}

	if (!existsSync(appDir)) {
		diagnostics.push({
			code: "APP_DIR_MISSING",
			severity: "error",
			message: "The configured app directory does not exist.",
			file: toProjectRelative(config.rootDir, appDir),
			suggestion:
				"Create the directory or update paths.appDir in anastacio.config.ts.",
		});
	}

	if (!existsSync(entryFile)) {
		diagnostics.push({
			code: "ENTRY_FILE_MISSING",
			severity: "error",
			message: "The configured entry file does not exist.",
			file: toProjectRelative(config.rootDir, entryFile),
			suggestion:
				"Create the file or update paths.entryFile in anastacio.config.ts.",
		});
	}

	if (existsSync(appDir) && !hasKnownFile(appDir, ROOT_LAYOUT_FILE_NAMES)) {
		diagnostics.push({
			code: "ROOT_LAYOUT_MISSING",
			severity: "info",
			message:
				"No root layout file was detected under the configured app directory.",
			file: toProjectRelative(config.rootDir, appDir),
			suggestion:
				"Add src/app/layout.tsx so the application shell is explicit and shared across routes.",
		});
	}

	if (routes.length === 0 && existsSync(appDir)) {
		diagnostics.push({
			code: "NO_ROUTES_DETECTED",
			severity: "warning",
			message: "No routes were detected under the configured app directory.",
			file: toProjectRelative(config.rootDir, appDir),
			suggestion: "Add a page.tsx file under src/app or adjust paths.appDir.",
		});
	}

	if (routes.length > 0 && !routes.some((route) => route.path === "/")) {
		diagnostics.push({
			code: "ROOT_ROUTE_MISSING",
			severity: "warning",
			message: "No root route (/) was detected.",
			suggestion: "Add src/app/page.tsx or review your routing conventions.",
		});
	}

	const routeCounts = new Map<string, number>();
	for (const route of routes) {
		routeCounts.set(route.path, (routeCounts.get(route.path) ?? 0) + 1);
	}

	for (const [routePath, count] of routeCounts.entries()) {
		if (count > 1) {
			diagnostics.push({
				code: "DUPLICATE_ROUTE_PATH",
				severity: "error",
				message: `The route path "${routePath}" is declared more than once.`,
				suggestion:
					"Rename or reorganize the conflicting route files so each path is unique.",
			});
		}
	}

	const routesBySignature = new Map<string, RouteDefinition[]>();
	for (const route of routes) {
		const signature = toRouteSignature(route.path);
		const entries = routesBySignature.get(signature) ?? [];
		entries.push(route);
		routesBySignature.set(signature, entries);
	}

	for (const [signature, signatureRoutes] of routesBySignature.entries()) {
		const distinctPaths = new Set(
			signatureRoutes.map((route) => route.path),
		);
		if (distinctPaths.size < 2) {
			continue;
		}

		const declaredFiles = signatureRoutes
			.map((route) => route.file)
			.sort((left, right) => left.localeCompare(right))
			.join(", ");

		diagnostics.push({
			code: "DUPLICATE_ROUTE_SIGNATURE",
			severity: "error",
			message: `Multiple route files collapse to the same route signature "${signature}": ${declaredFiles}.`,
			suggestion:
				"Rename or reorganize dynamic segments so each semantic route shape is unique.",
		});
	}

	return diagnostics.sort(
		(left, right) =>
			severityRank(left.severity) - severityRank(right.severity) ||
			left.code.localeCompare(right.code),
	);
}

function writeDiagnosticsReport(
	config: AnastacioConfig,
	diagnostics: Diagnostic[],
): string {
	mkdirSync(config.paths.internalDir, { recursive: true });

	const outputPath = join(config.paths.internalDir, "diagnostics.json");
	const report: DiagnosticReport = {
		kind: "diagnostic-report",
		version: 1,
		diagnostics,
	};

	writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
	return outputPath;
}

function severityRank(severity: Diagnostic["severity"]): number {
	switch (severity) {
		case "error":
			return 0;
		case "warning":
			return 1;
		default:
			return 2;
	}
}

const ROOT_LAYOUT_FILE_NAMES = ["layout.tsx", "layout.jsx"];

function hasKnownFile(directory: string, fileNames: string[]): boolean {
	for (const fileName of fileNames) {
		if (existsSync(join(directory, fileName))) {
			return true;
		}
	}

	return false;
}

function toRouteSignature(routePath: string): string {
	if (routePath === "/") {
		return routePath;
	}

	const segments = routePath.split("/").filter(Boolean);
	return `/${segments
		.map((segment) => (segment.startsWith(":") ? ":*" : segment))
		.join("/")}`;
}

function toProjectRelative(projectRoot: string, filePath: string): string {
	return normalizePath(relative(projectRoot, filePath));
}

function normalizePath(value: string): string {
	return value.split(sep).join("/");
}
