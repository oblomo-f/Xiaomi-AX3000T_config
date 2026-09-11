#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
WATCHDOG="/root/podkop-watchdog.sh"
SERVICE="/etc/init.d/podkop-watchdog"
LOG="/root/podkop-watchdog.log"
ROTATE="/root/podkop-watchdog.rotate"

pause() {
    echo ""
    printf "Нажмите Enter для продолжения..."
    read dummy
}

service_running() {
    ps | grep '[p]odkop-watchdog.sh' >/dev/null 2>&1
}

service_enabled() {
    [ -L /etc/rc.d/S99podkop-watchdog ] || [ -e /etc/rc.d/S99podkop-watchdog ]
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
        ps | grep '[p]odkop-watchdog.sh'
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
        grep -E '^(DOMAIN|CHECK_INTERVAL|FAIL_LIMIT|RESTART_WAIT|ROTATE_SECONDS)=' "$WATCHDOG" 2>/dev/null
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

install_watchdog() {
    echo ""
    echo "========== Установка / обновление =========="

    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    if ! command -v wget >/dev/null 2>&1; then
        echo "Ошибка: требуется wget."
        return 1
    fi

    echo -n "[1/4] Загружаю watchdog... "
    if wget -q -O "$WATCHDOG" "$REPO_RAW/podkop-watchdog.sh"; then
        chmod +x "$WATCHDOG"
        echo "OK"
    else
        echo "ОШИБКА"
        rm -f "$WATCHDOG"
        return 1
    fi

    echo -n "[2/4] Загружаю init-скрипт... "
    if wget -q -O "$SERVICE" "$REPO_RAW/etc/init.d/podkop-watchdog"; then
        chmod +x "$SERVICE"
        echo "OK"
    else
        echo "ОШИБКА"
        return 1
    fi

    echo -n "[3/4] Создаю лог... "
    touch "$LOG" "$ROTATE"
    echo "OK"

    echo -n "[4/4] Запускаю watchdog... "

    # Не используем вывод enable/restart, чтобы служебные сообщения
    # OpenWrt не попадали в красивый интерфейс установщика.
    "$SERVICE" stop >/dev/null 2>&1
    "$SERVICE" enable >/dev/null 2>&1
    "$SERVICE" start >/dev/null 2>&1

    sleep 2

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
    if service_enabled; then
        echo "✓ Автозапуск включён."
    fi
    echo "✓ Процесс работает."
}

change_domain() {
    echo ""
    echo "========== Домен проверки =========="

    if [ ! -f "$WATCHDOG" ]; then
        echo "Watchdog не установлен."
        return 1
    fi

    CURRENT_DOMAIN="$(grep '^DOMAIN=' "$WATCHDOG" 2>/dev/null | sed 's/^DOMAIN="//; s/"$//')"

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

    sed -i "s|^DOMAIN=.*|DOMAIN=\"$NEW_DOMAIN\"|" "$WATCHDOG"

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

while true; do
    clear
    echo "=========================================="
    echo "            Podkop Watchdog"
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
    echo "  1) Установить / обновить"
    echo "  2) Проверить статус"
    echo "  3) Перезапустить watchdog"
    echo "  4) Остановить watchdog"
    echo "  5) Изменить домен проверки"
    echo "  6) Показать лог"
    echo "  7) Удалить"
    echo "  0) Выход"
    echo ""
    printf "Выберите действие [0-7]: "
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
            "$SERVICE" stop >/dev/null 2>&1
            echo "✓ Watchdog остановлен."
            pause
            ;;
        5) change_domain; pause ;;
        6) show_log; pause ;;
        7) uninstall_watchdog; pause ;;
        0|q|Q) exit 0 ;;
        *) echo "Неверный выбор."; sleep 1 ;;
    esac
done
