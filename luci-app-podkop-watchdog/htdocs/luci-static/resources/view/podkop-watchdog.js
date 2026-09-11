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

        /* RouteRich theme can hide the standard LuCI field title column.
         * Force clear labels/descriptions to be visible for this page. */
        var style = E('style', {}, [
            '.podkop-watchdog-page .cbi-value-title{display:block!important;float:none!important;width:auto!important;font-weight:700!important;margin:10px 0 4px 0!important;}',
            '.podkop-watchdog-page .cbi-value-field{display:block!important;float:none!important;width:auto!important;}',
            '.podkop-watchdog-page .cbi-value-description{display:block!important;margin:3px 0 8px 0!important;opacity:.8;}',
            '.podkop-watchdog-page .cbi-value{display:block!important;padding:4px 0 10px 0!important;}',
            '.podkop-watchdog-page input[type="text"],.podkop-watchdog-page input[type="number"]{max-width:420px;}',
            '.podkop-watchdog-page .cbi-section-descr{margin-bottom:10px;}',
            '.podkop-watchdog-page .podkop-two-column-row{width:75%!important;}',
            '@media(max-width:700px){.podkop-watchdog-page .podkop-two-column-row{flex-direction:column!important}.podkop-watchdog-page .podkop-two-column-row>div{width:100%!important;border-right:0!important;border-bottom:1px solid #ddd!important}}'
        ]);


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
            }, _('Проверить')),

            E('button', {
                'class': 'cbi-button cbi-button-negative',
                'style': 'margin-left:auto;',
                'click': ui.createHandlerFn(this, function() {
                    if (!confirm(_('Удалить Podkop Watchdog полностью? Будут удалены watchdog, настройки, LuCI-интерфейс и лог.')))
                        return;

                    return callAction('uninstall').then(function() {
                        ui.addNotification(null, E('p', {}, _('Удаление запущено. LuCI будет обновлена.')), 'info');
                        setTimeout(function() {
                            location.href = '/cgi-bin/luci/admin/services';
                        }, 1800);
                    }).catch(function(err) {
                        ui.addNotification(null, E('p', {}, _('Ошибка удаления: ') + String(err)), 'error');
                    });
                })
            }, _('Удалить'))
        ]);

        var settings = E('div', {
            'class': 'cbi-section',
            'style': 'width:100%; max-width:none;'
        });

        function addHeader(title, description) {
            settings.appendChild(E('div', {
                'style': 'margin-top:18px; margin-bottom:12px; padding-bottom:7px; border-bottom:1px solid #ddd;'
            }, [
                E('h3', {
                    'style': 'margin:0 0 4px 0;'
                }, title),
                E('div', {
                    'style': 'font-size:13px; opacity:.75;'
                }, description)
            ]));
        }

        function addField(option, title, description, type) {
            var value = uci.get('podkop_watchdog', 'main', option) || '';
            var input = E('input', {
                'type': type || 'text',
                'class': 'cbi-input-text',
                'value': value,
                'style': 'display:block; width:420px; max-width:100%; margin-top:5px;'
            });

            if (type === 'checkbox') {
                input.style.width = 'auto';
                input.checked = value === '1';
            }

            input.dataset.option = option;

            var block = E('div', {
                'style': 'margin:0 0 15px 0;'
            }, [
                E('label', {
                    'style': 'display:block; font-weight:bold; margin-bottom:3px;'
                }, title),
                E('div', {
                    'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
                }, description),
                input
            ]);

            settings.appendChild(block);
            return input;
        }

        addHeader(
            _('Проверка интернета'),
            _('Watchdog регулярно проверяет, есть ли доступ в интернет.')
        );

        var enabledInput = addField(
            'enabled',
            _('Включить Watchdog'),
            _('Если включено — watchdog запускается автоматически и контролирует соединение.'),
            'checkbox'
        );

        var checkRow = E('div', {
            'class': 'podkop-two-column-row',
            'style': 'display:flex; gap:0; align-items:stretch; width:75%; margin:0 0 18px 0; border:1px solid #ddd;'
        });

        var domainInput = E('input', {
            'type': 'text',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'domain') || 'google.com',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        var intervalInput = E('input', {
            'type': 'number',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'check_interval') || '30',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        checkRow.appendChild(E('div', {
            'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5; border-right:1px solid #ddd;'
        }, [
            E('label', {
                'style': 'display:block; font-weight:bold; margin-bottom:3px;'
            }, _('Домен для проверки')),
            E('div', {
                'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
            }, _('Сюда указывается сайт, который watchdog будет проверять по HTTPS. Например: google.com или ya.ru.')),
            domainInput
        ]));

        checkRow.appendChild(E('div', {
            'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5;'
        }, [
            E('label', {
                'style': 'display:block; font-weight:bold; margin-bottom:3px;'
            }, _('Интервал проверки, секунд')),
            E('div', {
                'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
            }, _('Как часто выполнять проверку. Сейчас установлено 30 секунд.')),
            intervalInput
        ]));

        settings.appendChild(checkRow);

        addHeader(
            _('Перезапуск Podkop'),
            _('Если интернет недоступен несколько раз подряд, watchdog перезапускает Podkop.')
        );

        var failInput = E('input', {
            'type': 'number',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'fail_limit') || '3',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        var waitInput = E('input', {
            'type': 'number',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'restart_wait') || '20',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        var restartRow = E('div', {
            'class': 'podkop-two-column-row',
            'style': 'display:flex; gap:0; align-items:stretch; width:75%; margin:0 0 18px 0; border:1px solid #ddd;'
        }, [
            E('div', {
                'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5; border-right:1px solid #ddd;'
            }, [
                E('label', {
                    'style': 'display:block; font-weight:bold; margin-bottom:3px;'
                }, _('Ошибок подряд до перезапуска')),
                E('div', {
                    'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
                }, _('Сколько проверок подряд должны завершиться ошибкой. При значении 3 — перезапуск после трёх ошибок подряд.')),
                failInput
            ]),
            E('div', {
                'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5;'
            }, [
                E('label', {
                    'style': 'display:block; font-weight:bold; margin-bottom:3px;'
                }, _('Пауза после перезапуска, секунд')),
                E('div', {
                    'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
                }, _('Сколько секунд подождать после перезапуска Podkop, прежде чем продолжить проверки.')),
                waitInput
            ])
        ]);

        settings.appendChild(restartRow);

        addHeader(
            _('Лог'),
            _('Журнал ошибок watchdog и сообщений о перезапуске Podkop.')
        );

        var rotateInput = E('input', {
            'type': 'number',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'rotate_seconds') || '259200',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        var logInput = E('input', {
            'type': 'text',
            'class': 'cbi-input-text',
            'value': uci.get('podkop_watchdog', 'main', 'log') || '/root/podkop-watchdog.log',
            'style': 'display:block; width:100%; box-sizing:border-box; margin-top:5px;'
        });

        var logSettingsRow = E('div', {
            'class': 'podkop-two-column-row',
            'style': 'display:flex; gap:0; align-items:stretch; width:75%; margin:0 0 18px 0; border:1px solid #ddd;'
        }, [
            E('div', {
                'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5; border-right:1px solid #ddd;'
            }, [
                E('label', {
                    'style': 'display:block; font-weight:bold; margin-bottom:3px;'
                }, _('Очищать лог через, секунд')),
                E('div', {
                    'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
                }, _('259200 секунд = 3 дня. После этого старый лог очищается.')),
                rotateInput
            ]),
            E('div', {
                'style': 'flex:1 1 0; width:50%; min-width:0; padding:10px 12px; box-sizing:border-box; background:#f5f5f5;'
            }, [
                E('label', {
                    'style': 'display:block; font-weight:bold; margin-bottom:3px;'
                }, _('Файл лога')),
                E('div', {
                    'style': 'font-size:12px; opacity:.75; margin-bottom:5px;'
                }, _('Файл, куда watchdog записывает ошибки. Обычно: /root/podkop-watchdog.log.')),
                logInput
            ])
        ]);

        settings.appendChild(logSettingsRow);

        var saveButton = E('button', {
            'class': 'cbi-button cbi-button-action',
            'style': 'margin-top:8px;',
            'click': function() {
                uci.set('podkop_watchdog', 'main', 'enabled', enabledInput.checked ? '1' : '0');
                uci.set('podkop_watchdog', 'main', 'domain', domainInput.value);
                uci.set('podkop_watchdog', 'main', 'check_interval', intervalInput.value);
                uci.set('podkop_watchdog', 'main', 'fail_limit', failInput.value);
                uci.set('podkop_watchdog', 'main', 'restart_wait', waitInput.value);
                uci.set('podkop_watchdog', 'main', 'rotate_seconds', rotateInput.value);
                uci.set('podkop_watchdog', 'main', 'log', logInput.value);

                return uci.save().then(function() {
                    return uci.commit('podkop_watchdog');
                }).then(function() {
                    return callAction('restart');
                }).then(function() {
                    ui.addNotification(null, E('p', {}, _('Настройки сохранены и watchdog перезапущен.')), 'info');
                    return callStatus();
                }).catch(function(err) {
                    ui.addNotification(null, E('p', {}, _('Ошибка сохранения: ') + String(err)), 'error');
                });
            }
        }, _('Сохранить настройки'));

        settings.appendChild(E('div', {
            'style': 'margin-top:15px; padding-top:12px; border-top:1px solid #ddd;'
        }, [saveButton]));

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

        var root = E('div', { 'class': 'podkop-watchdog-page' }, [
            style,
            statusBox,
            buttons,
            logSection,
            settings
        ]);

        return root;
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
