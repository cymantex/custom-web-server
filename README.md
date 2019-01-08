## Important note
This was developed as a learning experience and should not be used in a production environment.

## Custom web server
This is an example of a web server written from scratch using Node.js streams. The code is based on a guide you can find here: 
https://www.codementor.io/ziad-saab/let-s-code-a-web-server-from-scratch-with-nodejs-streams-h4uc9utji

## Sample usage
```javascript 
import {Server} from "./Server";

const handleRequest = ({request, response, error}) => {
    if(error){
        return response.send(error.message);
    } else if(request.method === "POST"){
        return response.send(`You posted:\n${request.readBody()}`);
    }

    switch(request.url){
    case "/":
        break;
    case "/xml":
        //The response will set an appropriate content-type automatically if none is provided.
        response.send(`
            <?xml version="1.0" encoding="UTF-8"?>
            <sample>This is a sample XML response</sample>
        `);
        break;
    case "/error":
        response.setStatus(400, "Bad Request").send();
        break;
    case "/hello":
        response.send("Hello!");
        break;
    default:
        response.send(request);
        break;
    }
};

//It's also possible to map specific routes and methods to a unique request handler.
server.get("/", ({response}) => response.send(`
    <html lang="en">
        <head><title>Custom Server</title></head>
        <body><h1>This is a sample HTML response</h1></body>
    </html>
`));

new Server({port: 3000})
    .start(handleRequest)
    .catch(async err => {
        console.error(err);
        process.exit(1);
    });
```
