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
var callStart = rpc.declare({
    object: 'site-check',
    method: 'start',
    params: [ 'url', 'route' ],
    expect: {}
});
var callStatus = rpc.declare({
    object: 'site-check',
    method: 'status',
    params: [ 'id' ],
    expect: {}
});
var callSystemInfo = rpc.declare({
    object: 'site-check',
    method: 'system_info',
    params: [],
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

            '.site-check-page .site-check-top{',
            'display:flex;',
            'gap:10px;',
            'align-items:stretch;',
            'max-width:900px;',
            'margin-top:20px;',
            '}',
            '.site-check-page .site-check-top .site-check-result{',
            'margin-top:0;',
            'flex:1 1 auto;',
            'min-width:0;',
            'max-width:none;',
            '}',
            '.site-check-page .site-check-system-info{',
            'flex:0 0 390px;',
            'padding:16px;',
            'border:1px solid #ccc;',
            'border-radius:4px;',
            'box-sizing:border-box;',
            '}',
            '.site-check-page .site-check-system-title{',
            'font-size:16px;',
            'font-weight:700;',
            'margin-bottom:10px;',
            '}',
            '.site-check-page .site-check-system-table{',
            'border-collapse:collapse;',
            'width:100%;',
            '}',
            '.site-check-page .site-check-system-table td{',
            'padding:6px 4px;',
            'border-bottom:1px solid #ddd;',
            'vertical-align:top;',
            '}',
            '.site-check-page .site-check-system-table td:first-child{',
            'font-weight:700;',
            'width:110px;',
            '}',

            '.site-check-page .site-check-title{',
            'font-size:18px;',
            'font-weight:700;',
            'margin-bottom:15px;',
            '}',

            '.site-check-page .site-check-success{',
            'color:#2e7d32;',
            'font-weight:700;',
            'font-size:14px;',
            '}',

            '.site-check-page .site-check-status{',
            'height:22px;',
            'line-height:22px;',
            'margin:0;',
            'visibility:hidden;',
            '}',
            '.site-check-page .site-check-status-cell{',
            'height:36px;',
            'padding:0 10px;',
            'border-bottom:1px solid #ddd;',
            'vertical-align:middle;',
            'white-space:nowrap;',
            'width:100%;',
            '}',

            '.site-check-page .site-check-error{',
            'color:#c62828;',
            'font-weight:700;',
            'font-size:14px;',
            '}',
'.site-check-page .site-check-warning{',
'color:#ef6c00;',
'font-weight:700;',
'font-size:14px;',
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

            '@media(max-width:800px){',
            '.site-check-page .site-check-top{',
            'flex-direction:column;',
            '}',
            '.site-check-page .site-check-system-info{',
            'flex-basis:auto;',
            'width:100%;',
            '}',
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
            'style': 'display:block;'
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
        }, 'Получено')
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

        var systemInfo = E('div', {
            'class': 'site-check-system-info'
        });

        function renderSystemInfo(data) {
            systemInfo.innerHTML = '';

            systemInfo.appendChild(E('div', {
                'class': 'site-check-system-title'
            }, 'Системная информация'));

            var table = E('table', {
                'class': 'site-check-system-table'
            });

            var packages = data && data.packages || {};

 
function addRow(label, value) {
                table.appendChild(E('tr', {}, [
                    E('td', {}, label),
                    E('td', {}, value || 'Не установлен')
                ]));
            }

            addRow('Podkop', packages.podkop);
            addRow('Zapret', packages.zapret);
            addRow('Zapret2', packages.zapret2);
            addRow('ZeroBlock', packages.zeroblock);
            addRow('Устройство', data && data.model);
            addRow('ОС', data && data.os);

            systemInfo.appendChild(table);
        }

        renderSystemInfo({ packages: {} });
        callSystemInfo().then(function(data) {
            renderSystemInfo(data || {});
        }).catch(function() {
            renderSystemInfo({ packages: {} });
        });

        var checkButton = E('button', {
            'type': 'button',
            'class': 'cbi-button cbi-button-action site-check-button'
        }, 'ПРОВЕРИТЬ');

        var stageStatus = {};
        var resultStatus = E('div', {
            'class': 'site-check-status site-check-success',
            'style': 'display:block;visibility:hidden;'
        });

        var stageCells = {};
        var routeCell;
        var contentCell;
        var podkopSectionCell;
        var podkopCommunityCell;
        var dataCells = {};
        var resultTable;
        var routeDetected = false;
        var finalDetailsQueued = false;
        var routeCheckEnabled = false;

        function setStageCell(cell, value) {
            cell.innerHTML = '';

            if (value === 'ok') {
                cell.appendChild(E('span', {
                    'class': 'site-check-ok'
                }, '✓ OK'));
            } else if (value === 'error') {
                cell.appendChild(E('span', {
                    'class': 'site-check-fail'
                }, '✗ ОШИБКА'));
            }
        }

        function resetResultTable() {
            resultStatus.style.display = 'block';
            resultStatus.style.visibility = 'hidden';
            resultStatus.textContent = '';

            [ 'dns', 'tcp', 'tls', 'http' ].forEach(function(key) {
                setStageCell(stageCells[key], '');
            });

routeCell.textContent = '';
podkopSectionCell.textContent = '';

if (podkopCommunityCell) {
    podkopCommunityCell.textContent = '';
    podkopCommunityCell.style.color = '';
    podkopCommunityCell.style.fontWeight = '';
    podkopCommunityCell.parentNode.style.display = 'none';
}

contentCell.textContent = '';

            dataCells.ip.textContent = '';
            routeDetected = false;
            finalDetailsQueued = false;
            dataCells.time.textContent = '';
            dataCells.size.textContent = '';
            dataCells.content_type.textContent = '';
            dataCells.url.textContent = '';
        }

        function renderStageResult(data) {
            if (!data)
                data = {};

            [ 'dns', 'tcp', 'tls', 'http' ].forEach(function(key) {
                if (data[key] === 'ok' || data[key] === 'error')
                    setStageCell(stageCells[key], data[key]);
            });

            /*
             * Route is a separate stage after HTTP.
             * It is shown once and never blocks the final data stage.
             */
            if (data.http === 'ok' && !routeDetected) {

var routeText = data.route;
                var podkopSectionText = data.podkop_section;

                if (!routeCheckEnabled) {
                    routeText = 'Не определялся';
                } else if (routeText === 'zapret') {
                    routeText = 'Zapret';
                } else if (routeText === 'podkop') {
                    routeText = 'Podkop';
                } else if (routeText === 'podkop+zapret') {
                    routeText = 'Podkop + Zapret';
                } else if (routeText === 'direct') {
                    routeText = 'Напрямую';
                } else if (!routeText || routeText === 'not_checked') {
                    /* Wait for the final route value when route detection is enabled. */
                    if (routeCheckEnabled && data.final !== true)
                        routeText = null;
                    else
                        routeText = 'Не определён';
                } else {
                    routeText = 'Не определён';
                }

                if (routeText !== null) {
                    routeDetected = true;
                    routeCell.innerHTML = '';
                    routeCell.appendChild(E('span', {
                        'class': routeText === 'Не определялся' ? '' : 'site-check-ok'
                    }, routeText));
                }

if (data.route === 'podkop' || data.route === 'podkop+zapret') {
    var podkopSection = data.podkop_section || '';

    podkopSectionCell.textContent = podkopSection || 'Не определена';

    if (podkopSection && podkopSection !== 'not_checked') {
        podkopSectionCell.style.color = '#1976D2';
        podkopSectionCell.style.fontWeight = 'bold';
    } else {
        podkopSectionCell.style.color = '';
        podkopSectionCell.style.fontWeight = '';
    }

if (podkopCommunityCell) {
    podkopCommunityCell.textContent = '';

    if (data.podkop_community &&
        data.podkop_community !== 'not_checked' &&
        data.podkop_community !== 'unknown') {

        podkopCommunityCell.textContent =
            data.podkop_community.charAt(0).toUpperCase() +
            data.podkop_community.slice(1);
            podkopCommunityCell.style.color = '#1976D2';
            podkopCommunityCell.style.fontWeight = 'bold';

        podkopCommunityCell.parentNode.style.display = '';
    } else {
        podkopCommunityCell.style.fontWeight = '';
        podkopCommunityCell.parentNode.style.display = 'none';
    }
}

    }
} else {
    podkopSectionCell.textContent = '—';
    podkopSectionCell.style.color = '';
    podkopSectionCell.style.fontWeight = '';

    if (podkopCommunityCell) {
        podkopCommunityCell.textContent = '';
        podkopCommunityCell.style.color = '';
        podkopCommunityCell.style.fontWeight = '';
        podkopCommunityCell.parentNode.style.display = 'none';
    }
}
            /*
             * Final response data is independent from route rendering.
             * This fixes the case where route was rendered on the HTTP poll
             * and later final=true could no longer render content/data.
             */
if (data.final === true) {
    window.setTimeout(function() {
        if (data.content_ok === true) {
            contentCell.innerHTML = '';
            contentCell.appendChild(E('span', {
                'class': 'site-check-ok'
            }, 'Получено'));
        } else if (data.content_ok === false) {
            contentCell.innerHTML = '';
            contentCell.appendChild(E('span', {
                'class': 'site-check-fail'
            }, '✗ Не получено'));
        }
                    window.setTimeout(function() {
                        if (data.ip)
                            dataCells.ip.textContent = data.ip;
                        if (data.time)
                            dataCells.time.textContent = data.time + ' сек.';
                        if (data.size)
                            dataCells.size.textContent = data.size + ' байт';
                        if (data.content_type)
                            dataCells.content_type.textContent = data.content_type;
                        if (data.url)
                            dataCells.url.textContent = data.url;

                        /*
                         * The status is the first, separate table cell,
                         * but it appears only after the final URL has been
                         * rendered. This keeps the visual sequence stable.
                         */
                        var statusClass;
                        var statusText;

                        if (data.ok === false || data.state === 'error') {
                            statusClass = 'site-check-error';
                            statusText = '✗ ОШИБКА ПРОВЕРКИ';
                        } else if (data.available !== true) {
                            statusClass = 'site-check-error';
                            statusText = '✗ САЙТ НЕДОСТУПЕН';
                        } else {
                            var httpCode = parseInt(data.http_code, 10) || 0;
                            if (httpCode >= 400 && httpCode <= 599) {
                                statusClass = 'site-check-warning';
                                statusText = '⚠ САЙТ ДОСТУПЕН — HTTP ' + httpCode;
                            } else {
                                statusClass = 'site-check-success';
                                statusText = '✓ САЙТ ДОСТУПЕН';
                            }
                        }

                        resultStatus.className = statusClass;
                        resultStatus.textContent = statusText;
                        resultStatus.style.display = 'block';
                        resultStatus.style.visibility = 'visible';
                    }, 180);
                }, 180);
            }

            if (data.content_ok === true && data.http !== 'ok') {
                contentCell.innerHTML = '';
                contentCell.appendChild(E('span', {
                    'class': 'site-check-ok'
                }, 'Получено'));
            }
        }

        function renderEmptyResult() {
            result.innerHTML = '';

            resultStatus.style.display = 'block';
            resultStatus.style.visibility = 'hidden';

            resultTable = E('table', {
                'class': 'site-check-table'
            });

            var statusCell = E('td', {
                'class': 'site-check-status-cell',
                'colspan': '2'
            });
            statusCell.appendChild(resultStatus);
            resultTable.appendChild(E('tr', {}, [ statusCell ]));

            function addRow(key, label) {
                var valueCell = E('td', {});
                resultTable.appendChild(E('tr', {}, [
                    E('td', {}, label),
                    valueCell
                ]));
                return valueCell;
            }

            stageCells.dns = addRow('dns', 'DNS');
            stageCells.tcp = addRow('tcp', 'TCP');
            stageCells.tls = addRow('tls', 'TLS');
            stageCells.http = addRow('http', 'HTTP');
            routeCell = addRow('route', 'Маршрут через');
            podkopSectionCell = addRow('podkop_section', 'Секция Podkop');

podkopCommunityCell = addRow('podkop_community', 'Списки сообщества');
podkopCommunityCell.parentNode.style.display = 'none';

            contentCell = addRow('content', 'Содержимое');
            dataCells.ip = addRow('ip', 'IP-адрес');
            dataCells.time = addRow('time', 'Время ответа');
            dataCells.size = addRow('size', 'Получено');
            dataCells.content_type = addRow('content_type', 'Тип содержимого');
            dataCells.url = addRow('url', 'Итоговый URL');

            result.appendChild(resultTable);
            resetResultTable();
        }

        function pollStageCheck(id) {
            callStatus(id).then(function(data) {
                renderStageResult(data);

                if (data.state === 'running') {
                    window.setTimeout(function() {
                        pollStageCheck(id);
                    }, 250);
                    return;
                }

                checkButton.disabled = false;
                checkButton.textContent = 'ПРОВЕРИТЬ';

            }).catch(function(error) {
                renderStageResult({
                    state: 'error',
                    error: error.message || 'Ошибка RPC'
                });

                checkButton.disabled = false;
                checkButton.textContent = 'ПРОВЕРИТЬ';
            });
        }

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
            result.style.display = '';
            resetResultTable();
            routeCheckEnabled = routeCheckbox.checked;

            callStart(url, routeCheckEnabled).then(function(data) {

                if (!data || !data.id) {
                    throw new Error('Не удалось запустить проверку');
                }

                pollStageCheck(data.id);

            }).catch(function(error) {

                renderStageResult({
                    state: 'error',
                    error: error.message || 'Ошибка RPC'
                });

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

                    return callCheck(url, false).then(function(data) {

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
         * Сразу создаём пустую таблицу одиночной проверки.
         * Она существует уже при загрузке страницы и больше не пересоздаётся.
         */
        renderEmptyResult();

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

            E('div', {
                'class': 'site-check-top'
            }, [
                result,
                systemInfo
            ]),

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
