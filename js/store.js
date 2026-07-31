/* QQ store — all persistent player state, in localStorage.
 *
 * Progress, crowns, XP, streak, daily goal and the captured email all live here.
 * This is device-local by design in this pass: there is no account, so there is
 * nothing to sync. When a real provider arrives (see js/auth.js) this whole
 * object is what gets mirrored server-side, keyed by the account id — which is
 * why every mutation goes through a named method rather than poking fields.
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
      solved: {},            // questionId -> { attempts, firstTry, ts }
      lessons: {},           // lessonId   -> { crowns, completions, bestFirstTry, lastTs }
      xp: 0,
      dayXp: {},             // 'YYYY-MM-DD' -> xp earned that day
      streak: 0,
      bestStreak: 0,
      lastActiveDay: null,
      email: null,           // captured locally only; never sent anywhere yet
      emailTs: null,
      libraryInterest: {},   // libraryId -> ts
      createdTs: Date.now(),
      lastSeenDay: null      // used once, on boot, to notice a broken streak
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

  function save() {
    try { global.localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* memory only */ }
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

    recordSolved: function (qid, attempts) {
      var s = load();
      if (!s.solved[qid]) {
        s.solved[qid] = { attempts: attempts, firstTry: attempts === 1, ts: Date.now() };
      } else {
        s.solved[qid].attempts = Math.min(s.solved[qid].attempts, attempts);
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

    // --- paid libraries ----------------------------------------------------
    registerLibraryInterest: function (libId) {
      var s = load();
      s.libraryInterest[libId] = Date.now();
      save();
    },
    hasLibraryInterest: function (libId) { return !!load().libraryInterest[libId]; }
  };

  global.QQStore = QQStore;
})(window);
