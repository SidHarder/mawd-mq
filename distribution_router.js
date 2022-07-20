import moment from 'moment';

import mawdApi from './mawd_api.js';
import distributionHoldupQueue from './distribution_holdup_queue.js';
import reportPublishingQueue from './report_publishing_queue.js';
import distributionStatusUpdateQueue from './distribution_status_update_queue.js';
import faxDistributionQueue from './fax_distribution_queue.js';

const distributionRouter = {};

async function submitJob(args, cb) {  
  console.log(`Holding up distribution for: ${args[0].reportNo}`);
  var r = await distributionHoldupQueue.queue.add('HoldupDistribution', { reportNo: args[0].reportNo, runCount: 0 }, { delay: 1000 });  
  console.log(r)
  //await distributionHoldupQueue.queue.add('HoldupDistribution', { reportNo: args[0].reportNo, runCount: 0 });  
  //var delayedCnt = await distributionHoldupQueue.queue.getDelayedCount();
  //var failedCnt = await distributionHoldupQueue.queue.getFailedCount();
  //console.log(`Holdup queue job count: ${delayedCnt}, ${failedCnt}`);
  cb(null, { status: 'OK', message: `Distrubition job submitted for: ${args[0].reportNo}` })
}

/*
distributionHoldupQueue.worker.on('completed', async (job) => {
  console.log(`Holding up distribution is complete for: ${job.data.reportNo}`);  
  var aoResult = await mawdApi.getAccessionOrder(job.data.reportNo);

  if (aoResult.result.status == 'OK') {        
    if(aoResult.result.lockAquiredByMe == true) {
      console.log(`Accession found for: ${job.data.reportNo}, and lockAquiredByMe is: ${aoResult.result.lockAquiredByMe}`)
      var jobData = { accessionOrder: aoResult.result.accessionOrder, reportNo: job.data.reportNo };
      reportPublishingQueue.queue.add('PublishReport', jobData);  
    } else {
      await distributionHoldupQueue.queue.add('HoldupDistribution', { reportNo: job.data.reportNo, runCount: job.data.runCount + 1 }, { delay: parseInt(process.env.HOLD_UP_QUEUE_DELAY) });  
      console.log(`Lock not aquired for: ${job.data.reportNo}, lock is held by: ${aoResult.result.accessionOrder.lockedBy}, Run Count: ${job.data.runCount}`);
    }    
  } else {
    console.log(`Not able to find Accession Order for: ${job.data.reportNo}`);  
  }    
});

reportPublishingQueue.worker.on('completed', async (job) => {
  console.log(`Report Publishing Completed for: ${job.data.reportNo}`);  
  faxDistributionQueue.addFaxJob(job.data);
  distributionStatusUpdateQueue.queue.add('HandleDistributionStatusUpdate', job.data);
});

distributionStatusUpdateQueue.worker.on('completed', async (job) => {
  console.log(`Distribution status as been updated for: ${job.data.reportNo}`);
});
*/

distributionRouter.submitJob = submitJob;
export default distributionRouter;