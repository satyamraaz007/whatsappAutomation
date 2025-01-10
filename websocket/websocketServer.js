const WebSocket = require('ws');
const { createClient } = require('./redisClient');
const WebSocketHandler = require('./websocketHandler');

let wss;

function initialize(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    WebSocketHandler.handleConnection(ws);
  });

  console.log('WebSocket server initialized.');
}

function broadcast(event, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  });
}

module.exports = { initialize, broadcast };
