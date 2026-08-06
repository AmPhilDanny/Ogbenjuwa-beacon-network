// ─── Ogbenjuwa Citizen App — Report incident wizard (report.html) ───────

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  var REPORT = {
    type: null,
    lgaId: null,
    village: '',
    description: '',
    photo: null,      // dataURL or null
    urgency: 'medium',
  };
  var step = 1;
  var totalSteps = 5;

  function showStep(n) {
    for (var i = 1; i <= 5; i++) {
      var panel = document.getElementById('step-' + i);
      if (panel) panel.classList.toggle('hidden', i !== n);
    }
    document.getElementById('step-done').classList.add('hidden');
    document.querySelectorAll('.progress-dot').forEach(function (dot) {
      var s = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('done', s < n);
      dot.classList.toggle('current', s === n);
    });
    var back = document.getElementById('wizard-back');
    if (back) back.classList.toggle('hidden', n === 1);
    step = n;
  }

  function goBack() {
    if (step > 1) showStep(step - 1);
  }

  function advance() {
    if (step < totalSteps) showStep(step + 1);
    if (step + 1 === 5) renderReview();
  }

  function renderReview() {
    var el = document.getElementById('review-summary');
    var typeLabel = REPORT.type ? REPORT.type.charAt(0).toUpperCase() + REPORT.type.slice(1) : '—';
    var lgaName = '—';
    var lgaSel = document.getElementById('report-lga');
    if (lgaSel.selectedOptions && lgaSel.selectedOptions[0]) {
      lgaName = lgaSel.selectedOptions[0].textContent;
    }
    el.innerHTML =
      '<div class="profile-row"><div class="pr-label">Type</div><div class="pr-value">' + UI.escapeHtml(typeLabel) + '</div></div>' +
      '<div class="profile-row"><div class="pr-label">LGA</div><div class="pr-value">' + UI.escapeHtml(lgaName) + '</div></div>' +
      '<div class="profile-row"><div class="pr-label">Village</div><div class="pr-value">' + UI.escapeHtml(REPORT.village || '—') + '</div></div>' +
      '<div class="profile-row"><div class="pr-label">Urgency</div><div class="pr-value">' + UI.escapeHtml(REPORT.urgency.toUpperCase()) + '</div></div>' +
      (REPORT.description ? '<div class="small muted mt-12">' + UI.escapeHtml(REPORT.description) + '</div>' : '');
  }

  function validateStep() {
    if (step === 1) return !!REPORT.type;
    if (step === 2) return !!REPORT.lgaId;
    return true;
  }

  function submitReport() {
    var btn = document.getElementById('submit-report');
    btn.disabled = true;
    var errEl = document.getElementById('report-error');
    if (errEl) errEl.classList.remove('visible');

    var lgaSel = document.getElementById('report-lga');
    var lgaName = lgaSel.selectedOptions && lgaSel.selectedOptions[0]
      ? lgaSel.selectedOptions[0].textContent
      : '';

    api.post('/reports', {
      type: REPORT.type,
      lga: lgaName,
      description: REPORT.description || undefined,
    }).then(function (res) {
      document.getElementById('done-ref').textContent = 'Reference: ' + (res.id || '—');
      showStep(1);
      document.querySelectorAll('.step-panel').forEach(function (p) { p.classList.add('hidden'); });
      document.getElementById('step-done').classList.remove('hidden');
      document.getElementById('progress-dots').classList.add('hidden');
    }).catch(function (err) {
      if (errEl) {
        errEl.textContent = err && err.message ? err.message : 'Could not submit report';
        errEl.classList.add('visible');
      }
      btn.disabled = false;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('report');

    // Step 1 — type picker
    document.querySelectorAll('#step-1 .pick-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#step-1 .pick-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        REPORT.type = btn.dataset.type;
        advance();
      });
    });

    // Step 2 — LGA list + GPS
    api.get('/lgas').then(function (res) {
      var lgas = (res && res.data) || [];
      var sel = document.getElementById('report-lga');
      lgas.forEach(function (lga) {
        var opt = document.createElement('option');
        opt.value = lga.id;
        opt.textContent = lga.name;
        sel.appendChild(opt);
      });
      // Pre-select session LGA
      var s = window.OGBENJUWA.Session.getSession();
      if (s && s.lgaId) sel.value = s.lgaId;
    }).catch(function () { /* handled on submit */ });

    document.getElementById('gps-btn').addEventListener('click', function () {
      var btn = this;
      btn.textContent = 'Getting location…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        document.getElementById('gps-display').textContent =
          '📍 ' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) +
          ' — accuracy ±' + Math.round(pos.coords.accuracy) + 'm';
        btn.textContent = '📍 Location detected';
      }, function () {
        btn.textContent = '📍 Could not get location — select village instead';
      }, { timeout: 8000 });
    });

    document.getElementById('report-lga').addEventListener('change', function (e) {
      REPORT.lgaId = e.target.value || null;
      if (validateStep()) advance();
    });
    document.getElementById('report-village').addEventListener('input', function (e) {
      REPORT.village = e.target.value;
    });

    // Step 3 — details + photo
    document.getElementById('report-details').addEventListener('input', function (e) {
      REPORT.description = e.target.value;
      if (e.target.value.trim().length >= 3) advance();
    });
    var photoInput = document.getElementById('photo-input');
    document.getElementById('photo-btn').addEventListener('click', function () { photoInput.click(); });
    photoInput.addEventListener('change', function () {
      var file = photoInput.files && photoInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        REPORT.photo = reader.result;
        document.getElementById('preview-img').src = reader.result;
        document.getElementById('photo-preview').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
      advance();
    });
    document.getElementById('remove-photo').addEventListener('click', function () {
      REPORT.photo = null;
      document.getElementById('photo-preview').classList.add('hidden');
      photoInput.value = '';
    });

    // Step 4 — urgency
    document.querySelectorAll('#step-4 .pick-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#step-4 .pick-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        REPORT.urgency = btn.dataset.urgency;
        advance();
      });
    });

    // Step 5 — submit
    document.getElementById('submit-report').addEventListener('click', submitReport);
    document.getElementById('wizard-back').addEventListener('click', goBack);

    showStep(1);
  });
})();
