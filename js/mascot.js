/* have you seen my quant — the mascot.
 * =====================================================================
 * FLIP: a small gold coin on two legs.
 *
 * Why a coin, and why not the die that came before it. A die needs pips,
 * and pips are fine detail — at 40px on a phone they turn to mush, which
 * is exactly how the first attempt died. A coin is the opposite kind of
 * shape: one bright disc. The silhouette survives any size because there
 * is nothing in it to lose. Two dark eyes and two feet are the only
 * features, and all four are large.
 *
 * It is also the right object. A coin flip is the first thing anybody
 * learns about chance, and a coin is what a quant desk is for — so the
 * character is on-topic twice over without a word of explanation. The
 * celebration is a literal flip.
 *
 * Colour is doing real work. The road is dark (#0d1117) and its nodes
 * are ringed in the unit's colour, which cycles blue, green, gold,
 * amber, purple, orange. A dark character with a thin bright outline —
 * the old die — disappeared into that. A warm gold disc is the brightest
 * thing on the screen and separates from all six.
 *
 * There is no floating highlight. The sheen is a broad arc hugging the
 * rim, and the bevel is its opposite below: both are shading on a solid
 * object rather than a mark placed near one. That is the fix for the
 * "stray swoosh" the previous pass left behind.
 *
 * WHAT IT DOES. It is a companion, not a decoration:
 *   1. it WAITS beside the node you are meant to play next — so "where
 *      do I start" is answered by a character standing there;
 *   2. you tap that node, a door opens in it, and the mascot WALKS IN.
 *      The door shutting is what carries you into the lesson;
 *   3. during the lesson it perches on the answer bar and reacts;
 *   4. lesson done, it comes back out of the door and WALKS the road to
 *      the next node, and settles there.
 *
 * POSITION IS DERIVED, NEVER REMEMBERED. Every single placement is
 * recomputed from `.node.current` in the freshly-rendered path. There
 * is no stored "which node am I at" that can drift out of step with
 * progress: reload at any point, finish three lessons in ten seconds,
 * or kill a walk halfway and the mascot is standing at the node the
 * road itself says is current. The only thing kept between renders is
 * where it was standing a moment ago, and that is used for one thing —
 * deciding whether to walk there or to simply be there.
 *
 * PERFORMANCE. Transform and opacity only. The travel is one Web
 * Animations call on one element; the gait, the blink, the reactions
 * and the sparks are CSS classes on markup that is built once, at boot,
 * and never rebuilt. Nothing is created per frame. Layout is read only
 * when the road has just re-rendered and a position is needed — a
 * handful of times per lesson, never inside an animation.
 *
 * REDUCED MOTION. No walking, no gait, no blinking, no spinning: the
 * mascot is simply already standing at the right node, calm and still,
 * and the door is skipped entirely.
 *
 * ACCESSIBILITY. The whole thing is aria-hidden and pointer-events:none.
 * It is scenery. It cannot be focused, it cannot be tapped, and it can
 * never sit between a finger and a button.
 * ===================================================================== */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ---------------------------------------------------------------- art */
  /* One string, parsed once, and never rebuilt. viewBox is 64x64. The coin
   * is r=21 at (32,27), which leaves the bottom sixth of the box for legs,
   * feet and the ground shadow — so the character stands on something
   * rather than floating.
   *
   * Layer order matters: the glow and the ground shadow sit outside
   * .qq-m-spin, so the celebration flip squashes the coin and not the
   * light it is casting. */
  var SVG =
    '<svg class="qq-m-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<defs>' +
        /* struck metal: hot at the top-left, deep at the bottom-right */
        '<linearGradient id="qqmFace" x1="0.2" y1="0" x2="0.72" y2="1">' +
          '<stop offset="0" stop-color="#ffeaa8"/>' +
          '<stop offset="0.52" stop-color="#f2b93c"/>' +
          '<stop offset="1" stop-color="#d38f18"/>' +
        '</linearGradient>' +
        /* it lifts itself off a very dark page; without this the coin reads
         * as a sticker pasted on rather than a thing in the scene */
        '<radialGradient id="qqmGlow" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="#f5b73a" stop-opacity="0.26"/>' +
          '<stop offset="0.55" stop-color="#f5b73a" stop-opacity="0.09"/>' +
          '<stop offset="1" stop-color="#f5b73a" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<ellipse class="qq-m-glow" cx="32" cy="28" rx="31" ry="31"/>' +
      '<ellipse class="qq-m-shadow" cx="32" cy="59.5" rx="16" ry="3"/>' +
      '<g class="qq-m-spin">' +
        /* each limb is leg + foot in one group, so the two swing together
         * and the walk cannot come apart at the ankle */
        '<g class="qq-m-limb qq-m-limb-l">' +
          '<rect class="qq-m-leg"  x="21.2" y="43" width="4" height="9"/>' +
          '<rect class="qq-m-foot" x="15.6" y="50.5" width="13" height="7.2" rx="3.6"/>' +
        '</g>' +
        '<g class="qq-m-limb qq-m-limb-r">' +
          '<rect class="qq-m-leg"  x="38.8" y="43" width="4" height="9"/>' +
          '<rect class="qq-m-foot" x="35.4" y="50.5" width="13" height="7.2" rx="3.6"/>' +
        '</g>' +
        '<circle class="qq-m-body" cx="32" cy="27" r="21"/>' +
        '<circle class="qq-m-ring" cx="32" cy="27" r="16.4"/>' +
        /* sheen and bevel: two arcs on the same r=18 circle, opposite ends.
         * They hug the rim, so they read as a lit edge and a shaded one
         * rather than as marks floating on the face. */
        '<path class="qq-m-sheen" d="M14.6 22.3 A18 18 0 0 1 27.3 9.6"/>' +
        '<path class="qq-m-bevel" d="M48.9 33.2 A18 18 0 0 1 28.9 44.7"/>' +
        /* eyes: the outer group blinks (scaleY), the inner one looks
         * (translate). Two elements so the two never fight for transform. */
        '<g class="qq-m-eye qq-m-eye-l">' +
          '<g class="qq-m-look">' +
            '<circle class="qq-m-eyeball" cx="25" cy="25" r="6"/>' +
            '<circle class="qq-m-glint" cx="27.1" cy="22.7" r="2"/>' +
          '</g>' +
        '</g>' +
        '<g class="qq-m-eye qq-m-eye-r">' +
          '<g class="qq-m-look">' +
            '<circle class="qq-m-eyeball" cx="39" cy="25" r="6"/>' +
            '<circle class="qq-m-glint" cx="41.1" cy="22.7" r="2"/>' +
          '</g>' +
        '</g>' +
        /* three mouths, one visible at a time — swapped by class, never by
         * rewriting a path, so a mood change costs nothing */
        '<path class="qq-m-mouth qq-m-mouth-smile" d="M27.4 32.6q4.6 4.2 9.2 0"/>' +
        '<path class="qq-m-mouth qq-m-mouth-soft"  d="M27.6 34q4.4 2.2 8.8 0"/>' +
        '<path class="qq-m-mouth-open" d="M26.8 31.8q5.2 1.9 10.4 0q-1 7-5.2 7t-5.2-7z"/>' +
      '</g>' +
    '</svg>';

  /* ------------------------------------------------------------- state */
  var root = null;          // .qq-mascot — owns travel only
  var gait = null;          // .qq-m-gait — owns the walk rhythm / breathing
  var fx = null;            // .qq-m-fx   — owns reactions
  var sparks = null;
  var bubbleWrap = null, bubble = null;
  var pathHost = null;

  var mode = '';            // 'road' | 'corner' | 'off'
  var stageClass = '';      // extra class for the corner (lesson / done / hearts)
  var doorAbort = false;    // the screen moved on while the door was still shutting
  var pos = null;           // { x, y } in pathHost coordinates, road mode only
  var atKey = null;         // which node it is standing at, e.g. 'n:l1'
  var travel = null;        // the Web Animation in flight, or null
  var entering = false;     // mid-door, so nothing else may move it

  var T = {};               // named timers, so each kind cancels its own kind
  var lastLine = {};        // per-bucket last index, so a line never repeats
  var roadNudgeArmed = false;
  var greetPending = false; // first thing a new visitor sees: say hello
  var stepOutPending = false; // come out of the node's door onto the road

  function reduced() {
    try {
      return !!(global.matchMedia &&
                global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  function timer(name, fn, ms) {
    clearTimeout(T[name]);
    T[name] = setTimeout(fn, ms);
  }
  function stop(name) { clearTimeout(T[name]); T[name] = 0; }

  /* ------------------------------------------------------------- lines */
  /* Short, and rationed. A line on every interaction is noise; a line
   * every third or fourth one is a character. Wrong answers get the
   * warmest ones — nobody needs a mascot to tell them they were wrong,
   * the feedback panel already did that. */
  var LINES = {
    correct:   ['Nice one.', 'That is the one.', 'You saw it.', 'Clean.',
                'Sharp.', 'Straight through.'],
    wrong:     ['Happens to everyone.', 'Now you know it.', 'That one is sneaky.',
                'Still standing.', 'Good one to miss.', 'Worth getting wrong.'],
    celebrate: ['Whole lesson down.', 'That is a wrap.', 'Look at you go.',
                'Road just got shorter.'],
    unit:      ['A whole unit. Big.', 'That is a unit gone.'],
    streak:    ['Streak is alive.', 'Back again. Good.'],
    goal:      ['Daily goal, met.', 'Today is done.'],
    nudge:     ['Take your time.', 'Look at the picture.', 'No rush at all.',
                'Have a guess.'],
    road:      ['This one next.', 'Ready when you are.', 'Start right here.'],
    hearts:    ['Hearts cost nothing.', 'Go again, no charge.'],
    end:       ['More is being written.', 'That is the road, for now.'],
    /* the very first words anybody reads here. No welcome, no pitch, no
     * "let's get started" — just permission to guess. */
    greet:     ['Hello. Have a guess.', 'No score yet.', 'Just pick one.',
                'Nothing to lose here.'],
    /* and the first words on the road, which is now the second thing they
     * see rather than the first */
    stepout:   ['That is the road.', 'One down already.', 'Here is the map.']
  };

  function line(bucket) {
    var list = LINES[bucket];
    if (!list || !list.length) return null;
    var i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === lastLine[bucket]) i = (i + 1) % list.length;
    lastLine[bucket] = i;
    return list[i];
  }

  function say(bucket, ms) {
    var text = line(bucket);
    if (!text || !bubble) return;
    bubble.textContent = text;
    bubbleWrap.classList.add('on');
    timer('bubble', function () { bubbleWrap.classList.remove('on'); }, ms || 2300);
  }

  function maybeSay(bucket, chance) {
    if (Math.random() < chance) say(bucket);
  }

  /* -------------------------------------------------------------- build */
  function build() {
    root = doc.createElement('div');
    root.className = 'qq-mascot';
    root.setAttribute('aria-hidden', 'true');

    bubbleWrap = doc.createElement('div');
    bubbleWrap.className = 'qq-bubble-wrap';
    bubble = doc.createElement('div');
    bubble.className = 'qq-bubble';
    bubbleWrap.appendChild(bubble);
    root.appendChild(bubbleWrap);

    gait = doc.createElement('div');
    gait.className = 'qq-m-gait';
    fx = doc.createElement('div');
    fx.className = 'qq-m-fx';
    fx.innerHTML = SVG;
    gait.appendChild(fx);
    root.appendChild(gait);

    /* six sparks, built here and only here. A reaction adds a class. */
    sparks = doc.createElement('div');
    sparks.className = 'qq-m-sparks';
    for (var i = 0; i < 6; i++) {
      var bit = doc.createElement('i');
      var ang = (i / 6) * Math.PI * 2 - 0.5;
      var reach = 30 + (i % 3) * 9;
      bit.style.setProperty('--tx', (Math.cos(ang) * reach).toFixed(1) + 'px');
      bit.style.setProperty('--ty', (Math.sin(ang) * reach - 6).toFixed(1) + 'px');
      bit.style.animationDelay = (i * 26) + 'ms';
      sparks.appendChild(bit);
    }
    root.appendChild(sparks);

    if (reduced()) root.classList.add('calm');
    scheduleBlink();
    scheduleGlance();
  }

  /* ------------------------------------------------------------- idling */
  function scheduleBlink() {
    if (reduced()) return;
    timer('blink', function () {
      if (!doc.hidden && root) {
        root.classList.add('blink');
        setTimeout(function () { if (root) root.classList.remove('blink'); }, 130);
        /* one in four is a double blink, which is what stops it reading
         * like a metronome */
        if (Math.random() < 0.25) {
          setTimeout(function () { if (root) root.classList.add('blink'); }, 260);
          setTimeout(function () { if (root) root.classList.remove('blink'); }, 380);
        }
      }
      scheduleBlink();
    }, 2400 + Math.random() * 4200);
  }

  function look(x, y, ms) {
    if (!root) return;
    root.style.setProperty('--lx', (x || 0) + 'px');
    root.style.setProperty('--ly', (y || 0) + 'px');
    if (ms) timer('look', function () { look(0, 0); }, ms);
  }

  function scheduleGlance() {
    if (reduced()) return;
    timer('glance', function () {
      if (!doc.hidden && root && !root.classList.contains('walking')) {
        var dx = (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 1.2);
        look(dx, Math.random() < 0.4 ? -1 : 0.6, 900 + Math.random() * 700);
      }
      scheduleGlance();
    }, 4200 + Math.random() * 5200);
  }

  /* ---------------------------------------------------------- reactions */
  function playFx(name, ms) {
    if (!fx || reduced()) return;
    fx.classList.remove('fx-cheer', 'fx-soft', 'fx-party', 'fx-hop', 'fx-in', 'fx-out');
    void fx.offsetWidth;                       // one restart, once per reaction
    fx.classList.add(name);
    timer('fx', function () { if (fx) fx.classList.remove(name); }, ms);
  }

  function mood(name, ms) {
    if (!root) return;
    root.classList.remove('mood-open', 'mood-soft');
    if (name) root.classList.add(name);
    if (ms) timer('mood', function () { mood(null); }, ms);
  }

  function burst(kind) {
    if (!sparks || reduced()) return;
    sparks.classList.remove('pop', 'gold');
    void sparks.offsetWidth;
    if (kind === 'gold') sparks.classList.add('gold');
    sparks.classList.add('pop');
    timer('sparks', function () { if (sparks) sparks.classList.remove('pop'); }, 800);
  }

  /* -------------------------------------------------------- positioning */
  /* Where the mascot belongs RIGHT NOW, read off the road itself. This is
   * the only source of truth: whatever `renderPath` decided is current, is
   * where the character stands. */
  function target() {
    if (!pathHost) return null;
    var hostRect = pathHost.getBoundingClientRect();
    var node = pathHost.querySelector('.node.current');
    var key, rect, dx;

    if (node) {
      key = 'n:' + node.parentNode.getAttribute('data-lesson');
      rect = node.getBoundingClientRect();
      dx = -58;                       // stands to the left, clear of the label
    } else {
      /* nothing current: the road has run out. It waits at the ghost node
       * past the end, which is the honest place to be. */
      node = pathHost.querySelector('.road-more .ghost');
      if (!node) return null;
      key = '@end';
      rect = node.getBoundingClientRect();
      dx = -48;
    }
    if (!rect.width) return null;      // laid out but not visible: do nothing

    var cx = rect.left - hostRect.left + rect.width / 2;
    var cy = rect.top - hostRect.top + rect.height / 2;
    var x = cx + dx;
    if (x < 24) x = cx - dx;           // never walk off the left of the road
    return { key: key, x: x, y: cy + 4, cx: cx, cy: cy, node: node };
  }

  function applyPos(p) {
    root.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0)';
  }

  function currentXY() {
    /* only ever read when a walk is cut short — never inside a frame */
    try {
      var m = new global.DOMMatrixReadOnly(getComputedStyle(root).transform);
      if (m.m41 || m.m42) return { x: m.m41, y: m.m42 };
    } catch (e) {}
    return pos;
  }

  function cancelTravel(land) {
    if (!travel) return;
    var t = travel;
    travel = null;
    try { t.cancel(); } catch (e) {}
    root.classList.remove('walking');
    if (land) { pos = land; applyPos(land); }
  }

  /* The walk. One animation, on one element, through waypoints spaced by
   * real distance so the pace never lurches. */
  function walkTo(p, delay) {
    /* Nobody is looking. A hidden tab freezes animation timelines, so a walk
     * started now would sit at its first frame — and because that frame is
     * held by `fill: backwards`, it would override the resting position and
     * pin the character at the node it was leaving. Arriving without the
     * journey is both correct and the only safe thing here: the walk exists
     * to be watched, and there is nothing to watch. */
    if (doc.hidden) {
      cancelTravel(null);
      pos = p; atKey = p.key; applyPos(p);
      return;
    }
    var from = pos || { x: p.x, y: p.y };
    var pts = [from];
    var dx = p.x - from.x, dy = p.y - from.y;

    /* A long drop means a unit boundary sits in between, with a banner in
     * the way. Walk down out of the old unit, across, and down into the
     * new one rather than straight through the heading. */
    if (Math.abs(dy) > 200) {
      pts.push({ x: from.x, y: from.y + (dy > 0 ? 54 : -54) });
      pts.push({ x: p.x, y: p.y - (dy > 0 ? 54 : -54) });
    }
    pts.push({ x: p.x, y: p.y });

    var total = 0, segs = [], i;
    for (i = 1; i < pts.length; i++) {
      var d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segs.push(d); total += d;
    }
    if (total < 3) { pos = p; applyPos(p); atKey = p.key; return; }

    var frames = [], run = 0;
    for (i = 0; i < pts.length; i++) {
      if (i > 0) run += segs[i - 1];
      frames.push({
        transform: 'translate3d(' + pts[i].x.toFixed(1) + 'px,' + pts[i].y.toFixed(1) + 'px,0)',
        offset: total ? Math.min(1, run / total) : (i ? 1 : 0)
      });
    }

    var ms = Math.max(480, Math.min(1700, total / 0.165));
    applyPos(p);                                  // the resting truth is the end
    pos = p; atKey = p.key;

    root.classList.add('walking');
    look(dx > 4 ? 2 : (dx < -4 ? -2 : 0), 0.4);

    travel = root.animate(frames, {
      duration: ms, delay: delay || 0, easing: 'cubic-bezier(.42,.05,.42,1)', fill: 'backwards'
    });

    /* the glance back over its shoulder, near the end of a long walk */
    if (total > 90) {
      timer('glanceback', function () {
        look(dx > 0 ? -2.2 : 2.2, -0.6, 520);
      }, (delay || 0) + ms * 0.62);
    }

    travel.onfinish = function () {
      travel = null;
      root.classList.remove('walking');
      look(0, 0);
      playFx('fx-hop', 420);
    };
    travel.oncancel = function () { travel = null; };
  }

  /* ---------------------------------------------------------- the door */
  /* The node grows a two-leaf door, it opens, the mascot steps through and
   * it shuts. The shutting is the screen change. */
  function makePortal(node) {
    var p = doc.createElement('span');
    p.className = 'qq-portal';
    p.innerHTML = '<span class="qq-portal-in"></span>' +
                  '<span class="qq-leaf qq-leaf-l"></span>' +
                  '<span class="qq-leaf qq-leaf-r"></span>';
    node.appendChild(p);
    return p;
  }

  function enter(lessonId, proceed) {
    var holder = pathHost && pathHost.querySelector('.node-holder[data-lesson="' + lessonId + '"]');
    var node = holder && holder.querySelector('.node');
    if (!node || mode !== 'road' || reduced() || entering) { proceed(); return; }

    entering = true;
    doorAbort = false;
    cancelTravel(null);
    stop('nudge'); stop('glanceback');
    bubbleWrap.classList.remove('on');

    var hostRect = pathHost.getBoundingClientRect();
    var rect = node.getBoundingClientRect();
    var cx = rect.left - hostRect.left + rect.width / 2;
    var cy = rect.top - hostRect.top + rect.height / 2;

    var portal = makePortal(node);
    var stepIn = null;
    var doorPos = { x: cx, y: cy + 6, key: 'n:' + lessonId };

    // the door appears shut, then parts
    requestAnimationFrame(function () {
      portal.classList.add('on');
      requestAnimationFrame(function () { portal.classList.add('open'); });
    });

    // ...while the mascot steps across to it
    root.classList.add('walking');
    var walkIn = root.animate([
      { transform: root.style.transform || 'translate3d(0,0,0)' },
      { transform: 'translate3d(' + cx.toFixed(1) + 'px,' + (cy + 6).toFixed(1) + 'px,0)' }
    ], { duration: 280, easing: 'ease-in-out', fill: 'backwards' });
    applyPos(doorPos);
    pos = doorPos; atKey = doorPos.key;
    look(2, 0);

    timer('door1', function () {
      root.classList.remove('walking');
      look(0, -1);
      fx.classList.add('fx-in');                       // shrink into the doorway
      /* Kept, because it must be cancelled. This one fills FORWARDS, so once
       * it has finished it goes on overriding the inline transform for ever —
       * a mascot pinned to the door it walked through no matter what the road
       * says afterwards. It used to get away with it only because the next
       * walk's animation replaced it; the moment a walk is skipped (a hidden
       * tab, reduced motion) the character was stranded at the old node. */
      stepIn = root.animate([
        { transform: 'translate3d(' + cx.toFixed(1) + 'px,' + (cy + 6).toFixed(1) + 'px,0)' },
        { transform: 'translate3d(' + cx.toFixed(1) + 'px,' + (cy - 2).toFixed(1) + 'px,0)' }
      ], { duration: 240, easing: 'ease-in', fill: 'forwards' });
    }, 250);

    timer('door2', function () {
      portal.classList.remove('open');                 // it shuts behind you
      node.classList.add('qq-thunk');
    }, 520);

    timer('door3', function () {
      entering = false;
      fx.classList.remove('fx-in');
      node.classList.remove('qq-thunk');
      if (portal.parentNode) portal.parentNode.removeChild(portal);
      if (walkIn) { try { walkIn.cancel(); } catch (e) {} }
      if (stepIn) { try { stepIn.cancel(); } catch (e) {} stepIn = null; }
      /* If anything moved the screen on while the door was shutting — a
       * second tap, a sync, the player going somewhere else — then this
       * lesson is no longer what they asked for, and opening it now would
       * yank them out of wherever they actually are. Tidy up and put the
       * character back where the road says it belongs instead. */
      if (doorAbort) { doorAbort = false; sync(false); return; }
      proceed();
    }, 720);
  }

  /* --------------------------------------------------------- the modes */
  function toRoad() {
    pathHost = doc.getElementById('pathHost');
    if (!pathHost) return;
    mode = 'road';
    root.className = 'qq-mascot on' + (reduced() ? ' calm' : '');
    if (root.parentNode !== pathHost) pathHost.appendChild(root);
    /* A step-out is measured against the road that is about to be drawn, not
     * the one still on screen — so leave the placing to pathRendered. */
    if (!stepOutPending) sync(false);
  }

  /* Coming back OUT of the door, onto a road the player has not seen yet.
   * It appears in the middle of the node it was just inside, swells out of
   * the doorway, and steps across to where it stands. The first thing on
   * the road that moves is the character, and the node it walks away from
   * is the one with their answer on it. */
  function stepOut() {
    var p = target();
    if (!p) { stepOutPending = false; return; }
    if (reduced()) {                       // no theatre: just be there
      stepOutPending = false;
      cancelTravel(null);
      pos = p; atKey = p.key; applyPos(p);
      return;
    }
    cancelTravel(null);
    var doorway = { x: p.cx, y: p.cy, key: p.key };
    pos = doorway; atKey = p.key; applyPos(doorway);

    playFx('fx-out', 340);
    timer('stepout', function () {
      stepOutPending = false;
      if (mode !== 'road') return;
      var q = target() || p;               // re-derive: the road may have scrolled
      walkTo(q, 0);
      say('stepout');
    }, 300);
  }

  function toCorner(stage) {
    if (root.parentNode !== doc.body) doc.body.appendChild(root);
    mode = 'corner';
    stageClass = stage;
    root.className = 'qq-mascot on corner ' + stage + (reduced() ? ' calm' : '');
    /* The perch is a fixed spot in the answer bar now, so there is nothing
     * to compute — CSS owns it and it cannot drift when the bar resizes. */
    root.style.transform = 'translate3d(0,0,0)';
  }

  function off() {
    mode = 'off';
    root.className = 'qq-mascot' + (reduced() ? ' calm' : '');
    bubbleWrap.classList.remove('on');
    stop('nudge');
  }

  /* ------------------------------------------------------------- sync */
  /* Called every time the road is redrawn. Works out where the mascot
   * should be and either walks it there or simply puts it there. */
  function sync(allowWalk) {
    if (mode !== 'road' || entering) return;
    var p = target();
    if (!p) return;

    if (!pos || atKey === null) {                     // cold: just be there
      cancelTravel(null);
      pos = p; atKey = p.key; applyPos(p);
    } else if (p.key !== atKey || Math.hypot(p.x - pos.x, p.y - pos.y) > 6) {
      var far = p.key !== atKey;
      cancelTravel(travel ? currentXY() : null);
      if (reduced() || !allowWalk && !far) {
        pos = p; atKey = p.key; applyPos(p);
      } else {
        /* a beat of delay so the level-up gets to stamp the old node and
         * ink the road before the character sets off along it */
        walkTo(p, far && allowWalk ? 340 : 0);
      }
    } else {
      applyPos(p);
    }

    mood(p.key === '@end' ? 'mood-soft' : null);
    if (p.key === '@end') look(0, -1.4);

    // one gentle "start here" if the road is just sat on
    stop('nudge');
    if (!reduced() && roadNudgeArmed) {
      timer('nudge', function () {
        if (mode !== 'road' || doc.hidden) return;
        roadNudgeArmed = false;
        playFx('fx-hop', 620);
        say(atKey === '@end' ? 'end' : 'road');
      }, 26000);
    }
  }

  /* --------------------------------------------------------- public API */
  var API = {
    /* the road has just been rebuilt: re-attach and re-derive */
    pathRendered: function () {
      if (!root) return;
      if (mode !== 'road') return;
      pathHost = doc.getElementById('pathHost');
      if (!pathHost) return;
      if (root.parentNode !== pathHost) pathHost.appendChild(root);
      /* Place it NOW if it has never been placed. The frame below is the one
       * that normally does the work, but requestAnimationFrame does not run
       * in a background tab — and without this, a road first drawn while the
       * tab was hidden left the mascot parked at the top-left corner until
       * the player came back and something else moved it. A cold placement
       * never walks anyway, so nothing is lost by doing it early. */
      if (!pos && !stepOutPending) sync(false);
      /* the road is laid out by the time this runs, but the scroll that
       * follows it is not — one frame of settle before measuring */
      requestAnimationFrame(function () {
        if (stepOutPending) stepOut(); else sync(true);
      });
    },

    /* Everything this file decides from, in one object. There is a lot of
     * state here and none of it is visible in the DOM, so without this the
     * only way to debug a mascot standing in the wrong place is to guess. */
    _state: function () {
      return {
        mode: mode, entering: entering, atKey: atKey,
        pos: pos ? { x: Math.round(pos.x), y: Math.round(pos.y) } : null,
        travelling: !!travel, stepOutPending: stepOutPending,
        greetPending: greetPending, reduced: reduced(),
        walkingClass: !!(root && root.classList.contains('walking')),
        hasPathHost: !!pathHost,
        hasCurrentNode: !!(pathHost && pathHost.querySelector('.node.current')),
        target: (function () { try { return target(); } catch (e) { return 'threw: ' + e.message; } })()
      };
    },

    /* the opening question is about to appear and it is this visitor's very
     * first screen — be in the corner already, and say hello */
    greetOnNextLesson: function () { greetPending = true; },

    /* the next time the road is drawn, come out of the current node's door
     * and walk clear of it, instead of simply being there */
    stepOutOnNextRoad: function () { stepOutPending = true; },

    screen: function (name) {
      if (!root) return;
      /* A screen change that arrives while the door is still shutting is
       * somebody overtaking it. Mark it, and the door will stand down rather
       * than deliver the player somewhere they have already left. */
      if (entering) doorAbort = true;
      stop('bubble');
      bubbleWrap.classList.remove('on');
      if (name === 'path') {
        roadNudgeArmed = true;
        toRoad();
        requestAnimationFrame(function () { sync(true); });
      } else if (name === 'lesson') {
        toCorner('stage-lesson');
        /* A first-ever visitor lands here, not on the road, so this corner is
         * the introduction. A beat of delay so it arrives after the question
         * has settled rather than competing with it for the first look. */
        if (greetPending) {
          greetPending = false;
          if (!reduced()) {
            timer('greet', function () {
              if (mode !== 'corner' || doc.hidden) return;
              playFx('fx-hop', 620);
              say('greet', 3200);
            }, 900);
          }
        }
      } else if (name === 'done') {
        toCorner('stage-done');
      } else if (name === 'hearts') {
        toCorner('stage-mid');
        mood('mood-soft', 4000);
        say('hearts');
      } else {
        off();                       // the wall and the shop are not its business
      }
    },

    /* tapping a lesson node: walk in through the door, then carry on */
    enter: function (lessonId, proceed) {
      if (!root) { proceed(); return; }
      try { enter(lessonId, proceed); }
      catch (e) { entering = false; proceed(); }
    },

    /* a new question is on screen */
    question: function () {
      if (!root) return;
      mood(null);
      stop('nudge');
      if (reduced()) return;
      timer('nudge', function () {
        if (mode !== 'corner' || doc.hidden) return;
        playFx('fx-hop', 620);
        say('nudge');
        look(0, 1.6, 1800);
      }, 24000);
    },

    react: function (kind, opts) {
      if (!root) return;
      opts = opts || {};
      stop('nudge');
      if (kind === 'correct') {
        mood('mood-open', 1500);
        playFx('fx-cheer', 900);
        burst(opts.firstTry ? 'gold' : null);
        maybeSay('correct', 0.4);
      } else if (kind === 'wrong') {
        /* sympathetic, and that is all. It tilts, it does not droop, it
         * does not cover its eyes, and it never says "oh dear". */
        mood('mood-soft', 2600);
        playFx('fx-soft', 1200);
        look(0, 1.2, 1600);
        maybeSay('wrong', 0.55);
      } else if (kind === 'celebrate') {
        mood('mood-open', 2600);
        playFx('fx-party', 1600);
        burst('gold');
        setTimeout(function () { burst('gold'); }, 520);
        say(opts.unitCleared ? 'unit' : 'celebrate', 2800);
        if (opts.goalMet || opts.streakUp) {
          setTimeout(function () {
            burst('gold');
            say(opts.goalMet ? 'goal' : 'streak', 2400);
          }, 3000);
        }
      }
    }
  };

  function boot() {
    if (root) return;
    build();
    doc.body.appendChild(root);
    /* The answer-bar button only gives up its 54px when there is actually a
     * character standing there — if this file fails to load, the lesson
     * screen is exactly what it was before. */
    doc.body.classList.add('qq-has-mascot');
    off();
    try {
      var mq = global.matchMedia('(prefers-reduced-motion: reduce)');
      var onMq = function () {
        root.classList.toggle('calm', reduced());
        if (!reduced()) { scheduleBlink(); scheduleGlance(); }
      };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
    } catch (e) {}
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.QQMascot = API;
})(window);
