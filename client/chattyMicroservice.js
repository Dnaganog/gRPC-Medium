// /clients/chattyMath.js
const { credentials } = require( 'grpc' );
const { ChattyMicroservice } = require( '../proto/package.js' )
const stub = new ChattyMicroservice( 
    'localhost: 3000',
    credentials.createInsecure(),
);
const bidi = stub.bidiMath()

let start;
let current;
let perRes;
let perSec;
bidi.write({requests: 1, responses: 0})
bidi.on( 'metadata', (metadata) => {
    start = Number(process.hrtime.bigint());
    console.log(metadata.getMap()) // maps the special metadata object as a simple Object
  })
bidi.on( 'error', (err) => console.error(err))
bidi.on( 'data', (benchmark) => {
    bidi.write(
      {
        requests: benchmark.requests + 1, 
        responses: benchmark.responses
      }
    )
    if (benchmark.responses % 10000 === 0) {
      current = Number(process.hrtime.bigint());
      perRes = ((current - start) /1000000) / benchmark.responses; // nanoseconds to milliseconds averaging total responses
      perSec = 1 / (perRes / 1000); // inverting milliseconds per response to responses per second
    console.log(
      '\nClient-side:',
      '\nserver address:', bidi.getPeer(),
      '\ntotal number of responses:', benchmark.responses,
      '\navg millisecond speed per response:', perRes,
      '\nresponses per second:', perSec,
    )
  }
});