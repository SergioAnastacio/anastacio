import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
	createFrameworkContext,
	findAnastacioConfigPath,
} from "../core/index.js";
import { writeRoutesManifest } from "../router/index.js";
import type {
	AnastacioConfig,
	Diagnostic,
	DiagnosticReport,
	RouteDefinition,
} from "../shared/contracts/index.js";

const ROOT_LAYOUT_FILE_NAMES = ["layout.tsx", "layout.jsx"];
const PAGE_FILE_NAMES = ["page.tsx", "page.jsx"];
const LOADING_FILE_NAMES = ["loading.tsx", "loading.jsx"];
const ERROR_FILE_NAMES = [
	"error.tsx",
	"error.jsx",
	"errorPage.tsx",
	"errorPage.jsx",
];
const NOT_FOUND_FILE_NAMES = [
	"notfound.tsx",
	"notfound.jsx",
	"not-found.tsx",
	"not-found.jsx",
];

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

	collectDuplicateRouteDiagnostics(routes, diagnostics);

	if (existsSync(appDir)) {
		collectDirectoryShapeDiagnostics(config, diagnostics);
		collectRouteMetadataDiagnostics(config, routes, diagnostics);
	}

	return diagnostics.sort(
		(left, right) =>
			severityRank(left.severity) - severityRank(right.severity) ||
			left.code.localeCompare(right.code) ||
			(left.file ?? "").localeCompare(right.file ?? ""),
	);
}

function collectDuplicateRouteDiagnostics(
	routes: RouteDefinition[],
	diagnostics: Diagnostic[],
): void {
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
		const distinctPaths = new Set(signatureRoutes.map((route) => route.path));
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
}

function collectDirectoryShapeDiagnostics(
	config: AnastacioConfig,
	diagnostics: Diagnostic[],
): void {
	walkAppDirectory(config.paths.appDir, (directory) => {
		const directoryEntries = readdirSync(directory, { withFileTypes: true });
		const fileNames = new Set(
			directoryEntries
				.filter((entry) => entry.isFile())
				.map((entry) => entry.name),
		);
		const relativeDirectory = toProjectRelative(config.rootDir, directory);
		const pageCount = countKnownFiles(fileNames, PAGE_FILE_NAMES);
		const layoutCount = countKnownFiles(fileNames, ROOT_LAYOUT_FILE_NAMES);
		const loadingCount = countKnownFiles(fileNames, LOADING_FILE_NAMES);
		const errorCount = countKnownFiles(fileNames, ERROR_FILE_NAMES);
		const notFoundCount = countKnownFiles(fileNames, NOT_FOUND_FILE_NAMES);

		if (pageCount > 1) {
			diagnostics.push({
				code: "MULTIPLE_PAGE_FILES",
				severity: "error",
				message:
					"More than one page file was found in the same route directory.",
				file: relativeDirectory,
				suggestion: "Keep a single page.tsx/page.jsx per route directory.",
			});
		}

		if (layoutCount > 1) {
			diagnostics.push({
				code: "MULTIPLE_LAYOUT_FILES",
				severity: "error",
				message: "More than one layout file was found in the same directory.",
				file: relativeDirectory,
				suggestion: "Keep a single layout.tsx/layout.jsx per directory.",
			});
		}

		if (loadingCount > 1) {
			diagnostics.push({
				code: "MULTIPLE_LOADING_FILES",
				severity: "error",
				message: "More than one loading file was found in the same directory.",
				file: relativeDirectory,
				suggestion: "Keep a single loading.tsx/loading.jsx per directory.",
			});
		}

		if (errorCount > 1) {
			diagnostics.push({
				code: "MULTIPLE_ERROR_FILES",
				severity: "error",
				message:
					"More than one error boundary file was found in the same directory.",
				file: relativeDirectory,
				suggestion:
					"Keep a single error.tsx/error.jsx or errorPage.tsx/errorPage.jsx per directory.",
			});
		}

		if (notFoundCount > 1) {
			diagnostics.push({
				code: "MULTIPLE_NOT_FOUND_FILES",
				severity: "error",
				message:
					"More than one not-found file was found in the same directory.",
				file: relativeDirectory,
				suggestion:
					"Keep a single notfound.tsx/notfound.jsx or not-found.tsx/not-found.jsx per directory.",
			});
		}

		if (
			isDynamicDirectory(directory) &&
			pageCount === 0 &&
			!hasChildDirectories(directory)
		) {
			diagnostics.push({
				code: "EMPTY_DYNAMIC_ROUTE_DIRECTORY",
				severity: "warning",
				message:
					"A dynamic route directory exists without a page file or nested child routes.",
				file: relativeDirectory,
				suggestion:
					"Add a page.tsx file or nested route directories, or remove the unused dynamic segment.",
			});
		}

		if (
			loadingCount > 0 &&
			pageCount === 0 &&
			!hasChildDirectories(directory)
		) {
			diagnostics.push({
				code: "ORPHAN_LOADING_FILE",
				severity: "warning",
				message:
					"A loading file exists in a directory without a page file or nested child routes.",
				file: relativeDirectory,
				suggestion:
					"Add a page.tsx or child route, or remove the unused loading file.",
			});
		}

		if (errorCount > 0 && pageCount === 0 && !hasChildDirectories(directory)) {
			diagnostics.push({
				code: "ORPHAN_ERROR_FILE",
				severity: "warning",
				message:
					"An error boundary file exists in a directory without a page file or nested child routes.",
				file: relativeDirectory,
				suggestion:
					"Add a page.tsx or child route, or remove the unused error file.",
			});
		}

		if (
			notFoundCount > 0 &&
			pageCount === 0 &&
			!hasChildDirectories(directory)
		) {
			diagnostics.push({
				code: "ORPHAN_NOT_FOUND_FILE",
				severity: "warning",
				message:
					"A not-found file exists in a directory without a page file or nested child routes.",
				file: relativeDirectory,
				suggestion:
					"Add a page.tsx or child route, or remove the unused not-found file.",
			});
		}
	});
}

function collectRouteMetadataDiagnostics(
	config: AnastacioConfig,
	routes: RouteDefinition[],
	diagnostics: Diagnostic[],
): void {
	for (const route of routes) {
		const routeDirectory = join(config.rootDir, route.file, "..");
		if (!route.layout) {
			diagnostics.push({
				code: "ROUTE_WITHOUT_LAYOUT",
				severity: "info",
				message: `Route "${route.path}" does not resolve to any layout file.`,
				file: route.file,
				suggestion:
					"Add a nearby layout.tsx or a root src/app/layout.tsx if the route should share application chrome.",
			});
		}

		if (
			route.hasLoading === false &&
			hasKnownFile(routeDirectory, LOADING_FILE_NAMES)
		) {
			diagnostics.push({
				code: "LOADING_METADATA_MISMATCH",
				severity: "warning",
				message: `Route "${route.path}" appears to have a loading file that was not reflected in route metadata.`,
				file: route.file,
				suggestion:
					"Review route resolution for loading.tsx inheritance and metadata propagation.",
			});
		}
	}
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

function walkAppDirectory(
	directory: string,
	visitor: (directory: string) => void,
): void {
	visitor(directory);
	const entries = readdirSync(directory, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory()) {
			walkAppDirectory(join(directory, entry.name), visitor);
		}
	}
}

function countKnownFiles(fileNames: Set<string>, candidates: string[]): number {
	return candidates.filter((fileName) => fileNames.has(fileName)).length;
}

function hasKnownFile(directory: string, fileNames: string[]): boolean {
	for (const fileName of fileNames) {
		if (existsSync(join(directory, fileName))) {
			return true;
		}
	}

	return false;
}

function hasChildDirectories(directory: string): boolean {
	return readdirSync(directory, { withFileTypes: true }).some((entry) =>
		entry.isDirectory(),
	);
}

function isDynamicDirectory(directory: string): boolean {
	const baseName = directory.split(/[\\/]/).pop() ?? "";
	return baseName.startsWith("[") && baseName.endsWith("]");
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
