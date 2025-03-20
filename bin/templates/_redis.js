import { createClient } from 'redis';

export const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export function connectRedisClient() {
  client.connect((err) => {
    if (err) {
      console.error('Error connecting to Redis:', err);
    } else {
      console.log('Connected to Redis!');
    }
  });
}

export async function closeRedisConnection() {
  try {
    await client.quit();
    console.log('Redis connection closed.');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    throw error;
  }
}

// client.quit();