export class ServerRepository {
    servers = [];
    create(server) {
        this.servers.push(server);
    }
    read() {
        return this.servers;
    }
    update(server) {
        const index = this.servers.findIndex(s => s.id === server.id);
        if (index !== -1) {
            this.servers[index] = server;
        }
    }
    delete(server) {
        this.servers = this.servers.filter(s => s.id !== server.id);
    }
}
