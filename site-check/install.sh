#!/bin/sh

set -eu

BASE_URL="https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/files"

RPC="/usr/libexec/rpcd/site-check"
ACL="/usr/share/rpcd/acl.d/luci-app-site-check.json"
MENU="/usr/share/luci/menu.d/luci-app-site-check.json"
JS="/www/luci-static/resources/view/site-check/site-check.js"

say() {
    printf '%s\n' "$*"
}

fail() {
    say "ОШИБКА: $*" >&2
    exit 1
}

command -v curl >/dev/null 2>&1 || fail "Не найден curl"

say "========================================"
say "       Site Checker installer"
say "========================================"
say ""

say "[1/6] Проверка curl ................ OK"

mkdir -p \
    /usr/libexec/rpcd \
    /usr/share/rpcd/acl.d \
    /usr/share/luci/menu.d \
    /www/luci-static/resources/view/site-check

say "[2/6] Создание каталогов ............ OK"

fetch() {
    url="$1"
    dest="$2"
    tmp="${dest}.tmp.$$"

    if ! curl -fsSL \
        --connect-timeout 10 \
        --max-time 60 \
        "$url" \
        -o "$tmp"
    then
        rm -f "$tmp"
        fail "Не удалось скачать $url"
    fi

    [ -s "$tmp" ] || {
        rm -f "$tmp"
        fail "Получен пустой файл: $url"
    }

    mv "$tmp" "$dest"
}

fetch "$BASE_URL/usr/libexec/rpcd/site-check" "$RPC"
chmod 0755 "$RPC"

say "[3/6] RPC backend ................... OK"

fetch "$BASE_URL/usr/share/rpcd/acl.d/luci-app-site-check.json" "$ACL"
fetch "$BASE_URL/usr/share/luci/menu.d/luci-app-site-check.json" "$MENU"

say "[4/6] ACL и меню .................... OK"

fetch "$BASE_URL/www/luci-static/resources/view/site-check/site-check.js" "$JS"
chmod 0644 "$JS"

say "[5/6] Интерфейс LuCI ................. OK"

rm -f /tmp/luci-indexcache

/etc/init.d/rpcd restart >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true

say "[6/6] Перезапуск rpcd/uhttpd ........ OK"
say ""
say "========================================"
say " Site Checker успешно установлен"
say "========================================"
say ""
say "LuCI → Сервисы → Проверка сайтов"
say ""
say "Доступна проверка одного и нескольких сайтов."
say ""
