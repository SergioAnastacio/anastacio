// src/application/use-cases/CreateServer.ts
import type { ServerService } from "../../domain/services/ServerService.js";
import type { Server } from "../../domain/entities/Server.js";

export class CreateServer {
  constructor(private serverService: ServerService) {}

  public execute(name: string, port: number): Server {
    return this.serverService.createServer(name, port);
  }
}