import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import type {
	AnastacioConfig,
	AnastacioUserConfig,
	AnastacioUserPathsConfig,
} from "../../shared/contracts/index.js";

const CONFIG_FILE_NAMES = [
	"anastacio.config.ts",
	"anastacio.config.js",
	"anastacio.config.mjs",
	"anastacio.config.json",
];

export async function loadAnastacioConfig(
	projectRoot = process.cwd(),
): Promise<AnastacioConfig> {
	const rootDir = resolve(projectRoot);
	const configPath = findAnastacioConfigPath(rootDir);
	const userConfig = configPath
		? await loadUserConfigFile(configPath)
		: ({} satisfies AnastacioUserConfig);

	return resolveAnastacioConfig(rootDir, userConfig);
}

export function findAnastacioConfigPath(projectRoot: string): string | null {
	for (const fileName of CONFIG_FILE_NAMES) {
		const candidate = join(projectRoot, fileName);
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return null;
}

async function loadUserConfigFile(
	configPath: string,
): Promise<AnastacioUserConfig> {
	if (configPath.endsWith(".json")) {
		return parseUserConfig(JSON.parse(readFileSync(configPath, "utf8")));
	}

	const result = await build({
		entryPoints: [configPath],
		bundle: true,
		format: "esm",
		platform: "node",
		write: false,
		logLevel: "silent",
		target: ["node22"],
	});

	const bundledCode = result.outputFiles[0]?.text;
	if (!bundledCode) {
		return {};
	}

	const moduleUrl = `data:text/javascript;base64,${Buffer.from(
		bundledCode,
		"utf8",
	).toString("base64")}`;
	const loadedModule = await import(moduleUrl);

	return parseUserConfig(loadedModule.default ?? loadedModule.config ?? {});
}

function parseUserConfig(value: unknown): AnastacioUserConfig {
	if (!isRecord(value)) {
		return {};
	}

	const paths = isRecord(value.paths)
		? parseUserPathsConfig(value.paths)
		: undefined;
	const dev = isRecord(value.dev) ? parseDevConfig(value.dev) : undefined;

	return {
		...(paths ? { paths } : {}),
		...(dev ? { dev } : {}),
	};
}

function parseUserPathsConfig(
	value: Record<string, unknown>,
): AnastacioUserPathsConfig {
	return {
		...(typeof value.srcDir === "string" ? { srcDir: value.srcDir } : {}),
		...(typeof value.appDir === "string" ? { appDir: value.appDir } : {}),
		...(typeof value.publicDir === "string"
			? { publicDir: value.publicDir }
			: {}),
		...(typeof value.outDir === "string" ? { outDir: value.outDir } : {}),
		...(typeof value.entryFile === "string"
			? { entryFile: value.entryFile }
			: {}),
		...(typeof value.internalDir === "string"
			? { internalDir: value.internalDir }
			: {}),
		...(typeof value.bundleFile === "string"
			? { bundleFile: value.bundleFile }
			: {}),
	};
}

function parseDevConfig(
	value: Record<string, unknown>,
): AnastacioUserConfig["dev"] {
	return {
		...(typeof value.host === "string" ? { host: value.host } : {}),
		...(typeof value.port === "number" ? { port: value.port } : {}),
		...(typeof value.wsPort === "number" ? { wsPort: value.wsPort } : {}),
	};
}

function resolveAnastacioConfig(
	rootDir: string,
	userConfig: AnastacioUserConfig,
): AnastacioConfig {
	const srcDir = resolveProjectPath(rootDir, userConfig.paths?.srcDir ?? "src");
	const outDir = resolveProjectPath(rootDir, userConfig.paths?.outDir ?? "dist");
	const appDir = resolveProjectPath(
		rootDir,
		userConfig.paths?.appDir ?? join(srcDir, "app"),
	);
	const entryFile = resolveProjectPath(
		rootDir,
		userConfig.paths?.entryFile ?? join(srcDir, "index.tsx"),
	);

	return {
		rootDir,
		paths: {
			srcDir,
			appDir,
			publicDir: resolveProjectPath(
				rootDir,
				userConfig.paths?.publicDir ?? "public",
			),
			outDir,
			entryFile,
			internalDir: resolveProjectPath(
				rootDir,
				userConfig.paths?.internalDir ?? ".anastacio",
			),
			bundleFile: resolveProjectPath(
				rootDir,
				userConfig.paths?.bundleFile ?? join(outDir, "bundler.js"),
			),
		},
		dev: {
			host: userConfig.dev?.host ?? "127.0.0.1",
			port: userConfig.dev?.port ?? 3000,
			wsPort: userConfig.dev?.wsPort ?? 3001,
		},
	};
}

function resolveProjectPath(projectRoot: string, targetPath: string): string {
	return isAbsolute(targetPath)
		? targetPath
		: resolve(projectRoot, targetPath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
