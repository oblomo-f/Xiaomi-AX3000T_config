'use strict';
'require view';
'require form';
'require rpc';
'require ui';
'require uci';

var callStatus = rpc.declare({
	object: 'podkop-watchdog',
	method: 'status',
	expect: { }
});

var callAction = rpc.declare({
	object: 'podkop-watchdog',
	method: 'action',
	params: [ 'data' ],
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
		var map = new form.Map('podkop_watchdog',
			_('Podkop Watchdog'),
			_('Автоматически проверяет интернет по домену и перезапускает Podkop после заданного числа неудачных проверок.'));

		var s = map.section(form.NamedSection, 'main', 'watchdog');
		s.anonymous = true;

		var enabled = s.option(form.Flag, 'enabled', _('Включён'));
		enabled.rmempty = false;

		var domain = s.option(form.Value, 'domain', _('Домен проверки'));
		domain.placeholder = 'google.com';
		domain.datatype = 'hostname';

		var interval = s.option(form.Value, 'check_interval', _('Интервал проверки'));
		interval.datatype = 'uinteger';
		interval.description = _('Секунд.');

		var limit = s.option(form.Value, 'fail_limit', _('Ошибок до перезапуска'));
		limit.datatype = 'uinteger';

		var wait = s.option(form.Value, 'restart_wait', _('Ожидание после перезапуска'));
		wait.datatype = 'uinteger';
		wait.description = _('Секунд.');

		var rotate = s.option(form.Value, 'rotate_seconds', _('Очистка лога'));
		rotate.datatype = 'uinteger';
		rotate.description = _('Интервал в секундах. 259200 = 3 дня.');

		var log = s.option(form.Value, 'log', _('Файл лога'));
		log.readonly = true;

		var statusText = status.running ? _('● ЗАПУЩЕН') : _('○ ОСТАНОВЛЕН');
		var statusBox = E('div', {
			'class': 'cbi-section',
			'style': 'padding:12px 16px;margin-bottom:15px;border:1px solid #ccc;border-radius:4px'
		}, [
			E('strong', {}, _('Статус: ')),
			E('span', { 'style': status.running ? 'color:#168821;font-weight:bold' : 'color:#b8860b;font-weight:bold' }, statusText),
			status.pid ? E('span', {}, '  PID: ' + status.pid) : ''
		]);

		var buttons = E('div', { 'style': 'margin:10px 0 20px' }, [
			E('button', {
				'class': 'cbi-button cbi-button-apply',
				'click': function() { return callAction({action:'start'}).then(this.refresh.bind(this)); }
			}, _('Запустить')),
			' ',
			E('button', {
				'class': 'cbi-button',
				'click': function() { return callAction({action:'restart'}).then(this.refresh.bind(this)); }
			}, _('Перезапустить')),
			' ',
			E('button', {
				'class': 'cbi-button cbi-button-reset',
				'click': function() { return callAction({action:'stop'}).then(this.refresh.bind(this)); }
			}, _('Остановить')),
			' ',
			E('button', {
				'class': 'cbi-button',
				'click': function() {
					return callAction({action:'check'}).then(function(r) {
						ui.addNotification(null, E('p', {}, r.message || (r.ok ? _('Проверка успешна') : _('Проверка не пройдена'))));
					});
				}
			}, _('Проверить сейчас'))
		]);

		var logBox = E('pre', {
			'style': 'max-height:260px;overflow:auto;white-space:pre-wrap;background:#f7f7f7;padding:10px;border:1px solid #ddd'
		}, _('Лог загружается...'));

		fetch('/cgi-bin/luci/admin/services/podkop-watchdog/log', { credentials:'same-origin' })
			.then(function(r) { return r.ok ? r.text() : ''; })
			.then(function(t) { logBox.textContent = t || _('Лог пуст.'); })
			.catch(function() { logBox.textContent = _('Не удалось прочитать лог.'); });

		var footer = E('div', {}, [
			E('h3', {}, _('Лог')),
			logBox
		]);

		return E('div', {}, [ statusBox, buttons, map.render(), footer ]);
	},

	refresh: function() {
		location.reload();
	}
});
