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
  var queueHandlers = {};

  function onQueueItem(kind, fn) {
    queueHandlers[kind] = fn;
  }

  async function flushQueue() {
    if (!navigator.onLine) return 0;
    var flushed = 0;
    var item = Session.dequeue();
    while (item) {
      try {
        var handler = queueHandlers[item.kind];
        if (handler) {
          await handler(item.payload);
        } else {
          await request(item.method, item.endpoint, item.body, {});
        }
        flushed++;
      } catch (e) {
        // Re-queue at the back and stop — keep order for same-endpoint actions
        var queue = Session.getQueue();
        queue.unshift(item);
        Session.setQueue(queue);
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

  // ── Multipart upload (avatar / report photo) ───────────────────────────
  async function upload(path, data, filename) {
    var blob;
    if (typeof data === 'string' && data.indexOf('base64,') !== -1) {
      var parts = data.split(',');
      var mime = (parts[0].match(/data:(.*?)(;|$)/) || [])[1] || 'image/jpeg';
      var bin = atob(parts[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      blob = new Blob([arr], { type: mime });
    } else {
      blob = data;
    }
    var fd = new FormData();
    fd.append('file', blob, filename || 'photo.jpg');

    var headers = {};
    var token = Session.getAccessToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var res;
    try {
      res = await fetch(CFG.API_BASE + path, { method: 'POST', headers: headers, body: fd });
    } catch (e) {
      throw new ApiError('NETWORK_ERROR', e.message || 'Network error', 0);
    }
    if (res.status === 401) {
      var refreshed = await tryRefresh();
      if (refreshed) return upload(path, data, filename);
      throw new ApiError('SESSION_EXPIRED', 'Session expired — please log in again', 401);
    }
    var text = await res.text();
    var body;
    try { body = text ? JSON.parse(text) : {}; } catch (e) { throw new ApiError('PARSE_ERROR', 'Invalid response from server', res.status); }
    if (!res.ok) {
      var err = (body && body.error) || {};
      throw new ApiError(err.code, err.message, res.status, err.details);
    }
    return body;
  }

  var api = {
    get: function (path, opts) { return request('GET', path, undefined, opts); },
    post: function (path, body, opts) { return request('POST', path, body, opts); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path) { return request('DELETE', path); },
    request: request,
    upload: upload,
    tryRefresh: tryRefresh,
    flushQueue: flushQueue,
    onQueueItem: onQueueItem,
    ApiError: ApiError,
  };

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.api = api;
})();
