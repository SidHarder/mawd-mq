import moment from 'moment';

import mawdApi from './mawd_api.js';
import distributionHoldupQueue from './distribution_holdup_queue.js';
import reportPublishingQueue from './report_publishing_queue.js';

const distributionRouter = {};

async function submitJob(args, cb) {
  console.log(`Holding up distribution for: ${args[0].reportNo}`);
  await distributionHoldupQueue.queue.add('HoldupDistribution', { reportNo: args[0].reportNo });  
  cb(null, { status: 'OK', message: `Distrubition job submitted for: ${args[0].reportNo}` })
}

distributionHoldupQueue.worker.on('completed', async (job) => {
  console.log(`Holding up distribution is complete for: ${args[0].reportNo}`);  
  var aoResult = await mawdApi.getAccessionOrder(job.data.reportNo);
  var jobData = { accessionOrder: aoResult.result.accessionOrder, reportNo: job.data.reportNo }
  console.log(`Publishing report for: ${args[0].reportNo}`);
  reportPublishingQueue.queue.add('PublishReport', jobData);  
});

reportPublishingQueue.worker.on('completed', async (job) => {
  console.log(`Report Publishing Complete for: ${job.data.accessionOrder.masterAccessionNo}`)
  await handleDistribution(job.data.reportNo, job.data.accessionOrder);
});

async function handleDistribution(reportNo, accessionOrder) {
  accessionOrder.testOrders.find(t => t.reportNo == reportNo).testOrderReportDistribution.forEach(d => {
    if(d.distributionType == 'Web') {
      d.distributed = true;
      d.timeOfLastDistribution = moment().format('YYYYMMDDHHmmss')
    }    
  });;

  accessionOrder.distributed = true;
  var updatedAo = await mawdApi.updateAccessionOrder(accessionOrder);
}

distributionRouter.submitJob = submitJob;

export default distributionRouter;