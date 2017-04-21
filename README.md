# node-hdmi

A node.js powered interface for HDMI-CEC, with an API running on port 3001.
POST a command to it on port 3001. Commands are listed in lib/HDMI.js.

Example curl:

`curl -X POST http://localhost:3001/hdmi -d 'command=poweron'` 
