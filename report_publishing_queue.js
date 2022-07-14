import fetch from 'node-fetch';

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';

const connection = new IORedis({ port: 6379, host: "127.0.0.1", db: process.env.REDIS_DB, maxRetriesPerRequest: null });
const queue = new Queue('ReportPublishing', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('ReportPublishing', handleJob, { connection });

async function handleJob(job) {  
  console.log(`Publishing report for: ${job.data.reportNo}`);
  var url = `${process.env.HTTP_REPORT_PUBLISH_URL}${job.data.reportNo}`;
  console.log(url);

  if (process.env.ENVIRONMENT_NAME != 'dev')
  try {
    const response = await fetch(url);
    const body = await response.text();
    console.log(body);
  } catch (e) {
    console.log(e);
  }  
}

const reportPublishingQueue = {};
reportPublishingQueue.queue = queue;
reportPublishingQueue.worker = worker;
export default reportPublishingQueue;