/* The answers archive — the screen a viewer lands on straight off a Reel.
 *
 * The content is js/answers.js, which pipeline/build_answers.py generates from
 * the posted-video record. Nothing is written here; this file only draws it.
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
      list.forEach(function (e) { host.appendChild(card(e, false)); });
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

    /* A first-ever visitor is normally dropped straight into a question. If
     * they arrived on an answer link that is not what they came for, so this
     * runs last and wins. */
    route('load');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQAnswers = { open: open, count: ENTRIES.length };
})(window);
