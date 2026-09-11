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
