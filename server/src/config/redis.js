import Redis from 'ioredis';
import { ENV } from './env.js';

// In-Memory Fallback Cache Map
const memoryCache = new Map();

let redisClient = null;
if (ENV.REDIS_URL || process.env.REDIS_HOST) {
  try {
    redisClient = new Redis(ENV.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      lazyConnect: true,
    });
    redisClient.on('error', (err) => {
      console.warn('[Redis] Connection error, using memory cache fallback:', err.message);
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize, using memory cache fallback');
  }
}

export const cache = {
  get: async (key) => {
    if (redisClient && redisClient.status === 'ready') {
      try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        // Fallback to memory
      }
    }
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return cached.data;
  },

  set: async (key, value, ttlSeconds = 120) => {
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }
    memoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  del: async (key) => {
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.del(key);
      } catch (err) {}
    }
    memoryCache.delete(key);
  },
};
