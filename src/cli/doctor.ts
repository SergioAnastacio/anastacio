import { diagnoseProject, formatDoctorReport } from "../doctor/index.js";

interface DoctorAppOptions {
	root?: string;
	json?: boolean;
}

export async function doctorApp(options: DoctorAppOptions): Promise<void> {
	const report = await diagnoseProject(options.root ?? process.cwd());

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	console.log(formatDoctorReport(report));
}
