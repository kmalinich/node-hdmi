# node-hdmi

A node.js powered interface for HDMI-CEC, with an API running on port 3001.
POST a command to it on port 3001. Commands are listed in lib/HDMI.js.

Example curl:
`curl -X POST http://localhost:3001/hdmi -d 'command=poweron'` 

You'll probably need to build libcec from source, links:

[Building libcec on Raspberry Pi](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.raspberrypi.md)
[Building libcec on Linux](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.linux.md)

Note that with the latest Kodi v17.1 on the latest Raspbian (as of this writing), building libcec from source is required due to Kodi's requirement of libcec v4.
