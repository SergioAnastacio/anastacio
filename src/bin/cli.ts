#!/usr/bin/env node
import { Command } from "commander";
import { startApp } from "../cli/start.js";
import { buildApp } from "../cli/build.js";
import { devApp } from "../cli/dev.js";
import { inspectApp } from "../cli/inspect.js";
import { doctorApp } from "../cli/doctor.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();
// Obtenemos la versión del paquete del package.json
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../../package.json"), "utf8"),
);

function parsePort(value: string): number {
	const parsedPort = Number.parseInt(value, 10);

	if (Number.isNaN(parsedPort)) {
		throw new Error(`Invalid port value: ${value}`);
	}

	return parsedPort;
}

program
	.name("anastacio")
	.description("CLI for the Anastacio framework")
	.version(packageJson.version); // Asignamos la versión

program
	.command("start")
	.description("Start the application in production mode")
	.option("-p, --port <port>", "Specify a port number", parsePort)
	.option("-r, --root <path>", "Project root directory", ".")
	.action(async (options) => {
		await startApp(options);
	});

program
	.command("build")
	.description("Build the application for production")
	.option("-m, --mode <mode>", "Specify the build mode", "production")
	.option("-r, --root <path>", "Project root directory", ".")
	.action(async (options) => {
		await buildApp(options);
	});

program
	.command("dev")
	.description("Start the application in development mode")
	.option("-p, --port <port>", "Specify a port number", parsePort)
	.option("-r, --root <path>", "Project root directory", ".")
	.action(async (options) => {
		await devApp(options);
	});

program
	.command("inspect")
	.description("Inspect the project structure and emit manifests")
	.option("-r, --root <path>", "Project root directory", ".")
	.option("--json", "Emit machine-readable JSON output", false)
	.action(async (options) => {
		await inspectApp(options);
	});

program
	.command("doctor")
	.description("Run structural diagnostics and emit diagnostics.json")
	.option("-r, --root <path>", "Project root directory", ".")
	.option("--json", "Emit machine-readable JSON output", false)
	.action(async (options) => {
		await doctorApp(options);
	});

await program.parseAsync(process.argv);
