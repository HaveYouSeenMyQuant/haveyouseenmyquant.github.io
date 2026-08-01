/* QQ visuals — the premium sets: Jane Street and Citadel.
 *
 * Same house rule as everywhere else: animate the thing, never draw the
 * formula. Every visual here is draggable, tappable or re-runnable, every
 * simulation samples honestly, and none of them prints the answer before the
 * player has driven the interaction there themselves.
 *
 * Loads after js/viz.js (the kit) and js/viz_lab.js (the engine kit).
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, el = K.el, clamp = K.clamp;
  var roundRect = K.roundRect;
  var LAB = global.QQLab;
  var U = LAB.util;

  function die() { return 1 + Math.floor(Math.random() * 6); }
  function commas(n) { return U.commas(Math.round(n)); }

  /* ======================================================================
   * JANE STREET
   * ==================================================================== */

  /* 1. up to three rolls — three stopping rules, raced */
  function threeRollPolicy(firstKeep, secondKeep) {
    var a = die();
    if (a >= firstKeep) return a;
    var b = die();
    if (b >= secondKeep) return b;
    return die();
  }
  global.QQViz.register('jsThreeRolls', LAB.race({
    lanes: [
      { name: 'always take the third', trial: function () { return threeRollPolicy(7, 7); } },
      { name: 'keep 4 or more', trial: function () { return threeRollPolicy(4, 4); } },
      { name: 'keep 5 or 6, then 4+', trial: function () { return threeRollPolicy(5, 4); } }
    ],
    batches: [50, 2000], maxV: 6, dp: 2, unit: 'pounds', aspect: 0.72,
    idle: 'Three ways to play the same three rolls. Run them.',
    axisLabel: 'average payout over the runs so far'
  }));

  /* 2. the market you quoted, traded over and over */
  global.QQViz.register('jsMarketEdge', LAB.sim({
    trial: function () { return die() + die() + die() - 9; },
    mode: 'mean', label: 'profit', min: -6, max: 9, dp: 2,
    batches: [20, 2000],
    highlight: function (k) { return k < 0; },
    idle: 'You bought the total at 9. Settle the trade a few thousand times.',
    axisLabel: 'your profit on the trade, in pounds (gold = you lost)'
  }));

  /* 3. calling every card in the deck */
  global.QQViz.register('jsNextCard', LAB.sim({
    trial: function () {
      var deck = [], i;
      for (i = 0; i < 26; i++) { deck.push(1); deck.push(0); }
      U.shuffle(deck);
      var redLeft = 26, blackLeft = 26, hits = 0;
      for (i = 0; i < 52; i++) {
        var call = redLeft > blackLeft ? 1 : 0;
        if (call === deck[i]) hits++;
        if (deck[i]) redLeft--; else blackLeft--;
      }
      return hits;
    },
    mode: 'mean', label: 'right', min: 20, max: 45, dp: 2,
    batches: [20, 500], perFrame: 60,
    idle: 'Call the colour with more cards left, every time. Run whole decks.',
    axisLabel: 'cards called right out of 52'
  }));

  /* 4. the game he only plays when he is ahead */
  global.QQViz.register('jsDecline', LAB.sim({
    trial: function () {
      var his, mine;
      do { his = die(); } while (his < 5);
      mine = die();
      return mine > his ? 10 : (mine < his ? -10 : 0);
    },
    mode: 'mean', label: 'pounds', min: -10, max: 10, step: 10, dp: 2,
    batches: [20, 2000],
    highlight: function (k) { return k < 0; },
    idle: 'Only the rounds he agrees to play. Run a few thousand.',
    axisLabel: 'what you win or lose on a round that happens'
  }));

  /* 5. stopping on a shuffled deck — play it yourself */
  global.QQViz.register('jsRedStop', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Turn cards, then bet a pound on the next one being red.');
    var stage = K.Stage(host, 0.62);
    var deck = [], pos = 0, redLeft = 26, blackLeft = 26;
    var total = 0, decks = 0, lastCard = -1, lastResult = 0, resultAt = -9999;

    function fresh() {
      deck = [];
      for (var i = 0; i < 26; i++) { deck.push(1); deck.push(0); }
      U.shuffle(deck);
      pos = 0; redLeft = 26; blackLeft = 26; lastCard = -1;
    }
    function say(msg) {
      out.innerHTML = msg + ' &nbsp;·&nbsp; <b>' + decks + '</b> deck' +
        (decks === 1 ? '' : 's') + ' played &nbsp;·&nbsp; you are ' +
        (total >= 0 ? 'up' : 'down') + ' <b>£' + Math.abs(total) + '</b>';
    }
    fresh();
    say('Turn cards, then bet when you like');

    K.button(ctr, 'Turn a card', function () {
      if (pos >= 51) { say('One card left — you must bet'); return; }
      lastCard = deck[pos++];
      if (lastCard) redLeft--; else blackLeft--;
      say(lastCard ? 'A red one' : 'A black one');
      api.onInteract('turn');
    }).classList.add('small');

    K.button(ctr, 'Bet on red', function () {
      lastCard = deck[pos++];
      if (lastCard) redLeft--; else blackLeft--;
      lastResult = lastCard ? 1 : -1;
      total += lastResult;
      resultAt = performance.now();
      decks++;
      say(lastCard ? 'Red — you win a pound' : 'Black — you lose a pound');
      fresh();
      api.onInteract('bet');
    }).classList.add('primary');

    K.button(ctr, 'Reset', function () {
      total = 0; decks = 0; fresh(); say('Fresh start');
      api.onInteract('reset');
    }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 16, barW = w - pad * 2, barY = 30, barH = 26;
      var left = redLeft + blackLeft;
      var redShare = left ? redLeft / left : 0.5;
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
      g.fillText('what is still in the deck', pad, barY - 8);
      g.fillStyle = '#f85149';
      roundRect(g, pad, barY, Math.max(2, barW * redShare), barH, 6); g.fill();
      g.fillStyle = '#30363d';
      roundRect(g, pad + barW * redShare, barY, Math.max(2, barW * (1 - redShare)), barH, 6); g.fill();
      g.fillStyle = '#0d1117'; g.font = f(12, 800); g.textAlign = 'left';
      g.fillText(redLeft + ' red', pad + 8, barY + 18);
      g.fillStyle = C.fg; g.textAlign = 'right';
      g.fillText(blackLeft + ' black', w - pad - 8, barY + 18);

      /* the cards already turned, as a strip of pips */
      var stripY = barY + barH + 22, cell = Math.max(4, (w - pad * 2) / 52);
      for (var i = 0; i < 52; i++) {
        var x = pad + i * cell;
        if (i < pos) g.fillStyle = deck[i] ? 'rgba(248,81,73,0.85)' : 'rgba(139,148,158,0.6)';
        else g.fillStyle = '#1c232c';
        roundRect(g, x + 0.5, stripY, cell - 1.5, 16, 2); g.fill();
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText(pos + ' turned, ' + (52 - pos) + ' to come', pad, stripY + 30);

      if (lastResult !== 0 && performance.now() - resultAt < 1400) {
        g.fillStyle = lastResult > 0 ? '#3fb950' : '#f85149';
        g.font = f(15, 800); g.textAlign = 'right';
        g.fillText(lastResult > 0 ? '+£1' : '-£1', w - pad, stripY + 30);
      }
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
      g.fillText('running total: ' + (total >= 0 ? '+' : '-') + '£' + Math.abs(total) +
        ' over ' + decks + ' decks', pad, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* 6. the doubling game against a house of finite size */
  function stPeteValue(cap) {
    var total = 0;
    for (var n = 1; n <= 60; n++) {
      var pay = Math.pow(2, n);
      total += Math.min(pay, cap) / pay;
    }
    return total;
  }
  global.QQViz.register('jsStPete', LAB.dial({
    min: 3, max: 12, step: 0.25, value: 3,
    label: 'how big the house is',
    f: function (x) { return stPeteValue(Math.pow(10, x)); },
    ymin: 0,
    xmin: '£1,000', xmax: '£1,000,000,000,000',
    yLabel: 'what a seat is worth, in pounds',
    readout: function (x, y) {
      return 'The house can pay <b>£' + commas(Math.pow(10, x)) +
        '</b> &nbsp;·&nbsp; a seat is worth <b>£' + y.toFixed(2) + '</b>';
    }
  }));

  /* 7. collecting all six faces */
  global.QQViz.register('jsCoupon', LAB.sim({
    trial: function () {
      var seen = {}, count = 0, rolls = 0;
      while (count < 6) {
        var d = die();
        if (!seen[d]) { seen[d] = 1; count++; }
        rolls++;
      }
      return rolls;
    },
    mode: 'mean', label: 'rolls', min: 6, max: 45, dp: 2,
    batches: [20, 2000],
    idle: 'Roll until all six faces have shown. Run it thousands of times.',
    axisLabel: 'rolls needed to see every face'
  }));

  /* 8. four dice bets, raced */
  global.QQViz.register('jsOrderBets', LAB.race({
    lanes: [
      { name: '£10 if one die is a six', trial: function () { return die() === 6 ? 10 : 0; } },
      { name: '£10 if a six in two dice', trial: function () { return (die() === 6 || die() === 6) ? 10 : 0; } },
      { name: '£1 a pip on one die', trial: function () { return die(); } },
      { name: '£10 if two total 7+', trial: function () { return die() + die() >= 7 ? 10 : 0; } }
    ],
    batches: [50, 2000], maxV: 7, dp: 2, unit: 'pounds', aspect: 0.9,
    idle: 'Four bets, same dice. Run them and watch them separate.',
    axisLabel: 'average payout so far'
  }));

  /* 9. keep it or switch — drag the line */
  function twoCardRate(t) {
    var wins = 0, total = 0, seen, other;
    for (seen = 1; seen <= 10; seen++) {
      for (other = 1; other <= 10; other++) {
        if (seen === other) continue;
        total++;
        if (seen >= t) { if (seen > other) wins++; }
        else if (other > seen) wins++;
      }
    }
    return 100 * wins / total;
  }
  global.QQViz.register('jsTwoCards', LAB.dial({
    min: 1, max: 11, step: 1, value: 1,
    label: 'the line you keep a card at',
    f: function (x) { return twoCardRate(Math.round(x)); },
    ymin: 40, ymax: 85, fill: true,
    xmin: 'keep anything', xmax: 'always switch',
    yLabel: 'how often you end up with the bigger number',
    readout: function (x, y) {
      var t = Math.round(x);
      var rule = t <= 1 ? 'Keep whatever you turn over'
        : (t >= 11 ? 'Switch every time' : 'Keep it only if it is ' + t + ' or more');
      return rule + ' &nbsp;·&nbsp; you win <b>' + y.toFixed(1) + '%</b> of the time';
    }
  }));

  /* 10. the pot that a one wipes out */
  function bustValue(stopAt) {
    var cap = stopAt + 60, v = [], pot;
    for (pot = cap; pot >= 0; pot--) {
      if (pot >= stopAt) v[pot] = pot;
      else v[pot] = (v[pot + 2] + v[pot + 3] + v[pot + 4] + v[pot + 5] + v[pot + 6]) / 6;
    }
    return v[0];
  }
  global.QQViz.register('jsBust', LAB.dial({
    min: 2, max: 45, step: 1, value: 4,
    label: 'the pot you stop at',
    f: function (x) { return bustValue(Math.round(x)); },
    ymin: 0, fill: true,
    xmin: 'stop at once', xmax: 'push your luck',
    yLabel: 'what the game is worth, in pips',
    readout: function (x, y) {
      return 'Stop as soon as the pot reaches <b>' + Math.round(x) +
        '</b> &nbsp;·&nbsp; the game is worth <b>' + y.toFixed(2) + '</b> pips';
    }
  }));

  /* 11. how far down the first ace sits */
  global.QQViz.register('jsFirstAce', LAB.sim({
    trial: function () {
      var deck = [], i;
      for (i = 0; i < 52; i++) deck.push(i < 4 ? 1 : 0);
      U.shuffle(deck);
      for (i = 0; i < 52; i++) if (deck[i]) return i + 1;
      return 52;
    },
    mode: 'mean', label: 'cards', min: 1, max: 49, dp: 2,
    batches: [20, 2000],
    idle: 'Shuffle a deck and find the first ace. Do it a few thousand times.',
    axisLabel: 'how far down the deck the first ace was'
  }));

  /* 12. four priced bets — tap one and watch it pay */
  var SCAN = [
    { id: 'pips', price: 4, title: '£4 a go', line: 'you are paid the pips on one die',
      play: function () { return die() - 4; } },
    { id: 'larger', price: 4, title: '£4 a go', line: 'you are paid the larger of two dice',
      play: function () { return Math.max(die(), die()) - 4; } },
    { id: 'six', price: 2, title: '£2 a go', line: '£12 if one die shows a six',
      play: function () { return (die() === 6 ? 12 : 0) - 2; } },
    { id: 'total', price: 8, title: '£8 a go', line: 'you are paid the total of two dice',
      play: function () { return die() + die() - 8; } }
  ];
  global.QQViz.register('jsFairScan', function (host, api) {
    var runs = {}, sums = {};
    SCAN.forEach(function (s) { runs[s.id] = 0; sums[s.id] = 0; });
    var current = null;
    var viz = LAB.picture({
      aspect: 0.86,
      readout: function (id) {
        if (!id) return 'Tap a bet. It will start paying out below.';
        var s = null;
        SCAN.forEach(function (x) { if (x.id === id) s = x; });
        return '<b>' + s.title + '</b> — ' + s.line;
      },
      hitTest: function (px, py, w, h) {
        var col = px < w / 2 ? 0 : 1, row = py < h / 2 ? 0 : 1;
        var idx = row * 2 + col;
        return SCAN[idx] ? SCAN[idx].id : null;
      },
      draw: function (g, w, h, sel) {
        if (sel !== current) { current = sel; }
        if (current) {
          for (var k = 0; k < 40; k++) {
            SCAN.forEach(function (s) {
              if (s.id !== current) return;
              sums[s.id] += s.play(); runs[s.id]++;
            });
          }
        }
        var pad = 8, cw = (w - pad * 3) / 2, ch = (h - pad * 3) / 2;
        SCAN.forEach(function (s, i) {
          var x = pad + (i % 2) * (cw + pad), y = pad + ((i / 2) | 0) * (ch + pad);
          var on = s.id === sel;
          g.fillStyle = on ? 'rgba(88,166,255,0.16)' : C.panel;
          roundRect(g, x, y, cw, ch, 10); g.fill();
          g.strokeStyle = on ? C.accent : C.line; g.lineWidth = on ? 2 : 1;
          roundRect(g, x, y, cw, ch, 10); g.stroke();
          g.fillStyle = on ? C.accent : C.fg; g.font = f(14, 800); g.textAlign = 'left';
          g.fillText(s.title, x + 12, y + 24);
          g.fillStyle = C.muted; g.font = f(10.5, 500);
          var words = s.line.split(' '), line = '', yy = y + 42;
          for (var wi = 0; wi < words.length; wi++) {
            var test = line ? line + ' ' + words[wi] : words[wi];
            if (g.measureText(test).width > cw - 22 && line) {
              g.fillText(line, x + 12, yy); yy += 13; line = words[wi];
            } else line = test;
          }
          g.fillText(line, x + 12, yy);
          if (runs[s.id] > 0) {
            var avg = sums[s.id] / runs[s.id];
            g.fillStyle = avg > 0 ? '#3fb950' : (avg < 0 ? '#f85149' : C.gold);
            g.font = f(15, 800); g.textAlign = 'left';
            g.fillText((avg >= 0 ? '+' : '-') + '£' + Math.abs(avg).toFixed(2),
              x + 12, y + ch - 22);
            g.fillStyle = C.muted; g.font = f(9.5, 500);
            g.fillText('a go, over ' + U.commas(runs[s.id]) + ' goes', x + 12, y + ch - 9);
          }
        });
      }
    });
    return viz(host, api);
  });

  /* ======================================================================
   * CITADEL
   * ==================================================================== */

  /* 1. the climb back out of a hole */
  global.QQViz.register('citRecovery', LAB.dial({
    min: 5, max: 80, step: 1, value: 10,
    label: 'how far it fell',
    f: function (x) { return 100 * x / (100 - x); },
    ymin: 0, fill: true,
    xmin: 'a small dip', xmax: 'down 80%',
    yLabel: 'the rise you need to get back, in percent',
    readout: function (x, y) {
      return 'Down <b>' + Math.round(x) + '%</b> &nbsp;·&nbsp; you need <b>+' +
        y.toFixed(1) + '%</b> to get back';
    }
  }));

  /* 2. two funds with the same average year */
  global.QQViz.register('citTwoFunds', LAB.steps({
    n: 2, aspect: 0.72, everyMs: 900, playLabel: 'Play the years',
    caption: function (i) {
      var a = [100, 200, 100][i], b = [100, 125, 156.25][i];
      var when = ['Both start with £100', 'After year one', 'After year two'][i];
      return when + ' &nbsp;·&nbsp; <span style="color:#58a6ff;font-weight:700">A £' +
        a.toFixed(0) + '</span> &nbsp;·&nbsp; <span style="color:#d29922;font-weight:700">B £' +
        b.toFixed(2) + '</span>';
    },
    draw: function (g, w, h, i) {
      var a = [100, 200, 100][i], b = [100, 125, 156.25][i];
      var pad = 20, base = h - 30, top = 24, maxV = 210;
      var bw = (w - pad * 3) / 2;
      var rows = [
        { name: 'Fund A  +100%, then -50%', v: a, col: C.accent, x: pad },
        { name: 'Fund B  +25%, then +25%', v: b, col: C.gold, x: pad * 2 + bw }
      ];
      rows.forEach(function (r) {
        var bh = (base - top) * (r.v / maxV);
        g.fillStyle = C.panel; roundRect(g, r.x, top, bw, base - top, 8); g.fill();
        g.fillStyle = r.col; roundRect(g, r.x, base - bh, bw, bh, 8); g.fill();
        g.fillStyle = '#0d1117'; g.font = f(15, 800); g.textAlign = 'center';
        g.fillText('£' + r.v.toFixed(r.v === Math.round(r.v) ? 0 : 2), r.x + bw / 2, base - bh + 20);
        g.fillStyle = C.muted; g.font = f(10, 600);
        g.fillText(r.name, r.x + bw / 2, base + 16);
      });
      /* the line they both started on */
      var startY = base - (base - top) * (100 / maxV);
      g.strokeStyle = 'rgba(139,148,158,0.45)'; g.lineWidth = 1; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(pad, startY); g.lineTo(w - pad, startY); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('where they started', pad, startY - 5);
      g.textAlign = 'right';
      g.fillText(['start', 'year one', 'year two'][i], w - pad, top - 8);
    }
  }));

  /* 3. two hundred twenty-year paths */
  global.QQViz.register('citTypicalRun', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Nothing run yet.');
    var stage = K.Stage(host, 0.78);
    var YEARS = 20, finals = [], paths = [], pending = 0;

    function onePath() {
      var pot = 100, p = [pot];
      for (var y = 0; y < YEARS; y++) {
        pot *= Math.random() < 0.5 ? 1.5 : 0.6;
        p.push(pot);
      }
      finals.push(pot);
      paths.push(p);
      if (paths.length > 120) paths.shift();
    }
    function render() {
      if (!finals.length) { out.innerHTML = 'Nothing run yet.'; return; }
      var sorted = finals.slice().sort(function (a, b) { return a - b; });
      var mid = sorted.length % 2 ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      var sum = 0;
      for (var i = 0; i < finals.length; i++) sum += finals[i];
      out.innerHTML = '<b>' + U.commas(finals.length) + '</b> runs &nbsp;·&nbsp; ' +
        'middle result <b>£' + mid.toFixed(0) + '</b> &nbsp;·&nbsp; ' +
        'average <b>£' + (sum / finals.length).toFixed(0) + '</b>';
    }
    K.button(ctr, 'Run 20', function () { pending += 20; api.onInteract('run'); }).classList.add('small');
    K.button(ctr, 'Run 2,000', function () { pending += 2000; api.onInteract('run'); }).classList.add('primary');
    K.button(ctr, 'Reset', function () {
      finals = []; paths = []; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 150);
      for (var i = 0; i < take; i++) onePath();
      pending -= take;
      if (take) render();

      var pad = 30, top = 16, base = h - 22;
      var loT = -1, hiT = 4;                       /* £0.10 up to £10,000, in powers of ten */
      function Y(v) {
        var lg = Math.log(Math.max(v, 0.1)) / Math.LN10;
        return base - (base - top) * ((clamp(lg, loT, hiT) - loT) / (hiT - loT));
      }
      function X(y) { return pad + (w - pad - 10) * (y / YEARS); }

      var ticks = [0.1, 1, 10, 100, 1000, 10000];
      g.font = f(9.5, 500); g.textAlign = 'right';
      for (var t = 0; t < ticks.length; t++) {
        var yy = Y(ticks[t]);
        g.strokeStyle = ticks[t] === 100 ? 'rgba(210,153,34,0.5)' : 'rgba(139,148,158,0.16)';
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(pad, yy); g.lineTo(w - 10, yy); g.stroke();
        g.fillStyle = ticks[t] === 100 ? C.gold : C.muted;
        g.fillText('£' + (ticks[t] < 1 ? ticks[t].toFixed(1) : U.commas(ticks[t])), pad - 4, yy + 3);
      }
      for (var p = 0; p < paths.length; p++) {
        var path = paths[p];
        g.strokeStyle = path[YEARS] >= 100 ? 'rgba(63,185,80,0.5)' : 'rgba(88,166,255,0.35)';
        g.lineWidth = 1;
        g.beginPath();
        for (var y2 = 0; y2 <= YEARS; y2++) {
          var px = X(y2), py = Y(path[y2]);
          if (y2 === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText(paths.length ? 'the last ' + paths.length + ' paths, over twenty years'
        : 'press run — each line is one twenty-year run', pad, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* 4. what a correlation actually looks like */
  global.QQViz.register('citCloudDial', function (host, api) {
    var N = 140, xs = [], zs = [], i;
    for (i = 0; i < N; i++) { xs.push(U.gauss()); zs.push(U.gauss()); }
    var viz = LAB.drag({
      min: 0, max: 0.95, value: 0, snap: 0.05, axis: 'x', gain: 0.9, aspect: 0.9,
      hint: 'drag the cloud tighter',
      readout: function (v) {
        return 'Correlation <b>' + v.toFixed(2) + '</b> — every dot is one pair of measurements.';
      },
      draw: function (g, w, h, v) {
        var pad = 26, size = Math.min(w - pad * 2, h - pad - 14);
        var ox = (w - size) / 2, oy = 12;
        g.strokeStyle = C.line; g.lineWidth = 1;
        g.strokeRect(ox, oy, size, size);
        var k = Math.sqrt(Math.max(0, 1 - v * v));
        for (var j = 0; j < N; j++) {
          var x = xs[j], y = v * xs[j] + k * zs[j];
          var px = ox + size * clamp(0.5 + x / 6.5, 0.01, 0.99);
          var py = oy + size * clamp(0.5 - y / 6.5, 0.01, 0.99);
          g.fillStyle = 'rgba(88,166,255,0.75)';
          g.beginPath(); g.arc(px, py, 2.6, 0, 7); g.fill();
        }
        g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
        g.fillText('one thing', ox, oy + size + 12);
        g.textAlign = 'right';
        g.fillText('the other thing', ox + size, oy + size + 12);
      }
    });
    return viz(host, api);
  });

  /* 5. four clouds, tap one to see it up close */
  global.QQViz.register('citClouds', function (host, api) {
    var data = (api.data && api.data.premiumJs && api.data.premiumJs.clouds) || {};
    var names = ['A', 'B', 'C', 'D'];
    var out = K.readout(host, 'Tap a cloud to see it up close.');
    var stage = K.Stage(host, 0.92);
    var focus = null;

    function bounds(pts) {
      var lo = [1e9, 1e9], hi = [-1e9, -1e9];
      pts.forEach(function (p) {
        lo[0] = Math.min(lo[0], p[0]); hi[0] = Math.max(hi[0], p[0]);
        lo[1] = Math.min(lo[1], p[1]); hi[1] = Math.max(hi[1], p[1]);
      });
      return { lo: lo, hi: hi };
    }
    function panel(g, name, x, y, wid, hei, big) {
      var pts = data[name] || [];
      g.fillStyle = C.panel; roundRect(g, x, y, wid, hei, 8); g.fill();
      g.strokeStyle = focus === name ? C.accent : C.line;
      g.lineWidth = focus === name ? 2 : 1;
      roundRect(g, x, y, wid, hei, 8); g.stroke();
      var b = bounds(pts), pad = big ? 22 : 12;
      pts.forEach(function (p) {
        var px = x + pad + (wid - pad * 2) * ((p[0] - b.lo[0]) / Math.max(1e-9, b.hi[0] - b.lo[0]));
        var py = y + hei - pad - (hei - pad * 2) * ((p[1] - b.lo[1]) / Math.max(1e-9, b.hi[1] - b.lo[1]));
        g.fillStyle = focus === name ? 'rgba(88,166,255,0.9)' : 'rgba(88,166,255,0.6)';
        g.beginPath(); g.arc(px, py, big ? 3.2 : 2.1, 0, 7); g.fill();
      });
      g.fillStyle = focus === name ? C.accent : C.muted;
      g.font = f(big ? 13 : 11, 800); g.textAlign = 'left';
      g.fillText(name, x + 7, y + (big ? 17 : 14));
    }
    function onTap(ev) {
      var p = stage.pointer(ev), w = stage.w, h = stage.h - 6;
      if (focus) { focus = null; out.innerHTML = 'All four clouds. Tap one to see it up close.'; }
      else {
        var col = p.x < w / 2 ? 0 : 1, row = p.y < h / 2 ? 0 : 1;
        focus = names[row * 2 + col];
        out.innerHTML = 'Cloud <b>' + focus + '</b> — ' + (data[focus] || []).length +
          ' pairs. Tap again for all four.';
      }
      api.onInteract('cloud');
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var pad = 8;
      if (focus) { panel(g, focus, pad, pad, w - pad * 2, h - pad * 2, true); return; }
      var cw = (w - pad * 3) / 2, ch = (h - pad * 3) / 2;
      names.forEach(function (n, i) {
        panel(g, n, pad + (i % 2) * (cw + pad), pad + ((i / 2) | 0) * (ch + pad), cw, ch, false);
      });
    };
    return { destroy: stage.destroy };
  });

  /* 6. swings falling with the square root */
  global.QQViz.register('citDiversify', LAB.dial({
    min: 1, max: 40, step: 1, value: 1,
    label: 'how many strategies',
    f: function (x) { return 20 / Math.sqrt(Math.round(x)); },
    ymin: 0, fill: true,
    xmin: 'one', xmax: 'forty',
    yLabel: 'swings of the whole lot, in percent',
    readout: function (x, y) {
      return '<b>' + Math.round(x) + '</b> independent strateg' +
        (Math.round(x) === 1 ? 'y' : 'ies') + ' &nbsp;·&nbsp; swings of <b>' +
        y.toFixed(1) + '%</b>';
    }
  }));

  /* 7. the floor that shared moves put under the swings */
  global.QQViz.register('citFloor', LAB.dial({
    min: 1, max: 50, step: 1, value: 1,
    label: 'how many strategies',
    f: function (x) { return 20 * Math.sqrt(0.5 + 0.5 / Math.round(x)); },
    f2: function (x) { return 20 / Math.sqrt(Math.round(x)); },
    ymin: 0,
    xmin: 'one', xmax: 'fifty',
    yLabel: 'swings, in percent (gold = if they were independent)',
    readout: function (x, y) {
      return '<b>' + Math.round(x) + '</b> strateg' + (Math.round(x) === 1 ? 'y' : 'ies') +
        ' &nbsp;·&nbsp; swings <b>' + y.toFixed(1) + '%</b> &nbsp;·&nbsp; ' +
        '<span style="color:#d29922">independent: ' +
        (20 / Math.sqrt(Math.round(x))).toFixed(1) + '%</span>';
    }
  }));

  /* 8. how long a track record has to be */
  global.QQViz.register('citTrackRecord', LAB.dial({
    min: 5, max: 2400, step: 5, value: 20,
    label: 'days of records',
    f: function (x) { return 10000 / Math.sqrt(x); },
    f2: function (x) { return 1000 / Math.sqrt(x); },
    ymin: 0, ymax: 2600,
    marks: [{ x: 20, label: '20 days' }],
    xmin: '5 days', xmax: '2,400 days',
    yLabel: 'how far the measured average can still be out, in pounds a day',
    readout: function (x, y) {
      return 'After <b>' + U.commas(x) + '</b> days &nbsp;·&nbsp; wild trader out by ±<b>£' +
        y.toFixed(0) + '</b> a day &nbsp;·&nbsp; <span style="color:#d29922">steady one ±£' +
        (1000 / Math.sqrt(x)).toFixed(0) + '</span> &nbsp;·&nbsp; the edge itself is £1,000';
    }
  }));

  /* 9. a big edge, a small bank */
  global.QQViz.register('citRuin', LAB.sim({
    trial: function () {
      var pot = 5;
      for (var i = 0; i < 4000; i++) {
        pot += Math.random() < 0.6 ? 1 : -1;
        if (pot === 0) return true;
        if (pot >= 120) return false;
      }
      return false;
    },
    mode: 'rate', batches: [50, 500], perFrame: 25,
    rateLabel: 'of lifetimes ended at zero',
    barLabel: 'share of lifetimes that went bust',
    idle: 'Each run plays until the money is gone or the bank reaches £120.'
  }));

  /* 10. how often a good strategy still loses */
  global.QQViz.register('citLosingYear', function (host, api) {
    var red = 0, seen = 0;
    var viz = LAB.sim({
      trial: function () {
        var r = 10 + 15 * U.gauss();
        seen++; if (r < 0) red++;
        return Math.round(r);
      },
      mode: 'hist', label: 'percent', min: -45, max: 65, dp: 1,
      batches: [20, 2000],
      highlight: function (k) { return k < 0; },
      idle: 'Run years of this strategy. Losing years are picked out in gold.',
      axisLabel: 'the return in one year, in percent',
      statLine: function (st) {
        return '<b>' + U.commas(st.n) + '</b> years &nbsp;·&nbsp; average <b>' +
          st.mean.toFixed(1) + '%</b> &nbsp;·&nbsp; <span style="color:#d29922">' +
          U.commas(red) + ' of them lost money (' + (100 * red / Math.max(1, seen)).toFixed(1) +
          '%)</span>';
      }
    });
    return viz(host, api);
  });

  /* 11. a hundred days of two forecasters */
  global.QQViz.register('citForecast', function (host, api) {
    var fc = (api.data && api.data.premiumJs && api.data.premiumJs.forecast) ||
      { rained: [], brenda: [] };
    var rained = fc.rained, brenda = fc.brenda, n = rained.length;
    var chips = K.controls(host);
    var out = K.readout(host, 'A hundred days. Light them up.');
    var stage = K.Stage(host, 0.92);
    var mode = null, chipEls = [];

    function lit(i) {
      if (mode === 'rain') return rained[i] === 1;
      if (mode === 'alan') return false;               /* Alan never calls rain */
      if (mode === 'brenda') return brenda[i] === 1;
      return false;
    }
    function count() {
      var c = 0;
      for (var i = 0; i < n; i++) if (lit(i)) c++;
      return c;
    }
    [['It rained', 'rain'], ['Alan said rain', 'alan'], ['Brenda said rain', 'brenda']]
      .forEach(function (pair) {
        var b = el('button', 'viz-chip', pair[0]);
        b.type = 'button';
        b.addEventListener('click', function () {
          mode = pair[1];
          chipEls.forEach(function (x) { x.classList.toggle('on', x === b); });
          var c = count();
          if (mode === 'alan') {
            out.innerHTML = 'Alan called rain on <b>0</b> of the ' + n +
              ' days — he said dry every single time.';
          } else if (mode === 'rain') {
            out.innerHTML = 'It rained on <b>' + c + '</b> of the ' + n + ' days.';
          } else {
            var hits = 0;
            for (var i = 0; i < n; i++) if (brenda[i] === 1 && rained[i] === 1) hits++;
            out.innerHTML = 'Brenda called rain on <b>' + c + '</b> days, and <b>' +
              hits + '</b> of those were wet.';
          }
          api.onInteract('chip');
        });
        chips.appendChild(b); chipEls.push(b);
      });

    stage.draw = function (g, w, h) {
      var cols = 10, rows = Math.ceil(n / cols);
      var pad = 10;
      var size = Math.min((w - pad * 2) / cols, (h - pad * 2 - 16) / rows);
      var ox = (w - size * cols) / 2, oy = pad;
      for (var i = 0; i < n; i++) {
        var x = ox + (i % cols) * size, y = oy + ((i / cols) | 0) * size;
        var on = lit(i);
        g.fillStyle = on ? C.accent : '#1c232c';
        roundRect(g, x + 2, y + 2, size - 4, size - 4, 4); g.fill();
        if (mode === 'brenda' && on && rained[i] === 1) {
          g.fillStyle = '#0d1117';
          g.beginPath(); g.arc(x + size / 2, y + size / 2, Math.max(2, size * 0.13), 0, 7); g.fill();
        }
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText(mode === 'brenda' ? 'lit = Brenda called rain, dot = it really rained'
        : 'one square is one day', ox, oy + size * rows + 13);
    };
    return { destroy: stage.destroy };
  });

  /* 12. four mixes of the same two funds */
  global.QQViz.register('citMix', function (host, api) {
    var YEARS = 24, SA = 20, SB = 30, RHO = -0.3;
    var za = [], zb = [], i;
    for (i = 0; i < YEARS; i++) {
      var a = U.gauss(), b = U.gauss();
      za.push(a);
      zb.push(RHO * a + Math.sqrt(1 - RHO * RHO) * b);
    }
    var MIX = [
      { id: 'all_a', w: 1.0, name: 'All in A' },
      { id: 'mostly_a', w: 0.7, name: '70% A, 30% B' },
      { id: 'half', w: 0.5, name: 'Half and half' },
      { id: 'all_b', w: 0.0, name: 'All in B' }
    ];
    function series(w) {
      var s = [];
      for (var j = 0; j < YEARS; j++) s.push(w * SA * za[j] + (1 - w) * SB * zb[j]);
      return s;
    }
    function swing(s) {
      var m = 0, j;
      for (j = 0; j < s.length; j++) m += s[j];
      m /= s.length;
      var v = 0;
      for (j = 0; j < s.length; j++) v += (s[j] - m) * (s[j] - m);
      return Math.sqrt(v / (s.length - 1));
    }
    var lines = MIX.map(function (m) { return series(m.w); });

    var viz = LAB.picture({
      aspect: 0.95,
      readout: function (id) {
        if (!id) return 'Tap a mix. Every mix runs through the same twenty-four years.';
        var idx = 0;
        MIX.forEach(function (m, j) { if (m.id === id) idx = j; });
        return '<b>' + MIX[idx].name + '</b> &nbsp;·&nbsp; swings of about <b>' +
          swing(lines[idx]).toFixed(0) + '%</b> a year';
      },
      hitTest: function (px, py, w, h) {
        var idx = Math.floor(py / (h / MIX.length));
        return MIX[idx] ? MIX[idx].id : null;
      },
      draw: function (g, w, h, sel) {
        var laneH = h / MIX.length, pad = 12;
        MIX.forEach(function (m, i2) {
          var y0 = i2 * laneH, mid = y0 + laneH * 0.62;
          var on = m.id === sel;
          if (on) {
            g.fillStyle = 'rgba(88,166,255,0.10)';
            roundRect(g, 2, y0 + 2, w - 4, laneH - 4, 8); g.fill();
          }
          g.fillStyle = on ? C.accent : C.muted; g.font = f(11, on ? 800 : 600);
          g.textAlign = 'left';
          g.fillText(m.name, pad, y0 + 16);
          g.strokeStyle = 'rgba(139,148,158,0.28)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(pad, mid); g.lineTo(w - pad, mid); g.stroke();
          var s = lines[i2], scale = (laneH * 0.30) / 45;
          g.strokeStyle = on ? C.accent : 'rgba(88,166,255,0.45)';
          g.lineWidth = on ? 2 : 1.2;
          g.beginPath();
          for (var j = 0; j < s.length; j++) {
            var px = pad + (w - pad * 2) * (j / (s.length - 1));
            var py = mid - clamp(s[j], -55, 55) * scale;
            if (j === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.stroke();
          if (on) {
            g.fillStyle = C.accent; g.font = f(11, 800); g.textAlign = 'right';
            g.fillText('swings ' + swing(s).toFixed(0) + '%', w - pad, y0 + 16);
          }
        });
      }
    });
    return viz(host, api);
  });
})(window);
