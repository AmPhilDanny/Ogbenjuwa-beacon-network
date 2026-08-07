// ─── Ogbenjuwa Citizen App — Community resources (resources.html) ────────
// Public endpoint: GET /resources?type=&lgaId=&wardId=&villageId=

(function () {
  'use strict';

  var api = window.OGBENJUWA.api;
  var UI = window.OGBENJUWA.UI;

  var currentType = '';
  var selectedLgaId = '';
  var selectedWardId = '';
  var selectedVillageId = '';
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
    if (selectedLgaId) q += '&lgaId=' + encodeURIComponent(selectedLgaId);
    if (selectedWardId) q += '&wardId=' + encodeURIComponent(selectedWardId);
    if (selectedVillageId) q += '&villageId=' + encodeURIComponent(selectedVillageId);

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

  function populateSelect(selId, items, placeholder) {
    var sel = document.getElementById(selId);
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">' + (placeholder || 'All') + '</option>';
    items.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      sel.appendChild(opt);
    });
    if (prev && Array.prototype.some.call(sel.options, function (o) { return o.value === prev; })) {
      sel.value = prev;
    } else {
      sel.selectedIndex = 0;
    }
  }

  function loadWardsAndVillages(lgaId) {
    selectedWardId = '';
    selectedVillageId = '';
    document.getElementById('filter-ward').innerHTML = '<option value="">All wards</option>';
    document.getElementById('filter-village').innerHTML = '<option value="">All villages</option>';
    if (!lgaId) return;

    api.get('/lgas/' + encodeURIComponent(lgaId) + '/wards').then(function (res) {
      populateSelect('filter-ward', normalize(res), 'All wards');
    }).catch(function () { /* leave empty */ });

    api.get('/villages?lgaId=' + encodeURIComponent(lgaId)).then(function (res) {
      populateSelect('filter-village', normalize(res), 'All villages');
    }).catch(function () { /* leave empty */ });
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
    window.OGBENJUWA.boot.public();

    document.getElementById('type-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#type-chips .chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      currentType = chip.dataset.type || '';
      fetchResources();
    });

    api.get('/lgas').then(function (res) {
      var lgas = normalize(res);
      populateSelect('filter-lga', lgas, 'All LGAs');
      if (session && session.lgaId) {
        selectedLgaId = session.lgaId;
        document.getElementById('filter-lga').value = session.lgaId;
      }
      loadWardsAndVillages(document.getElementById('filter-lga').value);
      fetchResources();
    }).catch(function () {
      fetchResources();
    });

    document.getElementById('filter-lga').addEventListener('change', function (e) {
      selectedLgaId = e.target.value || '';
      loadWardsAndVillages(e.target.value || '');
      fetchResources();
    });
    document.getElementById('filter-ward').addEventListener('change', function (e) {
      selectedWardId = e.target.value || '';
      fetchResources();
    });
    document.getElementById('filter-village').addEventListener('change', function (e) {
      selectedVillageId = e.target.value || '';
      fetchResources();
    });
  });
})();