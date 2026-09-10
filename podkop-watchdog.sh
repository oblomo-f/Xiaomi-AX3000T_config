#!/bin/sh

# Podkop Watchdog
# Checks Internet access by domain and restarts Podkop
# after consecutive failures.

DOMAIN="google.com"
CHECK_INTERVAL=30
FAIL_LIMIT=3
RESTART_WAIT=20
ROTATE_SECONDS=259200

LOG="/root/podkop-watchdog.log"
ROTATE="/root/podkop-watchdog.rotate"

touch "$LOG"
touch "$ROTATE"

rotate_log() {
    NOW="$(date +%s)"
    LAST_ROTATE="$(cat "$ROTATE" 2>/dev/null)"

    if [ -z "$LAST_ROTATE" ] || [ $((NOW - LAST_ROTATE)) -ge "$ROTATE_SECONDS" ]; then
        : > "$LOG"
        echo "$NOW" > "$ROTATE"
    fi
}

FAIL=0

while true; do
    rotate_log

    if wget -q -O /dev/null --timeout=5 "https://$DOMAIN"; then
        FAIL=0
    else
        FAIL=$((FAIL + 1))
        echo "$(date '+%Y-%m-%d %H:%M:%S') Internet check failed: $DOMAIN ($FAIL/$FAIL_LIMIT)" >> "$LOG"
    fi

    if [ "$FAIL" -ge "$FAIL_LIMIT" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') Internet unavailable, restarting Podkop" >> "$LOG"

        /etc/init.d/podkop restart

        sleep "$RESTART_WAIT"

        echo "$(date '+%Y-%m-%d %H:%M:%S') Podkop restart completed" >> "$LOG"

        FAIL=0
    fi

    sleep "$CHECK_INTERVAL"
done
