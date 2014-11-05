#!/bin/sh
cd /home/colinmcd/Code/ThePiratePort/
node_modules/forever/bin/forever stopall
node_modules/forever/bin/forever start server.js
