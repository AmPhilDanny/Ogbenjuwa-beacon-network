// ─── Ogbenjuwa Citizen App — WebSocket Client ───────────────────────────
// Connects to the central-command WS hub:
//   wss://<api-host>/ws?token=<accessToken>   (token optional: public alerts still work)
// Events: connected, alert:new/updated/resolved/deleted, sos:new/updated,
//         incident:new, announcement:new, message:new
// Client messages: {type:'ping'}, {type:'subscribe:alerts'}

(function () {
  'use strict';

  var CFG = window.OGBENJUWA_CONFIG;
  var Session = window.OGBENJUWA.Session;

  var listeners = {};      // event name -> [fn]
  var ws = null;
  var reconnectDelay = 3000;
  var reconnectTimer = null;
  var manualClose = false;

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
    return function off() {
      listeners[event] = (listeners[event] || []).filter(function (f) { return f !== fn; });
    };
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(function (fn) {
      try { fn(data); } catch (e) { /* listener errors are non-fatal */ }
    });
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    var token = Session.getAccessToken();
    var url = CFG.WS_URL + (token ? '?token=' + encodeURIComponent(token) : '');
    manualClose = false;

    try {
      ws = new WebSocket(url);
    } catch (e) {
      scheduleReconnect();
      return;
    }

    ws.onopen = function () {
      reconnectDelay = 3000;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'subscribe:alerts' }));
        ws.send(JSON.stringify({ type: 'subscribe:incidents' }));
      }
      emit('open');
    };

    ws.onmessage = function (evt) {
      var msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (e) {
        return;
      }
      if (msg && msg.type) emit(msg.type, msg.data);
    };

    ws.onclose = function () {
      if (!manualClose) scheduleReconnect();
    };

    ws.onerror = function () {
      // onclose follows — let it handle reconnect
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  }

  function send(type, payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: type, payload: payload }));
    }
  }

  function disconnect() {
    manualClose = true;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws) { try { ws.close(); } catch (e) {} ws = null; }
  }

  function ping() {
    send('ping');
  }

  // Keep the socket warm; re-auth after token refresh
  window.addEventListener('storage', function (e) {
    if (e.key === 'accessToken') {
      disconnect();
      connect();
    }
  });

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.ws = {
    connect: connect,
    disconnect: disconnect,
    send: send,
    ping: ping,
    on: on,
  };
})();
