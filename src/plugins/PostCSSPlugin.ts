import { readFileSync } from "node:fs";
import tailwindPostcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import type { Plugin } from "esbuild";
import postcss from "postcss";

export const PostCSSPlugin = (): Plugin => ({
	name: "postcss-plugin",
	setup(build) {
		build.onLoad({ filter: /\.css$/ }, async (args) => {
			const css = readFileSync(args.path, "utf8");
			const result = await postcss([
				tailwindPostcss(),
				autoprefixer,
				cssnano,
			]).process(css, {
				from: args.path,
				to: args.path,
			});
			//const outputPath = join(dirname(args.path), "styles.min.css"); // Cambiar la ruta de salida
			//writeFileSync(outputPath, result.css);
			return {
				contents: result.css,
				loader: "css",
			};
		});
	},
});
