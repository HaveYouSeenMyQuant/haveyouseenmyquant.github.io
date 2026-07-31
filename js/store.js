/* QQ store — all persistent player state, in localStorage.
 *
 * Progress, crowns, XP, streak, daily goal and the captured email all live here.
 * localStorage is the WRITE-THROUGH layer and it is always written first: the UI
 * reads this object synchronously, so a solved question is on screen and on disk
 * before any network is touched. js/sync.js mirrors this to Postgres in the
 * background when there is an account, and everything below works untouched when
 * there is not.
 *
 * MERGING, which is the whole reason exportForSync/mergeRemote exist. A phone
 * that played unit 1 anonymously and then signs in has real progress that the
 * server has never seen; an account opened on a new laptop has the reverse. So
 * the rule is never "last write wins" — it is "take the better of the two, per
 * question": solved beats unsolved, fewer attempts beats more, and XP earned
 * since the last sync is ADDED rather than dropped. Nothing solved is ever
 * un-solved by a sync.
 *
 * Nothing in here knows about the DOM, and nothing in here tracks events; the
 * app decides what is worth reporting.
 */
(function (global) {
  'use strict';

  var KEY = 'qq.state.v2';
  var MAX_CROWNS = 3;
  var mem = null;

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function daysBetween(a, b) {           // both 'YYYY-MM-DD'
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  }

  function blank() {
    return {
      solved: {},            // questionId -> { attempts, firstTry, ts, ms }
      lessons: {},           // lessonId   -> { crowns, completions, bestFirstTry, lastTs }
      xp: 0,
      dayXp: {},             // 'YYYY-MM-DD' -> xp earned that day
      streak: 0,
      bestStreak: 0,
      lastActiveDay: null,
      email: null,           // captured locally; also mirrored to the account
      emailTs: null,
      softPromptTs: null,    // the soft early email ask, shown at most once ever
      libraryInterest: {},   // libraryId -> ts
      createdTs: Date.now(),
      lastSeenDay: null,     // used once, on boot, to notice a broken streak
      syncedXp: 0,           // total XP as of the last CONFIRMED push
      syncedTs: 0,           // when that was
      accountId: null        // the auth user this device last synced with
    };
  }

  function load() {
    if (mem) return mem;
    var raw;
    try { raw = global.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) { try { mem = JSON.parse(raw); } catch (e) { mem = null; } }
    if (!mem || typeof mem !== 'object') mem = blank();
    var b = blank();
    for (var k in b) if (!(k in mem)) mem[k] = b[k];
    return mem;
  }

  /* Every mutation lands here. js/sync.js hangs a debounced background push off
   * onMutate; it is null when nobody is listening, which is the offline and
   * signed-out case, and costs nothing. */
  function save(silent) {
    try { global.localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* memory only */ }
    if (!silent && typeof QQStore.onMutate === 'function') {
      try { QQStore.onMutate(); } catch (e) { /* a sync must never break a lesson */ }
    }
  }

  var QQStore = {
    state: load,
    save: save,
    today: today,
    MAX_CROWNS: MAX_CROWNS,

    reset: function () { mem = blank(); save(); },

    // --- questions ---------------------------------------------------------
    isSolved: function (qid) { return !!load().solved[qid]; },
    solvedCount: function () { return Object.keys(load().solved).length; },

    recordSolved: function (qid, attempts, ms) {
      var s = load();
      if (!s.solved[qid]) {
        s.solved[qid] = { attempts: attempts, firstTry: attempts === 1, ts: Date.now(), ms: ms || 0 };
      } else {
        s.solved[qid].attempts = Math.min(s.solved[qid].attempts, attempts);
        s.solved[qid].ms = Math.max(s.solved[qid].ms || 0, ms || 0);
      }
      save();
      return s.solved[qid];
    },

    // --- lessons and crowns -------------------------------------------------
    /* A crown per completion, capped. Repeat play has a point, but grinding the
     * same lesson forever does not — that is what the cap is for. */
    lessonState: function (lessonId) {
      var s = load();
      return s.lessons[lessonId] || { crowns: 0, completions: 0, bestFirstTry: 0, lastTs: 0 };
    },
    lessonDone: function (lessonId) { return this.lessonState(lessonId).crowns > 0; },

    completeLesson: function (lessonId, firstTryCount) {
      var s = load();
      var st = s.lessons[lessonId] || { crowns: 0, completions: 0, bestFirstTry: 0, lastTs: 0 };
      var wasFirst = st.completions === 0;
      st.completions += 1;
      st.crowns = Math.min(MAX_CROWNS, st.crowns + 1);
      st.bestFirstTry = Math.max(st.bestFirstTry, firstTryCount || 0);
      st.lastTs = Date.now();
      s.lessons[lessonId] = st;
      save();
      return { crowns: st.crowns, completions: st.completions, firstEver: wasFirst };
    },

    unitCrowns: function (unit) {
      var n = 0;
      for (var i = 0; i < unit.lessons.length; i++) n += this.lessonState(unit.lessons[i].id).crowns;
      return n;
    },
    unitComplete: function (unit) {
      for (var i = 0; i < unit.lessons.length; i++) {
        if (!this.lessonDone(unit.lessons[i].id)) return false;
      }
      return unit.lessons.length > 0;
    },

    // --- XP, daily goal, streak --------------------------------------------
    /* Streak rule, honest and simple: a day counts once you earn XP on it.
     * Consecutive such days extend it; a gap resets it to 1. Nothing is faked
     * and nothing is lost for being slow — only for not turning up. */
    addXp: function (n) {
      var s = load(), d = today();
      var before = s.dayXp[d] || 0;
      s.xp += n;
      s.dayXp[d] = before + n;
      var streak = this.touchStreak();
      save();
      return { total: s.xp, today: s.dayXp[d], before: before, streak: streak.streak, streakChanged: streak.changed };
    },
    totalXp: function () { return load().xp; },
    xpToday: function () { return load().dayXp[today()] || 0; },

    touchStreak: function () {
      var s = load(), d = today();
      if (s.lastActiveDay === d) return { changed: false, streak: s.streak };
      if (s.lastActiveDay && daysBetween(s.lastActiveDay, d) === 1) s.streak += 1;
      else s.streak = 1;
      s.lastActiveDay = d;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      save();
      return { changed: true, streak: s.streak };
    },

    /* A streak shown as live when the last active day is neither today nor
     * yesterday would be a lie; report it as 0 instead. */
    currentStreak: function () {
      var s = load();
      if (!s.lastActiveDay) return 0;
      var gap = daysBetween(s.lastActiveDay, today());
      return (gap === 0 || gap === 1) ? s.streak : 0;
    },
    bestStreak: function () { return load().bestStreak; },

    /* Called once on boot. Returns the length of a streak that has just been
     * lost, or 0. The app turns that into the streak_broken event — the single
     * most important retention signal we have. */
    noticeBrokenStreak: function () {
      var s = load();
      if (!s.lastActiveDay || !s.streak) return 0;
      var gap = daysBetween(s.lastActiveDay, today());
      if (gap > 1) {
        var lost = s.streak;
        s.streak = 0;
        save();
        return lost;
      }
      return 0;
    },

    // --- email (local only in this pass) -----------------------------------
    hasEmail: function () { return !!load().email; },
    email: function () { return load().email; },
    setEmail: function (email) {
      var s = load();
      s.email = email;
      s.emailTs = email ? Date.now() : null;
      save();
    },

    /* The soft ask after the first lesson. Asked once, ever, per device — a
     * second one would be nagging, and nagging is what makes people leave.
     * Local by design: it is not carried between devices, because it is a fact
     * about this browser, not about the player. */
    softPromptShown: function () { return !!load().softPromptTs; },
    markSoftPromptShown: function () {
      var s = load();
      s.softPromptTs = Date.now();
      save();
    },

    // --- paid libraries ----------------------------------------------------
    registerLibraryInterest: function (libId) {
      var s = load();
      s.libraryInterest[libId] = Date.now();
      save();
    },
    hasLibraryInterest: function (libId) { return !!load().libraryInterest[libId]; },

    // --- the cloud mirror ---------------------------------------------------
    /* A hook js/sync.js sets. Called after every mutation above. */
    onMutate: null,

    /* Everything worth carrying between devices, in one flat object. Deliberately
     * NOT the whole state: libraryInterest is a local research note, and the
     * event ring buffer belongs to analytics. */
    exportForSync: function () {
      var s = load();
      return {
        solved: s.solved,
        lessons: s.lessons,
        xp: s.xp,
        dayXp: s.dayXp,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastActiveDay: s.lastActiveDay,
        email: s.email,
        syncedXp: s.syncedXp || 0
      };
    },

    /* THE merge. `r` is the same shape as exportForSync, built by js/sync.js out
     * of the progress rows and the profile row. Returns what changed so the app
     * can re-render only when it has to, and so the sync can say something true
     * in the event log.
     *
     * Per question the better record wins outright — a solved question can never
     * be un-solved, in either direction. XP is the one field where "better" is
     * not just max(): whatever this device earned since its last confirmed push
     * is genuinely new, so it is added on top of whatever the server has, and the
     * result is never below either side. */
    mergeRemote: function (r) {
      if (!r) return { changed: false, questionsGained: 0 };
      var s = load(), changed = false, gained = 0, k;

      var rs = r.solved || {};
      for (k in rs) {
        if (!Object.prototype.hasOwnProperty.call(rs, k)) continue;
        var rq = rs[k], lq = s.solved[k];
        if (!lq) {
          s.solved[k] = {
            attempts: rq.attempts || 1,
            firstTry: !!rq.firstTry,
            ts: rq.ts || Date.now(),
            ms: rq.ms || 0
          };
          gained++; changed = true;
          continue;
        }
        var attempts = Math.min(lq.attempts || 99, rq.attempts || 99);
        var firstTry = !!(lq.firstTry || rq.firstTry);
        var ts = Math.min(lq.ts || Date.now(), rq.ts || Date.now());
        var ms = Math.max(lq.ms || 0, rq.ms || 0);
        if (attempts !== lq.attempts || firstTry !== lq.firstTry || ts !== lq.ts || ms !== (lq.ms || 0)) {
          s.solved[k] = { attempts: attempts, firstTry: firstTry, ts: ts, ms: ms };
          changed = true;
        }
      }

      var rl = r.lessons || {};
      for (k in rl) {
        if (!Object.prototype.hasOwnProperty.call(rl, k)) continue;
        var rr = rl[k] || {};
        var ll = s.lessons[k] || { crowns: 0, completions: 0, bestFirstTry: 0, lastTs: 0 };
        var merged = {
          crowns: Math.min(MAX_CROWNS, Math.max(ll.crowns || 0, rr.crowns || 0)),
          completions: Math.max(ll.completions || 0, rr.completions || 0),
          bestFirstTry: Math.max(ll.bestFirstTry || 0, rr.bestFirstTry || 0),
          lastTs: Math.max(ll.lastTs || 0, rr.lastTs || 0)
        };
        if (merged.crowns !== ll.crowns || merged.completions !== ll.completions ||
            merged.bestFirstTry !== ll.bestFirstTry || merged.lastTs !== ll.lastTs) {
          s.lessons[k] = merged;
          changed = true;
        }
      }

      var synced = s.syncedXp || 0;
      var earnedSincePush = Math.max(0, s.xp - synced);
      var remoteXp = Math.max(0, r.xp || 0);
      var xp = (remoteXp >= synced) ? remoteXp + earnedSincePush : Math.max(s.xp, remoteXp);
      if (xp > s.xp) { s.xp = xp; changed = true; }

      /* Per-day XP follows the same rule as the total, or the goal ring would
       * disagree with the XP number after a merge: today's entry gains whatever
       * this device earned since its last push, older days just take the better
       * of the two. */
      var rd = r.dayXp || {}, d = today();
      for (k in rd) {
        if (!Object.prototype.hasOwnProperty.call(rd, k)) continue;
        var best = Math.max(rd[k] || 0, s.dayXp[k] || 0);
        if (k === d) best += earnedSincePush;
        if (best > (s.dayXp[k] || 0)) { s.dayXp[k] = best; changed = true; }
      }

      if ((r.streak || 0) > s.streak) { s.streak = r.streak; changed = true; }
      if ((r.bestStreak || 0) > s.bestStreak) { s.bestStreak = r.bestStreak; changed = true; }
      if (r.lastActiveDay && (!s.lastActiveDay || r.lastActiveDay > s.lastActiveDay)) {
        s.lastActiveDay = r.lastActiveDay; changed = true;
      }
      if (!s.email && r.email) { s.email = r.email; s.emailTs = Date.now(); changed = true; }

      if (changed) save(true);      // silent: a pull must not trigger a push loop
      return { changed: changed, questionsGained: gained };
    },

    /* Called only after the server has CONFIRMED a push. Getting this wrong in
     * the optimistic direction would double-count XP on the next merge, so it is
     * never set hopefully. */
    markSynced: function (xp, accountId) {
      var s = load();
      s.syncedXp = xp;
      s.syncedTs = Date.now();
      if (accountId) s.accountId = accountId;
      save(true);
    },
    syncedXp: function () { return load().syncedXp || 0; },
    accountId: function () { return load().accountId; }
  };

  global.QQStore = QQStore;
})(window);
