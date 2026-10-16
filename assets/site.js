// Shared behavior for every page: theme toggle, cookie banner, mobile nav, and the
// live synth embeds. Theme and cookie-banner answers are shared with the app
// (app.synthpatch.io) through cookies on the parent domain; see the app's
// src/lib/sharedPrefs.ts, which uses the same names and values.
(function () {
  var CONSENT_COOKIE = 'synthpatch-consent';
  var THEME_COOKIE = 'synthpatch-theme';
  var LEGACY_CONSENT_KEY = 'synthpatch-cookie-consent';
  var THEME_KEY = 'synth-patch-theme';
  var MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

  // Local builds of the site talk to a local app (npm run dev in synth-patch-ui)
  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  var APP_URL = isLocal ? 'http://localhost:3000' : 'https://app.synthpatch.io';

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function writeCookie(name, value) {
    var parts = [name + '=' + encodeURIComponent(value), 'Path=/', 'Max-Age=' + MAX_AGE_SECONDS, 'SameSite=Lax'];
    if (host === 'synthpatch.io' || /\.synthpatch\.io$/.test(host)) parts.push('Domain=.synthpatch.io');
    if (window.location.protocol === 'https:') parts.push('Secure');
    document.cookie = parts.join('; ');
  }

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeStorage(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: the cookie still carries the choice */ }
  }

  // ---------------------------------------------------------------- Theme
  // Same cycle and icons as the app's header: light -> dark -> system -> light

  var THEMES = ['light', 'dark', 'system'];
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    var theme = readCookie(THEME_COOKIE) || readStorage(THEME_KEY);
    return THEMES.indexOf(theme) === -1 ? 'system' : theme;
  }

  var theme = storedTheme();

  function resolvedTheme() {
    if (theme === 'system') return systemDark.matches ? 'dark' : 'light';
    return theme;
  }

  function nextTheme() {
    return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  }

  function applyTheme() {
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.title = 'Switch to ' + nextTheme() + ' mode';
      button.querySelectorAll('[data-theme-icon]').forEach(function (icon) {
        var iconFor = icon.getAttribute('data-theme-icon');
        var show = theme === 'system' ? iconFor === 'system' : iconFor === resolvedTheme();
        icon.classList.toggle('hidden', !show);
      });
    });

    postToEmbeds({ type: 'synthpatch:theme', theme: theme });
  }

  systemDark.addEventListener('change', function () {
    if (theme === 'system') applyTheme();
  });

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      theme = nextTheme();
      writeCookie(THEME_COOKIE, theme);
      writeStorage(THEME_KEY, theme);
      applyTheme();
    });
  });

  // ---------------------------------------------------------- Cookie banner

  (function () {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    var answer = readCookie(CONSENT_COOKIE) || readStorage(LEGACY_CONSENT_KEY);
    if (answer === 'accepted' || answer === 'declined') {
      // Answered before the cookie existed: share it with the app from now on
      if (!readCookie(CONSENT_COOKIE)) writeCookie(CONSENT_COOKIE, answer);
      return;
    }
    banner.classList.remove('hidden');

    function save(value) {
      writeCookie(CONSENT_COOKIE, value);
      writeStorage(LEGACY_CONSENT_KEY, value);
      writeStorage('umami.disabled', value === 'declined' ? '1' : null);
      banner.classList.add('hidden');
    }

    document.getElementById('cookie-accept').addEventListener('click', function () { save('accepted'); });
    document.getElementById('cookie-decline').addEventListener('click', function () { save('declined'); });
  })();

  // ------------------------------------------------------------- Mobile nav

  (function () {
    var button = document.getElementById('mobile-nav-button');
    var menu = document.getElementById('mobile-nav');
    if (!button || !menu) return;

    button.addEventListener('click', function () {
      var open = menu.classList.toggle('hidden') === false;
      button.setAttribute('aria-expanded', String(open));
      button.querySelector('[data-icon="menu"]').classList.toggle('hidden', open);
      button.querySelector('[data-icon="close"]').classList.toggle('hidden', !open);
    });
  })();

  // ------------------------------------------------------- Live synth embeds
  // <iframe data-synth-embed="/embed/synth/<slug>?..."> loads the app's synth panel.
  // The embed reports its height and readiness; buttons with data-synth-reset or
  // data-synth-new-patch (set to the iframe's id) drive it.

  var embeds = Array.prototype.slice.call(document.querySelectorAll('iframe[data-synth-embed]'));
  var newPatchFallback = null; // timer for the "Use as a new patch" fallback

  function postToEmbeds(message) {
    embeds.forEach(function (frame) {
      if (frame.contentWindow) frame.contentWindow.postMessage(message, APP_URL);
    });
  }

  embeds.forEach(function (frame) {
    frame.src = APP_URL + frame.getAttribute('data-synth-embed');
  });

  window.addEventListener('message', function (event) {
    if (event.origin !== APP_URL) return;
    var frame = embeds.filter(function (f) { return f.contentWindow === event.source; })[0];
    var data = event.data || {};
    if (!frame) return;

    if (data.type === 'synthpatch:height' && data.height > 0) {
      frame.style.aspectRatio = 'auto';
      frame.style.height = data.height + 'px';
    } else if (data.type === 'synthpatch:ready') {
      frame.contentWindow.postMessage({ type: 'synthpatch:theme', theme: theme }, APP_URL);
      frame.classList.remove('opacity-0');
      document.querySelectorAll('[data-synth-placeholder="' + frame.id + '"]').forEach(function (placeholder) {
        placeholder.remove();
      });
    } else if (data.type === 'synthpatch:open-url' && typeof data.url === 'string' && data.url.indexOf(APP_URL + '/') === 0) {
      clearTimeout(newPatchFallback);
      window.location.href = data.url;
    }
  });

  document.querySelectorAll('[data-synth-reset]').forEach(function (button) {
    button.addEventListener('click', function () {
      var frame = document.getElementById(button.getAttribute('data-synth-reset'));
      if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'synthpatch:reset' }, APP_URL);
    });
  });

  // Hands the panel's current state to the app's editor. The embed stashes it in
  // the app's storage and replies with the editor URL; if it doesn't answer, fall
  // back to the synth's page on the app.
  document.querySelectorAll('[data-synth-new-patch]').forEach(function (button) {
    button.addEventListener('click', function () {
      var frame = document.getElementById(button.getAttribute('data-synth-new-patch'));
      var fallback = button.getAttribute('data-fallback-url');
      if (!frame || !frame.contentWindow) {
        if (fallback) window.location.href = fallback;
        return;
      }
      frame.contentWindow.postMessage({ type: 'synthpatch:use-as-new-patch' }, APP_URL);
      if (fallback) {
        clearTimeout(newPatchFallback);
        newPatchFallback = setTimeout(function () { window.location.href = fallback; }, 2000);
      }
    });
  });

  applyTheme();
})();
