import type { Plugin } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Timer } from "../utils/Timer.js";

export const MinifyCSSPlugin = (): Plugin => ({
	name: "minify-css-plugin",
	setup(build) {
		build.onEnd(async () => {
			await Timer("CSS minification", async () => {
				const srcDir = join(process.cwd(), "src");
				const outputDir = join(process.cwd(), "dist");
				const cssFilePath = join(srcDir, "styles.css");
				try {
					const cssContent = readFileSync(cssFilePath, "utf8");
					const minifiedCSS = minifyCSS(cssContent);
					writeFileSync(join(outputDir, "styles.min.css"), minifiedCSS);
					console.log("CSS minification completed successfully.");
				} catch (error) {
					console.error("CSS minification failed:", error);
				}
			});
		});
	},
});

function minifyCSS(css: string): string {
	return css
		.trim() //Eliminar espacios en blanco al principio y al final
		.replace(/\/\*[\s\S]*?\*\//g, "") // Eliminar comentarios
		.replace(/\s+/g, " ") // Reemplazar espacios en blanco múltiples por un solo espacio
		.replace(/\s*([{}:;,])\s*/g, "$1") // Eliminar espacios alrededor de {}, :, ; ,
		.replace(/;}/g, "}"); // Eliminar punto y coma antes de }
}
