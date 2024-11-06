import { formatTime, Timer } from "../utils/Timer.js";
import { EsbuildCompiler } from "../infrastructure/compiler/EsbuildCompiler.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";
import { join } from "node:path";

interface BuildAppOptions {
	mode: string;
}
export async function buildApp(options: BuildAppOptions): Promise<void> {
	//Get dist folder on the root of the project
	const distDir = join(process.cwd(), "dist");
	//Get src folder on the root of the project
	const srcDir = join(process.cwd(), "src/index.tsx");
	//Define the servermode
	const serverMode =
		options.mode === "production"
			? ServerMode.Production
			: ServerMode.Development;
	// Initialize the compiler
	const compiler = new EsbuildCompiler([srcDir], distDir, serverMode);
	// Build the application
	await Timer(`${options.mode} Build`, async () => {
		console.log(`[${formatTime()}]`, "Building the application...");
		await compiler.compile(); //Compile the code
	});
	console.log(`[${formatTime()}]`, "Build completed successfully...");
}
