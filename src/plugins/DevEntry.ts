import type { Plugin } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const DevPlugin = (outputDir: string): Plugin => ({
    name: 'dev-plugin',
    setup(build) {
        build.onEnd(() => {
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anastacio Framework</title>
  <link rel="stylesheet" href="styles.min.css">
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
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
            writeFileSync(join(outputDir, 'index.html'), htmlContent);
        });
    },
});