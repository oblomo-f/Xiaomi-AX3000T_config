#!/bin/sh
set -e

BASE_URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check"

RPC_FILE="/usr/libexec/rpcd/site-check"
ACL_FILE="/usr/share/rpcd/acl.d/luci-app-site-check.json"
MENU_FILE="/usr/share/luci/menu.d/luci-app-site-check.json"
JS_FILE="/www/luci-static/resources/view/site-check/site-check.js"

printf '\n========================================\n'
printf '       Проверка сайтов — установка\n'
printf '========================================\n\n'

if ! command -v curl >/dev/null 2>&1; then
    echo "✗ curl не найден. Установите пакет curl и повторите установку."
    exit 1
fi

echo "[1/5] Проверка curl"
printf '      ✓ %s\n' "$(curl --version 2>/dev/null | head -n1)"

echo "[2/5] Создание каталогов"
mkdir -p /usr/libexec/rpcd /usr/share/rpcd/acl.d /usr/share/luci/menu.d /www/luci-static/resources/view/site-check

echo "      ✓ каталоги созданы"

download_file()
{
    URL="$1"
    DEST="$2"
    TMP="${DEST}.tmp.$$"
    rm -f "$TMP"
    curl -fsSL "$URL" -o "$TMP" || { rm -f "$TMP"; echo "✗ ошибка загрузки: $URL"; exit 1; }
    [ -s "$TMP" ] || { rm -f "$TMP"; echo "✗ получен пустой файл: $URL"; exit 1; }
    mv "$TMP" "$DEST"
}

echo "[3/5] RPC backend"
download_file "$BASE_URL/files/usr/libexec/rpcd/site-check" "$RPC_FILE"
chmod 755 "$RPC_FILE"
echo "      ✓ $RPC_FILE"

echo "[4/5] ACL, меню и LuCI"
download_file "$BASE_URL/files/usr/share/rpcd/acl.d/luci-app-site-check.json" "$ACL_FILE"
download_file "$BASE_URL/files/usr/share/luci/menu.d/luci-app-site-check.json" "$MENU_FILE"
download_file "$BASE_URL/files/www/luci-static/resources/view/site-check/site-check.js" "$JS_FILE"
chmod 644 "$ACL_FILE" "$MENU_FILE" "$JS_FILE"
echo "      ✓ ACL: Проверка сайтов"
echo "      ✓ меню: Проверка сайтов"
echo "      ✓ интерфейс LuCI"

echo "[5/5] Перезапуск сервисов и очистка временных данных"
rm -f /tmp/site-check-job-*.json /tmp/luci-indexcache /tmp/luci-modulecache 2>/dev/null || true
/etc/init.d/rpcd restart >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true
echo "      ✓ rpcd/uhttpd перезапущены"
echo "      ✓ временные задания очищены"

echo
printf '========================================\n'
printf '       Проверка сайтов установлена\n'
printf '========================================\n'
printf '\nОткройте LuCI → Проверка сайтов\n\n'
