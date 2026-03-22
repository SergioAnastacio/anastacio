import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type {
	AnastacioConfig,
	RouteDefinition,
} from "../shared/contracts/index.js";

const PAGE_FILE_NAMES = ["page.tsx", "page.jsx"];
const LAYOUT_FILE_NAMES = ["layout.tsx", "layout.jsx"];
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

export function resolveRoutes(config: AnastacioConfig): RouteDefinition[] {
	if (!existsSync(config.paths.appDir)) {
		return [];
	}

	return walkRoutes(config.paths.appDir, config).sort(sortRoutes);
}

function walkRoutes(
	currentDirectory: string,
	config: AnastacioConfig,
	inheritedLayout?: string,
): RouteDefinition[] {
	const entries = readdirSync(currentDirectory, {
		withFileTypes: true,
	}).sort((left, right) => left.name.localeCompare(right.name));
	const currentLayout =
		findKnownFile(currentDirectory, LAYOUT_FILE_NAMES) ?? inheritedLayout;
	const routes: RouteDefinition[] = [];
	const pageFile = findKnownFile(currentDirectory, PAGE_FILE_NAMES);

	if (pageFile) {
		routes.push(
			createRouteDefinition(config, currentDirectory, pageFile, currentLayout),
		);
	}

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		routes.push(
			...walkRoutes(join(currentDirectory, entry.name), config, currentLayout),
		);
	}

	return routes;
}

function createRouteDefinition(
	config: AnastacioConfig,
	currentDirectory: string,
	pageFile: string,
	layoutFile?: string,
): RouteDefinition {
	const relativeDirectory = normalizePath(
		relative(config.paths.appDir, currentDirectory),
	);
	const segments = relativeDirectory ? relativeDirectory.split("/") : [];
	const dynamicParams = segments
		.filter(isDynamicSegment)
		.map((segment) => stripDynamicSegment(segment));

	return {
		path: toRoutePath(segments),
		file: toProjectRelative(config.rootDir, pageFile),
		...(layoutFile ? { layout: toProjectRelative(config.rootDir, layoutFile) } : {}),
		...(dynamicParams.length > 0 ? { dynamicParams } : {}),
		hasLoading: hasKnownFile(currentDirectory, LOADING_FILE_NAMES),
		hasErrorBoundary: hasKnownFile(currentDirectory, ERROR_FILE_NAMES),
		hasNotFound: hasKnownFile(currentDirectory, NOT_FOUND_FILE_NAMES),
	};
}

function toRoutePath(segments: string[]): string {
	if (segments.length === 0) {
		return "/";
	}

	return `/${segments.map(formatRouteSegment).join("/")}`;
}

function formatRouteSegment(segment: string): string {
	if (isDynamicSegment(segment)) {
		return `:${stripDynamicSegment(segment)}`;
	}

	return segment;
}

function isDynamicSegment(segment: string): boolean {
	return segment.startsWith("[") && segment.endsWith("]");
}

function stripDynamicSegment(segment: string): string {
	return segment.slice(1, -1);
}

function findKnownFile(
	directory: string,
	fileNames: string[],
): string | undefined {
	for (const fileName of fileNames) {
		const candidate = join(directory, fileName);
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return undefined;
}

function hasKnownFile(directory: string, fileNames: string[]): boolean {
	return findKnownFile(directory, fileNames) !== undefined;
}

function sortRoutes(left: RouteDefinition, right: RouteDefinition): number {
	if (left.path === "/") {
		return -1;
	}

	if (right.path === "/") {
		return 1;
	}

	return left.path.localeCompare(right.path) || left.file.localeCompare(right.file);
}

function normalizePath(value: string): string {
	return value.split(sep).join("/");
}

function toProjectRelative(projectRoot: string, filePath: string): string {
	return normalizePath(relative(projectRoot, filePath));
}
