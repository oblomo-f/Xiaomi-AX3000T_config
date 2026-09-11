'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require ui';

var callStatus = rpc.declare({
    object: 'podkop-watchdog',
    method: 'status',
    expect: {}
});

var callAction = rpc.declare({
    object: 'podkop-watchdog',
    method: 'action',
    params: [ 'action' ],
    expect: {}
});

var callLog = rpc.declare({
    object: 'podkop-watchdog',
    method: 'log',
    expect: {}
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
        var map = new form.Map('podkop_watchdog', _('Podkop Watchdog'));

        var statusBox = E('div', {
            'class': 'cbi-section'
        }, [
            E('h3', {}, _('Статус')),
            E('div', {
                'id': 'podkop-watchdog-status',
                'style': 'margin-bottom: 12px;'
            }, status.running ?
                E('span', { 'style': 'font-weight:bold;' }, '● ЗАПУЩЕН') :
                E('span', { 'style': 'font-weight:bold;' }, '● ОСТАНОВЛЕН')
            )
        ]);

        var buttons = E('div', {
            'class': 'cbi-section',
            'style': 'display:flex; gap:8px; flex-wrap:wrap;'
        }, [
            E('button', {
                'class': 'cbi-button cbi-button-positive',
                'click': ui.createHandlerFn(this, function() {
                    return callAction('start').then(function() {
                        location.reload();
                    });
                })
            }, _('Запустить')),

            E('button', {
                'class': 'cbi-button cbi-button-negative',
                'click': ui.createHandlerFn(this, function() {
                    return callAction('stop').then(function() {
                        location.reload();
                    });
                })
            }, _('Остановить')),

            E('button', {
                'class': 'cbi-button cbi-button-action',
                'click': ui.createHandlerFn(this, function() {
                    return callAction('restart').then(function() {
                        location.reload();
                    });
                })
            }, _('Перезапустить')),

            E('button', {
                'class': 'cbi-button',
                'click': ui.createHandlerFn(this, function() {
                    return callAction('check').then(function() {
                        ui.addNotification(null, E('p', {}, _('Проверка запущена.')), 'info');
                    });
                })
            }, _('Проверить'))
        ]);

        var s = map.section(form.NamedSection, 'main', 'main');
        s.anonymous = true;

        s.option(form.Flag, 'enabled', {
            caption: _('Watchdog включён'),
            description: _('Автоматический запуск watchdog.')
        });

        s.option(form.Value, 'domain', {
            caption: _('Домен для проверки'),
            datatype: 'host',
            placeholder: 'google.com'
        });

        s.option(form.Value, 'check_interval', {
            caption: _('Интервал проверки (сек.)'),
            datatype: 'uinteger'
        });

        s.option(form.Value, 'fail_limit', {
            caption: _('Количество ошибок до перезапуска'),
            datatype: 'uinteger'
        });

        s.option(form.Value, 'restart_wait', {
            caption: _('Ожидание после перезапуска (сек.)'),
            datatype: 'uinteger'
        });

        s.option(form.Value, 'rotate_seconds', {
            caption: _('Очистка лога каждые (сек.)'),
            datatype: 'uinteger'
        });

        s.option(form.Value, 'log', {
            caption: _('Файл лога'),
            datatype: 'string'
        });

        var logBox = E('pre', {
            'id': 'podkop-watchdog-log',
            'style': 'max-height:360px; overflow:auto; white-space:pre-wrap; background:#111; padding:12px;'
        }, _('Загрузка лога...'));

        var logSection = E('div', {
            'class': 'cbi-section'
        }, [
            E('h3', {}, _('Лог')),
            logBox,
            E('button', {
                'class': 'cbi-button',
                'style': 'margin-top:8px;',
                'click': ui.createHandlerFn(this, function() {
                    logBox.textContent = _('Загрузка лога...');
                    return callLog().then(function(reply) {
                        logBox.textContent = (reply && reply.text) ? reply.text : _('Лог пуст.');
                    }).catch(function() {
                        logBox.textContent = _('Ошибка чтения лога.');
                    });
                })
            }, _('Обновить лог'))
        ]);

        var root = E('div', {}, [
            statusBox,
            buttons,
            logSection
        ]);

        return Promise.resolve(map.render()).then(function(mapNode) {
            root.appendChild(mapNode);
            return root;
        });
    },

    handleSaveApply: function(ev) {
        return this.super('handleSaveApply', [ ev ]);
    },

    handleSave: function(ev) {
        return this.super('handleSave', [ ev ]);
    },

    handleReset: function(ev) {
        return this.super('handleReset', [ ev ]);
    },

    postRender: function() {
        var logBox = document.getElementById('podkop-watchdog-log');
        if (!logBox)
            return;

        return callLog().then(function(reply) {
            logBox.textContent = (reply && reply.text) ? reply.text : _('Лог пуст.');
        }).catch(function() {
            logBox.textContent = _('Ошибка чтения лога.');
        });
    }
});
