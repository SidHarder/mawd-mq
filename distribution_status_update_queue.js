var Queue = require('bull');
var moment = require('moment');
var mawdApi = require('./mawd_api.js');

var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }
var queue = new Queue('distribution_update_status_queue', redisConfig);

queue.process(function (job, done) {
  console.log(`Handling distribution status update for: ${job.data.reportNo}`);
  job.data.accessionOrder.testOrders.find(t => t.reportNo == job.data.reportNo).testOrderReportDistribution.forEach(d => {
    if (d.distributed == false) {
      d.distributed = true;
      d.timeOfLastDistribution = moment().format('YYYYMMDDHHmmss')
    }
  });
  job.data.accessionOrder.distributed = true;
  mawdApi.updateAccessionOrder(job.data.accessionOrder, function (error, result) {
    if(error) { console.log(error); }    
    done();
  });  
});

const distributionStatusUpdateQueue = {};
distributionStatusUpdateQueue.queue = queue;
module.exports = distributionStatusUpdateQueue;
