# Podkop Watchdog

Интерактивный watchdog для OpenWrt + Podkop.

## Быстрый запуск

На роутере выполнить от `root`:

```sh
sh <(wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install.sh)
```

Откроется меню:

```text
==========================================
     Xiaomi AX3000T — Podkop Watchdog
==========================================

  1) Установить / обновить
  2) Проверить статус
  3) Перезапустить watchdog
  4) Остановить watchdog
  5) Показать лог
  6) Удалить
  0) Выход
```

## Как работает

Каждые 30 секунд проверяется `https://google.com`.

При нормальном интернете успешные проверки в лог не записываются.

После 3 ошибок подряд выполняется:

```sh
/etc/init.d/podkop restart
```

Затем watchdog ждёт 20 секунд и продолжает работу.

Лог:

```text
/root/podkop-watchdog.log
```

Лог автоматически очищается каждые 3 дня.

## Настройки

Файл:

```text
/root/podkop-watchdog.sh
```

Параметры:

```sh
DOMAIN="google.com"
CHECK_INTERVAL=30
FAIL_LIMIT=3
RESTART_WAIT=20
ROTATE_SECONDS=259200
```

## Автозапуск

Watchdog устанавливается как OpenWrt `procd` service и автоматически запускается после перезагрузки роутера.

## Удаление

Удаление также доступно из меню.

## Репозиторий

https://github.com/oblomo-f/Xiaomi-AX3000T_config
