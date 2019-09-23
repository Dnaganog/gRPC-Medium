// /server/server.js
const { Server, ServerCredentials } = require( 'grpc' );
const { ChattyMicroservice } = require( '../proto/package.js' );
const { BidiMathHandler } = require ( './chattyHandler.js' );

const server = new Server();
server.addService( 
    ChattyMicroservice.service,   
    { BidiMath: BidiMathHandler }
  );
server.bind('0.0.0.0: 3000', ServerCredentials.createInsecure())
server.start();