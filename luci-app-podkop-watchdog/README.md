# luci-app-podkop-watchdog v9

LuCI interface for Podkop Watchdog.

Fixes in v9:
- status line no longer displays PID;
- log is read through the `podkop-watchdog` ubus RPC method;
- the LuCI view no longer uses the broken `/cgi-bin/luci/admin/services/.../log` fetch;
- the RPC result is read from `{ "text": "..." }`;
- old nested `view/podkop-watchdog/index.js` is removed by the installer.

After installation, clear the LuCI cache and reload the page.


v10:
- исправлены подписи полей LuCI: используется `title`, а не `caption`;
- добавлены понятные описания каждого параметра;
- функциональность v9 сохранена: лог через ubus RPC, PID скрыт.


v11:
- настройки разделены на три блока: «Проверка интернета», «Перезапуск Podkop», «Лог»;
- добавлены понятные названия и пояснения к каждому параметру;
- лог вынесен в отдельный блок «Текущий лог»;
- функциональность v9/v10 сохранена.


v12:
- добавлен `uninstall-luci.sh` для полного удаления Watchdog и LuCI-компонентов;
- удаляются init-скрипт, watchdog backend, rpcd backend, LuCI JS, menu, ACL, UCI-конфигурация и лог;
- очищаются кеши LuCI и перезапускаются rpcd/uhttpd;
- `install-luci.sh remove` и `install-luci.sh uninstall` запускают полное удаление.


v13:
- исправлена ошибка установщика v12: теперь устанавливаются не только LuCI/RPC, но и сам watchdog backend, init-скрипт и UCI-конфигурация;
- добавлена проверка наличия всех ключевых файлов перед перезапуском;
- сохранены группировка настроек, исправленный лог через ubus и полное удаление.


v14:
- исправлена критическая ошибка UCI/NamedSection: используется реальный тип секции `podkop_watchdog`;
- все параметры находятся в одной корректной UCI-секции `main`;
- визуально настройки разделены на блоки «Проверка интернета», «Перезапуск Podkop» и «Лог»;
- сохранены исправления лога через ubus и скрытый PID.


v15:
- поля больше не зависят от стандартного отображения заголовков LuCI;
- каждое поле имеет явно видимую подпись и подробное описание;
- настройки сохраняются напрямую в UCI `podkop_watchdog.main`;
- добавлена отдельная кнопка «Сохранить настройки»;
- сохранены статус, кнопки управления, ubus-лог и полное удаление.


v16:
- добавлен CSS-фикс для RouteRich: стандартные подписи и описания полей LuCI принудительно показываются;
- поля больше не должны отображаться как одни значения без названий;
- добавлен визуально понятный текст для переключателя Watchdog.
