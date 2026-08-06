// ─── Ogbenjuwa Citizen App — Community resources (resources.html) ────────
// Public endpoint: GET /resources?type=&lgaId= — no auth required.

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;

  var currentType = '';
  var session = window.OGBENJUWA.Session.getSession();

  var TYPE_ICONS = {
    medical: '🏥',
    shelter: '⛺',
    water: '💧',
    food: '🍲',
  };

  function normalize(list) {
    if (Array.isArray(list)) return list;
    if (list && Array.isArray(list.data)) return list.data;
    return [];
  }

  function fetchResources() {
    var q = 'type=' + encodeURIComponent(currentType);
    if (session && session.lgaId) q += '&lgaId=' + encodeURIComponent(session.lgaId);

    document.getElementById('resources-list').innerHTML =
      '<div class="card center muted">' + UI.escapeHtml((window.OGBENJUWA.i18n && window.OGBENJUWA.i18n.t('loading')) || 'Loading…') + '</div>';

    api.get('/resources?' + q).then(function (res) {
      var list = normalize(res);
      render(list);
    }).catch(function (err) {
      document.getElementById('resources-list').innerHTML =
        '<div class="card center muted">' + UI.escapeHtml(err && err.message ? err.message : 'Could not load resources') + '</div>';
    });
  }

  function render(list) {
    var wrap = document.getElementById('resources-list');
    if (!list.length) {
      wrap.innerHTML = '<div class="card center muted">' +
        (window.OGBENJUWA.i18n && window.OGBENJUWA.i18n.t('no_resources')) +
        '</div>';
      return;
    }

    wrap.innerHTML = list.map(function (r) {
      var icon = TYPE_ICONS[r.type] || '📍';
      var name = UI.escapeHtml(r.name || 'Resource');
      var type = UI.escapeHtml((r.type || 'other').toUpperCase());
      var phone = r.phone ? '<a class="call-link" href="tel:' + UI.escapeHtml(r.phone) + '">📞 ' + UI.escapeHtml(r.phone) + '</a>' : '';
      var address = r.address ? UI.escapeHtml(r.address) : '';
      var active = r.isActive !== false;
      var statusEl = '<span class="badge badge-' + (active ? 'green' : 'red') + '">' + (active ? 'OPEN' : 'CLOSED') + '</span>';

      var bar = '';
      var cap = typeof r.capacity === 'number' ? r.capacity : 0;
      var occ = typeof r.occupied === 'number' ? r.occupied : 0;
      if (cap > 0) {
        var pct = Math.max(0, Math.min(100, Math.round((occ / cap) * 100)));
        var barColor = pct >= 80 ? '#dc2626' : pct >= 50 ? '#f59e0b' : '#2d9b57';
        bar = '<div class="capacity-bar"><div class="capacity-fill" style="width:' + pct + '%;background:' + barColor + ';"></div></div>' +
              '<div class="small muted">' + occ + ' / ' + cap + ' occupied</div>';
      }

      return '<div class="card resource-card">' +
        '<div class="resource-head"><span class="resource-icon">' + icon + '</span>' +
        '<div><div class="resource-name">' + name + '</div>' +
        '<div class="small muted resource-type">' + type + '</div></div>' +
        statusEl + '</div>' +
        (address ? '<div class="small muted mt-8">' + address + '</div>' : '') +
        (bar ? '<div class="mt-10">' + bar + '</div>' : '') +
        (phone ? '<div class="mt-10">' + phone + '</div>' : '') +
        '</div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Public page — allow guests, but preload session if present
    window.OGBENJUWA.boot.public();

    document.getElementById('type-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#type-chips .chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      currentType = chip.dataset.type || '';
      fetchResources();
    });

    fetchResources();
  });
})();