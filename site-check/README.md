# Проверка сайтов — LuCI для RouteRich / OpenWrt

LuCI-приложение для проверки доступности сайтов непосредственно с клиентского роутера.

## Возможности

- Проверка одного сайта HTTP/HTTPS.
- Проверка нескольких сайтов.
- Последовательный вывод этапов DNS → TCP → TLS → HTTP.
- Отображение фактического маршрута: Zapret, Podkop, Podkop + Zapret или Напрямую.
- Проверка получения содержимого.
- IP-адрес, время ответа, размер ответа, Content-Type и итоговый URL.
- Проверка выполняется с самого роутера через `curl`.
- Tailscale не используется как маршрут проверяемого сайта.
- История проверок не хранится.
- Временные JSON-задания автоматически удаляются.
- Временная nftables trace-таблица удаляется после определения маршрута.

## Установка

```sh
curl -fsSL https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/install.sh | sh
```

## Удаление

```sh
curl -fsSL https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/uninstall.sh | sh
```

## Файлы

```text
site-check/
├── install.sh
├── uninstall.sh
├── README.md
└── files/
    ├── usr/libexec/rpcd/site-check
    ├── usr/share/rpcd/acl.d/luci-app-site-check.json
    ├── usr/share/luci/menu.d/luci-app-site-check.json
    └── www/luci-static/resources/view/site-check/site-check.js
```

## Интерфейс

Пункт меню LuCI: **Проверка сайтов**.

RPC-методы:

- `check` — обычная синхронная проверка;
- `start` — запуск фоновой проверки;
- `status` — получение текущего состояния фоновой проверки.
