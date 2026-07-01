import { createClient } from 'redis';
import { env } from './env.js';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedis(): Promise<ReturnType<typeof createClient> | null> {
  if (redisClient?.isOpen) return redisClient;

  try {
    redisClient = createClient({ url: env.REDIS_URL, socket: { connectTimeout: 3000, reconnectStrategy: false } });
    redisClient.on('error', (err) => console.warn('Redis connection error:', err.message));
    await redisClient.connect();
    return redisClient;
  } catch {
    console.warn('Redis unavailable — running without cache/pubsub');
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}
