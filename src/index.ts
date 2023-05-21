import { Server, IncomingMessage, ServerResponse, Agent, request } from 'node:http';
import { Socket } from 'node:net';

let server = new Server();

server.addListener('request', (req: IncomingMessage, res: ServerResponse) => {

    console.log('Server_request');
    console.log('IncomingMessage.socket.remotePort', req.socket.remotePort);
    let data = '';

    req.addListener('close', () => console.log('IncomingMessage_close'));

    req.addListener('data', (chunk: string) => {
        console.log('IncomingMessage_data', chunk.toString());
        data = data + chunk;
    })

    req.addListener('close', () => {
        console.log('IncomingMessage_close');
        res.end('RESPONSE');
    }) 

    req.addListener('end', () => console.log('IncomingMessage_end'));
})

server.listen(3000, "127.0.0.1");

server.addListener('close', () => console.log('sever_close'));

server.addListener('connection', (socket: Socket) => {
    // "This event is emitted when a new TCP stream is established (https://nodejs.org/api/http.html#event-connection)." 
    socket.addListener('close', () => console.log('Socket_close'));
    console.log("Socket.localPort", socket.localPort);
    console.log("Socket.remotePort", socket.remotePort);
})

let agent = new Agent({ keepAlive: true, maxSockets: 1, timeout: 2000 });

let req0 = request(
    { 
        agent: agent,
        hostname: '127.0.0.1',
        port: 3000,
        path: '/',
        method: 'POST'
    });

req0.write("DATA0");
req0.end();

//  The Socket is still open; hence, make another request using the same port number.
let req1 = request(
    {
        agent: agent,
        hostname: '127.0.0.1',
        port: 3000,
        path: '/',
        method: 'POST'
    });

req1.write('DATA1');
req1.end();


setTimeout(() => {
    //  Use the same agent to make another request.  The Socket above has been closed; hence, this request will have a different port number.
    let req2 = request(
        {
            agent: agent,
            hostname: '127.0.0.1',
            port: 3000,
            path: '/',
            method: 'POST'
        })

    req2.write('DATA2');
    req2.end();
}, 5000);

