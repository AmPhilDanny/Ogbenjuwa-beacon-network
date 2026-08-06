// ─── Ogbenjuwa Citizen App — Profile (profile.html) ──────────────────────
// Reads /auth/me, renders safety card, notifications toggle, logout.

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var Session = window.OGBENJUWA.Session;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  function t(key) { return i18n.t(key); }
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  }

  function loadProfile() {
    var s = Session.getSession();
    if (!s) return;

    setText('profile-name', s.name || s.phone || 'Resident');
    setText('profile-sub', [s.lga, s.village].filter(Boolean).join(' · ') || 'Citizen');
    setText('detail-name', s.name);
    setText('detail-phone', s.phone);
    setText('detail-lga', s.lga);
    setText('detail-village', s.village);

    document.getElementById('session-meta').textContent =
      'Signed in since ' + new Date(s.loginAt || Date.now()).toLocaleDateString() + ' · token session active';

    api.get('/alerts?limit=10').then(function (res) {
      var alerts = (res && res.data) || [];
      var status = UI.safetyStatus(alerts);
      var card = document.getElementById('safety-card');
      card.className = 'safety-card safety-' + (status.level || 'clear');
      document.getElementById('safety-level').textContent = status.label;
      document.getElementById('safety-sub').textContent = status.sub;
    }).catch(function () {
      var card = document.getElementById('safety-card');
      card.className = 'safety-card safety-clear';
      document.getElementById('safety-level').textContent = t('safety_status');
      document.getElementById('safety-sub').textContent = t('no_alerts_msg');
    });

    // Notification preference (local — server sync best-effort)
    var toggle = document.getElementById('notif-toggle');
    var stored = localStorage.getItem('ogbenjuwa_notifications');
    if (stored !== null) toggle.checked = stored === 'on';
    toggle.addEventListener('change', function () {
      localStorage.setItem('ogbenjuwa_notifications', toggle.checked ? 'on' : 'off');
      UI.toast(toggle.checked ? t('notif_on') : t('notif_off'), 'success');
    });
  }

  function logout() {
    var btn = document.getElementById('logout-btn');
    btn.disabled = true;
    api.post('/auth/logout').catch(function () { /* always clear locally */ });
    Session.clearTokens();
    UI.toast(t('logged_out'), 'success');
    window.location.href = 'login.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('profile');
    loadProfile();
    document.getElementById('logout-btn').addEventListener('click', logout);

    document.getElementById('delete-btn').addEventListener('click', function () {
      if (window.confirm(t('delete_confirm'))) {
        api.del('/auth/me').then(function () {
          Session.clearTokens();
          window.location.href = 'index.html';
        }).catch(function (err) {
          UI.toast(err && err.message ? err.message : t('delete_failed'), 'error');
        });
      }
    });
  });
})();
