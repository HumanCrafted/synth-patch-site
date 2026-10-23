// Shared behavior for every page: theme toggle, cookie banner, mobile nav, and the
// synth embed placeholders. The cookie-banner answer is shared with the app
// (app.synthpatch.io) through a cookie on the parent domain; see the app's
// src/lib/sharedPrefs.ts, which uses the same name and values.
(function () {
  var CONSENT_COOKIE = 'synthpatch-consent';
  var LEGACY_CONSENT_KEY = 'synthpatch-cookie-consent';
  var THEME_KEY = 'synth-patch-theme';
  var MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

  var host = window.location.hostname;

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
    var theme = readStorage(THEME_KEY);
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
  }

  systemDark.addEventListener('change', function () {
    if (theme === 'system') applyTheme();
  });

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      theme = nextTheme();
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

  // ------------------------------------------------------------ Synth embeds
  // Keep the thumbnail over an embed until the synth has drawn. The iframe's load
  // event fires while the embed is still fetching the patch, so the embed posts
  // 'synthpatch:embed-ready' to its parent once the panel is on screen. If that
  // never comes (an older app build), fall back to a delay after load.

  document.querySelectorAll('[data-synth-placeholder]').forEach(function (placeholder) {
    var frame = placeholder.parentElement.querySelector('iframe');
    if (!frame) return;

    var done = false;
    function reveal() {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMessage);
      placeholder.style.opacity = '0';
      setTimeout(function () { placeholder.remove(); }, 300);
    }
    function onMessage(event) {
      if (event.source === frame.contentWindow && event.data && event.data.type === 'synthpatch:embed-ready') reveal();
    }

    window.addEventListener('message', onMessage);
    frame.addEventListener('load', function () { setTimeout(reveal, 4000); });
    setTimeout(reveal, 10000);
  });

  applyTheme();
})();
