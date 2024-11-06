//TODO : Mejorar el sistema de rutas para que sea mas flexible y permita rutas anidadas
//TODO : Principalmente cuando hablamos de Layouts , componentes compartidos , OUTLETS.

import type { Plugin } from "esbuild";
import { readdirSync, writeFileSync } from "node:fs";
import { join, parse, relative } from "node:path";

export const RouterPlugin = (): Plugin => ({
	name: "router-plugin",
	setup(build) {
		build.onStart(() => {
			const srcDir = join(process.cwd(), "src");
			const PagesDir = join(srcDir, "pages");
			let imports = "";
			let routes = "";

			function processDirectory(dir: string, baseRoute: string) {
				const entries = readdirSync(dir, { withFileTypes: true });

				for (const entry of entries) {
					const { name, ext } = parse(entry.name);
					const relativePath = `./${relative(srcDir, join(dir, entry.name))}`;
					const routePath =
						baseRoute === "/"
							? `/${name.toLowerCase()}`
							: `${baseRoute}/${name}`.toLowerCase();

					if (entry.isFile() && ext === ".tsx") {
						const componentName = name.charAt(0).toUpperCase() + name.slice(1);
						const importPath = relativePath
							.replace(/\\/g, "/")
							.replace(/\.tsx$/, "");
						imports += `import ${componentName} from '${importPath}';\n`;
						if (name.toLowerCase() === "index" && baseRoute === "/") {
							routes += `      <Route path="/" element={<${componentName} />} index />\n`;
						} else {
							const adjustedRoutePath = routePath.replace(
								new RegExp(`/${name.toLowerCase()}$`),
								"",
							);
							routes += `      <Route path="${adjustedRoutePath.replace(/\/\//g, "/")}" element={<${componentName} />} />\n`;
						}
					} else if (entry.isDirectory()) {
						processDirectory(join(dir, entry.name), routePath);
					}
				}
			}

			processDirectory(PagesDir, "/");

			const routerContent = `
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
${imports}

const AppRouter = () => (
  <Router>
    <Routes>
${routes}    </Routes>
  </Router>
);

export default AppRouter;
            `;

			writeFileSync(join(srcDir, "AppRouter.tsx"), routerContent);
		});
	},
});
