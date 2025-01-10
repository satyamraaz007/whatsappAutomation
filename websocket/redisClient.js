const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Use Redis Pub/Sub for WebSocket message broadcasting
const pub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

sub.subscribe('websocket-messages', (err) => {
  if (err) console.error('Error subscribing to Redis channel:', err);
});

sub.on('message', (channel, message) => {
  if (channel === 'websocket-messages') {
    const { event, data } = JSON.parse(message);
    WebSocketServer.broadcast(event, data);
  }
});

function publish(event, data) {
  pub.publish('websocket-messages', JSON.stringify({ event, data }));
}

module.exports = { redisClient, publish };
