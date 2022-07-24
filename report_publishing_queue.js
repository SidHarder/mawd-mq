var Queue = require('bull');

var request = require('request');
var mawdApi = require('./mawd_api.js');

var redisConfig = { redis: { port: 6379, host: '127.0.0.1', db: process.env.BULL_REDIS_DB } }
var queue = new Queue('report_publishing_queue', redisConfig);

queue.process(function (job, done) {
  console.log(`Publishing for: ${job.data.reportNo}`);
  var publishUrl = `${process.env.HTTP_REPORT_PUBLISH_URL}${job.data.reportNo}`;
  if (process.env.ENVIRONMENT_NAME == 'dev' ) {
    console.log('Environment is dev, skipping publish.');
    return done();
  }

  console.log(publishUrl);
  request.get(
    {
      headers: { 'Content-Type': 'text/plain' },
      url: publishUrl,
      strictSSL: false
    },
    function (error, response) {      
      if (error) {
        console.log(error)
        return done()
      }
      console.log(`Publish server response: ${response.body}`);
      done();
    });  
});

const reportPublishingQueue = {};
reportPublishingQueue.queue = queue;
module.exports = reportPublishingQueue;