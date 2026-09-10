#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
WATCHDOG="/root/podkop-watchdog.sh"
SERVICE="/etc/init.d/podkop-watchdog"
LOG="/root/podkop-watchdog.log"

pause() {
    echo ""
    printf "Нажмите Enter для продолжения..."
    read dummy
}

check_status() {
    echo ""
    echo "========== Podkop Watchdog =========="
    if [ -x "$SERVICE" ]; then
        echo "Сервис: установлен"
    else
        echo "Сервис: НЕ установлен"
    fi

    if ps | grep '[p]odkop-watchdog.sh' >/dev/null 2>&1; then
        echo "Статус: ЗАПУЩЕН"
        ps | grep '[p]odkop-watchdog.sh'
    else
        echo "Статус: ОСТАНОВЛЕН"
    fi

    echo ""
    if [ -x "$WATCHDOG" ]; then
        echo "Настройки:"
        grep -E '^(DOMAIN|CHECK_INTERVAL|FAIL_LIMIT|RESTART_WAIT|ROTATE_SECONDS)=' "$WATCHDOG" 2>/dev/null
    fi

    echo ""
    echo "Последние записи лога:"
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
    echo "========== Установка =========="

    if [ "$(id -u)" != "0" ]; then
        echo "Ошибка: запустите скрипт от root."
        return 1
    fi

    if ! command -v wget >/dev/null 2>&1; then
        echo "Ошибка: требуется wget."
        return 1
    fi

    echo "[1/4] Загружаю watchdog..."
    wget -q -O "$WATCHDOG" "$REPO_RAW/podkop-watchdog.sh" || {
        echo "Ошибка загрузки watchdog."
        return 1
    }

    echo "[2/4] Загружаю init-скрипт..."
    wget -q -O "$SERVICE" "$REPO_RAW/etc/init.d/podkop-watchdog" || {
        echo "Ошибка загрузки init-скрипта."
        return 1
    }

    chmod +x "$WATCHDOG" "$SERVICE"

    echo "[3/4] Создаю лог..."
    touch "$LOG" /root/podkop-watchdog.rotate

    echo "[4/4] Включаю автозапуск..."
    "$SERVICE" enable
    "$SERVICE" restart

    sleep 2

    echo ""
    if ps | grep '[p]odkop-watchdog.sh' >/dev/null 2>&1; then
        echo "✓ Watchdog успешно установлен и запущен."
    else
        echo "⚠ Watchdog установлен, но процесс не найден."
        echo "Проверьте: logread | grep podkop-watchdog"
    fi
}

uninstall_watchdog() {
    echo ""
    echo "========== Удаление =========="
    printf "Удалить Podkop Watchdog и его лог? [y/N]: "
    read answer

    case "$answer" in
        y|Y|д|Д)
            "$SERVICE" stop 2>/dev/null
            "$SERVICE" disable 2>/dev/null
            rm -f "$SERVICE" "$WATCHDOG" "$LOG" /root/podkop-watchdog.rotate
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
    echo "     Xiaomi AX3000T — Podkop Watchdog"
    echo "=========================================="
    echo ""
    echo "  1) Установить / обновить"
    echo "  2) Проверить статус"
    echo "  3) Перезапустить watchdog"
    echo "  4) Остановить watchdog"
    echo "  5) Показать лог"
    echo "  6) Удалить"
    echo "  0) Выход"
    echo ""
    printf "Выберите действие [0-6]: "
    read choice

    case "$choice" in
        1) install_watchdog; pause ;;
        2) check_status; pause ;;
        3)
            "$SERVICE" restart
            echo "Watchdog перезапущен."
            pause
            ;;
        4)
            "$SERVICE" stop
            echo "Watchdog остановлен."
            pause
            ;;
        5)
            echo ""
            if [ -s "$LOG" ]; then
                tail -50 "$LOG"
            else
                echo "Лог пуст — ошибок не зафиксировано."
            fi
            pause
            ;;
        6) uninstall_watchdog; pause ;;
        0|q|Q) exit 0 ;;
        *) echo "Неверный выбор."; sleep 1 ;;
    esac
done
