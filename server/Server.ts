import net, {Server as TcpServer, Socket} from "net";

interface Request {
    header?: string,
    body?: Buffer
}

export class Server {
    server: TcpServer;

    public constructor(){
        this.server = net.createServer();
    }

    public async listen(port: number): Promise<TcpServer> {
        return new Promise(resolve => {
            this.server.on("connection", async (socket) => {
                const request = await Server.onConnection(socket);
                console.log("header:\n", request.header);
                resolve(this.server);
            });
            this.server.listen(port);
        });
    }

    public async close(){
        if(this.server.listening){
            return new Promise(resolve => {
                this.server.close(() => resolve());
            });
        }
    }

    private static async onConnection(socket: Socket): Promise<Request> {
        return new Promise(resolve => {
            socket.once("readable", async () => {
                try {
                    const request = Server.parseRequest(socket);
                    socket.unshift(request.body);
                    resolve(request);
                } catch(err){
                    socket.end(
                        Server.toHeader({
                            ["Server"]: "custom-server",
                            ["Content-Length"]: 0
                        })
                    );
                    resolve({});
                }
            });
        });
    }

    /**
     * Reads the http header and leaves the body as a readable buffer.
     * @param socket containing a http request.
     */
    private static parseRequest(socket: Socket): Request {
        let buffer = Buffer.alloc(0);
        let chunk;

        while((chunk = socket.read()) !== null){
            buffer = Buffer.concat([buffer, chunk]);
            const requestHeaderEnd = buffer.indexOf("\r\n\r\n");

            if(requestHeaderEnd !== -1){
                return {
                    header: buffer.slice(0, requestHeaderEnd).toString(),
                    body: buffer.slice(requestHeaderEnd + 4)
                };
            }
        }

        throw new Error("Unable to find end of request header");
    }

    private static toHeader(header: {[key: string]: any}, options: object = {}): string {
        const defaultOptions = {protocol: "HTTP/1.1", status: 200, statusText: "OK"};
        const {status, statusText, protocol} = {...defaultOptions, ...options};
        const headerStart = `${protocol} ${status} ${statusText}`;
        const headerBody = Object
            .keys(header)
            .map(key => `${key}: ${header[key]}\r\n`);
        const headerEnd = `\r\n\r\n`;

        return `${headerStart}${headerBody}${headerEnd}`;
    }
}