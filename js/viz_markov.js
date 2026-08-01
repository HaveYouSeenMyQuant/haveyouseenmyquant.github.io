/* QQ visuals — chains with a memory (unit 11).
 *
 * Same house rule as everywhere else: animate the thing, never write the
 * formula. The player hops the frog, steps the weather, walks the mouse out of
 * the maze, lets a reader loose on five websites, shakes a box of gas and
 * riffles a deck — and the readout only ever reports what they have already
 * made happen.
 *
 * Loads after js/viz.js and js/viz_lab.js: QQViz.kit for the plumbing, QQLab
 * for the reusable engines. Every number that matters (the ring size, the two
 * weather rules, the maze doors, the links between the websites, the molecules)
 * comes from QQ_DATA.vizData.markov, so this file and site/checks/markov.py are
 * looking at exactly the same setup.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var C = K.C;
  var f = K.f, clamp = K.clamp, lerp = K.lerp, roundRect = K.roundRect;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };
  var DATA = (global.QQ_DATA && global.QQ_DATA.vizData &&
              global.QQ_DATA.vizData.markov) || {};

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
  function big(txt) { return '<b>' + txt + '</b>'; }

  /* ======================================================================
   * ring_return — a frog on a ring of lily pads
   * ====================================================================== */
  reg('ringFrog', function (host, api) {
    var n = DATA.ringPads || 6;
    var ctr = K.controls(host);
    var out = K.readout(host, 'Hop the frog, or let a few thousand trips run.');
    var stage = K.Stage(host, 0.78);
    var at = 0, hops = 0, trips = 0, total = 0, pending = 0, splash = 0;

    function render() {
      var here = 'Frog on pad ' + big(at === 0 ? 'HOME' : String(at)) +
        ' &nbsp;·&nbsp; ' + big(hops) + ' hops this trip';
      if (trips) {
        here += '<br>' + big(commas(trips)) + ' trips home &nbsp;·&nbsp; average ' +
          big((total / trips).toFixed(2)) + ' hops';
      }
      out.innerHTML = here;
    }
    function hop() {
      at = (at + (coin() ? 1 : n - 1)) % n;
      hops++;
      if (at === 0) { trips++; total += hops; hops = 0; splash = performance.now(); }
    }
    K.button(ctr, 'Hop', function () { hop(); render(); api.onInteract('hop'); })
      .classList.add('small');
    K.button(ctr, 'Run 2,000 trips', function () {
      pending += 2000; api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Reset', function () {
      at = 0; hops = 0; trips = 0; total = 0; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h, t) {
      if (pending > 0) {                       // trips are cheap; do a slice a frame
        var take = Math.min(pending, 120), done = 0;
        while (done < take) { hop(); if (at === 0) done++; }
        pending -= take;
        render();
      }
      var cx = w / 2, cy = h / 2 - 6, R = Math.min(w, h) * 0.33;
      var i, ang, px, py;
      g.strokeStyle = 'rgba(139,148,158,0.25)'; g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
      for (i = 0; i < n; i++) {
        ang = -Math.PI / 2 + i * 2 * Math.PI / n;
        px = cx + Math.cos(ang) * R; py = cy + Math.sin(ang) * R;
        var home = i === 0, on = i === at;
        g.beginPath(); g.arc(px, py, 17, 0, 7);
        g.fillStyle = home ? 'rgba(62,207,142,0.20)' : C.panel;
        g.fill();
        g.strokeStyle = home ? C.good : C.dim; g.lineWidth = home ? 2 : 1.2; g.stroke();
        g.fillStyle = home ? C.good : C.muted; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(home ? 'home' : String(i), px, py + 3.5);
        if (on) {
          var pop = 1 + 0.25 * Math.max(0, 1 - (performance.now() - splash) / 260);
          g.beginPath(); g.arc(px, py - 2, 10 * pop, 0, 7);
          g.fillStyle = C.gold; g.fill();
          g.fillStyle = '#0d1117'; g.font = f(9, 700);
          g.fillText('F', px, py + 1);
        }
      }
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText(trips ? 'average trip home: ' + (total / trips).toFixed(2) + ' hops'
        : 'tap Hop, or run a few thousand trips', cx, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * weather_steady — the town's mix of rainy and dry days settles
   * ====================================================================== */
  function weatherRules() {
    var w = DATA.weather || {};
    return { rr: w.rainAfterRain != null ? w.rainAfterRain : 0.5,
             dr: w.rainAfterDry != null ? w.rainAfterDry : 0.25 };
  }
  function stepMix(p, r) { return p * r.rr + (1 - p) * r.dr; }

  function drawMixBar(g, x, y, w, h, p, label) {
    roundRect(g, x, y, w, h, 6); g.fillStyle = C.panel; g.fill();
    roundRect(g, x, y, Math.max(2, w * p), h, 6);
    g.fillStyle = 'rgba(88,166,255,0.75)'; g.fill();
    g.strokeStyle = C.dim; g.lineWidth = 1; roundRect(g, x, y, w, h, 6); g.stroke();
    g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'left';
    g.fillText(label + ' ' + (p * 100).toFixed(1) + '% rainy', x + 8, y + h / 2 + 4);
  }

  reg('chainSettle', function (host, api) {
    var r = weatherRules();
    var start = 1, p = 1, day = 0;
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.62);
    var history = [1];

    function render() {
      out.innerHTML = 'Day ' + big(day) + ' &nbsp;·&nbsp; chance of rain ' +
        big((p * 100).toFixed(1) + '%');
    }
    function reset(v) {
      start = v; p = v; day = 0; history = [v]; render();
    }
    K.button(ctr, 'Start rainy', function () { reset(1); api.onInteract('start'); })
      .classList.add('small');
    K.button(ctr, 'Start dry', function () { reset(0); api.onInteract('start'); })
      .classList.add('small');
    K.button(ctr, 'Next day', function () {
      p = stepMix(p, r); day++; history.push(p);
      if (history.length > 60) history.shift();
      render(); api.onInteract('step');
    }).classList.add('primary');
    K.button(ctr, 'Run a year', function () {
      for (var i = 0; i < 365; i++) { p = stepMix(p, r); day++; history.push(p); }
      while (history.length > 60) history.shift();
      render(); api.onInteract('run');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var pad = 14;
      drawMixBar(g, pad, 10, w - pad * 2, 30, p, 'today:');
      var top = 56, base = h - 20, left = pad, right = w - pad;
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, base + 0.5); g.lineTo(right, base + 0.5); g.stroke();
      var i, x, y;
      g.beginPath();
      for (i = 0; i < history.length; i++) {
        x = left + (right - left) * (i / Math.max(1, history.length - 1));
        y = base - (base - top) * history[i];
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokeStyle = C.accent; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('100% rainy', left, top - 3);
      g.fillText('0%', left, base + 13);
      g.textAlign = 'right';
      g.fillText(day + ' days from ' + (start ? 'a rainy start' : 'a dry start'),
        right, base + 13);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * chain_forgets — two towns, opposite starts, side by side
   * ====================================================================== */
  reg('twoStarts', function (host, api) {
    var r = weatherRules();
    return LAB.steps({
      n: 24,
      aspect: 0.62,
      playLabel: 'Play the fortnight',
      init: function () { return { a: [1], b: [0] }; },
      onStep: function (i, st) {
        while (st.a.length <= i) {
          st.a.push(stepMix(st.a[st.a.length - 1], r));
          st.b.push(stepMix(st.b[st.b.length - 1], r));
        }
        return st;
      },
      caption: function (i, st) {
        var gap = Math.abs(st.a[i] - st.b[i]);
        return 'Day ' + big(i) + ' &nbsp;·&nbsp; rainy start ' +
          big((st.a[i] * 100).toFixed(1) + '%') + ' &nbsp;·&nbsp; dry start ' +
          big((st.b[i] * 100).toFixed(1) + '%') + '<br>gap between them ' +
          big((gap * 100).toFixed(2) + ' points');
      },
      draw: function (g, w, h, i, t, st) {
        var pad = 14, barH = 28;
        drawMixBar(g, pad, 12, w - pad * 2, barH, st.a[i], 'began rainy:');
        drawMixBar(g, pad, 12 + barH + 10, w - pad * 2, barH, st.b[i], 'began dry:');
        var top = 12 + barH * 2 + 30, base = h - 18, left = pad, right = w - pad;
        var j, x, y;
        [['a', C.accent], ['b', C.gold]].forEach(function (pair) {
          g.beginPath();
          for (j = 0; j <= i; j++) {
            x = left + (right - left) * (j / 24);
            y = base - (base - top) * st[pair[0]][j];
            if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.strokeStyle = pair[1]; g.lineWidth = 2.5; g.stroke();
        });
        g.strokeStyle = 'rgba(139,148,158,0.35)'; g.setLineDash([3, 3]); g.lineWidth = 1;
        y = base - (base - top) / 3;
        g.beginPath(); g.moveTo(left, y); g.lineTo(right, y); g.stroke();
        g.setLineDash([]);
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
        g.fillText('a third', left + 2, y - 4);
        g.textAlign = 'right';
        g.fillText('day ' + i, right, base + 12);
      }
    })(host, api);
  });

  /* ======================================================================
   * mouse_maze — three rooms, one way out
   * ====================================================================== */
  reg('mouseMaze', function (host, api) {
    var maze = DATA.maze || {};
    var rooms = maze.rooms || ['First', 'Middle', 'Last'];
    var adj = {};
    rooms.forEach(function (r) { adj[r] = []; });
    (maze.doors || []).forEach(function (d) {
      if (adj[d[0]]) adj[d[0]].push(d[1]);
      if (adj[d[1]]) adj[d[1]].push(d[0]);
    });
    var start = maze.start || rooms[0];
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.62);
    var at = start, mins = 0, runs = 0, total = 0, pending = 0, moveAt = 0;

    function render() {
      var s = at === 'OUT' ? 'Out! after ' + big(mins) + ' minutes'
        : 'In the ' + big(at.toLowerCase()) + ' room &nbsp;·&nbsp; ' + big(mins) +
          ' minutes so far';
      if (runs) s += '<br>' + big(commas(runs)) + ' mice out &nbsp;·&nbsp; average ' +
        big((total / runs).toFixed(2)) + ' minutes';
      out.innerHTML = s;
    }
    function step() {
      if (at === 'OUT') { at = start; mins = 0; return; }
      at = adj[at][pickInt(adj[at].length)];
      mins++;
      moveAt = performance.now();
      if (at === 'OUT') { runs++; total += mins; }
    }
    K.button(ctr, 'Step', function () { step(); render(); api.onInteract('step'); })
      .classList.add('small');
    K.button(ctr, 'Run 2,000 mice', function () { pending += 2000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      at = start; mins = 0; runs = 0; total = 0; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 150), done = 0;
        while (done < take) { step(); if (at === 'OUT') { done++; step(); } }
        pending -= take;
        render();
      }
      var pad = 14, gap = 10;
      var bw = (w - pad * 2 - gap * 3) / 3.6, bh = Math.min(74, h - 54);
      var top = 24, i, x;
      for (i = 0; i < rooms.length; i++) {
        x = pad + i * (bw + gap);
        var here = at === rooms[i];
        roundRect(g, x, top, bw, bh, 8);
        g.fillStyle = here ? 'rgba(88,166,255,0.18)' : C.panel; g.fill();
        g.strokeStyle = here ? C.accent : C.dim; g.lineWidth = here ? 2 : 1; g.stroke();
        g.fillStyle = here ? C.fg : C.muted; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(rooms[i], x + bw / 2, top - 6);
        g.font = f(9.5, 500);
        g.fillStyle = C.muted;
        g.fillText(adj[rooms[i]].length + (adj[rooms[i]].length === 1 ? ' door' : ' doors'),
          x + bw / 2, top + bh - 8);
        if (here) {
          var pop = 1 + 0.3 * Math.max(0, 1 - (performance.now() - moveAt) / 240);
          g.beginPath(); g.arc(x + bw / 2, top + bh / 2 - 4, 11 * pop, 0, 7);
          g.fillStyle = C.gold; g.fill();
          g.fillStyle = '#0d1117'; g.font = f(9.5, 700);
          g.fillText('M', x + bw / 2, top + bh / 2 - 1);
        }
        if (i < rooms.length - 1) {
          g.strokeStyle = 'rgba(139,148,158,0.5)'; g.lineWidth = 3;
          g.beginPath(); g.moveTo(x + bw, top + bh / 2); g.lineTo(x + bw + gap, top + bh / 2);
          g.stroke();
        }
      }
      // the way out
      x = pad + 3 * (bw + gap);
      var outW = w - pad - x;
      roundRect(g, x, top, Math.max(30, outW), bh, 8);
      g.fillStyle = at === 'OUT' ? 'rgba(62,207,142,0.22)' : 'rgba(62,207,142,0.08)'; g.fill();
      g.strokeStyle = C.good; g.lineWidth = at === 'OUT' ? 2 : 1; g.stroke();
      g.fillStyle = C.good; g.font = f(10.5, 700); g.textAlign = 'center';
      g.fillText('OUT', x + Math.max(30, outW) / 2, top + bh / 2 + 4);
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText(runs ? 'average escape: ' + (total / runs).toFixed(2) + ' minutes'
        : 'step the mouse, or run a couple of thousand', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * drunk_returns — walks that come home, in two dimensions and in three
   * ====================================================================== */
  reg('walkReturns', function (host, api) {
    var dims = 2, steps = 1500;
    var ctr = K.controls(host), out = K.readout(host, 'Run some walks.');
    var stage = K.Stage(host, 0.72);
    var runs = 0, home = 0, trail = [], pending = 0;

    function render() {
      out.innerHTML = big(dims + 'D') + ' &nbsp;·&nbsp; ' + big(commas(runs)) +
        ' walks of ' + commas(steps) + ' steps' +
        (runs ? '<br>' + big(((home / runs) * 100).toFixed(1) + '%') +
          ' found their way back to the start' : '');
    }
    function walk() {
      var pos = [0, 0, 0], path = [[0, 0]], back = false, i, d;
      for (i = 0; i < steps; i++) {
        d = pickInt(dims);
        pos[d] += coin() ? 1 : -1;
        if (i < 400) path.push([pos[0], pos[1]]);
        if (!pos[0] && !pos[1] && !pos[2]) { back = true; break; }
      }
      runs++; if (back) home++;
      trail = path;
    }
    K.button(ctr, 'Walk once', function () { walk(); render(); api.onInteract('walk'); })
      .classList.add('small');
    K.button(ctr, 'Run 300', function () { pending += 300; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Flat / open air', function () {
      dims = dims === 2 ? 3 : 2; runs = 0; home = 0; trail = []; pending = 0;
      render(); api.onInteract('dims');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) { var take = Math.min(pending, 12); for (var k = 0; k < take; k++) walk(); pending -= take; render(); }
      var cx = w / 2, cy = h / 2 - 4, i, span = 1;
      for (i = 0; i < trail.length; i++) {
        span = Math.max(span, Math.abs(trail[i][0]), Math.abs(trail[i][1]));
      }
      var sc = Math.min(w, h * 1.4) * 0.42 / span;
      g.strokeStyle = 'rgba(88,166,255,0.55)'; g.lineWidth = 1.4;
      g.beginPath();
      for (i = 0; i < trail.length; i++) {
        var x = cx + trail[i][0] * sc, y = cy + trail[i][1] * sc;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
      g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fillStyle = C.good; g.fill();
      // the share that came home, as a bar
      if (runs) {
        var bw = w - 28, bh = 12, by = h - 26;
        roundRect(g, 14, by, bw, bh, 6); g.fillStyle = C.panel; g.fill();
        roundRect(g, 14, by, Math.max(2, bw * (home / runs)), bh, 6);
        g.fillStyle = dims === 2 ? C.good : C.gold; g.fill();
        g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
        g.fillText(((home / runs) * 100).toFixed(1) + '% came home in ' +
          commas(steps) + ' steps (' + dims + 'D)', w / 2, h - 4);
      } else {
        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
        g.fillText('one walk, ' + commas(steps) + ' steps', w / 2, h - 4);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * deuce_odds — the point you win, against the game you win
   * ====================================================================== */
  reg('deuceDial', function (host, api) {
    function game(p) { return (p * p) / (p * p + (1 - p) * (1 - p)); }
    return LAB.dial({
      min: 0.3, max: 0.7, step: 0.01,
      value: (DATA.deuce && DATA.deuce.pointWin) || 0.6,
      label: 'chance of winning a point',
      aspect: 0.62,
      ymin: 0, ymax: 1,
      f: function (p) { return game(p); },
      f2: function (p) { return p; },
      xmin: '30%', xmax: '70%',
      yLabel: 'blue: chance of winning the game — gold: the point itself',
      marks: [{ x: 0.5, label: 'even' }],
      readout: function (p, y) {
        return 'A point won ' + big((p * 100).toFixed(0) + '%') +
          ' of the time makes the game ' + big((y * 100).toFixed(1) + '%') +
          '<br><span style="color:#8b949e">the edge on a point, magnified ' +
          ((y - 0.5) / Math.max(1e-6, Math.abs(p - 0.5)) * (p > 0.5 ? 1 : 1)).toFixed(1) +
          ' times by the loop</span>';
      }
    })(host, api);
  });

  /* ======================================================================
   * surfer_page — five websites, one reader clicking for ever
   * ====================================================================== */
  reg('surferGraph', function (host, api) {
    var s = DATA.surfer || { pages: [], links: [] };
    var pages = s.pages, links = s.links;
    var byId = {};
    pages.forEach(function (p, i) { byId[p.id] = i; });
    var outs = pages.map(function () { return []; });
    var indeg = pages.map(function () { return 0; });
    links.forEach(function (l) {
      outs[byId[l[0]]].push(byId[l[1]]);
      indeg[byId[l[1]]]++;
    });

    var out = K.readout(host, 'Tap a page to let a reader loose from it.');
    var stage = K.Stage(host, 0.92);
    var ctr = K.controls(host);
    var visits = pages.map(function () { return 0; });
    var at = 0, total = 0, sel = null, pending = 0, hop = 0;

    function render() {
      var s2 = '';
      if (total) {
        var order = pages.map(function (p, i) { return i; })
          .sort(function (a, b) { return visits[b] - visits[a]; });
        s2 = big(commas(total)) + ' clicks &nbsp;·&nbsp; ' +
          order.slice(0, 3).map(function (i) {
            return pages[i].name + ' ' + ((visits[i] / total) * 100).toFixed(0) + '%';
          }).join(' · ');
      } else {
        s2 = 'Tap a page. In-links: ' + pages.map(function (p, i) {
          return p.name + ' ' + indeg[i];
        }).join(' · ');
      }
      out.innerHTML = s2;
    }
    var chips = K.regionChips(host, api.regions || [], function (id) {
      sel = id; at = byId[id]; api.onSelect(id); api.onInteract('region'); render();
    });
    K.button(ctr, 'Click 5,000 links', function () { pending += 5000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      visits = pages.map(function () { return 0; }); total = 0; pending = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    function nodeAt(px, py, w, h) {
      var best = -1, bd = 1e9;
      pages.forEach(function (p, i) {
        var dx = px - p.x * w, dy = py - p.y * h, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      });
      return bd < 36 * 36 ? best : -1;
    }
    function onTap(ev) {
      var p = stage.pointer(ev);
      var i = nodeAt(p.x, p.y, stage.w, stage.h - 6);
      if (i >= 0) {
        sel = pages[i].id; at = i;
        if (chips && chips.select) chips.select(sel);
        api.onSelect(sel); api.onInteract('page'); render();
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      if (pending > 0) {
        var take = Math.min(pending, 400);
        for (var k = 0; k < take; k++) {
          at = outs[at][pickInt(outs[at].length)];
          visits[at]++; total++;
        }
        pending -= take;
        hop = t;
        render();
      }
      var R = 22;
      function PX(p) { return R + 8 + p.x * (w - (R + 8) * 2); }
      function PY(p) { return R + 6 + p.y * (h - (R + 6) * 2); }
      links.forEach(function (l) {
        var a = pages[byId[l[0]]], b = pages[byId[l[1]]];
        var x1 = PX(a), y1 = PY(a), x2 = PX(b), y2 = PY(b);
        var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / len, uy = dy / len;
        var nx = -uy * 9, ny = ux * 9;                 // curve every arc one way
        var mx = (x1 + x2) / 2 + nx, my = (y1 + y2) / 2 + ny;
        x1 += ux * R; y1 += uy * R; x2 -= ux * (R + 5); y2 -= uy * (R + 5);
        g.strokeStyle = 'rgba(139,148,158,0.35)'; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
        var ang = Math.atan2(y2 - my, x2 - mx);
        g.fillStyle = 'rgba(139,148,158,0.6)';
        g.beginPath();
        g.moveTo(x2, y2);
        g.lineTo(x2 - Math.cos(ang - 0.4) * 7, y2 - Math.sin(ang - 0.4) * 7);
        g.lineTo(x2 - Math.cos(ang + 0.4) * 7, y2 - Math.sin(ang + 0.4) * 7);
        g.closePath(); g.fill();
      });
      pages.forEach(function (p, i) {
        var x = PX(p), y = PY(p);
        var share = total ? visits[i] / total : 0;
        var on = sel === p.id;
        g.beginPath(); g.arc(x, y, R, 0, 7);
        g.fillStyle = on ? C.accent : C.panel; g.fill();
        g.strokeStyle = on ? C.accent : C.dim; g.lineWidth = on ? 2.4 : 1.3; g.stroke();
        if (total > 50) {                              // a ring of traffic
          g.beginPath(); g.arc(x, y, R + 4, -Math.PI / 2, -Math.PI / 2 + share * 2 * Math.PI);
          g.strokeStyle = C.good; g.lineWidth = 3.5; g.stroke();
        }
        g.fillStyle = on ? '#0d1117' : C.fg; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(p.name, x, y + 2);
        g.fillStyle = on ? '#0d1117' : C.muted; g.font = f(8.5, 600);
        g.fillText(total > 50 ? (share * 100).toFixed(0) + '%' : indeg[i] + ' in', x, y + 12);
      });
      if (at >= 0 && total > 0) {
        var p2 = pages[at];
        g.beginPath(); g.arc(PX(p2), PY(p2) - R - 10, 4.5, 0, 7);
        g.fillStyle = C.gold; g.fill();
      }
    };
    return {
      destroy: stage.destroy,
      select: function (id) { sel = id; at = byId[id]; if (chips && chips.select) chips.select(id); render(); }
    };
  });

  /* ======================================================================
   * gas_returns — ten molecules, two halves of a box
   * ====================================================================== */
  reg('gasBox', function (host, api) {
    var n = (DATA.gas && DATA.gas.molecules) || 10;
    var side = [], i;
    for (i = 0; i < n; i++) side.push(0);              // 0 = left, 1 = right
    var spot = [];
    for (i = 0; i < n; i++) spot.push([Math.random(), Math.random()]);
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.6);
    var secs = 0, visits = 0, lastVisit = 0, gaps = [], pending = 0, flash = 0;

    function left() { var c = 0, j; for (j = 0; j < n; j++) if (!side[j]) c++; return c; }
    function render() {
      var s = big(left()) + ' of ' + n + ' on the left &nbsp;·&nbsp; ' +
        big(commas(secs)) + ' seconds';
      if (gaps.length) {
        var sum = 0, j;
        for (j = 0; j < gaps.length; j++) sum += gaps[j];
        s += '<br>back to all-left ' + big(visits) + ' times &nbsp;·&nbsp; average gap ' +
          big(commas(Math.round(sum / gaps.length))) + ' seconds';
      }
      out.innerHTML = s;
    }
    function tick() {
      var j = pickInt(n);
      side[j] = 1 - side[j];
      spot[j] = [Math.random(), Math.random()];
      secs++;
      if (left() === n) {
        visits++;
        if (lastVisit) gaps.push(secs - lastVisit);
        lastVisit = secs;
        flash = performance.now();
      }
    }
    K.button(ctr, 'One second', function () { tick(); render(); api.onInteract('tick'); })
      .classList.add('small');
    K.button(ctr, 'Run 30,000', function () { pending += 30000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      for (var j = 0; j < n; j++) side[j] = 0;
      secs = 0; visits = 0; lastVisit = 0; gaps = []; pending = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 3000);
        for (var k = 0; k < take; k++) tick();
        pending -= take; render();
      }
      var pad = 14, top = 12, bh = Math.min(h - 44, 130), bw = w - pad * 2;
      var fresh = Math.max(0, 1 - (performance.now() - flash) / 500);
      roundRect(g, pad, top, bw, bh, 8);
      g.fillStyle = C.panel; g.fill();
      g.strokeStyle = fresh > 0 ? C.good : C.dim; g.lineWidth = fresh > 0 ? 2 : 1; g.stroke();
      g.strokeStyle = 'rgba(139,148,158,0.45)'; g.lineWidth = 1; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(pad + bw / 2, top); g.lineTo(pad + bw / 2, top + bh); g.stroke();
      g.setLineDash([]);
      for (var j = 0; j < n; j++) {
        var hx = pad + 10 + spot[j][0] * (bw / 2 - 20) + (side[j] ? bw / 2 : 0);
        var hy = top + 12 + spot[j][1] * (bh - 24);
        g.beginPath(); g.arc(hx, hy, 5.5, 0, 7);
        g.fillStyle = side[j] ? 'rgba(210,153,34,0.9)' : 'rgba(88,166,255,0.9)'; g.fill();
      }
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('left ' + left(), pad + bw / 4, top + bh + 14);
      g.fillText('right ' + (n - left()), pad + bw * 0.75, top + bh + 14);
      if (fresh > 0) {
        g.fillStyle = 'rgba(62,207,142,' + fresh.toFixed(2) + ')';
        g.font = f(12, 700);
        g.fillText('all ten on the left', w / 2, top + bh / 2);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * riffle_seven — how mixed a deck really is
   * ====================================================================== */
  reg('riffleMix', function (host, api) {
    var N = DATA.deck || 52;
    var deck = [], i;
    for (i = 0; i < N; i++) deck.push(i);
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.55);
    var shuffles = 0;

    /* A genuine riffle: cut binomially, then drop cards from whichever half is
     * heavier, which is the Gilbert-Shannon-Reeds model card players match. */
    function riffle() {
      var cut = 0;
      for (i = 0; i < N; i++) if (coin()) cut++;
      var a = deck.slice(0, cut), b = deck.slice(cut), res = [];
      while (a.length || b.length) {
        if (!a.length) { res.push(b.shift()); continue; }
        if (!b.length) { res.push(a.shift()); continue; }
        res.push(Math.random() < a.length / (a.length + b.length) ? a.shift() : b.shift());
      }
      deck = res;
      shuffles++;
    }
    function rising() {                                // runs of the original order
      var seen = [], j;
      for (j = 0; j < N; j++) seen[deck[j]] = j;
      var runs = 1;
      for (j = 1; j < N; j++) if (seen[j] < seen[j - 1]) runs++;
      return runs;
    }
    function render() {
      var r = rising();
      out.innerHTML = big(shuffles) + (shuffles === 1 ? ' riffle' : ' riffles') +
        ' &nbsp;·&nbsp; the deck still falls into ' + big(r) +
        (r === 1 ? ' run' : ' runs') + ' of its original order' +
        '<br><span style="color:#8b949e">a properly mixed deck sits at about 26</span>';
    }
    K.button(ctr, 'Riffle once', function () { riffle(); render(); api.onInteract('riffle'); })
      .classList.add('primary');
    K.button(ctr, 'Riffle five more', function () {
      for (var k = 0; k < 5; k++) riffle();
      render(); api.onInteract('riffle');
    }).classList.add('small');
    K.button(ctr, 'New deck', function () {
      deck = []; for (var k = 0; k < N; k++) deck.push(k);
      shuffles = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var pad = 12, cw = (w - pad * 2) / N, top = 16, ch = Math.min(60, h - 60);
      for (i = 0; i < N; i++) {
        var frac = deck[i] / (N - 1);
        var r = Math.round(lerp(88, 240, frac));
        var gg = Math.round(lerp(166, 136, frac));
        var b = Math.round(lerp(255, 96, frac));
        g.fillStyle = 'rgb(' + r + ',' + gg + ',' + b + ')';
        g.fillRect(pad + i * cw, top, Math.max(1, cw - 0.6), ch);
      }
      g.strokeStyle = C.dim; g.lineWidth = 1;
      g.strokeRect(pad, top, w - pad * 2, ch);
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
      g.fillText('colour = where the card started', pad, top - 4);
      // a bar of how many runs survive
      var runs = rising(), by = top + ch + 18, bw = w - pad * 2;
      roundRect(g, pad, by, bw, 12, 6); g.fillStyle = C.panel; g.fill();
      roundRect(g, pad, by, Math.max(2, bw * (runs / 26)), 12, 6);
      g.fillStyle = runs >= 24 ? C.good : C.gold; g.fill();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText(runs + ' runs of ' + 26 + ' — ' +
        (runs >= 24 ? 'as mixed as it gets' : 'the deck still remembers'), w / 2, by + 26);
    };
    return { destroy: stage.destroy };
  });

})(window);
