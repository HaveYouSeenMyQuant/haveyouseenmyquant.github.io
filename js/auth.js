/* ==========================================================================
 * SEAM — EMAIL / AUTH.  Two things live here and nothing else in the app
 * touches them: QQAuth.submitEmail(email), and the Supabase session.
 * ==========================================================================
 *
 * WHAT HAPPENS TODAY. The Supabase project in js/supabase-config.js is live and
 * email sign-in is switched on, so this does the real thing: POST /auth/v1/otp
 * sends a one-time sign-in link. Two outcomes, and the wall tells the player
 * which one they got:
 *
 *   mode: 'magic-link'  the provider accepted it; a link is on its way.
 *   mode: 'local'       the provider refused, or we are offline, or the page was
 *                       opened from a file:// URL. The address is kept on this
 *                       device and the road opens anyway.
 *
 * Either way the road unlocks. A learner is never trapped behind a mail server
 * we do not control, and we never claim an email was sent when it wasn't.
 *
 * THE RETURN TRIP, which is the half that used to be missing. Clicking the link
 * lands the browser back on this page carrying a session. Supabase can hand it
 * over three ways and we handle all three:
 *
 *   #access_token=…&refresh_token=…   the implicit flow. THIS is what this
 *                                     project emits today — the default email
 *                                     template points at /auth/v1/verify, which
 *                                     302s back here with the tokens in the
 *                                     fragment. Confirmed: auth.flow_state is
 *                                     empty for the sign-in that has happened.
 *   ?token_hash=…&type=magiclink      the newer template style; exchanged with
 *                                     POST /auth/v1/verify.
 *   ?code=…                           PKCE; exchanged with grant_type=pkce and
 *                                     the verifier we stashed when asking.
 *
 * In every case the credentials are stripped out of the address bar with
 * history.replaceState BEFORE anything else happens, including before any
 * network call. A magic-link URL that still has tokens in it is a live session
 * that gets pasted into chats, copied into bug reports and kept in history.
 *
 * The session is then kept in localStorage under 'qq.auth.v1' and restored on
 * every later load. An expired access token is refreshed with
 * grant_type=refresh_token. If that refresh is REJECTED (4xx — revoked, reused,
 * expired) we degrade to signed-out, quietly. If it merely FAILS (offline, 5xx)
 * we keep the session and try again later: being on a train is not a reason to
 * lose your account.
 *
 * SIGNED OUT IS A FIRST-CLASS STATE. hasAccess() is still true for a
 * device-local email, unit 1 still needs neither, and every call in here is
 * wrapped so that file://, aeroplane mode and a blocked domain all end up on the
 * same path: the road works, nothing syncs.
 *
 * WHAT MUST NEVER LIVE IN THIS FILE: the Supabase secret key or the database
 * password. GitHub Pages serves this file to the public. The publishable key in
 * supabase-config.js is the only credential allowed here, and Row Level Security
 * is what makes that safe.
 *
 * THE CONTRACT, if you swap providers:
 *     QQAuth.submitEmail(email) -> Promise<{ ok, mode, error? }>
 *     QQAuth.session()          -> { user:{id,email}, … } | null
 *     QQAuth.token()            -> Promise<accessToken|null>   (refreshes)
 *     QQAuth.apiFetch(path,opt) -> Promise<Response|null>       (authorised)
 *     QQAuth.hasAccess()        -> the one predicate gating the road
 * js/sync.js is the only caller of token()/apiFetch(); the app itself only ever
 * asks hasAccess() and session().
 * ========================================================================== */
(function (global) {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TIMEOUT_MS = 6000;
  var SESSION_KEY = 'qq.auth.v1';
  var VERIFIER_KEY = 'qq.auth.pkce.v1';
  var SKEW_S = 60;             // treat a token as expired a minute early

  function config() { return global.SUPABASE_CONFIG || null; }
  function isFile() { return global.location.protocol === 'file:'; }
  function nowS() { return Math.floor(Date.now() / 1000); }
  function canFetch() {
    return !!(global.fetch && config() && config().url && config().publishableKey && !isFile());
  }

  // --- storage that never throws (file:// and private mode can refuse) ------
  function readJSON(key) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeJSON(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  }
  function drop(key) {
    try { global.localStorage.removeItem(key); } catch (e) { /* nothing to do */ }
  }

  // --- session -------------------------------------------------------------
  var session = null;          // { access_token, refresh_token, expires_at, user }
  var arrivedWith = null;      // 'magic-link' | 'token-hash' | 'pkce' | null
  var lastError = null;        // last auth error, for the debug drawer
  var listeners = [];
  var readyResolve;
  var ready = new Promise(function (res) { readyResolve = res; });

  function emit(kind) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](kind, session); } catch (e) { /* a listener must not break auth */ }
    }
  }

  /* Read the claims out of a JWT. NOT a verification — the server does that on
   * every request. We only want the subject, the address and the expiry. */
  function decodeJwt(token) {
    try {
      var part = token.split('.')[1];
      if (!part) return null;
      var b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return JSON.parse(decodeURIComponent(escape(global.atob(b64))));
    } catch (e) { return null; }
  }

  function sessionFrom(data) {
    if (!data || !data.access_token || !data.refresh_token) return null;
    var claims = decodeJwt(data.access_token) || {};
    if (!claims.sub) return null;
    var exp = claims.exp || (data.expires_at ? +data.expires_at : 0) ||
              (nowS() + (+data.expires_in || 3600));
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: exp,
      user: { id: claims.sub, email: claims.email || (data.user && data.user.email) || null }
    };
  }

  function setSession(s, reason) {
    if (!s) return false;
    session = s;
    writeJSON(SESSION_KEY, s);
    /* Keep the device-local email in step, so every existing hasAccess() /
     * currentUser() caller keeps working unchanged and the road stays open even
     * if the session is later lost. */
    if (s.user && s.user.email && global.QQStore) {
      try { QQStore.setEmail(s.user.email); } catch (e) {}
    }
    emit(reason || 'signed-in');
    return true;
  }

  function forgetSession(reason) {
    session = null;
    drop(SESSION_KEY);
    emit(reason || 'signed-out');
  }

  function restore() {
    var s = readJSON(SESSION_KEY);
    if (s && s.access_token && s.refresh_token && s.user && s.user.id) {
      session = s;
      return true;
    }
    if (s) drop(SESSION_KEY);      // half a session is no session
    return false;
  }

  // --- the URL: take the credentials out of it, immediately ----------------
  function parsePairs(str) {
    var out = {};
    if (!str) return out;
    str.split('&').forEach(function (part) {
      if (!part) return;
      var i = part.indexOf('=');
      var k = i < 0 ? part : part.slice(0, i);
      var v = i < 0 ? '' : part.slice(i + 1);
      try { out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); }
      catch (e) { out[k] = v; }
    });
    return out;
  }

  var AUTH_PARAMS = [
    'access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type',
    'provider_token', 'provider_refresh_token', 'type', 'code', 'token_hash',
    'token', 'error', 'error_code', 'error_description'
  ];

  function without(pairs, drop_) {
    var kept = [];
    for (var k in pairs) {
      if (!Object.prototype.hasOwnProperty.call(pairs, k)) continue;
      if (drop_.indexOf(k) !== -1) continue;
      kept.push(encodeURIComponent(k) + (pairs[k] === '' ? '' : '=' + encodeURIComponent(pairs[k])));
    }
    return kept.join('&');
  }

  /* Rewrite the address bar with every auth parameter removed and everything
   * else (utm tags, ?debug=1, a real fragment) left alone. Called before any
   * await, so a token is never left sitting in a URL that can be copied. */
  function scrubUrl(hashPairs, queryPairs) {
    var loc = global.location;
    var q = without(queryPairs, AUTH_PARAMS);
    var h = without(hashPairs, AUTH_PARAMS);
    var url = loc.pathname + (q ? '?' + q : '') + (h ? '#' + h : '');
    try { global.history.replaceState(null, '', url); }
    catch (e) { /* file:// and some embeds refuse; nothing else to try safely */ }
  }

  function noteError(pairs) {
    if (!pairs.error && !pairs.error_code) return false;
    lastError = {
      error: pairs.error || pairs.error_code,
      description: pairs.error_description || null,
      at: Date.now()
    };
    return true;
  }

  function post(path, body, headers) {
    var cfg = config();
    var h = {
      'apikey': cfg.publishableKey,
      'Authorization': 'Bearer ' + cfg.publishableKey,
      'Content-Type': 'application/json'
    };
    for (var k in (headers || {})) h[k] = headers[k];
    return global.fetch(cfg.url + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
  }

  /* ?token_hash=…&type=magiclink — the newer email-template style. */
  function verifyTokenHash(tokenHash, type) {
    if (!canFetch()) return Promise.resolve(false);
    return post('/auth/v1/verify', { type: type || 'magiclink', token_hash: tokenHash })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) { lastError = { error: 'verify_failed', at: Date.now() }; return false; }
        return setSession(sessionFrom(d), 'signed-in');
      })
      .catch(function () { lastError = { error: 'verify_network', at: Date.now() }; return false; });
  }

  /* ?code=… — PKCE. We do not ASK for PKCE today (the otp call below sends no
   * code_challenge, and the one sign-in this project has seen came back through
   * the fragment), so this is a fallback for the day the provider or the
   * template changes. It is written, and it is unproven. */
  function exchangeCode(code) {
    if (!canFetch()) return Promise.resolve(false);
    var verifier = null;
    try { verifier = global.localStorage.getItem(VERIFIER_KEY); } catch (e) {}
    if (!verifier) { lastError = { error: 'pkce_no_verifier', at: Date.now() }; return Promise.resolve(false); }
    return post('/auth/v1/token?grant_type=pkce', { auth_code: code, code_verifier: verifier })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        drop(VERIFIER_KEY);
        if (!d) { lastError = { error: 'pkce_failed', at: Date.now() }; return false; }
        return setSession(sessionFrom(d), 'signed-in');
      })
      .catch(function () { lastError = { error: 'pkce_network', at: Date.now() }; return false; });
  }

  function captureFromUrl() {
    var loc = global.location;
    var hash = parsePairs((loc.hash || '').replace(/^#/, ''));
    var query = parsePairs((loc.search || '').replace(/^\?/, ''));
    var hasAuthBits = hash.access_token || hash.error || query.code || query.token_hash ||
                      (query.token && query.type) || query.error;
    if (!hasAuthBits) return Promise.resolve(false);

    // 1. address bar first, always, before any network call
    scrubUrl(hash, query);
    noteError(hash) || noteError(query);

    // 2. implicit flow — what this project emits today
    if (hash.access_token && hash.refresh_token) {
      var s = sessionFrom(hash);
      if (s) { arrivedWith = 'magic-link'; setSession(s, 'signed-in'); return Promise.resolve(true); }
      lastError = { error: 'unreadable_token', at: Date.now() };
      return Promise.resolve(false);
    }
    // 3. token_hash template
    if (query.token_hash || (query.token && query.type)) {
      arrivedWith = 'token-hash';
      return verifyTokenHash(query.token_hash || query.token, query.type);
    }
    // 4. PKCE
    if (query.code) {
      arrivedWith = 'pkce';
      return exchangeCode(query.code);
    }
    return Promise.resolve(false);
  }

  // --- keeping the token fresh ---------------------------------------------
  var refreshing = null;

  function refresh() {
    if (!session || !session.refresh_token) return Promise.resolve(null);
    if (!canFetch()) return Promise.resolve(null);
    if (refreshing) return refreshing;
    var token = session.refresh_token;
    refreshing = post('/auth/v1/token?grant_type=refresh_token', { refresh_token: token })
      .then(function (r) {
        /* 4xx means the provider has REJECTED this refresh token: revoked,
         * reused, or long expired. That is a real signed-out, so become signed
         * out rather than erroring at the player. 5xx or a thrown fetch is a bad
         * moment, not a bad token — keep the session and try again later. */
        if (r.status >= 400 && r.status < 500) {
          lastError = { error: 'refresh_rejected', status: r.status, at: Date.now() };
          forgetSession('refresh-rejected');
          return null;
        }
        if (!r.ok) return null;
        return r.json().then(function (d) {
          var s = sessionFrom(d);
          if (!s) return null;
          setSession(s, 'refreshed');
          return s.access_token;
        });
      })
      .catch(function () { return null; })
      .then(function (v) { refreshing = null; return v; });
    return refreshing;
  }

  var QQAuth = {
    /* True while a real session can be established at all. */
    isLive: function () { return !!(config() && config().url); },

    /* Resolves once any magic-link return has been dealt with. The app boots
     * without waiting on it and re-renders when it settles — nothing on screen
     * is ever gated on the network. */
    ready: ready,

    session: function () { return session; },
    isSignedIn: function () { return !!(session && session.user && session.user.id); },
    userId: function () { return session && session.user ? session.user.id : null; },
    arrivedWith: function () { return arrivedWith; },
    lastError: function () { return lastError; },

    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },

    /* A fresh access token, or null if we cannot get one right now. Never
     * throws, never rejects. */
    token: function () {
      if (!session) return Promise.resolve(null);
      if (session.expires_at - SKEW_S > nowS()) return Promise.resolve(session.access_token);
      return refresh();
    },

    /* One authorised call against the project. Resolves with the Response, or
     * null when there is no session / no network / the call blew up. A 401 is
     * retried once behind a refresh, because an access token can expire between
     * the check and the wire. */
    apiFetch: function (path, opts) {
      if (!canFetch()) return Promise.resolve(null);
      var cfg = config();
      var self = this;
      return this.token().then(function (tok) {
        if (!tok) return null;
        function send(t) {
          var o = opts || {};
          var headers = {
            'apikey': cfg.publishableKey,
            'Authorization': 'Bearer ' + t,
            'Content-Type': 'application/json'
          };
          for (var k in (o.headers || {})) headers[k] = o.headers[k];
          return global.fetch(cfg.url + path, {
            method: o.method || 'GET',
            headers: headers,
            body: o.body,
            keepalive: !!o.keepalive
          });
        }
        return send(tok).then(function (r) {
          if (r.status !== 401) return r;
          return refresh().then(function (t2) { return t2 ? send(t2) : r; });
        });
      }).catch(function () { return null; });
    },

    validate: function (email) {
      if (!email) return 'Enter an email address.';
      if (email.length > 254) return 'That address is too long.';
      if (!EMAIL_RE.test(email)) return "That doesn't look like an email address.";
      return null;
    },

    /* THE seam function. Swap the body; keep the signature. */
    submitEmail: function (email) {
      var err = this.validate(email);
      if (err) return Promise.resolve({ ok: false, error: err });
      QQStore.setEmail(email);            // unlock first: never gate on a network
      return sendMagicLink(email).then(function (sent) {
        return { ok: true, mode: sent ? 'magic-link' : 'local' };
      });
    },

    currentUser: function () {
      if (session && session.user) {
        return { email: session.user.email, id: session.user.id, source: 'account' };
      }
      var e = QQStore.email();
      return e ? { email: e, source: 'local' } : null;
    },

    /* Everything past unit 1 is gated on this one predicate. A real session
     * makes it true; so does a device-local address, which is what keeps the
     * signed-out road working exactly as it did. */
    hasAccess: function () { return !!(this.isSignedIn() || QQStore.hasEmail()); },

    signOut: function () {
      var had = !!session;
      if (had && canFetch()) {
        /* Best effort: kill the refresh token server-side too. We do not wait
         * for it and we do not care if it fails. */
        var tok = session.access_token;
        try {
          post('/auth/v1/logout', {}, { 'Authorization': 'Bearer ' + tok }).catch(function () {});
        } catch (e) {}
      }
      forgetSession('signed-out');
      QQStore.setEmail(null);
      return had;
    },

    /* The wall's small print, written here because this module is the only one
     * that knows what is actually connected. */
    wallSmallPrint: function () {
      if (isFile()) {
        return 'Opened from a file, so nothing can be sent. Your address stays on this device.';
      }
      /* Three jobs, in this order. (1) Kill the friction: submitEmail unlocks
       * before the network call, so nobody has to leave the page or go and
       * find a link — saying so is the difference between a tap and a chore,
       * and 2 of the first 3 signups never clicked the link they were sent.
       * (2) State the cadence, because that IS the consent: one a day is what
       * pipeline/daily_email.py sends, so it is what this must promise. It
       * said "at most one message a week" until 2026-08-02, and a daily send
       * under that wording would have been a bait-and-switch on every address
       * we hold. (3) Name the exit before they commit, not after. */
      return 'Unlocked straight away — no link to click. Then one question a ' +
             'day, and one tap to stop. Nothing already solved is lost.';
    }
  };

  /* Ask Supabase to send a magic link. Resolves true only if it really accepted
   * the request; any refusal, timeout or network error resolves false so the
   * caller can fall back and say so. */
  function sendMagicLink(email) {
    if (!canFetch()) return Promise.resolve(false);
    if (global.navigator && global.navigator.onLine === false) return Promise.resolve(false);

    var body = { email: email, create_user: true };
    var target = global.location.origin + global.location.pathname;
    body.options = { email_redirect_to: target };

    var timed = new Promise(function (resolve) { setTimeout(function () { resolve(false); }, TIMEOUT_MS); });
    var call = post('/auth/v1/otp', body)
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });

    return Promise.race([call, timed]);
  }

  // --- boot: restore first, then take anything out of the URL ---------------
  restore();
  var captured;
  try { captured = captureFromUrl(); } catch (e) { captured = Promise.resolve(false); }

  /* A magic link opened into a tab that is ALREADY on this page changes only
   * the fragment, and Chrome does not reload for that — the module above would
   * never see the tokens. Seen while testing; cheap to cover. */
  global.addEventListener('hashchange', function () {
    if (!/access_token=/.test(global.location.hash || '')) return;
    try { captureFromUrl(); } catch (e) { /* never load-bearing */ }
  });
  captured.then(function () { readyResolve(QQAuth.isSignedIn()); },
                function () { readyResolve(QQAuth.isSignedIn()); });

  global.QQAuth = QQAuth;
})(window);
