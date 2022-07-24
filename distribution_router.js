var moment = require('moment');

var mawdApi = require('./mawd_api.js');
var distributionHoldupQueue = require('./distribution_holdup_queue.js');
var reportPublishingQueue = require('./report_publishing_queue.js');
var distributionStatusUpdateQueue = require('./distribution_status_update_queue.js');
var faxDistributionQueue = require('./fax_distribution_queue.js');

const distributionRouter = {};

function submitJob(args, cb) {    
  console.log(`Holding up distribution for: ${args[0].reportNo}`);
  distributionHoldupQueue.queue.add({ reportNo: args[0].reportNo, runCount: 0 }, { delay: parseInt(process.env.HOLD_UP_QUEUE_DELAY) });
  cb(null, { status: 'OK', message: `Distrubition job submitted for: ${args[0].reportNo}` });  
}

distributionHoldupQueue.queue.on('completed', function (job, result) {
  console.log(`Holding up distribution is complete for: ${job.data.reportNo}`);  
  mawdApi.getAccessionOrder(job.data.reportNo, function(error, aoResult){     
    if (!error) {
      if (aoResult.result.lockAquiredByMe == true) {
        console.log(`Accession found for: ${job.data.reportNo}, and lockAquiredByMe is: ${aoResult.result.lockAquiredByMe}`)
        var jobData = { accessionOrder: aoResult.result.accessionOrder, reportNo: job.data.reportNo };
        reportPublishingQueue.queue.add(jobData);
      } else {
        distributionHoldupQueue.queue.add({ reportNo: job.data.reportNo, runCount: job.data.runCount + 1 }, { delay: parseInt(process.env.HOLD_UP_QUEUE_DELAY) });
        console.log(`Lock not aquired for: ${job.data.reportNo}, lock is held by: ${aoResult.result.accessionOrder.lockedBy}, Run Count: ${job.data.runCount}`);
      }
    } else {
      console.log(`Not able to find Accession Order for: ${job.data.reportNo}`);
    }
  });
});

reportPublishingQueue.queue.on('completed', function (job) {
  console.log(`Report Publishing Completed for: ${job.data.reportNo}`);  
  faxDistributionQueue.addFaxJob(job.data);
  distributionStatusUpdateQueue.queue.add(job.data);
});

distributionStatusUpdateQueue.queue.on('completed', function (job) {
  console.log(`Distribution status as been updated for: ${job.data.reportNo}`);
});

distributionRouter.submitJob = submitJob;
module.exports = distributionRouter;