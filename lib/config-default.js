module.exports = {
	hdmi : {
		manufacturer : 0xF0,
		osd_name     : 'node-hdmi',
	},
	client : {
		host   : '127.0.0.1',
		port   : 3003,
	},
	server : {
		enable_http : true,
		enable_ws   : false,
		port        : 3003,
	},
};
