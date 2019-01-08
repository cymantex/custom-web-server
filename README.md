## Custom web server
This is an example of a web server written from scratch using Node.js streams. This was developed as a learning experience and should not be used on a production environment. The code is based on a guide you can find here: 
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
        //The response will set an appropriate content-type automatically if none is provided.
        response.send(`
            <html lang="en">
                <head><title>Custom Server</title></head>
                <body><h1>This is a sample HTML response</h1></body>
            </html>
        `);
        break;
    case "/xml":
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

new Server().listen(3000, handleRequest).catch(err => {
    console.error(err);
    process.exit(1);
});
```
