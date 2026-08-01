"""Checkers for unit 12 — when to stop, and how you go broke.

The secretary problem is solved exactly: the success rate of every cutoff is a
Fraction, the best one is found by comparing all hundred of them, and the
four-candidate version is settled by walking all 24 orders. The ruin questions
are solved by exact linear systems over the whole bankroll, never by quoting the
formula — the formula is then checked against the system. The doubling system is
enumerated outcome by outcome. The last one is a divergence: the wait to come
back to level is shown to have no mean at all.
"""

import math
import random
import re
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    only_choice,
)


def _st(data):
    assert "stopping" in data, "vizData.stopping is missing"
    return data["stopping"]


# ---------------------------------------------------------------------------
# u12l1 — the secretary problem
# ---------------------------------------------------------------------------

def _cutoff_odds(n, r):
    """Exact chance of ending up with the best of n, having turned down the
    first r and then taken the first candidate who beats all of them."""
    if r == 0:
        return Fraction(1, n)
    return Fraction(r, n) * sum(Fraction(1, i - 1) for i in range(r + 1, n + 1))


def _brute(n, r):
    """The same thing by walking every permutation — only for tiny n."""
    import itertools
    wins = 0
    for perm in itertools.permutations(range(n)):
        seen, taken = -1, None
        for i, v in enumerate(perm):
            if i < r:
                seen = max(seen, v)
            elif v > seen:
                taken = v
                break
            else:
                seen = max(seen, v)
        wins += 1 if taken == n - 1 else 0
    return Fraction(wins, math.factorial(n))


def _run_rule(n, r):
    """One real hiring round under the cutoff rule. True if the best was hired."""
    ranks = list(range(n))
    random.shuffle(ranks)
    seen, taken = -1, None
    for i, v in enumerate(ranks):
        if i < r:
            seen = max(seen, v)
        elif v > seen:
            taken = v
            break
        else:
            seen = max(seen, v)
    return taken == n - 1


def check_secretary_skip(q, data):
    n = _st(data)["candidates"]
    assert n == 100, n
    odds = {r: _cutoff_odds(n, r) for r in range(n)}
    best = max(odds, key=odds.get)
    rest = sorted(v for r, v in odds.items() if r != best)
    assert rest[-1] < odds[best], "no strict best cutoff"
    assert best == 37, best
    # the formula is only trusted because it agrees with brute force at small n
    for m in (4, 6, 7):
        for r in range(m):
            assert _cutoff_odds(m, r) == _brute(m, r), (m, r)
    # and because a hundred thousand real rounds pick the same neighbourhood
    trials = 4000
    scores = {r: sum(1 for _ in range(trials) if _run_rule(n, r)) / float(trials)
              for r in (10, 37, 70)}
    assert scores[37] > scores[10] and scores[37] > scores[70], scores
    return {
        "number": float(best),
        "value": "37",
        "notes": "best cutoff 37 at %.4f, against 36 at %.4f and 38 at %.4f; "
                 "formula verified against every permutation for n=4,6,7; "
                 "%d live rounds each: %s" % (
                     float(odds[37]), float(odds[36]), float(odds[38]),
                     trials, {k: round(v, 3) for k, v in scores.items()}),
    }


def check_secretary_odds(q, data):
    n = _st(data)["candidates"]
    odds = {r: _cutoff_odds(n, r) for r in range(n)}
    best = max(odds, key=odds.get)
    p = odds[best]
    assert abs(float(p) - 1 / math.e) < 0.005, float(p)
    derived = nearest_choice(q, float(p) * 100)

    # the other outcome the explanation claims: you go home with nobody exactly
    # when the best of all was inside the stretch you threw away
    trials, wins, nobody = 5000, 0, 0
    for _ in range(trials):
        ranks = list(range(n))
        random.shuffle(ranks)
        seen, taken = -1, None
        for i, v in enumerate(ranks):
            if i < best:
                seen = max(seen, v)
            elif v > seen:
                taken = v
                break
            else:
                seen = max(seen, v)
        if taken is None:
            nobody += 1
        elif taken == n - 1:
            wins += 1
    assert abs(wins / float(trials) - float(p)) < 0.03, wins / float(trials)
    assert abs(nobody / float(trials) - float(best) / n) < 0.03, nobody / float(trials)
    return {
        "choice": derived,
        "value": "37%",
        "notes": "exact %.4f (1/e = %.4f); %d live rounds landed the best %.3f of "
                 "the time and nobody at all %.3f of the time" % (
                     float(p), 1 / math.e, trials,
                     wins / float(trials), nobody / float(trials)),
    }


def check_secretary_four(q, data):
    n = _st(data)["shortlist"]
    assert n == 4, n
    odds = {r: _brute(n, r) for r in range(n)}          # all 24 orders, no formula
    for r in range(n):
        assert odds[r] == _cutoff_odds(n, r), (r, odds[r])
    best = max(odds, key=odds.get)
    rest = sorted(v for r, v in odds.items() if r != best)
    assert rest[-1] < odds[best], odds
    assert best == 1 and odds[best] == Fraction(11, 24), odds
    derived = nearest_choice(q, float(odds[best]) * 100)
    # and the claim in the explanation: a shortlist really is easier than a pile
    assert odds[best] > _cutoff_odds(100, 37) > Fraction(1, 3), odds[best]
    return {
        "choice": derived,
        "value": "46%",
        "notes": "all 24 orders: %s — best is to reject 1, winning 11/24 = %.4f, "
                 "well above the 0.3710 you get with a hundred" % (
                     {r: str(v) for r, v in odds.items()}, float(odds[best])),
    }


def check_skip_half(q, data):
    st = _st(data)
    n, sloppy = st["candidates"], st["sloppyCutoff"]
    assert sloppy == 50, sloppy
    best = max(range(n), key=lambda r: _cutoff_odds(n, r))
    p_best, p_sloppy = _cutoff_odds(n, best), _cutoff_odds(n, sloppy)
    assert p_sloppy < p_best, (p_sloppy, p_best)
    pct = float(p_sloppy) * 100
    assert 34 < pct < 36, pct

    # the choices are sentences; only the ones quoting a number can be right,
    # and "it actually does better" is ruled out by the comparison above
    numeric = [c for c in q["choices"] if re.search(r"\d", c)]
    assert len(numeric) == len(q["choices"]) - 1, q["choices"]
    gaps = sorted(abs(first_number(c) - pct) for c in numeric)
    assert gaps[0] < gaps[1], "two choices equally close to %.2f" % pct
    derived = min(numeric, key=lambda c: abs(first_number(c) - pct))

    # the flat top the explanation promises
    flat = [r for r in range(n) if _cutoff_odds(n, r) > p_best - Fraction(2, 100)]
    assert min(flat) <= 27 and max(flat) >= 48, (min(flat), max(flat))
    return {
        "choice": derived,
        "value": "it drops to about 35%",
        "notes": "cutoff 50 wins %.4f against the best 37's %.4f; every cutoff "
                 "from %d to %d is within two points of the best" % (
                     float(p_sloppy), float(p_best), min(flat), max(flat)),
    }


# ---------------------------------------------------------------------------
# u12l2 — how you go broke
# ---------------------------------------------------------------------------

def _ruin_exact(a, total, p=Fraction(1, 2)):
    """Chance of reaching `total` before 0 from `a`, and the expected number of
    flips, both by solving the whole bankroll as one linear system."""
    n = total - 1                                   # unknowns for 1..total-1
    qq = 1 - p

    def solve(const):
        rows = []
        for i in range(1, total):
            row = [Fraction(0)] * n + [const(i)]
            row[i - 1] = Fraction(1)
            if i + 1 < total:
                row[i] -= p
            if i - 1 > 0:
                row[i - 2] -= qq
            rows.append(row)
        # tridiagonal forward elimination, so a hundred-pound bankroll is cheap
        M = rows
        for c in range(n):
            pv = M[c][c]
            M[c] = [v / pv for v in M[c]]
            if c + 1 < n and M[c + 1][c] != 0:
                fac = M[c + 1][c]
                M[c + 1] = [x - fac * y for x, y in zip(M[c + 1], M[c])]
        for c in range(n - 1, 0, -1):
            if M[c - 1][c] != 0:
                fac = M[c - 1][c]
                M[c - 1] = [x - fac * y for x, y in zip(M[c - 1], M[c])]
        return [M[i][n] for i in range(n)]

    # win chance: w(i) = p w(i+1) + q w(i-1), w(0)=0, w(total)=1
    win = solve(lambda i: p if i == total - 1 else Fraction(0))
    # duration: d(i) = 1 + p d(i+1) + q d(i-1), d(0) = d(total) = 0
    dur = solve(lambda i: Fraction(1))
    return win[a - 1], dur[a - 1]


def _ruin_float(a, total, p):
    """The same two systems for a wheel with an edge, in floating point — the
    exact version's fractions explode once p stops being a half. Thomas
    algorithm on the tridiagonal system, which is what makes a 900-pound
    ceiling cost nothing."""
    n = total - 1
    qq = 1.0 - p
    lo = [qq] * n
    mid = [1.0] * n
    hi = [-p] * n

    def solve(rhs):
        c = [0.0] * n
        d = [0.0] * n
        c[0] = hi[0] / mid[0]
        d[0] = rhs[0] / mid[0]
        for i in range(1, n):
            m = mid[i] - (-lo[i]) * c[i - 1]
            c[i] = hi[i] / m if i + 1 < n else 0.0
            d[i] = (rhs[i] - (-lo[i]) * d[i - 1]) / m
        x = [0.0] * n
        x[n - 1] = d[n - 1]
        for i in range(n - 2, -1, -1):
            x[i] = d[i] - c[i] * x[i + 1]
        return x

    win = solve([p if i == n - 1 else 0.0 for i in range(n)])
    dur = solve([1.0] * n)
    return win[a - 1], dur[a - 1]


def check_break_the_house(q, data):
    st = _st(data)
    a, house = st["purse"], st["houseCash"]
    assert (a, house) == (5, 95), (a, house)
    win, _ = _ruin_exact(a, a + house)
    assert win == Fraction(a, a + house) == Fraction(1, 20), win

    # a fair game moves money without making any, so the answer is forced
    assert win * (a + house) + (1 - win) * 0 == a

    hits, runs = 0, 2000
    for _ in range(runs):
        cash = a
        while 0 < cash < a + house:
            cash += 1 if random.getrandbits(1) else -1
        hits += 1 if cash else 0
    assert abs(hits / float(runs) - float(win)) < 0.025, hits / float(runs)
    return {
        "number": float(win) * 100,
        "value": "5",
        "notes": "solved over the whole bankroll: 1/20; expectation check "
                 "0.05*100 = the £5 started with; %d simulated evenings broke "
                 "the house %.3f of the time" % (runs, hits / float(runs)),
    }


def check_ruin_length(q, data):
    st = _st(data)
    a, house = st["purse"], st["houseCash"]
    _, dur = _ruin_exact(a, a + house)
    assert dur == a * house == 475, dur
    for x, y in ((3, 7), (5, 20), (12, 13)):
        assert _ruin_exact(x, x + y)[1] == x * y, (x, y)

    total, runs = 0, 800
    for _ in range(runs):
        cash, flips = a, 0
        while 0 < cash < a + house:
            cash += 1 if random.getrandbits(1) else -1
            flips += 1
        total += flips
    mc = total / float(runs)
    assert abs(mc - 475) < 90, mc
    return {
        "number": float(dur),
        "value": "475",
        "notes": "exact duration 475 = 5 x 95, and the product rule holds for "
                 "every split tried; %d simulated evenings averaged %.0f flips" % (
                     runs, mc),
    }


def check_roulette_ruin(q, data):
    r = _st(data)["roulette"]
    slots, reds, bank = r["slots"], r["reds"], r["bankroll"]
    assert (slots, reds, bank) == (37, 18, 100), (slots, reds, bank)
    p = Fraction(reds, slots)
    edge = (1 - p) - p
    assert edge == Fraction(1, 37), edge

    # solved with a ceiling far above the bankroll, so the ceiling cannot matter
    got = {}
    for ceiling in (400, 1200):
        got[ceiling] = _ruin_float(bank, ceiling, float(p))[1]
    assert abs(got[1200] - got[400]) < 0.01, got
    assert abs(got[1200] - bank / float(edge)) < 0.01, got
    # and the fair-game solver agrees with the float one where they overlap
    assert abs(_ruin_float(5, 100, 0.5)[1] - float(_ruin_exact(5, 100)[1])) < 1e-6
    answer = round(got[1200])
    assert answer == 3700, answer

    # a live wheel, with a small bankroll so the run is quick, checking the law
    small, runs, total = 5, 1500, 0
    for _ in range(runs):
        cash, spins = small, 0
        while cash > 0:
            cash += 1 if random.random() < float(p) else -1
            spins += 1
        total += spins
    mc = total / float(runs)
    assert abs(mc - small / float(edge)) < 45, mc
    return {
        "number": float(answer),
        "value": "3700",
        "notes": "bankroll over the edge per spin: 100 / (1/37) = 3700, and the "
                 "full bankroll system agrees to two decimals with ceilings of "
                 "400 and 1200; %d live runs from a £%d bankroll averaged %.0f "
                 "spins against the predicted %.0f" % (
                     runs, small, mc, small / float(edge)),
    }


def check_martingale_double(q, data):
    steps = _st(data)["martingale"]["maxDoubles"]
    assert steps == 10, steps
    purse = 2 ** steps - 1
    assert purse == 1023, purse

    # every possible night, exactly: win on flip k, or lose all ten
    outcomes = {}
    for k in range(steps):
        outcomes[+1] = outcomes.get(+1, Fraction(0)) + Fraction(1, 2 ** (k + 1))
    outcomes[-purse] = Fraction(1, 2 ** steps)
    assert sum(outcomes.values()) == 1, outcomes
    ev = sum(Fraction(v) * pr for v, pr in outcomes.items())
    assert ev == 0, ev
    assert outcomes[1] == Fraction(purse, purse + 1), outcomes
    derived = only_choice(q, "nothing")

    nights, total = 6000, 0
    for _ in range(nights):
        bet, won = 1, False
        for _ in range(steps):
            if random.getrandbits(1):
                won = True
                break
            bet *= 2
        total += 1 if won else -purse
    assert abs(total / float(nights)) < 1.2, total / float(nights)
    return {
        "choice": derived,
        "value": "nothing, on average",
        "notes": "exact: +£1 with probability 1023/1024 and -£1023 with 1/1024, "
                 "expectation exactly 0; %d simulated nights averaged £%.2f" % (
                     nights, total / float(nights)),
    }


def check_first_return(q, data):
    """P(first return to level at flip 2n) = C(2n,n) / ((2n-1) 4^n). Those add
    up to 1 — the walk comes back for certain — while 2n times them does not
    add up to anything at all."""
    p, mass, mean = 1.0, 0.0, 0.0
    marks = {}
    for n in range(1, 200001):
        p *= (2 * n - 1) / float(2 * n) if n > 1 else 0.5      # C(2n,n)/4^n
        pr = p / (2 * n - 1) if n > 1 else 0.5
        mass += pr
        mean += 2 * n * pr
        if n in (100, 2000, 50000, 200000):
            marks[n] = (mass, mean)
    assert abs(mass - 1.0) < 0.002, mass                       # certain to return
    assert marks[100][0] < marks[2000][0] < mass
    # the partial mean keeps climbing: it roughly doubles when the cut-off is
    # squared up, exactly what a sum with no mean does
    for lo, hi in ((100, 2000), (2000, 50000), (50000, 200000)):
        grew = marks[hi][1] / marks[lo][1]
        assert abs(grew - math.sqrt(hi / float(lo))) < 0.05 * grew, (lo, hi, grew)
    assert marks[200000][1] > 500, marks
    derived = only_choice(q, "infinite")

    # a live check on the same shape: capping the wait changes the average a lot
    def sample(cap):
        pos, k = 0, 0
        while k < cap:
            pos += 1 if random.getrandbits(1) else -1
            k += 1
            if pos == 0:
                return k
        return cap
    a = sum(sample(200) for _ in range(2000)) / 2000.0
    b = sum(sample(20000) for _ in range(500)) / 500.0
    assert b > a * 2, (a, b)
    return {
        "choice": derived,
        "value": "infinite",
        "notes": "return probabilities add to %.4f (certain) but the mean of the "
                 "first %s flips is %s and still climbing; capping live walks at "
                 "200 gives an average wait of %.1f and capping at 20,000 gives "
                 "%.1f" % (mass, "200,000", "%.0f" % marks[200000][1], a, b),
    }


CHECKERS = {
    "secretary_skip": check_secretary_skip,
    "secretary_odds": check_secretary_odds,
    "secretary_four": check_secretary_four,
    "skip_half": check_skip_half,
    "break_the_house": check_break_the_house,
    "ruin_length": check_ruin_length,
    "roulette_ruin": check_roulette_ruin,
    "martingale_double": check_martingale_double,
    "first_return": check_first_return,
}
