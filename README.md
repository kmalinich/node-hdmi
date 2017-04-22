# node-hdmi

A node.js interface for HDMI-CEC, with an API running on port 3001.  
I use it on one of my Raspberry Pi devices for my other project, [node-bmw](https://github.com/kmalinich/node-bmw)

## Usage
Issue an HTTP POST a command to it on port 3001.  

## Commands
* `poweron`
* `poweroff`
* `powerstatus`

## Example curl
```bash
curl -X POST http://localhost:3001/hdmi -d 'command=poweron'
```

## Building libcec from source
You'll probably need to build libcec from source, links:  
* [Building libcec on Raspberry Pi](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.raspberrypi.md)  
* [Building libcec on Linux](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.linux.md)  

Note that with the latest Kodi v17.1 on the latest Raspbian (as of this writing), building libcec from source is required due to Kodi's requirement of libcec v4.
