import {Socket} from "net";
import {Header, headerEnd} from "./header";

export class Request {
    public method: string;
    public url: string;
    public httpVersion: string;
    public headers: Header;
    public body: Socket;

    public constructor(socket: Socket) {
        this.readHeader(socket);
    }

    /**
     * Reads the http header and leaves the body as a readable socket.
     * @param socket containing a http request.
     */
    private readHeader(socket: Socket): void {
        let buffer = Buffer.alloc(0);
        let chunk;

        while((chunk = socket.read()) !== null){
            buffer = Buffer.concat([buffer, chunk]);
            const requestHeaderEnd = buffer.indexOf(headerEnd);

            if(requestHeaderEnd !== -1){
                socket.unshift(buffer.slice(requestHeaderEnd + 4));
                this.parseHeader(buffer.slice(0, requestHeaderEnd).toString());
                this.body = socket;
            }
        }
    }

    private parseHeader(header: string){
        const rawHeaders = header.split("\r\n");
        const [method, url, httpVersion] = rawHeaders.shift().split(" ");
        const headers = rawHeaders
            .filter(header => header)
            .reduce((allHeaders: object, currentHeader: string) => {
                const [key, value] = currentHeader.split(": ");
                return {
                    ...allHeaders,
                    [key.trim().toLowerCase()]: value.trim()
                };
            }, {});

        this.method = method;
        this.url = url;
        this.httpVersion = httpVersion.split("/")[1];
        this.headers = headers;
    }
}