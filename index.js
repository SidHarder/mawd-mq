var dotenv = require('dotenv');
var jayson = require('jayson');

var distributionRouter = require('./distribution_router.js');
//import delayInstrumentResult from './delayed_instrument_result_queue.js';
//import delayedInstrumentResultQueue from './delayed_instrument_result_queue.js';

dotenv.config();

const apiMethodMap = {
  submitDistribution: distributionRouter.submitJob
  //submitDelayedResult: delayedInstrumentResultQueue.submitJob
}

const server = jayson.server(apiMethodMap);

server.http().listen(process.env.APP_PORT);
console.log(`*********** Server is listening on port: ${process.env.APP_PORT}`);

