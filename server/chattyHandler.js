// /server/chattyMathHandlers.js
function BidiMathHandler(bidi) {
    let start = Number(process.hrtime.bigint());
    let current;
    let perRequest;
    let perSecond;
    bidi.on('metadata', (metadata) => {
      start = Number(process.hrtime.bigint());
      bidi.set({thisSetsMetadata: 'responses incoming'})
      console.log(metadata.getMap()); // maps the special metadata object as a simple Object
    })
    bidi.on('error', (err) => {
      console.error(err)
    })
    bidi.on('data', (benchmark) => {
      bidi.write(
        {
          requests: benchmark.requests, 
          responses: benchmark.responses + 1
        }
      );
      if (benchmark.requests % 10000 === 0) {
        current = Number(process.hrtime.bigint());
        perRequest = ((current - start) /1000000) / benchmark.requests; // nanoseconds to milliseconds averaging total requests
        perSecond = 1 / (perRequest / 1000); // inverting milliseconds per request to requests per second
        console.log(
          '\nServer-side',
          '\nclient address:', bidi.getPeer(),
          '\nnumber of requests:', benchmark.requests,
          '\navg millisecond speed per request:', perRequest,
          '\nrequests per second:', perSecond,
        );
      }
    })
  }
  
  module.exports = { 
      BidiMathHandler,
  }