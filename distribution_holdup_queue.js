import { Queue, QueueScheduler } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ port: 6379, host: "127.0.0.1", db: process.env.REDIS_DB, maxRetriesPerRequest: null });
const schedulerConn = new IORedis({ port: 6379, host: "127.0.0.1", db: process.env.REDIS_DB, maxRetriesPerRequest: null });

const queue = new Queue('Distribution_Holdup', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('Distribution_Holdup', handleJob, { connection });
const queueScheduler = new QueueScheduler('Distribution_Holdup', { schedulerConn });

async function handleJob(job) {      
  console.log(job);
}

const distributionHoldupQueue = {};
distributionHoldupQueue.queue = queue;
distributionHoldupQueue.worker = worker;
export default distributionHoldupQueue;
