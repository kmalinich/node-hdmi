var module_name = __filename.slice(__dirname.length + 1, -3);

var socket_io = require('socket.io');

module.exports = {
  io     : null,
  server : null,

  // Check before sending data
  check : (check_callback) => {
    // Check config
    if (typeof config             === 'undefined' || config             === null) { return; };
    if (typeof config.server      === 'undefined' || config.server      === null) { return; };
    if (typeof config.server.port === 'undefined' || config.server.port === null) { return; };

    // Check status
    if (typeof status           === 'undefined' || status           === null) { return; };
    if (typeof status.server    === 'undefined' || status.server    === null) { return; };
    if (typeof status.server.up === 'undefined' || status.server.up === null) { return; };

    // Check socket
    if (typeof socket         === 'undefined' || socket         === null) { return; };
    if (typeof socket.io      === 'undefined' || socket.io      === null) { return; };
    if (typeof socket.io.emit === 'undefined' || socket.io.emit === null) { return; };

    if (typeof check_callback === 'function') { check_callback(); }
    check_callback = undefined;
  },

  startup : (startup_callback) => {
    socket.io = new socket_io(config.server.port);

    log.msg({
      src : module_name,
      msg : 'Listening on port '+config.server.port,
    });

    if (typeof startup_callback === 'function') { startup_callback(); }
    startup_callback = undefined;

    socket.io.on('error', (error) => {
      log.msg({
        src : module_name,
        msg : 'Error '+error,
      });
    });

    // When a client connects
    socket.io.on('connection', (client_socket) => {
      log.msg({
        src : module_name,
        msg : 'Client connected',
      });

      // Receive log data bus message from WebSocket
      client_socket.on('log-bus', (data) => {
        log.bus(data);
      });

      // Receive log message from WebSocket
      client_socket.on('log-msg', (data) => {
        log.msg({
          src : data.host,
          msg : data.msg,
        });
      });

      // Receive data from WebSocket and send over vehicle data bus
      client_socket.on('data-send', (data) => {
        // log.send(data);

        // Send the message
        data_send.send(data);
      });

      client_socket.on('disconnect', () => {
        log.msg({
          src : module_name,
          msg : 'Client disconnected',
        });
      });
    });
  },

  shutdown : (shutdown_callback) => {
		socket.io.close(() => {
			log.msg({
				src : module_name,
				msg : 'Port closed',
			});

			if (typeof shutdown_callback === 'function') { shutdown_callback(); }
			shutdown_callback = undefined;
		}, shutdown_callback);
  },

  data_receive : (data) => {
    socket.io.emit('data-receive', data);
  },
};
