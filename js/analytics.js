/* QQ analytics — the ONE place any event is recorded.
 *
 * Nothing else in the app may write an event by hand. Everything goes through
 * QQA.track(name, props), which does two things: appends to a capped ring buffer
 * in localStorage (so the debug drawer and an offline player still work), and
 * hands the event to the sink.
 *
 * ==========================================================================
 * SEAM — THE ANALYTICS SINK.  One function: QQA.sink(event).
 * ==========================================================================
 * By default the sink is `window.sb.event` from js/supabase-config.js, which
 * POSTs to the Supabase `events` table with the publishable key. That project is
 * live. Row Level Security allows anonymous INSERT on that table and nothing
 * else — no select, no update, no reading anyone's row, including your own.
 *
 * To point the site somewhere else, assign one function:
 *
 *     QQA.sink = function (e) { navigator.sendBeacon('/e', JSON.stringify(e)); };
 *
 * `event` is a flat JSON-safe object:
 *   { name, ts, iso, sessionId, anonId, visitNumber, msSinceLoad, props:{...} }
 *
 * Everything below the sink keeps working if it throws, is missing, or the
 * network is down: the local ring buffer is written first, and the sink call is
 * wrapped. A learner mid-lesson must never notice that a beacon failed, and
 * unit 1 has to work with the aeroplane mode on.
 *
 * PRIVACY RULE, enforced by convention and checked on every change: never pass
 * raw personal data in props. The email wall logs `emailDomain` and
 * `emailLength`, never the address. The address lives in QQStore, not in the
 * event log, and not in the events table.
 * ==========================================================================
 */
(function (global) {
  'use strict';

  var EVENTS_KEY = 'qq.events.v1';
  var IDS_KEY = 'qq.ids.v1';
  var MAX_EVENTS = 800;          // ring buffer cap, oldest dropped first
  var loadedAt = Date.now();

  // --- storage that never throws (file:// and private mode can refuse) ------
  var mem = {};
  function readRaw(key) {
    try { var v = global.localStorage.getItem(key); return v === null ? mem[key] : v; }
    catch (e) { return mem[key]; }
  }
  function writeRaw(key, value) {
    mem[key] = value;
    try { global.localStorage.setItem(key, value); } catch (e) { /* memory only */ }
  }
  function readJSON(key, fallback) {
    var raw = readRaw(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function uid() {
    return 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // --- identity: anonymous, local-only -------------------------------------
  var ids = readJSON(IDS_KEY, null);
  var isFirstEverVisit = false;
  if (!ids || !ids.anonId) {
    ids = { anonId: uid(), firstSeen: Date.now(), visitNumber: 0, lastSeen: 0 };
    isFirstEverVisit = true;
  }
  var msSinceLastVisit = ids.lastSeen ? (Date.now() - ids.lastSeen) : null;
  ids.visitNumber = (ids.visitNumber || 0) + 1;
  ids.lastSeen = Date.now();
  writeRaw(IDS_KEY, JSON.stringify(ids));

  // session id: one per tab-session, so session length is measurable
  var sessionId;
  try {
    sessionId = global.sessionStorage.getItem('qq.session');
    if (!sessionId) { sessionId = uid(); global.sessionStorage.setItem('qq.session', sessionId); }
  } catch (e) { sessionId = uid(); }

  var events = readJSON(EVENTS_KEY, []);
  if (!Array.isArray(events)) events = [];

  /* The default sink: the live Supabase project. The session id it stores is
   * ours, not the browser's — one row per event, joined on session. anonId and
   * visitNumber ride along in props so return visits are countable without a
   * login. */
  function supabaseSink(e) {
    if (!global.sb || typeof global.sb.event !== 'function') return false;
    var props = {};
    for (var k in e.props) if (Object.prototype.hasOwnProperty.call(e.props, k)) props[k] = e.props[k];
    props.anonId = e.anonId;
    props.visitNumber = e.visitNumber;
    props.msSinceLoad = e.msSinceLoad;
    /* The auth user id when there is a session, so a signed-in player's funnel
     * joins to their profile. Guarded: analytics loads before auth and must keep
     * working if that module is ever removed. */
    var uid = null;
    try { uid = (global.QQAuth && QQAuth.userId) ? QQAuth.userId() : null; } catch (err) { uid = null; }
    global.sb.event(e.name, props, e.sessionId, uid);
    return true;
  }

  var QQA = {
    sink: supabaseSink,          // <-- the seam. See the header comment.
    debug: false,

    sinkName: function () {
      if (QQA.sink !== supabaseSink) return 'custom';
      return (global.sb && typeof global.sb.event === 'function') ? 'supabase' : 'local only';
    },

    track: function (name, props) {
      var e = {
        name: name,
        ts: Date.now(),
        iso: new Date().toISOString(),
        sessionId: sessionId,
        anonId: ids.anonId,
        visitNumber: ids.visitNumber,
        msSinceLoad: Date.now() - loadedAt,
        props: props || {}
      };
      events.push(e);
      if (events.length > MAX_EVENTS) events = events.slice(events.length - MAX_EVENTS);
      writeRaw(EVENTS_KEY, JSON.stringify(events));
      if (QQA.debug) console.debug('[qq]', name, e.props);
      if (typeof QQA.sink === 'function') {
        try { QQA.sink(e); } catch (err) { /* never load-bearing */ }
      }
      if (typeof QQA.onEvent === 'function') { try { QQA.onEvent(e); } catch (err) {} }
      return e;
    },

    all: function () { return events.slice(); },
    count: function (name) {
      var n = 0;
      for (var i = 0; i < events.length; i++) if (events[i].name === name) n++;
      return n;
    },
    clear: function () { events = []; writeRaw(EVENTS_KEY, '[]'); },
    exportJSON: function () { return JSON.stringify(events, null, 2); },

    identity: function () {
      return {
        anonId: ids.anonId,
        firstSeen: ids.firstSeen,
        visitNumber: ids.visitNumber,
        sessionId: sessionId,
        isFirstEverVisit: isFirstEverVisit,
        msSinceLastVisit: msSinceLastVisit
      };
    }
  };

  // --- session length, recorded without a server ---------------------------
  var answered = 0;
  QQA.noteAnswer = function () { answered++; };
  var ended = false;
  function endSession(reason) {
    if (ended) return;
    ended = true;
    QQA.track('session_end', {
      durationMs: Date.now() - loadedAt,
      questionsAnswered: answered,
      reason: reason
    });
  }
  global.addEventListener('pagehide', function () { endSession('pagehide'); });
  global.addEventListener('visibilitychange', function () {
    if (global.document.visibilityState === 'hidden') endSession('hidden');
    else { ended = false; }   // came back: a new stretch of the same session
  });

  global.QQA = QQA;
})(window);
