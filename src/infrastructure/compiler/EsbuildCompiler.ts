// src/infrastructure/compiler/EsbuildCompiler.ts

import { existsSync, watch } from "node:fs";
import colors from "colors";
import type esbuild from "esbuild";
import { type BuildOptions, context } from "esbuild";
import { RouterPlugin } from "../../plugins/AppRouter.js";
import { DevPlugin } from "../../plugins/DevEntry.js";
import { MinifyImagesPlugin } from "../../plugins/MinifyImages.js";
import { PostCSSPlugin } from "../../plugins/PostCSSPlugin.js";
import { ProdPlugin } from "../../plugins/ProdEntry.js";
import type { AnastacioConfig } from "../../shared/contracts/index.js";
import { formatTime, Timer } from "../../utils/Timer.js";
import { ServerMode } from "../webserver/ServerMode.js";
import type { HotReloadServer } from "../websocket/HotReloadServer.js";
import type { IEsbuildCompiler } from "./IEsbuildCompiler.js";

export class EsbuildCompiler implements IEsbuildCompiler {
	public config: AnastacioConfig;
	public entryPoints: string[];
	public outfile: string;
	public mode: ServerMode;
	private hotReloadServer?: HotReloadServer;
	private ctx: esbuild.BuildContext | null = null;

	constructor(
		config: AnastacioConfig,
		mode: ServerMode,
		hotReloadServer?: HotReloadServer,
	) {
		this.config = config;
		this.entryPoints = [config.paths.entryFile];
		this.outfile = config.paths.bundleFile;
		this.mode = mode;
		this.hotReloadServer = hotReloadServer;
	}

	async compile() {
		this.validateInputs();
		await this.dispose();
		const plugins = this.getPlugins();
		const buildOptions = this.getBuildOptions(plugins);

		try {
			// Crear un contexto de compilación con las opciones
			this.ctx = await context(buildOptions);

			if (this.mode === ServerMode.Development) {
				await this.startWatching();
			} else {
				await this.runBuild();
			}
		} catch (error) {
			console.error("Build failed:", error);
			throw error;
		}
	}

	private getPlugins() {
		//usamos el switch para determinar el modo de compilación y que nos otorgue los plugins correspondientes
		switch (this.mode) {
			case ServerMode.Development:
				return [
					DevPlugin(this.config),
					RouterPlugin(this.config),
					PostCSSPlugin(), // Pasar el directorio de salida
					MinifyImagesPlugin(this.config),
				];
			//Como no tenemos mas casos pasamos directo a production mode default
			default:
				return [
					ProdPlugin(this.config),
					RouterPlugin(this.config),
					PostCSSPlugin(), // Pasar el directorio de salida
					MinifyImagesPlugin(this.config),
				];
		}
	}

	private getBuildOptions(plugins: esbuild.Plugin[]): BuildOptions {
		return {
			entryPoints: this.entryPoints,
			outfile: this.outfile,
			bundle: true,
			minify: this.mode === ServerMode.Production,
			sourcemap: this.mode === ServerMode.Development,
			target: "es2022",
			loader: {
				".js": "jsx",
				".ts": "tsx",
				".svg": "dataurl",
				".png": "dataurl",
				".jpg": "dataurl",
				".jpeg": "dataurl",
				".gif": "dataurl",
				".ico": "dataurl",
				".scss": "text",
			},
			define: { "process.env.NODE_ENV": `"${this.mode}"` },
			plugins,
		};
	}

	private async startWatching() {
		await this.ctx?.watch();
		console.log(formatTime(), "Watching for changes...");

		watch(
			this.config.paths.srcDir,
			{ recursive: true, encoding: "utf8" },
			async (_eventType: string, filename: string | null) => {
				if (filename) {
					if (filename.replace(/\\/g, "/").endsWith("AppRouter.tsx")) {
						return;
					}

					console.log(
						colors.bgBlack(colors.yellow(`File ${filename} changed.`)),
					);
					try {
						await Timer("Rebuild", async () => {
							await this.ctx?.rebuild();
						});
						console.log(
							colors.bgBlack(colors.green("Rebuild completed successfully.")),
						);
						this.hotReloadServer?.notifyClients();
					} catch (error) {
						console.error(colors.bgBlack(colors.red("Rebuild failed.")), error);
					}
				}
			},
		);
	}

	private validateInputs(): void {
		if (!existsSync(this.config.paths.srcDir)) {
			throw new Error(
				`Source directory not found: ${this.config.paths.srcDir}. ` +
					"Create the directory or configure paths.srcDir in anastacio.config.ts.",
			);
		}

		if (!existsSync(this.config.paths.entryFile)) {
			throw new Error(
				`Entry file not found: ${this.config.paths.entryFile}. ` +
					"Create the file or configure paths.entryFile in anastacio.config.ts.",
			);
		}
	}

	// Método para compilar el código
	// ! No existe el método build en la interfaz IEsbuildCompiler
	// ! Por lo que usamos el método rebuild
	async dispose(): Promise<void> {
		if (this.ctx) {
			await this.ctx.dispose();
			this.ctx = null;
		}
	}

	private async runBuild() {
		await Timer("Build", async () => {
			if (this.ctx) {
				await this.ctx.rebuild();
				await this.dispose();
			}
		});
		console.log("Build completed successfully.");
	}
}
