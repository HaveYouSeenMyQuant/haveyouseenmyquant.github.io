/* The answers archive — the screen a viewer lands on straight off a Reel.
 *
 * The content is js/answers.js, which pipeline/build_answers.py generates from
 * the posted-video record. Nothing is written here; this file only draws it.
 *
 * The one thing that matters: someone who watched "which lockers end up open?"
 * arrives at #answers/hundred_lockers and reads "the perfect squares" without
 * scrolling and without hunting. So a deep link puts that entry at the very
 * top, already open, and the rest of the archive below it.
 *
 * It owns nothing else. Screens are switched with QQApp.go, exactly as every
 * other screen is, so the mascot, the topbar and the lesson teardown all keep
 * behaving the way they already do.
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
    e._find = [e.title, e.q || '', e.a, e.topic, e.slug.replace(/_/g, ' ')]
      .join(' ').toLowerCase();
  });

  var SRC_NOTE = {
    comment: 'the worked answer posted under the video',
    caption: "from the video's caption",
    module: 'from the working the video was built from'
  };

  var CHEV = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
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
        questionId: entry.road.qid, lock: lock || null
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

  function card(entry, open) {
    var art = el('article', 'ans' + (open ? ' open' : ''));
    art.setAttribute('data-slug', entry.slug);

    var top = el('button', 'ans-top');
    top.type = 'button';
    top.setAttribute('aria-expanded', open ? 'true' : 'false');

    var kick = el('div', 'ans-kick');
    kick.appendChild(el('span', null, entry.date));
    if (entry.topic) {
      kick.appendChild(el('span', 'ans-sep', '·'));
      kick.appendChild(el('span', null, entry.topic.replace(/_/g, ' ')));
    }
    top.appendChild(kick);

    if (entry.q) top.appendChild(el('p', 'ans-q', entry.q));

    var ans = el('p', 'ans-a');
    ans.appendChild(el('span', 'ans-label', 'Answer'));
    ans.appendChild(doc.createTextNode(entry.a));
    top.appendChild(ans);

    var chev = el('span', 'ans-chev');
    chev.innerHTML = CHEV;
    top.appendChild(chev);
    art.appendChild(top);

    var body = el('div', 'ans-body');
    body.hidden = !open;
    drawWhy(body, entry);
    drawPlay(body, entry);
    body.appendChild(el('p', 'ans-src', SRC_NOTE[entry.src] || ''));
    art.appendChild(body);

    top.addEventListener('click', function () {
      var nowOpen = !art.classList.contains('open');
      art.classList.toggle('open', nowOpen);
      body.hidden = !nowOpen;
      top.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      setHash(nowOpen ? 'answers/' + entry.slug : 'answers');
      if (nowOpen) QQA.track('answers_entry_opened', { slug: entry.slug, src: entry.src });
    });
    return art;
  }

  // ======================================================================
  // the list
  // ======================================================================
  var focusSlug = null;
  var query = '';

  function render() {
    var host = $('#ansList');
    host.innerHTML = '';

    var q = query.trim().toLowerCase();
    var list = q ? ENTRIES.filter(function (e) { return e._find.indexOf(q) !== -1; }) : ENTRIES;

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
    query = '';
    var box = $('#ansSearch');
    if (box) box.value = '';
    setHash(focusSlug ? 'answers/' + focusSlug : 'answers');
    QQApp.go('answers');
    render();
    global.scrollTo(0, 0);
    QQA.track('answers_opened', {
      slug: focusSlug, deepLink: !!focusSlug, how: how,
      unknownSlug: !!(slug && !BY_SLUG[slug])
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

    /* A first-ever visitor is normally dropped straight into a question. If
     * they arrived on an answer link that is not what they came for, so this
     * runs last and wins. */
    route('load');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQAnswers = { open: open, count: ENTRIES.length };
})(window);
