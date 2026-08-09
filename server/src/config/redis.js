import Redis from 'ioredis';
import { ENV } from './env.js';

// In-Memory Fallback Cache Map
const memoryCache = new Map();

let redisClient = null;

const formatRedisUrl = (urlStr) => {
  if (!urlStr) return null;
  let cleanUrl = urlStr.trim().replace(/^["']|["']$/g, '');
  if (cleanUrl.includes('redis-cli')) {
    const urlMatch = cleanUrl.match(/(rediss?:\/\/[^\s"']+)/);
    if (urlMatch) cleanUrl = urlMatch[1];
  }
  if (cleanUrl.includes('upstash.io') && cleanUrl.startsWith('redis://')) {
    cleanUrl = cleanUrl.replace('redis://', 'rediss://');
  }
  return cleanUrl;
};

const sanitizedUrl = formatRedisUrl(ENV.REDIS_URL);

if (sanitizedUrl || process.env.REDIS_HOST) {
  try {
    const isTlsRequired = sanitizedUrl ? (sanitizedUrl.startsWith('rediss://') || sanitizedUrl.includes('upstash.io')) : false;
    const redisOptions = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      ...(isTlsRequired ? { tls: { rejectUnauthorized: false } } : {}),
    };

    if (sanitizedUrl) {
      redisClient = new Redis(sanitizedUrl, redisOptions);
    } else {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        ...redisOptions,
      });
    }

    redisClient.on('connect', () => {
      console.log('✅ [Redis] Connected successfully!');
    });

    redisClient.on('error', (err) => {
      console.warn('[Redis] Connection warning, using memory cache fallback:', err.message);
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize, using memory cache fallback:', err.message);
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
