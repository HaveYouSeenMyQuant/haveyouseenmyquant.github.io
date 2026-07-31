/* ==========================================================================
 * CLOUD PROGRESS — the mirror between js/store.js and Postgres.
 * ==========================================================================
 *
 * localStorage is the truth the player sees. This file is the copy that follows
 * them to another device, and it is never in the critical path: every write goes
 * to localStorage first (js/store.js), the UI renders from there, and this
 * catches up in the background. Aeroplane mode, a blocked domain, file:// and no
 * account at all are all the same case here — nothing syncs and nothing breaks.
 *
 * THE ORDER OF OPERATIONS ON SIGN-IN, which is the part that has to be right:
 *
 *   1. PULL the account's progress rows and profile row.
 *   2. MERGE them into the local state, taking the better of the two per
 *      question (js/store.js mergeRemote). A phone that played unit 1
 *      anonymously and then signed in keeps every question it solved, and an
 *      account opened on a fresh laptop gets its history back. Neither side
 *      clobbers the other.
 *   3. PUSH the merged result back up, so both ends now agree.
 *
 * Doing it in that order is what makes the anonymous-then-sign-in case safe.
 * Pushing first would overwrite the account with an empty device; pulling and
 * replacing would throw away the questions just solved.
 *
 * ONE DEVICE, TWO ACCOUNTS. If this browser last synced with a DIFFERENT user,
 * the local state belongs to that other person and must not be pushed into the
 * new account. In that one case we clear local state and take the new account's
 * word for it. Signing out does not clear anything: the device carries on
 * anonymously with the progress it already had.
 *
 * WHAT IS SYNCED. Solved questions (progress), and xp / streak / best streak /
 * last active day / per-day XP / lesson crowns / daily goal / email (profiles).
 * Hearts are deliberately NOT synced: they are per-lesson, refill on every
 * lesson start and mean nothing across devices — profiles.hearts stays at its
 * default until hearts become a real cross-session currency.
 *
 * SECURITY. Every call goes through QQAuth.apiFetch, which attaches the user's
 * own access token. Row Level Security means a request can only ever read or
 * write that user's own rows — see site/schema.sql. Nothing here can write
 * paid_libs: that column is revoked from the browser at the grant level, so
 * entitlement cannot be granted with a devtools call.
 * ========================================================================== */
(function (global) {
  'use strict';

  var PUSH_DEBOUNCE_MS = 2500;
  var DAY_XP_KEEP = 30;              // days of the XP-per-day map worth carrying

  var status = {
    state: 'idle',                   // idle | pulling | pushing | clean | error | offline
    lastPull: 0,
    lastPush: 0,
    lastError: null,
    dirty: false,
    pulls: 0,
    pushes: 0
  };

  var pushTimer = null;
  var inFlight = null;

  function log(name, props) {
    if (global.QQA && typeof QQA.track === 'function') { try { QQA.track(name, props || {}); } catch (e) {} }
  }
  function iso(ts) {
    try { return new Date(ts || Date.now()).toISOString(); } catch (e) { return new Date().toISOString(); }
  }
  function signedIn() { return !!(global.QQAuth && QQAuth.isSignedIn()); }
  /* The app watches this so the footer can say "saved" only once a push has
   * actually come back 2xx, never merely because we have a session. */
  function announce() {
    if (typeof QQSync.onStatus === 'function') { try { QQSync.onStatus(status); } catch (e) {} }
  }

  // ----------------------------------------------------------------- pulling
  function normaliseProgress(rows) {
    var solved = {};
    (rows || []).forEach(function (row) {
      if (!row || !row.question_id || !row.correct) return;   // only solved rows
      var ts = Date.parse(row.solved_at || row.first_seen || '') || Date.now();
      solved[row.question_id] = {
        attempts: row.attempts || 1,
        firstTry: (row.attempts || 1) === 1,
        ts: ts,
        ms: row.ms_spent || 0
      };
    });
    return solved;
  }

  function normaliseProfile(p) {
    if (!p) return {};
    return {
      xp: p.xp || 0,
      streak: p.streak_days || 0,
      bestStreak: p.best_streak || 0,
      lastActiveDay: p.last_active || null,
      dayXp: p.day_xp || {},
      lessons: p.lessons || {},
      email: p.email || null
    };
  }

  function getJSON(path) {
    return QQAuth.apiFetch(path).then(function (r) {
      if (!r) return null;
      if (!r.ok) { status.lastError = 'GET ' + path + ' -> ' + r.status; return null; }
      return r.json().catch(function () { return null; });
    }).catch(function () { return null; });
  }

  function pull() {
    status.state = 'pulling';
    return Promise.all([
      getJSON('/rest/v1/progress?select=question_id,attempts,correct,ms_spent,first_seen,solved_at'),
      getJSON('/rest/v1/profiles?select=*')
    ]).then(function (both) {
      var rows = both[0], profiles = both[1];
      if (rows === null && profiles === null) {
        /* Either the network is gone, or the session went with it — a rejected
         * refresh signs us out mid-pull, and that is 'idle', not a fault. */
        status.state = signedIn() ? 'offline' : 'idle';
        return null;
      }
      var remote = normaliseProfile(profiles && profiles[0]);
      remote.solved = normaliseProgress(rows);
      status.pulls++;
      status.lastPull = Date.now();
      return remote;
    });
  }

  // ----------------------------------------------------------------- pushing
  function progressRows(uid, s) {
    var out = [];
    for (var qid in s.solved) {
      if (!Object.prototype.hasOwnProperty.call(s.solved, qid)) continue;
      var q = s.solved[qid];
      out.push({
        user_id: uid,
        question_id: qid,
        attempts: q.attempts || 1,
        correct: true,
        ms_spent: q.ms || 0,
        first_seen: iso(q.ts),
        solved_at: iso(q.ts)
      });
    }
    return out;
  }

  /* The per-day XP map is unbounded locally; only the recent tail is worth
   * carrying across devices (it exists to draw today's goal ring). */
  function recentDayXp(dayXp) {
    var days = Object.keys(dayXp || {}).sort();
    var keep = days.slice(-DAY_XP_KEEP), out = {};
    keep.forEach(function (d) { out[d] = dayXp[d]; });
    return out;
  }

  function push(opts) {
    var uid = QQAuth.userId();
    if (!uid) return Promise.resolve(false);
    var keepalive = !!(opts && opts.keepalive);
    var s = QQStore.exportForSync();
    var rows = progressRows(uid, s);
    var xpAtPush = s.xp;
    status.state = 'pushing';

    var jobs = [];
    if (rows.length) {
      jobs.push(QQAuth.apiFetch('/rest/v1/progress?on_conflict=user_id,question_id', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows),
        keepalive: keepalive
      }));
    }
    /* Upsert rather than PATCH: a PATCH against a row that does not exist
     * succeeds and writes nothing, which would lose a player's XP in silence if
     * the signup trigger ever failed to make the profile. */
    jobs.push(QQAuth.apiFetch('/rest/v1/profiles?on_conflict=id', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: uid,
        email: s.email || null,
        xp: s.xp,
        streak_days: s.streak,
        best_streak: s.bestStreak,
        last_active: s.lastActiveDay || null,
        daily_goal: (global.QQ_DATA && QQ_DATA.dailyGoalXp) || 30,
        lessons: s.lessons,
        day_xp: recentDayXp(s.dayXp),
        synced_at: iso(Date.now())
      }),
      keepalive: keepalive
    }));

    return Promise.all(jobs).then(function (responses) {
      var ok = responses.length > 0;
      responses.forEach(function (r) { if (!r || !r.ok) ok = false; });
      if (!ok) {
        var bad = null;
        responses.forEach(function (r) { if (r && !r.ok && !bad) bad = r.status; });
        status.state = bad ? 'error' : 'offline';
        status.lastError = bad ? ('push -> ' + bad) : 'push failed (offline?)';
        /* Still dirty: the next mutation, the next 'online' event or the next
         * load will try again. The player has lost nothing — localStorage
         * already has all of it. */
        announce();
        return false;
      }
      status.pushes++;
      status.lastPush = Date.now();
      status.dirty = false;
      status.state = 'clean';
      status.lastError = null;
      QQStore.markSynced(xpAtPush, uid);      // only ever after a confirmed 2xx
      announce();
      return true;
    }).catch(function () {
      status.state = 'offline';
      announce();
      return false;
    });
  }

  // ------------------------------------------------------------------- cycle
  function fullSync(reason) {
    if (!signedIn()) { status.state = 'idle'; return Promise.resolve(false); }
    if (inFlight) return inFlight;

    var uid = QQAuth.userId();
    var previous = QQStore.accountId();

    /* A different account has used this browser. Their progress is not this
     * account's to push. Start clean and take the account's word for it. */
    if (previous && previous !== uid) {
      var email = (QQAuth.session() && QQAuth.session().user.email) || null;
      QQStore.reset();
      if (email) QQStore.setEmail(email);
      QQStore.markSynced(0, uid);
      log('sync_account_switched', { hadPrevious: true });
    }

    inFlight = pull().then(function (remote) {
      if (!remote) return false;
      var res = QQStore.mergeRemote(remote);
      log('sync_pulled', {
        reason: reason || null,
        questionsGained: res.questionsGained,
        changed: res.changed,
        remoteSolved: Object.keys(remote.solved || {}).length,
        remoteXp: remote.xp || 0,
        localXp: QQStore.totalXp()
      });
      if (res.changed && typeof QQSync.onMerged === 'function') {
        try { QQSync.onMerged(res); } catch (e) {}
      }
      return push().then(function (ok) {
        log(ok ? 'sync_pushed' : 'sync_failed', {
          reason: reason || null,
          solved: QQStore.solvedCount(),
          xp: QQStore.totalXp(),
          error: ok ? null : status.lastError
        });
        return ok;
      });
    }).catch(function () {
      status.state = 'error';
      return false;
    }).then(function (v) { inFlight = null; return v; });

    return inFlight;
  }

  var QQSync = {
    status: function () { return status; },

    /* Called once on boot, and again whenever auth changes. Safe to call when
     * signed out, offline, or from file:// — it just does nothing. */
    start: function (reason) {
      if (!signedIn()) { status.state = 'idle'; return Promise.resolve(false); }
      return fullSync(reason || 'start');
    },

    /* Any state change marks us dirty and schedules a push. Debounced, because a
     * lesson mutates the store several times in a few seconds. */
    nudge: function () {
      if (!signedIn()) return;
      if (!status.dirty) { status.dirty = true; announce(); }
      if (pushTimer) global.clearTimeout(pushTimer);
      pushTimer = global.setTimeout(function () {
        pushTimer = null;
        if (signedIn() && status.dirty) push();
      }, PUSH_DEBOUNCE_MS);
    },

    /* Now, not in 2.5 seconds: the tab is going away, or the network just came
     * back. keepalive lets the request outlive the page. */
    flush: function (keepalive) {
      if (pushTimer) { global.clearTimeout(pushTimer); pushTimer = null; }
      if (!signedIn() || !status.dirty) return Promise.resolve(false);
      return push({ keepalive: !!keepalive });
    },

    /* Set by the app so the road can re-render when a merge brings something in. */
    onMerged: null,

    /* Set by the app: called whenever a push settles, so the footer tells the
     * truth about whether anything is actually saved to the account. */
    onStatus: null
  };

  // --- wiring ---------------------------------------------------------------
  QQStore.onMutate = function () { QQSync.nudge(); };

  QQAuth.onChange(function (kind) {
    if (kind === 'signed-in') QQSync.start('signed-in');
    else if (kind === 'signed-out' || kind === 'refresh-rejected') { status.state = 'idle'; }
  });

  global.addEventListener('online', function () { QQSync.flush(false); });
  global.addEventListener('pagehide', function () { QQSync.flush(true); });
  global.addEventListener('visibilitychange', function () {
    if (global.document.visibilityState === 'hidden') QQSync.flush(true);
  });

  global.QQSync = QQSync;
})(window);
