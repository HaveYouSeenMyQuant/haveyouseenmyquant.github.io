/* QQ visuals — "Given that…" (conditional probability) and "Shapes and space".
 *
 * Same house rules as the rest: animate the thing, never write the formula.
 * Every visual here is tappable, draggable or re-runnable, every simulation
 * samples for real, and nothing prints the answer before the player has driven
 * the interaction there themselves.
 *
 * Loads after js/viz.js (the kit) and js/viz_lab.js (the engine kit).
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, el = K.el, clamp = K.clamp, lerp = K.lerp;
  var easeOut = K.easeOut, roundRect = K.roundRect;
  var LAB = global.QQLab;

  function now() { return performance.now(); }
  function pickInt(n) { return Math.floor(Math.random() * n); }
  function coin() { return Math.random() < 0.5 ? 0 : 1; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  var GREEN = '#3fb950';
  var GOLD = C.gold;
  var BLUE = C.accent;

  /* =====================================================================
   * u7l1 — 1. two aces: which piece of news is worth more
   * Two honest deal-and-keep machines, run side by side. The left one only
   * counts deals whose FIRST card is an ace; the right one counts any deal
   * carrying an ace at all. Cards 0..3 are the aces.
   * ===================================================================== */
  function dealTwo() {
    var a = pickInt(52), b = pickInt(51);
    if (b >= a) b++;
    return [a, b];
  }
  global.QQViz.register('aceNews', LAB.race({
    lanes: [
      {
        name: 'first card is an ace',
        trial: function () {
          var d;
          do { d = dealTwo(); } while (d[0] > 3);
          return d[1] < 4 ? 100 : 0;
        }
      },
      {
        name: 'at least one is an ace',
        trial: function () {
          var d;
          do { d = dealTwo(); } while (d[0] > 3 && d[1] > 3);
          return (d[0] < 4 && d[1] < 4) ? 100 : 0;
        }
      }
    ],
    batches: [100, 2000],
    dp: 2,
    unit: '%',
    maxV: 9,
    aspect: 0.5,
    idle: 'Two deal-and-keep machines. Run them and see how often each one ends up holding two aces.',
    axisLabel: 'deals kept that turned out to be two aces'
  }));

  /* =====================================================================
   * u7l1 — 2. the taxi and the witness
   * A street of cabs, each one really blue or green, each one seen by a
   * witness who is right eight times in ten. Filter to the ones he called
   * blue and look at what is left.
   * ===================================================================== */
  global.QQViz.register('taxiWitness', LAB.dots({
    n: 400,
    aspect: 0.78,
    member: function (i) {
      var blue = Math.random() < 0.15;
      var right = Math.random() < 0.8;
      var said = right ? blue : !blue;
      return { i: i, blue: blue, said: said, colour: blue ? BLUE : GREEN };
    },
    steps: [
      { label: 'Keep the cabs he called blue', keep: function (m) { return m.said; } }
    ],
    resampleLabel: 'A fresh street',
    caption: function (k, at, pop) {
      var i, blue = 0;
      for (i = 0; i < pop.length; i++) if (pop[i].blue) blue++;
      if (!at) {
        return '<b>' + pop.length + '</b> cabs &nbsp;·&nbsp; <span style="color:' + BLUE +
          ';font-weight:700">' + blue + ' really blue</span> &nbsp;·&nbsp; <span style="color:' +
          GREEN + ';font-weight:700">' + (pop.length - blue) + ' really green</span>';
      }
      var kb = 0;
      for (i = 0; i < k.length; i++) if (k[i].blue) kb++;
      return 'he called <b>' + k.length + '</b> of them blue — and <b>' + kb +
        '</b> of those really are blue';
    },
    keptLabel: function () { return 'every cab the witness called blue'; }
  }));

  /* =====================================================================
   * u7l1 — 3. the host who has forgotten
   * Honest rejection sampling: play the whole game, and throw the round away
   * when the clumsy host opens the prize. The counter of thrown-away games is
   * the whole lesson.
   * ===================================================================== */
  (function () {
    var spoiled = 0;
    global.QQViz.register('clumsyHost', LAB.sim({
      mode: 'rate',
      batches: [50, 2000],
      aspect: 0.42,
      mark: 0.5,
      markLabel: 'half',
      idle: 'Nothing played yet.',
      barLabel: 'games where switching won',
      trial: function () {
        var car, pick, opened, others, j;
        for (;;) {
          car = pickInt(3);
          pick = pickInt(3);
          others = [];
          for (j = 0; j < 3; j++) if (j !== pick) others.push(j);
          opened = others[pickInt(2)];
          if (opened !== car) break;
          spoiled++;                    /* he opened the prize: no question to ask */
        }
        return (3 - pick - opened) === car;
      },
      statLine: function (st) {
        return 'switching won <b>' + commas(st.hits) + '</b> of ' + commas(st.n) +
          ' &nbsp;·&nbsp; <b>' + (st.rate * 100).toFixed(1) + '%</b>' +
          (spoiled ? ' &nbsp;·&nbsp; <span class="tag-b">' + commas(spoiled) +
            ' games thrown away — he opened the prize</span>' : '');
      }
    }));
  })();

  /* =====================================================================
   * u7l1 — 4. the two envelopes
   * The pair of amounts is hidden and changes every time, exactly as in the
   * puzzle. The histogram is what swapping gained you, run after run.
   * ===================================================================== */
  (function () {
    var PAIRS = [[5, 10], [10, 20], [20, 40], [40, 80]];
    global.QQViz.register('envelopeSwap', LAB.sim({
      mode: 'hist',
      min: -40, max: 40, step: 5,
      batches: [20, 1000],
      aspect: 0.6,
      dp: 2,
      label: 'gain',
      axisLabel: 'pounds gained by swapping',
      idle: 'Nothing swapped yet. The two amounts are hidden and change every time.',
      emptyHint: 'press run to swap a few hundred times',
      highlight: function (key) { return key === 0; },
      trial: function () {
        var p = PAIRS[pickInt(PAIRS.length)];
        var mine = Math.random() < 0.5 ? p[0] : p[1];
        return (mine === p[0] ? p[1] : p[0]) - mine;
      }
    }));
  })();

  /* =====================================================================
   * u7l1 — 5. one of them is a boy born on a weekday
   * All 196 equally likely pairs of children as a grid: 14 kinds of child
   * across (boy or girl, seven days) against 14 kinds down. The chips are the
   * three things you might be told.
   * ===================================================================== */
  global.QQViz.register('boyWeekdayGrid', function (host, api) {
    var chips = K.controls(host);
    var out = K.readout(host, 'Every equally likely pair of children. Pick what you were told.');
    var stage = K.Stage(host, 1.0);
    var mode = 0, modeAt = 0;
    var DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    function isBoy(t) { return t < 7; }
    function weekdayBoy(t) { return t < 5; }        /* days 0..4 are Mon to Fri */
    function fits(a, b) {
      if (mode === 0) return true;
      if (mode === 1) return isBoy(a) || isBoy(b);
      return weekdayBoy(a) || weekdayBoy(b);
    }
    function tally() {
      var a, b, kept = 0, boys = 0;
      for (a = 0; a < 14; a++) {
        for (b = 0; b < 14; b++) {
          if (!fits(a, b)) continue;
          kept++;
          if (isBoy(a) && isBoy(b)) boys++;
        }
      }
      return { kept: kept, boys: boys };
    }
    function render() {
      var t = tally();
      var s;
      if (mode === 0) s = 'All <b>196</b> equally likely families';
      else s = '<b>' + t.kept + '</b> families still fit';
      s += ' &nbsp;·&nbsp; <span style="color:' + BLUE + ';font-weight:700">' + t.boys +
        ' of them are two boys</span>';
      out.innerHTML = s;
    }
    var chipEls = [];
    ['Told nothing', 'At least one boy', '…born on a weekday'].forEach(function (label, idx) {
      var b = el('button', 'viz-chip', label);
      b.type = 'button';
      b.addEventListener('click', function () {
        mode = idx; modeAt = now();
        chipEls.forEach(function (x, j) { x.classList.toggle('on', j === idx); });
        render();
        api.onInteract('chip');
      });
      chips.appendChild(b);
      chipEls.push(b);
    });
    chipEls[0].classList.add('on');
    render();

    stage.draw = function (g, w, h) {
      var pad = 22;
      var size = Math.min((w - pad - 6) / 14, (h - pad - 14) / 14);
      var ox = (w - size * 14) / 2 + 4, oy = pad;
      var a, b, x, y, on, both, age, kk;

      g.font = f(9, 600);
      g.fillStyle = C.muted;
      g.textAlign = 'center';
      for (a = 0; a < 14; a++) g.fillText(DAYS[a % 7], ox + size * (a + 0.5), oy - 12);
      g.textAlign = 'center';
      g.fillStyle = BLUE;
      g.font = f(9.5, 700);
      g.fillText('boys', ox + size * 3.5, oy - 2);
      g.fillStyle = GOLD;
      g.fillText('girls', ox + size * 10.5, oy - 2);

      for (a = 0; a < 14; a++) {
        for (b = 0; b < 14; b++) {
          x = ox + b * size; y = oy + a * size;
          on = fits(a, b);
          both = isBoy(a) && isBoy(b);
          age = (now() - modeAt) / 1000 - (a + b) * 0.012;
          kk = easeOut(clamp(age / 0.4, 0, 1));
          g.fillStyle = '#1c232c';
          roundRect(g, x + 1, y + 1, size - 2, size - 2, 2.5);
          g.fill();
          if (on) {
            g.globalAlpha = 0.25 + 0.75 * kk;
            g.fillStyle = both ? BLUE : 'rgba(219,97,162,0.55)';
            roundRect(g, x + 1, y + 1, size - 2, size - 2, 2.5);
            g.fill();
            g.globalAlpha = 1;
          }
        }
      }
      g.fillStyle = '#5b6672';
      g.font = f(9.5, 500);
      g.textAlign = 'left';
      g.fillText('older child across, younger child down', ox, oy + size * 14 + 12);
      g.fillStyle = BLUE;
      g.font = f(9.5, 700);
      g.textAlign = 'right';
      g.fillText('two boys', ox + size * 14, oy + size * 14 + 12);
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * u7l2 — 6. you meet one of the children
   * A random family, and you meet one of the two children at random. Only the
   * runs where the child you met was a girl are counted.
   * ===================================================================== */
  global.QQViz.register('metAChild', LAB.tally({
    cats: ['both girls', 'one of each'],
    batches: [20, 1000],
    aspect: 0.56,
    idle: 'Each run is a random family and a random one of its two children. Only the runs where you met a girl count.',
    axisLabel: 'families where the child you met was a girl',
    trial: function () {
      var a, b, met;
      for (;;) {
        a = coin(); b = coin();                       /* 1 = girl */
        met = Math.random() < 0.5 ? a : b;
        if (met === 1) break;
      }
      return (a === 1 && b === 1) ? 'both girls' : 'one of each';
    }
  }));

  /* =====================================================================
   * u7l2 — 7. three boxes, six coins
   * Draw a coin from a random box. The tally only counts the gold draws.
   * ===================================================================== */
  global.QQViz.register('goldBoxes', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Three boxes. Draw a coin without looking.');
    var stage = K.Stage(host, 0.72);
    var BOXES = [[1, 1], [0, 0], [1, 0]];            /* 1 = gold, 0 = silver */
    var box = -1, slot = -1, drawAt = -9999;
    var gold = 0, goldPairs = 0, draws = 0, queue = 0;

    function render() {
      var s;
      if (!draws) s = 'Three boxes. Draw a coin without looking.';
      else if (!gold) s = '<b>' + draws + '</b> draws, none of them gold yet';
      else {
        s = 'gold pulled <b>' + gold + '</b> times &nbsp;·&nbsp; the other coin was gold in <b>' +
          goldPairs + '</b> of them &nbsp;·&nbsp; <b>' +
          (goldPairs / gold * 100).toFixed(1) + '%</b>';
      }
      out.innerHTML = s;
    }
    function one() {
      box = pickInt(3);
      slot = pickInt(2);
      draws++;
      if (BOXES[box][slot] === 1) {
        gold++;
        if (BOXES[box][1 - slot] === 1) goldPairs++;
      }
      drawAt = now();
    }
    K.button(ctr, 'Draw a coin', function () { one(); render(); api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Draw 300', function () { queue += 300; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Reset', function () {
      gold = 0; goldPairs = 0; draws = 0; queue = 0; box = -1; slot = -1;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    function coinFace(g, cx, cy, r, isGold, hidden) {
      g.beginPath();
      g.arc(cx, cy, r, 0, 7);
      g.fillStyle = hidden ? '#2b333d' : (isGold ? GOLD : '#9aa7b4');
      g.fill();
      if (!hidden) {
        g.fillStyle = 'rgba(13,17,23,0.65)';
        g.font = f(Math.max(8, r * 0.8), 800);
        g.textAlign = 'center';
        g.fillText(isGold ? 'G' : 'S', cx, cy + r * 0.3);
      } else {
        g.strokeStyle = C.dim; g.lineWidth = 1.5;
        g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
      }
    }

    stage.draw = function (g, w, h) {
      var take = Math.min(queue, 25), i;
      for (i = 0; i < take; i++) one();
      queue -= take;
      if (take) render();

      var pad = 10, bw = (w - pad * 4) / 3, bh = h * 0.44, by = 18;
      var revealed = (now() - drawAt) / 1000 < 1.4;
      for (i = 0; i < 3; i++) {
        var bx = pad + i * (bw + pad);
        g.fillStyle = '#141a21';
        roundRect(g, bx, by, bw, bh, 9); g.fill();
        g.strokeStyle = (i === box && revealed) ? C.accent : C.line;
        g.lineWidth = (i === box && revealed) ? 2 : 1;
        roundRect(g, bx + 0.5, by + 0.5, bw - 1, bh - 1, 9); g.stroke();

        var r = Math.min(bw * 0.24, bh * 0.24);
        var cy = by + bh * 0.52;
        var j;
        for (j = 0; j < 2; j++) {
          var cx = bx + bw * (j === 0 ? 0.3 : 0.7);
          var isPulled = revealed && i === box && j === slot;
          var showIt = revealed && i === box;
          if (isPulled) {
            var k = easeOut(clamp((now() - drawAt) / 400, 0, 1));
            coinFace(g, cx, lerp(cy, by + bh + 26, k), lerp(r, r * 1.25, k),
              BOXES[i][j] === 1, false);
          } else {
            coinFace(g, cx, cy, r, BOXES[i][j] === 1, !showIt);
          }
        }
        g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
        g.fillText('box ' + (i + 1), bx + bw / 2, by - 6);
      }

      /* the running proportion, with a half-way tick to beat */
      var barY = h - 30, barW = w - pad * 2, barH = 14;
      g.fillStyle = C.panel; roundRect(g, pad, barY, barW, barH, 7); g.fill();
      if (gold) {
        g.fillStyle = GOLD;
        roundRect(g, pad, barY, Math.max(3, barW * (goldPairs / gold)), barH, 7); g.fill();
      }
      g.strokeStyle = 'rgba(230,237,243,0.55)'; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(pad + barW / 2, barY - 3); g.lineTo(pad + barW / 2, barY + barH + 3);
      g.stroke();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('half', pad + barW / 2, barY + barH + 13);
      g.textAlign = 'left';
      g.fillText('gold draws whose partner was also gold', pad, barY - 5);
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * u7l2 — 8. two workshops, split and lumped together
   * The counts come from the bank so the checker and the picture cannot
   * disagree about a single bike.
   * ===================================================================== */
  global.QQViz.register('workshopSplit', function (host, api) {
    var d = (api.data && api.data.bayesgeo && api.data.bayesgeo.workshop) || {
      A: { easy: [81, 87], hard: [192, 263] },
      B: { easy: [234, 270], hard: [55, 80] }
    };
    function rate(p) { return p[0] / p[1] * 100; }
    function tot(shop) { return [shop.easy[0] + shop.hard[0], shop.easy[1] + shop.hard[1]]; }
    var items = [
      { label: 'A easy', value: rate(d.A.easy), pair: d.A.easy, who: 'A', kind: 'easy repairs' },
      { label: 'B easy', value: rate(d.B.easy), pair: d.B.easy, who: 'B', kind: 'easy repairs' },
      { label: 'A hard', value: rate(d.A.hard), pair: d.A.hard, who: 'A', kind: 'hard repairs' },
      { label: 'B hard', value: rate(d.B.hard), pair: d.B.hard, who: 'B', kind: 'hard repairs' },
      { label: 'A all', value: rate(tot(d.A)), pair: tot(d.A), who: 'A', kind: 'everything it took in' },
      { label: 'B all', value: rate(tot(d.B)), pair: tot(d.B), who: 'B', kind: 'everything it took in' }
    ];
    return LAB.bars({
      items: items,
      aspect: 0.62,
      valueFmt: function (v) { return v.toFixed(0) + '%'; },
      axisLabel: 'share fixed — the last pair lumps every job together',
      idle: 'Tap a bar to see the bikes behind it.',
      caption: function (it) {
        return 'workshop <b>' + it.who + '</b> fixed <b>' + it.pair[0] + '</b> of the <b>' +
          it.pair[1] + '</b> bikes in ' + it.kind + ' &nbsp;·&nbsp; <b>' +
          it.value.toFixed(0) + '%</b>';
      }
    })(host, api);
  });

  /* =====================================================================
   * u7l2 — 9. every family stops at a boy
   * Families are drawn for real, one row each: girls then the boy that ends
   * it. The counter is over all the children, not per family.
   * ===================================================================== */
  global.QQViz.register('stopAtBoy', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No families yet.');
    var stage = K.Stage(host, 0.8);
    var fams = [], girls = 0, kids = 0, queue = 0;

    function oneFamily() {
      var g2 = 0;
      while (coin() === 1) { g2++; if (g2 > 30) break; }   /* 1 = girl, stop at a boy */
      fams.push(g2);
      if (fams.length > 120) fams.shift();
      girls += g2; kids += g2 + 1;
    }
    function render() {
      if (!kids) { out.innerHTML = 'No families yet.'; return; }
      out.innerHTML = '<b>' + commas(kids) + '</b> children &nbsp;·&nbsp; <span style="color:' +
        GOLD + ';font-weight:700">' + commas(girls) + ' girls</span> &nbsp;·&nbsp; <b>' +
        (girls / kids * 100).toFixed(1) + '%</b> of all the children';
    }
    K.button(ctr, 'Add 20 families', function () { queue += 20; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Add 2,000', function () { queue += 2000; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Start again', function () {
      fams = []; girls = 0; kids = 0; queue = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(queue, 200), i, j;
      for (i = 0; i < take; i++) oneFamily();
      queue -= take;
      if (take) render();

      var pad = 10, top = 16;
      var shown = Math.min(fams.length, 44);
      var start = fams.length - shown;
      var rowH = Math.min(15, (h - top - 42) / Math.max(1, shown));
      var r = Math.max(2.4, Math.min(5, rowH * 0.34));

      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText(fams.length ? 'one row per family, newest at the bottom' : 'press add to start a country',
        pad, top - 4);

      for (i = 0; i < shown; i++) {
        var n = fams[start + i];
        var y = top + 6 + i * rowH;
        for (j = 0; j <= n && j < 12; j++) {
          var x = pad + 6 + j * (r * 2.6);
          g.fillStyle = (j === n) ? BLUE : GOLD;
          g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        }
        if (n >= 12) {
          g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'left';
          g.fillText('+' + (n - 11), pad + 6 + 12 * (r * 2.6), y + 3);
        }
      }

      var barY = h - 30, barW = w - pad * 2, barH = 14;
      g.fillStyle = C.panel; roundRect(g, pad, barY, barW, barH, 7); g.fill();
      if (kids) {
        g.fillStyle = GOLD;
        roundRect(g, pad, barY, Math.max(3, barW * (girls / kids)), barH, 7); g.fill();
      }
      g.strokeStyle = 'rgba(230,237,243,0.55)'; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(pad + barW / 2, barY - 3); g.lineTo(pad + barW / 2, barY + barH + 3);
      g.stroke();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('half', pad + barW / 2, barY + barH + 13);
      g.textAlign = 'left';
      g.fillText('girls as a share of all the children', pad, barY - 5);
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * u8l1 — 10. twice as tall
   * Drag the giant taller. Height, skin and weight ride along on three bars,
   * and only the picture and the bars say what is happening.
   * ===================================================================== */
  global.QQViz.register('scaleAnimal', LAB.drag({
    min: 1, max: 3, value: 1, snap: 0.05, gain: 0.9, axis: 'x', aspect: 0.86,
    hint: 'drag sideways to make it taller',
    readout: function (v) {
      return '<b>×' + v.toFixed(2) + '</b> as tall &nbsp;·&nbsp; <span style="color:' + GOLD +
        ';font-weight:700">×' + (v * v).toFixed(2) + ' the skin</span> &nbsp;·&nbsp; <span style="color:' +
        BLUE + ';font-weight:700">×' + (v * v * v).toFixed(2) + ' the weight</span>';
    },
    draw: function (g, w, h, v) {
      var baseY = h * 0.66, pad = 16;
      var unit = Math.min((h * 0.56) / 3.05, (w - pad * 2) / 5.4);

      function figure(cx, s, colour, alpha) {
        var head = s * 0.32, body = s * 1.05, legs = s * 0.9, wide = s * 0.34;
        g.globalAlpha = alpha;
        g.fillStyle = colour;
        g.beginPath();
        g.arc(cx, baseY - legs - body - head, head, 0, 7);
        g.fill();
        roundRect(g, cx - wide, baseY - legs - body, wide * 2, body, wide * 0.5);
        g.fill();
        roundRect(g, cx - wide * 0.8, baseY - legs, wide * 0.7, legs, wide * 0.3);
        g.fill();
        roundRect(g, cx + wide * 0.1, baseY - legs, wide * 0.7, legs, wide * 0.3);
        g.fill();
        g.globalAlpha = 1;
      }

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, baseY + 0.5); g.lineTo(w - pad, baseY + 0.5); g.stroke();

      figure(w * 0.26, unit, 'rgba(139,148,158,0.55)', 1);
      figure(w * 0.66, unit * v, BLUE, 0.92);

      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('a person', w * 0.26, baseY + 14);
      g.fillStyle = BLUE;
      g.fillText('the monster', w * 0.66, baseY + 14);

      /* three bars, all on the same scale, so weight runs away from the others */
      var bx = pad, bw = w - pad * 2, by = baseY + 26, bh = 11, gapY = 17;
      var rows = [
        { name: 'height', v: v, col: '#8b949e' },
        { name: 'skin', v: v * v, col: GOLD },
        { name: 'weight', v: v * v * v, col: BLUE }
      ];
      for (var i = 0; i < 3; i++) {
        var y = by + i * gapY;
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
        g.fillText(rows[i].name, bx, y + bh - 2);
        g.fillStyle = C.panel;
        roundRect(g, bx + 42, y, bw - 42, bh, 5); g.fill();
        g.fillStyle = rows[i].col;
        roundRect(g, bx + 42, y, Math.max(2, (bw - 42) * clamp(rows[i].v / 27, 0, 1)), bh, 5);
        g.fill();
        g.fillStyle = rows[i].col; g.font = f(9.5, 800); g.textAlign = 'right';
        g.fillText('×' + rows[i].v.toFixed(1), bx + bw - 4, y + bh - 2);
      }
    }
  }));

  /* =====================================================================
   * u8l1 — 11. three glasses, drawn to scale
   * A `tap` question: the picture is tappable and the chips underneath come
   * from the question itself.
   * ===================================================================== */
  (function () {
    var FALLBACK = [
      { id: 'tall', height: 20, across: 6 },
      { id: 'middle', height: 15, across: 7 },
      { id: 'wide', height: 12, across: 8 }
    ];
    function boxes(w, h, glasses) {
      var pad = 12, slot = (w - pad * 2) / glasses.length;
      var unit = Math.min((h - 54) / 20, slot / 9.5);
      var out = [], i;
      for (i = 0; i < glasses.length; i++) {
        var gw = glasses[i].across * unit, gh = glasses[i].height * unit;
        out.push({
          id: glasses[i].id, g: glasses[i],
          x: pad + slot * (i + 0.5) - gw / 2, y: h - 34 - gh, w: gw, h: gh
        });
      }
      return out;
    }
    global.QQViz.register('threeGlasses', function (host, api) {
      var glasses = (api.data && api.data.bayesgeo && api.data.bayesgeo.glasses) || FALLBACK;
      var fillAt = {}, cache = [];
      return LAB.picture({
        aspect: 0.85,
        readout: function (id) {
          if (!id) return 'Three glasses, drawn to scale. Tap one to fill it.';
          var i, gl = null;
          for (i = 0; i < glasses.length; i++) if (glasses[i].id === id) gl = glasses[i];
          if (!gl) return '';
          var ml = Math.PI * (gl.across / 2) * (gl.across / 2) * gl.height;
          return '<b>' + gl.height + ' cm</b> tall, <b>' + gl.across +
            ' cm</b> across &nbsp;·&nbsp; holds <b>' + Math.round(ml) + ' ml</b>';
        },
        hitTest: function (x, y, w, h) {
          cache = boxes(w, h, glasses);
          for (var i = 0; i < cache.length; i++) {
            var b = cache[i];
            if (x >= b.x - 8 && x <= b.x + b.w + 8 && y >= b.y - 10 && y <= b.y + b.h + 14) {
              if (!fillAt[b.id]) fillAt[b.id] = now();
              return b.id;
            }
          }
          return null;
        },
        draw: function (g, w, h, sel, t) {
          var bs = boxes(w, h, glasses), i;
          if (sel && !fillAt[sel]) fillAt[sel] = now();
          for (i = 0; i < bs.length; i++) {
            var b = bs[i], on = b.id === sel;
            var k = fillAt[b.id] ? easeOut(clamp((now() - fillAt[b.id]) / 700, 0, 1)) : 0;
            if (k > 0) {
              g.fillStyle = on ? 'rgba(88,166,255,0.75)' : 'rgba(88,166,255,0.28)';
              roundRect(g, b.x + 2, b.y + b.h - (b.h - 4) * k, b.w - 4, (b.h - 4) * k, 3);
              g.fill();
            }
            g.strokeStyle = on ? C.accent : C.dim;
            g.lineWidth = on ? 2.5 : 1.6;
            g.beginPath();
            g.moveTo(b.x, b.y);
            g.lineTo(b.x, b.y + b.h);
            g.lineTo(b.x + b.w, b.y + b.h);
            g.lineTo(b.x + b.w, b.y);
            g.stroke();
            g.fillStyle = on ? C.accent : C.muted;
            g.font = f(10, on ? 800 : 600);
            g.textAlign = 'center';
            g.fillText(b.g.height + ' cm', b.x + b.w / 2, b.y - 6);
            g.fillStyle = '#5b6672'; g.font = f(9.5, 600);
            g.fillText(b.g.across + ' cm across', b.x + b.w / 2, b.y + b.h + 14);
          }
          if (!sel) {
            g.fillStyle = C.gold; g.font = f(10.5, 700); g.textAlign = 'center';
            g.globalAlpha = 0.45 + 0.4 * Math.sin(t * 3.2);
            g.fillText('tap a glass to fill it', w / 2, 14);
            g.globalAlpha = 1;
          }
        }
      })(host, api);
    });
  })();

  /* =====================================================================
   * u8l1 — 12. a ball in its box
   * Darts thrown uniformly into a cube; the bar is how many landed in the
   * ball. The dashed mark is half — a landmark, not the answer.
   * ===================================================================== */
  global.QQViz.register('ballInBox', LAB.sim({
    mode: 'rate',
    batches: [200, 5000],
    aspect: 0.42,
    mark: 0.5,
    markLabel: 'half the box',
    idle: 'No darts thrown yet.',
    barLabel: 'darts that landed inside the ball',
    rateLabel: 'of the darts landed inside the ball',
    trial: function () {
      var x = Math.random() * 2 - 1;
      var y = Math.random() * 2 - 1;
      var z = Math.random() * 2 - 1;
      return x * x + y * y + z * z <= 1;
    }
  }));

  /* =====================================================================
   * u8l1 — 13. the goat and the barn
   * Drag the rope. Below one barn-length the goat gets three quarters of a
   * circle; past it, two extra fans open up round the corners.
   * ===================================================================== */
  (function () {
    var SIDE = 10;
    function grass(L) {
      var a = 0.75 * Math.PI * L * L;
      if (L > SIDE) a += 2 * 0.25 * Math.PI * (L - SIDE) * (L - SIDE);
      return a;
    }
    global.QQViz.register('goatRope', LAB.drag({
      min: 4, max: 18, value: 6, snap: 0.5, gain: 0.85, axis: 'x', aspect: 0.92,
      hint: 'drag sideways to change the rope',
      readout: function (v) {
        return 'rope <b>' + v.toFixed(1) + ' m</b> &nbsp;·&nbsp; grass in reach <b>' +
          Math.round(grass(v)) + ' m²</b> &nbsp;·&nbsp; a whole circle would be <b>' +
          Math.round(Math.PI * v * v) + ' m²</b>';
      },
      draw: function (g, w, h, v) {
        var pad = 14;
        var span = 2 * 18 + SIDE;
        var unit = Math.min((w - pad * 2) / span, (h - 26) / span);
        var cx = pad + 18 * unit, cy = 20 + 18 * unit;    /* the tied corner */
        var s = SIDE * unit, R = v * unit;

        /* the three quarters the goat can swing round freely */
        g.fillStyle = 'rgba(63,185,80,0.30)';
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, R, 0, Math.PI * 1.5);
        g.closePath();
        g.fill();

        /* what is left of the rope after it reaches a corner, bent round it */
        if (v > SIDE) {
          var R2 = (v - SIDE) * unit;
          g.beginPath();
          g.moveTo(cx + s, cy);
          g.arc(cx + s, cy, R2, Math.PI * 1.5, Math.PI * 2);
          g.closePath();
          g.fill();
          g.beginPath();
          g.moveTo(cx, cy + s);
          g.arc(cx, cy + s, R2, 0, Math.PI * 0.5);
          g.closePath();
          g.fill();
        }

        /* the barn sits on the quarter the goat cannot have */
        g.fillStyle = '#20272f';
        roundRect(g, cx, cy, s, s, 3); g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 1.5;
        roundRect(g, cx + 0.5, cy + 0.5, s - 1, s - 1, 3); g.stroke();
        g.fillStyle = C.muted; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText('barn', cx + s / 2, cy + s / 2 + 4);
        g.font = f(9, 600);
        g.fillText('10 m', cx + s / 2, cy + s + 12);

        /* the rope itself, swinging so you can see where it stops */
        var ang = Math.PI * 0.25 + Math.sin(now() / 1400) * Math.PI * 0.6;
        g.strokeStyle = GOLD; g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(ang + Math.PI) * R, cy + Math.sin(ang + Math.PI) * R);
        g.stroke();
        g.fillStyle = GOLD;
        g.beginPath();
        g.arc(cx + Math.cos(ang + Math.PI) * R, cy + Math.sin(ang + Math.PI) * R, 4.5, 0, 7);
        g.fill();
        g.fillStyle = C.fg;
        g.beginPath(); g.arc(cx, cy, 3, 0, 7); g.fill();
      }
    }));
  })();

  /* =====================================================================
   * u8l2 — 14. snapping a stick in two places
   * Both cuts are real uniform draws. If the pieces can close into a
   * triangle they do; if they cannot, you see the long piece beat the other
   * two laid end to end.
   * ===================================================================== */
  global.QQViz.register('snapStick', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Nothing snapped yet.');
    var stage = K.Stage(host, 0.72);
    var cuts = null, ok = false, snapAt = -9999;
    var tries = 0, wins = 0, queue = 0;

    function oneSnap(draw) {
      var a = Math.random(), b = Math.random();
      var lo = Math.min(a, b), hi = Math.max(a, b);
      var p = [lo, hi - lo, 1 - hi];
      var good = p[0] < 0.5 && p[1] < 0.5 && p[2] < 0.5;
      tries++;
      if (good) wins++;
      if (draw) { cuts = { lo: lo, hi: hi, p: p }; ok = good; snapAt = now(); }
    }
    function render() {
      var s = cuts ? (ok ? 'these three pieces <b>close into a triangle</b>'
        : 'one piece is longer than the other two together — <b>no triangle</b>')
        : 'Nothing snapped yet.';
      if (tries) s += ' &nbsp;·&nbsp; a triangle in <b>' + wins + '</b> of ' + tries + ' snaps &nbsp;·&nbsp; <b>' +
        (wins / tries * 100).toFixed(1) + '%</b>';
      out.innerHTML = s;
    }
    K.button(ctr, 'Snap one', function () { oneSnap(true); render(); api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Snap 200', function () { queue += 200; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Reset', function () {
      tries = 0; wins = 0; cuts = null; queue = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(queue, 20), i;
      for (i = 0; i < take; i++) oneSnap(i === take - 1 && queue - take <= 0);
      queue -= take;
      if (take) render();

      var pad = 16, L = w - pad * 2, y0 = 34;
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('the stick, with both cuts', pad, y0 - 12);

      /* the stick, and the two cuts */
      g.fillStyle = '#2b333d';
      roundRect(g, pad, y0, L, 12, 4); g.fill();
      if (cuts) {
        var cols = [BLUE, GOLD, GREEN];
        var starts = [0, cuts.lo, cuts.hi];
        for (i = 0; i < 3; i++) {
          g.fillStyle = cols[i];
          roundRect(g, pad + starts[i] * L + 1, y0, cuts.p[i] * L - 2, 12, 4);
          g.fill();
        }
        g.strokeStyle = C.fg; g.lineWidth = 1.5;
        [cuts.lo, cuts.hi].forEach(function (c) {
          g.beginPath();
          g.moveTo(pad + c * L, y0 - 5); g.lineTo(pad + c * L, y0 + 17);
          g.stroke();
        });
        g.strokeStyle = 'rgba(230,237,243,0.35)';
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(pad + L / 2, y0 + 20); g.lineTo(pad + L / 2, y0 + 30);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = '#5b6672'; g.font = f(9, 600); g.textAlign = 'center';
        g.fillText('halfway', pad + L / 2, y0 + 40);

        /* the three pieces, trying to close up */
        var k = easeOut(clamp((now() - snapAt) / 650, 0, 1));
        var scale = L * 0.82;
        var cy = h - 46;
        var a = cuts.p[0], b = cuts.p[1], c = cuts.p[2];
        if (ok) {
          /* c along the base, the other two meeting above it */
          var bx = (w - c * scale) / 2;
          var px = (c * c + a * a - b * b) / (2 * c);
          var py = Math.sqrt(Math.max(0, a * a - px * px));
          var apexX = bx + px * scale, apexY = cy - py * scale * k;
          g.lineWidth = 5; g.lineCap = 'round';
          g.strokeStyle = GREEN;
          g.beginPath(); g.moveTo(bx, cy); g.lineTo(bx + c * scale, cy); g.stroke();
          g.strokeStyle = BLUE;
          g.beginPath(); g.moveTo(bx, cy); g.lineTo(apexX, apexY); g.stroke();
          g.strokeStyle = GOLD;
          g.beginPath(); g.moveTo(bx + c * scale, cy); g.lineTo(apexX, apexY); g.stroke();
          g.lineCap = 'butt';
        } else {
          var order = [{ v: a, c: BLUE }, { v: b, c: GOLD }, { v: c, c: GREEN }];
          order.sort(function (x, y2) { return y2.v - x.v; });
          var longest = order[0], rest = [order[1], order[2]];
          var lx = (w - longest.v * scale) / 2;
          g.lineWidth = 5; g.lineCap = 'round';
          g.strokeStyle = longest.c;
          g.beginPath(); g.moveTo(lx, cy - 10); g.lineTo(lx + longest.v * scale, cy - 10); g.stroke();
          var run = lx;
          for (i = 0; i < 2; i++) {
            g.strokeStyle = rest[i].c;
            g.beginPath();
            g.moveTo(run + 2, cy + 12);
            g.lineTo(run + rest[i].v * scale - 2, cy + 12);
            g.stroke();
            run += rest[i].v * scale;
          }
          g.lineCap = 'butt';
          g.strokeStyle = 'rgba(248,81,73,0.8)'; g.lineWidth = 1.5;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(run, cy + 4); g.lineTo(lx + longest.v * scale, cy + 4);
          g.stroke();
          g.setLineDash([]);
          g.fillStyle = C.bad; g.font = f(9.5, 700); g.textAlign = 'center';
          g.fillText('too short to reach', (run + lx + longest.v * scale) / 2, cy + 28);
        }
      } else {
        g.fillStyle = '#5b6672'; g.font = f(10.5, 600); g.textAlign = 'center';
        g.fillText('press snap', w / 2, h - 40);
      }
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * u8l2 — 15. unfolding the room
   * Step the wall down flat and the two-leg crawl becomes one straight line.
   * ===================================================================== */
  (function () {
    var ROOM = { length: 12, width: 4, height: 5 };
    global.QQViz.register('unfoldRoom', function (host, api) {
      var r = (api.data && api.data.bayesgeo && api.data.bayesgeo.antRoom) || ROOM;
      var CAPS = [
        'The floor, and the wall the ant has to climb. It starts at the near corner.',
        'Hinge the wall along the line where it meets the floor…',
        'Keep folding it down. The crawl bends less and less.',
        'Flat. Now the shortest crawl is just a straight line on the paper — <b>' +
          r.length + ' along and ' + (r.width + r.height) + ' up</b>.'
      ];
      return LAB.steps({
        n: 3,
        aspect: 0.85,
        everyMs: 700,
        playLabel: 'Unfold',
        caption: function (i) { return CAPS[i]; },
        draw: function (g, w, h, i, t) {
          var k = easeOut(clamp(i / 3, 0, 1));
          var pad = 18;
          var totalUp = r.width + r.height;
          var unit = Math.min((w - pad * 2) / r.length, (h - 54) / totalUp);
          var x0 = pad, yBase = 26 + r.width * unit;      /* the hinge line */
          var floorTop = yBase - r.width * unit;
          var wallH = r.height * unit;

          /* the floor, always flat on the page */
          g.fillStyle = 'rgba(139,148,158,0.14)';
          g.fillRect(x0, floorTop, r.length * unit, r.width * unit);
          g.strokeStyle = C.dim; g.lineWidth = 1;
          g.strokeRect(x0 + 0.5, floorTop + 0.5, r.length * unit - 1, r.width * unit - 1);
          g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
          g.fillText('floor · ' + r.length + ' by ' + r.width, x0 + r.length * unit / 2,
            floorTop + r.width * unit / 2 + 4);

          /* the wall, standing at i = 0 and flat at i = 3 */
          var wallDown = wallH * k;                       /* how far it has come over */
          var wallUp = wallH * (1 - k);                   /* what is still standing */
          g.fillStyle = 'rgba(255,123,114,0.16)';
          g.beginPath();
          g.moveTo(x0, yBase);
          g.lineTo(x0 + r.length * unit, yBase);
          g.lineTo(x0 + r.length * unit, yBase + wallDown);
          g.lineTo(x0, yBase + wallDown);
          g.closePath();
          g.fill();
          if (wallUp > 1) {                               /* the standing part, foreshortened */
            g.fillStyle = 'rgba(255,123,114,0.10)';
            g.beginPath();
            g.moveTo(x0, yBase);
            g.lineTo(x0 + r.length * unit, yBase);
            g.lineTo(x0 + r.length * unit - wallUp * 0.35, yBase - wallUp * 0.72);
            g.lineTo(x0 - wallUp * 0.35, yBase - wallUp * 0.72);
            g.closePath();
            g.fill();
          }
          g.strokeStyle = '#ff7b72'; g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x0, yBase); g.lineTo(x0 + r.length * unit, yBase);
          g.stroke();
          if (k > 0.4) {
            g.fillStyle = 'rgba(255,123,114,0.85)'; g.font = f(9.5, 600); g.textAlign = 'center';
            g.fillText('wall · ' + r.length + ' by ' + r.height,
              x0 + r.length * unit / 2, yBase + wallDown / 2 + 4);
          }

          /* the ant's route: two legs at the start, one straight line at the end */
          var startX = x0, startY = floorTop;
          var endX = x0 + r.length * unit;
          var endFlatY = yBase + wallH;
          var cornerY = yBase;
          var endY = lerp(cornerY - wallUp * 0.72, endFlatY, k);
          var midX = lerp(endX, x0 + r.length * unit * (r.width / totalUp), k);
          g.strokeStyle = C.gold; g.lineWidth = 2.4; g.lineCap = 'round';
          g.beginPath();
          g.moveTo(startX, startY);
          g.lineTo(midX, cornerY);
          g.lineTo(lerp(endX - wallUp * 0.35, endX, k), endY);
          g.stroke();
          g.lineCap = 'butt';
          g.fillStyle = C.gold;
          g.beginPath(); g.arc(startX, startY, 4, 0, 7); g.fill();
          g.fillStyle = C.good;
          g.beginPath();
          g.arc(lerp(endX - wallUp * 0.35, endX, k), endY, 4, 0, 7);
          g.fill();

          /* the two edges of the flattened rectangle, once it is flat */
          if (k > 0.9) {
            g.fillStyle = C.muted; g.font = f(10, 700);
            g.textAlign = 'center';
            g.fillText(r.length + ' m', x0 + r.length * unit / 2, endFlatY + 16);
            g.textAlign = 'left';
            g.fillText(totalUp + ' m', x0 + r.length * unit + 4, (floorTop + endFlatY) / 2);
          }
          g.fillStyle = '#5b6672'; g.font = f(9.5, 500); g.textAlign = 'left';
          g.fillText('ant starts gold, ends green', x0, h - 5);
        }
      })(host, api);
    });
  })();

  /* =====================================================================
   * u8l2 — 16. two friends and a quarter of an hour
   * Every day is an honest pair of random arrival times, dropped as a dot in
   * the square. The band is where the two times are close enough.
   * ===================================================================== */
  global.QQViz.register('meetingSquare', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No days run yet.');
    var stage = K.Stage(host, 0.98);
    var dots = [], met = 0, days = 0, queue = 0;
    var WAIT = 0.25;

    function oneDay() {
      var a = Math.random(), b = Math.random();
      var ok = Math.abs(a - b) <= WAIT;
      days++;
      if (ok) met++;
      dots.push({ a: a, b: b, ok: ok });
      if (dots.length > 900) dots.shift();
    }
    function render() {
      if (!days) { out.innerHTML = 'No days run yet.'; return; }
      out.innerHTML = 'they met on <b>' + commas(met) + '</b> of ' + commas(days) +
        ' days &nbsp;·&nbsp; <b>' + (met / days * 100).toFixed(1) + '%</b>';
    }
    K.button(ctr, 'One day', function () { oneDay(); render(); api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Run 300 days', function () { queue += 300; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Reset', function () {
      dots = []; met = 0; days = 0; queue = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(queue, 40), i;
      for (i = 0; i < take; i++) oneDay();
      queue -= take;
      if (take) render();

      var pad = 30;
      var S = Math.min(w - pad - 14, h - pad - 22);
      var x0 = pad, y0 = 12;
      function X(a) { return x0 + a * S; }
      function Y(b) { return y0 + (1 - b) * S; }

      g.fillStyle = '#141a21';
      g.fillRect(x0, y0, S, S);

      /* the band where the two arrivals are within a quarter of an hour */
      g.fillStyle = 'rgba(63,185,80,0.20)';
      g.beginPath();
      g.moveTo(X(0), Y(0));
      g.lineTo(X(1 - WAIT), Y(1));
      g.lineTo(X(1), Y(1));
      g.lineTo(X(1), Y(1 - WAIT));
      g.lineTo(X(WAIT), Y(0));
      g.closePath();
      g.fill();
      /* the other half of the band, above the diagonal */
      g.beginPath();
      g.moveTo(X(0), Y(0));
      g.lineTo(X(0), Y(WAIT));
      g.lineTo(X(1 - WAIT), Y(1));
      g.lineTo(X(1), Y(1));
      g.closePath();
      g.fill();

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.strokeRect(x0 + 0.5, y0 + 0.5, S - 1, S - 1);

      for (i = 0; i < dots.length; i++) {
        var d = dots[i];
        g.fillStyle = d.ok ? GREEN : 'rgba(139,148,158,0.5)';
        g.beginPath();
        g.arc(X(d.a), Y(d.b), d.ok ? 2.2 : 1.8, 0, 7);
        g.fill();
      }

      g.fillStyle = C.muted; g.font = f(9.5, 600);
      g.textAlign = 'center';
      g.fillText('one o\'clock', x0 + 22, y0 + S + 13);
      g.fillText('two', x0 + S - 12, y0 + S + 13);
      g.textAlign = 'left';
      g.fillText('Ana arrives →', x0, y0 + S + 26);
      g.save();
      g.translate(x0 - 10, y0 + S);
      g.rotate(-Math.PI / 2);
      g.textAlign = 'left';
      g.fillText('Ben arrives →', 0, 0);
      g.restore();
      g.fillStyle = GREEN; g.font = f(9.5, 700); g.textAlign = 'right';
      g.fillText('they meet in the green band', x0 + S, y0 + S + 26);
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * u8l2 — 17. walking a twisted loop
   * The strip is drawn flat, cut down the middle, with the two ends glued
   * together the wrong way up. Walk it and see where you end up.
   * ===================================================================== */
  global.QQViz.register('mobiusWalk', LAB.steps({
    n: 4,
    aspect: 0.72,
    everyMs: 900,
    playLabel: 'Walk it',
    caption: function (i) {
      return [
        'A strip, cut all the way down the middle. The two ends are glued together — but with a flip, so the top edge meets the bottom edge.',
        'Set off along the <b>top</b> half…',
        'You reach the end and cross the join. The flip drops you onto the <b>bottom</b> half.',
        'Still walking, on the bottom half now, back the way you came.',
        'Over the join again and you are exactly where you started — <b>one piece, two laps round</b>.'
      ][i];
    },
    draw: function (g, w, h, i, t) {
      var pad = 18, y0 = h * 0.3, sh = h * 0.34;
      var sw = w - pad * 2;
      var half = sh / 2;

      /* the strip: top half and bottom half, split by the cut */
      g.fillStyle = 'rgba(88,166,255,0.22)';
      g.fillRect(pad, y0, sw, half);
      g.fillStyle = 'rgba(210,153,34,0.22)';
      g.fillRect(pad, y0 + half, sw, half);
      g.strokeStyle = C.dim; g.lineWidth = 1;
      g.strokeRect(pad + 0.5, y0 + 0.5, sw - 1, sh - 1);

      g.strokeStyle = C.bad; g.lineWidth = 2;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(pad, y0 + half); g.lineTo(pad + sw, y0 + half);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.bad; g.font = f(9.5, 700); g.textAlign = 'left';
      g.fillText('the cut', pad + 2, y0 + half - 5);

      /* the glue, drawn as the crossing pair of arrows it really is */
      g.strokeStyle = 'rgba(230,237,243,0.55)'; g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(pad + sw, y0 + half * 0.5);
      g.bezierCurveTo(pad + sw + 26, y0 - 10, pad - 26, y0 + sh + 10, pad, y0 + half * 1.5);
      g.stroke();
      g.beginPath();
      g.moveTo(pad + sw, y0 + half * 1.5);
      g.bezierCurveTo(pad + sw + 26, y0 + sh + 10, pad - 26, y0 - 10, pad, y0 + half * 0.5);
      g.stroke();
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('the two ends are glued with a flip', w / 2, y0 + sh + 40);

      /* the walker: two laps, top half then bottom half */
      var prog = clamp(i / 4, 0, 1) * 2;                 /* 0 .. 2 laps */
      var lap = prog >= 1 ? 1 : 0;
      var along = prog - lap;
      if (prog >= 2) { lap = 1; along = 1; }
      var wx = pad + sw * (lap === 0 ? along : 1 - along);
      var wy = y0 + (lap === 0 ? half * 0.5 : half * 1.5);
      var pulse = 4.5 + 1.2 * Math.sin(t * 5);
      g.fillStyle = C.good;
      g.beginPath(); g.arc(wx, wy, pulse, 0, 7); g.fill();

      g.fillStyle = C.good; g.font = f(9.5, 700); g.textAlign = 'center';
      g.fillText(i === 0 ? 'start' : (lap === 0 ? 'lap one' : 'lap two'), wx, wy - 12);

      g.fillStyle = BLUE; g.font = f(9.5, 700); g.textAlign = 'right';
      g.fillText('top half', pad + sw - 4, y0 + half * 0.5 + 3);
      g.fillStyle = GOLD;
      g.fillText('bottom half', pad + sw - 4, y0 + half * 1.5 + 3);
    }
  }));

  /* =====================================================================
   * u8l2 — 18. two pegs, two holes
   * Darts land uniformly in each hole; the count is how many hit the peg.
   * ===================================================================== */
  global.QQViz.register('pegDarts', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No darts thrown yet.');
    var stage = K.Stage(host, 0.66);
    var A = { hit: 0, n: 0, pts: [] };      /* round peg in a square hole */
    var B = { hit: 0, n: 0, pts: [] };      /* square peg in a round hole */
    var queue = 0;

    function throwOne() {
      var x, y, on;
      /* left: uniform in the square hole, does it land on the round peg? */
      x = Math.random() * 2 - 1; y = Math.random() * 2 - 1;
      on = x * x + y * y <= 1;
      A.n++; if (on) A.hit++;
      A.pts.push({ x: x, y: y, on: on });
      if (A.pts.length > 700) A.pts.shift();
      /* right: uniform in the round hole, does it land on the square peg? */
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; } while (x * x + y * y > 1);
      on = Math.abs(x) <= Math.SQRT1_2 && Math.abs(y) <= Math.SQRT1_2;
      B.n++; if (on) B.hit++;
      B.pts.push({ x: x, y: y, on: on });
      if (B.pts.length > 700) B.pts.shift();
    }
    function render() {
      if (!A.n) { out.innerHTML = 'No darts thrown yet.'; return; }
      out.innerHTML = '<b>' + commas(A.n) + '</b> darts each &nbsp;·&nbsp; <span style="color:' +
        BLUE + ';font-weight:700">round peg ' + (A.hit / A.n * 100).toFixed(1) +
        '%</span> &nbsp;·&nbsp; <span style="color:' + GOLD + ';font-weight:700">square peg ' +
        (B.hit / B.n * 100).toFixed(1) + '%</span>';
    }
    K.button(ctr, 'Throw 300 darts', function () { queue += 300; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Throw 3,000', function () { queue += 3000; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Clear', function () {
      A = { hit: 0, n: 0, pts: [] }; B = { hit: 0, n: 0, pts: [] };
      queue = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(queue, 120), i;
      for (i = 0; i < take; i++) throwOne();
      queue -= take;
      if (take) render();

      var pad = 12, panel = (w - pad * 3) / 2;
      var R = Math.min(panel / 2 - 4, (h - 78) / 2);
      var cy = 26 + R;
      var cxA = pad + panel / 2, cxB = pad * 2 + panel + panel / 2;
      var s = R * Math.SQRT1_2;

      /* left panel — a round peg sitting in a square hole */
      g.fillStyle = '#141a21';
      g.fillRect(cxA - R, cy - R, R * 2, R * 2);
      g.strokeStyle = C.dim; g.lineWidth = 1.4;
      g.strokeRect(cxA - R + 0.5, cy - R + 0.5, R * 2 - 1, R * 2 - 1);
      g.fillStyle = 'rgba(88,166,255,0.16)';
      g.beginPath(); g.arc(cxA, cy, R, 0, 7); g.fill();
      g.strokeStyle = BLUE; g.lineWidth = 1.6;
      g.beginPath(); g.arc(cxA, cy, R, 0, 7); g.stroke();

      /* right panel — a square peg sitting in a round hole */
      g.fillStyle = '#141a21';
      g.beginPath(); g.arc(cxB, cy, R, 0, 7); g.fill();
      g.strokeStyle = C.dim; g.lineWidth = 1.4;
      g.beginPath(); g.arc(cxB, cy, R, 0, 7); g.stroke();
      g.fillStyle = 'rgba(210,153,34,0.16)';
      g.fillRect(cxB - s, cy - s, s * 2, s * 2);
      g.strokeStyle = GOLD; g.lineWidth = 1.6;
      g.strokeRect(cxB - s + 0.5, cy - s + 0.5, s * 2 - 1, s * 2 - 1);

      for (i = 0; i < A.pts.length; i++) {
        var p = A.pts[i];
        g.fillStyle = p.on ? BLUE : 'rgba(139,148,158,0.45)';
        g.beginPath(); g.arc(cxA + p.x * R, cy + p.y * R, 1.5, 0, 7); g.fill();
      }
      for (i = 0; i < B.pts.length; i++) {
        var q = B.pts[i];
        g.fillStyle = q.on ? GOLD : 'rgba(139,148,158,0.45)';
        g.beginPath(); g.arc(cxB + q.x * R, cy + q.y * R, 1.5, 0, 7); g.fill();
      }

      g.font = f(10, 700); g.textAlign = 'center';
      g.fillStyle = BLUE; g.fillText('round peg, square hole', cxA, cy - R - 8);
      g.fillStyle = GOLD; g.fillText('square peg, round hole', cxB, cy - R - 8);

      g.font = f(12, 800);
      g.fillStyle = A.n ? BLUE : C.dim;
      g.fillText(A.n ? (A.hit / A.n * 100).toFixed(1) + '%' : '—', cxA, cy + R + 22);
      g.fillStyle = B.n ? GOLD : C.dim;
      g.fillText(B.n ? (B.hit / B.n * 100).toFixed(1) + '%' : '—', cxB, cy + R + 22);
      g.fillStyle = C.muted; g.font = f(9.5, 500);
      g.fillText('of the hole taken up by the peg', w / 2, h - 6);
    };
    return { destroy: stage.destroy };
  });
})(window);
