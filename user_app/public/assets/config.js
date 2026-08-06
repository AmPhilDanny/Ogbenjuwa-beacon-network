// ─── Ogbenjuwa Citizen App — Runtime Config ─────────────────────────────
// Pure static site: no build step, no env vars. Resolve at load time.
// Production default: the live Central Command API.
// Override for local dev by editing API_BASE below (e.g. http://localhost:4001/api/v1).

(function () {
  'use strict';

  var API_BASE = 'https://ogbenjuwa-api.onrender.com/api/v1';

  function getWsUrl() {
    // http://host/api/v1  ->  ws://host/ws   (and https -> wss)
    return API_BASE
      .replace(/^http/, 'ws')
      .replace(/\/api\/v1\/?$/, '')
      + '/ws';
  }

  window.OGBENJUWA_CONFIG = {
    API_BASE: API_BASE,
    WS_URL: getWsUrl(),
    APP_NAME: 'Ogbenjuwa',
    APP_TAGLINE: 'Community Safety Network',
    REGION: 'Idoma Region · Benue State, Nigeria',
    SMS_SHORTCODE: '*347#',
    DEFAULT_LGA_ID: null, // set at runtime from /lgas
    VERSION: '1.0.0',
  };
})();
