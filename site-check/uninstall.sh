#!/bin/sh

set -eu

echo "========================================"
echo "       Site Checker uninstall"
echo "========================================"
echo ""

rm -f \
    /usr/libexec/rpcd/site-check \
    /usr/share/rpcd/acl.d/luci-app-site-check.json \
    /usr/share/luci/menu.d/luci-app-site-check.json \
    /www/luci-static/resources/view/site-check/site-check.js

rm -rf /www/luci-static/resources/view/site-check

rm -f /tmp/luci-indexcache

/etc/init.d/rpcd restart >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true

echo "Site Checker удалён."
