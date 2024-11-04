import type { Plugin } from 'esbuild';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, parse, relative } from 'node:path';

export const RouterPlugin = (pagesDir: string, outputDir: string): Plugin => ({
    name: 'router-plugin',
    setup(build) {
        build.onStart(() => {
            let imports = "";
            let routes = "";

            function processDirectory(dir: string, baseRoute: string) {
                const entries = readdirSync(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const { name, ext } = parse(entry.name);
                    const relativePath = `./${relative(outputDir, join(dir, entry.name))}`;
                    const routePath = name === "index" ? baseRoute : `${baseRoute}/${name}`.toLowerCase();

                    if (entry.isFile() && ext === ".tsx") {
                        const componentName = name.charAt(0).toUpperCase() + name.slice(1);
                        const importPath = relativePath.replace(/\\/g, "/").replace(/\.tsx$/, "");
                        imports += `import ${componentName} from '${importPath}';\n`;
                        routes += `      <Route path="${routePath.replace(/\/\//g, "/")}" element={<${componentName} />} />\n`;
                    } else if (entry.isDirectory()) {
                        processDirectory(join(dir, entry.name), routePath);
                    }
                }
            }

            processDirectory(pagesDir, "/");

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

            writeFileSync(join(outputDir, "AppRouter.tsx"), routerContent);
        });
    },
});