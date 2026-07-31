/* QQ visuals — one interactive graphic per question. Core kit + the first set.
 *
 * House rule, same as the videos: animate the thing, don't write the formula.
 * Every visual here is either draggable, tappable or re-runnable; none of them
 * is a picture of an equation.
 *
 * ---------------------------------------------------------------------------
 * CONTRACT FOR A VISUAL
 * ---------------------------------------------------------------------------
 *   QQViz.register(id, function (host, api) { ...; return { destroy: fn }; });
 *   QQViz.mount(id, hostElement, api) -> { destroy() }
 *
 *   api.onInteract(kind)  call whenever the player touches the visual; the app
 *                         turns the first one into a viz_interacted event, so we
 *                         can measure whether interactives actually matter.
 *   api.onSelect(value)   ONLY for `tap` questions: report the region the player
 *                         tapped. The app treats it as their answer.
 *   api.data              window.QQ_DATA.vizData — shared datasets, so the same
 *                         numbers drive the picture and site/verify_answers.py.
 *   api.locked()          true once the question has been answered; a visual
 *                         should keep working but must not change the answer.
 *
 * Everything a visual needs is on QQViz.kit, so extra visual files (viz_*.js)
 * never re-implement the canvas plumbing. Files load in order; each one calls
 * QQViz.register. Nothing here touches the DOM outside its own host element.
 * ---------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  var C = {
    bg: '#0d1117', panel: '#161b22', line: '#242c38', fg: '#e6edf3',
    muted: '#8b949e', accent: '#58a6ff', good: '#3fb950', bad: '#f85149',
    gold: '#d29922', dim: '#30363d'
  };
  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  function f(size, weight) { return (weight || 500) + ' ' + size + 'px ' + FONT; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function roundRect(g, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /* Stage: canvas + DPR fit + rAF loop + teardown. */
  function Stage(host, aspect) {
    var canvas = el('canvas', 'viz-canvas');
    host.appendChild(canvas);
    var g = canvas.getContext('2d');
    var st = { canvas: canvas, g: g, w: 300, h: 300, t0: performance.now(), alive: true, draw: null };

    function fit() {
      var w = Math.max(200, Math.round(canvas.getBoundingClientRect().width || host.clientWidth || 320));
      /* Cap the height at a share of the viewport. On a phone the prompt, the
       * picture and at least the first answer have to share one screen, and a
       * tall aspect on a short handset pushes the answers out of sight. */
      var cap = Math.round((global.innerHeight || 800) * 0.46);
      var h = Math.max(150, Math.min(Math.round(w * aspect), cap));
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.style.height = h + 'px';
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h;
    }
    st.fit = fit;

    function frame(now) {
      if (!st.alive) return;
      if (st.draw) {
        g.clearRect(0, 0, st.w, st.h);
        /* Hand the draw function a slightly shorter canvas than it really has.
         * Almost every visual anchors a caption at the bottom edge with
         * fillText(..., h - 3); a baseline that close to the edge clips the
         * descenders. Six px of slack costs nothing and fixes all of them at
         * once. */
        st.draw(g, st.w, st.h - 6, (now - st.t0) / 1000);
      }
      global.requestAnimationFrame(frame);
    }
    fit();                       // size it now, not on the first frame
    global.requestAnimationFrame(frame);
    var onResize = function () { fit(); };
    global.addEventListener('resize', onResize);
    st.destroy = function () { st.alive = false; global.removeEventListener('resize', onResize); };

    /* pointer position in css pixels */
    st.pointer = function (ev) {
      var r = canvas.getBoundingClientRect();
      var p = (ev.touches && ev.touches[0]) || ev;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };
    return st;
  }

  function controls(host) { var d = el('div', 'viz-controls'); host.appendChild(d); return d; }
  function readout(host, text) { var d = el('div', 'viz-readout', text || ''); host.appendChild(d); return d; }
  function button(parent, label, onClick) {
    var b = el('button', 'viz-btn', label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    parent.appendChild(b);
    return b;
  }

  var VIZ = {};

  /* ---------------------------------------------------------------- 1. dice */
  VIZ.diceDifference = function (host, api) {
    var chips = controls(host);
    var out = readout(host, 'Pick a difference.');
    var stage = Stage(host, 0.92);
    var sel = -1, selAt = 0;

    var counts = [0, 0, 0, 0, 0, 0];
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) counts[Math.abs(a - b)]++;

    var chipEls = [];
    [0, 1, 2, 3, 4, 5].forEach(function (d) {
      var c = el('button', 'viz-chip', String(d));
      c.type = 'button';
      c.addEventListener('click', function () {
        sel = d; selAt = performance.now();
        chipEls.forEach(function (x, i) { x.classList.toggle('on', i === d); });
        out.innerHTML = '<b>' + counts[d] + '</b> of the 36 rolls give a difference of ' + d;
        api.onInteract('chip');
      });
      chips.appendChild(c);
      chipEls.push(c);
    });

    stage.draw = function (g, w, h, t) {
      var pad = 26, size = Math.min((w - pad) / 6, (h - pad) / 6);
      var ox = (w - size * 6) / 2 + 6, oy = (h - size * 6) / 2 + 6;
      g.font = f(11, 600);
      for (var i = 0; i < 6; i++) {
        g.fillStyle = C.muted;
        g.textAlign = 'center';
        g.fillText(String(i + 1), ox + size * (i + 0.5), oy - 8);
        g.textAlign = 'right';
        g.fillText(String(i + 1), ox - 8, oy + size * (i + 0.5) + 4);
      }
      var lit = 0;
      for (var r = 0; r < 6; r++) {
        for (var c = 0; c < 6; c++) {
          var d = Math.abs((r + 1) - (c + 1));
          var on = d === sel;
          var x = ox + c * size, y = oy + r * size;
          var age = (performance.now() - selAt) / 1000 - (r + c) * 0.02;
          var k = on ? easeOut(clamp(age / 0.35, 0, 1)) : 0;
          g.fillStyle = '#1c232c';
          roundRect(g, x + 2, y + 2, size - 4, size - 4, 5);
          g.fill();
          if (k > 0) {
            lit++;
            g.fillStyle = C.accent;
            g.globalAlpha = 0.18 + 0.82 * k;
            roundRect(g, x + 2, y + 2, size - 4, size - 4, 5);
            g.fill();
            g.globalAlpha = 1;
          }
          g.fillStyle = on ? '#0d1117' : '#5b6672';
          g.font = f(Math.max(9, size * 0.3), on ? 700 : 500);
          g.textAlign = 'center';
          g.fillText(String(d), x + size / 2, y + size / 2 + size * 0.11);
        }
      }
    };
    return { destroy: stage.destroy };
  };

  /* ------------------------------------------------------------ 2. fence */
  VIZ.rectangleArea = function (host, api) {
    var ctr = controls(host);
    var slider = el('input', 'viz-slider');
    slider.type = 'range'; slider.min = '1'; slider.max = '19'; slider.step = '0.5'; slider.value = '4';
    slider.setAttribute('aria-label', 'width in metres');
    ctr.appendChild(slider);
    var out = readout(host, '');
    var stage = Stage(host, 1.0);
    var wv = 4, target = 4;

    function label() {
      var hgt = 20 - wv;
      out.innerHTML = wv.toFixed(1) + ' m &times; ' + hgt.toFixed(1) + ' m &nbsp;&rarr;&nbsp; <b>' +
        (wv * hgt).toFixed(0) + ' m&sup2;</b>';
    }
    slider.addEventListener('input', function () {
      target = parseFloat(slider.value);
      api.onInteract('slider');
    });
    label();

    stage.draw = function (g, w, h) {
      wv += (target - wv) * 0.25;
      label();
      var hgt = 20 - wv, area = wv * hgt;
      // top: the field, drawn to scale in a 20 x 20 world
      var topH = h * 0.62, pad = 16;
      var s = Math.min((w - pad * 2) / 20, (topH - pad * 2) / 20);
      var cx = w / 2, baseY = topH - pad;
      var rw = wv * s, rh = hgt * s;
      g.fillStyle = C.panel;
      g.fillRect(cx - 10 * s, baseY - 20 * s, 20 * s, 20 * s);
      g.strokeStyle = C.line; g.lineWidth = 1;
      for (var i = 0; i <= 20; i += 5) {
        g.beginPath(); g.moveTo(cx - 10 * s, baseY - i * s); g.lineTo(cx + 10 * s, baseY - i * s); g.stroke();
        g.beginPath(); g.moveTo(cx - 10 * s + i * s, baseY); g.lineTo(cx - 10 * s + i * s, baseY - 20 * s); g.stroke();
      }
      var x0 = cx - rw / 2, y0 = baseY - rh;
      var glow = clamp((area - 60) / 40, 0, 1);
      g.fillStyle = 'rgba(88,166,255,' + (0.16 + 0.24 * glow) + ')';
      g.fillRect(x0, y0, rw, rh);
      g.strokeStyle = C.accent; g.lineWidth = 2.5;
      g.strokeRect(x0, y0, rw, rh);
      g.fillStyle = C.fg; g.font = f(13, 700); g.textAlign = 'center';
      g.fillText(area.toFixed(0) + ' m²', cx, y0 + rh / 2 + 5);
      g.fillStyle = C.muted; g.font = f(10, 600);
      g.fillText(wv.toFixed(1) + ' m', cx, baseY + 12);
      g.save();
      g.translate(x0 - 8, y0 + rh / 2); g.rotate(-Math.PI / 2);
      g.fillText(hgt.toFixed(1) + ' m', 0, 0);
      g.restore();

      // bottom: area against width
      var by = topH + 16, bh = h - by - 14, bx = pad, bw = w - pad * 2;
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(bx, by + bh); g.lineTo(bx + bw, by + bh); g.stroke();
      g.beginPath();
      for (var k = 0; k <= 100; k++) {
        var ww = k / 100 * 20, aa = ww * (20 - ww);
        var px = bx + bw * (ww / 20), py = by + bh - bh * (aa / 110);
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokeStyle = C.dim; g.lineWidth = 2; g.stroke();
      var dx = bx + bw * (wv / 20), dy = by + bh - bh * (area / 110);
      g.strokeStyle = 'rgba(88,166,255,0.35)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(dx, by + bh); g.lineTo(dx, dy); g.stroke();
      g.fillStyle = C.accent;
      g.beginPath(); g.arc(dx, dy, 5, 0, 7); g.fill();
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('area as the width changes', bx, by - 2);
    };
    return { destroy: stage.destroy };
  };

  /* ------------------------------------------------------------- 3. shear */
  VIZ.shearSquare = function (host, api) {
    var out = readout(host, 'Drag the top of the block sideways.');
    var stage = Stage(host, 0.95);
    var k = 0, target = 0, dragging = false, touched = false, sx = 0, sk = 0;

    function down(ev) {
      dragging = true; sx = stage.pointer(ev).x; sk = target;
      if (!touched) { touched = true; api.onInteract('drag'); }
      ev.preventDefault();
    }
    function move(ev) {
      if (!dragging) return;
      var d = stage.pointer(ev).x - sx;
      target = clamp(sk + d / (stage.w * 0.28), -1.6, 1.6);
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
      k += (target - k) * 0.2;
      if (!touched) target = Math.sin(t * 1.1) * 0.45;      // it moves until you take over
      var pad = 30, side = Math.min(w - pad * 2, h - pad * 2 - 18);
      var baseY = h - pad - 6, cx = w / 2, x0 = cx - side / 2;

      // ground line
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad * 0.4, baseY + 0.5); g.lineTo(w - pad * 0.4, baseY + 0.5); g.stroke();

      // the deck of cards
      var n = 18, ch = side / n;
      for (var i = 0; i < n; i++) {
        var yb = baseY - (i + 1) * ch, frac = (i + 0.5) / n;
        var off = k * side * frac;
        g.fillStyle = i % 2 ? 'rgba(88,166,255,0.20)' : 'rgba(88,166,255,0.30)';
        g.fillRect(x0 + off, yb, side, ch - 0.6);
      }
      // outline
      g.beginPath();
      g.moveTo(x0, baseY);
      g.lineTo(x0 + side, baseY);
      g.lineTo(x0 + side + k * side, baseY - side);
      g.lineTo(x0 + k * side, baseY - side);
      g.closePath();
      g.strokeStyle = C.accent; g.lineWidth = 2.5; g.stroke();

      // height marker
      g.strokeStyle = C.muted; g.lineWidth = 1; g.setLineDash([3, 3]);
      var hx = x0 - 12;
      g.beginPath(); g.moveTo(hx, baseY); g.lineTo(hx, baseY - side); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.save(); g.translate(hx - 7, baseY - side / 2); g.rotate(-Math.PI / 2);
      g.fillText('height 10', 0, 0); g.restore();
      g.fillText('base 10', cx, baseY + 14);

      // drag handle
      var hxp = x0 + side + k * side, hyp = baseY - side;
      g.fillStyle = C.gold;
      g.beginPath(); g.arc(hxp, hyp, dragging ? 9 : 7, 0, 7); g.fill();
      if (!touched) {
        g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 4);
        g.beginPath(); g.arc(hxp, hyp, 14, 0, 7); g.strokeStyle = C.gold; g.lineWidth = 2; g.stroke();
        g.globalAlpha = 1;
      }
      // area readout, welded to the shape
      g.fillStyle = C.fg; g.font = f(15, 700); g.textAlign = 'center';
      g.fillText('area 100.0', cx + k * side / 2, baseY - side / 2 + 5);
      out.innerHTML = 'lean <b>' + (k * 10).toFixed(1) + ' m</b> &nbsp;·&nbsp; base 10 &nbsp;·&nbsp; height 10';
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
  };

  /* ------------------------------------------------------------- 4. bolts */
  VIZ.bayesBolts = function (host, api) {
    var ctr = controls(host);
    var out = readout(host, '1000 bolts. 800 from machine A, 200 from machine B. The bright ones are faulty.');
    var stage = Stage(host, 0.72);
    var COLS = 40, ROWS = 25, N = 1000;
    var bolts = [], faultyOnly = false, anim = 0;

    function build(randomise) {
      bolts = [];
      var aFaulty = 0, bFaulty = 0;
      for (var i = 0; i < N; i++) {
        var isB = i >= 800;
        var bad;
        if (randomise) bad = Math.random() < (isB ? 0.05 : 0.01);
        else bad = isB ? ((i - 800) % 20 === 7) : (i % 100 === 43);
        if (bad) { if (isB) bFaulty++; else aFaulty++; }
        bolts.push({ b: isB, bad: bad, i: i, fx: 0, fy: 0 });
      }
      var faulty = bolts.filter(function (x) { return x.bad; });
      faulty.forEach(function (x, j) { x.slot = j; });
      bolts.faulty = faulty.length; bolts.aF = aFaulty; bolts.bF = bFaulty;
      anim = 0;
      updateOut();
    }
    function updateOut() {
      if (!faultyOnly) {
        out.innerHTML = '1000 bolts &nbsp;·&nbsp; <span class="tag-a">800 from A</span> &nbsp;·&nbsp; ' +
          '<span class="tag-b">200 from B</span> &nbsp;·&nbsp; bright = faulty';
      } else {
        out.innerHTML = '<b>' + bolts.faulty + ' faulty</b> &nbsp;·&nbsp; <span class="tag-a">' +
          bolts.aF + ' from A</span> &nbsp;·&nbsp; <span class="tag-b">' + bolts.bF + ' from B</span>';
      }
    }
    build(false);

    var toggleBtn = button(ctr, 'Keep only the faulty ones', function () {
      faultyOnly = !faultyOnly;
      toggleBtn.textContent = faultyOnly ? 'Show all 1000 again' : 'Keep only the faulty ones';
      updateOut();
      api.onInteract('filter');
    });
    button(ctr, 'Fresh batch', function () {
      build(true);
      updateOut();
      api.onInteract('resample');
    });

    stage.draw = function (g, w, h) {
      anim += ((faultyOnly ? 1 : 0) - anim) * 0.12;
      if (Math.abs(anim - (faultyOnly ? 1 : 0)) < 0.01) anim = faultyOnly ? 1 : 0;
      var pad = 8;
      var cw = (w - pad * 2) / COLS, chh = (h - pad * 2 - 26) / ROWS;
      var cell = Math.min(cw, chh), r = Math.max(1.6, cell * 0.3);
      var gx = (w - cell * COLS) / 2 + cell / 2, gy = pad + cell / 2;
      var rowY = h * 0.66;
      if (anim < 1) {   // the line where machine A's 800 end and B's 200 begin
        g.globalAlpha = (1 - anim) * 0.5;
        g.strokeStyle = C.gold; g.lineWidth = 1; g.setLineDash([4, 4]);
        var splitY = gy + 20 * cell - cell / 2;
        g.beginPath(); g.moveTo(gx - cell / 2, splitY); g.lineTo(gx + (COLS - 0.5) * cell, splitY); g.stroke();
        g.setLineDash([]); g.globalAlpha = 1;
      }
      var fw = Math.min(w - 24, bolts.faulty * 16);
      for (var i = 0; i < bolts.length; i++) {
        var bo = bolts[i];
        var col = i % COLS, row = (i / COLS) | 0;
        var x0 = gx + col * cell, y0 = gy + row * cell;
        var x = x0, y = y0, alpha;
        if (bo.bad) {
          var tx = (w - fw) / 2 + (bo.slot + 0.5) * (fw / bolts.faulty);
          x = lerp(x0, tx, easeOut(anim)); y = lerp(y0, rowY, easeOut(anim));
          alpha = 1;
        } else {
          alpha = 1 - anim;
          if (alpha < 0.02) continue;
        }
        g.globalAlpha = bo.bad ? 1 : alpha * 0.34;
        g.fillStyle = bo.b ? C.gold : C.accent;
        g.beginPath();
        g.arc(x, y, bo.bad ? r * (1 + 0.7 * anim) * 1.35 : r, 0, 7);
        g.fill();
        g.globalAlpha = 1;
      }
      if (anim > 0.5) {
        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
        g.globalAlpha = (anim - 0.5) * 2;
        g.fillText('every faulty bolt in the batch', w / 2, rowY + 26);
        g.globalAlpha = 1;
      }
    };
    return { destroy: stage.destroy };
  };

  /* -------------------------------------------------------- 5. coin spread */
  VIZ.coinSpread = function (host, api) {
    var ctr = controls(host);
    var out = readout(host, 'No sets run yet.');
    var stage = Stage(host, 0.62);
    var n = 1000, RANGE = 100, BINW = 4;
    var bins = {}, total = 0, sumAbs = 0, queue = [], flying = [];

    function reset() { bins = {}; total = 0; sumAbs = 0; queue = []; flying = []; render(); }
    function render() {
      out.innerHTML = total === 0 ? 'No sets run yet.' :
        '<b>' + total + '</b> sets of ' + n + ' flips &nbsp;·&nbsp; average gap from half-way: <b>' +
        (sumAbs / total).toFixed(1) + '</b>';
    }
    function runSets(count) {
      for (var s = 0; s < count; s++) {
        var heads = 0;
        for (var i = 0; i < n; i++) heads += Math.random() < 0.5 ? 1 : 0;
        queue.push(heads - n / 2);
      }
      api.onInteract('run');
    }
    var nBtns = [];
    [250, 1000, 4000].forEach(function (v) {
      var b = button(ctr, v + ' flips', function () {
        n = v; reset();
        nBtns.forEach(function (x) { x.classList.toggle('on', x.dataset.n === String(v)); });
        api.onInteract('setn');
      });
      b.dataset.n = String(v);
      b.classList.add('small');
      if (v === 1000) b.classList.add('on');
      nBtns.push(b);
    });
    button(ctr, 'Run 100 sets', function () { runSets(100); }).classList.add('primary');

    stage.draw = function (g, w, h) {
      var pad = 14, axisY = h - 26, x0 = pad, x1 = w - pad;
      function px(dev) { return x0 + (dev + RANGE) / (RANGE * 2) * (x1 - x0); }

      for (var k = 0; k < 3 && queue.length; k++) {
        var dev = queue.shift();
        var key = Math.round(dev / BINW);
        bins[key] = (bins[key] || 0) + 1;
        total++; sumAbs += Math.abs(dev);
        flying.push({ dev: dev, k: key, count: bins[key], t: 0 });
      }
      if (queue.length || flying.length) render();

      // axis
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, axisY + 0.5); g.lineTo(x1, axisY + 0.5); g.stroke();
      g.font = f(10, 600); g.fillStyle = C.muted; g.textAlign = 'center';
      [-100, -50, 0, 50, 100].forEach(function (v) {
        g.beginPath(); g.moveTo(px(v), axisY); g.lineTo(px(v), axisY + 4); g.stroke();
        g.fillText(v === 0 ? 'half-way' : (v > 0 ? '+' + v : String(v)), px(v), axisY + 16);
      });
      g.strokeStyle = 'rgba(230,237,243,0.35)';
      g.beginPath(); g.moveTo(px(0), axisY); g.lineTo(px(0), pad); g.stroke();

      var maxCount = 1;
      for (var kk in bins) if (bins[kk] > maxCount) maxCount = bins[kk];
      var unit = Math.min(9, (axisY - pad - 10) / Math.max(maxCount, 10));
      var bw = Math.max(2, (x1 - x0) / (RANGE * 2 / BINW) - 1.5);

      for (var key2 in bins) {
        var kv = parseInt(key2, 10), cnt = bins[key2];
        var cx = px(kv * BINW);
        for (var c = 0; c < cnt; c++) {
          var y = axisY - 2 - (c + 1) * unit;
          if (y < pad) break;
          var far = Math.abs(kv * BINW) > 40;
          g.fillStyle = far ? 'rgba(139,148,158,0.55)' : 'rgba(88,166,255,0.75)';
          g.fillRect(cx - bw / 2, y, bw, Math.max(1.5, unit - 1));
        }
      }
      g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
      g.fillText('heads minus half of the flips', x0, pad + 2);
    };
    return { destroy: stage.destroy };
  };

  /* ------------------------------------------------------- 6. HH versus HT */
  VIZ.hhVsHt = function (host, api) {
    var ctr = controls(host);
    var out = readout(host, 'Two races: how long until heads-heads, and until heads-tails?');
    var stage = Stage(host, 0.66);
    var lanes = [
      { name: 'heads then heads', target: 'HH', races: 0, flips: 0, seq: [], colour: C.accent },
      { name: 'heads then tails', target: 'HT', races: 0, flips: 0, seq: [], colour: C.gold }
    ];
    var pending = 0;

    function oneRace(lane) {
      var prev = '', n = 0, seq = [];
      for (var guard = 0; guard < 500; guard++) {
        var c = Math.random() < 0.5 ? 'H' : 'T';
        n++; seq.push(c);
        if (prev + c === lane.target) break;
        prev = c;
      }
      lane.races++; lane.flips += n; lane.seq = seq.slice(-14);
    }
    function render() {
      if (!lanes[0].races) { out.textContent = 'Two races: how long until heads-heads, and until heads-tails?'; return; }
      out.innerHTML = '<b>' + lanes[0].races + '</b> races each &nbsp;·&nbsp; ' +
        '<span class="tag-a">heads-heads ' + (lanes[0].flips / lanes[0].races).toFixed(2) + '</span> &nbsp;·&nbsp; ' +
        '<span class="tag-b">heads-tails ' + (lanes[1].flips / lanes[1].races).toFixed(2) + '</span>';
    }
    button(ctr, 'Run 200 races', function () { pending += 200; api.onInteract('run'); }).classList.add('primary');
    button(ctr, 'Reset', function () {
      lanes.forEach(function (l) { l.races = 0; l.flips = 0; l.seq = []; });
      pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');

    stage.draw = function (g, w, h) {
      var step = Math.min(pending, 6);
      for (var s = 0; s < step; s++) { oneRace(lanes[0]); oneRace(lanes[1]); }
      pending -= step;
      if (step) render();

      var pad = 12, laneH = (h - pad * 2) / 2;
      for (var i = 0; i < 2; i++) {
        var L = lanes[i], y = pad + i * laneH;
        g.fillStyle = C.muted; g.font = f(11, 600); g.textAlign = 'left';
        g.fillText(L.name, pad, y + 12);

        // last sequence, as coins
        var cw = Math.min(20, (w - pad * 2) / 14);
        for (var j = 0; j < L.seq.length; j++) {
          var x = pad + j * cw, isEnd = j >= L.seq.length - 2;
          g.beginPath(); g.arc(x + cw / 2, y + 30, cw * 0.38, 0, 7);
          g.fillStyle = isEnd ? L.colour : C.dim;
          g.fill();
          g.fillStyle = isEnd ? '#0d1117' : C.muted;
          g.font = f(Math.max(8, cw * 0.42), 700); g.textAlign = 'center';
          g.fillText(L.seq[j], x + cw / 2, y + 34);
        }
        // average bar — the number sits above it, never on top of it
        var avg = L.races ? L.flips / L.races : 0;
        var barY = y + 54, barW = w - pad * 2, maxV = 8;
        g.textAlign = 'right';
        g.font = f(12, 800);
        g.fillStyle = L.races ? L.colour : C.dim;
        g.fillText(L.races ? avg.toFixed(2) + ' flips on average' : 'not run yet', w - pad, y + 12);
        g.fillStyle = C.panel;
        roundRect(g, pad, barY, barW, 14, 7); g.fill();
        g.fillStyle = L.colour;
        roundRect(g, pad, barY, Math.max(2, barW * clamp(avg / maxV, 0, 1)), 14, 7); g.fill();
        g.font = f(9, 600); g.textAlign = 'center';
        for (var t = 2; t <= 8; t += 2) {
          var tx = pad + barW * (t / maxV);
          g.strokeStyle = 'rgba(13,17,23,0.55)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(tx, barY); g.lineTo(tx, barY + 14); g.stroke();
          g.fillStyle = '#4a5566';
          g.fillText(String(t), tx, barY + 25);
        }
      }
    };
    return { destroy: stage.destroy };
  };

  /* --------------------------------------------------- 7. binary search */
  VIZ.binarySearch = function (host, api) {
    var ctr = controls(host);
    var out = readout(host, '');
    var stage = Stage(host, 0.5);
    var lo, hi, target, asked, lastAnswer, flash = 0, done;

    function reset() {
      lo = 1; hi = 1000; asked = 0; lastAnswer = null; done = false;
      target = 1 + Math.floor(Math.random() * 1000);
      render();
    }
    function render() {
      if (done) {
        out.innerHTML = 'Found <b>' + target + '</b> in <b>' + asked + '</b> questions.';
        askBtn.textContent = 'Play again';
      } else {
        var mid = Math.floor((lo + hi) / 2);
        out.innerHTML = (asked === 0 ? 'A number from 1 to 1000 is hidden. ' : '') +
          '<b>' + (hi - lo + 1) + '</b> still possible.';
        askBtn.textContent = 'Ask: is it more than ' + mid + '?';
      }
    }
    var askBtn = button(ctr, '', function () {
      if (done) { reset(); api.onInteract('replay'); return; }
      var mid = Math.floor((lo + hi) / 2);
      asked++;
      if (target > mid) { lo = mid + 1; lastAnswer = 'yes'; } else { hi = mid; lastAnswer = 'no'; }
      flash = performance.now();
      if (lo === hi) done = true;
      render();
      api.onInteract('ask');
    });
    askBtn.classList.add('primary');
    reset();

    stage.draw = function (g, w, h) {
      var pad = 16, barY = h * 0.46, barH = 26, x0 = pad, x1 = w - pad;
      function px(v) { return x0 + (v - 1) / 999 * (x1 - x0); }

      g.fillStyle = C.panel;
      roundRect(g, x0, barY, x1 - x0, barH, 6); g.fill();

      var lx = px(lo), rx = px(hi);
      var age = clamp((performance.now() - flash) / 380, 0, 1);
      g.fillStyle = done ? C.good : C.accent;
      g.globalAlpha = 0.35 + 0.35 * (1 - age);
      roundRect(g, lx, barY, Math.max(3, rx - lx), barH, 5); g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = done ? C.good : C.accent; g.lineWidth = 2;
      roundRect(g, lx - 0.5, barY - 0.5, Math.max(3, rx - lx) + 1, barH + 1, 5); g.stroke();

      if (!done) {
        var mid = Math.floor((lo + hi) / 2), mx = px(mid);
        g.strokeStyle = C.gold; g.lineWidth = 2; g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(mx, barY - 12); g.lineTo(mx, barY + barH + 12); g.stroke();
        g.setLineDash([]);
        g.fillStyle = C.gold; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(String(mid), mx, barY - 16);
      } else {
        g.fillStyle = C.good; g.font = f(13, 700); g.textAlign = 'center';
        g.fillText(String(target), clamp(px(target), x0 + 12, x1 - 12), barY - 14);
      }

      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'left';
      g.fillText('1', x0, barY + barH + 16);
      g.textAlign = 'right';
      g.fillText('1000', x1, barY + barH + 16);

      // questions used, as pips
      g.textAlign = 'left';
      g.fillText('questions asked', x0, 16);
      for (var i = 0; i < 12; i++) {
        var cx = x0 + 8 + i * 15, cy = 30;
        g.beginPath(); g.arc(cx, cy, 5, 0, 7);
        g.fillStyle = i < asked ? (i < 10 ? C.accent : C.bad) : C.dim;
        g.fill();
      }
      if (lastAnswer) {
        g.fillStyle = lastAnswer === 'yes' ? C.good : C.bad;
        g.font = f(12, 700); g.textAlign = 'right';
        g.globalAlpha = 0.4 + 0.6 * (1 - age);
        g.fillText(lastAnswer === 'yes' ? 'yes, bigger' : 'no, smaller', x1, 30);
        g.globalAlpha = 1;
      }
    };
    return { destroy: stage.destroy };
  };

  /* --------------------------------------------------------------- kit --- */
  var NOOP = function () {};

  global.QQViz = {
    kit: {
      C: C, FONT: FONT, f: f, el: el, clamp: clamp, lerp: lerp, easeOut: easeOut,
      roundRect: roundRect, Stage: Stage, controls: controls, readout: readout,
      button: button,
      /* a range input wired into the viz-controls row */
      slider: function (parent, opts, onInput) {
        var s = el('input', 'viz-slider');
        s.type = 'range';
        s.min = opts.min; s.max = opts.max; s.step = opts.step || 1;
        s.value = opts.value;
        s.setAttribute('aria-label', opts.label || 'slider');
        s.addEventListener('input', function () { onInput(parseFloat(s.value)); });
        parent.appendChild(s);
        return s;
      },
      /* choice chips for a `tap` question: the visual owns the picture, this
       * owns the labels underneath it, so every tap target is thumb-sized */
      regionChips: function (host, regions, onPick) {
        var row = el('div', 'viz-regions');
        var btns = [];
        regions.forEach(function (r) {
          var b = el('button', 'viz-region', r.label);
          b.type = 'button';
          b.dataset.region = r.id;
          b.addEventListener('click', function () {
            btns.forEach(function (x) { x.classList.toggle('on', x === b); });
            onPick(r.id);
          });
          row.appendChild(b); btns.push(b);
        });
        host.appendChild(row);
        return {
          row: row,
          select: function (id) {
            btns.forEach(function (x) { x.classList.toggle('on', x.dataset.region === id); });
          }
        };
      },
      /* least-squares polynomial fit, shared with verify_answers.py */
      polyfit: function (pts, deg) {
        var n = deg + 1, i, j, r, k, A = [];
        for (i = 0; i < n; i++) {
          A.push([]);
          for (j = 0; j < n; j++) {
            var s = 0;
            for (k = 0; k < pts.length; k++) s += Math.pow(pts[k][0], i + j);
            A[i].push(s);
          }
          var t = 0;
          for (k = 0; k < pts.length; k++) t += pts[k][1] * Math.pow(pts[k][0], i);
          A[i].push(t);
        }
        for (var c = 0; c < n; c++) {
          var p = c;
          for (r = c; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
          var tmp = A[c]; A[c] = A[p]; A[p] = tmp;
          if (Math.abs(A[c][c]) < 1e-14) continue;
          for (r = 0; r < n; r++) {
            if (r === c) continue;
            var fct = A[r][c] / A[c][c];
            for (k = c; k <= n; k++) A[r][k] -= fct * A[c][k];
          }
        }
        var co = [];
        for (i = 0; i < n; i++) co.push(Math.abs(A[i][i]) > 1e-14 ? A[i][n] / A[i][i] : 0);
        return co;
      },
      polyval: function (co, x) {
        var y = 0;
        for (var i = 0; i < co.length; i++) y += co[i] * Math.pow(x, i);
        return y;
      }
    },

    register: function (id, fn) { VIZ[id] = fn; },
    has: function (id) { return !!VIZ[id]; },
    ids: function () { return Object.keys(VIZ); },

    mount: function (id, host, api) {
      host.innerHTML = '';
      api = api || {};
      api.onInteract = api.onInteract || NOOP;
      api.onSelect = api.onSelect || NOOP;
      api.locked = api.locked || function () { return false; };
      api.data = api.data || (global.QQ_DATA && global.QQ_DATA.vizData) || {};
      if (!VIZ[id]) {
        host.appendChild(el('div', 'viz-missing', 'visual missing: ' + id));
        return { destroy: NOOP };
      }
      try {
        return VIZ[id](host, api) || { destroy: NOOP };
      } catch (e) {
        console.error('[qq] viz failed', id, e);
        host.appendChild(el('div', 'viz-missing', 'visual failed: ' + id));
        return { destroy: NOOP };
      }
    }
  };
})(window);
