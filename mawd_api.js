import fetch from 'node-fetch';
import ObjectID from 'bson-objectid';

const mawdApi = {}

async function getAccessionOrder (reportNo) {  
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
  
  const response = await fetch(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  });
    
  const data = await response.json();  
  data.result.lockAquiredByMe = (data.result.accessionOrder.lockedBy == process.env.LOCKED_BY_USER);  
  return data;
}

async function updateAccessionOrder(accessionOrder) {
  var apiRequest = {
    jsonrpc: '2.0',
    id: ObjectID(),
    method: 'domainOperation',
    params: [{
      domainOperation: {
        target: 'accessionOrder',
        method: 'update',
        clinicalPathologyStyle: true,
        releaseLock: true ,
        accessionOrder: accessionOrder       
      }
    }]
  }

  const response = await fetch(process.env.MAWD_API_URL, {
    method: 'POST',
    body: JSON.stringify(apiRequest),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  return data;
}

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

mawdApi.getAccessionOrder = getAccessionOrder;
mawdApi.updateAccessionOrder = updateAccessionOrder;
mawdApi.submitInfinityResult = submitInfinityResult;
export default mawdApi;