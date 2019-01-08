import {Socket} from "net";
import {Header} from "./header";

export class Response {
    private socket: Socket;
    private status: number;
    private statusText: string;
    private protocol: string;
    private hasSentHeaders: boolean;
    private readonly header: Header;

    constructor(socket: Socket) {
        this.socket = socket;
        this.status = 200;
        this.statusText = "OK";
        this.protocol = "HTTP/1.1";
        this.hasSentHeaders = false;
        this.header = {server: "custom-server"};
    }

    public addHeaders(headers: Header): Response {
        Object.keys(headers).forEach(key => {
            this.header[key.toLowerCase()] = headers[key];
        });

        return this;
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

    public send(data: any = ""): void {
        if(typeof data === "string"){
            const string = data.trim();

            if(!this.header["content-type"]){
                this.setContentTypeByString(string);
            }

            this.end(string);
        } else {
            this.json(data);
        }
    }

    public end(data: any = ""): void {
        if(!this.header["content-length"]){
            this.addHeaders({"content-length": data.length});
        }

        this.sendHeaders().then(() => this.socket.end(data));
    }

    public json(data: object): void {
        const json = Buffer.from(JSON.stringify(data, null, 4));
        this.addHeaders({
            "content-type": "application/json; charset=utf-8",
            "content-length": json.length
        });

        this.sendHeaders().then(() => this.socket.end(json));
    }

    private async sendHeaders(): Promise<void> {
        if(this.hasSentHeaders){
            throw new Error("Headers have already been sent.");
        }

        this.hasSentHeaders = true;
        this.addHeaders({"date": new Date().toUTCString()});

        await this.write(`${this.protocol} ${this.status} ${this.statusText}\r\n`);
        await Promise.all(Object.keys(this.header)
            .map(key => this.write(`${key}: ${this.header[key]}\r\n`)));
        await this.write("\r\n");
    }

    private async write(data: any){
        return new Promise(resolve => {
            this.socket.write(data, () => resolve());
        });
    }

    private setContentTypeByString(string: string){
        if(string.startsWith("<html") && string.endsWith("</html>")){
            this.addHeaders({"content-type": "text/html"});
        } else if(string.startsWith("<?xml")) {
            this.addHeaders({"content-type": "text/xml"});
        } else {
            this.addHeaders({"content-type": "text/plain"});
        }
    }
}