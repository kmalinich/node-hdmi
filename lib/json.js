var module_name = __filename.slice(__dirname.length + 1, -3);

const jsonfile = require('jsonfile');

const file_config = app_path+'/config.json';
const file_status = app_path+'/status.json';

config_default = require('config-default');
status_default = require('status-default');

module.exports = {
	// Read config+status
	read : (read_callback = null) => {
		json.config_read(() => { // Read JSON config file
			json.status_read(() => { // Read JSON status file
				if (typeof read_callback === 'function') read_callback();
				read_callback = undefined;
			});
		});
	},

	// Write config+status
	write : (write_callback = null) => {
		json.config_write(() => { // Read JSON config file
			json.status_write(() => { // Read JSON status file
				if (typeof write_callback === 'function') write_callback();
				write_callback = undefined;
			});
		});
	},

	// Read config JSON
	config_read : (config_read_callback = null) => {
		jsonfile.readFile(file_config, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to read config, error '+error.errno+' ('+error.code+')',
				});

				config = config_default;
				json.config_write(config_read_callback);
				return false;
			}

			config = obj;
			log.msg({
				src : module_name,
				msg : 'Read config',
			});

			if (typeof config_read_callback === 'function') config_read_callback();
			config_read_callback = undefined;
		});
	},

	// Write config JSON
	config_write : (config_write_callback = null) => {
		jsonfile.writeFile(file_config, config, {spaces: 2}, (error) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to write config, '+error.errno+' ('+error.code+')',
				});

				if (typeof config_write_callback === 'function') config_write_callback();
				config_write_callback = undefined;
				return false;
			}

			log.msg({
				src : module_name,
				msg : 'Wrote config',
			});

			if (typeof config_write_callback === 'function') config_write_callback();
			config_write_callback = undefined;
		});
	},

	// Read status JSON
	status_read : (status_read_callback = null) => {
		jsonfile.readFile(file_status, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to read status, '+error.errno+' ('+error.code+')',
				});

				status = status_default;
				json.status_write(status_read_callback);
				return false;
			}

			status = obj;
			log.msg({
				src : module_name,
				msg : 'Read status',
			});

			if (typeof status_read_callback === 'function') status_read_callback();
			status_read_callback = undefined;
		});
	},

	// Write status JSON
	status_write : (status_write_callback = null) => {
		jsonfile.writeFile(file_status, status, {spaces: 2}, (error) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to write status, '+error.errno+' ('+error.code+')',
				});

				if (typeof status_write_callback === 'function') status_write_callback();
				status_write_callback = undefined;
				return false;
			}

			log.msg({
				src : module_name,
				msg : 'Wrote status',
			});

			if (typeof status_write_callback === 'function') status_write_callback();
			status_write_callback = undefined;
		});
	},
};
