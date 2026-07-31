/* QQ visuals, part two — the statistics and shape set.
 *
 * Same contract and same house rule as js/viz.js: animate the thing, never draw
 * the formula. Loads after viz.js and only ever calls QQViz.register, so the
 * canvas plumbing lives in exactly one place.
 *
 *   hospitalBirths  small samples swing, big ones don't
 *   dragOutlier     mean runs away, median crawls
 *   screenDots      a rare disease against a good test
 *   twentyTests     twenty useless experiments, one false alarm
 *   planeArmour     survivorship bias, as a tap question
 *   pizzaCompare    width is sold, area is eaten
 *   ropeGap         the gap that ignores the planet
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f;
  var clamp = K.clamp;
  var lerp = K.lerp;
  var easeOut = K.easeOut;
  var roundRect = K.roundRect;

  /* ------------------------------------------------------ 1. two hospitals */
  global.QQViz.register('hospitalBirths', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Nothing run yet.');
    var stage = K.Stage(host, 0.82);
    var LO = 10, HI = 90;               // per cent boys, the visible axis
    var lanes = [
      { name: '100 babies a day', n: 100, colour: C.accent, bins: {}, over: 0 },
      { name: '15 babies a day', n: 15, colour: C.gold, bins: {}, over: 0 }
    ];
    var days = 0, queue = [];

    function oneDay(n) {
      // every baby is its own fair coin; nothing here is weighted
      var boys = 0;
      for (var i = 0; i < n; i++) if (Math.random() < 0.5) boys++;
      return boys;
    }
    function runDays(count) {
      for (var d = 0; d < count; d++) queue.push([oneDay(lanes[0].n), oneDay(lanes[1].n)]);
      api.onInteract('run');
    }
    function render() {
      if (!days) { out.textContent = 'Nothing run yet.'; return; }
      out.innerHTML = '<b>' + days + '</b> days each &nbsp;·&nbsp; ' +
        '<span class="tag-a">big ' + lanes[0].over + '</span> &nbsp;·&nbsp; ' +
        '<span class="tag-b">small ' + lanes[1].over + '</span> &nbsp; days over 60% boys';
    }
    K.button(ctr, 'Run 200 days', function () { runDays(200); }).classList.add('primary');
    K.button(ctr, 'Reset', function () {
      lanes.forEach(function (L) { L.bins = {}; L.over = 0; });
      days = 0; queue = []; render();
      api.onInteract('reset');
    }).classList.add('small');

    stage.draw = function (g, w, h) {
      // drip the days in a few at a time, so the clouds grow rather than appear
      var step = Math.min(queue.length, 4);
      for (var s = 0; s < step; s++) {
        var day = queue.shift();
        for (var li = 0; li < 2; li++) {
          var L = lanes[li], k = day[li];
          L.bins[k] = (L.bins[k] || 0) + 1;
          if (100 * k / L.n > 60) L.over++;
        }
        days++;
      }
      if (step) render();

      var pad = 8, laneH = (h - pad * 2) / 2;
      var x0 = pad + 8, x1 = w - pad - 8;
      function px(pct) { return x0 + (clamp(pct, LO, HI) - LO) / (HI - LO) * (x1 - x0); }

      // one stack unit for both lanes, or the widths would not be comparable
      var maxCount = 1, li2, kk;
      for (li2 = 0; li2 < 2; li2++) for (kk in lanes[li2].bins) if (lanes[li2].bins[kk] > maxCount) maxCount = lanes[li2].bins[kk];
      var stackH = laneH - 46;
      var unit = clamp(stackH / Math.max(maxCount, 16), 1.1, 4.5);

      for (var i = 0; i < 2; i++) {
        var lane = lanes[i], top = pad + i * laneH;
        var axisY = top + laneH - 22, stackTop = top + 18;

        // everything to the right of the line is a day over 60% boys
        g.fillStyle = lane.colour;
        g.globalAlpha = 0.05;
        g.fillRect(px(60), stackTop, x1 - px(60), axisY - stackTop);
        g.globalAlpha = 1;

        g.font = f(11, 700); g.textAlign = 'left';
        g.fillStyle = lane.colour;
        g.fillText(lane.name, x0, top + 12);
        g.textAlign = 'right';
        g.font = f(11, 700);
        g.fillStyle = lane.over ? lane.colour : C.dim;
        g.fillText(lane.over + ' days over 60%', x1, top + 12);

        // axis
        g.strokeStyle = C.line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x0, axisY + 0.5); g.lineTo(x1, axisY + 0.5); g.stroke();
        g.font = f(10, 600); g.fillStyle = C.muted; g.textAlign = 'center';
        [10, 30, 50, 70, 90].forEach(function (v) {
          g.beginPath(); g.moveTo(px(v), axisY); g.lineTo(px(v), axisY + 4); g.stroke();
          g.fillText(v + '%', px(v), axisY + 16);
        });

        // the 60% line
        g.strokeStyle = 'rgba(230,237,243,0.40)'; g.lineWidth = 1; g.setLineDash([3, 3]);
        g.beginPath(); g.moveTo(px(60), axisY); g.lineTo(px(60), stackTop); g.stroke();
        g.setLineDash([]);
        g.fillStyle = 'rgba(230,237,243,0.55)'; g.font = f(10, 700); g.textAlign = 'left';
        g.fillText('60%', px(60) + 3, stackTop + 8);

        // one column per possible number of boys, one dot per day
        var r = Math.max(1.4, Math.min(3.2, (x1 - x0) / (lane.n + 1) * 0.42));
        for (var key in lane.bins) {
          var kv = parseInt(key, 10), cnt = lane.bins[key];
          var pct = 100 * kv / lane.n, cx = px(pct), hot = pct > 60;
          for (var c = 0; c < cnt; c++) {
            var y = axisY - 3 - (c + 0.5) * unit;
            if (y < stackTop) break;
            g.fillStyle = hot ? lane.colour : 'rgba(139,148,158,0.42)';
            g.beginPath(); g.arc(cx, y, hot ? r + 0.5 : r, 0, 7); g.fill();
          }
        }
      }
      /* no caption under the second lane: the axis already reads in per cent and
       * a third line of text at that size collided with the tick labels */
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------------- 2. the billionaire */
  global.QQViz.register('dragOutlier', function (host, api) {
    var out = K.readout(host, 'Drag the last salary as far right as you like.');
    var stage = K.Stage(host, 0.66);
    var base = (api.data && api.data.salaries) || [21, 24, 26, 28, 31, 33, 36, 40, 47];
    var MINV = 15, BREAK = 60, MAXV = 1200;
    var v = 52, target = 52, dragging = false, touched = false;

    function stats() {
      var arr = base.concat([v]);
      arr.sort(function (a, b) { return a - b; });
      var sum = 0;
      for (var i = 0; i < arr.length; i++) sum += arr[i];
      return { mean: sum / arr.length, median: (arr[4] + arr[5]) / 2 };
    }
    function render(s) {
      out.innerHTML = 'mean <span class="tag-b">£' + s.mean.toFixed(1) + 'k</span>' +
        ' &nbsp;·&nbsp; median <span class="tag-a">£' + s.median.toFixed(1) + 'k</span>';
    }

    // the drag has to survive on a phone, so past the cluster the scale is
    // squashed — said out loud on the axis rather than hidden
    function geom(w) {
      var x0 = 16, x1 = w - 16, xm = x0 + (x1 - x0) * 0.58;
      return { x0: x0, x1: x1, xm: xm };
    }
    function toX(val, G) {
      if (val <= BREAK) return G.x0 + (clamp(val, MINV, BREAK) - MINV) / (BREAK - MINV) * (G.xm - G.x0);
      return G.xm + Math.log(val / BREAK) / Math.log(MAXV / BREAK) * (G.x1 - G.xm);
    }
    function toV(x, G) {
      if (x <= G.xm) return MINV + (x - G.x0) / (G.xm - G.x0) * (BREAK - MINV);
      return BREAK * Math.pow(MAXV / BREAK, (x - G.xm) / (G.x1 - G.xm));
    }

    function down(ev) {
      var p = stage.pointer(ev);
      if (p.y > stage.h * 0.40 + 14) return;     // the markers row is not a handle
      dragging = true;
      if (!touched) { touched = true; api.onInteract('drag'); }
      move(ev);
      ev.preventDefault();
    }
    function move(ev) {
      if (!dragging) return;
      var p = stage.pointer(ev);
      target = clamp(toV(p.x, geom(stage.w)), MINV, MAXV);
      ev.preventDefault();
    }
    function up() { dragging = false; }
    stage.canvas.addEventListener('mousedown', down);
    stage.canvas.addEventListener('touchstart', down, { passive: false });
    global.addEventListener('mousemove', move);
    global.addEventListener('touchmove', move, { passive: false });
    global.addEventListener('mouseup', up);
    global.addEventListener('touchend', up);

    stage.draw = function (g, w, h, t) {
      v += (target - v) * 0.28;
      var G = geom(w), s = stats();
      render(s);
      var lineY = h * 0.40, meanY = lineY + 24, medY = lineY + 56;

      // the line, with the squash announced where it happens
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(G.x0, lineY + 0.5); g.lineTo(G.x1, lineY + 0.5); g.stroke();
      g.font = f(10, 600); g.fillStyle = C.muted; g.textAlign = 'center';
      [20, 40, 60, 100, 300, 1000].forEach(function (tick) {
        var x = toX(tick, G);
        g.strokeStyle = C.line;
        g.beginPath(); g.moveTo(x, lineY - 4); g.lineTo(x, lineY); g.stroke();
        g.fillStyle = C.muted;
        g.fillText(tick >= 1000 ? '1m' : tick + 'k', x, lineY - 8);
      });
      g.strokeStyle = C.dim; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(G.xm - 3, lineY + 6); g.lineTo(G.xm + 3, lineY - 2); g.stroke();
      g.beginPath(); g.moveTo(G.xm + 1, lineY + 6); g.lineTo(G.xm + 7, lineY - 2); g.stroke();
      g.fillStyle = C.dim; g.font = f(10, 600); g.textAlign = 'right';
      g.fillText('scale squashed from here →', G.x1, h - 4);

      // the nine people already in the room
      for (var i = 0; i < base.length; i++) {
        g.fillStyle = 'rgba(139,148,158,0.75)';
        g.beginPath(); g.arc(toX(base[i], G), lineY, 4.5, 0, 7); g.fill();
      }
      // and the tenth, the one you can move
      var hx = toX(v, G);
      if (!touched) {
        g.globalAlpha = 0.30 + 0.25 * Math.sin(t * 4);
        g.strokeStyle = C.fg; g.lineWidth = 2;
        g.beginPath(); g.arc(hx, lineY, 16, 0, 7); g.stroke();
        g.globalAlpha = 1;
      }
      g.fillStyle = C.fg;
      g.beginPath(); g.arc(hx, lineY, dragging ? 9 : 7.5, 0, 7); g.fill();
      g.fillStyle = C.muted; g.font = f(10, 700); g.textAlign = 'center';
      g.fillText('£' + v.toFixed(0) + 'k', clamp(hx, G.x0 + 14, G.x1 - 14), lineY - 20);

      // the two summaries, on their own rows so the labels never collide
      function marker(val, y, colour, label) {
        var x = clamp(toX(val, G), G.x0, G.x1);
        g.strokeStyle = colour; g.lineWidth = 1;
        g.globalAlpha = 0.45;
        g.beginPath(); g.moveTo(x, lineY + 2); g.lineTo(x, y - 7); g.stroke();
        g.globalAlpha = 1;
        g.fillStyle = colour;
        g.beginPath();
        g.moveTo(x, y - 7); g.lineTo(x - 5, y); g.lineTo(x + 5, y); g.closePath(); g.fill();
        g.font = f(11, 800); g.textAlign = 'center';
        g.fillText(label + ' £' + val.toFixed(1) + 'k', clamp(x, G.x0 + 40, G.x1 - 40), y + 13);
      }
      marker(s.mean, meanY, C.gold, 'mean');
      marker(s.median, medY, C.accent, 'median');
    };
    return {
      destroy: function () {
        stage.destroy();
        global.removeEventListener('mousemove', move);
        global.removeEventListener('touchmove', move);
        global.removeEventListener('mouseup', up);
        global.removeEventListener('touchend', up);
      }
    };
  });

  /* ------------------------------------------------------ 3. the screening */
  global.QQViz.register('screenDots', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.74);
    var COLS = 40, ROWS = 25, N = 1000;
    var people = [], ill = 0, tested = false, rowMode = false, anim = 0;
    var flagged = [], illFlagged = false;

    function build() {
      people = [];
      ill = Math.floor(Math.random() * N);
      for (var i = 0; i < N; i++) people.push({ ill: i === ill, pos: false, slot: -1 });
      tested = false; rowMode = false; anim = 0; flagged = []; illFlagged = false;
      toggleBtn.textContent = 'Keep only the positives';
      render();
    }
    function test() {
      // 99 in 100 of the ill are caught, 1 in 100 of the healthy are flagged anyway
      flagged = [];
      for (var i = 0; i < N; i++) {
        var p = people[i];
        p.pos = p.ill ? (Math.random() < 0.99) : (Math.random() < 0.01);
        if (p.pos) { p.slot = flagged.length; flagged.push(p); }
      }
      illFlagged = people[ill].pos;
      tested = true;
      render();
    }
    function render() {
      if (!tested) {
        out.innerHTML = '<b>1000</b> people &nbsp;·&nbsp; <span class="tag-b">one of them has it</span>';
        return;
      }
      var msg = '<b>' + flagged.length + '</b> tested positive &nbsp;·&nbsp; ' +
        '<span class="tag-b">' + (illFlagged ? '1' : '0') + ' of them ill</span>';
      // the share is the whole question — it waits until the answer is in
      if (api.locked() && flagged.length) {
        msg += ' &nbsp;·&nbsp; that is <b>' + (100 * (illFlagged ? 1 : 0) / flagged.length).toFixed(0) + '%</b>';
      }
      out.innerHTML = msg;
    }

    K.button(ctr, 'Test everyone', function () { test(); api.onInteract('test'); }).classList.add('primary');
    var toggleBtn = K.button(ctr, 'Keep only the positives', function () {
      if (!tested) test();
      rowMode = !rowMode;
      toggleBtn.textContent = rowMode ? 'Show all 1000 again' : 'Keep only the positives';
      api.onInteract('filter');
    });
    K.button(ctr, 'New 1000', function () { build(); api.onInteract('resample'); }).classList.add('small');
    build();

    stage.draw = function (g, w, h) {
      anim += ((rowMode ? 1 : 0) - anim) * 0.12;
      if (Math.abs(anim - (rowMode ? 1 : 0)) < 0.01) anim = rowMode ? 1 : 0;
      var pad = 8;
      var cell = Math.min((w - pad * 2) / COLS, (h - pad * 2 - 26) / ROWS);
      var r = Math.max(1.5, cell * 0.30);
      var gx = (w - cell * COLS) / 2 + cell / 2, gy = pad + cell / 2;
      var rowY = h * 0.64;
      var fw = Math.min(w - 26, Math.max(1, flagged.length) * 19);

      for (var i = 0; i < N; i++) {
        var p = people[i];
        var col = i % COLS, row = (i / COLS) | 0;
        var x0 = gx + col * cell, y0 = gy + row * cell;
        var x = x0, y = y0, alpha = 1, rad = r;
        if (p.pos) {
          var tx = (w - fw) / 2 + (p.slot + 0.5) * (fw / Math.max(1, flagged.length));
          x = lerp(x0, tx, easeOut(anim)); y = lerp(y0, rowY, easeOut(anim));
          rad = r * (1 + 1.1 * anim);
        } else if (p.ill) {
          alpha = 1 - anim * 0.72;                    // an ill person the test missed stays put
        } else {
          alpha = 1 - anim;
          if (alpha < 0.02) continue;
        }
        g.globalAlpha = p.pos ? 1 : alpha * (p.ill ? 1 : 0.30);
        g.fillStyle = p.ill ? C.gold : (p.pos ? C.accent : C.muted);
        g.beginPath(); g.arc(x, y, p.ill ? rad * 1.5 : rad, 0, 7); g.fill();
        if (p.ill) {
          g.strokeStyle = C.gold; g.lineWidth = 1.2;
          g.beginPath(); g.arc(x, y, rad * 1.5 + 3, 0, 7); g.stroke();
        }
        g.globalAlpha = 1;
      }
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      if (anim > 0.5) {
        g.globalAlpha = (anim - 0.5) * 2;
        g.fillText('everyone the test flagged', w / 2, rowY + 26);
        g.globalAlpha = 1;
      } else if (!tested) {
        g.globalAlpha = 1 - anim * 2;
        g.fillText('the gold dot is the one with the disease', w / 2, h - 6);
        g.globalAlpha = 1;
      }
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------------- 4. twenty dead tests */
  global.QQViz.register('twentyTests', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No experiments run yet.');
    var stage = K.Stage(host, 0.72);
    var NT = 20;
    var strips = [], revealAt = -1e9, runs = 0, alarms = 0, batch = 0, history = [];

    function runBatch() {
      var hits = 0, s = [];
      for (var i = 0; i < NT; i++) {
        var hit = Math.random() < 0.05;    // one in twenty, honestly rolled
        s.push(hit);
        if (hit) hits++;
      }
      strips = s; runs++; alarms += hits; batch = hits;
      history.push(alarms / runs);
      if (history.length > 400) history.shift();
    }
    function render() {
      if (!runs) { out.textContent = 'No experiments run yet.'; return; }
      out.innerHTML = '<b>' + runs + '</b> batches &nbsp;·&nbsp; <b>' + alarms +
        '</b> exciting results in all &nbsp;·&nbsp; <b>' + (alarms / runs).toFixed(2) + '</b> per batch';
    }
    K.button(ctr, 'Run the 20 experiments', function () {
      runBatch(); revealAt = performance.now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Run 50 batches', function () {
      for (var i = 0; i < 50; i++) runBatch();
      revealAt = -1e9; render(); api.onInteract('runmany');
    }).classList.add('small');
    K.button(ctr, 'Reset', function () {
      strips = []; runs = 0; alarms = 0; batch = 0; history = []; render();
      api.onInteract('reset');
    }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 10;
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
      g.fillText('20 experiments, none of them real', pad, 12);

      // the strips, resolving left to right
      var sw = (w - pad * 2) / NT, sy = 20, sh = h * 0.31;
      var shown = clamp((performance.now() - revealAt) / 1000 / 0.028, 0, NT);
      for (var i = 0; i < NT; i++) {
        var x = pad + i * sw;
        var live = strips.length > 0 && i < shown;
        var pop = live ? easeOut(clamp(shown - i, 0, 1)) : 0;
        g.fillStyle = C.panel;
        roundRect(g, x + 1.5, sy, sw - 3, sh, 4); g.fill();
        if (live) {
          g.fillStyle = strips[i] ? C.bad : C.dim;
          var ih = sh * (0.35 + 0.65 * pop);
          roundRect(g, x + 1.5, sy + sh - ih, sw - 3, ih, 4); g.fill();
        }
      }

      // this batch, and the long-run average beside it
      var infoY = sy + sh + 20;
      g.fillStyle = C.muted; g.font = f(11, 600); g.textAlign = 'left';
      g.fillText(runs ? 'this batch: ' + batch : 'press run', pad, infoY);
      g.textAlign = 'right';
      g.fillStyle = runs ? C.fg : C.dim; g.font = f(19, 800);
      g.fillText(runs ? (alarms / runs).toFixed(2) : '—', w - pad, infoY + 3);
      g.fillStyle = C.muted; g.font = f(9.5, 600);
      g.fillText('average per batch', w - pad, infoY + 16);

      // how that average has settled, batch by batch
      var bx = pad + 16, by = infoY + 26, bw = w - pad - bx, bh = h - by - 16;
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.font = f(10, 600); g.textAlign = 'right';
      for (var v = 0; v <= 3; v++) {
        var yy = by + bh - (v / 3) * bh;
        g.beginPath(); g.moveTo(bx, yy + 0.5); g.lineTo(bx + bw, yy + 0.5); g.stroke();
        g.fillStyle = C.dim;
        g.fillText(String(v), bx - 4, yy + 3.5);
      }
      if (history.length) {
        g.beginPath();
        for (var j = 0; j < history.length; j++) {
          var px = bx + (history.length === 1 ? bw : (j / (history.length - 1)) * bw);
          var py = by + bh - clamp(history[j] / 3, 0, 1) * bh;
          if (j === 0) g.moveTo(bx, py); else g.lineTo(px, py);
        }
        g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke();
        var lastY = by + bh - clamp(history[history.length - 1] / 3, 0, 1) * bh;
        g.fillStyle = C.accent;
        g.beginPath(); g.arc(bx + bw, lastY, 3.5, 0, 7); g.fill();
      }
      g.fillStyle = C.dim; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('running average, batch by batch', bx, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------ 5. the bombers */
  global.QQViz.register('planeArmour', function (host, api) {
    var out = K.readout(host, 'Every dot is a hole counted on a plane that came home.');
    var stage = K.Stage(host, 0.92);
    var REG = (api.regions && api.regions.length) ? api.regions : [
      { id: 'wings', label: 'Wings' },
      { id: 'fuselage', label: 'Fuselage' },
      { id: 'tail', label: 'Tail' },
      { id: 'engines', label: 'Engines' }
    ];
    var counts = (api.data && api.data.survivorshipHoles) ||
      { wings: 42, fuselage: 35, tail: 28, engines: 6 };
    var sel = null, selAt = 0, lastTouch = 0;
    var ENG_T = [0.342, 0.665], ENG_TW = 0.115;   // engines along the wing, root to tip

    var chips = K.regionChips(host, REG, function (id) { pick(id); });
    function pick(id) {
      sel = id; selAt = performance.now();
      chips.select(id);
      api.onInteract('tap');
      api.onSelect(id);
    }

    /* every measurement in one place, so the holes cannot drift off the plane */
    function geom(w, h) {
      var cx = w / 2, fw = w * 0.15;
      var G = {
        cx: cx, fw: fw,
        top: h * 0.06, bot: h * 0.94,
        wy0: h * 0.40, wy1: h * 0.545,
        ty0: h * 0.795, ty1: h * 0.90, tHalf: w * 0.23,
        xRoot: cx - fw * 0.35, xTip: w * 0.045,
        engW: w * 0.072, engH: h * 0.075
      };
      G.engX = [lerp(G.xRoot, G.xTip, ENG_T[0]), lerp(G.xRoot, G.xTip, ENG_T[1])];
      G.engY = (G.wy0 + G.wy1) / 2;
      return G;
    }

    /* deterministic scatter: the same plane every time you look at it */
    function rng(seed) {
      var s = seed >>> 0;
      return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }
    var holes = (function () {
      var rnd = rng(20250729), list = [], i, guard;
      for (i = 0; i < (counts.wings || 0); i++) {
        var t, sfr;
        for (guard = 0; guard < 40; guard++) {
          t = 0.04 + rnd() * 0.92; sfr = 0.16 + rnd() * 0.68;
          // keep the wing holes off the engine nacelles; those get counted apart
          if (Math.abs(t - ENG_T[0]) > ENG_TW && Math.abs(t - ENG_T[1]) > ENG_TW) break;
        }
        list.push({ r: 'wings', side: rnd() < 0.5 ? -1 : 1, a: t, b: sfr });
      }
      for (i = 0; i < (counts.fuselage || 0); i++) {
        var yf;
        for (guard = 0; guard < 40; guard++) {
          yf = 0.09 + rnd() * 0.82;
          if (!(yf > 0.36 && yf < 0.60) && !(yf > 0.76 && yf < 0.94)) break;
        }
        list.push({ r: 'fuselage', a: 0.18 + rnd() * 0.64, b: yf });
      }
      for (i = 0; i < (counts.tail || 0); i++) {
        list.push({ r: 'tail', a: 0.05 + rnd() * 0.90, b: 0.18 + rnd() * 0.64 });
      }
      for (i = 0; i < (counts.engines || 0); i++) {
        list.push({ r: 'engines', side: rnd() < 0.5 ? -1 : 1, idx: rnd() < 0.5 ? 0 : 1, a: 0.25 + rnd() * 0.5, b: 0.25 + rnd() * 0.5 });
      }
      return list;
    })();

    function holePos(ho, G, h) {
      if (ho.r === 'wings') {
        var x = G.cx + ho.side * (G.cx - lerp(G.xRoot, G.xTip, ho.a));
        var lead = lerp(G.wy0, G.wy0 + (G.wy1 - G.wy0) * 0.34, ho.a);
        var trail = lerp(G.wy1, G.wy1 - (G.wy1 - G.wy0) * 0.06, ho.a);
        return { x: x, y: lerp(lead, trail, ho.b) };
      }
      if (ho.r === 'fuselage') {
        return { x: G.cx - G.fw / 2 + ho.a * G.fw, y: h * ho.b };
      }
      if (ho.r === 'tail') {
        return { x: G.cx - G.tHalf + ho.a * G.tHalf * 2, y: G.ty0 + ho.b * (G.ty1 - G.ty0) };
      }
      var ex = G.cx + ho.side * (G.cx - G.engX[ho.idx]);
      return { x: ex - G.engW / 2 + ho.a * G.engW, y: G.engY - G.engH / 2 + ho.b * G.engH };
    }

    function wingPath(g, G, side) {
      var tipY0 = G.wy0 + (G.wy1 - G.wy0) * 0.34, tipY1 = G.wy1 - (G.wy1 - G.wy0) * 0.06;
      var xt = G.cx + side * (G.cx - G.xTip), xr = G.cx + side * (G.cx - G.xRoot);
      g.beginPath();
      g.moveTo(xr, G.wy0);
      g.lineTo(xt, tipY0);
      g.lineTo(xt, tipY1);
      g.lineTo(xr, G.wy1);
      g.closePath();
    }
    function regionPath(g, id, G, h, w) {
      var i;
      if (id === 'fuselage') { roundRect(g, G.cx - G.fw / 2, G.top, G.fw, G.bot - G.top, G.fw / 2); return; }
      if (id === 'tail') { roundRect(g, G.cx - G.tHalf, G.ty0, G.tHalf * 2, G.ty1 - G.ty0, 6); return; }
      if (id === 'wings') { wingPath(g, G, -1); wingPath(g, G, 1); return; }
      g.beginPath();
      for (i = 0; i < 4; i++) {
        var side = i < 2 ? -1 : 1, idx = i % 2;
        var ex = G.cx + side * (G.cx - G.engX[idx]);
        roundRect(g, ex - G.engW / 2, G.engY - G.engH / 2, G.engW, G.engH, 5);
      }
    }

    function hit(x, y, G, w, h) {
      var m = 8, i;
      for (i = 0; i < 4; i++) {
        var side = i < 2 ? -1 : 1, idx = i % 2;
        var ex = G.cx + side * (G.cx - G.engX[idx]);
        if (Math.abs(x - ex) < G.engW / 2 + m && Math.abs(y - G.engY) < G.engH / 2 + m) return 'engines';
      }
      if (Math.abs(x - G.cx) < G.tHalf + m && y > G.ty0 - m && y < G.ty1 + m) return 'tail';
      if (Math.abs(x - G.cx) < G.fw / 2 + m && y > G.top && y < G.bot) return 'fuselage';
      if (y > G.wy0 - m && y < G.wy1 + m) return 'wings';
      return null;
    }

    function onTap(ev) {
      // a phone fires touchstart then click; only the first of the pair counts
      var now = performance.now();
      if (ev.type === 'touchstart') lastTouch = now;
      else if (now - lastTouch < 600) return;
      var p = stage.pointer(ev);
      var id = hit(p.x, p.y, geom(stage.w, stage.h), stage.w, stage.h);
      if (id) { pick(id); ev.preventDefault(); }
    }
    stage.canvas.addEventListener('click', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      var G = geom(w, h), i;

      // the aeroplane, from the top, out of plain shapes
      g.fillStyle = '#1c232c';
      g.strokeStyle = C.line; g.lineWidth = 1.5;
      wingPath(g, G, -1); g.fill(); g.stroke();
      wingPath(g, G, 1); g.fill(); g.stroke();
      roundRect(g, G.cx - G.tHalf, G.ty0, G.tHalf * 2, G.ty1 - G.ty0, 6); g.fill(); g.stroke();
      roundRect(g, G.cx - G.fw / 2, G.top, G.fw, G.bot - G.top, G.fw / 2); g.fill(); g.stroke();
      g.fillStyle = '#222a35';
      for (i = 0; i < 4; i++) {
        var side = i < 2 ? -1 : 1, idx = i % 2;
        var ex = G.cx + side * (G.cx - G.engX[idx]);
        roundRect(g, ex - G.engW / 2, G.engY - G.engH / 2, G.engW, G.engH, 5);
        g.fill(); g.stroke();
      }
      // cockpit, so the nose reads as the front
      g.fillStyle = 'rgba(139,148,158,0.18)';
      g.beginPath();
      g.ellipse(G.cx, G.top + G.fw * 0.75, G.fw * 0.28, G.fw * 0.45, 0, 0, 7);
      g.fill();

      // every region is quietly outlined, so it is clear they can be tapped
      g.strokeStyle = 'rgba(139,148,158,0.20)'; g.lineWidth = 1;
      for (i = 0; i < REG.length; i++) { regionPath(g, REG[i].id, G, h, w); g.stroke(); }

      // the holes the returning planes were carrying
      for (i = 0; i < holes.length; i++) {
        var p = holePos(holes[i], G, h);
        g.fillStyle = C.bg;
        g.beginPath(); g.arc(p.x, p.y, 2.7, 0, 7); g.fill();
        g.strokeStyle = 'rgba(230,237,243,0.32)'; g.lineWidth = 1;
        g.beginPath(); g.arc(p.x, p.y, 3.6, 0, 7); g.stroke();
      }

      // the pick
      if (sel) {
        var pulse = 0.55 + 0.45 * easeOut(clamp((performance.now() - selAt) / 320, 0, 1));
        g.strokeStyle = C.accent; g.lineWidth = 2.5;
        g.globalAlpha = pulse;
        regionPath(g, sel, G, h, w); g.stroke();
        g.globalAlpha = 0.10 * pulse;
        regionPath(g, sel, G, h, w); g.fillStyle = C.accent; g.fill();
        g.globalAlpha = 1;
      }

      // counts are held back until the answer is in
      if (api.locked()) {
        g.font = f(12, 800); g.textAlign = 'center';
        g.fillStyle = C.fg;
        g.fillText(String(counts.wings), G.cx - (G.cx - G.xTip) * 0.72, G.wy0 - 8);
        g.fillText(String(counts.fuselage), G.cx, G.top - 0 + (G.bot - G.top) * 0.68);
        g.fillText(String(counts.tail), G.cx + G.tHalf + 14, G.ty1 - 2);
        g.fillText(String(counts.engines), G.cx + (G.cx - G.engX[1]) + G.engW, G.engY - G.engH * 0.75);
      }
    };
    return {
      destroy: function () {
        stage.canvas.removeEventListener('click', onTap);
        stage.canvas.removeEventListener('touchstart', onTap);
        stage.destroy();
      }
    };
  });

  /* --------------------------------------------------------- 6. the pizza */
  global.QQViz.register('pizzaCompare', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.84);
    var SMALL = 8;
    var d = 10, target = 10;             // starts short of 12: you have to go and find it

    K.slider(ctr, { min: 6, max: 16, step: 0.5, value: 10, label: 'diameter of the big pizza in inches' },
      function (v) { target = v; api.onInteract('slider'); });

    function areaOf(dia) { return Math.PI * dia * dia / 4; }
    function render() {
      out.innerHTML = 'one <span class="tag-a">' + d.toFixed(1) + '-inch = ' + areaOf(d).toFixed(0) +
        ' sq in</span> vs two <span class="tag-b">8-inch = ' + (2 * areaOf(SMALL)).toFixed(0) + ' sq in</span>';
    }
    render();

    stage.draw = function (g, w, h) {
      d += (target - d) * 0.22;
      render();
      var one = areaOf(d), two = 2 * areaOf(SMALL);
      var pad = 10, topY = 18, circH = h * 0.66;
      var s = Math.min((w / 2 - pad * 2) / 16, circH / 16);   // px per inch, one scale for both
      var midY = topY + circH / 2;
      var lx = w * 0.25, rx = w * 0.75;

      // the divider, so the two offers read as a choice
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(w / 2, topY - 6); g.lineTo(w / 2, h - 8); g.stroke();
      g.fillStyle = C.bg;
      g.fillRect(w / 2 - 11, midY - 9, 22, 18);
      g.fillStyle = C.muted; g.font = f(11, 700); g.textAlign = 'center';
      g.fillText('or', w / 2, midY + 4);

      function pizza(cx, cy, dia, colour) {
        var r = dia * s / 2;
        g.fillStyle = colour; g.globalAlpha = 0.20;
        g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = colour; g.lineWidth = 2;
        g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
        g.fillStyle = C.fg; g.font = f(Math.max(10, Math.min(14, r * 0.34)), 800);
        g.textAlign = 'center';
        g.fillText(areaOf(dia).toFixed(0), cx, cy + 4);
      }
      pizza(lx, midY, d, C.accent);
      var off = SMALL * s / 2 + 2;
      pizza(rx - off, midY, SMALL, C.gold);
      pizza(rx + off, midY, SMALL, C.gold);

      g.fillStyle = C.muted; g.font = f(11, 700); g.textAlign = 'center';
      var labY = topY + circH + 12;
      g.fillText(d.toFixed(1) + ' inch across', lx, labY);
      g.fillText('8 inch, twice over', rx, labY);

      // the bars turn the two numbers into one glance
      var barY = labY + 12, barH = 14, maxA = areaOf(16);
      function bar(cx, val, lead) {
        var full = w / 2 - pad * 2.5, x0 = cx - full / 2;
        g.fillStyle = C.panel;
        roundRect(g, x0, barY, full, barH, 7); g.fill();
        g.fillStyle = lead ? C.good : C.dim;
        roundRect(g, x0, barY, Math.max(4, full * clamp(val / maxA, 0, 1)), barH, 7); g.fill();
        g.fillStyle = lead ? C.good : C.muted; g.font = f(11, 800); g.textAlign = 'center';
        g.fillText(val.toFixed(0) + ' sq in', cx, barY + barH + 14);
      }
      bar(lx, one, one > two);
      bar(rx, two, two >= one);
      g.fillStyle = C.dim; g.font = f(10, 500); g.textAlign = 'center';
      g.fillText('bars are total area, both drawn to the same scale', w / 2, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------- 7. the rope and the gap */
  global.QQViz.register('ropeGap', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Move the slider to change the planet.');
    var stage = K.Stage(host, 0.86);
    var R0 = 0.033, R1 = 6.96e8;         // a tennis ball, up to the Sun
    var pos = 0, target = 0, moved = false;
    var MARKS = [
      { r: 0.033, name: 'a tennis ball' },
      { r: 0.11, name: 'a football' },
      { r: 0.6, name: 'a beach ball' },
      { r: 6.4, name: 'a house' },
      { r: 1000, name: 'a small town' },
      { r: 1737400, name: 'the Moon' },
      { r: 6371000, name: 'the Earth' },
      { r: 69911000, name: 'Jupiter' },
      { r: 696000000, name: 'the Sun' }
    ];

    K.slider(ctr, { min: 0, max: 1000, step: 1, value: 0, label: 'size of the planet' },
      function (v) { target = v; moved = true; api.onInteract('slider'); });

    function radiusAt(p) { return R0 * Math.pow(R1 / R0, p / 1000); }
    function gapFor(r) {
      // worked out from the two circles, not from a remembered constant
      var before = 2 * Math.PI * r;
      return (before + 1) / (2 * Math.PI) - r;
    }
    function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function fmtR(r) {
      if (r < 1) return (r * 100).toFixed(1) + ' cm';
      if (r < 1000) return (r < 10 ? r.toFixed(2) : r.toFixed(0)) + ' m';
      return commas((r / 1000).toFixed(0)) + ' km';
    }
    function nameFor(r) {
      for (var i = 0; i < MARKS.length; i++) {
        var q = r / MARKS[i].r;
        if (q > 0.78 && q < 1.28) return MARKS[i].name;
      }
      return null;
    }
    function render(r) {
      var txt = 'planet radius <b>' + fmtR(r) + '</b>';
      // the gap itself waits for the first touch, or the point is handed over
      txt += ' &nbsp;·&nbsp; gap ' + (moved ? '<b>' + (gapFor(r) * 100).toFixed(1) + ' cm</b>' : '<b>?</b>');
      out.innerHTML = txt;
    }

    stage.draw = function (g, w, h, t) {
      pos += (target - pos) * 0.18;
      var r = radiusAt(pos), gap = gapFor(r);
      render(r);

      // ---- the close-up. the gap has its own scale, and says so
      var bx = 8, bw = w - 16, by = 6, bh = h * 0.35;
      g.fillStyle = C.panel;
      roundRect(g, bx, by, bw, bh, 10); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 1;
      roundRect(g, bx + 0.5, by + 0.5, bw - 1, bh - 1, 10); g.stroke();

      var groundY = by + bh - 12, gapPx = bh * 0.50, ropeY = groundY - gapPx;
      var pxPerCm = gapPx / (gap * 100);
      g.fillStyle = '#1c232c';
      g.fillRect(bx + 1, groundY, bw - 2, bh - (groundY - by) - 1);
      g.strokeStyle = C.muted; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(bx + 1, groundY + 0.5); g.lineTo(bx + bw - 1, groundY + 0.5); g.stroke();
      g.strokeStyle = C.gold; g.lineWidth = 3;
      g.beginPath(); g.moveTo(bx + 1, ropeY); g.lineTo(bx + bw - 1, ropeY); g.stroke();

      // a ruler, in centimetres, at the close-up's scale
      var rulerX = bx + 30;
      g.strokeStyle = C.muted; g.lineWidth = 1;
      g.beginPath(); g.moveTo(rulerX + 0.5, groundY); g.lineTo(rulerX + 0.5, groundY - 20 * pxPerCm); g.stroke();
      g.font = f(10, 600); g.textAlign = 'right';
      for (var cm = 0; cm <= 20; cm += 5) {
        var yy = groundY - cm * pxPerCm, long = cm % 10 === 0;
        g.strokeStyle = C.muted;
        g.beginPath(); g.moveTo(rulerX, yy + 0.5); g.lineTo(rulerX + (long ? 9 : 5), yy + 0.5); g.stroke();
        if (long) { g.fillStyle = C.muted; g.fillText(String(cm), rulerX - 3, yy + 3.5); }
      }
      g.fillStyle = C.dim; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('cm', rulerX + 3, groundY - 20 * pxPerCm - 4);

      // a hand, drawn to the same scale, for something to compare against
      var hcx = bx + bw * 0.62, palmW = 9 * pxPerCm, palmH = 9 * pxPerCm, fingH = 7 * pxPerCm;
      g.fillStyle = 'rgba(230,237,243,0.13)';
      g.strokeStyle = 'rgba(230,237,243,0.34)'; g.lineWidth = 1;
      roundRect(g, hcx - palmW / 2, groundY - palmH, palmW, palmH, palmW * 0.28);
      g.fill(); g.stroke();
      for (var fi = 0; fi < 4; fi++) {
        var fwid = palmW * 0.19, fx = hcx - palmW / 2 + palmW * (0.09 + fi * 0.245);
        roundRect(g, fx, groundY - palmH - fingH, fwid, fingH + 4, fwid * 0.5);
        g.fill(); g.stroke();
      }
      roundRect(g, hcx - palmW / 2 - palmW * 0.20, groundY - palmH * 0.7, palmW * 0.3, palmH * 0.42, palmW * 0.14);
      g.fill(); g.stroke();

      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'right';
      g.fillText('a hand, same scale', bx + bw - 8, groundY - 4);
      g.fillStyle = C.dim; g.textAlign = 'left';
      g.fillText('close-up: the gap and the ruler, not the planet', bx + 8, by + 13);
      g.fillStyle = C.gold; g.textAlign = 'left'; g.font = f(10, 700);
      g.fillText('rope', bx + 8, ropeY - 5);

      // ---- the planet. fixed on the screen however big it really is
      var R = Math.min(w * 0.21, (h - bh - 46) / 2);
      var cy = by + bh + 16 + R, cx = w / 2;
      g.fillStyle = '#1c232c';
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 1.5;
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
      g.strokeStyle = C.gold; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, R + 6 + Math.sin(t * 1.6) * 0.6, 0, 7); g.stroke();

      // the two dashed leads that say which sliver the close-up is showing
      g.strokeStyle = 'rgba(139,148,158,0.35)'; g.lineWidth = 1; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(cx - 12, cy - R - 6); g.lineTo(bx + 12, by + bh); g.stroke();
      g.beginPath(); g.moveTo(cx + 12, cy - R - 6); g.lineTo(bx + bw - 12, by + bh); g.stroke();
      g.setLineDash([]);

      var nm = nameFor(r);
      g.textAlign = 'center';
      g.fillStyle = C.fg; g.font = f(12, 800);
      g.fillText(nm || 'a planet', cx, cy - 2);
      g.fillStyle = C.muted; g.font = f(11, 600);
      g.fillText('radius ' + fmtR(r), cx, cy + 14);
      g.fillStyle = C.dim; g.font = f(10, 500);
      g.fillText('drawn the same size whatever the slider says', cx, h - 3);
    };
    return { destroy: stage.destroy };
  });
})(window);
