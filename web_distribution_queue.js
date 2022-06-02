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
  console.log(`Handling web distribution for: ${job.data.reportNo}`);  
  try {
    job.data.accessionOrder.testOrders.find(t => t.reportNo == job.data.reportNo).testOrderReportDistribution.forEach(d => {
      if (d.distributionType == 'Web') {
        d.distributed = true;
        d.timeOfLastDistribution = moment().format('YYYYMMDDHHmmss')
      }
    });

    job.data.accessionOrder.distributed = true;
    var updatedAo = await mawdApi.updateAccessionOrder(job.data.accessionOrder);
  } catch (e) {
    console.log(e);
  }  
}

const webDistributionQueue = {};
webDistributionQueue.queue = queue;
webDistributionQueue.worker = worker;
export default webDistributionQueue;