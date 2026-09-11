'use strict';
'require view';
'require form';
'require rpc';
'require ui';
'require uci';

var callStatus = rpc.declare({
	object: 'podkop-watchdog',
	method: 'status',
	expect: {}
});

var callAction = rpc.declare({
	object: 'podkop-watchdog',
	method: 'action',
	params: ['data'],
	expect: {}
});
var callLog = rpc.declare({
	object: 'podkop-watchdog',
	method: 'log',
	expect: { }
});


return view.extend({
	load: function() {
		return Promise.all([
			uci.load('podkop_watchdog'),
			callStatus()
		]);
	},

	render: function(data) {
		var status = data[1] || {};

		var statusText = status.running ? _('● ЗАПУЩЕН') : _('○ ОСТАНОВЛЕН');
		var statusColor = status.running ? '#168821' : '#b8860b';

		var statusBox = E('div', {
			'class': 'cbi-section',
			'style': 'padding:12px 16px;margin-bottom:15px;border:1px solid #ccc;border-radius:4px'
		}, [
			E('strong', {}, _('Статус: ')),
			E('span', {
				'style': 'color:' + statusColor + ';font-weight:bold'
			}, statusText),
			status.pid ? E('span', {}, '  PID: ' + status.pid) : ''
		]);

		var buttons = E('div', {
			'style': 'margin:10px 0 20px'
		}, [
			E('button', {
				'class': 'cbi-button cbi-button-apply',
				'click': function() {
					return callAction({ action: 'start' }).then(function() {
						location.reload();
					});
				}
			}, _('Запустить')),
			' ',
			E('button', {
				'class': 'cbi-button',
				'click': function() {
					return callAction({ action: 'restart' }).then(function() {
						location.reload();
					});
				}
			}, _('Перезапустить')),
			' ',
			E('button', {
				'class': 'cbi-button cbi-button-reset',
				'click': function() {
					return callAction({ action: 'stop' }).then(function() {
						location.reload();
					});
				}
			}, _('Остановить')),
			' ',
			E('button', {
				'class': 'cbi-button',
				'click': function(ev) {
					ev.currentTarget.disabled = true;
					return callAction({ action: 'check' }).then(function(r) {
						var ok = r && r.ok;
						ui.addNotification(null,
							E('p', {
								'style': 'font-weight:bold;color:' + (ok ? '#168821' : '#c62828')
							}, r && r.message ? r.message :
								(ok ? _('Проверка успешна') : _('Домен недоступен')))
						);
					}).catch(function() {
						ui.addNotification(null, E('p', {
							'style': 'font-weight:bold;color:#c62828'
						}, _('Ошибка выполнения проверки')));
					}).finally(function() {
						ev.currentTarget.disabled = false;
					});
				}
			}, _('Проверить сейчас'))
		]);

		var map = new form.Map(
			'podkop_watchdog',
			_('Podkop Watchdog'),
			_('Проверяет доступность интернета по домену и перезапускает Podkop после заданного числа неудачных проверок.')
		);

		var s = map.section(form.NamedSection, 'main', 'watchdog');
		s.anonymous = true;

		var enabled = s.option(form.Flag, 'enabled', _('Watchdog включён'));
		enabled.rmempty = false;

		var domain = s.option(form.Value, 'domain', _('Домен проверки'));
		domain.placeholder = 'google.com';
		domain.datatype = 'hostname';

		var interval = s.option(form.Value, 'check_interval', _('Интервал проверки'));
		interval.datatype = 'uinteger';
		interval.description = _('Секунд.');

		var limit = s.option(form.Value, 'fail_limit', _('Ошибок до перезапуска Podkop'));
		limit.datatype = 'uinteger';

		var wait = s.option(form.Value, 'restart_wait', _('Ожидание после перезапуска'));
		wait.datatype = 'uinteger';
		wait.description = _('Секунд.');

		var rotate = s.option(form.Value, 'rotate_seconds', _('Очистка лога'));
		rotate.datatype = 'uinteger';
		rotate.description = _('259200 секунд = 3 дня.');

		var log = s.option(form.Value, 'log', _('Файл лога'));
		log.readonly = true;

		var logBox = E('pre', {
			'style': 'max-height:300px;overflow:auto;white-space:pre-wrap;background:#f7f7f7;padding:10px;border:1px solid #ddd'
		}, _('Загрузка лога...'));

		var logSection = E('div', {
			'class': 'cbi-section'
		}, [
			E('h3', {}, _('Лог')),
			logBox
		]);

		callLog().then(function(t) {
			logBox.textContent = t || _('Лог пуст.');
		}).catch(function() {
			logBox.textContent = _('Не удалось прочитать лог.');
		});

		// map.render() is asynchronous in current LuCI.
		return Promise.resolve(map.render()).then(function(mapNode) {
			return E('div', {}, [
				statusBox,
				buttons,
				mapNode,
				logSection
			]);
		});
	}
});
