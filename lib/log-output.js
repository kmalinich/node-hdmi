#!/usr/bin/env node

module.exports = {
	// Dynamic log message output
	msg : (data) => {
		var src_fmt;
		switch (data.src.length) {
			case 3:
				src_fmt = '::'+data.src;
				break;
			case 2:
				src_fmt = ':::'+data.src;
				break;
			case 1:
				src_fmt = ':::'+data.src;
				break;
			default:
				src_fmt = ':'+data.src;
				break;
		}

		console.log('[node%s]', src_fmt, data.msg);
	},
};
