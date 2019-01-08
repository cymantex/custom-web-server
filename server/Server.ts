import net, {Server as TcpServer} from "net";

export class Server {
    private server: TcpServer;

    public constructor(){
        this.server = net.createServer();
    }

    public listen(port: number): void {
        this.server.on("connection", (socket) => {
            socket.on("data", (chunk) => {
                console.log("chunk: ", chunk.toString());
            });
            socket.write('HTTP/1.1 200 OK\r\nServer: my-web-server\r\nContent-Length: 0\r\n\r\n');
        });
        this.server.listen(port);
    }
}