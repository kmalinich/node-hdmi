module.exports = {
	hdmi : {
		manufacturer : 0xF0,
		osd_name     : 'node-hdmi',
	},
  client : {
    enable : false,
    host   : '127.0.0.1',
    port   : 3002,
  },
  server : {
    enable_http : true,
    enable_ws   : true,
    port        : 3003,
  },
};
