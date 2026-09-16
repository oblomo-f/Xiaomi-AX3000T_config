'use strict';
'require view';
'require rpc';
'require ui';

var callCheck = rpc.declare({
    object: 'site-check',
    method: 'check',
    params: [ 'url', 'route' ],
    expect: {}
});

return view.extend({

    render: function() {

        var style = E('style', {}, [

            '.site-check-page .site-check-url-row{display:flex;gap:10px;align-items:center;max-width:900px;}',
            '.site-check-page .site-check-url{flex:1;min-width:250px;}',
            '.site-check-page .site-check-button{white-space:nowrap;}',

            '.site-check-page .site-check-route-option{',
            'display:flex;',
            'align-items:center;',
            'gap:6px;',
            'white-space:nowrap;',
            'cursor:pointer;',
            '}',

            '.site-check-page .site-check-result{',
            'margin-top:20px;',
            'padding:16px;',
            'border:1px solid #ccc;',
            'border-radius:4px;',
            'max-width:900px;',
            '}',

            '.site-check-page .site-check-title{',
            'font-size:18px;',
            'font-weight:700;',
            'margin-bottom:15px;',
            '}',

            '.site-check-page .site-check-success{',
            'color:#2e7d32;',
            'font-weight:700;',
            'font-size:18px;',
            '}',

            '.site-check-page .site-check-error{',
            'color:#c62828;',
            'font-weight:700;',
            'font-size:18px;',
            '}',

'.site-check-page .site-check-warning{',
'color:#ef6c00;',
'font-weight:700;',
'font-size:18px;',
'},',

            '.site-check-page .site-check-table{',
            'border-collapse:collapse;',
            'width:100%;',
            'margin-top:15px;',
            '}',

            '.site-check-page .site-check-table td{',
            'padding:7px 10px;',
            'border-bottom:1px solid #ddd;',
            '}',

            '.site-check-page .site-check-table td:first-child{',
            'font-weight:700;',
            'width:180px;',
            '}',

            '.site-check-page .site-check-ok{',
            'color:#2e7d32;',
            'font-weight:700;',
            '}',

            '.site-check-page .site-check-fail{',
            'color:#c62828;',
            'font-weight:700;',
            '}',

            '.site-check-page .site-check-na{',
            'color:#777;',
            '}',

            '.site-check-page .site-check-error-box{',
            'margin-top:15px;',
            'padding:10px;',
            'background:#f5f5f5;',
            'border:1px solid #ddd;',
            'font-family:monospace;',
            'white-space:pre-wrap;',
            'word-break:break-word;',
            '}',

            '.site-check-page .site-check-multi{',
            'max-width:900px;',
            'margin-top:25px;',
            '}',

            '.site-check-page .site-check-textarea{',
            'width:100%;',
            'min-height:150px;',
            'resize:vertical;',
            'font-family:monospace;',
            'box-sizing:border-box;',
            '}',

            '.site-check-page .multi-results{',
            'margin-top:15px;',
            '}',

            '.site-check-page .multi-table{',
            'width:100%;',
            'border-collapse:collapse;',
            '}',

            '.site-check-page .multi-table th,',
            '.site-check-page .multi-table td{',
            'padding:8px 10px;',
            'border-bottom:1px solid #ddd;',
            'text-align:left;',
            '}',

            '.site-check-page .multi-table th{',
            'font-weight:700;',
            '}',

            '.site-check-page .multi-ok{',
            'color:#2e7d32;',
            'font-weight:700;',
            '}',

            '.site-check-page .multi-fail{',
            'color:#c62828;',
            'font-weight:700;',
            '}',

            '.site-check-page .multi-running{',
            'color:#777;',
            '}',

            '@media(max-width:600px){',
            '.site-check-page .site-check-url-row{',
            'flex-direction:column;',
            'align-items:stretch;',
            '}',
            '.site-check-page .site-check-button{',
            'width:fit-content;',
            '}',
            '}'
        ]);

        /*
         * ОДИНОЧНАЯ ПРОВЕРКА
         */

        var input = E('input', {
            'type': 'text',
            'class': 'cbi-input site-check-url',
            'placeholder': 'https://www.youtube.com',
            'value': 'https://www.youtube.com'
        });

        var routeCheckbox = E('input', {
            'type': 'checkbox',
            'id': 'site-check-route'
        });

        var routeLabel = E('label', {
            'class': 'site-check-route-option',
            'for': 'site-check-route'
        }, [
            routeCheckbox,
            'Определить маршрут'
        ]);

        var result = E('div', {
            'class': 'site-check-result',
            'style': 'display:none;'
        });

        function stageText(value) {

            if (value === 'ok')
                return E('span', {
                    'class': 'site-check-ok'
                }, '✓ OK');

            if (value === 'error')
                return E('span', {
                    'class': 'site-check-fail'
                }, '✗ ОШИБКА');

            return E('span', {
                'class': 'site-check-na'
            }, '— Не проверялся');
        }

        function showResult(data) {

            result.style.display = '';
            result.innerHTML = '';

            if (!data) {
                result.appendChild(E('div', {
                    'class': 'site-check-error'
                }, '✗ Нет ответа от сервера'));
                return;
            }

            if (data.ok !== true) {

                result.appendChild(E('div', {
                    'class': 'site-check-error'
                }, '✗ ОШИБКА ПРОВЕРКИ'));

                if (data.error) {
                    result.appendChild(E('div', {
                        'class': 'site-check-error-box'
                    }, data.error));
                }

                return;
            }


var available = data.available === true;
var httpCode = parseInt(data.http_code, 10) || 0;

var statusClass;
var statusText;

if (!available) {
    statusClass = 'site-check-error';
    statusText = '✗ САЙТ НЕДОСТУПЕН';
} else if (httpCode >= 400 && httpCode <= 599) {
    statusClass = 'site-check-warning';
    statusText = '⚠ САЙТ ДОСТУПЕН — HTTP ' + httpCode;
} else {
    statusClass = 'site-check-success';
    statusText = '✓ САЙТ ДОСТУПЕН';
}

result.appendChild(E('div', {
    'class': statusClass
}, statusText));

            var table = E('table', {
                'class': 'site-check-table'
            });

            table.appendChild(E('tr', {}, [
                E('td', {}, 'DNS'),
                E('td', {}, stageText(data.dns))
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'TCP'),
                E('td', {}, stageText(data.tcp))
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'TLS'),
                E('td', {}, stageText(data.tls))
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'HTTP'),
                E('td', {}, data.http === 'ok'
                    ? E('span', {
                        'class': 'site-check-ok'
                    }, '✓ ' + (data.http_code || 'OK'))
                    : stageText(data.http))
            ]));

table.appendChild(E('tr', {}, [
    E('td', {}, 'Содержимое'),
    E('td', {}, data.content_ok === true
        ? E('span', {
            'class': 'site-check-ok'
        }, '✓ Получено')
        : E('span', {
            'class': 'site-check-fail'
        }, '✗ Не получено')
    )
]));

            if (data.route && data.route !== 'not_checked') {

                var routeText = data.route;

                if (routeText === 'zapret')
                    routeText = 'Zapret';
                else if (routeText === 'podkop')
                    routeText = 'Podkop';
                else if (routeText === 'podkop+zapret')
                    routeText = 'Podkop + Zapret';
                else if (routeText === 'direct')
                    routeText = 'Напрямую';
                else
                    routeText = 'Не определён';

                var routeClass = data.route === 'direct' || data.route === 'unknown'
                    ? 'site-check-na'
                    : 'site-check-ok';

                table.appendChild(E('tr', {}, [
                    E('td', {}, 'Маршрут через'),
                    E('td', {}, E('span', {
                        'class': routeClass
                    }, routeText))
                ]));
            }

            table.appendChild(E('tr', {}, [
                E('td', {}, 'IP-адрес'),
                E('td', {}, data.ip || '—')
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'Время ответа'),
                E('td', {}, data.time
                    ? data.time + ' сек.'
                    : '—')
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'Получено'),
                E('td', {}, data.size
                    ? data.size + ' байт'
                    : '—')
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'Тип содержимого'),
                E('td', {}, data.content_type || '—')
            ]));

            table.appendChild(E('tr', {}, [
                E('td', {}, 'Итоговый URL'),
                E('td', {}, data.url || '—')
            ]));

            result.appendChild(table);

            if (data.error) {

                result.appendChild(E('div', {
                    'style': 'margin-top:15px;font-weight:700;'
                }, 'Ошибка:'));

                result.appendChild(E('div', {
                    'class': 'site-check-error-box'
                }, data.error));
            }
        }

        var checkButton = E('button', {
            'type': 'button',
            'class': 'cbi-button cbi-button-action site-check-button'
        }, 'ПРОВЕРИТЬ');

        checkButton.addEventListener('click', function() {

            var url = input.value.trim();

            if (!url) {
                ui.addNotification(
                    null,
                    E('p', {}, 'Введите адрес сайта.'),
                    'error'
                );
                input.focus();
                return;
            }

            checkButton.disabled = true;
            checkButton.textContent = 'ПРОВЕРКА...';
            result.style.display = 'none';

            callCheck(url, routeCheckbox.checked).then(function(data) {

                showResult(data);

            }).catch(function(error) {


                showResult({
                    ok: false,
                    error: error.message || 'Ошибка RPC'
                });

            }).finally(function() {
                checkButton.disabled = false;
                checkButton.textContent = 'ПРОВЕРИТЬ';

            });
        });

        input.addEventListener('keydown', function(ev) {
            if (ev.key === 'Enter')
                checkButton.click();
        });

        /*
         * ПРОВЕРКА НЕСКОЛЬКИХ САЙТОВ
         */

var multiInput = E('textarea', {
    'class': 'cbi-input site-check-textarea',
    'placeholder':
        'https://www.youtube.com\n' +
        'https://google.com\n' +
        'https://github.com'
});

        var internalSites = [
            "https://www.youtube.com",
            "https://google.com",
            "https://github.com"
        ];

        var internalSitesCheckbox = E("input", {
            "type": "checkbox",
            "id": "site-check-internal-sites",
            "style": "margin-right: 6px;"
        });

        var internalSitesLabel = E("label", {
            "for": "site-check-internal-sites",
            "style": "display: block; margin-top: 8px; cursor: pointer;"
        }, [
            internalSitesCheckbox,
            "Использовать внутренние сайты"
        ]);

        internalSitesCheckbox.addEventListener("change", function() {
            var current = multiInput.value
                .split(/\r?\n/)
                .map(function(url) {
                    return url.trim();
                })
                .filter(function(url) {
                    return url.length > 0;
                });

            if (internalSitesCheckbox.checked) {
                internalSites.forEach(function(url) {
                    if (current.indexOf(url) === -1)
                        current.push(url);
                });
            } else {
                current = current.filter(function(url) {
                    return internalSites.indexOf(url) === -1;
                });
            }

            multiInput.value = current.join("\n");
        });

        var multiResults = E('div', {
            'class': 'multi-results'
        });

        var multiButton = E('button', {
            'type': 'button',
            'class': 'cbi-button cbi-button-action'
        }, 'ПРОВЕРИТЬ ВСЕ');

        function getStage(data) {

            if (!data)
                return 'Ошибка';

            if (data.available === true)
                return 'OK';

            return data.stage || 'Ошибка';
        }

        function addMultiResult(tableBody, url, data) {

            var available = data &&
                data.ok === true &&
                data.available === true;

            var stage = getStage(data);

            var resultText;

            if (available) {
                resultText = E('span', {
                    'class': 'multi-ok'
                }, '✓ ДОСТУПЕН');
            } else {
                resultText = E('span', {
                    'class': 'multi-fail'
                }, '✗ ' + (
                    stage === 'DNS' ? 'DNS' :
                    stage === 'TCP' ? 'TCP' :
                    stage === 'TLS' ? 'TLS' :
                    stage === 'HTTP' ? 'HTTP' :
                    'НЕДОСТУПЕН'
                ));
            }

            var code = data && data.http_code
                ? data.http_code
                : '—';

            var time = data && data.time
                ? data.time + ' сек.'
                : '—';

            tableBody.appendChild(E('tr', {}, [
                E('td', {}, url),
                E('td', {}, resultText),
                E('td', {}, String(code)),
                E('td', {}, time)
            ]));
        }

        multiButton.addEventListener('click', function() {

            var urls = multiInput.value
                .split(/\r?\n/)
                .map(function(url) {
                    return url.trim();
                })
                .filter(function(url) {
                    return url.length > 0;
                });

            if (!urls.length) {

                ui.addNotification(
                    null,
                    E('p', {}, 'Введите хотя бы один URL.'),
                    'error'
                );

                multiInput.focus();
                return;
            }

            /*
             * Убираем дубликаты.
             */
            urls = urls.filter(function(url, index) {
                return urls.indexOf(url) === index;
            });

            multiButton.disabled = true;
            multiButton.textContent = 'ПРОВЕРКА...';

            multiResults.innerHTML = '';

            var table = E('table', {
                'class': 'multi-table'
            });

            var thead = E('thead', {}, [
                E('tr', {}, [
                    E('th', {}, 'Сайт'),
                    E('th', {}, 'Результат'),
                    E('th', {}, 'HTTP'),
                    E('th', {}, 'Время')
                ])
            ]);

            var tbody = E('tbody');

            table.appendChild(thead);
            table.appendChild(tbody);
            multiResults.appendChild(table);

            /*
             * Проверяем последовательно.
             * Так мы не создаём сразу много параллельных
             * соединений с роутера.
             */

            var chain = Promise.resolve();

            urls.forEach(function(url) {

                chain = chain.then(function() {

                    /*
                     * Временная строка.
                     */
                    var row = E('tr', {}, [
                        E('td', {}, url),
                        E('td', {
                            'class': 'multi-running'
                        }, 'Проверка...'),
                        E('td', {}, '—'),
                        E('td', {}, '—')
                    ]);

                    tbody.appendChild(row);

                    return callCheck(url).then(function(data) {

                        var available = data &&
                            data.ok === true &&
                            data.available === true;

                        var stage = getStage(data);

                        var resultCell = E('td');

                        if (available) {

                            resultCell.appendChild(E('span', {
                                'class': 'multi-ok'
                            }, '✓ ДОСТУПЕН'));

                        } else {

                            resultCell.appendChild(E('span', {
                                'class': 'multi-fail'
                            }, '✗ ' + (
                                stage === 'DNS' ? 'DNS' :
                                stage === 'TCP' ? 'TCP' :
                                stage === 'TLS' ? 'TLS' :
                                stage === 'HTTP' ? 'HTTP' :
                                'НЕДОСТУПЕН'
                            )));
                        }

                        var cells = row.children;

                        cells[1].replaceWith(resultCell);

                        cells[2].textContent =
                            data && data.http_code
                                ? String(data.http_code)
                                : '—';

                        cells[3].textContent =
                            data && data.time
                                ? data.time + ' сек.'
                                : '—';

                    }).catch(function(error) {

                        row.children[1].replaceWith(E('td', {}, [
                            E('span', {
                                'class': 'multi-fail'
                            }, '✗ ОШИБКА')
                        ]));

                        row.children[2].textContent = '—';
                        row.children[3].textContent = '—';

                    });
                });
            });

            chain.finally(function() {

                multiButton.disabled = false;
                multiButton.textContent = 'ПРОВЕРИТЬ ВСЕ';

            });
        });

        /*
         * СТРАНИЦА
         */

        return E('div', {
            'class': 'site-check-page'
        }, [

            style,

            E('h2', {
                'style': 'margin-bottom:20px;'
            }, 'Проверка сайтов'),

            /*
             * Одиночная проверка
             */

            E('div', {
                'class': 'cbi-section'
            }, [

E('div', {
    'class': 'site-check-title'
}, 'Проверка доступности сайта'),

E('div', {
    'class': 'site-check-url-row'
}, [
    input,
    routeLabel,
    checkButton
]),

E('div', {
    'style': 'margin-top:8px;opacity:.75;'
}, 'Введите любой адрес сайта с http:// или https://.')



            ]),

            result,

            /*
             * Проверка нескольких сайтов
             */

            E('div', {
                'class': 'cbi-section site-check-multi'
            }, [

                E('div', {
                    'class': 'site-check-title'
                }, 'Проверка нескольких сайтов'),

                E('div', {
                    'style': 'margin-bottom:8px;opacity:.75;'
                }, 'Введите по одному URL в каждой строке.'),

                multiInput,

                internalSitesLabel,

                E('div', {
                    'style': 'margin-top:10px;'
                }, [
                    multiButton
                ]),

                multiResults
            ])
        ]);
    }
});
