import {HttpRequest, Server} from "./Server";

const handleRequest = ({request, response}: HttpRequest) => {
    console.log(request, response);
    response.addHeaders({"Content-Type": "text/plain"});
    response.end("Hello World");
};

new Server().listen(3000, handleRequest).catch(err => {
    console.error(err);
    process.exit(1);
});
