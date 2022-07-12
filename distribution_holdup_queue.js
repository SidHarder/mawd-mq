import { Queue, QueueScheduler } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });
const queue = new Queue('Distribution_Holdup', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('Distribution_Holdup', handleJob, { connection });
const queueScheduler = new QueueScheduler('Distribution_Holdup');

async function handleJob(job) {      
  //Do Nothing  
}

const distributionHoldupQueue = {};
distributionHoldupQueue.queue = queue;
distributionHoldupQueue.worker = worker;
export default distributionHoldupQueue;
