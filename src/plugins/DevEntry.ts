import type { Plugin } from "esbuild";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export const DevPlugin = (): Plugin => ({
	name: "dev-plugin",
	setup(build) {
		build.onEnd(() => {
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
  <script src="bundler.js"></script>
  <script>
    // Conectar al servidor WebSocket
    const ws = new WebSocket("ws://localhost:3001");

    // Escuchar mensajes del servidor WebSocket
    ws.onmessage = (event) => {
      if (event.data === "reload") {
        // Recargar la página cuando se reciba un mensaje de recarga
        window.location.reload();
      }
    };

    // Manejar errores de conexión
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Manejar el cierre de la conexión
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  </script>
</body>
</html>
            `;
			const htmlPath = join(process.cwd(), "dist/index.html");

			writeHtmlIfChanged(htmlPath, htmlContent).catch((error) =>
				console.error("Error handling HTML file:", error),
			);
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
