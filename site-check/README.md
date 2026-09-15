# Site Checker

LuCI utility for checking website availability directly from the router.

## Возможности

- проверка одного сайта;
- проверка нескольких сайтов;
- один URL в каждой строке;
- диагностика DNS;
- диагностика TCP;
- диагностика TLS;
- диагностика HTTP;
- HTTP-код;
- IP-адрес;
- время ответа;
- количество полученных байт;
- итоговый URL;
- проверка содержимого;
- работает через router-side curl;
- не использует браузер или Chromium;
- история проверок не сохраняется.

## Установка

```sh
curl -fsSL https://raw.githubusercontent.com/oblomo-f/Xiaomi-AX3000T_config/main/site-check/install.sh | sh

