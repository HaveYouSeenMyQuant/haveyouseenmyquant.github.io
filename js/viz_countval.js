/* QQ visuals — counting (unit 5) and expectation (unit 6).
 *
 * Same house rules as the rest: animate the thing, never draw the formula, and
 * never print the answer before the player has driven the interaction there.
 * Where an engine in js/viz_lab.js already has the right shape, this file just
 * configures it; the bespoke ones below are the cases where the picture itself
 * is the explanation — a grid of handshakes, a board of squares, a timetable
 * you turn up to at random.
 *
 * Loads after js/viz.js (the kit) and js/viz_lab.js (the engines).
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, el = K.el, clamp = K.clamp, lerp = K.lerp;
  var easeOut = K.easeOut, roundRect = K.roundRect;
  var LAB = global.QQLab;
  var reg = global.QQViz.register;

  function now() { return performance.now(); }
  function pickInt(n) { return Math.floor(Math.random() * n); }
  function die() { return 1 + pickInt(6); }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = pickInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function slice(o, key, fallback) {
    var d = o && o.countval;
    return (d && d[key]) ? d[key] : fallback;
  }

  /* ==========================================================  unit 5  === */

  /* --------------------------------------------------- 1. handshake grid */
  reg('handshakeGrid', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.88);
    var n = 4, shown = 4;

    function pairs(k) { return k * (k - 1) / 2; }
    function render() {
      out.innerHTML = '<b>' + n + '</b> people &nbsp;·&nbsp; <b>' + pairs(n) +
        '</b> handshake' + (pairs(n) === 1 ? '' : 's');
    }
    K.slider(ctr, { min: 2, max: 12, step: 1, value: 4, label: 'people in the room' },
      function (v) { n = v; render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      shown += (n - shown) * 0.22;
      var pad = 20;
      var size = Math.min((w - pad - 14) / n, (h - pad - 22) / n);
      var ox = (w - size * n) / 2 + pad * 0.4, oy = 16;
      var r, c, x, y;

      g.font = f(Math.max(8, Math.min(10, size * 0.4)), 600);
      for (r = 0; r < n; r++) {
        g.fillStyle = C.muted; g.textAlign = 'center';
        g.fillText(String(r + 1), ox + size * (r + 0.5), oy - 5);
        g.textAlign = 'right';
        g.fillText(String(r + 1), ox - 4, oy + size * (r + 0.5) + 3.5);
      }
      for (r = 0; r < n; r++) {
        for (c = 0; c < n; c++) {
          x = ox + c * size; y = oy + r * size;
          g.fillStyle = '#1c232c';
          roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4); g.fill();
          if (c > r) {                       // one handshake, counted once
            g.fillStyle = C.good;
            roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4); g.fill();
          } else if (c < r) {                // the same handshake, the other way round
            g.fillStyle = 'rgba(210,153,34,0.30)';
            roundRect(g, x + 1.5, y + 1.5, size - 3, size - 3, 4); g.fill();
          } else {
            g.strokeStyle = C.dim; g.lineWidth = 1;
            g.beginPath();
            g.moveTo(x + 4, y + size - 4); g.lineTo(x + size - 4, y + 4);
            g.stroke();
          }
        }
      }
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('green: a handshake', 4, h - 14);
      g.fillStyle = 'rgba(210,153,34,0.85)';
      g.fillText('gold: the same one again', 4, h - 3);
      g.fillStyle = '#5b6672'; g.textAlign = 'right';
      g.fillText('the line: nobody shakes their own hand', w - 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------- 2 & 9. shuffling a row of people */
  /* One factory, two questions: how many orders exist at all, and how many of
   * them put a chosen pair side by side. Both discover their number by real
   * shuffling — the tally saturates, it is never announced. */
  function shuffleLab(spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, spec.idle);
      var stage = K.Stage(host, 0.56);
      var names = spec.names;
      var cur = names.slice();
      var seen = {}, distinct = 0, runs = 0, hits = 0, pending = 0, movedAt = 0;

      function adjacent(order) {
        var a = order.indexOf(names[0]), b = order.indexOf(names[1]);
        return Math.abs(a - b) === 1;
      }
      function record(order) {
        runs++;
        var ok = spec.pairMode ? adjacent(order) : true;
        if (ok) {
          hits++;
          var key = order.join('');
          if (!seen[key]) { seen[key] = 1; distinct++; }
        }
      }
      function render() {
        if (!runs) { out.innerHTML = spec.idle; return; }
        if (spec.pairMode) {
          out.innerHTML = '<b>' + commas(runs) + '</b> shuffles &nbsp;·&nbsp; side by side in <b>' +
            commas(hits) + '</b> of them &nbsp;·&nbsp; <b>' + distinct +
            '</b> different side-by-side orders found';
        } else {
          out.innerHTML = '<b>' + commas(runs) + '</b> shuffles &nbsp;·&nbsp; <b>' + distinct +
            '</b> different orders found so far';
        }
      }
      K.button(ctr, 'Shuffle', function () {
        shuffle(cur); record(cur); movedAt = now(); render(); api.onInteract('run');
      }).classList.add('primary');
      K.button(ctr, 'Shuffle 200 times', function () {
        pending += 200; api.onInteract('run');
      }).classList.add('small');
      K.button(ctr, 'Start over', function () {
        seen = {}; distinct = 0; runs = 0; hits = 0; pending = 0;
        render(); api.onInteract('reset');
      }).classList.add('small');
      render();

      stage.draw = function (g, w, h) {
        var take = Math.min(pending, 120), i;
        for (i = 0; i < take; i++) { shuffle(cur); record(cur); }
        pending -= take;
        if (take) { movedAt = now(); render(); }

        var n = names.length, pad = 10;
        var step = (w - pad * 2) / n, tile = Math.min(step - 8, h * 0.34);
        var y = h * 0.30;
        var pop = clamp((now() - movedAt) / 260, 0, 1);
        for (i = 0; i < n; i++) {
          var cx = pad + step * (i + 0.5);
          var isPair = spec.pairMode && (cur[i] === names[0] || cur[i] === names[1]);
          var lift = (1 - easeOut(pop)) * 6;
          g.fillStyle = isPair ? C.gold : '#1c232c';
          roundRect(g, cx - tile / 2, y - tile / 2 - lift, tile, tile, 9); g.fill();
          g.strokeStyle = isPair ? C.gold : C.line; g.lineWidth = 1.5;
          roundRect(g, cx - tile / 2, y - tile / 2 - lift, tile, tile, 9); g.stroke();
          g.fillStyle = isPair ? '#0d1117' : C.fg;
          g.font = f(Math.max(12, tile * 0.42), 800); g.textAlign = 'center';
          g.fillText(cur[i], cx, y + tile * 0.14 - lift);
          g.fillStyle = '#5b6672'; g.font = f(9.5, 600);
          g.fillText(String(i + 1) + (i === 0 ? 'st' : (i === 1 ? 'nd' : (i === 2 ? 'rd' : 'th'))),
            cx, y + tile * 0.5 + 12 - lift);
        }
        if (spec.pairMode && adjacent(cur)) {
          var ia = cur.indexOf(names[0]), ib = cur.indexOf(names[1]);
          var lo = Math.min(ia, ib), hi = Math.max(ia, ib);
          var x0 = pad + step * lo + 6, x1 = pad + step * (hi + 1) - 6;
          var by = y + tile * 0.5 + 20;
          g.strokeStyle = C.good; g.lineWidth = 2; g.beginPath();
          g.moveTo(x0, by); g.lineTo(x0, by + 5); g.lineTo(x1, by + 5); g.lineTo(x1, by);
          g.stroke();
          g.fillStyle = C.good; g.font = f(10, 700); g.textAlign = 'center';
          g.fillText('side by side', (x0 + x1) / 2, by + 17);
        }
        g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
        g.fillText(spec.caption, pad, h - 3);
      };
      return { destroy: stage.destroy };
    };
  }

  reg('queueShuffles', shuffleLab({
    names: ['A', 'B', 'C', 'D', 'E'],
    pairMode: false,
    idle: 'Shuffle the queue and see how many different orders turn up.',
    caption: 'every shuffle is a fresh random order of the five'
  }));

  reg('seatShuffles', shuffleLab({
    names: ['A', 'B', 'C', 'D', 'E'],
    pairMode: true,
    idle: 'A and B are the two who want to sit together. Shuffle the row.',
    caption: 'A and B are the pair — the rest sit anywhere'
  }));

  /* --------------------------------------------------- 3. the pizza menu */
  reg('pizzaMenu', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.8);
    var m = 3, shown = 3;

    function menus(k) { return Math.pow(2, k); }
    function render() {
      out.innerHTML = '<b>' + m + '</b> topping' + (m === 1 ? '' : 's') +
        ' on the menu &nbsp;·&nbsp; <b>' + commas(menus(m)) + '</b> different pizzas';
    }
    K.slider(ctr, { min: 1, max: 10, step: 1, value: 3, label: 'toppings on the menu' },
      function (v) { m = v; render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      shown += (menus(m) - shown) * 0.2;
      var total = menus(m);
      var pad = 10, top = 14, bottom = h - 16;
      var cols = Math.max(2, Math.ceil(Math.sqrt(total * (w - pad * 2) / Math.max(1, bottom - top))));
      var rows = Math.ceil(total / cols);
      var cell = Math.min((w - pad * 2) / cols, (bottom - top) / rows);
      var ox = (w - cell * cols) / 2 + cell / 2, oy = top + cell / 2;
      var r = Math.max(1.4, cell * 0.34);
      var grow = clamp(shown / Math.max(1, total), 0, 1);

      for (var i = 0; i < total; i++) {
        var x = ox + (i % cols) * cell, y = oy + ((i / cols) | 0) * cell;
        g.globalAlpha = i < shown + 1 ? 1 : 0.15;
        g.fillStyle = C.gold;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        if (r > 4) {                       // a couple of specks, so it reads as a pizza
          g.fillStyle = '#8a3b1f';
          g.beginPath(); g.arc(x - r * 0.3, y - r * 0.25, r * 0.2, 0, 7); g.fill();
          g.beginPath(); g.arc(x + r * 0.32, y + r * 0.2, r * 0.2, 0, 7); g.fill();
        }
        g.globalAlpha = 1;
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('one dot per possible pizza — the plain one counts too', pad, h - 3);
      void grow;
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------- 4 & 11. chips that enumerate something */
  /* The player taps one option; the visual lists every possibility it has, in
   * full, and says how many there were. Nothing is shown until they tap. */
  function chipLab(spec) {
    return function (host, api) {
      var items = spec.items(api.data || {});
      var chips = K.controls(host);
      var out = K.readout(host, spec.idle);
      var stage = K.Stage(host, 0.82);
      var sel = -1, selAt = 0, chipEls = [];

      items.forEach(function (it, idx) {
        var b = el('button', 'viz-chip', it.short);
        b.type = 'button';
        b.addEventListener('click', function () {
          sel = idx; selAt = now();
          chipEls.forEach(function (x, j) { x.classList.toggle('on', j === idx); });
          out.innerHTML = spec.caption(it);
          api.onInteract('chip');
        });
        chips.appendChild(b); chipEls.push(b);
      });

      stage.draw = function (g, w, h) {
        if (sel < 0) {
          g.fillStyle = C.muted; g.font = f(11.5, 600); g.textAlign = 'center';
          g.fillText(spec.empty, w / 2, h / 2);
          return;
        }
        var it = items[sel], cells = it.cells, total = cells.length;
        var pad = 8, top = 22, bottom = h - 6;
        var cols = Math.max(1, Math.round(Math.sqrt(total * (w - pad * 2) / Math.max(1, bottom - top))));
        cols = Math.min(cols, total);
        var rows = Math.ceil(total / cols);
        var cell = Math.min((w - pad * 2) / cols, (bottom - top) / rows);
        var ox = (w - cell * cols) / 2, oy = top + ((bottom - top) - cell * rows) / 2;
        var age = (now() - selAt) / 1000;

        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
        g.fillText(it.header, pad, 13);

        for (var i = 0; i < total; i++) {
          var x = ox + (i % cols) * cell, y = oy + ((i / cols) | 0) * cell;
          var k = easeOut(clamp((age - i * 0.008) / 0.3, 0, 1));
          if (k <= 0) continue;
          var hot = it.hot && it.hot(i);
          g.globalAlpha = k;
          g.fillStyle = hot ? C.gold : '#1c232c';
          roundRect(g, x + 1, y + 1, cell - 2, cell - 2, Math.min(4, cell / 4)); g.fill();
          if (cell > 11 && cells[i] !== '') {
            g.fillStyle = hot ? '#0d1117' : '#9aa6b2';
            g.font = f(Math.max(7, cell * (String(cells[i]).length > 2 ? 0.3 : 0.42)), 700);
            g.textAlign = 'center';
            g.fillText(String(cells[i]), x + cell / 2, y + cell / 2 + cell * 0.15);
          }
          g.globalAlpha = 1;
        }
      };
      return { destroy: stage.destroy };
    };
  }

  /* every possibility, listed out — combinations, orderings, or repeats */
  function enumerateWays(s) {
    var pool = [], i;
    if (s.kind === 'repeat') { for (i = 0; i < s.n; i++) pool.push(String(i % 10)); }
    else { for (i = 0; i < s.n; i++) pool.push(String.fromCharCode(65 + i)); }
    var res = [], used = {};
    function rec(prefix) {
      if (prefix.length === s.k) { res.push(prefix.join('')); return; }
      for (var j = 0; j < pool.length; j++) {
        if (s.kind !== 'repeat' && used[j]) continue;
        if (s.kind === 'choose' && prefix.length && pool[j] <= prefix[prefix.length - 1]) continue;
        used[j] = 1; prefix.push(pool[j]);
        rec(prefix);
        prefix.pop(); used[j] = 0;
      }
    }
    rec([]);
    return res;
  }

  reg('waysChips', chipLab({
    idle: 'Tap one of the four. Every possibility gets listed out.',
    empty: 'tap one of the four above',
    items: function (data) {
      var scen = slice(data, 'waysScenarios', []);
      return scen.map(function (s) {
        var cells = enumerateWays(s);
        return {
          short: s.short, label: s.label, cells: cells,
          header: s.label
        };
      });
    },
    caption: function (it) {
      return it.label + ' &nbsp;·&nbsp; <b>' + commas(it.cells.length) + '</b> ways';
    }
  }));

  reg('betChips', chipLab({
    idle: 'Tap a game. Every outcome it has gets laid out.',
    empty: 'tap one of the four games above',
    items: function (data) {
      var bets = slice(data, 'bets', []);
      return bets.map(function (b) {
        var cells = [], i;
        var every = b.outcomes / b.winners;
        for (i = 0; i < b.outcomes; i++) {
          if (b.faces === 'die') cells.push(String(i + 1));
          else if (b.faces === 'coin') cells.push(i === 0 ? 'H' : 'T');
          else if (b.faces === 'spinner') cells.push(i === 0 ? '★' : '');
          else cells.push(i % every === 0 ? 'A' : '');
        }
        return {
          short: b.short, label: b.label, prize: b.prize,
          outcomes: b.outcomes, winners: b.winners, cells: cells,
          header: b.label,
          hot: function (i) {
            if (b.faces === 'die') return i === 5;
            if (b.faces === 'coin') return i === 0;
            if (b.faces === 'spinner') return i === 0;
            return i % every === 0;
          }
        };
      });
    },
    caption: function (it) {
      var value = it.prize * it.winners / it.outcomes;
      return 'wins <b>' + it.winners + '</b> time' + (it.winners === 1 ? '' : 's') +
        ' in <b>' + it.outcomes + '</b> and pays <b>£' + it.prize +
        '</b> &nbsp;·&nbsp; worth <b>£' + value.toFixed(2) + '</b> a go';
    }
  }));

  /* ------------------------------------------------ 5. routes on a grid */
  reg('gridRoutes', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Walk from the bottom-left corner to the top-right one.');
    var stage = K.Stage(host, 0.9);
    var B = 3;
    var seen = {}, distinct = 0, walks = 0, pending = 0, last = null, lastAt = 0;

    function walk() {
      var r = 0, c = 0, path = [];
      while (r < B || c < B) {
        var canE = c < B, canN = r < B;
        var goE = (canE && canN) ? (Math.random() < 0.5) : canE;
        if (goE) { c++; path.push('E'); } else { r++; path.push('N'); }
      }
      return path;
    }
    function record(p) {
      var key = p.join('');
      if (!seen[key]) { seen[key] = 1; distinct++; }
      walks++;
    }
    function render() {
      if (!walks) { out.innerHTML = 'Walk from the bottom-left corner to the top-right one.'; return; }
      out.innerHTML = '<b>' + commas(walks) + '</b> walks &nbsp;·&nbsp; <b>' + distinct +
        '</b> different routes found so far';
    }
    K.button(ctr, 'Walk a route', function () {
      last = walk(); record(last); lastAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Walk 200 routes', function () {
      pending += 200; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Start over', function () {
      seen = {}; distinct = 0; walks = 0; pending = 0; last = null;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 60), i;
      for (i = 0; i < take; i++) { last = walk(); record(last); }
      pending -= take;
      if (take) { lastAt = now(); render(); }

      var pad = 26;
      var size = Math.min((w - pad * 2) / B, (h - pad * 2) / B);
      var ox = (w - size * B) / 2, oy = h - pad - size * B + 6;
      function PX(c) { return ox + c * size; }
      function PY(r) { return oy + (B - r) * size; }

      g.strokeStyle = 'rgba(139,148,158,0.32)'; g.lineWidth = 1.5;
      for (i = 0; i <= B; i++) {
        g.beginPath(); g.moveTo(PX(0), PY(i)); g.lineTo(PX(B), PY(i)); g.stroke();
        g.beginPath(); g.moveTo(PX(i), PY(0)); g.lineTo(PX(i), PY(B)); g.stroke();
      }
      if (last) {                       // the last route, drawn as it was walked
        var age = (now() - lastAt) / 1000;
        var upto = clamp(age / 0.5, 0, 1) * last.length;
        var r2 = 0, c2 = 0;
        g.strokeStyle = C.good; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round';
        g.beginPath(); g.moveTo(PX(0), PY(0));
        for (i = 0; i < last.length; i++) {
          var part = clamp(upto - i, 0, 1);
          if (part <= 0) break;
          var nr = r2 + (last[i] === 'N' ? 1 : 0), nc = c2 + (last[i] === 'E' ? 1 : 0);
          g.lineTo(lerp(PX(c2), PX(nc), part), lerp(PY(r2), PY(nr), part));
          r2 = nr; c2 = nc;
        }
        g.stroke();
        g.lineCap = 'butt';
      }
      for (var rr = 0; rr <= B; rr++) {
        for (var cc = 0; cc <= B; cc++) {
          g.fillStyle = (rr === 0 && cc === 0) ? C.accent : ((rr === B && cc === B) ? C.gold : '#3f4b5b');
          g.beginPath(); g.arc(PX(cc), PY(rr), (rr === 0 && cc === 0) || (rr === B && cc === B) ? 6 : 3.5, 0, 7);
          g.fill();
        }
      }
      g.fillStyle = C.accent; g.font = f(10, 700); g.textAlign = 'left';
      g.fillText('start', PX(0) - 4, PY(0) + 17);
      g.fillStyle = C.gold; g.textAlign = 'right';
      g.fillText('finish', PX(B) + 4, PY(B) - 10);
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('east and north only — never back on yourself', 4, 11);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------- 6. squares on a chessboard */
  reg('boardSquares', function (host, api) {
    var chips = K.controls(host);
    var out = K.readout(host, 'Tap a size. Every square of that size gets counted.');
    var stage = K.Stage(host, 1.0);
    var N = 8, sel = 0, selAt = 0, checked = {}, running = 0, chipEls = [];

    function places(size) { return (N - size + 1) * (N - size + 1); }
    for (var s = 1; s <= N; s++) {
      (function (size) {
        var b = el('button', 'viz-chip', size + '×' + size);
        b.type = 'button';
        b.addEventListener('click', function () {
          sel = size; selAt = now();
          chipEls.forEach(function (x, j) { x.classList.toggle('on', j === size - 1); });
          if (!checked[size]) { checked[size] = 1; running += places(size); }
          var howMany = 0, kk;
          for (kk in checked) if (checked.hasOwnProperty(kk)) howMany++;
          out.innerHTML = 'a <b>' + size + ' by ' + size + '</b> square fits in <b>' +
            places(size) + '</b> places &nbsp;·&nbsp; ' + howMany + ' of the 8 sizes checked, <b>' +
            running + '</b> squares so far';
          api.onInteract('chip');
        });
        chips.appendChild(b); chipEls.push(b);
      })(s);
    }

    stage.draw = function (g, w, h) {
      var pad = 8;
      var size = Math.min((w - pad * 2) / N, (h - pad * 2 - 12) / N);
      var ox = (w - size * N) / 2, oy = pad;
      var r, c;
      for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
          g.fillStyle = (r + c) % 2 === 0 ? '#1c232c' : '#161b22';
          g.fillRect(ox + c * size, oy + r * size, size, size);
        }
      }
      if (sel > 0) {
        var span = N - sel + 1, total = span * span;
        var age = (now() - selAt) / 1000;
        g.strokeStyle = 'rgba(63,185,80,0.45)'; g.lineWidth = 1;
        for (r = 0; r < span; r++) {
          for (c = 0; c < span; c++) {
            var idx = r * span + c;
            if (age < idx * 0.012) continue;
            g.strokeRect(ox + c * size + 1, oy + r * size + 1, size * sel - 2, size * sel - 2);
          }
        }
        var cur = Math.min(total - 1, Math.floor(age / 0.22) % total);   // one of them, sweeping
        var cr = (cur / span) | 0, cc = cur % span;
        g.strokeStyle = C.good; g.lineWidth = 3;
        g.strokeRect(ox + cc * size + 1.5, oy + cr * size + 1.5, size * sel - 3, size * sel - 3);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText(sel ? 'every place a ' + sel + ' by ' + sel + ' square can sit'
        : 'the little ones are only the start', 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------- 7. at least one six in four */
  reg('sixInFour', LAB.sim({
    trial: function () {
      for (var i = 0; i < 4; i++) if (die() === 6) return true;
      return false;
    },
    mode: 'rate',
    idle: 'Throw the four dice and count how often a six shows up.',
    rateLabel: 'of throws had at least one six',
    barLabel: 'throws with at least one six',
    batches: [20, 500],
    aspect: 0.5
  }));

  /* ------------------------------------------------ 8. people into boxes */
  reg('pigeonholeDrop', LAB.steps({
    n: 20,
    aspect: 0.66,
    playLabel: 'Drop them in',
    everyMs: 380,
    init: function () {
      var a = [], i;
      for (i = 0; i < 20; i++) a.push(pickInt(8));
      return { boxes: 8, drops: a };
    },
    onStep: function (i, st) {
      if (i === 0) {                     // back to the start deals a fresh set
        var a = [], j;
        for (j = 0; j < 20; j++) a.push(pickInt(8));
        return { boxes: 8, drops: a };
      }
      return st;
    },
    caption: function (i, st) {
      var counts = {}, j, shared = 0, most = 0;
      for (j = 0; j < i; j++) {
        counts[st.drops[j]] = (counts[st.drops[j]] || 0) + 1;
        if (counts[st.drops[j]] > most) most = counts[st.drops[j]];
        if (counts[st.drops[j]] === 2) shared++;
      }
      if (!i) return '<b>8</b> boxes, nobody dropped in yet.';
      return '<b>' + i + '</b> people in <b>8</b> boxes &nbsp;·&nbsp; ' +
        (most > 1 ? 'a box holds <b>' + most + '</b>' : 'every box holds at most one') +
        (i > 8 ? ' &nbsp;·&nbsp; <span class="tag-b">more people than boxes</span>' : '');
    },
    draw: function (g, w, h, i, t, st) {
      var B = st.boxes, pad = 8;
      var bw = (w - pad * 2) / B, base = h - 18;
      var counts = [], j;
      for (j = 0; j < B; j++) counts.push(0);
      for (j = 0; j < i; j++) counts[st.drops[j]]++;
      var maxStack = 1;
      for (j = 0; j < B; j++) if (counts[j] > maxStack) maxStack = counts[j];
      var unit = Math.min(18, (base - 24) / Math.max(3, maxStack));

      for (j = 0; j < B; j++) {
        var x = pad + j * bw;
        g.fillStyle = '#141a21';
        roundRect(g, x + 2, base - unit * Math.max(3, maxStack) - 4, bw - 4,
          unit * Math.max(3, maxStack) + 4, 6);
        g.fill();
        g.strokeStyle = counts[j] > 1 ? C.good : C.line;
        g.lineWidth = counts[j] > 1 ? 2 : 1;
        roundRect(g, x + 2, base - unit * Math.max(3, maxStack) - 4, bw - 4,
          unit * Math.max(3, maxStack) + 4, 6);
        g.stroke();
        for (var k = 0; k < counts[j]; k++) {
          g.fillStyle = counts[j] > 1 ? C.good : C.accent;
          g.beginPath();
          g.arc(x + bw / 2, base - 6 - k * unit, Math.min(unit * 0.4, bw * 0.28), 0, 7);
          g.fill();
        }
        g.fillStyle = '#5b6672'; g.font = f(9.5, 600); g.textAlign = 'center';
        g.fillText(String(j + 1), x + bw / 2, base + 12);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('one box per possible hair count', pad, 11);
    }
  }));

  /* -------------------------------------- 10. repeated letters in BANANA */
  reg('bananaShuffles', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Shuffle the tiles. Matching letters hide repeated counts.');
    var stage = K.Stage(host, 0.56);
    var base = ['B', 'A', 'N', 'A', 'N', 'A'];
    var cur = base.slice();
    var seen = {}, distinct = 0, runs = 0, pending = 0, movedAt = 0;

    function record() {
      shuffle(cur);
      runs++;
      var key = cur.join('');
      if (!seen[key]) { seen[key] = 1; distinct++; }
    }
    function render() {
      if (!runs) { out.innerHTML = 'Shuffle the tiles. Matching letters hide repeated counts.'; return; }
      out.innerHTML = '<b>' + commas(runs) + '</b> shuffles &nbsp;·&nbsp; <b>' +
        distinct + '</b> different-looking strings found';
    }
    K.button(ctr, 'Shuffle', function () {
      record(); movedAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Shuffle 200 times', function () {
      pending += 200; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Start over', function () {
      cur = base.slice(); seen = {}; distinct = 0; runs = 0; pending = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 120), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { movedAt = now(); render(); }

      var pad = 10, step = (w - pad * 2) / cur.length;
      var tile = Math.min(step - 6, h * 0.38);
      var y = h * 0.36;
      var pop = 1 - easeOut(clamp((now() - movedAt) / 280, 0, 1));
      for (i = 0; i < cur.length; i++) {
        var x = pad + step * (i + 0.5), letter = cur[i];
        var lift = pop * ((i % 2) ? 7 : 3);
        g.fillStyle = letter === 'A' ? C.gold : (letter === 'N' ? C.accent : C.good);
        roundRect(g, x - tile / 2, y - tile / 2 - lift, tile, tile, 8); g.fill();
        g.fillStyle = '#0d1117'; g.font = f(Math.max(18, tile * 0.46), 900);
        g.textAlign = 'center';
        g.fillText(letter, x, y + tile * 0.16 - lift);
        g.fillStyle = '#5b6672'; g.font = f(10, 700);
        g.fillText(String(i + 1), x, y + tile * 0.5 + 14 - lift);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('three A tiles and two N tiles look identical after a swap', 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 11. seats around a table */
  reg('roundTableSpin', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Shuffle the friends. Spin the table to see what did not change.');
    var stage = K.Stage(host, 0.72);
    var names = ['A', 'B', 'C', 'D', 'E', 'F'];
    var cur = names.slice();
    var seen = {}, distinct = 0, runs = 0, pending = 0, spin = 0, movedAt = 0;

    function canon(a) {
      var at = a.indexOf('A'), out = [], i;
      for (i = 0; i < a.length; i++) out.push(a[(at + i) % a.length]);
      return out.join('');
    }
    function record() {
      shuffle(cur);
      runs++;
      var key = canon(cur);
      if (!seen[key]) { seen[key] = 1; distinct++; }
    }
    function render(msg) {
      if (!runs) { out.innerHTML = msg || 'Shuffle the friends. Spin the table to see what did not change.'; return; }
      out.innerHTML = '<b>' + commas(runs) + '</b> shuffles &nbsp;·&nbsp; <b>' +
        distinct + '</b> different circles found';
    }
    K.button(ctr, 'Shuffle', function () {
      record(); movedAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Shuffle 200 times', function () {
      pending += 200; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Spin table', function () {
      spin += Math.PI / 3; movedAt = now(); render('Same circle, just turned.'); api.onInteract('spin');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 120), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { movedAt = now(); render(); }

      var cx = w / 2, cy = h * 0.46;
      var r = Math.min(w, h) * 0.27;
      g.fillStyle = '#141a21';
      g.beginPath(); g.arc(cx, cy, r * 0.98, 0, 7); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, r * 0.98, 0, 7); g.stroke();
      for (i = 0; i < cur.length; i++) {
        var a = -Math.PI / 2 + spin + i * Math.PI * 2 / cur.length;
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        var hot = cur[i] === 'A';
        g.fillStyle = hot ? C.gold : '#1c232c';
        g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill();
        g.strokeStyle = hot ? C.gold : C.line; g.lineWidth = hot ? 2 : 1;
        g.beginPath(); g.arc(x, y, 18, 0, 7); g.stroke();
        g.fillStyle = hot ? '#0d1117' : C.fg;
        g.font = f(15, 900); g.textAlign = 'center';
        g.fillText(cur[i], x, y + 5);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('A is gold so you can see that a spin has not made a new circle', 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 12. routes via a corner */
  reg('checkpointRoutes', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Walk through the gold corner on the way to the finish.');
    var stage = K.Stage(host, 0.86);
    var seen = {}, distinct = 0, walks = 0, pending = 0, last = null, lastAt = 0;

    function route() {
      var first = shuffle(['E', 'E', 'N']);
      var second = shuffle(['E', 'E', 'N', 'N', 'N']);
      return first.concat(second);
    }
    function record() {
      last = route();
      walks++;
      var key = last.join('');
      if (!seen[key]) { seen[key] = 1; distinct++; }
    }
    function render() {
      if (!walks) { out.innerHTML = 'Walk through the gold corner on the way to the finish.'; return; }
      out.innerHTML = '<b>' + commas(walks) + '</b> walks &nbsp;·&nbsp; <b>' +
        distinct + '</b> different checkpoint routes found';
    }
    K.button(ctr, 'Walk route', function () {
      record(); lastAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Walk 200 routes', function () {
      pending += 200; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Start over', function () {
      seen = {}; distinct = 0; walks = 0; pending = 0; last = null;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 80), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { lastAt = now(); render(); }

      var B = 4, pad = 24;
      var size = Math.min((w - pad * 2) / B, (h - pad * 2) / B);
      var ox = (w - size * B) / 2, oy = h - pad - size * B + 5;
      function PX(c) { return ox + c * size; }
      function PY(r) { return oy + (B - r) * size; }

      g.strokeStyle = 'rgba(139,148,158,0.32)'; g.lineWidth = 1.4;
      for (i = 0; i <= B; i++) {
        g.beginPath(); g.moveTo(PX(0), PY(i)); g.lineTo(PX(B), PY(i)); g.stroke();
        g.beginPath(); g.moveTo(PX(i), PY(0)); g.lineTo(PX(i), PY(B)); g.stroke();
      }
      g.fillStyle = C.gold; g.beginPath(); g.arc(PX(2), PY(1), 7, 0, 7); g.fill();
      if (last) {
        var age = (now() - lastAt) / 1000, upto = clamp(age / 0.6, 0, 1) * last.length;
        var r = 0, c = 0;
        g.strokeStyle = C.good; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round';
        g.beginPath(); g.moveTo(PX(0), PY(0));
        for (i = 0; i < last.length; i++) {
          var part = clamp(upto - i, 0, 1);
          if (part <= 0) break;
          var nr = r + (last[i] === 'N' ? 1 : 0), nc = c + (last[i] === 'E' ? 1 : 0);
          g.lineTo(lerp(PX(c), PX(nc), part), lerp(PY(r), PY(nr), part));
          r = nr; c = nc;
        }
        g.stroke(); g.lineCap = 'butt';
      }
      g.fillStyle = C.accent; g.beginPath(); g.arc(PX(0), PY(0), 6, 0, 7); g.fill();
      g.fillStyle = C.gold; g.beginPath(); g.arc(PX(B), PY(B), 6, 0, 7); g.fill();
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('the gold corner splits the route into two smaller route counts', 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ---------------------------------------------- 13. all grid rectangles */
  reg('rectanglePicker', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Pick two vertical lines and two horizontal lines by making rectangles.');
    var stage = K.Stage(host, 0.72);
    var rects = [], seen = {}, distinct = 0, picks = 0, pending = 0, cur = null, all = false, movedAt = 0;
    var x0, x1, y0, y1;
    for (x0 = 0; x0 < 4; x0++) for (x1 = x0 + 1; x1 <= 4; x1++) {
      for (y0 = 0; y0 < 3; y0++) for (y1 = y0 + 1; y1 <= 3; y1++) rects.push([x0, x1, y0, y1]);
    }
    function key(r) { return r.join(','); }
    function record() {
      cur = rects[pickInt(rects.length)];
      picks++;
      if (!seen[key(cur)]) { seen[key(cur)] = 1; distinct++; }
    }
    function render() {
      if (all) {
        out.innerHTML = 'all <b>' + rects.length + '</b> rectangles are shown as faint outlines';
      } else if (!picks) {
        out.innerHTML = 'Pick two vertical lines and two horizontal lines by making rectangles.';
      } else {
        out.innerHTML = '<b>' + commas(picks) + '</b> picks &nbsp;·&nbsp; <b>' +
          distinct + '</b> different rectangles found';
      }
    }
    K.button(ctr, 'Pick rectangle', function () {
      all = false; record(); movedAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Pick 200', function () {
      all = false; pending += 200; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Show all', function () {
      all = true; render(); api.onInteract('show');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 100), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { movedAt = now(); render(); }

      var W = 4, H = 3, pad = 24;
      var size = Math.min((w - pad * 2) / W, (h - pad * 2) / H);
      var ox = (w - size * W) / 2, oy = (h - size * H) / 2 - 2;
      function RX(x) { return ox + x * size; }
      function RY(y) { return oy + (H - y) * size; }
      g.strokeStyle = 'rgba(139,148,158,0.42)'; g.lineWidth = 1.5;
      for (i = 0; i <= W; i++) { g.beginPath(); g.moveTo(RX(i), RY(0)); g.lineTo(RX(i), RY(H)); g.stroke(); }
      for (i = 0; i <= H; i++) { g.beginPath(); g.moveTo(RX(0), RY(i)); g.lineTo(RX(W), RY(i)); g.stroke(); }
      if (all) {
        g.strokeStyle = 'rgba(63,185,80,0.20)'; g.lineWidth = 1;
        rects.forEach(function (r) {
          g.strokeRect(RX(r[0]) + 1, RY(r[3]) + 1, (r[1] - r[0]) * size - 2, (r[3] - r[2]) * size - 2);
        });
      }
      if (cur) {
        var k = easeOut(clamp((now() - movedAt) / 320, 0, 1));
        g.fillStyle = 'rgba(210,153,34,' + (0.10 + 0.20 * k) + ')';
        g.fillRect(RX(cur[0]) + 2, RY(cur[3]) + 2, (cur[1] - cur[0]) * size - 4, (cur[3] - cur[2]) * size - 4);
        g.strokeStyle = C.gold; g.lineWidth = 3;
        g.strokeRect(RX(cur[0]) + 1.5, RY(cur[3]) + 1.5, (cur[1] - cur[0]) * size - 3, (cur[3] - cur[2]) * size - 3);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('one rectangle is made by two vertical and two horizontal grid lines', 4, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------ 14. three pairs */
  reg('pairingSplits', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Pair the six friends. Pair names and pair order do not count.');
    var stage = K.Stage(host, 0.62);
    var names = ['A', 'B', 'C', 'D', 'E', 'F'];
    var cur = [['A', 'B'], ['C', 'D'], ['E', 'F']];
    var seen = {}, distinct = 0, runs = 0, pending = 0, movedAt = 0;

    function makePairing() {
      var a = shuffle(names.slice()), pairs = [], i;
      for (i = 0; i < a.length; i += 2) {
        pairs.push([a[i], a[i + 1]].sort());
      }
      pairs.sort(function (p, q) { return p.join('').localeCompare(q.join('')); });
      return pairs;
    }
    function key(pairs) { return pairs.map(function (p) { return p.join(''); }).join('|'); }
    function record() {
      cur = makePairing();
      runs++;
      var k = key(cur);
      if (!seen[k]) { seen[k] = 1; distinct++; }
    }
    function render() {
      if (!runs) { out.innerHTML = 'Pair the six friends. Pair names and pair order do not count.'; return; }
      out.innerHTML = '<b>' + commas(runs) + '</b> pairings &nbsp;·&nbsp; <b>' +
        distinct + '</b> different splits found';
    }
    K.button(ctr, 'Pair them', function () {
      record(); movedAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Pair 100 times', function () {
      pending += 100; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Start over', function () {
      cur = [['A', 'B'], ['C', 'D'], ['E', 'F']]; seen = {}; distinct = 0; runs = 0; pending = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 80), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { movedAt = now(); render(); }

      var pad = 14, rowH = (h - 28) / 3;
      var pop = 1 - easeOut(clamp((now() - movedAt) / 280, 0, 1));
      for (i = 0; i < cur.length; i++) {
        var y = 20 + rowH * i + rowH / 2;
        var x1 = w * 0.32, x2 = w * 0.68;
        g.strokeStyle = C.good; g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x1 + 18, y);
        g.bezierCurveTo(w * 0.44, y - 18 - pop * 10, w * 0.56, y - 18 - pop * 10, x2 - 18, y);
        g.stroke();
        [0, 1].forEach(function (j) {
          var x = j ? x2 : x1;
          g.fillStyle = j ? C.gold : C.accent;
          g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill();
          g.fillStyle = '#0d1117'; g.font = f(15, 900); g.textAlign = 'center';
          g.fillText(cur[i][j], x, y + 5);
        });
        g.fillStyle = '#5b6672'; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText('pair ' + (i + 1), w / 2, y + 20);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('after A has a partner, the next unpaired friend has three choices', pad, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ==========================================================  unit 6  === */

  /* ---------------------------------------------- 10. the ten-or-six game */
  reg('coinGameFlips', LAB.sim({
    trial: function () { return Math.random() < 0.5 ? 10 : -6; },
    mode: 'hist', min: -6, max: 10, step: 1, dp: 2,
    batches: [20, 500],
    idle: 'Nothing flipped yet.',
    axisLabel: 'what one flip paid, in pounds',
    statLine: function (st) {
      var total = st.mean * st.n;
      return '<b>' + commas(st.n) + '</b> flips &nbsp;·&nbsp; ' +
        (total >= 0 ? 'up' : 'down') + ' <b>£' + commas(Math.round(Math.abs(total))) +
        '</b> &nbsp;·&nbsp; <b>£' + st.mean.toFixed(2) + '</b> a flip';
    }
  }));

  /* ------------------------------------------------------- 12. the raffle */
  reg('raffleDial', LAB.dial({
    min: 100, max: 1000, step: 50, value: 200,
    label: 'tickets sold',
    f: function (x) { return 600 / x; },
    ymin: 0,
    yLabel: 'what one ticket is worth (£)',
    xmin: '100 tickets', xmax: '1000 tickets',
    marks: [{ x: 500, label: 'this raffle' }],
    fill: true,
    readout: function (x, y) {
      return '<b>' + commas(x) + '</b> tickets sold for one £600 prize &nbsp;·&nbsp; a ticket is worth <b>£' +
        y.toFixed(2) + '</b> on average';
    }
  }));

  /* ------------------------------------------------ 13. the dice stall */
  var STALL = [
    { id: 'p2', label: '£2' }, { id: 'p3', label: '£3' },
    { id: 'p4', label: '£4' }, { id: 'p5', label: '£5' }
  ];
  reg('stallDice', (function () {
    var d1 = 3, d2 = 4, rolledAt = -9, throws = 0, sevens = 0;
    function tagBox(i, w, h) {
      var pad = 12, tw = (w - pad * 2) / 4;
      return { x: pad + i * tw, y: h * 0.66, w: tw - 6, h: 46 };
    }
    return LAB.picture({
      aspect: 0.86,
      regions: STALL,
      readout: function (id) {
        if (!id) return 'The dice keep rolling. Tap a price tag.';
        var lab = '';
        STALL.forEach(function (r) { if (r.id === id) lab = r.label; });
        return 'you would pay <b>' + lab + '</b> every time you roll';
      },
      hitTest: function (x, y, w, h) {
        for (var i = 0; i < 4; i++) {
          var b = tagBox(i, w, h);
          if (x >= b.x - 3 && x <= b.x + b.w + 3 && y >= b.y - 6 && y <= b.y + b.h + 6) return STALL[i].id;
        }
        return null;
      },
      draw: function (g, w, h, sel, t) {
        if (t - rolledAt > 0.75) {          // honest dice, rolled forever
          rolledAt = t; d1 = die(); d2 = die();
          throws++;
          if (d1 + d2 === 7) sevens++;
        }
        var win = d1 + d2 === 7;
        var dsz = Math.min(58, w * 0.19), gap = 14;
        var cx = w / 2, cy = h * 0.24;
        [d1, d2].forEach(function (v, i) {
          var x = cx + (i === 0 ? -(dsz + gap) / 2 - dsz / 2 : (dsz + gap) / 2 - dsz / 2);
          g.fillStyle = win ? C.gold : '#e6edf3';
          roundRect(g, x, cy - dsz / 2, dsz, dsz, 9); g.fill();
          var pips = [[], [[0.5, 0.5]], [[0.28, 0.28], [0.72, 0.72]],
            [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
            [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
            [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
            [[0.28, 0.26], [0.72, 0.26], [0.28, 0.5], [0.72, 0.5], [0.28, 0.74], [0.72, 0.74]]][v];
          g.fillStyle = '#0d1117';
          pips.forEach(function (p) {
            g.beginPath();
            g.arc(x + p[0] * dsz, cy - dsz / 2 + p[1] * dsz, dsz * 0.085, 0, 7);
            g.fill();
          });
        });
        g.fillStyle = win ? C.gold : C.muted;
        g.font = f(13, 800); g.textAlign = 'center';
        g.fillText(win ? 'seven — pays £20' : 'total ' + (d1 + d2), cx, cy + dsz * 0.5 + 20);
        g.fillStyle = '#5b6672'; g.font = f(10.5, 600);
        g.fillText('sevens so far: ' + sevens + ' of ' + throws, cx, cy + dsz * 0.5 + 36);

        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
        g.fillText('what would you pay for a roll?', 10, h * 0.66 - 10);
        for (var i = 0; i < 4; i++) {
          var b = tagBox(i, w, h);
          var on = sel === STALL[i].id;
          g.fillStyle = on ? C.gold : '#1c232c';
          roundRect(g, b.x, b.y, b.w, b.h, 8); g.fill();
          g.strokeStyle = on ? C.gold : C.line; g.lineWidth = on ? 2 : 1;
          roundRect(g, b.x, b.y, b.w, b.h, 8); g.stroke();
          g.fillStyle = on ? '#0d1117' : C.fg;
          g.font = f(17, 800); g.textAlign = 'center';
          g.fillText(STALL[i].label, b.x + b.w / 2, b.y + b.h / 2 + 6);
        }
      }
    });
  })());

  /* ------------------------------------------------- 14. the phone cover */
  reg('insuranceYears', LAB.sim({
    trial: function () { return Math.random() < 1 / 25 ? 500 : 0; },
    mode: 'hist', min: 0, max: 500, step: 500, dp: 2,
    batches: [50, 2000],
    idle: 'No customers run yet.',
    axisLabel: 'what the insurer paid this customer this year',
    statLine: function (st) {
      return '<b>' + commas(st.n) + '</b> customer-years &nbsp;·&nbsp; paid out <b>£' +
        commas(Math.round(st.mean * st.n)) + '</b> &nbsp;·&nbsp; <b>£' +
        st.mean.toFixed(2) + '</b> each';
    }
  }));

  /* -------------------------------------------- 15. waiting for the six */
  reg('rollsToSix', LAB.sim({
    trial: function () {
      var n = 1;
      while (die() !== 6) n++;
      return n;
    },
    mode: 'hist', min: 1, max: 30, step: 1, dp: 2,
    label: 'rolls', batches: [20, 500],
    idle: 'No waits run yet.',
    axisLabel: 'rolls until the first six'
  }));

  /* ---------------------------------------------- 16. the sticker album */
  reg('stickerPacks', LAB.sim({
    trial: function () {
      var have = {}, got = 0, packs = 0;
      while (got < 50) {
        var s = pickInt(50);
        packs++;
        if (!have[s]) { have[s] = 1; got++; }
      }
      return packs;
    },
    mode: 'hist', min: 120, max: 420, step: 5, dp: 1,
    label: 'packs', batches: [10, 200], perFrame: 12,
    idle: 'No albums filled yet.',
    axisLabel: 'packs needed to finish the album'
  }));

  /* ------------------------------------------------- 17. bunching buses */
  reg('busArrivals', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Turn up at the stop without looking at the timetable.');
    var stage = K.Stage(host, 0.56);
    var gaps = slice(api.data || {}, 'busGaps', [5, 15, 5, 15, 5, 15, 5, 15]);
    var stops = [0], i;
    for (i = 0; i < gaps.length; i++) stops.push(stops[i] + gaps[i]);
    var span = stops[stops.length - 1];
    var arrivals = 0, waited = 0, longGap = 0, pending = 0;
    var mark = -1, markWait = 0, markAt = 0, markLong = false;

    function arrive() {
      var t = Math.random() * span, j = 0;
      while (stops[j + 1] <= t) j++;
      var wait = stops[j + 1] - t;
      arrivals++; waited += wait;
      if (gaps[j] > 10) longGap++;
      return { t: t, wait: wait, gap: gaps[j] };
    }
    function render() {
      if (!arrivals) { out.innerHTML = 'Turn up at the stop without looking at the timetable.'; return; }
      out.innerHTML = '<b>' + commas(arrivals) + '</b> arrivals &nbsp;·&nbsp; average wait <b>' +
        (waited / arrivals).toFixed(2) + '</b> min &nbsp;·&nbsp; landed in a long gap <b>' +
        Math.round(longGap / arrivals * 100) + '%</b> of the time';
    }
    K.button(ctr, 'Turn up', function () {
      var a = arrive();
      mark = a.t; markWait = a.wait; markLong = a.gap > 10; markAt = now();
      render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Turn up 500 times', function () {
      pending += 500; api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Start over', function () {
      arrivals = 0; waited = 0; longGap = 0; pending = 0; mark = -1;
      render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 200), j;
      for (j = 0; j < take; j++) arrive();
      pending -= take;
      if (take) render();

      var pad = 14, lineY = h * 0.44, right = w - pad;
      function X(t) { return pad + (right - pad) * (t / span); }

      g.strokeStyle = C.line; g.lineWidth = 3;
      g.beginPath(); g.moveTo(pad, lineY); g.lineTo(right, lineY); g.stroke();
      for (j = 0; j < gaps.length; j++) {
        var x0 = X(stops[j]), x1 = X(stops[j + 1]);
        g.fillStyle = gaps[j] > 10 ? 'rgba(210,153,34,0.22)' : 'rgba(88,166,255,0.22)';
        g.fillRect(x0, lineY - 22, x1 - x0, 44);
        g.fillStyle = gaps[j] > 10 ? C.gold : C.accent;
        g.font = f(10, 700); g.textAlign = 'center';
        if (x1 - x0 > 22) g.fillText(gaps[j] + ' min', (x0 + x1) / 2, lineY - 28);
      }
      for (j = 0; j < stops.length; j++) {
        var bx = X(stops[j]);
        g.fillStyle = C.fg;
        roundRect(g, bx - 5, lineY - 8, 10, 16, 3); g.fill();
      }
      if (mark >= 0) {
        var k = clamp((now() - markAt) / 400, 0, 1);
        var mx = X(mark), tx = X(mark + markWait);
        g.strokeStyle = markLong ? C.gold : C.accent; g.lineWidth = 2;
        g.beginPath(); g.moveTo(mx, lineY - 34); g.lineTo(mx, lineY + 34); g.stroke();
        g.strokeStyle = C.good; g.lineWidth = 3;
        g.beginPath();
        g.moveTo(mx, lineY + 26); g.lineTo(lerp(mx, tx, easeOut(k)), lineY + 26);
        g.stroke();
        g.fillStyle = C.good; g.font = f(11, 800); g.textAlign = 'center';
        g.fillText('waited ' + markWait.toFixed(1) + ' min', (mx + tx) / 2, lineY + 44);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('one bar per bus — the gaps alternate short and long', pad, 12);
      g.textAlign = 'right'; g.fillStyle = '#5b6672';
      g.fillText('you arrive at a random moment', right, h - 3);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------------- 18. the hat check */
  function hatTrial(n) {
    var a = [], i, own = 0;
    for (i = 0; i < n; i++) a.push(i);
    shuffle(a);
    for (i = 0; i < n; i++) if (a[i] === i) own++;
    return own;
  }
  reg('hatRace', LAB.race({
    lanes: [
      { name: '5 people', trial: function () { return hatTrial(5); } },
      { name: '12 people', trial: function () { return hatTrial(12); } },
      { name: '30 people', trial: function () { return hatTrial(30); } }
    ],
    batches: [50, 1000], dp: 2, unit: 'hats', maxV: 2.4,
    idle: 'Hand the hats back at random and count who got their own.',
    axisLabel: 'average number of people who got their own hat back'
  }));
})(window);
