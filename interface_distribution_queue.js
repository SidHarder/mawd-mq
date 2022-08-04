var moment = require('moment');
var cron = require('node-cron');
var request = require('request');

var mawdApi = require('./mawd_api.js');
var Queue = require('bull');

var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }
var queue = new Queue('interface_distribution', redisConfig);

queue.process(function (job, done) {
  console.log(`Sending interface distribution for: ${job.data.reportNo}`);    
  var apiRequest = {
    jsonrpc: '2.0',
    id: ObjectID(),
    method: 'interfaceEngineOperation',
    params: [{
      interfaceEngineOperation: {
        target: 'clinicalOutboundResult',
        method: 'send',        
        reportNo: reportNo
      }
    }]
  }

  request.post(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  }, function (error, response, body) {
    if(error) console.log(error);     
    console.log(body);
    done();
  });    
});

const interfaceDistributionQueue = {};
interfaceDistributionQueue.queue = queue;
module.exports = interfaceDistributionQueue;