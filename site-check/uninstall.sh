#!/bin/sh

rm -f /usr/libexec/rpcd/site-check
rm -f /usr/share/rpcd/acl.d/luci-app-site-check.json
rm -f /usr/share/luci/menu.d/luci-app-site-check.json
rm -f /www/luci-static/resources/view/site-check/site-check.js
rm -f /tmp/site-check-job-*.json /tmp/luci-indexcache /tmp/luci-modulecache 2>/dev/null || true

rmdir /www/luci-static/resources/view/site-check 2>/dev/null || true
/etc/init.d/rpcd restart >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true

echo "Проверка сайтов удалена."
