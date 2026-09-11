#!/bin/sh

CONFIG="podkop_watchdog"
DOMAIN="$(uci -q get ${CONFIG}.main.domain || echo google.com)"
CHECK_INTERVAL="$(uci -q get ${CONFIG}.main.check_interval || echo 30)"
FAIL_LIMIT="$(uci -q get ${CONFIG}.main.fail_limit || echo 3)"
RESTART_WAIT="$(uci -q get ${CONFIG}.main.restart_wait || echo 20)"
ROTATE_SECONDS="$(uci -q get ${CONFIG}.main.rotate_seconds || echo 259200)"
LOG="$(uci -q get ${CONFIG}.main.log || echo /root/podkop-watchdog.log)"

FAIL=0
START_TIME="$(date +%s)"

mkdir -p "$(dirname "$LOG")"
touch "$LOG"

log() {
	echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"
}

while true; do
	now="$(date +%s)"

	if [ $((now - START_TIME)) -ge "$ROTATE_SECONDS" ]; then
		: > "$LOG"
		START_TIME="$now"
	fi

	if wget -q -T 10 -O /dev/null "https://$DOMAIN/"; then
		FAIL=0
	else
		FAIL=$((FAIL + 1))
		log "Internet check failed: $DOMAIN ($FAIL/$FAIL_LIMIT)"

		if [ "$FAIL" -ge "$FAIL_LIMIT" ]; then
			log "Restarting Podkop after $FAIL_LIMIT failed checks"
			/etc/init.d/podkop restart
			sleep "$RESTART_WAIT"
			FAIL=0
		fi
	fi

	sleep "$CHECK_INTERVAL"
done
