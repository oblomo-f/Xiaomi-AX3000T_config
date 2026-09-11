#!/bin/sh

echo "=== Полное удаление Podkop Watchdog LuCI ==="
echo

echo "[1/7] Остановка watchdog..."
/etc/init.d/podkop-watchdog stop 2>/dev/null || true
/etc/init.d/podkop-watchdog disable 2>/dev/null || true

echo "[2/7] Удаление init-скрипта..."
rm -f /etc/init.d/podkop-watchdog

echo "[3/7] Удаление watchdog backend..."
rm -f /usr/libexec/podkop-watchdog.sh
rm -f /usr/libexec/rpcd/podkop-watchdog

echo "[4/7] Удаление LuCI..."
rm -f /www/luci-static/resources/view/podkop-watchdog.js
rm -rf /www/luci-static/resources/view/podkop-watchdog
rm -f /usr/share/luci/menu.d/luci-app-podkop-watchdog.json

echo "[5/7] Удаление RPC ACL..."
rm -f /usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json

echo "[6/7] Удаление конфигурации и лога..."
rm -f /etc/config/podkop_watchdog
rm -f /root/podkop-watchdog.log

echo "[7/7] Очистка кеша и перезапуск служб..."
rm -rf /tmp/luci-indexcache
rm -rf /tmp/luci-modulecache
/etc/init.d/rpcd restart 2>/dev/null || true
/etc/init.d/uhttpd restart 2>/dev/null || true

echo
echo "=== Podkop Watchdog полностью удалён ==="
echo
echo "Проверка:"
echo "  /etc/init.d/podkop-watchdog"
echo "  /usr/libexec/podkop-watchdog.sh"
echo "  /usr/libexec/rpcd/podkop-watchdog"
echo "  /www/luci-static/resources/view/podkop-watchdog.js"
echo "  /etc/config/podkop_watchdog"
echo
echo "Все эти файлы должны отсутствовать."
echo "После этого обновите страницу LuCI через Ctrl+F5."
