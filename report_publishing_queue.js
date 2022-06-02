import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import { QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });
const queueScheduler = new QueueScheduler("ReportDistribution", { connection });
const queue = new Queue('ReportPublishing', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('ReportPublishing', handleJob, { connection });

async function handleJob(job) {  
  console.log(`Publishing report for: ${job.data.reportNo}`);
  var url = `${process.env.HTTP_REPORT_PUBLISH_URL}${job.reportNo}`;
  console.log(url);
  const response = await fetch(url);
  const body = await response.text();
  console.log(body);
}

const reportPublishingQueue = {};
reportPublishingQueue.queue = queue;
reportPublishingQueue.worker = worker;
export default reportPublishingQueue;