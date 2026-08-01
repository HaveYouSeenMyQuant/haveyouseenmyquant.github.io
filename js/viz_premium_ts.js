/* QQ visuals — the two premium sets: the Two Sigma set and Brainteaser classics.
 *
 * Same contract and same house rule as js/viz.js: animate the thing, never draw
 * the formula. Loads after viz_lab.js and only ever calls QQViz.register.
 *
 * The Two Sigma set — data, models, and the traps between them
 *   tsPerfectFit       a lookup table that fits any past, racing its own future
 *   tsLeakage          four columns; tap one and watch the cancellers sort
 *   tsAccuracyTrap     the model that flags nothing, scored payment by payment
 *   tsThresholdDial    one dial: flag more, catch more, be wrong more
 *   tsRollingWindows   twelve stretches, two records, stepped through
 *   tsRegressionMean   pick the unlucky ten, then run the next month
 *   tsSimpson          twelve shops, one line, then two
 *   tsTimeSplit        the same model under a shuffled split and a time split
 *   tsSampleSize       drag the flips, watch your chance of spotting the bend
 *   tsDimensions       nearest neighbour as a share of the farthest, by columns
 *   tsWalkCorrelation  correlations between walks that never met
 *   tsEvidenceOrder    four claims, and what fair coins do to each
 *
 * Brainteaser classics — the canon, drawn rather than written
 *   btLockers          a hundred doors, a hundred passes
 *   btHatsLine         the line, the parity call, and eleven deductions
 *   btWine             drag to a bottle, see which tasters sip it
 *   btBridge           playable: send the pairs across, watch the clock
 *   btRopes            playable: light any end, the ropes burn unevenly
 *   btBoarding         a hundred seats, boarded one passenger at a time
 *   btPirates          the split, worked backwards from two pirates
 *   btJugs             playable: fill, empty, pour, and count the moves
 *   btSwitches         three switches, one bulb, one trip — and touch it
 *   btAnts             ants that bounce, and the ghosts that walk through
 *   btBoxes            follow the chain of boxes from your own number
 *   btHatPass          all eight line-ups, opened one at a time
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var U = LAB.util;
  var C = K.C;
  var f = K.f;
  var el = K.el;
  var clamp = K.clamp;
  var lerp = K.lerp;
  var easeOut = K.easeOut;
  var roundRect = K.roundRect;

  var RED = '#f85149';
  var GREEN = '#3fb950';

  /* The shared datasets, the same ones site/verify_answers.py checks against. */
  function DATA() {
    var v = global.QQ_DATA && global.QQ_DATA.vizData;
    return (v && v.premium_ts) || {};
  }
  function commas(n) { return U.commas(n); }

  /* ======================================================================
   * 1. tsPerfectFit — a table with a slot for every code fits any past.
   * ==================================================================== */
  function fitOnce() {
    var days = [], table = {}, i, hits = 0, code, up;
    for (i = 0; i < 20; i++) days.push([U.pickInt(256), Math.random() < 0.5]);
    for (i = 0; i < 20; i++) table['c' + days[i][0]] = days[i][1];
    for (i = 0; i < 20; i++) if (table['c' + days[i][0]] === days[i][1]) hits++;
    code = U.pickInt(256);
    up = Math.random() < 0.5;
    var pred = table.hasOwnProperty('c' + code) ? table['c' + code] : (Math.random() < 0.5);
    return { past: hits / 20, next: pred === up ? 1 : 0 };
  }
  global.QQViz.register('tsPerfectFit', LAB.race({
    lanes: [
      { name: 'on the twenty days it was tuned on', trial: function () { return fitOnce().past; } },
      { name: 'on the next day', trial: function () { return fitOnce().next; } }
    ],
    batches: [50, 1000],
    dp: 3,
    unit: 'right',
    maxV: 1.2,
    aspect: 0.5,
    axisLabel: 'share of days the rule calls correctly',
    idle: 'Fit the table to twenty days, then let it call tomorrow.'
  }));

  /* ======================================================================
   * 2. tsLeakage — tap a column, the customers sort by it.
   * ==================================================================== */
  global.QQViz.register('tsLeakage', function (host, api) {
    var out = K.readout(host, 'Tap a column heading to sort the sixteen customers by it.');
    var stage = K.Stage(host, 1.02);
    var regions = api.regions || [];
    var rows = DATA().leakTable || [];
    var IDS = ['months', 'calls', 'refund', 'plan'];
    var HEAD = { months: 'months', calls: 'calls', refund: 'refund', plan: 'plan' };
    var sel = null, order = [], target = [], shown = [];
    var i;
    for (i = 0; i < rows.length; i++) { order.push(i); target.push(i); shown.push(i); }

    function sortBy(id) {
      var ci = IDS.indexOf(id);
      var idx = [];
      for (var j = 0; j < rows.length; j++) idx.push(j);
      idx.sort(function (a, b) { return rows[b][ci] - rows[a][ci] || a - b; });
      order = idx;
      for (j = 0; j < idx.length; j++) target[idx[j]] = j;
      var topSix = 0;
      for (j = 0; j < 6; j++) if (rows[idx[j]][4]) topSix++;
      return topSix;
    }
    function pick(id, fromCanvas) {
      if (IDS.indexOf(id) < 0) return;
      sel = id;
      if (chips) chips.select(id);
      var topSix = sortBy(id);
      out.innerHTML = 'Sorted by <b>' + HEAD[id] + '</b> — of the top six, <b>' +
        topSix + '</b> of the six cancellers' +
        (topSix === 6 ? '. A clean split.' : '. Still mixed up.');
      api.onInteract(fromCanvas ? 'picture' : 'region');
      api.onSelect(id);
    }
    var chips = K.regionChips(host, regions, function (id) { pick(id, false); });

    function colX(w, c) {
      var pad = 10, markW = 26;
      var cw = (w - pad * 2 - markW) / 4;
      return { x: pad + c * cw, w: cw };
    }
    function onTap(ev) {
      var p = stage.pointer(ev), w = stage.w;
      for (var c = 0; c < 4; c++) {
        var g = colX(w, c);
        if (p.x >= g.x && p.x < g.x + g.w) { pick(IDS[c], true); break; }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var top = 30, rowH = (h - top - 8) / Math.max(1, rows.length);
      var c, r, gx;
      for (c = 0; c < 4; c++) {
        gx = colX(w, c);
        var on = sel === IDS[c];
        g.fillStyle = on ? 'rgba(88,166,255,0.18)' : C.panel;
        roundRect(g, gx.x + 1, 4, gx.w - 2, h - 8, 6);
        g.fill();
        g.fillStyle = on ? C.accent : C.muted;
        g.font = f(11, on ? 800 : 600);
        g.textAlign = 'center';
        g.fillText(HEAD[IDS[c]], gx.x + gx.w / 2, 20);
      }
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'center';
      g.fillText('left?', w - 14, 20);

      for (r = 0; r < rows.length; r++) {
        shown[r] += (target[r] - shown[r]) * 0.22;
        var y = top + shown[r] * rowH + rowH / 2;
        var churn = rows[r][4];
        for (c = 0; c < 4; c++) {
          gx = colX(w, c);
          g.fillStyle = churn ? RED : 'rgba(139,148,158,0.85)';
          g.font = f(Math.min(11, rowH * 0.62), churn ? 700 : 500);
          g.textAlign = 'center';
          var v = rows[r][c];
          g.fillText(c === 2 && v === 0 ? '—' : String(v), gx.x + gx.w / 2, y + 4);
        }
        g.beginPath();
        g.arc(w - 14, y, 4, 0, 7);
        g.fillStyle = churn ? RED : '#2b3440';
        g.fill();
      }
      if (!sel) {
        g.fillStyle = C.muted;
        g.font = f(10, 600);
        g.textAlign = 'left';
        g.fillText('red = cancelled', 10, h - 1);
      }
    };
    return {
      destroy: stage.destroy,
      select: function (id) { sel = id; if (chips) chips.select(id); sortBy(id); }
    };
  });

  /* ======================================================================
   * 3. tsAccuracyTrap — the model that flags nothing, scored honestly.
   * ==================================================================== */
  global.QQViz.register('tsAccuracyTrap', LAB.tally({
    cats: ['model right', 'model wrong'],
    trial: function () { return U.pickInt(500) === 0 ? 'model wrong' : 'model right'; },
    batches: [200, 5000],
    axisLabel: 'every payment, judged against a model that flags nothing',
    idle: 'Run payments past the model that says "not fraud" to all of them.'
  }));

  /* ======================================================================
   * 4. tsThresholdDial — flag more, catch more, be wrong more.
   * ==================================================================== */
  var alertCum = null;
  function alertCounts() {
    if (alertCum) return alertCum;
    var rows = (DATA().alerts || []).slice();
    rows.sort(function (a, b) { return b[0] - a[0]; });
    var cum = [0], i;
    for (i = 0; i < rows.length; i++) cum.push(cum[i] + (rows[i][1] === 1 ? 1 : 0));
    alertCum = cum;
    return cum;
  }
  global.QQViz.register('tsThresholdDial', LAB.dial({
    min: 1, max: 200, step: 1, value: 100,
    label: 'how many payments you flag',
    aspect: 0.62,
    ymin: 0, ymax: 12,
    yLabel: 'real frauds caught',
    xmin: 'flag 1', xmax: 'flag all 200',
    fill: true,
    f: function (n) {
      var cum = alertCounts();
      var k = clamp(Math.round(n), 0, cum.length - 1);
      return cum[k];
    },
    readout: function (n, caught) {
      var k = Math.round(n), c = Math.round(caught);
      return 'Flagging the <b>' + k + '</b> riskiest &nbsp;·&nbsp; caught <b>' + c +
        '</b> of the 12 &nbsp;·&nbsp; <b>' + (k - c) + '</b> false alarms';
    }
  }));

  /* ======================================================================
   * 5. tsRollingWindows — twelve stretches, two records.
   * ==================================================================== */
  global.QQViz.register('tsRollingWindows', LAB.steps({
    n: 12,
    aspect: 0.72,
    everyMs: 380,
    playLabel: 'Run the twelve',
    caption: function (i) {
      var w = DATA().windows || { steady: [], lumpy: [] };
      if (!i) return 'Twelve three-month stretches, both strategies run over the same ones.';
      var a = 0, b = 0, ta = 0, tb = 0, j;
      for (j = 0; j < i; j++) {
        if (w.steady[j] > 0) a++;
        if (w.lumpy[j] > 0) b++;
        ta += w.steady[j];
        tb += w.lumpy[j];
      }
      return '<span class="tag-a">steady up in <b>' + a + '</b> of ' + i + ', total ' +
        ta.toFixed(1) + '%</span> &nbsp;·&nbsp; <span class="tag-b">lumpy up in <b>' +
        b + '</b> of ' + i + ', total ' + tb.toFixed(1) + '%</span>';
    },
    draw: function (g, w, h, i) {
      var d = DATA().windows || { steady: [], lumpy: [] };
      var names = ['steady', 'lumpy'];
      var series = [d.steady || [], d.lumpy || []];
      var colours = [C.accent, C.gold];
      var pad = 12, laneH = (h - 10) / 2;
      var maxV = 12.5;
      for (var L = 0; L < 2; L++) {
        var top = 6 + L * laneH, mid = top + laneH * 0.62;
        g.fillStyle = C.muted;
        g.font = f(10.5, 600);
        g.textAlign = 'left';
        g.fillText(names[L], pad, top + 11);
        g.strokeStyle = 'rgba(139,148,158,0.3)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(pad, mid + 0.5);
        g.lineTo(w - pad, mid + 0.5);
        g.stroke();
        var bw = (w - pad * 2) / 12;
        for (var k = 0; k < 12; k++) {
          var v = series[L][k] || 0;
          var x = pad + k * bw + 1.5;
          var full = (laneH * 0.45) * (v / maxV);
          var drawn = k < i ? full : 0;
          if (k === i - 1) drawn = full;
          if (!drawn) {
            g.fillStyle = 'rgba(139,148,158,0.16)';
            g.fillRect(x, mid - 2, bw - 3, 4);
            continue;
          }
          g.fillStyle = v > 0 ? colours[L] : RED;
          if (v > 0) g.fillRect(x, mid - drawn, bw - 3, drawn);
          else g.fillRect(x, mid, bw - 3, -drawn);
        }
      }
    }
  }));

  /* ======================================================================
   * 6. tsRegressionMean — the unlucky ten, one month later.
   * ==================================================================== */
  global.QQViz.register('tsRegressionMean', LAB.sim({
    trial: function () {
      var a = [], b = [], idx = [], i;
      for (i = 0; i < 100; i++) { a.push(Math.random()); b.push(Math.random()); idx.push(i); }
      idx.sort(function (x, y) { return a[x] - a[y]; });
      var n = 0;
      for (i = 0; i < 10; i++) if (b[idx[i]] > a[idx[i]]) n++;
      return n;
    },
    mode: 'hist',
    min: 0, max: 10, step: 1,
    perFrame: 40,
    batches: [20, 400],
    dp: 2,
    label: 'improved',
    aspect: 0.6,
    axisLabel: 'how many of the worst ten did better next month',
    emptyHint: 'press run to pick a fresh unlucky ten',
    idle: 'Nobody here is better than anybody else. Run a month, then the next one.'
  }));

  /* ======================================================================
   * 7. tsSimpson — twelve shops, one line, then two.
   * ==================================================================== */
  global.QQViz.register('tsSimpson', LAB.steps({
    n: 1,
    aspect: 0.82,
    playLabel: 'Split by location',
    caption: function (i) {
      return i === 0
        ? 'All twelve together: the shops that spend more on adverts sell <b>less</b>.'
        : '<span class="tag-a">station shops</span> and <span class="tag-b">quiet-road shops</span> taken separately: more adverts, <b>more</b> sales — both times.';
    },
    draw: function (g, w, h, i, t) {
      var shops = DATA().shops || [];
      var pad = 30, left = pad, right = w - 14, top = 14, base = h - 24;
      function X(v) { return left + (right - left) * ((v - 0) / 13); }
      function Y(v) { return base - (base - top) * ((v - 15) / 40); }
      g.strokeStyle = C.line;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(left, base + 0.5);
      g.lineTo(right, base + 0.5);
      g.stroke();
      g.beginPath();
      g.moveTo(left + 0.5, top);
      g.lineTo(left + 0.5, base);
      g.stroke();
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'left';
      g.fillText('sales', 4, top + 4);
      g.textAlign = 'right';
      g.fillText('advert spend', right, base + 15);

      var split = easeOut(clamp(i, 0, 1));
      function line(pts, colour) {
        if (pts.length < 2) return;
        var co = K.polyfit(pts, 1);
        g.strokeStyle = colour;
        g.lineWidth = 2.5;
        g.beginPath();
        var x0 = pts[0][0] - 0.6, x1 = pts[pts.length - 1][0] + 0.6;
        g.moveTo(X(x0), Y(co[0] + co[1] * x0));
        g.lineTo(X(x1), Y(co[0] + co[1] * x1));
        g.stroke();
      }
      var all = [], gA = [], gB = [], k;
      for (k = 0; k < shops.length; k++) {
        all.push([shops[k][0], shops[k][1]]);
        (shops[k][2] === 0 ? gA : gB).push([shops[k][0], shops[k][1]]);
      }
      if (split < 1) {
        g.globalAlpha = 1 - split;
        line(all, 'rgba(248,81,73,0.9)');
        g.globalAlpha = 1;
      }
      if (split > 0) {
        g.globalAlpha = split;
        line(gA, C.accent);
        line(gB, C.gold);
        g.globalAlpha = 1;
      }
      for (k = 0; k < shops.length; k++) {
        var s = shops[k];
        g.beginPath();
        g.arc(X(s[0]), Y(s[1]), 6, 0, 7);
        var grey = 'rgba(139,148,158,0.9)';
        g.fillStyle = split < 0.5 ? grey : (s[2] === 0 ? C.accent : C.gold);
        g.fill();
      }
    }
  }));

  /* ======================================================================
   * 8. tsTimeSplit — the same model, two ways of holding data back.
   * ==================================================================== */
  function splitTrial(shuffled) {
    var days = 120, y = [0], i;
    for (i = 1; i < days; i++) y.push(y[i - 1] + U.gauss());
    var isTest = [], test = [];
    for (i = 0; i < days; i++) isTest.push(false);
    if (shuffled) {
      var idx = [];
      for (i = 0; i < days; i++) idx.push(i);
      U.shuffle(idx);
      for (i = 0; i < days / 5; i++) isTest[idx[i]] = true;
    } else {
      for (i = days - Math.floor(days / 5); i < days; i++) isTest[i] = true;
    }
    var train = [];
    for (i = 0; i < days; i++) { if (isTest[i]) test.push(i); else train.push(i); }
    var err = 0;
    for (i = 0; i < test.length; i++) {
      var t = test[i], lo = null, hi = null, j;
      for (j = 0; j < train.length; j++) {
        if (train[j] < t) lo = train[j];
        if (train[j] > t) { hi = train[j]; break; }
      }
      var guess = lo === null ? y[hi] : (hi === null ? y[lo] : (y[lo] + y[hi]) / 2);
      err += Math.abs(guess - y[t]);
    }
    return err / Math.max(1, test.length);
  }
  global.QQViz.register('tsTimeSplit', LAB.race({
    lanes: [
      { name: 'shuffled: a random fifth held back', trial: function () { return splitTrial(true); } },
      { name: 'honest: the last fifth held back', trial: function () { return splitTrial(false); } }
    ],
    batches: [5, 50],
    dp: 2,
    unit: 'off',
    aspect: 0.5,
    axisLabel: 'how far out the same model is, on average',
    idle: 'One model, one set of prices, two ways of holding days back.'
  }));

  /* ======================================================================
   * 9. tsSampleSize — how much data a one-per-cent bend needs.
   * ==================================================================== */
  function erf(x) {
    var s = x < 0 ? -1 : 1, t;
    x = Math.abs(x);
    t = 1 / (1 + 0.3275911 * x);
    var y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
      - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function spotChance(n) {
    /* a two-sided 5% test on n flips against a coin that lands heads 51% */
    var z = (0.01 * Math.sqrt(n)) / 0.5 - 1.96;
    return 0.5 * (1 + erf(z / Math.SQRT2));
  }
  global.QQViz.register('tsSampleSize', LAB.dial({
    min: 2, max: 6, step: 0.02, value: 3,
    label: 'how many flips (each step is ten times more)',
    aspect: 0.6,
    ymin: 0, ymax: 100,
    yLabel: 'chance you notice the bend',
    xmin: '100 flips', xmax: 'a million',
    fill: true,
    f: function (x) { return 100 * spotChance(Math.pow(10, x)); },
    readout: function (x, y) {
      var n = Math.pow(10, x);
      var r = n >= 1000 ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10;
      return '<b>' + commas(r) + '</b> flips &nbsp;·&nbsp; you would spot a 51% coin <b>' +
        Math.round(y) + '%</b> of the time';
    }
  }));

  /* ======================================================================
   * 10. tsDimensions — near and far, as the columns pile up.
   * ==================================================================== */
  global.QQViz.register('tsDimensions', LAB.bars({
    aspect: 0.6,
    items: function () {
      var dims = [2, 5, 20, 100], out = [], d, i, k, n = 200;
      for (d = 0; d < dims.length; d++) {
        var cols = dims[d], pts = [], p;
        for (i = 0; i < n; i++) {
          p = [];
          for (k = 0; k < cols; k++) p.push(Math.random());
          pts.push(p);
        }
        var lo = Infinity, hi = 0;
        for (i = 1; i < n; i++) {
          var s = 0;
          for (k = 0; k < cols; k++) {
            var dd = pts[0][k] - pts[i][k];
            s += dd * dd;
          }
          s = Math.sqrt(s);
          if (s < lo) lo = s;
          if (s > hi) hi = s;
        }
        out.push({ label: cols + ' cols', value: Math.round(100 * lo / hi), cols: cols });
      }
      return out;
    },
    valueFmt: function (v) { return v + '%'; },
    axisLabel: 'nearest neighbour, as a share of the distance to the farthest',
    idle: 'Tap a bar. Five hundred customers, described by more and more numbers.',
    caption: function (it) {
      return 'With <b>' + it.cols + '</b> numbers each, your nearest customer is <b>' +
        it.value + '%</b> of the way to your farthest.';
    }
  }));

  /* ======================================================================
   * 11. tsWalkCorrelation — two walks that never met.
   * ==================================================================== */
  global.QQViz.register('tsWalkCorrelation', LAB.sim({
    trial: function () {
      var n = 251, x = 0, y = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, i;
      for (i = 0; i < n; i++) {
        sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
        x += U.gauss(); y += U.gauss();
      }
      var cov = sxy - sx * sy / n, vx = sxx - sx * sx / n, vy = syy - sy * sy / n;
      var r = (vx > 0 && vy > 0) ? cov / Math.sqrt(vx * vy) : 0;
      return Math.round(r * 10) / 10;
    },
    mode: 'hist',
    min: -1, max: 1, step: 0.1,
    perFrame: 5,
    batches: [10, 150],
    dp: 2,
    label: 'correlation',
    aspect: 0.6,
    highlight: function (k) { return Math.abs(k) > 0.5; },
    axisLabel: 'correlation of two unconnected walks (gold = past 0.5)',
    emptyHint: 'press run to grow a pair of unrelated prices',
    idle: 'Two prices, each a pure coin flip, with nothing in common.'
  }));

  /* ======================================================================
   * 12. tsEvidenceOrder — what fair coins do to each claim.
   * ==================================================================== */
  global.QQViz.register('tsEvidenceOrder', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Run fair coins and see how often luck alone matches each claim.');
    var stage = K.Stage(host, 0.62);
    var studies = DATA().studies || [[8, 10], [60, 100], [550, 1000], [5200, 10000]];
    var hits = [], runs = 0, pending = 0;
    var i;
    for (i = 0; i < studies.length; i++) hits.push(0);

    function oneRun() {
      for (var s = 0; s < studies.length; s++) {
        var k = studies[s][0], n = studies[s][1], heads = 0, j;
        for (j = 0; j < n; j++) if (Math.random() < 0.5) heads++;
        if (Math.abs(heads - n / 2) >= Math.abs(k - n / 2)) hits[s]++;
      }
      runs++;
    }
    function render() {
      if (!runs) { out.innerHTML = 'Run fair coins and see how often luck alone matches each claim.'; return; }
      out.innerHTML = '<b>' + commas(runs) + '</b> honest coins run through all four claims. ' +
        'A claim luck copies often is weak evidence.';
    }
    K.button(ctr, 'Run 40 fair coins', function () { pending += 40; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      runs = 0; pending = 0;
      for (var s = 0; s < hits.length; s++) hits[s] = 0;
      render();
      api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 3);
      for (var s = 0; s < take; s++) oneRun();
      pending -= take;
      if (take) render();

      var pad = 12, laneH = (h - 8) / studies.length;
      for (var i2 = 0; i2 < studies.length; i2++) {
        var k = studies[i2][0], n = studies[i2][1];
        var y = 4 + i2 * laneH;
        g.fillStyle = C.fg;
        g.font = f(11.5, 600);
        g.textAlign = 'left';
        g.fillText(commas(k) + ' heads in ' + commas(n), pad, y + 13);
        var rate = runs ? hits[i2] / runs : 0;
        g.textAlign = 'right';
        g.font = f(11.5, 800);
        g.fillStyle = runs ? (rate > 0.02 ? C.gold : C.accent) : C.dim;
        g.fillText(runs ? hits[i2] + ' of ' + runs + ' fair coins matched it' : 'not run yet',
          w - pad, y + 13);
        var barY = y + 20, barW = w - pad * 2;
        g.fillStyle = C.panel;
        roundRect(g, pad, barY, barW, 12, 6);
        g.fill();
        if (runs) {
          g.fillStyle = rate > 0.02 ? C.gold : C.accent;
          roundRect(g, pad, barY, Math.max(2, barW * clamp(rate / 0.15, 0, 1)), 12, 6);
          g.fill();
        }
      }
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 13. btLockers — a hundred doors, a hundred passes.
   * ==================================================================== */
  global.QQViz.register('btLockers', LAB.steps({
    n: 100,
    aspect: 1.0,
    everyMs: 150,
    playLabel: 'Walk the corridor',
    init: function () { return { doors: [], pass: 0 }; },
    onStep: function (i, st) {
      var doors = [], d, step;
      for (d = 0; d <= 100; d++) doors.push(false);
      for (step = 1; step <= i; step++)
        for (d = step; d <= 100; d += step) doors[d] = !doors[d];
      st.doors = doors;
      st.pass = i;
      return st;
    },
    caption: function (i, st) {
      var open = 0;
      for (var d = 1; d <= 100; d++) if (st.doors[d]) open++;
      if (!i) return 'A hundred doors, every one of them shut.';
      return 'Pass <b>' + i + '</b>: every ' + i + (i === 1 ? 'st' : (i === 2 ? 'nd' : (i === 3 ? 'rd' : 'th'))) +
        ' door flipped &nbsp;·&nbsp; <b>' + open + '</b> open';
    },
    draw: function (g, w, h, i, t, st) {
      var cols = 10, size = Math.min((w - 16) / cols, (h - 16) / 10);
      var ox = (w - size * cols) / 2, oy = (h - size * 10) / 2;
      for (var d = 1; d <= 100; d++) {
        var r = Math.floor((d - 1) / cols), c = (d - 1) % cols;
        var x = ox + c * size, y = oy + r * size;
        var open = st.doors[d];
        var touched = i > 0 && d % i === 0;
        g.fillStyle = open ? 'rgba(210,153,34,0.9)' : '#1c232c';
        roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4);
        g.fill();
        if (touched) {
          g.strokeStyle = C.accent;
          g.lineWidth = 1.6;
          roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4);
          g.stroke();
        }
        if (size > 20) {
          g.fillStyle = open ? '#0d1117' : '#4a5561';
          g.font = f(Math.max(8, size * 0.34), open ? 700 : 500);
          g.textAlign = 'center';
          g.fillText(String(d), x + size / 2, y + size / 2 + size * 0.12);
        }
      }
    }
  }));

  /* ======================================================================
   * 14. btHatsLine — the parity call, then eleven deductions.
   * ==================================================================== */
  var HATS_N = 12;
  function newHats() {
    var hats = [], i;
    for (i = 0; i < HATS_N; i++) hats.push(U.pickInt(2));   // 1 = white
    return hats;
  }
  function hatsSaid(hats, upTo) {
    /* what the first `upTo` of them say, in order from the back */
    var said = [], heard, i, ahead, j;
    if (upTo <= 0) return said;
    ahead = 0;
    for (j = 1; j < HATS_N; j++) ahead ^= hats[j];
    said.push(ahead);                                        // the parity call
    heard = ahead;
    for (i = 1; i < upTo && i < HATS_N; i++) {
      var rest = 0;
      for (j = i + 1; j < HATS_N; j++) rest ^= hats[j];
      var mine = heard ^ rest;
      said.push(mine);
      heard ^= mine;
    }
    return said;
  }
  global.QQViz.register('btHatsLine', LAB.steps({
    n: HATS_N,
    aspect: 0.66,
    everyMs: 700,
    playLabel: 'Let them speak',
    init: function () { return { hats: newHats() }; },
    onStep: function (i, st) {
      if (i === 0) st.hats = newHats();
      return st;
    },
    caption: function (i, st) {
      var said = hatsSaid(st.hats, i);
      if (!i) return 'Twelve of them, hats just dealt. Each sees only the hats in front.';
      var who = i - 1, colour = said[who] ? 'white' : 'black';
      var right = said[who] === st.hats[who];
      if (who === 0) {
        return 'The one at the back counts the white hats ahead and says <b>' + colour +
          '</b> — he is <b>' + (right ? 'lucky' : 'wrong') + '</b>, and he always was going to be guessing.';
      }
      return 'Number ' + (who + 1) + ' works out <b>' + colour + '</b> — <b>' +
        (right ? 'correct' : 'IMPOSSIBLE') + '</b>. ' + who + ' of ' + who + ' safe so far.';
    },
    draw: function (g, w, h, i, t, st) {
      var said = hatsSaid(st.hats, i);
      var pad = 8, cell = (w - pad * 2) / HATS_N;
      var cy = h * 0.44, r = Math.min(cell * 0.36, 15);
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'left';
      g.fillText('back of the line', pad, 12);
      g.textAlign = 'right';
      g.fillText('front — sees nobody', w - pad, 12);
      for (var k = 0; k < HATS_N; k++) {
        var x = pad + cell * (k + 0.5);
        var spoken = k < said.length;
        g.beginPath();
        g.arc(x, cy, r, 0, 7);
        g.fillStyle = st.hats[k] ? '#e6edf3' : '#20262e';
        g.fill();
        g.strokeStyle = spoken ? (said[k] === st.hats[k] ? GREEN : RED) : C.dim;
        g.lineWidth = spoken ? 2.4 : 1.2;
        g.stroke();
        /* the little body under the hat */
        g.fillStyle = 'rgba(139,148,158,0.35)';
        roundRect(g, x - r * 0.7, cy + r + 3, r * 1.4, r * 1.1, 3);
        g.fill();
        if (spoken) {
          g.fillStyle = said[k] === st.hats[k] ? GREEN : RED;
          g.font = f(9.5, 700);
          g.textAlign = 'center';
          g.fillText(said[k] ? 'white' : 'black', x, cy - r - 6);
        }
        g.fillStyle = C.muted;
        g.font = f(9, 500);
        g.textAlign = 'center';
        g.fillText(String(k + 1), x, cy + r + r * 1.1 + 14);
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'center';
      g.fillText('each one can see every hat to the right of their own', w / 2, h - 2);
    }
  }));

  /* ======================================================================
   * 15. btWine — drag to a bottle, see who sips it.
   * ==================================================================== */
  global.QQViz.register('btWine', LAB.drag({
    min: 1, max: 1000, value: 613, snap: 1, axis: 'x', grabAt: true, gain: 1,
    aspect: 0.66,
    hint: 'drag along the shelf',
    readout: function (v) {
      var n = Math.round(v) - 1, who = [], i;
      for (i = 0; i < 10; i++) if ((n >> i) & 1) who.push(i + 1);
      if (!who.length) return 'Bottle <b>1</b> — nobody sips it at all. If all ten live, that is the poisoned one.';
      return 'Bottle <b>' + Math.round(v) + '</b> is sipped by tasters <b>' + who.join(', ') +
        '</b> &nbsp;·&nbsp; no other bottle has that set';
    },
    draw: function (g, w, h, v) {
      var n = Math.round(v) - 1;
      var pad = 12, top = 30;
      /* the shelf of a thousand bottles, with the chosen one marked */
      g.fillStyle = C.panel;
      roundRect(g, pad, top, w - pad * 2, 14, 7);
      g.fill();
      var px = pad + (w - pad * 2) * (n / 999);
      g.fillStyle = C.gold;
      roundRect(g, px - 2, top - 4, 4, 22, 2);
      g.fill();
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'left';
      g.fillText('bottle 1', pad, top - 8);
      g.textAlign = 'right';
      g.fillText('bottle 1,000', w - pad, top - 8);

      g.fillStyle = C.fg;
      g.font = f(22, 800);
      g.textAlign = 'center';
      g.fillText('#' + (n + 1), w / 2, top + 46);

      /* ten tasters, the ones who sip this bottle lit */
      var cols = 5, cw = (w - pad * 2) / cols;
      var cupR = Math.min(cw * 0.28, 17);
      for (var i = 0; i < 10; i++) {
        var r = Math.floor(i / cols), c = i % cols;
        var x = pad + cw * (c + 0.5);
        var y = top + 72 + r * (cupR * 2.6);
        var on = (n >> i) & 1;
        g.beginPath();
        g.arc(x, y, cupR, 0, 7);
        g.fillStyle = on ? C.accent : C.panel;
        g.fill();
        g.strokeStyle = on ? C.accent : C.dim;
        g.lineWidth = 1.5;
        g.stroke();
        g.fillStyle = on ? '#0d1117' : C.muted;
        g.font = f(Math.max(9, cupR * 0.72), on ? 800 : 600);
        g.textAlign = 'center';
        g.fillText(String(i + 1), x, y + cupR * 0.28);
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'center';
      g.fillText('lit = this taster sips this bottle', w / 2, h - 2);
    }
  }));

  /* ======================================================================
   * 16. btBridge — playable. Send pairs across and watch the clock.
   * ==================================================================== */
  global.QQViz.register('btBridge', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.74);
    var TIMES = [1, 2, 5, 10];
    var side, sel, clock, torch, moving;

    function reset() {
      side = [0, 0, 0, 0];          // 0 = near bank, 1 = far bank
      sel = [false, false, false, false];
      clock = 0;
      torch = 0;
      moving = null;
      render();
    }
    function chosen() {
      var out2 = [];
      for (var i = 0; i < 4; i++) if (sel[i]) out2.push(i);
      return out2;
    }
    function done() { return side[0] && side[1] && side[2] && side[3]; }
    function render() {
      if (done()) {
        out.innerHTML = 'Everyone across in <b>' + clock + ' minutes</b>' +
          (clock === 17 ? ' — nothing beats that.' : '. Try again for fewer.');
      } else {
        var c = chosen();
        out.innerHTML = '<b>' + clock + '</b> minutes gone &nbsp;·&nbsp; ' +
          (c.length ? 'sending ' + c.map(function (i) { return TIMES[i]; }).join(' and ') +
            ' &nbsp;·&nbsp; they go at ' + Math.max.apply(null, c.map(function (i) { return TIMES[i]; })) + ' minutes'
            : 'tap ' + (torch === 0 ? 'one or two on the near bank' : 'one to bring the torch back'));
      }
    }
    var goBtn = K.button(ctr, 'Send them ›', function () {
      var c = chosen();
      if (!c.length || done()) return;
      var cost = 0;
      for (var i = 0; i < c.length; i++) cost = Math.max(cost, TIMES[c[i]]);
      moving = { who: c.slice(), from: torch, t0: performance.now() };
      for (i = 0; i < c.length; i++) { side[c[i]] = 1 - torch; sel[c[i]] = false; }
      torch = 1 - torch;
      clock += cost;
      render();
      api.onInteract('cross');
    });
    goBtn.classList.add('primary');
    K.button(ctr, 'Start again', function () { reset(); api.onInteract('reset'); })
      .classList.add('small');

    function pos(i, w, h) {
      var bankW = w * 0.26, y = h * 0.32 + (i % 2) * 42 + (i > 1 ? 0 : 0);
      var lane = h * 0.28 + Math.floor(i / 2) * 46 + (i % 2) * 23;
      var x = side[i] === 0 ? 22 + (i % 2) * 30 : w - 22 - (i % 2) * 30;
      return { x: x, y: lane, bank: bankW };
    }
    function onTap(ev) {
      if (done()) { ev.preventDefault(); return; }
      var p = stage.pointer(ev);
      for (var i = 0; i < 4; i++) {
        var q = pos(i, stage.w, stage.h - 6);
        var dx = p.x - q.x, dy = p.y - q.y;
        if (dx * dx + dy * dy < 26 * 26 && side[i] === torch) {
          if (!sel[i] && chosen().length >= 2) break;
          sel[i] = !sel[i];
          render();
          api.onInteract('pick');
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });
    reset();

    stage.draw = function (g, w, h) {
      var bank = w * 0.22;
      g.fillStyle = '#161b22';
      roundRect(g, 0, h * 0.16, bank, h * 0.72, 6);
      g.fill();
      roundRect(g, w - bank, h * 0.16, bank, h * 0.72, 6);
      g.fill();
      /* the bridge */
      g.strokeStyle = 'rgba(139,148,158,0.4)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bank, h * 0.35);
      g.lineTo(w - bank, h * 0.35);
      g.moveTo(bank, h * 0.72);
      g.lineTo(w - bank, h * 0.72);
      g.stroke();
      for (var r = 0; r < 8; r++) {
        var rx = bank + (w - bank * 2) * (r / 7);
        g.beginPath();
        g.moveTo(rx, h * 0.35);
        g.lineTo(rx, h * 0.72);
        g.stroke();
      }
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'center';
      g.fillText('near bank', bank / 2, h * 0.13);
      g.fillText('far bank', w - bank / 2, h * 0.13);

      var anim = moving ? clamp((performance.now() - moving.t0) / 550, 0, 1) : 1;
      for (var i = 0; i < 4; i++) {
        var q = pos(i, w, h);
        var x = q.x;
        if (moving && moving.who.indexOf(i) >= 0 && anim < 1) {
          var fromX = moving.from === 0 ? 22 + (i % 2) * 30 : w - 22 - (i % 2) * 30;
          x = lerp(fromX, q.x, easeOut(anim));
        }
        g.beginPath();
        g.arc(x, q.y, 17, 0, 7);
        g.fillStyle = sel[i] ? C.accent : C.panel;
        g.fill();
        g.strokeStyle = sel[i] ? C.accent : (side[i] === torch ? C.muted : C.dim);
        g.lineWidth = sel[i] ? 3 : 1.5;
        g.stroke();
        g.fillStyle = sel[i] ? '#0d1117' : C.fg;
        g.font = f(13, 800);
        g.textAlign = 'center';
        g.fillText(String(TIMES[i]), x, q.y + 4.5);
      }
      /* the torch */
      var tx = torch === 0 ? bank * 0.5 : w - bank * 0.5;
      g.beginPath();
      g.arc(tx, h * 0.86, 7, 0, 7);
      g.fillStyle = C.gold;
      g.fill();
      g.fillStyle = C.gold;
      g.font = f(10, 700);
      g.textAlign = 'center';
      g.fillText('torch', tx, h * 0.86 + 20);

      g.fillStyle = C.fg;
      g.font = f(15, 800);
      g.textAlign = 'left';
      g.fillText(clock + ' min', 8, 16);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 17. btRopes — playable. Light any end; they burn unevenly.
   * ==================================================================== */
  global.QQViz.register('btRopes', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap either end of either rope to light it.');
    var stage = K.Stage(host, 0.62);
    var SEGS = 20, SPEED = 8;              // eight rope-minutes per real second
    var ropes, clock, last;

    function profile() {
      var w = [], total = 0, i;
      for (i = 0; i < SEGS; i++) { var v = 0.25 + Math.random() * 1.75; w.push(v); total += v; }
      for (i = 0; i < SEGS; i++) w[i] = w[i] * 60 / total;      // minutes per segment
      return w;
    }
    function reset() {
      ropes = [
        { left: 0, right: 0, burnt: [0, 0], mins: profile(), out: null },
        { left: 0, right: 0, burnt: [0, 0], mins: profile(), out: null }
      ];
      clock = 0;
      last = null;
      render();
    }
    function remaining(r) { return Math.max(0, 60 - r.burnt[0] - r.burnt[1]); }
    function render() {
      var parts = [];
      for (var i = 0; i < 2; i++) {
        parts.push('rope ' + (i + 1) + ': ' +
          (ropes[i].out !== null ? '<b>burnt out at ' + ropes[i].out.toFixed(0) + ' min</b>'
            : (ropes[i].left + ropes[i].right) + ' end' + ((ropes[i].left + ropes[i].right) === 1 ? '' : 's') + ' lit'));
      }
      out.innerHTML = 'Clock <b>' + clock.toFixed(0) + ' min</b> &nbsp;·&nbsp; ' + parts.join(' &nbsp;·&nbsp; ');
    }
    K.button(ctr, 'Fresh ropes', function () { reset(); api.onInteract('reset'); })
      .classList.add('small');

    function ropeBox(i, w, h) {
      var pad = 16, barH = 26;
      var y = h * 0.28 + i * (barH + 46);
      return { x: pad + 34, y: y, w: w - pad * 2 - 68, h: barH };
    }
    function onTap(ev) {
      var p = stage.pointer(ev);
      for (var i = 0; i < 2; i++) {
        var b = ropeBox(i, stage.w, stage.h - 6);
        if (p.y < b.y - 20 || p.y > b.y + b.h + 20) continue;
        if (ropes[i].out !== null) continue;
        if (p.x < b.x + 8 && ropes[i].left === 0) { ropes[i].left = 1; api.onInteract('light'); }
        else if (p.x > b.x + b.w - 8 && ropes[i].right === 0) { ropes[i].right = 1; api.onInteract('light'); }
        render();
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });
    reset();

    stage.draw = function (g, w, h, t) {
      if (last === null) last = t;
      var dt = clamp(t - last, 0, 0.1);
      last = t;
      var anyLit = false, i;
      for (i = 0; i < 2; i++) if (ropes[i].out === null && (ropes[i].left + ropes[i].right) > 0) anyLit = true;
      if (anyLit) {
        clock += dt * SPEED;
        for (i = 0; i < 2; i++) {
          var r = ropes[i];
          if (r.out !== null) continue;
          var lit = r.left + r.right;
          if (!lit) continue;
          var eat = dt * SPEED;
          if (r.left) r.burnt[0] += eat;
          if (r.right) r.burnt[1] += eat;
          if (remaining(r) <= 0) {
            var over = -(60 - r.burnt[0] - r.burnt[1]);
            r.burnt[0] -= r.left ? over / lit : 0;
            r.burnt[1] -= r.right ? over / lit : 0;
            r.out = clock - over / lit / SPEED * SPEED * 0;
            r.out = clock;
          }
        }
        render();
      }

      for (i = 0; i < 2; i++) {
        var b = ropeBox(i, w, h), rr = ropes[i];
        g.fillStyle = C.muted;
        g.font = f(10.5, 600);
        g.textAlign = 'left';
        g.fillText('rope ' + (i + 1), 8, b.y + b.h / 2 + 4);
        /* the uneven rope: each segment is a different number of minutes wide */
        var eaten = 0, k, segW = b.w / SEGS;
        var fromLeft = rr.burnt[0], fromRight = rr.burnt[1], acc = 0;
        for (k = 0; k < SEGS; k++) {
          var mins = rr.mins[k];
          var startM = acc, endM = acc + mins;
          acc = endM;
          var gone = (endM <= fromLeft) || (startM >= 60 - fromRight);
          var x = b.x + k * segW;
          g.fillStyle = gone ? '#1a1f27' : (rr.out !== null ? '#2b2118' : '#8a6a3a');
          g.fillRect(x, b.y, segW - 0.6, b.h);
          if (!gone && rr.out === null) {
            g.fillStyle = 'rgba(0,0,0,' + (0.05 + 0.25 * (k % 2)) + ')';
            g.fillRect(x, b.y, segW - 0.6, b.h);
          }
        }
        /* flames */
        var lx = null, rx = null, accum = 0;
        if (rr.out === null && rr.left) {
          accum = 0;
          for (k = 0; k < SEGS; k++) {
            if (accum + rr.mins[k] >= fromLeft) {
              lx = b.x + (k + (fromLeft - accum) / rr.mins[k]) * segW;
              break;
            }
            accum += rr.mins[k];
          }
        }
        if (rr.out === null && rr.right) {
          accum = 0;
          for (k = SEGS - 1; k >= 0; k--) {
            if (accum + rr.mins[k] >= fromRight) {
              rx = b.x + (k + 1 - (fromRight - accum) / rr.mins[k]) * segW;
              break;
            }
            accum += rr.mins[k];
          }
        }
        [lx, rx].forEach(function (fx) {
          if (fx === null) return;
          g.fillStyle = C.gold;
          g.beginPath();
          g.arc(fx, b.y + b.h / 2, 6 + Math.sin(t * 14) * 1.5, 0, 7);
          g.fill();
        });
        if (rr.out !== null) {
          g.fillStyle = C.muted;
          g.font = f(10, 700);
          g.textAlign = 'center';
          g.fillText('burnt out at ' + rr.out.toFixed(0) + ' min', b.x + b.w / 2, b.y - 8);
        } else {
          g.fillStyle = 'rgba(139,148,158,0.75)';
          g.font = f(9.5, 600);
          g.textAlign = 'center';
          if (!rr.left) g.fillText('tap', b.x - 12, b.y + b.h / 2 + 4);
          if (!rr.right) g.fillText('tap', b.x + b.w + 14, b.y + b.h / 2 + 4);
        }
      }
      g.fillStyle = C.fg;
      g.font = f(16, 800);
      g.textAlign = 'left';
      g.fillText(clock.toFixed(0) + ' min', 8, 18);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 18. btBoarding — a hundred seats, one lost boarding pass.
   * ==================================================================== */
  global.QQViz.register('btBoarding', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Board one plane slowly, or run five hundred at once.');
    var stage = K.Stage(host, 0.86);
    var N = 100;
    var seats, owner, step, playing, planes = 0, wins = 0;

    function fresh() {
      seats = [];
      owner = [];
      for (var i = 0; i < N; i++) { seats.push(-1); owner.push(-1); }
      step = 0;
      playing = false;
    }
    function seatOne(p) {
      /* passenger p takes their seat, or a random free one */
      var free = [], i;
      if (p === 0 || seats[p] !== -1) {
        for (i = 0; i < N; i++) if (seats[i] === -1) free.push(i);
        var s = free[U.pickInt(free.length)];
        seats[s] = p;
        return s;
      }
      seats[p] = p;
      return p;
    }
    function runOne() {
      fresh();
      for (var p = 0; p < N; p++) seatOne(p);
      return seats[N - 1] === N - 1;
    }
    function render() {
      var tail = planes ? ' &nbsp;·&nbsp; last passenger got their own seat in <b>' + wins +
        '</b> of <b>' + planes + '</b> planes (' + (100 * wins / planes).toFixed(1) + '%)' : '';
      if (step > 0 && step < N) {
        out.innerHTML = '<b>' + step + '</b> of the hundred aboard' + tail;
      } else if (step >= N) {
        out.innerHTML = (seats[N - 1] === N - 1
          ? 'The last passenger <b>did</b> get their own seat.'
          : 'The last passenger did <b>not</b> get their own seat.') + tail;
      } else {
        out.innerHTML = 'Board one plane slowly, or run five hundred at once.' + tail;
      }
    }
    K.button(ctr, 'Board one plane', function () {
      fresh();
      playing = true;
      render();
      api.onInteract('board');
    }).classList.add('primary');
    K.button(ctr, 'Run 500 planes', function () {
      for (var i = 0; i < 500; i++) { planes++; if (runOne()) wins++; }
      step = N;
      render();
      api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Reset', function () {
      planes = 0; wins = 0; fresh(); render();
      api.onInteract('reset');
    }).classList.add('small');
    fresh();
    render();

    stage.draw = function (g, w, h) {
      if (playing && step < N) {
        seatOne(step);
        step++;
        if (step >= N) { playing = false; planes++; if (seats[N - 1] === N - 1) wins++; }
        render();
      }
      var cols = 10, pad = 10, top = 8;
      var size = Math.min((w - pad * 2) / cols, (h - top - 26) / 10);
      var ox = (w - size * cols) / 2, oy = top;
      for (var s = 0; s < N; s++) {
        var r = Math.floor(s / cols), c = s % cols;
        var x = ox + c * size, y = oy + r * size;
        var who = seats[s];
        g.fillStyle = who === -1 ? '#1c232c' : (who === s ? 'rgba(88,166,255,0.85)' : C.gold);
        roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 3);
        g.fill();
        if (s === N - 1) {
          g.strokeStyle = who === -1 ? C.muted : (who === s ? GREEN : RED);
          g.lineWidth = 2;
          roundRect(g, x + 1, y + 1, size - 2, size - 2, 3);
          g.stroke();
        }
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'left';
      g.fillText('blue = in their own seat · gold = somebody else’s', pad, h - 12);
      g.textAlign = 'right';
      g.fillText('ringed = the last passenger', w - pad, h - 12);
      if (planes) {
        var bw = w - pad * 2;
        g.fillStyle = C.panel;
        roundRect(g, pad, h - 8, bw, 6, 3);
        g.fill();
        g.fillStyle = C.accent;
        roundRect(g, pad, h - 8, Math.max(2, bw * wins / planes), 6, 3);
        g.fill();
      }
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 19. btPirates — the split, worked backwards.
   * ==================================================================== */
  function pirateSplit(n) {
    if (n === 1) return [100];
    var below = pirateSplit(n - 1);
    var need = Math.ceil(n / 2) - 1;
    var alloc = [], i;
    for (i = 0; i < n; i++) alloc.push(0);
    var order = [];
    for (i = 0; i < n - 1; i++) order.push(i);
    order.sort(function (a, b) { return below[a] - below[b] || a - b; });
    var spent = 0;
    for (i = 0; i < need; i++) {
      alloc[order[i] + 1] = below[order[i]] + 1;
      spent += below[order[i]] + 1;
    }
    alloc[0] = 100 - spent;
    return alloc;
  }
  global.QQViz.register('btPirates', LAB.steps({
    n: 3,
    aspect: 0.72,
    everyMs: 900,
    playLabel: 'Work back up',
    caption: function (i) {
      var m = i + 2, a = pirateSplit(m);
      var need = Math.ceil(m / 2) - 1;
      if (m === 2) return 'Two left: the senior keeps all hundred, because his own vote is half of two.';
      return '<b>' + m + ' pirates</b>: the proposer needs <b>' + need + '</b> vote' +
        (need === 1 ? '' : 's') + ' besides his own, and buys the cheapest — the ones who get nothing if he goes overboard.';
    },
    draw: function (g, w, h, i) {
      var m = i + 2, alloc = pirateSplit(m), below = m > 2 ? pirateSplit(m - 1) : null;
      var pad = 14, cw = (w - pad * 2) / m;
      for (var k = 0; k < m; k++) {
        var x = pad + cw * (k + 0.5);
        var coins = alloc[k];
        var isProposer = k === 0;
        var wouldGet = below && k > 0 ? below[k - 1] : null;
        var buys = wouldGet !== null && coins > wouldGet;
        /* the pirate */
        g.beginPath();
        g.arc(x, h * 0.22, Math.min(cw * 0.3, 18), 0, 7);
        g.fillStyle = isProposer ? C.accent : C.panel;
        g.fill();
        g.strokeStyle = buys ? GREEN : (isProposer ? C.accent : C.dim);
        g.lineWidth = buys ? 2.5 : 1.5;
        g.stroke();
        g.fillStyle = isProposer ? '#0d1117' : C.muted;
        g.font = f(11, 800);
        g.textAlign = 'center';
        g.fillText(String(k + 1), x, h * 0.22 + 4);
        /* the coins as a stack */
        var stackH = h * 0.44 * (coins / 100);
        g.fillStyle = coins > 0 ? C.gold : '#232a33';
        roundRect(g, x - Math.min(cw * 0.28, 16), h * 0.78 - stackH, Math.min(cw * 0.56, 32),
          Math.max(3, stackH), 3);
        g.fill();
        g.fillStyle = coins > 0 ? C.gold : C.muted;
        g.font = f(12, 800);
        g.textAlign = 'center';
        g.fillText(String(coins), x, h * 0.78 + 16);
        if (buys) {
          g.fillStyle = GREEN;
          g.font = f(9.5, 700);
          g.fillText('votes yes', x, h * 0.78 + 30);
        }
      }
      g.fillStyle = C.muted;
      g.font = f(10.5, 600);
      g.textAlign = 'left';
      g.fillText(m + ' pirates left — number 1 proposes', pad, 14);
    }
  }));

  /* ======================================================================
   * 20. btJugs — playable. Fill, empty, pour, and count.
   * ==================================================================== */
  global.QQViz.register('btJugs', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Nothing poured yet.');
    var stage = K.Stage(host, 0.72);
    var CAP = [5, 3];
    var jug = [0, 0], shown = [0, 0], moves = 0, best = null;

    function render() {
      var got = jug[0] === 4 || jug[1] === 4;
      out.innerHTML = '<b>' + moves + '</b> move' + (moves === 1 ? '' : 's') +
        ' &nbsp;·&nbsp; five-litre holds <b>' + jug[0] + '</b>, three-litre holds <b>' + jug[1] + '</b>' +
        (got ? ' &nbsp;·&nbsp; <b style="color:' + GREEN + '">four litres, in ' + moves + '</b>' : '');
      if (got && best === null) best = moves;
    }
    function act(fn, name) {
      K.button(ctr, name, function () {
        fn();
        moves++;
        render();
        api.onInteract('pour');
      }).classList.add('small');
    }
    act(function () { jug[0] = CAP[0]; }, 'Fill 5');
    act(function () { jug[1] = CAP[1]; }, 'Fill 3');
    act(function () { jug[0] = 0; }, 'Empty 5');
    act(function () { jug[1] = 0; }, 'Empty 3');
    act(function () {
      var move = Math.min(jug[0], CAP[1] - jug[1]);
      jug[0] -= move; jug[1] += move;
    }, '5 → 3');
    act(function () {
      var move = Math.min(jug[1], CAP[0] - jug[0]);
      jug[1] -= move; jug[0] += move;
    }, '3 → 5');
    K.button(ctr, 'Start again', function () {
      jug = [0, 0]; moves = 0; best = null; render();
      api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var i;
      for (i = 0; i < 2; i++) shown[i] += (jug[i] - shown[i]) * 0.22;
      var baseY = h - 26, maxH = h * 0.68;
      var widths = [w * 0.3, w * 0.24];
      var xs = [w * 0.29, w * 0.71];
      for (i = 0; i < 2; i++) {
        var jw = widths[i], jh = maxH * (CAP[i] / 5);
        var x = xs[i] - jw / 2, y = baseY - jh;
        g.strokeStyle = C.dim;
        g.lineWidth = 2;
        roundRect(g, x, y, jw, jh, 6);
        g.stroke();
        var fill = jh * (shown[i] / CAP[i]);
        g.fillStyle = jug[i] === 4 ? 'rgba(63,185,80,0.75)' : 'rgba(88,166,255,0.7)';
        roundRect(g, x + 2, baseY - fill, jw - 4, Math.max(0, fill - 2), 5);
        g.fill();
        for (var m = 1; m < CAP[i]; m++) {
          var ly = baseY - jh * (m / CAP[i]);
          g.strokeStyle = 'rgba(139,148,158,0.18)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x + 3, ly);
          g.lineTo(x + jw - 3, ly);
          g.stroke();
        }
        g.fillStyle = C.fg;
        g.font = f(16, 800);
        g.textAlign = 'center';
        g.fillText(String(jug[i]), xs[i], y - 10);
        g.fillStyle = C.muted;
        g.font = f(10.5, 600);
        g.fillText(CAP[i] + '-litre jug', xs[i], baseY + 16);
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'center';
      g.fillText('nothing is marked — you can only fill, empty and pour', w / 2, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 21. btSwitches — three switches, one bulb, one trip.
   * ==================================================================== */
  global.QQViz.register('btSwitches', function (host, api) {
    var out = K.readout(host, 'The bulb is dark. You are standing in the room.');
    var ctr = K.controls(host);
    var stage = K.Stage(host, 0.72);
    var regions = api.regions || [];
    var sel = null, felt = false;

    K.button(ctr, 'Touch the bulb', function () {
      felt = true;
      out.innerHTML = 'The bulb is <b>dark</b>, and <b>stone cold</b>.';
      api.onInteract('feel');
    }).classList.add('primary');

    function pick(id, fromCanvas) {
      sel = id;
      if (chips) chips.select(id);
      api.onInteract(fromCanvas ? 'picture' : 'region');
      api.onSelect(id);
    }
    var chips = K.regionChips(host, regions, function (id) { pick(id, false); });

    function switchBox(i, w, h) {
      var sw = Math.min((w - 40) / 3, 76);
      var gap = (w - sw * 3) / 4;
      return { x: gap + i * (sw + gap), y: h * 0.52, w: sw, h: h * 0.3 };
    }
    function onTap(ev) {
      var p = stage.pointer(ev);
      var ids = ['a', 'b', 'c'];
      for (var i = 0; i < 3; i++) {
        var b = switchBox(i, stage.w, stage.h - 6);
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y - 10 && p.y <= b.y + b.h + 10) {
          pick(ids[i], true);
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      /* the bulb, hanging in the room */
      var bx = w / 2, by = h * 0.2;
      g.strokeStyle = C.dim;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(bx, 0);
      g.lineTo(bx, by - 16);
      g.stroke();
      g.beginPath();
      g.arc(bx, by, 17, 0, 7);
      g.fillStyle = '#20262e';
      g.fill();
      g.strokeStyle = felt ? '#6fb4ff' : C.dim;
      g.lineWidth = felt ? 2.4 : 1.5;
      g.stroke();
      if (felt) {
        g.fillStyle = 'rgba(111,180,255,0.9)';
        g.font = f(10.5, 700);
        g.textAlign = 'center';
        g.fillText('cold', bx, by + 34);
      }
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'center';
      g.fillText('the bulb, dark', bx, by - 26);

      /* the three switches, in the positions you left them */
      var states = ['off', 'on', 'off'];
      var notes = ['on for ten minutes, then off', 'on right now', 'never touched'];
      var ids = ['a', 'b', 'c'];
      for (var i = 0; i < 3; i++) {
        var b = switchBox(i, w, h);
        var on = sel === ids[i];
        g.fillStyle = on ? 'rgba(88,166,255,0.2)' : C.panel;
        roundRect(g, b.x, b.y, b.w, b.h, 8);
        g.fill();
        g.strokeStyle = on ? C.accent : C.dim;
        g.lineWidth = on ? 2.4 : 1.4;
        roundRect(g, b.x, b.y, b.w, b.h, 8);
        g.stroke();
        /* the toggle nub */
        var nubY = states[i] === 'on' ? b.y + b.h * 0.22 : b.y + b.h * 0.58;
        g.fillStyle = states[i] === 'on' ? C.gold : '#39424e';
        roundRect(g, b.x + b.w * 0.28, nubY, b.w * 0.44, b.h * 0.2, 4);
        g.fill();
        g.fillStyle = on ? C.accent : C.muted;
        g.font = f(11, 800);
        g.textAlign = 'center';
        g.fillText(String(i + 1), b.x + b.w / 2, b.y - 8);
        g.fillStyle = C.muted;
        g.font = f(8.5, 500);
        var words = notes[i].split(', ');
        for (var l = 0; l < words.length; l++)
          g.fillText(words[l], b.x + b.w / 2, b.y + b.h + 12 + l * 10);
      }
      if (!sel) {
        g.fillStyle = C.muted;
        g.font = f(10, 600);
        g.textAlign = 'center';
        g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3);
        g.fillText('tap the switch that runs it', w / 2, h - 2);
        g.globalAlpha = 1;
      }
    };
    return {
      destroy: stage.destroy,
      select: function (id) { sel = id; if (chips) chips.select(id); }
    };
  });

  /* ======================================================================
   * 22. btAnts — ants that bounce, ghosts that walk through.
   * ==================================================================== */
  global.QQViz.register('btAnts', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.56);
    var L = 100, RATE = 26;                 // 26 pole-seconds per real second
    var ants, ghosts, clock, playing, last, finished;

    function build() {
      var n = 4 + U.pickInt(4), i;
      ants = [];
      for (i = 0; i < n; i++) ants.push({ p: 4 + Math.random() * (L - 8), d: Math.random() < 0.5 ? -1 : 1 });
      ants.sort(function (a, b) { return a.p - b.p; });
      ghosts = ants.map(function (a) { return { p: a.p, d: a.d }; });
      clock = 0;
      finished = null;
      last = null;
      render();
    }
    function render() {
      var onPole = 0;
      for (var i = 0; i < ants.length; i++) if (ants[i]) onPole++;
      out.innerHTML = finished !== null
        ? 'All of them off the pole in <b>' + finished.toFixed(1) + ' seconds</b>.'
        : '<b>' + clock.toFixed(1) + ' s</b> &nbsp;·&nbsp; <b>' + onPole + '</b> still on the pole';
    }
    var playBtn = K.button(ctr, 'Play', function () {
      if (finished !== null) build();
      playing = !playing;
      playBtn.textContent = playing ? 'Pause' : 'Play';
      api.onInteract('play');
    });
    playBtn.classList.add('primary');
    K.button(ctr, 'New line-up', function () {
      playing = false;
      playBtn.textContent = 'Play';
      build();
      api.onInteract('reset');
    }).classList.add('small');
    build();

    stage.draw = function (g, w, h, t) {
      if (last === null) last = t;
      var dt = clamp(t - last, 0, 0.06);
      last = t;
      if (playing && finished === null) {
        var sub = dt * RATE, i, j;
        clock += sub;
        for (i = 0; i < ants.length; i++) if (ants[i]) ants[i].p += ants[i].d * sub;
        for (i = 0; i < ghosts.length; i++) if (ghosts[i]) ghosts[i].p += ghosts[i].d * sub;
        /* ants cannot pass each other: a crossing is a bounce */
        for (i = 0; i < ants.length - 1; i++) {
          if (!ants[i] || !ants[i + 1]) continue;
          if (ants[i].p >= ants[i + 1].p) {
            var mid = (ants[i].p + ants[i + 1].p) / 2;
            ants[i].p = mid;
            ants[i + 1].p = mid;
            ants[i].d = -1;
            ants[i + 1].d = 1;
          }
        }
        var left = 0;
        for (i = 0; i < ants.length; i++) {
          if (ants[i] && (ants[i].p <= 0 || ants[i].p >= L)) ants[i] = null;
          if (ants[i]) left++;
          if (ghosts[i] && (ghosts[i].p <= 0 || ghosts[i].p >= L)) ghosts[i] = null;
        }
        if (!left) { finished = clock; playing = false; playBtn.textContent = 'Play again'; }
        render();
      }

      var pad = 20, y = h * 0.44;
      var poleW = w - pad * 2;
      function X(p) { return pad + poleW * (p / L); }
      g.fillStyle = C.panel;
      roundRect(g, pad, y - 5, poleW, 10, 5);
      g.fill();
      g.fillStyle = C.muted;
      g.font = f(10, 600);
      g.textAlign = 'left';
      g.fillText('0 cm', pad, y + 30);
      g.textAlign = 'right';
      g.fillText('100 cm', w - pad, y + 30);

      var i2;
      for (i2 = 0; i2 < ghosts.length; i2++) {
        if (!ghosts[i2]) continue;
        g.beginPath();
        g.arc(X(ghosts[i2].p), y + 22, 4, 0, 7);
        g.strokeStyle = 'rgba(139,148,158,0.55)';
        g.lineWidth = 1.2;
        g.stroke();
      }
      for (i2 = 0; i2 < ants.length; i2++) {
        if (!ants[i2]) continue;
        var x = X(ants[i2].p);
        g.beginPath();
        g.arc(x, y - 13, 6, 0, 7);
        g.fillStyle = U.SERIES[i2 % U.SERIES.length];
        g.fill();
        g.strokeStyle = C.bg;
        g.lineWidth = 1;
        g.stroke();
        g.strokeStyle = U.SERIES[i2 % U.SERIES.length];
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, y - 13);
        g.lineTo(x + ants[i2].d * 11, y - 13);
        g.stroke();
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'center';
      g.fillText('below the pole: the same ants, walking straight through each other', w / 2, h - 2);
      g.textAlign = 'left';
      g.fillStyle = C.fg;
      g.font = f(15, 800);
      g.fillText(clock.toFixed(1) + ' s', 8, 16);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 23. btBoxes — follow the chain from your own number.
   * ==================================================================== */
  global.QQViz.register('btBoxes', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Shuffle the names, then follow the chain from a number.');
    var stage = K.Stage(host, 1.0);
    var N = 100, ALLOW = 50;
    var perm, chain, next, tried, longest, rooms = 0, freed = 0;

    function shuffleBoxes() {
      perm = [];
      for (var i = 0; i < N; i++) perm.push(i);
      U.shuffle(perm);
      chain = [];
      next = 0;
      tried = 0;
      longest = 0;
      render();
    }
    function follow(start) {
      var path = [start], at = start, guard = 0;
      while (perm[at] !== start && guard < N) { at = perm[at]; path.push(at); guard++; }
      return path;
    }
    function render() {
      var tail = rooms ? ' &nbsp;·&nbsp; <b>' + freed + '</b> of <b>' + rooms +
        '</b> rooms went free (' + (100 * freed / rooms).toFixed(0) + '%)' : '';
      if (!chain.length) { out.innerHTML = 'Follow the chain from a prisoner’s own number.' + tail; return; }
      var ok = chain.length <= ALLOW;
      out.innerHTML = 'Prisoner <b>' + (chain[0] + 1) + '</b> followed <b>' + chain.length +
        '</b> boxes and ' + (ok ? 'found their name' : '<b>ran out at fifty</b>') +
        ' &nbsp;·&nbsp; longest chain so far <b>' + longest + '</b>' + tail;
    }
    K.button(ctr, 'Follow the next one', function () {
      if (!perm) shuffleBoxes();
      chain = follow(next % N);
      next++;
      tried++;
      longest = Math.max(longest, chain.length);
      render();
      api.onInteract('follow');
    }).classList.add('primary');
    K.button(ctr, 'New shuffle', function () { shuffleBoxes(); api.onInteract('shuffle'); })
      .classList.add('small');
    K.button(ctr, 'Run 200 rooms', function () {
      for (var r = 0; r < 200; r++) {
        var p = [];
        for (var i = 0; i < N; i++) p.push(i);
        U.shuffle(p);
        var worst = 0;
        var seen = {};
        for (i = 0; i < N; i++) {
          if (seen[i]) continue;
          var len = 0, at = i;
          do { seen[at] = 1; at = p[at]; len++; } while (at !== i);
          worst = Math.max(worst, len);
        }
        rooms++;
        if (worst <= ALLOW) freed++;
      }
      render();
      api.onInteract('run');
    }).classList.add('small');
    shuffleBoxes();

    stage.draw = function (g, w, h) {
      var cols = 10, pad = 8;
      var size = Math.min((w - pad * 2) / cols, (h - 20) / 10);
      var ox = (w - size * cols) / 2, oy = 6;
      var inChain = {}, k;
      for (k = 0; k < chain.length; k++) inChain[chain[k]] = k + 1;
      for (var b = 0; b < N; b++) {
        var r = Math.floor(b / cols), c = b % cols;
        var x = ox + c * size, y = oy + r * size;
        var pos = inChain[b];
        var isStart = chain.length && b === chain[0];
        g.fillStyle = pos ? (chain.length > ALLOW ? 'rgba(248,81,73,0.75)' : 'rgba(210,153,34,0.85)') : '#1c232c';
        roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4);
        g.fill();
        if (isStart) {
          g.strokeStyle = C.accent;
          g.lineWidth = 2;
          roundRect(g, x + 1, y + 1, size - 2, size - 2, 4);
          g.stroke();
        }
        if (size > 18) {
          g.fillStyle = pos ? '#0d1117' : '#3f4854';
          g.font = f(Math.max(8, size * 0.32), pos ? 700 : 500);
          g.textAlign = 'center';
          g.fillText(String(pos ? perm[b] + 1 : b + 1), x + size / 2, y + size / 2 + size * 0.12);
        }
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'left';
      g.fillText('gold = the chain you followed, showing the name inside', pad, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * 24. btHatPass — all eight line-ups, opened one at a time.
   * ==================================================================== */
  global.QQViz.register('btHatPass', function (host, api) {
    var out = K.readout(host, 'Tap a line-up. Red and blue are dealt by coin flip.');
    var stage = K.Stage(host, 0.72);
    var seen = {}, sel = -1;

    function cfgOf(i) { return [(i >> 2) & 1, (i >> 1) & 1, i & 1]; }
    function play(cfg) {
      /* the plan: two the same in front of you -> say the other; otherwise pass */
      var said = [], k;
      for (k = 0; k < 3; k++) {
        var others = [];
        for (var j = 0; j < 3; j++) if (j !== k) others.push(cfg[j]);
        said.push(others[0] === others[1] ? 1 - others[0] : null);
      }
      var spoke = false, wrong = false;
      for (k = 0; k < 3; k++) {
        if (said[k] === null) continue;
        spoke = true;
        if (said[k] !== cfg[k]) wrong = true;
      }
      return { said: said, win: spoke && !wrong };
    }
    function onTap(ev) {
      var p = stage.pointer(ev);
      var w = stage.w, cw = w / 8;
      var i = Math.floor(p.x / cw);
      if (i >= 0 && i < 8) {
        sel = i;
        seen[i] = 1;
        var r = play(cfgOf(i));
        var speakers = [];
        for (var k = 0; k < 3; k++) if (r.said[k] !== null) speakers.push(k + 1);
        var opened = 0, won = 0;
        for (var j = 0; j < 8; j++) if (seen[j]) { opened++; if (play(cfgOf(j)).win) won++; }
        out.innerHTML = (speakers.length === 1
          ? 'Only number ' + speakers[0] + ' speaks, and is <b>right</b>. '
          : 'All three speak, and all three are <b>wrong</b>. ') +
          'Opened <b>' + opened + '</b> of the 8 &nbsp;·&nbsp; won <b>' + won + '</b>';
        api.onInteract('lineup');
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      var cw = w / 8, r = Math.min(cw * 0.3, 14);
      for (var i = 0; i < 8; i++) {
        var cfg = cfgOf(i), x = cw * (i + 0.5);
        var open = !!seen[i], res = play(cfg);
        if (i === sel) {
          g.fillStyle = 'rgba(88,166,255,0.12)';
          roundRect(g, cw * i + 2, 6, cw - 4, h - 30, 6);
          g.fill();
        }
        for (var k = 0; k < 3; k++) {
          var y = 34 + k * (r * 2.4);
          g.beginPath();
          g.arc(x, y, r, 0, 7);
          g.fillStyle = cfg[k] ? '#4d8ff0' : '#e05a52';
          g.fill();
          if (open && res.said[k] !== null) {
            g.strokeStyle = res.said[k] === cfg[k] ? GREEN : RED;
            g.lineWidth = 2.4;
            g.stroke();
          }
        }
        g.textAlign = 'center';
        if (open) {
          g.fillStyle = res.win ? GREEN : RED;
          g.font = f(13, 800);
          g.fillText(res.win ? '✓' : '✗', x, 22);
        } else {
          g.fillStyle = C.muted;
          g.font = f(10, 600);
          g.fillText('?', x, 22);
        }
      }
      g.fillStyle = C.muted;
      g.font = f(10, 500);
      g.textAlign = 'center';
      if (sel < 0) {
        g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3);
        g.fillText('tap a line-up to see who speaks', w / 2, h - 4);
        g.globalAlpha = 1;
      } else {
        g.fillText('ringed = that player spoke', w / 2, h - 4);
      }
    };
    return { destroy: stage.destroy };
  });
})(window);
