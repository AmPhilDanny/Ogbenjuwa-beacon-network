// ─── Ogbenjuwa Citizen App — Cordova bridge ─────────────────────────────
// Loaded on every page when running inside the Android app. Provides:
//   - platform detection + isNative()
//   - ready(cb): runs after Cordova "deviceready" (or immediately on web)
//   - vibration on panic, FCM push token capture, camera/file helpers

(function () {
  'use strict';

  var isNative = !!(window.cordova || window.Cordova || window.PhoneGap);

  function ready(cb) {
    if (!isNative) { cb(); return; }
    if (document.readyState === 'complete' && window.deviceReadyFired) { cb(); return; }
    document.addEventListener('deviceready', function onReady() {
      window.deviceReadyFired = true;
      document.removeEventListener('deviceready', onReady);
      cb();
    });
  }

  // Vibration for the panic trigger (falls back to navigator.vibrate)
  function vibrate(ms) {
    ms = ms || 300;
    try {
      if (isNative && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(ms);
      } else if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(ms);
      }
    } catch (e) { /* unsupported */ }
  }

  // Full-screen photo -> data URL (camera plugin) with graceful fallback
  function takePhoto(cb) {
    if (!isNative || !window.navigator || !window.navigator.camera) {
      if (cb) cb(null, 'NO_CAMERA');
      return;
    }
    window.navigator.camera.getPicture(
      function (dataUrl) { if (cb) cb(dataUrl.replace(/^data:image\/\w+;base64,/, '')); },
      function (err) { if (cb) cb(null, err); },
      {
        quality: 50,
        destinationType: window.Camera.DestinationType.DATA_URL,
        encodingType: window.Camera.EncodingType.JPEG,
        correctOrientation: true,
        saveToPhotoAlbum: false,
      }
    );
  }

  // Microphone audio capture via capture plugin (best-effort)
  function captureAudio(cb) {
    if (!isNative || !window.navigator || !window.navigator.device || !window.navigator.device.capture) {
      if (cb) cb(null, 'NO_AUDIO');
      return;
    }
    window.navigator.device.capture.captureAudio(
      function (files) { if (cb) cb(files); },
      function (err) { if (cb) cb(null, err); },
      { limit: 1, duration: 60 }
    );
  }

  // Device metadata (device plugin) for diagnostics / registration
  function deviceInfo() {
    if (isNative && window.device) {
      return {
        platform: window.device.platform,
        version: window.device.version,
        model: window.device.model,
        uuid: window.device.uuid,
      };
    }
    return null;
  }

  // Trigger push (FCM) handshake; token is kept in sessionStorage so the
  // app can later POST it to the API's push registration flow.
  function initPush() {
    if (!isNative || !window.PushNotification) return;
    ready(function () {
      try {
        var push = window.PushNotification.init({
          android: {
            sound: true,
            vibration: true,
            clearNotifications: true,
            showWhenInForeground: true,
          },
          ios: { alert: true, badge: true, sound: true },
        });
        push.on('registration', function (data) {
          try {
            sessionStorage.setItem('ogbenjuwa_push_token', data.registrationId || '');
          } catch (e) { /* sgb */ }
        });
        push.on('notification', function () { /* handoff to app UI */ });
        push.on('error', function () { /* silent */ });
      } catch (e) { /* plugin not configured yet */ }
    });
  }

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.platform = {
    isNative: isNative,
    ready: ready,
    vibrate: vibrate,
    takePhoto: takePhoto,
    captureAudio: captureAudio,
    deviceInfo: deviceInfo,
    initPush: initPush,
  };
})();