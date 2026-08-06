// ─── Ogbenjuwa Citizen App — Alerts feed (alerts.html) ──────────────────

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  var TYPE_ICONS = { attack: '⚔️', fire: '🔥', medical: '🏥', abduction: '🚨', other: '⚠️' };
  var STATE = { allAlerts: [], selectedLga: null };

  function severityBadge(severity) {
    var cls = 'badge-gray';
    if (severity === 'critical') { cls = 'badge-red'; }
    else if (severity === 'high') { cls = 'badge-red'; }
    else if (severity === 'medium') { cls = 'badge-amber'; }
    else if (severity === 'low') { cls = 'badge-gray'; }
    return '<span class="badge ' + cls + '">' + UI.escapeHtml((severity || '').toUpperCase()) + '</span>';
  }

  function statusBadge(status) {
    if (status === 'active') return '<span class="badge badge-red badge-pulse">ACTIVE</span>';
    if (status === 'investigating') return '<span class="badge badge-amber">INVESTIGATING</span>';
    if (status === 'resolved') return '<span class="badge badge-green">RESOLVED</span>';
    if (status === 'false_alarm') return '<span class="badge badge-gray">FALSE ALARM</span>';
    return '<span class="badge badge-gray">' + UI.escapeHtml((status || '').toUpperCase()) + '</span>';
  }

  function alertCard(a) {
    var active = a.status === 'active' || a.status === 'investigating';
    return '<div class="citizen-alert-card ' + (active ? 'alert-active' : 'alert-resolved') + '">' +
      '<div class="alert-card-header">' +
        '<span class="alert-icon">' + (TYPE_ICONS[a.type] || '⚠️') + '</span>' +
        '<span class="alert-type">' + UI.escapeHtml(a.title || a.type) + '</span>' +
        severityBadge(a.severity) + statusBadge(a.status) +
      '</div>' +
      '<div class="alert-location">' + UI.escapeHtml(a.location || '') + '</div>' +
      '<div class="alert-time">' + UI.timeAgo(a.createdAt) + '</div>' +
      (a.description ? '<div class="alert-instruction">⚠️ ' + UI.escapeHtml(a.description) + '</div>' : '') +
      '<div class="alert-actions">' +
        '<a href="tel:+2348030000000" class="btn btn-danger btn-sm">📞 ' + UI.escapeHtml(i18n.t('call_emergency')) + '</a>' +
        '<a href="resources.html" class="btn btn-outline btn-sm">🗺️ ' + UI.escapeHtml(i18n.t('find_resources')) + '</a>' +
      '</div>' +
    '</div>';
  }

  function renderChips(lgas) {
    var el = document.getElementById('lga-chips');
    if (!el) return;
    var chips = [];
    chips.push('<button type="button" class="res-chip' + (STATE.selectedLga ? '' : ' active') + '" data-lga="">' +
      UI.escapeHtml(i18n.t('all')) + '</button>');
    lgas.forEach(function (lga) {
      chips.push('<button type="button" class="res-chip' + (STATE.selectedLga === lga.id ? ' active' : '') + '" data-lga="' +
        UI.escapeHtml(lga.id) + '">' + UI.escapeHtml(lga.name) + '</button>');
    });
    el.innerHTML = chips.join('');
    el.querySelectorAll('.res-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        STATE.selectedLga = chip.getAttribute('data-lga') || null;
        el.querySelectorAll('.res-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        renderBody();
      });
    });
  }

  function renderBody() {
    var body = document.getElementById('alerts-body');
    if (!body) return;

    var list = STATE.allAlerts.filter(function (a) {
      return !STATE.selectedLga || a.lgaId === STATE.selectedLga;
    });

    var active = list.filter(function (a) {
      return a.status === 'active' || a.status === 'investigating';
    }).sort(function (x, y) { return new Date(y.createdAt) - new Date(x.createdAt); });

    var dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    var recent = list.filter(function (a) {
      return a.status === 'resolved' || a.status === 'false_alarm' ||
        new Date(a.createdAt).getTime() > dayAgo;
    }).sort(function (x, y) { return new Date(y.createdAt) - new Date(x.createdAt); });

    var html = '';
    html += '<div class="section-title"><span>' + UI.escapeHtml(i18n.t('active')) + '</span></div>';
    html += active.length
      ? active.map(alertCard).join('')
      : '<div class="empty-state">' + UI.escapeHtml(i18n.t('no_data')) + '</div>';

    html += '<div class="section-title"><span>' + UI.escapeHtml(i18n.t('recent_alerts')) + '</span></div>';
    html += recent.length
      ? recent.map(alertCard).join('')
      : '<div class="empty-state">' + UI.escapeHtml(i18n.t('no_data')) + '</div>';

    body.innerHTML = html;
  }

  function refresh() {
    return Promise.all([
      api.get('/alerts?limit=50'),
      api.get('/lgas'),
    ]).then(function (results) {
      STATE.allAlerts = (results[0] && results[0].data) || [];
      renderChips((results[1] && results[1].data) || []);
      renderBody();
    }).catch(function () {
      var body = document.getElementById('alerts-body');
      if (body) body.innerHTML = '<div class="empty-state">' + UI.escapeHtml(i18n.t('no_data')) + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('alerts', {
      onAlert: function (alert) {
        UI.toast((alert.title || 'New alert') + ' — ' + (alert.location || ''), 'warning');
        // Prepend the new alert without a full refetch
        if (alert && alert.id && !STATE.allAlerts.some(function (a) { return a.id === alert.id; })) {
          STATE.allAlerts.unshift(alert);
        }
        renderBody();
      },
    });
    refresh();
  });
})();