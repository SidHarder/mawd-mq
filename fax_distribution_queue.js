var moment = require('moment');
var cron = require('node-cron');
var request = require('request');

var mawdApi = require('./mawd_api.js');
var Queue = require('bull');

var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }
var queue = new Queue('fax_distribution', redisConfig);

/*
cron.schedule('* * * * *', async () => {
  var waitingJobCount = await queue.getWaitingCount();  
  console.log(`Fax jobs waiting count: ${waitingJobCount}`);  
  for (var i=0; i<waitingJobCount; i++) {    
    var faxJob = await worker.getNextJob('faxjob');    
    await SendFax(faxJob.data);
  }  
});
*/

queue.process(function (job, done) {
  console.log(`Faxing report for: ${job.data.reportNo}`);  
  var url = `${process.env.HTTP_REPORT_MULTIPLE_FAX}${job.data.faxNumber}/${job.data.reportNo}`;
  console.log(url);

  if (process.env.ENVIRONMENT_NAME == 'dev') {
    console.log('Environment is dev, skipping fax.');
    return done();
  }

  request.get(
    {
      headers: { 'Content-Type': 'text/plain' },
      url: url,
      strictSSL: false
    },
    function (error, response) {
      if (error) {
        console.log(error)
        return done()
      }
      console.log(`Fax server response: ${response.body}`);
      done();
    });

  done();
});

function addFaxJob(data) {    
  var testOrder = data.accessionOrder.testOrders.find(t => t.reportNo == data.reportNo);
  var faxDistributions = testOrder.testOrderReportDistribution.filter(t => t.distributionType == 'Fax' && t.distributed == false);
  console.log(`Fax distribution count: ${faxDistributions.length}`);

  for(var i=0; i<faxDistributions.length; i++) {
    var faxJob = { reportNo: faxDistributions[i].reportNo, faxNumber: faxDistributions[i].faxNumber, clientName: faxDistributions[i].clientName };
    if (process.env.ENVIRONMENT_NAME == 'dev' || process.env.ENVIRONMENT_NAME == 'test') faxJob.faxNumber = process.env.TEST_FAX_NUMBER;

    queue.add(faxJob, function(error, result) {
      console.log(`Adding fax distribution for: ${faxJob.reportNo} - ${faxJob.clientName}`);    
    });    
  } 
}

const faxDistributionQueue = {};
faxDistributionQueue.addFaxJob = addFaxJob;
module.exports = faxDistributionQueue;