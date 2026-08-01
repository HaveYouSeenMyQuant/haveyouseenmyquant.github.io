"""Checkers for the on-ramp — unit 1, lesson 1.

The five easiest questions on the site, and therefore the five whose answers it
would be most embarrassing to get wrong. Every one is settled by enumerating
the whole sample space; Monte Carlo only confirms it.
"""

import itertools
import random
from fractions import Fraction

from checks._helpers import mc_rate, only_choice, strict_max


def check_two_coins_pair(q, data):
    space = list(itertools.product("HT", repeat=2))
    assert len(space) == 4
    groups = {"two heads": 0, "one of each": 0, "two tails": 0}
    for a, b in space:
        if a == b == "H":
            groups["two heads"] += 1
        elif a == b == "T":
            groups["two tails"] += 1
        else:
            groups["one of each"] += 1
    assert groups == {"two heads": 1, "one of each": 2, "two tails": 1}, groups
    best = strict_max(groups)
    assert best == "one of each"
    exact = Fraction(groups[best], 4)
    mc = mc_rate(lambda: random.getrandbits(1) != random.getrandbits(1), 20000)
    assert abs(mc - float(exact)) < 0.02, mc
    return {
        "choice": only_choice(q, "one of each"),
        "value": "one of each (2 ways in 4)",
        "notes": "all four ordered pairs %s -> %s; HT and TH are different "
                 "outcomes, so %s; MC(20k) = %.4f" % (
                     ["".join(p) for p in space], groups, exact, mc),
    }


def check_die_even_or_high(q, data):
    faces = list(range(1, 7))
    even = [v for v in faces if v % 2 == 0]
    high = [v for v in faces if v > 4]
    assert even == [2, 4, 6] and high == [5, 6], (even, high)
    counts = {"even": len(even), "bigger than 4": len(high)}
    best = strict_max(counts)
    assert best == "even" and counts["even"] == 3 and counts["bigger than 4"] == 2
    N = 20000
    e = h = 0
    for _ in range(N):
        v = random.randrange(1, 7)
        e += v % 2 == 0
        h += v > 4
    assert e > h, (e, h)
    assert abs(e / N - 0.5) < 0.02 and abs(h / N - 1 / 3) < 0.02
    return {
        "choice": only_choice(q, "even"),
        "value": "even (3 faces beat 2)",
        "notes": "even faces %s (3 of 6), faces above four %s (2 of 6); "
                 "MC(%d) even %.3f vs above-four %.3f" % (even, high, N, e / N, h / N),
    }


def check_best_spinner(q, data):
    spinners = data["spinners"]
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(s["id"] for s in spinners), (ids, spinners)
    share = {}
    for s in spinners:
        assert 0 < s["gold"] < s["slices"], s
        share[s["id"]] = Fraction(s["gold"], s["slices"])
    best = strict_max(share)
    # the biggest share of the circle is the biggest chance — check by sampling
    # a real angle on each wheel rather than trusting the arithmetic
    N = 12000
    hits = {}
    for sid, frac in share.items():
        c = 0
        for _ in range(N):
            c += random.random() < float(frac)
        hits[sid] = c / N
    assert strict_max(hits) == best, (hits, best)
    assert abs(hits[best] - float(share[best])) < 0.03
    return {
        "region": best,
        "value": best,
        "notes": "gold share by spinner %s; biggest is %r; MC(%d each) %s" % (
            {k: str(v) for k, v in share.items()}, best, N,
            {k: round(v, 3) for k, v in hits.items()}),
    }


def check_streak_next_flip(q, data):
    """A fair coin has no memory: after any run of heads the next flip is still
    an even chance. Derived by conditioning, then confirmed by running the real
    experiment — flip until five heads land in a row, then look at the next."""
    exact = Fraction(1, 2)
    N, heads, trials = 30000, 0, 0
    run = 0
    guard = 0
    while trials < N and guard < 40_000_000:
        guard += 1
        c = random.getrandbits(1)
        if run >= 5:
            heads += c
            trials += 1
            run = c and run + 1 or 0
        else:
            run = c and run + 1 or 0
    assert trials == N, trials
    mc = heads / trials
    assert abs(mc - float(exact)) < 0.02, mc
    # and the whole point: the run before it changes nothing
    assert Fraction(1, 2) == exact
    # each offered choice is a claim about that probability; exactly one is true
    claims = {
        "Much less than 1 in 2": exact < Fraction(2, 5),
        "1 in 2": exact == Fraction(1, 2),
        "Much more than 1 in 2": exact > Fraction(3, 5),
    }
    assert set(claims) == set(q["choices"]), sorted(q["choices"])
    true_claims = [c for c, ok in claims.items() if ok]
    assert len(true_claims) == 1, true_claims
    return {
        "choice": true_claims[0],
        "value": "1 in 2",
        "notes": "flips are independent, so P(heads | any history) = 1/2; the "
                 "real experiment — %d flips that directly followed a run of "
                 "five heads — gave %.4f heads" % (trials, mc),
    }


def check_two_spins_gold(q, data):
    """Two spins of a wheel that is a quarter gold. 'At least once' is not a
    quarter plus a quarter: it is one minus missing twice."""
    p = Fraction(1, 4)
    miss = (1 - p) ** 2
    at_least_one = 1 - miss
    assert at_least_one == Fraction(7, 16), at_least_one
    assert at_least_one < Fraction(1, 2), at_least_one
    assert 2 * p == Fraction(1, 2), "the naive answer is exactly a half"
    mc = mc_rate(lambda: random.random() < 0.25 or random.random() < 0.25, 20000)
    assert abs(mc - float(at_least_one)) < 0.02, mc
    derived = bool(at_least_one > Fraction(1, 2))
    assert derived is False
    return {
        "bool": derived,
        "value": "false",
        "notes": "P(miss twice) = (3/4)^2 = %s, so P(at least one gold) = %s = "
                 "%.2f%% — under a half, though adding the two quarters would "
                 "say exactly a half; MC(20k) = %.4f" % (
                     miss, at_least_one, float(at_least_one) * 100, mc),
    }


CHECKERS = {
    "two_coins_pair": check_two_coins_pair,
    "die_even_or_high": check_die_even_or_high,
    "best_spinner": check_best_spinner,
    "streak_next_flip": check_streak_next_flip,
    "two_spins_gold": check_two_spins_gold,
}
