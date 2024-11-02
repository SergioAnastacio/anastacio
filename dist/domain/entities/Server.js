// src/domain/entities/Server.ts
export class Server {
    id;
    name;
    port;
    constructor(id, name, port) {
        this.id = id;
        this.name = name;
        this.port = port;
    }
    // Métodos de negocio
    changePort(newPort) {
        this.port = newPort;
    }
}
