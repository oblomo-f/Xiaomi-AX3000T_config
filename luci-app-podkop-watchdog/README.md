# Podkop Watchdog LuCI v7

Исправления v7:
- убран `[object Promise]`;
- лог читается через ubus/rpcd, а не как URL LuCI;
- старый неправильный каталог view удаляется при обновлении;
- управление start/stop/restart/check сохраняется.

Установка:
```sh
sh <(wget -O- https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/install-luci.sh) install
```
