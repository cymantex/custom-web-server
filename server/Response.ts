import {Socket} from "net";
import {Header, headerEnd} from "./header";

export class Response {
    private socket: Socket;
    private status: number;
    private statusText: string;
    private protocol: string;
    private hasSentHeaders: boolean;
    private isChunked: boolean;
    private readonly header: Header;

    constructor(socket: Socket) {
        this.socket = socket;
        this.status = 200;
        this.statusText = "OK";
        this.protocol = "HTTP/1.1";
        this.hasSentHeaders = false;
        this.isChunked = false;
        this.header = {server: "custom-server"};
    }

    public addHeaders(headers: Header): Response {
        Object.keys(headers).forEach(key => {
            this.header[key.toLowerCase()] = headers[key];
        });

        return this;
    }

    public send(): void {
        this.checkHeadersNotSent();
        this.hasSentHeaders = true;
        this.addHeaders({"date": new Date().toUTCString()});
        this.socket.write(`${this.protocol} ${this.status} ${this.statusText}\r\n`);
        Object.keys(this.header).forEach(headerKey => {
            this.socket.write(`${headerKey}: ${this.header[headerKey]}\r\n`);
        });
        this.socket.write("\r\n");
    }

    public write(chunk: Buffer): void {
        if(!this.hasSentHeaders){
            if(!this.header["content-length"]){
                this.isChunked = true;
                this.addHeaders({"transfer-encoding": "chunked"});
            }
            this.send();
        }

        this.writeChunk(chunk);
    }

    public end(chunk: any): void {
        if(!this.hasSentHeaders){
            if(!this.header["content-length"]){
                this.addHeaders({"content-length": chunk ? chunk.length : 0});
            }
            this.send();
        }

        this.writeChunk(chunk);

        if(this.isChunked){
            this.socket.end(`0${headerEnd}`);
        }
    }

    public setProtocol(protocol: string): Response {
        this.protocol = protocol;
        return this;
    }

    public setStatus(status: number, statusText: string = "OK"): Response {
        this.status = status;
        this.statusText = statusText;
        return this;
    };

    public json(data: object): void {
        this.checkHeadersNotSent();
        const json = new Buffer(JSON.stringify(data));
        this.addHeaders({
            "content-type": "application/json; charset=utf-8",
            "content-length": json.length
        });
        this.send();
        this.socket.end(json);
    }

    private checkHeadersNotSent(): void {
        if(this.hasSentHeaders){
            throw new Error("Headers have already been sent.");
        }
    }

    private writeChunk(chunk: any): void {
        if(this.isChunked){
            if(chunk){
                const size = (chunk.length).toString(16);
                this.socket.write(`${size}\r\n`);
                this.socket.write(chunk);
                this.socket.write("\r\n");
            }
        } else {
            this.socket.end(chunk);
        }
    }
}