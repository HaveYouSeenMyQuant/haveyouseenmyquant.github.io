/* QQ visuals — the chance questions (unit 1, plus the counting bars in unit 2).
 *
 * Same house rule as viz.js: animate the thing, don't write the formula. Every
 * visual here is tappable, draggable or re-runnable, and none of them prints the
 * answer before the player has driven the interaction there themselves.
 *
 * Loads after js/viz.js, which owns the kit and the register/mount plumbing.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, el = K.el, clamp = K.clamp, lerp = K.lerp;
  var easeOut = K.easeOut, roundRect = K.roundRect;

  function now() { return performance.now(); }

  /* every simulation here samples for real; nothing is nudged towards the
   * answer, because a rigged demo teaches the wrong lesson */
  function coin() { return Math.random() < 0.5 ? 0 : 1; }
  function pickInt(n) { return Math.floor(Math.random() * n); }

  /* --------------------------------------------------------- 1. dice sums */
  global.QQViz.register('diceSum', function (host, api) {
    var chips = K.controls(host);
    var out = K.readout(host, 'Tap a total.');
    var stage = K.Stage(host, 0.8);
    var sel = -1, selAt = 0;
    var i, a, b;

    var counts = [];
    for (i = 0; i <= 12; i++) counts.push(0);
    for (a = 1; a <= 6; a++) for (b = 1; b <= 6; b++) counts[a + b]++;

    var chipEls = [];
    function pick(total) {
      sel = total; selAt = now();
      chipEls.forEach(function (x) { x.classList.toggle('on', parseInt(x.textContent, 10) === total); });
      out.innerHTML = '<b>' + counts[total] + '</b> of the 36 rolls add to ' + total;
      api.onInteract('chip');
    }
    for (i = 2; i <= 12; i++) {
      (function (total) {
        var c = el('button', 'viz-chip', String(total));
        c.type = 'button';
        c.addEventListener('click', function () { pick(total); });
        chips.appendChild(c);
        chipEls.push(c);
      })(i);
    }

    stage.draw = function (g, w, h) {
      var pad = 26, size = Math.min((w - pad) / 6, (h - pad) / 6);
      var ox = (w - size * 6) / 2 + 6, oy = (h - size * 6) / 2 + 6;
      var r, c2, x, y, total, on, age, k;

      g.font = f(11, 600);
      for (i = 0; i < 6; i++) {
        g.fillStyle = C.muted;
        g.textAlign = 'center';
        g.fillText(String(i + 1), ox + size * (i + 0.5), oy - 8);
        g.textAlign = 'right';
        g.fillText(String(i + 1), ox - 8, oy + size * (i + 0.5) + 4);
      }
      for (r = 0; r < 6; r++) {
        for (c2 = 0; c2 < 6; c2++) {
          total = (r + 1) + (c2 + 1);
          on = total === sel;
          x = ox + c2 * size; y = oy + r * size;
          // stagger down the diagonal, so the band draws itself rather than blinking
          age = (now() - selAt) / 1000 - (r + c2) * 0.02;
          k = on ? easeOut(clamp(age / 0.35, 0, 1)) : 0;
          g.fillStyle = '#1c232c';
          roundRect(g, x + 2, y + 2, size - 4, size - 4, 5);
          g.fill();
          if (k > 0) {
            g.fillStyle = C.accent;
            g.globalAlpha = 0.18 + 0.82 * k;
            roundRect(g, x + 2, y + 2, size - 4, size - 4, 5);
            g.fill();
            g.globalAlpha = 1;
          }
          g.fillStyle = on ? '#0d1117' : '#5b6672';
          g.font = f(Math.max(10, size * 0.3), on ? 700 : 500);
          g.textAlign = 'center';
          g.fillText(String(total), x + size / 2, y + size / 2 + size * 0.11);
        }
      }
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------ 2. three coins */
  global.QQViz.register('coinTriples', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'All eight results. Tap one, or filter by heads.');
    var stage = K.Stage(host, 0.78);
    var rows = [], i;
    var sel = -1, flipAt = -9999, marked = -1;

    // the eight results are fixed — this is the whole sample space, not a sample
    for (i = 0; i < 8; i++) {
      var c0 = (i >> 2) & 1, c1 = (i >> 1) & 1, c2 = i & 1;   // 0 = heads
      rows.push({ c: [c0, c1, c2], heads: 3 - (c0 + c1 + c2) });
    }
    function word(n) { return n === 1 ? '1 head' : n + ' heads'; }

    K.button(ctr, 'Flip all', function () {
      flipAt = now();
      api.onInteract('run');
    }).classList.add('primary');

    var filterEls = [];
    [0, 1, 2, 3].forEach(function (n) {
      var b = K.button(ctr, word(n), function () {
        sel = sel === n ? -1 : n;
        filterEls.forEach(function (x, j) { x.classList.toggle('on', j === sel); });
        marked = -1;
        if (sel < 0) out.textContent = 'All eight results. Tap one, or filter by heads.';
        else {
          var count = 0;
          rows.forEach(function (rw) { if (rw.heads === sel) count++; });
          out.innerHTML = '<b>' + count + '</b> of the 8 results show exactly ' + word(sel);
        }
        api.onInteract('chip');
      });
      b.classList.add('small');
      filterEls.push(b);
    });

    /* geometry lives in one place so the click test and the drawing agree */
    function boxOf(j, w, h) {
      var pad = 8, colW = (w - pad * 3) / 2, rowH = (h - pad * 2) / 4;
      var col = j < 4 ? 0 : 1, r = j % 4;
      return { x: pad + col * (colW + pad), y: pad + r * rowH, w: colW, h: rowH };
    }
    stage.canvas.addEventListener('click', function (ev) {
      var p = stage.pointer(ev), j;
      for (j = 0; j < 8; j++) {
        var bx = boxOf(j, stage.w, stage.h);
        if (p.x >= bx.x && p.x <= bx.x + bx.w && p.y >= bx.y && p.y <= bx.y + bx.h) {
          marked = marked === j ? -1 : j;
          if (marked < 0) out.textContent = 'All eight results. Tap one, or filter by heads.';
          else {
            out.innerHTML = '<b>' + rows[j].c.map(function (v) { return v ? 'T' : 'H'; }).join('') +
              '</b> &nbsp;·&nbsp; ' + word(rows[j].heads);
          }
          api.onInteract('tap');
          return;
        }
      }
    });

    stage.draw = function (g, w, h) {
      var el2 = (now() - flipAt) / 1000;
      var j, ci;
      for (j = 0; j < 8; j++) {
        var bx = boxOf(j, w, h);
        var rw = rows[j];
        var dim = sel >= 0 && rw.heads !== sel;
        var d = Math.min(bx.h * 0.62, bx.w / 3.5);
        var cy = bx.y + bx.h / 2;
        var cx0 = bx.x + bx.w / 2 - (d + 5);

        g.globalAlpha = dim ? 0.2 : 1;
        g.fillStyle = j === marked ? 'rgba(88,166,255,0.10)' : '#1c232c';
        roundRect(g, bx.x + 2, bx.y + 3, bx.w - 4, bx.h - 6, 9);
        g.fill();
        if (j === marked) {
          g.strokeStyle = C.good; g.lineWidth = 2;
          roundRect(g, bx.x + 2, bx.y + 3, bx.w - 4, bx.h - 6, 9);
          g.stroke();
        }
        for (ci = 0; ci < 3; ci++) {
          var cx = cx0 + ci * (d + 5);
          // a short spin: the face is fixed, only the coin turns over
          var phase = (el2 - j * 0.035 - ci * 0.05) / 0.5;
          var sq = 1, hide = false;
          if (phase > 0 && phase < 1) {
            sq = Math.abs(Math.cos(phase * Math.PI * 3));
            hide = sq < 0.34;
            sq = 0.12 + 0.88 * sq;
          }
          var heads = rw.c[ci] === 0;
          g.save();
          g.translate(cx, cy);
          g.scale(sq, 1);
          g.beginPath();
          g.arc(0, 0, d / 2, 0, 7);
          g.fillStyle = heads ? C.accent : C.gold;
          g.fill();
          if (!hide) {
            g.fillStyle = '#0d1117';
            g.font = f(Math.max(10, d * 0.5), 800);
            g.textAlign = 'center';
            g.fillText(heads ? 'H' : 'T', 0, d * 0.18);
          }
          g.restore();
        }
        g.globalAlpha = 1;
      }
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------- 3. two children */
  global.QQViz.register('twoChildren', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.64);
    var fams = [[0, 0], [0, 1], [1, 0], [1, 1]];   // 0 = boy, 1 = girl
    var marks = [false, false, false, false];
    var told = false, toldAt = -9999;

    function label(fm) {
      return (fm[0] ? 'girl' : 'boy') + ' · ' + (fm[1] ? 'girl' : 'boy');
    }
    function render() {
      var m = 0, i;
      for (i = 0; i < 4; i++) if (marks[i]) m++;
      var s = told ? '<b>3</b> families still possible' : 'Four families, all equally likely';
      if (m) s += ' &nbsp;·&nbsp; <b>' + m + '</b> marked';
      out.innerHTML = s;
    }
    var toggle = K.button(ctr, 'Told: at least one is a girl', function () {
      told = !told;
      toldAt = now();
      toggle.textContent = told ? 'Forget what you were told' : 'Told: at least one is a girl';
      toggle.classList.toggle('primary', told);
      render();
      api.onInteract('toggle');
    });
    render();

    function boxOf(i, w, h) {
      var pad = 7, cw = (w - pad * 5) / 4;
      return { x: pad + i * (cw + pad), y: h * 0.15, w: cw, h: h * 0.63 };
    }
    stage.canvas.addEventListener('click', function (ev) {
      var p = stage.pointer(ev), i;
      for (i = 0; i < 4; i++) {
        var bx = boxOf(i, stage.w, stage.h);
        if (p.x >= bx.x && p.x <= bx.x + bx.w && p.y >= bx.y - 8 && p.y <= bx.y + bx.h + 14) {
          marks[i] = !marks[i];
          render();
          api.onInteract('tap');
          return;
        }
      }
    });

    function figure(g, cx, baseY, s, girl, alpha) {
      g.globalAlpha = alpha;
      g.fillStyle = girl ? C.gold : C.accent;
      g.beginPath();
      g.arc(cx, baseY - s * 2.05, s * 0.62, 0, 7);
      g.fill();
      if (girl) {                       // a wider body, so the two read apart at a glance
        g.beginPath();
        g.moveTo(cx, baseY - s * 1.35);
        g.lineTo(cx + s * 0.78, baseY);
        g.lineTo(cx - s * 0.78, baseY);
        g.closePath();
        g.fill();
      } else {
        roundRect(g, cx - s * 0.46, baseY - s * 1.4, s * 0.92, s * 1.4, s * 0.28);
        g.fill();
      }
      g.globalAlpha = 1;
    }

    stage.draw = function (g, w, h) {
      var i, k = told ? easeOut(clamp((now() - toldAt) / 450, 0, 1)) : 0;

      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText('older child on the left', w / 2, 13);

      for (i = 0; i < 4; i++) {
        var bx = boxOf(i, w, h);
        var out2 = told && fams[i][0] === 0 && fams[i][1] === 0;    // boy-boy is the one ruled out
        var fade = out2 ? 1 - 0.72 * k : 1;

        g.fillStyle = '#1c232c';
        roundRect(g, bx.x, bx.y, bx.w, bx.h, 10);
        g.fill();
        g.strokeStyle = marks[i] ? C.good : C.line;
        g.lineWidth = marks[i] ? 2 : 1;
        roundRect(g, bx.x + 0.5, bx.y + 0.5, bx.w - 1, bx.h - 1, 10);
        g.stroke();

        var s = bx.w * 0.24, baseY = bx.y + bx.h * 0.72;
        figure(g, bx.x + bx.w * 0.3, baseY, s, fams[i][0] === 1, fade);
        figure(g, bx.x + bx.w * 0.7, baseY, s, fams[i][1] === 1, fade);

        g.globalAlpha = fade;
        g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
        g.fillText(label(fams[i]), bx.x + bx.w / 2, bx.y + bx.h - 8);
        g.globalAlpha = 1;

        if (out2 && k > 0) {   // the cross draws itself, so you see it being removed
          g.strokeStyle = C.bad; g.lineWidth = 2.5; g.lineCap = 'round';
          var x0 = bx.x + 10, y0 = bx.y + 10, x1 = bx.x + bx.w - 10, y1 = bx.y + bx.h - 10;
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(lerp(x0, x1, clamp(k * 2, 0, 1)), lerp(y0, y1, clamp(k * 2, 0, 1)));
          g.stroke();
          if (k > 0.5) {
            g.beginPath();
            g.moveTo(x1, y0);
            g.lineTo(lerp(x1, x0, (k - 0.5) * 2), lerp(y0, y1, (k - 0.5) * 2));
            g.stroke();
          }
          g.lineCap = 'butt';
        }
      }
      g.fillStyle = '#5b6672'; g.font = f(10, 500); g.textAlign = 'center';
      g.fillText('tap a family to mark it', w / 2, h - 5);
    };
    return { destroy: stage.destroy };
  });

  /* ---------------------------------------------------------- 4. dark socks */
  global.QQViz.register('sockDrawer', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.72);
    var socks = [], pulled = [], matchPair = null, matchAt = 0;
    var rounds = 0, worst = 0;

    function reset() {
      var colours = [], i, j, tmp;
      for (i = 0; i < 20; i++) colours.push(i < 10 ? 0 : 1);
      for (i = colours.length - 1; i > 0; i--) {      // honest shuffle, ten of each
        j = pickInt(i + 1);
        tmp = colours[i]; colours[i] = colours[j]; colours[j] = tmp;
      }
      socks = [];
      for (i = 0; i < 20; i++) socks.push({ slot: i, colour: colours[i], out: false, at: 0, pos: -1 });
      pulled = []; matchPair = null;
      pullBtn.disabled = false; pullBtn.style.opacity = '1';
      startBtn.classList.remove('primary');
      render();
    }
    function render() {
      var s;
      if (matchPair) {
        s = 'matched after <b>' + pulled.length + '</b> socks';
      } else if (pulled.length === 0) {
        s = 'Ten of one colour, ten of the other. Pull one at a time.';
      } else if (pulled.length === 1) {
        s = '<b>1</b> sock out — nothing to match it with yet';
      } else {
        s = '<b>' + pulled.length + '</b> socks out, all different — still no pair';
      }
      if (rounds) s += ' &nbsp;·&nbsp; worst so far <b>' + worst + '</b> over ' + rounds + ' rounds';
      out.innerHTML = s;
    }
    function pull() {
      if (matchPair) return;
      var left = [], i;
      for (i = 0; i < socks.length; i++) if (!socks[i].out) left.push(i);
      if (!left.length) return;
      var pickIdx = left[pickInt(left.length)];
      var sk = socks[pickIdx];
      sk.out = true; sk.at = now(); sk.pos = pulled.length;
      pulled.push(sk);
      // a pair the moment two agree; with two colours the third can never fail
      var seen = {};
      for (i = 0; i < pulled.length; i++) {
        var c = pulled[i].colour;
        if (seen[c] !== undefined) { matchPair = [seen[c], i]; break; }
        seen[c] = i;
      }
      if (matchPair) {
        matchAt = now();
        rounds++;
        if (pulled.length > worst) worst = pulled.length;
        pullBtn.disabled = true; pullBtn.style.opacity = '0.4';
        startBtn.classList.add('primary');
      }
      render();
      api.onInteract('tap');
    }
    var pullBtn = K.button(ctr, 'Pull a sock', pull);
    pullBtn.classList.add('primary');
    var startBtn = K.button(ctr, 'Start again', function () { reset(); api.onInteract('reset'); });
    startBtn.classList.add('small');
    reset();

    function sock(g, x, y, s, fill) {
      g.fillStyle = fill;
      roundRect(g, x - s * 0.5, y - s * 1.6, s, s * 1.75, s * 0.3);
      g.fill();
      roundRect(g, x - s * 0.5, y - s * 0.1, s * 1.5, s * 0.62, s * 0.28);
      g.fill();
      g.fillStyle = 'rgba(230,237,243,0.22)';
      roundRect(g, x - s * 0.5, y - s * 1.6, s, s * 0.34, s * 0.16);
      g.fill();
    }

    stage.draw = function (g, w, h) {
      var pad = 10, i;
      var dw = w - pad * 2, dh = h * 0.44, dy = 16;
      g.fillStyle = '#141a21';
      roundRect(g, pad, dy, dw, dh, 10); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 1;
      roundRect(g, pad + 0.5, dy + 0.5, dw - 1, dh - 1, 10); g.stroke();
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
      g.fillText('the drawer, in the dark', pad + 2, dy - 5);

      var cell = (dw - 16) / 10, s = Math.min(cell * 0.62, dh * 0.2);
      var rowY = h - 34;
      var slots = Math.max(3, pulled.length);
      var step = Math.min(56, (w - pad * 2) / slots);

      for (i = 0; i < socks.length; i++) {
        var sk = socks[i];
        var col = sk.slot % 10, row = (sk.slot / 10) | 0;
        var hx = pad + 8 + (col + 0.5) * cell;
        var hy = dy + dh * (row === 0 ? 0.35 : 0.75);
        if (!sk.out) {
          sock(g, hx, hy, s, C.dim);            // you cannot see a colour in the dark
          continue;
        }
        var k = easeOut(clamp((now() - sk.at) / 380, 0, 1));
        var tx = w / 2 + (sk.pos - (slots - 1) / 2) * step;
        var x = lerp(hx, tx, k), y = lerp(hy, rowY, k);
        var big = lerp(s, Math.min(26, step * 0.42), k);
        var inPair = matchPair && (matchPair[0] === sk.pos || matchPair[1] === sk.pos);
        if (inPair) {
          var puls = 0.45 + 0.35 * Math.sin((now() - matchAt) / 130);
          g.strokeStyle = C.good; g.lineWidth = 2.5;
          g.globalAlpha = puls + 0.2;
          roundRect(g, x - big * 0.85, y - big * 1.95, big * 2.6, big * 2.6, 9);
          g.stroke();
          g.globalAlpha = 1;
        }
        sock(g, x, y, big, sk.colour === 0 ? C.accent : C.gold);
      }
      g.fillStyle = matchPair ? C.good : C.muted;
      g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText(matchPair ? 'a pair' : (pulled.length ? 'pulled out' : 'nothing pulled yet'), w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------------------- 5. birthdays */
  global.QQViz.register('birthdayRoom', function (host, api) {
    var top = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.84);
    var n = 10, rooms = 0, hits = 0;
    var pairs = [], runAt = -9999, ran = false;

    // exact curve: nobody shares, then take the complement
    var P = [0, 0], q = 1, i;
    for (i = 2; i <= 60; i++) { q *= (365 - (i - 1)) / 365; P[i] = 1 - q; }

    function pct(v) { return v >= 0.0995 ? (v * 100).toFixed(0) + '%' : (v * 100).toFixed(1) + '%'; }
    function render() {
      var s = '<b>' + n + '</b> people — the curve says <b>' + pct(P[n]) + '</b>';
      if (rooms) s += ' &nbsp;·&nbsp; matched in <b>' + hits + '</b> of ' + rooms + ' rooms';
      out.innerHTML = s;
    }
    K.slider(top, { min: 2, max: 60, step: 1, value: 10, label: 'people in the room' }, function (v) {
      n = v; pairs = []; ran = false;
      render();
      api.onInteract('slider');
    });
    var runRow = K.controls(host);
    host.insertBefore(runRow, stage.canvas);
    K.button(runRow, 'Run a room', function () {
      var days = [], j, kx, found = [];
      for (j = 0; j < n; j++) days.push(pickInt(365));
      for (j = 0; j < n; j++) for (kx = j + 1; kx < n; kx++) if (days[j] === days[kx]) found.push([j, kx]);
      pairs = found.slice(0, 14);
      rooms++;
      if (found.length) hits++;
      ran = true; runAt = now();
      render();
      api.onInteract('run');
    }).classList.add('primary');
    K.button(runRow, 'Clear tally', function () {
      rooms = 0; hits = 0; pairs = []; ran = false;
      render();
      api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var pad = 10, roomH = h * 0.47;
      var j;
      g.fillStyle = '#141a21';
      roundRect(g, pad, 6, w - pad * 2, roomH, 10); g.fill();

      var cols = Math.min(10, Math.ceil(Math.sqrt(n * 1.7)));
      var rowsN = Math.ceil(n / cols);
      var cw = (w - pad * 2 - 16) / cols, ch = (roomH - 26) / rowsN;
      var rad = clamp(Math.min(cw, ch) * 0.3, 3, 8);
      var xy = [];
      for (j = 0; j < n; j++) {
        xy.push({
          x: pad + 8 + ((j % cols) + 0.5) * cw,
          y: 6 + 16 + (((j / cols) | 0) + 0.5) * ch
        });
      }
      var age = clamp((now() - runAt) / 900, 0, 1);
      var inPair = {};
      for (j = 0; j < pairs.length; j++) { inPair[pairs[j][0]] = 1; inPair[pairs[j][1]] = 1; }

      g.strokeStyle = C.gold; g.lineWidth = 1.6;
      g.globalAlpha = 0.35 + 0.5 * (1 - age);
      for (j = 0; j < pairs.length; j++) {
        g.beginPath();
        g.moveTo(xy[pairs[j][0]].x, xy[pairs[j][0]].y);
        g.lineTo(xy[pairs[j][1]].x, xy[pairs[j][1]].y);
        g.stroke();
      }
      g.globalAlpha = 1;
      for (j = 0; j < n; j++) {
        var hot = inPair[j] === 1;
        g.fillStyle = hot ? C.gold : (ran ? '#3f4b5b' : C.accent);
        g.beginPath();
        g.arc(xy[j].x, xy[j].y, rad * (hot ? 1 + 0.35 * (1 - age) : 1), 0, 7);
        g.fill();
      }
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText(ran ? (pairs.length ? 'a shared birthday in this room' : 'no shared birthday this time')
        : 'one dot per person', pad + 8, 6 + 12);

      // the exact curve underneath, with the half-way line to aim at
      var by = roomH + 26, bh = h - by - 18, bx = pad + 14, bw = w - pad * 2 - 20;
      function px(v) { return bx + (v - 1) / 59 * bw; }
      function py(v) { return by + bh - bh * v; }
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(bx, by + bh + 0.5); g.lineTo(bx + bw, by + bh + 0.5); g.stroke();
      g.strokeStyle = 'rgba(210,153,34,0.55)'; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(bx, py(0.5)); g.lineTo(bx + bw, py(0.5)); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.gold; g.font = f(10, 700); g.textAlign = 'right';
      g.fillText('half', bx - 3, py(0.5) + 3.5);

      g.beginPath();
      for (j = 2; j <= 60; j++) {
        if (j === 2) g.moveTo(px(j), py(P[j])); else g.lineTo(px(j), py(P[j]));
      }
      g.strokeStyle = C.dim; g.lineWidth = 2.5; g.stroke();

      if (api.locked()) {     // afterwards, mark where it crosses — a small extra, never before
        var cross = 2;
        while (cross < 60 && P[cross] < 0.5) cross++;
        g.strokeStyle = 'rgba(63,185,80,0.6)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(px(cross), py(0.5)); g.lineTo(px(cross), by + bh); g.stroke();
        g.fillStyle = C.good; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(String(cross), px(cross), by + bh + 13);
      }

      g.strokeStyle = 'rgba(88,166,255,0.35)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(px(n), by + bh); g.lineTo(px(n), py(P[n])); g.stroke();
      g.fillStyle = C.accent;
      g.beginPath(); g.arc(px(n), py(P[n]), 5, 0, 7); g.fill();

      g.fillStyle = '#5b6672'; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('people in the room', bx, by + bh + 13);
      g.textAlign = 'right';
      g.fillText('chance of a shared birthday', bx + bw, by - 3);
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------- 6. three doors */
  global.QQViz.register('montyHall', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a door.');
    var stage = K.Stage(host, 0.7);
    var prize = 0, picked = -1, opened = -1, finalDoor = -1;
    var phase = 'pick', openAt = 0, revealAt = 0;
    var plays = 0, wins = 0;
    var autoStay = 0, autoSwitch = 0, autoN = 0, queue = 0;
    var shownStay = 0, shownSwitch = 0;

    function enable(b, on) { b.disabled = !on; b.style.opacity = on ? '1' : '0.4'; }
    function newGame() {
      prize = pickInt(3); picked = -1; opened = -1; finalDoor = -1; phase = 'pick';
      enable(stayBtn, false); enable(swBtn, false);
      render();
    }
    function render() {
      var s;
      if (phase === 'pick') s = 'Tap a door.';
      else if (phase === 'opened') s = 'Door <b>' + (opened + 1) + '</b> was empty. Stay or switch?';
      else s = (finalDoor === prize ? 'You <b>won</b> the prize.' : 'Empty. The prize was behind door <b>' +
        (prize + 1) + '</b>.');
      if (plays) s += ' &nbsp;·&nbsp; you have won <b>' + wins + '</b> of ' + plays;
      out.innerHTML = s;
    }
    function finish(d) {
      finalDoor = d; phase = 'done'; revealAt = now();
      plays++;
      if (d === prize) wins++;
      enable(stayBtn, false); enable(swBtn, false);
      render();
      api.onInteract('tap');
    }
    var stayBtn = K.button(ctr, 'Stay', function () { if (phase === 'opened') finish(picked); });
    var swBtn = K.button(ctr, 'Switch', function () { if (phase === 'opened') finish(3 - picked - opened); });
    swBtn.classList.add('primary');
    K.button(ctr, 'New game', function () { newGame(); api.onInteract('reset'); }).classList.add('small');
    K.button(ctr, 'Play 200 games automatically', function () {
      queue += 200;
      api.onInteract('run');
    }).classList.add('small');
    newGame();

    function boxOf(i, w, h) {
      var pad = 10, dw = (w - pad * 4) / 3;
      return { x: pad + i * (dw + pad), y: 14, w: dw, h: h * 0.52 };
    }
    stage.canvas.addEventListener('click', function (ev) {
      var p = stage.pointer(ev), i;
      if (phase === 'done') { newGame(); api.onInteract('tap'); return; }
      if (phase !== 'pick') return;
      for (i = 0; i < 3; i++) {
        var bx = boxOf(i, stage.w, stage.h);
        if (p.x >= bx.x && p.x <= bx.x + bx.w && p.y >= bx.y && p.y <= bx.y + bx.h) {
          picked = i;
          // the host knows, and never opens the prize door
          var options = [];
          for (var j = 0; j < 3; j++) if (j !== picked && j !== prize) options.push(j);
          opened = options[pickInt(options.length)];
          openAt = now();
          phase = 'opened';
          enable(stayBtn, true); enable(swBtn, true);
          render();
          api.onInteract('tap');
          return;
        }
      }
    });

    stage.draw = function (g, w, h) {
      var i;
      var step = Math.min(queue, 12);
      for (i = 0; i < step; i++) {          // an honest replay of the same set-up under both rules
        var pz = pickInt(3), pk = pickInt(3), opts = [], j;
        for (j = 0; j < 3; j++) if (j !== pk && j !== pz) opts.push(j);
        var op = opts[pickInt(opts.length)];
        var sw = 3 - pk - op;
        if (pk === pz) autoStay++;
        if (sw === pz) autoSwitch++;
        autoN++;
      }
      queue -= step;

      for (i = 0; i < 3; i++) {
        var bx = boxOf(i, w, h);
        var isOpen = i === opened;
        var shown = phase === 'done';
        var k = isOpen ? easeOut(clamp((now() - openAt) / 420, 0, 1)) : 0;

        g.fillStyle = '#10151c';
        roundRect(g, bx.x, bx.y, bx.w, bx.h, 8); g.fill();
        if (isOpen || shown) {          // what is behind: a prize, or nothing at all
          g.fillStyle = i === prize ? 'rgba(210,153,34,0.9)' : '#20272f';
          roundRect(g, bx.x + 6, bx.y + 6, bx.w - 12, bx.h - 12, 6); g.fill();
          g.fillStyle = i === prize ? '#0d1117' : '#5b6672';
          g.font = f(11, 700); g.textAlign = 'center';
          g.fillText(i === prize ? 'prize' : 'empty', bx.x + bx.w / 2, bx.y + bx.h / 2 + 4);
        }
        var swing = isOpen ? 1 - k : (shown ? 0 : 1);
        if (swing > 0.02) {             // the door panel swings back on its hinge
          g.save();
          g.translate(bx.x, bx.y);
          g.scale(swing, 1);
          g.fillStyle = i === picked ? 'rgba(88,166,255,0.22)' : C.panel;
          roundRect(g, 0, 0, bx.w, bx.h, 8); g.fill();
          g.strokeStyle = i === picked ? C.accent : C.line;
          g.lineWidth = i === picked ? 2 : 1;
          roundRect(g, 1, 1, bx.w - 2, bx.h - 2, 8); g.stroke();
          if (swing > 0.6) {
            g.fillStyle = i === picked ? C.accent : C.muted;
            g.font = f(15, 800); g.textAlign = 'center';
            g.fillText(String(i + 1), bx.w / 2, bx.h / 2 + 5);
            g.beginPath();
            g.arc(bx.w * 0.82, bx.h * 0.55, 3, 0, 7);
            g.fillStyle = C.dim; g.fill();
          }
          g.restore();
        }
        if (phase === 'done' && i === finalDoor) {
          var glow = clamp((now() - revealAt) / 400, 0, 1);
          g.strokeStyle = finalDoor === prize ? C.good : C.bad;
          g.lineWidth = 3;
          g.globalAlpha = 0.5 + 0.5 * glow;
          roundRect(g, bx.x - 1, bx.y - 1, bx.w + 2, bx.h + 2, 9); g.stroke();
          g.globalAlpha = 1;
        }
        if (i === picked && phase !== 'pick') {
          g.fillStyle = C.accent; g.font = f(10, 700); g.textAlign = 'center';
          g.fillText('your pick', bx.x + bx.w / 2, bx.y + bx.h + 13);
        }
      }

      // the two strategies, side by side
      var pad = 10, by = h * 0.52 + 34, bw = w - pad * 2 - 52, bh = 15;
      var tStay = autoN ? autoStay / autoN : 0, tSw = autoN ? autoSwitch / autoN : 0;
      shownStay += (tStay - shownStay) * 0.2;
      shownSwitch += (tSw - shownSwitch) * 0.2;
      var lanes = [
        { name: 'stay', v: shownStay, n: autoStay, col: C.gold },
        { name: 'switch', v: shownSwitch, n: autoSwitch, col: C.accent }
      ];
      for (i = 0; i < 2; i++) {
        var y = by + i * (bh + 12);
        g.fillStyle = C.muted; g.font = f(10.5, 700); g.textAlign = 'left';
        g.fillText(lanes[i].name, pad, y + bh - 3);
        g.fillStyle = C.panel;
        roundRect(g, pad + 42, y, bw, bh, 7); g.fill();
        if (autoN) {
          g.fillStyle = lanes[i].col;
          roundRect(g, pad + 42, y, Math.max(3, bw * lanes[i].v), bh, 7); g.fill();
        }
        g.fillStyle = autoN ? lanes[i].col : C.dim;
        g.font = f(10, 700); g.textAlign = 'right';
        g.fillText(autoN ? lanes[i].n + ' of ' + autoN : 'not run', w - pad, y + bh - 3);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------------ 7. longest run */
  global.QQViz.register('longestRun', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'No flips yet.');
    var stage = K.Stage(host, 0.6);
    var N = 100, COLS = 25;
    var flips = [], best = null, revealed = 0;
    var attempts = 0, hits = 0;

    function longest(arr) {
      var bs = 0, bl = 1, s = 0, i;
      for (i = 1; i <= arr.length; i++) {
        if (i === arr.length || arr[i] !== arr[s]) {
          if (i - s > bl) { bl = i - s; bs = s; }
          s = i;
        }
      }
      return { s: bs, l: bl };
    }
    function oneSet() {
      var a = [], i;
      for (i = 0; i < N; i++) a.push(coin());
      var b = longest(a);
      attempts++;
      if (b.l >= 5) hits++;
      flips = a; best = b;
      return b;
    }
    function render() {
      var s = best ? 'longest run this time: <b>' + best.l + '</b>' : 'No flips yet.';
      if (attempts) s += ' &nbsp;·&nbsp; runs of 5 or more in <b>' + hits + '</b> of ' + attempts + ' attempts';
      out.innerHTML = s;
    }
    K.button(ctr, 'Flip 100 coins', function () {
      oneSet(); revealed = 0; render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Flip 20 times', function () {
      for (var i = 0; i < 20; i++) oneSet();
      revealed = N; render(); api.onInteract('run');
    }).classList.add('small');
    K.button(ctr, 'Clear tally', function () {
      attempts = 0; hits = 0; flips = []; best = null; revealed = 0;
      render(); api.onInteract('reset');
    }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 10, i;
      if (revealed < flips.length) revealed = Math.min(flips.length, revealed + 5);   // quick sweep
      var cell = (w - pad * 2) / COLS;
      var rowsN = N / COLS, gap = 16;
      var topY = 20;

      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
      g.fillText(flips.length ? 'one hundred flips' : 'press flip to see a hundred flips', pad, 12);

      for (i = 0; i < revealed; i++) {
        var col = i % COLS, row = (i / COLS) | 0;
        var x = pad + col * cell, y = topY + row * (cell + gap);
        g.fillStyle = flips[i] === 0 ? C.accent : C.gold;
        roundRect(g, x + 0.6, y, cell - 1.2, cell, 2);
        g.fill();
      }
      if (!flips.length) {
        for (i = 0; i < N; i++) {
          var c2 = i % COLS, r2 = (i / COLS) | 0;
          g.fillStyle = '#1c232c';
          roundRect(g, pad + c2 * cell + 0.6, topY + r2 * (cell + gap), cell - 1.2, cell, 2);
          g.fill();
        }
      }
      if (best && revealed >= N) {         // bracket the longest run, wrapping row by row
        var s = best.s, e = best.s + best.l - 1;
        g.strokeStyle = C.good; g.lineWidth = 2;
        var rs = (s / COLS) | 0, re = (e / COLS) | 0, r;
        for (r = rs; r <= re; r++) {
          var a = Math.max(s, r * COLS), b = Math.min(e, r * COLS + COLS - 1);
          var x0 = pad + (a % COLS) * cell + 1, x1 = pad + ((b % COLS) + 1) * cell - 1;
          var yb = topY + r * (cell + gap) + cell + 5;
          g.beginPath();
          g.moveTo(x0, yb); g.lineTo(x0, yb + 4);
          g.moveTo(x0, yb + 4); g.lineTo(x1, yb + 4);
          g.moveTo(x1, yb + 4); g.lineTo(x1, yb);
          g.stroke();
          if (r === re) {
            g.fillStyle = C.good; g.font = f(10, 700);
            g.textAlign = x1 > w - 60 ? 'right' : 'left';
            g.fillText('run of ' + best.l, x1 > w - 60 ? x1 : x1 + 4, yb + 12);
          }
        }
      }
      // how often a long run turned up, against a half-way tick
      var barY = topY + rowsN * (cell + gap) + 12, barW = w - pad * 2, barH = 12;
      g.fillStyle = C.panel;
      roundRect(g, pad, barY, barW, barH, 6); g.fill();
      if (attempts) {
        g.fillStyle = C.good;
        roundRect(g, pad, barY, Math.max(3, barW * (hits / attempts)), barH, 6); g.fill();
      }
      g.strokeStyle = 'rgba(230,237,243,0.55)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad + barW / 2, barY - 3); g.lineTo(pad + barW / 2, barY + barH + 3); g.stroke();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('half', pad + barW / 2, barY + barH + 14);
      g.textAlign = 'left';
      g.fillText('attempts with a run of 5 or more', pad, barY - 5);
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 8. red marble kept out */
  global.QQViz.register('marbleSecondDraw', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Four marbles in the bag. Pick what came out first.');
    var stage = K.Stage(host, 0.48);
    var first = null, pickedAt = 0;

    function choose(colour) {
      first = colour; pickedAt = now();
      out.innerHTML = colour === 'red'
        ? 'A red marble is out. The bag now holds <b>1 red</b> and <b>2 blue</b>.'
        : 'A blue marble is out. The bag now holds <b>2 red</b> and <b>1 blue</b>.';
      api.onInteract('draw');
    }
    K.button(ctr, 'First draw is red', function () { choose('red'); }).classList.add('primary');
    K.button(ctr, 'First draw is blue', function () { choose('blue'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var base = ['red', 'red', 'blue', 'blue'];
      var rem = first === 'red' ? ['red', 'blue', 'blue']
        : (first === 'blue' ? ['red', 'red', 'blue'] : base);
      var y = h * 0.44, gap = w / (rem.length + 1);
      var r = Math.min(24, h * 0.18), i;
      for (i = 0; i < rem.length; i++) {
        var cx = gap * (i + 1);
        g.fillStyle = rem[i] === 'red' ? C.bad : C.accent;
        g.beginPath(); g.arc(cx, y, r, 0, 7); g.fill();
        g.strokeStyle = C.line; g.lineWidth = 2;
        g.beginPath(); g.arc(cx, y, r, 0, 7); g.stroke();
      }
      if (first) {
        var pop = 1 - easeOut(clamp((now() - pickedAt) / 320, 0, 1));
        var x = w - 38, yy = 26 - pop * 10;
        g.globalAlpha = 0.72;
        g.fillStyle = first === 'red' ? C.bad : C.accent;
        g.beginPath(); g.arc(x, yy, r * 0.72, 0, 7); g.fill();
        g.strokeStyle = C.muted; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x - r, yy - r); g.lineTo(x + r, yy + r); g.stroke();
        g.globalAlpha = 1;
      }
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText(first ? 'the next draw comes from the marbles still inside' : 'nothing has been removed yet', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 9. gold token position */
  global.QQViz.register('goldPositionBags', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Shuffle the three bags.');
    var stage = K.Stage(host, 0.56);
    var counts = [0, 0, 0], runs = 0, pending = 0, last = -1, lastAt = 0;

    function record() {
      last = pickInt(3);
      counts[last]++;
      runs++;
    }
    function render() {
      if (!runs) out.innerHTML = 'Shuffle the three bags.';
      else out.innerHTML = '<b>' + runs + '</b> shuffles &nbsp;·&nbsp; left ' +
        counts[0] + ' &nbsp;·&nbsp; middle ' + counts[1] + ' &nbsp;·&nbsp; right ' + counts[2];
    }
    K.button(ctr, 'Shuffle', function () {
      record(); lastAt = now(); render(); api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Shuffle 100 times', function () { pending += 100; api.onInteract('run'); }).classList.add('small');
    K.button(ctr, 'Reset', function () {
      counts = [0, 0, 0]; runs = 0; pending = 0; last = -1; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 25), i;
      for (i = 0; i < take; i++) record();
      pending -= take;
      if (take) { lastAt = now(); render(); }

      var y = h * 0.36, bw = Math.min(70, (w - 48) / 3), gap = (w - bw * 3) / 4;
      var maxC = Math.max(1, counts[0], counts[1], counts[2]);
      for (i = 0; i < 3; i++) {
        var x = gap + i * (bw + gap), on = i === last;
        g.fillStyle = on ? 'rgba(210,153,34,0.22)' : '#1c232c';
        roundRect(g, x, y, bw, 58, 8); g.fill();
        g.strokeStyle = on ? C.gold : C.line; g.lineWidth = on ? 2.5 : 1.5;
        roundRect(g, x, y, bw, 58, 8); g.stroke();
        if (on) {
          var lift = 1 - easeOut(clamp((now() - lastAt) / 360, 0, 1));
          g.fillStyle = C.gold;
          g.beginPath(); g.arc(x + bw / 2, y + 24 - lift * 16, 12, 0, 7); g.fill();
        }
        g.fillStyle = C.muted; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(['left', 'middle', 'right'][i], x + bw / 2, y + 76);
        var bh = (h - y - 98) * (counts[i] / maxC);
        g.fillStyle = C.accent;
        roundRect(g, x + bw * 0.25, h - 12 - bh, bw * 0.5, bh, 4); g.fill();
      }
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 10. double-six dominoes */
  global.QQViz.register('dominoSixDoubles', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a description.');
    var stage = K.Stage(host, 0.62);
    var tiles = [], sel = null, selAt = 0;
    var a, b;
    for (a = 0; a <= 6; a++) for (b = a; b <= 6; b++) tiles.push([a, b]);

    function hit(t) {
      if (sel === 'double') return t[0] === t[1];
      if (sel === 'six') return t[0] === 6 || t[1] === 6;
      return false;
    }
    function pick(kind) {
      sel = kind; selAt = now();
      var n = tiles.filter(hit).length;
      out.innerHTML = '<b>' + n + '</b> of the 28 dominoes match';
      api.onInteract('chip');
    }
    K.button(ctr, 'doubles', function () { pick('double'); }).classList.add('primary');
    K.button(ctr, 'has a six', function () { pick('six'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 8, cols = 7, rows = 4, tw = (w - pad * 2) / cols, th = (h - pad * 2) / rows;
      tiles.forEach(function (t, i) {
        var c = i % cols, r = Math.floor(i / cols);
        var x = pad + c * tw, y = pad + r * th, on = hit(t);
        var k = on ? easeOut(clamp((now() - selAt) / 330 - i * 0.006, 0, 1)) : 0;
        g.fillStyle = '#1c232c';
        roundRect(g, x + 3, y + 4, tw - 6, th - 8, 5); g.fill();
        if (k) {
          g.fillStyle = C.accent; g.globalAlpha = 0.2 + 0.8 * k;
          roundRect(g, x + 3, y + 4, tw - 6, th - 8, 5); g.fill();
          g.globalAlpha = 1;
        }
        g.fillStyle = on ? '#0d1117' : '#647080';
        g.font = f(Math.max(8, Math.min(12, tw * 0.23)), on ? 800 : 600);
        g.textAlign = 'center';
        g.fillText(t[0] + ' | ' + t[1], x + tw / 2, y + th / 2 + 4);
      });
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 11. five-minute pairs */
  global.QQViz.register('minuteArrivalGrid', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a case.');
    var stage = K.Stage(host, 0.88);
    var sel = null, selAt = 0;

    function isOn(a, b) {
      if (sel === 'same') return a === b;
      if (sel === 'apart') return Math.abs(a - b) === 1;
      return false;
    }
    function pick(kind) {
      sel = kind; selAt = now();
      var hits = 0, a, b;
      for (a = 1; a <= 5; a++) for (b = 1; b <= 5; b++) if (isOn(a, b)) hits++;
      out.innerHTML = '<b>' + hits + '</b> of the 25 ordered pairs match';
      api.onInteract('chip');
    }
    K.button(ctr, 'same minute', function () { pick('same'); }).classList.add('primary');
    K.button(ctr, 'one minute apart', function () { pick('apart'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 28, size = Math.min((w - pad - 10) / 5, (h - pad - 10) / 5);
      var ox = (w - size * 5) / 2 + 6, oy = (h - size * 5) / 2 + 8;
      var a, b;
      g.fillStyle = C.muted; g.font = f(11, 700);
      for (a = 1; a <= 5; a++) {
        g.textAlign = 'center'; g.fillText(String(a), ox + size * (a - 0.5), oy - 8);
        g.textAlign = 'right'; g.fillText(String(a), ox - 8, oy + size * (a - 0.5) + 4);
      }
      for (a = 1; a <= 5; a++) {
        for (b = 1; b <= 5; b++) {
          var x = ox + (b - 1) * size, y = oy + (a - 1) * size, on = isOn(a, b);
          var age = (now() - selAt) / 1000 - (a + b) * 0.025;
          var k = on ? easeOut(clamp(age / 0.3, 0, 1)) : 0;
          g.fillStyle = '#1c232c';
          roundRect(g, x + 2, y + 2, size - 4, size - 4, 5); g.fill();
          if (k) {
            g.fillStyle = C.gold; g.globalAlpha = 0.2 + 0.8 * k;
            roundRect(g, x + 2, y + 2, size - 4, size - 4, 5); g.fill();
            g.globalAlpha = 1;
          }
          g.fillStyle = on ? '#0d1117' : '#5b6672';
          g.font = f(Math.max(9, size * 0.27), on ? 800 : 600);
          g.textAlign = 'center';
          g.fillText(a + ',' + b, x + size / 2, y + size / 2 + size * 0.11);
        }
      }
    };
    return { destroy: stage.destroy };
  });

  /* -------------------------------------------- 12. days inside months */
  global.QQViz.register('calendarMonthWeights', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a month type.');
    var stage = K.Stage(host, 0.62);
    var months = [
      ['J', 31], ['F', 28], ['M', 31], ['A', 30], ['M', 31], ['J', 30],
      ['J', 31], ['A', 31], ['S', 30], ['O', 31], ['N', 30], ['D', 31]
    ];
    var sel = null, selAt = 0;

    function pick(kind) {
      sel = kind; selAt = now();
      var days = 0;
      months.forEach(function (m) { if ((kind === 'long') === (m[1] === 31)) days += m[1]; });
      out.innerHTML = '<b>' + days + '</b> days are in the selected months';
      api.onInteract('chip');
    }
    K.button(ctr, '31 days', function () { pick('long'); }).classList.add('primary');
    K.button(ctr, 'shorter', function () { pick('short'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 10, slot = (w - pad * 2) / months.length;
      var base = h - 22, maxH = h - 44;
      months.forEach(function (m, i) {
        var long = m[1] === 31, on = sel && ((sel === 'long') === long);
        var x = pad + i * slot, bh = maxH * (m[1] / 31);
        var k = on ? easeOut(clamp((now() - selAt) / 360 - i * 0.018, 0, 1)) : 0;
        g.fillStyle = on ? C.accent : '#1c232c';
        g.globalAlpha = on ? 0.35 + 0.65 * k : 1;
        roundRect(g, x + 2, base - bh, slot - 4, bh, 4); g.fill();
        g.globalAlpha = 1;
        g.fillStyle = on ? C.fg : C.muted;
        g.font = f(Math.max(8, Math.min(11, slot * 0.55)), on ? 800 : 600);
        g.textAlign = 'center';
        g.fillText(m[0], x + slot / 2, base + 13);
      });
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('bar height is days in the month', pad, 12);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 13. BALLOON slots */
  global.QQViz.register('balloonLetterSlots', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a letter.');
    var stage = K.Stage(host, 0.48);
    var slots = 'BALLOON'.split('');
    var letters = ['B', 'A', 'L', 'O', 'N'];
    var sel = '', selAt = 0;

    function pick(ch) {
      sel = ch; selAt = now();
      var n = slots.filter(function (x) { return x === ch; }).length;
      out.innerHTML = '<b>' + n + '</b> of the 7 positions hold ' + ch;
      api.onInteract('chip');
    }
    letters.forEach(function (ch) {
      K.button(ctr, ch, function () { pick(ch); }).classList.add(ch === 'O' ? 'primary' : 'small');
    });

    stage.draw = function (g, w, h) {
      var pad = 10, gap = 5, bw = (w - pad * 2 - gap * 6) / 7;
      var y = h * 0.34, bh = Math.min(58, h * 0.38);
      slots.forEach(function (ch, i) {
        var x = pad + i * (bw + gap);
        var on = ch === sel;
        var k = on ? easeOut(clamp((now() - selAt) / 320 - i * 0.025, 0, 1)) : 0;
        g.fillStyle = on ? C.gold : '#1c232c';
        g.globalAlpha = on ? 0.35 + 0.65 * k : 1;
        roundRect(g, x, y, bw, bh, 6); g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = on ? C.gold : C.line; g.lineWidth = on ? 2 : 1;
        roundRect(g, x, y, bw, bh, 6); g.stroke();
        g.fillStyle = on ? '#0d1117' : C.muted;
        g.font = f(Math.max(14, Math.min(22, bw * 0.55)), 800);
        g.textAlign = 'center';
        g.fillText(ch, x + bw / 2, y + bh / 2 + 7);
        g.fillStyle = C.muted; g.font = f(10, 600);
        g.fillText(String(i + 1), x + bw / 2, y + bh + 14);
      });
      g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
      g.fillText('the random pick is a slot, not a different letter name', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 14. two-digit PINs */
  global.QQViz.register('pinDigitGrid', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a rule.');
    var stage = K.Stage(host, 0.88);
    var sel = '', selAt = 0;

    function hit(a, b) {
      if (sel === 'match') return a === b;
      if (sel === 'sum9') return a + b === 9;
      return false;
    }
    function pick(kind) {
      sel = kind; selAt = now();
      var n = 0, a, b;
      for (a = 0; a < 10; a++) for (b = 0; b < 10; b++) if (hit(a, b)) n++;
      out.innerHTML = '<b>' + n + '</b> of the 100 PINs match';
      api.onInteract('chip');
    }
    K.button(ctr, 'digits match', function () { pick('match'); }).classList.add('primary');
    K.button(ctr, 'add to 9', function () { pick('sum9'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 22, size = Math.min((w - pad - 8) / 10, (h - pad - 8) / 10);
      var ox = (w - size * 10) / 2 + 6, oy = (h - size * 10) / 2 + 8;
      var a, b;
      g.fillStyle = C.muted; g.font = f(10, 700);
      for (a = 0; a < 10; a++) {
        g.textAlign = 'center'; g.fillText(String(a), ox + size * (a + 0.5), oy - 7);
        g.textAlign = 'right'; g.fillText(String(a), ox - 7, oy + size * (a + 0.5) + 3);
      }
      for (a = 0; a < 10; a++) {
        for (b = 0; b < 10; b++) {
          var x = ox + b * size, y = oy + a * size, on = hit(a, b);
          var age = (now() - selAt) / 1000 - (a + b) * 0.012;
          var k = on ? easeOut(clamp(age / 0.28, 0, 1)) : 0;
          g.fillStyle = '#1c232c';
          roundRect(g, x + 1, y + 1, size - 2, size - 2, 3); g.fill();
          if (k) {
            g.fillStyle = C.accent; g.globalAlpha = 0.25 + 0.75 * k;
            roundRect(g, x + 1, y + 1, size - 2, size - 2, 3); g.fill();
            g.globalAlpha = 1;
          }
          if (size >= 18) {
            g.fillStyle = on ? '#0d1117' : '#53606d';
            g.font = f(Math.max(7, size * 0.28), on ? 800 : 600);
            g.textAlign = 'center';
            g.fillText(String(a) + String(b), x + size / 2, y + size / 2 + 3);
          }
        }
      }
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 15. ace in two cards */
  global.QQViz.register('aceTwoDrawSlots', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Shuffle the tiny deck.');
    var stage = K.Stage(host, 0.56);
    var deck = ['A', 'blank', 'blank', 'blank'];
    var mode = '', dealtAt = 0;

    function shuffle() {
      deck = ['A', 'blank', 'blank', 'blank'];
      for (var i = deck.length - 1; i > 0; i--) {
        var j = pickInt(i + 1), tmp = deck[i];
        deck[i] = deck[j]; deck[j] = tmp;
      }
      dealtAt = now();
      out.textContent = 'The first two slots are the two cards you draw.';
      api.onInteract('shuffle');
    }
    function mark(kind) {
      mode = kind;
      out.innerHTML = kind === 'first'
        ? '<b>1</b> of the 4 ace positions counts'
        : '<b>2</b> of the 4 ace positions count';
      api.onInteract('chip');
    }
    K.button(ctr, 'Shuffle', shuffle).classList.add('primary');
    K.button(ctr, 'ace first', function () { mark('first'); }).classList.add('small');
    K.button(ctr, 'ace in two cards', function () { mark('two'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 12, gap = 8, cw = (w - pad * 2 - gap * 3) / 4;
      var ch = Math.min(76, h * 0.48), y = h * 0.28;
      var drawnW = cw * 2 + gap;
      g.fillStyle = 'rgba(88,166,255,0.10)';
      roundRect(g, pad - 3, y - 5, drawnW + 6, ch + 10, 8); g.fill();
      for (var i = 0; i < 4; i++) {
        var x = pad + i * (cw + gap);
        var counts = mode === 'two' ? i < 2 : (mode === 'first' ? i === 0 : false);
        var lift = easeOut(clamp((now() - dealtAt) / 360 - i * 0.04, 0, 1));
        g.fillStyle = counts ? 'rgba(210,153,34,0.32)' : '#1c232c';
        roundRect(g, x, y - (1 - lift) * 10, cw, ch, 7); g.fill();
        g.strokeStyle = counts ? C.gold : C.line; g.lineWidth = counts ? 2 : 1.2;
        roundRect(g, x, y - (1 - lift) * 10, cw, ch, 7); g.stroke();
        g.fillStyle = deck[i] === 'A' ? C.gold : C.muted;
        g.font = f(Math.max(13, Math.min(24, cw * 0.42)), 800);
        g.textAlign = 'center';
        g.fillText(deck[i] === 'A' ? 'A' : '', x + cw / 2, y + ch / 2 + 7 - (1 - lift) * 10);
        g.fillStyle = C.muted; g.font = f(10, 700);
        g.fillText(i < 2 ? 'draw ' + (i + 1) : 'slot ' + (i + 1), x + cw / 2, y + ch + 15);
      }
    };
    shuffle();
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 16. traffic light time */
  global.QQViz.register('trafficLightMinute', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a colour, or run arrivals.');
    var stage = K.Stage(host, 0.5);
    var sel = '', selAt = 0, arrivals = [], pending = 0;
    var parts = [
      { id: 'green', label: 'green', start: 0, end: 25, colour: C.good },
      { id: 'amber', label: 'amber', start: 25, end: 30, colour: C.gold },
      { id: 'red', label: 'red', start: 30, end: 60, colour: C.bad }
    ];

    function pick(kind) {
      sel = kind; selAt = now();
      var part = parts.filter(function (p) { return p.id === kind; })[0];
      out.innerHTML = '<b>' + (part.end - part.start) + '</b> seconds of the minute are ' + part.label;
      api.onInteract('chip');
    }
    parts.forEach(function (p) {
      K.button(ctr, p.label, function () { pick(p.id); }).classList.add(p.id === 'red' ? 'primary' : 'small');
    });
    K.button(ctr, 'Arrive 30 times', function () { pending += 30; api.onInteract('run'); }).classList.add('small');

    function colourAt(s) {
      return parts.filter(function (p) { return s >= p.start && s < p.end; })[0];
    }
    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 3);
      for (var i = 0; i < take; i++) arrivals.push(Math.random() * 60);
      pending -= take;
      if (take) out.innerHTML = '<b>' + arrivals.length + '</b> random arrivals shown';

      var pad = 14, x0 = pad, x1 = w - pad, y = h * 0.36, barH = 34;
      parts.forEach(function (p) {
        var x = x0 + (x1 - x0) * (p.start / 60);
        var bw = (x1 - x0) * ((p.end - p.start) / 60);
        var on = sel === p.id;
        var k = on ? easeOut(clamp((now() - selAt) / 300, 0, 1)) : 0;
        g.fillStyle = p.colour;
        g.globalAlpha = on ? 0.45 + 0.55 * k : 0.25;
        roundRect(g, x, y, bw, barH, 4); g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = on ? p.colour : C.line; g.lineWidth = on ? 2 : 1;
        roundRect(g, x, y, bw, barH, 4); g.stroke();
        g.fillStyle = on ? C.fg : C.muted;
        g.font = f(10.5, 700); g.textAlign = 'center';
        g.fillText(p.label, x + bw / 2, y + barH + 14);
      });
      arrivals.slice(-60).forEach(function (s) {
        var p = colourAt(s);
        var x = x0 + (x1 - x0) * (s / 60);
        g.strokeStyle = p.colour; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y - 1); g.stroke();
      });
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('one minute of time', x0, y - 13);
      g.textAlign = 'right';
      g.fillText('60 seconds', x1, y - 13);
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------- 17. page numbers */
  global.QQViz.register('pageNumberEnds', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a rule.');
    var stage = K.Stage(host, 0.86);
    var sel = '', selAt = 0;

    function hit(n) {
      if (sel === 'starts') return String(n).charAt(0) === '1';
      if (sel === 'ends') return String(n).slice(-1) === '1';
      return false;
    }
    function pick(kind) {
      sel = kind; selAt = now();
      var n = 0;
      for (var p = 1; p <= 100; p++) if (hit(p)) n++;
      out.innerHTML = '<b>' + n + '</b> of the 100 page numbers match';
      api.onInteract('chip');
    }
    K.button(ctr, 'starts with 1', function () { pick('starts'); }).classList.add('primary');
    K.button(ctr, 'ends with 1', function () { pick('ends'); }).classList.add('small');

    stage.draw = function (g, w, h) {
      var pad = 8, cols = 10, rows = 10, size = Math.min((w - pad * 2) / cols, (h - pad * 2) / rows);
      var ox = (w - size * cols) / 2, oy = (h - size * rows) / 2;
      for (var n = 1; n <= 100; n++) {
        var i = n - 1, c = i % cols, r = (i / cols) | 0;
        var x = ox + c * size, y = oy + r * size, on = hit(n);
        var age = (now() - selAt) / 1000 - (r + c) * 0.011;
        var k = on ? easeOut(clamp(age / 0.28, 0, 1)) : 0;
        g.fillStyle = '#1c232c';
        roundRect(g, x + 1, y + 1, size - 2, size - 2, 3); g.fill();
        if (k) {
          g.fillStyle = C.gold; g.globalAlpha = 0.25 + 0.75 * k;
          roundRect(g, x + 1, y + 1, size - 2, size - 2, 3); g.fill();
          g.globalAlpha = 1;
        }
        g.fillStyle = on ? '#0d1117' : '#586473';
        g.font = f(Math.max(7, Math.min(11, size * 0.31)), on ? 800 : 600);
        g.textAlign = 'center';
        g.fillText(String(n), x + size / 2, y + size / 2 + 3);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ------------------------------------------------ 8. ten flips, counted */
  global.QQViz.register('binomialBars', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Tap a bar.');
    var stage = K.Stage(host, 0.72);
    var ways = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1];
    var TOTAL = 1024;
    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var sets = 0, queue = 0, sel = -1, selAt = 0;

    function render() {
      var s;
      if (sel < 0) s = 'Tap a bar.';
      else {
        s = 'exactly <b>' + sel + '</b> heads can happen <b>' + ways[sel] + '</b> ' +
          (ways[sel] === 1 ? 'way' : 'ways') + ' out of 1024 — about <b>' +
          (ways[sel] / TOTAL * 100).toFixed(1) + '%</b>';
      }
      if (sets) s += ' &nbsp;·&nbsp; <span class="tag-b">' + sets + ' sets flipped</span>';
      out.innerHTML = s;
    }
    K.button(ctr, 'Run 200 sets of 10 flips', function () {
      queue += 200; api.onInteract('run');
    }).classList.add('primary');
    K.button(ctr, 'Clear the flips', function () {
      counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      sets = 0; queue = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.canvas.addEventListener('click', function (ev) {
      var p = stage.pointer(ev);
      var pad = 12, slot = (stage.w - pad * 2) / 11;
      var k = Math.floor((p.x - pad) / slot);
      if (k < 0 || k > 10) return;
      sel = k; selAt = now();
      render();
      api.onInteract('tap');
    });

    stage.draw = function (g, w, h) {
      var i, step = Math.min(queue, 10);
      for (i = 0; i < step; i++) {
        var heads = 0, j;
        for (j = 0; j < 10; j++) heads += coin() === 0 ? 1 : 0;
        counts[heads]++; sets++;
      }
      queue -= step;
      if (step) render();

      var pad = 12, axisY = h - 26, topY = 16;
      var slot = (w - pad * 2) / 11, bw = slot * 0.74;
      var maxV = 252, span = axisY - topY;

      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, axisY + 0.5); g.lineTo(w - pad, axisY + 0.5); g.stroke();

      for (i = 0; i <= 10; i++) {
        var cx = pad + (i + 0.5) * slot;
        var bh = span * (ways[i] / maxV);
        var on = i === sel;
        var pop = on ? easeOut(clamp((now() - selAt) / 260, 0, 1)) : 0;
        g.fillStyle = on ? C.accent : 'rgba(88,166,255,0.26)';
        roundRect(g, cx - bw / 2, axisY - bh, bw, bh, 3);
        g.fill();
        if (on) {
          g.strokeStyle = C.accent; g.lineWidth = 1.5;
          roundRect(g, cx - bw / 2 - 1, axisY - bh - 1 - 2 * pop, bw + 2, bh + 2, 3);
          g.stroke();
        }
        if (sets) {           // the sampled shape, scaled onto the same axis
          var sh = span * ((counts[i] / sets) * TOTAL / maxV);
          g.fillStyle = 'rgba(210,153,34,0.30)';
          g.fillRect(cx - bw * 0.26, axisY - sh, bw * 0.52, sh);
          g.strokeStyle = C.gold; g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(cx - bw * 0.26, axisY - sh); g.lineTo(cx + bw * 0.26, axisY - sh);
          g.stroke();
        }
        g.fillStyle = on ? C.accent : C.muted;
        g.font = f(10.5, on ? 800 : 600); g.textAlign = 'center';
        g.fillText(String(i), cx, axisY + 14);
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('ways to get that many heads', pad, 10);
      /* the tick row already reads 0..10; a second caption under it collided
       * with the numbers, so it goes at the top beside the y-axis label */
      g.textAlign = 'right';
      g.fillStyle = '#5b6672';
      g.fillText('heads in ten flips', w - pad, 10);
    };
    return { destroy: stage.destroy };
  });
})(window);
