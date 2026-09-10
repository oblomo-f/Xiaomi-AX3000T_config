# Xiaomi AX3000T — Podkop Watchdog

Автоматический watchdog для OpenWrt + Podkop.

Watchdog каждые 30 секунд проверяет доступ в интернет через домен `google.com`.
Успешные проверки в лог не записываются.

Если интернет недоступен 3 проверки подряд:

1. фиксируется ошибка в логе;
2. выполняется `/etc/init.d/podkop restart`;
3. watchdog ждёт 20 секунд;
4. счётчик ошибок сбрасывается;
5. проверки продолжаются.

Лог автоматически очищается каждые 3 дня.

## Установка

На роутере OpenWrt выполнить от `root`:

```sh
wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install.sh | sh

```

GitHub автоматически отдаёт raw-содержимое файлов через raw.githubusercontent.com.

## Удаление

```sh
wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T/main/uninstall.sh | sh
```

## Проверка

```sh
ps | grep podkop-watchdog | grep -v grep
```

```sh
cat /root/podkop-watchdog.log
```

```sh
logread | grep podkop-watchdog
```

## Управление

```sh
/etc/init.d/podkop-watchdog start
/etc/init.d/podkop-watchdog stop
/etc/init.d/podkop-watchdog restart
```

## Настройки

Основные настройки находятся в:

`/root/podkop-watchdog.sh`

```sh
DOMAIN="google.com"
CHECK_INTERVAL=30
FAIL_LIMIT=3
RESTART_WAIT=20
ROTATE_SECONDS=259200
```

### Значения

- `DOMAIN` — домен для проверки.
- `CHECK_INTERVAL=30` — проверка каждые 30 секунд.
- `FAIL_LIMIT=3` — 3 ошибки подряд перед перезапуском Podkop.
- `RESTART_WAIT=20` — ожидание 20 секунд после перезапуска Podkop.
- `ROTATE_SECONDS=259200` — очистка лога каждые 3 дня.

## Файлы

```text
Xiaomi-AX3000T/
├── README.md
├── install.sh
├── uninstall.sh
├── podkop-watchdog.sh
└── etc/
    └── init.d/
        └── podkop-watchdog
```

## Важно

Скрипт предназначен для OpenWrt с установленным Podkop и `/etc/init.d/podkop`.

Watchdog проверяет именно доступ по доменному имени через HTTPS, а не доступность отдельного IP-адреса.
