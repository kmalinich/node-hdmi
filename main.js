/* eslint no-console : 0 */

app_path = __dirname;

// Global libraries
api    = require('api');
hdmi   = require('hdmi');
json   = require('json');
log    = require('log-output');
update = require('update');


// Configure term event listeners
function term_config(pass) {
	process.on('SIGTERM', () => {
		console.log('');
		log.msg({ msg : 'Caught SIGTERM' });
		process.nextTick(term);
	});

	process.on('SIGINT', () => {
		console.log('');
		log.msg({ msg : 'Caught SIGINT' });
		process.nextTick(term);
	});

	process.on('exit', () => {
		log.msg({ msg : 'Terminated' });
	});

	process.nextTick(pass);
}

// Global init
function init() {
	log.msg({ msg : 'Initializing' });

	json.read(() => { // Read JSON config and status files
		api.init(() => { // Start API server(s)
			hdmi.init(() => { // Start HDMI-CEC
				log.msg({ msg : 'Initialized' });
			}, term);
		}, term);
	}, term);
}

// Global shutdown
function term() {
	log.msg({ msg : 'Terminating' });

	json.write(() => { // Write JSON config and status files
		api.term(() => { // Stop API server(s)
			hdmi.term(() => { // Stop HDMI-CEC
				process.exit();
			});
		});
	});
}


// FASTEN SEATBELTS
term_config(init);
