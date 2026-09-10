#!/bin/sh
/etc/init.d/podkop-watchdog stop 2>/dev/null
/etc/init.d/podkop-watchdog disable 2>/dev/null
rm -f /etc/init.d/podkop-watchdog /root/podkop-watchdog.sh /root/podkop-watchdog.log /root/podkop-watchdog.rotate
echo "Podkop Watchdog removed."
