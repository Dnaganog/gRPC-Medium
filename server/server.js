// /server/server.js
const { Server, ServerCredentials } = require( 'grpc' );
const { ChattyMicroservice } = require( '../proto/package.js' );

// rpc executions
function BidiMathExecution(bidi) {
  // highly accurate Node.process nanosecond timer
  // converted to an integer with Number()
  let start = Number(process.hrtime.bigint());
  let current;
  let perRequest;
  let perSecond;
  // adds listener for message data
  // the callback is run on every message from Client
  bidi.on('data', (benchmark) => {
    // writes a message back to Client
    bidi.write(
      // properties match the message fields for benchmark
      {
        requests: benchmark.requests, 
        responses: benchmark.responses + 1
      }
    );
    // console logs every 100,000 executions
    if (benchmark.requests % 100000 === 0) {
      // highly accurate Node.process nanosecond timer
      // converting to an integer with Number()
      current = Number(process.hrtime.bigint());
      // nanoseconds to milliseconds averaging total requests
      perRequest = ((current - start) /1000000) / benchmark.requests;
      // inverting milliseconds per request to requests per second
      perSecond = 1 / (perRequest / 1000);
      // adds new-lines with \n
      console.log(
        '\nRPC Executions:',
        '\nclient address:', bidi.getPeer(),
        '\nnumber of requests:', benchmark.requests,
        '\navg millisecond speed per request:', perRequest,
        '\nrequests per second:', perSecond,
      );
    }
  })
}

const server = new Server();
// adds a service as defined in the .proto
// takes two Objects as arguments
server.addService( 
  // the service Object is the package.ServiceName.service 
  ChattyMicroservice.service,
  // the rpc method and it's attached function for execution
  // effectively this Object is how we handle server routing
  // each property is like an endpoint
  { BidiMath: BidiMathExecution }
);
// binds the server to a socket with a security level
// can be bound to any number of sockets
server.bind('0.0.0.0: 3000', ServerCredentials.createInsecure())
// starts the server listening on the designated socket(s)
server.start();