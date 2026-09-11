#!/bin/sh

set -e

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main"
VIEW_DIR="/www/luci-static/resources/view"
VIEW_FILE="$VIEW_DIR/podkop-watchdog.js"

echo "=== Podkop Watchdog LuCI installer v26 ==="

if [ "$1" = "remove" ] || [ "$1" = "uninstall" ]; then
    sh <(wget -O- "$REPO_RAW/uninstall-luci.sh")
    exit $?
fi

echo "[1/7] Installing watchdog backend..."
mkdir -p /usr/libexec/rpcd
wget -q -O /usr/libexec/podkop-watchdog.sh \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/libexec/podkop-watchdog.sh"
chmod 755 /usr/libexec/podkop-watchdog.sh

wget -q -O /usr/libexec/rpcd/podkop-watchdog \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/libexec/rpcd/podkop-watchdog"
chmod 755 /usr/libexec/rpcd/podkop-watchdog

echo "[2/7] Installing init script..."
wget -q -O /etc/init.d/podkop-watchdog \
    "$REPO_RAW/luci-app-podkop-watchdog/root/etc/init.d/podkop-watchdog"
chmod 755 /etc/init.d/podkop-watchdog

echo "[3/7] Installing UCI config..."
mkdir -p /etc/config
wget -q -O /etc/config/podkop_watchdog \
    "$REPO_RAW/luci-app-podkop-watchdog/root/etc/config/podkop_watchdog"

echo "[4/7] Installing LuCI view..."
mkdir -p "$VIEW_DIR"
wget -q -O "$VIEW_FILE" \
    "$REPO_RAW/luci-app-podkop-watchdog/htdocs/luci-static/resources/view/podkop-watchdog.js"
rm -rf "$VIEW_DIR/podkop-watchdog"

echo "[5/7] Installing menu and ACL..."
mkdir -p /usr/share/luci/menu.d /usr/share/rpcd/acl.d
wget -q -O /usr/share/luci/menu.d/luci-app-podkop-watchdog.json \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/luci/menu.d/luci-app-podkop-watchdog.json"
wget -q -O /usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json \
    "$REPO_RAW/luci-app-podkop-watchdog/root/usr/share/rpcd/acl.d/luci-app-podkop-watchdog.json"

echo "[6/7] Checking installed files..."
for f in \
    /usr/libexec/podkop-watchdog.sh \
    /usr/libexec/rpcd/podkop-watchdog \
    /etc/init.d/podkop-watchdog \
    /etc/config/podkop_watchdog \
    /www/luci-static/resources/view/podkop-watchdog.js
do
    [ -f "$f" ] || { echo "ERROR: file not installed: $f"; exit 1; }
done

echo "[7/7] Restarting services..."
rm -rf /tmp/luci-indexcache /tmp/luci-modulecache
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
/etc/init.d/podkop-watchdog enable
/etc/init.d/podkop-watchdog restart

echo
echo "=== Done ==="
echo "LuCI view: $VIEW_FILE"
echo "Watchdog init: /etc/init.d/podkop-watchdog"
echo "Log: /root/podkop-watchdog.log"
echo
echo "Reload LuCI with Ctrl+F5."
