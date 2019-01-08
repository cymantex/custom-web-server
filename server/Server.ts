import net, {Server as TcpServer, Socket} from "net";
import {Response} from "./Response";
import {Request} from "./Request";

export type HttpRequest = {request?: Request, response?: Response, error?: Error};
export type RequestHandler = (httpRequest: HttpRequest) => any;

export class Server {
    server: TcpServer;

    public constructor(){
        this.server = net.createServer();
    }

    public async listen(port: number, requestHandler: RequestHandler): Promise<TcpServer> {
        return new Promise(resolve => {
            this.server.on("connection", async (socket) => {
                try {
                    const httpRequest = await Server.onConnection(socket);
                    requestHandler(httpRequest);
                } catch(error){
                    console.error(error.message);
                    requestHandler({
                        response: new Response(socket),
                        error
                    });
                }
            });
            resolve(this.server.listen(port));
        });
    }

    public async close(){
        if(this.server.listening){
            return new Promise(resolve => {
                this.server.close(() => resolve());
            });
        }
    }

    private static async onConnection(socket: Socket): Promise<HttpRequest> {
        return new Promise((resolve, reject) => {
            socket.once("readable", () => {
                try {
                    resolve({
                        request: new Request(socket),
                        response: new Response(socket)
                    });
                } catch(error){
                    reject(error);
                }
            });
        });
    }
}