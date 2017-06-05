module.exports = {
  hdmi : {
    client_ready  : null,
    physical_addr : null,
    power_status  : null,
  },
  server : {
    up : false,
  },
  client : {
    connected    : false,
    connecting   : false,
    latency      : 0,
    reconnecting : false,
  },
};
