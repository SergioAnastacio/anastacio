// src/application/use-cases/FindFreePort.ts
import net from "node:net";

export class FindFreePort {
	public async execute(startPort: number): Promise<number> {
		return new Promise((resolve, reject) => {
			const server = net.createServer();
			server.unref();
			server.on("error", (err) => {
				if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
					// Si el puerto está en uso, intenta con el siguiente puerto
					this.execute(startPort + 1)
						.then(resolve)
						.catch(reject);
				} else {
					reject(err);
				}
			});

			server.listen(startPort, () => {
				const { port } = server.address() as net.AddressInfo;
				server.close(() => {
					resolve(port);
				});
			});
		});
	}
}
