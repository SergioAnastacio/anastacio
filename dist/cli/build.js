#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, parse, relative } from 'node:path';
import { build } from 'esbuild';
export async function buildApp() {
    const projectRoot = process.cwd();
    const srcPath = join(projectRoot, 'src');
    const pagesPath = join(srcPath, 'pages');
    const buildPath = join(projectRoot, 'build');
    if (!existsSync(pagesPath)) {
        console.error(`Error: The 'pages' folder does not exist in the project directory (${projectRoot}/src).`);
        process.exit(1);
    }
    // Crear la carpeta 'build' si no existe
    if (!existsSync(buildPath)) {
        mkdirSync(buildPath);
    }
    // Función para generar el archivo de enrutador
    function generateRouter(pagesDir, outputDir) {
        const entries = readdirSync(pagesDir, { withFileTypes: true });
        let imports = '';
        let routes = '';
        function processDirectory(dir, baseRoute) {
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const { name, ext } = parse(entry.name);
                const relativePath = `./${relative(outputDir, join(dir, entry.name))}`;
                const routePath = name === 'index' ? baseRoute : `${baseRoute}/${name}`;
                if (entry.isFile() && ext === '.tsx') {
                    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
                    imports += `import ${componentName} from '.${relativePath.replace(/\\/g, '/')}';\n`;
                    routes += `<Route path="${routePath}" element={<${componentName} />} />\n`;
                }
                else if (entry.isDirectory()) {
                    processDirectory(join(dir, entry.name), `${baseRoute}/${name}`);
                }
            }
        }
        processDirectory(pagesDir, '');
        const routerContent = `
      import React from 'react';
      import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
      ${imports}
      
      const AppRouter = () => (
        <Router>
          <Routes>
            ${routes}
          </Routes>
        </Router>
      );

      export default AppRouter;
    `;
        writeFileSync(join(outputDir, 'AppRouter.tsx'), routerContent);
    }
    // Generar el archivo de enrutador
    generateRouter(pagesPath, srcPath);
    try {
        console.log(`Building the project located at ${projectRoot}...`);
        // Compilar React con esbuild y generar un único archivo JavaScript 
        await build({
            entryPoints: [join(srcPath, 'index.tsx')],
            bundle: true,
            minify: true,
            sourcemap: true,
            outfile: join(buildPath, 'index.js'),
            loader: { '.js': 'jsx', '.ts': 'tsx' },
        });
        console.log('Build completed successfully.');
    }
    catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}
buildApp();
