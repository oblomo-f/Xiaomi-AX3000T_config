#!/bin/sh

. /lib/functions.sh

CONFIG="/etc/config/podkop_watchdog"

config_load podkop_watchdog
config_get DOMAIN main domain "google.com"
config_get CHECK_INTERVAL main check_interval "30"
config_get FAIL_LIMIT main fail_limit "3"
config_get RESTART_WAIT main restart_wait "20"
config_get ROTATE_SECONDS main rotate_seconds "259200"
config_get LOG main log "/root/podkop-watchdog.log"

FAIL=0
LAST_ROTATE="$(date +%s)"

log_msg() {
	echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"
}

check_rotate() {
	NOW="$(date +%s)"
	[ "$ROTATE_SECONDS" -gt 0 ] 2>/dev/null || return 0
	[ $((NOW - LAST_ROTATE)) -ge "$ROTATE_SECONDS" ] 2>/dev/null || return 0
	: > "$LOG"
	LAST_ROTATE="$NOW"
}

while :; do
	check_rotate

	if wget -q -T 10 -O /dev/null "https://$DOMAIN/" 2>/dev/null; then
		FAIL=0
	else
		FAIL=$((FAIL + 1))
		log_msg "Ошибка проверки $DOMAIN ($FAIL/$FAIL_LIMIT)"

		if [ "$FAIL" -ge "$FAIL_LIMIT" ]; then
			log_msg "Интернет недоступен. Перезапускаю Podkop."
			/etc/init.d/podkop restart >/dev/null 2>&1
			sleep "$RESTART_WAIT"
			FAIL=0
			log_msg "Проверка после перезапуска Podkop."
		fi
	fi

	sleep "$CHECK_INTERVAL"
done
