#!/bin/sh

rm -f /usr/libexec/rpcd/site-check
rm -f /usr/share/rpcd/acl.d/luci-app-site-check.json
rm -f /usr/share/luci/menu.d/luci-app-site-check.json
rm -f /www/luci-static/resources/view/site-check/site-check.js

rmdir /www/luci-static/resources/view/site-check 2>/dev/null || true

rm -f /tmp/luci-indexcache

/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart

echo "Site Checker uninstalled."
