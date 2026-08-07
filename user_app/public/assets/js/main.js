// ─── Ogbenjuwa Citizen App — Main bootstrap ─────────────────────────────
// Loaded on every page AFTER the other libs. Provides:
//   - shared page init (tab bar, offline banner, session header)
//   - auth guard helper for protected pages
//   - WS auto-connect for signed-in users

(function () {
  'use strict';

  var Session = window.OGBENJUWA.Session;
  var UI = window.OGBENJUWA.UI;

  function currentPage() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p.replace('.html', '');
  }

  /** Fill the page header with the session user (name + LGA badge). */
  function initHeader() {
    var el = document.getElementById('header-user');
    if (!el) return;
    var s = Session.getSession();
    if (!s) return;
    var nameEl = el.querySelector('.header-user-name');
    var subEl = el.querySelector('.header-sub');
    if (nameEl) nameEl.textContent = s.name || 'Resident';
    if (subEl) subEl.textContent = [s.lga, s.village].filter(Boolean).join(' · ') || 'Citizen';
  }

  /** Guard: redirect to login when not authenticated. Returns session or null. */
  function requireAuth() {
    var s = Session.getSession();
    if (!s || !Session.getAccessToken()) {
      window.location.href = 'login.html';
      return null;
    }
    return s;
  }

  /** Shared bootstrap for protected pages. */
  function bootProtected(activeTab, opts) {
    opts = opts || {};
    var session = requireAuth();
    if (!session) return null;

    UI.initTabBar(activeTab);
    UI.initOfflineBanner();
    initHeader();

    // Refresh the session user from /auth/me in background (keeps names fresh)
    window.OGBENJUWA.api.get('/auth/me', { skipAuth: false })
      .then(function (user) {
        Session.updateSession({
          name: user.name, email: user.email, phone: user.phone,
          lga: user.lga, ward: user.ward, village: user.village,
          lgaId: user.lgaId, villageId: user.villageId,
          role: user.role,
        });
        initHeader();
      })
      .catch(function () { /* silent — session already validated */ });

    // Live updates
    window.OGBENJUWA.ws.connect();
    window.OGBENJUWA.ws.on('alert:new', function (alert) {
      if (opts.onAlert) opts.onAlert(alert);
      else UI.toast((alert.title || 'New alert') + ' — ' + (alert.location || ''), 'warning');
    });
    window.OGBENJUWA.ws.on('announcement:new', function (ann) {
      if (opts.onAnnouncement) opts.onAnnouncement(ann);
    });

    return session;
  }

  /** Bootstrap for public pages (login/signup). */
  function bootPublic() {
    UI.initOfflineBanner();
    // Already signed in? Offer to jump home.
    if (Session.isAuthenticated()) {
      var el = document.getElementById('already-in');
      if (el) el.classList.remove('hidden');
    }
  }

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.boot = {
    protected: bootProtected,
    public: bootPublic,
    requireAuth: requireAuth,
    currentPage: currentPage,
  };

  if (window.OGBENJUWA.platform && window.OGBENJUWA.platform.isNative) {
    window.OGBENJUWA.platform.ready(function () {
      try {
        if (window.StatusBar) {
          window.StatusBar.backgroundColorByHexString('#1a6b3a');
          window.StatusBar.styleLightContent();
        }
      } catch (e) { /* not available */ }
    });
  }
})();
