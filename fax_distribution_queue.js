import moment from 'moment';

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import { QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });
const queueScheduler = new QueueScheduler("ReportDistribution", { connection });
const queue = new Queue('WebDistribution', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('WebDistribution', handleJob, { connection });

async function handleJob(job) {
  console.log(`Handling fax distribution for: ${job.data.reportNo}`);  
}

const faxDistributionQueue = {};
faxDistributionQueue.queue = queue;
faxDistributionQueue.worker = worker;
export default faxDistributionQueue;