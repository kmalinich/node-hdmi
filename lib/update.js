const object_path = require('object-path');


// update('system.host_data.refresh_interval', 15000);
function update_config(key, value_new, verbose = true) {
	let value_old = object_path.get(config, key);

	if (value_new === value_old) {
		return false;
	}

	if (verbose === true) {
		log.change({
			value : 'config.' + key,
			old   : value_old,
			new   : value_new,
		});
	}

	object_path.set(config, key, value_new);

	return true;
}

// update('engine.rpm', 1235, false);
function update_status(key, value_new, verbose = true) {
	let value_old = object_path.get(status, key);

	if (value_new === value_old) {
		return false;
	}

	if (verbose === true) {
		log.change({
			value : 'status.' + key,
			old   : value_old,
			new   : value_new,
		});
	}

	object_path.set(status, key, value_new);

	return true;
}


module.exports = {
	config : (key, value_new, verbose) => { return update_config(key, value_new, verbose); },
	status : (key, value_new, verbose) => { return update_status(key, value_new, verbose); },
};
