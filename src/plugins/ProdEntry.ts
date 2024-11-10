import type { Plugin } from "esbuild";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export const ProdPlugin = (): Plugin => ({
	name: "prod-plugin",
	setup(build) {
		build.onEnd(async () => {
			const outputDir = join(process.cwd(), "dist");
			// Crear el archivo HTML
			const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anastacio Framework</title>
  <link rel="stylesheet" href="/bundler.css">
</head>
<body>
  <div id="root"></div>
  <script src="/bundler.js"></script>
</body>
</html>
            `;

			const htmlPath = join(outputDir, "index.html");

			try {
				await writeHtmlIfChanged(htmlPath, htmlContent);
			} catch (error) {
				console.error("Error handling HTML file:", error);
			}
		});
	},
});

// Función para escribir un archivo HTML si ha cambiado el contenido
function writeHtmlIfChanged(filePath: string, content: string) {
	const newHash = createHash("sha256").update(content).digest("hex");

	//Usamos la promesa fs.access para verificar si el archivo existe
	return fs
		.access(filePath)
		.then(() => fs.readFile(filePath, "utf-8"))
		.then((existingContent) => {
			const existingHash = createHash("sha256")
				.update(existingContent)
				.digest("hex");
			if (existingHash !== newHash) {
				return fs.writeFile(filePath, content);
			}
		})
		.catch(() => fs.writeFile(filePath, content));
}
