import { existsSync, writeFileSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import type {
	AnastacioConfig,
	RouteDefinition,
} from "../shared/contracts/index.js";

const LOADING_FILE_NAMES = ["loading.tsx", "loading.jsx"];
const NOT_FOUND_FILE_NAMES = [
	"notfound.tsx",
	"notfound.jsx",
	"not-found.tsx",
	"not-found.jsx",
];
const ERROR_FILE_NAMES = [
	"error.tsx",
	"error.jsx",
	"errorPage.tsx",
	"errorPage.jsx",
];

export function writeGeneratedAppRouter(
	config: AnastacioConfig,
	routes: RouteDefinition[],
): string {
	const outputPath = join(config.paths.srcDir, "AppRouter.tsx");
	const source = createAppRouterSource(config, routes);
	writeFileSync(outputPath, source, "utf8");
	return outputPath;
}

export function createAppRouterSource(
	config: AnastacioConfig,
	routes: RouteDefinition[],
): string {
	const pageImports = new Map<string, string>();
	const layoutImports = new Map<string, string>();
	const directRoutes: string[] = [];
	const layoutGroups = new Map<string, string[]>();

	for (const route of routes) {
		const pageComponent = registerComponentImport(
			pageImports,
			"RoutePage",
			config,
			route.file,
		);
		const routeLine = `        <Route path="${route.path}" element={<${pageComponent} />} />`;

		if (route.layout) {
			const layoutComponent = registerComponentImport(
				layoutImports,
				"RouteLayout",
				config,
				route.layout,
			);
			const layoutRoutes = layoutGroups.get(layoutComponent) ?? [];
			layoutRoutes.push(routeLine);
			layoutGroups.set(layoutComponent, layoutRoutes);
			continue;
		}

		directRoutes.push(routeLine);
	}

	const groupedLayoutRoutes = Array.from(layoutGroups.entries()).map(
		([
			layoutComponent,
			routeLines,
		]) => `      <Route element={<${layoutComponent} />}>
${routeLines.join("\n")}
      </Route>`,
	);

	const componentImports = [
		...createRootComponentDefinitions(config),
		...serializeImports(pageImports),
		...serializeImports(layoutImports),
	];

	return `
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ApperrorPage />;
    }

    return this.props.children;
  }
}

${componentImports.join("\n")}

const AppRouter = () => (
  <Router>
    <ErrorBoundary>
      <Suspense fallback={<Apploading />}>
        <Routes>
${directRoutes.join("\n")}
${groupedLayoutRoutes.join("\n")}
          <Route path="*" element={<Appnotfound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </Router>
);

export default AppRouter;
`;
}

function createRootComponentDefinitions(config: AnastacioConfig): string[] {
	return [
		createLazyOrFallbackComponent(
			config,
			LOADING_FILE_NAMES,
			"Apploading",
			"const Apploading = () => null;",
		),
		createLazyOrFallbackComponent(
			config,
			NOT_FOUND_FILE_NAMES,
			"Appnotfound",
			"const Appnotfound = () => null;",
		),
		createLazyOrFallbackComponent(
			config,
			ERROR_FILE_NAMES,
			"ApperrorPage",
			"const ApperrorPage = () => null;",
		),
	];
}

function createLazyOrFallbackComponent(
	config: AnastacioConfig,
	fileNames: string[],
	componentName: string,
	fallbackDefinition: string,
): string {
	const existingFile = findFirstExistingFile(config.paths.appDir, fileNames);

	if (!existingFile) {
		return fallbackDefinition;
	}

	const importPath = toImportSpecifier(config.paths.srcDir, existingFile);
	return `const ${componentName} = lazy(() => import('${importPath}'));`;
}

function findFirstExistingFile(
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

function registerComponentImport(
	imports: Map<string, string>,
	prefix: string,
	config: AnastacioConfig,
	projectRelativeFilePath: string,
): string {
	const absoluteFilePath = resolve(config.rootDir, projectRelativeFilePath);
	const importPath = toImportSpecifier(config.paths.srcDir, absoluteFilePath);
	const existing = imports.get(importPath);

	if (existing) {
		return existing;
	}

	const componentName = toComponentName(prefix, importPath);
	imports.set(importPath, componentName);
	return componentName;
}

function serializeImports(imports: Map<string, string>): string[] {
	return Array.from(imports.entries())
		.sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
		.map(
			([importPath, componentName]) =>
				`const ${componentName} = lazy(() => import('${importPath}'));`,
		);
}

function toImportSpecifier(srcDir: string, absoluteFilePath: string): string {
	const relativePath = relative(srcDir, absoluteFilePath).replace(/\\/g, "/");
	const parsedPath = parse(relativePath);
	const pathWithoutExtension = join(parsedPath.dir, parsedPath.name).replace(
		/\\/g,
		"/",
	);

	return pathWithoutExtension.startsWith(".")
		? pathWithoutExtension
		: `./${pathWithoutExtension}`;
}

function toComponentName(prefix: string, importPath: string): string {
	const suffix = importPath
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join("");

	return `${prefix}${suffix}`;
}
