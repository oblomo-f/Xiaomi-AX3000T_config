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

        var s1 = map.section(form.NamedSection, 'main', 'main', _('Проверка интернета'));
        s1.anonymous = true;

        s1.option(form.Flag, 'enabled', {
            title: _('Включить Watchdog'),
            description: _('При включении watchdog автоматически запускается и следит за доступностью интернета.')
        });

        s1.option(form.Value, 'domain', {
            title: _('Домен для проверки'),
            description: _('Домен, к которому выполняется HTTPS-проверка. Например: google.com или ya.ru.'),
            datatype: 'host',
            placeholder: 'google.com'
        });

        s1.option(form.Value, 'check_interval', {
            title: _('Интервал проверки'),
            description: _('Как часто проверять интернет. Значение указывается в секундах. Рекомендуется 30 сек.'),
            datatype: 'uinteger',
            placeholder: '30'
        });

        var s2 = map.section(form.NamedSection, 'main', 'main', _('Перезапуск Podkop'));
        s2.anonymous = true;

        s2.option(form.Value, 'fail_limit', {
            title: _('Ошибок до перезапуска'),
            description: _('Количество проверок подряд с ошибкой, после которого watchdog перезапустит Podkop. Например: 3.'),
            datatype: 'uinteger',
            placeholder: '3'
        });

        s2.option(form.Value, 'restart_wait', {
            title: _('Пауза после перезапуска'),
            description: _('Сколько секунд подождать после перезапуска Podkop перед продолжением работы watchdog.'),
            datatype: 'uinteger',
            placeholder: '20'
        });

        var s3 = map.section(form.NamedSection, 'main', 'main', _('Лог'));
        s3.anonymous = true;

        s3.option(form.Value, 'rotate_seconds', {
            title: _('Очистка лога'),
            description: _('Через сколько секунд очищать лог. 259200 секунд = 3 дня.'),
            datatype: 'uinteger',
            placeholder: '259200'
        });

        s3.option(form.Value, 'log', {
            title: _('Файл лога'),
            description: _('Путь к файлу, где сохраняются ошибки проверки и сообщения о перезапуске Podkop.'),
            datatype: 'string',
            placeholder: '/root/podkop-watchdog.log'
        });

        var logBox = E('pre', {
            'id': 'podkop-watchdog-log',
            'style': 'max-height:360px; overflow:auto; white-space:pre-wrap; background:#111; padding:12px;'
        }, _('Загрузка лога...'));

        var logSection = E('div', {
            'class': 'cbi-section'
        }, [
            E('h3', {}, _('Текущий лог')),
            E('p', {
                'class': 'cbi-section-descr'
            }, _('Здесь отображаются последние записи watchdog. Нормальная работа без ошибок не записывается.')),

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
