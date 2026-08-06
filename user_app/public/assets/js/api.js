// ─── Ogbenjuwa Citizen App — API Client ─────────────────────────────────
// Fetch wrapper matching the central-command contract:
//   - Bearer token injection
//   - 401 -> one silent refresh attempt -> retry
//   - error envelope {error:{code,message}}
//   - offline: non-GET actions queue to sessionStorage, flush on reconnect

(function () {
  'use strict';

  var CFG = window.OGBENJUWA_CONFIG;
  var Session = window.OGBENJUWA.Session;

  function ApiError(code, message, status, details) {
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN';
    this.message = message || 'Request failed';
    this.status = status || 0;
    this.details = details;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  async function request(method, path, body, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    if (!opts.skipAuth) {
      var token = Session.getAccessToken();
      if (token) headers['Authorization'] = 'Bearer ' + token;
    }

    var res;
    try {
      res = await fetch(CFG.API_BASE + path, {
        method: method,
        headers: headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      // Network failure / offline
      if (method !== 'GET' && !navigator.onLine) {
        Session.enqueue({ endpoint: path, method: method, body: body });
        throw new ApiError('OFFLINE_QUEUED', 'Request queued — will sync when back online', 0);
      }
      throw new ApiError('NETWORK_ERROR', e.message || 'Network error', 0);
    }

    if (res.status === 401 && !opts.skipAuth) {
      var refreshed = await tryRefresh();
      if (refreshed) {
        return request(method, path, body, opts);
      }
      Session.destroy();
      if (window.location.pathname.indexOf('login.html') === -1 &&
          window.location.pathname.indexOf('signup.html') === -1) {
        window.location.href = 'login.html?expired=1';
      }
      throw new ApiError('SESSION_EXPIRED', 'Session expired — please log in again', 401);
    }

    var text = await res.text();
    var data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new ApiError('PARSE_ERROR', 'Invalid response from server', res.status);
    }

    if (!res.ok) {
      var err = (data && data.error) || {};
      throw new ApiError(err.code, err.message, res.status, err.details);
    }
    return data;
  }

  async function tryRefresh() {
    var refreshToken = Session.getRefreshToken();
    if (!refreshToken) return false;
    try {
      var res = await fetch(CFG.API_BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });
      if (!res.ok) return false;
      var data = await res.json();
      Session.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ── Flush offline queue once back online ─────────────────────────────
  async function flushQueue() {
    if (!navigator.onLine) return 0;
    var flushed = 0;
    var item = Session.dequeue();
    while (item) {
      try {
        await request(item.method, item.endpoint, item.body, {});
        flushed++;
      } catch (e) {
        // Re-queue at the back and stop — keep order for same-endpoint actions
        var queue = Session.getQueue();
        queue.unshift(item);
        sessionStorage.setItem('ogbenjuwa_offline_queue', JSON.stringify(queue));
        break;
      }
      item = Session.dequeue();
    }
    return flushed;
  }

  window.addEventListener('online', function () {
    flushQueue().then(function (n) {
      if (n > 0 && window.OGBENJUWA && window.OGBENJUWA.UI) {
        window.OGBENJUWA.UI.toast(n + ' pending action' + (n > 1 ? 's' : '') + ' synced', 'success');
      }
    });
  });

  var api = {
    get: function (path, opts) { return request('GET', path, undefined, opts); },
    post: function (path, body, opts) { return request('POST', path, body, opts); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path) { return request('DELETE', path); },
    request: request,
    tryRefresh: tryRefresh,
    flushQueue: flushQueue,
    ApiError: ApiError,
  };

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.api = api;
})();
