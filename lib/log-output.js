/* eslint no-console: "off" */

const align    = require('multipad');
const caller   = require('callers-path');
const path     = require('path');
const trucolor = require('trucolor');

// 24bit color chalk-style palette
const chalk = (0, trucolor.chalkish)((0, trucolor.palette)({}, {
	black  : 'rgb:48,48,48',
	blue   : 'rgb:51,152,219',
	cyan   : 'rgb:0,200,200',
	green  : 'rgb:47,223,100',
	gray   : 'rgb:144,144,144',
	orange : 'rgb:255,153,50',
	pink   : 'rgb:178,0,140',
	purple : 'rgb:114,83,178',
	red    : 'rgb:231,76,60',
	white  : 'rgb:224,224,224',
	yellow : 'rgb:255,204,50',

	boldblack  : 'bold rgb:48,48,48',
	boldblue   : 'bold rgb:51,152,219',
	boldcyan   : 'bold rgb:0,200,200',
	boldgreen  : 'bold rgb:47,223,100',
	boldgray   : 'bold rgb:144,144,144',
	boldorange : 'bold rgb:255,153,50',
	boldpink   : 'bold rgb:178,0,140',
	boldpurple : 'bold rgb:114,83,178',
	boldred    : 'bold rgb:231,76,60',
	boldwhite  : 'bold rgb:224,224,224',
	boldyellow : 'bold rgb:255,204,50',

	italicblack  : 'italic rgb:48,48,48',
	italicblue   : 'italic rgb:51,152,219',
	italiccyan   : 'italic rgb:0,200,200',
	italicgreen  : 'italic rgb:47,223,100',
	italicgray   : 'italic rgb:144,144,144',
	italicorange : 'italic rgb:255,153,50',
	italicpink   : 'italic rgb:178,0,140',
	italicpurple : 'italic rgb:114,83,178',
	italicred    : 'italic rgb:231,76,60',
	italicwhite  : 'italic rgb:224,224,224',
	italicyellow : 'italic rgb:255,204,50',
}));


function center(string, width) {
	return align.center(string, width, ' ');
}

function colorize(string) {
	string = string.toString();

	string = string.replace('Attempting',    chalk.yellow('Attempting'));
	string = string.replace('Connecting',    chalk.yellow('Connecting'));
	string = string.replace('Initializing',  chalk.yellow('Initializing'));
	string = string.replace('Resetting',     chalk.yellow('Resetting'));
	string = string.replace('Shutting down', chalk.yellow('Shutting down'));
	string = string.replace('Starting',      chalk.yellow('Starting'));
	string = string.replace('Stopping',      chalk.yellow('Stopping'));
	string = string.replace('Terminating',   chalk.yellow('Terminating'));

	string = string.replace('Disconnected',  chalk.red('Disconnected'));
	string = string.replace('Error',         chalk.red('Error'));
	string = string.replace('SIGINT',        chalk.red('SIGINT'));
	string = string.replace('SIGTERM',       chalk.red('SIGTERM'));
	string = string.replace('Shut down',     chalk.red('Shut down'));
	string = string.replace('Stopped',       chalk.red('Stopped'));
	string = string.replace('Terminated',    chalk.red('Terminated'));
	string = string.replace('Unset',         chalk.red('Unset'));
	string = string.replace(' closed',       chalk.red(' closed'));
	string = string.replace(' disconnected', chalk.red(' disconnected'));
	string = string.replace('error',         chalk.red('error'));
	string = string.replace('false',         chalk.red('false'));

	string = string.replace('Connected ',   chalk.green('Connected '));
	string = string.replace('Initialized',  chalk.green('Initialized'));
	string = string.replace('Reset ',       chalk.green('Reset '));
	string = string.replace('Listening ',   chalk.green('Listening '));
	string = string.replace('Loaded ',      chalk.green('Loaded '));
	string = string.replace('Read ',        chalk.green('Read '));
	string = string.replace('Set ',         chalk.green('Set '));
	string = string.replace('Started',      chalk.green('Started'));
	string = string.replace('Wrote',        chalk.green('Wrote'));
	string = string.replace(' connected',   chalk.green(' connected'));
	string = string.replace(' opened',      chalk.green(' opened'));
	string = string.replace('true',         chalk.green('true'));

	return string;
}

// Should we output to stdout?
function should_not_output() {
	// Err on the side of caution
	if (typeof config                === 'undefined') return false;
	if (typeof config.console        === 'undefined') return false;
	if (typeof config.console.output === 'undefined') return false;

	// If we're in a TTY, output to stdout
	// If we're not, only output if config.console.output is true
	let active_tty = Boolean(process.stdout.isTTY) && Boolean(process.stdin.isTTY);
	switch (active_tty) {
		case true  : return false;
		case false : return !config.console.output;
	}
}


module.exports = {
	// 24bit color chalk-style palette
	chalk : chalk,

	// Formatted output for when a value changes
	change : (data) => {
		// Bounce if we're supposed to write to stdout
		if (should_not_output()) return;

		data.command = 'CHANGE';

		data.src = path.parse(caller()).name;

		// Pad strings
		data.src_fmt     = center(data.src,     10);
		data.command_fmt = center(data.command, 10);

		// Catch nulls
		if (typeof data.old === 'undefined' || data.old == null) data.old = 'null';
		if (typeof data.new === 'undefined' || data.new == null) data.new = 'null';

		// Colorize strings
		data.src_fmt     = chalk.cyan(data.src_fmt);
		data.command_fmt = chalk.cyan(data.command_fmt);
		data.old         = chalk.red(data.old.toString());
		data.new         = chalk.green(data.new.toString());

		// Replace and colorize true/false
		data.old = data.old.toString().replace('true', chalk.green('true')).replace('false', chalk.red('false'));
		data.new = data.new.toString().replace('true', chalk.green('true')).replace('false', chalk.red('false'));

		// Render gray arrow
		// let arrows = chalk.gray('=>');
		// Output formatted string
		// console.log('[%s] [%s] %s: \'%s\' %s \'%s\'', data.src_fmt, data.command_fmt, data.value, data.old, arrows, data.new);
		console.log('[%s] [%s] %s: \'%s\'', data.src_fmt, data.command_fmt, data.value, data.new);
	},

	msg : (data) => {
		// Bounce if we're supposed to write to stdout
		if (should_not_output()) return;

		// Handle single-string input
		if (typeof data === 'string') data = { msg : data };

		data.src = path.parse(caller()).name;

		data.command = 'MSG';

		// Pad strings
		data.src_fmt     = center(data.src,     10);
		data.command_fmt = center(data.command, 10);

		// Colorize strings
		data.src_fmt     = chalk.gray(data.src_fmt);
		data.command_fmt = chalk.gray(data.command_fmt);

		data.msg = colorize(data.msg);

		// Output formatted string
		console.log('[%s] [%s] %s', data.src_fmt, data.command_fmt, data.msg);
	},
};
