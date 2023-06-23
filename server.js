const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const wss = new WebSocket.Server({ noServer: true });

let clients = [];

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');
  ws.send(JSON.stringify({type: "connect", payload: "Welcome new client!"}));

  let newClient = {
    id: Date.now(),
    ws: ws,
    color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
    position: { x: Math.random() * 100, y: Math.random() * 100 }, // Random starting position
  };
  clients.push(newClient);

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    let msgObj = JSON.parse(message);
    if (msgObj.type === "move") {
      newClient.position = msgObj.payload;
      clients.forEach((client) => {
        if (client.id !== newClient.id) {
          client.ws.send(JSON.stringify({
            type: 'move',
            payload: {
              id: newClient.id,
              color: newClient.color,
              position: newClient.position,
            },
          }));
        }
      });
    }
  });

  ws.on('close', function close() {
    clients = clients.filter(client => client.id !== newClient.id);
  });
});

const server = app.listen(8080, () => {
  console.log('Listening on http://localhost:8080');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Serve the static files in the 'public' directory
app.use(express.static('public'));
