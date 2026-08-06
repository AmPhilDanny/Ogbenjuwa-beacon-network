// ─── Ogbenjuwa Citizen App — Community feed (feed.html) ──────────────────
// Announcements: GET /communications/announcements/public (open). Ack via
// POST /feed/acknowledge { resourceType: 'announcement', resourceId } —
// best-effort, never blocks rendering.

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  function t(key) { return i18n.t(key); }

  function normalizeList(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.posts)) return res.posts;
    if (res && Array.isArray(res.announcements)) return res.announcements;
    return [];
  }

  function timeAgo(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function render(list) {
    var wrap = document.getElementById('feed-list');
    if (!list.length) {
      wrap.innerHTML = '<div class="card center muted">' + t('no_posts') + '</div>';
      return;
    }

    wrap.innerHTML = list.map(function (p) {
      var title = UI.escapeHtml(p.title || p.subject || 'Announcement');
      var body = UI.escapeHtml(p.message || p.content || p.body || '');
      var meta = [
        p.authorName ? UI.escapeHtml(p.authorName) : 'LGA Admin',
        timeAgo(p.createdAt || p.timestamp || p.date),
      ].filter(Boolean).join(' · ');

      var acked = !!(p.acknowledged || p.ackedByMe);
      var session = window.OGBENJUWA.Session.getSession();
      var ackBtn = '';
      if (!acked) {
        ackBtn = '<button type="button" class="btn btn-outline btn-sm ack-btn" data-id="' + UI.escapeHtml(p.id || '') + '" data-i18n="acknowledge">Acknowledge</button>';
      } else {
        ackBtn = '<button type="button" class="btn btn-sm" disabled data-i18n="acknowledged">✔ Acknowledged</button>';
      }

      return '<div class="card feed-post">' +
        '<div class="resource-head"><div>' +
        '<div class="resource-name">' + title + '</div>' +
        '<div class="small muted">' + meta + '</div>' +
        '</div>' + ackBtn + '</div>' +
        (body ? '<div class="small mt-8">' + body + '</div>' : '') +
        '</div>';
    }).join('');

    wrap.querySelectorAll('.ack-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        if (!id) return;
        if (!window.OGBENJUWA.Session.getSession()) {
          UI.toast(t('ack_requires_login'), 'warning');
          return;
        }
        btn.disabled = true;
        api.post('/feed/acknowledge', { resourceType: 'announcement', resourceId: id }).then(function () {
          btn.textContent = t('acknowledged');
          btn.classList.add('btn-outline');
          btn.classList.remove('btn-primary');
          UI.toast(t('ack_done'), 'success');
        }).catch(function () {
          btn.disabled = false;
          UI.toast(t('ack_failed'), 'error');
        });
      });
    });
  }

  function load() {
    var wrap = document.getElementById('feed-list');

    api.get('/communications/announcements/public').then(function (res) {
      render(normalizeList(res));
    }).catch(function () {
      wrap.innerHTML = '<div class="card center muted">' + t('load_failed') + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.public();

    load();
  });
})();
