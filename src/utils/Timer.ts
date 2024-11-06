// src/utils/timer.ts
import colors from "colors";

export const formatTime = (timestamp?: number): string => {
	const effectiveTimestamp = timestamp ?? Date.now();
	const date = new Date(effectiveTimestamp);
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	return date.toLocaleTimeString("en-US", { hour12: false, timeZone });
};

export const Timer = async <T>(
	label: string,
	fn: () => Promise<T>,
): Promise<T> => {
	const startTime = Date.now();
	console.log(
		`[${formatTime(startTime)}]`,
		colors.blue(` ${label} started...`),
	);
	const result = await fn();
	const endTime = Date.now();
	console.log(
		`[${formatTime(endTime)}]`,
		colors.green(` ${label} completed in`),
		colors.yellow(`${endTime - startTime}ms.`),
	);
	return result;
};
