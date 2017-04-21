// Global libraries
os   = require('os');
log  = require('log-output');
HDMI = require('HDMI');

// API config - should be moved into API object
const dispatcher        = new (require('httpdispatcher'));
const http              = require('http');
const query_string      = require('querystring');
var api_socket_key_last = 0;
var api_socket_map      = {};
socket_server           = require('socket-server');
api_server              = http.createServer(api_handler);
var api_header          = {
  'Content-Type'  : 'application/json',
  'Cache-Control' : 'no-cache',
}


// Global startup
function startup() {
  log.msg({
    src : 'run',
    msg : 'Starting',
  });

  startup_api_server(() => { // Open API server
    socket_server.startup(() => { // Config WebSocket server
      HDMI.startup(() => { // Open HDMI-CEC
        log.msg({
          src : 'run',
          msg : 'Started',
        });
      });
    });
  });
}

// Global shutdown
function shutdown() {
  log.msg({
    src : 'run',
    msg : 'Shutting down',
  });

  HDMI.shutdown(() => { // Close HDMI-CEC
    shutdown_api_server(() => { // Close API server
      process.exit();
    });
  });
}


// Port 3001 listener for POST requests to modules
// This REALLY REALLY REALLY REALLY should be moved into it's own object

function startup_api_server(callback) {
  // error handling breh
  api_server.listen(3001, () => {
    log.msg({
      src : 'API',
      msg : 'API server up, port '+3001,
    });

    if (typeof callback === 'function') { callback(); }

    api_server.on('connection', (api_socket) => {
      // Generate a new, unique api_socket-key
      var api_socket_key = ++api_socket_key_last;

      // Add api_socket when it is connected
      api_socket_map[api_socket_key] = api_socket;

      // Remove api_socket when it is closed
      api_socket.on('close', () => {
        delete api_socket_map[api_socket_key];
      });
    });
  });
}

// Close API server and kill the sockets
function shutdown_api_server(callback) {
  // Loop through all sockets and destroy them
  Object.keys(api_socket_map).forEach((api_socket_key) => {
    api_socket_map[api_socket_key].destroy();
  });

  // Tell server to close
  api_server.close();

  // API server close event
  api_server.on('close', () => {
    log.msg({
      src : 'API',
      msg : 'Stopped',
    });
    if (typeof callback === 'function') { callback(); }
  });
}

// API handler function
function api_handler(request, response) {
  log.msg({
    src : 'API',
    msg : request.method+' request: '+request.url,
  });
  dispatcher.dispatch(request, response);
}

// HDMI POST request
dispatcher.onPost('/hdmi', (request, response) => {
  HDMI.command(query_string.parse(request.body).command);
  response.writeHead(200, api_header);
  response.end(JSON.stringify({ commanded : query_string.parse(request.body).command, status : 'ok' }));
});

// Error
dispatcher.onError((request, response) => {
  console.error('[node::API] Error: 404');
  response.writeHead(404);
  response.end();
});


// Shutdown events/signals
process.on('SIGTERM', () => {
  log.msg({
    src : 'run',
    msg : 'Received SIGTERM, launching shutdown()',
  });
  shutdown();
});

process.on('SIGINT', () => {
  log.msg({
    src : 'run',
    msg : 'Received SIGINT, launching shutdown()',
  });
  shutdown();
});

process.on('SIGPIPE', () => {
  log.msg({
    src : 'run',
    msg : 'Received SIGPIPE, launching shutdown()',
  });
  shutdown();
});

process.on('exit', () => {
  log.msg({
    src : 'run',
    msg : 'Shut down',
  });
});

startup();
