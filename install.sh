#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
WATCHDOG="/root/podkop-watchdog.sh"
SERVICE="/etc/init.d/podkop-watchdog"
LOG="/root/podkop-watchdog.log"
ROTATE="/root/podkop-watchdog.rotate"
CACHE_DIR="/usr/share/podkop-watchdog-cache"

pause() {
    echo ""
    printf "Нажмите Enter для продолжения..."
    read dummy
}

service_running() {
    pgrep -f 'podkop-watchdog.sh' >/dev/null 2>&1
}

service_enabled() {
    [ -L /etc/rc.d/S99podkop-watchdog ] || [ -e /etc/rc.d/S99podkop-watchdog ]
}

podkop_installed() {
    # Podkop is required because the watchdog restarts its service.
    [ -x /etc/init.d/podkop ] && return 0
    [ -f /etc/init.d/podkop ] && return 0
    return 1
}

check_podkop() {
    if podkop_installed; then
        return 0
    fi

    echo ""
    echo "=========================================="
    echo "             Установка отменена"
    echo "=========================================="
    echo ""
    echo "Ошибка: Podkop не установлен."
    echo ""
    echo "Сначала установите Podkop, затем установите Podkop Watchdog."
    echo ""
    return 1
}

check_status() {
    echo ""
    echo "========== Podkop Watchdog =========="
    if [ -x "$SERVICE" ] && [ -x "$WATCHDOG" ]; then
        echo "Установлен: ДА"
    else
        echo "Установлен: НЕТ"
    fi

    if service_running; then
        echo "Статус: ЗАПУЩЕН"
        pgrep -f 'podkop-watchdog.sh'
    else
        echo "Статус: ОСТАНОВЛЕН"
    fi

    if service_enabled; then
        echo "Автозапуск: ВКЛЮЧЁН"
    else
        echo "Автозапуск: ВЫКЛЮЧЕН"
    fi

    echo ""
    if [ -f "$WATCHDOG" ]; then
        echo "Настройки:"
        echo "DOMAIN=$(uci -q get podkop_watchdog.main.domain || echo google.com)"
        grep -E '^(CHECK_INTERVAL|FAIL_LIMIT|RESTART_WAIT|ROTATE_SECONDS)=' "$WATCHDOG" 2>/dev/null
    fi

    echo ""
    echo "Лог:"
    if [ -s "$LOG" ]; then
        tail -20 "$LOG"
    else
        echo "Лог пуст — ошибок не зафиксировано."
    fi

    echo ""
    echo "Последние сообщения procd:"
    logread | grep podkop-watchdog | tail -10
}

install_web() {
    echo ""
    echo "========== Установка / обновление Web =========="

    if ! check_podkop; then
        return 1
    fi

    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    mkdir -p "$CACHE_DIR"
    TMP_WEB="/tmp/install-luci.sh"

    echo -n "Загружаю установщик Web... "
    if command -v wget >/dev/null 2>&1 && wget -q -T 10 -O "$TMP_WEB" "$REPO_RAW/install-luci.sh"; then
        chmod +x "$TMP_WEB"
        cp "$TMP_WEB" "$CACHE_DIR/install-luci.sh"
        echo "OK"
        sh "$TMP_WEB"
        rm -f "$TMP_WEB"
    elif [ -s "$CACHE_DIR/install-luci.sh" ]; then
        echo "ОФЛАЙН-КЭШ"
        chmod +x "$CACHE_DIR/install-luci.sh"
        sh "$CACHE_DIR/install-luci.sh"
    else
        echo "ОШИБКА"
        echo "Нет Интернета и нет локальной копии Web."
        rm -f "$TMP_WEB"
        return 1
    fi
}

uninstall_web() {
    echo ""
    echo "========== Удаление Web =========="

    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    if ! command -v wget >/dev/null 2>&1; then
        echo "Ошибка: требуется wget."
        return 1
    fi

    TMP_WEB="/tmp/uninstall-luci.sh"
    echo -n "Загружаю удаление Web... "
    if wget -q -O "$TMP_WEB" "$REPO_RAW/uninstall-luci.sh"; then
        chmod +x "$TMP_WEB"
        echo "OK"
        sh "$TMP_WEB"
        rm -f "$TMP_WEB"
    else
        echo "ОШИБКА"
        rm -f "$TMP_WEB"
        return 1
    fi
}

uninstall_all() {
    echo ""
    echo "========== Полное удаление =========="
    echo "Будут удалены Watchdog (Shell), Web-интерфейс и команда Podkop-w."
    echo ""
    printf "Вы уверены? [y/N]: "
    read answer
    case "$answer" in
        y|Y|д|Д)
            ;;
        *)
            echo "Удаление отменено."
            return 0
            ;;
    esac

    echo ""
    echo "[1/2] Удаляю Web-интерфейс..."
    TMP_WEB="/tmp/uninstall-luci.sh"
    if command -v wget >/dev/null 2>&1 && wget -q -O "$TMP_WEB" "$REPO_RAW/uninstall-luci.sh"; then
        chmod +x "$TMP_WEB"
        sh "$TMP_WEB"
        rm -f "$TMP_WEB"
    else
        echo "Web-удаление недоступно или Web уже удалён."
        rm -f "$TMP_WEB"
    fi

    echo ""
    echo "[2/2] Удаляю Watchdog (Shell)..."
    if [ -x "$SERVICE" ]; then
        "$SERVICE" stop >/dev/null 2>&1 || true
    fi

    # Disable autostart and remove watchdog files/config/logs.
    if [ -x "$SERVICE" ]; then
        "$SERVICE" disable >/dev/null 2>&1 || true
    fi
        rm -f /usr/bin/Podkop-w
rm -f "$SERVICE" "$WATCHDOG" "$LOG" "$ROTATE"
    rm -f /etc/config/podkop_watchdog
    rm -f /usr/libexec/podkop-watchdog.sh
    rm -f /usr/libexec/rpcd/podkop-watchdog
    rm -f /etc/uci-defaults/*podkop*watchdog* 2>/dev/null || true
    rm -f /etc/rc.d/S99podkop-watchdog /etc/rc.d/K99podkop-watchdog 2>/dev/null || true

    echo ""
    echo "✓ Watchdog Shell, Web-интерфейс и команда Podkop-w полностью удалены."
}


install_menu_command() {
    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    # Keep a local copy of the menu. It remains usable when Internet is down.
    mkdir -p "$CACHE_DIR"
    TMP_MENU="/tmp/podkop-watchdog-menu.sh"
    if command -v wget >/dev/null 2>&1 && wget -q -T 10 -O "$TMP_MENU" "$REPO_RAW/install.sh"; then
        chmod +x "$TMP_MENU"
        cp "$TMP_MENU" "$CACHE_DIR/install.sh"
        mv "$TMP_MENU" /usr/bin/podkop-watchdog-menu.sh
        chmod +x /usr/bin/podkop-watchdog-menu.sh
    elif [ ! -x /usr/bin/podkop-watchdog-menu.sh ]; then
        cp "$0" /usr/bin/podkop-watchdog-menu.sh 2>/dev/null || true
        chmod +x /usr/bin/podkop-watchdog-menu.sh 2>/dev/null || true
    fi

    cat > /usr/bin/Podkop-w <<'EOF'
#!/bin/sh
LOCAL_MENU="/usr/bin/podkop-watchdog-menu.sh"

# First use the local menu. Internet is NOT required.
if [ -x "$LOCAL_MENU" ]; then
    exec "$LOCAL_MENU"
fi

# Fallback for very old installations.
REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
TMP="/tmp/podkop-w-install.sh"
if ! command -v wget >/dev/null 2>&1; then
    echo "Ошибка: требуется wget."
    exit 1
fi
if ! wget -q -T 10 -O "$TMP" "$REPO_RAW/install.sh"; then
    echo "Ошибка: Интернет недоступен, локальное меню не найдено."
    rm -f "$TMP"
    exit 1
fi
chmod +x "$TMP"
exec sh "$TMP"
EOF
    chmod +x /usr/bin/Podkop-w
    echo "✓ Команда Podkop-w установлена."
}

install_watchdog() {
    echo ""
    echo "========== Установка / обновление =========="

    if ! check_podkop; then
        return 1
    fi

    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    mkdir -p "$CACHE_DIR"

    echo -n "[1/4] Загружаю watchdog... "
    TMP_WD="/tmp/podkop-watchdog.sh"
    if command -v wget >/dev/null 2>&1 && wget -q -T 10 -O "$TMP_WD" "$REPO_RAW/podkop-watchdog.sh"; then
        chmod +x "$TMP_WD"
        cp "$TMP_WD" "$CACHE_DIR/podkop-watchdog.sh"
        mv "$TMP_WD" "$WATCHDOG"
        echo "OK"
    elif [ -s "$CACHE_DIR/podkop-watchdog.sh" ]; then
        cp "$CACHE_DIR/podkop-watchdog.sh" "$WATCHDOG"
        chmod +x "$WATCHDOG"
        echo "ОФЛАЙН-КЭШ"
    elif [ -x "$WATCHDOG" ]; then
        echo "УЖЕ УСТАНОВЛЕН"
    else
        echo "ОШИБКА"
        echo "Нет Интернета и нет локальной копии watchdog."
        return 1
    fi

    echo -n "[2/4] Загружаю init-скрипт... "
    TMP_INIT="/tmp/podkop-watchdog.init"
    if command -v wget >/dev/null 2>&1 && wget -q -T 10 -O "$TMP_INIT" "$REPO_RAW/etc/init.d/podkop-watchdog"; then
        chmod +x "$TMP_INIT"
        cp "$TMP_INIT" "$CACHE_DIR/podkop-watchdog.init"
        mv "$TMP_INIT" "$SERVICE"
        echo "OK"
    elif [ -s "$CACHE_DIR/podkop-watchdog.init" ]; then
        cp "$CACHE_DIR/podkop-watchdog.init" "$SERVICE"
        chmod +x "$SERVICE"
        echo "ОФЛАЙН-КЭШ"
    elif [ -x "$SERVICE" ]; then
        echo "УЖЕ УСТАНОВЛЕН"
    else
        echo "ОШИБКА"
        echo "Нет Интернета и нет локальной копии init-скрипта."
        return 1
    fi

    echo -n "[3/4] Подготавливаю конфигурацию и лог... "
    mkdir -p /etc/config
    if [ ! -f /etc/config/podkop_watchdog ]; then
        cat > /etc/config/podkop_watchdog <<'EOF'
config podkop_watchdog 'main'
	option enabled '1'
	option domain 'google.com'
	option check_interval '30'
	option fail_limit '3'
	option restart_wait '20'
	option wan_interface 'wan'
	option restart_wan '0'
	option rotate_seconds '259200'
	option log '/root/podkop-watchdog.log'
EOF
    else
        uci -q set podkop_watchdog.main.enabled='1'
        uci -q set podkop_watchdog.main.wan_interface="$(uci -q get podkop_watchdog.main.wan_interface || echo wan)"
        uci -q commit podkop_watchdog
    fi
    touch "$LOG" "$ROTATE"
    echo "OK"

    echo -n "[4/4] Запускаю watchdog... "
    "$SERVICE" stop >/dev/null 2>&1 || true
    "$SERVICE" enable >/dev/null 2>&1 || true
    "$SERVICE" restart >/dev/null 2>&1 || true
    sleep 3

    if service_running; then
        echo "OK"
    else
        echo "ОШИБКА"
        echo ""
        echo "Watchdog не запустился."
        echo "Для диагностики:"
        echo "  logread | grep podkop-watchdog"
        return 1
    fi

    echo ""
    echo "✓ Watchdog успешно установлен / обновлён."
    echo "✓ Автозапуск включён."
    echo "✓ Процесс работает."
    install_menu_command
}

change_domain() {
    echo ""
    echo "========== Домен проверки =========="

    if [ ! -f "$WATCHDOG" ]; then
        echo "Watchdog не установлен."
        return 1
    fi

    CURRENT_DOMAIN="$(uci -q get podkop_watchdog.main.domain 2>/dev/null)"
    [ -n "$CURRENT_DOMAIN" ] || CURRENT_DOMAIN="google.com"

    echo "Текущий домен: $CURRENT_DOMAIN"
    echo ""
    printf "Введите новый домен: "
    read NEW_DOMAIN

    if [ -z "$NEW_DOMAIN" ]; then
        echo "Домен не указан. Отмена."
        return 1
    fi

    case "$NEW_DOMAIN" in
        *" "*|*"/"*|*"http://"*|*"https://"*)
            echo "Ошибка: укажите только домен, например google.com"
            return 1
            ;;
    esac

    if ! printf '%s\n' "$NEW_DOMAIN" | grep -Eq '^[A-Za-z0-9.-]+$'; then
        echo "Ошибка: недопустимые символы в имени домена."
        return 1
    fi

    uci -q set podkop_watchdog.main.domain="$NEW_DOMAIN"
    uci -q commit podkop_watchdog

    echo ""
    echo "✓ Домен изменён на: $NEW_DOMAIN"
    echo ""
    printf "Перезапустить watchdog для применения? [Y/n]: "
    read answer

    case "$answer" in
        n|N)
            echo "Изменение сохранено. Применится после перезапуска watchdog."
            ;;
        *)
            "$SERVICE" restart >/dev/null 2>&1
            sleep 1
            if service_running; then
                echo "✓ Watchdog перезапущен."
            else
                echo "⚠ Watchdog не запустился. Проверьте logread."
            fi
            ;;
    esac
}


reload_wan_podkop() {
    echo ""
    echo "========== Перегрузка WAN + Podkop =========="

    WAN_INTERFACE="$(uci -q get podkop_watchdog.main.wan_interface 2>/dev/null)"
    [ -n "$WAN_INTERFACE" ] || WAN_INTERFACE="wan"

    IFDOWN="$(command -v ifdown 2>/dev/null)"
    IFUP="$(command -v ifup 2>/dev/null)"
    [ -n "$IFDOWN" ] || [ -x /sbin/ifdown ] && IFDOWN="/sbin/ifdown"
    [ -n "$IFUP" ] || [ -x /sbin/ifup ] && IFUP="/sbin/ifup"

    echo "WAN интерфейс: $WAN_INTERFACE"

    if [ -n "$IFDOWN" ] && [ -x "$IFDOWN" ]; then
        echo "[1/3] Отключаю WAN..."
        "$IFDOWN" "$WAN_INTERFACE" 2>&1 || true
        sleep 3
    else
        echo "[1/3] ifdown не найден — пропускаю."
    fi

    if [ -n "$IFUP" ] && [ -x "$IFUP" ]; then
        echo "[2/3] Включаю WAN..."
        "$IFUP" "$WAN_INTERFACE" 2>&1 || true
        sleep 5
    else
        echo "[2/3] ifup не найден — пропускаю."
    fi

    echo "[3/3] Перезапускаю Podkop..."
    /etc/init.d/podkop restart
    echo ""
    echo "✓ WAN + Podkop перегружены."
}

show_log() {
    echo ""
    echo "========== Лог Podkop Watchdog =========="
    if [ -s "$LOG" ]; then
        tail -50 "$LOG"
    else
        echo "Лог пуст — ошибок не зафиксировано."
    fi
}

uninstall_watchdog() {
    echo ""
    echo "========== Удаление =========="
    printf "Удалить Podkop Watchdog и его лог? [y/N]: "
    read answer

    case "$answer" in
        y|Y|д|Д)
            "$SERVICE" stop >/dev/null 2>&1
            "$SERVICE" disable >/dev/null 2>&1
            rm -f "$SERVICE" "$WATCHDOG" "$LOG" "$ROTATE"
            echo "✓ Podkop Watchdog удалён."
            ;;
        *)
            echo "Отмена."
            ;;
    esac
}

install_menu_command

while true; do
    clear
    echo "=========================================="
    echo "              Podkop Watchdog"
    echo "=========================================="
    echo ""

    if service_running; then
        printf "  Статус: \033[32m● ЗАПУЩЕН\033[0m\\n"
    elif [ -x "$WATCHDOG" ]; then
        printf "  Статус: \033[33m○ ОСТАНОВЛЕН\033[0m\\n"
    else
        printf "  Статус: \033[31m○ НЕ УСТАНОВЛЕН\033[0m\\n"
    fi

    echo ""
    echo "  Команда: Podkop-w — открыть это меню"
    echo ""
    echo "  1) Установить / обновить Watchdog"
    echo "  2) Проверить статус"
    echo "  3) Перезапустить watchdog"
    echo "  4) Остановить watchdog"
    echo "  5) Изменить домен проверки"
    echo "  6) Показать лог"
    echo
    echo "  --- Web-интерфейс ---"
    echo "  7) Установить / обновить Web"
    echo "  8) Удалить Web"
    echo "  9) Удалить полностью (Web + Shell)"
    echo
    echo "  --- Интерфейс ---"
    echo "  10) Перегрузить WAN + Podkop"
    echo
    echo "  0) Выход"
    echo ""
    printf "Выберите действие [0-10]: "
    read choice

    case "$choice" in
        1) install_watchdog; pause ;;
        2) check_status; pause ;;
        3)
            "$SERVICE" restart >/dev/null 2>&1
            sleep 1
            if service_running; then
                echo "✓ Watchdog перезапущен."
            else
                echo "⚠ Watchdog не запустился."
            fi
            pause
            ;;
        4)
            "$SERVICE" stop >/dev/null 2>&1 || true
            sleep 1
            for pid in $(pgrep -f '/(root|usr/libexec)/podkop-watchdog.sh' 2>/dev/null); do
                [ "$pid" = "$$" ] && continue
                kill "$pid" 2>/dev/null || true
            done
            sleep 1
            if service_running; then
                echo "⚠ Watchdog не удалось остановить."
            else
                echo "✓ Watchdog остановлен."
            fi
            pause
            ;;
        5) change_domain; pause ;;
        6) show_log; pause ;;
        7) install_web; pause ;;
        8) uninstall_web; pause ;;
        9) uninstall_all; pause ;;
        10)
            reload_wan_podkop
            pause
            ;;
        0|q|Q) exit 0 ;;
        *) echo "Неверный выбор."; sleep 1 ;;
    esac
done
