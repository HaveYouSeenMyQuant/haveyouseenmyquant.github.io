/* QQ visuals — what a yes or a no is worth (unit 13).
 *
 * The player builds the question tree by tapping, watches the shorter shelf run
 * out of room, reads three parity rings off a Venn diagram, flips bits on a wire
 * and squashes a stream of biased coin flips with a real Huffman coder. Nothing
 * here prints a formula, and nothing reports a number the player has not caused.
 *
 * Loads after js/viz.js and js/viz_lab.js. The suspects, their chances, the
 * candidate questions, the wiring of the seven lamps, the noise on the wire and
 * the bent coin all come from QQ_DATA.vizData.info — the same numbers
 * site/checks/info.py derives its answers from.
 */
(function (global) {
  'use strict';

  var K = global.QQViz.kit;
  var LAB = global.QQLab;
  var C = K.C;
  var f = K.f, clamp = K.clamp, roundRect = K.roundRect;
  var reg = function (id, fn) { global.QQViz.register(id, fn); };
  var DATA = (global.QQ_DATA && global.QQ_DATA.vizData &&
              global.QQ_DATA.vizData.info) || {};

  function big(t) { return '<b>' + t + '</b>'; }
  function commas(n) {
    var s = String(Math.round(n)), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      if (++c % 3 === 0 && i > 0) out = ',' + out;
    }
    return out;
  }
  function suspects() {
    return (DATA.suspects || []).map(function (s) {
      return { id: s.id, name: s.name, p: s.num / s.den };
    });
  }
  var SERIES = [C.accent, C.gold, '#3fb950', '#db61a2'];

  /* ======================================================================
   * deck_questions — orders against halvings
   * ====================================================================== */
  reg('bitsLadder', function (host, api) {
    function bits(n) {                              // log2(n!) without overflow
      var t = 0;
      for (var i = 2; i <= n; i++) t += Math.log(i) / Math.LN2;
      return t;
    }
    return LAB.dial({
      min: 2, max: 52, step: 1, value: 12, label: 'cards in the deck',
      aspect: 0.6, ymin: 0,
      f: function (n) { return bits(Math.round(n)); },
      xmin: '2 cards', xmax: '52 cards',
      yLabel: 'yes-or-no questions needed',
      marks: [{ x: 52, label: 'a full deck' }],
      readout: function (n, y) {
        n = Math.round(n);
        var orders = Math.exp(bits(n) * Math.LN2);
        var shown = orders < 1e15 ? commas(orders) : orders.toExponential(2)
          .replace('e+', ' × 10^');
        return big(n) + ' cards can be in ' + big(shown) + ' orders' +
          '<br>naming one of them takes ' + big(Math.ceil(y)) + ' yes-or-no questions';
      }
    })(host, api);
  });

  /* ======================================================================
   * clever_questions — build the question tree by tapping
   * ====================================================================== */
  reg('questionTree', function (host, api) {
    var sus = suspects();
    var ctr = K.controls(host);
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.72);
    /* every open group of suspects still to be split, with the depth it sits at */
    var groups = [{ ids: sus.map(function (s) { return s.id; }), depth: 0 }];
    var asked = [];

    function byId(id) {
      for (var i = 0; i < sus.length; i++) if (sus[i].id === id) return sus[i];
      return null;
    }
    function cost() {
      var total = 0;
      asked.forEach(function (a) {
        a.ids.forEach(function (id) { total += byId(id).p; });
      });
      return total;
    }
    function done() { return groups.length === 0; }
    function render() {
      out.innerHTML = done()
        ? 'Every suspect named &nbsp;·&nbsp; this tree costs ' +
          big(cost().toFixed(2)) + ' questions on average'
        : 'Tap a suspect to ask “is it them?” &nbsp;·&nbsp; ' +
          big(asked.length) + ' question' + (asked.length === 1 ? '' : 's') +
          ' so far, costing ' + big(cost().toFixed(2));
    }
    K.button(ctr, 'Start again', function () {
      groups = [{ ids: sus.map(function (s) { return s.id; }), depth: 0 }];
      asked = []; render(); api.onInteract('reset');
    }).classList.add('small');
    K.button(ctr, 'Split them two and two', function () {
      groups = [{ ids: [sus[2].id, sus[3].id], depth: 1 }, { ids: [sus[0].id, sus[1].id], depth: 1 }];
      asked = [{ ids: sus.map(function (s) { return s.id; }), depth: 0 }];
      // then name each pair
      asked.push({ ids: [sus[0].id, sus[1].id], depth: 1 });
      asked.push({ ids: [sus[2].id, sus[3].id], depth: 1 });
      groups = [];
      render(); api.onInteract('preset');
    }).classList.add('small');
    render();

    var hits = [];
    function onTap(ev) {
      if (done()) return;
      var p = stage.pointer(ev);
      for (var i = 0; i < hits.length; i++) {
        var r = hits[i];
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
          var gi = r.group;
          var grp = groups[gi];
          asked.push({ ids: grp.ids.slice(), depth: grp.depth });
          var rest = grp.ids.filter(function (id) { return id !== r.id; });
          groups.splice(gi, 1);
          if (rest.length > 1) groups.push({ ids: rest, depth: grp.depth + 1 });
          render(); api.onInteract('split');
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      hits = [];
      var pad = 14, top = 14, rowH = 34;
      // the still-open groups, each drawn as a bar split by probability
      var rows = groups.length ? groups : [];
      if (!rows.length) {
        g.fillStyle = C.good; g.font = f(13, 700); g.textAlign = 'center';
        g.fillText('all four named', w / 2, top + 22);
      }
      rows.forEach(function (grp, gi) {
        var y = top + gi * (rowH + 10);
        var tot = 0;
        grp.ids.forEach(function (id) { tot += byId(id).p; });
        var x = pad, bw = w - pad * 2;
        grp.ids.forEach(function (id) {
          var s = byId(id), seg = bw * (s.p / tot);
          roundRect(g, x + 1, y, Math.max(6, seg - 2), rowH - 4, 4);
          g.fillStyle = SERIES[sus.indexOf(s) % SERIES.length]; g.fill();
          g.fillStyle = '#0d1117'; g.font = f(12, 700); g.textAlign = 'center';
          if (seg > 22) g.fillText(s.name, x + seg / 2, y + rowH / 2 + 1);
          g.font = f(8.5, 600);
          if (seg > 40) g.fillText((s.p * 100).toFixed(0) + '%', x + seg / 2, y + rowH - 8);
          hits.push({ x: x, y: y, w: seg, h: rowH - 4, id: id, group: gi });
          x += seg;
        });
        g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'left';
        g.fillText('after ' + grp.depth + ' question' + (grp.depth === 1 ? '' : 's'),
          pad, y + rowH + 6);
      });
      // the questions already asked, as a ladder of costs
      var by = h - 34;
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'left';
      g.fillText('questions asked: ' + asked.length + '   cost so far ' +
        cost().toFixed(2), pad, by);
      var bw2 = w - pad * 2;
      roundRect(g, pad, by + 6, bw2, 10, 5); g.fillStyle = C.panel; g.fill();
      roundRect(g, pad, by + 6, clamp(bw2 * (cost() / 3), 0, bw2), 10, 5);
      g.fillStyle = done() ? C.good : C.accent; g.fill();
      g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
      g.fillText('0                        average questions                        3',
        w / 2, by + 27);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * best_first_question — how each question cuts the bar of probability
   * ====================================================================== */
  reg('splitPicker', function (host, api) {
    var sus = suspects();
    var qs = DATA.questions || [];
    var out = K.readout(host, 'Tap a question to see how it splits the chances.');
    var stage = K.Stage(host, 0.48);
    var sel = null;

    function inside(qid) {
      for (var i = 0; i < qs.length; i++) if (qs[i].id === qid) return qs[i].asks;
      return [];
    }
    function share(qid) {
      var ins = inside(qid), tot = 0;
      sus.forEach(function (s) { if (ins.indexOf(s.id) >= 0) tot += s.p; });
      return tot;
    }
    function pick(id) {
      sel = id;
      var yes = Math.round(share(id) * 1000) / 10;
      out.innerHTML = 'A yes has chance ' + big(yes + '%') +
        ', a no has ' + big((100 - yes).toFixed(1) + '%') +
        '<br><span style="color:#8b949e">a question you can guess the answer to '
        + 'tells you less</span>';
      api.onSelect(id);
      api.onInteract('question');
    }
    var chips = K.regionChips(host, api.regions || [], function (id) {
      if (chips && chips.select) chips.select(id);
      pick(id);
    });

    stage.draw = function (g, w, h) {
      var pad = 16, top = 16, barH = 44;
      var ins = sel ? inside(sel) : [];
      var x = pad, bw = w - pad * 2;
      // the four suspects, sorted so a yes group sits together on the left
      var ordered = sus.slice().sort(function (a, b) {
        var ai = ins.indexOf(a.id) >= 0 ? 0 : 1, bi = ins.indexOf(b.id) >= 0 ? 0 : 1;
        return ai - bi;
      });
      ordered.forEach(function (s) {
        var seg = bw * s.p, isYes = ins.indexOf(s.id) >= 0;
        roundRect(g, x + 1, top, Math.max(6, seg - 2), barH, 5);
        g.fillStyle = sel ? (isYes ? C.good : 'rgba(139,148,158,0.30)')
          : SERIES[sus.indexOf(s) % SERIES.length];
        g.fill();
        g.fillStyle = sel && !isYes ? C.fg : '#0d1117';
        g.font = f(13, 700); g.textAlign = 'center';
        if (seg > 20) g.fillText(s.name, x + seg / 2, top + barH / 2 + 1);
        g.font = f(9, 600);
        if (seg > 40) g.fillText((s.p * 100).toFixed(0) + '%', x + seg / 2, top + barH - 8);
        x += seg;
      });
      if (sel) {
        var cut = pad + bw * share(sel);
        g.strokeStyle = C.fg; g.lineWidth = 2;
        g.beginPath(); g.moveTo(cut, top - 8); g.lineTo(cut, top + barH + 8); g.stroke();
        var yesPct = Math.round(share(sel) * 100);
        g.fillStyle = C.good; g.font = f(10.5, 700); g.textAlign = 'center';
        g.fillText('YES ' + yesPct + '%',
          clamp(pad + (cut - pad) / 2, pad + 26, w - pad - 26), top + barH + 24);
        g.fillStyle = C.muted;
        g.fillText('NO ' + (100 - yesPct) + '%',
          clamp(cut + (w - pad - cut) / 2, pad + 26, w - pad - 26), top + barH + 24);
        // how far the cut sits from the middle
        var off = Math.abs(share(sel) - 0.5);
        g.fillStyle = off < 0.001 ? C.good : C.gold; g.font = f(11, 700);
        g.fillText(off < 0.001 ? 'dead in the middle — nothing to guess'
          : Math.round(off * 100) + ' points off the middle', w / 2, top + barH + 48);
      } else {
        g.fillStyle = C.muted; g.font = f(10.5, 600); g.textAlign = 'center';
        g.fillText('the bar is the whole of the chance, split by suspect', w / 2, h - 6);
      }
      g.strokeStyle = 'rgba(139,148,158,0.45)'; g.setLineDash([3, 3]); g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad + bw / 2, top - 6); g.lineTo(pad + bw / 2, top + barH + 8);
      g.stroke(); g.setLineDash([]);
      g.fillStyle = C.muted; g.font = f(8.5, 600); g.textAlign = 'center';
      g.fillText('half way', pad + bw / 2, top - 9);
    };
    return {
      destroy: stage.destroy,
      select: function (id) { if (chips && chips.select) chips.select(id); sel = id; pick(id); }
    };
  });

  /* ======================================================================
   * no_free_lunch — the shorter shelf runs out of room
   * ====================================================================== */
  reg('pigeonBoxes', function (host, api) {
    var n = 6;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.6);

    function render() {
      var files = Math.pow(2, n), room = files - 1;
      out.innerHTML = big(commas(files)) + ' files of ' + n + ' bits, and only ' +
        big(commas(room)) + ' shorter files to map them onto' +
        '<br><span style="color:#8b949e">one short of what you need, at every ' +
        'size there is</span>';
    }
    K.slider(ctr, { min: 2, max: 12, step: 1, value: n, label: 'file size in bits' },
      function (v) { n = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h, t) {
      var pad = 16, files = Math.pow(2, n);
      var cols = Math.min(32, Math.ceil(Math.sqrt(files * 2)));
      var rows = Math.ceil(files / cols);
      var cell = Math.min((w - pad * 2) / cols, (h * 0.38) / rows);
      var i, x, y;
      var gx = (w - cols * cell) / 2, gy = 14;
      for (i = 0; i < files; i++) {
        x = gx + (i % cols) * cell; y = gy + Math.floor(i / cols) * cell;
        g.fillStyle = 'rgba(88,166,255,0.75)';
        g.fillRect(x + 0.5, y + 0.5, Math.max(1, cell - 1.5), Math.max(1, cell - 1.5));
      }
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText(commas(files) + ' files of exactly ' + n + ' bits',
        w / 2, gy + rows * cell + 12);
      // the shelf of shorter files, one short
      var sy = gy + rows * cell + 22;
      var room = files - 1;
      var srows = Math.ceil(room / cols);
      var pulse = 0.5 + 0.5 * Math.sin(t * 3);
      for (i = 0; i < room; i++) {
        x = gx + (i % cols) * cell; y = sy + Math.floor(i / cols) * cell;
        g.fillStyle = 'rgba(210,153,34,0.7)';
        g.fillRect(x + 0.5, y + 0.5, Math.max(1, cell - 1.5), Math.max(1, cell - 1.5));
      }
      x = gx + (room % cols) * cell; y = sy + Math.floor(room / cols) * cell;
      g.strokeStyle = 'rgba(248,81,73,' + (0.45 + 0.5 * pulse).toFixed(2) + ')';
      g.lineWidth = 1.6;
      g.strokeRect(x + 0.5, y + 0.5, Math.max(2, cell - 1.5), Math.max(2, cell - 1.5));
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText(commas(room) + ' files shorter than ' + n + ' bits — one too few',
        w / 2, sy + srows * cell + 12);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * hamming_find — three rings, seven lamps, one flipped
   * ====================================================================== */
  reg('hammingRings', function (host, api) {
    var ham = DATA.hamming || { rings: [], lit: [] };
    var rings = ham.rings || [];
    var lit = {}; (ham.lit || []).forEach(function (l) { lit[l] = 1; });
    var out = K.readout(host, '');
    var stage = K.Stage(host, 0.95);
    var sel = null;

    function inRing(r, lamp) { return r.lamps.indexOf(lamp) >= 0; }
    function odd(r) {
      var c = 0;
      r.lamps.forEach(function (l) { if (lit[l]) c++; });
      return c % 2 === 1;
    }
    function render() {
      var bad = rings.filter(odd).map(function (r) { return r.name; });
      out.innerHTML = bad.length
        ? big(bad.length) + ' ring' + (bad.length === 1 ? '' : 's') +
          ' hold an odd number of lit lamps: ' + big(bad.join(' and ')) +
          (sel ? '<br>you have picked lamp ' + big(sel.replace('lamp', '')) : '')
        : 'every ring is even';
    }
    var chips = K.regionChips(host, api.regions || [], function (id) {
      sel = id; api.onSelect(id); api.onInteract('region'); render();
    });
    render();

    /* the classic three-circle picture: lamp positions in circle coordinates */
    var POS = {
      1: [-0.34, -0.20], 2: [0.34, -0.20], 3: [0.00, 0.42],
      4: [0.00, -0.30], 5: [-0.22, 0.16], 6: [0.22, 0.16], 7: [0.00, 0.02]
    };
    function lampXY(lamp, cx, cy, R) {
      var p = POS[lamp] || [0, 0];
      return [cx + p[0] * R * 2, cy + p[1] * R * 2];
    }
    function onTap(ev) {
      var p = stage.pointer(ev), w = stage.w, h = stage.h - 6;
      var R = Math.min(w, h) * 0.27, cx = w / 2, cy = h * 0.44;
      for (var lamp = 1; lamp <= 7; lamp++) {
        var xy = lampXY(lamp, cx, cy, R);
        var dx = p.x - xy[0], dy = p.y - xy[1];
        if (dx * dx + dy * dy < 22 * 22) {
          sel = 'lamp' + lamp;
          if (chips && chips.select) chips.select(sel);
          api.onSelect(sel); api.onInteract('lamp'); render();
          break;
        }
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });

    stage.draw = function (g, w, h) {
      var R = Math.min(w, h) * 0.27, cx = w / 2, cy = h * 0.44;
      var centres = [[cx - R * 0.52, cy - R * 0.32], [cx + R * 0.52, cy - R * 0.32],
                     [cx, cy + R * 0.56]];
      rings.forEach(function (r, i) {
        var bad = odd(r);
        g.beginPath(); g.arc(centres[i][0], centres[i][1], R, 0, 7);
        g.strokeStyle = bad ? C.bad : C.good; g.lineWidth = bad ? 2.6 : 1.6; g.stroke();
        g.fillStyle = bad ? 'rgba(248,81,73,0.07)' : 'rgba(62,207,142,0.05)'; g.fill();
        var lx = centres[i][0] + (i === 0 ? -R * 0.95 : (i === 1 ? R * 0.95 : 0));
        var ly = centres[i][1] + (i === 2 ? R * 0.86 : -R * 0.92);
        g.fillStyle = bad ? C.bad : C.good; g.font = f(10, 700); g.textAlign = 'center';
        g.fillText(bad ? 'ODD' : 'even', lx, ly);
      });
      for (var lamp = 1; lamp <= 7; lamp++) {
        var xy = lampXY(lamp, cx, cy, R);
        var on = !!lit[lamp], picked = sel === ('lamp' + lamp);
        g.beginPath(); g.arc(xy[0], xy[1], 15, 0, 7);
        g.fillStyle = on ? C.gold : C.panel; g.fill();
        g.strokeStyle = picked ? C.fg : (on ? C.gold : C.dim);
        g.lineWidth = picked ? 3 : 1.4; g.stroke();
        g.fillStyle = on ? '#0d1117' : C.muted; g.font = f(11, 700); g.textAlign = 'center';
        g.fillText(String(lamp), xy[0], xy[1] + 4);
      }
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('gold = lit · a ring marked ODD holds an odd number of lit lamps',
        w / 2, h - 4);
    };
    return {
      destroy: stage.destroy,
      select: function (id) { sel = id; if (chips && chips.select) chips.select(id); render(); }
    };
  });

  /* ======================================================================
   * check_bits — what the checks can say, against what they must say
   * ====================================================================== */
  reg('checkBitCurve', function (host, api) {
    var m = DATA.message || 16;
    var r = 2;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.6);

    function render() {
      var can = Math.pow(2, r), must = m + r + 1;
      out.innerHTML = big(r) + ' check bits can say ' + big(commas(can)) +
        ' different things, and the receiver must be told one of ' + big(commas(must)) +
        '<br><span style="color:' + (can >= must ? C.good : C.bad) + ';font-weight:700">' +
        (can >= must ? 'enough' : 'not enough') + '</span>';
    }
    K.slider(ctr, { min: 1, max: 8, step: 1, value: r, label: 'check bits' },
      function (v) { r = Math.round(v); render(); api.onInteract('slider'); });
    render();

    stage.draw = function (g, w, h) {
      var pad = 18, top = 20, base = h - 34;
      var can = Math.pow(2, r), must = m + r + 1;
      var top$ = Math.max(can, must, 40) * 1.15;
      var bw = (w - pad * 2) / 2.6, gap = bw * 0.3;
      [[can, 'what ' + r + ' checks can say', can >= must ? C.good : C.bad],
       [must, 'what has to be said', C.accent]].forEach(function (b, i) {
        var x = pad + i * (bw + gap);
        var bh = Math.max(2, (base - top) * (b[0] / top$));
        roundRect(g, x, base - bh, bw, bh, 5); g.fillStyle = b[2]; g.fill();
        g.fillStyle = C.fg; g.font = f(13, 700); g.textAlign = 'center';
        g.fillText(commas(b[0]), x + bw / 2, base - bh - 6);
        g.fillStyle = C.muted; g.font = f(9, 600);
        g.fillText(b[1], x + bw / 2, base + 13);
      });
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
      g.fillStyle = C.muted; g.font = f(10, 600); g.textAlign = 'center';
      g.fillText('a ' + m + '-bit message: “all fine”, or which of ' + (m + r) +
        ' bits went wrong', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * detect_vs_fix — one check bit, and what it cannot tell you
   * ====================================================================== */
  reg('parityBit', function (host, api) {
    var n = 8;
    var bits = [1, 0, 1, 1, 0, 0, 1, 0];
    var sent = bits.slice();
    var out = K.readout(host, 'Tap a bit to flip it on the way through.');
    var stage = K.Stage(host, 0.5);
    var flipped = null;

    function parity(arr) { var c = 0, i; for (i = 0; i < arr.length; i++) c += arr[i]; return c % 2; }
    var checkSent = parity(sent);
    function render() {
      var ok = parity(bits) === checkSent;
      out.innerHTML = ok
        ? 'The check agrees. <span style="color:#8b949e">Nothing to report.</span>'
        : big('Something got flipped') +
          ' <span style="color:#8b949e">— and that is the whole of the report. ' +
          'The check has no way to say which one.</span>';
    }
    function onTap(ev) {
      var p = stage.pointer(ev), w = stage.w;
      var pad = 14, cw = (w - pad * 2) / (n + 1);
      var i = Math.floor((p.x - pad) / cw);
      if (i >= 0 && i < n) {
        bits[i] = 1 - bits[i];
        flipped = bits[i] !== sent[i] ? i : null;
        render(); api.onInteract('flip');
      }
      ev.preventDefault();
    }
    stage.canvas.addEventListener('mousedown', onTap);
    stage.canvas.addEventListener('touchstart', onTap, { passive: false });
    render();

    stage.draw = function (g, w, h) {
      var pad = 14, cw = (w - pad * 2) / (n + 1), top = 22, bh = Math.min(40, h - 62);
      for (var i = 0; i < n; i++) {
        var x = pad + i * cw;
        roundRect(g, x + 2, top, cw - 5, bh, 5);
        g.fillStyle = bits[i] ? 'rgba(88,166,255,0.85)' : C.panel; g.fill();
        g.strokeStyle = C.dim; g.lineWidth = 1; g.stroke();
        g.fillStyle = bits[i] ? '#0d1117' : C.muted; g.font = f(14, 700); g.textAlign = 'center';
        g.fillText(String(bits[i]), x + cw / 2, top + bh / 2 + 5);
      }
      var cx = pad + n * cw;
      roundRect(g, cx + 2, top, cw - 5, bh, 5);
      g.fillStyle = checkSent ? 'rgba(210,153,34,0.85)' : 'rgba(210,153,34,0.25)'; g.fill();
      g.strokeStyle = C.gold; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = checkSent ? '#0d1117' : C.gold; g.font = f(14, 700); g.textAlign = 'center';
      g.fillText(String(checkSent), cx + cw / 2, top + bh / 2 + 5);
      g.fillStyle = C.muted; g.font = f(9, 600);
      g.fillText('check', cx + cw / 2, top - 6);
      g.fillText('the message', pad + (n * cw) / 2, top - 6);
      var ok = parity(bits) === checkSent;
      g.fillStyle = ok ? C.good : C.bad; g.font = f(12, 700);
      g.fillText(ok ? 'check passes' : 'check FAILS — but it cannot point',
        w / 2, top + bh + 22);
      g.fillStyle = C.muted; g.font = f(9.5, 600);
      g.fillText('tap any bit to flip it', w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * repeat_three — send it three times and take the majority
   * ====================================================================== */
  reg('majorityVote', function (host, api) {
    var noise = DATA.wireNoise != null ? DATA.wireNoise : 0.1;
    var copies = DATA.copies || 3;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.58);
    var sent = 0, rawBad = 0, votedBad = 0, pending = 0, lastRow = [];

    function render() {
      out.innerHTML = sent
        ? big(commas(sent)) + ' bits sent, ' + copies + ' copies each<br>' +
          '<span style="color:' + C.bad + ';font-weight:700">raw wire ' +
          ((rawBad / (sent * copies)) * 100).toFixed(1) + '% wrong</span> &nbsp;·&nbsp; ' +
          '<span style="color:' + C.good + ';font-weight:700">after the vote ' +
          ((votedBad / sent) * 100).toFixed(1) + '% wrong</span>'
        : 'Push some bits down the wire.';
    }
    K.slider(ctr, { min: 1, max: 9, step: 2, value: copies, label: 'copies of each bit' },
      function (v) {
        copies = Math.round(v); sent = 0; rawBad = 0; votedBad = 0; pending = 0;
        render(); api.onInteract('slider');
      });
    K.button(ctr, 'Send 4,000 bits', function () { pending += 4000; api.onInteract('run'); })
      .classList.add('primary');
    render();

    stage.draw = function (g, w, h) {
      if (pending > 0) {
        var take = Math.min(pending, 400), i, j;
        for (i = 0; i < take; i++) {
          var wrong = 0, row = [];
          for (j = 0; j < copies; j++) {
            var bad = Math.random() < noise;
            if (bad) { wrong++; rawBad++; }
            row.push(bad ? 1 : 0);
          }
          sent++;
          if (wrong * 2 > copies) votedBad++;
          if (i === take - 1) lastRow = row;
        }
        pending -= take; render();
      }
      var pad = 18, top = 16;
      // the last packet of copies
      var cw = Math.min(26, (w - pad * 2) / Math.max(1, lastRow.length));
      var startX = (w - lastRow.length * cw) / 2;
      lastRow.forEach(function (bad, i) {
        roundRect(g, startX + i * cw + 2, top, cw - 4, 26, 4);
        g.fillStyle = bad ? C.bad : 'rgba(88,166,255,0.75)'; g.fill();
      });
      if (lastRow.length) {
        g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'center';
        g.fillText('the last bit’s ' + lastRow.length + ' copies (red = flipped)',
          w / 2, top + 40);
      }
      // two bars: before and after
      var base = h - 32, btop = top + 54;
      var vals = [[sent ? rawBad / (sent * copies) : 0, 'straight off the wire', C.bad],
                  [sent ? votedBad / sent : 0, 'after the vote', C.good]];
      var bw = (w - pad * 2) / 2.6, gap = bw * 0.3;
      vals.forEach(function (v, i) {
        var x = pad + i * (bw + gap);
        var bh = Math.max(2, (base - btop) * (v[0] / 0.14));
        roundRect(g, x, base - bh, bw, bh, 5); g.fillStyle = v[2]; g.fill();
        g.fillStyle = C.fg; g.font = f(12, 700); g.textAlign = 'center';
        if (sent) g.fillText((v[0] * 100).toFixed(1) + '%', x + bw / 2, base - bh - 6);
        g.fillStyle = C.muted; g.font = f(9, 600);
        g.fillText(v[1], x + bw / 2, base + 13);
      });
      g.strokeStyle = C.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(pad, base + 0.5); g.lineTo(w - pad, base + 0.5); g.stroke();
    };
    return { destroy: stage.destroy };
  });

  /* ======================================================================
   * squash_the_record — a real Huffman coder on blocks of biased flips
   * ====================================================================== */
  reg('squashStream', function (host, api) {
    var coin = DATA.bentCoin || { heads: 0.9, flips: 1000 };
    var block = 1;
    var ctr = K.controls(host), out = K.readout(host, ''), stage = K.Stage(host, 0.58);
    var stream = [];
    for (var i = 0; i < 220; i++) stream.push(Math.random() < coin.heads ? 0 : 1);

    /* Huffman code lengths for every pattern of `b` flips, built for real —
     * cached, because eight flips a block is 256 symbols and this is read on
     * every frame. */
    var costCache = {};
    function lengths(b) {
      if (costCache[b] != null) return costCache[b];
      var weights = [], k, ones;
      for (k = 0; k < Math.pow(2, b); k++) {
        ones = 0;
        for (var j = 0; j < b; j++) if (k >> j & 1) ones++;
        weights.push(Math.pow(1 - coin.heads, ones) * Math.pow(coin.heads, b - ones));
      }
      var nodes = weights.map(function (wt, idx) { return { w: wt, leaves: [idx] }; });
      var depth = weights.map(function () { return 0; });
      while (nodes.length > 1) {
        nodes.sort(function (a, b2) { return a.w - b2.w; });
        var a = nodes.shift(), b3 = nodes.shift();
        a.leaves.concat(b3.leaves).forEach(function (idx) { depth[idx]++; });
        nodes.push({ w: a.w + b3.w, leaves: a.leaves.concat(b3.leaves) });
      }
      var per = 0;
      for (k = 0; k < weights.length; k++) per += weights[k] * depth[k];
      costCache[b] = per / b;
      return costCache[b];
    }
    function render() {
      var per = lengths(block);
      out.innerHTML = 'Blocks of ' + big(block) + ' flips &nbsp;·&nbsp; ' +
        big(per.toFixed(3)) + ' bits a flip<br>' +
        big(Math.round(per * coin.flips) + ' bits') + ' for the whole run of ' +
        commas(coin.flips) + ' flips';
    }
    K.slider(ctr, { min: 1, max: 8, step: 1, value: block, label: 'flips per block' },
      function (v) { block = Math.round(v); render(); api.onInteract('slider'); });
    K.button(ctr, 'New flips', function () {
      stream = [];
      for (var k = 0; k < 220; k++) stream.push(Math.random() < coin.heads ? 0 : 1);
      api.onInteract('reflip');
    }).classList.add('small');
    render();

    stage.draw = function (g, w, h) {
      var pad = 14, top = 14, cols = 44;
      var cw = (w - pad * 2) / cols, rows = Math.ceil(stream.length / cols);
      var ch = Math.min(cw, 8);
      for (var i = 0; i < stream.length; i++) {
        var x = pad + (i % cols) * cw, y = top + Math.floor(i / cols) * (ch + 2);
        var blockIdx = Math.floor(i / block);
        g.fillStyle = stream[i]
          ? C.bad
          : (blockIdx % 2 ? 'rgba(88,166,255,0.75)' : 'rgba(88,166,255,0.4)');
        g.fillRect(x, y, Math.max(1, cw - 1), ch);
      }
      var by = top + rows * (ch + 2) + 12;
      g.fillStyle = C.muted; g.font = f(9, 600); g.textAlign = 'left';
      g.fillText('red = the rare tail · shading = the blocks the coder sees', pad, by);
      // bits used, against sending it raw
      var base = h - 26, btop = by + 12, bw = w - pad * 2;
      var per = lengths(block), raw = 1;
      [[raw, 'one bit a flip', 'rgba(139,148,158,0.4)'],
       [per, per.toFixed(3) + ' bits a flip', C.good]].forEach(function (b, i) {
        var y = btop + i * 22;
        roundRect(g, pad, y, Math.max(3, bw * b[0]), 16, 4);
        g.fillStyle = b[2]; g.fill();
        g.fillStyle = C.fg; g.font = f(10, 700); g.textAlign = 'left';
        g.fillText(b[1], pad + 8, y + 12);
      });
      g.fillStyle = C.muted; g.font = f(9.5, 600); g.textAlign = 'center';
      g.fillText('longer blocks squeeze harder — but never past the coin itself',
        w / 2, h - 4);
    };
    return { destroy: stage.destroy };
  });

})(window);
