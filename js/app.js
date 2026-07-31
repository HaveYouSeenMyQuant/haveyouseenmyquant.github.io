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
  function connector(track, x0, y0, x1, y1, lit) {
    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var seg = el('div', 'road-seg' + (lit ? ' lit' : ''));
    seg.style.width = len.toFixed(1) + 'px';
    seg.style.left = 'calc(50% + ' + ((x0 + x1) / 2).toFixed(1) + 'px)';
    seg.style.top = ((y0 + y1) / 2).toFixed(1) + 'px';
    seg.style.transform = 'translate(-50%, -50%) rotate(' + ang.toFixed(2) + 'deg)';
    track.appendChild(seg);
  }

  function renderPath() {
    var host = $('#pathHost');
    host.innerHTML = '';
    var cur = currentLesson();

    D.units.forEach(function (unit) {
      var section = el('section', 'unit');
      section.style.setProperty('--unit', unit.colour);
      var locked = !unit.free && !QQAuth.hasAccess();

      // ---- unit banner
      var head = el('div', 'unit-head' + (locked ? ' dim' : ''));
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
      if (locked) {
        var badge = el('div', 'unit-locked');
        badge.innerHTML = svgIcon(ICON_LOCK, 13) + ' <span>an email unlocks this</span>';
        head.appendChild(badge);
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
          doneBoth);
      }

      unit.lessons.forEach(function (lesson, i) {
        var st = QQStore.lessonState(lesson.id);
        var lock = lessonLock(unit, lesson, i);
        var done = st.crowns > 0;
        var state = done ? 'done' : (lock ? 'locked' : 'open');
        var isCurrent = cur && cur.lesson.id === lesson.id && !done;

        var holder = el('div', 'node-holder');
        // a gentle snake: centre, right, centre, left, repeating
        var offset = Math.sin(i * Math.PI / 2) * 58;
        holder.style.left = 'calc(50% + ' + offset.toFixed(1) + 'px)';
        holder.style.top = (i * GAP) + 'px';

        var btn = el('button', 'node ' + state + (isCurrent ? ' current' : ''));
        btn.type = 'button';
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
        if (state === 'locked') sub.textContent = lock === 'email' ? 'email to unlock' : 'finish the one before';
        else if (done) sub.textContent = st.crowns + ' of ' + QQStore.MAX_CROWNS + ' crowns';
        else sub.textContent = lesson.questions.length + ' questions';
        lab.appendChild(sub);
        holder.appendChild(lab);

        if (isCurrent) holder.appendChild(el('div', 'start-bubble', st.completions ? 'AGAIN' : 'START'));
        track.appendChild(holder);
      });

      section.appendChild(track);
      host.appendChild(section);
    });

    renderLibraries();
    renderHeader();
  }

  /* Landing mid-road is the point: you should arrive already looking at the
   * thing you are meant to tap, not at a marketing page. */
  function scrollToCurrent(smooth) {
    var node = $('.node.current');
    if (!node) return;
    try { node.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' }); }
    catch (e) { node.scrollIntoView(); }
  }

  // ======================================================================
  // libraries — money never touches the road
  // ======================================================================
  function renderLibraries() {
    var host = $('#libraryList');
    if (host.dataset.built) return;
    host.dataset.built = '1';
    D.libraries.forEach(function (lib) {
      var card = el('button', 'lib-card');
      card.type = 'button';
      var top = el('div', 'lib-top');
      top.appendChild(el('div', 'lib-name', lib.name));
      top.appendChild(el('span', 'lib-badge', lib.status === 'soon' ? 'soon' : QQPay.priceLabel(lib)));
      card.appendChild(top);
      card.appendChild(el('div', 'lib-blurb', lib.blurb));
      card.appendChild(el('div', 'lib-meta', lib.questionCount + ' questions · separate library · the road stays free'));
      card.addEventListener('click', function () { onLibraryTap(lib); });
      host.appendChild(card);
      QQA.track('library_viewed', { libraryId: lib.id, status: lib.status });
    });
  }

  function onLibraryTap(lib) {
    QQA.track('library_clicked', { libraryId: lib.id, priceUsd: lib.priceUsd || null, status: lib.status });
    QQPay.checkout(lib.id).then(function (res) {
      QQA.track('library_interest', { libraryId: lib.id, stub: !!res.stub });
      openSheet(lib.name,
        '<p>' + lib.blurb + '</p>' +
        '<p class="sheet-note">Payments are not connected yet, so nothing was charged and nothing opened. ' +
        'Your interest is recorded — it is the signal that decides whether this library gets built next.</p>' +
        '<p class="sheet-note">The road you are on stays free for ever. Paid sets are always separate libraries.</p>',
        'Got it');
    });
  }

  function onLessonTap(unit, lesson, i) {
    var lock = lessonLock(unit, lesson, i);
    if (lock === 'email') {
      QQA.track('locked_lesson_tapped', { unitId: unit.id, lessonId: lesson.id, reason: 'email' });
      showWall(unit);
      return;
    }
    if (lock === 'sequence') {
      QQA.track('locked_lesson_tapped', { unitId: unit.id, lessonId: lesson.id, reason: 'sequence' });
      openSheet(lesson.title, '<p>Finish the lesson before this one first — the road goes in order.</p>', 'OK');
      return;
    }
    startLesson(unit, lesson);
  }

  // ======================================================================
  // the lesson loop
  // ======================================================================
  var play = null;

  function startLesson(unit, lesson) {
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
      QQStore.recordSolved(q.id, play.attempts[q.id]);
      play.queue.shift();
      $('#playProgressFill').style.width = (play.cleared / play.total * 100) + '%';
      $('#continueBtn').textContent = play.queue.length ? 'Continue' : 'Finish lesson';
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
      if (global.navigator.vibrate) { try { global.navigator.vibrate([12, 40, 12]); } catch (e) {} }
    }
    bar.scrollTop = 0;
  }

  function onContinue() {
    if (play.hearts <= 0) { outOfHearts(); return; }
    if (play.queue.length) { showQuestion(); return; }
    finishLesson();
  }

  function outOfHearts() {
    QQA.track('hearts_exhausted', {
      unitId: play.unit.id, lessonId: play.lesson.id,
      cleared: play.cleared, of: play.total,
      msInLesson: Date.now() - play.startedTs
    });
    if (play.viz && play.viz.destroy) { play.viz.destroy(); play.viz = null; }
    $('#heartsCopy').textContent =
      'You got ' + play.cleared + ' of ' + play.total + ' before the hearts ran out. ' +
      'Nothing is lost and nothing is locked — the hearts are only here to make you slow down and use the picture.';
    go('hearts');
  }

  var doneNext = null;

  function finishLesson() {
    var lv = play.lesson, unit = play.unit;
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
    $('#doneTitle').textContent = perfect ? 'Perfect lesson' : 'Lesson complete';
    var burst = $('#crownBurst');
    burst.innerHTML = svgIcon(ICON_CROWN, 44);
    burst.className = 'crown-burst' + (perfect ? ' perfect' : '');
    $('#xpLine').innerHTML = '<span class="xp-pill">+' + xpEarned + ' XP</span>';
    $('#doneStats').innerHTML =
      '<div class="stat"><b>' + play.firstTry + '/' + play.total + '</b><span>right first go</span></div>' +
      '<div class="stat"><b>' + res.crowns + '</b><span>crowns here</span></div>' +
      '<div class="stat"><b>' + QQStore.currentStreak() + '</b><span>day streak</span></div>';

    var pct = Math.min(1, xpRes.today / D.dailyGoalXp);
    var metGoal = xpRes.today >= D.dailyGoalXp;
    $('#goalStrip').innerHTML =
      '<div class="goal-head"><span>Daily goal</span><span>' + Math.min(xpRes.today, D.dailyGoalXp) + ' / ' + D.dailyGoalXp + ' XP</span></div>' +
      '<div class="goal-bar"><div class="goal-fill" style="width:' + (pct * 100).toFixed(0) + '%"></div></div>' +
      '<div class="goal-note">' + (metGoal
        ? 'Goal met for today. Come back tomorrow and the streak goes to ' + (QQStore.currentStreak() + 1) + '.'
        : (D.dailyGoalXp - xpRes.today) + ' XP to go — about one more lesson.') + '</div>';

    doneNext = nextLessonAfter(lv.id);
    if (!doneNext) {
      $('#doneNext').textContent = 'That is the end of the road so far. More is being written.';
      $('#doneNextBtn').textContent = 'Back to the road';
    } else if (doneNext.lock === 'email') {
      $('#doneNext').textContent = 'Next up: ' + doneNext.unit.title + ' — ' + doneNext.lesson.title;
      $('#doneNextBtn').textContent = 'Unlock the next unit';
    } else {
      $('#doneNext').textContent = 'Next up: ' + doneNext.lesson.title;
      $('#doneNextBtn').textContent = 'Keep going';
    }

    go('done');
    confetti(perfect);
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
  var wallFor = null;
  function showWall(unit) {
    wallFor = unit || D.units[1];
    $('#wallTitle').textContent = 'Unit ' + wallFor.index + ' needs an email';
    $('#wallCopy').textContent =
      'Unit one is free for everyone, for ever — you have just played it with no account at all. ' +
      'From unit two on, an email keeps your streak, your crowns and your XP attached to you rather than to this browser.';
    $('#wallSmall').innerHTML = QQAuth.wallSmallPrint();
    $('#wallForm').hidden = false;
    $('#wallAfter').hidden = true;
    $('#wallError').textContent = '';
    go('wall');
    QQA.track('wall_shown', {
      unitId: wallFor.id,
      solvedTotal: QQStore.solvedCount(),
      xp: QQStore.totalXp(),
      msSinceArrival: Date.now() - ARRIVED_AT
    });
  }

  function submitEmail(ev) {
    ev.preventDefault();
    var input = $('#emailInput');
    var value = (input.value || '').trim();
    var err = QQAuth.validate(value);
    QQA.track('email_attempted', { valid: !err });
    if (err) { $('#wallError').textContent = err; return; }

    var submit = $('#wallSubmit');
    submit.disabled = true;
    submit.textContent = 'One moment…';
    QQAuth.submitEmail(value).then(function (res) {
      submit.disabled = false;
      submit.textContent = 'Unlock the rest of the road';
      if (!res.ok) { $('#wallError').textContent = res.error || 'Something went wrong.'; return; }
      QQA.track('email_submitted', {
        emailDomain: (value.split('@')[1] || ''), emailLength: value.length,
        mode: res.mode, unitId: wallFor ? wallFor.id : null,
        solvedTotal: QQStore.solvedCount(), xp: QQStore.totalXp()
      });
      $('#wallForm').hidden = true;
      $('#wallAfter').hidden = false;
      $('#wallAfterCopy').innerHTML = res.mode === 'magic-link'
        ? 'A one-time sign-in link is on its way to that address. Open it on this phone and your progress moves onto the account. The rest of the road is already open.'
        : 'Saved on this device, and the rest of the road is open. Email sign-in is not switched on yet, so no message will arrive — that is one function in <code>js/auth.js</code>.';
      renderPath();
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
    if (screen !== 'lesson' && play && play.viz && play.viz.destroy) {
      play.viz.destroy(); play.viz = null;
    }
    $$('.screen').forEach(function (s) { s.classList.toggle('on', s.id === 'screen-' + screen); });
    document.body.classList.toggle('in-lesson', screen === 'lesson');
    $('#topbar').hidden = (screen === 'lesson');
    global.scrollTo(0, 0);
    QQA.track('screen_viewed', { screen: screen });
    if (screen === 'path') {
      renderPath();
      QQA.track('path_viewed', {
        units: D.units.length,
        lessonsVisible: allLessons().length,
        lessonsDone: allLessons().filter(function (x) { return QQStore.lessonDone(x.lesson.id); }).length,
        xp: QQStore.totalXp(), streak: QQStore.currentStreak(), hasEmail: QQStore.hasEmail()
      });
      setTimeout(function () { scrollToCurrent(false); }, 40);
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
    $('#dbgId').textContent = 'anon ' + id.anonId + ' · visit ' + id.visitNumber + ' · sink: ' + QQA.sinkName();
  }

  // ======================================================================
  // boot
  // ======================================================================
  var ARRIVED_AT = Date.now();

  function boot() {
    var id = QQA.identity();
    QQA.debug = /[?&]debug=1/.test(location.search);

    var lostStreak = QQStore.noticeBrokenStreak();

    QQA.track('arrived', {
      referrer: document.referrer || null,
      viewportW: global.innerWidth, viewportH: global.innerHeight,
      isFirstEverVisit: id.isFirstEverVisit,
      visitNumber: id.visitNumber,
      hasEmail: QQStore.hasEmail(),
      xp: QQStore.totalXp(),
      solvedTotal: QQStore.solvedCount(),
      utm: (location.search.match(/utm_source=([^&]+)/) || [])[1] || null,
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
      if (!doneNext) { go('path'); return; }
      if (doneNext.lock === 'email') { showWall(doneNext.unit); return; }
      if (doneNext.lock) { go('path'); return; }
      startLesson(doneNext.unit, doneNext.lesson);
    });
    $('#doneToRoad').addEventListener('click', function () {
      QQA.track('celebration_cta', { action: 'road' });
      go('path');
    });
    $('#wallForm').addEventListener('submit', submitEmail);
    $('#wallBack').addEventListener('click', function () {
      QQA.track('wall_dismissed', { unitId: wallFor ? wallFor.id : null });
      go('path');
    });
    $('#wallAfterBack').addEventListener('click', function () { go('path'); });
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
    $('#dbgResetAll').addEventListener('click', function () {
      QQStore.reset(); QQA.clear(); renderDebug(); renderPath();
    });
    function openDebug() { $('#debug').classList.add('on'); renderDebug(); QQA.track('debug_opened', {}); }
    if (/[?&]debug=1/.test(location.search)) openDebug();
    QQA.onEvent = function () { if ($('#debug').classList.contains('on')) renderDebug(); };

    go('path');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQApp = {
    go: go, renderPath: renderPath, currentLesson: currentLesson,
    startLesson: startLesson, allLessons: allLessons
  };
})(window);
