#!/bin/sh
set -e

BASE_URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check"

mkdir -p /usr/libexec/rpcd \
         /usr/share/rpcd/acl.d \
         /usr/share/luci/menu.d \
         /www/luci-static/resources/view/site-check

curl -fsSL "$BASE_URL/files/usr/libexec/rpcd/site-check" -o /usr/libexec/rpcd/site-check
curl -fsSL "$BASE_URL/files/usr/share/rpcd/acl.d/luci-app-site-check.json" -o /usr/share/rpcd/acl.d/luci-app-site-check.json
curl -fsSL "$BASE_URL/files/usr/share/luci/menu.d/luci-app-site-check.json" -o /usr/share/luci/menu.d/luci-app-site-check.json
curl -fsSL "$BASE_URL/files/www/luci-static/resources/view/site-check/site-check.js" -o /www/luci-static/resources/view/site-check/site-check.js

chmod 755 /usr/libexec/rpcd/site-check
chmod 644 /usr/share/rpcd/acl.d/luci-app-site-check.json
chmod 644 /usr/share/luci/menu.d/luci-app-site-check.json
chmod 644 /www/luci-static/resources/view/site-check/site-check.js
chmod 755 /www/luci-static/resources/view/site-check

rm -f /tmp/luci-indexcache

/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart

echo "Site Checker installed."
