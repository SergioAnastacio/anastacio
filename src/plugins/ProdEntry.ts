import type { Plugin } from "esbuild";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export const ProdPlugin = (): Plugin => ({
	name: "prod-plugin",
	setup(build) {
		build.onEnd(() => {
			const outputDir = join(process.cwd(), "dist");
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
</body>
</html>
            `;
			writeFileSync(join(outputDir, "index.html"), htmlContent);
		});
	},
});
