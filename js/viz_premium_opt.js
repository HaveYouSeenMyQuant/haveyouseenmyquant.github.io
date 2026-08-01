/* QQ visuals — the two speed sets: "Optiver speed round" and "Mental maths
 * under pressure".
 *
 * These questions are arithmetic, so the pictures have one job: SHOW THE TRICK
 * WORKING. The eleven trick is digits sliding apart and a carry moving left.
 * The near-a-round-number trick is a rectangle being cut and rearranged with a
 * corner missing. A spread is a live market you drag your own fair value
 * through. Nothing here is a still picture of a sum, and nothing prints the
 * answer before the player has driven the interaction to it themselves.
 *
 * Loads after js/viz.js (the kit) and js/viz_lab.js (the engines).
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var LAB = global.QQLab;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };

  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function money(n) { return '£' + commas(Math.round(n)); }
  function signed(n, dp) {
    var s = n.toFixed(dp == null ? 2 : dp);
    return (n > 0 ? '+' : '') + s;
  }
  function tone(v) { return v > 0.0001 ? '#3fb950' : (v < -0.0001 ? C.bad : C.muted); }
  function hl(text, colour) {
    return '<b style="color:' + (colour || C.gold) + '">' + text + '</b>';
  }
  function label(g, text, x, y, size, weight, colour, align) {
    g.fillStyle = colour || C.muted;
    g.font = f(size || 11, weight || 600);
    g.textAlign = align || 'center';
    g.fillText(text, x, y);
  }
  /* a signed value drawn as a bar growing left or right from a centre line */
  function edgeBar(g, cx, y, half, scale, value, name) {
    g.fillStyle = C.panel;
    roundRect(g, cx - half, y, half * 2, 18, 9); g.fill();
    g.strokeStyle = C.dim; g.lineWidth = 1;
    g.beginPath(); g.moveTo(cx, y - 3); g.lineTo(cx, y + 21); g.stroke();
    var len = clamp(value * scale, -half, half);
    g.fillStyle = tone(value);
    if (Math.abs(len) > 1) {
      roundRect(g, len < 0 ? cx + len : cx, y, Math.abs(len), 18, 6); g.fill();
    }
    label(g, name, cx - half, y - 6, 10.5, 600, C.muted, 'left');
    label(g, signed(value, 1), cx + half, y - 6, 11, 800, tone(value), 'right');
  }

  /* =====================================================================
   * OPTIVER SPEED ROUND
   * ===================================================================== */

  /* 1. reading a spread — drag your fair value through a live market */
  reg('optSpreadLadder', LAB.drag({
    min: 36, max: 52, value: 49.5, snap: 0.5, axis: 'x', aspect: 0.72,
    hint: 'drag your fair value along the market',
    readout: function (v) {
      var buy = v - 46, sell = 41 - v;
      return 'You think it is worth ' + hl(v.toFixed(1)) + ' &nbsp;·&nbsp; buy at 46 ' +
        '<b style="color:' + tone(buy) + '">' + signed(buy, 1) + '</b>' +
        ' &nbsp;·&nbsp; sell at 41 <b style="color:' + tone(sell) + '">' + signed(sell, 1) + '</b>';
    },
    draw: function (g, w, h, v) {
      var pad = 26, left = pad, right = w - pad, axisY = 58;
      function X(p) { return left + (right - left) * ((p - 36) / 16); }
      g.fillStyle = 'rgba(88,166,255,0.13)';
      g.fillRect(X(41), axisY - 26, X(46) - X(41), 42);
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, axisY + 0.5); g.lineTo(right, axisY + 0.5); g.stroke();
      for (var p = 36; p <= 52; p += 2) {
        g.strokeStyle = C.dim;
        g.beginPath(); g.moveTo(X(p), axisY); g.lineTo(X(p), axisY + 5); g.stroke();
        label(g, String(p), X(p), axisY + 17, 9.5, 500, C.muted);
      }
      [[41, 'bid 41', '#3fb950'], [46, 'ask 46', '#f78166']].forEach(function (m) {
        g.strokeStyle = m[2]; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(X(m[0]), axisY - 26); g.lineTo(X(m[0]), axisY + 6); g.stroke();
        label(g, m[1], X(m[0]), axisY - 32, 10.5, 800, m[2]);
      });
      var mx = X(v);
      g.strokeStyle = C.gold; g.lineWidth = 2; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(mx, axisY - 14); g.lineTo(mx, h - 74); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.gold;
      g.beginPath(); g.moveTo(mx, axisY + 8); g.lineTo(mx - 6, axisY + 20);
      g.lineTo(mx + 6, axisY + 20); g.closePath(); g.fill();
      label(g, 'your fair value', mx, axisY + 34, 10, 700, C.gold);
      var cx = w / 2, half = Math.min(120, w / 2 - pad), scale = half / 7;
      edgeBar(g, cx, h - 62, half, scale, v - 46, 'buy at the 46 ask');
      edgeBar(g, cx, h - 20, half, scale, 41 - v, 'sell at the 41 bid');
    }
  }));

  /* 2. where the edge actually is — stepped along a number line */
  reg('optEdgeCount', LAB.steps({
    n: 3, aspect: 0.7, everyMs: 900,
    caption: function (i) {
      return ['You paid ' + hl('46') + ' for it.',
        'You reckon it is really worth ' + hl('50') + '.',
        'Your edge is the gap between those two: ' + hl('4') + ' a contract.',
        'The 41 bid is where somebody buys from ' + hl('you') + ' — it is not in the sum.'][i];
    },
    draw: function (g, w, h, i) {
      var pad = 30, left = pad, right = w - pad, axisY = h * 0.52;
      function X(p) { return left + (right - left) * ((p - 39) / 13); }
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(left, axisY + 0.5); g.lineTo(right, axisY + 0.5); g.stroke();
      for (var p = 40; p <= 52; p += 2) label(g, String(p), X(p), axisY + 18, 9.5, 500, C.muted);
      if (i >= 2) {
        g.fillStyle = 'rgba(210,153,34,0.22)';
        g.fillRect(X(46), axisY - 34, X(50) - X(46), 34);
        g.strokeStyle = C.gold; g.lineWidth = 2;
        g.beginPath(); g.moveTo(X(46), axisY - 17); g.lineTo(X(50), axisY - 17); g.stroke();
        label(g, '4', (X(46) + X(50)) / 2, axisY - 42, 16, 800, C.gold);
        label(g, 'your edge', (X(46) + X(50)) / 2, axisY - 58, 10.5, 700, C.gold);
      }
      function post(price, text, colour, on) {
        g.globalAlpha = on ? 1 : 0.22;
        g.strokeStyle = colour; g.lineWidth = 3;
        g.beginPath(); g.moveTo(X(price), axisY); g.lineTo(X(price), axisY - 30); g.stroke();
        label(g, text, X(price), axisY + 34, 10.5, 800, colour);
        g.globalAlpha = 1;
      }
      post(46, 'you paid 46', '#f78166', i >= 0);
      post(50, 'worth 50', '#3fb950', i >= 1);
      post(41, 'bid 41', C.muted, i >= 3);
      if (i >= 3) {
        g.strokeStyle = C.bad; g.lineWidth = 2;
        g.beginPath();
        g.moveTo(X(41) + 8, axisY - 46); g.lineTo(X(45), axisY - 26);
        g.moveTo(X(45), axisY - 46); g.lineTo(X(41) + 8, axisY - 26);
        g.stroke();
        label(g, 'not 9', (X(41) + X(45)) / 2, axisY - 56, 10.5, 700, C.bad);
      }
    }
  }));

  /* 3. crossing the spread and back — the wallet does the arguing */
  reg('optRoundTrip', LAB.steps({
    n: 2, aspect: 0.72, everyMs: 1000,
    caption: function (i) {
      return ['The market is 99 bid at 101. You have nothing and you owe nothing.',
        'You buy at ' + hl('101') + '. You hold a thing worth 100, so you are ' +
          '<b style="color:' + C.bad + '">1 down</b> already.',
        'You sell straight back at ' + hl('99') + '. Flat again, and ' +
          '<b style="color:' + C.bad + '">2 down</b> — the whole width.'][i];
    },
    draw: function (g, w, h, i) {
      var pad = 26, left = pad, right = w - pad, axisY = 62;
      function X(p) { return left + (right - left) * ((p - 97.5) / 6); }
      g.fillStyle = 'rgba(88,166,255,0.13)';
      g.fillRect(X(99), axisY - 24, X(101) - X(99), 40);
      g.strokeStyle = C.line;
      g.beginPath(); g.moveTo(left, axisY + 0.5); g.lineTo(right, axisY + 0.5); g.stroke();
      [[99, 'bid 99', '#3fb950'], [100, 'middle 100', C.muted], [101, 'ask 101', '#f78166']]
        .forEach(function (m) {
          g.strokeStyle = m[2]; g.lineWidth = m[0] === 100 ? 1.5 : 2.5;
          if (m[0] === 100) g.setLineDash([3, 3]);
          g.beginPath(); g.moveTo(X(m[0]), axisY - 24); g.lineTo(X(m[0]), axisY + 6); g.stroke();
          g.setLineDash([]);
          label(g, m[1], X(m[0]), axisY - 30, 10, 800, m[2]);
        });
      if (i >= 1) {
        g.strokeStyle = '#f78166'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(X(100), axisY + 22); g.lineTo(X(101), axisY + 22); g.stroke();
        label(g, 'paid 1 over', X(100.5), axisY + 36, 10, 700, '#f78166');
      }
      if (i >= 2) {
        g.strokeStyle = '#f78166'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(X(99), axisY + 48); g.lineTo(X(100), axisY + 48); g.stroke();
        label(g, 'sold 1 under', X(99.5), axisY + 62, 10, 700, '#f78166');
      }
      var vals = [0, -1, -2], v = vals[i];
      var by = h - 46, bw = w - pad * 2;
      g.fillStyle = C.panel; roundRect(g, pad, by, bw, 30, 8); g.fill();
      g.fillStyle = C.bad;
      roundRect(g, pad, by, Math.max(2, bw * (Math.abs(v) / 2.4)), 30, 8); g.fill();
      label(g, 'your wallet', pad, by - 6, 10.5, 600, C.muted, 'left');
      label(g, v === 0 ? 'level' : v + ' points', pad + bw - 10, by + 20, 14, 800,
        v === 0 ? C.muted : '#0d1117', 'right');
    }
  }));

  /* 4. quoting too tight — a hundred customers who know the answer */
  reg('optQuoteWidth', function (host, api) {
    var d = (api.data && api.data.premiumOpt && api.data.premiumOpt.quote) ||
      { guess: 500, low: 400, high: 600 };
    var ctr = K.controls(host);
    var out = K.readout(host, 'Pick a half-width, then let the customers in.');
    var stage = K.Stage(host, 0.72);
    var hw = 5, n = 0, pnl = 0, hits = 0, pending = 0, dots = [];

    function reset() { n = 0; pnl = 0; hits = 0; pending = 0; dots = []; render(); }
    function render() {
      if (!n) {
        out.innerHTML = 'Quoting ' + hl((d.guess - hw) + ' at ' + (d.guess + hw)) +
          '. Let the customers in.';
        return;
      }
      out.innerHTML = '<b>' + n + '</b> customers &nbsp;·&nbsp; traded ' + hits +
        ' times &nbsp;·&nbsp; ' + '<b style="color:' + tone(pnl / n) + '">' +
        signed(pnl / n, 1) + '</b> per customer';
    }
    K.slider(ctr, { min: 5, max: 120, step: 5, value: 5, label: 'half width' }, function (v) {
      hw = v; reset(); api.onInteract('slider');
    });
    K.button(ctr, 'Send 100 in', function () { pending += 100; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () { reset(); api.onInteract('reset'); }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var take = Math.min(pending, 6);
      for (var s = 0; s < take; s++) {
        var truth = d.low + Math.random() * (d.high - d.low);
        var bid = d.guess - hw, ask = d.guess + hw, p = 0;
        if (truth > ask) p = ask - truth;
        else if (truth < bid) p = truth - bid;
        if (p !== 0) hits++;
        pnl += p; n++;
        dots.push({ v: truth, p: p });
        if (dots.length > 140) dots.shift();
      }
      pending -= take;
      if (take) render();

      var pad = 20, left = pad, right = w - pad, axisY = h - 74;
      function X(v) { return left + (right - left) * ((v - d.low) / (d.high - d.low)); }
      g.fillStyle = 'rgba(88,166,255,0.16)';
      g.fillRect(X(d.guess - hw), 18, Math.max(2, X(d.guess + hw) - X(d.guess - hw)), axisY - 18);
      g.strokeStyle = C.accent; g.lineWidth = 1.5;
      g.strokeRect(X(d.guess - hw) + 0.5, 18.5, Math.max(2, X(d.guess + hw) - X(d.guess - hw)), axisY - 19);
      label(g, 'your quote, ' + (hw * 2) + ' wide', w / 2, 12, 10.5, 700, C.accent);
      for (var i = 0; i < dots.length; i++) {
        var dd = dots[i];
        g.fillStyle = dd.p === 0 ? 'rgba(139,148,158,0.45)' : 'rgba(248,81,73,0.85)';
        g.beginPath();
        g.arc(X(dd.v), 30 + ((i * 37) % Math.max(20, axisY - 52)), dd.p === 0 ? 2.2 : 3.2, 0, 7);
        g.fill();
      }
      g.strokeStyle = C.line;
      g.beginPath(); g.moveTo(left, axisY + 0.5); g.lineTo(right, axisY + 0.5); g.stroke();
      label(g, String(d.low), left, axisY + 15, 10, 600, C.muted, 'left');
      label(g, String(d.guess), X(d.guess), axisY + 15, 10, 600, C.muted);
      label(g, String(d.high), right, axisY + 15, 10, 600, C.muted, 'right');
      label(g, 'where the truth actually landed', w / 2, axisY + 30, 10, 500, C.muted);
      var per = n ? pnl / n : 0, by = h - 26, bw = w - pad * 2;
      g.fillStyle = C.panel; roundRect(g, pad, by, bw, 20, 10); g.fill();
      g.fillStyle = C.bad;
      roundRect(g, pad, by, Math.max(2, bw * clamp(-per / 100, 0, 1)), 20, 10); g.fill();
      label(g, n ? signed(per, 1) + ' a customer' : 'nothing traded yet', pad + bw - 8, by + 14,
        11, 800, n ? C.fg : C.muted, 'right');
    };
    return { destroy: stage.destroy };
  });

  /* 5. the climb back is always steeper than the fall */
  reg('optRecoverBar', LAB.drag({
    min: 5, max: 90, value: 45, snap: 5, axis: 'x', aspect: 0.78,
    hint: 'drag to change the size of the fall',
    readout: function (v) {
      var rise = v / (100 - v) * 100;
      return 'Fall of ' + hl(v + '%') + ' &nbsp;·&nbsp; you need ' +
        hl(rise.toFixed(1) + '%', '#3fb950') + ' back just to be level';
    },
    draw: function (g, w, h, v) {
      var pad = 34, base = h - 34, top = 26, full = base - top;
      var colW = Math.min(74, (w - pad * 2) / 3.2);
      var x1 = w / 2 - colW * 1.3, x2 = w / 2 + colW * 0.3;
      function bar(x, value, colour, name) {
        var bh = full * (value / 100);
        g.fillStyle = colour;
        roundRect(g, x, base - bh, colW, bh, 5); g.fill();
        label(g, name, x + colW / 2, base + 16, 10.5, 600, C.muted);
        label(g, value.toFixed(0), x + colW / 2, base - bh - 7, 12, 800, colour);
      }
      g.strokeStyle = 'rgba(139,148,158,0.35)'; g.lineWidth = 1; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(pad - 8, base - full); g.lineTo(w - pad + 8, base - full); g.stroke();
      g.setLineDash([]);
      label(g, 'where it started', w - pad + 6, base - full - 6, 9.5, 600, C.muted, 'right');
      bar(x1, 100, 'rgba(88,166,255,0.55)', 'before');
      bar(x2, 100 - v, '#f78166', 'after the fall');
      var topAfter = base - full * ((100 - v) / 100);
      var ax = x2 + colW + 16;
      g.strokeStyle = '#3fb950'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(ax, topAfter); g.lineTo(ax, base - full + 6); g.stroke();
      g.fillStyle = '#3fb950';
      g.beginPath(); g.moveTo(ax, base - full); g.lineTo(ax - 5, base - full + 10);
      g.lineTo(ax + 5, base - full + 10); g.closePath(); g.fill();
      label(g, '+' + (v / (100 - v) * 100).toFixed(0) + '%', ax + 8,
        (topAfter + base - full) / 2, 12, 800, '#3fb950', 'left');
      label(g, 'the fall was ' + v + '%, the climb back is not', w / 2, 14, 10.5, 600, C.muted);
    }
  }));

  /* 6. up a tenth and down a tenth, in both orders */
  reg('optPercentOrder', LAB.steps({
    n: 2, aspect: 0.68, everyMs: 900,
    caption: function (i) {
      return ['Two books, both worth 100 pence in the pound.',
        'One is up a tenth, one is down a tenth. Miles apart.',
        'Now the other move each. Both land on ' + hl('99') + ' — and neither is back at 100.'][i];
    },
    draw: function (g, w, h, i) {
      var lanes = [
        { name: 'up 10% first', vals: [100, 110, 99], colour: C.accent },
        { name: 'down 10% first', vals: [100, 90, 99], colour: C.gold }
      ];
      var pad = 24, base = h - 30, top = 24, full = base - top;
      g.strokeStyle = 'rgba(139,148,158,0.3)'; g.setLineDash([4, 4]); g.lineWidth = 1;
      g.beginPath();
      g.moveTo(pad, base - full * (100 / 115)); g.lineTo(w - pad, base - full * (100 / 115));
      g.stroke(); g.setLineDash([]);
      label(g, 'started here', w - pad, base - full * (100 / 115) - 5, 9.5, 600, C.muted, 'right');
      lanes.forEach(function (l, k) {
        var bw = Math.min(70, (w - pad * 2) / 2.6);
        var x = pad + 14 + k * ((w - pad * 2) - bw) * 0.72;
        var v = l.vals[i], bh = full * (v / 115);
        g.fillStyle = l.colour;
        roundRect(g, x, base - bh, bw, bh, 5); g.fill();
        label(g, v.toFixed(0), x + bw / 2, base - bh - 8, 13, 800, l.colour);
        label(g, l.name, x + bw / 2, base + 16, 10, 600, C.muted);
      });
      if (i === 2) label(g, 'a percent light, both ways round', w / 2, 14, 10.5, 700, C.gold);
    }
  }));

  /* 7. the sixteenths ruler, both scales at once */
  reg('optSixteenthRuler', LAB.drag({
    min: 0.25, max: 0.5, value: 0.28, snap: 0.005, axis: 'x', aspect: 0.72, gain: 0.9,
    hint: 'drag the marker along the ruler',
    readout: function (v) {
      var six = Math.round(v * 16);
      return 'Marker at ' + hl(v.toFixed(3)) + ' &nbsp;·&nbsp; nearest sixteenth ' +
        hl(six + '/16 = ' + (six / 16).toFixed(4), C.accent);
    },
    draw: function (g, w, h, v) {
      var pad = 22, left = pad, right = w - pad, mid = h * 0.5;
      function X(p) { return left + (right - left) * ((p - 0.25) / 0.25); }
      g.strokeStyle = C.line; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(left, mid + 0.5); g.lineTo(right, mid + 0.5); g.stroke();
      for (var k = 4; k <= 8; k++) {
        var x = X(k / 16);
        g.strokeStyle = C.accent; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, mid); g.lineTo(x, mid - 20); g.stroke();
        label(g, k + '/16', x, mid - 26, 10.5, 800, C.accent);
        if (k === 4) label(g, 'a quarter', x, mid - 40, 9.5, 600, C.muted);
        if (k === 6) label(g, 'three eighths', x, mid - 40, 9.5, 600, C.muted);
        if (k === 8) label(g, 'a half', x, mid - 40, 9.5, 600, C.muted);
      }
      for (var d = 25; d <= 50; d += 5) {
        var xd = X(d / 100);
        g.strokeStyle = C.dim; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(xd, mid); g.lineTo(xd, mid + 16); g.stroke();
        label(g, '0.' + (d < 10 ? '0' + d : d), xd, mid + 30, 10, 600, C.muted);
      }
      var mx = X(clamp(v, 0.25, 0.5));
      g.strokeStyle = C.gold; g.lineWidth = 2;
      g.beginPath(); g.moveTo(mx, mid - 34); g.lineTo(mx, mid + 34); g.stroke();
      g.fillStyle = C.gold;
      g.beginPath(); g.arc(mx, mid, 6, 0, 7); g.fill();
      label(g, 'sixteenths above, plain decimals below', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 8. a Fermi estimate as a chain of two divisions */
  reg('optBirthChain', LAB.steps({
    n: 3, aspect: 0.66, everyMs: 1100,
    caption: function (i) {
      return ['Eight billion people are alive right now.',
        'A life lasts about 73 years, so about one in 73 of them has to be replaced each year.',
        'A year is about 31 and a half million seconds — three point one four, times ten million.',
        'So: about ' + hl('3 or 4 babies a second') + ', worldwide, all day, every day.'][i];
    },
    draw: function (g, w, h, i) {
      var rows = [
        { big: '8,000,000,000', small: 'people alive' },
        { big: '÷ 73', small: 'years in a life' },
        { big: '110,000,000', small: 'born each year' },
        { big: '÷ 31,500,000', small: 'seconds in a year' }
      ];
      var y = 26;
      for (var k = 0; k <= Math.min(i, 3); k++) {
        var r = rows[k];
        var isOp = r.big.charAt(0) === '÷';
        g.globalAlpha = k === i ? 1 : 0.55;
        g.fillStyle = isOp ? 'rgba(210,153,34,0.14)' : C.panel;
        roundRect(g, 22, y, w - 44, 34, 8); g.fill();
        label(g, r.big, 34, y + 23, isOp ? 14 : 15, 800, isOp ? C.gold : C.fg, 'left');
        label(g, r.small, w - 34, y + 22, 10, 600, C.muted, 'right');
        g.globalAlpha = 1;
        y += 40;
      }
      if (i >= 3) {
        g.fillStyle = 'rgba(63,185,80,0.16)';
        roundRect(g, 22, y + 4, w - 44, 40, 10); g.fill();
        label(g, '3.5 a second', w / 2, y + 31, 18, 800, '#3fb950');
      }
    }
  }));

  /* 9. basis points, dragged against real pounds */
  reg('optBasisPoints', LAB.drag({
    min: 0, max: 100, value: 70, snap: 5, axis: 'x', aspect: 0.66,
    hint: 'drag the basis points',
    readout: function (v) {
      return hl(v + ' basis points') + ' is ' + hl((v / 100).toFixed(2) + '%', C.accent) +
        ' &nbsp;·&nbsp; on a £4.2m book that is ' + hl(money(4200000 * v / 10000), '#3fb950');
    },
    draw: function (g, w, h, v) {
      var pad = 26, left = pad, right = w - pad, y = h * 0.42, bh = 34;
      g.fillStyle = C.panel; roundRect(g, left, y, right - left, bh, 8); g.fill();
      g.fillStyle = 'rgba(88,166,255,0.85)';
      roundRect(g, left, y, Math.max(2, (right - left) * (v / 100)), bh, 8); g.fill();
      for (var k = 0; k <= 100; k += 25) {
        var x = left + (right - left) * (k / 100);
        g.strokeStyle = C.dim; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y + bh); g.lineTo(x, y + bh + 6); g.stroke();
        label(g, k + 'bp', x, y + bh + 19, 9.5, 600, C.muted);
      }
      label(g, 'one whole percent is 100 basis points', w / 2, y - 12, 10.5, 600, C.muted);
      label(g, money(4200000 * v / 10000), w / 2, h - 26, 22, 800, '#3fb950');
      label(g, 'of a £4,200,000 book', w / 2, h - 8, 10, 600, C.muted);
    }
  }));

  /* 10. the tape: where a market maker's money actually comes from */
  reg('optMakerTape', LAB.steps({
    n: 20, aspect: 0.68, everyMs: 260,
    init: function () {
      var sides = [], i;
      for (i = 0; i < 400; i++) sides.push(i % 2);
      for (i = sides.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = sides[i];
        sides[i] = sides[j]; sides[j] = t;
      }
      return { sides: sides };
    },
    caption: function (i, st) {
      var lots = i * 20;
      if (!lots) return 'Your quote is 99 bid at 101. Nothing has traded yet.';
      var buys = 0;
      for (var k = 0; k < lots; k++) buys += st.sides[k];
      return hl(lots + ' contracts') + ' traded &nbsp;·&nbsp; ' + buys + ' bought from you, ' +
        (lots - buys) + ' sold to you &nbsp;·&nbsp; you have made ' + hl('£' + lots, '#3fb950');
    },
    draw: function (g, w, h, i, t, st) {
      var lots = i * 20, pad = 20;
      var shown = Math.min(lots, 60), startAt = lots - shown;
      var cols = 12, cw = (w - pad * 2) / cols, ch = 15;
      for (var k = 0; k < shown; k++) {
        var side = st.sides[startAt + k];
        var x = pad + (k % cols) * cw, y = 24 + Math.floor(k / cols) * (ch + 4);
        g.fillStyle = side ? 'rgba(63,185,80,0.75)' : 'rgba(210,153,34,0.75)';
        roundRect(g, x + 1, y, cw - 3, ch, 3); g.fill();
        label(g, side ? 'B' : 'S', x + cw / 2, y + 11.5, 9.5, 800, '#0d1117');
      }
      label(g, 'B: they bought at your 101  ·  S: they sold at your 99', w / 2, 14, 9.5, 600, C.muted);
      var by = h - 44, bw = w - pad * 2;
      g.fillStyle = C.panel; roundRect(g, pad, by, bw, 26, 8); g.fill();
      g.fillStyle = '#3fb950';
      roundRect(g, pad, by, Math.max(2, bw * (lots / 400)), 26, 8); g.fill();
      label(g, '£' + lots, pad + 10, by + 18, 13, 800, lots > 40 ? '#0d1117' : C.muted, 'left');
      label(g, 'a pound a trade, either side', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 11. three screens, one fair value — a tap question */
  reg('optThreeMarkets', LAB.picture({
    aspect: 0.82,
    readout: function (id) {
      if (!id) return 'Your fair value is the dashed line at 100. Tap a screen.';
      var m = { a: ['A', 97, 103], b: ['B', 99, 105], c: ['C', 101, 104] }[id];
      return 'Screen ' + hl(m[0]) + ': it will buy from you at ' + m[1] +
        ' and sell to you at ' + m[2] + '.';
    },
    hitTest: function (x, y, w, h) {
      var idx = Math.floor((y - 34) / ((h - 50) / 3));
      return ['a', 'b', 'c'][idx] || null;
    },
    draw: function (g, w, h, sel) {
      var rows = [{ id: 'a', name: 'A', bid: 97, ask: 103 },
        { id: 'b', name: 'B', bid: 99, ask: 105 },
        { id: 'c', name: 'C', bid: 101, ask: 104 }];
      var pad = 34, left = pad, right = w - pad, laneH = (h - 50) / 3;
      function X(p) { return left + (right - left) * ((p - 95) / 12); }
      g.strokeStyle = C.gold; g.lineWidth = 2; g.setLineDash([5, 4]);
      g.beginPath(); g.moveTo(X(100), 26); g.lineTo(X(100), h - 20); g.stroke();
      g.setLineDash([]);
      label(g, 'you say 100', X(100), 18, 10.5, 800, C.gold);
      rows.forEach(function (r, k) {
        var y = 34 + k * laneH + laneH / 2 - 11, on = sel === r.id;
        g.fillStyle = on ? 'rgba(88,166,255,0.32)' : C.panel;
        roundRect(g, X(r.bid), y, X(r.ask) - X(r.bid), 22, 6); g.fill();
        g.strokeStyle = on ? C.accent : C.dim; g.lineWidth = on ? 2 : 1;
        roundRect(g, X(r.bid), y, X(r.ask) - X(r.bid), 22, 6); g.stroke();
        label(g, String(r.bid), X(r.bid) - 5, y + 16, 10.5, 700, '#3fb950', 'right');
        label(g, String(r.ask), X(r.ask) + 5, y + 16, 10.5, 700, '#f78166', 'left');
        label(g, r.name, left - 22, y + 16, 13, 800, on ? C.accent : C.muted, 'left');
      });
      label(g, 'green is where it buys, red is where it sells', w / 2, h - 4, 9.5, 500, C.muted);
    }
  }));

  /* 12. a spread only means something next to its price */
  reg('optSpreadPercent', function (host, api) {
    var ctr = K.controls(host);
    var out = K.readout(host, 'Two markets. Switch the ruler and see them swap over.');
    var stage = K.Stage(host, 0.66);
    var pct = false;
    var rows = [
      { name: '200 bid at 202', pence: 2, pc: 2 / 201 * 100 },
      { name: '20 bid at 20.6', pence: 0.6, pc: 0.6 / 20.3 * 100 }
    ];
    function render() {
      out.innerHTML = pct
        ? 'As a slice of the price: ' + hl(rows[0].pc.toFixed(1) + '%') + ' against ' +
          hl(rows[1].pc.toFixed(1) + '%')
        : 'In pennies: ' + hl(rows[0].pence.toFixed(1)) + ' against ' + hl(rows[1].pence.toFixed(1));
    }
    var btn = K.button(ctr, 'Show it in percent', function () {
      pct = !pct;
      btn.textContent = pct ? 'Show it in pennies' : 'Show it in percent';
      render();
      api.onInteract('toggle');
    });
    btn.classList.add('primary');
    render();
    stage.draw = function (g, w, h) {
      var pad = 24, top = 34, laneH = (h - top - 24) / 2;
      var max = pct ? 3.4 : 2.4;
      rows.forEach(function (r, k) {
        var v = pct ? r.pc : r.pence;
        var y = top + k * laneH + 6, bw = (w - pad * 2) * (v / max);
        g.fillStyle = k === 0 ? 'rgba(88,166,255,0.8)' : 'rgba(210,153,34,0.85)';
        roundRect(g, pad, y, Math.max(3, bw), 26, 6); g.fill();
        label(g, r.name, pad, y - 6, 10.5, 600, C.muted, 'left');
        /* The percent bars run nearly the full width at 390px, so the tag goes
         * inside the bar rather than off the edge of the picture. */
        var tag = pct ? v.toFixed(1) + '% of the price' : v.toFixed(1) + 'p wide';
        var end = pad + Math.max(3, bw);
        g.font = f(11, 800);
        if (end + 8 + g.measureText(tag).width <= w - 4) {
          label(g, tag, end + 8, y + 18, 11, 800, C.fg, 'left');
        } else {
          label(g, tag, end - 8, y + 18, 11, 800, C.bg, 'right');
        }
      });
      label(g, pct ? 'the same two markets, measured against their prices'
        : 'the same two markets, measured in pennies', w / 2, 16, 10.5, 700,
        pct ? C.gold : C.muted);
    };
    return { destroy: stage.destroy };
  });

  /* =====================================================================
   * MENTAL MATHS UNDER PRESSURE
   * ===================================================================== */

  /* 13. the eleven trick — digits slide apart, the sum drops in, the carry moves */
  reg('mmElevenSlide', LAB.steps({
    n: 3, aspect: 0.6, everyMs: 950,
    caption: function (i) {
      return ['Seventy-eight, times eleven.',
        'Slide the two digits apart and leave a gap between them.',
        'Drop their sum into the gap: seven and eight make ' + hl('15') + '.',
        'Fifteen will not fit in one slot, so the one carries left: ' + hl('858') + '.'][i];
    },
    draw: function (g, w, h, i, t) {
      var cy = h * 0.48, bw = 46, gap = 8;
      function cell(x, text, colour, wide) {
        var cw = wide ? bw * 1.2 : bw;
        g.fillStyle = colour || C.panel;
        roundRect(g, x - cw / 2, cy - 30, cw, 60, 8); g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 1;
        roundRect(g, x - cw / 2, cy - 30, cw, 60, 8); g.stroke();
        label(g, text, x, cy + 10, 26, 800, C.fg);
      }
      var spread = i >= 1 ? 1 : 0;
      var step = bw + gap;
      if (i <= 2) {
        var lx = w / 2 - step * (0.5 + spread * 0.55);
        var rx = w / 2 + step * (0.5 + spread * 0.55);
        cell(lx, '7');
        cell(rx, '8');
        if (i >= 2) cell(w / 2, '15', 'rgba(210,153,34,0.3)', true);
        if (i === 1) {
          label(g, 'a gap', w / 2, cy + 4, 12, 600, C.muted);
        }
      } else {
        cell(w / 2 - step, '8', 'rgba(63,185,80,0.25)');
        cell(w / 2, '5', 'rgba(210,153,34,0.3)');
        cell(w / 2 + step, '8');
        g.strokeStyle = C.gold; g.lineWidth = 2;
        g.beginPath();
        g.moveTo(w / 2 - 12, cy - 40); g.lineTo(w / 2 - step + 12, cy - 40);
        g.stroke();
        g.fillStyle = C.gold;
        g.beginPath();
        g.moveTo(w / 2 - step + 4, cy - 40); g.lineTo(w / 2 - step + 14, cy - 45);
        g.lineTo(w / 2 - step + 14, cy - 35); g.closePath(); g.fill();
        label(g, 'the 1 carries', w / 2 - step / 2, cy - 48, 10, 700, C.gold);
      }
      label(g, i === 0 ? '78 × 11' : '', w / 2, 18, 13, 700, C.muted);
      if (i === 3) label(g, '36 × 11 = 396 — no carry needed there', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 14. squaring anything ending in five — the square cuts itself up */
  reg('mmFiveSquare', LAB.drag({
    min: 1, max: 9, value: 3, snap: 1, axis: 'x', aspect: 0.86, gain: 0.75,
    hint: 'drag to change the number',
    readout: function (v) {
      var a = Math.round(v), n = a * 10 + 5;
      return hl(n + ' squared') + ': big block ' + hl(commas(a * a * 100), C.accent) +
        ' + two strips ' + hl(commas(a * 100), '#3fb950') + ' + corner ' + hl('25', '#f78166');
    },
    draw: function (g, w, h, v) {
      var a = Math.round(v), n = a * 10 + 5;
      var side = Math.min(w - 70, h - 62);
      var ox = (w - side) / 2, oy = 34;
      var big = side * (a * 10 / n), small = side - big;
      g.fillStyle = 'rgba(88,166,255,0.55)';
      g.fillRect(ox, oy + small, big, big);
      g.fillStyle = 'rgba(63,185,80,0.6)';
      g.fillRect(ox, oy, big, small);
      g.fillRect(ox + big, oy + small, small, big);
      g.fillStyle = 'rgba(247,129,102,0.85)';
      g.fillRect(ox + big, oy, small, small);
      g.strokeStyle = 'rgba(13,17,23,0.6)'; g.lineWidth = 1;
      g.strokeRect(ox, oy, side, side);
      g.beginPath();
      g.moveTo(ox + big, oy); g.lineTo(ox + big, oy + side);
      g.moveTo(ox, oy + small); g.lineTo(ox + side, oy + small);
      g.stroke();
      if (big > 40) label(g, commas(a * a * 100), ox + big / 2, oy + small + big / 2 + 5, 14, 800, '#0d1117');
      if (small > 16) label(g, '25', ox + big + small / 2, oy + small / 2 + 4, 11, 800, '#0d1117');
      label(g, String(a * 10), ox + big / 2, oy + side + 16, 11, 700, C.muted);
      label(g, '5', ox + big + small / 2, oy + side + 16, 11, 700, C.muted);
      label(g, 'a square of side ' + n, w / 2, 18, 12, 700, C.fg);
      label(g, 'the two green strips together are ' + commas(a * 100), w / 2, h - 6, 10, 600, '#3fb950');
    }
  }));

  /* 15. either side of a round number — cut the strip, lose the corner */
  reg('mmEitherSide', LAB.drag({
    min: 0, max: 12, value: 7, snap: 1, axis: 'x', aspect: 0.86, gain: 0.75,
    hint: 'drag to move both numbers away from fifty',
    readout: function (v) {
      var k = Math.round(v);
      return hl((50 - k) + ' × ' + (50 + k)) + ' = 2500 − ' + hl(String(k * k), '#f78166') +
        ' = ' + hl(String(2500 - k * k), '#3fb950');
    },
    draw: function (g, w, h, v) {
      var k = Math.round(v);
      var unit = Math.min((w - 60) / 62, (h - 70) / 54);
      var ox = 30, oy = 34;
      var W = (50 + k) * unit, H = (50 - k) * unit, ku = k * unit;
      g.strokeStyle = 'rgba(139,148,158,0.5)'; g.lineWidth = 1; g.setLineDash([4, 4]);
      g.strokeRect(ox, oy, 50 * unit, 50 * unit);
      g.setLineDash([]);
      label(g, 'the 50 by 50 square', ox + 25 * unit, oy - 8, 9.5, 600, C.muted);
      g.fillStyle = 'rgba(88,166,255,0.5)';
      g.fillRect(ox, oy + ku, (50 - k) * unit, H);
      g.fillStyle = 'rgba(63,185,80,0.6)';
      g.fillRect(ox + (50 - k) * unit, oy + ku, ku * 2, H);
      if (k > 0) {
        g.fillStyle = 'rgba(248,81,73,0.28)';
        g.fillRect(ox, oy, 50 * unit - ku, ku);
        g.strokeStyle = C.bad; g.lineWidth = 1.5;
        g.setLineDash([3, 3]);
        g.strokeRect(ox + (50 - k) * unit, oy, ku, ku);
        g.setLineDash([]);
        label(g, k + '×' + k, ox + (50 - k) * unit + ku / 2, oy + ku / 2 + 4,
          Math.max(8, Math.min(12, ku * 0.5)), 800, C.bad);
      }
      label(g, String(50 + k), ox + W / 2, oy + ku + H + 16, 11, 800, C.accent);
      label(g, String(50 - k), ox - 6, oy + ku + H / 2, 11, 800, C.accent, 'right');
      label(g, k === 0 ? 'nothing cut off yet' : 'the green strip moved across; the red corner is gone',
        w / 2, h - 6, 9.5, 600, k === 0 ? C.muted : C.bad);
    }
  }));

  /* 16. percentages flip — the same block, tipped on its side */
  reg('mmPercentFlip', LAB.steps({
    n: 1, aspect: 0.78, everyMs: 1200,
    caption: function (i) {
      return ['8 percent of 25: eight rows of twenty-five dots.',
        'Tipped over, it is 25 percent of 8 — the same ' + hl('200 dots') +
          ', and a percent is one dot in a hundred.'][i];
    },
    draw: function (g, w, h, i, t) {
      var cols = i === 0 ? 25 : 8, rows = i === 0 ? 8 : 25;
      var cw = Math.min((w - 50) / cols, (h - 56) / rows, 16);
      var ox = (w - cw * cols) / 2, oy = 30 + ((h - 56) - cw * rows) / 2;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var n = r * cols + c;
          g.fillStyle = n < 100 ? 'rgba(88,166,255,0.85)' : 'rgba(210,153,34,0.85)';
          g.beginPath();
          g.arc(ox + cw * (c + 0.5), oy + cw * (r + 0.5), Math.max(1.5, cw * 0.3), 0, 7);
          g.fill();
        }
      }
      label(g, i === 0 ? '8 rows of 25' : '25 rows of 8', w / 2, 18, 12.5, 800, C.fg);
      label(g, 'blue is the first hundred, gold is the second', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 17. a percentage built out of a tenth and two halvings */
  reg('mmPercentLadder', LAB.steps({
    n: 3, aspect: 0.72, everyMs: 900,
    caption: function (i) {
      return ['A bill of £240. Nothing added yet.',
        'A tenth of it is ' + hl('£24') + '. Move the decimal point, that is all.',
        'Half of that is 5 percent: ' + hl('£12') + '. Running total £36.',
        'Half again is two and a half percent: ' + hl('£6') + '. Total ' + hl('£42', '#3fb950') + '.'][i];
    },
    draw: function (g, w, h, i) {
      var pieces = [{ pc: '10%', v: 24, colour: 'rgba(88,166,255,0.85)' },
        { pc: '5%', v: 12, colour: 'rgba(63,185,80,0.85)' },
        { pc: '2.5%', v: 6, colour: 'rgba(210,153,34,0.85)' }];
      var pad = 26, base = h - 40, top = 30, full = base - top;
      var bx = pad, bw = Math.min(84, (w - pad * 2) * 0.36);
      g.fillStyle = C.panel;
      roundRect(g, bx, top, bw, full, 6); g.fill();
      label(g, '£240', bx + bw / 2, top + full / 2 + 5, 15, 800, C.muted);
      label(g, 'the bill', bx + bw / 2, base + 16, 10, 600, C.muted);
      var sx = w - pad - bw, y = base, total = 0;
      for (var k = 0; k < i; k++) {
        var p = pieces[k], ph = full * (p.v / 240) * 3.4;
        g.fillStyle = p.colour;
        roundRect(g, sx, y - ph, bw, ph - 2, 4); g.fill();
        label(g, p.pc + '  £' + p.v, sx + bw / 2, y - ph / 2 + 4, 10.5, 800, '#0d1117');
        y -= ph; total += p.v;
      }
      if (i > 0) {
        label(g, '£' + total, sx + bw / 2, y - 10, 15, 800, '#3fb950');
        label(g, 'the service', sx + bw / 2, base + 16, 10, 600, C.muted);
      }
      label(g, 'a tenth, then halve, then halve', w / 2, 16, 10.5, 600, C.muted);
    }
  }));

  /* 18. halve one side, double the other, watch the area refuse to move */
  reg('mmHalveDouble', LAB.steps({
    n: 4, aspect: 0.74, everyMs: 850,
    caption: function (i) {
      var p = [[35, 16], [70, 8], [140, 4], [280, 2], [560, 1]][i];
      return hl(p[0] + ' × ' + p[1]) + (i === 4
        ? ' — and there it is: ' + hl('560', '#3fb950')
        : ' — halve one side, double the other, nothing is lost.');
    },
    draw: function (g, w, h, i) {
      var p = [[35, 16], [70, 8], [140, 4], [280, 2], [560, 1]][i];
      var pad = 40, maxW = w - pad * 2, maxH = h - 70;
      var rw = Math.max(6, p[0] / 560 * maxW);
      var rh = Math.max(6, p[1] / 16 * maxH);
      var ox = pad, oy = 34 + (maxH - rh) / 2;
      g.fillStyle = 'rgba(88,166,255,0.5)';
      roundRect(g, ox, oy, rw, rh, 4); g.fill();
      g.strokeStyle = C.accent; g.lineWidth = 1.5;
      roundRect(g, ox, oy, rw, rh, 4); g.stroke();
      label(g, String(p[0]), ox + rw / 2, oy + rh + 16, 11.5, 800, C.accent);
      label(g, String(p[1]), ox - 8, oy + rh / 2 + 4, 11.5, 800, C.accent, 'right');
      label(g, 'the same area every time', w / 2, 16, 10.5, 600, C.muted);
      label(g, '560 little squares, however you stack them', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 19. the halving ladder on a ruler — a tap question */
  reg('mmSixteenthRuler', LAB.picture({
    aspect: 0.7,
    readout: function (id) {
      if (!id) return 'Halve your way down: 0.5, 0.25, 0.125, 0.0625. Then tap a tick.';
      return { five: '5/16 will not simplify — five sixteenths of the way along.',
        six: '6/16 is the same as 3/8 — three eighths.',
        seven: '7/16 will not simplify — seven sixteenths.',
        eight: '8/16 is exactly a half.' }[id];
    },
    hitTest: function (x, y, w, h) {
      var ids = ['five', 'six', 'seven', 'eight'], pad = 28;
      for (var k = 0; k < 4; k++) {
        var tx = pad + (w - pad * 2) * ((k + 1) / 4);
        if (Math.abs(x - tx) < 24 && y > h * 0.3 && y < h * 0.85) return ids[k];
      }
      return null;
    },
    draw: function (g, w, h, sel) {
      var pad = 28, left = pad, right = w - pad, mid = h * 0.6;
      label(g, 'a half 0.5   ·   a quarter 0.25   ·   an eighth 0.125   ·   a sixteenth 0.0625',
        w / 2, 20, 9.5, 600, C.muted);
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.beginPath(); g.moveTo(left, mid + 0.5); g.lineTo(right, mid + 0.5); g.stroke();
      var names = ['4/16', '5/16', '6/16', '7/16', '8/16'];
      var ids = [null, 'five', 'six', 'seven', 'eight'];
      for (var k = 0; k < 5; k++) {
        var x = left + (right - left) * (k / 4);
        var on = ids[k] && sel === ids[k];
        g.strokeStyle = on ? C.accent : (ids[k] ? C.dim : 'rgba(139,148,158,0.5)');
        g.lineWidth = on ? 3 : 2;
        g.beginPath(); g.moveTo(x, mid - 22); g.lineTo(x, mid + 12); g.stroke();
        if (on) {
          g.fillStyle = C.accent;
          g.beginPath(); g.arc(x, mid - 22, 6, 0, 7); g.fill();
        }
        label(g, names[k], x, mid + 28, 11, on ? 800 : 600, on ? C.accent : C.muted);
        if (k === 0) label(g, '0.25', x, mid - 30, 10, 700, C.gold);
      }
      label(g, '0.5', right, mid - 30, 10, 700, C.gold);
      label(g, 'only the two ends are labelled with their decimals', w / 2, h - 6, 9.5, 500, C.muted);
    }
  }));

  /* 20. the quick compound sum, and the gap it leaves */
  reg('mmCompoundGap', LAB.dial({
    min: 1, max: 40, step: 1, value: 8, label: 'years', aspect: 0.68,
    f: function (x) { return (Math.pow(1.03, x) - 1) * 100; },
    f2: function (x) { return 3 * x; },
    yLabel: 'percent bigger',
    xmin: '1 year', xmax: '40 years',
    marks: [{ x: 25, label: '25 years' }],
    readout: function (x, y) {
      return 'After ' + hl(Math.round(x) + ' years') + ': really ' + hl(y.toFixed(0) + '% bigger', C.accent) +
        ' &nbsp;·&nbsp; the quick sum says ' + hl((3 * x).toFixed(0) + '%', C.gold);
    }
  }));

  /* 21. estimating a root by squaring your guess */
  reg('mmSqrtGuess', LAB.drag({
    min: 7, max: 10, value: 9, snap: 0.005, axis: 'x', aspect: 0.8, gain: 0.9,
    hint: 'drag your guess and square it',
    readout: function (v) {
      var sq = v * v;
      return 'Guess ' + hl(v.toFixed(3)) + ' &nbsp;·&nbsp; squared it is ' +
        hl(sq.toFixed(2), sq > 70 ? '#f78166' : '#3fb950') + ' &nbsp;·&nbsp; ' +
        (Math.abs(sq - 70) < 0.05 ? 'that is seventy' : (sq > 70 ? 'too big' : 'too small'));
    },
    draw: function (g, w, h, v) {
      var pad = 30, maxSide = Math.min(w - pad * 2, h - 90);
      var scale = maxSide / 10;
      var side = v * scale, target = Math.sqrt(70) * scale;
      var ox = pad, oy = h - 46 - side;
      g.strokeStyle = 'rgba(210,153,34,0.9)'; g.lineWidth = 2; g.setLineDash([5, 4]);
      g.strokeRect(ox, h - 46 - target, target, target);
      g.setLineDash([]);
      label(g, 'area 70', ox + target + 6, h - 46 - target + 12, 10.5, 700, C.gold, 'left');
      g.fillStyle = 'rgba(88,166,255,0.35)';
      g.fillRect(ox, oy, side, side);
      g.strokeStyle = C.accent; g.lineWidth = 2;
      g.strokeRect(ox, oy, side, side);
      label(g, 'your square: ' + (v * v).toFixed(2), ox + 6, oy - 8, 11, 800, C.accent, 'left');
      label(g, v.toFixed(2), ox + side / 2, h - 28, 11, 700, C.accent);
      label(g, '64 is 8 squared, 81 is 9 squared — 70 sits between them', w / 2, 16, 10, 600, C.muted);
    }
  }));

  /* 22. casting out nines — a two-second check on a multiplication */
  reg('mmCastNines', LAB.steps({
    n: 4, aspect: 0.72, everyMs: 1000,
    caption: function (i) {
      return ['Somebody says 47 times 63 is 2861.',
        'Fold 47 down: 4 and 7 make 11, and 1 and 1 make ' + hl('2') + '.',
        'Fold 63 down: 6 and 3 make ' + hl('9') + '.',
        '2 times 9 is 18, which folds to ' + hl('9') + '. That is what the answer must fold to.',
        '2861 folds to 8, not 9. ' + hl('The answer is wrong', '#f85149') + ' — it is 2961.'][i];
    },
    draw: function (g, w, h, i) {
      var rows = [
        { text: '47  →  11  →  2', on: i >= 1, colour: C.accent },
        { text: '63  →  9', on: i >= 2, colour: C.accent },
        { text: '2 × 9 = 18  →  9', on: i >= 3, colour: C.gold },
        { text: '2861  →  17  →  8', on: i >= 4, colour: C.bad }
      ];
      var y = 28;
      rows.forEach(function (r) {
        g.globalAlpha = r.on ? 1 : 0.16;
        g.fillStyle = C.panel;
        roundRect(g, 22, y, w - 44, 36, 8); g.fill();
        label(g, r.text, w / 2, y + 24, 15, 800, r.colour);
        g.globalAlpha = 1;
        y += 44;
      });
      if (i >= 4) {
        label(g, '9  ≠  8', w / 2, y + 22, 20, 800, C.bad);
      } else {
        label(g, 'add the digits until one is left', w / 2, y + 20, 10.5, 600, C.muted);
      }
    }
  }));

  /* 23. the average speed that can never get there */
  reg('mmAverageSpeed', LAB.drag({
    min: 10, max: 200, value: 100, snap: 5, axis: 'x', aspect: 0.76,
    hint: 'drag the speed on the way home',
    readout: function (v) {
      var tOut = 60 / 30, tBack = 60 / v, avg = 120 / (tOut + tBack);
      return 'Home at ' + hl(v + ' mph') + ' takes ' + hl(tBack.toFixed(2) + ' h') +
        ' &nbsp;·&nbsp; round trip averages ' + hl(avg.toFixed(1) + ' mph', '#3fb950');
    },
    draw: function (g, w, h, v) {
      var tOut = 2, tBack = 60 / v, total = tOut + tBack;
      var pad = 26, bw = w - pad * 2, y = 44;
      g.fillStyle = 'rgba(247,129,102,0.8)';
      roundRect(g, pad, y, bw * (tOut / Math.max(total, 3)), 26, 5); g.fill();
      label(g, '2 h out at 30', pad + 8, y + 18, 10.5, 800, '#0d1117', 'left');
      g.fillStyle = 'rgba(63,185,80,0.85)';
      roundRect(g, pad + bw * (tOut / Math.max(total, 3)), y,
        Math.max(4, bw * (tBack / Math.max(total, 3))), 26, 5); g.fill();
      label(g, 'hours on the road', pad, y - 8, 10, 600, C.muted, 'left');
      label(g, total.toFixed(2) + ' h', w - pad, y - 8, 10.5, 800, C.fg, 'right');
      var avg = 120 / total;
      var sy = h - 54, sw = bw;
      g.fillStyle = C.panel; roundRect(g, pad, sy, sw, 24, 12); g.fill();
      g.fillStyle = C.accent;
      roundRect(g, pad, sy, Math.max(3, sw * (avg / 70)), 24, 12); g.fill();
      var cap = pad + sw * (60 / 70);
      g.strokeStyle = C.bad; g.lineWidth = 2; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(cap, sy - 10); g.lineTo(cap, sy + 34); g.stroke();
      g.setLineDash([]);
      label(g, 'can never reach 60', cap, sy - 15, 10, 700, C.bad);
      label(g, avg.toFixed(1) + ' mph average', pad + 10, sy + 17, 12, 800, '#0d1117', 'left');
      label(g, 'the slow half eats the clock', w / 2, h - 6, 10, 500, C.muted);
    }
  }));

  /* 24. a percentage point is not a percent */
  reg('mmPointsPercent', LAB.drag({
    min: 0.5, max: 5, value: 3, snap: 0.1, axis: 'x', aspect: 0.72,
    hint: 'drag the new fee',
    readout: function (v) {
      var pts = v - 1, mult = v / 1;
      return 'From 1% to ' + hl(v.toFixed(1) + '%') + ': up ' + hl(pts.toFixed(1) + ' points', C.accent) +
        ' &nbsp;·&nbsp; that is ' + hl(((mult - 1) * 100).toFixed(0) + '% more money', '#f78166');
    },
    draw: function (g, w, h, v) {
      var pad = 34, base = h - 44, top = 30, full = base - top, colW = 62;
      var x1 = w / 2 - colW - 22, x2 = w / 2 + 22;
      function col(x, val, colour, name) {
        var bh = full * (val / 5);
        g.fillStyle = colour;
        roundRect(g, x, base - bh, colW, bh, 5); g.fill();
        label(g, val.toFixed(1) + '%', x + colW / 2, base - bh - 8, 12, 800, colour);
        label(g, name, x + colW / 2, base + 16, 10, 600, C.muted);
      }
      col(x1, 1, 'rgba(88,166,255,0.7)', 'the old fee');
      col(x2, v, 'rgba(247,129,102,0.85)', 'the new fee');
      var y1 = base - full * (1 / 5), y2 = base - full * (v / 5);
      g.strokeStyle = C.accent; g.lineWidth = 1.5; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 + colW, y1); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = C.gold; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x2 + colW + 10, y1); g.lineTo(x2 + colW + 10, y2); g.stroke();
      label(g, (v - 1).toFixed(1) + ' pts', x2 + colW + 14, (y1 + y2) / 2 + 4, 10.5, 800, C.gold, 'left');
      label(g, 'same picture, two very different sentences', w / 2, 16, 10.5, 600, C.muted);
      label(g, 'x' + (v / 1).toFixed(1) + ' the money out of your pocket', w / 2, h - 6, 10.5, 700, '#f78166');
    }
  }));

})(window);
