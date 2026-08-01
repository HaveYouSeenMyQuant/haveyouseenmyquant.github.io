/* QQ visuals — knowing when to stop, and how you go broke (unit 12).
 *
 * The hiring curve is never drawn from the formula: the player sets a cutoff,
 * runs rounds, and their own hit rate is what puts a dot on the chart. The ruin
 * pictures walk real coins between two walls. The doubling system is played
 * night after night until the one night that eats the lot turns up.
 *
 * Loads after js/viz.js and js/viz_lab.js. Every number comes from
 * QQ_DATA.vizData.stopping, so this file and site/checks/stopping.py are set up
 * with exactly the same purse, house, wheel and shortlist.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };
  var DATA = (global.QQ_DATA && global.QQ_DATA.vizData &&
              global.QQ_DATA.vizData.stopping) || {};

  var N = DATA.candidates || 100;

  function pickInt(n) { return Math.floor(Math.random() * n); }
  function coin() { return Math.random() < 0.5; }
  function commas(n) {
    var s = String(Math.round(n)), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      if (++c % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }
  function big(t) { return '<b>' + t + '</b>'; }
  function shuffled(n) {
    var a = [], i, j, t;
    for (i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { j = pickInt(i + 1); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* One hiring round under "turn down the first r, then take the next one who
   * beats them all". Returns 1 for the very best, 0 for anyone else, -1 for
   * ending up with nobody. */
  function round(n, r, keepOrder) {
    var ranks = shuffled(n), seen = -1, taken = null, i, at = -1;
    for (i = 0; i < n; i++) {
      if (i < r) { if (ranks[i] > seen) seen = ranks[i]; }
      else if (ranks[i] > seen) { taken = ranks[i]; at = i; break; }
    }
    var res = { hired: taken, at: at, order: keepOrder ? ranks : null };
    res.score = taken === null ? -1 : (taken === n - 1 ? 1 : 0);
    return res;
  }

  /* ======================================================================
   * secretary_skip — set the cutoff, run rounds, build the curve yourself
   * ====================================================================== */
  function hiringCurve(host, api, spec) {
    var cut = spec.startCut;
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.66);
    var tally = {};                                 // cutoff -> {runs, wins}
    var last = null, pending = 0;

    function at(c) { if (!tally[c]) tally[c] = { runs: 0, wins: 0 }; return tally[c]; }
    function render() {
      var t = at(cut);
      out.innerHTML = 'Turn down the first ' + big(cut) + ' of ' + N +
        (t.runs ? '<br>' + big(commas(t.runs)) + ' rounds &nbsp;·&nbsp; landed the best ' +
          big(((t.wins / t.runs) * 100).toFixed(1) + '%') + ' of the time'
          : '<br><span style="color:#8b949e">run some rounds to see how it does</span>');
    }
    K.slider(ctr, { min: 0, max: N - 1, step: 1, value: cut, label: 'how many to turn down' },
      function (v) { cut = Math.round(v); render(); api.onInteract('slider'); });
    K.button(ctr, 'Run 400 rounds', function () { pending += 400; api.onInteract('run'); })
      .classList.add('primary');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 60), t = at(cut), i;
        for (i = 0; i < take; i++) {
          var r = round(N, cut, i === take - 1);
          t.runs++; if (r.score === 1) t.wins++;
          last = r;
        }
        pending -= take;
        render();
      }
      var pad = 16, left = pad + 6, right = w - pad, top = 16, base = h - 30;
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, base + 0.5); g.lineTo(right, base + 0.5); g.stroke();
      function X(c) { return left + (right - left) * (c / (N - 1)); }
      function Y(p) { return base - (base - top) * (p / 0.5); }
      // gridline at 37%, unlabelled until they have found it themselves
      g.strokeStyle = 'rgba(139,148,158,0.18)'; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(left, Y(0.25)); g.lineTo(right, Y(0.25)); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'left';
      g.fillText('25%', left, Y(0.25) - 3);
      (spec.marks || []).forEach(function (m) {
        g.strokeStyle = m.colour; g.lineWidth = 1.4; g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(X(m.at), top); g.lineTo(X(m.at), base); g.stroke();
        g.setLineDash([]);
        g.fillStyle = m.colour; g.font = f(9.5, 700); g.textAlign = 'center';
        g.fillText(m.label, clamp(X(m.at), left + 20, right - 20), top - 3);
      });
      var c;
      for (c in tally) {
        if (!tally.hasOwnProperty(c)) continue;
        var t2 = tally[c];
        if (t2.runs < 30) continue;
        var p = t2.wins / t2.runs;
        g.beginPath(); g.arc(X(+c), Y(p), Math.min(6, 3 + t2.runs / 500), 0, 7);
        g.fillStyle = (+c === cut) ? C.gold : 'rgba(88,166,255,0.75)';
        g.fill();
      }
      g.strokeStyle = 'rgba(210,153,34,0.45)'; g.lineWidth = 1;
      g.setLineDash([3, 4]);
      g.beginPath(); g.moveTo(X(cut), top); g.lineTo(X(cut), base); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.muted; g.font = f(9.5, 600);
      g.textAlign = 'left'; g.fillText('turn down 0', left, base + 13);
      g.textAlign = 'right'; g.fillText('turn down ' + (N - 1), right, base + 13);
      g.textAlign = 'center';
      g.fillText('each dot is your own measured hit rate', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  }

  reg('stopCurve', function (host, api) {
    return hiringCurve(host, api, { startCut: 10, marks: [] });
  });
  reg('flatTop', function (host, api) {
    return hiringCurve(host, api, {
      startCut: DATA.sloppyCutoff || 50,
      marks: [{ at: 37, label: '37', colour: 'rgba(62,207,142,0.8)' },
              { at: DATA.sloppyCutoff || 50, label: '50', colour: 'rgba(248,81,73,0.8)' }]
    });
  });

  /* ======================================================================
   * secretary_odds — the three ways a round can end
   * ====================================================================== */
  reg('stopOutcomes', function (host, api) {
    var cut = 37;
    var ctr = K.controls(host), out = K.readout(host, 'Run some rounds.');
    var stage = K.Stage(host, 0.6);
    var counts = [0, 0, 0], runs = 0, pending = 0;    // best, someone else, nobody
    var labels = ['the very best', 'someone else', 'nobody at all'];
    var cols = [C.good, C.accent, C.bad];

    function render() {
      out.innerHTML = runs
        ? big(commas(runs)) + ' rounds, turning down the first ' + cut + '<br>' +
          labels.map(function (l, i) {
            return '<span style="color:' + cols[i] + ';font-weight:700">' + l + ' ' +
              ((counts[i] / runs) * 100).toFixed(1) + '%</span>';
          }).join(' &nbsp;·&nbsp; ')
        : 'Run rounds and watch the three endings pile up.';
    }
    K.button(ctr, 'Run 2,000 rounds', function () { pending += 2000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      counts = [0, 0, 0]; runs = 0; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 250), i;
        for (i = 0; i < take; i++) {
          var r = round(N, cut, false);
          counts[r.score === 1 ? 0 : (r.score === 0 ? 1 : 2)]++;
          runs++;
        }
        pending -= take; render();
      }
      var pad = 18, top = 18, base = h - 30, bw = (w - pad * 2) / 3.4, gap = bw * 0.14;
      for (var i = 0; i < 3; i++) {
        var p = runs ? counts[i] / runs : 0;
        var x = pad + i * (bw + gap), bh = Math.max(2, (base - top) * (p / 0.55));
        roundRect(g, x, base - bh, bw, bh, 5); g.fillStyle = cols[i]; g.fill();
        g.fillStyle = C.fg; g.font = f(12, 700); g.textAlign = 'center';
        if (runs) g.fillText((p * 100).toFixed(0) + '%', x + bw / 2, base - bh - 6);
        g.fillStyle = C.muted; g.font = f(9.5, 600);
        g.fillText(labels[i].split(' ')[0], x + bw / 2, base + 13);
        g.fillText(labels[i].split(' ').slice(1).join(' '), x + bw / 2, base + 24);
      }
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * secretary_four — all 24 orders of a shortlist, at once
   * ====================================================================== */
  reg('allOrders', function (host, api) {
    var n = DATA.shortlist || 4;
    var perms = [];
    (function build(cur, left) {
      if (!left.length) { perms.push(cur.slice()); return; }
      for (var i = 0; i < left.length; i++) {
        build(cur.concat([left[i]]), left.slice(0, i).concat(left.slice(i + 1)));
      }
    })([], [0, 1, 2, 3].slice(0, n));
    var cut = 1;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.85);

    function plays(perm) {
      var seen = -1, i;
      for (i = 0; i < n; i++) {
        if (i < cut) { if (perm[i] > seen) seen = perm[i]; }
        else if (perm[i] > seen) return { at: i, got: perm[i] };
      }
      return { at: -1, got: null };
    }
    function render() {
      var wins = 0;
      perms.forEach(function (p) { if (plays(p).got === n - 1) wins++; });
      out.innerHTML = 'Turn down the first ' + big(cut) +
        ' &nbsp;·&nbsp; you land the best in ' + big(wins + ' of ' + perms.length) +
        ' orders (' + ((wins / perms.length) * 100).toFixed(1) + '%)';
    }
    K.slider(ctr, { min: 0, max: n - 1, step: 1, value: cut, label: 'how many to turn down' },
      function (v) { cut = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      var cols = 4, rows = Math.ceil(perms.length / cols);
      var pad = 12, cw = (w - pad * 2) / cols, ch = Math.min((h - 24) / rows, 40);
      perms.forEach(function (p, k) {
        var cx = pad + (k % cols) * cw, cy = 8 + Math.floor(k / cols) * ch;
        var r = plays(p), win = r.got === n - 1;
        roundRect(g, cx + 1, cy, cw - 3, ch - 3, 4);
        g.fillStyle = win ? 'rgba(62,207,142,0.18)' : 'rgba(139,148,158,0.07)'; g.fill();
        for (var i = 0; i < n; i++) {
          var bx = cx + 5 + i * ((cw - 12) / n), bw2 = (cw - 12) / n - 2;
          var v = p[i] + 1;
          g.fillStyle = i < cut ? 'rgba(139,148,158,0.35)'
            : (i === r.at ? (win ? C.good : C.bad) : 'rgba(88,166,255,0.45)');
          roundRect(g, bx, cy + 4, bw2, ch - 11, 2); g.fill();
          g.fillStyle = i === r.at ? '#0d1117' : C.muted;
          g.font = f(8.5, 700); g.textAlign = 'center';
          g.fillText(String(v), bx + bw2 / 2, cy + ch - 8);
        }
      });
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('4 = the best candidate · grey = turned down unseen · green = you got them',
        w / 2, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * break_the_house / ruin_length — a fiver against a house
   * ====================================================================== */
  function ruinRun(purse, house) {
    var cash = purse, flips = 0, path = [purse];
    while (cash > 0 && cash < purse + house) {
      cash += coin() ? 1 : -1;
      flips++;
      if (flips % Math.max(1, Math.floor(flips / 400) + 1) === 0) path.push(cash);
    }
    return { won: cash > 0, flips: flips, path: path };
  }

  reg('ruinWalk', function (host, api) {
    var purse = DATA.purse || 5, house = DATA.houseCash || 95;
    var ctr = K.controls(host), out = K.readout(host, 'Play an evening.');
    var stage = K.Stage(host, 0.66);
    var evenings = 0, wins = 0, last = null, pending = 0;

    function render() {
      out.innerHTML = evenings
        ? big(commas(evenings)) + ' evenings &nbsp;·&nbsp; broke the house ' +
          big(wins) + ' times (' + ((wins / evenings) * 100).toFixed(1) + '%)' +
          (last ? '<br>last one: ' + (last.won ? 'took the lot' : 'went broke') +
            ' after ' + big(commas(last.flips)) + ' flips' : '')
        : 'Play an evening: £' + purse + ' against the house’s £' + house + '.';
    }
    K.button(ctr, 'Play an evening', function () {
      last = ruinRun(purse, house); evenings++; if (last.won) wins++;
      render(); api.onInteract('play');
    }).classList.add('primary');
    K.button(ctr, 'Play 500', function () { pending += 500; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Reset', function () {
      evenings = 0; wins = 0; last = null; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 25), i;
        for (i = 0; i < take; i++) { last = ruinRun(purse, house); evenings++; if (last.won) wins++; }
        pending -= take; render();
      }
      var pad = 16, left = pad + 14, right = w - pad, top = 16, base = h - 26;
      var total = purse + house;
      function Y(v) { return base - (base - top) * (v / total); }
      g.strokeStyle = 'rgba(248,81,73,0.5)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(left, Y(0)); g.lineTo(right, Y(0)); g.stroke();
      g.strokeStyle = 'rgba(62,207,142,0.5)';
      g.beginPath(); g.moveTo(left, Y(total)); g.lineTo(right, Y(total)); g.stroke();
      g.strokeStyle = 'rgba(139,148,158,0.3)'; g.setLineDash([3, 3]); g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, Y(purse)); g.lineTo(right, Y(purse)); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.bad; g.font = f(9, 700); g.textAlign = 'left';
      g.fillText('broke', left, Y(0) + 11);
      g.fillStyle = C.good; g.fillText('you take the lot £' + total, left, Y(total) - 4);
      g.fillStyle = C.muted; g.fillText('start £' + purse, left, Y(purse) - 4);
      if (last) {
        g.beginPath();
        for (var j = 0; j < last.path.length; j++) {
          var x = left + (right - left) * (j / Math.max(1, last.path.length - 1));
          if (j === 0) g.moveTo(x, Y(last.path[j])); else g.lineTo(x, Y(last.path[j]));
        }
        g.strokeStyle = last.won ? C.good : C.accent; g.lineWidth = 1.8; g.stroke();
      }
      if (evenings) {
        var bw = w - pad * 2;
        roundRect(g, pad, h - 16, bw, 9, 4); g.fillStyle = C.panel; g.fill();
        roundRect(g, pad, h - 16, Math.max(2, bw * (wins / evenings)), 9, 4);
        g.fillStyle = C.good; g.fill();
      }
    };
    return { destroy: stage.destroy };
  });

  reg('ruinLength', function (host, api) {
    var purse = DATA.purse || 5, house = DATA.houseCash || 95;
    return LAB.sim({
      trial: function () { return ruinRun(purse, house).flips; },
      mode: 'mean', label: 'flips', min: 0, max: 2400, step: 100,
      batches: [10, 200], perFrame: 4, aspect: 0.6,
      idle: 'Play evenings and watch how long they last.'
    })(host, api);
  });

  /* ======================================================================
   * roulette_ruin — the drift you cannot see per spin
   * ====================================================================== */
  reg('rouletteDrift', function (host, api) {
    var wheel = DATA.roulette || { slots: 37, reds: 18, bankroll: 100 };
    var p = wheel.reds / wheel.slots;
    var bank = wheel.bankroll;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.62);
    var runs = 0, total = 0, path = [], pending = 0;

    function play(keepPath) {
      var cash = bank, spins = 0, pth = [bank];
      while (cash > 0) {
        cash += Math.random() < p ? 1 : -1;
        spins++;
        if (keepPath && spins % 20 === 0) pth.push(cash);
        if (spins > 200000) break;
      }
      runs++; total += spins;
      if (keepPath) path = pth;
      return spins;
    }
    function render() {
      out.innerHTML = 'Bankroll ' + big('£' + bank) + ' &nbsp;·&nbsp; £1 a spin on red' +
        (runs ? '<br>' + big(commas(runs)) + ' nights &nbsp;·&nbsp; broke after ' +
          big(commas(Math.round(total / runs))) + ' spins on average' : '');
    }
    K.slider(ctr, { min: 10, max: 200, step: 10, value: bank, label: 'bankroll' },
      function (v) {
        bank = Math.round(v); runs = 0; total = 0; path = []; render(); api.onInteract('slider');
      });
    K.button(ctr, 'Play until broke', function () { play(true); render(); api.onInteract('play'); })
      .classList.add('primary');
    K.button(ctr, 'Play 60 nights', function () { pending += 60; api.onInteract('run'); })
      .classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 4);
        for (var i = 0; i < take; i++) play(i === take - 1);
        pending -= take; render();
      }
      var pad = 16, left = pad + 10, right = w - pad, top = 16, base = h - 26;
      var top$ = Math.max(bank * 1.4, 20);
      function Y(v) { return base - (base - top) * (v / top$); }
      g.strokeStyle = 'rgba(248,81,73,0.5)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(left, Y(0)); g.lineTo(right, Y(0)); g.stroke();
      g.strokeStyle = 'rgba(139,148,158,0.3)'; g.setLineDash([3, 3]); g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, Y(bank)); g.lineTo(right, Y(bank)); g.stroke();
      g.setLineDash([]);
      if (path.length > 1) {
        g.beginPath();
        for (var j = 0; j < path.length; j++) {
          var x = left + (right - left) * (j / (path.length - 1));
          if (j === 0) g.moveTo(x, Y(path[j])); else g.lineTo(x, Y(path[j]));
        }
        g.strokeStyle = C.accent; g.lineWidth = 1.8; g.stroke();
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'right';
        g.fillText(commas((path.length - 1) * 20) + ' spins', right, base + 13);
      }
      g.fillStyle = C.muted; g.font = f(9, 700); g.textAlign = 'left';
      g.fillText('£' + bank + ' to start', left, Math.max(top + 9, Y(bank) - 6));
      g.fillStyle = C.bad; g.fillText('broke', left, Y(0) + 11);
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('the wheel takes about 2.7p a spin — the line only points one way',
        w / 2, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * martingale_double — the ladder, and the night that eats it
   * ====================================================================== */
  reg('martingaleLadder', function (host, api) {
    var steps = (DATA.martingale && DATA.martingale.maxDoubles) || 10;
    var purse = Math.pow(2, steps) - 1;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.66);
    var nights = 0, pot = 0, worst = 0, rung = 0, blown = 0, pending = 0;

    function night(keep) {
      var i, won = false;
      for (i = 0; i < steps; i++) { if (coin()) { won = true; break; } }
      if (keep) rung = won ? i + 1 : steps;
      nights++;
      pot += won ? 1 : -purse;
      if (!won) { blown++; worst = performance.now(); }
      return won;
    }
    function render() {
      out.innerHTML = nights
        ? big(commas(nights)) + ' nights &nbsp;·&nbsp; total ' +
          big((pot >= 0 ? '+£' : '−£') + commas(Math.abs(pot))) +
          ' &nbsp;·&nbsp; average ' + big('£' + (pot / nights).toFixed(2)) + ' a night' +
          '<br><span style="color:#8b949e">' + blown +
          ' night' + (blown === 1 ? '' : 's') + ' lost the whole £' + commas(purse) + '</span>'
        : 'Play a night: £1, then £2, then £4… until heads.';
    }
    K.button(ctr, 'Play a night', function () { night(true); render(); api.onInteract('play'); })
      .classList.add('primary');
    K.button(ctr, 'Play 5,000 nights', function () { pending += 5000; api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Reset', function () {
      nights = 0; pot = 0; blown = 0; rung = 0; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 600);
        for (var i = 0; i < take; i++) night(i === take - 1);
        pending -= take; render();
      }
      var pad = 14, top = 10, rowH = Math.max(9, Math.min(16, (h - 62) / steps));
      var maxW = w - pad * 2 - 44;
      for (var k = 0; k < steps; k++) {
        var bet = Math.pow(2, k);
        var bw = maxW * (bet / Math.pow(2, steps - 1));
        var y = top + k * rowH;
        var on = rung > k;
        roundRect(g, pad + 40, y, Math.max(3, bw), rowH - 2.5, 2);
        g.fillStyle = on ? (rung === k + 1 ? C.good : 'rgba(248,81,73,0.7)')
          : 'rgba(139,148,158,0.18)';
        g.fill();
        g.fillStyle = on ? C.fg : C.muted; g.font = f(8.5, 600); g.textAlign = 'right';
        g.fillText('£' + commas(bet), pad + 36, y + rowH - 4);
      }
      var fresh = Math.max(0, 1 - (performance.now() - worst) / 900);
      if (fresh > 0) {
        g.fillStyle = 'rgba(248,81,73,' + fresh.toFixed(2) + ')';
        g.font = f(12, 700); g.textAlign = 'center';
        g.fillText('ten in a row — £' + commas(purse) + ' gone', w / 2, h - 34);
      }
      // the running average, the only line worth watching
      var by = h - 24, bw2 = w - pad * 2;
      roundRect(g, pad, by, bw2, 10, 5); g.fillStyle = C.panel; g.fill();
      var avg = nights ? pot / nights : 0;
      var mid = pad + bw2 / 2, span = bw2 / 2, scale = clamp(avg / 2, -1, 1);
      roundRect(g, Math.min(mid, mid + span * scale), by,
        Math.max(2, Math.abs(span * scale)), 10, 5);
      g.fillStyle = avg >= 0 ? C.good : C.bad; g.fill();
      g.strokeStyle = C.muted; g.lineWidth = 1;
      g.beginPath(); g.moveTo(mid, by - 2); g.lineTo(mid, by + 12); g.stroke();
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('average per night (the mark is nothing)', w / 2, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * first_return — how long until the walk is level again
   * ====================================================================== */
  reg('returnWait', function (host, api) {
    var ctr = K.controls(host), out = K.readout(host, '');
    var stage = K.Stage(host, 0.64);
    var waits = 0, total = 0, longest = 0, pending = 0, history = [], path = [];

    function one(keep) {
      var pos = 0, k = 0, pth = [0];
      while (k < 400000) {
        pos += coin() ? 1 : -1;
        k++;
        if (keep && k % 40 === 0) pth.push(pos);
        if (pos === 0) break;
      }
      waits++; total += k;
      if (k > longest) longest = k;
      if (keep) path = pth.length > 1 ? pth : [0, pos];
      history.push(total / waits);
      if (history.length > 220) history.shift();
      return k;
    }
    function render() {
      out.innerHTML = waits
        ? big(commas(waits)) + ' returns &nbsp;·&nbsp; average wait ' +
          big(commas(Math.round(total / waits)) + ' flips') +
          '<br><span style="color:#8b949e">longest so far ' + commas(longest) +
          ' flips — keep going and the average keeps climbing</span>'
        : 'Flip until you are level again, over and over.';
    }
    K.button(ctr, 'One return', function () { one(true); render(); api.onInteract('run'); })
      .classList.add('small');
    K.button(ctr, 'Run 2,000 returns', function () { pending += 2000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      waits = 0; total = 0; longest = 0; history = []; path = []; pending = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 120);
        for (var i = 0; i < take; i++) one(i === take - 1);
        pending -= take; render();
      }
      var pad = 16, left = pad + 8, right = w - pad, top = 16, base = h - 42;
      var maxAvg = 1;
      for (var j = 0; j < history.length; j++) maxAvg = Math.max(maxAvg, history[j]);
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, base + 0.5); g.lineTo(right, base + 0.5); g.stroke();
      g.beginPath();
      for (j = 0; j < history.length; j++) {
        var x = left + (right - left) * (j / Math.max(1, history.length - 1));
        var y = base - (base - top) * (history[j] / (maxAvg * 1.1));
        if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokeStyle = C.accent; g.lineWidth = 2.2; g.stroke();
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
      g.fillText('running average wait, up to ' + commas(Math.round(maxAvg)) + ' flips',
        left, top - 3);
      // the last walk, small, underneath
      var wy = h - 30, wh = 24, lo = 0, hi = 0;
      for (j = 0; j < path.length; j++) { lo = Math.min(lo, path[j]); hi = Math.max(hi, path[j]); }
      var span = Math.max(2, hi - lo);
      g.beginPath();
      for (j = 0; j < path.length; j++) {
        var px = left + (right - left) * (j / Math.max(1, path.length - 1));
        var py = wy + wh - wh * ((path[j] - lo) / span);
        if (j === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokeStyle = 'rgba(210,153,34,0.8)'; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
      g.fillText('the last walk back to level', w / 2, h - 2);
    };
    return { destroy: stage.destroy };
  });

})(window);
