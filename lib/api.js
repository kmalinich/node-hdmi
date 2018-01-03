const object_path = require('object-path');

const express = require('express');
const app     = express();
const server  = require('http').Server(app);

// body-parser to handle POSTed JSON
const body_parser = require('body-parser');
app.use(body_parser.json());

// Only load socket.io server if enabled
let io;


function emit(topic, data, emit_cb = null) {
	io.emit(topic, data);
	// log.msg('Emitted ' + topic + ' message');

	typeof emit_cb === 'function' && process.nextTick(emit_cb);
	emit_cb = undefined;
}


function init_api_functions(init_api_functions_cb = null) {
	// Some of these are shameful
	app.all('*', (req, res, next) => {
		log.msg('[' + req.method + '] ' + req.originalUrl);
		res.set('Content-Type', 'application/json');
		next();
	});

	app.get('/console', (req, res) => {
		update.config('console.output', !config.console.output);
		res.send(config.console);
	});

	app.get('/config', (req, res) => {
		res.send(config);
	});

	app.post('/config', (req, res) => {
		config = req.body;
		res.send({ ok : true });
	});

	app.get('/hdmi/:command', (req, res) => {
		HDMI.command(req.params.command);
		res.send({ ok : true });
	});

	app.get('/status', (req, res) => {
		res.send(status);
	});

	app.post('/status', (req, res) => {
		status = req.body;
		res.send({ ok : true });
	});

	log.msg('Initialized HTTP API functions');


	if (config.api.enable.ws === true) {
		io.on('connection', (socket) => {
			socket.on('disconnect', (reason) => {
				log.msg('socket.io client disconnected, reason: ' + reason);
			});

			log.msg('socket.io client connected');

			let array_status = [
				'client',
				'hdmi',
				'server',
			];

			array_status.forEach((key) => {
				let keys = {
					stub : key.split('.')[0],
					full : key,
				};

				let values = {
					stub : object_path.get(status, key),
					full : status[keys.stub],
				};

				socket.emit('status-tx', { key : keys, value : values });
			});
		});

		log.msg('Initialized socket.io API functions');
	}

	typeof init_api_functions_cb === 'function' && process.nextTick(init_api_functions_cb);
	init_api_functions_cb = undefined;
}


function init(init_cb = null) {
	if (config.api.enable.http !== true) {
		log.msg('HTTP server disabled');

		typeof init_cb === 'function' && process.nextTick(init_cb);
		init_cb = undefined;
		return;
	}

	// Only load socket.io server if enabled
	if (config.api.enable.ws === true) {
		io = require('socket.io')(server);
	}

	log.msg('Initializing HTTP server');
	server.listen(config.api.port, () => {
		log.msg('Initialized HTTP server, listening on port ' + config.api.port);
	});

	init_api_functions(init_cb);
}

function term(term_cb = null) {
	log.msg('Terminated');

	typeof term_cb === 'function' && process.nextTick(term_cb);
	term_cb = undefined;
}


module.exports = {
	// Main functions
	emit : emit,

	// Start/stop functions
	init : init,
	term : term,
};
