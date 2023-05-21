import { Server, IncomingMessage, ServerResponse, Agent, request } from 'node:http';
import { Socket } from 'node:net';

console.log('\n\n');

let server = new Server({ keepAlive: true, keepAliveTimeout: 4000 });

server.addListener('request', (req: IncomingMessage, res: ServerResponse) => {

    console.log('Server_request');
    console.log(req.headers);
    console.log('IncomingMessage.socket.remotePort', req.socket.remotePort);

    let data = '';

    req.addListener('data', (chunk: string) => {
        console.log('IncomingMessage_data');
        data = data + chunk;
    });

    req.addListener('close', () => {
        console.log('IncomingMessage_close');
    });

    req.addListener('end', () => {
        console.log('IncomingMessage_end');
        res.end('');
    });
});

server.listen(3000, "127.0.0.1");

server.addListener('close', () => console.log('Server_close'));

server.addListener('connection', (socket: Socket) => {
    // "This event is emitted when a new TCP stream is established (https://nodejs.org/api/http.html#event-connection)." 
    socket.addListener('close', () => console.log('Socket_close'));
    console.log("Socket.localPort", socket.localPort);
    console.log("Socket.remotePort", socket.remotePort);
})

let agent = new Agent({ keepAlive: true, maxSockets: 1, timeout: 2000 });

// The agent will keep the socket open for 2 seconds.
let req0 = request(
    {
        agent: agent,
        hostname: '127.0.0.1',
        port: 3000,
        path: '/',
        method: 'POST'
    }, (res: IncomingMessage) => {
        console.log(res.headers);
        res.resume();
    });

req0.end("0");

// The Socket is still open; hence, make another request using the same destination port number (i.e., the same socket).
let req1 = request(
    {
        agent: agent,
        hostname: '127.0.0.1',
        port: 3000,
        path: '/',
        method: 'POST'
    }, (res: IncomingMessage) => {
        console.log(res.headers);
        res.resume();
        // Drain the Readable.
    });

req1.end("1");


setTimeout(() => {
    // Use the same agent to make another request.
    // The Socket has been closed (> 2000ms); hence, this request will likely have a different destination port number (i.e., a new Socket).
    let req2 = request(
        {
            agent: agent,
            hostname: '127.0.0.1',
            port: 3000,
            path: '/',
            method: 'POST'
        }, (res: IncomingMessage) => {
            console.log(res.headers);
            res.resume();
            // Drain the Readable.
        });

    req2.end("2");
}, 5000);

