/* QQ visuals — the back of an envelope (unit 14).
 *
 * The player drags along a ladder of powers of ten, pulls each assumption in a
 * Fermi chain and watches the answer move, runs a pub door, casts a net into a
 * lake, guesses a taxi fleet and tallies the leading digits of real numbers.
 * Every figure on screen is one the player has set or caused.
 *
 * Loads after js/viz.js and js/viz_lab.js. The London assumptions, the pub, the
 * lake, the taxi numbers and the three ledgers all come from
 * QQ_DATA.vizData.estimate — the same rows site/checks/estimate.py works from.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };
  var DATA = (global.QQ_DATA && global.QQ_DATA.vizData &&
              global.QQ_DATA.vizData.estimate) || {};

  var YEAR = 365.2425 * 24 * 3600;

  function big(t) { return '<b>' + t + '</b>'; }
  function commas(n) {
    var s = String(Math.round(n)), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      if (++c % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }
  function pickInt(n) { return Math.floor(Math.random() * n); }
  function human(seconds) {
    if (seconds < 120) return seconds.toFixed(0) + ' seconds';
    if (seconds < 7200) return (seconds / 60).toFixed(0) + ' minutes';
    if (seconds < 172800) return (seconds / 3600).toFixed(1) + ' hours';
    if (seconds < 60 * 86400) return (seconds / 86400).toFixed(1) + ' days';
    if (seconds < 2 * YEAR) return (seconds / (86400 * 30.44)).toFixed(1) + ' months';
    if (seconds < 3000 * YEAR) return (seconds / YEAR).toFixed(seconds < 30 * YEAR ? 1 : 0) + ' years';
    return commas(seconds / YEAR) + ' years';
  }

  /* ======================================================================
   * billion_seconds — the ladder of powers of ten
   * ====================================================================== */
  reg('secondsLadder', function (host, api) {
    var LANDMARKS = [
      { s: 60, what: 'a minute' },
      { s: 3600, what: 'an hour' },
      { s: 86400, what: 'a day' },
      { s: 7 * 86400, what: 'a week' },
      { s: YEAR, what: 'a year' },
      { s: 18 * YEAR, what: 'growing up' },
      { s: 80 * YEAR, what: 'a long life' },
      { s: 2000 * YEAR, what: 'since the Romans' },
      { s: 12000 * YEAR, what: 'since farming began' }
    ];
    return LAB.drag({
      min: 3, max: 13, value: 6, axis: 'x', gain: 0.9, aspect: 0.6,
      hint: 'drag along the ladder',
      readout: function (v) {
        var secs = Math.pow(10, v);
        var name = v >= 12 ? 'a trillion' : (v >= 9 ? 'a billion'
          : (v >= 6 ? 'a million' : 'a thousand'));
        return big(Math.pow(10, Math.round(v * 10) / 10).toExponential(1)
          .replace('e+', ' × 10^') + ' seconds') +
          '<br>that is ' + big(human(secs)) +
          ' <span style="color:#8b949e">(' + name + ' is 10^' +
          (v >= 12 ? 12 : (v >= 9 ? 9 : (v >= 6 ? 6 : 3))) + ')</span>';
      },
      draw: function (g, w, h, v) {
        var pad = 20, left = pad + 4, right = w - pad, base = h - 44;
        g.strokeStyle = C.line; g.lineWidth = 2;
        g.beginPath(); g.moveTo(left, base); g.lineTo(right, base); g.stroke();
        function X(p) { return left + (right - left) * ((p - 3) / 10); }
        var i;
        for (i = 3; i <= 13; i++) {
          g.strokeStyle = 'rgba(139,148,158,0.35)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(X(i), base - 5); g.lineTo(X(i), base + 5); g.stroke();
          if (i % 3 === 0) {
            g.fillStyle = C.muted; g.font = f(9, 700); g.textAlign = 'center';
            g.fillText('10^' + i, X(i), base + 17);
          }
        }
        LANDMARKS.forEach(function (m, k) {
          var lx = X(Math.log(m.s) / Math.LN10);
          if (lx < left - 4 || lx > right + 4) return;
          var ly = 22 + (k % 3) * 20;
          g.strokeStyle = 'rgba(210,153,34,0.35)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(lx, ly + 4); g.lineTo(lx, base - 6); g.stroke();
          g.fillStyle = C.gold; g.font = f(9.5, 600); g.textAlign = 'center';
          g.fillText(m.what, clamp(lx, left + 30, right - 30), ly);
        });
        var px = X(v);
        g.strokeStyle = C.accent; g.lineWidth = 2;
        g.beginPath(); g.moveTo(px, 14); g.lineTo(px, base + 6); g.stroke();
        g.beginPath(); g.arc(px, base, 7, 0, 7); g.fillStyle = C.accent; g.fill();
        g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(human(Math.pow(10, v)), clamp(px, left + 40, right - 40), base + 34);
      }
    })(host, api);
  });

  /* ======================================================================
   * piano_tuners — pull any link in the chain
   * ====================================================================== */
  reg('fermiChain', function (host, api) {
    var lon = DATA.london || { people: 9000000, perPiano: 200, tuningsPerDay: 4, workDays: 250 };
    var v = { people: lon.people, perPiano: lon.perPiano,
              perDay: lon.tuningsPerDay, days: lon.workDays };
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.66);

    function pianos() { return v.people / v.perPiano; }
    function perTuner() { return v.perDay * v.days; }
    function tuners() { return pianos() / perTuner(); }
    function render() {
      out.innerHTML = big(commas(pianos())) + ' pianos &nbsp;÷&nbsp; ' +
        big(commas(perTuner())) + ' tunings a tuner a year<br>= ' +
        big(commas(tuners()) + ' tuners');
    }
    K.slider(ctr, { min: 1, max: 20, step: 1, value: 9, label: 'millions of people' },
      function (x) { v.people = x * 1e6; render(); api.onInteract('slider'); });
    K.slider(ctr, { min: 50, max: 600, step: 50, value: v.perPiano, label: 'people per piano' },
      function (x) { v.perPiano = x; render(); api.onInteract('slider'); });
    K.slider(ctr, { min: 1, max: 10, step: 1, value: v.perDay, label: 'tunings a day' },
      function (x) { v.perDay = x; render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      var pad = 16, rows = [
        ['people in London', commas(v.people), C.accent],
        ['÷ people per piano', commas(v.perPiano), 'rgba(139,148,158,0.6)'],
        ['= pianos', commas(pianos()), C.gold],
        ['÷ tunings a tuner a year', commas(perTuner()), 'rgba(139,148,158,0.6)'],
        ['= tuners needed', commas(tuners()), C.good]
      ];
      var rowH = Math.min(28, (h - 24) / rows.length);
      rows.forEach(function (r, i) {
        var y = 12 + i * rowH;
        var boxed = r[0].charAt(0) === '=';
        if (boxed) {
          roundRect(g, pad - 4, y - 2, w - pad * 2 + 8, rowH - 4, 5);
          g.fillStyle = 'rgba(88,166,255,0.07)'; g.fill();
        }
        g.fillStyle = boxed ? C.fg : C.muted;
        g.font = f(boxed ? 11 : 10, boxed ? 700 : 500); g.textAlign = 'left';
        g.fillText(r[0], pad, y + rowH / 2 + 3);
        g.fillStyle = r[2]; g.font = f(boxed ? 14 : 11, 700); g.textAlign = 'right';
        g.fillText(r[1], w - pad, y + rowH / 2 + 3);
      });
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * century_people — the same sum, one multiplication at a time
   * ====================================================================== */
  reg('twoBars', function (host, api) {
    var STEPS = [
      { label: 'a century', value: 100, note: 'years' },
      { label: '× 365 days', value: 100 * 365.2425, note: 'days' },
      { label: '× 24 hours', value: 100 * 365.2425 * 24, note: 'hours' },
      { label: '× 60 minutes', value: 100 * 365.2425 * 24 * 60, note: 'minutes' },
      { label: '× 60 seconds', value: 100 * YEAR, note: 'seconds' }
    ];
    var PEOPLE = 8e9;
    return LAB.steps({
      n: STEPS.length - 1, aspect: 0.6, playLabel: 'Do the sum',
      caption: function (i) {
        var s = STEPS[i];
        return big(commas(s.value)) + ' ' + s.note + ' in a century' +
          (i === STEPS.length - 1
            ? '<br><span style="color:#8b949e">against about 8 billion people alive</span>'
            : '');
      },
      draw: function (g, w, h, i) {
        var pad = 20, base = h - 34, top = 20;
        var s = STEPS[i];
        var top$ = Math.max(s.value, PEOPLE) * 1.12;
        var bw = (w - pad * 2) / 2.6, gap = bw * 0.3;
        [[s.value, 'seconds in a century', C.accent],
         [PEOPLE, 'people alive', C.gold]].forEach(function (b, k) {
          var x = pad + k * (bw + gap);
          var bh = Math.max(2, (base - top) * (b[0] / top$));
          roundRect(g, x, base - bh, bw, bh, 5); g.fillStyle = b[2]; g.fill();
          g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'center';
          g.fillText(b[0] >= 1e9 ? (b[0] / 1e9).toFixed(2) + ' bn' : commas(b[0]),
            x + bw / 2, base - bh - 6);
          g.fillStyle = C.muted; g.font = f(9, 600);
          g.fillText(b[1], x + bw / 2, base + 13);
        });
        g.strokeStyle = C.line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
        g.fillStyle = C.fg; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(STEPS.slice(0, i + 1).map(function (x) { return x.label; }).join('  '),
          w / 2, h - 4);
      }
    })(host, api);
  });

  /* ======================================================================
   * little_law — a pub door that counts for itself
   * ====================================================================== */
  reg('pubFlow', function (host, api) {
    var pub = DATA.pub || { inside: 60, stayMinutes: 45 };
    var crowd = pub.inside, stay = pub.stayMinutes;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.62);
    var hours = 0, through = 0, occ = [], pending = 0;

    function arrivals() { return crowd / (stay / 60); }
    function render() {
      out.innerHTML = big(crowd) + ' inside, staying ' + big(stay + ' minutes') +
        (hours ? '<br>' + big(commas(through / hours)) + ' people an hour walked in ' +
          'over ' + commas(hours) + ' simulated hours'
          : '<br><span style="color:#8b949e">run the evening and count the door</span>');
    }
    /* A real queue: people turn up at whatever rate keeps the pub at `crowd`,
     * and the door counter is what the player reads. */
    function runHours(n) {
      var rate = arrivals(), stayH = stay / 60, i;
      for (i = 0; i < n; i++) {
        var arrivalsThisHour = 0, tt = 0;
        while (true) {
          tt += -Math.log(1 - Math.random()) / rate;
          if (tt >= 1) break;
          arrivalsThisHour++;
        }
        through += arrivalsThisHour;
        hours++;
        occ.push(Math.round(rate * stayH));
        if (occ.length > 120) occ.shift();
      }
    }
    K.slider(ctr, { min: 10, max: 150, step: 10, value: crowd, label: 'people inside' },
      function (v) { crowd = Math.round(v); hours = 0; through = 0; occ = []; render(); api.onInteract('slider'); });
    K.slider(ctr, { min: 15, max: 120, step: 15, value: stay, label: 'minutes each stays' },
      function (v) { stay = Math.round(v); hours = 0; through = 0; occ = []; render(); api.onInteract('slider'); });
    K.button(ctr, 'Run 200 hours', function () { pending += 200; api.onInteract('run'); })
      .classList.add('primary');
    render();

    stage.draw = function (g, w, h, t) {
      if (pending > 0) { var take = Math.min(pending, 20); runHours(take); pending -= take; render(); }
      var pad = 16, top = 16;
      // the room, as a crowd of dots
      var shown = Math.min(crowd, 90);
      var cols = 15, cell = Math.min((w - pad * 2) / cols, 14);
      for (var i = 0; i < shown; i++) {
        var x = pad + (i % cols) * cell + cell / 2;
        var y = top + Math.floor(i / cols) * cell + cell / 2;
        g.beginPath(); g.arc(x, y + Math.sin(t * 2 + i) * 1.2, cell * 0.3, 0, 7);
        g.fillStyle = 'rgba(88,166,255,0.75)'; g.fill();
      }
      var rows = Math.ceil(shown / cols);
      var by = top + rows * cell + 12;
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
      g.fillText(crowd + ' inside at any moment' + (crowd > 90 ? ' (90 drawn)' : ''), pad, by);
      // the door
      var dy = by + 12, bw = w - pad * 2;
      roundRect(g, pad, dy, bw, 26, 6); g.fillStyle = C.panel; g.fill();
      g.strokeStyle = C.dim; g.lineWidth = 1; g.stroke();
      g.fillStyle = hours ? C.good : C.muted; g.font = f(13, 700); g.textAlign = 'center';
      g.fillText(hours ? commas(through / hours) + ' through the door an hour'
        : 'the door has not been counted yet', w / 2, dy + 17);
      g.fillStyle = C.muted; g.font = f(9.5, 600);
      g.fillText(crowd + ' people × ' + (60 / stay).toFixed(2) +
        ' turns of the room an hour', w / 2, dy + 44);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * tag_the_fish — cast the net again and again
   * ====================================================================== */
  reg('lakeNet', function (host, api) {
    var lake = DATA.lake || { tagged: 100, secondCatch: 100, recaptured: 4 };
    var TRUE_N = Math.round(lake.tagged * lake.secondCatch / lake.recaptured);
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.56);
    var casts = 0, totalBack = 0, last = null, dots = [];
    var i;
    for (i = 0; i < 260; i++) {
      dots.push({ x: Math.random(), y: Math.random(),
                  tagged: i < Math.round(260 * lake.tagged / TRUE_N) });
    }

    function cast() {
      var back = 0;
      for (var k = 0; k < lake.secondCatch; k++) {
        if (pickInt(TRUE_N) < lake.tagged) back++;
      }
      casts++; totalBack += back; last = back;
      return back;
    }
    function render() {
      out.innerHTML = casts
        ? 'Last net of ' + lake.secondCatch + ' held ' + big(last + ' tagged') +
          '<br>' + big(commas(casts)) + ' casts &nbsp;·&nbsp; ' +
          big((totalBack / casts).toFixed(2)) + ' tagged per net on average'
        : big(lake.tagged) + ' fish tagged and put back. Cast the net again.';
    }
    K.button(ctr, 'Cast the net', function () { cast(); render(); api.onInteract('cast'); })
      .classList.add('primary');
    K.button(ctr, 'Cast 500 times', function () {
      for (var k = 0; k < 500; k++) cast();
      render(); api.onInteract('run');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h, t) {
      var pad = 12, top = 10, lh = Math.max(90, h - 62), lw = w - pad * 2;
      roundRect(g, pad, top, lw, lh, 14);
      g.fillStyle = 'rgba(88,166,255,0.07)'; g.fill();
      g.strokeStyle = 'rgba(88,166,255,0.35)'; g.lineWidth = 1.4; g.stroke();
      dots.forEach(function (d, k) {
        var x = pad + 8 + d.x * (lw - 16);
        var y = top + 8 + d.y * (lh - 16) + Math.sin(t * 1.4 + k) * 1.5;
        g.beginPath(); g.arc(x, y, d.tagged ? 3.4 : 2.4, 0, 7);
        g.fillStyle = d.tagged ? C.gold : 'rgba(139,148,158,0.55)'; g.fill();
      });
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
      g.fillText('gold = tagged (the lake is drawn to scale, not to size)',
        pad + 4, top + lh + 14);
      if (casts) {
        var by = top + lh + 22, bw = lw;
        roundRect(g, pad, by, bw, 12, 6); g.fillStyle = C.panel; g.fill();
        roundRect(g, pad, by, clamp(bw * (last / 12), 3, bw), 12, 6);
        g.fillStyle = C.gold; g.fill();
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
        g.fillText(last + ' tagged in the last net of ' + lake.secondCatch, w / 2, by + 25);
      }
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * taxi_serials — guess the fleet, then sample four from it
   * ====================================================================== */
  reg('serialGuess', function (host, api) {
    var seen = (DATA.taxis || [12, 47, 89, 104]).slice();
    var top = Math.max.apply(null, seen);
    return LAB.drag({
      min: top, max: top * 4, value: Math.round(top * 1.9), axis: 'x',
      gain: 0.85, aspect: 0.5, hint: 'drag your guess at the fleet',
      readout: function (v) {
        var n = Math.round(v);
        var gapAbove = n - top;
        return 'You guess ' + big(commas(n) + ' taxis') +
          '<br><span style="color:#8b949e">that leaves ' + commas(gapAbove) +
          ' above the highest one you saw, against gaps of about ' +
          commas(Math.round(top / seen.length)) + ' between them</span>';
      },
      draw: function (g, w, h, v) {
        var n = Math.round(v);
        var pad = 18, left = pad, right = w - pad, y = h * 0.42;
        // the fleet, as a strip
        roundRect(g, left, y - 14, right - left, 28, 6);
        g.fillStyle = 'rgba(139,148,158,0.13)'; g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 1; g.stroke();
        function X(num) { return left + (right - left) * (num / n); }
        seen.forEach(function (s) {
          var x = X(s);
          g.strokeStyle = C.gold; g.lineWidth = 2.5;
          g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x, y + 14); g.stroke();
          g.fillStyle = C.gold; g.font = f(9, 700); g.textAlign = 'center';
          g.fillText(String(s), x, y - 19);
        });
        // the gaps, measured out
        var edges = [0].concat(seen).concat([n]);
        for (var i = 0; i < edges.length - 1; i++) {
          var a = X(edges[i]), b = X(edges[i + 1]);
          g.strokeStyle = i === edges.length - 2 ? C.accent : 'rgba(139,148,158,0.4)';
          g.lineWidth = i === edges.length - 2 ? 2 : 1;
          g.beginPath(); g.moveTo(a + 2, y + 22); g.lineTo(b - 2, y + 22); g.stroke();
          if (b - a > 26) {
            g.fillStyle = i === edges.length - 2 ? C.accent : C.muted;
            g.font = f(8.5, 600); g.textAlign = 'center';
            g.fillText(commas(edges[i + 1] - edges[i]), (a + b) / 2, y + 33);
          }
        }
        g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
        g.fillText('1', left, y + 48);
        g.textAlign = 'right';
        g.fillText(commas(n) + ' taxis', right, y + 48);
        g.textAlign = 'center';
        g.fillStyle = C.fg; g.font = f(10, 600);
        g.fillText('four taxis cut the fleet into five stretches', w / 2, y + 66);
      }
    })(host, api);
  });

  /* ======================================================================
   * benford_ones — tally the leading digits of real numbers
   * ====================================================================== */
  reg('firstDigits', function (host, api) {
    /* Long runs, not short cycles: 2^1..2^1000 and 900 years of 7% growth are
     * both still finite in a double, and both are genuinely a thousand-odd
     * different numbers rather than sixty repeated. */
    var sources = {
      'powers of two': function (k) { return Math.pow(2, 1 + (k % 1000)); },
      'Fibonacci': null,
      '7% a year': function (k) { return 100 * Math.pow(1.07, k % 900); }
    };
    var names = ['powers of two', 'Fibonacci', '7% a year'];
    var which = 0;
    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0], n = 0, k = 0;
    var fibA = 1, fibB = 1;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.62);
    var pending = 0;

    function lead(v) {
      if (!isFinite(v) || v <= 0) return 0;
      var e = Math.floor(Math.log(v) / Math.LN10);
      var m = v / Math.pow(10, e);
      var d = Math.floor(m);
      return d >= 1 && d <= 9 ? d : (d > 9 ? 1 : 0);
    }
    function next() {
      var v;
      if (names[which] === 'Fibonacci') {
        v = fibA;
        var t = fibA + fibB; fibA = fibB; fibB = t;
        if (fibA > 1e300) { fibA = 1; fibB = 1; }
      } else {
        v = sources[names[which]](k);
      }
      k++;
      var d = lead(v);
      if (d) { counts[d - 1]++; n++; }
    }
    function reset() {
      counts = [0, 0, 0, 0, 0, 0, 0, 0, 0]; n = 0; k = 0; fibA = 1; fibB = 1; pending = 0;
    }
    function render() {
      out.innerHTML = n
        ? big(commas(n)) + ' numbers from ' + big(names[which]) +
          '<br>leading digit 1: ' + big(((counts[0] / n) * 100).toFixed(1) + '%') +
          ' &nbsp;·&nbsp; leading digit 9: ' + big(((counts[8] / n) * 100).toFixed(1) + '%')
        : 'Pick a source and tally its leading digits.';
    }
    names.forEach(function (nm, i) {
      K.button(ctr, nm, function () {
        which = i; reset(); pending += 800; render(); api.onInteract('source');
      }).classList.add(i === 0 ? 'primary' : 'small');
    });
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 60);
        for (var i = 0; i < take; i++) next();
        pending -= take; render();
      }
      var pad = 18, base = h - 30, top = 18;
      var bw = (w - pad * 2) / 9;
      var BEN = [];
      for (var d = 1; d <= 9; d++) BEN.push(Math.log(1 + 1 / d) / Math.LN10);
      var maxV = 0.34;
      for (var j = 0; j < 9; j++) {
        var p = n ? counts[j] / n : 0;
        var x = pad + j * bw;
        var bh = Math.max(1, (base - top) * (p / maxV));
        roundRect(g, x + 2, base - bh, bw - 4, bh, 3);
        g.fillStyle = j === 0 ? C.good : 'rgba(88,166,255,0.7)'; g.fill();
        var ey = base - (base - top) * (BEN[j] / maxV);
        g.strokeStyle = C.gold; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x + 1, ey); g.lineTo(x + bw - 1, ey); g.stroke();
        g.fillStyle = C.muted; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(String(j + 1), x + bw / 2, base + 14);
        if (n && p > 0.02) {
          g.fillStyle = C.fg; g.font = f(8.5, 700);
          g.fillText((p * 100).toFixed(0), x + bw / 2, base - bh - 4);
        }
      }
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
      g.fillStyle = C.gold; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('gold marks: what the law predicts', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * spot_the_fake — three ledgers, tap one to tally it
   * ====================================================================== */
  reg('ledgerCheck', function (host, api) {
    var ledgers = DATA.ledgers || [];
    var out = K.readout(host, 'Tap a ledger to tally its first digits.');
    var stage = K.Stage(host, 1.05);
    var sel = null;

    function digits(vals) {
      var c = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      vals.forEach(function (v) { c[+String(Math.abs(v)).charAt(0) - 1]++; });
      return c;
    }
    function pick(id) {
      sel = id;
      var led = null;
      ledgers.forEach(function (l) { if (l.id === id) led = l; });
      if (!led) return;
      var c = digits(led.values);
      out.innerHTML = big(led.name) + ' &nbsp;·&nbsp; ' + big(c[0]) +
        ' of its ' + led.values.length + ' entries start with a 1' +
        '<br><span style="color:#8b949e">the law expects about ' +
        (led.values.length * Math.log(2) / Math.LN10).toFixed(1) + '</span>';
      api.onSelect(id);
      api.onInteract('ledger');
    }
    var chips = K.regionChips(host, api.regions || [], function (id) {
      if (chips && chips.select) chips.select(id);
      pick(id);
    });

    function colX(i, w) { var pad = 8, cw = (w - pad * 2) / ledgers.length; return pad + i * cw; }
    function onTap(ev) {
      var p = stage.pointer(ev), w = stage.w;
      var cw = (w - 16) / ledgers.length;
      var i = Math.floor((p.x - 8) / cw);
      if (i >= 0 && i < ledgers.length) {
        if (chips && chips.select) chips.select(ledgers[i].id);
        pick(ledgers[i].id);
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var pad = 8, cw = (w - pad * 2) / Math.max(1, ledgers.length);
      var top = 20, rowH = Math.min(11.5, (h * 0.62) / 18);
      ledgers.forEach(function (led, i) {
        var x = colX(i, w), on = sel === led.id;
        roundRect(g, x + 2, 4, cw - 4, top + 18 * rowH + 6, 6);
        g.fillStyle = on ? 'rgba(88,166,255,0.10)' : 'rgba(139,148,158,0.05)'; g.fill();
        g.strokeStyle = on ? C.accent : C.dim; g.lineWidth = on ? 1.8 : 1; g.stroke();
        g.fillStyle = on ? C.accent : C.muted; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(led.name, x + cw / 2, 17);
        led.values.forEach(function (v, k) {
          var d = +String(v).charAt(0);
          g.fillStyle = d === 1 ? C.gold : C.muted;
          g.font = f(Math.min(10, rowH - 1), d === 1 ? 700 : 500);
          g.textAlign = 'center';
          g.fillText('£' + commas(v), x + cw / 2, top + 12 + k * rowH);
        });
      });
      // the tally for whichever one is selected
      var by = top + 18 * rowH + 18;
      var BEN = [];
      for (var d2 = 1; d2 <= 9; d2++) BEN.push(Math.log(1 + 1 / d2) / Math.LN10);
      var led2 = null;
      ledgers.forEach(function (l) { if (l.id === sel) led2 = l; });
      var bw = (w - 24) / 9, base = h - 28, gtop = by + 4;
      for (var j = 0; j < 9; j++) {
        var x2 = 12 + j * bw;
        var p = led2 ? digits(led2.values)[j] / led2.values.length : 0;
        var bh = Math.max(1, (base - gtop) * (p / 0.4));
        roundRect(g, x2 + 1.5, base - bh, bw - 3, bh, 2);
        g.fillStyle = j === 0 ? C.gold : 'rgba(88,166,255,0.7)'; g.fill();
        var ey = base - (base - gtop) * (BEN[j] / 0.4);
        g.strokeStyle = 'rgba(210,153,34,0.85)'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x2 + 0.5, ey); g.lineTo(x2 + bw - 0.5, ey); g.stroke();
        g.fillStyle = C.muted; g.font = f(8.5, 700); g.textAlign = 'center';
        g.fillText(String(j + 1), x2 + bw / 2, base + 11);
      }
      g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
      g.fillText(led2 ? 'first digits of ' + led2.name + ' — gold marks are the law'
        : 'tap a ledger to tally its first digits', w / 2, h - 2);
    };
    return {
      destroy: stage.destroy,
      select: function (id) { if (chips && chips.select) chips.select(id); pick(id); }
    };
  });

  /* ======================================================================
   * errors_stack — three rough guesses, multiplied
   * ====================================================================== */
  reg('errorStack', function (host, api) {
    var sd = DATA.guessError != null ? DATA.guessError : 0.1;
    var k = DATA.guessCount || 3;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.6);
    var bins = {}, n = 0, sum = 0, sumsq = 0, pending = 0, last = [];

    function gauss() {
      var u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function trial() {
      var errs = [], tot = 0, i;
      for (i = 0; i < k; i++) { var e = gauss() * sd; errs.push(e); tot += e; }
      last = errs;
      var pct = (Math.exp(tot) - 1) * 100;
      n++; sum += pct; sumsq += pct * pct;
      var key = Math.round(pct / 5) * 5;
      bins[key] = (bins[key] || 0) + 1;
    }
    function spread() {
      if (n < 2) return 0;
      var m = sum / n;
      return Math.sqrt(Math.max(0, sumsq / n - m * m));
    }
    function render() {
      out.innerHTML = n
        ? big(commas(n)) + ' products &nbsp;·&nbsp; typical error ' +
          big(spread().toFixed(1) + '%') +
          '<br><span style="color:#8b949e">each of the ' + k +
          ' guesses was ' + (sd * 100).toFixed(0) + '% out on its own</span>'
        : 'Run the three guesses and watch the answer spread.';
    }
    K.button(ctr, 'Run 5,000', function () { pending += 5000; api.onInteract('run'); })
      .classList.add('primary');
    K.button(ctr, 'Reset', function () {
      bins = {}; n = 0; sum = 0; sumsq = 0; pending = 0; render(); api.onInteract('reset');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 500);
        for (var i = 0; i < take; i++) trial();
        pending -= take; render();
      }
      var pad = 16, base = h - 42, top = 30;
      var lo = -60, hi = 60, span = (hi - lo) / 5 + 1;
      var bw = (w - pad * 2) / span;
      var maxC = 1, key;
      for (key in bins) if (bins.hasOwnProperty(key)) maxC = Math.max(maxC, bins[key]);
      for (var b = lo; b <= hi; b += 5) {
        var c = bins[b] || 0;
        var x = pad + ((b - lo) / 5) * bw;
        var bh = (base - top) * (c / maxC);
        roundRect(g, x + 0.8, base - bh, Math.max(1, bw - 1.6), bh, 2);
        g.fillStyle = Math.abs(b) <= 17.5 ? C.good : 'rgba(88,166,255,0.6)'; g.fill();
      }
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
      [[-30, '−30%'], [0, 'spot on'], [30, '+30%']].forEach(function (m) {
        var x = pad + ((m[0] - lo) / 5) * bw + bw / 2;
        g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
        g.fillText(m[1], x, base + 13);
      });
      // the three guesses of the last run
      var gy = 12, gw = (w - pad * 2) / k;
      last.forEach(function (e, i) {
        var x = pad + i * gw + gw / 2;
        g.fillStyle = 'rgba(139,148,158,0.6)'; g.font = f(9, 600); g.textAlign = 'center';
        g.fillText((e >= 0 ? '+' : '') + (e * 100).toFixed(0) + '%', x, gy);
      });
      if (last.length) {
        g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
        g.fillText('the last three guesses’ errors', w / 2, h - 4);
      }
      if (n > 100) {
        var s = spread();
        [-s, s].forEach(function (v) {
          var x = pad + ((v - lo) / 5) * bw + bw / 2;
          g.strokeStyle = 'rgba(210,153,34,0.8)'; g.lineWidth = 1.6;
          g.setLineDash([3, 3]);
          g.beginPath(); g.moveTo(x, top); g.lineTo(x, base); g.stroke();
          g.setLineDash([]);
        });
        g.fillStyle = C.gold; g.font = f(10, 700); g.textAlign = 'right';
        g.fillText('± ' + s.toFixed(1) + '%', w - pad, gy);
      }
    };
    return { destroy: stage.destroy };
  });

})(window);
