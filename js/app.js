/* QQ app — the path, the lesson loop, hearts, XP, the wall, the libraries.
 *
 * Every user-visible state change that means something is tracked through QQA
 * (js/analytics.js) and nothing else. If you add a screen, add its event to
 * METRICS.md in the same commit.
 *
 * Shape of the thing, in one paragraph: QQ_DATA holds units, each unit holds
 * lessons, each lesson holds 4-5 questions of mixed type. The path screen draws
 * the units as coloured sections with a winding line of lesson nodes. Tapping an
 * open node starts a lesson: one question per screen, a progress bar, hearts,
 * immediate feedback, and a celebration at the end that awards XP and a crown.
 * A wrong answer costs a heart and puts the question back at the end of the
 * queue, which is the most Duolingo thing in here — you cannot leave a lesson
 * having got something wrong and not seen it again.
 */
(function (global) {
  'use strict';

  var D = window.QQ_DATA;
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svgIcon(paths, size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '">' + paths + '</svg>';
  }
  var ICON_TICK = '<path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  var ICON_LOCK = '<path d="M7 10V8a5 5 0 0110 0v2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="4.5" y="10" width="15" height="10" rx="2.5" fill="currentColor"/>';
  var ICON_CROWN = '<path d="M3 8l4 3.2L12 4l5 7.2L21 8l-1.7 10H4.7L3 8z" fill="currentColor"/>';
  var ICON_HEART = '<path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0112 7a4.6 4.6 0 018 3.6C20 16.1 12 21 12 21z" fill="currentColor"/>';
  var ICON_FLAME = '<path d="M12 2c1.5 4-3 5.5-3 9a3 3 0 006 0c0-1 .4-1.8 1-2.4.8 1.2 2 3 2 5.4a6 6 0 11-12 0C6 9 12 8 12 2z" fill="currentColor"/>';

  // ======================================================================
  // the shape of the road
  // ======================================================================
  function allLessons() {
    var out = [];
    D.units.forEach(function (u) {
      u.lessons.forEach(function (l, i) { out.push({ unit: u, lesson: l, indexInUnit: i }); });
    });
    return out;
  }

  /* Access, in one place.
   *  - unit 1 is open to everyone, always, with no email and no account
   *  - later units need QQAuth.hasAccess() (the email seam) AND the unit before
   *    them finished, so the road stays a road
   *  - inside a unit, lessons unlock one at a time                            */
  function lessonLock(unit, lesson, indexInUnit) {
    if (!unit.free) {
      if (!QQAuth.hasAccess()) return 'email';
      var prevUnit = D.units[unit.index - 2];
      if (prevUnit && !QQStore.unitComplete(prevUnit)) return 'sequence';
    }
    if (indexInUnit > 0) {
      var prev = unit.lessons[indexInUnit - 1];
      if (!QQStore.lessonDone(prev.id)) return 'sequence';
    }
    return false;
  }

  /* The one node that should be pulsing: the first open, unfinished lesson. */
  function currentLesson() {
    var list = allLessons(), i;
    for (i = 0; i < list.length; i++) {
      var x = list[i];
      if (!QQStore.lessonDone(x.lesson.id) && !lessonLock(x.unit, x.lesson, x.indexInUnit)) return x;
    }
    for (i = list.length - 1; i >= 0; i--) {   // everything done: the last open one
      var y = list[i];
      if (!lessonLock(y.unit, y.lesson, y.indexInUnit)) return y;
    }
    return list[0];
  }

  // ======================================================================
  // header
  // ======================================================================
  function renderHeader() {
    var streak = QQStore.currentStreak();
    var todayXp = QQStore.xpToday();
    var goal = D.dailyGoalXp;
    $('#streakValue').textContent = String(streak);
    $('#streakChip').classList.toggle('live', streak > 0);
    $('#goalValue').textContent = Math.min(todayXp, goal) + '/' + goal;
    var pct = Math.min(1, todayXp / goal);
    var circ = 2 * Math.PI * 13;
    var ring = $('#goalRingFill');
    ring.style.strokeDasharray = circ.toFixed(1);
    ring.style.strokeDashoffset = (circ * (1 - pct)).toFixed(1);
    $('#goalChip').classList.toggle('done', pct >= 1);
    renderToday(pct, todayXp, goal, streak);
  }

  /* The same goal, on the road, where the decision to play one more is made.
   * The header chip is a status line; this is the thing that says how close. */
  function renderToday(pct, todayXp, goal, streak) {
    var strip = $('#todayStrip');
    if (!strip) return;
    var circ = 2 * Math.PI * 18;
    var ring = $('#todayRingFill');
    ring.style.strokeDasharray = circ.toFixed(1);
    ring.style.strokeDashoffset = (circ * (1 - pct)).toFixed(1);
    var met = pct >= 1;
    strip.classList.toggle('met', met);
    $('#todayHead').textContent = met ? 'Goal met today' : 'Daily goal';
    $('#todaySub').textContent = met
      ? 'Come back tomorrow to keep it'
      : (goal - todayXp) + ' XP to go · one lesson';
    var flame = $('#todayStreak');
    flame.className = 'today-streak' + (streak > 0 ? ' live' : ' cold');
    flame.innerHTML = streak > 0
      ? svgIcon(ICON_FLAME, 15) + '<span>' + streak + '</span>'
      : svgIcon(ICON_FLAME, 13) + '<span>no streak</span>';
    flame.title = streak > 0 ? streak + ' days in a row' : 'play today to start a streak';
  }

  /* The footer line is the only place the road says anything about accounts, and
   * it must never overstate what is true: "synced" appears when a push has
   * actually been confirmed, not when we merely have a session. */
  function renderAccountLine() {
    var line = $('#footerLine');
    if (!line) return;
    var user = QQAuth.currentUser();
    if (QQAuth.isSignedIn()) {
      var st = global.QQSync ? QQSync.status() : null;
      /* Order matters: anything unsent outranks an old successful push, or the
       * line would claim "saved" while a lesson is sitting in localStorage
       * waiting for the network. */
      var where = (st && (st.dirty || st.state === 'offline' || st.state === 'error'))
          ? 'syncing when the network is back'
        : (st && st.lastPush) ? 'saved to your account'
        : 'saving to your account…';
      line.textContent = (user && user.email ? user.email : 'signed in') + ' · ' + where + ' · v2';
    } else if (user) {
      line.textContent = 'saved on this device · open your sign-in link to attach it · v2';
    } else {
      line.textContent = 'progress saved on this device · v2';
    }
  }

  // ======================================================================
  // the path
  // ======================================================================
  var GAP = 158;          // enough that a START bubble never lands on the label
                          // of the node above it, even with a two-line title
  var NODE = 74;

  /* The road itself: one dotted segment between each pair of nodes, positioned
   * in px against the track's centre line so nothing has to be measured after
   * layout. Solid once both ends are behind you, faint while they are ahead. */
  function connector(track, x0, y0, x1, y1, lit, fromId, alive, order) {
    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var seg = el('div', 'road-seg' + (lit ? ' lit' : ''));
    seg.style.width = len.toFixed(1) + 'px';
    seg.style.left = 'calc(50% + ' + ((x0 + x1) / 2).toFixed(1) + 'px)';
    seg.style.top = ((y0 + y1) / 2).toFixed(1) + 'px';
    seg.style.transform = 'translate(-50%, -50%) rotate(' + ang.toFixed(2) + 'deg)';
    if (fromId) seg.dataset.from = fromId;
    /* The ambient drift, built with the road and running from the first frame.
     * One element per segment, one transform, staggered so the road reads as
     * flowing in one direction rather than blinking on and off together. */
    if (alive) {
      var flow = el('i', 'seg-flow' + (alive === 'faint' ? ' faint' : ''));
      flow.style.setProperty('--d', (order * -0.62).toFixed(2) + 's');
      seg.appendChild(flow);
    }
    /* The ink the level-up draws forward. It is built here, with the road, at
     * scaleX(0) — so the celebration only ever adds a class, and never makes a
     * node while frames are being counted. The local +x axis of the segment
     * points at the NEXT node, which is why the ink grows from its left edge. */
    seg.appendChild(el('i', 'seg-ink'));
    track.appendChild(seg);
  }

  function renderPath() {
    var host = $('#pathHost');
    host.innerHTML = '';
    var cur = currentLesson();
    /* The node right after the one you are on. It is still shut, but it is the
     * way onwards and must not look like the far end of the road. */
    var upNext = cur ? nextLessonAfter(cur.lesson.id) : null;
    var upNextId = (upNext && upNext.lock === 'sequence') ? upNext.lesson.id : null;
    var sleepN = 0;

    D.units.forEach(function (unit) {
      var section = el('section', 'unit');
      section.dataset.unit = unit.id;
      section.style.setProperty('--unit', unit.colour);
      var locked = !unit.free && !QQAuth.hasAccess();
      var unitDone = QQStore.unitComplete(unit);

      // ---- unit banner
      var head = el('div', 'unit-head' + (locked ? ' dim' : '') + (unitDone ? ' complete' : ''));
      var kick = el('div', 'unit-kicker');
      kick.appendChild(el('span', 'unit-n', 'Unit ' + unit.index));
      var crowns = QQStore.unitCrowns(unit);
      var maxCrowns = unit.lessons.length * QQStore.MAX_CROWNS;
      var cr = el('span', 'unit-crowns');
      cr.innerHTML = svgIcon(ICON_CROWN, 13) + ' ' + crowns + '/' + maxCrowns;
      kick.appendChild(cr);
      head.appendChild(kick);
      head.appendChild(el('h2', null, unit.title));
      head.appendChild(el('p', null, unit.subtitle));

      // crowns as a bar: progress towards the next reward, without counting
      var bar = el('div', 'unit-bar');
      var fill = el('i');
      fill.style.transform = 'scaleX(' + (maxCrowns ? crowns / maxCrowns : 0).toFixed(3) + ')';
      bar.appendChild(fill);
      head.appendChild(bar);

      if (locked) {
        var badge = el('div', 'unit-locked');
        badge.innerHTML = svgIcon(ICON_LOCK, 13) + ' <span>email to unlock</span>';
        head.appendChild(badge);
      } else if (unitDone) {
        var doneBadge = el('div', 'unit-done');
        doneBadge.innerHTML = svgIcon(ICON_TICK, 12) + ' <span>UNIT COMPLETE</span>';
        head.appendChild(doneBadge);
      }
      section.appendChild(head);

      // ---- the winding line of lesson nodes
      var track = el('div', 'unit-track');
      var n = unit.lessons.length;
      track.style.height = ((n - 1) * GAP + 138) + 'px';

      // the dotted road, drawn first so the nodes sit on top of it
      for (var s = 0; s + 1 < n; s++) {
        var doneBoth = QQStore.lessonDone(unit.lessons[s].id) &&
                       QQStore.lessonDone(unit.lessons[s + 1].id);
        connector(track,
          Math.sin(s * Math.PI / 2) * 58, s * GAP + NODE / 2,
          Math.sin((s + 1) * Math.PI / 2) * 58, (s + 1) * GAP + NODE / 2,
          doneBoth, unit.lessons[s].id, locked ? 'faint' : true, s);
      }

      unit.lessons.forEach(function (lesson, i) {
        var st = QQStore.lessonState(lesson.id);
        var lock = lessonLock(unit, lesson, i);
        var done = st.crowns > 0;
        var isNext = !done && lesson.id === upNextId;
        var state = done ? 'done' : (isNext ? 'next' : (lock ? 'locked' : 'open'));
        var isCurrent = cur && cur.lesson.id === lesson.id && !done;

        var holder = el('div', 'node-holder');
        holder.dataset.lesson = lesson.id;      // how the level-up finds its two nodes
        // a gentle snake: centre, right, centre, left, repeating
        var offset = Math.sin(i * Math.PI / 2) * 58;
        holder.style.left = 'calc(50% + ' + offset.toFixed(1) + 'px)';
        holder.style.top = (i * GAP) + 'px';

        var btn = el('button', 'node ' + state + (isCurrent ? ' current' : ''));
        btn.type = 'button';
        // the dormant breath, offset per node so the road does not blink in unison
        if (state === 'locked' || state === 'next') {
          btn.style.setProperty('--sleep', (-(sleepN++ % 5) * 1.3).toFixed(1) + 's');
        }
        btn.setAttribute('aria-label', lesson.title + (lock ? ' (locked)' : ''));

        // the ring is a crown counter: one arc per crown earned here
        var ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ring.setAttribute('class', 'node-ring');
        ring.setAttribute('viewBox', '0 0 74 74');
        var R = 33, circ = 2 * Math.PI * R;
        var bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bg.setAttribute('cx', 37); bg.setAttribute('cy', 37); bg.setAttribute('r', R);
        bg.setAttribute('class', 'ring-bg');
        ring.appendChild(bg);
        for (var c = 0; c < QQStore.MAX_CROWNS; c++) {
          var seg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          seg.setAttribute('cx', 37); seg.setAttribute('cy', 37); seg.setAttribute('r', R);
          seg.setAttribute('class', 'ring-seg' + (c < st.crowns ? ' on' : ''));
          var span = circ / QQStore.MAX_CROWNS - 6;
          seg.style.strokeDasharray = span + ' ' + (circ - span);
          seg.style.strokeDashoffset = -(c * circ / QQStore.MAX_CROWNS) - 3;
          ring.appendChild(seg);
        }

        /* Questions answered inside a lesson you have not finished yet.
         *
         * The crown ring above only moves when a whole lesson is done, so a
         * player who has answered one question and come back out had nothing
         * at all to look at — the road told them they had done nothing. That
         * is exactly the moment a first-time visitor lands on the road under
         * the straight-to-question opening, so it has to show. One thin arc,
         * under the crown segments, in the unit's colour. */
        var solvedHere = 0;
        if (!done) {
          lesson.questions.forEach(function (q) { if (QQStore.isSolved(q.id)) solvedHere++; });
        }
        if (solvedHere > 0) {
          var part = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          part.setAttribute('cx', 37); part.setAttribute('cy', 37); part.setAttribute('r', R);
          part.setAttribute('class', 'ring-part');
          var frac = Math.min(1, solvedHere / lesson.questions.length);
          part.style.strokeDasharray = (circ * frac).toFixed(1) + ' ' + circ;
          ring.appendChild(part);
        }
        btn.appendChild(ring);

        var face = el('span', 'node-face');
        if (state === 'locked') face.innerHTML = svgIcon(ICON_LOCK, 22);
        else if (done && st.crowns >= QQStore.MAX_CROWNS) face.innerHTML = svgIcon(ICON_CROWN, 26);
        else if (done) face.innerHTML = svgIcon(ICON_TICK, 26);
        else face.textContent = String(i + 1);
        btn.appendChild(face);

        btn.addEventListener('click', function () { onLessonTap(unit, lesson, i); });
        holder.appendChild(btn);

        var lab = el('div', 'node-label');
        lab.appendChild(el('span', 'node-title', lesson.title));
        var sub = el('span', 'node-sub');
        if (state === 'next') sub.textContent = 'next up';
        else if (state === 'locked') sub.textContent = lock === 'email' ? 'email to unlock' : 'locked';
        else if (done) sub.textContent = st.crowns + '/' + QQStore.MAX_CROWNS + ' crowns';
        else if (solvedHere > 0) sub.textContent = solvedHere + ' of ' + lesson.questions.length + ' answered';
        else sub.textContent = lesson.questions.length + ' questions';
        lab.appendChild(sub);
        holder.appendChild(lab);

        if (isCurrent) holder.appendChild(el('div', 'start-bubble', st.completions ? 'AGAIN' : 'START'));
        track.appendChild(holder);
      });

      section.appendChild(track);
      host.appendChild(section);
    });

    /* The road does not stop where the writing stopped. A ghost node past the
     * last unit says there is more coming, which is the difference between a
     * finished list and a road you are partway along. */
    var more = el('div', 'road-more');
    more.appendChild(el('span', 'tail'));
    more.appendChild(el('span', 'ghost', '···'));
    more.appendChild(el('p', null, 'MORE BEING WRITTEN'));
    host.appendChild(more);

    renderLibraries();
    renderHeader();
    renderAccountLine();

    /* The mascot stands wherever the road says "current" — it is re-derived
     * from this freshly drawn path every time, so it can never be stranded
     * at a node the player has already finished. */
    if (global.QQMascot) QQMascot.pathRendered();

    /* Only ever on the road, and only when the road is the screen you are
     * looking at — a re-render from a background sync must not spend the
     * celebration on a wall the player is currently reading. */
    if (pendingLevelUp && $('#screen-path').classList.contains('on')) {
      var p = pendingLevelUp;
      pendingLevelUp = null;
      setTimeout(function () { playLevelUp(p.lessonId, p.nextLessonId, p.unitCleared); }, 90);
    }
  }

  /* Landing mid-road is the point: you should arrive already looking at the
   * thing you are meant to tap, not at a marketing page. */
  function scrollToNode(node, smooth) {
    if (!node) return;
    try { node.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' }); }
    catch (e) { node.scrollIntoView(); }
  }
  function scrollToCurrent(smooth) { scrollToNode($('.node.current'), smooth); }

  // ======================================================================
  // the level-up — the road's own reward, played once, after a lesson
  // ======================================================================
  /* Duolingo's trick is that the road itself reacts: you come back from a lesson
   * and watch the node you just beat slam shut, throw off a few sparks, push the
   * road forward and wake the next one up. It is a reward, so it is quick,
   * generous and over: 1.15s at the outside, and a tap anywhere cuts it to the
   * end state immediately.
   *
   * The 60fps rules, kept honestly:
   *   - transform and opacity only, never width/top/left, so nothing relayouts;
   *   - the sparks are the only nodes created, and they are all built before the
   *     first frame and dropped at the end — nothing is made per frame;
   *   - no getBoundingClientRect, no offsetTop, nothing read back mid-flight;
   *   - the two moving nodes get will-change while they move and lose it after.
   *
   * prefers-reduced-motion gets the same information with none of the movement:
   * the two nodes fade up, and none of the classes above are ever applied. */
  var pendingLevelUp = null;      // { lessonId, nextLessonId }, set on finishing
  var levelUpTimers = [];
  var levelUpEnd = null;          // the cleanup for the run in flight, or null
  var levelUpTs = 0;

  function reducedMotion() {
    try {
      return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  function onLevelUpTap() { endLevelUp(true); }

  function endLevelUp(skipped) {
    if (!levelUpEnd) return;
    var done = levelUpEnd;
    levelUpEnd = null;
    for (var i = 0; i < levelUpTimers.length; i++) clearTimeout(levelUpTimers[i]);
    levelUpTimers = [];
    document.removeEventListener('pointerdown', onLevelUpTap, true);
    done(skipped);
  }

  function playLevelUp(doneId, nextId, clearedUnitId) {
    endLevelUp(false);                                   // never two at once
    var holder = $('.node-holder[data-lesson="' + doneId + '"]');
    if (!holder) return;
    var doneNode = holder.querySelector('.node');
    var nextHolder = nextId ? $('.node-holder[data-lesson="' + nextId + '"]') : null;
    var nextNode = nextHolder ? nextHolder.querySelector('.node') : null;
    var segEl = nextId ? $('.road-seg[data-from="' + doneId + '"] .seg-ink') : null;
    var unitHead = clearedUnitId ? $('.unit[data-unit="' + clearedUnitId + '"] .unit-head') : null;
    var reduced = reducedMotion();
    var sparks = null, ripple = null;
    levelUpTs = Date.now();

    function finish(skipped) {
      doneNode.classList.remove('stamp', 'lvl-fade');
      doneNode.style.willChange = '';
      if (nextNode) {
        nextNode.classList.remove('wake', 'lvl-fade');
        nextNode.style.willChange = '';
      }
      if (segEl) segEl.classList.remove('draw');
      if (unitHead) unitHead.classList.remove('clearing');
      if (sparks && sparks.parentNode) sparks.parentNode.removeChild(sparks);
      if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
      /* Wherever the travel got to, land on the node that is now live — the
       * road has moved on and the screen has to agree with it. */
      scrollToNode(nextNode || doneNode, false);
      QQA.track('level_up_played', {
        lessonId: doneId, nextLessonId: nextId || null, unitCleared: clearedUnitId || null,
        reduced: reduced, skipped: !!skipped, msShown: Date.now() - levelUpTs
      });
    }
    levelUpEnd = finish;
    document.addEventListener('pointerdown', onLevelUpTap, true);

    if (reduced) {
      doneNode.classList.add('lvl-fade');
      if (nextNode) nextNode.classList.add('lvl-fade');
      levelUpTimers.push(setTimeout(function () { endLevelUp(false); }, 560));
      return;
    }

    // 1. the node you just beat stamps shut, with the overshoot
    doneNode.style.willChange = 'transform';
    ripple = el('div', 'node-ripple');
    doneNode.appendChild(ripple);
    doneNode.classList.add('stamp');

    // 2. eight sparks in the unit's colour, all eight built right here
    sparks = el('div', 'sparks');
    for (var s = 0; s < 8; s++) {
      var bit = el('i');
      var ang = (s / 8) * Math.PI * 2 + 0.39;
      var reach = 40 + (s % 3) * 10;
      bit.style.setProperty('--tx', (Math.cos(ang) * reach).toFixed(1) + 'px');
      bit.style.setProperty('--ty', (Math.sin(ang) * reach).toFixed(1) + 'px');
      bit.style.animationDelay = (s * 12) + 'ms';
      sparks.appendChild(bit);
    }
    holder.appendChild(sparks);

    // 3. the road inks itself forward, and hands its light to the next node
    if (segEl) {
      levelUpTimers.push(setTimeout(function () { segEl.classList.add('draw'); }, 200));
    }
    /* 4. the VIEW travels with the ink. Without this the whole thing happens in
     * one static frame and reads as a node twitching; with it, the screen is
     * plainly walking down the road to the next stop. The scroll is the
     * browser's own smooth scroll — compositor work, not ours. */
    if (nextNode) {
      nextNode.style.willChange = 'transform';
      levelUpTimers.push(setTimeout(function () { scrollToNode(nextNode, true); }, 260));
      levelUpTimers.push(setTimeout(function () { nextNode.classList.add('wake'); }, 700));
    }
    // 5. the milestone: a whole unit falling is bigger than a lesson falling
    if (unitHead) {
      levelUpTimers.push(setTimeout(function () { unitHead.classList.add('clearing'); }, 320));
    }
    levelUpTimers.push(setTimeout(function () { endLevelUp(false); }, unitHead ? 1400 : 1150));
  }

  // ======================================================================
  // libraries — money never touches the road
  // ======================================================================
  /* PREMIUM, never a price. Wherever a library is merely LISTED it says what
   * kind of thing it is and nothing about money: a number on a card nobody asked
   * about reads as a paywall on the road, and the road has no paywall. The price
   * lives one tap deeper, on the detail screen, where the player has asked. */
  function fillBadge(node, lib, big) {
    var soon = lib.status === 'soon';
    node.className = 'lib-badge' + (big ? ' big' : '') + (soon ? ' plain' : '');
    node.innerHTML = svgIcon(ICON_LOCK, 11) + '<span>' + (soon ? 'SOON' : 'PREMIUM') + '</span>';
    return node;
  }
  function libBadge(lib, big) { return fillBadge(el('span'), lib, big); }

  function renderLibraries() {
    var host = $('#libraryList');
    if (host.dataset.built) return;
    host.dataset.built = '1';
    D.libraries.forEach(function (lib) {
      var card = el('button', 'lib-card');
      card.type = 'button';
      var top = el('div', 'lib-top');
      top.appendChild(el('div', 'lib-name', lib.name));
      top.appendChild(libBadge(lib, false));
      card.appendChild(top);
      card.appendChild(el('div', 'lib-blurb', lib.blurb));
      /* WHAT IS ACTUALLY IN THERE. This line used to read "the road stays
       * free" on every card, which the section intro already says once, six
       * lines above all of them — so it spent the only free line on each card
       * repeating a reassurance instead of giving a reason to tap.
       *
       * Measured 2026-08-06 over 8 days: 94 sessions saw this shelf and 1
       * tapped it. The price deliberately stays on the detail screen (see the
       * note under openLibrary — it has to earn the price with topics and real
       * samples), so this shows the size instead, which is the same
       * "locked door you can see through" idea one level earlier. */
      var nq = (lib.questions || []).length, nt = (lib.topics || []).length;
      card.appendChild(el('div', 'lib-meta',
        nq && nt ? nq + ' questions · ' + nt + ' topics' : 'the road stays free'));
      card.appendChild(el('span', 'lib-open', 'See inside →'));
      card.addEventListener('click', function () { onLibraryTap(lib); });
      host.appendChild(card);
      QQA.track('library_viewed', { libraryId: lib.id, status: lib.status });
    });
  }

  // ---------------------------------------------------------- the detail
  /* The one screen in the app that shows a price. It has to earn the price: how
   * many questions, which topics, and two real examples of what they are like —
   * a locked door you can see through is worth opening, a blank one is not. */
  var libFor = null, libOpenedTs = 0, libBuyTapped = false;

  function onLibraryTap(lib) {
    QQA.track('library_clicked', {
      libraryId: lib.id, priceUsd: lib.priceUsd || null, status: lib.status, from: 'road'
    });
    openLibrary(lib);
  }

  function openLibrary(lib) {
    libFor = lib;
    libOpenedTs = Date.now();
    libBuyTapped = false;
    var soon = lib.status === 'soon';
    var price = QQPay.priceLabel(lib);

    fillBadge($('#libDetailBadge'), lib, true);
    $('#libDetailName').textContent = lib.name;
    $('#libDetailBlurb').textContent = lib.blurb;

    var topics = lib.topics || [];
    var samples = lib.samples || [];

    $('#libFacts').innerHTML =
      
      '<div class="fact"><b>' + topics.length + '</b><span>topics</span></div>' +
      '<div class="fact"><b>' + D.libraries.length + '</b><span>libraries</span></div>';

    var tHost = $('#libTopics');
    tHost.innerHTML = '';
    topics.forEach(function (t) { tHost.appendChild(el('span', 'lib-topic', t)); });

    var sHost = $('#libSamples');
    sHost.innerHTML = '';
    samples.forEach(function (s) {
      var card = el('div', 'lib-sample');
      card.appendChild(el('p', null, s.prompt));
      if (s.note) card.appendChild(el('span', null, s.note));
      sHost.appendChild(card);
    });

    /* MEMBERS PLAY. The sets are written, drawn and verified like the road, so
     * a member should be able to play one. This ASKS QQPay whether they own it
     * and does nothing else: the gate is still entirely payments.js's, and a
     * signed-out stranger sees exactly what they saw before. No count is shown
     * — the owner took counts out of the UI on purpose. */
    var oldPlay = document.getElementById('libPlayRow');
    if (oldPlay && oldPlay.parentNode) oldPlay.parentNode.removeChild(oldPlay);
    var owns = false;
    try { owns = !!(QQPay.owns && QQPay.owns(lib.id)); } catch (e) { owns = false; }
    if (owns && (lib.questions || []).length) {
      var row = el('div', 'lib-play');
      row.id = 'libPlayRow';
      var playBtn = el('button', 'primary-btn', 'Play this set');
      playBtn.type = 'button';
      playBtn.addEventListener('click', function () { startLibrarySet(lib); });
      row.appendChild(playBtn);
      sHost.parentNode.insertBefore(row, sHost);
    }

    var status = $('#libStatusBadge');
    status.className = 'lib-badge plain';
    status.textContent = 'Premium';

    /* The price, and ONLY here. Whatever js/payments.js says it is: a per-set
     * price and a membership price are different sentences underneath, so the
     * sub-line follows the module rather than assuming one shape of money.
     *
     * An EMPTY price string is not a bug and must not be papered over with a
     * placeholder — payments.js returns nothing while there is nothing to charge
     * yet, and a number on screen that nobody can pay is a lie. The row goes
     * away instead, and the panel below says what the real state is. */
    var membership = typeof QQPay.membershipPrice === 'function';
    $('#libPriceRow').hidden = !price;
    $('#libPrice').textContent = price;
    $('#libPriceSub').textContent = membership
      ? 'one membership · every library'
      : (soon ? 'one payment, when it opens'
              : 'one payment · yours for ever');

    /* js/payments.js owns the checkout. If it brings its own panel, it gets the
     * whole block under the price and this screen stops having opinions about
     * money; if it does not, the one button below calls the one seam function. */
    var payHost = $('#libPayHost');
    if (typeof QQPay.mountMembershipPanel === 'function') {
      payHost.hidden = false;
      $('#libBuyBtn').hidden = true;
      $('#libHonest').hidden = true;
      try { QQPay.mountMembershipPanel(payHost, lib); }
      catch (e) {                                  // money must never break a screen
        payHost.hidden = true;
        $('#libBuyBtn').hidden = false;
        $('#libHonest').hidden = false;
      }
    } else {
      payHost.hidden = true;
      payHost.innerHTML = '';
      $('#libBuyBtn').hidden = false;
      $('#libHonest').hidden = false;
      $('#libBuyBtn').textContent = soon ? 'Notify me' : 'Unlock for ' + price;
      $('#libHonest').textContent = lib.honestly || 'Payments are not connected. Nothing is charged.';
    }

    go('library');
    QQA.track('library_detail_viewed', {
      libraryId: lib.id, priceUsd: lib.priceUsd || null, status: lib.status,
      topics: topics.length, samples: samples.length
    });
  }

  function onLibraryBuy() {
    var lib = libFor;
    if (!lib) return;
    libBuyTapped = true;
    QQA.track('library_buy_tapped', {
      libraryId: lib.id, priceUsd: lib.priceUsd || null, status: lib.status,
      msOnDetail: Date.now() - libOpenedTs, paymentsLive: !QQPay.isStub
    });
    /* QQPay.checkout is the only door to money in the whole app, and it is not
     * wired to a provider yet — see js/payments.js. When it is, this call is
     * unchanged and a real checkout takes over from here. */
    QQPay.checkout(lib.id).then(function (res) {
      QQA.track('library_interest', { libraryId: lib.id, stub: !!res.stub });
      if (res && res.ok) return;              // a real provider has taken the screen
      openSheet(lib.name,
        '<p class="sheet-note">Payments are not connected — <b>nothing was charged</b>. ' +
        'Your interest is recorded, and it decides what gets written next.</p>' +
        '<p class="sheet-note">The road stays free.</p>',
        'Got it');
    });
  }

  function closeLibrary() {
    var lib = libFor;
    if (lib) {
      QQA.track('library_detail_dismissed', {
        libraryId: lib.id, priceUsd: lib.priceUsd || null,
        msOnDetail: Date.now() - libOpenedTs, buyTapped: libBuyTapped
      });
    }
    libFor = null;
    go('path');
  }

  /* A premium set played as a lesson. The loop does not care where a question
   * came from — same widgets, same hearts, same visuals — so a set is dressed
   * as a one-lesson unit and handed straight to it. Sets are long, so they are
   * dealt out ten at a time, shuffled, and the XP lands like any other lesson. */
  function startLibrarySet(lib) {
    var qs = (lib.questions || []).slice();
    for (var i = qs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = qs[i]; qs[i] = qs[j]; qs[j] = t;
    }
    qs = qs.slice(0, 10);
    var lesson = { id: lib.id + '_set', title: 'Mixed round', questions: qs };
    var unit = {
      id: lib.id, index: 0, title: lib.name, colour: lib.colour || '#d29922',
      free: false, premium: true, lessons: [lesson]
    };
    QQA.track('library_set_started', { libraryId: lib.id });
    startLesson(unit, lesson);
  }

  function onLessonTap(unit, lesson, i) {
    var lock = lessonLock(unit, lesson, i);
    if (lock === 'email') {
      QQA.track('locked_lesson_tapped', { unitId: unit.id, lessonId: lesson.id, reason: 'email' });
      showWall(unit, 'hard');
      return;
    }
    if (lock === 'sequence') {
      QQA.track('locked_lesson_tapped', { unitId: unit.id, lessonId: lesson.id, reason: 'sequence' });
      openSheet(lesson.title, '<p>The road goes in order. Finish the one before.</p>', 'OK');
      return;
    }
    /* You do not swap screens, you follow the character inside: a door opens
     * in the node, the mascot walks through it, and it shuts behind you. */
    if (global.QQMascot) { QQMascot.enter(lesson.id, function () { startLesson(unit, lesson); }); return; }
    startLesson(unit, lesson);
  }

  // ======================================================================
  // the lesson loop
  // ======================================================================
  var play = null;

  function startLesson(unit, lesson) {
    /* Straight into another lesson means the road never gets looked at, so the
     * level-up it was holding is spent rather than saved up for later. */
    pendingLevelUp = null;
    play = {
      unit: unit, lesson: lesson,
      queue: lesson.questions.slice(),
      total: lesson.questions.length,
      cleared: 0,                 // unique questions dealt with
      firstTry: 0,
      hearts: D.heartsPerLesson,
      startedTs: Date.now(),
      answeredCount: 0,
      requeued: {},
      attempts: {},
      viz: null, widget: null, qStartTs: 0, interacted: false, locked: false
    };
    QQA.track('lesson_started', {
      unitId: unit.id, lessonId: lesson.id, questionCount: play.total,
      hearts: play.hearts, crownsBefore: QQStore.lessonState(lesson.id).crowns,
      replay: QQStore.lessonState(lesson.id).completions > 0
    });
    go('lesson');
    showQuestion();
  }

  function heartsRender() {
    var row = $('#heartRow');
    row.innerHTML = '';
    for (var i = 0; i < D.heartsPerLesson; i++) {
      var h = el('span', 'heart' + (i < play.hearts ? '' : ' gone'));
      h.innerHTML = svgIcon(ICON_HEART, 17);
      row.appendChild(h);
    }
  }

  function showQuestion() {
    var q = play.queue[0];
    play.qStartTs = Date.now();
    play.interacted = false;
    play.locked = false;

    $('#playProgressFill').style.width = (play.cleared / play.total * 100) + '%';
    heartsRender();
    $('#qKicker').textContent = play.unit.title + ' · ' + play.lesson.title;
    $('#qPrompt').textContent = q.prompt;
    $('#qHint').textContent = q.vizHint || '';
    $('#feedback').className = 'feedback';
    $('#feedback').innerHTML = '';
    $('#checkBtn').hidden = false;
    $('#checkBtn').disabled = true;
    $('#checkBtn').textContent = 'Check';
    $('#continueBtn').hidden = true;
    $('#answerBar').classList.remove('good', 'bad');

    // --- the visual
    if (play.viz && play.viz.destroy) play.viz.destroy();
    play.viz = QQViz.mount(q.viz, $('#vizHost'), {
      regions: q.regions || null,
      data: D.vizData,
      locked: function () { return play.locked; },
      onInteract: function (kind) {
        if (!play.interacted) {
          play.interacted = true;
          QQA.track('viz_interacted', {
            lessonId: play.lesson.id, questionId: q.id, viz: q.viz, kind: kind, type: q.type
          });
        }
      },
      onSelect: function (value) {
        if (play.locked) return;
        if (play.widget && play.widget.setValue) play.widget.setValue(value);
      }
    });

    // --- the answer widget
    play.widget = buildWidget(q, function () {
      $('#checkBtn').disabled = !play.widget.ready();
    });
    var host = $('#answerHost');
    host.innerHTML = '';
    host.appendChild(play.widget.node);

    QQA.track('question_shown', {
      unitId: play.unit.id, lessonId: play.lesson.id, questionId: q.id,
      type: q.type, topic: q.topic, viz: q.viz,
      position: play.cleared + 1, of: play.total,
      heartsLeft: play.hearts,
      isRetry: !!play.requeued[q.id],
      seenBefore: QQStore.isSolved(q.id)
    });
    if (global.QQMascot) QQMascot.question();
    global.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- widgets
  /* Every widget answers the same three questions: what is on screen (node),
   * is there an answer yet (ready), and what is it (value). Grading lives in
   * grade() so the widgets stay dumb. */
  function buildWidget(q, onChange) {
    if (q.type === 'truefalse') return widgetTrueFalse(q, onChange);
    if (q.type === 'number') return widgetNumber(q, onChange);
    if (q.type === 'order') return widgetOrder(q, onChange);
    if (q.type === 'tap') return widgetTap(q, onChange);
    return widgetChoice(q, onChange);
  }

  function widgetChoice(q, onChange) {
    var node = el('div', 'choices');
    var picked = null, btns = [];
    q.choices.forEach(function (choice, idx) {
      var b = el('button', 'choice', choice);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (play.locked) return;
        picked = idx;
        btns.forEach(function (x, i) { x.classList.toggle('picked', i === idx); });
        onChange();
      });
      node.appendChild(b); btns.push(b);
    });
    return {
      node: node,
      ready: function () { return picked !== null; },
      value: function () { return picked; },
      lock: function () { btns.forEach(function (b) { b.disabled = true; }); },
      mark: function (correct) {
        if (picked !== null) btns[picked].classList.add(correct ? 'right' : 'wrong');
        if (!correct) btns[q.answer].classList.add('right');
      }
    };
  }

  function widgetTrueFalse(q, onChange) {
    var node = el('div', 'tf-wrap');
    node.appendChild(el('div', 'tf-statement', q.statement));
    var row = el('div', 'tf-row');
    var picked = null, btns = [];
    [['True', true], ['False', false]].forEach(function (pair) {
      var b = el('button', 'choice tf', pair[0]);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (play.locked) return;
        picked = pair[1];
        btns.forEach(function (x) { x.classList.toggle('picked', x === b); });
        onChange();
      });
      row.appendChild(b); btns.push(b);
    });
    node.appendChild(row);
    return {
      node: node,
      ready: function () { return picked !== null; },
      value: function () { return picked; },
      lock: function () { btns.forEach(function (b) { b.disabled = true; }); },
      mark: function (correct) {
        var right = q.answerBool ? btns[0] : btns[1];
        (picked === true ? btns[0] : btns[1]).classList.add(correct ? 'right' : 'wrong');
        right.classList.add('right');
      }
    };
  }

  function widgetNumber(q, onChange) {
    var node = el('div', 'num-wrap');
    var input = el('input', 'num-input');
    input.type = 'text';                    // text + inputmode gives the numeric
    input.inputMode = 'decimal';            // keypad without the browser spinners
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'your answer');
    input.placeholder = q.placeholder || 'your answer';
    input.addEventListener('input', function () {
      var cleaned = input.value.replace(/[^0-9.]/g, '');
      if (cleaned !== input.value) input.value = cleaned;
      onChange();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !$('#checkBtn').disabled) { e.preventDefault(); onCheck(); }
    });
    node.appendChild(input);
    return {
      node: node,
      ready: function () { return input.value.trim() !== '' && !isNaN(parseFloat(input.value)); },
      value: function () { return parseFloat(input.value); },
      lock: function () { input.disabled = true; },
      mark: function (correct) { input.classList.add(correct ? 'right' : 'wrong'); }
    };
  }

  /* Tap-to-place rather than drag: dragging a list on a phone fights the page
   * scroll, and Duolingo learned the same thing years ago. */
  function widgetOrder(q, onChange) {
    var node = el('div', 'order-wrap');
    node.appendChild(el('div', 'order-hint', q.orderPrompt || 'Tap them in order.'));
    var slots = el('div', 'order-slots');
    var bank = el('div', 'order-bank');
    node.appendChild(slots); node.appendChild(bank);

    var chosen = [];
    // a fixed scramble, so it is never accidentally already in the right order
    var pool = q.items.slice().reverse();
    if (pool.length > 2) pool.push(pool.shift());

    function redraw() {
      slots.innerHTML = ''; bank.innerHTML = '';
      for (var i = 0; i < q.items.length; i++) {
        var s = el('div', 'order-slot' + (chosen[i] ? ' filled' : ''));
        s.appendChild(el('span', 'order-num', String(i + 1)));
        if (chosen[i]) {
          var t = el('button', 'order-chip in-slot', chosen[i]);
          t.type = 'button';
          (function (idx) {
            t.addEventListener('click', function () {
              if (play.locked) return;
              chosen.splice(idx, 1); redraw(); onChange();
            });
          })(i);
          s.appendChild(t);
        } else {
          s.appendChild(el('span', 'order-empty', 'tap one below'));
        }
        slots.appendChild(s);
      }
      pool.forEach(function (item) {
        if (chosen.indexOf(item) !== -1) return;
        var b = el('button', 'order-chip', item);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (play.locked || chosen.length >= q.items.length) return;
          chosen.push(item); redraw(); onChange();
        });
        bank.appendChild(b);
      });
    }
    redraw();

    return {
      node: node,
      ready: function () { return chosen.length === q.items.length; },
      value: function () { return chosen.slice(); },
      lock: function () {
        var chips = node.querySelectorAll('.order-chip');
        for (var i = 0; i < chips.length; i++) chips[i].disabled = true;
      },
      mark: function (correct) {
        var chips = slots.querySelectorAll('.order-chip');
        for (var i = 0; i < chips.length; i++) {
          chips[i].classList.add(chosen[i] === q.items[i] ? 'right' : 'wrong');
        }
        if (!correct) {
          // show the right order underneath: the lesson teaches, it does not scold
          var fix = el('div', 'order-fix');
          fix.appendChild(el('div', 'order-fix-head', 'The right order:'));
          q.items.forEach(function (it, j) {
            fix.appendChild(el('div', 'order-fix-row', (j + 1) + '. ' + it));
          });
          node.appendChild(fix);
        }
      }
    };
  }

  /* The visual owns the picture; this owns the words underneath it, so there is
   * always a thumb-sized target even when the drawing is fiddly. */
  function widgetTap(q, onChange) {
    var node = el('div', 'tap-wrap');
    node.appendChild(el('div', 'tap-label', 'Tap the picture, or choose below.'));
    var row = el('div', 'tap-row');
    var picked = null, btns = [];
    q.regions.forEach(function (r) {
      var b = el('button', 'choice tap-choice', r.label);
      b.type = 'button';
      b.dataset.region = r.id;
      b.addEventListener('click', function () {
        if (play.locked) return;
        setValue(r.id);
        if (play.viz && play.viz.select) play.viz.select(r.id);
      });
      row.appendChild(b); btns.push(b);
    });
    node.appendChild(row);

    function setValue(id) {
      picked = id;
      btns.forEach(function (x) { x.classList.toggle('picked', x.dataset.region === id); });
      onChange();
    }
    return {
      node: node,
      setValue: setValue,
      ready: function () { return picked !== null; },
      value: function () { return picked; },
      lock: function () { btns.forEach(function (b) { b.disabled = true; }); },
      mark: function (correct) {
        btns.forEach(function (b) {
          if (b.dataset.region === picked) b.classList.add(correct ? 'right' : 'wrong');
          if (b.dataset.region === q.answerRegion) b.classList.add('right');
        });
      }
    };
  }

  // ---------------------------------------------------------------- grading
  function grade(q, value) {
    if (q.type === 'truefalse') return value === q.answerBool;
    if (q.type === 'number') return Math.abs(value - q.answerNumber) <= (q.tolerance || 0) + 1e-9;
    if (q.type === 'order') {
      if (!value || value.length !== q.items.length) return false;
      for (var i = 0; i < value.length; i++) if (value[i] !== q.items[i]) return false;
      return true;
    }
    if (q.type === 'tap') return value === q.answerRegion;
    return value === q.answer;
  }

  function rightAnswerText(q) {
    if (q.type === 'truefalse') return q.answerBool ? 'True' : 'False';
    if (q.type === 'number') return String(q.answerNumber);
    if (q.type === 'order') return q.items.join(' → ');
    if (q.type === 'tap') {
      var out = q.answerRegion;
      q.regions.forEach(function (r) { if (r.id === q.answerRegion) out = r.label; });
      return out;
    }
    return q.choices[q.answer];
  }

  function loggableValue(q, v) {
    if (q.type === 'order') return (v || []).join('|');
    return v;
  }

  // ---------------------------------------------------------------- check
  function onCheck() {
    if (play.locked || !play.widget.ready()) return;
    var q = play.queue[0];
    var value = play.widget.value();
    var correct = grade(q, value);
    var ms = Date.now() - play.qStartTs;

    play.locked = true;
    play.answeredCount++;
    play.attempts[q.id] = (play.attempts[q.id] || 0) + 1;
    play.widget.lock();
    play.widget.mark(correct);
    QQA.noteAnswer();

    QQA.track('answer_submitted', {
      unitId: play.unit.id, lessonId: play.lesson.id, questionId: q.id,
      type: q.type, correct: correct,
      given: loggableValue(q, value),
      attempt: play.attempts[q.id],
      firstTry: correct && play.attempts[q.id] === 1,
      msToAnswer: ms,
      vizInteracted: play.interacted,
      heartsLeft: play.hearts
    });

    var bar = $('#answerBar'), fb = $('#feedback');
    $('#checkBtn').hidden = true;
    $('#continueBtn').hidden = false;

    if (correct) {
      bar.classList.add('good');
      fb.className = 'feedback good show';
      fb.innerHTML = '<b>' + (play.attempts[q.id] === 1 ? 'Right, first go.' : 'Right.') + '</b> ' + q.explain;
      if (play.attempts[q.id] === 1) play.firstTry++;
      play.cleared++;
      QQStore.recordSolved(q.id, play.attempts[q.id], ms);
      play.queue.shift();
      $('#playProgressFill').style.width = (play.cleared / play.total * 100) + '%';
      $('#continueBtn').textContent = play.queue.length ? 'Continue' : 'Finish lesson';
      if (global.QQMascot) QQMascot.react('correct', { firstTry: play.attempts[q.id] === 1 });
      if (global.navigator.vibrate) { try { global.navigator.vibrate(8); } catch (e) {} }
    } else {
      bar.classList.add('bad');
      play.hearts--;
      heartsRender();
      QQA.track('heart_lost', {
        lessonId: play.lesson.id, questionId: q.id, heartsLeft: play.hearts, type: q.type
      });
      fb.className = 'feedback bad show';
      fb.innerHTML = '<b>Not quite.</b> The answer is <b>' + rightAnswerText(q) + '</b>. ' + q.explain;
      play.queue.shift();
      if (!play.requeued[q.id]) {
        // back to the end of the queue, once: you never leave a lesson having
        // got something wrong and not seen it again
        play.requeued[q.id] = true;
        play.queue.push(q);
        QQA.track('question_requeued', { lessonId: play.lesson.id, questionId: q.id });
      } else {
        play.cleared++;                    // missed twice: let them move on
        $('#playProgressFill').style.width = (play.cleared / play.total * 100) + '%';
      }
      $('#continueBtn').textContent = play.hearts <= 0 ? 'Out of hearts'
        : (play.queue.length ? 'Got it' : 'Finish lesson');
      if (global.QQMascot) QQMascot.react('wrong', {});
      if (global.navigator.vibrate) { try { global.navigator.vibrate([12, 40, 12]); } catch (e) {} }
    }
    bar.scrollTop = 0;
  }

  function onContinue() {
    if (play.hearts <= 0) { outOfHearts(); return; }
    /* The straight-to-question opening hands over to the road after ONE
     * question, and this is the hand-over. See entryPath() for why. */
    if (handoffPending) { handoffToRoad(); return; }
    if (play.queue.length) { showQuestion(); return; }
    finishLesson();
  }

  /* ====================================================================
   * the opening: the answers archive, a question, or the road
   * ====================================================================
   * HISTORY, because this has now moved twice and the numbers matter more
   * than the argument:
   *
   *   arrived -> lesson_started was 33% when the road was the front door.
   *   Two thirds of arrivals never tapped a lesson, while five in six of the
   *   people who did start one finished it — so the questions were never the
   *   problem, the map-as-a-menu was. The fix was to drop a first-timer
   *   straight into question one ('question'), which is what shipped on
   *   2026-08-01.
   *
   *   From 2026-08-02 every caption says the answer is on the site and
   *   nowhere else (program.md, "The answer is never free"). So the promise
   *   a cold visitor arrives holding is *an answer*, and the first screen
   *   should be the thing they were promised: the archive ('answers').
   *   Landing them in a question they were not offered is a bait, and
   *   "never show a cold visitor a menu" cuts both ways — the road is a
   *   menu, but so is an answer page for somebody who came to play.
   *
   * That reversal is a BET, exactly like the one before it. It is judged
   * against 33%, and `entryPath` rides on `arrived` so every downstream
   * rate — answer_gate_shown, email_submitted, lesson_started — can be
   * split by which door the visitor came through. If 'answers' does not
   * beat 'question' and 'road', put it back.
   *
   * The values, all greppable, and all on `arrived`:
   *   answers            no hash, nothing solved -> the archive list  (NEW DEFAULT)
   *   answers-deep-link  #answers/<slug> -> that one answer, open
   *   answers-link       bare #answers
   *   road               anybody with progress, an email or a session
   *   question           the old default, now only reachable when the
   *                      archive is unavailable (answers.js missing/empty)
   *   *-forced           ?answers=1 / ?road=1 / ?play=1, i.e. us testing.
   *                      EXCLUDE these from every comparison.
   *
   * Two things this must never do, both constraints from the owner:
   *   - a deep link always wins. #answers/<slug> lands on that entry.
   *   - a returning visitor with progress lands on the ROAD. Someone
   *     mid-streak did not come back for an archive. */
  var handoffPending = false;
  var entryPathTaken = null;

  var ANSWERS_HASH = /^#answers(?:\/([a-z0-9_]+))?$/i;

  /* The daily email's two links. #q/<id> is the question of the day and opens
   * that exact question; #unsub/<token> is the one-tap unsubscribe, which has
   * to work for somebody who is not signed in and never will be. Both are
   * generated by pipeline/daily_email.py — change one, change the other. */
  var QUESTION_HASH = /^#q\/([a-z0-9_]+)$/i;
  var UNSUB_HASH = /^#unsub\/([a-z0-9]{8,})$/i;

  /* The static site's anon role may INSERT events and do nothing else (RLS),
   * so an unsubscribe cannot write to profiles from here. It is recorded as an
   * event and pipeline/daily_email.py folds it into profiles.unsubscribed_at
   * on the next run — which is the thing that actually decides who gets mail.
   * The reader is told it is done because it is: the send reads this. */
  function unsubscribe(token) {
    QQA.track('email_unsubscribed', { token: token, utm: utmSource() });
    var topbar = $('#topbar'), tabs = $('#tabs');
    if (topbar) topbar.hidden = true;
    if (tabs) tabs.hidden = true;
    var main = document.querySelector('main');
    if (!main) return;
    /* Hidden, not removed. js/answers_ui.js boots after this file and reaches
     * for #ansSearch and #tabAnswers by id; deleting them throws in a module
     * that has nothing to do with unsubscribing. */
    for (var i = 0; i < main.children.length; i++) main.children[i].hidden = true;
    var box = document.createElement('div');
    box.className = 'unsub';
    box.innerHTML =
      '<h1>Done — no more daily emails.</h1>' +
      '<p>You will not hear from us again unless you ask. Nothing you have ' +
      'solved is lost, and the answers archive stays open.</p>' +
      '<p><a class="primary-btn" href="./">Back to the road</a></p>';
    main.appendChild(box);
  }

  /* answers.js is generated and can legitimately be empty (nothing posted
   * yet), and js/answers_ui.js bails out silently when it is. Landing on an
   * archive that will never draw itself would leave a blank screen, so the
   * decision is made against the same predicate that module uses. */
  function archiveAvailable() {
    try {
      return !!(global.QQ_ANSWERS && QQ_ANSWERS.entries && QQ_ANSWERS.entries.length);
    } catch (e) { return false; }
  }

  /* The lesson containing a question id, with that question moved to the front
   * of the queue. Returns null for an id that is not on the road any more —
   * an email sent last week can outlive a question, and a dead link must land
   * on the road rather than on nothing. */
  function lessonForQuestion(qid) {
    var all = allLessons();
    for (var i = 0; i < all.length; i++) {
      var qs = all[i].lesson.questions;
      for (var j = 0; j < qs.length; j++) {
        if (qs[j].id === qid) return { unit: all[i].unit, lesson: all[i].lesson, index: j };
      }
    }
    return null;
  }

  function entryPath() {
    if (UNSUB_HASH.test(location.hash || '')) return 'unsubscribe';
    if (QUESTION_HASH.test(location.hash || '')) return 'daily-question';
    /* The daily email's "carry on where you left off" link. It has to name the
     * road explicitly: opened on a phone the reader has never played on, the
     * untouched check below is true and they would land on the ARCHIVE, which
     * is not what the link said. Distinct from ?road=1, which is us testing
     * and is excluded from every comparison. */
    if (/^#road$/i.test(location.hash || '')) return 'road-link';
    if (/[?&]road=1/.test(location.search)) return 'road-forced';
    if (/[?&]play=1/.test(location.search)) return 'question-forced';
    if (/[?&]answers=1/.test(location.search)) return 'answers-forced';

    /* The deep link is the whole reason the archive exists — a caption points
     * at one answer and that is what has to be on screen. It outranks
     * progress, a streak and everything else. */
    var deep = ANSWERS_HASH.exec(location.hash || '');
    if (deep && archiveAvailable()) return deep[1] ? 'answers-deep-link' : 'answers-link';

    /* "Never done anything here" has to be read from progress, not from a
     * visit counter — a returning visitor who never answered anything is
     * still someone the road has already failed once. */
    var untouched = QQStore.solvedCount() === 0 &&
                    QQStore.totalXp() === 0 &&
                    !QQStore.hasEmail() &&
                    !QQAuth.isSignedIn() &&
                    !QQAuth.arrivedWith();
    if (!untouched) return 'road';
    return archiveAvailable() ? 'answers' : 'question';
  }

  /* True when js/answers_ui.js, which loads after this file, is the module
   * that owns the first screen. It reads this rather than re-deriving the
   * decision, so there is one rule and not two that can drift. */
  function landsOnAnswers() {
    return entryPathTaken === 'answers' ||
           entryPathTaken === 'answers-forced' ||
           entryPathTaken === 'answers-link' ||
           entryPathTaken === 'answers-deep-link';
  }

  function handoffToRoad() {
    handoffPending = false;
    var q = play.queue.length ? play.queue[0] : null;
    QQA.track('first_question_handoff', {
      lessonId: play.lesson.id,
      questionId: q ? q.id : null,
      solvedTotal: QQStore.solvedCount(),
      answeredCount: play.answeredCount,
      msInLesson: Date.now() - play.startedTs
    });
    /* The lesson is abandoned on purpose — the questions already answered are
     * saved in the store, so the node shows them and tapping back in carries
     * straight on. Nothing here is lost. */
    if (play.viz && play.viz.destroy) { play.viz.destroy(); play.viz = null; }
    /* Come out of the door rather than materialise beside it: their first
     * sight of the road should be the character moving on it. */
    if (global.QQMascot) QQMascot.stepOutOnNextRoad();
    go('path');
  }

  function outOfHearts() {
    QQA.track('hearts_exhausted', {
      unitId: play.unit.id, lessonId: play.lesson.id,
      cleared: play.cleared, of: play.total,
      msInLesson: Date.now() - play.startedTs
    });
    if (play.viz && play.viz.destroy) { play.viz.destroy(); play.viz = null; }
    $('#heartsCopy').textContent =
      play.cleared + ' of ' + play.total + ' before they ran out. Nothing is lost, nothing is locked.';
    go('hearts');
  }

  var doneNext = null;
  var doneUnit = null;

  function finishLesson() {
    var lv = play.lesson, unit = play.unit;
    doneUnit = unit;
    var ms = Date.now() - play.startedTs;
    var perfect = play.firstTry === play.total;
    var res = QQStore.completeLesson(lv.id, play.firstTry);

    var xpEarned = D.xp.perQuestion * play.firstTry + D.xp.lessonBonus + (perfect ? D.xp.perfectBonus : 0);
    var before = QQStore.xpToday();
    var xpRes = QQStore.addXp(xpEarned);

    QQA.track('lesson_completed', {
      unitId: unit.id, lessonId: lv.id, questions: play.total,
      firstTryCorrect: play.firstTry, perfect: perfect,
      heartsLeft: play.hearts, answersGiven: play.answeredCount,
      msTotal: ms, crowns: res.crowns, firstEverCompletion: res.firstEver
    });
    QQA.track('xp_earned', {
      lessonId: lv.id, xp: xpEarned, totalXp: xpRes.total, todayXp: xpRes.today,
      fromQuestions: D.xp.perQuestion * play.firstTry,
      fromLesson: D.xp.lessonBonus,
      fromPerfect: perfect ? D.xp.perfectBonus : 0
    });
    if (xpRes.streakChanged) {
      QQA.track('streak_continued', { streak: xpRes.streak, best: QQStore.bestStreak() });
    }
    if (before < D.dailyGoalXp && xpRes.today >= D.dailyGoalXp) {
      QQA.track('daily_goal_met', { goalXp: D.dailyGoalXp, todayXp: xpRes.today, streak: xpRes.streak });
    }
    if (QQStore.unitComplete(unit)) {
      QQA.track('unit_completed', { unitId: unit.id, index: unit.index, free: !!unit.free });
    }

    if (play.viz && play.viz.destroy) { play.viz.destroy(); play.viz = null; }

    // --- the celebration
    /* A premium set is dressed as a one-lesson unit so the loop can play it;
     * it is not a unit of the road, so it never claims a unit was cleared. */
    var unitCleared = res.firstEver && !unit.premium && QQStore.unitComplete(unit);
    $('#doneTitle').textContent = unitCleared ? ('Unit ' + unit.index + ' complete')
      : (perfect ? 'Perfect lesson' : 'Lesson complete');
    var burst = $('#crownBurst');
    burst.innerHTML = svgIcon(ICON_CROWN, 44);
    burst.className = 'crown-burst' + (perfect ? ' perfect' : '');
    $('#xpLine').innerHTML = '<span class="xp-pill">+' + xpEarned + ' XP</span>';
    $('#doneStats').innerHTML =
      '<div class="stat"><b>' + play.firstTry + '/' + play.total + '</b><span>first try</span></div>' +
      '<div class="stat"><b>' + res.crowns + '</b><span>crowns</span></div>' +
      '<div class="stat"><b>' + QQStore.currentStreak() + '</b><span>day streak</span></div>';

    var pct = Math.min(1, xpRes.today / D.dailyGoalXp);
    var metGoal = xpRes.today >= D.dailyGoalXp;
    $('#goalStrip').innerHTML =
      '<div class="goal-head"><span>Daily goal</span><span>' + Math.min(xpRes.today, D.dailyGoalXp) + ' / ' + D.dailyGoalXp + ' XP</span></div>' +
      '<div class="goal-bar"><div class="goal-fill" style="width:' + (pct * 100).toFixed(0) + '%"></div></div>' +
      '<div class="goal-note">' + (metGoal
        ? 'Goal met. Tomorrow makes it ' + (QQStore.currentStreak() + 1) + ' days.'
        : (D.dailyGoalXp - xpRes.today) + ' XP to go — one more lesson.') + '</div>';

    doneNext = nextLessonAfter(lv.id);

    /* Held, not played: the road plays it the moment the road is looked at.
     * A node that is still locked is not woken up — the road does not pretend
     * to go somewhere it will not take you yet. */
    pendingLevelUp = unit.premium ? null : {
      lessonId: lv.id,
      nextLessonId: (doneNext && !doneNext.lock) ? doneNext.lesson.id : null,
      unitCleared: (res.firstEver && QQStore.unitComplete(unit)) ? unit.id : null
    };

    if (unit.premium) {
      $('#doneNext').textContent = 'That set is yours. It deals a fresh handful every time.';
      $('#doneNextBtn').textContent = 'Back to the road';
    } else if (!doneNext) {
      $('#doneNext').textContent = 'End of the road, for now. More is being written.';
      $('#doneNextBtn').textContent = 'Back to the road';
    } else if (doneNext.lock === 'email') {
      $('#doneNext').textContent = 'Next: ' + doneNext.unit.title;
      $('#doneNextBtn').textContent = 'Unlock unit ' + doneNext.unit.index;
    } else {
      $('#doneNext').textContent = 'Next: ' + doneNext.lesson.title;
      $('#doneNextBtn').textContent = 'Keep going';
    }

    go('done');
    confetti(perfect);
    if (global.QQMascot) {
      QQMascot.react('celebrate', {
        perfect: perfect, unitCleared: !!unitCleared,
        goalMet: metGoal && before < D.dailyGoalXp, streakUp: !!xpRes.streakChanged
      });
    }
    QQA.track('celebration_shown', { lessonId: lv.id, xp: xpEarned, perfect: perfect });
    renderHeader();
  }

  function nextLessonAfter(lessonId) {
    var list = allLessons();
    for (var i = 0; i < list.length; i++) {
      if (list[i].lesson.id === lessonId && list[i + 1]) {
        var n = list[i + 1];
        return {
          unit: n.unit, lesson: n.lesson, indexInUnit: n.indexInUnit,
          lock: lessonLock(n.unit, n.lesson, n.indexInUnit)
        };
      }
    }
    return null;
  }

  // ======================================================================
  // celebration
  // ======================================================================
  function confetti(perfect) {
    var cv = $('#confetti');
    if (!cv || !cv.getContext) return;
    var g = cv.getContext('2d');
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = w * dpr; cv.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = ['#58a6ff', '#3fb950', '#d29922', '#e6edf3', '#a371f7'];
    var ps = [], n = perfect ? 140 : 90;
    for (var i = 0; i < n; i++) {
      ps.push({
        x: w / 2 + (Math.random() - 0.5) * 60, y: h * 0.3,
        vx: (Math.random() - 0.5) * 7, vy: -3 - Math.random() * 8,
        r: 2 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0],
        a: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3
      });
    }
    var t0 = performance.now();
    (function frame(now) {
      var age = (now - t0) / 1000;
      g.clearRect(0, 0, w, h);
      ps.forEach(function (p) {
        p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.a += p.spin;
        g.save(); g.translate(p.x, p.y); g.rotate(p.a);
        g.globalAlpha = Math.max(0, 1 - age / 2.8);
        g.fillStyle = p.c;
        g.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        g.restore();
      });
      if (age < 2.8 && $('#screen-done').classList.contains('on')) global.requestAnimationFrame(frame);
      else g.clearRect(0, 0, w, h);
    })(t0);
  }

  // ======================================================================
  // the wall
  // ======================================================================
  /* ONE screen, TWO asks, and they must never be added together in the funnel —
   * hence `wallKind` on every event this screen fires.
   *
   *   soft  after the FIRST lesson. Nothing is locked, nothing can be locked,
   *         and "Not now" is a real button that returns the player to exactly
   *         what they were doing. The pitch is the streak and the XP, because
   *         that is the thing they have just started building and the thing that
   *         currently exists only in this browser.
   *   hard  entering unit 2, unchanged. This one is the gate.
   */
  var wallFor = null;
  var wallKind = 'hard';
  var afterSoftWall = null;       // what the player was doing when we interrupted

  function showWall(unit, kind) {
    wallKind = (kind === 'soft') ? 'soft' : 'hard';
    wallFor = unit || D.units[1];
    var soft = wallKind === 'soft';
    var streak = QQStore.currentStreak();
    var xp = QQStore.totalXp();

    $('#wallWrap').classList.toggle('soft', soft);
    $('#wallMark').innerHTML = svgIcon(soft ? ICON_FLAME : ICON_LOCK, 26);
    $('#wallStreak').hidden = !soft;

    if (soft) {
      $('#wallTitle').textContent = 'Keep your streak';
      $('#wallStreak').innerHTML =
        '<div class="cell hot"><b>' + streak + '</b><span>day streak</span></div>' +
        '<div class="cell"><b>' + xp + '</b><span>XP</span></div>' +
        '<div class="cell"><b>' + QQStore.solvedCount() + '</b><span>solved</span></div>';
      $('#wallCopy').textContent =
        xp + ' XP, and it lives in this browser only. An email keeps it. Unit 1 stays free either way.';
      $('#wallSubmit').textContent = 'Keep my streak';
      $('#wallBack').textContent = 'Not now';
    } else {
      $('#wallTitle').textContent = 'Unit ' + wallFor.index + ' needs an email';
      $('#wallStreak').innerHTML = '';
      $('#wallCopy').textContent =
        'Unit 1 is free for ever, no account. From unit 2, an email keeps your XP and crowns.';
      $('#wallSubmit').textContent = 'Unlock the road';
      $('#wallBack').textContent = 'Not now';
    }

    /* auth.js owns the small print because it is the only module that knows what
     * is actually connected. The soft ask only prefixes it, so that "the road
     * opens either way" cannot be read as "something here is shut". */
    $('#wallSmall').innerHTML =
      (soft ? 'Nothing is locked — unit 1 is yours either way. ' : '') +
      QQAuth.wallSmallPrint();
    $('#wallForm').hidden = false;
    $('#wallAfter').hidden = true;
    $('#wallError').textContent = '';
    go('wall');
    QQA.track('wall_shown', {
      wallKind: wallKind,
      unitId: wallFor.id,
      lessonsDone: lessonsDoneCount(),
      streak: streak,
      solvedTotal: QQStore.solvedCount(),
      xp: xp,
      msSinceArrival: Date.now() - ARRIVED_AT
    });
  }

  function lessonsDoneCount() {
    return allLessons().filter(function (x) { return QQStore.lessonDone(x.lesson.id); }).length;
  }

  /* The soft ask is due exactly once: after the first lesson anyone finishes on
   * this device, and never if they already have an account or an address. */
  function softPromptDue() {
    return !QQAuth.hasAccess() && !QQStore.softPromptShown() && lessonsDoneCount() === 1;
  }

  /* Leaving the celebration is the moment the soft ask gets, because it is the
   * only moment the streak is the thing on the player's mind. It costs them one
   * screen and hands them back to whatever they had chosen to do next. */
  function leaveCelebration(next) {
    if (!softPromptDue()) { next(); return; }
    QQStore.markSoftPromptShown();
    afterSoftWall = next;
    showWall(doneUnit || D.units[0], 'soft');
  }

  function resumeAfterSoftWall() {
    var next = afterSoftWall;
    afterSoftWall = null;
    if (next) next(); else go('path');
  }

  /* THE one place an email is ever captured, whichever surface did the asking.
   *
   * There are now two asks in two different places — the road's wall and the
   * answers archive's gate — and they must stay separable in the funnel. But
   * there is exactly ONE validation, ONE submission and ONE pair of events, so
   * that a change to how an ask looks can never quietly become a change to what
   * is stored or what is counted.
   *
   * `wallKind` is the field that tells them apart afterwards:
   *
   *   'soft'     the streak ask, after the first lesson
   *   'hard'     entering unit 2 — the road's gate
   *   'answers'  the answers archive — a different visitor entirely, usually
   *              cold off a Reel, who has solved nothing and owes us nothing
   *
   * A new surface gets a NEW value. Never overload one of the road's two: the
   * entire point of the field is that wall_shown -> email_submitted can be read
   * per surface, and an overloaded value silently averages two funnels.
   */
  function captureEmail(value, opts) {
    opts = opts || {};
    var kind = opts.wallKind || wallKind;
    var extra = opts.props || {};

    function withContext(base) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) base[k] = extra[k];
      }
      return base;
    }

    var err = QQAuth.validate(value);
    QQA.track('email_attempted', withContext({ wallKind: kind, valid: !err }));
    if (err) return Promise.resolve({ ok: false, error: err });

    return QQAuth.submitEmail(value).then(function (res) {
      if (!res.ok) return res;
      /* PRIVACY: the domain and the length, never the address. The address
       * lives in QQStore and in Supabase auth, and in neither event log. */
      QQA.track('email_submitted', withContext({
        wallKind: kind,
        emailDomain: (value.split('@')[1] || ''), emailLength: value.length,
        mode: res.mode,
        lessonsDone: lessonsDoneCount(), streak: QQStore.currentStreak(),
        solvedTotal: QQStore.solvedCount(), xp: QQStore.totalXp()
      }));
      renderPath();
      return res;
    });
  }

  function submitEmail(ev) {
    ev.preventDefault();
    var soft = wallKind === 'soft';
    var restore = soft ? 'Keep my streak' : 'Unlock the rest of the road';
    var input = $('#emailInput');
    var value = (input.value || '').trim();

    var submit = $('#wallSubmit');
    submit.disabled = true;
    submit.textContent = 'One moment…';
    captureEmail(value, {
      wallKind: wallKind,
      props: { unitId: wallFor ? wallFor.id : null }
    }).then(function (res) {
      submit.disabled = false;
      submit.textContent = restore;
      if (!res.ok) { $('#wallError').textContent = res.error || 'Something went wrong.'; return; }
      $('#wallError').textContent = '';
      $('#wallForm').hidden = true;
      $('#wallAfter').hidden = false;
      $('#wallAfterBack').textContent = (soft && afterSoftWall) ? 'Carry on' : 'Back to the road';
      $('#wallAfterCopy').innerHTML = res.mode === 'magic-link'
        ? 'A sign-in link is on its way. Open it on this device and everything here moves onto the account.' +
          (soft ? '' : ' The road is open already.')
        : 'Saved on this device. We could not reach the sign-in service, so no link was sent — ask again when you are back online.' +
          (soft ? '' : ' The road is open either way.');
    });
  }

  // ======================================================================
  // sheet + routing
  // ======================================================================
  function openSheet(title, html, cta) {
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = html;
    $('#sheetClose').textContent = cta || 'Close';
    $('#sheet').classList.add('on');
    QQA.track('sheet_shown', { title: title });
  }
  function closeSheet() { $('#sheet').classList.remove('on'); }

  function go(screen) {
    /* The hand-over lives only between the opening question and the first
     * sight of the road. Leaving the lesson by ANY other door — the close
     * button, running out of hearts, a wall — ends it, so a stale flag can
     * never bounce somebody off a later question they meant to answer. */
    if (screen !== 'lesson') handoffPending = false;
    if (screen !== 'lesson' && play && play.viz && play.viz.destroy) {
      play.viz.destroy(); play.viz = null;
    }
    $$('.screen').forEach(function (s) { s.classList.toggle('on', s.id === 'screen-' + screen); });
    document.body.classList.toggle('in-lesson', screen === 'lesson');
    $('#topbar').hidden = (screen === 'lesson');
    if (global.QQMascot) QQMascot.screen(screen);
    global.scrollTo(0, 0);
    QQA.track('screen_viewed', { screen: screen });
    if (screen === 'path') {
      /* If a level-up is waiting, arrive looking at the node you just BEAT, not
       * at the one you are about to unlock — the whole point of the animation is
       * that the view then travels forward to it. */
      var focusId = pendingLevelUp ? pendingLevelUp.lessonId : null;
      renderPath();
      QQA.track('path_viewed', {
        units: D.units.length,
        lessonsVisible: allLessons().length,
        lessonsDone: allLessons().filter(function (x) { return QQStore.lessonDone(x.lesson.id); }).length,
        xp: QQStore.totalXp(), streak: QQStore.currentStreak(), hasEmail: QQStore.hasEmail(),
        signedIn: QQAuth.isSignedIn()
      });
      setTimeout(function () {
        var beaten = focusId && $('.node-holder[data-lesson="' + focusId + '"] .node');
        if (beaten) scrollToNode(beaten, false); else scrollToCurrent(false);
      }, 40);
    }
  }

  // ======================================================================
  // debug drawer (the metrics, visible)
  // ======================================================================
  function renderDebug() {
    var evs = QQA.all().slice().reverse();
    var counts = {};
    evs.forEach(function (e) { counts[e.name] = (counts[e.name] || 0) + 1; });
    var sum = Object.keys(counts).sort().map(function (k) {
      return '<span class="dbg-count">' + k + ' <b>' + counts[k] + '</b></span>';
    }).join('');
    var rows = evs.slice(0, 140).map(function (e) {
      return '<div class="dbg-row"><span class="dbg-name">' + e.name + '</span>' +
        '<span class="dbg-props">' + JSON.stringify(e.props) + '</span>' +
        '<span class="dbg-ts">' + new Date(e.ts).toLocaleTimeString() + '</span></div>';
    }).join('');
    $('#dbgSummary').innerHTML = sum || 'no events yet';
    $('#dbgRows').innerHTML = rows;
    var id = QQA.identity();
    var st = QQSync.status();
    var user = QQAuth.currentUser();
    var authBit = QQAuth.isSignedIn()
      ? ('account ' + (user && user.email ? user.email : QQAuth.userId()) +
         ' · sync ' + st.state + (st.lastPush ? ' (pushed ' + new Date(st.lastPush).toLocaleTimeString() + ')' : '') +
         (st.lastError ? ' · ' + st.lastError : ''))
      : (user ? 'local email only, no session' : 'signed out');
    $('#dbgId').textContent = 'anon ' + id.anonId + ' · visit ' + id.visitNumber +
      ' · sink: ' + QQA.sinkName() + ' · ' + authBit;
  }

  // ======================================================================
  // accounts: the return trip from the magic link
  // ======================================================================
  /* js/auth.js has already taken the tokens out of the URL by the time anything
   * here runs. This is only about telling the player what happened and getting
   * the road re-drawn once the merge lands. */
  function wireAccounts() {
    QQSync.onMerged = function (res) {
      renderHeader();
      renderAccountLine();
      if ($('#screen-path').classList.contains('on')) renderPath();
      if (res && res.questionsGained) {
        QQA.track('sync_merged_in', { questionsGained: res.questionsGained, xp: QQStore.totalXp() });
      }
    };

    QQSync.onStatus = function () { renderAccountLine(); };

    QQAuth.onChange(function (kind) {
      renderAccountLine();
      if (kind === 'signed-in') {
        QQA.track('signed_in', {
          via: QQAuth.arrivedWith() || 'restored',
          solvedTotal: QQStore.solvedCount(), xp: QQStore.totalXp()
        });
        if ($('#screen-path').classList.contains('on')) renderPath();
      }
      if (kind === 'refresh-rejected' || kind === 'signed-out') {
        QQA.track('signed_out', { reason: kind, solvedTotal: QQStore.solvedCount() });
        if ($('#screen-path').classList.contains('on')) renderPath();
      }
    });

    QQAuth.ready.then(function () {
      var arrived = QQAuth.arrivedWith();
      if (QQAuth.isSignedIn()) {
        if (arrived) {
          var who = QQAuth.currentUser();
          openSheet('Signed in',
            '<p>Signed in as <b>' + (who && who.email ? who.email : 'your account') + '</b>.</p>' +
            '<p class="sheet-note">Everything you had solved is kept, and waiting on your other devices.</p>',
            'Back to the road');
          QQA.track('signin_link_opened', { via: arrived, solvedTotal: QQStore.solvedCount() });
        }
        if ($('#screen-path').classList.contains('on')) renderPath();
        QQSync.start(arrived ? 'magic-link' : 'boot');
      } else if (arrived) {
        /* They clicked a link and it did not work. Say so, rather than showing a
         * signed-out road with no explanation. */
        var e = QQAuth.lastError();
        openSheet('That link did not work',
          '<p>It had expired or been used already — they are one-time.</p>' +
          '<p class="sheet-note">Nothing is lost. Your progress is still here; ask for a fresh link when you want it.</p>',
          'OK');
        QQA.track('signin_link_failed', { via: arrived, error: e ? e.error : 'unknown' });
      }
      renderAccountLine();
    });
  }

  // ======================================================================
  // boot
  // ======================================================================
  var ARRIVED_AT = Date.now();

  /* Which reel, comment or DM sent them. Read raw and undecoded, because that
   * is the shape already sitting in the events table and a decoded copy would
   * not group with it. One definition, shared — the answers gate reports the
   * same string on the same visit as `arrived` does. */
  function utmSource() {
    return (location.search.match(/[?&]utm_source=([^&]+)/) || [])[1] || null;
  }

  function boot() {
    var id = QQA.identity();
    QQA.debug = /[?&]debug=1/.test(location.search);

    var lostStreak = QQStore.noticeBrokenStreak();

    /* Decided once, before anything is drawn, and carried on `arrived` so
     * that arrived -> answer_gate_shown, arrived -> email_submitted and
     * arrived -> lesson_started can each be compared between the openings.
     * 33% is the number to beat (program.md, "The first tap is the whole
     * funnel"); if landing on the archive does not beat it, put it back. */
    entryPathTaken = entryPath();

    QQA.track('arrived', {
      referrer: document.referrer || null,
      viewportW: global.innerWidth, viewportH: global.innerHeight,
      entryPath: entryPathTaken,
      isFirstEverVisit: id.isFirstEverVisit,
      visitNumber: id.visitNumber,
      hasEmail: QQStore.hasEmail(),
      signedIn: QQAuth.isSignedIn(),
      returningFromLink: QQAuth.arrivedWith() || null,
      xp: QQStore.totalXp(),
      solvedTotal: QQStore.solvedCount(),
      utm: utmSource(),
      offline: !global.navigator.onLine
    });
    if (!id.isFirstEverVisit) {
      QQA.track('return_visit', {
        visitNumber: id.visitNumber,
        hoursSinceLastVisit: id.msSinceLastVisit ? +(id.msSinceLastVisit / 3600000).toFixed(2) : null,
        daysSinceFirstSeen: +((Date.now() - (QQStore.state().createdTs || Date.now())) / 86400000).toFixed(2),
        streak: QQStore.currentStreak(),
        xp: QQStore.totalXp(),
        solvedTotal: QQStore.solvedCount()
      });
    }
    if (lostStreak) QQA.track('streak_broken', { lostStreak: lostStreak, best: QQStore.bestStreak() });

    $('#checkBtn').addEventListener('click', onCheck);
    $('#continueBtn').addEventListener('click', onContinue);
    $('#playClose').addEventListener('click', function () {
      QQA.track('lesson_abandoned', {
        unitId: play ? play.unit.id : null,
        lessonId: play ? play.lesson.id : null,
        questionId: play && play.queue.length ? play.queue[0].id : null,
        cleared: play ? play.cleared : 0, of: play ? play.total : 0,
        heartsLeft: play ? play.hearts : null,
        msInLesson: play ? Date.now() - play.startedTs : 0
      });
      go('path');
    });
    $('#heartsRetry').addEventListener('click', function () {
      QQA.track('hearts_retry', { lessonId: play.lesson.id });
      startLesson(play.unit, play.lesson);
    });
    $('#heartsBack').addEventListener('click', function () { go('path'); });
    $('#doneNextBtn').addEventListener('click', function () {
      QQA.track('celebration_cta', { action: doneNext ? (doneNext.lock === 'email' ? 'wall' : 'next') : 'road' });
      leaveCelebration(function () {
        if (!doneNext) { go('path'); return; }
        if (doneNext.lock === 'email') { showWall(doneNext.unit, 'hard'); return; }
        if (doneNext.lock) { go('path'); return; }
        startLesson(doneNext.unit, doneNext.lesson);
      });
    });
    $('#doneToRoad').addEventListener('click', function () {
      QQA.track('celebration_cta', { action: 'road' });
      leaveCelebration(function () { go('path'); });
    });
    $('#wallForm').addEventListener('submit', submitEmail);
    $('#wallBack').addEventListener('click', function () {
      QQA.track('wall_dismissed', {
        wallKind: wallKind, unitId: wallFor ? wallFor.id : null,
        lessonsDone: lessonsDoneCount()
      });
      /* Soft means soft: they go back to exactly what they were about to do,
       * including straight into the next lesson. */
      if (wallKind === 'soft') { resumeAfterSoftWall(); return; }
      go('path');
    });
    $('#wallAfterBack').addEventListener('click', function () {
      if (wallKind === 'soft') { resumeAfterSoftWall(); return; }
      go('path');
    });
    $('#libBack').addEventListener('click', closeLibrary);
    $('#libBuyBtn').addEventListener('click', onLibraryBuy);
    $('#sheetClose').addEventListener('click', closeSheet);
    $('#sheet').addEventListener('click', function (e) { if (e.target === $('#sheet')) closeSheet(); });

    // debug drawer: ?debug=1, or tap the small footer line three times
    var taps = 0, tapT = 0;
    $('#footerLine').addEventListener('click', function () {
      var now = Date.now();
      taps = (now - tapT < 800) ? taps + 1 : 1;
      tapT = now;
      if (taps >= 3) { taps = 0; openDebug(); }
    });
    $('#dbgClose').addEventListener('click', function () { $('#debug').classList.remove('on'); });
    $('#dbgCopy').addEventListener('click', function () {
      var text = QQA.exportJSON();
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      $('#dbgCopy').textContent = 'copied';
      setTimeout(function () { $('#dbgCopy').textContent = 'copy events'; }, 1200);
    });
    $('#dbgClearEvents').addEventListener('click', function () { QQA.clear(); renderDebug(); });
    $('#dbgUnlock').addEventListener('click', function () {
      QQStore.setEmail('debug@local');       // walk past the wall while testing
      renderPath(); renderDebug();
    });
    $('#dbgSync').addEventListener('click', function () {
      QQSync.start('debug').then(function () { renderDebug(); renderPath(); });
    });
    $('#dbgSignOut').addEventListener('click', function () {
      QQAuth.signOut(); renderDebug(); renderPath();
    });
    $('#dbgResetAll').addEventListener('click', function () {
      QQStore.reset(); QQA.clear(); renderDebug(); renderPath();
    });
    function openDebug() { $('#debug').classList.add('on'); renderDebug(); QQA.track('debug_opened', {}); }
    if (/[?&]debug=1/.test(location.search)) openDebug();
    QQA.onEvent = function () { if ($('#debug').classList.contains('on')) renderDebug(); };

    wireAccounts();
    openTheApp();
  }

  /* The first screen. Everything above this point is the same whichever door
   * they came through; this is the only place the openings differ. */
  function openTheApp() {
    var straightIn = (entryPathTaken === 'question' || entryPathTaken === 'question-forced');
    var toAnswers = landsOnAnswers();
    var cur = straightIn ? currentLesson() : null;

    QQA.track('entry_path_chosen', {
      entryPath: entryPathTaken,
      straightToQuestion: straightIn,
      landedOnAnswers: toAnswers,
      deepLinkSlug: (ANSWERS_HASH.exec(location.hash || '') || [])[1] || null,
      lessonId: cur ? cur.lesson.id : null,
      solvedTotal: QQStore.solvedCount(),
      xp: QQStore.totalXp()
    });

    /* js/answers_ui.js draws the first screen from here — it loads after this
     * file, so it takes over on its own DOMContentLoaded. Deliberately NOT
     * calling go('path') first: rendering the road on the way past would fire
     * path_viewed for a visitor who never saw the road, and path_viewed is a
     * denominator. */
    if (entryPathTaken === 'unsubscribe') {
      unsubscribe(UNSUB_HASH.exec(location.hash)[1]);
      return;
    }

    /* Question of the day. It jumps straight into that question rather than
     * showing the road first — somebody who tapped a specific question in an
     * email came for it, and "never show a cold visitor a menu" applies just
     * as much to a warm one who has already told us what they want. */
    if (entryPathTaken === 'daily-question') {
      var want = lessonForQuestion(QUESTION_HASH.exec(location.hash)[1]);
      QQA.track('daily_question_opened', {
        questionId: QUESTION_HASH.exec(location.hash)[1],
        found: !!want, utm: utmSource()
      });
      if (want) {
        /* Front of the queue, and the rest of the lesson still follows it, so
         * the daily question is a way IN to a lesson rather than a dead end. */
        var q = want.lesson.questions[want.index];
        startLesson(want.unit, want.lesson);
        var i = play.queue.indexOf(q);
        if (i > 0) { play.queue.splice(i, 1); play.queue.unshift(q); showQuestion(); }
        return;
      }
      go('path');
      return;
    }

    if (toAnswers) return;

    /* A forced ?play=1 on an account that has finished everything would have
     * no unfinished lesson to open — fall back to the road rather than break. */
    if (!straightIn || !cur) { go('path'); return; }

    handoffPending = true;
    /* The road has never been drawn at this point, so there is no node to walk
     * out of and no door to open. The mascot is simply already in its corner
     * when the question appears, and it says hello — it is the first thing
     * they meet here. */
    if (global.QQMascot) QQMascot.greetOnNextLesson();
    startLesson(cur.unit, cur.lesson);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQApp = {
    go: go, renderPath: renderPath, currentLesson: currentLesson,
    startLesson: startLesson, allLessons: allLessons,

    /* The one email-capture path, shared with the answers gate. Pass your own
     * `wallKind` so the two asks stay separable in the funnel; everything
     * else — validation, submission, both events, the road redraw — is done
     * here and must not be reimplemented anywhere. Resolves
     * { ok, mode } or { ok: false, error }. See captureEmail above. */
    captureEmail: captureEmail,
    utmSource: utmSource,

    /* Open a lesson from outside the road — the answers archive uses this for
     * its "play this one" link. It goes through onLessonTap, not startLesson,
     * so a locked lesson still meets the wall or the in-order sheet exactly as
     * it would if the node itself had been tapped. */
    openLesson: function (lessonId) {
      var x = allLessons().filter(function (n) { return n.lesson.id === lessonId; })[0];
      if (!x) return false;
      onLessonTap(x.unit, x.lesson, x.indexInUnit);
      return true;
    },

    /* Which door this visit came through, decided once in boot() before
     * anything is drawn. js/answers_ui.js reads these two rather than working
     * it out again — one rule, in one place, so the analytics and the screen
     * can never disagree about what happened. */
    /* Show the paid shelf from outside the road. The libraries render into
     * #libraryList, which lives on the PATH screen and nowhere else, so until
     * this existed the only way to reach them was to already be on the road --
     * where 3% of visitors go. See P6 in monetization/EXPERIMENTS.md. */
    showLibraries: function (from) {
      try { go('path'); } catch (e) {}
      try { renderLibraries(); } catch (e) {}
      QQA.track('library_shelf_opened', { from: from || 'unknown' });
      setTimeout(function () {
        var host = document.getElementById('libraryList');
        if (!host) return;
        try { host.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        catch (e) { try { host.scrollIntoView(); } catch (e2) {} }
      }, 60);
    },

    entryPath: function () { return entryPathTaken; },
    landsOnAnswers: landsOnAnswers,

    /* The question to offer somebody who has just finished reading an answer:
     * the first thing on the road they have not done. For the visitor this is
     * built for — cold, off a Reel, nothing solved — that is literally
     * question 1 of unit 1. For anyone with progress it is where they are,
     * because sending a returning player back to the start would be worse
     * than offering nothing.
     *
     * Never returns a locked lesson: currentLesson() only ever picks an open
     * one, so the offer can always be taken. `lock` is reported anyway, so a
     * future change that breaks that shows up in the data instead of in a
     * sheet saying no. */
    nextRoadQuestion: function () {
      var x = currentLesson();
      if (!x || !x.lesson.questions || !x.lesson.questions.length) return null;
      var q = null;
      for (var i = 0; i < x.lesson.questions.length; i++) {
        if (!QQStore.isSolved(x.lesson.questions[i].id)) { q = x.lesson.questions[i]; break; }
      }
      if (!q) q = x.lesson.questions[0];
      return {
        unitId: x.unit.id, unitTitle: x.unit.title,
        lessonId: x.lesson.id, lessonTitle: x.lesson.title,
        questionId: q.id, prompt: q.prompt, type: q.type, topic: q.topic || null,
        lock: lessonLock(x.unit, x.lesson, x.indexInUnit) || null,
        fresh: QQStore.solvedCount() === 0
      };
    },

    /* false when the lesson can be started right now, otherwise the reason
     * ('email' or 'sequence'). The archive asks before it offers, so it never
     * says "play this one" and then hands over a sheet saying no. */
    lessonLockFor: function (lessonId) {
      var x = allLessons().filter(function (n) { return n.lesson.id === lessonId; })[0];
      return x ? lessonLock(x.unit, x.lesson, x.indexInUnit) : 'missing';
    }
  };
})(window);
