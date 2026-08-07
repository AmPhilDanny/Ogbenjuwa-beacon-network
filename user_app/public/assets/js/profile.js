// ─── Ogbenjuwa Citizen App — Profile (profile.html) ──────────────────────

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var Session = window.OGBENJUWA.Session;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  function t(key) { return i18n.t(key); }
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  }
  function escapeAttr(v) {
    return String(v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var session = null;

  function loadProfile() {
    session = Session.getSession();
    if (!session) return;

    setText('profile-name', session.name || session.phone || 'Resident');
    setText('profile-sub', [session.lga, session.village].filter(Boolean).join(' · ') || 'Citizen');
    setText('detail-name', session.name);
    setText('detail-phone', session.phone);
    setText('detail-lga', session.lga);
    setText('detail-village', session.village);

    if (session.avatar) {
      var av = document.getElementById('profile-avatar');
      av.textContent = '';
      av.style.backgroundImage = 'url(' + escapeAttr(session.avatar) + ')';
      av.style.backgroundSize = 'cover';
      av.style.backgroundPosition = 'center';
    }

    document.getElementById('session-meta').textContent =
      'Signed in since ' + new Date(session.loginAt || Date.now()).toLocaleDateString() + ' · token session active';

    api.get('/alerts?limit=10').then(function (res) {
      var alerts = (res && res.data) || [];
      var status = UI.safetyStatus(alerts);
      var card = document.getElementById('safety-card');
      card.className = 'safety-card safety-' + (status.level || 'clear');
      document.getElementById('safety-level').textContent = status.label;
      document.getElementById('safety-sub').textContent = status.sub;
    }).catch(function () {
      var card = document.getElementById('safety-card');
      card.className = 'safety-card safety-clear';
      document.getElementById('safety-level').textContent = t('safety_status');
      document.getElementById('safety-sub').textContent = t('no_alerts_msg');
    });

    // Notification preference (local — server sync best-effort)
    var toggle = document.getElementById('notif-toggle');
    var stored = localStorage.getItem('ogbenjuwa_notifications');
    if (stored !== null) toggle.checked = stored === 'on';
    toggle.addEventListener('change', function () {
      localStorage.setItem('ogbenjuwa_notifications', toggle.checked ? 'on' : 'off');
      UI.toast(toggle.checked ? t('notif_on') : t('notif_off'), 'success');
    });

    renderContacts();
  }

  function showEditForm() {
    document.getElementById('edit-name').value = session.name || '';
    document.getElementById('edit-phone').value = session.phone || '';
    document.getElementById('edit-village').value = session.village || '';
    document.getElementById('edit-form').classList.remove('hidden');
    document.getElementById('edit-btn').classList.add('hidden');
  }

  function saveProfile() {
    var name = document.getElementById('edit-name').value.trim();
    var phone = document.getElementById('edit-phone').value.trim();
    var village = document.getElementById('edit-village').value.trim();
    if (!name || !phone) {
      UI.toast('Name and phone are required', 'error');
      return;
    }
    var btn = document.getElementById('save-profile');
    btn.disabled = true;
    api.request('PATCH', '/auth/me', {
      name: name,
      phone: phone,
      village: village || undefined,
    }).then(function (user) {
      Session.updateSession({
        name: user.name || name,
        phone: user.phone || phone,
        village: user.village || village,
      });
      UI.toast('Profile updated', 'success');
      document.getElementById('edit-form').classList.add('hidden');
      document.getElementById('edit-btn').classList.remove('hidden');
      loadProfile();
    }).catch(function (err) {
      UI.toast(err && err.message ? err.message : 'Could not save profile', 'error');
    }).finally(function () {
      btn.disabled = false;
    });
  }

  function uploadAvatar(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      UI.toast('Photo too large — max 10MB', 'error');
      return;
    }
    var btn = document.getElementById('avatar-btn');
    btn.textContent = '…';
    var reader = new FileReader();
    reader.onload = function () {
      api.upload('/uploads', reader.result, 'avatar.jpg').then(function (up) {
        return api.request('PATCH', '/auth/me', { avatar: up.url });
      }).then(function () {
        Session.updateSession({ avatar: reader.result });
        var av = document.getElementById('profile-avatar');
        av.textContent = '';
        av.style.backgroundImage = 'url("' + reader.result.replace(/"/g, '') + '")';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        UI.toast('Photo updated', 'success');
      }).catch(function (err) {
        UI.toast(err && err.message ? err.message : 'Could not upload photo', 'error');
      }).finally(function () {
        btn.textContent = '📷';
      });
    };
    reader.readAsDataURL(file);
  }

  function renderContacts() {
    var listEl = document.getElementById('contact-list');
    var contacts = Session.getEmergencyContacts();
    if (!contacts.length) {
      listEl.innerHTML = '<div class="small muted">No contacts added yet. They appear in PANIC mode for one-tap calls.</div>';
      return;
    }
    listEl.innerHTML = contacts.map(function (c, idx) {
      return '<div class="profile-row">' +
        '<div><div>' + UI.escapeHtml(c.name || 'Contact') + '</div>' +
        '<div class="small muted">' + UI.escapeHtml(c.phone || '') + '</div></div>' +
        '<button type="button" class="btn btn-sm" data-remove="' + idx + '" style="background:#dc2626;color:#fff;border:none;">Remove</button>' +
        '</div>';
    }).join('');
    listEl.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Session.removeEmergencyContact(parseInt(btn.getAttribute('data-remove'), 10));
        renderContacts();
      });
    });
  }

  function addContact() {
    var name = document.getElementById('contact-name').value.trim();
    var phone = document.getElementById('contact-phone').value.trim();
    if (!name || !phone) {
      UI.toast('Enter a name and phone number', 'error');
      return;
    }
    Session.addEmergencyContact({ name: name, phone: phone });
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    renderContacts();
  }

  function logout() {
    var btn = document.getElementById('logout-btn');
    btn.disabled = true;
    api.post('/auth/logout').catch(function () { /* always clear locally */ });
    Session.clearTokens();
    UI.toast(t('logged_out'), 'success');
    window.location.href = 'login.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('profile');
    loadProfile();
    document.getElementById('logout-btn').addEventListener('click', logout);

    document.getElementById('edit-btn').addEventListener('click', showEditForm);
    document.getElementById('cancel-edit').addEventListener('click', function () {
      document.getElementById('edit-form').classList.add('hidden');
      document.getElementById('edit-btn').classList.remove('hidden');
    });
    document.getElementById('save-profile').addEventListener('click', saveProfile);
    document.getElementById('avatar-btn').addEventListener('click', function () {
      document.getElementById('avatar-input').click();
    });
    document.getElementById('avatar-input').addEventListener('change', function (e) {
      uploadAvatar(e.target.files && e.target.files[0]);
    });
    document.getElementById('contact-add-btn').addEventListener('click', addContact);

    document.getElementById('delete-btn').addEventListener('click', function () {
      if (window.confirm(t('delete_confirm'))) {
        api.del('/auth/me').then(function () {
          Session.clearTokens();
          window.location.href = 'index.html';
        }).catch(function (err) {
          UI.toast(err && err.message ? err.message : t('delete_failed'), 'error');
        });
      }
    });
  });
})();