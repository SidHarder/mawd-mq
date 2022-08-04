var moment = require('moment');
var cron = require('node-cron');
var request = require('request');
var ObjectID = require('bson-objectid');

var mawdApi = require('./mawd_api.js');
var Queue = require('bull');

var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }
var queue = new Queue('interface_distribution', redisConfig);

queue.process(function (job, done) {
  console.log(`Sending interface distribution for: ${job.data.reportNo}`);    

  var id = ObjectID("54495ad94c934721ede76d90");

  var apiRequest = {
    jsonrpc: '2.0',
    id: id,
    method: 'interfaceEngineOperation',
    params: [{
      interfaceEngineOperation: {
        target: 'clinicalOutboundResult',
        method: 'send',        
        reportNo: job.data.reportNo
      }
    }]
  }

  console.log(apiRequest);

  request.post(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  }, function (error, response, body) {    
    if(error) console.log(error);         
    done();
  });    
});

const interfaceDistributionQueue = {};
interfaceDistributionQueue.queue = queue;
module.exports = interfaceDistributionQueue;