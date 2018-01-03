// Scope variables
let client;

// const cec = require('node-cec');
const cec = require('../../cec/index');

// Send commands over HDMI CEC to control attached display
function command(action = 'powerstatus') {
	let command_obj = {
		check  : true,
		opcode : null,
	};

	switch (action) {
		case 'powerstatus' : {
			log.msg('Requesting power status');

			command_obj.check  = false;
			command_obj.opcode = 'give_device_power_status';
			break;
		}

		case 'poweron' : {
			// Only power on if it's not already on
			if (status.hdmi.power_status === 'on') return;

			log.msg('Sending power on');

			command_obj.opcode = 'image_view_on';
			break;
		}

		case 'poweroff' : {
			// Only power off if it's not already off
			if (status.hdmi.power_status === 'off') return;

			log.msg('Sending power off');

			command_obj.opcode = 'off';
			break;
		}
	}

	// Get status if need be
	if (command_obj.check === true) setTimeout(command, 5000);

	// Send desired command opcode
	if (command_obj.opcode !== null) client.send(config.hdmi.manufacturer, cec.types.Opcode[command_obj.opcode]);
}

// Configure event listeners
function init_listeners() {
	log.msg('Initializing listeners');

	// Error handling
	client.on('error', () => {
		log.msg('Error');
	});

	// Event handling
	client.on('active_source', (packet, active_source) => {
		update.status('hdmi.active_source', active_source);
	});

	client.on('polling', () => {
		log.msg('Polling');
	});

	client.on('report_physical_address', (packet, physical_addr) => {
		update.status('hdmi.physical_addr', physical_addr);
	});

	client.on('report_power_status', (packet, power_status) => {
		update.status('hdmi.power_status', power_status);
	});

	client.on('routing_change', (packet, routing) => {
		update.status('hdmi.routing.old', routing.old);
		update.status('hdmi.routing.new', routing.new);
	});

	client.on('set_osd_name', (packet, osd_name) => {
		update.status('hdmi.osd_name', osd_name);
	});

	log.msg('Initialized listeners');
}

// Start cec-client, populate connection var
function init(init_cb = null) {
	log.msg('Initializing');

	update.status('hdmi.client_ready', false);

	client = new cec.cec(config.hdmi.osd_string);

	// Initialize event listeners
	init_listeners();

	log.msg('Starting cec-client process');
	client.start('cec-client', '-t', 't');

	client.once('ready', () => { // Previous arg1: client
		log.msg('Initialized');

		update.status('hdmi.client_ready', true);

		// Get status
		setTimeout(() => {
			command('powerstatus');
		}, 3000);

		log.msg('Initialized');

		// Holla back
		typeof init_cb === 'function' && process.nextTick(init_cb);
		init_cb = undefined;
	});
}

// Reset HDMI status variables
function reset(reset_cb = null) {
	log.msg('Resetting HDMI status');

	update.status('hdmi.active_source', null);
	update.status('hdmi.client_ready',  false);
	update.status('hdmi.osd_name',      null);
	update.status('hdmi.physical_addr', null);
	update.status('hdmi.power_status',  null);
	update.status('hdmi.routing.new',   null);
	update.status('hdmi.routing.old',   null);

	log.msg('Reset HDMI status');

	typeof reset_cb === 'function' && process.nextTick(reset_cb);
	reset_cb = undefined;
}

// Stop cec-client, clear connection var
function term(term_cb = null) {
	log.msg('Terminating');

	// Reset status variables
	reset(() => {
		// Shutdown and kill cec-client process
		if (status.hdmi.client_ready === false) {
			log.msg('cec-client process not running');

			log.msg('Terminated');

			typeof term_cb === 'function' && process.nextTick(term_cb);
			term_cb = undefined;

			return;
		}

		// Register listener to wait for stop event
		client.once('stop', () => {
			log.msg('Terminated');
			typeof term_cb === 'function' && process.nextTick(term_cb);
			term_cb = undefined;
		}, term_cb);

		// Call for stop
		log.msg('Stopping cec-client process');
		client.stop();
	}, term_cb);
}


module.exports = {
	command : command,

	init : init,
	term : term,
};
