/* The answers archive — the screen a viewer lands on straight off a Reel.
 *
 * The content is js/answers.js, which pipeline/build_answers.py generates from
 * the posted-video record. Nothing is written here; this file only draws it.
 *
 * FROM 2026-08-02 THIS IS THE DEFAULT LANDING SCREEN. A visitor with no deep
 * link and no progress lands here rather than on the road, because every
 * caption now says the answer is on the site and nowhere else — so "answers"
 * is the promise they are arriving with, and this is the page that keeps it.
 * app.js owns that decision (see entryPath there, and the 33% it is judged
 * against); this file reads it in boot() and never re-derives it. A deep link
 * still wins, and a visitor with progress still lands on the road.
 *
 * The other half of that change is `offerRoad` below: when a visitor leaves an
 * answer, the road's next question appears under it. Getting a reader to play
 * is the only reason this archive is worth landing anyone on.
 *
 * ==========================================================================
 * THE ANSWER COSTS AN EMAIL.  (program.md, "The answer is never free")
 * ==========================================================================
 * From 2026-08-02 a video withholds its answer everywhere — not on screen, not
 * in the caption, not in the first comment. This page is the ONLY place the
 * answer exists, and reading it costs one email address.
 *
 * So the page splits in two, and the split is the whole design:
 *
 *   FREE, and visible the instant they land — the date, the topic, the
 *   question in full, and the SHAPE of the working: how many steps, whether
 *   the numbers are laid out, how long it takes to read. Enough that the ask
 *   is obviously worth it, and not one word that resolves it.
 *
 *   BEHIND THE EMAIL — the answer lede (`a`) and the working (`why`).
 *
 * It is ONE ask, not one per answer. QQAuth.hasAccess() is the same predicate
 * the road's wall uses, so an address given anywhere opens every answer here,
 * for ever, on this device and on any device they sign in on.
 *
 * The copy says plainly what is happening: we want the email. No countdown, no
 * "one free answer left", no pretending an address is needed for a technical
 * reason. A bait-and-switch is what sours cold traffic; saying the price out
 * loud is what converts.
 *
 * THE ROAD IS NOT GATED BY ANY OF THIS. Unit 1 is free, no login, no wall,
 * exactly as it was — including the "play this one" button below, which stays
 * on the free side of the gate for a locked visitor. Somebody who would rather
 * solve it than be told is worth more to us than an email, not less.
 *
 * WHAT IT MUST NOT LEAK. Entry headings are quoted from what we published and
 * routinely give the answer away ("WHY 14 IS THE MINIMUM"), so the teaser
 * never shows one. The search index drops `a` while locked, so the box cannot
 * be used as an oracle to confirm a guess.
 *
 * It owns nothing else. Screens are switched with QQApp.go, exactly as every
 * other screen is; the email itself goes through QQApp.captureEmail, which is
 * the road's own capture path, so there is one auth seam and one event
 * vocabulary rather than two.
 */
(function (global) {
  'use strict';

  var DATA = global.QQ_ANSWERS;
  if (!DATA || !DATA.entries || !DATA.entries.length) return;

  var doc = global.document;
  var $ = function (sel) { return doc.querySelector(sel); };
  var ENTRIES = DATA.entries;
  var BY_SLUG = {};
  ENTRIES.forEach(function (e) {
    BY_SLUG[e.slug] = e;
    var open = [e.title, e.q || '', e.topic, e.slug.replace(/_/g, ' ')].join(' ');
    /* Two indexes, because the search box must not become a way to read the
     * answer without paying for it: while locked, `a` is not searchable. */
    e._findOpen = (open + ' ' + e.a).toLowerCase();
    e._findLocked = open.toLowerCase();
  });

  var SRC_NOTE = {
    comment: 'the worked answer posted under the video',
    caption: "from the video's caption",
    module: 'from the working the video was built from'
  };

  var CHEV = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var LOCK = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">' +
    '<path d="M7 10V8a5 5 0 0110 0v2" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round"/><rect x="4.5" y="10" width="15" height="10" rx="2.5" ' +
    'fill="currentColor"/></svg>';

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function locked() {
    /* auth.js is the only module that decides this, for the road and for here.
     * Guarded because the archive must still draw if auth is ever pulled. */
    try { return !(global.QQAuth && QQAuth.hasAccess()); } catch (e) { return true; }
  }

  function utm() {
    try { return QQApp.utmSource(); } catch (e) { return null; }
  }

  // ======================================================================
  // the shape of the working — what a locked visitor is being offered
  // ======================================================================
  /* Everything here is counted off the nodes, never quoted from them. A count
   * cannot resolve the question; a sentence of the working can. */
  function shapeOf(entry) {
    var nodes = (entry.why || []).filter(function (n) { return n.lines && n.lines.length; });
    var words = 0;
    var laidOut = false;
    nodes.forEach(function (n) {
      n.lines.forEach(function (line) { words += line.split(/\s+/).length; });
      if (n.t === 'pre') laidOut = true;
    });
    return { steps: nodes.length, words: words, laidOut: laidOut };
  }

  function shapeLine(entry) {
    var s = shapeOf(entry);
    if (!s.steps) return 'A one-line answer — no working was published for this one.';
    var bits = [s.steps === 1 ? '1 step of working' : s.steps + ' steps of working'];
    if (s.laidOut) bits.push('the numbers laid out line by line');
    bits.push('about ' + Math.max(1, Math.round(s.words / 200)) + ' min to read');
    return bits.join(' · ');
  }

  // ======================================================================
  // one entry
  // ======================================================================
  function drawWhy(host, entry) {
    entry.why.forEach(function (node) {
      if (node.h) host.appendChild(el('h3', 'ans-h', node.h));
      if (!node.lines.length) return;
      if (node.t === 'list') {
        var ul = el('ul', 'ans-ul');
        node.lines.forEach(function (line) { ul.appendChild(el('li', null, line)); });
        host.appendChild(ul);
      } else if (node.t === 'pre') {
        host.appendChild(el('pre', 'ans-pre', node.lines.join('\n')));
      } else {
        node.lines.forEach(function (line) { host.appendChild(el('p', 'ans-p', line)); });
      }
    });
  }

  function drawPlay(host, entry) {
    if (!entry.road) return;
    var lock = QQApp.lessonLockFor(entry.road.lesson);
    if (lock === 'missing') return;

    var btn = el('button', 'ans-play');
    btn.type = 'button';
    btn.appendChild(el('b', null, lock ? 'This one is on the road' : 'Play this one'));
    btn.appendChild(el('span', null, entry.road.prompt));
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      QQA.track('answers_play_clicked', {
        slug: entry.slug, lessonId: entry.road.lesson,
        questionId: entry.road.qid, lock: lock || null,
        gated: locked()
      });
      clearHash();
      if (!lock) { QQApp.openLesson(entry.road.lesson); return; }
      /* Locked. Saying no to somebody who just asked to play is the worst
       * thing this page could do, so put them on the road instead, looking at
       * the node they came for, with the mascot standing where they start. */
      QQApp.go('path');
      var node = doc.querySelector('.node-holder[data-lesson="' + entry.road.lesson + '"]');
      if (node) setTimeout(function () { node.scrollIntoView({ block: 'center' }); }, 60);
    });
    host.appendChild(btn);
  }

  // ======================================================================
  // leaving an answer — the road's next question, offered as the next thing
  // ======================================================================
  /* From 2026-08-02 this page is where a cold visitor LANDS, not a side room
   * they wander into. That makes the end of an answer the most important
   * moment on the site: they came for a thing, they got the thing, and the
   * next second decides whether they ever touch the product.
   *
   * So when they leave an answer — collapse it, or reach the bottom of one
   * they have unlocked — the road's next question appears underneath, with
   * its actual words on it. For the visitor this exists for that is question
   * one of unit one; for anybody with progress it is where they are.
   *
   * The rules it is built to, all of them the owner's:
   *   - it is an OFFER, never a wall and never a redirect. It appears BELOW
   *     what they were reading; the answer stays exactly where it was, open,
   *     and "Not now" removes the offer and nothing else.
   *   - it never fires twice in a page load. One offer, then silence — a
   *     second one is nagging, and nagging is what makes a page feel like a
   *     funnel rather than a thing worth reading.
   *   - it is shown to a locked visitor too. Someone who would rather solve
   *     it than pay an email for it is worth MORE to us, not less
   *     (site/README.md), so refusing the gate must not also cost them the
   *     road.
   *
   * And it is instrumented, because "they read and then left" and "they read
   * and then played" are the whole question and look identical without it:
   * `answers_road_question_shown` -> `_started` is the conversion, and
   * `lesson_started` follows from QQApp.openLesson on its own. */
  var roadOfferDone = false;      // once per page load, whatever the trigger
  var roadOfferAt = 0;

  function entryPathNow() {
    try { return QQApp.entryPath(); } catch (e) { return null; }
  }

  function offerRoad(art, entry, trigger) {
    if (roadOfferDone || !art || !art.parentNode) return;
    var next = null;
    try { next = QQApp.nextRoadQuestion(); } catch (e) { next = null; }
    /* Never offer a lesson that would answer back with a wall or a sheet.
     * currentLesson() never picks a locked one, so this is a guard, not a
     * branch — if it ever trips, the offer is silently skipped rather than
     * turning into the thing it was built to avoid. */
    if (!next || next.lock) return;

    roadOfferDone = true;
    roadOfferAt = Date.now();

    function props(extra) {
      var p = {
        slug: entry ? entry.slug : null,
        trigger: trigger,
        unitId: next.unitId, lessonId: next.lessonId, questionId: next.questionId,
        firstOnRoad: next.fresh,
        gated: locked(),
        entryPath: entryPathNow(),
        utm: utm()
      };
      if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) p[k] = extra[k];
      return p;
    }

    var box = el('div', 'ans-next');
    box.appendChild(el('p', 'ans-next-kick',
      next.fresh ? 'The first question on the road' : 'Where you are on the road'));
    box.appendChild(el('p', 'ans-next-q', next.prompt));

    var goBtn = el('button', 'primary-btn ans-next-go', 'Solve this one');
    goBtn.type = 'button';
    box.appendChild(goBtn);

    var laterBtn = el('button', 'ghost-btn ans-next-no', 'Not now');
    laterBtn.type = 'button';
    box.appendChild(laterBtn);

    goBtn.addEventListener('click', function () {
      QQA.track('answers_road_question_started', props({ msShown: Date.now() - roadOfferAt }));
      clearHash();
      QQApp.openLesson(next.lessonId);
    });
    laterBtn.addEventListener('click', function () {
      QQA.track('answers_road_question_dismissed', props({ msShown: Date.now() - roadOfferAt }));
      box.classList.remove('on');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 220);
    });

    art.parentNode.insertBefore(box, art.nextSibling);
    /* Painted closed for one frame so the reveal has something to animate
     * from; under prefers-reduced-motion the stylesheet makes it a no-op.
     * The timer is a backstop, not a duplicate: rAF does not run in a hidden
     * tab, and an offer that is in the DOM at opacity 0 for ever would be a
     * silent hole in the funnel. classList.add twice costs nothing. */
    var reveal = function () { box.classList.add('on'); };
    if (global.requestAnimationFrame) global.requestAnimationFrame(reveal);
    setTimeout(reveal, 120);

    QQA.track('answers_road_question_shown', props());

    /* 'nearest' on purpose: it does nothing at all when the offer is already
     * on screen, which is the common case. Nothing here may yank the page
     * away from the answer they were reading. */
    setTimeout(function () {
      try { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }, 280);
  }

  /* The other exit: they unlocked an answer and read to the end of it. A
   * sentinel after the last line reaching the viewport is the honest version
   * of "finished reading" — not a timer pretending to be one.
   *
   * IntersectionObserver does the watching, because a scroll handler on a
   * long list is the classic way to make a phone stutter. It is on every
   * browser we ship to; the plain-rect fallback below exists so that a
   * browser without it loses the offer's timing rather than the offer. */
  function watchForEnd(body, entry) {
    if (roadOfferDone) return;
    var end = el('div', 'ans-end');
    end.setAttribute('aria-hidden', 'true');
    body.appendChild(end);

    /* A beat before the offer, so it is not part of the same visual event as
     * the last line of the working arriving. `body.parentNode` is read at fire
     * time, not now: card() fills the body before putting it in the article. */
    function reached() {
      setTimeout(function () { offerRoad(body.parentNode, entry, 'read_end'); }, 700);
    }

    if (global.IntersectionObserver) {
      var obs = new global.IntersectionObserver(function (rows) {
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i].isIntersecting) continue;
          obs.disconnect();
          reached();
          return;
        }
      }, { threshold: 0.9 });
      obs.observe(end);
      return;
    }

    function check() {
      if (roadOfferDone) { global.removeEventListener('scroll', check); return; }
      var r = end.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= (global.innerHeight || 0)) return;
      global.removeEventListener('scroll', check);
      reached();
    }
    global.addEventListener('scroll', check, { passive: true });
    /* Deferred, not immediate: card() fills a body BEFORE putting it in the
     * article, so a rect read now is all zeros and a short answer that never
     * needs scrolling would never fire. IntersectionObserver has no such
     * problem — it reports a first-time-visible element on its own. */
    setTimeout(check, 60);
  }

  // ======================================================================
  // the gate
  // ======================================================================
  /* Fired once per entry per page load, so a visitor scrolling past the same
   * locked card twice is not counted as two asks. */
  var gateSeen = {};
  var unlockSeen = {};

  /* Deep link off a Reel, or found by browsing the archive? Those are two
   * different visitors with two different intents and the conversion between
   * them is the thing worth knowing, so it rides on every gate event. */
  function arrivalOf(entry) {
    var deep = entry.slug === focusSlug && (arrivalHow === 'load' || arrivalHow === 'hash');
    return deep ? 'deep_link' : 'browse';
  }

  function gateProps(entry) {
    var arrival = arrivalOf(entry);
    var s = shapeOf(entry);
    return {
      /* The same field the road's wall stamps, with a value of its own, so
       * `asked -> gave` can be read per surface in one query rather than by
       * knowing which event names belong to which ask. */
      wallKind: 'answers',
      slug: entry.slug,
      topic: entry.topic || null,
      utm: utm(),
      arrival: arrival,
      deepLink: arrival === 'deep_link',
      whySteps: s.steps,
      hasRoadQuestion: !!entry.road,
      archiveSize: ENTRIES.length
    };
  }

  function drawGate(host, entry) {
    /* No copy. The owner cut the heading and both paragraphs on 2026-08-02:
     * the card above already says "ANSWER — behind one email" and how long the
     * working is, so everything here was repeating it at length. A cold visitor
     * off a Reel reads the field and the button, not an argument for filling
     * them in — and every line of persuasion is another line between arriving
     * and acting ("never show a cold visitor a menu", program.md).
     *
     * The one line kept is `wallSmallPrint()`, which is disclosure rather than
     * talking: it is what tells someone an email is actually going to be sent
     * to them before they hand over the address. */
    var box = el('div', 'ans-gate');

    var form = el('form', 'ans-gate-form');
    form.setAttribute('novalidate', 'novalidate');

    var input = el('input', 'ans-gate-input');
    input.type = 'email';
    input.setAttribute('inputmode', 'email');
    input.setAttribute('autocomplete', 'email');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('placeholder', 'you@example.com');
    input.setAttribute('aria-label', 'your email address');
    form.appendChild(input);

    var err = el('p', 'ans-gate-err');
    err.setAttribute('role', 'alert');
    form.appendChild(err);

    var btn = el('button', 'primary-btn ans-gate-btn', 'Show me the answer');
    btn.type = 'submit';
    form.appendChild(btn);

    var small = el('p', 'ans-gate-small');
    small.textContent = QQAuth.wallSmallPrint();
    form.appendChild(small);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitGate(entry, input, btn, err);
    });
    /* The card's own click handler collapses the card. A tap on the form is
     * not a tap on the card. */
    box.addEventListener('click', function (ev) { ev.stopPropagation(); });

    box.appendChild(form);
    host.appendChild(box);

    if (!gateSeen[entry.slug]) {
      gateSeen[entry.slug] = true;
      QQA.track('answer_gate_shown', gateProps(entry));
    }
  }

  function submitGate(entry, input, btn, err) {
    var value = (input.value || '').trim();
    var restore = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'One moment…';

    /* The road's capture path, with our own wallKind so that an email taken
     * here is never averaged in with one taken on the road. */
    QQApp.captureEmail(value, { wallKind: 'answers', props: gateProps(entry) })
      .then(function (res) {
        btn.disabled = false;
        btn.textContent = restore;
        if (!res.ok) { err.textContent = res.error || 'Something went wrong.'; return; }
        err.textContent = '';

        justUnlocked = entry.slug;
        unlockNote = res.mode === 'magic-link'
          ? 'Saved. A sign-in link is on its way — open it on this device and every answer ' +
            'follows you onto the account. They are all open here already.'
          : 'Saved on this device. We could not reach the sign-in service, so no link was ' +
            'sent — every answer is open here either way.';
        /* render() rebuilds the list, which throws away any offer already on
         * the page. Paying is the moment the offer is most worth making, so
         * it is re-armed rather than lost — the reader will meet it again at
         * the bottom of the answer they have just bought. */
        roadOfferDone = false;
        /* Every card on the page is now unlocked, not just this one — and the
         * one they paid at must come back OPEN, showing the thing they just
         * bought, wherever in the list it was. */
        openSet[entry.slug] = true;
        render();
        var node = doc.querySelector('.ans[data-slug="' + entry.slug + '"]');
        if (node) setTimeout(function () { node.scrollIntoView({ block: 'start' }); }, 30);
      });
  }

  // ======================================================================
  // the card
  // ======================================================================
  /* The body is filled the first time it is opened rather than for all 76
   * cards up front: a locked archive would otherwise carry 76 email inputs,
   * which is both wasteful and exactly the kind of thing a password manager
   * decides to fill in all at once. */
  function fillBody(body, entry, isLocked) {
    var want = isLocked ? 'gate' : 'full';
    if (body.getAttribute('data-filled') === want) return;
    body.innerHTML = '';
    body.setAttribute('data-filled', want);

    if (isLocked) {
      drawGate(body, entry);
      drawPlay(body, entry);
      return;
    }
    if (entry.slug === justUnlocked && unlockNote) {
      body.appendChild(el('p', 'ans-unlocked', unlockNote));
      unlockNote = '';                 // it is news exactly once
    }
    drawWhy(body, entry);
    drawPlay(body, entry);
    body.appendChild(el('p', 'ans-src', SRC_NOTE[entry.src] || ''));
    /* They have the answer. The bottom of it is where the road gets offered. */
    watchForEnd(body, entry);

    if (!unlockSeen[entry.slug]) {
      unlockSeen[entry.slug] = true;
      QQA.track('answer_unlocked', {
        slug: entry.slug,
        topic: entry.topic || null,
        how: entry.slug === justUnlocked ? 'just_unlocked' : arrivalOf(entry),
        utm: utm(),
        whySteps: shapeOf(entry).steps,
        signedIn: !!(global.QQAuth && QQAuth.isSignedIn())
      });
    }
  }

  function card(entry, forceOpen) {
    var isLocked = locked();
    /* An expanded card stays expanded across a re-render — the list is redrawn
     * when access changes, and collapsing what somebody was reading (or had
     * just paid to see) because of it would be indefensible. */
    var isOpen = forceOpen || !!openSet[entry.slug];
    var art = el('article', 'ans' + (isOpen ? ' open' : '') + (isLocked ? ' gated' : ''));
    art.setAttribute('data-slug', entry.slug);

    var top = el('button', 'ans-top');
    top.type = 'button';
    top.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    var kick = el('div', 'ans-kick');
    kick.appendChild(el('span', null, entry.date));
    if (entry.topic) {
      kick.appendChild(el('span', 'ans-sep', '·'));
      kick.appendChild(el('span', null, entry.topic.replace(/_/g, ' ')));
    }
    top.appendChild(kick);

    /* The question in full, free, always — it is how they know they are in the
     * right place. Only 27 of the entries carry a separate `q`; for the rest
     * the title IS the question as it was posed, so one or the other is shown
     * and never both, which would just be the same sentence twice. */
    top.appendChild(el('p', 'ans-q', entry.q || entry.title));

    if (isLocked) {
      var hidden = el('p', 'ans-a ans-a-locked');
      hidden.appendChild(el('span', 'ans-label ans-label-locked', 'Answer'));
      var mark = el('span', 'ans-lockmark');
      mark.innerHTML = LOCK;
      hidden.appendChild(mark);
      hidden.appendChild(doc.createTextNode(' Behind one email'));
      top.appendChild(hidden);
      top.appendChild(el('p', 'ans-shape', shapeLine(entry)));
    } else {
      var ans = el('p', 'ans-a');
      ans.appendChild(el('span', 'ans-label', 'Answer'));
      ans.appendChild(doc.createTextNode(entry.a));
      top.appendChild(ans);
    }

    var chev = el('span', 'ans-chev');
    chev.innerHTML = CHEV;
    top.appendChild(chev);
    art.appendChild(top);

    var body = el('div', 'ans-body');
    body.hidden = !isOpen;
    if (isOpen) fillBody(body, entry, isLocked);
    art.appendChild(body);

    top.addEventListener('click', function () {
      var nowOpen = !art.classList.contains('open');
      art.classList.toggle('open', nowOpen);
      if (nowOpen) { openSet[entry.slug] = true; fillBody(body, entry, isLocked); }
      else delete openSet[entry.slug];
      body.hidden = !nowOpen;
      top.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      setHash(nowOpen ? 'answers/' + entry.slug : 'answers');
      if (nowOpen) {
        QQA.track('answers_entry_opened', {
          slug: entry.slug, src: entry.src, gated: isLocked
        });
      } else {
        /* Closing an answer is leaving it, whether they paid for it or not.
         * The offer goes under the card they just shut — not over it. */
        offerRoad(art, entry, 'closed');
      }
    });
    return art;
  }

  // ======================================================================
  // the list
  // ======================================================================
  var focusSlug = null;
  var arrivalHow = null;        // how the focused entry was reached
  var justUnlocked = null;      // the slug whose gate they just paid at
  var unlockNote = '';
  var openSet = {};             // slugs the visitor has expanded, kept across re-renders
  var query = '';

  function render() {
    var host = $('#ansList');
    host.innerHTML = '';
    var isLocked = locked();

    var q = query.trim().toLowerCase();
    var key = isLocked ? '_findLocked' : '_findOpen';
    var list = q ? ENTRIES.filter(function (e) { return e[key].indexOf(q) !== -1; }) : ENTRIES;

    var focused = focusSlug && !q ? BY_SLUG[focusSlug] : null;
    if (focused) {
      host.appendChild(card(focused, true));
      var rest = ENTRIES.filter(function (e) { return e.slug !== focusSlug; });
      host.appendChild(el('p', 'ans-more', 'More answers'));
      rest.forEach(function (e) { host.appendChild(card(e, false)); });
    } else {
      if (!list.length) {
        host.appendChild(el('p', 'ans-none', 'Nothing matches “' + query.trim() + '”.'));
      }
      /* THE LANDING OPENS THE NEWEST ANSWER (2026-08-03).
       *
       * Measured over the two days before this: 65 people reached the archive
       * and 49 of them never opened a single card, so 75% of the traffic our
       * own captions send here never met the gate, never saw a worked answer,
       * and could not have converted if they wanted to. The card is not the
       * problem — it already says "Answer, behind one email" and shows the
       * shape of the working. The LIST is the problem. app.js's own comment
       * says it: never show a cold visitor a menu, and a wall of 93 collapsed
       * rows is a menu.
       *
       * So the first card arrives open. The other 92 are still underneath, so
       * nothing is taken away — it is the difference between a filing cabinet
       * and a magazine left open on the table.
       *
       * Deliberately narrow: only on a cold LOAD, only with no deep link and
       * no search. Someone who typed a query, tapped back to the list, or
       * navigated within the archive has told us what they want and gets the
       * list they asked for.
       *
       * DO NOT JUDGE THIS ON answer_gate_shown. Opening a card fires the gate,
       * so that number is about to go from 16/65 to nearly every arrival, and
       * it will look like a triumph while proving only that I forced it. The
       * metric is EMAIL_SUBMITTED PER ARCHIVE ARRIVAL — 2 unlocks from 65 over
       * the two days before this. Watch `answer_gate_shown -> email_submitted`
       * too: if the rate per gate collapses while emails per arrival stay flat,
       * this is showing the ask to people who were never going to give one,
       * which is how an account teaches its audience to ignore it. Revert then
       * — it is one `if`. */
      /* 'entry' is the DEFAULT no-hash landing — app.js decides the archive is
       * the first screen and boot() calls open(null, 'entry'). 'load' is only
       * set when the URL carried #answers. The first version of this guard
       * tested for 'load' alone, which excluded exactly the visitors it was
       * written for: archive_landing_opened fired ZERO times in the four hours
       * after it shipped, across nine arrivals, because every cold landing
       * comes through 'entry'. I checked the deployed file for the string
       * instead of testing the behaviour, which is not a check.
       * 'tab' and 'back' stay excluded — someone who tapped Answers or came
       * back to the list asked for the list. */
      var coldLanding = !q && (arrivalHow === 'entry' || arrivalHow === 'load')
                        && list.length;
      list.forEach(function (e, i) {
        host.appendChild(card(e, coldLanding && i === 0));
      });
      if (coldLanding) {
        openSet[list[0].slug] = true;
        QQA.track('archive_landing_opened', {
          slug: list[0].slug, gated: isLocked, utm: utm()
        });
      }
    }
    $('#ansCount').textContent = q
      ? list.length + ' of ' + ENTRIES.length
      : ENTRIES.length + ' answers';

    /* Say the price before they tap, not after. Somebody who opens a card and
     * only then meets an ask has been strung along; somebody who read it on
     * the way in has not. */
    $('#ansHeadSub').textContent = isLocked
      ? 'Every puzzle we have posted, worked through. One email opens all ' +
        ENTRIES.length + ' of them — newest first.'
      : 'Every puzzle we have posted, worked through. Newest first.';

    /* Arriving on a deep link, the archive's own furniture is in the way of
     * the one line the visitor came for. Take it out and the answer is the
     * second thing on the screen. */
    $('#ansBackAll').hidden = !focused;
    $('#ansHeadSub').hidden = !!focused;
    $('#ansTools').hidden = !!focused;
  }

  // ======================================================================
  // routing:  #answers  and  #answers/<slug>
  // ======================================================================
  var muted = false;

  function setHash(h) {
    muted = true;
    try { global.history.replaceState(null, '', '#' + h); }
    catch (e) { global.location.hash = h; }        // file:// in some browsers
    muted = false;
  }

  /* Leaving for the road takes the answers route off the address bar with it,
   * so a reload or a back button does not drag them back here. */
  function clearHash() {
    muted = true;
    try { global.history.replaceState(null, '', global.location.pathname + global.location.search); }
    catch (e) { /* file:// in some browsers refuses; the stale hash is harmless */ }
    muted = false;
  }

  function parse() {
    var m = /^#answers(?:\/([a-z0-9_]+))?$/i.exec(global.location.hash || '');
    return m ? { slug: m[1] || null } : null;
  }

  function open(slug, how) {
    focusSlug = slug && BY_SLUG[slug] ? slug : null;
    arrivalHow = how;
    openSet = {};                 // a fresh navigation, not a redraw
    query = '';
    var box = $('#ansSearch');
    if (box) box.value = '';
    setHash(focusSlug ? 'answers/' + focusSlug : 'answers');
    QQApp.go('answers');
    render();
    global.scrollTo(0, 0);
    QQA.track('answers_opened', {
      slug: focusSlug, deepLink: !!focusSlug, how: how,
      unknownSlug: !!(slug && !BY_SLUG[slug]),
      gated: locked(), utm: utm()
    });
  }

  function route(how) {
    if (muted) return;
    var hit = parse();
    if (hit) { open(hit.slug, how || 'hash'); return; }
    if ($('#screen-answers').classList.contains('on')) QQApp.go('path');
  }

  // ======================================================================
  // wiring
  // ======================================================================
  function boot() {
    $('#tabAnswers').hidden = false;
    $('#ansSearch').setAttribute('placeholder', 'Search ' + ENTRIES.length + ' answers');

    $('#tabAnswers').addEventListener('click', function () {
      if (parse()) { open(null, 'tab'); return; }   // already here: back to the list
      global.location.hash = 'answers';             // fires route()
    });
    $('#tabRoad').addEventListener('click', function () {
      clearHash();
      QQApp.go('path');
    });
    $('#ansBackAll').addEventListener('click', function () { open(null, 'back'); });
    $('#ansSearch').addEventListener('input', function (e) {
      query = e.target.value;
      focusSlug = null;
      render();
    });
    $('#ansSearch').addEventListener('search', function (e) {
      if (!e.target.value) { query = ''; render(); }
    });

    /* Which tab is lit is a fact about which screen is on, and app.js switches
     * screens for a dozen reasons this file never hears about — so read it off
     * the DOM rather than trying to keep a copy in step. */
    var screen = $('#screen-answers');
    function syncTabs() {
      var here = screen.classList.contains('on');
      $('#tabAnswers').classList.toggle('on', here);
      $('#tabRoad').classList.toggle('on', !here);
    }
    if (global.MutationObserver) {
      new global.MutationObserver(syncTabs)
        .observe(screen, { attributes: true, attributeFilter: ['class'] });
    }
    syncTabs();

    global.addEventListener('hashchange', function () { route('hash'); });
    global.addEventListener('popstate', function () { route('back'); });

    /* Access can arrive after this screen has drawn — a magic link restores a
     * session asynchronously, and signing out drops one — so the gate is
     * redrawn on the auth module's own signal rather than left stale. */
    if (global.QQAuth && QQAuth.onChange) {
      QQAuth.onChange(function () {
        if (screen.classList.contains('on')) render();
      });
    }

    /* The first screen, and the deep link always wins it. app.js decided which
     * door this visit came through before anything was drawn; this file reads
     * that decision rather than making a second one, so the `entryPath` on
     * `arrived` is always the screen that was actually shown.
     *
     *   #answers/<slug>  -> that entry, open, at the top          (route)
     *   #answers         -> the list                              (route)
     *   no hash, nothing solved -> the list                       (open, 'entry')
     *   anything else    -> not ours; app.js has the road already
     *
     * The middle case is the change of 2026-08-02: every caption now says the
     * answer is on the site and nowhere else, so the page a visitor lands on
     * should be the thing the caption promised. Judged against 33% — see
     * app.js entryPath(). */
    if (parse()) { route('load'); return; }
    var lands = false;
    try { lands = !!(global.QQApp && QQApp.landsOnAnswers && QQApp.landsOnAnswers()); }
    catch (e) { lands = false; }
    if (lands) open(null, 'entry');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQAnswers = { open: open, count: ENTRIES.length };
})(window);
