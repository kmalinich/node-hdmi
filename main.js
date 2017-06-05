var module_name = __filename.slice(__dirname.length + 1, -3);
app_path = __dirname;

// Global libraries
os   = require('os');
log  = require('log-output');
json = require('json');
HDMI = require('HDMI');

// WebSockets
// socket_client = require('socket-client');
// socket_server = require('socket-server');

// API config - should be moved into API object
dispatcher          = new (require('httpdispatcher'));
http                = require('http');
query_string        = require('querystring');
api_socket_key_last = 0;
api_socket_map      = {};
api_server          = http.createServer(api_handler);
api_header          = {
'Content-Type'  : 'application/json',
'Cache-Control' : 'no-cache',
}


// Global startup
function startup() {
	log.msg({
		src : 'run',
		msg : 'Starting',
	});

	json.read(() => { // Read JSON config and status files
		api_startup(() => { // Open API server
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

	json.write(() => { // Write JSON config and status files
		HDMI.shutdown(() => { // Close HDMI-CEC
			api_shutdown(() => { // Close API server
				process.exit();
			});
		});
	});
}


// Port 3001 listener for POST requests to modules
// This REALLY REALLY REALLY REALLY should be moved into it's own object

function api_startup(api_startup_callback = null) {
	// error handling breh
	api_server.listen(config.server.port, () => {
		log.msg({
			src : 'API',
			msg : 'API server up, port '+config.server.port,
		});

		if (typeof api_startup_callback === 'function') { api_startup_callback(); }
		api_startup_callback = undefined;

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
function api_shutdown(api_shutdown_callback = null) {
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

		if (typeof api_shutdown_callback === 'function') { api_shutdown_callback(); }
		api_shutdown_callback = undefined;
	});
}

// API handler function
function api_handler(request, response) {
	dispatcher.dispatch(request, response);
}

// HDMI POST request
dispatcher.onPost('/hdmi', (request, response) => {
	HDMI.command(query_string.parse(request.body).command, response);
});

dispatcher.onGet('/hdmi', (request, response) => {
	response.writeHead(200, api_header);
	response.end(JSON.stringify(HDMI.status));
});

// Error
dispatcher.onError((request, response) => {
	log.msg({
		src : module_name,
		msg : 'API: 404',
	});

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
