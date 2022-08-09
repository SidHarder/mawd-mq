var moment = require('moment');

var mawdApi = require('./mawd_api.js');
var distributionHoldupQueue = require('./distribution_holdup_queue.js');
var reportPublishingQueue = require('./report_publishing_queue.js');
var distributionStatusUpdateQueue = require('./distribution_status_update_queue.js');
var faxDistributionQueue = require('./fax_distribution_queue.js');
var interfaceDistributionQueue = require('./interface_distribution_queue.js');

const distributionRouter = {};

function submitJob(args, cb) {    
  var reportNo = args[0].reportNo;
  if (!reportNo) {
    console.log(`The reportNo was not provided as an argument.`);
    return cb(null, { status: 'ERROR', message: `The reportNo was not provided as an argument.` });
  }

  var distributionMode = args.distributionMode;
  if (!distributionMode) distributionMode = 'distribute_undistributed_items_only'

  console.log(`Holding up distribution for: ${reportNo}`);
  distributionHoldupQueue.queue.add({ reportNo: reportNo, distributionMode: distributionMode, runCount: 0 }, { delay: parseInt(process.env.HOLD_UP_QUEUE_DELAY) });
  cb(null, { status: 'OK', message: `Distrubition job submitted for: ${reportNo}` });  
}

distributionHoldupQueue.queue.on('completed', function (job, result) {
  console.log(`Holding up distribution is complete for: ${job.data.reportNo}`);  
  mawdApi.getAccessionOrder(job.data.reportNo, function(error, aoResult){     
    if (!error) {
      if (aoResult.result.lockAquiredByMe == true) {
        console.log(`Accession found for: ${job.data.reportNo}, and lockAquiredByMe is: ${aoResult.result.lockAquiredByMe}`)
        var jobData = { accessionOrder: aoResult.result.accessionOrder, reportNo: job.data.reportNo, distributionMode: job.data.distributionMode };
        reportPublishingQueue.queue.add(jobData);
      } else {        
        if (job.data.runCount < 100) {
          distributionHoldupQueue.queue.add({ reportNo: job.data.reportNo, distributionMode: job.data.distributionMode, runCount: job.data.runCount + 1 }, { delay: parseInt(process.env.HOLD_UP_QUEUE_DELAY) });
          console.log(`Lock not aquired for: ${job.data.reportNo}, lock is held by: ${aoResult.result.accessionOrder.lockedBy}, Run Count: ${job.data.runCount}`);
        } else {
          console.log(`Lock not aquired for: ${job.data.reportNo}, lock is held by: ${aoResult.result.accessionOrder.lockedBy}, Run Count: ${job.data.runCount} was exceeded.`);
        }        
      }
    } else {
      console.log(`Not able to find Accession Order for: ${job.data.reportNo}`);
    }
  });
});

reportPublishingQueue.queue.on('completed', function (job) {
  console.log(`Report Publishing Completed for: ${job.data.reportNo}`);  
  faxDistributionQueue.addFaxJob(job.data);  
  interfaceDistributionQueue.queue.add(job.data);
  distributionStatusUpdateQueue.queue.add(job.data);
});

distributionStatusUpdateQueue.queue.on('completed', function (job) {
  console.log(`Distribution status as been updated for: ${job.data.reportNo}`);
});

distributionRouter.submitJob = submitJob;
module.exports = distributionRouter;