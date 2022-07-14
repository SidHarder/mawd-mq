import fetch from 'node-fetch';

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import { QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import mawdApi from './mawd_api.js';


var redisOptions = { port: 6379, host: "127.0.0.1", db: process.env.REDIS_DB, maxRetriesPerRequest: null };
const connection = new IORedis(redisOptions);

const queue = new Queue('DelayedInstrumentResultQueue', {
  connection,
  defaultJobOptions: { removeOnComplete: true }
});

const queueScheduler = new QueueScheduler('DelayedInstrumentResultQueue', { connection });
const worker = new Worker('DelayedInstrumentResultQueue', handleJob, { connection });

async function handleJob(job) {
  console.log(`Submitting Inifinity result submition to API.`);
  console.log(job.data);
  try {
    var result = await mawdApi.submitInfinityResult(job.data);    
  } catch (e) {
    console.log(e)
  }  
}

async function submitJob(args, cb) {
  cb(null, { status: 'OK', message: 'A delayed instrument result job has been submitted.' })
  console.log('Adding delayed result job.');
  queue.add('DelayedResult', args[0], { delay: 1000 * 60 * 5 });
}

const delayedInstrumentResultQueue = {};
delayedInstrumentResultQueue.submitJob = submitJob;
export default delayedInstrumentResultQueue;