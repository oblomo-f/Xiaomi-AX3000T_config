# Podkop Watchdog

Интерактивный Watchdog для OpenWrt + Podkop.

Watchdog регулярно проверяет доступ в Интернет по HTTPS через заданный домен. При нескольких ошибках подряд он может автоматически восстановить WAN-интерфейс и перезапустить Podkop.

Проект включает:

- Shell-меню управления;
- команду `Podkop-w`;
- OpenWrt `procd` service;
- LuCI Web-интерфейс;
- RPC-интерфейс для LuCI;
- контроль WAN;
- аварийное восстановление без Интернета;
- автоматическую очистку лога;
- локальный кэш компонентов для офлайн-восстановления.

---

## Быстрый запуск

Для первой установки, когда Интернет доступен:

```sh
sh <(wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install.sh)
```

Скрипт необходимо запускать от `root`.

После установки появляется команда:

```sh
Podkop-w
```

---

# Главное меню

Текущая структура меню:

```text
==========================================
              Podkop Watchdog
==========================================

  Статус: ● ЗАПУЩЕН

  Команда: Podkop-w — открыть это меню

  1) Установить / обновить Watchdog
  2) Проверить статус
  3) Перезапустить watchdog
  4) Остановить watchdog
  5) Изменить домен проверки
  6) Показать лог

  --- Web-интерфейс ---
  7) Установить / обновить Web
  8) Удалить Web
  9) Удалить полностью (Web + Shell)

  --- Интерфейс ---
  10) Перегрузить WAN + Podkop

  0) Выход

Выберите действие [0-10]:
```

## 1. Установить / обновить Watchdog

Устанавливает или обновляет:

- основной watchdog;
- `procd` init-скрипт;
- конфигурацию UCI;
- лог;
- автозапуск;
- локальную копию меню;
- локальный кэш компонентов.

После установки служба запускается через:

```sh
/etc/init.d/podkop-watchdog restart
```

и включается в автозапуск:

```sh
/etc/init.d/podkop-watchdog enable
```

Если Интернет недоступен, установка может использовать ранее сохранённые файлы из локального кэша.

---

# Офлайн-режим

Одна из важных функций проекта — возможность восстановить соединение, когда Интернет уже отсутствует.

После успешной установки меню сохраняется локально:

```text
/usr/bin/podkop-watchdog-menu.sh
```

Команда:

```sh
Podkop-w
```

сначала запускает именно локальное меню.

Поэтому:

```text
Интернет пропал
      ↓
Podkop-w
      ↓
локальное меню
      ↓
10) Перегрузить WAN + Podkop
```

Работа меню больше не зависит от GitHub.

Также компоненты сохраняются в:

```text
/usr/share/podkop-watchdog-cache/
```

В кэше могут находиться:

```text
install.sh
podkop-watchdog.sh
podkop-watchdog.init
install-luci.sh
```

Это позволяет повторно установить Watchdog из локальной копии, если Интернет временно недоступен.

---

# 2. Проверить статус

Показывает:

- установлен ли Watchdog;
- запущен ли процесс;
- включён ли автозапуск;
- текущий домен;
- основные параметры;
- последние записи лога;
- последние сообщения `procd`.

Основные команды проверки:

```sh
/etc/init.d/podkop-watchdog status
```

```sh
ps | grep podkop-watchdog
```

```sh
logread | grep podkop-watchdog
```

---

# 3. Перезапустить Watchdog

Использует:

```sh
/etc/init.d/podkop-watchdog restart
```

---

# 4. Остановить Watchdog

Использует:

```sh
/etc/init.d/podkop-watchdog stop
```

При ручной остановке служба не должна сразу подниматься снова из-за `procd respawn`.

В Web-интерфейсе состояние кнопок синхронизируется со статусом:

- если Watchdog запущен — `Запустить` неактивна;
- если Watchdog остановлен — `Остановить` неактивна;
- `Перезапустить` доступна при работающем сервисе.

---

# 5. Изменить домен проверки

Позволяет изменить домен, например:

```text
google.com
```

или:

```text
ya.ru
```

Домен хранится в UCI:

```sh
uci get podkop_watchdog.main.domain
```

Shell и Web используют один и тот же источник настройки.

Например, если установлено:

```text
ya.ru
```

то:

- пункт 5 показывает `ya.ru`;
- Web показывает `ya.ru`;
- Watchdog проверяет `ya.ru`.

---

# 6. Показать лог

Лог:

```text
/root/podkop-watchdog.log
```

Успешные проверки в лог не записываются.

При ошибках записывается:

```text
2026-09-11 13:25:37 Internet check failed: google.com (1/3)
```

После достижения лимита:

```text
2026-09-11 13:26:28 Restarting WAN interface: wan
2026-09-11 13:26:28 Restarting Podkop after 3 failed checks
```

---

# 7. Установить / обновить Web

Устанавливает LuCI-интерфейс:

```text
Podkop Watchdog
```

Web устанавливается отдельно от Shell Watchdog.

При доступном Интернете установщик Web также сохраняется в локальный кэш.

---

# 8. Удалить Web

Удаляет LuCI-интерфейс.

Shell Watchdog при этом не удаляется.

---

# 9. Полное удаление

Полностью удаляет:

- Shell Watchdog;
- `procd` init-скрипт;
- UCI-конфигурацию;
- Web-интерфейс;
- RPC;
- ACL;
- логи;
- `Podkop-w`;
- локальное меню;
- связанные файлы автозапуска.

Команда:

```sh
rm -f /usr/bin/Podkop-w
```

при полном удалении выполняется автоматически.

---

# 10. Перегрузить WAN + Podkop

Это аварийный пункт, предназначенный в первую очередь для ситуации, когда Интернет уже отсутствует.

Он не требует подключения к GitHub.

Используется WAN-интерфейс из настройки:

```text
wan_interface
```

По умолчанию:

```text
wan
```

Последовательность:

```text
ifdown WAN
     ↓
пауза 3 секунды
     ↓
ifup WAN
     ↓
пауза 5 секунд
     ↓
перезапуск Podkop
```

Основная идея:

```text
нет Интернета
      ↓
Podkop-w
      ↓
10) Перегрузить WAN + Podkop
```

WAN-интерфейс является обязательной настройкой.

---

# Проверка Интернета

Watchdog использует HTTPS-проверку:

```sh
wget -q -T 10 -O /dev/null "https://$DOMAIN/"
```

По умолчанию:

```text
google.com
```

Время ожидания одной HTTPS-проверки:

```text
10 секунд
```

---

# Интервал проверки

Параметр:

```text
check_interval
```

Например:

```text
20
```

означает интервал 20 секунд.

В версии v55 исправлена важная особенность.

Раньше цикл фактически мог работать так:

```text
проверка wget
+
время ожидания wget
+
CHECK_INTERVAL
```

Из-за этого при проблемном Интернете пользователь мог видеть, например:

```text
13:25:37
13:26:02
13:26:28
```

при установленном интервале 20 секунд.

Теперь учитывается фактическое время выполнения проверки:

```text
CHECK_INTERVAL - время выполнения wget
```

Поэтому заданный интервал является интервалом между началом проверок.

Например, при:

```text
CHECK_INTERVAL=20
```

проверки должны начинаться примерно:

```text
13:30:00
13:30:20
13:30:40
```

Если сама проверка занимает меньше интервала.

---

# Ошибки подряд

Параметр:

```text
fail_limit
```

По умолчанию:

```text
3
```

То есть после трёх неудачных HTTPS-проверок выполняется восстановление.

При включённом восстановлении WAN:

```text
ошибка 1
   ↓
ошибка 2
   ↓
ошибка 3
   ↓
перезапуск WAN
   ↓
перезапуск Podkop
```

---

# Пауза после восстановления

Параметр:

```text
restart_wait
```

По умолчанию:

```text
20
```

Это отдельный параметр и он **не является интервалом обычной проверки**.

Он используется после восстановления WAN и/или перезапуска Podkop.

---

# Восстановление WAN

В Web есть настройка:

```text
Перезапускать WAN при отсутствии интернета
```

Если включена:

```text
restart_wan=1
```

Watchdog после достижения `fail_limit` выполняет:

```text
ifdown WAN
      ↓
3 секунды
      ↓
ifup WAN
```

После этого перезапускается Podkop.

---

# Определение ifdown / ifup

Watchdog не предполагает, что команды обязательно находятся в:

```text
/usr/sbin/
```

Сначала используется:

```sh
command -v ifdown
command -v ifup
```

Затем предусмотрен резервный путь:

```text
/sbin/ifdown
/sbin/ifup
```

Если команда не найдена, это записывается в лог.

Например:

```text
ERROR: ifdown not found
```

или:

```text
ERROR: ifup not found
```

---

# WAN-интерфейс

В конфигурации:

```text
option wan_interface 'wan'
```

Обычно используется:

```text
wan
```

Но интерфейс можно изменить через Web.

Проверить текущий:

```sh
uci get podkop_watchdog.main.wan_interface
```

---

# Логирование

Файл:

```text
/root/podkop-watchdog.log
```

Успешные проверки не записываются.

Записываются:

- ошибки HTTPS;
- номер ошибки подряд;
- запуск восстановления WAN;
- ошибки `ifdown`;
- ошибки `ifup`;
- перезапуск Podkop.

Пример:

```text
2026-09-11 13:06:59 Internet check failed: ya.ru (1/3)
2026-09-11 13:07:34 Internet check failed: ya.ru (2/3)
2026-09-11 13:08:09 Internet check failed: ya.ru (3/3)
2026-09-11 13:08:09 Restarting WAN interface: wan
2026-09-11 13:08:12 Restarting Podkop after 3 failed checks
```

---

# Очистка лога

Параметр:

```text
rotate_seconds
```

По умолчанию:

```text
259200
```

Это:

```text
259200 секунд = 3 дня
```

После достижения этого времени лог очищается.

---

# Конфигурация UCI

Файл:

```text
/etc/config/podkop_watchdog
```

Пример:

```text
config podkop_watchdog 'main'
	option enabled '1'
	option domain 'google.com'
	option check_interval '30'
	option fail_limit '3'
	option restart_wait '20'
	option wan_interface 'wan'
	option restart_wan '0'
	option rotate_seconds '259200'
	option log '/root/podkop-watchdog.log'
```

Изменить параметры вручную:

```sh
uci set podkop_watchdog.main.domain='ya.ru'
uci set podkop_watchdog.main.check_interval='20'
uci set podkop_watchdog.main.fail_limit='3'
uci set podkop_watchdog.main.restart_wait='20'
uci set podkop_watchdog.main.wan_interface='wan'
uci set podkop_watchdog.main.restart_wan='1'
uci commit podkop_watchdog
```

После изменения Watchdog перечитывает UCI перед каждой новой проверкой.

---

# Включение / отключение Watchdog

Основной параметр:

```text
enabled
```

Включить:

```sh
uci set podkop_watchdog.main.enabled='1'
uci commit podkop_watchdog
/etc/init.d/podkop-watchdog restart
```

Отключить:

```sh
uci set podkop_watchdog.main.enabled='0'
uci commit podkop_watchdog
/etc/init.d/podkop-watchdog stop
```

В Web чекбокс:

```text
Включить Watchdog
```

синхронизирован с этим параметром.

Если чекбокс выключен и настройки применены, сервис должен быть остановлен.

---

# Автозапуск

Watchdog работает как OpenWrt `procd` service.

Включение:

```sh
/etc/init.d/podkop-watchdog enable
```

Отключение:

```sh
/etc/init.d/podkop-watchdog disable
```

Проверка:

```sh
ls -l /etc/rc.d/*podkop-watchdog*
```

---

# LuCI Web-интерфейс

Web предоставляет:

## Управление

```text
Статус
Запустить
Остановить
Перезапустить
Проверить
```

Состояние кнопок зависит от реального состояния службы.

## Текущий лог

Лог отображается в отдельном тёмном поле.

Кнопка:

```text
Обновить лог
```

получает лог через RPC.

## Проверка Интернета

Настройки:

```text
Включить Watchdog
Домен для проверки
Интервал проверки, секунд
```

## Восстановление WAN

Настройки:

```text
Перезапускать WAN при отсутствии интернета
WAN интерфейс

В интерфейсе LuCI эти два параметра находятся в одной строке, как и «Домен для проверки» и «Интервал проверки, секунд».
```

WAN-интерфейс отображается отдельным полем и по умолчанию равен:

```text
wan
```

## Перезапуск Podkop

Настройки:

```text
Ошибок подряд до перезапуска
Пауза после перезапуска, секунд
```

## Лог

Настройки:

```text
Очищать лог через, секунд
Файл лога
```

---

# RPC

Web использует RPC:

```text
podkop-watchdog
```

Методы:

```text
status
action
log
```

Действия включают управление службой и проверку соединения.

Аргументы RPC передаются через `stdin` в JSON, например:

```sh
echo '{"action":"check"}' | \
/usr/libexec/rpcd/podkop-watchdog call action
```

Проверка через UBUS:

```sh
ubus call podkop-watchdog action '{"action":"check"}'
```

При доступном Интернете:

```json
{
    "ok": true
}
```

---

# Диагностика

## Проверить процесс

```sh
ps | grep podkop-watchdog
```

## Проверить службу

```sh
/etc/init.d/podkop-watchdog status
```

## Запустить вручную

```sh
/etc/init.d/podkop-watchdog start
```

## Остановить

```sh
/etc/init.d/podkop-watchdog stop
```

## Перезапустить

```sh
/etc/init.d/podkop-watchdog restart
```

## Посмотреть системный лог

```sh
logread | grep -i podkop-watchdog
```

## Посмотреть watchdog-лог

```sh
cat /root/podkop-watchdog.log
```

или:

```sh
tail -50 /root/podkop-watchdog.log
```

## Проверить HTTPS вручную

```sh
wget -S -T 10 -O /dev/null https://google.com/
```

или для текущего домена:

```sh
DOMAIN="$(uci -q get podkop_watchdog.main.domain)"
wget -S -T 10 -O /dev/null "https://$DOMAIN/"
```

---

# Диагностика WAN

Проверить выбранный интерфейс:

```sh
uci get podkop_watchdog.main.wan_interface
```

Проверить наличие команд:

```sh
command -v ifdown
command -v ifup
```

Также:

```sh
ls -l /sbin/ifdown /sbin/ifup
```

Если Интернет отсутствует, самый быстрый способ восстановления:

```sh
Podkop-w
```

затем:

```text
10) Перегрузить WAN + Podkop
```

---

# Структура проекта

Основные файлы:

```text
install.sh
podkop-watchdog.sh
uninstall.sh
install-luci.sh
uninstall-luci.sh

etc/
└── init.d/
    └── podkop-watchdog

luci-app-podkop-watchdog/
├── Makefile
├── README.md
├── htdocs/
│   └── luci-static/
│       └── resources/
│           └── view/
│               └── podkop-watchdog.js
└── root/
    ├── etc/
    │   ├── config/
    │   │   └── podkop_watchdog
    │   └── init.d/
    │       └── podkop-watchdog
    └── usr/
        ├── libexec/
        │   ├── podkop-watchdog.sh
        │   └── rpcd/
        │       └── podkop-watchdog
        └── share/
            ├── luci/
            │   └── menu.d/
            │       └── luci-app-podkop-watchdog.json
            └── rpcd/
                └── acl.d/
                    └── luci-app-podkop-watchdog.json
```

---

# История изменений

## v55

- Исправлен расчёт интервала проверки.
- `CHECK_INTERVAL` теперь означает интервал между началами проверок.
- Время выполнения `wget` вычитается из времени ожидания.
- Устранён эффект `20 секунд настройки → 25–30 секунд фактически`.
- Настройки UCI перечитываются перед каждой проверкой.

## v54

- Исправлен URL репозитория.
- Добавлен локальный кэш компонентов.
- `Podkop-w` запускает локальное меню прежде всего.
- Меню доступно без Интернета.
- Watchdog может восстанавливаться из локального кэша.
- Сохранён аварийный пункт `10) Перегрузить WAN + Podkop`.

## v53

- Добавлен пункт:
  `10) Перегрузить WAN + Podkop`.
- Добавлено восстановление:
  `ifdown → ifup → Podkop restart`.
- Добавлена Web-кнопка:
  `Перегрузить WAN + Podkop`.
- WAN-интерфейс сделан обязательным.
- По умолчанию используется `wan`.
- `Podkop-w` переведён на локальное меню.

## v52

- Исправлено расположение `ifdown` / `ifup`.
- Добавлен поиск через `command -v`.
- Добавлен резервный путь `/sbin/ifdown` и `/sbin/ifup`.
- Ошибки WAN теперь записываются в лог.
- Исправлено отображение текста лога в Web.

## v51

- Shell и Web синхронизированы по домену.
- Web показывает реальное значение:
  `podkop_watchdog.main.domain`.
- Изменение домена через Shell и Web использует один источник UCI.

## v50

- Исправлен запуск Watchdog после установки.
- Используется `restart` после установки.
- Включается автозапуск.
- Добавлена проверка фактического процесса.
- Исправлено управление `start/stop/restart` через Web.
- Состояние кнопок синхронизировано со статусом службы.

## v49

- Кнопка `Запустить` отключается при работающем Watchdog.
- `Остановить` отключается при остановленном Watchdog.
- `Перезапустить` отключается при остановленном Watchdog.
- Статус Web обновляется после действия.
- Исправлена логика `procd respawn`.

## v48

- Исправлена обработка аргументов RPC.
- `rpcd` передаёт JSON-аргументы через `stdin`.
- Исправлена команда:
  ```sh
  ubus call podkop-watchdog action '{"action":"check"}'
  ```

## Ранние версии

- Добавлен LuCI Web-интерфейс.
- Добавлен RPC `status/action/log`.
- Добавлен просмотр лога.
- Добавлены настройки домена и интервала.
- Добавлены настройки перезапуска Podkop.
- Добавлена ротация лога.
- Добавлен WAN-интерфейс.
- Добавлено автоматическое восстановление WAN.
- Добавлено полное удаление Web + Shell.
- Добавлена команда `Podkop-w`.

---

# Важные значения по умолчанию

```text
DOMAIN=google.com
CHECK_INTERVAL=30
FAIL_LIMIT=3
RESTART_WAIT=20
WAN_INTERFACE=wan
RESTART_WAN=0
ROTATE_SECONDS=259200
LOG=/root/podkop-watchdog.log
```

---

# Рекомендуемая настройка

Для обычной работы:

```text
Включить Watchdog:          ✓
Домен:                      google.com
Интервал:                   20
Ошибок подряд:              3
Пауза после перезапуска:    20
Перезапуск WAN:             ✓
WAN интерфейс:              wan
Очистка лога:               259200
```

При этом Watchdog работает следующим образом:

```text
HTTPS проверка
      ↓
ошибка?
      ↓
счётчик +1
      ↓
3 ошибки подряд
      ↓
перезапуск WAN
      ↓
ожидание
      ↓
перезапуск Podkop
      ↓
ожидание
      ↓
счётчик = 0
      ↓
новая проверка
```

---

# Репозиторий

Основной репозиторий:

```text
https://github.com/oblomo-f/Xiaomi-AX3000T_config
```

Raw-установщик:

```text
https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install.sh
```

Текущая документация соответствует сборке **v55**.


### Управление журналом

В Web-интерфейсе рядом с кнопкой **«Обновить лог»** находится кнопка **«Очистить лог»**. Она очищает текущий файл журнала watchdog через RPC.
