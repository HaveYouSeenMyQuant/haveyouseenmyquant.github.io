/* ==========================================================================
 * SEAM — EMAIL / AUTH.  One module, one function: QQAuth.submitEmail(email).
 * ==========================================================================
 *
 * WHAT HAPPENS TODAY. The Supabase project in js/supabase-config.js is live, so
 * this tries the real thing first: POST /auth/v1/otp, which sends a one-time
 * sign-in link. Two outcomes, and the wall tells the player which one they got:
 *
 *   mode: 'magic-link'  the provider accepted it; a link is on its way.
 *   mode: 'local'       the provider refused, or we are offline, or the page was
 *                       opened from a file:// URL. The address is kept on this
 *                       device and the road opens anyway.
 *
 * Either way the road unlocks. A learner is never trapped behind a mail server
 * we do not control, and we never claim an email was sent when it wasn't.
 *
 * WHAT THE USER STILL HAS TO DO for 'magic-link' to be the normal path (Claude
 * cannot do these — they need the Supabase dashboard):
 *   1. Authentication -> Providers -> Email: turn it on.
 *   2. Authentication -> URL Configuration: add the site URL
 *      (https://gaspardol.github.io/quant-road/) to the redirect allow-list.
 *   3. Optional but wise: set up a real SMTP sender, because the built-in one is
 *      rate-limited to a handful of messages an hour.
 * Until then every submission lands in the 'local' branch, which is honest and
 * loses nothing: the email_submitted event still fires with the domain, so the
 * wall's conversion rate is measurable from day one.
 *
 * WHAT MUST NEVER LIVE IN THIS FILE: the Supabase secret key or the database
 * password. GitHub Pages serves this file to the public. The publishable key in
 * supabase-config.js is the only credential allowed here, and Row Level Security
 * is what makes that safe.
 *
 * THE CONTRACT, if you swap providers:
 *     QQAuth.submitEmail(email) -> Promise<{ ok, mode, error? }>
 * Nothing else in the app touches auth. Access past unit 1 is gated on the one
 * predicate QQAuth.hasAccess().
 * ========================================================================== */
(function (global) {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TIMEOUT_MS = 6000;

  function config() { return global.SUPABASE_CONFIG || null; }

  function redirectTarget() {
    if (global.location.protocol === 'file:') return null;   // no useful origin
    return global.location.origin + global.location.pathname;
  }

  /* Ask Supabase to send a magic link. Resolves true only if it really accepted
   * the request; any refusal, timeout or network error resolves false so the
   * caller can fall back and say so. */
  function sendMagicLink(email) {
    var cfg = config();
    if (!cfg || !cfg.url || !cfg.publishableKey) return Promise.resolve(false);
    if (!global.fetch) return Promise.resolve(false);
    if (global.location.protocol === 'file:') return Promise.resolve(false);
    if (global.navigator && global.navigator.onLine === false) return Promise.resolve(false);

    var body = { email: email, create_user: true };
    var target = redirectTarget();
    if (target) body.options = { email_redirect_to: target };

    var timed = new Promise(function (resolve) { setTimeout(function () { resolve(false); }, TIMEOUT_MS); });
    var call = global.fetch(cfg.url + '/auth/v1/otp', {
      method: 'POST',
      headers: {
        'apikey': cfg.publishableKey,
        'Authorization': 'Bearer ' + cfg.publishableKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });

    return Promise.race([call, timed]);
  }

  var QQAuth = {
    /* True while no real session can be established — the README and the wall's
     * small print both read this rather than guessing. */
    isLive: function () { return !!(config() && config().url); },

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
      var e = QQStore.email();
      return e ? { email: e, source: 'local' } : null;
    },

    /* Everything past unit 1 is gated on this one predicate, so a real session
     * only has to make it true. */
    hasAccess: function () { return !!QQStore.hasEmail(); },

    signOut: function () { QQStore.setEmail(null); },

    /* The wall's small print, written here because this module is the only one
     * that knows what is actually connected. */
    wallSmallPrint: function () {
      if (global.location.protocol === 'file:') {
        return 'You have opened this from a file on your own machine, so nothing can be sent. ' +
          'Your address stays on this device and the road opens straight away.';
      }
      return 'We will only ever use this to send you a sign-in link and, at most, one message a week. ' +
        'The address is kept on your device too, so the road opens straight away either way.';
    }
  };

  global.QQAuth = QQAuth;
})(window);
