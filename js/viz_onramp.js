/* QQ visuals — the on-ramp (unit 1, lesson 1).
 *
 * These five are the first things a stranger from a Reel ever touches, so they
 * are the plainest visuals on the site: no settings, no jargon, one obvious
 * thing to press. The rule is still the house rule — animate the thing, don't
 * write the formula — but here it also has to be winnable in twenty seconds.
 *
 * Loads after js/viz.js (the kit) and js/viz_lab.js (the engines).
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var Lab = global.QQLab;
  var U = Lab.util;

  /* ------------------------------------------------- 1. two coins, four ways */
  function pairKey(r, c) {
    var a = r === 0 ? 'H' : 'T', b = c === 0 ? 'H' : 'T';
    if (a === 'H' && b === 'H') return 'two heads';
    if (a === 'T' && b === 'T') return 'two tails';
    return 'one of each';
  }
  global.QQViz.register('twoCoinsGrid', Lab.grid({
    rows: 2, cols: 2, aspect: 0.86,
    chips: ['two heads', 'one of each', 'two tails'],
    key: pairKey,
    rowLabel: function (r) { return r === 0 ? 'H' : 'T'; },
    colLabel: function (c) { return c === 0 ? 'H' : 'T'; },
    cellText: function (r, c) {
      return (r === 0 ? 'H' : 'T') + (c === 0 ? 'H' : 'T');
    },
    idle: 'Two coins land four ways. Tap a result.',
    caption: function (label, hits) {
      return '<b>' + hits + '</b> of the 4 ways give ' + label +
        ' &nbsp;·&nbsp; ' + (hits * 25) + '% of the time';
    }
  }));

  /* --------------------------------------------------- 2. one die, six faces
   * Two chips that overlap on the same faces, so QQLab.grid (one key per cell)
   * is the wrong shape and this one is drawn by hand: real pips, and the
   * matching faces light up under whichever description you tapped. */
  global.QQViz.register('dieEvenOrHigh', function (host, api) {
    var chips = K.controls(host);
    var out = K.readout(host, 'One die, six faces. Tap a description.');
    var stage = K.Stage(host, 0.38);
    var sel = null, selAt = 0;
    var tests = {
      'even': function (v) { return v % 2 === 0; },
      'bigger than 4': function (v) { return v > 4; }
    };
    var btns = [];
    ['even', 'bigger than 4'].forEach(function (label) {
      var b = K.el('button', 'viz-chip', label);
      b.type = 'button';
      b.addEventListener('click', function () {
        sel = label; selAt = performance.now();
        btns.forEach(function (x) { x.classList.toggle('on', x.textContent === label); });
        var n = 0;
        for (var v = 1; v <= 6; v++) if (tests[label](v)) n++;
        out.innerHTML = '<b>' + n + '</b> of the 6 faces are ' + label +
          ' &nbsp;·&nbsp; ' + Math.round(n / 6 * 100) + '% of rolls';
        api.onInteract('chip');
      });
      chips.appendChild(b); btns.push(b);
    });

    stage.draw = function (g, w, h) {
      var pad = 10, size = Math.min((w - pad * 2) / 6, h - 24);
      var ox = (w - size * 6) / 2, oy = (h - size) / 2;
      for (var i = 0; i < 6; i++) {
        var v = i + 1, on = sel && tests[sel](v);
        var age = clamp((performance.now() - selAt) / 300 - i * 0.05, 0, 1);
        var x = ox + i * size, y = oy;
        g.fillStyle = '#1c232c';
        roundRect(g, x + 3, y + 3, size - 6, size - 6, 8); g.fill();
        if (on) {
          g.globalAlpha = age; g.fillStyle = C.accent;
          roundRect(g, x + 3, y + 3, size - 6, size - 6, 8); g.fill();
          g.globalAlpha = 1;
        }
        // pips
        var cx = x + size / 2, cy = y + size / 2, s = size * 0.19;
        var spots = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]],
          [[-1, -1], [1, -1], [-1, 1], [1, 1]],
          [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
          [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]][v];
        g.fillStyle = on ? '#0d1117' : '#6d7681';
        spots.forEach(function (p) {
          g.beginPath();
          g.arc(cx + p[0] * s, cy + p[1] * s, Math.max(2, size * 0.075), 0, 7);
          g.fill();
        });
      }
    };
    return { destroy: stage.destroy };
  });

  /* --------------------------------------------------------- 3. the spinners */
  global.QQViz.register('spinnerPick', function (host, api) {
    var regions = api.regions || [];
    var data = (api.data && api.data.spinners) || [];
    var out = K.readout(host, 'Three spinners. Which one lands on gold most often?');
    var stage = K.Stage(host, 0.62);
    var sel = null, spin = [0, 0, 0], vel = [2.1, 1.6, 2.6];
    var chips = K.regionChips(host, regions, function (id) { pick(id); });

    function pick(id) {
      sel = id;
      chips.select(id);
      var s = null;
      data.forEach(function (d) { if (d.id === id) s = d; });
      if (s) {
        out.innerHTML = 'The ' + s.label.toLowerCase() + ' spinner is <b>' +
          s.gold + ' of its ' + s.slices + '</b> wedges gold';
      }
      api.onInteract('spinner');
      api.onSelect(id);
    }
    function centres(w) {
      return [w * 0.2, w * 0.5, w * 0.8];
    }
    function onTap(ev) {
      var p = stage.pointer(ev);
      var cs = centres(stage.w);
      var best = 0, bd = 1e9;
      for (var i = 0; i < cs.length; i++) {
        var d = Math.abs(p.x - cs[i]);
        if (d < bd) { bd = d; best = i; }
      }
      if (data[best]) pick(data[best].id);
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h, t) {
      var cs = centres(w), R = Math.min(w * 0.14, (h - 40) * 0.42);
      data.forEach(function (s, i) {
        spin[i] += vel[i] * 0.016;
        var cx = cs[i], cy = h * 0.46;
        var on = sel === s.id;
        for (var k = 0; k < s.slices; k++) {
          var a0 = spin[i] + (k / s.slices) * Math.PI * 2;
          var a1 = spin[i] + ((k + 1) / s.slices) * Math.PI * 2;
          g.beginPath();
          g.moveTo(cx, cy);
          g.arc(cx, cy, R, a0, a1);
          g.closePath();
          g.fillStyle = k < s.gold ? (on ? C.gold : 'rgba(210,153,34,0.75)')
            : (on ? '#232b36' : '#1a2029');
          g.fill();
        }
        g.strokeStyle = on ? C.accent : C.dim;
        g.lineWidth = on ? 2.5 : 1.5;
        g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
        // the fixed pointer
        g.fillStyle = C.fg;
        g.beginPath();
        g.moveTo(cx, cy - R - 10); g.lineTo(cx - 5, cy - R - 1); g.lineTo(cx + 5, cy - R - 1);
        g.closePath(); g.fill();
        g.fillStyle = on ? C.fg : C.muted;
        g.font = f(11, on ? 800 : 600); g.textAlign = 'center';
        g.fillText(s.label, cx, cy + R + 18);
      });
      if (!sel) {
        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
        g.globalAlpha = 0.45 + 0.4 * Math.sin(t * 3);
        g.fillText('tap the one you want', w / 2, h - 4);
        g.globalAlpha = 1;
      }
    };
    return {
      destroy: stage.destroy,
      select: function (id) { sel = id; chips.select(id); }
    };
  });

  /* ------------------------------------------- 4. what comes after a streak */
  global.QQViz.register('afterFiveHeads', Lab.sim({
    aspect: 0.42,
    mode: 'rate',
    /* flip honestly until five heads in a row have just happened, then report
     * the very next flip. Nothing is nudged: this is the real experiment. */
    trial: function () {
      var run = 0;
      for (var i = 0; i < 100000; i++) {
        var c = U.coin();
        if (run >= 5) return c === 1;
        run = c === 1 ? run + 1 : 0;
      }
      return U.coin() === 1;
    },
    batches: [50, 2000],
    rateLabel: 'of the flips after five heads were heads again',
    barLabel: 'the flip that came after a run of five heads',
    idle: 'Flip until five heads land in a row, then look at the next flip.',
    mark: 0.5, markLabel: 'half'
  }));

  /* ---------------------------------------------- 5. two spins of a quarter */
  global.QQViz.register('twoSpinsGold', Lab.sim({
    aspect: 0.42,
    mode: 'rate',
    trial: function () {
      return Math.random() < 0.25 || Math.random() < 0.25;
    },
    batches: [50, 2000],
    rateLabel: 'of the pairs of spins hit gold at least once',
    barLabel: 'two spins of a spinner that is a quarter gold',
    idle: 'Spin twice. Did gold come up at least once?',
    mark: 0.5, markLabel: 'half the time'
  }));
})(window);
