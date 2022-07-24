var Queue = require('bull');
var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }

var mawdApi = require('./mawd_api.js');
var queue = new Queue('distribution_holdup_queue', redisConfig);

queue.process(function (job, done) {  
  console.log(`Processing distribution for: ${job.data.reportNo}`);
  done();
});

const distributionHoldupQueue = {};
distributionHoldupQueue.queue = queue;
module.exports = distributionHoldupQueue;
