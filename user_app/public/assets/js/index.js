// ─── Ogbenjuwa Citizen App — Home dashboard (index.html) ────────────────

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;

  var TYPE_ICONS = { attack: '⚔️', fire: '🔥', medical: '🏥', abduction: '🚨', other: '⚠️' };

  function alertIcon(type) { return TYPE_ICONS[type] || '⚠️'; }

  function severityBadge(severity) {
    var cls = 'badge-gray';
    var label = (severity || '').toUpperCase();
    if (severity === 'critical') { cls = 'badge-red'; }
    else if (severity === 'high') { cls = 'badge-red'; }
    else if (severity === 'medium') { cls = 'badge-amber'; }
    return '<span class="badge ' + cls + '">' + UI.escapeHtml(label) + '</span>';
  }

  function statusBadge(status) {
    if (status === 'active') return '<span class="badge badge-red badge-pulse">ACTIVE</span>';
    if (status === 'investigating') return '<span class="badge badge-amber">INVESTIGATING</span>';
    if (status === 'resolved') return '<span class="badge badge-green">RESOLVED</span>';
    return '<span class="badge badge-gray">' + UI.escapeHtml((status || '').toUpperCase()) + '</span>';
  }

  function renderAlerts(alerts) {
    var el = document.getElementById('recent-alerts');
    var active = (alerts || []).filter(function (a) {
      return a.status === 'active' || a.status === 'investigating';
    }).slice(0, 3);

    if (active.length === 0) {
      el.innerHTML = '<div class="empty-state">' + UI.escapeHtml(window.OGBENJUWA.i18n.t('no_alerts_msg')) + '</div>';
      return;
    }

    el.innerHTML = active.map(function (a) {
      return '<div class="citizen-alert-card alert-active">' +
        '<div class="alert-card-header">' +
          '<span class="alert-icon">' + alertIcon(a.type) + '</span>' +
          '<span class="alert-type">' + UI.escapeHtml(a.title || a.type) + '</span>' +
          severityBadge(a.severity) + statusBadge(a.status) +
        '</div>' +
        '<div class="alert-location">' + UI.escapeHtml(a.location || '') + '</div>' +
        '<div class="alert-time">' + UI.timeAgo(a.createdAt) + '</div>' +
        (a.description ? '<div class="alert-instruction">⚠️ ' + UI.escapeHtml(a.description) + '</div>' : '') +
      '</div>';
    }).join('');
  }

  function renderFeed(posts) {
    var el = document.getElementById('feed-preview');
    var list = (posts || []).slice(0, 2);

    if (list.length === 0) {
      el.innerHTML = '<div class="empty-state">' + UI.escapeHtml(window.OGBENJUWA.i18n.t('no_data')) + '</div>';
      return;
    }

    el.innerHTML = list.map(function (p) {
      var body = p.body || '';
      if (body.length > 140) body = body.slice(0, 137) + '…';
      return '<div class="post-card">' +
        '<div class="post-header">' +
          '<div class="post-author">' + UI.escapeHtml(p.creatorName || 'Ogbenjuwa') + '</div>' +
          '<div class="post-time">' + UI.timeAgo(p.createdAt) + '</div>' +
        '</div>' +
        '<div class="post-body">' + UI.escapeHtml(body) + '</div>' +
      '</div>';
    }).join('');
  }

  function refresh() {
    return Promise.all([
      api.get('/alerts?limit=10'),
      api.get('/communications/announcements/public'),
    ]).then(function (results) {
      var alerts = (results[0] && results[0].data) || [];
      var feed = (results[1] && results[1].data) || [];

      var safety = UI.safetyStatus(alerts);
      var card = document.getElementById('safety-card');
      card.className = 'safety-card safety-' + safety.level;
      document.getElementById('safety-level').textContent = safety.label;
      document.getElementById('safety-sub').textContent = safety.sub;
      card.classList.remove('hidden');

      renderAlerts(alerts);
      renderFeed(feed);
    }).catch(function () {
      var card = document.getElementById('safety-card');
      card.classList.remove('hidden');
      document.getElementById('safety-level').textContent = '—';
      document.getElementById('safety-sub').textContent = window.OGBENJUWA.i18n.t('offline');
      document.getElementById('recent-alerts').innerHTML =
        '<div class="empty-state">' + UI.escapeHtml(window.OGBENJUWA.i18n.t('no_data')) + '</div>';
      document.getElementById('feed-preview').innerHTML =
        '<div class="empty-state">' + UI.escapeHtml(window.OGBENJUWA.i18n.t('no_data')) + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('home', {
      onAlert: function (alert) {
        UI.toast((alert.title || 'New alert') + ' — ' + (alert.location || ''), 'warning');
        refresh();
      },
      onAnnouncement: function () { refresh(); },
    });
    refresh();
  });
})();
