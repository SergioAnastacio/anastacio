import { formatTime, Timer } from "../utils/Timer.js";
import { EsbuildCompiler } from "../infrastructure/compiler/EsbuildCompiler.js";
import { ServerMode } from "../infrastructure/webserver/ServerMode.js";
import { createFrameworkContext } from "../core/index.js";

interface BuildAppOptions {
	mode: string;
	root?: string;
}
export async function buildApp(options: BuildAppOptions): Promise<void> {
	const framework = await createFrameworkContext(options.root ?? process.cwd());
	const { config } = framework;
	//Define the servermode
	const serverMode =
		options.mode === "production"
			? ServerMode.Production
			: ServerMode.Development;
	// Initialize the compiler
	const compiler = new EsbuildCompiler(config, serverMode);
	// Build the application
	await Timer(`${options.mode} Build`, async () => {
		console.log(`[${formatTime()}]`, "Building the application...");
		await compiler.compile(); //Compile the code
	});
	console.log(`[${formatTime()}]`, "Build completed successfully...");
}
