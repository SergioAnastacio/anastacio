export interface RouteDefinition {
	path: string;
	file: string;
	layout?: string;
	dynamicParams?: string[];
	hasLoading?: boolean;
	hasErrorBoundary?: boolean;
	hasNotFound?: boolean;
}

export interface RoutesManifest {
	kind: "routes-manifest";
	version: 1;
	appDir: string;
	routes: RouteDefinition[];
}
