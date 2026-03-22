import {
	formatInspectionReport,
	inspectProject,
} from "../inspector/index.js";

interface InspectAppOptions {
	root?: string;
	json?: boolean;
}

export async function inspectApp(options: InspectAppOptions): Promise<void> {
	const report = await inspectProject(options.root ?? process.cwd());

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	console.log(formatInspectionReport(report));
}
