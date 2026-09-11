#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

download_file() {
	url="$1"
	dst="$2"
	mkdir -p "$(dirname "$dst")"
	wget -q -T 20 -O "$dst" "$url" || {
		red "Ошибка загрузки: $url"
		return 1
	}
}

install_luci() {
	echo
	echo "=========================================="
	echo "     Установка LuCI Podkop Watchdog v6"
	echo "=========================================="
	echo

	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/etc/config/podkop_watchdog" \
		"/etc/config/podkop_watchdog" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/etc/init.d/podkop-watchdog" \
		"/etc/init.d/podkop-watchdog" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/usr/libexec/podkop-watchdog.sh" \
		"/usr/libexec/podkop-watchdog.sh" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/usr/libexec/rpcd/podkop-watchdog" \
		"/usr/libexec/rpcd/podkop-watchdog" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json" \
		"/usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/luci/menu.d/luci-app-podkop-watchdog.json" \
		"/usr/share/luci/menu.d/luci-app-podkop-watchdog.json" || return 1
	download_file "$REPO_RAW/luci-app-podkop-watchdog/htdocs/luci-static/resources/view/podkop-watchdog.js" \
		"/www/luci-static/resources/view/podkop-watchdog.js" || return 1

	# Remove the old v4/v5 directory-based view that caused 404/object Promise.
	rm -rf /www/luci-static/resources/view/podkop-watchdog

	chmod 755 /etc/init.d/podkop-watchdog
	chmod 755 /usr/libexec/podkop-watchdog.sh
	chmod 755 /usr/libexec/rpcd/podkop-watchdog

	/etc/init.d/rpcd restart >/dev/null 2>&1
	/etc/init.d/uhttpd restart >/dev/null 2>&1
	/etc/init.d/podkop-watchdog enable >/dev/null 2>&1
	/etc/init.d/podkop-watchdog restart >/dev/null 2>&1

	echo
	green "✓ LuCI Podkop Watchdog v6 установлен / обновлён."
	green "✓ Старый view удалён."
	green "✓ Автозапуск включён."
	echo
	echo "LuCI → Services → Podkop Watchdog"
}

remove_luci() {
	/etc/init.d/podkop-watchdog stop >/dev/null 2>&1
	/etc/init.d/podkop-watchdog disable >/dev/null 2>&1
	rm -f /etc/init.d/podkop-watchdog /etc/config/podkop_watchdog \
		/usr/libexec/podkop-watchdog.sh \
		/usr/libexec/rpcd/podkop-watchdog \
		/usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json \
		/usr/share/luci/menu.d/luci-app-podkop-watchdog.json \
		/www/luci-static/resources/view/podkop-watchdog.js
	rm -rf /www/luci-static/resources/view/podkop-watchdog
	/etc/init.d/rpcd restart >/dev/null 2>&1
	/etc/init.d/uhttpd restart >/dev/null 2>&1
	green "✓ LuCI Podkop Watchdog удалён."
}

case "$1" in
	install|update) install_luci ;;
	remove|uninstall) remove_luci ;;
	*)
		echo "Использование: $0 install | remove"
		;;
esac
