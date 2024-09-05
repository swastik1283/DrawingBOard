import { OPEN, Server } from 'ws';

import { createServer } from 'http';
import express from 'express';

const app = express();
const server = createServer(app);
const wss = new Server({ server });

let whiteboardState = []; 

wss.on('connection', (ws) => {
     ws.send(JSON.stringify(whiteboardState));

  ws.on('message', (message) => {
    const action = JSON.parse(message);

    
    whiteboardState.push(action);

   
    wss.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        client.send(JSON.stringify([action]));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
