var module_name = __filename.slice(__dirname.length + 1, -3);

var nodecec = require('node-cec');
var NodeCec = nodecec.NodeCec;
var CEC     = nodecec.CEC;
var cec     = new NodeCec('node-hdmi');

// 0xF0 = Samsung

cec.on('REPORT_POWER_STATUS', (packet, power_status) => {
	var keys = Object.keys(CEC.PowerStatus);

	for (var i = keys.length - 1; i >= 0; i--) {
		if (CEC.PowerStatus[keys[i]] === power_status) {
			console.log('[node:HDMI] Power status: \'%s\'', keys[i]);
			HDMI.status.power = keys[i];
			break;
		}
	}
});

// Error handling
cec.on('error', () => {
	console.log('[node:HDMI] Error');
});

// Event handling
cec.on('REPORT_PHYSICAL_ADDRESS', (packet, physical_addr) => {
	console.log('[node:HDMI] Physical address: \'%s\'', physical_addr);
	HDMI.status.physical_addr = physical_addr;
});
cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
	console.log('[node:HDMI] Routing change : \'%s\' => \'%s\'', fromSource, toSource);
});
cec.on('ACTIVE_SOURCE', (packet, active_source) => {
	console.log('[node:HDMI] Active source : \'%s\'', active_source);
	HDMI.status.active_source = active_source;
});
cec.on('SET_OSD_NAME', (packet, osd_name) => {
	console.log('[node:HDMI] Set OSD name : \'%s\'', osd_name);
	HDMI.status.osd_name = osd_name;
});
cec.on('POLLING', (packet) => {
	console.log('[node:HDMI] Polling');
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
	startup : (callback) => {
		HDMI.status.client_ready = false;

		cec.start('cec-client', '-t', 't');
		cec.once('ready', (client) => {
			log.msg({
				src : module_name,
				msg : 'Started',
			});
			HDMI.status.client_ready = true;

			// Populate global HDMI CEC client object
			HDMI.client = client;

			// Get status
			setTimeout(() => {
				HDMI.command('powerstatus');
			}, 3000);

			// Holla back
			callback();
		});
	},

	shutdown : (callback) => {
		// Shutdown and kill cec-client process
		if (HDMI.status.client_ready === true) {
			log.msg({
				src : module_name,
				msg : 'Stopping cec-client process',
			});

			// Reset status variables
			HDMI.status.client_ready  = false;
			HDMI.status.physical_addr = null;
			HDMI.status.power         = null;

			// Register listener to wait for stop event
			cec.on('stop', () => {
				log.msg({
					src : module_name,
					msg : 'Stopped',
				});

				if (typeof callback === 'function') { callback(); }
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
			HDMI.status.client_ready  = false;
			HDMI.status.physical_addr = null;
			HDMI.status.power         = null;
			if (typeof callback === 'function') { callback(); }
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

		if (HDMI.status.client_ready !== true) {
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
				HDMI.client.sendCommand(0xF0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
				break;

			case 'poweron':
				var response_msg  = 'Sending power on';
				var response_code = 200;
				HDMI.client.sendCommand(0xF0, CEC.Opcode.IMAGE_VIEW_ON);

				// Get power status after 5 sec
				setTimeout(() => {
					HDMI.command('powerstatus');
				}, 5000);
				break;

			case 'poweroff':
				var response_msg  = 'Sending power off';
				var response_code = 200;
				HDMI.client.sendCommand(0xF0, CEC.Opcode.STANDBY);

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
