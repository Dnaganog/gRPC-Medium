// /clients/chattyMicroservice.js
const { credentials } = require( 'grpc' );
const { ChattyMicroservice } = require( '../proto/package.js' )

// the Stub is constructed from the package.ServiceName()
const Stub = new ChattyMicroservice(
    // binds it to the Server address
    'localhost: 3000',
    // defines the security level
    credentials.createInsecure(),
);
// rpc invocations
const bidi = Stub.BidiMath()
  let start;
  let current;
  let perRes;
  let perSec;
  // writes a message request
  // Client must send the first message
  bidi.write({requests: 1, responses: 0})
  // adds a listener for metadata
  // metadata is sent only once
  bidi.on( 'metadata', (metadata) => {
    // highly accurate Node.process nanosecond timer
    // converted to an integer with Number()
    start = Number(process.hrtime.bigint());
    // maps the special metadata object as a simple Object
    console.log(metadata.getMap())
  })
  // adds a listener for errors
  bidi.on( 'error', (err) => console.error(err))
  // adds a listener for message data
  // the callback is run on every message back from Server
  bidi.on( 'data', (benchmark) => {
    // writes a message to Server
    bidi.write(
      // properties match the message fields for benchmark
      {
        requests: benchmark.requests + 1, 
        responses: benchmark.responses
      }
    )
    // console logs every 100,000 invocations
    if (benchmark.responses % 100000 === 0) {
      // highly accurate Node.process nanosecond timer
      // converting to an integer with Number()
      current = Number(process.hrtime.bigint());
      // nanoseconds to milliseconds averaging total responses
      perRes = ((current - start) /1000000) / benchmark.responses;
      // inverting milliseconds per response to responses per second
      perSec = 1 / (perRes / 1000);
      // adds new-lines with \n
      console.log(
        '\nRPC Invocations:',
        '\nserver address:', bidi.getPeer(),
        '\ntotal number of responses:', benchmark.responses,
        '\navg millisecond speed per response:', perRes,
        '\nresponses per second:', perSec,
      )
    }
  });