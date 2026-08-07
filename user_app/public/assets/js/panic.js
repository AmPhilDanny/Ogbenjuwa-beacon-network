// ─── Ogbenjuwa Citizen App — Panic button (panic.html) ──────────────────
// Hold-to-confirm flow: tap PANIC → 3s countdown → GPS capture → POST /sos
// → "HELP IS COMING" state: live location shared to /sos/:id/location every
// few seconds until the user stops sharing or confirms they are safe.

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var Session = window.OGBENJUWA.Session;
  var UI = window.OGBENJUWA.UI;

  var arming = false;
  var sentAt = 0;
  var sosId = null;
  var timerInterval = null;
  var sharing = false;
  var lastLocationPayload = null;
  var lastSharedSentAt = 0;

  function safeLocationStr(pos) {
    if (!pos || !pos.coords) return null;
    return pos.coords.latitude.toFixed(6) + ',' + pos.coords.longitude.toFixed(6) +
      ' (±' + Math.round(pos.coords.accuracy) + 'm)';
  }

  function getLocation() {
    return new Promise(function (resolve) {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        function (pos) { resolve(pos); },
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

  function renderContacts() {
    var wrap = document.getElementById('panic-contacts');
    if (!wrap) return;
    var contacts = Session.getEmergencyContacts();
    if (!contacts.length) {
      wrap.innerHTML =
        '<div class="small muted">Add emergency contacts in your profile for one-tap calls here.</div>';
      return;
    }
    wrap.innerHTML = contacts.map(function (c) {
      return '<a class="btn btn-danger btn-block mt-8" href="tel:' + UI.escapeHtml(c.phone || '') + '">📞 ' +
        UI.escapeHtml(c.name || 'Contact') + '</a>';
    }).join('');
  }

  // Best-effort repeated location share; silent failures so a dead network
  // never blocks the UI. Re-shares at most every 20s when the last push failed.
  function shareLocationTick() {
    if (!sharing || !sosId) return;
    if (Date.now() - lastSharedSentAt < 15000) return;
    getLocation().then(function (pos) {
      if (!sharing) return;
      var str = pos ? safeLocationStr(pos) : (lastLocationPayload || undefined);
      if (!str) return;
      lastLocationPayload = str;
      lastSharedSentAt = Date.now();
      api.post('/sos/' + sosId + '/location', { location: str }).catch(function () { /* best-effort */ });
    });
  }

  function startSharing() {
    sharing = true;
    renderContacts();
    var el = document.getElementById('sharing-status');
    if (el) el.classList.remove('hidden');
    shareLocationTick();
    setInterval(shareLocationTick, 20000);
  }

  function stopSharing(resolveSos) {
    sharing = false;
    var el = document.getElementById('sharing-status');
    if (el) el.classList.add('hidden');
    if (resolveSos && sosId) {
      api.post('/sos/' + sosId + '/resolve').catch(function () { /* best-effort */ });
    }
  }

  async function fireSos() {
    var btn = document.getElementById('panic-btn');
    btn.textContent = '…';

    if (window.OGBENJUWA.platform && window.OGBENJUWA.platform.isNative) {
      window.OGBENJUWA.platform.vibrate(600);
    }

    var session = Session.getSession();
    var pos = await getLocation();
    var locationStr = pos ? safeLocationStr(pos) : null;
    lastLocationPayload = locationStr;

    var payload = {
      lgaId: session && session.lgaId ? session.lgaId : undefined,
      location: locationStr || undefined,
    };

    if (!session || !payload.lgaId) {
      UI.toast('Could not send SOS — no LGA on your account. Call your emergency line or SMS *347#.', 'error');
      btn.textContent = window.OGBENJUWA.i18n.t('panic_long');
      showSentState(null, 'No SOS sent', false);
      return;
    }

    try {
      var signal = await api.post('/sos', payload);
      sosId = signal && signal.id ? signal.id : null;
      sentAt = Date.now();
      showSentState(sosId, 'Ref: AMU-PANIC-' + (sosId ? sosId.slice(0, 4).toUpperCase() : '----'), true);
      startSharing();
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
    stopSharing(true);
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    UI.toast('Safety confirmed. Stay safe.', 'success');
    window.location.href = 'index.html';
  }

  function stopSharingOnly() {
    stopSharing(false);
    UI.toast('Location sharing stopped. SOS remains active.', 'warning');
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('panic');

    var btn = document.getElementById('panic-btn');
    btn.addEventListener('click', function () {
      if (btn.dataset.arming === '1') { cancelArming(); return; }
      startArming();
    });

    document.getElementById('safe-now').addEventListener('click', safeNow);
    document.getElementById('stop-sharing').addEventListener('click', stopSharingOnly);

    window.addEventListener('online', function () { api.flushQueue(); });
  });
})();