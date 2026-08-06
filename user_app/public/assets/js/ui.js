// ─── Ogbenjuwa Citizen App — UI Helpers ─────────────────────────────────
// Bottom tab bar, toasts, offline banner, timeAgo, safety status helpers.

(function () {
  'use strict';

  var Session = window.OGBENJUWA.Session;
  var i18n = window.OGBENJUWA.i18n;

  // ── Bottom tab bar ────────────────────────────────────────────────────
  // Tabs: Home · Alerts · Report (center, raised) · Family · Profile
  var TABS = [
    { id: 'home', href: 'index.html', icon: '🏠', key: 'home' },
    { id: 'alerts', href: 'alerts.html', icon: '🔔', key: 'alerts' },
    { id: 'report', href: 'report.html', icon: '📋', key: 'report', center: true },
    { id: 'family', href: 'family.html', icon: '👥', key: 'family' },
    { id: 'profile', href: 'profile.html', icon: '👤', key: 'profile' },
  ];

  /** Inject the fixed bottom tab bar; highlight the active tab. Auto-creates the nav if missing. */
  function initTabBar(activeId) {
    var nav = document.getElementById('citizen-tabs');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'citizen-tabs';
      nav.className = 'citizen-tabs';
      document.body.appendChild(nav);
    }
    if (nav.dataset.inited) return;
    nav.dataset.inited = '1';

    TABS.forEach(function (tab) {
      var a = document.createElement('a');
      a.href = tab.href;
      a.className = 'tab-item' + (tab.id === activeId ? ' active' : '') + (tab.center ? ' tab-center' : '');
      a.setAttribute('data-tab', tab.id);
      if (tab.center) {
        var inner = document.createElement('div');
        inner.className = 'tab-report-btn';
        inner.textContent = tab.icon;
        a.appendChild(inner);
      } else {
        var icon = document.createElement('span');
        icon.className = 'tab-icon';
        icon.textContent = tab.icon;
        var label = document.createElement('span');
        label.className = 'tab-label';
        label.setAttribute('data-i18n', tab.key);
        label.textContent = i18n.t(tab.key);
        a.appendChild(icon);
        a.appendChild(label);
      }
      nav.appendChild(a);
    });

    // Re-translate labels on language change
    i18n.onChange(function () {
      nav.querySelectorAll('.tab-label').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (key) el.textContent = i18n.t(key);
      });
    });
  }

  // ── Toasts ────────────────────────────────────────────────────────────
  function toast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.className = 'citizen-toast toast-' + type;
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('visible'); });
    setTimeout(function () {
      el.classList.remove('visible');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  // ── Offline banner ────────────────────────────────────────────────────
  function initOfflineBanner() {
    var banner = document.getElementById('offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offline-banner';
      document.body.appendChild(banner);
    }
    if (banner.dataset.inited) return;
    banner.dataset.inited = '1';
    function refresh() {
      var offline = !navigator.onLine;
      banner.style.display = offline ? 'block' : 'none';
      if (!offline) {
        var pending = Session.queueCount();
        if (pending > 0) {
          banner.style.display = 'block';
          banner.textContent = pending + ' pending — syncing when online';
        }
      }
    }
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    refresh();
  }

  // ── Time helpers ──────────────────────────────────────────────────────
  function timeAgo(ts) {
    if (!ts) return '';
    var ms = typeof ts === 'number' ? ts : new Date(ts).getTime();
    var m = Math.floor((Date.now() - ms) / 60000);
    if (m < 1) return i18n.t('just_now');
    if (m < 60) return m + ' ' + i18n.t('min_ago');
    var h = Math.floor(m / 60);
    if (h < 24) return h + i18n.t('hr_ago');
    return Math.floor(h / 24) + i18n.t('day_ago');
  }

  // ── Safety status ─────────────────────────────────────────────────────
  // alerts: array of {status, severity}. Returns {level:'clear'|'monitoring'|'active', label, sub}
  function safetyStatus(alerts) {
    var active = (alerts || []).filter(function (a) {
      return a.status === 'active' || a.status === 'investigating';
    });
    if (active.length === 0) {
      return { level: 'clear', label: i18n.t('all_clear'), sub: 'No active alerts in your area' };
    }
    if (active.some(function (a) { return a.severity === 'critical' || a.severity === 'high'; })) {
      return { level: 'active', label: i18n.t('danger'), sub: active.length + ' active alert' + (active.length > 1 ? 's' : '') + ' near you' };
    }
    return { level: 'monitoring', label: i18n.t('stay_alert'), sub: active.length + ' incident' + (active.length > 1 ? 's' : '') + ' reported — stay alert' };
  }

  function severityClass(severity) {
    return 'sev-' + (severity || 'medium');
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.UI = {
    initTabBar: initTabBar,
    toast: toast,
    initOfflineBanner: initOfflineBanner,
    timeAgo: timeAgo,
    safetyStatus: safetyStatus,
    severityClass: severityClass,
    escapeHtml: escapeHtml,
  };
})();
