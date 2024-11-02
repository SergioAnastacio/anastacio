// src/domain/entities/Server.ts
export class Server {
  constructor(
    public id: string,
    public name: string,
    public port: number
  ) {}

  // Métodos de negocio
  public changePort(newPort: number): void {
    this.port = newPort;
  }
}