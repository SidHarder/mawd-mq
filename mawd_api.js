var request = require('request');
var ObjectID = require('bson-objectid');

const mawdApi = {}

function getAccessionOrder(reportNo, cb) {  
  var apiRequest = {
    jsonrpc: '2.0',
    id: ObjectID(),
    method: 'domainOperation',
    params: [{
      domainOperation: {
        target: 'accessionOrder',
        method: 'getByReportNo',
        clinicalPathologyStyle: true,
        aquireLock: true,
        lockedBy: process.env.LOCKED_BY_USER,
        reportNo: reportNo
      }
    }]
  }

  request.post(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  }, function (error, response, body) {    
    var data = JSON.parse(body);        
    if (data.result.accessionOrder) {
      data.result.lockAquiredByMe = (data.result.accessionOrder.lockedBy == process.env.LOCKED_BY_USER);
      cb(null, data);
    }
  });
}

async function updateAccessionOrder(accessionOrder, cb) {
  var apiRequest = {
    jsonrpc: '2.0',
    id: ObjectID(),
    method: 'domainOperation',
    params: [{
      domainOperation: {
        target: 'accessionOrder',
        method: 'update',
        clinicalPathologyStyle: true,
        releaseLock: true,
        accessionOrder: accessionOrder
      }
    }]
  }

  request.post(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  }, function (error, response, body) {
    if(error) {
      console.log(error);
      return cb(null, { status: 'ERROR', error })
    }    
    var data = JSON.parse(body);
    cb(null, data);
  });  
}

/*
async function submitInfinityResult(apiParams) {
  var apiRequest = {
    jsonrpc: '2.0',
    id: ObjectID(),
    method: 'instrumentOperation',
    params: [{
      instrumentOperation: apiParams
    }]
  };

  const response = await fetch(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    const data = await response.json();
  } catch (e) {
    console.log(e);
  }
}
*/

mawdApi.getAccessionOrder = getAccessionOrder;
mawdApi.updateAccessionOrder = updateAccessionOrder;
//mawdApi.submitInfinityResult = submitInfinityResult;
module.exports = mawdApi;