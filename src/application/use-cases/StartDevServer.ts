import http from "node:http";
import { ServerRepository } from "../../infrastructure/repositories/ServerRepository.js";
import { ServerService } from "../../domain/services/ServerService.js";
import { CreateServer } from "./CreateServer.js";
import { ServerController } from "../../presentation/controllers/ServerController.js";
import { HotReloadServer } from "../../infrastructure/websocket/HotReloadServer.js";
import { watch } from "node:fs";
import { FindFreePort } from "./FindFreePort.js";
import path from "node:path";
import { build, context, type BuildOptions } from 'esbuild';
import { DevPlugin } from "../../plugins/DevEntry.js";
import { RouterPlugin } from "../../plugins/AppRouter.js";


interface DevAppOptions {
    port?: number;
}

export class StartDevServer {
    private httpServer?: http.Server;
    private hotReloadServer?: HotReloadServer;

    constructor(private options: DevAppOptions) {}

    public async execute(): Promise<void> {
        const serverRepository = new ServerRepository();
        const serverService = new ServerService(serverRepository);
        const createServer = new CreateServer(serverService);
        const serverController = new ServerController(createServer, path.join(process.cwd(), "dist"));
        const findFreePort = new FindFreePort();

        try {
            const freePort = await findFreePort.execute(this.options.port || 3000);
            const wsPort = await findFreePort.execute(3001);

            this.httpServer = http.createServer((req: http.IncomingMessage, res: http.ServerResponse): void => {
                if (req.method === "POST" && req.url === "/servers") {
                    serverController.create(req, res);
                } else {
                    serverController.handleStaticFiles(req, res);
                }
            });

            this.httpServer.listen(freePort, (): void => {
                console.log(`Dev server running at http://localhost:${freePort}`);
            });

            // Configurar el servidor WebSocket para hot-reload
            this.hotReloadServer = new HotReloadServer(wsPort);
            console.log(`WebSocket server running at ws://localhost:${wsPort}`);

            // Configurar esbuild para la compilación y el hot-reload
            const buildOptions: BuildOptions = {
                entryPoints: ['src/index.tsx'],
                bundle: true,
                outfile: 'dist/index.js',
                sourcemap: true,
                target: 'es2022',
                plugins: [DevPlugin('dist'), RouterPlugin('src/pages', 'src')],
            };

            const ctx = await context(buildOptions);

            // Iniciar el watch mode
            await ctx.watch();

            // Observar cambios en los archivos y notificar a los clientes
            watch("src", { recursive: true }, (eventType: string, filename: string): void => {
                if (filename) {
                    console.log(`File changed: ${filename}`);
                    ctx.rebuild().then(() => {
                        console.log('Rebuild completed successfully.');
                        this.hotReloadServer?.notifyClients();
                    }).catch((error) => {
                        console.error('Rebuild failed:', error);
                    });
                }
            });

            // Manejar la terminación del proceso para cerrar los servidores
            process.on("SIGINT", () => this.closeServers());
            process.on("SIGTERM", () => this.closeServers());
        } catch (err) {
            console.error("Error finding free port:", err);
        }
    }

    public closeServers(): void {
        if (this.httpServer) {
            this.httpServer.close(() => {
                console.log("HTTP server closed");
            });
        }
        if (this.hotReloadServer) {
            this.hotReloadServer.close();
        }
    }
}