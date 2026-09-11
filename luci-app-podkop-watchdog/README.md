# luci-app-podkop-watchdog

LuCI-интерфейс для Podkop Watchdog на OpenWrt.

Возможности:
- статус watchdog и PID;
- запуск / остановка / перезапуск;
- ручная проверка домена;
- настройка домена;
- интервал проверки;
- количество ошибок до перезапуска Podkop;
- задержка после перезапуска;
- очистка лога раз в заданное число секунд;
- просмотр лога.

## Установка

Это исходный пакет для сборки OpenWrt `.ipk`.

После установки `.ipk` откройте:

**LuCI → Services → Podkop Watchdog**

Файл настроек:

`/etc/config/podkop_watchdog`

Лог:

`/root/podkop-watchdog.log`
