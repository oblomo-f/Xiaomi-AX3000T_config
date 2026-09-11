#!/bin/sh

CONFIG="podkop_watchdog"

load_config() {
	DOMAIN="$(uci -q get ${CONFIG}.main.domain 2>/dev/null)"
	[ -n "$DOMAIN" ] || DOMAIN="google.com"
	CHECK_INTERVAL="$(uci -q get ${CONFIG}.main.check_interval 2>/dev/null)"
	[ -n "$CHECK_INTERVAL" ] || CHECK_INTERVAL="30"
	FAIL_LIMIT="$(uci -q get ${CONFIG}.main.fail_limit 2>/dev/null)"
	[ -n "$FAIL_LIMIT" ] || FAIL_LIMIT="3"
	RESTART_WAIT="$(uci -q get ${CONFIG}.main.restart_wait 2>/dev/null)"
	[ -n "$RESTART_WAIT" ] || RESTART_WAIT="20"
	ROTATE_SECONDS="$(uci -q get ${CONFIG}.main.rotate_seconds 2>/dev/null)"
	[ -n "$ROTATE_SECONDS" ] || ROTATE_SECONDS="259200"
	LOG="$(uci -q get ${CONFIG}.main.log 2>/dev/null)"
	[ -n "$LOG" ] || LOG="/root/podkop-watchdog.log"
	WAN_INTERFACE="$(uci -q get ${CONFIG}.main.wan_interface 2>/dev/null)"
	[ -n "$WAN_INTERFACE" ] || WAN_INTERFACE="wan"
	RESTART_WAN="$(uci -q get ${CONFIG}.main.restart_wan 2>/dev/null)"
	[ -n "$RESTART_WAN" ] || RESTART_WAN="0"
}

load_config

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
	# Reload settings on every cycle so changes made in Web are picked up
	# without relying on an old process environment.
	load_config
	CHECK_START="$(date +%s)"

	now="$CHECK_START"

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

	# CHECK_INTERVAL is the interval between the START of checks, not
	# CHECK_INTERVAL plus the wget timeout. This keeps a configured 20 s
	# interval close to 20 s even when wget takes several seconds to fail.
	CHECK_END="$(date +%s)"
	ELAPSED=$((CHECK_END - CHECK_START))
	SLEEP_FOR=$((CHECK_INTERVAL - ELAPSED))
	[ "$SLEEP_FOR" -gt 0 ] || SLEEP_FOR=0
	sleep "$SLEEP_FOR"
done
