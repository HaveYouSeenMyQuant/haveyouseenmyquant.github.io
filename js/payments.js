/* ==========================================================================
 * PAYMENTS — Gumroad membership: checkout, licence-key redemption, re-checks.
 * ==========================================================================
 *
 * The rule this file exists to enforce: money only ever buys the LIBRARIES —
 * the separate, named question sets off to the side. The main road is free for
 * ever. Nothing in this module can lock a road level; it does not even know
 * levels exist.
 *
 * WHAT IS SOLD. One recurring MEMBERSHIP, not a product per library. An active
 * membership opens every premium library, including ones that do not exist yet,
 * which is the point: the subscription buys the shelf, not the book.
 *
 * WHY GUMROAD. The site is static on GitHub Pages. There is no server, so there
 * is nowhere to hold a secret and nowhere to receive a webhook. Gumroad is one
 * of the few processors that still works under that constraint:
 *
 *   - checkout opens as an OVERLAY straight from the product permalink. No key,
 *     no token, no server call. The permalink is public by design.
 *   - a purchase issues a LICENCE KEY, and Gumroad exposes a licence VERIFY
 *     endpoint that takes product_id + license_key and needs NO access token.
 *     Verified 2026-07-31 against the live endpoint: it answers cross-origin
 *     (access-control-allow-origin: *) and preflights cleanly, so a browser can
 *     call it directly.
 *
 * So the flow is: subscribe on Gumroad -> get a licence key by email -> paste it
 * in here once -> we verify it -> member. Which also gives us the restore path
 * for free: the key IS the receipt, so a reinstall or a new phone is "paste the
 * key again", not a support ticket.
 *
 * ==========================================================================
 * THE HARD PART: A SUBSCRIPTION IS NOT A PURCHASE.
 * ==========================================================================
 * A one-off is verified once and you are done for ever. A membership verified
 * once and cached for ever is a bug with a name: subscribe, cancel the next day,
 * keep access until the heat death of the universe. Access has to END when the
 * membership does.
 *
 * Gumroad's verify response carries the subscription state on `purchase`. These
 * are the fields, read off the live API docs on 2026-07-31 rather than guessed —
 * all three are documented "subscription product only":
 *
 *   subscription_cancelled_at   the subscriber cancelled. Gumroad does NOT end
 *                               the subscription there and then; they keep what
 *                               they paid for until the period runs out.
 *   subscription_ended_at       it is actually over. This is the revoke signal.
 *   subscription_failed_at      we could not charge the card. Gumroad retries
 *                               for days before giving up.
 *   refunded / disputed / chargebacked   money went back. Revoke.
 *   recurrence                  'monthly', 'yearly', ...
 *
 * There is NO next-charge or paid-through date in the verify response. So the
 * end of the paid period cannot be computed; it has to be OBSERVED, by asking
 * Gumroad again and watching for subscription_ended_at to appear. That single
 * fact is what shapes everything below.
 *
 * The state we keep is therefore not "is a member" but one timestamp:
 *
 *     membership_until — access is granted while now() < this.
 *
 * and the server pushes it forward by ACCESS_TTL (3 days) every time a check
 * comes back healthy. Which gives, for free:
 *
 *   - cancelled-but-not-ended keeps working, because Gumroad still says it is
 *     alive, and stops within a day of subscription_ended_at appearing. That is
 *     "runs to the end of the paid period" without needing to know the date.
 *   - a failed charge does NOT revoke on the first bounce. The retry window is
 *     honoured (DUNNING_GRACE, 7 days from subscription_failed_at) because
 *     Gumroad's dunning runs about a week, and if it truly fails Gumroad sets
 *     subscription_ended_at and the normal path revokes properly. Bouncing a
 *     paying customer out over a card that expired on Tuesday is how you turn a
 *     billing hiccup into a cancellation.
 *   - an outage cannot lock a member out. Checks are daily and the grant runs
 *     three days, so Gumroad and Supabase can both be down for two days running
 *     and every paying member still gets in. Offline on a plane: same.
 *   - a genuinely lapsed member loses access at the next SUCCESSFUL check, and
 *     within three days regardless. Never silently for ever.
 *
 * WHO IS THE AUTHORITY. Two layers, and they are not equal:
 *
 *   device   localStorage, written here. Instant, works signed-out, and is a
 *            CACHE, not a permission. A browser can lie to itself.
 *   account  the membership columns on profiles, written ONLY by the
 *            security-definer function redeem_license() / verify_membership()
 *            in site/schema.sql. The browser cannot write them: the column
 *            grants were revoked after a real hole was found where a signed-in
 *            user could simply PATCH themselves a paid library. Do not undo
 *            that to make life easier — it is the only thing between devtools
 *            and the paywall.
 *
 * NEVER LOAD-BEARING. Every path here fails soft. Offline, script blocked,
 * Gumroad down, function not deployed: the lesson UI must not notice. Nothing
 * in this file throws into the app.
 * ========================================================================== */
(function (global) {
  'use strict';

  /* ======================================================================
   * CONFIG — THE ONE PLACE THE OWNER EDITS.
   * ======================================================================
   *
   * Nothing else in site/ changes to switch payments on, and nothing secret
   * goes here: a permalink and a product id are both public (they are in the
   * product's own URL and in every buyer's receipt). Gumroad's ACCESS TOKEN is
   * never needed by this file and must NEVER appear in site/ —
   * pipeline/deploy_site.sh greps this folder and refuses to publish anything
   * that looks like a credential.
   *
   * THE ONE REMAINING STEP, and why the buy button is still hidden.
   * ----------------------------------------------------------------------
   * The product exists and is PUBLISHED. What is missing is licence keys, and
   * the reason it was hard to find is that Gumroad no longer has a "generate a
   * unique licence key per sale" checkbox. There is no such toggle on the
   * Product tab, the Content tab, or anywhere in the 4MB of JavaScript that
   * page loads — I searched all 126 chunks on 2026-07-31. Licence keys are now
   * turned on by INSERTING A CONTENT BLOCK:
   *
   *     Product -> Content tab -> the "Insert" menu -> "License key"
   *
   * Confirmed present in that menu for THIS membership, so licence keys are
   * fully supported here; they are simply switched off. The live product state
   * currently says is_licensed:false, which is exactly what "the block has not
   * been inserted yet" looks like.
   *
   * Once the block is inserted and the product SAVED:
   *   - every subscriber is issued a licence key, shown in their content and in
   *     their receipt, and it stays the same across the recurring charges;
   *   - the block itself displays the PRODUCT ID, which is the last value this
   *     file needs. Copy it into `productId` below AND into gumroad_config in
   *     site/schema.sql. It is a base64-looking string, usually ending '==' —
   *     NOT the permalink, and not the numeric id on the public page. Swapping
   *     them makes every real key look invalid.
   *
   * `productId` is deliberately the gate on the whole buy flow (see verifiable()
   * below). That is not arbitrary: the ONLY place to read a product id is the
   * licence-key block, so possessing one is proof that licensing is on. Until
   * it is pasted here, the site refuses to send anybody to a checkout it cannot
   * honour. Delaying a sale is cheap; taking £14.99 from someone and then
   * locking them out is not.
   */
  var GUMROAD = {
    /* Live and published: https://haveyouseenmyquant.gumroad.com/l/otzuy */
    seller: 'haveyouseenmyquant',
    permalink: 'otzuy',

    /* STILL REQUIRED. From the "License key" block on the Content tab, after
     * inserting it (see above). Until this is real, nothing can be bought. */
    productId: '8RKxcKgSCTsAN1aAxD974Q==',

    /* GBP — the product is priced in pounds (the live product state says
     * currency_code:"gbp"). Must match Gumroad exactly; this is the number a
     * person reads immediately before deciding to pay. */
    priceLabel: '£14.99 a month',
    name: 'Library membership'
  };

  /* Where a person who has ALREADY paid but cannot be verified should turn.
   * Replace with a real address to show it on screen. Left null deliberately
   * rather than filled with a guess: pointing people at an address that bounces
   * is worse than pointing them at their receipt, which every Gumroad buyer
   * has and which always reaches the seller. */
  var SUPPORT_EMAIL = null;

  /* How long one healthy check is trusted for. The offline / outage cushion:
   * checks are daily, so both Gumroad and Supabase can be unreachable for two
   * days running and every paying member still gets in. */
  var ACCESS_TTL_MS = 3 * 24 * 3600 * 1000;

  /* How long after a failed recurring charge we keep access while Gumroad
   * retries. Mirrors Gumroad's dunning window; if the card really is dead they
   * set subscription_ended_at and the ordinary path revokes. */
  var DUNNING_GRACE_MS = 7 * 24 * 3600 * 1000;

  /* Do not ask Gumroad again more often than this. The server enforces the same
   * limit — this one only avoids pointless round trips from the browser. */
  var RECHECK_MS = 24 * 3600 * 1000;

  var VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';
  var OVERLAY_SRC = 'https://gumroad.com/js/gumroad.js';
  var OVERLAY_TIMEOUT_MS = 6000;
  var OVERLAY_SETTLE_MS = 1600;
  var PLACEHOLDER = /^PASTE_/;

  /* Loose on purpose. Gumroad keys are four dash-separated blocks today, but
   * rejecting anything that is not exactly that would mean a format change on
   * their side silently breaks every redemption. This only catches the "pasted
   * their email address" class of mistake. */
  var KEY_RE = /^[A-Za-z0-9-]{8,64}$/;

  var LOCAL_KEY = 'qq.membership.v1';

  // ======================================================================
  // device-local membership cache
  // ======================================================================
  /* Its own localStorage key rather than a field in QQStore: membership is not
   * progress, it does not merge, and it must never ride along in the sync
   * payload where it would look like something the browser may assert.
   *
   * The full licence key is kept here, not just a tail. It has to be: a
   * signed-out member is re-verified against Gumroad on a schedule, and that is
   * impossible without the key. It is the player's own receipt, on their own
   * device, and it grants nothing except a re-read of their own subscription
   * state. Signed-in members are re-verified server-side instead. */
  var cache = null;

  function loadCache() {
    if (cache) return cache;
    var raw = null;
    try { raw = global.localStorage.getItem(LOCAL_KEY); } catch (e) { raw = null; }
    if (raw) { try { cache = JSON.parse(raw); } catch (e) { cache = null; } }
    if (!cache || typeof cache !== 'object') {
      cache = { status: 'none', until: 0, checkedAt: 0, key: null, scope: null };
    }
    return cache;
  }

  function saveCache() {
    try { global.localStorage.setItem(LOCAL_KEY, JSON.stringify(loadCache())); }
    catch (e) { /* private mode: the membership lasts this session, which is fine */ }
  }

  function setCache(next) {
    var c = loadCache();
    for (var k in next) c[k] = next[k];
    saveCache();
    notify();
    return c;
  }

  var listeners = [];
  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](membership()); } catch (e) { /* a render must never break payments */ }
    }
  }

  function track(name, props) {
    try { if (global.QQA) QQA.track(name, props || {}); } catch (e) {}
  }

  function signedIn() {
    return !!(global.QQAuth && QQAuth.isSignedIn && QQAuth.isSignedIn());
  }
  function online() {
    return !(global.navigator && global.navigator.onLine === false);
  }
  function ms(iso) {
    if (!iso) return 0;
    var t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  }

  // ======================================================================
  // config helpers
  // ======================================================================
  /* Two different questions, and collapsing them into one is how you end up
   * selling something you cannot deliver.
   *
   *   reachable()   can we send someone to a Gumroad checkout?
   *   verifiable()  if they pay, can we then prove they paid?
   *
   * A published product makes the first true. Only a licence-key product makes
   * the second true. Between those two states — which is exactly where this
   * product sits today — the honest thing is to sell NOTHING, because a
   * subscriber we cannot verify is someone who has paid for a locked door.
   *
   * configured() is the AND of both, and it is what gates the buy button. */
  function reachable() {
    return !!(GUMROAD.seller && GUMROAD.permalink &&
              !PLACEHOLDER.test(GUMROAD.seller) &&
              !PLACEHOLDER.test(GUMROAD.permalink));
  }

  function verifiable() {
    return !!(GUMROAD.productId && !PLACEHOLDER.test(GUMROAD.productId));
  }

  function configured() {
    return reachable() && verifiable();
  }

  function productUrl(wanted) {
    return 'https://' + GUMROAD.seller + '.gumroad.com/l/' + GUMROAD.permalink +
           (wanted ? '?wanted=true' : '');
  }

  // ======================================================================
  // membership state
  // ======================================================================
  /* THE predicate. One comparison, so there is exactly one definition of "is a
   * member" and no screen can invent a second one. */
  function isMember() {
    var c = loadCache();
    return !!(c.until && c.until > Date.now());
  }

  function membership() {
    var c = loadCache();
    return {
      active: isMember(),
      status: c.status || 'none',
      until: c.until || 0,
      checkedAt: c.checkedAt || 0,
      scope: c.scope || null,
      stale: !c.checkedAt || (Date.now() - c.checkedAt) > RECHECK_MS
    };
  }

  /* Turn one Gumroad verify response into membership state. The single place
   * where subscription semantics live — the server function in schema.sql
   * implements exactly the same ladder, in SQL, and the two must stay in step.
   * Order matters: money-back beats ended beats failed beats cancelled. */
  function stateFrom(body, now) {
    now = now || Date.now();
    var p = (body && body.purchase) || {};

    if (p.refunded || p.chargebacked || (p.disputed && !p.dispute_won)) {
      return { status: p.disputed ? 'disputed' : 'refunded', until: 0 };
    }
    var ended = ms(p.subscription_ended_at);
    if (ended) return { status: 'ended', until: ended };

    var failed = ms(p.subscription_failed_at);
    if (failed) return { status: 'past_due', until: failed + DUNNING_GRACE_MS };

    if (p.subscription_cancelled_at) {
      /* Cancelled, but Gumroad has not ended it — they are still inside the
       * period they paid for. Keep them in, and let the daily re-check catch
       * subscription_ended_at when it appears. */
      return { status: 'cancelled', until: now + ACCESS_TTL_MS };
    }
    return { status: 'active', until: now + ACCESS_TTL_MS };
  }

  // ======================================================================
  // 1. CHECKOUT — open the Gumroad overlay
  // ======================================================================
  /* The overlay script is loaded LAZILY, on the first tap of a buy button, and
   * never on boot. The road is free and mostly played on a phone with patchy
   * signal; making every visitor pay for a third-party script so that a minority
   * can reach a checkout is the wrong trade. It also means the free road has
   * exactly zero third-party dependencies until someone opts in. */
  var overlayState = 'none';       // none | loading | ready | failed
  var overlayPromise = null;

  function loadOverlay() {
    if (overlayState === 'ready') return Promise.resolve(true);
    if (overlayState === 'failed') return Promise.resolve(false);
    if (overlayPromise) return overlayPromise;

    overlayState = 'loading';
    overlayPromise = new Promise(function (resolve) {
      var done = false;
      function settle(ok) {
        if (done) return;
        done = true;
        overlayState = ok ? 'ready' : 'failed';
        resolve(ok);
      }
      try {
        var s = global.document.createElement('script');
        /* The loader at this URL looks for its own
         * <script src*="/js/gumroad.js"> tag to hang config off, so the src has
         * to stay exactly this. */
        s.src = OVERLAY_SRC;
        s.async = true;
        s.onload = function () { settle(true); };
        s.onerror = function () { settle(false); };
        global.document.head.appendChild(s);
      } catch (e) { settle(false); return; }
      /* A blocked-but-not-errored script — content blockers love to hang rather
       * than fail — must not leave a buy button spinning for ever. */
      global.setTimeout(function () { settle(false); }, OVERLAY_TIMEOUT_MS);
    });
    return overlayPromise;
  }

  /* The overlay is NOT in the light DOM. Gumroad's bundle appends one host div
   * to <body>, calls attachShadow on it, and builds the whole widget — backdrop
   * and product iframe — inside that shadow root. Looking for `.gumroad-overlay`
   * on document therefore finds nothing even when the overlay is wide open, and
   * we would fall back to a link over a checkout the player is already looking
   * at. Verified 2026-07-31 by opening a real product and walking the tree: the
   * only reliable signal is an iframe pointing at gumroad.com, one shadow root
   * down. The mode is 'open', so we are allowed to look. */
  function overlayOpen() {
    try {
      var doc = global.document;
      if (doc.querySelector('iframe[src*="gumroad.com"]')) return true;
      var kids = doc.body.children;
      for (var i = 0; i < kids.length; i++) {
        var root = kids[i].shadowRoot;
        if (root && root.querySelector('iframe[src*="gumroad.com"]')) return true;
      }
      return false;
    } catch (e) { return false; }
  }

  /* Clicking a real <a class="gumroad-button"> is how the overlay is triggered;
   * there is no public JS entry point.
   *
   * The wait is not a superstition. The bundle binds by walking anchors once at
   * load and then watching for new ones with a MutationObserver, so an anchor
   * that is created and clicked in the same tick has NOT been bound yet and the
   * click does nothing at all. When the bundle does bind an anchor it appends a
   * logo <span> to it, which is a precise "ready" signal — so we poll for that
   * rather than guessing at a delay, and give up after ANCHOR_BIND_MS.
   *
   * The local preventDefault is the other load-bearing part: if the overlay
   * never binds, the click must NOT fall through to a plain navigation, because
   * that would throw the player out of the app and lose the lesson they were in.
   * The listener is added first so it runs before Gumroad's, and the event still
   * bubbles, so Gumroad's own handler runs normally when it is there. */
  var ANCHOR_BIND_MS = 800;

  function clickOverlayAnchor(url) {
    var a = global.document.createElement('a');
    a.className = 'gumroad-button';
    a.href = url;
    a.setAttribute('aria-hidden', 'true');
    a.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
    a.addEventListener('click', function (e) { e.preventDefault(); });
    global.document.body.appendChild(a);

    var waited = 0;
    (function waitForBind() {
      /* a.children.length > 0 means Gumroad has adopted this anchor. */
      if (a.children.length || waited >= ANCHOR_BIND_MS) {
        try { a.click(); } catch (e) {}
        global.setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
        return;
      }
      waited += 50;
      global.setTimeout(waitForBind, 50);
    })();
  }

  function openTab(url) {
    var w = null;
    try { w = global.open(url, '_blank', 'noopener'); } catch (e) { w = null; }
    return !!w;
  }

  /* QQPay.checkout(libraryId) -> Promise<{ ok, mode, url, code?, message? }>
   *
   * `libraryId` is optional and is only carried into the analytics event — there
   * is one membership, so which library the player was looking at when they
   * decided to subscribe is interesting, not functional. The signature is kept
   * so the library detail view does not have to care.
   *
   *   mode 'overlay'  the Gumroad overlay opened over the site
   *   mode 'tab'      the overlay was unavailable, the product page opened
   *   mode 'link'     both failed, so `url` must be offered as a plain link,
   *                   which the panel below does. A popup blocker is not an
   *                   error the player should have to read about.
   *
   * Never rejects. */
  function checkout(libraryId) {
    if (!configured()) {
      /* Still worth something: a closed door people keep pushing is the signal
       * that decides what gets built next. */
      try { if (libraryId && global.QQStore) QQStore.registerLibraryInterest(libraryId); } catch (e) {}
      track('checkout_unavailable', {
        libraryId: libraryId || null,
        reason: verifiable() ? 'not_configured' : 'not_verifiable'
      });
      return Promise.resolve({
        ok: false, code: 'not_configured',
        message: reachable()
          ? 'Memberships are not open yet. Buying now would mean paying for access that cannot be switched on, so the checkout is deliberately closed.'
          : 'The membership is not open yet. Your interest is recorded — it is what decides which set gets built next.'
      });
    }

    if (!online()) {
      track('checkout_unavailable', { libraryId: libraryId || null, reason: 'offline' });
      return Promise.resolve({
        ok: false, code: 'offline', url: productUrl(false),
        message: "You're offline, so the checkout cannot open. The road keeps working — try again when you have signal."
      });
    }

    track('checkout_opened', { libraryId: libraryId || null });

    return loadOverlay().then(function (ok) {
      if (!ok) {
        track('checkout_fallback', { libraryId: libraryId || null, reason: 'script_failed' });
        var tabUrl = productUrl(true);
        if (openTab(tabUrl)) return { ok: true, mode: 'tab', url: tabUrl };
        return {
          ok: false, code: 'blocked', mode: 'link', url: tabUrl,
          message: 'Your browser blocked the checkout window. Open the membership page directly:'
        };
      }
      clickOverlayAnchor(productUrl(false));
      return new Promise(function (resolve) {
        global.setTimeout(function () {
          if (overlayOpen()) return resolve({ ok: true, mode: 'overlay', url: productUrl(false) });
          /* Too late for window.open to count as a user gesture on iOS, so offer
           * a link rather than fire a popup that will be swallowed. */
          track('checkout_fallback', { libraryId: libraryId || null, reason: 'overlay_absent' });
          resolve({
            ok: false, code: 'no_overlay', mode: 'link', url: productUrl(true),
            message: 'The Gumroad overlay did not open. Use the membership page instead:'
          });
        }, OVERLAY_SETTLE_MS);
      });
    }).catch(function () {
      return {
        ok: false, code: 'blocked', mode: 'link', url: productUrl(true),
        message: 'Something went wrong opening the checkout. Use the membership page instead:'
      };
    });
  }

  // ======================================================================
  // 2. REDEEM / RE-VERIFY
  // ======================================================================
  /* Gumroad's verify endpoint. increment_uses_count is false for every call we
   * make: `uses` is meant to count seats, and a membership that re-verifies
   * daily would burn through any seat limit in a week. Resolves { status, body }
   * with status 0 for a network failure. Never rejects. */
  function gumroadVerify(key) {
    var body = 'product_id=' + encodeURIComponent(GUMROAD.productId) +
               '&license_key=' + encodeURIComponent(key) +
               '&increment_uses_count=false';
    return global.fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      return r.json()
        .catch(function () { return null; })
        .then(function (j) { return { status: r.status, body: j }; });
    }).catch(function () { return { status: 0, body: null }; });
  }

  /* The server half. `path` is the RPC name; both take the same shape back.
   * Returns the function's verdict, or null when it is not deployed / not
   * reachable, which is the signal to fall back rather than to fail. */
  function callRpc(name, args) {
    if (!signedIn() || !QQAuth.apiFetch) return Promise.resolve(null);
    return QQAuth.apiFetch('/rest/v1/rpc/' + name, {
      method: 'POST',
      body: JSON.stringify(args || {})
    }).then(function (r) {
      if (!r) return null;
      /* 404 = the function was never created. 401/403 = grants missing. Those
       * are deployment problems, not the player's problem, so we degrade to the
       * device path instead of telling a paying member their key is bad. */
      if (r.status === 404 || r.status === 401 || r.status === 403) {
        track('membership_rpc_missing', { rpc: name, status: r.status });
        return null;
      }
      return r.json().then(function (j) {
        return (j && typeof j.ok === 'boolean') ? j : null;
      }).catch(function () { return null; });
    }).catch(function () { return null; });
  }

  function fail(code, message, extra) {
    var out = { ok: false, code: code, message: message };
    for (var k in (extra || {})) out[k] = extra[k];
    return out;
  }

  /* Translate a server verdict into cache + sentence. The server has already
   * verified with Gumroad and already written the membership columns; we only
   * mirror it so the UI is instant and survives going offline. */
  function applyServer(srv, key) {
    var until = ms(srv.until);
    setCache({
      status: srv.status || 'none',
      until: until,
      checkedAt: Date.now(),
      key: key || loadCache().key,
      scope: 'account'
    });
    return until > Date.now();
  }

  function messageFor(status, extra) {
    extra = extra || {};
    if (status === 'refunded') {
      return 'That subscription was refunded, so it no longer opens the libraries. If that is a mistake, reply to your Gumroad receipt.';
    }
    if (status === 'disputed') {
      return 'That payment was charged back, so the membership is closed. If that is a mistake, reply to your Gumroad receipt.';
    }
    if (status === 'ended') {
      return 'That membership has ended. Subscribe again and the libraries open straight back up — your progress was never touched.';
    }
    if (status === 'past_due') {
      return 'The last payment did not go through. Access stays open for a few days while Gumroad retries — update your card on Gumroad and it sorts itself out.';
    }
    if (status === 'other_account') {
      return 'That key is already attached to a different account. Sign in with that one and the membership is already there.';
    }
    if (status === 'unknown_key') {
      return 'Gumroad does not recognise that key. Check for a missing character — it is in your receipt email, and it is the whole line including the dashes.';
    }
    return 'Something went wrong checking that key. Nothing was charged. Try again in a moment.';
  }

  /* QQPay.redeem(libraryId, key) -> Promise<result>
   *
   *   { ok:true,  scope:'account'|'device', status, until, message }
   *   { ok:false, code, message, ... }
   *
   * codes: not_configured | empty_key | bad_format | offline | network |
   *        unknown_key | refunded | disputed | ended | past_due |
   *        other_account | server
   *
   * `libraryId` is optional and analytics-only — one key opens every library.
   * Also callable as redeem(key). Never rejects. */
  function redeem(libraryId, rawKey) {
    if (arguments.length === 1) { rawKey = libraryId; libraryId = null; }

    /* Receipts get copied with a trailing space and mail clients love to insert
     * soft line breaks. None of that should read as a wrong key. */
    var key = String(rawKey == null ? '' : rawKey).replace(/\s+/g, '').toUpperCase();

    if (!configured()) {
      /* Someone who bought through the public Gumroad link before this site was
       * ready deserves a straight answer, not "no such key". Their key may well
       * be real — we simply have no product id to check it against yet. */
      return Promise.resolve(fail('not_configured',
        reachable()
          ? ('Keys cannot be checked yet — the sign-up is still being wired up. ' +
             'If you have already subscribed, your access is not lost; ' +
             (SUPPORT_EMAIL ? ('email ' + SUPPORT_EMAIL + ' and I will switch it on.')
                            : 'reply to your Gumroad receipt and I will switch it on.'))
          : 'The membership is not open yet, so there are no keys for it.'));
    }
    if (!key) {
      return Promise.resolve(fail('empty_key',
        'Paste the licence key from your Gumroad receipt email.'));
    }
    if (!KEY_RE.test(key)) {
      return Promise.resolve(fail('bad_format',
        'That does not look like a licence key. Gumroad keys are four blocks of ' +
        'letters and numbers separated by dashes, and they are in your receipt ' +
        'email under the product name.'));
    }
    if (!online()) {
      return Promise.resolve(fail('offline',
        "You're offline, so the key cannot be checked. Nothing is lost — try again when you have signal."));
    }

    track('redeem_attempt', { libraryId: libraryId, signedIn: signedIn() });

    return callRpc('redeem_license', { p_license_key: key }).then(function (srv) {
      if (srv) return finishServer(srv, key);
      return finishClient(key);
    }).catch(function () {
      return fail('server', messageFor('server'));
    });
  }

  function finishServer(srv, key) {
    if (srv.ok) {
      applyServer(srv, key);
      track('redeem_ok', { scope: 'account', status: srv.status });
      var m = 'You are in. Every library is open, and it is on your account — ' +
              'sign in anywhere and it comes with you.';
      if (srv.status === 'cancelled') {
        m = 'You are in until the end of the period you have paid for. After that ' +
            'the libraries close, and the road stays free as always.';
      } else if (srv.status === 'past_due') {
        m = 'You are in, but the last payment did not go through. Update your card ' +
            'on Gumroad within the next few days to keep it.';
      }
      return { ok: true, scope: 'account', status: srv.status, until: ms(srv.until), message: m };
    }
    /* A definitive server NO — refunded, ended, wrong account. Mirror it, so a
     * stale local grant cannot outlive a verdict we have actually been given. */
    if (srv.status && srv.status !== 'error') applyServer(srv, null);
    track('redeem_failed', { scope: 'account', code: srv.code || srv.status });
    return fail(srv.code || srv.status || 'server',
                srv.message || messageFor(srv.code || srv.status), srv);
  }

  /* No account, or the server function is not deployed. Verify from the browser
   * and grant on this device only — and say exactly that, rather than implying
   * something permanent. */
  function finishClient(key) {
    return gumroadVerify(key).then(function (res) {
      if (!res || res.status === 0) {
        track('redeem_failed', { scope: 'device', code: 'network' });
        return fail('network',
          'Could not reach Gumroad to check that key. Nothing was charged. Try again in a moment.');
      }
      if (res.status === 404 || !res.body || res.body.success !== true) {
        track('redeem_failed', { scope: 'device', code: 'unknown_key' });
        return fail('unknown_key', messageFor('unknown_key'));
      }

      var st = stateFrom(res.body);
      if (!(st.until > Date.now())) {
        /* A real key, but the membership behind it is over. Cache the verdict so
         * we do not ask again every few seconds, and name the actual reason. */
        setCache({ status: st.status, until: st.until, checkedAt: Date.now(), key: key, scope: 'device' });
        track('redeem_failed', { scope: 'device', code: st.status });
        return fail(st.status, messageFor(st.status), st);
      }

      setCache({ status: st.status, until: st.until, checkedAt: Date.now(), key: key, scope: 'device' });
      track('redeem_ok', { scope: 'device', status: st.status });

      var m = 'You are in — every library is open on this device.';
      if (st.status === 'cancelled') {
        m = 'You are in until the end of the period you have paid for.';
      } else if (st.status === 'past_due') {
        m = 'You are in, but the last payment did not go through. Update your card on Gumroad to keep it.';
      }
      if (!signedIn()) {
        m += ' Sign in and paste the key once more to attach it to your account, so it follows you to a new phone.';
      }
      return { ok: true, scope: 'device', status: st.status, until: st.until, message: m };
    });
  }

  // ======================================================================
  // 3. THE RE-CHECK
  // ======================================================================
  /* Called on boot and on sign-in. Rate-limited to once a day here AND in the
   * database function, because a rate limit only the client enforces is not one.
   *
   * The failure posture is the whole point: if anything below cannot complete,
   * we return without touching the cache, and an existing grant runs on to its
   * `until`. A network problem must never look like a cancellation. */
  var refreshing = null;

  function refresh(force) {
    if (refreshing) return refreshing;
    var c = loadCache();

    if (!force && c.checkedAt && (Date.now() - c.checkedAt) < RECHECK_MS) {
      return Promise.resolve(membership());
    }
    if (!configured() || !online()) return Promise.resolve(membership());

    refreshing = (signedIn()
      ? callRpc('verify_membership', {}).then(function (srv) {
          if (srv && srv.status) { applyServer(srv, null); return true; }
          return false;
        })
      : Promise.resolve(false)
    ).then(function (done) {
      /* Signed out, or the function is missing: re-check from the browser with
       * the key we kept. Without a key there is nothing to check and nothing to
       * revoke — a member who never redeemed here simply is not one. */
      if (done || !c.key) return null;
      return gumroadVerify(c.key).then(function (res) {
        if (!res || res.status === 0) return null;       // outage: keep the grant
        if (res.status === 404 || !res.body || res.body.success !== true) {
          /* The key stopped existing — deleted product, or a key that was
           * disabled. That IS a verdict, so honour it. */
          setCache({ status: 'ended', until: 0, checkedAt: Date.now() });
          return null;
        }
        var st = stateFrom(res.body);
        setCache({ status: st.status, until: st.until, checkedAt: Date.now(), scope: 'device' });
        return null;
      });
    }).catch(function () { return null; })
      .then(function () {
        refreshing = null;
        track('membership_checked', { status: loadCache().status, active: isMember() });
        return membership();
      });

    return refreshing;
  }

  // ======================================================================
  // 4. UI — the membership panel
  // ======================================================================
  /* NOTE FOR THE LIBRARY DETAIL-VIEW WORK IN PROGRESS.
   *
   * Another agent owns the library cards (PREMIUM badge, never a price) and the
   * detail view. This panel is the money half of that detail view and exists so
   * that work does not have to reimplement any payment state. One line:
   *
   *     QQPay.mountMembershipPanel(hostElement, libraryObject)
   *
   * renders buy button, restore-with-key form, every error state and the member
   * state into `hostElement`, and manages it from then on. It writes nothing
   * outside that element, and `libraryObject` is optional — it only tunes the
   * opening sentence to whichever library the player was looking at.
   *
   * app.js onLibraryTap() currently mounts this into the existing sheet as a
   * temporary host. When the detail view lands, delete that and call this from
   * there; nothing else changes.
   *
   * If you would rather build the UI yourself, the entry points are
   * QQPay.checkout(libraryId), QQPay.redeem(libraryId, key), QQPay.isMember()
   * and QQPay.onChange(fn). All of them resolve, none reject, and every failure
   * carries a ready-to-show `message`. */
  function mountMembershipPanel(host, lib) {
    if (!host) return;
    host.innerHTML = '';
    if (host.className.indexOf('pay-host') === -1) host.className += ' pay-host';

    function msgBox(cls, text, url) {
      var box = document.createElement('div');
      box.className = 'pay-msg ' + cls;
      var p = document.createElement('p');
      p.textContent = text;
      box.appendChild(p);
      if (url) {
        var a = document.createElement('a');
        a.className = 'pay-link';
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Open the membership page';
        box.appendChild(a);
      }
      return box;
    }

    function line(cls, text) {
      var p = document.createElement('p');
      p.className = cls;
      p.textContent = text;
      return p;
    }

    function render() {
      host.innerHTML = '';
      var m = membership();

      // ---- already a member ----------------------------------------------
      if (m.active) {
        var head = m.status === 'past_due' ? 'Member — payment needs attention'
                 : m.status === 'cancelled' ? 'Member until the end of the period'
                 : 'Member';
        host.appendChild(line('pay-state-title', head));
        host.appendChild(msgBox(m.status === 'active' ? 'ok' : 'warn',
          m.status === 'past_due'
            ? 'Every library is open. The last payment did not go through, though — update your card on Gumroad in the next few days to keep it.'
            : m.status === 'cancelled'
              ? 'Every library stays open until the period you have paid for runs out. The road is free either way.'
              : (m.scope === 'account'
                  ? 'Every library is open, on every device you sign in on.'
                  : 'Every library is open on this device. Sign in and paste your key once more to attach it to your account.')));
        return;
      }

      // ---- a membership that has ended ------------------------------------
      if (m.status && m.status !== 'none') {
        host.appendChild(line('pay-state-title', 'Membership closed'));
        host.appendChild(msgBox('err', messageFor(m.status)));
      }

      // ---- the pitch -------------------------------------------------------
      host.appendChild(line('pay-pitch',
        lib ? ('One membership opens ' + lib.name + ' and every other library.')
            : 'One membership opens every library.'));
      host.appendChild(line('pay-sub',
        'The road stays free either way. This is for the separate sets, including the ones not built yet. Cancel any time.'));

      // ---- not open yet ----------------------------------------------------
      /* Two shades of "not yet", and they need different words.
       *
       * The dangerous one is reachable-but-not-verifiable: the Gumroad page is
       * PUBLIC and published, so somebody could already have subscribed through
       * a direct link even though this site never offered them a button. Those
       * people have paid real money and cannot be let in yet, and the very worst
       * thing to show them is a cheery "coming soon" that ignores it. So they
       * get told plainly, and given a route to a human. */
      if (!configured()) {
        try { if (lib && global.QQStore) QQStore.registerLibraryInterest(lib.id); } catch (e) {}

        if (reachable() && !verifiable()) {
          host.appendChild(msgBox('info',
            'Memberships are not open yet — the last piece of the sign-up is still ' +
            'being wired up, and until it is, buying would leave you paying for a ' +
            'door that stays shut. It is deliberately switched off.'));
          host.appendChild(msgBox('warn',
            'Already subscribed on Gumroad? Nothing is lost and you are not being ' +
            'charged for nothing — your access will be turned on as soon as this is ' +
            'finished. ' + (SUPPORT_EMAIL
              ? ('If you would like it sorted sooner, email ' + SUPPORT_EMAIL + '.')
              : 'To be sure it is not missed, reply to your Gumroad receipt — that ' +
                'reaches me directly.')));
          return;
        }

        host.appendChild(msgBox('info',
          'Not open yet. Your interest is recorded, and it decides what gets made next.'));
        return;
      }

      // ---- buy -------------------------------------------------------------
      var buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'primary-btn pay-buy';
      buy.textContent = 'Become a member · ' + GUMROAD.priceLabel;
      host.appendChild(buy);

      var out = document.createElement('div');
      out.className = 'pay-out';
      host.appendChild(out);

      buy.addEventListener('click', function () {
        buy.disabled = true;
        buy.textContent = 'Opening…';
        out.innerHTML = '';
        checkout(lib && lib.id).then(function (res) {
          buy.disabled = false;
          buy.textContent = 'Become a member · ' + GUMROAD.priceLabel;
          out.appendChild(res.ok
            ? msgBox('info', 'Finish signing up in Gumroad, then come back and paste the licence key from your receipt below.')
            : msgBox('err', res.message, res.mode === 'link' ? res.url : null));
        });
      });

      // ---- restore ---------------------------------------------------------
      /* Not a footnote. Someone who reinstalls, clears the browser or moves
       * phone has already paid; if they cannot get back in, that is a refund and
       * a bad review, not a support ticket. So the key box is always on screen,
       * before they have bought anything, and it is the same box either way. */
      var restore = document.createElement('div');
      restore.className = 'pay-restore';
      restore.appendChild(line('pay-restore-title', 'Already a member?'));
      restore.appendChild(line('pay-restore-copy',
        'Paste the licence key from your Gumroad receipt — also how you get it back on a new phone.'));

      var row = document.createElement('div');
      row.className = 'pay-row';
      var input = document.createElement('input');
      input.className = 'pay-input';
      input.type = 'text';
      input.autocapitalize = 'characters';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX';
      input.setAttribute('aria-label', 'licence key');
      var go = document.createElement('button');
      go.type = 'button';
      go.className = 'pay-go';
      go.textContent = 'Unlock';
      row.appendChild(input); row.appendChild(go);
      restore.appendChild(row);

      var rOut = document.createElement('div');
      rOut.className = 'pay-out';
      restore.appendChild(rOut);
      host.appendChild(restore);

      function submit() {
        go.disabled = true;
        go.textContent = 'Checking…';
        rOut.innerHTML = '';
        redeem(lib && lib.id, input.value).then(function (res) {
          go.disabled = false;
          go.textContent = 'Unlock';
          if (res.ok) { render(); return; }
          rOut.appendChild(msgBox('err', res.message));
          try { input.focus(); } catch (e) {}
        });
      }
      go.addEventListener('click', submit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }

    render();
  }

  // ======================================================================
  // wiring
  // ======================================================================
  var QQPay = {
    /* False now that a real processor is behind this. */
    isStub: false,

    checkout: checkout,
    redeem: redeem,
    refresh: refresh,

    isMember: isMember,
    membership: membership,
    /* Kept for the library cards: with one membership, owning any library is
     * owning all of them. */
    owns: function (libraryId) { return isMember(); },

    configured: configured,
    /* Exposed so the detail view can tell "not built yet" from "built, but we
     * cannot verify a buyer yet" without duplicating the rule. */
    reachable: reachable,
    verifiable: verifiable,
    productUrl: productUrl,
    membershipPrice: function () { return GUMROAD.priceLabel; },

    /* The price string. Deliberately used in ONE place — the library detail
     * view, after the player has chosen to look. The road and the library list
     * never show a number: a price on a card nobody asked about reads as a
     * paywall on the road, which is the one thing this site does not have.
     *
     * Empty until the product is configured, so the detail view falls back to
     * '—'. Quoting a price for something nobody can buy is a promise, and the
     * number here is a default the owner has to reconcile with what Gumroad
     * actually charges — advertising it early is how you end up honouring a
     * price you never set. */
    priceLabel: function (lib) { return configured() ? GUMROAD.priceLabel : ''; },

    mountMembershipPanel: mountMembershipPanel,
    /* Older name, same panel, so a detail view written against either works. */
    mountLibraryPanel: function (host, lib) { return mountMembershipPanel(host, lib); },

    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },

    /* Test seam. Points the config at a real product from the console without
     * editing the file. Not a back door: it sets where to ASK, not what the
     * answer is, and the account-level grant still only moves server-side. */
    _setProduct: function (seller, permalink, productId) {
      GUMROAD.seller = seller;
      GUMROAD.permalink = permalink;
      GUMROAD.productId = productId;
      notify();
    },
    /* Test seam. Clears the device cache — a signed-out "sign out". */
    _reset: function () {
      cache = { status: 'none', until: 0, checkedAt: 0, key: null, scope: null };
      saveCache();
      notify();
    }
  };

  if (global.QQAuth && QQAuth.onChange) {
    QQAuth.onChange(function (kind) {
      /* Sign-in is the one moment we always re-check, rate limit or not: it is
       * exactly when a membership bought on another device should appear. */
      if (kind === 'signed-in') refresh(true);
    });
  }
  if (global.QQAuth && QQAuth.ready && QQAuth.ready.then) {
    QQAuth.ready.then(function () { refresh(false); }).catch(function () {});
  } else {
    refresh(false);
  }

  global.QQPay = QQPay;
})(window);
