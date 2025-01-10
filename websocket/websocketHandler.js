const { publish } = require('./redisClient');

function handleConnection(ws) {
  ws.on('message', (message) => {
    console.log('Message received from client:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
}

function notifyClients(event, data) {
  publish(event, data);
}

module.exports = { handleConnection, notifyClients };
