/* QQ visuals — THE ENGINE KIT. Ten reusable interactive visuals.
 *
 * js/viz.js owns the canvas plumbing (QQViz.kit) and the register/mount seam.
 * This file sits on top of it and owns the *shapes* of visual that keep coming
 * back: a grid of outcomes you can probe, a simulation you can re-run, a slider
 * over a curve, a population you can filter, a process you can step through, a
 * network you can tap, a picture you drag, a race between two strategies, a bar
 * chart you can interrogate, and a labelled picture for `tap` questions.
 *
 * A question's visual is then a dozen lines rather than a hundred, and every
 * visual on the road behaves the same way under the thumb.
 *
 * ---------------------------------------------------------------------------
 * HOW TO USE ONE
 * ---------------------------------------------------------------------------
 *   QQViz.register('myViz', QQLab.sim({
 *     trial: function () { return coin() + coin(); },
 *     label: 'heads', mode: 'hist', min: 0, max: 2
 *   }));
 *
 * Every engine returns a `function (host, api)` — exactly what QQViz.register
 * wants. Every one of them is interactive: nothing here is a still picture.
 * Every simulation samples for real; nothing is nudged towards the answer.
 *
 * House rules the engines enforce so no caller has to remember them:
 *   - work is spread across animation frames, so a 20,000-trial button never
 *     freezes a phone;
 *   - the readout above the canvas is the only place text is allowed to be
 *     long, and it never prints the answer before the player has driven the
 *     interaction there themselves;
 *   - api.onInteract is fired on the first real touch, once, by the engine;
 *   - everything is sized for 390px wide and a 42px thumb.
 * ---------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, el = K.el, clamp = K.clamp, lerp = K.lerp;
  var easeOut = K.easeOut, roundRect = K.roundRect;

  function now() { return performance.now(); }
  function coin() { return Math.random() < 0.5 ? 1 : 0; }
  function pickInt(n) { return Math.floor(Math.random() * n); }
  function die() { return 1 + pickInt(6); }
  function fmt(v) {
    if (v === Math.round(v)) return String(v);
    return Math.abs(v) >= 100 ? v.toFixed(0) : (Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2));
  }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* A palette that keeps series apart without anybody choosing colours. */
  var SERIES = [C.accent, C.gold, '#3fb950', '#db61a2', '#a371f7', '#f78166'];

  /* Text that must not spill off a 390px phone. */
  function fitText(g, text, maxW, startPx, weight) {
    var size = startPx;
    g.font = f(size, weight || 600);
    while (size > 8 && g.measureText(text).width > maxW) {
      size -= 1;
      g.font = f(size, weight || 600);
    }
    return size;
  }

  /* Axis-less bar row: the workhorse under sim/tally/bars. */
  function drawBars(g, x, y, w, h, series, opts) {
    opts = opts || {};
    var n = series.length;
    if (!n) return;
    var max = opts.max || 0;
    for (var i = 0; i < n; i++) max = Math.max(max, series[i].value);
    if (max <= 0) max = 1;
    var gap = n > 14 ? 1.5 : (n > 8 ? 3 : 6);
    var bw = (w - gap * (n - 1)) / n;
    for (var j = 0; j < n; j++) {
      var s = series[j];
      var bh = Math.max(s.value > 0 ? 2 : 0, (s.value / max) * h);
      var bx = x + j * (bw + gap);
      g.fillStyle = s.colour || (s.on ? C.accent : 'rgba(88,166,255,0.45)');
      roundRect(g, bx, y + h - bh, bw, bh, Math.min(4, bw / 2));
      g.fill();
      if (opts.labels !== false && bw > 11) {
        g.fillStyle = s.on ? C.fg : C.muted;
        var size = Math.min(11, Math.max(8, bw * 0.55));
        g.font = f(size, s.on ? 700 : 500);
        g.textAlign = 'center';
        g.fillText(s.label, bx + bw / 2, y + h + size + 2);
      }
      if (opts.values && s.value > 0 && bw > 15) {
        g.fillStyle = s.on ? C.fg : C.muted;
        g.font = f(Math.min(11, bw * 0.5), 700);
        g.textAlign = 'center';
        g.fillText(opts.valueFmt ? opts.valueFmt(s.value) : fmt(s.value), bx + bw / 2, y + h - bh - 4);
      }
    }
  }

  var LAB = {};

  /* =======================================================================
   * 1. sim — run a trial many times and watch the answer settle.
   *
   *   trial()       one run; returns a number, or true/false for mode 'rate'
   *   mode          'hist'  numeric histogram (default)
   *                 'rate'  proportion of true
   *                 'mean'  histogram plus a big running mean
   *   min,max,step  histogram domain (auto-widening if omitted)
   *   label         what one trial measures, e.g. 'flips'
   *   batches       [10, 200] — buttons, biggest gets the primary style
   *   target        optional value to mark on the axis
   *   statLine(st)  optional custom readout HTML
   * ======================================================================= */
  LAB.sim = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, spec.idle || 'Nothing run yet.');
      var stage = K.Stage(host, spec.aspect || 0.66);
      var mode = spec.mode || 'hist';
      var bins = {}, n = 0, sum = 0, sumsq = 0, hits = 0, pending = 0, last = null;
      var lo = spec.min, hi = spec.max, step = spec.step || 1;
      var maxTrialsPerFrame = spec.perFrame || 400;

      function record(v) {
        n++;
        if (mode === 'rate') { hits += v ? 1 : 0; last = v; return; }
        var x = +v;
        sum += x; sumsq += x * x; last = x;
        if (lo == null || x < lo) lo = x;
        if (hi == null || x > hi) hi = x;
        var key = Math.round(x / step) * step;
        bins[key] = (bins[key] || 0) + 1;
      }
      function render() {
        if (!n) { out.innerHTML = spec.idle || 'Nothing run yet.'; return; }
        if (spec.statLine) {
          out.innerHTML = spec.statLine({ n: n, mean: sum / n, hits: hits, rate: hits / n, last: last });
          return;
        }
        if (mode === 'rate') {
          out.innerHTML = '<b>' + commas(hits) + '</b> of ' + commas(n) + ' &nbsp;·&nbsp; ' +
            '<b>' + (hits / n * 100).toFixed(1) + '%</b> ' + (spec.rateLabel || '');
        } else {
          out.innerHTML = '<b>' + commas(n) + '</b> runs &nbsp;·&nbsp; average ' +
            (spec.label || '') + ' <b>' + (sum / n).toFixed(spec.dp == null ? 2 : spec.dp) + '</b>';
        }
      }
      (spec.batches || [20, 500]).forEach(function (b, i, arr) {
        var btn = K.button(ctr, 'Run ' + commas(b), function () {
          pending += b;
          api.onInteract('run');
        });
        if (i === arr.length - 1) btn.classList.add('primary'); else btn.classList.add('small');
      });
      K.button(ctr, 'Reset', function () {
        bins = {}; n = 0; sum = 0; sumsq = 0; hits = 0; pending = 0; last = null;
        lo = spec.min; hi = spec.max;
        render();
        api.onInteract('reset');
      }).classList.add('small');
      render();

      stage.draw = function (g, w, h) {
        var take = Math.min(pending, maxTrialsPerFrame);
        for (var i = 0; i < take; i++) record(spec.trial());
        pending -= take;
        if (take) render();

        var pad = 14, axisY = h - 24, top = 22;
        if (mode === 'rate') {
          /* One big proportion bar. The caption sits at the very top, the
           * marker's label just under it, and the bar itself in the middle —
           * three separate lines, because on a 390px phone anything else
           * collides. */
          var bw = w - pad * 2, bh = 38, by = Math.max(46, h * 0.42);
          g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'left';
          g.fillText(spec.barLabel || (spec.rateLabel || ''), pad, 16);
          g.fillStyle = C.panel; roundRect(g, pad, by, bw, bh, 8); g.fill();
          var p = n ? hits / n : 0;
          g.fillStyle = C.accent; roundRect(g, pad, by, Math.max(2, bw * p), bh, 8); g.fill();
          if (spec.mark != null) {
            var mx = pad + bw * spec.mark;
            g.strokeStyle = C.gold; g.lineWidth = 2; g.setLineDash([4, 3]);
            g.beginPath(); g.moveTo(mx, by - 16); g.lineTo(mx, by + bh + 12); g.stroke();
            g.setLineDash([]);
            g.fillStyle = C.gold; g.font = f(10, 700);
            g.textAlign = mx > w * 0.62 ? 'right' : 'left';
            g.fillText(spec.markLabel || '', mx + (mx > w * 0.62 ? -6 : 6), by - 8);
          }
          g.fillStyle = n ? '#0d1117' : C.muted; g.font = f(16, 800); g.textAlign = 'left';
          g.fillText(n ? (p * 100).toFixed(1) + '%' : 'press run', pad + 12, by + 26);
          return;
        }

        var keys = Object.keys(bins).map(Number).sort(function (a, b) { return a - b; });
        if (!keys.length) {
          g.fillStyle = C.muted; g.font = f(12, 600); g.textAlign = 'center';
          g.fillText(spec.emptyHint || 'press run to sample it', w / 2, h / 2);
          return;
        }
        var kmin = Math.min.apply(null, keys), kmax = Math.max.apply(null, keys);
        if (spec.min != null) kmin = Math.min(kmin, spec.min);
        if (spec.max != null) kmax = Math.max(kmax, spec.max);
        var slots = Math.round((kmax - kmin) / step) + 1;
        var maxCount = 1;
        keys.forEach(function (k) { maxCount = Math.max(maxCount, bins[k]); });
        var bwid = Math.max(1.5, (w - pad * 2) / slots - (slots > 30 ? 0.5 : 2));
        for (var s = 0; s < slots; s++) {
          var key = kmin + s * step, cnt = bins[key] || 0;
          if (!cnt) continue;
          var bx = pad + (w - pad * 2) * (s / slots) + 1;
          var bhh = Math.max(2, (cnt / maxCount) * (axisY - top));
          g.fillStyle = (spec.highlight && spec.highlight(key)) ? C.gold : 'rgba(88,166,255,0.75)';
          g.fillRect(bx, axisY - bhh, bwid, bhh);
        }
        g.strokeStyle = C.line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(pad, axisY + 0.5); g.lineTo(w - pad, axisY + 0.5); g.stroke();
        g.fillStyle = C.muted; g.font = f(10, 600);
        g.textAlign = 'left'; g.fillText(fmt(kmin), pad, axisY + 14);
        g.textAlign = 'right'; g.fillText(fmt(kmax), w - pad, axisY + 14);
        g.textAlign = 'left'; g.font = f(10, 500);
        g.fillText(spec.axisLabel || (spec.label || ''), pad, top - 8);
        if (n) {
          /* The mean is a line in the plot; its VALUE is pinned to the top
           * right corner rather than floating over the line, because when the
           * average sits near the left edge a floating tag lands straight on
           * top of the axis label. */
          var mean = sum / n;
          var mx2 = pad + (w - pad * 2) * ((mean - kmin) / Math.max(1e-9, (kmax - kmin + step)));
          g.strokeStyle = C.gold; g.lineWidth = 2;
          g.beginPath(); g.moveTo(mx2, top - 4); g.lineTo(mx2, axisY); g.stroke();
          g.fillStyle = C.gold; g.font = f(11, 800); g.textAlign = 'right';
          g.fillText('avg ' + mean.toFixed(spec.dp == null ? 2 : spec.dp), w - pad, top - 8);
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 2. tally — a simulation whose outcome is a CATEGORY, not a number.
   *   trial() -> one of spec.cats
   * ======================================================================= */
  LAB.tally = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, spec.idle || 'Nothing run yet.');
      var stage = K.Stage(host, spec.aspect || 0.6);
      var counts = {}, n = 0, pending = 0;
      spec.cats.forEach(function (c) { counts[c] = 0; });

      function render() {
        if (!n) { out.innerHTML = spec.idle || 'Nothing run yet.'; return; }
        var parts = spec.cats.map(function (c, i) {
          return '<span style="color:' + SERIES[i % SERIES.length] + ';font-weight:700">' +
            c + ' ' + (counts[c] / n * 100).toFixed(1) + '%</span>';
        });
        out.innerHTML = '<b>' + commas(n) + '</b> runs &nbsp;·&nbsp; ' + parts.join(' &nbsp;·&nbsp; ');
      }
      (spec.batches || [20, 500]).forEach(function (b, i, arr) {
        var btn = K.button(ctr, 'Run ' + commas(b), function () { pending += b; api.onInteract('run'); });
        if (i === arr.length - 1) btn.classList.add('primary'); else btn.classList.add('small');
      });
      K.button(ctr, 'Reset', function () {
        n = 0; pending = 0;
        spec.cats.forEach(function (c) { counts[c] = 0; });
        render(); api.onInteract('reset');
      }).classList.add('small');
      render();

      stage.draw = function (g, w, h) {
        var take = Math.min(pending, 300);
        for (var i = 0; i < take; i++) { var c = spec.trial(); if (c in counts) counts[c]++; n++; }
        pending -= take;
        if (take) render();
        var pad = 16, top = 18, base = h - 26;
        var series = spec.cats.map(function (c, i) {
          return { label: c, value: counts[c], colour: SERIES[i % SERIES.length] };
        });
        drawBars(g, pad, top, w - pad * 2, base - top, series, { values: true, valueFmt: commas });
        g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
        g.fillText(spec.axisLabel || 'how often each one happened', pad, h - 4);
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 3. dial — a slider over a curve. The player drags a parameter and watches
   *    the thing it controls. Optional second curve for a comparison.
   *   f(x) -> y, and readout(x, y) -> HTML
   * ======================================================================= */
  LAB.dial = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, '');
      var stage = K.Stage(host, spec.aspect || 0.66);
      var x = spec.value == null ? (spec.min + spec.max) / 2 : spec.value;
      var shown = x;

      function render() {
        out.innerHTML = spec.readout(x, spec.f(x));
      }
      K.slider(ctr, {
        min: spec.min, max: spec.max, step: spec.step || 1, value: x,
        label: spec.label || 'value'
      }, function (v) { x = v; render(); api.onInteract('slider'); });
      render();

      stage.draw = function (g, w, h) {
        shown += (x - shown) * 0.25;
        var pad = 16, left = pad + 4, right = w - pad, top = 20, base = h - 26;
        var N = 140, i, xs, ys, px, py;
        var vals = [], v2 = [];
        var ymin = spec.ymin, ymax = spec.ymax;
        for (i = 0; i <= N; i++) {
          xs = spec.min + (spec.max - spec.min) * (i / N);
          ys = spec.f(xs);
          vals.push([xs, ys]);
          if (spec.f2) { var y2 = spec.f2(xs); v2.push([xs, y2]); }
        }
        var all = vals.concat(v2).map(function (p) { return p[1]; })
          .filter(function (y) { return isFinite(y); });
        if (ymin == null) ymin = Math.min.apply(null, all);
        if (ymax == null) ymax = Math.max.apply(null, all);
        if (ymax - ymin < 1e-9) ymax = ymin + 1;
        var padY = (ymax - ymin) * 0.12;
        ymin -= padY; ymax += padY;
        function X(v) { return left + (right - left) * ((v - spec.min) / (spec.max - spec.min)); }
        function Y(v) { return base - (base - top) * ((v - ymin) / (ymax - ymin)); }

        g.strokeStyle = C.line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(left, base + 0.5); g.lineTo(right, base + 0.5); g.stroke();
        if (ymin < 0 && ymax > 0) {
          g.strokeStyle = 'rgba(139,148,158,0.25)';
          g.beginPath(); g.moveTo(left, Y(0)); g.lineTo(right, Y(0)); g.stroke();
        }
        if (spec.f2) {
          g.beginPath();
          for (i = 0; i < v2.length; i++) {
            px = X(v2[i][0]); py = Y(v2[i][1]);
            if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.strokeStyle = 'rgba(210,153,34,0.75)'; g.lineWidth = 2; g.stroke();
        }
        g.beginPath();
        for (i = 0; i < vals.length; i++) {
          px = X(vals[i][0]); py = Y(vals[i][1]);
          if (!isFinite(py)) continue;
          if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.strokeStyle = C.accent; g.lineWidth = 2.5; g.stroke();

        if (spec.fill) {
          g.lineTo(X(spec.max), base); g.lineTo(X(spec.min), base); g.closePath();
          g.fillStyle = 'rgba(88,166,255,0.12)'; g.fill();
        }
        (spec.marks || []).forEach(function (m) {
          var mx = X(m.x);
          g.strokeStyle = 'rgba(139,148,158,0.4)'; g.lineWidth = 1; g.setLineDash([3, 3]);
          g.beginPath(); g.moveTo(mx, top); g.lineTo(mx, base); g.stroke();
          g.setLineDash([]);
          g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
          g.fillText(m.label, clamp(mx, left + 16, right - 16), top - 6);
        });
        var cx = X(shown), cy = Y(spec.f(shown));
        g.strokeStyle = 'rgba(88,166,255,0.35)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(cx, base); g.lineTo(cx, cy); g.stroke();
        g.fillStyle = C.accent;
        g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fill();
        g.fillStyle = C.muted; g.font = f(10, 600);
        g.textAlign = 'left'; g.fillText(spec.xmin != null ? spec.xmin : fmt(spec.min), left, base + 14);
        g.textAlign = 'right'; g.fillText(spec.xmax != null ? spec.xmax : fmt(spec.max), right, base + 14);
        if (spec.yLabel) {
          g.textAlign = 'left'; g.font = f(10, 500);
          g.fillText(spec.yLabel, left, top - 6);
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 4. grid — every outcome as a cell, chips to light up the ones that match.
   *   rows, cols, key(r, c) -> label, chips: [label], caption(chip, hits, total)
   * ======================================================================= */
  LAB.grid = function (spec) {
    return function (host, api) {
      var chips = K.controls(host);
      var out = K.readout(host, spec.idle || 'Tap one to light it up.');
      var stage = K.Stage(host, spec.aspect || 0.9);
      var sel = null, selAt = 0;
      var total = spec.rows * spec.cols;
      var chipEls = [];

      function counts(label) {
        var c = 0;
        for (var r = 0; r < spec.rows; r++)
          for (var k = 0; k < spec.cols; k++)
            if (String(spec.key(r, k)) === String(label)) c++;
        return c;
      }
      spec.chips.forEach(function (label) {
        var b = el('button', 'viz-chip', String(label));
        b.type = 'button';
        b.addEventListener('click', function () {
          sel = String(label); selAt = now();
          chipEls.forEach(function (x) { x.classList.toggle('on', x.textContent === String(label)); });
          var hit = counts(label);
          out.innerHTML = spec.caption ? spec.caption(label, hit, total)
            : '<b>' + hit + '</b> of the ' + total + ' squares';
          api.onInteract('chip');
        });
        chips.appendChild(b); chipEls.push(b);
      });

      stage.draw = function (g, w, h) {
        var pad = spec.labels === false ? 8 : 26;
        var size = Math.min((w - pad - 8) / spec.cols, (h - pad - 8) / spec.rows);
        var ox = (w - size * spec.cols) / 2 + (spec.labels === false ? 0 : 6);
        var oy = (h - size * spec.rows) / 2 + (spec.labels === false ? 0 : 6);
        g.font = f(11, 600);
        if (spec.labels !== false) {
          for (var i = 0; i < spec.cols; i++) {
            g.fillStyle = C.muted; g.textAlign = 'center';
            g.fillText(spec.colLabel ? spec.colLabel(i) : String(i + 1), ox + size * (i + 0.5), oy - 8);
          }
          for (var j = 0; j < spec.rows; j++) {
            g.fillStyle = C.muted; g.textAlign = 'right';
            g.fillText(spec.rowLabel ? spec.rowLabel(j) : String(j + 1), ox - 8, oy + size * (j + 0.5) + 4);
          }
        }
        for (var r = 0; r < spec.rows; r++) {
          for (var c = 0; c < spec.cols; c++) {
            var val = String(spec.key(r, c));
            var on = sel !== null && val === sel;
            var x = ox + c * size, y = oy + r * size;
            var age = (now() - selAt) / 1000 - (r + c) * 0.02;
            var kk = on ? easeOut(clamp(age / 0.35, 0, 1)) : 0;
            g.fillStyle = '#1c232c';
            roundRect(g, x + 2, y + 2, size - 4, size - 4, 5); g.fill();
            if (kk > 0) {
              g.fillStyle = C.accent; g.globalAlpha = 0.18 + 0.82 * kk;
              roundRect(g, x + 2, y + 2, size - 4, size - 4, 5); g.fill();
              g.globalAlpha = 1;
            }
            var txt = spec.cellText ? spec.cellText(r, c) : val;
            if (txt !== '' && size > 12) {
              g.fillStyle = on ? '#0d1117' : '#5b6672';
              g.font = f(Math.max(8, size * (String(txt).length > 2 ? 0.24 : 0.32)), on ? 700 : 500);
              g.textAlign = 'center';
              g.fillText(String(txt), x + size / 2, y + size / 2 + size * 0.11);
            }
          }
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 5. dots — a whole population as dots, filtered one step at a time.
   *   n, group(i) -> {colour, tag}, steps: [{label, keep(i)}], caption(kept)
   * ======================================================================= */
  LAB.dots = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, '');
      var stage = K.Stage(host, spec.aspect || 0.72);
      var N = spec.n || 1000;
      var pop = [], stepAt = 0, anim = 0;

      function build() {
        pop = [];
        for (var i = 0; i < N; i++) pop.push(spec.member(i));
        stepAt = 0; anim = 0;
        render();
      }
      function kept() {
        var out2 = [];
        for (var i = 0; i < pop.length; i++) {
          var ok = true;
          for (var s = 0; s < stepAt; s++) if (!spec.steps[s].keep(pop[i], i)) { ok = false; break; }
          if (ok) out2.push(pop[i]);
        }
        return out2;
      }
      function render() {
        var k = kept();
        out.innerHTML = spec.caption(k, stepAt, pop);
      }
      var nextBtn = K.button(ctr, spec.steps[0].label, function () {
        if (stepAt < spec.steps.length) {
          stepAt++; anim = 0;
          nextBtn.textContent = stepAt < spec.steps.length ? spec.steps[stepAt].label : 'Done';
          nextBtn.disabled = stepAt >= spec.steps.length;
          render();
          api.onInteract('filter');
        }
      });
      nextBtn.classList.add('primary');
      K.button(ctr, spec.resampleLabel || 'Fresh sample', function () {
        build();
        nextBtn.textContent = spec.steps[0].label;
        nextBtn.disabled = false;
        api.onInteract('resample');
      }).classList.add('small');
      build();

      stage.draw = function (g, w, h) {
        anim = Math.min(1, anim + 0.06);
        var k = kept();
        var cols = Math.ceil(Math.sqrt(N * (w / Math.max(1, h))));
        var rows = Math.ceil(N / cols);
        var cell = Math.min((w - 12) / cols, (h - 26) / rows);
        var ox = (w - cell * cols) / 2 + cell / 2, oy = 8 + cell / 2;
        var kcols = Math.ceil(Math.sqrt(Math.max(1, k.length) * (w / Math.max(1, h)))) || 1;
        var kcell = Math.min((w - 12) / kcols, cell * 3.2, 26);
        var krows = Math.ceil(k.length / kcols);
        var kox = (w - kcell * kcols) / 2 + kcell / 2;
        var koy = (h - kcell * krows) / 2 + kcell / 2;
        var idx = 0, keptIds = {};
        k.forEach(function (m) { keptIds[m.i] = idx++; });

        for (var i = 0; i < pop.length; i++) {
          var m = pop[i];
          var col = i % cols, row = (i / cols) | 0;
          var x0 = ox + col * cell, y0 = oy + row * cell;
          var isKept = keptIds[m.i] !== undefined;
          var x = x0, y = y0, r = Math.max(1.3, cell * 0.31);
          if (stepAt > 0 && isKept) {
            var slot = keptIds[m.i];
            var tx = kox + (slot % kcols) * kcell, ty = koy + ((slot / kcols) | 0) * kcell;
            var e = easeOut(anim);
            x = lerp(x0, tx, e); y = lerp(y0, ty, e);
            r = lerp(r, Math.max(2.5, kcell * 0.3), e);
          }
          g.globalAlpha = isKept ? 1 : (stepAt > 0 ? 0.12 * (1 - anim * 0.9) : 0.85);
          if (g.globalAlpha < 0.02) continue;
          g.fillStyle = m.colour;
          g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
          g.globalAlpha = 1;
        }
        if (stepAt > 0 && anim > 0.6 && spec.keptLabel) {
          g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
          g.globalAlpha = (anim - 0.6) * 2.5;
          g.fillText(spec.keptLabel(k, stepAt), w / 2, h - 4);
          g.globalAlpha = 1;
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 6. steps — step through a process one move at a time.
   *   n, draw(g, w, h, i, t), caption(i), autoLabel
   * ======================================================================= */
  LAB.steps = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, '');
      var stage = K.Stage(host, spec.aspect || 0.7);
      var i = spec.start || 0, playing = false, lastT = 0;
      var state = spec.init ? spec.init() : null;

      function render() { out.innerHTML = spec.caption(i, state); }
      function goTo(next) {
        i = clamp(next, 0, spec.n);
        if (spec.onStep) state = spec.onStep(i, state);
        render();
      }
      var backBtn = K.button(ctr, '‹ Back', function () { playing = false; goTo(i - 1); api.onInteract('step'); });
      backBtn.classList.add('small');
      var playBtn = K.button(ctr, spec.playLabel || 'Play', function () {
        if (i >= spec.n) goTo(0);
        playing = !playing;
        playBtn.textContent = playing ? 'Pause' : (spec.playLabel || 'Play');
        api.onInteract('play');
      });
      playBtn.classList.add('primary');
      var fwdBtn = K.button(ctr, 'Step ›', function () { playing = false; goTo(i + 1); api.onInteract('step'); });
      fwdBtn.classList.add('small');
      goTo(i);

      stage.draw = function (g, w, h, t) {
        if (playing) {
          if (t - lastT > (spec.everyMs || 420) / 1000) {
            lastT = t;
            if (i >= spec.n) { playing = false; playBtn.textContent = spec.playLabel || 'Play'; }
            else goTo(i + 1);
          }
        } else { lastT = t; }
        spec.draw(g, w, h, i, t, state);
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 7. graph — a network you tap. Tapping a node reports something about it.
   *   nodes: [{x, y, label}]  (x, y in 0..1), edges: [[a, b]]
   *   onPick(i, g) -> HTML readout; highlight(i) -> [node indices to light]
   * ======================================================================= */
  LAB.graph = function (spec) {
    return function (host, api) {
      var out = K.readout(host, spec.idle || 'Tap a node.');
      var stage = K.Stage(host, spec.aspect || 0.85);
      var ctr = spec.buttons ? K.controls(host) : null;
      var sel = spec.selected == null ? -1 : spec.selected;
      var nodes = spec.nodes, edges = spec.edges;
      var adj = nodes.map(function () { return []; });
      edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
      var lit = {}, pulse = 0;

      function pick(idx) {
        sel = idx;
        var hl = spec.highlight ? spec.highlight(idx, adj) : adj[idx].concat([idx]);
        lit = {};
        hl.forEach(function (n2) { lit[n2] = 1; });
        pulse = now();
        out.innerHTML = spec.onPick(idx, adj);
        api.onInteract('node');
      }
      if (ctr) spec.buttons.forEach(function (b) {
        K.button(ctr, b.label, function () { b.act(pick, adj); api.onInteract('button'); }).classList.add('small');
      });

      function hit(px, py, w, h) {
        var best = -1, bd = 1e9;
        for (var i = 0; i < nodes.length; i++) {
          var dx = px - nodes[i].x * w, dy = py - nodes[i].y * h;
          var d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = i; }
        }
        return bd < 34 * 34 ? best : -1;
      }
      function onTap(ev) {
        var p = stage.pointer(ev);
        var idx = hit(p.x, p.y, stage.w, stage.h - 6);
        if (idx >= 0) pick(idx);
        ev.preventDefault();
      }
      stage.canvas.addEventListener('mousedown', onTap);
      stage.canvas.addEventListener('touchstart', onTap, { passive: false });

      stage.draw = function (g, w, h, t) {
        var R = Math.max(9, Math.min(15, w / 26));
        var padX = R + 12, padY = R + 12;
        function PX(n2) { return padX + n2.x * (w - padX * 2); }
        function PY(n2) { return padY + n2.y * (h - padY * 2); }
        edges.forEach(function (e) {
          var on = lit[e[0]] && lit[e[1]];
          g.strokeStyle = on ? 'rgba(88,166,255,0.85)' : 'rgba(139,148,158,0.28)';
          g.lineWidth = on ? 2.5 : 1.2;
          g.beginPath();
          g.moveTo(PX(nodes[e[0]]), PY(nodes[e[0]]));
          g.lineTo(PX(nodes[e[1]]), PY(nodes[e[1]]));
          g.stroke();
        });
        nodes.forEach(function (n2, i) {
          var on = !!lit[i], isSel = i === sel;
          var grow = isSel ? 1 + 0.12 * Math.max(0, 1 - (now() - pulse) / 400) : 1;
          g.beginPath(); g.arc(PX(n2), PY(n2), R * grow, 0, 7);
          g.fillStyle = isSel ? C.accent : (on ? 'rgba(88,166,255,0.45)' : C.panel);
          g.fill();
          g.strokeStyle = on ? C.accent : C.dim; g.lineWidth = 1.5; g.stroke();
          if (n2.label) {
            g.fillStyle = isSel ? '#0d1117' : (on ? C.fg : C.muted);
            g.font = f(Math.max(9, R * 0.78), 700); g.textAlign = 'center';
            g.fillText(n2.label, PX(n2), PY(n2) + R * 0.3);
          }
        });
        if (sel < 0) {
          g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
          g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3);
          g.fillText(spec.hint || 'tap a circle', w / 2, h - 4);
          g.globalAlpha = 1;
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 8. drag — one number, dragged straight on the picture.
   *   min, max, value, draw(g, w, h, v, t), readout(v), axis: 'x' | 'y'
   * ======================================================================= */
  LAB.drag = function (spec) {
    return function (host, api) {
      var out = K.readout(host, '');
      var stage = K.Stage(host, spec.aspect || 0.8);
      var v = spec.value, shown = spec.value, dragging = false, touched = false, s0 = 0, v0 = 0;
      var horizontal = (spec.axis || 'x') === 'x';

      function render() { out.innerHTML = spec.readout(v); }
      function down(ev) {
        dragging = true;
        var p = stage.pointer(ev);
        s0 = horizontal ? p.x : p.y; v0 = v;
        if (spec.grabAt) {                          // jump straight to the touch
          var span = horizontal ? stage.w : stage.h;
          v = clamp(spec.min + (spec.max - spec.min) * ((horizontal ? p.x : span - p.y) / span),
            spec.min, spec.max);
          v0 = v; s0 = horizontal ? p.x : p.y;
        }
        if (!touched) { touched = true; api.onInteract('drag'); }
        render();
        ev.preventDefault();
      }
      function move(ev) {
        if (!dragging) return;
        var p = stage.pointer(ev);
        var d = (horizontal ? p.x - s0 : s0 - p.y);
        var span = horizontal ? stage.w : stage.h;
        v = clamp(v0 + (spec.max - spec.min) * (d / (span * (spec.gain || 0.8))), spec.min, spec.max);
        if (spec.snap) v = Math.round(v / spec.snap) * spec.snap;
        render();
        ev.preventDefault();
      }
      function up() { dragging = false; }
      stage.canvas.addEventListener('mousedown', down);
      stage.canvas.addEventListener('touchstart', down, { passive: false });
      global.addEventListener('mousemove', move);
      global.addEventListener('touchmove', move, { passive: false });
      global.addEventListener('mouseup', up);
      global.addEventListener('touchend', up);
      render();

      stage.draw = function (g, w, h, t) {
        if (!touched && spec.idle) v = spec.idle(t);
        shown += (v - shown) * 0.3;
        spec.draw(g, w, h, shown, t, { dragging: dragging, touched: touched });
        if (!touched) {
          g.fillStyle = C.gold; g.font = f(10.5, 700); g.textAlign = 'center';
          g.globalAlpha = 0.45 + 0.4 * Math.sin(t * 3.4);
          g.fillText(spec.hint || 'drag the picture', w / 2, h - 4);
          g.globalAlpha = 1;
        }
        if (!touched) render();
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
  };

  /* =======================================================================
   * 9. race — two or three strategies, simulated side by side.
   *   lanes: [{name, trial() -> number}], batch, maxV, unit
   * ======================================================================= */
  LAB.race = function (spec) {
    return function (host, api) {
      var ctr = K.controls(host);
      var out = K.readout(host, spec.idle || 'Run them and compare.');
      var stage = K.Stage(host, spec.aspect || 0.62);
      var lanes = spec.lanes.map(function (l, i) {
        return { name: l.name, trial: l.trial, colour: SERIES[i % SERIES.length], n: 0, sum: 0 };
      });
      var pending = 0;

      function render() {
        if (!lanes[0].n) { out.innerHTML = spec.idle || 'Run them and compare.'; return; }
        out.innerHTML = '<b>' + commas(lanes[0].n) + '</b> runs each &nbsp;·&nbsp; ' +
          lanes.map(function (l, i) {
            return '<span style="color:' + l.colour + ';font-weight:700">' +
              l.name + ' ' + (l.sum / l.n).toFixed(spec.dp == null ? 2 : spec.dp) + '</span>';
          }).join(' &nbsp;·&nbsp; ');
      }
      (spec.batches || [50, 500]).forEach(function (b, i, arr) {
        var btn = K.button(ctr, 'Run ' + commas(b), function () { pending += b; api.onInteract('run'); });
        if (i === arr.length - 1) btn.classList.add('primary'); else btn.classList.add('small');
      });
      K.button(ctr, 'Reset', function () {
        lanes.forEach(function (l) { l.n = 0; l.sum = 0; });
        pending = 0; render(); api.onInteract('reset');
      }).classList.add('small');
      render();

      stage.draw = function (g, w, h) {
        var take = Math.min(pending, 200);
        for (var s = 0; s < take; s++) lanes.forEach(function (l) { l.sum += l.trial(); l.n++; });
        pending -= take;
        if (take) render();

        /* Lanes are a fixed block each and stack from the top: dividing the
         * whole canvas up leaves a bar floating in the middle of nothing. */
        var pad = 14, laneH = Math.min(64, (h - 10) / lanes.length);
        var maxV = spec.maxV;
        if (!maxV) {
          maxV = 1;
          lanes.forEach(function (l) { if (l.n) maxV = Math.max(maxV, l.sum / l.n); });
          maxV *= 1.35;
        }
        var block = laneH * lanes.length;
        lanes.forEach(function (l, i) {
          var y = Math.max(6, (h - block) / 2) + i * laneH;
          g.fillStyle = C.muted; g.font = f(11.5, 600); g.textAlign = 'left';
          g.fillText(l.name, pad, y + 13);
          var avg = l.n ? l.sum / l.n : 0;
          g.textAlign = 'right'; g.font = f(12.5, 800);
          g.fillStyle = l.n ? l.colour : C.dim;
          g.fillText(l.n ? avg.toFixed(spec.dp == null ? 2 : spec.dp) + ' ' + (spec.unit || '') : 'not run yet',
            w - pad, y + 13);
          var barY = y + 22, barW = w - pad * 2;
          g.fillStyle = C.panel; roundRect(g, pad, barY, barW, 16, 8); g.fill();
          g.fillStyle = l.colour;
          roundRect(g, pad, barY, Math.max(2, barW * clamp(avg / maxV, 0, 1)), 16, 8); g.fill();
        });
        if (spec.axisLabel) {
          g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
          g.fillText(spec.axisLabel, pad, h - 2);
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 10. bars — a known distribution, interrogated by tapping a bar.
   *   items: [{label, value, note}] ; caption(item)
   * ======================================================================= */
  LAB.bars = function (spec) {
    return function (host, api) {
      var out = K.readout(host, spec.idle || 'Tap a bar.');
      var stage = K.Stage(host, spec.aspect || 0.66);
      var items = typeof spec.items === 'function' ? spec.items() : spec.items;
      var sel = -1;

      function onTap(ev) {
        var p = stage.pointer(ev);
        var pad = 16, bw = (stage.w - pad * 2) / items.length;
        var idx = Math.floor((p.x - pad) / bw);
        if (idx >= 0 && idx < items.length) {
          sel = idx;
          out.innerHTML = spec.caption(items[idx], idx, items);
          api.onInteract('bar');
        }
        ev.preventDefault();
      }
      stage.canvas.addEventListener('mousedown', onTap);
      stage.canvas.addEventListener('touchstart', onTap, { passive: false });

      stage.draw = function (g, w, h, t) {
        var pad = 16, top = 20, base = h - 26;
        var series = items.map(function (it, i) {
          return {
            label: it.label, value: it.value,
            on: i === sel,
            colour: i === sel ? C.gold : 'rgba(88,166,255,0.55)'
          };
        });
        drawBars(g, pad, top, w - pad * 2, base - top, series,
          { values: spec.showValues !== false, valueFmt: spec.valueFmt });
        g.fillStyle = C.muted; g.font = f(10, 500); g.textAlign = 'left';
        g.fillText(spec.axisLabel || '', pad, h - 4);
        if (sel < 0) {
          g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'right';
          g.globalAlpha = 0.45 + 0.4 * Math.sin(t * 3.2);
          g.fillText('tap a bar', w - pad, h - 4);
          g.globalAlpha = 1;
        }
      };
      return { destroy: stage.destroy };
    };
  };

  /* =======================================================================
   * 11. picture — a drawn scene with labelled regions, for `tap` questions.
   *   regions come from the question (api.regions); draw(g, w, h, sel, t)
   * ======================================================================= */
  LAB.picture = function (spec) {
    return function (host, api) {
      var out = spec.readout ? K.readout(host, spec.readout(null)) : null;
      var stage = K.Stage(host, spec.aspect || 0.72);
      var regions = api.regions || spec.regions || [];
      var sel = null;

      function pick(id, fromCanvas) {
        sel = id;
        if (chips) chips.select(id);
        if (out && spec.readout) out.innerHTML = spec.readout(id);
        api.onInteract(fromCanvas ? 'picture' : 'region');
        api.onSelect(id);
      }
      var chips = K.regionChips(host, regions, function (id) { pick(id, false); });

      if (spec.hitTest) {
        var onTap = function (ev) {
          var p = stage.pointer(ev);
          var id = spec.hitTest(p.x, p.y, stage.w, stage.h - 6);
          if (id) pick(id, true);
          ev.preventDefault();
        };
        stage.canvas.addEventListener('mousedown', onTap);
        stage.canvas.addEventListener('touchstart', onTap, { passive: false });
      }
      stage.draw = function (g, w, h, t) { spec.draw(g, w, h, sel, t); };
      return {
        destroy: stage.destroy,
        /* app.js calls this when the player picks from the answer row instead */
        select: function (id) { sel = id; if (chips) chips.select(id); if (out && spec.readout) out.innerHTML = spec.readout(id); }
      };
    };
  };

  global.QQLab = {
    sim: LAB.sim, tally: LAB.tally, dial: LAB.dial, grid: LAB.grid, dots: LAB.dots,
    steps: LAB.steps, graph: LAB.graph, drag: LAB.drag, race: LAB.race,
    bars: LAB.bars, picture: LAB.picture,
    util: {
      coin: coin, pickInt: pickInt, die: die, fmt: fmt, commas: commas,
      SERIES: SERIES, drawBars: drawBars, fitText: fitText,
      /* one draw from a normal, Box-Muller — used by a few simulations */
      gauss: function () {
        var u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      /* Fisher-Yates, in place */
      shuffle: function (a) {
        for (var i = a.length - 1; i > 0; i--) {
          var j = pickInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
    }
  };
})(window);
