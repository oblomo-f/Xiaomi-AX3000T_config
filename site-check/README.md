# Site Checker

LuCI Site Checker for RouteRich / OpenWrt.

## Features

- Single-site HTTP/HTTPS checking
- Multi-site checking
- DNS / TCP / TLS / HTTP status
- HTTP code, IP, response time, size, Content-Type and final URL
- Optional actual route detection using nftables trace
- Route display: `Маршрут через Zapret`, `Маршрут через Podkop`, `Маршрут через Podkop + Zapret`, `Маршрут через Напрямую`
- Route row hidden when route detection is disabled
- No check history
- Lightweight curl; no browser required
- Temporary nftables trace table is removed after route detection

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/install.sh | sh
```

## Uninstall

```sh
curl -fsSL https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/uninstall.sh | sh
```

## Files

- `files/usr/libexec/rpcd/site-check`
- `files/usr/share/rpcd/acl.d/luci-app-site-check.json`
- `files/usr/share/luci/menu.d/luci-app-site-check.json`
- `files/www/luci-static/resources/view/site-check/site-check.js`

The frontend in this repository is the user-supplied last working version.
