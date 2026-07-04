import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { env } from './config/env.js';
import { getRedis, closeRedis } from './config/redis.js';
import { queryClient } from './config/db.js';
import { setupWebSocket } from './ws/index.js';
import { ensureAuthTables } from './migrate.js';

const server = createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

async function start() {
  try {
    await getRedis();
  } catch {
    console.warn('Redis unavailable — running without cache/pubsub');
  }

  // Ensure auth-critical tables exist before accepting requests
  try {
    console.log('  Running startup DB migration...');
    await ensureAuthTables(queryClient);
  } catch (err) {
    console.error('  Migration failed:', err);
    // Don't crash — the server may still serve static/admin content
  }

  server.listen(env.PORT, () => {
    console.log(`\n  🏛️  Ogbenjuwa Central Command`);
    console.log(`  API:      http://localhost:${env.PORT}/api/v1`);
    console.log(`  Health:   http://localhost:${env.PORT}/api/v1/health`);
    console.log(`  WS:       ws://localhost:${env.PORT}/ws`);
    console.log(`  Env:      ${env.NODE_ENV}\n`);
  });
}

start();

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  wss.close();
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  wss.close();
  await closeRedis();
  process.exit(0);
});
