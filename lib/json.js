const write_options = { spaces : '\t' };

const defaults = require('defaults-deep');
const jsonfile = require('jsonfile');

const file_config = app_path + '/config.json';
const file_status = app_path + '/status.json';

const config_default = require('config-default');
const status_default = require('status-default');

// Read config+status
function read(read_callback = null) {
	json.config_read(() => { // Read JSON config file
		json.status_read(() => { // Read JSON status file
			if (typeof read_callback === 'function') read_callback();
			read_callback = undefined;
		});
	});
}

// Write config+status
function write(write_callback = null) {
	json.config_write(() => { // Read JSON config file
		json.status_write(() => { // Read JSON status file
			if (typeof write_callback === 'function') write_callback();
			write_callback = undefined;
		});
	});
}

// Read config JSON
function config_read(config_read_callback = null) {
	jsonfile.readFile(file_config, (error, obj) => {
		if (error !== null) {
			log.msg('Failed to read config, error ' + error.errno + ' (' + error.code + ')');

			config = config_default;
			json.config_write(config_read_callback);
			return false;
		}

		// Lay the default values on top of the read object,
		// in case new values were added
		config = defaults(obj, config_default);

		log.msg('Read config');

		if (typeof config_read_callback === 'function') config_read_callback();
		config_read_callback = undefined;
	});
}

// Write config JSON
function config_write(config_write_callback = null) {
	jsonfile.writeFile(file_config, config, write_options, (error) => {
		if (error !== null) {
			log.msg({
				msg : 'Failed to write config, ' + error.errno + ' (' + error.code + ')',
			});

			if (typeof config_write_callback === 'function') config_write_callback();
			config_write_callback = undefined;
			return false;
		}

		log.msg('Wrote config');

		if (typeof config_write_callback === 'function') config_write_callback();
		config_write_callback = undefined;
	});
}

// Read status JSON
function status_read(status_read_callback = null) {
	jsonfile.readFile(file_status, (error, obj) => {
		if (error !== null) {
			log.msg('Failed to read status, ' + error.errno + ' (' + error.code + ')');

			status = status_default;
			json.status_write(status_read_callback);
			return false;
		}

		// Lay the default values on top of the read object,
		// in case new values were added
		status = defaults(obj, status_default);

		log.msg('Read status');

		if (typeof status_read_callback === 'function') status_read_callback();
		status_read_callback = undefined;
	});
}

// Write status JSON
function status_write(status_write_callback = null) {
	jsonfile.writeFile(file_status, status, write_options, (error) => {
		if (error !== null) {
			log.msg({
				msg : 'Failed to write status, ' + error.errno + ' (' + error.code + ')',
			});

			if (typeof status_write_callback === 'function') status_write_callback();
			status_write_callback = undefined;
			return false;
		}

		log.msg('Wrote status');

		if (typeof status_write_callback === 'function') status_write_callback();
		status_write_callback = undefined;
	});
}


module.exports = {
	config_read  : config_read,
	config_write : config_write,

	status_read  : status_read,
	status_write : status_write,

	read  : read,
	write : write,
};
