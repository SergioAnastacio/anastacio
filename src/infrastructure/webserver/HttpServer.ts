// src/Infrastructure/webserver/HttpServer.ts
import http from "node:http";
import { staticFileController } from "../../adapters/controllers/StaticFileController.js";
import { HotReloadServer } from "../websocket/HotReloadServer.js";
import { EsbuildCompiler } from "../compiler/EsbuildCompiler.js";
import type { IHttpServer } from "./IHttpServer.js";
import type { ServerMode } from "./ServerMode.js";
import { FindFreePort } from "../../utils/FindFreePort.js";
import { join } from "node:path";

export class HttpServer implements IHttpServer {
	private server: http.Server;
	private hotReloadServer?: HotReloadServer;
	private compiler: EsbuildCompiler;
	private freePort = 0;
	private freeWsPort = 3001;

	constructor(
		public hostname: string,
		public port: number,
		public wsPort: number,
		public mode: ServerMode,
	) {
		const srcDir = join(process.cwd(), "src");
		const outputDir = join(process.cwd(), "dist");
		this.server = http.createServer(staticFileController(outputDir)); // Pasar el directorio de salida al controlador
		this.hotReloadServer = new HotReloadServer(wsPort);
		this.compiler = new EsbuildCompiler(
			[`${srcDir}/index.tsx`],
			join(outputDir, "bundler.js"),
			mode,
			this.hotReloadServer,
		);
	}

	async init() {
		//Para ambos casos se requiere el servidor http
		this.freePort = await FindFreePort(this.port);
		// Compilar los archivos de React
		await this.compiler.compile(); //Compilamos el codigo
		// Iniciar el servidor HTTP
		this.server.listen(this.freePort, this.hostname, () => {
			console.log(
				`Server running at http://${this.hostname}:${this.freePort}/`,
			);
			console.log(
				`WebSocket server running at ws://${this.hostname}:${this.freeWsPort}/`,
			);
		});
	}

	start() {
		this.init();
	}

	notifyClients() {
		if (this.hotReloadServer) {
			this.hotReloadServer.notifyClients();
		}
	}

	async handleSessionStop(signal: NodeJS.Signals): Promise<void> {
		console.log(`Received ${signal}. Closing servers...`);
		this.closeServers();
		process.exit(0);
	}

	public closeServers(): void {
		if (this.server) {
			this.server.close(() => {
				console.log("HTTP server closed");
			});
		}
		if (this.hotReloadServer) {
			this.hotReloadServer.close();
		}
	}
}
