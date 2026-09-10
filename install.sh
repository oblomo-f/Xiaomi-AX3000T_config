#!/bin/sh

REPO_RAW="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T/main"

echo "========================================"
echo " Xiaomi AX3000T - Podkop Watchdog"
echo "========================================"

if [ "$(id -u)" != "0" ]; then
    echo "ERROR: run this installer as root."
    exit 1
fi

if ! command -v wget >/dev/null 2>&1; then
    echo "ERROR: wget is required."
    exit 1
fi

if [ ! -x /etc/init.d/podkop ]; then
    echo "WARNING: /etc/init.d/podkop not found."
    echo "Podkop may not be installed. Installation will continue."
fi

echo "[1/5] Downloading watchdog..."
wget -q -O /root/podkop-watchdog.sh "$REPO_RAW/podkop-watchdog.sh" || {
    echo "ERROR: failed to download podkop-watchdog.sh"
    exit 1
}

echo "[2/5] Downloading init script..."
wget -q -O /etc/init.d/podkop-watchdog "$REPO_RAW/etc/init.d/podkop-watchdog" || {
    echo "ERROR: failed to download init script"
    exit 1
}

echo "[3/5] Setting permissions..."
chmod +x /root/podkop-watchdog.sh
chmod +x /etc/init.d/podkop-watchdog

echo "[4/5] Preparing logs..."
touch /root/podkop-watchdog.log
touch /root/podkop-watchdog.rotate

echo "[5/5] Enabling and starting service..."
/etc/init.d/podkop-watchdog enable
/etc/init.d/podkop-watchdog restart

sleep 2

if ps | grep '[p]odkop-watchdog.sh' >/dev/null 2>&1; then
    echo ""
    echo "Installation completed successfully."
    echo ""
    echo "Status:"
    ps | grep '[p]odkop-watchdog.sh'
    echo ""
    echo "Log: /root/podkop-watchdog.log"
    echo ""
    echo "Commands:"
    echo "  /etc/init.d/podkop-watchdog start"
    echo "  /etc/init.d/podkop-watchdog stop"
    echo "  /etc/init.d/podkop-watchdog restart"
    echo "  cat /root/podkop-watchdog.log"
else
    echo ""
    echo "WARNING: watchdog process was not detected."
    echo "Check:"
    echo "  logread | grep podkop-watchdog"
    exit 1
fi
