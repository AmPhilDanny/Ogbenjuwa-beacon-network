// ─── Ogbenjuwa Citizen App — Auth pages logic (login.html / signup.html) ─

(function () {
  'use strict';

  var Session = window.OGBENJUWA.Session;
  var api = window.OGBENJUWA.api;

  function showError(el, message) {
    if (!el) return;
    el.textContent = message || 'Something went wrong. Please try again.';
    el.classList.add('visible');
  }

  function clearError(el) {
    if (el) el.classList.remove('visible');
  }

  function setBusy(btn, busy, text) {
    if (!btn) return;
    btn.disabled = busy;
    if (busy) {
      btn.dataset.text = btn.textContent;
      btn.textContent = '…';
    } else if (btn.dataset.text) {
      btn.textContent = btn.dataset.text;
    }
  }

  function markInvalid(input) {
    input.classList.add('input-err');
  }

  function wirePasswordToggle() {
    var btn = document.getElementById('toggle-pass');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var input = document.getElementById('password');
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? '🙈' : '👁';
    });
  }

  // ── Login ──────────────────────────────────────────────────────────────
  function initLogin() {
    var form = document.getElementById('login-form');
    if (!form) return;
    var errorEl = document.getElementById('login-error');
    var submitBtn = document.getElementById('login-submit');
    var loginInput = document.getElementById('login');
    var passInput = document.getElementById('password');

    var params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
      window.OGBENJUWA.UI.toast('Session expired — please log in again', 'warning');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError(errorEl);

      var loginVal = (loginInput.value || '').trim();
      var password = passInput.value || '';
      if (!loginVal) { markInvalid(loginInput); return; }
      if (!password) { markInvalid(passInput); return; }

      setBusy(submitBtn, true);
      try {
        var data = await api.post('/auth/login', { login: loginVal, password: password }, { skipAuth: true });
        Session.setTokens(data.accessToken, data.refreshToken);
        Session.createSession(data.user);
        window.location.href = 'index.html';
      } catch (err) {
        showError(errorEl, err && err.message);
        setBusy(submitBtn, false);
      }
    });

    [loginInput, passInput].forEach(function (inp) {
      inp.addEventListener('input', function () { inp.classList.remove('input-err'); });
    });
  }

  // ── Signup ─────────────────────────────────────────────────────────────
  function initSignup() {
    var form = document.getElementById('signup-form');
    if (!form) return;
    var errorEl = document.getElementById('signup-error');
    var submitBtn = document.getElementById('signup-submit');
    var lgaSelect = document.getElementById('lga');

    // Populate LGAs from the live API
    (function loadLgas() {
      api.get('/lgas')
        .then(function (res) {
          var lgas = (res && res.data) || [];
          lgas.forEach(function (lga) {
            var opt = document.createElement('option');
            opt.value = lga.id;
            opt.textContent = lga.name;
            lgaSelect.appendChild(opt);
          });
        })
        .catch(function () {
          // LGA list unavailable — registration still possible without lgaId
        });
    })();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError(errorEl);

      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;
      var phone = document.getElementById('phone').value.trim();
      var lgaId = lgaSelect.value || undefined;

      var ok = true;
      if (!name) { markInvalid(document.getElementById('name')); ok = false; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { markInvalid(document.getElementById('email')); ok = false; }
      if (username.length < 3) { markInvalid(document.getElementById('username')); ok = false; }
      if (password.length < 8) { markInvalid(document.getElementById('password')); ok = false; }
      if (!ok) return;

      setBusy(submitBtn, true);
      try {
        var data = await api.post('/auth/register', {
          email: email,
          username: username,
          password: password,
          name: name,
          phone: phone || undefined,
          lgaId: lgaId,
        }, { skipAuth: true });
        Session.setTokens(data.accessToken, data.refreshToken);
        Session.createSession(data.user);
        window.location.href = 'index.html';
      } catch (err) {
        showError(errorEl, err && err.message);
        setBusy(submitBtn, false);
      }
    });

    form.querySelectorAll('.input').forEach(function (inp) {
      inp.addEventListener('input', function () { inp.classList.remove('input-err'); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.public();
    wirePasswordToggle();
    initLogin();
    initSignup();
  });
})();
