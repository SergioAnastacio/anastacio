import type { Plugin } from "esbuild";
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import { join, parse, relative } from "node:path";

export const RouterPlugin = (): Plugin => ({
	name: "router-plugin",
	setup(build) {
		build.onStart(() => {
			const srcDir = join(process.cwd(), "src");
			const appDir = join(srcDir, "app");
			const outputDir = join(process.cwd(), "src");
			const outputFile = join(outputDir, "AppRouter.tsx");

			if (!existsSync(appDir)) {
				throw new Error("The App directory does not exist.");
			}

			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, { recursive: true });
			}

			const lazyImports: string[] = [];
			const routesImports: string[] = [];
			handleLazyImports(lazyImports, appDir, srcDir, routesImports);

			const routerContent = createRouterContent(lazyImports, routesImports);
			writeFileSync(outputFile, routerContent);
		});
	},
});

const handleLazyImports = (
	imports: string[],
	appDir: string,
	srcDir: string,
	routesImports: string[],
	relativePath = "",
): string[] => {
	const files = readdirSync(appDir, { withFileTypes: true });
	const componentNames: string[] = [];

	for (const file of files) {
		if (file.isDirectory()) {
			const childComponentNames = handleLazyImports(
				imports,
				join(appDir, file.name),
				srcDir,
				routesImports,
				`${relativePath}/${file.name}`,
			);
			componentNames.push(...childComponentNames);
			if (childComponentNames.length === 0) continue;

			const { parentRoute, childRoutes, closeRoute } = createRoutes(
				file.name,
				childComponentNames,
				relativePath,
			);
			const finalRoute = parentRoute
				? `${parentRoute}\n${childRoutes.join("\n")}\n${closeRoute}`
				: `<Route path="${relativePath}/${file.name}" element={<${childComponentNames[0]} />} />`;
			routesImports.push(finalRoute);
		} else {
			const componentName = processFile(
				file,
				appDir,
				srcDir,
				imports,
				routesImports,
				relativePath,
			);
			if (componentName) componentNames.push(componentName);
		}
	}

	return componentNames;
};

const processFile = (
	file: Dirent,
	appDir: string,
	srcDir: string,
	imports: string[],
	routesImports: string[],
	relativePath: string,
): string | null => {
	const tempfile = parse(file.name);
	if (tempfile.ext === ".tsx" || tempfile.ext === ".jsx") {
		const relPath = relative(
			srcDir,
			join(appDir, tempfile.dir, tempfile.name),
		).replace(/\\/g, "/");
		const componentName = formatComponentName(relPath);

		// Excluir componentes específicos de la importación dinámica
		if (
			[
				"Apppage",
				"Applayout",
				"Apploading",
				"Appnotfound",
				"ApperrorPage",
			].includes(componentName)
		) {
			return null;
		}

		imports.push(`const ${componentName} = lazy(() => import('${relPath}'));`);

		// Handle dynamic routes
		const routePath = relativePath
			? `${relativePath}/${tempfile.name.replace(/\[(.+?)\]/g, ":$1")}`
			: tempfile.name.replace(/\[(.+?)\]/g, ":$1");

		routesImports.push(
			`<Route path="${routePath}" element={<${componentName} />} />`,
		);
		return componentName;
	}
	return null;
};

const formatComponentName = (relPath: string): string => {
	const componentName = relPath
		.replace(/^\.\/app\//, "")
		.replace(/\//g, "")
		.replace(/\./g, "");
	return componentName.charAt(0).toUpperCase() + componentName.slice(1);
};

const createRoutes = (
	folderName: string,
	childComponentNames: string[],
	relativePath: string,
): { parentRoute: string; childRoutes: string[]; closeRoute: string } => {
	let parentRoute = "";
	const childRoutes: string[] = [];
	let closeRoute = "";

	for (const component of childComponentNames) {
		if (component.toLowerCase().includes("layout")) {
			parentRoute = `<Route path="${relativePath}/${folderName}" element={<${component} />}>`;
			continue;
		}
		if (component.toLowerCase().includes("page")) {
			childRoutes.push(`<Route index element={<${component} />} />`);
		} else {
			childRoutes.push(
				`<Route path="${component.toLowerCase()}" element={<${component} />} />`,
			);
		}
	}

	if (parentRoute !== "") {
		closeRoute = "</Route>";
	}

	return { parentRoute, childRoutes, closeRoute };
};

const createRouterContent = (
	lazyImports: string[],
	routesImports: string[],
): string => `
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const ApperrorPage = lazy(() => import('app/errorPage'));
const Applayout = lazy(() => import('app/layout'));
const Apploading = lazy(() => import('app/loading'));
const Appnotfound = lazy(() => import('app/notfound'));
const Apppage = lazy(() => import('app/page'));
${lazyImports.join("\n")}

const AppRouter = () => (
  <Router>
   <ErrorBoundary>
    <Suspense fallback={<Apploading />}>
      <Routes>
       <Route path="/" element={<Applayout />}>
       <Route index element={<Apppage />} />
       ${routesImports.join("\n")}
       </Route>
       <Route path="*" element={<Appnotfound />} />
      </Routes>
    </Suspense>
   </ErrorBoundary>
  </Router>
);

export default AppRouter`;
