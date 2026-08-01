"""Checkers for the two premium sets: the Two Sigma set and Brainteaser classics.

Every answer here is re-derived from scratch — exactly wherever an exact
derivation exists (enumeration, Fractions, dynamic programming, backward
induction, exhaustive search over strategies) and by Monte Carlo only as a
cross-check, or as the derivation itself where the question is genuinely about
what a random process does. Shared datasets arrive in `data["premium_ts"]`.
"""

import bisect
import itertools
import math
import random
from fractions import Fraction

from checks._helpers import (
    first_number,
    mc_mean,
    mc_rate,
    nearest_choice,
    only_choice,
    strict_max,
)

EMDASH = "—"


def _mine(data):
    d = (data or {}).get("premium_ts")
    assert isinstance(d, dict), "vizData['premium_ts'] is missing"
    return d


def _corr(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / float(n), sum(ys) / float(n)
    sxy = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
    sx = math.sqrt(sum((a - mx) ** 2 for a in xs))
    sy = math.sqrt(sum((b - my) ** 2 for b in ys))
    assert sx > 0 and sy > 0
    return sxy / (sx * sy)


def _log_comb(n, k):
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def _tail_ge(n, k, p):
    """P(X >= k) for Binomial(n, p), in logs so 10,000 flips is fine."""
    if k <= 0:
        return 1.0
    total = 0.0
    for i in range(k, n + 1):
        total += math.exp(_log_comb(n, i) + i * math.log(p) + (n - i) * math.log1p(-p))
    return total


def _upper_tails(n, p):
    """[P(X >= k) for k = 0..n], built from the mode outwards so that even
    twenty thousand flips stays stable and quick."""
    mode = int(n * p)
    pmf = [0.0] * (n + 1)
    pmf[mode] = math.exp(_log_comb(n, mode) + mode * math.log(p)
                         + (n - mode) * math.log1p(-p))
    for k in range(mode, 0, -1):                      # downwards
        pmf[k - 1] = pmf[k] * k * (1 - p) / ((n - k + 1) * p)
    for k in range(mode, n):                          # upwards
        pmf[k + 1] = pmf[k] * (n - k) * p / ((k + 1) * (1 - p))
    tails = [0.0] * (n + 2)
    for k in range(n, -1, -1):
        tails[k] = tails[k + 1] + pmf[k]
    return tails[: n + 1]


# ===========================================================================
# the Two Sigma set
# ===========================================================================

def check_ts_perfect_fit(q, data):
    """A lookup table on a meaningless code fits any past and says nothing
    about tomorrow. Rejection-sample the pasts it CAN fit perfectly, then
    score it on the next day."""
    codes, days, runs = 256, 20, 12000
    fitted, hits, tomorrow_seen = 0, 0, 0
    tries = 0
    while fitted < runs and tries < runs * 6:
        tries += 1
        table, ok = {}, True
        for _ in range(days):
            c = random.randrange(codes)
            up = random.random() < 0.5
            if c in table and table[c] != up:
                ok = False
                break
            table[c] = up
        if not ok:
            continue
        fitted += 1
        # in-sample the rule is perfect by construction; check that, then play on
        assert all(table[c] == v for c, v in table.items())
        c = random.randrange(codes)
        up = random.random() < 0.5
        if c in table:
            tomorrow_seen += 1
            pred = table[c]
        else:
            pred = random.random() < 0.5
        hits += 1 if pred == up else 0
    assert fitted >= runs * 0.9, fitted
    rate = hits / float(fitted)
    assert 0.47 <= rate <= 0.53, rate
    seen = tomorrow_seen / float(fitted)
    assert seen < 0.12, seen        # tomorrow's code is nearly always brand new
    return {
        "bool": False,
        "value": "false",
        "notes": "%d pasts the table fits perfectly; on the next day it is right "
                 "%.3f of the time (tomorrow's code had been seen before only %.3f "
                 "of the time), so a perfect fit on 20 days is worth nothing"
                 % (fitted, rate, seen),
    }


def check_ts_leakage(q, data):
    """The leaking column is the one that splits the customers perfectly."""
    rows = _mine(data)["leakTable"]
    assert len(rows) == 16 and all(len(r) == 5 for r in rows)
    assert sum(r[4] for r in rows) == 6, "six cancellations"
    cols = {"months": 0, "calls": 1, "refund": 2, "plan": 3}
    assert set(cols) == set(r["id"] for r in q["regions"]), q["regions"]

    def best_split(ci):
        """Best accuracy any single threshold on this column can reach."""
        best = 0
        for t in sorted(set(r[ci] for r in rows)):
            for sign in (1, -1):
                acc = sum(1 for r in rows
                          if ((r[ci] >= t) if sign == 1 else (r[ci] < t)) == bool(r[4]))
                best = max(best, acc)
        return best

    scores = dict((name, best_split(ci)) for name, ci in cols.items())
    leak = strict_max(scores)
    assert scores[leak] == 16, scores
    assert max(v for k, v in scores.items() if k != leak) <= 11, scores
    # and it is a leak because it only exists after the event it predicts
    assert all((r[2] > 0) == bool(r[4]) for r in rows), "refund day tracks churn"
    return {
        "region": leak,
        "value": leak,
        "notes": "best single-threshold accuracy out of 16 customers: %s -> only %r "
                 "separates them perfectly, and its value is non-zero exactly for "
                 "the customers who cancelled" % (scores, leak),
    }


def check_ts_accuracy_trap(q, data):
    """The do-nothing model is right on every honest payment and nothing else."""
    fraud = Fraction(1, 500)
    right = 1 - fraud
    pct = float(right) * 100
    assert pct == 99.8, pct
    # simulate the same lazy model: it says 'not fraud', so it is right exactly
    # when the payment is honest, and it never catches one
    caught, correct, runs = 0, 0, 20000
    for _ in range(runs):
        is_fraud = random.randrange(500) == 0
        said_fraud = False
        correct += 1 if said_fraud == is_fraud else 0
        caught += 1 if (said_fraud and is_fraud) else 0
    seen = correct / float(runs)
    assert caught == 0, caught
    assert abs(seen - float(right)) < 0.01, seen
    return {
        "number": pct,
        "value": "99.8",
        "notes": "499 of every 500 payments are honest and the lazy model calls "
                 "every one of them right: %s = %.1f%% accurate with %d frauds "
                 "caught (%d simulated payments gave %.4f)"
                 % (right, pct, caught, runs, seen),
    }


def check_ts_threshold_dial(q, data):
    """How many alerts it takes to catch nine of the twelve frauds."""
    rows = _mine(data)["alerts"]
    assert len(rows) == 200, len(rows)
    frauds = sorted((r[0] for r in rows if r[1] == 1), reverse=True)
    assert len(frauds) == 12, len(frauds)
    assert len(set(r[0] for r in rows)) == 200, "scores must not tie"

    def alerts_to_catch(k):
        thr = frauds[k - 1]
        flagged = [r for r in rows if r[0] >= thr]
        assert sum(1 for r in flagged if r[1] == 1) == k
        return len(flagged)

    n9 = alerts_to_catch(9)
    n8, n10, n12 = alerts_to_catch(8), alerts_to_catch(10), alerts_to_catch(12)
    assert n8 < n9 < n10, (n8, n9, n10)
    assert n9 == 40, n9
    assert n9 - 9 == 31, n9
    assert n12 == 122, n12
    return {
        "number": float(n9),
        "value": "40",
        "notes": "alerts needed: 8 frauds -> %d, 9 -> %d (31 of them false), "
                 "10 -> %d, all 12 -> %d of the 200 payments" % (n8, n9, n10, n12),
    }


def check_ts_rolling_windows(q, data):
    """Which record is harder for luck to fake, over the same twelve windows."""
    w = _mine(data)["windows"]
    steady, lumpy = w["steady"], w["lumpy"]
    assert len(steady) == 12 and len(lumpy) == 12
    up_s = sum(1 for x in steady if x > 0)
    up_l = sum(1 for x in lumpy if x > 0)
    tot_s, tot_l = sum(steady), sum(lumpy)
    assert up_s == 11 and up_l == 2, (up_s, up_l)
    assert tot_l > 2 * tot_s - 0.1, (tot_s, tot_l)   # the lumpy one made twice as much

    def tail(kmin):
        return sum(Fraction(math.comb(12, k), 2 ** 12) for k in range(kmin, 13))

    p_steady, p_lumpy = tail(up_s), tail(up_l)
    assert p_steady == Fraction(13, 4096), p_steady
    assert p_lumpy == Fraction(4083, 4096), p_lumpy
    assert p_steady < p_lumpy
    winner = only_choice(q, "eleven of the twelve")
    return {
        "choice": winner,
        "value": "the steady one " + EMDASH + " 11 of 12",
        "notes": "totals %.1f vs %.1f; under coin flips P(up in >=11 of 12) = %s "
                 "= %.4f, P(up in >=2 of 12) = %s = %.4f, so only the steady "
                 "record is hard for luck to produce"
                 % (tot_s, tot_l, p_steady, float(p_steady), p_lumpy, float(p_lumpy)),
    }


def check_ts_regression_mean(q, data):
    """Bottom ten of a hundred, all pure luck: how many improve next time.

    Exact: the k-th smallest of 100 uniforms sits at k/101 on average, so it is
    beaten by a fresh draw with probability 1 - k/101."""
    exact = sum(1 - Fraction(k, 101) for k in range(1, 11))
    assert exact == Fraction(10 * 101 - 55, 101)
    val = float(exact)
    assert 9.4 < val < 9.5, val

    def trial():
        a = [random.random() for _ in range(100)]
        worst = sorted(range(100), key=lambda i: a[i])[:10]
        b = [random.random() for _ in range(100)]
        return sum(1 for i in worst if b[i] > a[i])

    mc = mc_mean(trial, 1500)
    assert abs(mc - val) < 0.35, (mc, val)
    bands = {"About five": (4.0, 6.0), "About seven": (6.0, 8.0),
             "About nine or ten": (8.5, 10.0), "All ten": (10.0, 10.0)}
    fits = [c for c in q["choices"]
            for k, (lo, hi) in bands.items() if c.startswith(k) and lo <= val <= hi]
    assert len(fits) == 1, fits
    got = fits[0]
    return {
        "choice": got,
        "value": "about 9 or 10",
        "notes": "expected improvers = sum over the ten worst of (1 - k/101) = %s "
                 "= %.4f of 10 (1,500 simulated pairs of months gave %.3f)"
                 % (exact, val, mc),
    }


def check_ts_simpson(q, data):
    """The link between adverts and sales, whole and split."""
    shops = _mine(data)["shops"]
    assert len(shops) == 12
    overall = _corr([s[0] for s in shops], [s[1] for s in shops])
    groups = {}
    for g in (0, 1):
        sub = [s for s in shops if s[2] == g]
        assert len(sub) == 6
        groups[g] = _corr([s[0] for s in sub], [s[1] for s in sub])
    assert overall < -0.5, overall
    assert groups[0] > 0.9 and groups[1] > 0.9, groups
    got = only_choice(q, "more adverts means more sales")
    return {
        "choice": got,
        "value": "it flips " + EMDASH + " positive inside each group",
        "notes": "correlation of advert spend with sales: all twelve shops %.3f, "
                 "station shops %.3f, quiet-road shops %.3f"
                 % (overall, groups[0], groups[1]),
    }


def check_ts_time_split(q, data):
    """A random split hands the model both neighbours of every test day."""
    days, trials = 300, 40
    rand_err, time_err = 0.0, 0.0

    def predict(y, train, t):
        i = bisect.bisect_left(train, t)
        lo = train[i - 1] if i > 0 else None
        hi = train[i] if i < len(train) else None
        if lo is None:
            return y[hi]
        if hi is None:
            return y[lo]
        return (y[lo] + y[hi]) / 2.0

    for _ in range(trials):
        y = [0.0]
        for _ in range(days - 1):
            y.append(y[-1] + random.gauss(0, 1))
        idx = list(range(days))
        random.shuffle(idx)
        test = set(idx[: days // 5])
        train = sorted(set(range(days)) - test)
        rand_err += sum(abs(predict(y, train, t) - y[t]) for t in sorted(test)) / len(test)
        cut = days - days // 5
        train2, test2 = list(range(cut)), list(range(cut, days))
        time_err += sum(abs(predict(y, train2, t) - y[t]) for t in test2) / len(test2)
    rand_err /= trials
    time_err /= trials
    assert time_err > 3 * rand_err, (rand_err, time_err)
    got = only_choice(q, "between two training days")
    return {
        "choice": got,
        "value": "the neighbouring days give it away",
        "notes": "same model, same data: average error %.3f on a shuffled split vs "
                 "%.3f when the last fifth is held back (%.1f times worse), over "
                 "%d simulated series" % (rand_err, time_err, time_err / rand_err, trials),
    }


def check_ts_sample_size(q, data):
    """Smallest offered number of flips that reliably exposes a 51% coin.

    'Reliably' = a two-sided 5% test spots it at least 80% of the time. Exact
    binomial, no normal approximation."""
    offered = [400, 2000, 20000, 1000000]
    assert [first_number(c) for c in q["choices"][:3]] == [400.0, 2000.0, 20000.0]
    assert "million" in q["choices"][3]
    power = {}
    for n in offered[:3]:
        fair = _upper_tails(n, 0.5)
        crit = min(k for k in range(n // 2, n + 1) if fair[k] <= 0.025)
        power[n] = _upper_tails(n, 0.51)[crit]
    # a million flips is far past the point of doubt; the normal shape is plenty
    z = (0.01 * math.sqrt(1000000)) / 0.5 - 1.96
    power[1000000] = 0.5 * (1 + math.erf(z / math.sqrt(2)))
    assert power[1000000] > 0.999, power
    good = [n for n in offered if power[n] >= 0.8]
    assert good and min(good) == 20000, power
    assert power[400] < 0.1 and power[2000] < 0.2, power
    assert 0.79 < power[20000] < 0.85, power
    got = only_choice(q, "20,000")
    return {
        "choice": got,
        "value": "about 20,000",
        "notes": "chance a two-sided 5%% test spots a 51%% coin: 400 flips %.3f, "
                 "2,000 flips %.3f, 20,000 flips %.3f — 20,000 is the smallest "
                 "offered number that gets past 80%%"
                 % (power[400], power[2000], power[20000]),
    }


def check_ts_dimensions(q, data):
    """Nearest neighbour as a share of the farthest, in 2 columns and in 100."""
    def near_over_far(d, n=250, reps=4):
        total = 0.0
        for _ in range(reps):
            pts = [[random.random() for _ in range(d)] for _ in range(n)]
            here = pts[0]
            ds = [math.sqrt(sum((here[k] - p[k]) ** 2 for k in range(d))) for p in pts[1:]]
            total += min(ds) / max(ds)
        return total / reps

    flat, deep = near_over_far(2), near_over_far(100)
    assert flat < 0.15, flat
    assert deep > 0.6, deep
    assert deep > 4 * flat
    return {
        "bool": True,
        "value": "true",
        "notes": "nearest neighbour as a share of the farthest point: %.3f with 2 "
                 "columns, %.3f with 100 — with a hundred columns everybody is "
                 "nearly the same distance from everybody" % (flat, deep),
    }


def check_ts_walk_correlation(q, data):
    """How often two unconnected random walks look strongly linked."""
    steps, trials = 250, 1500
    hits = 0
    for _ in range(trials):
        x = y = 0.0
        sx = sy = sxx = syy = sxy = 0.0
        for _ in range(steps + 1):
            sx += x
            sy += y
            sxx += x * x
            syy += y * y
            sxy += x * y
            x += random.gauss(0, 1)
            y += random.gauss(0, 1)
        n = steps + 1
        cov = sxy - sx * sy / n
        vx = sxx - sx * sx / n
        vy = syy - sy * sy / n
        if vx > 0 and vy > 0 and abs(cov / math.sqrt(vx * vy)) > 0.5:
            hits += 1
    rate = hits / float(trials)
    assert 0.33 <= rate <= 0.47, rate
    got = only_choice(q, "four years in ten")
    return {
        "choice": got,
        "value": "about 4 years in 10",
        "notes": "%d of %d pairs of completely unconnected random walks came out "
                 "with |correlation| past 0.5 — %.3f, i.e. about four years in ten"
                 % (hits, trials, rate),
    }


def check_ts_evidence_order(q, data):
    """Order four coin results by how easily luck alone produces them."""
    studies = _mine(data)["studies"]
    assert [tuple(s) for s in studies] == [(8, 10), (60, 100), (550, 1000), (5200, 10000)]

    def two_sided(k, n):
        return min(1.0, 2 * _tail_ge(n, k, 0.5))

    def label(k, n):
        return "%s heads in %s flips" % ("{:,}".format(k), "{:,}".format(n))

    pvals = dict((label(k, n), two_sided(k, n)) for k, n in studies)
    assert set(pvals) == set(q["items"]), (sorted(pvals), q["items"])
    order = sorted(pvals, key=lambda s: -pvals[s])
    vals = [pvals[s] for s in order]
    for a, b in zip(vals, vals[1:]):
        assert a > b * 1.5, vals            # a strict, unambiguous ordering
    assert abs(pvals[label(8, 10)] - 0.109) < 0.002, pvals
    assert pvals[label(5200, 10000)] < 1e-4, pvals
    return {
        "order": order,
        "value": "8 in 10, 60 in 100, 550 in 1000, 5200 in 10000",
        "notes": "chance a fair coin does at least this well, either way: " +
                 "; ".join("%s %.5f" % (s, pvals[s]) for s in order),
    }


# ===========================================================================
# Brainteaser classics
# ===========================================================================

def check_bt_lockers(q, data):
    """Walk the corridor for real, then explain the survivors."""
    doors = [False] * 101
    for step in range(1, 101):
        for door in range(step, 101, step):
            doors[door] = not doors[door]
    open_doors = [i for i in range(1, 101) if doors[i]]
    squares = [i * i for i in range(1, 11)]
    assert open_doors == squares, open_doors
    for i in range(1, 101):
        divisors = sum(1 for d in range(1, i + 1) if i % d == 0)
        assert doors[i] == (divisors % 2 == 1)
    return {
        "number": float(len(open_doors)),
        "value": "10",
        "notes": "after all 100 passes the open doors are %s — exactly the squares, "
                 "the only numbers with an odd count of divisors" % open_doors,
    }


def _hats_plan(hats):
    """Run the parity plan down a line. hats[0] is at the back and calls first.
    Returns how many of them survive."""
    called = hats[1:].count(1) % 2          # 'is the count of white hats odd?'
    saved = 1 if called == hats[0] else 0
    heard = called
    for i in range(1, len(hats)):
        ahead = hats[i + 1:].count(1) % 2
        mine = heard ^ ahead
        assert mine == hats[i], "the plan must never fail in front of the caller"
        saved += 1
        heard ^= mine
    return saved


def check_bt_hats_line(q, data):
    """The parity plan, over every short line-up exhaustively and over long ones
    at random, plus the reason the one at the back can never be safe."""
    for n in range(2, 13):
        worst = min(_hats_plan([(bits >> i) & 1 for i in range(n)])
                    for bits in range(2 ** n))
        assert worst == n - 1, (n, worst)
    n = 100
    seen_worst, seen_best = n, 0
    for _ in range(200):
        hats = [random.randrange(2) for _ in range(n)]
        saved = _hats_plan(hats)                       # asserts the 99 in front
        seen_worst = min(seen_worst, saved)
        seen_best = max(seen_best, saved)
    assert seen_worst == n - 1 and seen_best == n, (seen_worst, seen_best)
    # and 100 is impossible: flipping the back hat changes nothing he can see or
    # hear, so whatever he says, one of the two line-ups defeats him.
    for guess in (0, 1):
        assert any(guess != own for own in (0, 1))
    guaranteed = n - 1
    return {
        "number": float(guaranteed),
        "value": "99",
        "notes": "the parity plan never fails in front of the caller: exhaustively "
                 "checked for every line-up up to twelve (worst case always n-1) and "
                 "on 200 random hundreds, where it saved %d or %d. The one at the "
                 "back cannot be covered, so the guarantee is %d"
                 % (seen_worst, seen_best, guaranteed),
    }


def check_bt_wine(q, data):
    """Fewest tasters: each bottle needs its own pattern of sips."""
    bottles = 1000
    n = 0
    while 2 ** n < bottles:
        n += 1
    assert n == 10 and 2 ** 9 < bottles <= 2 ** 10
    patterns = set()
    for b in range(bottles):
        patterns.add(tuple((b >> t) & 1 for t in range(n)))
    assert len(patterns) == bottles, "every bottle gets its own pattern"
    short = set()
    for b in range(bottles):
        short.add(tuple((b >> t) & 1 for t in range(n - 1)))
    assert len(short) < bottles, "nine tasters must give two bottles the same pattern"
    return {
        "number": float(n),
        "value": "10",
        "notes": "%d tasters give %d distinct sip patterns, enough for 1,000 "
                 "bottles; 9 give only %d, so two bottles would be "
                 "indistinguishable" % (n, 2 ** n, 2 ** (n - 1)),
    }


def check_bt_bridge(q, data):
    """Exhaustive search over every crossing schedule."""
    times = (1, 2, 5, 10)
    memo = {}

    def best(left, torch_left):
        key = (left, torch_left)
        if key in memo:
            return memo[key]
        if not left:
            return 0
        if torch_left:
            out = math.inf
            if len(left) == 1:
                out = max(left)
            for pair in itertools.combinations(sorted(left), 2):
                out = min(out, max(pair) + best(frozenset(left - set(pair)), False))
        else:
            right = frozenset(set(times) - set(left))
            out = min(p + best(frozenset(left | {p}), True) for p in right)
        memo[key] = out
        return out

    fastest = best(frozenset(times), True)
    assert fastest == 17, fastest
    shuttle = 2 + 1 + 5 + 1 + 10          # the fastest walker ferries everyone
    assert shuttle == 19
    plan = 2 + 1 + 10 + 2 + 2
    assert plan == fastest
    return {
        "number": float(fastest),
        "value": "17",
        "notes": "search over every schedule gives %d minutes (1+2 across, 1 back, "
                 "5+10 across, 2 back, 1+2 across); the obvious shuttle costs %d"
                 % (fastest, shuttle),
    }


def check_bt_ropes(q, data):
    """Burn the ropes for real and read the four moments off the clock."""
    # rope A lit at both ends (rate 2), rope B lit at one end (rate 1)
    a_left, b_left = 60.0, 60.0
    t = 0.0
    events = [(t, 1, q["items"][0])]                      # 1 = an action
    t_a = a_left / 2.0
    b_left -= t_a * 1.0
    t = t_a
    assert abs(t - 30.0) < 1e-9 and abs(b_left - 30.0) < 1e-9
    events.append((t, 0, q["items"][1]))                  # 0 = a burnout we watch
    events.append((t, 1, q["items"][2]))                  # light B's other end
    t += b_left / 2.0
    assert abs(t - 45.0) < 1e-9, t
    events.append((t, 0, q["items"][3]))
    order = [e[2] for e in sorted(events, key=lambda e: (e[0], e[1]))]
    assert len(set(order)) == 4

    # and 45 really is the odd time out: search every lighting schedule
    def reachable(ropes, now, seen):
        seen.add(round(now, 6))
        opts = []
        for rem, lit in ropes:
            opts.append([lit] if rem <= 1e-9 else list(range(lit, 3)))
        for combo in itertools.product(*opts):
            state = tuple((rem, l) for (rem, _), l in zip(ropes, combo))
            live = [rem / l for rem, l in state if l > 0 and rem > 1e-9]
            if not live:
                continue
            dt = min(live)
            nxt = tuple((max(0.0, rem - l * dt), l if rem - l * dt > 1e-9 else 0)
                        for rem, l in state)
            if nxt == ropes:
                continue
            reachable(nxt, now + dt, seen)
        return seen

    times = sorted(reachable(((60.0, 0), (60.0, 0)), 0.0, set()))
    assert times == [0.0, 30.0, 45.0, 60.0, 90.0, 120.0], times
    odd = [x for x in times if 0 < x < 60 and x != 30]
    assert odd == [45.0], odd
    return {
        "order": order,
        "value": "45 minutes",
        "notes": "burning it: both ends of rope one and one end of rope two, first "
                 "rope gone at 30 with 30 minutes of rope two left, its other end "
                 "lit halves that to 15, total 45. Every schedule of these two ropes "
                 "can only mark %s minutes." % times,
    }


def check_bt_boarding(q, data):
    """Exact recursion, plus 3,000 simulated planes."""
    memo = {2: Fraction(1, 2)}

    def p(k):
        """Chance the last passenger gets their own seat when k seats are left
        and the person boarding is choosing at random among them."""
        if k not in memo:
            memo[k] = Fraction(1, k) + Fraction(k - 2, k) * p(k - 1)
        return memo[k]

    exact = p(100)
    assert exact == Fraction(1, 2), exact
    assert p(10) == Fraction(1, 2) and p(3) == Fraction(1, 2)

    def one_plane(n=100):
        taken = set()
        taken.add(random.randrange(n))
        for seat in range(1, n - 1):
            if seat in taken:
                free = [s for s in range(n) if s not in taken]
                taken.add(random.choice(free))
            else:
                taken.add(seat)
        return (n - 1) not in taken

    rate = mc_rate(one_plane, 3000)
    assert abs(rate - 0.5) < 0.04, rate
    got = only_choice(q, "1 in 2")
    return {
        "choice": got,
        "value": "1 in 2",
        "notes": "exact recursion gives %s for 100 seats (and for 10, and for 3); "
                 "3,000 simulated planes gave %.3f" % (exact, rate),
    }


def check_bt_pirates(q, data):
    """Backward induction from two pirates up to five."""
    def split(n, coins=100):
        if n == 1:
            return [coins]
        below = split(n - 1, coins)
        need = (n + 1) // 2 - 1              # votes to buy besides his own
        alloc = [0] * n
        spent = 0
        for i in sorted(range(n - 1), key=lambda j: (below[j], j))[:need]:
            alloc[i + 1] = below[i] + 1
            spent += below[i] + 1
        alloc[0] = coins - spent
        assert alloc[0] >= 0
        return alloc

    assert split(2) == [100, 0]
    assert split(3) == [99, 0, 1]
    assert split(4) == [99, 0, 1, 0]
    five = split(5)
    assert five == [98, 0, 1, 0, 1], five
    assert sum(five) == 100
    return {
        "number": float(five[0]),
        "value": "98",
        "notes": "backward induction: 2 pirates %s, 3 %s, 4 %s, 5 %s"
                 % (split(2), split(3), split(4), five),
    }


def check_bt_jugs(q, data):
    """Breadth-first search over every state the two jugs can reach."""
    big, small, target = 5, 3, 4
    start = (0, 0)
    seen = {start: 0}
    queue = [start]
    found = None
    while queue:
        state = queue.pop(0)
        depth = seen[state]
        a, b = state
        if a == target or b == target:
            found = (depth, state)
            break
        moves = [(big, b), (a, small), (0, b), (a, 0)]
        pour = min(a, small - b)
        moves.append((a - pour, b + pour))
        pour = min(b, big - a)
        moves.append((a + pour, b - pour))
        for m in moves:
            if m not in seen:
                seen[m] = depth + 1
                queue.append(m)
    assert found is not None
    depth, state = found
    assert depth == 6 and state == (4, 3), found
    assert not any(v < 6 for k, v in seen.items() if target in k)
    return {
        "number": float(depth),
        "value": "6",
        "notes": "breadth-first over all %d reachable states: four litres first "
                 "appears at move %d, in the jugs as %s" % (len(seen), depth, (state,)),
    }


def check_bt_switches(q, data):
    """The observation the procedure produces, hypothesis by hypothesis."""
    ids = [r["id"] for r in q["regions"]]
    assert ids == ["a", "b", "c"], ids
    # first switch on for ten minutes then off; second switch on; then walk in.
    def observe(runs_it):
        lit = (runs_it == "b")                     # b is the one that is on now
        warm = (runs_it in ("a", "b"))             # a burned for ten minutes
        return (lit, warm)

    seen = dict((h, observe(h)) for h in ids)
    assert len(set(seen.values())) == 3, seen      # the trip settles it outright
    sight_only = dict((h, seen[h][0]) for h in ids)
    assert len(set(sight_only.values())) == 2, sight_only   # eyes alone cannot
    match = [h for h in ids if seen[h] == (False, False)]
    assert match == ["c"], match
    return {
        "region": "c",
        "value": "c",
        "notes": "what you would find for each hypothesis (lit, warm): %s. Dark and "
                 "cold happens only if the third switch runs it; sight alone gives "
                 "just two outcomes for three candidates" % seen,
    }


def check_bt_ants(q, data):
    """Simulate the real bouncing dynamics, and check it against the ghosts."""
    L, speed = 100.0, 1.0
    worst = 0.0
    for _ in range(300):
        n = random.randint(2, 7)
        pos = sorted(random.uniform(0, L) for _ in range(n))
        dirs = [random.choice([-1.0, 1.0]) for _ in range(n)]
        ghosts = sorted((p if d < 0 else L - p) / speed for p, d in zip(pos, dirs))

        live = list(zip(pos, dirs))
        t, exits = 0.0, []
        while live:
            events = []
            for i in range(len(live) - 1):
                if live[i][1] > 0 and live[i + 1][1] < 0:
                    events.append((live[i + 1][0] - live[i][0]) / (2 * speed))
            for p, d in live:
                events.append((p / speed) if d < 0 else ((L - p) / speed))
            dt = min(events)
            assert dt >= -1e-12
            live = [(p + d * dt * speed, d) for p, d in live]
            t += dt
            keep = []
            for p, d in live:
                if p <= 1e-9 or p >= L - 1e-9:
                    exits.append(t)
                else:
                    keep.append((p, d))
            live = keep
            for i in range(len(live) - 1):
                if abs(live[i][0] - live[i + 1][0]) < 1e-9 and live[i][1] > live[i + 1][1]:
                    live[i] = (live[i][0], -live[i][1])
                    live[i + 1] = (live[i + 1][0], -live[i + 1][1])
            live.sort()
        assert len(exits) == n
        got = sorted(exits)
        assert all(abs(a - b) < 1e-6 for a, b in zip(got, ghosts)), (got, ghosts)
        worst = max(worst, got[-1])
    assert worst <= 100.0 + 1e-6, worst
    assert worst > 95.0, worst          # and it really does approach the full 100
    return {
        "bool": True,
        "value": "true",
        "notes": "300 random line-ups simulated with real collisions: the exit times "
                 "always match the walk-straight-through times exactly, and the "
                 "slowest ant anywhere took %.2f seconds, never past 100" % worst,
    }


def check_bt_boxes(q, data):
    """Exact: the plan fails exactly when the shuffle has a loop past fifty."""
    n, allowed = 100, 50
    harmonic = sum(Fraction(1, k) for k in range(1, n + 1))
    half = sum(Fraction(1, k) for k in range(1, allowed + 1))
    exact = 1 - (harmonic - half)
    val = float(exact)
    assert 0.31 < val < 0.32, val
    blind = 2.0 ** -n                                 # opening boxes at random
    assert blind < 1e-30 < val

    def one_room():
        perm = list(range(n))
        random.shuffle(perm)
        for start in range(n):
            steps, at = 0, start
            while perm[at] != start and steps <= allowed:
                at = perm[at]
                steps += 1
            if steps >= allowed:
                return False
        return True

    rate = mc_rate(one_room, 1200)
    assert abs(rate - val) < 0.05, (rate, val)
    got = only_choice(q, "1 in 3")
    return {
        "choice": got,
        "value": "about 1 in 3",
        "notes": "chance no loop is longer than 50 = 1 - (H(100) - H(50)) = %.4f; "
                 "1,200 simulated rooms gave %.3f, against %.2e for opening boxes "
                 "at random" % (val, rate, 2.0 ** -100),
    }


def check_bt_hat_pass(q, data):
    """Every strategy the three of them could possibly agree on, enumerated."""
    configs = list(itertools.product([0, 1], repeat=3))
    assert len(configs) == 8
    views = list(itertools.product([0, 1], repeat=2))

    def player_masks(who, fn):
        right = wrong = 0
        for bit, cfg in enumerate(configs):
            seen = tuple(cfg[j] for j in range(3) if j != who)
            said = fn[views.index(seen)]
            if said is None:
                continue
            if said == cfg[who]:
                right |= 1 << bit
            else:
                wrong |= 1 << bit
        return right, wrong

    rules = list(itertools.product([None, 0, 1], repeat=4))
    assert len(rules) == 81
    per_player = [[player_masks(w, r) for r in rules] for w in range(3)]

    pairs = set()
    for r0, w0 in per_player[0]:
        for r1, w1 in per_player[1]:
            pairs.add((r0 | r1, w0 | w1))
    best = 0
    for r01, w01 in pairs:
        for r2, w2 in per_player[2]:
            win = (r01 | r2) & ~(w01 | w2) & 0xFF
            best = max(best, bin(win).count("1"))
    assert best == 6, best

    # the plan the explanation describes hits exactly that
    def plan(cfg, who):
        seen = [cfg[j] for j in range(3) if j != who]
        return (1 - seen[0]) if seen[0] == seen[1] else None

    wins = 0
    for cfg in configs:
        said = [plan(cfg, w) for w in range(3)]
        spoke = [s for s in said if s is not None]
        ok = spoke and all(said[w] == cfg[w] for w in range(3) if said[w] is not None)
        wins += 1 if ok else 0
    assert wins == 6, wins
    got = only_choice(q, "3 in 4")
    return {
        "choice": got,
        "value": "3 in 4",
        "notes": "all %d joint strategies enumerated: the best wins %d of the 8 "
                 "line-ups, and the say-the-odd-one-out plan reaches it — 6/8 = 3 in 4"
                 % (81 ** 3, best),
    }


CHECKERS = {
    "ts_perfect_fit": check_ts_perfect_fit,
    "ts_leakage": check_ts_leakage,
    "ts_accuracy_trap": check_ts_accuracy_trap,
    "ts_threshold_dial": check_ts_threshold_dial,
    "ts_rolling_windows": check_ts_rolling_windows,
    "ts_regression_mean": check_ts_regression_mean,
    "ts_simpson": check_ts_simpson,
    "ts_time_split": check_ts_time_split,
    "ts_sample_size": check_ts_sample_size,
    "ts_dimensions": check_ts_dimensions,
    "ts_walk_correlation": check_ts_walk_correlation,
    "ts_evidence_order": check_ts_evidence_order,
    "bt_lockers": check_bt_lockers,
    "bt_hats_line": check_bt_hats_line,
    "bt_wine": check_bt_wine,
    "bt_bridge": check_bt_bridge,
    "bt_ropes": check_bt_ropes,
    "bt_boarding": check_bt_boarding,
    "bt_pirates": check_bt_pirates,
    "bt_jugs": check_bt_jugs,
    "bt_switches": check_bt_switches,
    "bt_ants": check_bt_ants,
    "bt_boxes": check_bt_boxes,
    "bt_hat_pass": check_bt_hat_pass,
}
