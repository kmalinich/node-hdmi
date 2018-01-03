// Scope variables
let CEC;
let NodeCec;
let cec;
let nodecec;

// Send commands over HDMI CEC to control attached display
function command(action, override = false) {
	let command_obj;

	switch (action) {
		case 'powerstatus':
			log.msg({ msg : 'Requesting power status' });

			command_obj = {
				check  : false,
				opcode : CEC.Opcode.GIVE_DEVICE_POWER_STATUS,
			};
			break;

		case 'poweron':
			// Only power on if it's not already on
			if (override === false && status.hdmi.power_status === 'ON') return;

			// Note that we've powered it on
			HDMI.powered_on_once = true;

			log.msg({ msg : 'Sending power on' });

			command_obj = {
				check  : true,
				opcode : CEC.Opcode.IMAGE_VIEW_ON,
			};
			break;

		case 'poweroff':
			// Only power off if it's not already off
			if (override === false && status.hdmi.power_status === 'STANDBY') return;

			log.msg({ msg : 'Sending power off' });

			command_obj = {
				check  : true,
				opcode : CEC.Opcode.STANDBY,
			};
			break;

		case 'poweroff_powered_on_once':
			// Only power off if we've powered it on once already
			if (HDMI.powered_on_once !== true) return;
			command('poweroff', true);
	}

	// Send desired command opcode
	if (typeof command_obj !== 'undefined') {
		if (typeof command_obj.opcode !== 'undefined') {
			HDMI.hdmi_client.sendCommand(config.hdmi.manufacturer, command_obj.opcode);
		}

		// Get status if need be
		if (typeof command_obj.check !== 'undefined') {
			if (command_obj.check === true) {
				setTimeout(() => {
					command('powerstatus');
				}, 5000);
			}
		}
	}
}

// Configure event listeners
function init_listeners() {
	// Error handling
	cec.on('error', () => {
		log.msg({ msg : 'Error' });
	});

	// Event handling
	cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
		update.status('hdmi.physical_addr', address);
	});

	cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
		log.msg({ msg : 'Routing change: \'' + fromSource + '\' => \'' + toSource + '\'' });
	});

	cec.on('ACTIVE_SOURCE', (packet, source) => {
		log.msg({ msg : 'Active source: \'' + source + '\'' });
	});

	cec.on('SET_OSD_NAME', (packet, osdname) => {
		log.msg({ msg : 'Set OSD name: \'' + osdname + '\'' });
	});

	cec.on('POLLING', () => {
		log.msg({ msg : 'Polling' });
	});

	cec.on('REPORT_POWER_STATUS', (packet, power_status) => {
		let keys = Object.keys(CEC.PowerStatus);

		for (let i = keys.length - 1; i >= 0; i--) {
			if (CEC.PowerStatus[keys[i]] !== power_status) continue;
			update.status('hdmi.power_status', keys[i]);
			break;
		}
	});

	log.msg({ msg : 'Initialized' });
}

// Start cec-client, populate connection var
function init(init_cb) {
	update.status('hdmi.client_ready', false);

	// Only pull in libraries if HDMI is enabled
	nodecec = require('node-cec');
	NodeCec = nodecec.NodeCec;
	CEC     = nodecec.CEC;
	cec     = new NodeCec(config.hdmi.osd_string);

	cec.start('cec-client', '-t', 't');
	cec.once('ready', (client) => {
		log.msg({ msg : 'Initialized' });
		update.status('hdmi.client_ready', true);

		init_listeners();

		// Populate global HDMI CEC client object
		HDMI.hdmi_client = client;

		// Get status
		setTimeout(() => {
			command('powerstatus');
		}, 3000);

		// Holla back
		process.nextTick(init_cb);
	});
}

// Stop cec-client, clear connection var
function term(term_cb) {
	// Shutdown and kill cec-client process
	if (status.hdmi.client_ready === true) {
		log.msg({ msg : 'Stopping cec-client process' });

		// Reset status variables
		update.status('hdmi.client_ready',  false);
		update.status('hdmi.physical_addr', null);
		update.status('hdmi.power_status',  null);

		// Register listener to wait for stop event
		cec.on('stop', () => {
			log.msg({ msg : 'Terminated' });
			process.nextTick(term_cb);
		});

		// Call for stop
		cec.stop();
	}
	else {
		log.msg({ msg : 'cec-client process not running' });

		// F**king reset them anyway
		update.status('hdmi.client_ready',  false);
		update.status('hdmi.physical_addr', null);
		update.status('hdmi.power_status',  null);

		process.nextTick(term_cb);
		term_cb = undefined;
	}
}


module.exports = {
	powered_on_once : false,

	hdmi_client : null,

	command        : command,
	init           : init,
	init_listeners : init_listeners,
	term           : term,

};
