export interface Diagnostic {
	code: string;
	severity: "error" | "warning" | "info";
	message: string;
	file?: string;
	suggestion?: string;
}

export interface DiagnosticReport {
	kind: "diagnostic-report";
	version: 1;
	diagnostics: Diagnostic[];
}
