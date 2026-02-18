import { Queue, Worker, QueueOptions } from 'bullmq';
import Redis from 'ioredis';

// Redis connection configuration
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep completed jobs for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

// Export Redis connection for direct use
export { redisConnection };

// Health check function
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redisConnection.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
};
