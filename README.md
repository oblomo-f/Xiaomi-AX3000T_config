# Podkop Watchdog

Интерактивный watchdog для OpenWrt + Podkop.

## Запуск меню

```sh
sh <(wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install.sh)
```

## Меню

```text
1) Установить / обновить
2) Проверить статус
3) Перезапустить watchdog
4) Остановить watchdog
5) Изменить домен проверки
6) Показать лог
7) Удалить
0) Выход
```

## Как работает

Каждые 30 секунд проверяется доступ в интернет через HTTPS к указанному домену.

По умолчанию:

```text
google.com
```

Успешные проверки в лог не записываются.

После 3 ошибок подряд выполняется перезапуск Podkop:

```sh
/etc/init.d/podkop restart
```

После рестарта watchdog ждёт 20 секунд и продолжает работу.

Лог:

```text
/root/podkop-watchdog.log
```

Лог автоматически очищается каждые 3 дня.

## Настройки по умолчанию

```sh
DOMAIN="google.com"
CHECK_INTERVAL=30
FAIL_LIMIT=3
RESTART_WAIT=20
ROTATE_SECONDS=259200
```

Домен можно изменить непосредственно из меню, пункт **5**.

## Автозапуск

Watchdog устанавливается как OpenWrt `procd` service и запускается автоматически после перезагрузки.

## Удаление

Удаление доступно из меню, пункт **7**.

## Репозиторий


# Podkop Watchdog + LuCI

Добавляет Web-интерфейс LuCI для управления Podkop Watchdog.

## Что делает

LuCI → Services → Podkop Watchdog:

- статус и PID;
- запуск / остановка / перезапуск;
- проверка домена;
- настройка домена;
- интервал проверки;
- количество ошибок до рестарта Podkop;
- ожидание после рестарта;
- ротация/очистка лога;
- просмотр лога.

## Установка

После размещения каталога `luci-app-podkop-watchdog` в ветке `main` репозитория:

```sh
sh <(wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install-luci.sh) install
```

Или:

```sh
wget -O /tmp/install-luci.sh https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install-luci.sh
sh /tmp/install-luci.sh install
```

Важно: `install-luci.sh` загружает файлы из этого же GitHub-репозитория, поэтому каталог `luci-app-podkop-watchdog` должен находиться в `main`.


https://github.com/oblomo-f/Xiaomi-AX3000T_config
