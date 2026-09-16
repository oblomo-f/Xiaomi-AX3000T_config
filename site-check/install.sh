#!/bin/sh

set -e

BASE_URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check"

RPC_FILE="/usr/libexec/rpcd/site-check"
ACL_FILE="/usr/share/rpcd/acl.d/luci-app-site-check.json"
MENU_FILE="/usr/share/luci/menu.d/luci-app-site-check.json"
JS_FILE="/www/luci-static/resources/view/site-check/site-check.js"

echo
echo "========================================"
echo "        Site Checker — установка"
echo "========================================"
echo

echo "[1/6] Проверка curl"
if command -v curl >/dev/null 2>&1; then
    CURL_VER="$(curl --version 2>/dev/null | head -n1)"
    echo "      ✓ curl найден: ${CURL_VER#curl }"
else
    echo "      ✗ curl не найден"
    echo "      Установите пакет curl и повторите установку."
    exit 1
fi

echo
echo "[2/6] Создание каталогов"
mkdir -p \
    /usr/libexec/rpcd \
    /usr/share/rpcd/acl.d \
    /usr/share/luci/menu.d \
    /www/luci-static/resources/view/site-check
chmod 755 /usr/libexec/rpcd
chmod 755 /www/luci-static/resources/view/site-check
echo "      ✓ каталоги созданы"

download_file()
{
    URL="$1"
    DEST="$2"
    TMP="${DEST}.tmp.$$"

    rm -f "$TMP"

    if ! curl -fsSL "$URL" -o "$TMP"; then
        rm -f "$TMP"
        echo "      ✗ ошибка загрузки: $URL"
        exit 1
    fi

    if [ ! -s "$TMP" ]; then
        rm -f "$TMP"
        echo "      ✗ получен пустой файл: $URL"
        exit 1
    fi

    mv "$TMP" "$DEST"
}

echo
echo "[3/6] RPC backend"
download_file "$BASE_URL/files/usr/libexec/rpcd/site-check" "$RPC_FILE"

# rpcd передаёт JSON RPC-параметры через stdin.
# Гарантируем использование исправленного варианта backend.
if grep -q 'printf.*"\$3".*jsonfilter' "$RPC_FILE" 2>/dev/null; then
    sed -i '/URL="$(printf/i\                INPUT="$(cat)"' "$RPC_FILE"
    sed -i 's/printf '\''%s'\'' "\$3"/printf '\''%s'\'' "\$INPUT"/g' "$RPC_FILE"
fi

chmod 755 "$RPC_FILE"
echo "      ✓ $RPC_FILE"
echo "      ✓ RPC-параметры читаются из stdin"

echo
echo "[4/6] ACL и меню"
download_file "$BASE_URL/files/usr/share/rpcd/acl.d/luci-app-site-check.json" "$ACL_FILE"
download_file "$BASE_URL/files/usr/share/luci/menu.d/luci-app-site-check.json" "$MENU_FILE"
chmod 644 "$ACL_FILE" "$MENU_FILE"
echo "      ✓ ACL установлен"
echo "      ✓ меню LuCI установлено"

echo
echo "[5/6] Интерфейс LuCI"
download_file "$BASE_URL/files/www/luci-static/resources/view/site-check/site-check.js" "$JS_FILE"
chmod 644 "$JS_FILE"
echo "      ✓ site-check.js установлен"

echo
echo "[6/6] Перезапуск rpcd/uhttpd"

if /etc/init.d/rpcd restart >/dev/null 2>&1; then
    echo "      ✓ rpcd перезапущен"
else
    echo "      ! rpcd не удалось перезапустить"
fi

if /etc/init.d/uhttpd restart >/dev/null 2>&1; then
    echo "      ✓ uhttpd перезапущен"
else
    echo "      ! uhttpd не удалось перезапустить"
fi

# Очистка кэша LuCI, если он существует.
rm -rf /tmp/luci-indexcache /tmp/luci-modulecache 2>/dev/null || true
echo "      ✓ кэш LuCI очищен"

echo
echo "========================================"
echo "       Проверка установки"
echo "========================================"

OK=1

if [ -x "$RPC_FILE" ]; then
    echo "      ✓ RPC backend: OK"
else
    echo "      ✗ RPC backend: ERROR"
    OK=0
fi

if [ -f "$ACL_FILE" ]; then
    echo "      ✓ ACL: OK"
else
    echo "      ✗ ACL: ERROR"
    OK=0
fi

if [ -f "$MENU_FILE" ]; then
    echo "      ✓ меню LuCI: OK"
else
    echo "      ✗ меню LuCI: ERROR"
    OK=0
fi

if [ -f "$JS_FILE" ]; then
    echo "      ✓ LuCI interface: OK"
else
    echo "      ✗ LuCI interface: ERROR"
    OK=0
fi

echo
if [ "$OK" -eq 1 ]; then
    echo "========================================"
    echo "       Site Checker установлен"
    echo "========================================"
    echo
    echo "Откройте меню → Проверка сайтов"
else
    echo "========================================"
    echo "       Установка завершена с ошибками"
    echo "========================================"
    exit 1
fi

echo
exit 0

