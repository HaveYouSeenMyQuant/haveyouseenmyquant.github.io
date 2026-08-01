/* QQ visuals — networks and algorithms (units 9 and 10).
 *
 * Same house rule as the rest: animate the thing, never write the formula. The
 * player taps a person, flips a link, lays a cable, compares two cards, weighs
 * a pan — and the readout only ever reports what they have already done.
 *
 * Loads after js/viz.js and js/viz_lab.js: QQViz.kit for the plumbing, QQLab
 * for the ten reusable engines. The shared datasets (the friendship group, the
 * exam clashes, the cable prices, the street map, the ring of villages) come
 * from QQ_DATA.vizData.netalgo, so this file and verify_answers.py are looking
 * at exactly the same numbers.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };
  var DATA = (global.QQ_DATA && global.QQ_DATA.vizData &&
              global.QQ_DATA.vizData.netalgo) || {};

  function commas(n) {
    var s = String(Math.round(n)), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      c++;
      if (c % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }
  function pickInt(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = pickInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------------------------------------------------- graph bits --- */

  function adjacency(n, edges) {
    var adj = [], i;
    for (i = 0; i < n; i++) adj.push([]);
    for (i = 0; i < edges.length; i++) {
      adj[edges[i][0]].push(edges[i][1]);
      adj[edges[i][1]].push(edges[i][0]);
    }
    return adj;
  }

  /* mean number of hops between two different villages, by breadth-first search */
  function averageHops(n, edges) {
    var adj = adjacency(n, edges), total = 0, pairs = 0, s, i;
    for (s = 0; s < n; s++) {
      var dist = [], queue = [s], head = 0;
      for (i = 0; i < n; i++) dist.push(-1);
      dist[s] = 0;
      while (head < queue.length) {
        var u = queue[head++];
        for (i = 0; i < adj[u].length; i++) {
          var v = adj[u][i];
          if (dist[v] < 0) { dist[v] = dist[u] + 1; queue.push(v); }
        }
      }
      for (i = 0; i < n; i++) if (i !== s && dist[i] > 0) { total += dist[i]; pairs++; }
    }
    return pairs ? total / pairs : 0;
  }

  /* how many separate pieces a set of links leaves n things in */
  function pieces(n, edges) {
    var par = [], i;
    for (i = 0; i < n; i++) par.push(i);
    function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
    var count = n;
    for (i = 0; i < edges.length; i++) {
      var a = find(edges[i][0]), b = find(edges[i][1]);
      if (a !== b) { par[a] = b; count--; }
    }
    return count;
  }

  /* distance from a point to a line segment — how every "tap a link" works here */
  function distToSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = dx * dx + dy * dy;
    var t = len ? ((px - x1) * dx + (py - y1) * dy) / len : 0;
    t = clamp(t, 0, 1);
    var qx = x1 + t * dx, qy = y1 + t * dy;
    return Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
  }

  function humanTime(sec) {
    if (sec < 90) return sec.toFixed(sec < 10 ? 1 : 0) + ' seconds';
    if (sec < 5400) return (sec / 60).toFixed(0) + ' minutes';
    if (sec < 172800) return (sec / 3600).toFixed(1) + ' hours';
    return (sec / 86400).toFixed(1) + ' days';
  }

  /* =======================================================================
   * u9l1 — friends and strangers
   * ======================================================================= */

  /* 1. the friendship group: tap a person, see their friends' friend counts */
  var FN = DATA.friendNetwork || { people: [], pos: [], links: [] };
  var fnNodes = [];
  for (var fi = 0; fi < FN.pos.length; fi++) {
    fnNodes.push({ x: FN.pos[fi][0], y: FN.pos[fi][1], label: FN.people[fi].charAt(0) });
  }
  reg('friendNetwork', LAB.graph({
    nodes: fnNodes, edges: FN.links, aspect: 0.95,
    idle: 'Tap somebody to see who they know.',
    hint: 'tap a person',
    onPick: function (i, adj) {
      var mine = adj[i].slice().sort(function (a, b) { return adj[b].length - adj[a].length; });
      var counts = mine.map(function (j) { return adj[j].length; });
      return '<b>' + FN.people[i] + '</b> has <b>' + adj[i].length + '</b> friend' +
        (adj[i].length === 1 ? '' : 's') + ' &nbsp;·&nbsp; and they have ' +
        counts.join(', ') + ' friend' + (counts.length === 1 && counts[0] === 1 ? '' : 's');
    }
  }));

  /* 2. handshakes at a party: step through them and watch the odd tally */
  var HS_N = 8, HS_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  function hsDegrees(seq, upTo) {
    var d = [], i;
    for (i = 0; i < HS_N; i++) d.push(0);
    for (i = 0; i < upTo; i++) { d[seq[i][0]]++; d[seq[i][1]]++; }
    return d;
  }
  reg('handshakeParity', LAB.steps({
    n: 14, aspect: 0.92, playLabel: 'Shake hands', everyMs: 620,
    init: function () {
      var seq = [], used = {}, guard = 0;
      while (seq.length < 14 && guard < 800) {
        guard++;
        var a = pickInt(HS_N), b = pickInt(HS_N);
        if (a === b) continue;
        var lo = Math.min(a, b), hi = Math.max(a, b), key = lo + '-' + hi;
        if (used[key]) continue;
        used[key] = 1;
        seq.push([lo, hi]);
      }
      return { seq: seq };
    },
    caption: function (i, st) {
      var d = hsDegrees(st.seq, i), odd = 0, k;
      for (k = 0; k < HS_N; k++) if (d[k] % 2 === 1) odd++;
      return '<b>' + i + '</b> handshake' + (i === 1 ? '' : 's') +
        ' &nbsp;·&nbsp; people on an odd number: <b>' + odd + '</b>';
    },
    draw: function (g, w, h, i, t, st) {
      var cx = w / 2, cy = h / 2 - 4, R = Math.min(w, h) * 0.36, k;
      var d = hsDegrees(st.seq, i);
      function px(j) { return cx + R * Math.cos(-Math.PI / 2 + j * 2 * Math.PI / HS_N); }
      function py(j) { return cy + R * Math.sin(-Math.PI / 2 + j * 2 * Math.PI / HS_N); }
      for (k = 0; k < i; k++) {
        var e = st.seq[k];
        g.strokeStyle = k === i - 1 ? C.accent : 'rgba(88,166,255,0.35)';
        g.lineWidth = k === i - 1 ? 2.6 : 1.3;
        g.beginPath(); g.moveTo(px(e[0]), py(e[0])); g.lineTo(px(e[1]), py(e[1])); g.stroke();
      }
      for (k = 0; k < HS_N; k++) {
        var odd = d[k] % 2 === 1;
        g.beginPath(); g.arc(px(k), py(k), 15, 0, 7);
        g.fillStyle = odd ? C.gold : C.panel; g.fill();
        g.strokeStyle = odd ? C.gold : C.dim; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = odd ? '#0d1117' : C.muted; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(String(d[k]), px(k), py(k) + 4);
        g.fillStyle = C.muted; g.font = f(9.5, 600);
        g.fillText(HS_NAMES[k], px(k) + (px(k) > cx ? 24 : (px(k) < cx ? -24 : 0)),
          py(k) + (Math.abs(px(k) - cx) < 4 ? (py(k) < cy ? -20 : 26) : 4));
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('gold = shook an odd number of hands', 8, h - 2);
    }
  }));

  /* 3. friend of a friend of a friend: how far the news gets */
  reg('sixDegrees', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.8);
    var steps = 1, shown = 1;
    var MARKS = [
      { n: 1e4, name: 'a small town' },
      { n: 1e6, name: 'a city' },
      { n: 8e9, name: 'everyone alive' }
    ];
    function reach(s) { return Math.pow(100, s); }
    function human(v) {
      if (v >= 1e9) return (v / 1e9) + ' billion';
      if (v >= 1e6) return (v / 1e6) + ' million';
      return commas(v);
    }
    function render() {
      var r = reach(steps);
      out.innerHTML = '<b>' + steps + '</b> step' + (steps === 1 ? '' : 's') +
        ' &nbsp;·&nbsp; <b>' + human(r) + '</b> people' +
        (r >= 8e9 ? ' &nbsp;·&nbsp; <span style="color:#d29922">more than the planet holds</span>' : '');
    }
    K.slider(ctr, { min: 1, max: 6, step: 1, value: 1, label: 'steps of friend-of-a-friend' },
      function (v) { steps = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      shown += (steps - shown) * 0.16;
      var cx = w / 2, cy = h * 0.36, maxR = Math.min(w * 0.46, h * 0.33);
      var s, j;
      for (s = 6; s >= 1; s--) {
        var grown = clamp(shown - s + 1, 0, 1);
        if (grown <= 0) continue;
        var rr = maxR * (s / 6) * grown;
        var dots = Math.min(6 + s * 7, 44);
        g.strokeStyle = 'rgba(88,166,255,0.16)'; g.lineWidth = 1;
        g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke();
        for (j = 0; j < dots; j++) {
          var ang = j * 2 * Math.PI / dots + s * 0.4;
          g.beginPath();
          g.arc(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang) * 0.82, 2.6, 0, 7);
          g.fillStyle = s <= steps ? 'rgba(88,166,255,0.85)' : 'rgba(88,166,255,0.25)';
          g.fill();
        }
      }
      g.beginPath(); g.arc(cx, cy, 5.5, 0, 7); g.fillStyle = C.gold; g.fill();

      /* the ladder along the bottom: each notch is a hundred times the last */
      var y = h - 30, x0 = 16, x1 = w - 16, TOP = 12;
      g.fillStyle = '#1c232c'; roundRect(g, x0, y, x1 - x0, 10, 5); g.fill();
      var lg = Math.log(reach(shown)) / Math.LN10;
      g.fillStyle = C.accent;
      roundRect(g, x0, y, Math.max(3, (x1 - x0) * clamp(lg / TOP, 0, 1)), 10, 5); g.fill();
      g.font = f(9.5, 600);
      for (j = 0; j < MARKS.length; j++) {
        var mx = x0 + (x1 - x0) * (Math.log(MARKS[j].n) / Math.LN10) / TOP;
        g.strokeStyle = 'rgba(139,148,158,0.5)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(mx, y - 4); g.lineTo(mx, y + 14); g.stroke();
        g.fillStyle = reach(steps) >= MARKS[j].n ? C.gold : C.muted;
        g.textAlign = j === MARKS.length - 1 ? 'right' : 'center';
        g.fillText(MARKS[j].name, clamp(mx, x0 + 20, x1), y + 25);
      }
    };
    return { destroy: stage.destroy };
  });

  /* 4. six at a party: flip every link, try to dodge a matching trio */
  reg('ramseyParty', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.98);
    var NAMES = ['Ana', 'Ben', 'Cal', 'Dee', 'Eve', 'Fin'];
    var n = 6, link = {}, hit = null, pts = [];

    function key(a, b) { return Math.min(a, b) + '-' + Math.max(a, b); }
    function randomise() {
      link = {};
      for (var a = 0; a < 6; a++)
        for (var b = a + 1; b < 6; b++) link[key(a, b)] = Math.random() < 0.5 ? 1 : 0;
      check();
    }
    function check() {
      hit = null;
      for (var a = 0; a < n; a++)
        for (var b = a + 1; b < n; b++)
          for (var c = b + 1; c < n; c++) {
            var x = link[key(a, b)], y = link[key(a, c)], z = link[key(b, c)];
            if (x === y && y === z) { hit = { t: [a, b, c], kind: x }; return; }
          }
    }
    function render() {
      if (hit) {
        out.innerHTML = '<span style="color:#d29922;font-weight:700">' +
          NAMES[hit.t[0]] + ', ' + NAMES[hit.t[1]] + ' and ' + NAMES[hit.t[2]] + '</span> are all ' +
          (hit.kind ? 'strangers' : 'friends') + ' — a trio.';
      } else {
        out.innerHTML = '<b>' + n + ' people</b> &nbsp;·&nbsp; no trio yet. Keep flipping links.';
      }
    }
    K.button(ctr, 'Try 5 people', function () {
      n = n === 6 ? 5 : 6;
      this.textContent = n === 6 ? 'Try 5 people' : 'Back to 6 people';
      check(); render(); api.onInteract('size');
    }).classList.add('small');
    K.button(ctr, 'Shuffle links', function () {
      randomise(); render(); api.onInteract('shuffle');
    }).classList.add('small');
    randomise(); render();

    function onTap(ev) {
      var p = stage.pointer(ev), best = null, bd = 1e9;
      for (var a = 0; a < n; a++)
        for (var b = a + 1; b < n; b++) {
          var d = distToSeg(p.x, p.y, pts[a][0], pts[a][1], pts[b][0], pts[b][1]);
          if (d < bd) { bd = d; best = [a, b]; }
        }
      if (best && bd < 16) {
        link[key(best[0], best[1])] = link[key(best[0], best[1])] ? 0 : 1;
        check(); render(); api.onInteract('link');
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      var cx = w / 2, cy = h / 2 - 6, R = Math.min(w, h) * 0.37, i, j;
      pts = [];
      for (i = 0; i < n; i++) {
        var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
        pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
      }
      for (i = 0; i < n; i++)
        for (j = i + 1; j < n; j++) {
          var stranger = link[key(i, j)];
          var inTrio = hit && hit.t.indexOf(i) >= 0 && hit.t.indexOf(j) >= 0;
          g.strokeStyle = inTrio ? C.gold : (stranger ? 'rgba(139,148,158,0.35)' : 'rgba(88,166,255,0.8)');
          g.lineWidth = inTrio ? 3.4 : 2;
          g.setLineDash(stranger ? [4, 4] : []);
          g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke();
          g.setLineDash([]);
        }
      for (i = 0; i < n; i++) {
        g.beginPath(); g.arc(pts[i][0], pts[i][1], 16, 0, 7);
        g.fillStyle = C.panel; g.fill();
        g.strokeStyle = hit && hit.t.indexOf(i) >= 0 ? C.gold : C.dim;
        g.lineWidth = 2; g.stroke();
        g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(NAMES[i].charAt(0), pts[i][0], pts[i][1] + 4);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('solid = friends · dashed = strangers · tap a link to flip it', 8, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* =======================================================================
   * u9l2 — wiring it up
   * ======================================================================= */

  /* 5. the timetable: give every exam a slot and try to kill every clash */
  var EX = DATA.examClashes || { exams: [], pos: [], clashes: [] };
  reg('examColouring', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.95);
    var SLOT_COLOUR = [C.accent, C.gold, '#3fb950'];
    var SLOT_NAME = ['slot 1', 'slot 2', 'slot 3'];
    var slots = 2, colour = [], boxes = [];

    function reset() {
      colour = [];
      for (var i = 0; i < EX.exams.length; i++) colour.push(i % slots);
      render();
    }
    function clashes() {
      var c = 0;
      for (var i = 0; i < EX.clashes.length; i++)
        if (colour[EX.clashes[i][0]] === colour[EX.clashes[i][1]]) c++;
      return c;
    }
    function render() {
      var c = clashes();
      out.innerHTML = '<b>' + slots + ' slots</b> &nbsp;·&nbsp; ' + (c === 0
        ? '<span style="color:#3fb950;font-weight:700">no clashes — this timetable works</span>'
        : '<b>' + c + '</b> clash' + (c === 1 ? '' : 'es') + ' left');
    }
    var b2 = K.button(ctr, '2 slots', function () { slots = 2; reset(); api.onInteract('slots'); });
    var b3 = K.button(ctr, '3 slots', function () { slots = 3; reset(); api.onInteract('slots'); });
    b2.classList.add('small'); b3.classList.add('small');
    reset();

    function onTap(ev) {
      var p = stage.pointer(ev);
      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        if (p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]) {
          colour[i] = (colour[i] + 1) % slots;
          render(); api.onInteract('exam');
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var bw = Math.min(96, w * 0.28), bh = 30;
      var pad = bw / 2 + 6, padY = bh / 2 + 12;
      boxes = [];
      var cxs = [], cys = [], i;
      for (i = 0; i < EX.pos.length; i++) {
        cxs.push(pad + EX.pos[i][0] * (w - pad * 2));
        cys.push(padY + EX.pos[i][1] * (h - padY * 2 - 12));
        boxes.push([cxs[i] - bw / 2, cys[i] - bh / 2, bw, bh]);
      }
      for (i = 0; i < EX.clashes.length; i++) {
        var a = EX.clashes[i][0], b = EX.clashes[i][1];
        var bad = colour[a] === colour[b];
        g.strokeStyle = bad ? C.bad : 'rgba(139,148,158,0.35)';
        g.lineWidth = bad ? 3 : 1.5;
        g.beginPath(); g.moveTo(cxs[a], cys[a]); g.lineTo(cxs[b], cys[b]); g.stroke();
      }
      for (i = 0; i < EX.exams.length; i++) {
        var col = SLOT_COLOUR[colour[i]];
        g.fillStyle = col;
        roundRect(g, boxes[i][0], boxes[i][1], bw, bh, 8); g.fill();
        g.fillStyle = '#0d1117';
        g.font = f(Math.min(12, bw * 0.145), 700); g.textAlign = 'center';
        g.fillText(EX.exams[i], cxs[i], cys[i] - 1);
        g.font = f(8.5, 600);
        g.fillText(SLOT_NAME[colour[i]], cxs[i], cys[i] + 10);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('tap an exam to move it to the next slot', 8, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* 6. the cables: lay them yourself and watch the bill */
  var CN = DATA.cableNetwork || { offices: [], pos: [], cables: [] };
  reg('cableNetwork', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.92);
    var on = [], pts = [];
    for (var ci = 0; ci < CN.cables.length; ci++) on.push(false);

    function total() {
      var t = 0;
      for (var i = 0; i < on.length; i++) if (on[i]) t += CN.cables[i][2];
      return t;
    }
    function chosen() {
      var e = [];
      for (var i = 0; i < on.length; i++) if (on[i]) e.push([CN.cables[i][0], CN.cables[i][1]]);
      return e;
    }
    function render() {
      var p = pieces(CN.offices.length, chosen()), laid = chosen().length;
      out.innerHTML = '<b>' + laid + '</b> cable' + (laid === 1 ? '' : 's') +
        ' &nbsp;·&nbsp; <b>' + total() + ' miles</b> &nbsp;·&nbsp; ' + (p === 1
          ? '<span style="color:#3fb950;font-weight:700">all six connected</span>'
          : 'still in <b>' + p + '</b> pieces');
    }
    K.button(ctr, 'Lift them all', function () {
      for (var i = 0; i < on.length; i++) on[i] = false;
      render(); api.onInteract('clear');
    }).classList.add('small');
    render();

    function onTap(ev) {
      var p = stage.pointer(ev), best = -1, bd = 1e9;
      for (var i = 0; i < CN.cables.length; i++) {
        var a = CN.cables[i][0], b = CN.cables[i][1];
        var d = distToSeg(p.x, p.y, pts[a][0], pts[a][1], pts[b][0], pts[b][1]);
        if (d < bd) { bd = d; best = i; }
      }
      if (best >= 0 && bd < 18) { on[best] = !on[best]; render(); api.onInteract('cable'); }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var pad = 24, i;
      pts = [];
      for (i = 0; i < CN.pos.length; i++) {
        pts.push([pad + CN.pos[i][0] * (w - pad * 2), pad + CN.pos[i][1] * (h - pad * 2 - 10)]);
      }
      for (i = 0; i < CN.cables.length; i++) {
        var a = CN.cables[i][0], b = CN.cables[i][1], cost = CN.cables[i][2];
        g.strokeStyle = on[i] ? C.accent : 'rgba(139,148,158,0.28)';
        g.lineWidth = on[i] ? 3.2 : 1.2;
        g.setLineDash(on[i] ? [] : [3, 4]);
        g.beginPath(); g.moveTo(pts[a][0], pts[a][1]); g.lineTo(pts[b][0], pts[b][1]); g.stroke();
        g.setLineDash([]);
        var mx = (pts[a][0] + pts[b][0]) / 2, my = (pts[a][1] + pts[b][1]) / 2;
        g.fillStyle = on[i] ? C.accent : '#1c232c';
        roundRect(g, mx - 11, my - 8, 22, 16, 5); g.fill();
        g.fillStyle = on[i] ? '#0d1117' : C.muted;
        g.font = f(10.5, 700); g.textAlign = 'center';
        g.fillText(String(cost), mx, my + 4);
      }
      for (i = 0; i < CN.offices.length; i++) {
        g.beginPath(); g.arc(pts[i][0], pts[i][1], 15, 0, 7);
        g.fillStyle = C.panel; g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 2; g.stroke();
        g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(CN.offices[i], pts[i][0], pts[i][1] + 4);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('tap a cable to lay it or lift it · numbers are miles', 8, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* 7. the postman's round: a street map you can count at */
  var PM = DATA.postmanMap || { junctions: [], streets: [], finishAt: '' };
  var pmAt = {};
  for (var pi = 0; pi < PM.junctions.length; pi++) pmAt[PM.junctions[pi].id] = pi;
  function pmDegree(id) {
    var d = 0;
    for (var i = 0; i < PM.streets.length; i++)
      if (PM.streets[i][0] === id || PM.streets[i][1] === id) d++;
    return d;
  }
  reg('postmanRound', LAB.picture({
    aspect: 1.0,
    readout: function (id) {
      if (!id) return 'Tap a junction to count the streets meeting there.';
      var j = PM.junctions[pmAt[id]], d = pmDegree(id);
      return '<b>' + j.name + '</b> &nbsp;·&nbsp; <b>' + d + '</b> street' + (d === 1 ? '' : 's') +
        ' meet' + (d === 1 ? 's' : '') + ' here' + (id === PM.finishAt ? ' &nbsp;·&nbsp; the finish' : '');
    },
    hitTest: function (x, y, w, h) {
      var pad = 30, best = null, bd = 1e9;
      for (var i = 0; i < PM.junctions.length; i++) {
        var j = PM.junctions[i];
        var jx = pad + j.x * (w - pad * 2), jy = pad + j.y * (h - pad * 2 - 10);
        var d = Math.sqrt((x - jx) * (x - jx) + (y - jy) * (y - jy));
        if (d < bd) { bd = d; best = j.id; }
      }
      return bd < 30 ? best : null;
    },
    draw: function (g, w, h, sel) {
      var pad = 30, i;
      function JX(j) { return pad + j.x * (w - pad * 2); }
      function JY(j) { return pad + j.y * (h - pad * 2 - 10); }
      for (i = 0; i < PM.streets.length; i++) {
        var a = PM.junctions[pmAt[PM.streets[i][0]]], b = PM.junctions[pmAt[PM.streets[i][1]]];
        g.strokeStyle = 'rgba(139,148,158,0.55)'; g.lineWidth = 6;
        g.beginPath(); g.moveTo(JX(a), JY(a)); g.lineTo(JX(b), JY(b)); g.stroke();
        g.strokeStyle = '#0d1117'; g.lineWidth = 1.4;
        g.setLineDash([5, 5]);
        g.beginPath(); g.moveTo(JX(a), JY(a)); g.lineTo(JX(b), JY(b)); g.stroke();
        g.setLineDash([]);
      }
      for (i = 0; i < PM.junctions.length; i++) {
        var j = PM.junctions[i], isSel = sel === j.id, isEnd = j.id === PM.finishAt;
        g.beginPath(); g.arc(JX(j), JY(j), isSel ? 15 : 12, 0, 7);
        g.fillStyle = isSel ? C.accent : (isEnd ? C.gold : C.panel);
        g.fill();
        g.strokeStyle = isSel ? C.accent : C.dim; g.lineWidth = 2; g.stroke();
        g.fillStyle = isSel || isEnd ? '#0d1117' : C.muted;
        g.font = f(10, 700); g.textAlign = 'center';
        if (isSel) g.fillText(String(pmDegree(j.id)), JX(j), JY(j) + 4);
        g.fillStyle = isSel ? C.fg : C.muted; g.font = f(10.5, 600);
        g.fillText(j.name, JX(j), JY(j) + (j.y > 0.55 ? 28 : -18));
      }
      g.fillStyle = C.gold; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('gold = the Market, where he must finish', 8, h - 2);
    }
  }));

  /* 8. random cables until twenty offices are one network */
  reg('randomWiring', LAB.sim({
    trial: function () {
      var n = 20, par = [], i;
      for (i = 0; i < n; i++) par.push(i);
      function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
      var left = n, count = 0;
      while (left > 1) {
        var a = pickInt(n), b = pickInt(n);
        if (a === b) continue;
        count++;
        var ra = find(a), rb = find(b);
        if (ra !== rb) { par[ra] = rb; left--; }
      }
      return count;
    },
    label: 'cables', mode: 'hist', min: 15, max: 80, step: 1,
    batches: [50, 2000], perFrame: 120, dp: 1,
    axisLabel: 'cables laid before all twenty are connected',
    emptyHint: 'press run to wire it up',
    idle: 'Nothing wired yet.'
  }));

  /* 9. a ring of villages, plus a few random shortcuts */
  var RS = DATA.ringShortcuts || { villages: 24, shortcuts: [] };
  function ringEdges(upTo) {
    var e = [], i;
    for (i = 0; i < RS.villages; i++) e.push([i, (i + 1) % RS.villages]);
    for (i = 0; i < upTo; i++) e.push([RS.shortcuts[i][0], RS.shortcuts[i][1]]);
    return e;
  }
  reg('ringShortcuts', LAB.steps({
    n: RS.shortcuts.length, aspect: 0.95, playLabel: 'Add a shortcut', everyMs: 900,
    caption: function (i) {
      return '<b>' + i + '</b> shortcut' + (i === 1 ? '' : 's') +
        ' &nbsp;·&nbsp; a typical trip is <b>' +
        averageHops(RS.villages, ringEdges(i)).toFixed(1) + '</b> hops';
    },
    draw: function (g, w, h, i) {
      var cx = w / 2, cy = h / 2 - 4, R = Math.min(w, h) * 0.40, k;
      function vx(j) { return cx + R * Math.cos(-Math.PI / 2 + j * 2 * Math.PI / RS.villages); }
      function vy(j) { return cy + R * Math.sin(-Math.PI / 2 + j * 2 * Math.PI / RS.villages); }
      g.strokeStyle = 'rgba(139,148,158,0.5)'; g.lineWidth = 1.6;
      g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
      for (k = 0; k < i; k++) {
        var s = RS.shortcuts[k];
        g.strokeStyle = k === i - 1 ? C.gold : 'rgba(210,153,34,0.6)';
        g.lineWidth = k === i - 1 ? 3 : 2;
        g.beginPath(); g.moveTo(vx(s[0]), vy(s[0])); g.lineTo(vx(s[1]), vy(s[1])); g.stroke();
      }
      for (k = 0; k < RS.villages; k++) {
        g.beginPath(); g.arc(vx(k), vy(k), 5.5, 0, 7);
        g.fillStyle = C.accent; g.fill();
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('24 villages, joined only to their neighbours', 8, h - 2);
    }
  }));

  /* =======================================================================
   * u10l1 — the fewest moves
   * ======================================================================= */

  /* 10. five cards, one comparison at a time */
  reg('cardCompare', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.82);
    var N = 5, LET = ['A', 'B', 'C', 'D', 'E'];
    var val = [], rel = [], picked = -1, cmps = 0, rects = [];

    function deal() {
      val = shuffle([1, 2, 3, 4, 5]);
      rel = [];
      for (var i = 0; i < N; i++) {
        rel.push([]);
        for (var j = 0; j < N; j++) rel[i].push(0);
      }
      picked = -1; cmps = 0;
      render();
    }
    function closure() {
      var changed = true, i, j, k;
      while (changed) {
        changed = false;
        for (k = 0; k < N; k++)
          for (i = 0; i < N; i++)
            if (rel[i][k])
              for (j = 0; j < N; j++)
                if (rel[k][j] && !rel[i][j]) { rel[i][j] = 1; changed = true; }
      }
    }
    function below(i) {
      var c = 0;
      for (var j = 0; j < N; j++) if (rel[j][i]) c++;
      return c;
    }
    function knownPairs() {
      var c = 0, i, j;
      for (i = 0; i < N; i++)
        for (j = i + 1; j < N; j++) if (rel[i][j] || rel[j][i]) c++;
      return c;
    }
    function render() {
      var k = knownPairs();
      if (k === 10) {
        out.innerHTML = 'Fully sorted in <b>' + cmps + '</b> comparison' + (cmps === 1 ? '' : 's') +
          '. Shuffle and try for fewer.';
      } else {
        out.innerHTML = '<b>' + cmps + '</b> comparison' + (cmps === 1 ? '' : 's') +
          ' &nbsp;·&nbsp; <b>' + (10 - k) + '</b> pair' + ((10 - k) === 1 ? '' : 's') + ' still unknown';
      }
    }
    K.button(ctr, 'Shuffle', function () { deal(); api.onInteract('shuffle'); }).classList.add('small');
    deal();

    function onTap(ev) {
      var p = stage.pointer(ev), i;
      for (i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] - 12 && p.y <= r[1] + r[3] + 12) {
          if (picked < 0) { picked = i; }
          else if (picked === i) { picked = -1; }
          else {
            if (!rel[picked][i] && !rel[i][picked]) {
              if (val[picked] < val[i]) rel[picked][i] = 1; else rel[i][picked] = 1;
              closure();
              cmps++;
            }
            picked = -1;
          }
          render(); api.onInteract('compare');
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var cw = Math.min(46, (w - 24) / N - 8), ch = cw * 1.35;
      var gap = (w - 24 - cw * N) / (N - 1);
      var rowH = Math.max(14, (h - ch - 34) / 4);
      rects = [];
      for (var i = 0; i < N; i++) {
        var x = 12 + i * (cw + gap);
        var y = h - 26 - ch - below(i) * rowH;
        rects.push([x, y, cw, ch]);
        g.fillStyle = picked === i ? C.accent : C.panel;
        roundRect(g, x, y, cw, ch, 7); g.fill();
        g.strokeStyle = picked === i ? C.accent : C.dim; g.lineWidth = 2; g.stroke();
        g.fillStyle = picked === i ? '#0d1117' : C.fg;
        g.font = f(15, 800); g.textAlign = 'center';
        g.fillText(LET[i], x + cw / 2, y + ch / 2 + 5);
        g.fillStyle = C.muted; g.font = f(9, 600);
        g.fillText(below(i) ? below(i) + ' below' : '', x + cw / 2, y + ch - 6);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('tap two cards to compare · a card climbs as it beats others', 8, h - 2);
    };
    return { destroy: stage.destroy };
  });

  /* 11. twelve coins: how to split a weighing */
  reg('coinWeighing', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.8);
    var k = 2, shown = 2;

    function worst(kk) { return Math.max(2 * kk, 2 * (12 - 2 * kk)); }
    function render() {
      out.innerHTML = '<b>' + k + '</b> coin' + (k === 1 ? '' : 's') + ' on each pan &nbsp;·&nbsp; ' +
        'worst case <b>' + worst(k) + '</b> of the 24 possibilities survive';
    }
    K.slider(ctr, { min: 1, max: 6, step: 1, value: 2, label: 'coins on each pan' },
      function (v) { k = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      shown += (k - shown) * 0.25;
      var i, r = 9;
      /* the two pans and the coins left out */
      function pan(x0, label, count) {
        g.fillStyle = C.panel; roundRect(g, x0, 30, w * 0.30, 54, 8); g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
        g.fillText(label, x0 + w * 0.15, 24);
        for (i = 0; i < count; i++) {
          var cx = x0 + 16 + (i % 3) * 22, cy = 46 + Math.floor(i / 3) * 22;
          g.beginPath(); g.arc(cx, cy, r, 0, 7);
          g.fillStyle = C.gold; g.fill();
        }
      }
      pan(w * 0.06, 'left pan', k);
      pan(w * 0.64, 'right pan', k);
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('left out', w / 2, 24);
      for (i = 0; i < 12 - 2 * k; i++) {
        var ox = w / 2 - 22 + (i % 3) * 22, oy = 40 + Math.floor(i / 3) * 20;
        g.beginPath(); g.arc(ox, oy, 7.5, 0, 7);
        g.fillStyle = 'rgba(139,148,158,0.5)'; g.fill();
      }
      /* what each of the three outcomes would leave standing */
      var outs = [
        { name: 'it tips left', v: 2 * k },
        { name: 'it balances', v: 2 * (12 - 2 * k) },
        { name: 'it tips right', v: 2 * k }
      ];
      var top = h - 74, bw = (w - 40) / 3, mx = worst(k);
      for (i = 0; i < 3; i++) {
        var bx = 16 + i * (bw + 4);
        var bh = 34 * (outs[i].v / 24);
        g.fillStyle = '#1c232c'; roundRect(g, bx, top, bw - 4, 34, 5); g.fill();
        g.fillStyle = outs[i].v === mx ? C.gold : 'rgba(88,166,255,0.7)';
        roundRect(g, bx, top + 34 - bh, bw - 4, Math.max(2, bh), 5); g.fill();
        g.fillStyle = C.fg; g.font = f(11, 800); g.textAlign = 'center';
        g.fillText(String(outs[i].v), bx + (bw - 4) / 2, top + 50);
        g.fillStyle = C.muted; g.font = f(9, 600);
        g.fillText(outs[i].name, bx + (bw - 4) / 2, top + 62);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('possibilities still standing after one weighing', 16, top - 6);
    };
    return { destroy: stage.destroy };
  });

  /* 12. twenty-seven coins, the fake is heavy: thirds, thirds, thirds */
  reg('ternarySplit', LAB.steps({
    n: 3, aspect: 0.8, playLabel: 'Weigh', everyMs: 900,
    init: function () { return { fake: pickInt(27) }; },
    caption: function (i, st) {
      var live = Math.round(27 / Math.pow(3, i));
      return i === 0
        ? '<b>27 coins</b> &nbsp;·&nbsp; any one of them could be the heavy one'
        : '<b>' + i + '</b> weighing' + (i === 1 ? '' : 's') + ' &nbsp;·&nbsp; <b>' + live +
          '</b> coin' + (live === 1 ? '' : 's') + ' still in play';
    },
    draw: function (g, w, h, i, t, st) {
      var live = Math.round(27 / Math.pow(3, i));
      var block = Math.floor(st.fake / live) * live;
      var cols = 9, size = Math.min((w - 40) / cols, (h - 60) / 3);
      var ox = (w - size * cols) / 2, oy = 26;
      for (var c = 0; c < 27; c++) {
        var x = ox + (c % cols) * size + size / 2, y = oy + Math.floor(c / cols) * size + size / 2;
        var alive = c >= block && c < block + live;
        g.beginPath(); g.arc(x, y, size * 0.36, 0, 7);
        g.fillStyle = alive ? C.gold : '#1c232c'; g.fill();
        if (!alive) { g.strokeStyle = C.dim; g.lineWidth = 1; g.stroke(); }
      }
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText(i === 0 ? 'split them into three nines and weigh two of them'
        : 'gold = the pile the fake is still hiding in', w / 2, oy + size * 3 + 22);
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('each weighing throws away two thirds', 8, h - 2);
    }
  }));

  /* 13. two eggs, a hundred floors: pick where to start */
  function eggWorstFrom(first) {
    /* with two eggs and n floors left, the best worst case is the smallest t
     * whose 1+2+...+t reaches n — worked out here rather than asserted */
    function two(n) {
      var t = 0;
      while (t * (t + 1) / 2 < n) t++;
      return t;
    }
    return Math.max(first, 1 + two(100 - first));
  }
  var EGG_FLOORS = [5, 14, 34, 50];
  reg('eggDrops', LAB.picture({
    aspect: 1.05,
    readout: function (id) {
      if (!id) return 'Tap a floor to see the worst case it leads to.';
      var fl = parseInt(id.replace('floor', ''), 10);
      return 'First drop from <b>floor ' + fl + '</b> &nbsp;·&nbsp; worst case <b>' +
        eggWorstFrom(fl) + '</b> drops in all';
    },
    hitTest: function (x, y, w, h) {
      var best = null, bd = 1e9;
      for (var i = 0; i < EGG_FLOORS.length; i++) {
        var fy = h - 24 - (EGG_FLOORS[i] / 100) * (h - 48);
        if (Math.abs(y - fy) < bd) { bd = Math.abs(y - fy); best = 'floor' + EGG_FLOORS[i]; }
      }
      return bd < 24 ? best : null;
    },
    draw: function (g, w, h, sel) {
      var bx = 20, bw = w * 0.42, base = h - 24, top = 24, i;
      function fy(fl) { return base - (fl / 100) * (base - top); }
      g.fillStyle = C.panel; roundRect(g, bx, top, bw, base - top, 6); g.fill();
      g.strokeStyle = C.dim; g.lineWidth = 1; g.stroke();
      for (i = 10; i < 100; i += 10) {
        g.strokeStyle = 'rgba(48,54,61,0.9)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(bx, fy(i)); g.lineTo(bx + bw, fy(i)); g.stroke();
      }
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'right';
      g.fillText('100', bx - 4, top + 4);
      g.fillText('1', bx - 4, base);
      for (i = 0; i < EGG_FLOORS.length; i++) {
        var fl = EGG_FLOORS[i], on = sel === 'floor' + fl;
        g.strokeStyle = on ? C.gold : 'rgba(88,166,255,0.6)';
        g.lineWidth = on ? 3 : 2;
        g.beginPath(); g.moveTo(bx, fy(fl)); g.lineTo(bx + bw + 10, fy(fl)); g.stroke();
        g.fillStyle = on ? C.gold : C.muted; g.font = f(10.5, on ? 800 : 600); g.textAlign = 'left';
        g.fillText('floor ' + fl + (on ? ' — worst case ' + eggWorstFrom(fl) + ' drops' : ''),
          bx + bw + 16, fy(fl) + 4);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('two eggs · one hundred floors', 8, h - 2);
    }
  }));

  /* =======================================================================
   * u10l2 — how the work grows
   * ======================================================================= */

  /* 14. one second at a thousand records, and then what */
  reg('growthCurves', LAB.dial({
    min: 1, max: 100, step: 1, value: 20, aspect: 0.7,
    label: 'thousands of records',
    f: function (x) { return x * x; },
    f2: function (x) { return x; },
    ymin: 0,
    xmin: '1,000', xmax: '100,000',
    yLabel: 'how long it runs',
    readout: function (x, y) {
      return '<b>' + commas(Math.round(x) * 1000) + '</b> records &nbsp;·&nbsp; <b>' +
        humanTime(y) + '</b> &nbsp;·&nbsp; <span style="color:#d29922">if it grew in step: ' +
        humanTime(x) + '</span>';
    }
  }));

  /* 15. a hundred parcels into a hundred pigeonholes */
  reg('hashBins', LAB.sim({
    trial: function () {
      var b = [], i, m = 0;
      for (i = 0; i < 100; i++) b.push(0);
      for (i = 0; i < 100; i++) b[pickInt(100)]++;
      for (i = 0; i < 100; i++) if (b[i] > m) m = b[i];
      return m;
    },
    label: 'in the fullest hole', mode: 'hist', min: 1, max: 9, step: 1,
    batches: [20, 1000], perFrame: 40, dp: 2,
    axisLabel: 'how full the fullest pigeonhole ended up',
    emptyHint: 'press run to drop a hundred parcels',
    idle: 'Nothing dropped yet.'
  }));

  /* 16. the same staircase, with and without a notebook */
  function naiveWork(n) {
    if (n <= 2) return 1;
    var a = 1, b = 1, c, i;
    for (i = 3; i <= n; i++) { c = 1 + a + b; a = b; b = c; }
    return b;
  }
  reg('memoWork', LAB.dial({
    min: 2, max: 40, step: 1, value: 14, aspect: 0.7,
    label: 'steps in the staircase',
    f: function (x) { return naiveWork(Math.round(x)); },
    f2: function (x) { return Math.round(x); },
    ymin: 0,
    xmin: '2 steps', xmax: '40 steps',
    yLabel: 'pieces of work',
    readout: function (x, y) {
      return '<b>' + Math.round(x) + ' steps</b> &nbsp;·&nbsp; from scratch <b>' +
        commas(y) + '</b> pieces of work &nbsp;·&nbsp; ' +
        '<span style="color:#d29922">with a notebook ' + Math.round(x) + '</span>';
    }
  }));

  /* 17. a hundred cores and one stubborn hour */
  reg('coreScaling', LAB.dial({
    min: 1, max: 100, step: 1, value: 5, aspect: 0.7,
    label: 'how many cores',
    f: function (x) { return 1 + 9 / x; },
    ymin: 0,
    xmin: '1 core', xmax: '100 cores',
    yLabel: 'hours the job takes',
    readout: function (x, y) {
      var n = Math.round(x);
      return '<b>' + n + ' core' + (n === 1 ? '' : 's') + '</b> &nbsp;·&nbsp; <b>' +
        y.toFixed(2) + ' hours</b> &nbsp;·&nbsp; that is ' + (10 / y).toFixed(1) + '× faster';
    }
  }));

  /* 18. five jobs on one growing pile of names */
  reg('growthLadder', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.86);
    var n = 100, shown = 100;
    var ROWS = [
      { name: 'find one name (sorted)', v: function (m) { return Math.ceil(Math.log(m) / Math.LN2); } },
      { name: 'read every name', v: function (m) { return m; } },
      { name: 'sort the names', v: function (m) { return m * Math.ceil(Math.log(m) / Math.LN2); } },
      { name: 'compare every pair', v: function (m) { return m * (m - 1) / 2; } },
      { name: 'try every order', v: function (m) { return logFactorial(m); } }
    ];
    /* the factorial row is kept as a power of ten — nothing else can hold it */
    function logFactorial(m) {
      var s = 0;
      for (var i = 2; i <= m; i++) s += Math.log(i) / Math.LN10;
      return s;
    }
    function big(row, m) {
      if (row === 4) {
        var lg = logFactorial(m);
        if (lg > 15) return 'a 1 with ' + Math.round(lg) + ' zeros after it';
        return commas(Math.pow(10, lg));
      }
      return commas(ROWS[row].v(m));
    }
    function lg10(row, m) {
      if (row === 4) return logFactorial(m);
      return Math.log(Math.max(1, ROWS[row].v(m))) / Math.LN10;
    }
    function render() {
      out.innerHTML = '<b>' + commas(n) + '</b> names &nbsp;·&nbsp; ' +
        'looking one up takes <b>' + big(0, n) + '</b> steps, trying every order takes <b>' +
        big(4, n) + '</b>';
    }
    K.slider(ctr, { min: 10, max: 1000, step: 10, value: 100, label: 'how many names' },
      function (v) { n = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      shown += (n - shown) * 0.2;
      var m = Math.max(10, Math.round(shown));
      var TOP = 12, rowH = (h - 24) / ROWS.length;
      for (var i = 0; i < ROWS.length; i++) {
        var y = 6 + i * rowH;
        g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
        g.fillText(ROWS[i].name, 10, y + 11);
        var bx = 10, bw = w - 20, bh = Math.min(13, rowH * 0.34);
        g.fillStyle = '#1c232c'; roundRect(g, bx, y + 16, bw, bh, 4); g.fill();
        var frac = clamp(lg10(i, m) / TOP, 0.01, 1);
        g.fillStyle = LAB.util.SERIES[i % LAB.util.SERIES.length];
        roundRect(g, bx, y + 16, Math.max(3, bw * frac), bh, 4); g.fill();
        g.fillStyle = C.fg; g.font = f(9.5, 700); g.textAlign = 'right';
        g.fillText(big(i, m), w - 12, y + 12);
      }
      g.fillStyle = C.muted; g.font = f(9.5, 500); g.textAlign = 'left';
      g.fillText('each bar step is ten times the work', 10, h - 2);
    };
    return { destroy: stage.destroy };
  });

})(window);
