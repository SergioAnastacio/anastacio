// src/adapters/controllers/CompressResponse.ts
import type { ServerResponse } from "node:http";
import zlib from "node:zlib";

export const compressResponse = (
	res: ServerResponse,
	content: Buffer,
	contentType: string,
) => {
	res.writeHead(200, {
		"Content-Type": contentType,
		"Content-Encoding": "gzip",
	});
	const gzip = zlib.createGzip();
	gzip.end(content);
	gzip.pipe(res);
};
