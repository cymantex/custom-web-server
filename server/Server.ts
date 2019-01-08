import net, {Server as TcpServer, Socket} from "net";
import {Response} from "./Response";
import {Request} from "./Request";

export type HttpRequest = {request?: Request, response?: Response, error?: Error};
export type RequestHandler = (httpRequest: HttpRequest) => any;
export interface Options {
    port: number,
    defaultRequestHandler?: RequestHandler
}

export class Server {
    private server: TcpServer;
    private options: Options;
    private readonly requestHandlers: {
        [route: string]: {
            handler: RequestHandler,
            method: string
        }
    };
    private defaultHandler: RequestHandler;

    public constructor(options: Options){
        this.server = net.createServer();
        this.options = options;
        this.requestHandlers = {};
        this.defaultHandler = (options.defaultRequestHandler)
            ? options.defaultRequestHandler : () => {};
    }

    public all(route: string, handler: RequestHandler){
        this.registerRequestHandler("ALL", route, handler);
    }

    public get(route: string, handler: RequestHandler){
        this.registerRequestHandler("GET", route, handler);
    }

    public post(route: string, handler: RequestHandler){
        this.registerRequestHandler("POST", route, handler);
    }

    public put(route: string, handler: RequestHandler){
        this.registerRequestHandler("PUT", route, handler);
    }

    public delete(route: string, handler: RequestHandler){
        this.registerRequestHandler("DELETE", route, handler);
    }

    public registerRequestHandler(method: string, route: string, handler: RequestHandler){
        this.requestHandlers[route] = {
            handler,
            method
        };
    }

    public async start(requestHandler: RequestHandler = () => {}): Promise<TcpServer> {
        this.defaultHandler = requestHandler;
        return new Promise(resolve => {
            this.server.on("connection", (socket) => this.handleConnection(socket));
            resolve(this.server.listen(this.options.port));
        });
    }

    public async stop(){
        if(this.server.listening){
            return new Promise(resolve => {
                this.server.close(() => resolve());
            });
        }
    }

    private getRequestHandler(request: Request): RequestHandler {
        const url = request.url.split("?")[0];
        const handler = Object
            .keys(this.requestHandlers)
            .filter(route => route === url)
            .filter(route =>
                (this.requestHandlers[route].method === request.method) ||
                (this.requestHandlers[route].method === "ALL")
            )
            .map(route => this.requestHandlers[route].handler)[0];

        return (handler) ? handler : this.defaultHandler;
    }

    private async handleConnection(socket: Socket){
        try {
            const httpRequest = await Server.onConnection(socket);
            this.getRequestHandler(httpRequest.request)(httpRequest);
        } catch(error){
            console.error(error.message);
            this.defaultHandler({
                response: new Response(socket),
                error
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