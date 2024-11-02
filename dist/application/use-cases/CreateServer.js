export class CreateServer {
    serverService;
    constructor(serverService) {
        this.serverService = serverService;
    }
    execute(name, port) {
        return this.serverService.createServer(name, port);
    }
}
