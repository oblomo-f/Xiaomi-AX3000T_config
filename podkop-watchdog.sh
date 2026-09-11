#!/bin/sh

CONFIG="podkop_watchdog"
DOMAIN="$(uci -q get ${CONFIG}.main.domain 2>/dev/null || echo google.com)"
CHECK_INTERVAL="$(uci -q get ${CONFIG}.main.check_interval || echo 30)"
FAIL_LIMIT="$(uci -q get ${CONFIG}.main.fail_limit || echo 3)"
RESTART_WAIT="$(uci -q get ${CONFIG}.main.restart_wait || echo 20)"
ROTATE_SECONDS="$(uci -q get ${CONFIG}.main.rotate_seconds || echo 259200)"
LOG="$(uci -q get ${CONFIG}.main.log || echo /root/podkop-watchdog.log)"
WAN_INTERFACE="$(uci -q get ${CONFIG}.main.wan_interface || echo wan)"
RESTART_WAN="$(uci -q get ${CONFIG}.main.restart_wan || echo 0)"

FAIL=0
START_TIME="$(date +%s)"

mkdir -p "$(dirname "$LOG")"
touch "$LOG"

log() {
	echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"
}

restart_wan() {
	if [ "$RESTART_WAN" != "1" ] || [ -z "$WAN_INTERFACE" ]; then
		return 0
	fi

	log "Restarting WAN interface: $WAN_INTERFACE"
	IFDOWN="$(command -v ifdown 2>/dev/null || true)"
	[ -n "$IFDOWN" ] || [ -x /sbin/ifdown ] && IFDOWN="/sbin/ifdown"
	IFUP="$(command -v ifup 2>/dev/null || true)"
	[ -n "$IFUP" ] || [ -x /sbin/ifup ] && IFUP="/sbin/ifup"

	if [ -x "$IFDOWN" ]; then
		"$IFDOWN" "$WAN_INTERFACE" 2>>"$LOG" || log "ifdown failed for $WAN_INTERFACE"
	else
		log "ERROR: ifdown not found"
	fi

	sleep 3

	if [ -x "$IFUP" ]; then
		"$IFUP" "$WAN_INTERFACE" 2>>"$LOG" || log "ifup failed for $WAN_INTERFACE"
	else
		log "ERROR: ifup not found"
	fi
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
			if [ "$RESTART_WAN" = "1" ]; then
				restart_wan
				sleep "$RESTART_WAIT"
			fi

			log "Restarting Podkop after $FAIL_LIMIT failed checks"
			/etc/init.d/podkop restart
			sleep "$RESTART_WAIT"
			FAIL=0
		fi
	fi

	sleep "$CHECK_INTERVAL"
done
