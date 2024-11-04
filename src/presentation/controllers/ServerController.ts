import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateServer } from "../../application/use-cases/CreateServer.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ServerController {
    private buildPath: string;

    constructor(private createServer: CreateServer, buildPath?: string) {
        // Usar la ruta proporcionada o buscar automáticamente la carpeta build en el directorio del proyecto del usuario
        this.buildPath = buildPath || path.join(process.cwd(), "dist");
    }

    public create(req: IncomingMessage, res: ServerResponse): void {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const { name, port } = JSON.parse(body);
            try {
                const server = this.createServer.execute(name, port);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(server));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: (error as Error).message }));
            }
        });
    }

    public handleStaticFiles(req: IncomingMessage, res: ServerResponse): void {
        let filePath: string;
        if (req.url?.startsWith("/img")) {
            filePath = path.join(this.buildPath, "img", req.url.replace("/img", ""));
        } else {
            filePath = path.join(this.buildPath, req.url === "/" ? "index.html" : req.url || "");
        }

        const extname = path.extname(filePath);
        let contentType = "text/html";

        switch (extname) {
            case ".js":
                contentType = "application/javascript";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".json":
                contentType = "application/json";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".jpg":
                contentType = "image/jpg";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            case ".svg":
                contentType = "image/svg+xml";
                break;
            default:
                contentType = "text/html";
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                // Si el archivo no existe, redirigir a index.html para que React Router maneje la ruta
                fs.readFile(path.join(this.buildPath, "index.html"), (error, indexContent) => {
                    if (error) {
                        console.error(`Error reading index.html: ${error.message}`);
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end(`Server Error: ${error.message}`);
                    } else {
                        res.writeHead(200, { "Content-Type": "text/html" });
                        res.end(indexContent, "utf-8");
                    }
                });
            } else {
                // Si el archivo existe, servirlo
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content, "utf-8");
            }
        });
    }
}