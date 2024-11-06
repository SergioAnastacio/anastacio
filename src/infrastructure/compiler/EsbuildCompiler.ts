// src/infrastructure/compiler/EsbuildCompiler.ts
import type esbuild from "esbuild";
import { watch } from "node:fs";
import colors from "colors";
import { type BuildOptions, context } from "esbuild";
import { ServerMode } from "../webserver/ServerMode.js";
import type { IEsbuildCompiler } from "./IEsbuildCompiler.js";
import type { HotReloadServer } from "../websocket/HotReloadServer.js";
import { formatTime, Timer } from "../../utils/Timer.js";
import { MinifyCSSPlugin } from "../../plugins/MinifyCss.js";
import { DevPlugin } from "../../plugins/DevEntry.js";
import { ProdPlugin } from "../../plugins/ProdEntry.js";
import { MinifyImagesPlugin } from "../../plugins/MinifyImages.js";
import { RouterPlugin } from "../../plugins/AppRouter.js";

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
		//crear un array de plugins
		const plugins = [];
		if (this.mode === ServerMode.Production) {
			//Agregar el plugin de minificación
			plugins.push(
				ProdPlugin(),
				RouterPlugin(),
				MinifyCSSPlugin(),
				MinifyImagesPlugin(),
			);
		} else {
			//Agregar el plugin de desarrollo
			plugins.push(DevPlugin(), RouterPlugin(), MinifyImagesPlugin());
		}

		try {
			const buildOptions: BuildOptions = {
				entryPoints: this.entryPoints,
				outdir: this.outdir,
				bundle: true,
				minify: this.mode === ServerMode.Production,
				sourcemap: this.mode === ServerMode.Development,
				target: "es2022",
				loader: { ".js": "jsx", ".ts": "tsx" },
				define: { "process.env.NODE_ENV": `"${this.mode}"` },
				plugins,
			};

			this.ctx = await context(buildOptions);

			if (this.mode === ServerMode.Development) {
				await this.ctx.watch();
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
									colors.bgBlack(
										colors.green("Rebuild completed successfully."),
									),
								);
								// Notificar a los clientes conectados
								this.hotReloadServer?.notifyClients();
							} catch (error) {
								console.error(
									colors.bgBlack(colors.red("Rebuild failed.")),
									error,
								);
							}
						}
					},
				);
			} else {
				await Timer("Build", async () => {
					if (this.ctx) {
						await this.ctx.rebuild();
					}
				});
				console.log("Build completed successfully.");
			}
		} catch (error) {
			console.error("Build failed:", error);
			throw error;
		}
	}
}
