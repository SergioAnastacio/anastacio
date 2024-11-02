import { Server } from "../entities/Server.js";
export class ServerService {
    serverRepository;
    constructor(serverRepository) {
        this.serverRepository = serverRepository;
    }
    createServer(name, port) {
        const server = new Server(Date.now().toString(), name, port);
        this.serverRepository.create(server);
        return server;
    }
    changeServerPort(serverId, newPort) {
        const server = this.serverRepository.read().find(s => s.id === serverId);
        if (!server) {
            throw new Error("Server not found");
        }
        server.changePort(newPort);
        this.serverRepository.update(server);
    }
}
