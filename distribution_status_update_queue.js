import moment from 'moment';
import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });
const queue = new Queue('Distribution_Status_Update', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('Distribution_Status_Update', handleJob, { connection });

async function handleJob(job) {
  console.log(`Handling distribution status update for: ${job.data.reportNo}`);
  try {
    job.data.accessionOrder.testOrders.find(t => t.reportNo == job.data.reportNo).testOrderReportDistribution.forEach(d => {
      if (d.distributed == false) {
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

const distributionStatusUpdateQueue = {};
distributionStatusUpdateQueue.queue = queue;
distributionStatusUpdateQueue.worker = worker;
export default distributionStatusUpdateQueue;
