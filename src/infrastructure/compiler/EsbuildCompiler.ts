// src/infrastructure/compiler/EsbuildCompiler.ts
import type esbuild from "esbuild";
import { watch } from "node:fs";
import colors from "colors";
import { type BuildOptions, context } from "esbuild";
import { ServerMode } from "../webserver/ServerMode.js";
import type { IEsbuildCompiler } from "./IEsbuildCompiler.js";
import type { HotReloadServer } from "../websocket/HotReloadServer.js";
import { formatTime, Timer } from "../../utils/Timer.js";
import { DevPlugin } from "../../plugins/DevEntry.js";
import { ProdPlugin } from "../../plugins/ProdEntry.js";
import { MinifyImagesPlugin } from "../../plugins/MinifyImages.js";
import { RouterPlugin } from "../../plugins/AppRouter.js";
import { PostCSSPlugin } from "../../plugins/PostCSSPlugin.js";

export class EsbuildCompiler implements IEsbuildCompiler {
	public entryPoints: string[];
	public outdir: string;
	public mode: ServerMode;
	private hotReloadServer?: HotReloadServer;
	private ctx: esbuild.BuildContext | null = null;

	constructor(
		entryPoints: string[],
		outdir: string,
		mode: ServerMode,
		hotReloadServer?: HotReloadServer,
	) {
		this.entryPoints = entryPoints;
		this.outdir = outdir;
		this.mode = mode;
		this.hotReloadServer = hotReloadServer;
	}

	async compile() {
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
					DevPlugin(),
					RouterPlugin(),
					PostCSSPlugin(), // Pasar el directorio de salida
					MinifyImagesPlugin(),
				];
			//Como no tenemos mas casos pasamos directo a production mode default
			default:
				return [
					ProdPlugin(),
					RouterPlugin(),
					PostCSSPlugin(), // Pasar el directorio de salida
					MinifyImagesPlugin(),
				];
		}
	}

	private getBuildOptions(plugins: esbuild.Plugin[]): BuildOptions {
		return {
			entryPoints: this.entryPoints,
			outfile: this.outdir, // Mantener outfile para los archivos JavaScript
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
				 ".scss": "text", // Cambiar el loader de .css a .scss para evitar el procesamiento doble
			},
			define: { "process.env.NODE_ENV": `"${this.mode}"` },
			plugins,
		};
	}

	private async startWatching() {
		await this.ctx?.watch();
		console.log(formatTime(), "Watching for changes...");

		watch(
			"src",
			{ recursive: true, encoding: "utf8" },
			async (eventType: string, filename: string | null) => {
				if (filename) {
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

	// Método para compilar el código
	// ! No existe el método build en la interfaz IEsbuildCompiler
	// ! Por lo que usamos el método rebuild
	private async runBuild() {
		await Timer("Build", async () => {
			if (this.ctx) {
				await this.ctx.rebuild();
			}
		});
		console.log("Build completed successfully.");
	}
}
