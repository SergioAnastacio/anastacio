// src/Infrastructure/webserver/HttpServer.ts
import http from "node:http";
import { staticFileController } from "../../adapters/controllers/StaticFileController.js";
import { HotReloadServer } from "../websocket/HotReloadServer.js";
import { EsbuildCompiler } from "../compiler/EsbuildCompiler.js";
import type { IHttpServer } from "./IHttpServer.js";
import { ServerMode } from "./ServerMode.js";
import { FindFreePort } from "../../utils/FindFreePort.js";
import type { AnastacioConfig } from "../../shared/contracts/index.js";

interface HttpServerOverrides {
	host?: string;
	port?: number;
	wsPort?: number;
}

export class HttpServer implements IHttpServer {
	private server: http.Server;
	private hotReloadServer?: HotReloadServer;
	private compiler: EsbuildCompiler;
	private freePort = 0;
	private freeWsPort?: number;
	public hostname: string;
	public port: number;
	public wsPort: number;

	constructor(
		public config: AnastacioConfig,
		public mode: ServerMode,
		overrides: HttpServerOverrides = {},
	) {
		this.hostname = overrides.host ?? config.dev.host;
		this.port = overrides.port ?? config.dev.port;
		this.wsPort = overrides.wsPort ?? config.dev.wsPort;
		this.validateRuntimeConfig();
		this.server = http.createServer(
			staticFileController(config.paths.outDir),
		);
		this.hotReloadServer =
			mode === ServerMode.Development
				? new HotReloadServer(this.wsPort)
				: undefined;
		this.compiler = new EsbuildCompiler(config, mode, this.hotReloadServer);
	}

	async init() {
		this.freePort = await FindFreePort(this.port);
		if (this.hotReloadServer) {
			this.freeWsPort = await FindFreePort(this.wsPort);
			if (this.freeWsPort !== this.wsPort) {
				this.hotReloadServer.close();
				this.hotReloadServer = new HotReloadServer(this.freeWsPort);
				this.compiler = new EsbuildCompiler(
					this.config,
					this.mode,
					this.hotReloadServer,
				);
			}
		}

		await this.compiler.compile();
		await new Promise<void>((resolve) => {
			this.server.listen(this.freePort, this.hostname, () => {
				console.log(
					`Server running at http://${this.hostname}:${this.freePort}/`,
				);
				if (this.hotReloadServer && this.freeWsPort) {
					console.log(
						`WebSocket server running at ws://${this.hostname}:${this.freeWsPort}/`,
					);
				}
				resolve();
			});
		});
	}

	start(): Promise<void> {
		return this.init();
	}

	notifyClients() {
		if (this.hotReloadServer) {
			this.hotReloadServer.notifyClients();
		}
	}

	async handleSessionStop(signal: NodeJS.Signals): Promise<void> {
		console.log(`Received ${signal}. Closing servers...`);
		await this.closeServers();
		process.exit(0);
	}

	private validateRuntimeConfig(): void {
		for (const [label, value] of [
			["port", this.port],
			["wsPort", this.wsPort],
		] as const) {
			if (!Number.isInteger(value) || value < 1 || value > 65535) {
				throw new Error(
					`Invalid ${label}: ${value}. Use a port between 1 and 65535 in anastacio.config.ts or CLI options.`,
				);
			}
		}
	}

	public async closeServers(): Promise<void> {
		await this.compiler.dispose();
		await new Promise<void>((resolve) => {
			if (!this.server.listening) {
				resolve();
				return;
			}

			this.server.close(() => {
				console.log("HTTP server closed");
				resolve();
			});
		});
		if (this.hotReloadServer) {
			this.hotReloadServer.close();
		}
	}
}
