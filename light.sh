#!/bin/sh

URL=http://admin:WelcometoCX01@10.0.1.16:8083/ZAutomation/api/v1/devices/ZWayVDev_zway_2-0-37/command

if [ -n "$1" ]; then
  URL=$URL/on
else
  URL=$URL/off
fi

/usr/bin/curl $URL >>$HOME/log/light.log 2>&1
echo >>$HOME/log/light.log

exit 0
