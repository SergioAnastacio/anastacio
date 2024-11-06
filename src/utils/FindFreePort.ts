// src/utils/FindFreePort.ts
import net from "node:net";

export async function FindFreePort(port: number): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on("error", () => {
			resolve(FindFreePort(port + 1));
		});
		server.listen(port, () => {
			const freePort = (server.address() as net.AddressInfo).port;
			server.close(() => {
				resolve(freePort);
			});
		});
	});
}
