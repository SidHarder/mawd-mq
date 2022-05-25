import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import { QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

import mawdApi from './mawd_api.js';
import reportPublishingQueue from './report_publishing_queue.js';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });
const queue = new Queue('Distribution_Holdup', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});
const queueScheduler = new QueueScheduler("Distribution_Holdup", { connection });
const worker = new Worker('Distribution_Holdup', handleJob, { connection });

async function handleJob(job) {      
  //Do Nothing  
}

const distributionHoldupQueue = {};
distributionHoldupQueue.queue = queue;
distributionHoldupQueue.worker = worker;
export default distributionHoldupQueue;
