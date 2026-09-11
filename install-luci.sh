#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
LUCI_DIR="/usr/share/luci-app-podkop-watchdog"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

need_root() {
    [ "$(id -u)" = "0" ] || {
        red "Ошибка: запусти от root."
        exit 1
    }
}

download_file() {
    url="$1"
    dst="$2"
    mkdir -p "$(dirname "$dst")"
    if ! wget -q -T 20 -O "$dst" "$url"; then
        red "Ошибка загрузки: $url"
        return 1
    fi
}

install_luci() {
    echo
    echo "=========================================="
    echo "     Установка LuCI Podkop Watchdog"
    echo "=========================================="
    echo

    # Base watchdog files
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

    download_file "$REPO_RAW/luci-app-podkop-watchdog/htdocs/luci-static/resources/view/podkop-watchdog/index.js" \
        "/www/luci-static/resources/view/podkop-watchdog/index.js" || return 1

    chmod 755 /etc/init.d/podkop-watchdog
    chmod 755 /usr/libexec/podkop-watchdog.sh
    chmod 755 /usr/libexec/rpcd/podkop-watchdog

    /etc/init.d/rpcd restart >/dev/null 2>&1
    /etc/init.d/uhttpd restart >/dev/null 2>&1

    /etc/init.d/podkop-watchdog enable >/dev/null 2>&1
    /etc/init.d/podkop-watchdog restart >/dev/null 2>&1

    echo
    green "✓ LuCI Podkop Watchdog установлен / обновлён."
    green "✓ Автозапуск включён."
    echo
    echo "LuCI → Services → Podkop Watchdog"
}

remove_luci() {
    echo
    echo "Удаление LuCI Podkop Watchdog..."
    /etc/init.d/podkop-watchdog stop >/dev/null 2>&1
    /etc/init.d/podkop-watchdog disable >/dev/null 2>&1

    rm -f \
      /etc/init.d/podkop-watchdog \
      /etc/config/podkop_watchdog \
      /usr/libexec/podkop-watchdog.sh \
      /usr/libexec/rpcd/podkop-watchdog \
      /usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json \
      /usr/share/luci/menu.d/luci-app-podkop-watchdog.json \
      /www/luci-static/resources/view/podkop-watchdog/index.js

    /etc/init.d/rpcd restart >/dev/null 2>&1
    /etc/init.d/uhttpd restart >/dev/null 2>&1

    green "✓ LuCI Podkop Watchdog удалён."
}

status() {
    echo
    echo "========== LuCI Podkop Watchdog =========="
    if [ -f /etc/config/podkop_watchdog ]; then
        green "Установлен: ДА"
    else
        red "Установлен: НЕТ"
        return
    fi

    if pidof podkop-watchdog.sh >/dev/null 2>&1; then
        green "Статус: ЗАПУЩЕН"
        echo "PID: $(pidof podkop-watchdog.sh)"
    else
        yellow "Статус: ОСТАНОВЛЕН"
    fi

    echo
    echo "Домен: $(uci -q get podkop_watchdog.main.domain)"
    echo "Интервал: $(uci -q get podkop_watchdog.main.check_interval) сек."
    echo "Ошибок до рестарта: $(uci -q get podkop_watchdog.main.fail_limit)"
    echo "Лог: $(uci -q get podkop_watchdog.main.log)"
}

need_root

case "$1" in
    install|update)
        install_luci
        ;;
    remove|uninstall)
        remove_luci
        ;;
    status)
        status
        ;;
    *)
        echo "Использование:"
        echo "  $0 install"
        echo "  $0 remove"
        echo "  $0 status"
        ;;
esac
