# node-hdmi

A node.js interface for HDMI-CEC, with an API running on port 3001.  
I use it on one of my Raspberry Pi devices for my other project, [node-bmw](https://github.com/kmalinich/node-bmw).  
It's not pretty, I just hacked something together to get the job done. WebSocket functionality TBD.

## Usage
Issue an HTTP POST to port 3001 to command it, or an HTTP GET to port 3001 to get JSON status info.

## Commands
* `poweron`
* `poweroff`
* `powerstatus`

## Example HTTP POST curl
```json
curl -s -X POST http://localhost:3001/hdmi -d 'command=poweron' | jq .
{
  "command": "powerstatus",
  "response": "Requesting power status",
  "response_code": 200
}
```

## Example HTTP GET curl
```json
curl -s -X GET http://localhost:3001/hdmi | jq .
{
  "active_source": null,
  "client_ready": true,
  "osd_name": "node-hdmi",
  "physical_addr": 4096,
  "power": "STANDBY"
}
```

## Building libcec from source
You'll probably need to build libcec from source, links:  
* [Building libcec on Raspberry Pi](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.raspberrypi.md)  
* [Building libcec on Linux](https://github.com/Pulse-Eight/libcec/blob/master/docs/README.linux.md)  

Note that with the latest Kodi v17.1 on the latest Raspbian (as of this writing), building libcec from source is required due to Kodi's requirement of libcec v4.
