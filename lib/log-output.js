/* eslint no-console : 0 */

const align = require('multipad');
const chalk = require('chalk');

function center(string, width) {
	return align.center(string, width, ' ');
}

module.exports = {
	// Formatted output for when a value changes
	change : (data) => {
		data.command = 'CHANGE';

		// Pad strings
		data.src_fmt     = center(data.src,     14);
		data.command_fmt = center(data.command, 9);

		// Colorize strings
		data.src_fmt     = chalk.cyan(data.src_fmt);
		data.command_fmt = chalk.cyan(data.command_fmt);
		data.old         = chalk.red(data.old);
		data.new         = chalk.green(data.new);

		// Replace and colorize true/false
		data.old = data.old.toString().replace('true', chalk.green('true')).replace('false', chalk.red('false'));
		data.new = data.new.toString().replace('true', chalk.green('true')).replace('false', chalk.red('false'));

		// Render gray arrow
		var arrows = chalk.white.dim('=>');

		// Output formatted string
		console.log('[%s] [%s] %s: \'%s\' %s \'%s\'', data.src_fmt, data.command_fmt, data.value, data.old, arrows, data.new);

		// Send log data to WebSocket
		// socket.log_msg(data);
	},

	msg : (data) => {
		data.command = 'MESSAGE';

		// Pad strings
		data.src_fmt     = center(data.src,     14);
		data.command_fmt = center(data.command, 9);

		// Colorize strings
		data.src_fmt     = chalk.white.dim(data.src_fmt);
		data.command_fmt = chalk.white.dim(data.command_fmt);

		// Output formatted string
		console.log('[%s] [%s] %s', data.src_fmt, data.command_fmt, data.msg);

		// Send log data to WebSocket
		// socket.log_msg(data);
	},

	module : (data) => {
		data.command = 'MESSAGE';

		// Pad strings
		data.src_fmt     = center(data.src,     14);
		data.command_fmt = center(data.command, 9);

		// Colorize strings
		data.src_fmt     = chalk.magenta(data.src_fmt);
		data.command_fmt = chalk.white.dim(data.command_fmt);

		// Output formatted string
		console.log('[%s] [%s] %s', data.src_fmt, data.command_fmt, data.msg);

		// Send log data to WebSocket
		// socket.log_msg(data);
	},

	// Dynamic log message output
	send : (data) => {
		log.bus({
			bus     : 'sock',
			command : data.host.split('.')[0],
			value   : data.host,
			src     : {
				name : data.src,
			},
			dst : {
				name : data.dst,
			},
		});
	},
};
