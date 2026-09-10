#!/bin/sh

echo "Removing Podkop Watchdog..."

/etc/init.d/podkop-watchdog stop 2>/dev/null
/etc/init.d/podkop-watchdog disable 2>/dev/null

rm -f /etc/init.d/podkop-watchdog
rm -f /root/podkop-watchdog.sh
rm -f /root/podkop-watchdog.log
rm -f /root/podkop-watchdog.rotate

echo "Podkop Watchdog removed."
