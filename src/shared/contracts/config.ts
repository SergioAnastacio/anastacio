export interface AnastacioDevConfig {
	host: string;
	port: number;
	wsPort: number;
}

export interface AnastacioPathsConfig {
	srcDir: string;
	appDir: string;
	publicDir: string;
	outDir: string;
	entryFile: string;
	internalDir: string;
	bundleFile: string;
}

export interface AnastacioConfig {
	rootDir: string;
	paths: AnastacioPathsConfig;
	dev: AnastacioDevConfig;
}

export interface AnastacioUserPathsConfig {
	srcDir?: string;
	appDir?: string;
	publicDir?: string;
	outDir?: string;
	entryFile?: string;
	internalDir?: string;
	bundleFile?: string;
}

export interface AnastacioUserConfig {
	paths?: AnastacioUserPathsConfig;
	dev?: Partial<AnastacioDevConfig>;
}
