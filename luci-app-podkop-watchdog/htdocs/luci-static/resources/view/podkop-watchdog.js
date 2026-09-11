'use strict';
'require view';
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

var callClearLog = rpc.declare({
    object: 'podkop-watchdog',
    method: 'action',
    params: [ 'action' ],
    expect: {}
});

var callNetworkDump = rpc.declare({
    object: 'network.interface',
    method: 'dump',
    expect: {}
});

return view.extend({
    load: function() {
        return Promise.all([
            uci.load('podkop_watchdog'),
            callStatus(),
            callNetworkDump()
        ]);
    },

    render: function(data) {
        var status = data[1] || {};
        var network = data[2] || {};
        var interfaces = network.interface || [];

        var style = E('style', {}, [
            '.podkop-watchdog-page .cbi-value-title{display:block!important;float:none!important;width:auto!important;font-weight:700!important;margin:10px 0 4px 0!important;}',
            '.podkop-watchdog-page .cbi-value-field{display:block!important;float:none!important;width:auto!important;}',
            '.podkop-watchdog-page .cbi-value-description{display:block!important;margin:3px 0 8px 0!important;opacity:.8;}',
            '.podkop-watchdog-page .cbi-value{display:block!important;padding:4px 0 10px 0!important;}',
            '.podkop-watchdog-page input[type="text"],.podkop-watchdog-page input[type="number"],.podkop-watchdog-page select{max-width:240px!important;}',
            '.podkop-watchdog-page input[type="checkbox"]{width:16px!important;height:16px!important;max-width:16px!important;min-width:16px!important;display:inline-block!important;margin:0 8px 0 0!important;padding:0!important;}',
            '.podkop-watchdog-page label{background:transparent!important;}',
            '.podkop-watchdog-page .podkop-two-column-row{width:75%!important;}',
            '.podkop-watchdog-page .podkop-log-row{width:55%!important;}',
            '.podkop-watchdog-page #podkop-watchdog-log{color:#e6e6e6!important;background:#111!important;font-family:monospace!important;font-size:13px!important;line-height:1.45!important;border:1px solid #333!important;box-sizing:border-box!important;}',
            '.podkop-watchdog-page .podkop-log-refresh{height:auto;min-height:0;width:auto;min-width:0;margin-left:8px;padding:6px 12px;align-self:flex-start;white-space:nowrap;}',
            '@media(max-width:700px){.podkop-watchdog-page .podkop-log-row{width:100%!important;flex-direction:column!important}.podkop-watchdog-page .podkop-log-refresh{height:auto;min-height:0;margin:8px 0 0 0;width:auto;align-self:flex-start;}}',
            '@media(max-width:700px){.podkop-watchdog-page .podkop-two-column-row{flex-direction:column!important}.podkop-watchdog-page .podkop-two-column-row>div{width:100%!important;border-right:0!important;border-bottom:1px solid #ddd!important}}'
        ]);

        var statusBox = E('div', {'class':'cbi-section'}, [
            E('div', {
                'style':'display:flex;align-items:center;gap:10px;margin-bottom:12px;'
            }, [
E('span', {
                    'id':'podkop-watchdog-status',
                    'style':'font-weight:700;'
                }, [
                    E('span', {}, 'Статус Watchdog: '),
                    E('span', {
                        'id':'watchdog-status-state',
                        'style': status.running === true ? 'color:#2e7d32;' : 'color:#c62828;'
                    }, status.running === true ? 'Запущен' : 'Остановлен')
                ]),
                E('span', {
                    'id':'podkop-installed-status',
                    'style':'font-weight:700;margin-left:18px;'
                }, [
                    E('span', {}, 'Podkop: '),
                    E('span', {
                        'id':'podkop-status-state',
                        'style': status.podkop_installed !== true
                            ? 'color:#c62828;'
                            : (status.podkop_running === true ? 'color:#2e7d32;' : 'color:#f9a825;')
                    }, status.podkop_installed !== true
                        ? 'Не установлен'
                        : (status.podkop_running === true ? 'Установлен и работает.' : 'Установлен, но не работает.'))
                ])
            ])
        ]);

        var startButton, stopButton, restartButton;

        function updateControls(st) {
            st = st || {};
            var running = st.running === true && st.enabled !== false;
var statusEl = document.getElementById('podkop-watchdog-status');
            var podkopEl = document.getElementById('podkop-installed-status');

            if (podkopEl) {
                var podkopStateEl = document.getElementById('podkop-status-state');
                var podkopState = st.podkop_installed !== true
                    ? 'Не установлен'
                    : (st.podkop_running === true ? 'Установлен и работает.' : 'Установлен, но не работает.');
                var podkopStateColor = st.podkop_installed !== true
                    ? '#c62828'
                    : (st.podkop_running === true ? '#2e7d32' : '#f9a825');

                if (podkopStateEl) {
                    podkopStateEl.textContent = podkopState;
                    podkopStateEl.style = 'color:' + podkopStateColor + ';';
                }
            }

            if (statusEl) {
                var watchdogStateEl = document.getElementById('watchdog-status-state');
                if (watchdogStateEl) {
                    watchdogStateEl.textContent = st.running === true ? 'Запущен' : 'Остановлен';
                    watchdogStateEl.style = st.running === true ? 'color:#2e7d32;' : 'color:#c62828;';
                }
            }

            if (startButton)
                startButton.disabled = running;
            if (stopButton)
                stopButton.disabled = !running;
            if (restartButton)
                restartButton.disabled = !running;
        }

        function refreshStatus() {
            return callStatus().then(function(st) {
                updateControls(st);
                return st;
            });
        }

        startButton = E('button', {
            'type':'button',
            'class':'cbi-button cbi-button-positive',
            'click':ui.createHandlerFn(this,function() {
                return callAction('start').then(function(reply) {
                    if (reply && reply.ok === false)
                        throw new Error(reply.error || _('Не удалось запустить Watchdog'));
                    ui.addNotification(null,E('p',{},_('Watchdog запущен.')),'info');
                    return refreshStatus();
                });
            })
        }, _('Запустить'));

        stopButton = E('button', {
            'type':'button',
            'class':'cbi-button cbi-button-negative',
            'click':ui.createHandlerFn(this,function() {
                return callAction('stop').then(function(reply) {
                    if (reply && reply.ok === false)
                        throw new Error(reply.error || _('Не удалось остановить Watchdog'));
                    ui.addNotification(null,E('p',{},_('Watchdog остановлен.')),'info');
                    return refreshStatus();
                });
            })
        }, _('Остановить'));

        restartButton = E('button', {
            'type':'button',
            'class':'cbi-button cbi-button-action',
            'click':ui.createHandlerFn(this,function() {
                return callAction('restart').then(function(reply) {
                    if (reply && reply.ok === false)
                        throw new Error(reply.error || _('Не удалось перезапустить Watchdog'));
                    ui.addNotification(null,E('p',{},_('Watchdog перезапущен.')),'info');
                    return refreshStatus();
                });
            })
        }, _('Перезапустить'));

        var buttons = E('div', {
            'style':'display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px 0;padding:0;'
        }, [
            startButton,
            stopButton,
            restartButton,
            E('button', {
                'type':'button',
                'class':'cbi-button cbi-button-action',
                'click':ui.createHandlerFn(this,function() {
                    return callAction('reload_wan_podkop').then(function(reply) {
                        if (reply && reply.ok === false)
                            throw new Error(reply.error || _('Не удалось перегрузить WAN + Podkop'));
                        ui.addNotification(null,E('p',{},_('WAN + Podkop перегружены.')),'info');
                        return refreshStatus();
                    });
                })
            }, _('Перегрузить WAN + Podkop')),
            E('button', {
                'type':'button',
                'class':'cbi-button',
                'click':ui.createHandlerFn(this,function() {
                    return callAction('check').then(function(reply) {
                        if (reply && reply.ok)
                            ui.addNotification(null,E('p',{},_('Интернет доступен: домен отвечает.')),'info');
                        else
                            ui.addNotification(null,E('p',{},_('Интернет недоступен: домен не отвечает.')),'error');
                    });
                })
            }, _('Проверить'))
        ]);

        updateControls(status);

        var settings = E('div', {
            'class':'cbi-section',
            'style':'width:100%;max-width:none;'
        });

        function addHeader(title, description) {
            settings.appendChild(E('div', {
                'style':'margin-top:18px;margin-bottom:12px;padding-bottom:7px;border-bottom:1px solid #ddd;'
            }, [
                E('h3', {'style':'margin:0 0 4px 0;'}, title),
                E('div', {'style':'font-size:13px;opacity:.75;'}, description)
            ]));
        }

        function addField(option, title, description, type) {
            var value = uci.get('podkop_watchdog','main',option) || '';

            if (type === 'checkbox') {
                var checkbox = E('input', {
                    'type':'checkbox',
                    'style':'width:16px!important;height:16px!important;min-width:16px!important;max-width:16px!important;display:inline-block!important;margin:0 8px 0 0!important;padding:0!important;vertical-align:middle!important;'
                });
                checkbox.checked = value === '1';
                checkbox.dataset.option = option;

                var block = E('div', {
                    'style':'margin:0 0 16px 0;padding:0;background:transparent!important;border:0!important;box-shadow:none!important;'
                }, [
                    E('label', {
                        'style':'display:flex!important;align-items:center!important;width:auto!important;height:auto!important;background:transparent!important;border:0!important;padding:0!important;margin:0 0 5px 0!important;font-weight:700!important;cursor:pointer;'
                    }, [
                        checkbox,
                        E('span', {}, title)
                    ]),
                    E('div', {
                        'style':'font-size:12px;opacity:.75;margin:0;'
                    }, description)
                ]);
                settings.appendChild(block);
                return checkbox;
            }

            var input = E('input', {
                'type':type || 'text',
                'class':'cbi-input-text',
                'value':value,
                'style':'display:block;width:240px;max-width:100%;margin-top:5px;'
            });
            input.dataset.option = option;

            var block = E('div', {'style':'margin:0 0 15px 0;'}, [
                E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, title),
                E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, description),
                input
            ]);
            settings.appendChild(block);
            return input;
        }

        addHeader(
            _('Проверка интернета'),
            _('Watchdog регулярно проверяет доступ в интернет по HTTPS.')
        );

        var enabledInput = addField(
            'enabled',
            _('Включить Watchdog'),
            _('Если включено — watchdog запускается автоматически и контролирует соединение.'),
            'checkbox'
        );

        var checkRow = E('div', {
            'class':'podkop-two-column-row',
            'style':'display:flex;gap:0;align-items:stretch;width:75%;margin:0 0 18px 0;border:1px solid #ddd;'
        });

        var domainInput = E('input', {
            'type':'text','class':'cbi-input-text',
            'value':uci.get('podkop_watchdog','main','domain') || 'google.com',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        var intervalInput = E('input', {
            'type':'number','class':'cbi-input-text',
            'value':uci.get('podkop_watchdog','main','check_interval') || '30',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        checkRow.appendChild(E('div', {
            'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;border-right:1px solid #ddd;'
        }, [
            E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Домен для проверки')),
            E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Сайт, который watchdog проверяет по HTTPS. Например: google.com или ya.ru.')),
            domainInput
        ]));

        checkRow.appendChild(E('div', {
            'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;'
        }, [
            E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Интервал проверки, секунд')),
            E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Как часто выполнять проверку.')),
            intervalInput
        ]));

        settings.appendChild(checkRow);

        addHeader(
            _('Восстановление WAN'),
            _('При недоступности указанного домена можно автоматически переподнять WAN-интерфейс.')
        );

        var wanSelect = E('select', {
            'class':'cbi-input-select',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        var currentWan = uci.get('podkop_watchdog','main','wan_interface') || 'wan';
        var seen = {};

        function addWanOption(name, label) {
            if (!name || seen[name])
                return;
            seen[name] = true;
            wanSelect.appendChild(E('option', {
                'value':name,
                'selected':name === currentWan
            }, label || name));
        }

        addWanOption('wan', 'wan');

        interfaces.forEach(function(iface) {
            var name = iface && iface.interface;
            if (name)
                addWanOption(name, name);
        });

        if (seen[currentWan])
            wanSelect.value = currentWan;
        else if (seen['wan'])
            wanSelect.value = 'wan';

        var wanRow = E('div', {
            'class':'podkop-two-column-row',
            'style':'display:flex;gap:0;align-items:stretch;width:75%;margin:0 0 18px 0;border:1px solid #ddd;'
        });

        var restartWanInput = E('input', {
            'type':'checkbox',
            'style':'width:16px!important;height:16px!important;min-width:16px!important;max-width:16px!important;display:inline-block!important;margin:0 8px 0 0!important;padding:0!important;vertical-align:middle!important;'
        });
        restartWanInput.checked = (uci.get('podkop_watchdog','main','restart_wan') || '0') === '1';
        restartWanInput.dataset.option = 'restart_wan';

        wanRow.appendChild(E('div', {
            'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;border-right:1px solid #ddd;'
        }, [
            E('label', {
                'style':'display:flex!important;align-items:center!important;width:auto!important;height:auto!important;background:transparent!important;border:0!important;padding:0!important;margin:0 0 5px 0!important;font-weight:700!important;cursor:pointer;'
            }, [
                restartWanInput,
                E('span', {}, _('Перезапускать WAN при отсутствии интернета'))
            ]),
            E('div', {'style':'font-size:12px;opacity:.75;margin:0;'}, _('После заданного количества ошибок выполнить ifdown/ifup WAN, затем перезапустить Podkop.'))
        ]));

        wanRow.appendChild(E('div', {
            'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;'
        }, [
            E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('WAN интерфейс')),
            E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Логический интерфейс OpenWrt для переподнятия. По умолчанию: wan.')),
            wanSelect
        ]));

        settings.appendChild(wanRow);

        addHeader(
            _('Перезапуск Podkop'),
            _('Если интернет недоступен несколько раз подряд, watchdog перезапускает Podkop.')
        );

        var failInput = E('input', {
            'type':'number','class':'cbi-input-text',
            'value':uci.get('podkop_watchdog','main','fail_limit') || '3',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        var waitInput = E('input', {
            'type':'number','class':'cbi-input-text',
            'value':uci.get('podkop_watchdog','main','restart_wait') || '20',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        var restartRow = E('div', {
            'class':'podkop-two-column-row',
            'style':'display:flex;gap:0;align-items:stretch;width:75%;margin:0 0 18px 0;border:1px solid #ddd;'
        }, [
            E('div', {'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;border-right:1px solid #ddd;'}, [
                E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Ошибок подряд до перезапуска')),
                E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Сколько проверок подряд должны завершиться ошибкой.')),
                failInput
            ]),
            E('div', {'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;'}, [
                E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Пауза после перезапуска, секунд')),
                E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Сколько секунд ждать после перезапуска Podkop.')),
                waitInput
            ])
        ]);

        settings.appendChild(restartRow);

        addHeader(
            _('Лог'),
            _('Журнал ошибок watchdog и сообщений о перезапуске.')
        );

        var rotateSeconds = parseInt(uci.get('podkop_watchdog','main','rotate_seconds') || '259200', 10);
        if (!isFinite(rotateSeconds) || rotateSeconds <= 0)
            rotateSeconds = 259200;
        var rotateDays = rotateSeconds / 86400;
        var rotatePreset = [1,2,3,4,5].indexOf(rotateDays) >= 0 ? String(rotateDays) : 'custom';

        var rotateSelect = E('select', {
            'class':'cbi-input-select',
            'style':'display:inline-block;width:150px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        }, [
            E('option', {'value':'1'}, _('1 день')),
            E('option', {'value':'2'}, _('2 дня')),
            E('option', {'value':'3'}, _('3 дня')),
            E('option', {'value':'4'}, _('4 дня')),
            E('option', {'value':'5'}, _('5 дней')),
            E('option', {'value':'custom'}, _('Ввести вручную'))
        ]);
        rotateSelect.value = rotatePreset;

        var rotateCustom = E('input', {
            'type':'number','class':'cbi-input-text',
            'min':'1','step':'1',
            'value':Math.max(1, Math.round(rotateDays)),
            'style':'display:inline-block;width:90px;max-width:100%;box-sizing:border-box;margin:5px 0 0 6px;'
        });

        function updateRotateCustom() {
            rotateCustom.style.display = rotateSelect.value === 'custom' ? 'inline-block' : 'none';
        }
        rotateSelect.addEventListener('change', updateRotateCustom);
        updateRotateCustom();

        var logInput = E('input', {
            'type':'text','class':'cbi-input-text',
            'value':uci.get('podkop_watchdog','main','log') || '/root/podkop-watchdog.log',
            'style':'display:block;width:240px;max-width:100%;box-sizing:border-box;margin-top:5px;'
        });

        var logSettingsRow = E('div', {
            'class':'podkop-two-column-row',
            'style':'display:flex;gap:0;align-items:stretch;width:75%;margin:0 0 18px 0;border:1px solid #ddd;'
        }, [
            E('div', {'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;border-right:1px solid #ddd;'}, [
                E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Очищать лог через')),
                E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Выберите 1–5 дней или укажите количество дней вручную.')),
                E('div', {}, [rotateSelect, rotateCustom])
            ]),
            E('div', {'style':'flex:1 1 0;width:50%;min-width:0;padding:10px 12px;box-sizing:border-box;background:#f5f5f5;'}, [
                E('label', {'style':'display:block;font-weight:bold;margin-bottom:3px;'}, _('Файл лога')),
                E('div', {'style':'font-size:12px;opacity:.75;margin-bottom:5px;'}, _('Файл, куда watchdog записывает ошибки.')),
                logInput
            ])
        ]);

        settings.appendChild(logSettingsRow);

        var saveButton = E('button', {
            'class':'cbi-button cbi-button-action',
            'style':'margin-top:8px;',
            'click':function() {
                uci.set('podkop_watchdog','main','enabled',enabledInput.checked ? '1' : '0');
                uci.set('podkop_watchdog','main','domain',domainInput.value);
                uci.set('podkop_watchdog','main','check_interval',intervalInput.value);
                uci.set('podkop_watchdog','main','restart_wan',restartWanInput.checked ? '1' : '0');
                uci.set('podkop_watchdog','main','wan_interface',wanSelect.value);
                uci.set('podkop_watchdog','main','fail_limit',failInput.value);
                uci.set('podkop_watchdog','main','restart_wait',waitInput.value);
                var selectedDays = rotateSelect.value === 'custom'
                    ? parseInt(rotateCustom.value || '1', 10)
                    : parseInt(rotateSelect.value, 10);
                if (!isFinite(selectedDays) || selectedDays < 1)
                    selectedDays = 1;
                uci.set('podkop_watchdog','main','rotate_seconds',String(selectedDays * 86400));
                uci.set('podkop_watchdog','main','log',logInput.value);

                return uci.save().then(function() {
                    return callAction('commit');
                }).then(function() {
                    var enabledNow = uci.get('podkop_watchdog','main','enabled') === '1';
                    return callAction(enabledNow ? 'restart' : 'stop');
                }).then(function() {
                    ui.addNotification(null, E('p', {}, _('Настройки сохранены.')), 'info');
                    return refreshStatus();
                }).catch(function(err) {
                    ui.addNotification(null, E('p', {}, _('Ошибка сохранения: ') + String(err)), 'error');
                });
            }
        }, _('Сохранить настройки'));

        settings.appendChild(E('div', {'style':'margin-top:15px;padding-top:12px;border-top:1px solid #ddd;'}, [saveButton]));

        var logBox = E('pre', {
            'id':'podkop-watchdog-log',
            'style':'max-height:360px;overflow:auto;white-space:pre-wrap;background:#111;padding:12px;'
        }, _('Загрузка лога...'));

        var refreshLogButton = E('button', {
            'class':'cbi-button',
            'class':'cbi-button podkop-log-refresh',
            'click':ui.createHandlerFn(this,function() {
                logBox.textContent = _('Загрузка лога...');
                return callLog().then(function(reply) {
                    logBox.textContent = (reply && reply.text) ? reply.text : _('Лог пуст.');
                }).catch(function() {
                    logBox.textContent = _('Ошибка чтения лога.');
                });
            })
        }, _('Обновить лог'));

        var clearLogButton = E('button', {
            'class':'cbi-button podkop-log-refresh',
            'click':ui.createHandlerFn(this,function() {
                return callClearLog('clear_log').then(function(reply) {
                    if (reply && reply.ok === false)
                        throw new Error(reply.error || _('Не удалось очистить лог'));
                    logBox.textContent = _('Лог пуст.');
                    ui.addNotification(null, E('p', {}, _('Лог очищен.')), 'info');
                }).catch(function(err) {
                    ui.addNotification(null, E('p', {}, _('Ошибка очистки лога: ') + String(err)), 'error');
                });
            }),
            'id':'podkop-log-clear'
        }, _('Очистить лог'));

        var logRow = E('div', {
            'class':'podkop-log-row', 'style':'display:flex;align-items:flex-start;margin-top:8px;width:55%;'
        }, [
            E('div', {
                'style':'flex:1 1 auto; min-width:0;'
            }, [logBox]),
            refreshLogButton,
            clearLogButton
        ]);

        var logSection = E('div', {'class':'cbi-section'}, [
            E('h3', {}, _('Текущий лог')),
            E('p', {'class':'cbi-section-descr'}, _('Здесь отображаются последние записи watchdog. Нормальная работа без ошибок не записывается.')),
            logRow
        ]);

        var root = E('div', {'class':'podkop-watchdog-page'}, [
            style,
            statusBox,
            buttons,
            logSection,
            settings
        ]);

        return root;
    },

    handleSaveApply: function(ev) {
        return this.super('handleSaveApply', [ev]);
    },

    handleSave: function(ev) {
        return this.super('handleSave', [ev]);
    },

    handleReset: function(ev) {
        return this.super('handleReset', [ev]);
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
