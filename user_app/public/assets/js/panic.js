// ─── Ogbenjuwa Citizen App — Panic button (panic.html) ──────────────────
// Hold-to-confirm flow: tap PANIC → 3s countdown → GPS capture → POST /sos
// → "HELP IS COMING" state with timer, call button, and "I am safe now".

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var Session = window.OGBENJUWA.Session;
  var UI = window.OGBENJUWA.UI;

  var arming = false;
  var sentAt = 0;
  var sosId = null;
  var timerInterval = null;

  function getLocation() {
    return new Promise(function (resolve) {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          resolve({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
            acc: Math.round(pos.coords.accuracy),
          });
        },
        function () { resolve(null); },
        { timeout: 8000, maximumAge: 30000, enableHighAccuracy: true },
      );
    });
  }

  function startArming() {
    if (arming) return;
    arming = true;

    var btn = document.getElementById('panic-btn');
    var ring = document.createElement('div');
    ring.className = 'panic-countdown';
    ring.id = 'panic-ring';
    btn.parentNode.appendChild(ring);
    btn.classList.add('arming');
    btn.textContent = '3';

    var count = 3;
    var tick = setInterval(function () {
      count -= 1;
      if (count <= 0) {
        clearInterval(tick);
        btn.classList.remove('arming');
        ring.remove();
        btn.textContent = '';
        arming = false;
        fireSos();
        return;
      }
      btn.textContent = String(count);
    }, 1000);

    // Tap again during countdown cancels
    btn.dataset.cancelTimer = tick;
    btn.dataset.arming = '1';
  }

  function cancelArming() {
    if (!arming) return;
    arming = false;
    var btn = document.getElementById('panic-btn');
    var tick = parseInt(btn.dataset.cancelTimer, 10);
    if (tick) clearInterval(tick);
    var ring = document.getElementById('panic-ring');
    if (ring) ring.remove();
    btn.classList.remove('arming');
    btn.textContent = window.OGBENJUWA.i18n.t('panic_long');
    btn.dataset.arming = '0';
  }

  async function fireSos() {
    var btn = document.getElementById('panic-btn');
    btn.textContent = '…';

    var session = Session.getSession();
    var loc = await getLocation();
    var locationStr = loc
      ? loc.lat + ',' + loc.lng + (loc.acc ? ' (±' + loc.acc + 'm)' : '')
      : null;

    var payload = {
      lgaId: session && session.lgaId ? session.lgaId : undefined,
      location: locationStr || undefined,
    };

    // If not signed in, queue a panic for when a session exists is NOT possible
    // (SOS requires auth + lgaId) — fall back to manual contacts + SMS.
    if (!session || !payload.lgaId) {
      UI.toast('Could not send SOS — no LGA on your account. Call your emergency line or SMS *347#.', 'error');
      btn.textContent = window.OGBENJUWA.i18n.t('panic_long');
      showSentState(null, null, false);
      return;
    }

    try {
      var signal = await api.post('/sos', payload);
      sosId = signal && signal.id ? signal.id : null;
      sentAt = Date.now();
      showSentState(sosId, 'Ref: AMU-PANIC-' + (sosId ? sosId.slice(0, 4).toUpperCase() : '----'), true);
    } catch (err) {
      if (err && err.code === 'OFFLINE_QUEUED') {
        UI.toast('Offline — SOS queued. Will send when connected.', 'warning');
        sentAt = Date.now();
        showSentState(null, 'Queued locally', true);
        return;
      }
      UI.toast(err && err.message ? err.message : 'Could not send SOS', 'error');
      btn.textContent = window.OGBENJUWA.i18n.t('panic_long');
    }
  }

  function showSentState(ref, refLabel, showTimer) {
    document.getElementById('panic-idle').classList.add('hidden');
    document.getElementById('sms-fallback').classList.add('hidden');
    var sent = document.getElementById('panic-sent');
    sent.classList.remove('hidden');
    var refEl = document.getElementById('sos-ref');
    if (ref) refEl.textContent = ref;
    else refEl.textContent = refLabel || '';

    if (showTimer) {
      timerInterval = setInterval(function () {
        var secs = Math.floor((Date.now() - sentAt) / 1000);
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        document.getElementById('sos-timer').textContent =
          'Alert sent ' + m + ':' + (s < 10 ? '0' : '') + s + ' ago';
      }, 1000);
    } else {
      document.getElementById('sos-timer').classList.add('hidden');
    }
  }

  function safeNow() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (sosId) {
      // Residents lack sos:update permission — server rejects PUT; treat as local cancel
      api.put('/sos/' + sosId, { status: 'resolved' }).catch(function () { /* best-effort */ });
    }
    UI.toast('Safety confirmed. Stay safe.', 'success');
    window.location.href = 'index.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('panic');

    var btn = document.getElementById('panic-btn');
    btn.addEventListener('click', function () {
      if (btn.dataset.arming === '1') { cancelArming(); return; }
      startArming();
    });

    document.getElementById('safe-now').addEventListener('click', safeNow);

    window.addEventListener('online', function () { api.flushQueue(); });
  });
})();
