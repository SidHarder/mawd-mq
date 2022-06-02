import moment from 'moment';

import mawdApi from './mawd_api.js';
import distributionHoldupQueue from './distribution_holdup_queue.js';
import reportPublishingQueue from './report_publishing_queue.js';
import webDistributionQueue from './web_distribution_queue.js';

const distributionRouter = {};

async function submitJob(args, cb) {
  console.log(`Holding up distribution for: ${args[0].reportNo}`);
  await distributionHoldupQueue.queue.add('HoldupDistribution', { reportNo: args[0].reportNo });  
  cb(null, { status: 'OK', message: `Distrubition job submitted for: ${args[0].reportNo}` })
}

distributionHoldupQueue.worker.on('completed', async (job) => {
  console.log(`Holding up distribution is complete for: ${job.data.reportNo}`);  
  var aoResult = await mawdApi.getAccessionOrder(job.data.reportNo);
  var jobData = { accessionOrder: aoResult.result.accessionOrder, reportNo: job.data.reportNo }
  console.log(`Publishing report for: ${job.data.reportNo}`);
  reportPublishingQueue.queue.add('PublishReport', jobData);  
});

reportPublishingQueue.worker.on('completed', async (job) => {
  console.log(`Report Publishing Completed for: ${job.data.reportNo}`)
  webDistributionQueue.queue.add('HandleWebDistribution', jobData);  
  //await handleDistribution(job.data.reportNo, job.data.accessionOrder);
});

webDistributionQueue.worker.on('completed', async (job) => {
  console.log(`Web distribution completed for: ${job.data.reportNo}`)  
});

distributionRouter.submitJob = submitJob;

export default distributionRouter;