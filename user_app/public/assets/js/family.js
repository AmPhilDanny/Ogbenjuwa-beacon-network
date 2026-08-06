// ─── Ogbenjuwa Citizen App — Family & contacts (family.html) ──────────────
// Directory search (GET /family/search) + emergency contacts (GET/POST
// /contacts). Residents lack family:create — create attempts fall back to
// an SMS *347# instruction instead of erroring.

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;
  var i18n = window.OGBENJUWA.i18n;

  function t(key) { return i18n.t(key); }

  function normalizeList(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  }

  // ── Directory search ──────────────────────────────────────────────
  function doSearch(query) {
    var box = document.getElementById('search-results');
    if (!query.trim()) {
      box.innerHTML = '<div class="small muted center">' + t('search_hint') + '</div>';
      return;
    }
    box.innerHTML = '<div class="card center muted">' + t('loading') + '</div>';

    api.get('/family/search?q=' + encodeURIComponent(query.trim()))
      .then(function (res) {
        var people = normalizeList(res);
        if (!people.length) {
          box.innerHTML = '<div class="small muted center">' + t('no_results') + '</div>';
          return;
        }
        box.innerHTML = people.map(function (p) {
          var name = UI.escapeHtml(p.name || p.fullName || '—');
          var village = UI.escapeHtml(p.village || p.lgaName || '');
          var phone = p.phone ? '<a class="call-link" href="tel:' + UI.escapeHtml(p.phone) + '">📞 ' + UI.escapeHtml(p.phone) + '</a>' : '';
          return '<div class="card search-result">' +
            '<div class="resource-head">' +
            '<div><div class="resource-name">' + name + '</div>' +
            (village ? '<div class="small muted">' + village + '</div>' : '') +
            '</div>' + phone + '</div></div>';
        }).join('');
      })
      .catch(function (err) {
        box.innerHTML = '<div class="small muted center">' + UI.escapeHtml(err && err.message ? err.message : t('search_failed')) + '</div>';
      });
  }

  // ── Emergency contacts ─────────────────────────────────────────────
  function loadContacts() {
    var list = document.getElementById('contacts-list');
    api.get('/contacts').then(function (res) {
      var contacts = normalizeList(res);
      if (!contacts.length) {
        list.innerHTML = '<div class="small muted center">' + t('no_contacts') + '</div>';
        return;
      }
      list.innerHTML = contacts.map(function (c) {
        var name = UI.escapeHtml(c.name || c.fullName || 'Contact');
        var phone = UI.escapeHtml(c.phone || '');
        return '<div class="card search-result">' +
          '<div class="resource-head">' +
          '<div class="resource-name">' + name + '</div>' +
          (phone ? '<a class="call-link" href="tel:' + phone + '">📞 ' + phone + '</a>' : '') +
          '</div></div>';
      }).join('');
    }).catch(function (err) {
      if (err && (err.code === 'NOT_FOUND' || err.status === 404)) {
        list.innerHTML = '<div class="small muted center">' + t('no_contacts') + '</div>';
      } else {
        list.innerHTML = '<div class="small muted center">' + UI.escapeHtml(err && err.message ? err.message : t('load_failed')) + '</div>';
      }
    });
  }

  function addContact() {
    var name = document.getElementById('contact-name').value.trim();
    var phone = document.getElementById('contact-phone').value.trim();
    if (!name || !phone) { UI.toast(t('fill_all'), 'error'); return; }

    api.post('/contacts', { name: name, phone: phone }).then(function () {
      UI.toast(t('contact_added'), 'success');
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-phone').value = '';
      loadContacts();
    }).catch(function (err) {
      // No contacts:create permission → family registration fallback note
      if (err && (err.code === 'FORBIDDEN' || err.status === 403)) {
        document.getElementById('sms-note').classList.remove('hidden');
        UI.toast(t('contact_fallback'), 'warning');
      } else {
        UI.toast(err && err.message ? err.message : t('add_failed'), 'error');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.OGBENJUWA.boot.protected('family');

    document.getElementById('family-search-btn').addEventListener('click', function () {
      doSearch(document.getElementById('family-search').value);
    });
    document.getElementById('family-search').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch(this.value);
    });
    document.getElementById('add-contact-btn').addEventListener('click', addContact);

    loadContacts();
  });
})();
