var module_name = __filename.slice(__dirname.length + 1, -3);

var nodecec = require('node-cec');
var NodeCec = nodecec.NodeCec;
var CEC     = nodecec.CEC;
var cec     = new NodeCec(config.hdmi.osd_name);

// config.hdmi.manufacturer = Samsung

cec.on('REPORT_POWER_STATUS', (packet, power_status) => {
	var keys = Object.keys(CEC.PowerStatus);

	for (var i = keys.length - 1; i >= 0; i--) {
		if (CEC.PowerStatus[keys[i]] === power_status) {
			log.msg({ src : module_name, msg : 'Power status: \''+keys[i]+'\'' });
			status.hdmi.power_status = keys[i];
			break;
		}
	}
});

// Error handling
cec.on('error', () => {
	log.msg({ src : module_name, msg : 'Error' });
});

// Event handling
cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
	log.msg({ src : module_name, msg : 'Physical address: \''+address+'\'' });
	status.hdmi.physical_addr = address;
});

cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
	log.msg({ src : module_name, msg : 'Routing change: \''+fromSource+'\' => \''+toSource+'\'' });
});

cec.on('ACTIVE_SOURCE', (packet, source) => {
	log.msg({ src : module_name, msg : 'Active source: \''+source+'\'' });
});

cec.on('SET_OSD_NAME', (packet, osd_name) => {
	log.msg({ src : module_name, msg : 'Set OSD name: \''+osd_name+'\'' });
	status.hdmi.osd_name = osd_name;
});

cec.on('POLLING', (packet) => {
	log.msg({ src : module_name, msg : 'Polling' });
});

module.exports = {
	client : null,
	status : {
		active_source : null,
		client_ready  : false,
		osd_name      : null,
		physical_addr : null,
		power         : null,
	},

	// Start cec-client and populate connection var
	startup : (startup_callback) => {
		status.hdmi.client_ready = false;

		cec.start('cec-client', '-t', 't');
		cec.once('ready', (client) => {
			log.msg({ src : module_name, msg : 'Started' });
			status.hdmi.client_ready = true;

			// Populate global HDMI CEC client object
			HDMI.client = client;

			// Get status
			setTimeout(() => {
				HDMI.command('powerstatus');
			}, 3000);

			// Holla back
			if (typeof startup_callback === 'function') startup_callback();
			startup_callback = undefined;
		});

	},

	shutdown : (shutdown_callback) => {

		// Shutdown and kill cec-client process
		if (status.hdmi.client_ready === true) {
			log.msg({
				src : module_name,
				msg : 'Stopping cec-client process',
			});

			// Reset status variables
			status.hdmi.client_ready  = false;
			status.hdmi.physical_addr = null;
			status.hdmi.power_status  = null;

			// Register listener to wait for stop event
			cec.on('stop', () => {
				log.msg({
					src : module_name,
					msg : 'Stopped',
				});

				if (typeof shutdown_callback === 'function') shutdown_callback();
				shutdown_callback = undefined;
			});

			// Call for stop
			cec.stop();
		}
		else {
			log.msg({
				src : module_name,
				msg : 'cec-client process not running',
			});

			// F**king reset them anyway
			status.hdmi.client_ready  = false;
			status.hdmi.physical_addr = null;
			status.hdmi.power_status  = null;

			if (typeof shutdown_callback === 'function') shutdown_callback();
			shutdown_callback = undefined;
		}
	},

	// Send commands over HDMI CEC to control attached display
	command : (action, response = null) => {
		if (HDMI.client === null) {
			var response_msg  = 'Client not available';
			var response_code = 503;

			if (response !== null) {
				response.writeHead(200, api_header);
				response.end(JSON.stringify({
					command       : action,
					response      : response_msg,
					response_code : response_code,
				}));
			}

			log.msg({
				src : module_name,
				msg : response_msg,
			});

			return;
		}

		if (status.hdmi.client_ready !== true) {
			var response_msg  = 'Client not ready';
			var response_code = 503;

			if (response !== null) {
				response.writeHead(200, api_header);
				response.end(JSON.stringify({
					command       : action,
					response      : response_msg,
					response_code : response_code,
				}));
			}

			log.msg({
				src : module_name,
				msg : response_msg,
			});
			return;
		}

		switch (action) {
			case 'powerstatus':
				var response_msg  = 'Requesting power status';
				var response_code = 200;
				HDMI.client.sendCommand(config.hdmi.manufacturer, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
				break;

			case 'poweron':
				var response_msg  = 'Sending power on';
				var response_code = 200;
				HDMI.client.sendCommand(config.hdmi.manufacturer, CEC.Opcode.IMAGE_VIEW_ON);

				// Get power status after 5 sec
				setTimeout(() => {
					HDMI.command('powerstatus');
				}, 5000);
				break;

			case 'poweroff':
				var response_msg  = 'Sending power off';
				var response_code = 200;
				HDMI.client.sendCommand(config.hdmi.manufacturer, CEC.Opcode.STANDBY);

				// Get power status after 5 sec
				setTimeout(() => {
					HDMI.command('powerstatus');
				}, 5000);
				break;

			default:
				var response_msg  = 'Unknown command \''+action+'\'';
				var response_code = 404;
		}

		log.msg({
			src : module_name,
			msg : response_msg,
		});

		if (response !== null) {
			response.writeHead(response_code, api_header);
			response.end(JSON.stringify({
				command       : action,
				response      : response_msg,
				response_code : response_code,
			}));
		}
	},
};
