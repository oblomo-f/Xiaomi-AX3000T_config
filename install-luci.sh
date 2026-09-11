#!/bin/sh

set -e

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
VIEW_DIR="/www/luci-static/resources/view"
VIEW_FILE="$VIEW_DIR/podkop-watchdog.js"

echo "=== Podkop Watchdog LuCI installer v12 ==="

if [ "$1" = "remove" ] || [ "$1" = "uninstall" ]; then
    sh <(wget -O- "$REPO_RAW/uninstall-luci.sh")
    exit $?
fi

mkdir -p "$VIEW_DIR"

echo "[1/5] Installing LuCI view..."
wget -q -O "$VIEW_FILE" \
    "$REPO_RAW/luci-app-podkop-watchdog/htdocs/luci-static/resources/view/podkop-watchdog.js"

echo "[2/5] Removing old nested LuCI view..."
rm -rf "$VIEW_DIR/podkop-watchdog"

echo "[3/5] Installing RPC backend..."
mkdir -p /usr/libexec/rpcd
wget -q -O /usr/libexec/rpcd/podkop-watchdog \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/libexec/rpcd/podkop-watchdog"
chmod 755 /usr/libexec/rpcd/podkop-watchdog

echo "[4/5] Installing menu and ACL..."
mkdir -p /usr/share/luci/menu.d /usr/share/rpcd/acl.d
wget -q -O /usr/share/luci/menu.d/luci-app-podkop-watchdog.json \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/luci/menu.d/luci-app-podkop-watchdog.json"
wget -q -O /usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json"

echo "[5/5] Restarting services..."
rm -rf /tmp/luci-indexcache
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
/etc/init.d/podkop-watchdog enable 2>/dev/null || true
/etc/init.d/podkop-watchdog restart

echo
echo "=== Done ==="
echo "LuCI view: $VIEW_FILE"
echo "Log is read through ubus RPC (no fetch/CGI)."
echo "PID is hidden from the status line."
echo
echo "Reload LuCI with Ctrl+F5."
