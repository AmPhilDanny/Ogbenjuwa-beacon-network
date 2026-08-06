// ─── Ogbenjuwa Citizen App — Session Management ─────────────────────────
// Storage keys deliberately MATCH the existing React apps so sessions
// are interchangeable across the network (beacon / user-apps).
//   - sessionStorage 'accessToken'          (JWT access token)
//   - sessionStorage 'refreshToken'         (JWT refresh token)
//   - sessionStorage 'ogbenjuwa_resident_session'  (session JSON)

(function () {
  'use strict';

  var TOKEN_KEY = 'accessToken';
  var REFRESH_KEY = 'refreshToken';
  var SESSION_KEY = 'ogbenjuwa_resident_session';
  var EMERGENCY_KEY = 'ogbenjuwa_emergency_contacts';
  var LANG_KEY = 'ogbenjuwa_lang';
  var QUEUE_KEY = 'ogbenjuwa_offline_queue';

  var Session = {
    getAccessToken: function () {
      return sessionStorage.getItem(TOKEN_KEY);
    },
    getRefreshToken: function () {
      return sessionStorage.getItem(REFRESH_KEY);
    },
    setTokens: function (access, refresh) {
      if (access) sessionStorage.setItem(TOKEN_KEY, access);
      if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
    },
    clearTokens: function () {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    },

    /** Build + persist the resident session from a login/register user payload. */
    createSession: function (user) {
      var session = {
        id: user.id,
        phone: user.phone || '',
        role: user.role || 'resident',
        name: user.name || '',
        email: user.email || '',
        lga: user.lga || '',
        ward: user.ward || '',
        village: user.village || '',
        lgaId: user.lgaId || null,
        villageId: user.villageId || null,
        token: '',
        loginAt: Date.now(),
        // 72-hour citizen session per MVP spec (access token itself is 15m;
        // this expiry gates UX-level "re-login" prompts, refresh handles real auth)
        expiresAt: Date.now() + 72 * 60 * 60 * 1000,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },

    /** Return the session object or null when missing/expired. */
    getSession: function () {
      try {
        var raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        var session = JSON.parse(raw);
        if (Date.now() > session.expiresAt) {
          sessionStorage.removeItem(SESSION_KEY);
          return null;
        }
        return session;
      } catch (e) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
    },

    updateSession: function (patch) {
      var s = this.getSession();
      if (!s) return null;
      var merged = Object.assign({}, s, patch);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      return merged;
    },

    destroy: function () {
      this.clearTokens();
    },

    isAuthenticated: function () {
      return !!this.getAccessToken() && !!this.getSession();
    },

    // ── Emergency contacts (local profile data) ─────────────────────────
    getEmergencyContacts: function () {
      try {
        return JSON.parse(localStorage.getItem(EMERGENCY_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },
    setEmergencyContacts: function (contacts) {
      localStorage.setItem(EMERGENCY_KEY, JSON.stringify(contacts || []));
    },
    addEmergencyContact: function (contact) {
      var list = this.getEmergencyContacts();
      list.push(contact);
      this.setEmergencyContacts(list);
      return list;
    },
    removeEmergencyContact: function (index) {
      var list = this.getEmergencyContacts();
      list.splice(index, 1);
      this.setEmergencyContacts(list);
      return list;
    },

    // ── Language ────────────────────────────────────────────────────────
    getLang: function () {
      var s = this.getSession();
      if (s && s.language) return s.language;
      return localStorage.getItem(LANG_KEY) || 'english';
    },
    setLang: function (lang) {
      localStorage.setItem(LANG_KEY, lang);
      var s = this.getSession();
      if (s) {
        s.language = lang;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
    },

    // ── Offline queue (non-GET actions awaiting connectivity) ───────────
    getQueue: function () {
      try {
        return JSON.parse(sessionStorage.getItem(QUEUE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },
    enqueue: function (action) {
      var queue = this.getQueue();
      queue.push(Object.assign({ ts: Date.now() }, action));
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return queue.length;
    },
    dequeue: function () {
      var queue = this.getQueue();
      var item = queue.shift();
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return item || null;
    },
    queueCount: function () {
      return this.getQueue().length;
    },
  };

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.Session = Session;
})();
