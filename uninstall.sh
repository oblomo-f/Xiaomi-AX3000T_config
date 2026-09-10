#!/bin/sh
/etc/init.d/podkop-watchdog stop >/dev/null 2>&1
/etc/init.d/podkop-watchdog disable >/dev/null 2>&1
rm -f /etc/init.d/podkop-watchdog /root/podkop-watchdog.sh /root/podkop-watchdog.log /root/podkop-watchdog.rotate
echo "Podkop Watchdog removed."
