/* QQ visuals — growth, bets and machines (units 3 and 4).
 *
 * Same house rule as viz.js: animate the thing, don't write the formula. Every
 * visual here moves under the player's thumb, and none of them prints the answer
 * before the player has committed to one.
 *
 * Loads after js/viz.js and uses QQViz.kit for all the canvas plumbing.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;

  /* thousands separators — Intl is overkill and we want the same string on
   * every browser, including a phone opened from file:// */
  function commas(n) {
    var s = String(Math.round(n)), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      c++;
      if (c % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }

  /* ------------------------------------------------------- 1. paper folds */
  global.QQViz.register('paperFolds', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.92);
    var folds = 10, shown = 10;
    var SHEET = 0.0001;                 // a tenth of a millimetre, in metres

    // the ladder is logarithmic because nothing else could hold both a sheet of
    // paper and the Moon on one screen
    var LOG_LO = -4, LOG_HI = 9.6;
    var MARKS = [
      { m: 1.8, name: 'a person' },
      { m: 300, name: 'a tower' },
      { m: 8848, name: 'Everest' },
      { m: 100000, name: 'edge of the air' },
      { m: 384400000, name: 'the Moon' }
    ];

    function thickness(m) {
      if (m < 0.01) {
        var mm = m * 1000;
        return (mm < 1 ? String(Math.round(mm * 100) / 100) : mm.toFixed(1)) + ' mm';
      }
      if (m < 1) return (m * 100).toFixed(1) + ' cm';
      if (m < 1000) return m < 10 ? m.toFixed(1) + ' m' : commas(m) + ' m';
      var km = m / 1000;
      return (km < 10 ? km.toFixed(1) : commas(km)) + ' km';
    }
    function label() {
      out.innerHTML = '<span class="tag-a">' + folds + ' folds</span> &nbsp;&rarr;&nbsp; <b>' +
        thickness(SHEET * Math.pow(2, folds)) + '</b> thick';
    }
    K.slider(ctr, { min: 0, max: 45, step: 1, value: 10, label: 'number of folds' }, function (v) {
      folds = Math.round(v);
      label();
      api.onInteract('slider');
    });
    label();

    stage.draw = function (g, w, h) {
      shown += (folds - shown) * 0.18;
      var thick = SHEET * Math.pow(2, folds);

      /* ---- right: the log ladder ---- */
      var barX = Math.round(w * 0.5), barW = 11;
      var yTop = 16, yBot = h - 20;
      function ly(m) {
        var t = (Math.log(m) / Math.LN10 - LOG_LO) / (LOG_HI - LOG_LO);
        return yBot - K.clamp(t, 0, 1) * (yBot - yTop);
      }
      g.fillStyle = '#1c232c';
      K.roundRect(g, barX, yTop, barW, yBot - yTop, 5); g.fill();

      g.font = K.f(10, 600);
      g.textAlign = 'left';
      for (var i = 0; i < MARKS.length; i++) {
        var my = ly(MARKS[i].m);
        g.strokeStyle = C.line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(barX, my + 0.5); g.lineTo(barX + barW + 5, my + 0.5); g.stroke();
        g.fillStyle = thick >= MARKS[i].m ? C.gold : '#5b6672';
        g.fillText(MARKS[i].name, barX + barW + 8, my + 3.5);
      }
      // the fill climbs the ladder as the slider moves
      var fy = ly(thick);
      g.fillStyle = 'rgba(88,166,255,0.85)';
      K.roundRect(g, barX, fy, barW, yBot - fy, 5); g.fill();
      g.fillStyle = C.accent;
      g.beginPath();
      g.moveTo(barX - 3, fy); g.lineTo(barX - 12, fy - 5); g.lineTo(barX - 12, fy + 5);
      g.closePath(); g.fill();

      g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'left';
      g.fillText('one sheet', barX + barW + 8, yBot + 3.5);

      /* ---- left: the paper itself, halving and stacking ---- */
      var px = 8, pw = barX - 26, pTop = 30, pBot = h - 30;
      var W0 = Math.min(pw, 150), LAYER = 3;
      // how many folds we can still honestly draw at this size
      var maxDraw = 0;
      while (maxDraw < 12 && W0 / Math.pow(2, maxDraw + 1) >= 1.2 &&
             LAYER * Math.pow(2, maxDraw + 1) <= pBot - pTop) maxDraw++;

      var drawn = Math.min(shown, maxDraw);
      var sw = W0 / Math.pow(2, drawn), sh = LAYER * Math.pow(2, drawn);
      var cx = px + pw / 2, baseY = pBot;
      var layers = Math.round(Math.pow(2, drawn));

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(px, baseY + 0.5); g.lineTo(px + pw, baseY + 0.5); g.stroke();

      // the sheet before any of this, so you can see how much narrower it got
      g.strokeStyle = C.dim; g.lineWidth = 1; g.setLineDash([3, 3]);
      g.strokeRect(cx - W0 / 2, baseY - LAYER, W0, LAYER);
      g.setLineDash([]);

      if (layers <= 64) {
        for (var L = 0; L < layers; L++) {
          var lh = sh / layers;
          g.fillStyle = L % 2 ? 'rgba(88,166,255,0.5)' : 'rgba(88,166,255,0.8)';
          g.fillRect(cx - sw / 2, baseY - (L + 1) * lh, Math.max(1, sw), Math.max(0.7, lh - 0.5));
        }
      } else {
        g.fillStyle = 'rgba(88,166,255,0.75)';
        g.fillRect(cx - sw / 2, baseY - sh, Math.max(1, sw), sh);
      }

      g.textAlign = 'center'; g.font = K.f(10, 600);
      if (folds > maxDraw) {
        g.fillStyle = C.gold;
        g.fillText('fold ' + (maxDraw + 1) + ' is', cx, pTop - 12);
        g.fillText('too thin to draw', cx, pTop);
        g.fillStyle = C.muted; g.font = K.f(10, 500);
        g.fillText('drawn: ' + maxDraw + ' folds', cx, baseY + 15);
      } else {
        g.fillStyle = C.muted;
        g.fillText(Math.round(Math.pow(2, folds)) + ' sheets thick', cx, baseY + 15);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ---------------------------------------------------------- 2. the pond */
  global.QQViz.register('pondFill', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.88);
    var day = 20, shownPads = 0, playFrom = -1;

    // pads sit on a jittered grid, one per cell, so the drawn area tracks the
    // real coverage; the order is fixed, so sliding the day adds pads rather
    // than reshuffling the pond
    var CELLS = 17, cs = 1 / CELLS, cells = [];
    var seed = 20240729;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    for (var gy = -CELLS; gy < CELLS; gy++) {
      for (var gx = -CELLS; gx < CELLS; gx++) {
        var ux = (gx + 0.5) * cs, uy = (gy + 0.5) * cs;
        if (ux * ux + uy * uy > 0.97 * 0.97) continue;
        cells.push({ x: ux, y: uy, jx: 0, jy: 0, r: 1 });
      }
    }
    for (var c = 0; c < cells.length; c++) {
      cells[c].jx = (rnd() - 0.5) * cs * 0.7;
      cells[c].jy = (rnd() - 0.5) * cs * 0.7;
      cells[c].r = 0.62 + rnd() * 0.16;
    }
    for (var s = cells.length - 1; s > 0; s--) {   // fixed shuffle, honest order
      var j = Math.floor(rnd() * (s + 1)), tmp = cells[s];
      cells[s] = cells[j]; cells[j] = tmp;
    }

    function frac() { return Math.pow(2, day - 30); }
    function pct(v) {
      var p = v * 100;
      return (p < 1 ? p.toFixed(2) : (p < 10 ? p.toFixed(1) : p.toFixed(0))) + '%';
    }
    function label() {
      out.innerHTML = '<span class="tag-a">day ' + day + '</span> &nbsp;·&nbsp; pond covered: <b>' +
        pct(frac()) + '</b>';
    }
    var slider = K.slider(ctr, { min: 20, max: 30, step: 1, value: 20, label: 'day' }, function (v) {
      day = Math.round(v); playFrom = -1; label();
      api.onInteract('slider');
    });
    K.button(ctr, 'Play the last 10 days', function () {
      day = 20; slider.value = '20'; playFrom = performance.now();
      label();
      api.onInteract('play');
    }).classList.add('primary');
    label();

    stage.draw = function (g, w, h) {
      if (playFrom > 0) {
        var elapsed = (performance.now() - playFrom) / 700;      // 0.7 s a day
        var d = 20 + Math.floor(elapsed);
        if (d >= 30) { d = 30; playFrom = -1; }
        if (d !== day) { day = d; slider.value = String(d); label(); }
      }

      var barH = 22, padTop = 6;
      var R = Math.min(w, h - barH - 22) / 2 - padTop;
      var cx = w / 2, cy = padTop + R;

      // the water
      g.fillStyle = '#132a38';
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();

      var target = Math.max(1, Math.round(frac() * cells.length));
      shownPads += (target - shownPads) * 0.16;
      if (Math.abs(target - shownPads) < 0.6) shownPads = target;
      var n = Math.ceil(shownPads);

      for (var i = 0; i < n && i < cells.length; i++) {
        var p = cells[i];
        var pop = K.clamp(shownPads - i, 0, 1);
        if (pop <= 0) continue;
        var rr = R * cs * p.r * K.easeOut(pop);
        g.fillStyle = i % 3 === 0 ? 'rgba(63,185,80,0.85)' : 'rgba(63,185,80,0.62)';
        g.beginPath();
        g.arc(cx + (p.x + p.jx) * R, cy + (p.y + p.jy) * R, rr, 0, 7);
        g.fill();
      }

      // coverage bar — the honest number, since overlapping circles fib a little
      var by = h - barH - 4, bx = 10, bw = w - 20;
      g.fillStyle = C.panel;
      K.roundRect(g, bx, by, bw, 14, 7); g.fill();
      g.fillStyle = C.good;
      K.roundRect(g, bx, by, Math.max(2, bw * frac()), 14, 7); g.fill();
      g.fillStyle = C.muted; g.font = K.f(10, 600); g.textAlign = 'left';
      g.fillText('covered', bx, by - 4);
      g.textAlign = 'right'; g.fillStyle = C.fg;
      g.fillText(pct(frac()) + ' on day ' + day, bx + bw, by - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ---------------------------------------------------- 3. compound growth */
  global.QQViz.register('compoundCurve', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.74);
    var rate = 3, shown = 3;
    var YEARS = 40, YMAX = 3;

    function years(r) { return Math.log(2) / Math.log(1 + r / 100); }
    function label(v) {
      var t = years(v);
      out.innerHTML = '<span class="tag-a">' + v.toFixed(1) + '% a year</span> &nbsp;·&nbsp; doubles in ' +
        (t > YEARS ? '<b>over 40</b> years' : '<b>' + t.toFixed(1) + '</b> years');
    }
    K.slider(ctr, { min: 1, max: 20, step: 0.5, value: 3, label: 'interest rate' }, function (v) {
      rate = v;
      api.onInteract('slider');
    });
    label(rate);

    stage.draw = function (g, w, h) {
      shown += (rate - shown) * 0.22;
      if (Math.abs(rate - shown) < 0.02) shown = rate;
      label(shown);
      var r = shown / 100;
      var padL = 26, padR = 10, padT = 12, padB = 22;
      var x0 = padL, x1 = w - padR, y0 = padT, y1 = h - padB;
      function px(t) { return x0 + t / YEARS * (x1 - x0); }
      function py(v) { return y1 - K.clamp(v, 0, YMAX) / YMAX * (y1 - y0); }

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, y1 + 0.5); g.lineTo(x1, y1 + 0.5); g.stroke();
      g.font = K.f(10, 600); g.fillStyle = C.muted; g.textAlign = 'center';
      for (var t = 0; t <= YEARS; t += 10) {
        g.beginPath(); g.moveTo(px(t), y1); g.lineTo(px(t), y1 + 4); g.stroke();
        g.fillText(String(t), px(t), y1 + 15);
      }
      g.textAlign = 'right';
      g.fillText('£1', x0 - 5, py(1) + 3.5);
      g.fillText('£2', x0 - 5, py(2) + 3.5);

      // starting money, and the doubled line
      g.strokeStyle = 'rgba(139,148,158,0.3)';
      g.beginPath(); g.moveTo(x0, py(1)); g.lineTo(x1, py(1)); g.stroke();
      g.strokeStyle = C.gold; g.lineWidth = 1.5; g.setLineDash([5, 4]);
      g.beginPath(); g.moveTo(x0, py(2)); g.lineTo(x1, py(2)); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.gold; g.font = K.f(10, 700); g.textAlign = 'left';
      g.fillText('doubled', x0 + 4, py(2) - 5);

      // the same cash every year, for contrast — a straight line, and it loses
      g.strokeStyle = C.dim; g.lineWidth = 2;
      g.beginPath();
      g.moveTo(px(0), py(1)); g.lineTo(px(YEARS), py(1 + r * YEARS)); g.stroke();

      // compounding
      g.strokeStyle = C.accent; g.lineWidth = 2.5;
      g.beginPath();
      for (var k = 0; k <= 160; k++) {
        var tt = k / 160 * YEARS, v = Math.pow(1 + r, tt);
        var yy = py(v);
        if (k === 0) g.moveTo(px(tt), yy); else g.lineTo(px(tt), yy);
        if (v > YMAX) break;
      }
      g.stroke();

      // a legend in the band under the starting line, which is always empty
      var LG = [[C.accent, 'compounding'], [C.dim, 'the same cash each year']];
      for (var li = 0; li < LG.length; li++) {
        var lgY = py(1) + 16 + li * 14;
        g.strokeStyle = LG[li][0]; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(x0 + 6, lgY); g.lineTo(x0 + 20, lgY); g.stroke();
        g.fillStyle = C.muted; g.font = K.f(9.5, 500); g.textAlign = 'left';
        g.fillText(LG[li][1], x0 + 25, lgY + 3.5);
      }

      // where it crosses
      var td = years(shown);
      if (td <= YEARS) {
        var dx = px(td);
        g.strokeStyle = 'rgba(88,166,255,0.5)'; g.lineWidth = 1; g.setLineDash([3, 3]);
        g.beginPath(); g.moveTo(dx, py(2)); g.lineTo(dx, y1); g.stroke();
        g.setLineDash([]);
        g.fillStyle = C.accent;
        g.beginPath(); g.arc(dx, py(2), 5, 0, 7); g.fill();
        g.fillStyle = C.fg; g.font = K.f(10.5, 700); g.textAlign = 'center';
        g.fillText(td.toFixed(1) + ' yr', K.clamp(dx, x0 + 18, x1 - 18), y1 - 6);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------- 4. random walk */
  global.QQViz.register('randomWalk', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No walks yet.');
    var stage = K.Stage(host, 0.86);
    var N = 100, BINW = 2, BINS = 21;
    var path = [], anim = 0, walks = 0, sumAbs = 0, bins = [], pending = 0;
    for (var b = 0; b < BINS; b++) bins.push(0);

    function oneWalk(keep) {
      var p = 0, trail = keep ? [0] : null;
      for (var i = 0; i < N; i++) {
        p += Math.random() < 0.5 ? 1 : -1;
        if (trail) trail.push(p);
      }
      var d = Math.abs(p);
      bins[Math.min(Math.floor(d / BINW), BINS - 1)]++;
      walks++; sumAbs += d;
      if (trail) { path = trail; anim = performance.now(); }
      return p;
    }
    function render() {
      out.innerHTML = walks === 0 ? 'No walks yet.' :
        '<b>' + commas(walks) + '</b> walks &nbsp;·&nbsp; average distance from the start: <b>' +
        (sumAbs / walks).toFixed(1) + '</b>';
    }
    K.button(ctr, 'Walk 100 steps', function () {
      oneWalk(true); render();
      api.onInteract('walk');
    }).classList.add('primary');
    K.button(ctr, 'Run 200 walks', function () {
      pending += 200;
      api.onInteract('bulk');
    });

    stage.draw = function (g, w, h) {
      var step = Math.min(pending, 20);
      for (var q = 0; q < step; q++) oneWalk(false);
      pending -= step;
      if (step) render();

      var padL = 24, padR = 8;
      var topY0 = 10, topY1 = h * 0.52;
      var x0 = padL, x1 = w - padR, SPAN = 30;
      function wx(i) { return x0 + i / N * (x1 - x0); }
      function wy(p) { return (topY0 + topY1) / 2 - K.clamp(p, -SPAN, SPAN) / SPAN * ((topY1 - topY0) / 2); }

      // guides at nought and ten either way — plain axis marks, nothing more
      g.font = K.f(10, 600); g.textAlign = 'right';
      [-10, 0, 10].forEach(function (v) {
        g.strokeStyle = v === 0 ? 'rgba(230,237,243,0.28)' : 'rgba(139,148,158,0.18)';
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(x0, wy(v) + 0.5); g.lineTo(x1, wy(v) + 0.5); g.stroke();
        g.fillStyle = '#5b6672';
        g.fillText(v > 0 ? '+' + v : String(v), x0 - 4, wy(v) + 3.5);
      });

      if (path.length) {
        var reveal = K.clamp((performance.now() - anim) / 1000, 0, 1);
        var upto = Math.max(1, Math.floor(reveal * N));
        g.strokeStyle = C.accent; g.lineWidth = 1.8;
        g.beginPath();
        for (var i = 0; i <= upto; i++) {
          if (i === 0) g.moveTo(wx(0), wy(path[0])); else g.lineTo(wx(i), wy(path[i]));
        }
        g.stroke();
        g.fillStyle = C.accent;
        g.beginPath(); g.arc(wx(upto), wy(path[upto]), 4, 0, 7); g.fill();
        if (reveal >= 1) {
          g.fillStyle = C.fg; g.font = K.f(10.5, 700); g.textAlign = 'right';
          g.fillText('ended ' + Math.abs(path[N]) + ' away', x1, topY0 + 10);
        }
      } else {
        g.fillStyle = C.muted; g.font = K.f(11, 500); g.textAlign = 'center';
        g.fillText('press walk to take 100 steps', (x0 + x1) / 2, (topY0 + topY1) / 2 - 8);
      }
      g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'right';
      g.fillText('steps', x1, topY1 + 12);

      /* ---- bottom: how far from the start, over every walk so far ---- */
      var hy1 = h - 22, hy0 = topY1 + 24;
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, hy1 + 0.5); g.lineTo(x1, hy1 + 0.5); g.stroke();
      var maxC = 1, bi;
      for (bi = 0; bi < BINS; bi++) if (bins[bi] > maxC) maxC = bins[bi];
      var bw = (x1 - x0) / BINS;
      for (bi = 0; bi < BINS; bi++) {
        if (!bins[bi]) continue;
        var bh = (bins[bi] / maxC) * (hy1 - hy0);
        g.fillStyle = 'rgba(88,166,255,0.65)';
        g.fillRect(x0 + bi * bw + 0.6, hy1 - bh, bw - 1.2, bh);
      }
      g.font = K.f(10, 600); g.fillStyle = '#5b6672'; g.textAlign = 'center';
      for (var v2 = 0; v2 <= 40; v2 += 10) {
        var vx = x0 + (v2 / (BINS * BINW)) * (x1 - x0);
        g.fillText(String(v2), vx, hy1 + 14);
      }
      if (walks) {
        var mx = x0 + ((sumAbs / walks) / (BINS * BINW)) * (x1 - x0);
        g.strokeStyle = C.gold; g.lineWidth = 2;
        g.beginPath(); g.moveTo(mx, hy0 - 4); g.lineTo(mx, hy1); g.stroke();
        g.fillStyle = C.gold; g.font = K.f(10, 700); g.textAlign = 'left';
        g.fillText('average', mx + 4, hy0 + 16);
      }
      g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'left';
      g.fillText('distance from the start', x0, hy0 - 6);
    };
    return { destroy: stage.destroy };
  });

  /* ----------------------------------------------------- 5. how much to bet */
  global.QQViz.register('kellyGrowth', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.95);
    var stake = 50, shown = 50;
    var BETS = 200, PATHS = 6, FLOOR = 1e-6;
    var LOG_LO = -6, LOG_HI = 4;
    var coins = [], drawnAt = 0;

    function reroll() {
      coins = [];
      for (var p = 0; p < PATHS; p++) {
        var run = [];
        for (var i = 0; i < BETS; i++) run.push(Math.random() < 0.6);   // honest 60% coin
        coins.push(run);
      }
      drawnAt = performance.now();
    }
    reroll();

    function growth(f) {
      if (f >= 1) return -Infinity;                 // stake the lot and one loss is the end
      return 0.6 * Math.log(1 + f) + 0.4 * Math.log(1 - f);
    }
    function label() {
      var per = Math.exp(growth(stake / 100)) - 1;
      out.innerHTML = '<span class="tag-a">stake ' + stake + '%</span> &nbsp;·&nbsp; typical change per bet: <b>' +
        (per >= 0 ? '+' : '') + (per * 100).toFixed(2) + '%</b>';
    }
    K.slider(ctr, { min: 0, max: 100, step: 1, value: 50, label: 'stake as a percentage' }, function (v) {
      stake = v; label();
      api.onInteract('slider');
    });
    K.button(ctr, 'Run again', function () {
      reroll();
      api.onInteract('rerun');
    }).classList.add('primary');
    label();

    stage.draw = function (g, w, h) {
      shown += (stake - shown) * 0.25;
      var f = shown / 100;
      var padL = 44, padR = 8;
      var x0 = padL, x1 = w - padR;
      var tY0 = 12, tY1 = h * 0.58;
      var reveal = K.clamp((performance.now() - drawnAt) / 1200, 0, 1);
      var upto = Math.max(1, Math.round(K.easeOut(reveal) * BETS));

      function ly(v) {
        var l = Math.log(Math.max(v, FLOOR)) / Math.LN10;
        return tY1 - (K.clamp(l, LOG_LO, LOG_HI) - LOG_LO) / (LOG_HI - LOG_LO) * (tY1 - tY0);
      }
      // log grid: each line is a thousandfold, which is the point of a log axis
      var TICKS = [
        { v: 1000, t: '×1000' }, { v: 1, t: 'start' },
        { v: 0.001, t: '÷1000' }, { v: FLOOR, t: 'ruin' }
      ];
      g.font = K.f(9.5, 600); g.textAlign = 'right';
      for (var ti = 0; ti < TICKS.length; ti++) {
        var ty = ly(TICKS[ti].v);
        g.strokeStyle = TICKS[ti].v === 1 ? 'rgba(230,237,243,0.22)' : 'rgba(139,148,158,0.14)';
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(x0, ty + 0.5); g.lineTo(x1, ty + 0.5); g.stroke();
        g.fillStyle = TICKS[ti].v === FLOOR ? '#6e4a4a' : '#5b6672';
        g.fillText(TICKS[ti].t, x0 - 4, ty + 3.5);
      }

      for (var p = 0; p < PATHS; p++) {
        var money = 1, dead = false;
        g.beginPath();
        g.moveTo(x0, ly(1));
        for (var i = 0; i < upto; i++) {
          money *= coins[p][i] ? (1 + f) : (1 - f);
          if (money <= FLOOR) { money = FLOOR; dead = true; }
          g.lineTo(x0 + (i + 1) / BETS * (x1 - x0), ly(money));
        }
        g.strokeStyle = dead ? 'rgba(248,81,73,0.75)' : 'rgba(88,166,255,0.6)';
        g.lineWidth = 1.6;
        g.stroke();
      }
      g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'left';
      g.fillText('200 bets, six fortunes', x0 + 2, tY0 + 9);

      /* ---- bottom: growth per bet against the stake ---- */
      var bY0 = tY1 + 26, bY1 = h - 20;
      var GLO = -0.08, GHI = 0.03;
      function gy(v) { return bY1 - (K.clamp(v, GLO, GHI) - GLO) / (GHI - GLO) * (bY1 - bY0); }
      g.strokeStyle = 'rgba(139,148,158,0.2)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, gy(0) + 0.5); g.lineTo(x1, gy(0) + 0.5); g.stroke();
      g.fillStyle = '#5b6672'; g.font = K.f(9.5, 600); g.textAlign = 'left';
      g.fillText('gets you nowhere', x0 + 2, gy(0) + 11);

      g.save();
      g.beginPath(); g.rect(x0, bY0 - 4, x1 - x0, bY1 - bY0 + 4); g.clip();
      g.strokeStyle = C.gold; g.lineWidth = 2.2;
      g.beginPath();
      for (var k = 0; k <= 120; k++) {
        var ff = k / 120 * 0.995;
        var xx = x0 + ff * (x1 - x0);
        if (k === 0) g.moveTo(xx, gy(growth(ff))); else g.lineTo(xx, gy(growth(ff)));
      }
      g.stroke();
      g.restore();

      var mx = x0 + K.clamp(f, 0, 1) * (x1 - x0), my = gy(growth(f));
      g.strokeStyle = 'rgba(88,166,255,0.4)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(mx, bY1); g.lineTo(mx, my); g.stroke();
      g.fillStyle = C.accent;
      g.beginPath(); g.arc(mx, my, 5.5, 0, 7); g.fill();

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, bY1 + 0.5); g.lineTo(x1, bY1 + 0.5); g.stroke();
      g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'left';
      g.fillText('stake nothing', x0, bY1 + 13);
      g.textAlign = 'right';
      g.fillText('stake it all', x1, bY1 + 13);
      g.textAlign = 'left';
      g.fillText('growth per bet', x0 + 2, bY0 - 8);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------ 6. die + reroll */
  global.QQViz.register('rerollThreshold', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.62);
    var rule = 1, games = 0, total = 0, pending = 0;
    var PIPS = [
      [], [[0.5, 0.5]], [[0.28, 0.28], [0.72, 0.72]],
      [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
      [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
      [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
      [[0.28, 0.26], [0.72, 0.26], [0.28, 0.5], [0.72, 0.5], [0.28, 0.74], [0.72, 0.74]]
    ];

    // keep a face if it is at least the rule; anything below it goes back in
    function exact(n) {
      var s = 0;
      for (var k = 1; k <= 6; k++) s += (k >= n ? k : 3.5);
      return s / 6;
    }
    function words(n) {
      if (n <= 1) return 'keep whatever you roll';
      if (n >= 7) return 'reroll every time';
      var keep = [];
      for (var k = n; k <= 6; k++) keep.push(String(k));
      if (keep.length === 1) return 'keep a ' + keep[0];
      return 'keep a ' + keep.slice(0, -1).join(', ') + ' or ' + keep[keep.length - 1];
    }
    function label() {
      out.innerHTML = '<span class="tag-a">' + words(rule) + '</span>' +
        (games ? ' &nbsp;·&nbsp; average over <b>' + commas(games) + '</b> games: <b>£' +
          (total / games).toFixed(2) + '</b>' : ' &nbsp;·&nbsp; not played yet');
    }
    K.slider(ctr, { min: 1, max: 7, step: 1, value: 1, label: 'reroll anything below this' }, function (v) {
      rule = Math.round(v); games = 0; total = 0; pending = 0;   // a new rule needs a new tally
      label();
      api.onInteract('slider');
    });
    K.button(ctr, 'Play 200 games', function () {
      pending += 200;
      api.onInteract('play');
    }).classList.add('primary');
    label();

    stage.draw = function (g, w, h) {
      var step = Math.min(pending, 5);
      for (var q = 0; q < step; q++) {
        var roll = 1 + Math.floor(Math.random() * 6);
        if (roll < rule) roll = 1 + Math.floor(Math.random() * 6);   // the one reroll
        total += roll; games++;
      }
      pending -= step;
      if (step) label();

      /* ---- the six faces, greyed if this rule throws them back ---- */
      var pad = 8, gap = 5;
      var side = Math.min((w - pad * 2 - gap * 5) / 6, 46);
      var ox = (w - (side * 6 + gap * 5)) / 2, oy = 14;
      for (var d = 1; d <= 6; d++) {
        var x = ox + (d - 1) * (side + gap), keep = d >= rule;
        g.fillStyle = keep ? 'rgba(88,166,255,0.16)' : '#191f26';
        K.roundRect(g, x, oy, side, side, 8); g.fill();
        g.strokeStyle = keep ? C.accent : C.dim; g.lineWidth = 1.5;
        K.roundRect(g, x + 0.5, oy + 0.5, side - 1, side - 1, 8); g.stroke();
        g.fillStyle = keep ? C.accent : '#3d444d';
        for (var pi = 0; pi < PIPS[d].length; pi++) {
          g.beginPath();
          g.arc(x + PIPS[d][pi][0] * side, oy + PIPS[d][pi][1] * side, side * 0.075, 0, 7);
          g.fill();
        }
      }
      g.fillStyle = C.muted; g.font = K.f(10, 600); g.textAlign = 'center';
      g.fillText('bright = you keep it,  dim = you roll again', w / 2, oy + side + 15);

      /* ---- the money bar, with the exact value as a thin line ---- */
      var MAXP = 6;
      var bx = 16, bw = w - 32, by = oy + side + 48, bh = 26;
      function mx(v) { return bx + K.clamp(v / MAXP, 0, 1) * bw; }
      g.fillStyle = C.panel;
      K.roundRect(g, bx, by, bw, bh, 6); g.fill();
      if (games) {
        g.fillStyle = 'rgba(88,166,255,0.75)';
        K.roundRect(g, bx, by, Math.max(3, mx(total / games) - bx), bh, 6); g.fill();
      }
      g.font = K.f(9.5, 600); g.textAlign = 'center';
      for (var m = 1; m <= 6; m++) {
        g.strokeStyle = 'rgba(13,17,23,0.5)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(mx(m), by); g.lineTo(mx(m), by + bh); g.stroke();
        g.fillStyle = '#4a5566';
        g.fillText('£' + m, mx(m), by + bh + 13);
      }
      // where the maths says this rule must land — a line, not a number, so the
      // player reads it off the scale instead of being handed it
      var ex = mx(exact(rule));
      g.strokeStyle = C.gold; g.lineWidth = 2;
      g.beginPath(); g.moveTo(ex, by - 8); g.lineTo(ex, by + bh + 3); g.stroke();
      g.fillStyle = C.gold; g.font = K.f(10, 700); g.textAlign = 'center';
      g.fillText('what this rule is worth', K.clamp(ex, bx + 56, bx + bw - 56), by - 12);

      if (games) {
        g.fillStyle = C.fg; g.font = K.f(12, 800); g.textAlign = 'left';
        g.fillText('£' + (total / games).toFixed(2) + ' a game so far', bx, by + bh + 30);
        g.fillStyle = C.muted; g.font = K.f(10, 500); g.textAlign = 'right';
        g.fillText(commas(games) + ' games played', bx + bw, by + bh + 30);
      } else {
        g.fillStyle = C.muted; g.font = K.f(10.5, 500); g.textAlign = 'center';
        g.fillText('play some games and watch the bar find the line', w / 2, by + bh + 30);
      }
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------------------- 7. overfitting */
  global.QQViz.register('polyFit', function (host, api) {
    var d = (api.data && api.data.polyFit) || { train: [], test: [], degrees: [1, 3, 9] };
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.86);
    var degrees = d.degrees || [1, 3, 9];
    var idx = 0, shownIdx = 0;
    var XLO = -1.15, XHI = 1.15, YLO = -0.8, YHI = 0.8;
    var BARMAX = 0.05;

    var fits = degrees.map(function (deg) { return K.polyfit(d.train, deg); });
    function mse(co, pts) {
      var s = 0;
      for (var i = 0; i < pts.length; i++) {
        var e = K.polyval(co, pts[i][0]) - pts[i][1];
        s += e * e;
      }
      return pts.length ? s / pts.length : 0;
    }
    var errTrain = fits.map(function (co) { return mse(co, d.train); });
    var errTest = fits.map(function (co) { return mse(co, d.test); });

    function label() {
      out.innerHTML = 'wiggliness <b>' + degrees[idx] + '</b> &nbsp;·&nbsp; ' +
        '<span class="tag-a">learned from</span> vs <span class="tag-b">never seen</span>';
    }
    K.slider(ctr, { min: 0, max: degrees.length - 1, step: 1, value: 0, label: 'how wiggly the curve is' },
      function (v) { idx = Math.round(v); label(); api.onInteract('slider'); });
    label();

    stage.draw = function (g, w, h) {
      shownIdx += (idx - shownIdx) * 0.3;
      var co = fits[idx];
      var padL = 10, padR = 10, pT = 8;
      var x0 = padL, x1 = w - padR, y0 = pT, y1 = h * 0.62;
      function px(x) { return x0 + (x - XLO) / (XHI - XLO) * (x1 - x0); }
      function py(y) { return y1 - (y - YLO) / (YHI - YLO) * (y1 - y0); }

      g.fillStyle = '#12171f';
      K.roundRect(g, x0, y0, x1 - x0, y1 - y0, 8); g.fill();
      g.strokeStyle = 'rgba(139,148,158,0.15)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, py(0) + 0.5); g.lineTo(x1, py(0) + 0.5); g.stroke();

      // clipped, because a wiggly curve will happily leave the building
      g.save();
      g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      g.strokeStyle = C.fg; g.lineWidth = 2.4;
      g.beginPath();
      for (var k = 0; k <= 240; k++) {
        var xx = XLO + k / 240 * (XHI - XLO);
        var yy = K.polyval(co, xx);
        if (k === 0) g.moveTo(px(xx), py(yy)); else g.lineTo(px(xx), py(yy));
      }
      g.stroke();
      g.restore();

      var i;
      for (i = 0; i < d.train.length; i++) {
        g.fillStyle = C.accent;
        g.beginPath(); g.arc(px(d.train[i][0]), py(d.train[i][1]), 4.5, 0, 7); g.fill();
      }
      for (i = 0; i < d.test.length; i++) {
        g.fillStyle = C.gold;
        g.beginPath(); g.arc(px(d.test[i][0]), py(d.test[i][1]), 4.5, 0, 7); g.fill();
        g.strokeStyle = '#0d1117'; g.lineWidth = 1;
        g.beginPath(); g.arc(px(d.test[i][0]), py(d.test[i][1]), 4.5, 0, 7); g.stroke();
      }

      /* ---- the two errors, on one scale so they can be compared ---- */
      var by = y1 + 16, bh = 14, bx = x0, bw = x1 - x0;
      var rows = [
        { t: 'error on the points it learned from', v: errTrain[idx], c: C.accent },
        { t: 'error on new points', v: errTest[idx], c: C.gold }
      ];
      for (var r = 0; r < rows.length; r++) {
        var yy2 = by + r * (bh + 20);
        g.fillStyle = C.muted; g.font = K.f(10, 600); g.textAlign = 'left';
        g.fillText(rows[r].t, bx, yy2);
        g.fillStyle = rows[r].c; g.textAlign = 'right';
        g.fillText(rows[r].v.toFixed(3), bx + bw, yy2);
        g.fillStyle = C.panel;
        K.roundRect(g, bx, yy2 + 4, bw, bh, 4); g.fill();
        g.fillStyle = rows[r].c;
        K.roundRect(g, bx, yy2 + 4, Math.max(2, bw * K.clamp(rows[r].v / BARMAX, 0, 1)), bh, 4); g.fill();
      }
      g.fillStyle = '#5b6672'; g.font = K.f(9.5, 500); g.textAlign = 'left';
      g.fillText('shorter is better', bx, by + 2 * (bh + 20) + 2);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------------- 8. downhill machine */
  global.QQViz.register('lossValleys', function (host, api) {
    var land = (api.data && api.data.lossLandscape) || { start: 0, bowl: 0.02, wells: [] };
    var wells = land.wells || [];
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a valley, or drop the ball and watch.');
    var stage = K.Stage(host, 0.74);
    var XLO = -7, XHI = 7;
    var ball = null, picked = null, PAD = 10;

    var regions = api.regions || wells.map(function (wl) {
      return { id: wl.id, label: wl.id.charAt(0).toUpperCase() + wl.id.slice(1) + ' valley' };
    });

    function fx(x) {
      var v = land.bowl * x * x;
      for (var i = 0; i < wells.length; i++) {
        var wl = wells[i], dx = x - wl.centre;
        v -= wl.depth * Math.exp(-dx * dx / wl.width);
      }
      return v;
    }
    function fp(x) {
      var v = 2 * land.bowl * x;
      for (var i = 0; i < wells.length; i++) {
        var wl = wells[i], dx = x - wl.centre;
        v += 2 * wl.depth * dx / wl.width * Math.exp(-dx * dx / wl.width);
      }
      return v;
    }
    var YLO = -1.15, YHI = 1.05;

    function pick(id) {
      picked = id;
      chips.select(id);
      var r = null;
      for (var i = 0; i < regions.length; i++) if (regions[i].id === id) r = regions[i];
      out.innerHTML = 'you picked <span class="tag-a">' + (r ? r.label : id) + '</span>';
      api.onInteract('tap');
      if (!api.locked()) api.onSelect(id);
    }
    K.button(ctr, 'Drop the ball', function () {
      ball = { x: land.start };
      api.onInteract('drop');
    }).classList.add('primary');
    var chips = K.regionChips(host, regions, function (id) { pick(id); });

    function tap(ev) {
      var p = stage.pointer(ev);
      var wx = XLO + (p.x - PAD) / Math.max(1, stage.w - PAD * 2) * (XHI - XLO);
      for (var i = 0; i < wells.length; i++) {
        if (wx >= wells[i].from && wx < wells[i].to) { pick(wells[i].id); break; }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', tap);
    stage.canvas.addEventListener('touchstart', tap, { passive: false });

    stage.draw = function (g, w, h) {
      var x0 = PAD, x1 = w - PAD, y0 = 24, y1 = h - 26;
      function px(x) { return x0 + (x - XLO) / (XHI - XLO) * (x1 - x0); }
      function py(y) { return y1 - (K.clamp(y, YLO, YHI) - YLO) / (YHI - YLO) * (y1 - y0); }

      // three gradient steps a frame, so it rolls rather than teleports
      if (ball) {
        for (var s = 0; s < 3; s++) {
          var gr = fp(ball.x);
          if (Math.abs(gr) < 1e-4) break;      // settled: every way from here is up
          ball.x -= 0.05 * gr;
        }
      }

      // the shaded band of whichever valley is chosen
      if (picked) {
        for (var q = 0; q < wells.length; q++) {
          if (wells[q].id !== picked) continue;
          g.fillStyle = 'rgba(88,166,255,0.1)';
          g.fillRect(px(wells[q].from), y0 - 8, px(wells[q].to) - px(wells[q].from), y1 - y0 + 8);
        }
      }
      // the boundaries, so a tap target is obvious
      g.strokeStyle = 'rgba(139,148,158,0.16)'; g.lineWidth = 1;
      for (var b = 1; b < wells.length; b++) {
        g.beginPath(); g.moveTo(px(wells[b].from), y0 - 8); g.lineTo(px(wells[b].from), y1); g.stroke();
      }

      // the landscape, filled
      g.beginPath();
      g.moveTo(x0, py(fx(XLO)));
      for (var k = 1; k <= 220; k++) {
        var xx = XLO + k / 220 * (XHI - XLO);
        g.lineTo(px(xx), py(fx(xx)));
      }
      g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath();
      g.fillStyle = 'rgba(88,166,255,0.12)'; g.fill();

      g.beginPath();
      for (var k2 = 0; k2 <= 220; k2++) {
        var x2 = XLO + k2 / 220 * (XHI - XLO);
        if (k2 === 0) g.moveTo(px(x2), py(fx(x2))); else g.lineTo(px(x2), py(fx(x2)));
      }
      g.strokeStyle = C.accent; g.lineWidth = 2.5; g.stroke();

      // the start arrow
      var sx = px(land.start), sy = py(fx(land.start));
      g.fillStyle = C.gold;
      g.beginPath();
      g.moveTo(sx, sy - 8); g.lineTo(sx - 6, sy - 20); g.lineTo(sx + 6, sy - 20);
      g.closePath(); g.fill();
      g.fillRect(sx - 2, sy - 32, 4, 13);
      g.font = K.f(10, 700); g.textAlign = 'center'; g.fillStyle = C.gold;
      g.fillText('start', K.clamp(sx, x0 + 16, x1 - 16), sy - 36);

      if (ball) {
        var bx = px(ball.x), byy = py(fx(ball.x));
        g.fillStyle = C.fg;
        g.beginPath(); g.arc(bx, byy - 7, 6.5, 0, 7); g.fill();
        g.fillStyle = 'rgba(230,237,243,0.25)';
        g.beginPath(); g.arc(bx, byy - 7, 11, 0, 7); g.fill();
      }

      // the region names sit on the ground, matching the chips underneath
      g.font = K.f(10, 600); g.textAlign = 'center';
      for (var r = 0; r < wells.length; r++) {
        var cxp = px((wells[r].from + wells[r].to) / 2);
        g.fillStyle = picked === wells[r].id ? C.accent : '#5b6672';
        g.fillText(wells[r].id, K.clamp(cxp, x0 + 20, x1 - 20), y1 + 15);
      }
    };
    return {
      destroy: function () {
        stage.destroy();
        stage.canvas.removeEventListener('mousedown', tap);
        stage.canvas.removeEventListener('touchstart', tap);
      }
    };
  });
})(window);
