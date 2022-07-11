import moment from 'moment';
import cron from 'node-cron';

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';

const connection = new IORedis(6379, "//localhost", { maxRetriesPerRequest: null });

const queue = new Queue('FaxDistribution', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const worker = new Worker('FaxDistribution', null, { autorun: true, connection });

cron.schedule('* * * * *', async () => {
  var waitingJobCount = await queue.getWaitingCount();  
  console.log(`Jobs waiting count: ${waitingJobCount}`);  
  for (var i=0; i<waitingJobCount; i++) {    
    var faxJob = await worker.getNextJob('faxjob');    
    await SendFax(faxJob.data);
  }  
});

async function SendFax(faxJob) {  
  var url = `${process.env.HTTP_SINGLE_FAX_URL}${faxJob.reportNo}`;
  console.log(`Faxing: ${url}`);  

  /*
  try {
    const response = await fetch(url);
    const body = await response.text();
    console.log(body);
  } catch (e) {
    console.log(e);
  }
  */
}

async function addFaxJob(data) {
  console.log('Not adding faxes at this time.');
  /*
  var testOrder = data.accessionOrder.testOrders.find(t => t.reportNo == data.reportNo);
  var faxDistributions = testOrder.testOrderReportDistribution.filter(t => t.distributionType == 'Fax' && t.distributed == false);
  for(var i=0; i<faxDistributions.length; i++) {
    var faxJob = { reportNo: faxDistributions[i].reportNo, faxNumber: faxDistributions[i].faxNumber, clientName: faxDistributions[i].clientName };
    await queue.add('FaxDistribution', faxJob);
    console.log(`Adding fax distribution for: ${faxJob.reportNo} - ${faxJob.clientName}`);    
  } 
  */ 
}

const faxDistributionQueue = {};
faxDistributionQueue.addFaxJob = addFaxJob;
export default faxDistributionQueue;