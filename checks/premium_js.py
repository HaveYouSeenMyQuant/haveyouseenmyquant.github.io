"""Checkers for the premium sets: the Jane Street set and the Citadel set.

Every answer here is re-derived from scratch — exact wherever an exact
derivation exists (backward induction, enumeration over the sample space,
Fractions, closed-form gambler's ruin), with Monte Carlo only ever used as a
cross-check. The two datasets these questions share with their visuals live in
the bank's vizData under the key "premiumJs".
"""

import math
import random
from fractions import Fraction as F

from checks._helpers import (
    first_number, mc_mean, mc_rate, nearest_choice, only_choice, strict_min,
)


# ---------------------------------------------------------------------------
# helpers used by more than one question here
# ---------------------------------------------------------------------------

DECK = [1] * 4 + [0] * 48          # 1 = ace


def _dice_totals(n):
    """{total: count} over every ordered roll of n dice."""
    counts = {0: 1}
    for _ in range(n):
        nxt = {}
        for t, c in counts.items():
            for face in range(1, 7):
                nxt[t + face] = nxt.get(t + face, 0) + c
        counts = nxt
    return counts


def _pearson(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    return sxy / math.sqrt(sxx * syy)


def _phi(z):
    """Standard normal CDF."""
    return 0.5 * math.erfc(-z / math.sqrt(2))


def _premium_data(data):
    d = (data or {}).get("premiumJs")
    assert isinstance(d, dict), "vizData['premiumJs'] is missing"
    return d


# ---------------------------------------------------------------------------
# the Jane Street set
# ---------------------------------------------------------------------------

def _die_value(rolls):
    """Value of a die game with `rolls` rolls in all, playing optimally:
    backward induction, exactly."""
    value = F(7, 2)                                  # the last roll: no choice
    for _ in range(rolls - 1):
        value = sum(F(max(face, value)) for face in range(1, 7)) / 6
    return value


def check_js_three_rolls(q, data):
    one, two, three = _die_value(1), _die_value(2), _die_value(3)
    assert one == F(7, 2), one
    assert two == F(17, 4), two                      # the road's one-reroll game
    assert three == F(14, 3), three
    # the stopping rule the explanation claims: keep 5 or 6 on the first roll
    keep_first = [face for face in range(1, 7) if face > two]
    assert keep_first == [5, 6], keep_first
    keep_second = [face for face in range(1, 7) if face > one]
    assert keep_second == [4, 5, 6], keep_second
    # Monte Carlo cross-check of that policy
    def play():
        a = random.randint(1, 6)
        if a > two:
            return a
        b = random.randint(1, 6)
        if b > one:
            return b
        return random.randint(1, 6)
    sim = mc_mean(play, 25000)
    assert abs(sim - float(three)) < 0.06, (sim, float(three))
    return {
        "number": float(three),
        "value": "%.2f" % float(three),
        "notes": "backward induction: 1 roll %s, 2 rolls %s, 3 rolls %s (=%.4f); "
                 "keep %s on the first roll, %s on the second; MC(25k) %.3f" % (
                     one, two, three, float(three), keep_first, keep_second, sim),
    }


def check_js_market_edge(q, data):
    counts = _dice_totals(3)
    assert sum(counts.values()) == 216
    fair = F(sum(t * c for t, c in counts.items()), 216)
    assert fair == F(21, 2), fair
    edge = fair - 9                                   # you bought at 9
    other_side = 12 - fair                            # had they lifted instead
    assert edge == other_side == F(3, 2), (edge, other_side)
    losers = sum(c for t, c in counts.items() if t < 9)
    assert losers == 56, losers                       # the trade loses often
    sim = mc_mean(lambda: sum(random.randint(1, 6) for _ in range(3)) - 9, 20000)
    assert abs(sim - float(edge)) < 0.09, (sim, float(edge))
    return {
        "number": float(edge),
        "value": "%g" % float(edge),
        "notes": "three dice: fair value %s; bought at 9 -> edge %s; the same %s "
                 "if the offer is lifted at 12; %d of 216 rolls settle below 9; "
                 "MC(20k) %.3f" % (fair, edge, other_side, losers, sim),
    }


def check_js_next_card(q, data):
    """Call the majority colour every time: exact DP over (reds, blacks)."""
    memo = {}

    def best(r, b):
        if r == 0 and b == 0:
            return F(0)
        key = (r, b)
        if key in memo:
            return memo[key]
        n = r + b
        val = F(max(r, b), n)
        if r:
            val += F(r, n) * best(r - 1, b)
        if b:
            val += F(b, n) * best(r, b - 1)
        memo[key] = val
        return val

    exact = best(26, 26)
    got = float(exact)
    assert 30.0 < got < 30.1, got
    assert best(1, 1) == 1 + F(1, 2), best(1, 1)      # last card is a certainty
    def play():
        deck = [0] * 26 + [1] * 26
        random.shuffle(deck)
        r = b = 0
        hits = 0
        for i, card in enumerate(deck):
            left_r, left_b = 26 - r, 26 - b
            call = 1 if left_r > left_b else 0
            hits += 1 if call == card else 0
            if card:
                r += 1
            else:
                b += 1
        return hits
    sim = mc_mean(play, 4000)
    assert abs(sim - got) < 0.25, (sim, got)
    return {
        "choice": nearest_choice(q, got),
        "value": "about %d" % round(got),
        "notes": "DP over (reds, blacks), calling the majority: %.4f of 52 "
                 "(a coin flip would give 26); MC(4k decks) %.3f" % (got, sim),
    }


def check_js_decline(q, data):
    """He sees his roll first and only plays on a 5 or a 6."""
    plays = [5, 6]
    per_round = F(0)
    conditional = F(0)
    for his in plays:
        ev = F(0)
        for mine in range(1, 7):
            if mine > his:
                ev += F(10, 6)
            elif mine < his:
                ev -= F(10, 6)
        conditional += ev / len(plays)
        per_round += ev / 6
    assert conditional == F(-20, 3), conditional
    assert per_round == F(-20, 9), per_round          # about -2.22 over all rounds
    # if he had to play every round it would be a fair game
    fair = sum(F(10, 36) * (1 if m > h else (-1 if m < h else 0))
               for h in range(1, 7) for m in range(1, 7))
    assert fair == 0, fair

    def played_round():
        while True:
            his = random.randint(1, 6)
            if his < 5:
                continue
            mine = random.randint(1, 6)
            return 10 if mine > his else (-10 if mine < his else 0)
    sim = mc_mean(played_round, 20000)
    assert abs(sim - float(conditional)) < 0.35, (sim, float(conditional))
    loss = -float(conditional)
    assert abs(loss - 20 / 3.0) < 1e-9
    return {
        "choice": only_choice(q, "%.2f" % (round(loss * 10) / 10.0)),
        "value": "lose about £%.2f" % (round(loss * 10) / 10.0),
        "notes": "he plays only on 5 or 6: your EV per played round %s (=%.4f), "
                 "per round overall %s; the same game with no opt-out is worth "
                 "%s; MC(20k) %.3f" % (conditional, float(conditional),
                                       per_round, fair, sim),
    }


def check_js_red_stop(q, data):
    """Betting a pound that the next card is red, stopping when you like.
    Exact backward induction over every (reds left, blacks left)."""
    memo = {}

    def value(r, b):
        if r == 0:
            return F(-1)                              # forced to bet, certain loss
        if b == 0:
            return F(1)
        key = (r, b)
        if key in memo:
            return memo[key]
        stop = F(r - b, r + b)
        go_on = F(r, r + b) * value(r - 1, b) + F(b, r + b) * value(r, b - 1)
        memo[key] = max(stop, go_on)
        return memo[key]

    start = value(26, 26)
    assert start == 0, start
    # and the general shape the explanation leans on: waiting never adds anything
    for r in range(0, 27):
        for b in range(0, 27):
            if r + b == 0 or r == 0 or b == 0:
                continue
            assert value(r, b) == F(r - b, r + b), (r, b, value(r, b))
    assert value(10, 3) == F(7, 13)                   # a red-rich deck is worth more
    return {
        "choice": only_choice(q, "Nothing"),
        "value": "nothing",
        "notes": "backward induction over all 26x26 deck states: value(26,26)=%s; "
                 "value(r,b) = (r-b)/(r+b) everywhere, so no waiting rule beats "
                 "betting at once; a 10-red 3-black deck is worth %s" % (
                     start, value(10, 3)),
    }


def check_js_st_petersburg(q, data):
    cap = 1_000_000
    ev = sum(F(1, 2 ** n) * min(2 ** n, cap) for n in range(1, 200))
    got = float(ev)
    assert 20.5 < got < 21.0, got
    # uncapped, the first thirty flips alone already pay thirty pounds
    assert sum(F(1, 2 ** n) * 2 ** n for n in range(1, 31)) == 30
    billion = float(sum(F(1, 2 ** n) * min(2 ** n, 10 ** 9) for n in range(1, 200)))
    assert 30.5 < billion < 31.5, billion              # the explanation's second number
    return {
        "choice": only_choice(q, "£21"),
        "value": "about £%d" % round(got),
        "notes": "capped at a million: %.4f (a thousand times the bank only "
                 "takes it to %.4f); uncapped the sum diverges one pound per "
                 "flip" % (got, billion),
    }


def check_js_coupon(q, data):
    exact = 6 * sum(F(1, k) for k in range(1, 7))
    assert exact == F(147, 10), exact
    waits = [F(6, 6 - k) for k in range(6)]           # the six separate waits
    assert waits[-1] == 6, waits
    assert sum(waits) == exact

    def play():
        seen = set()
        rolls = 0
        while len(seen) < 6:
            seen.add(random.randint(1, 6))
            rolls += 1
        return rolls
    sim = mc_mean(play, 20000)
    assert abs(sim - float(exact)) < 0.25, (sim, float(exact))
    return {
        "number": float(exact),
        "value": "%.1f" % float(exact),
        "notes": "sum of the six waits %s = %s (=%.2f); the last face alone "
                 "costs 6 rolls; MC(20k) %.3f" % (
                     [str(w) for w in waits], exact, float(exact), sim),
    }


def check_js_order_bets(q, data):
    pairs = [(a, b) for a in range(1, 7) for b in range(1, 7)]
    values = {
        "six": F(10, 6),
        "two-dice six": F(10 * sum(1 for a, b in pairs if 6 in (a, b)), 36),
        "pips": F(sum(range(1, 7)), 6),
        "seven or more": F(10 * sum(1 for a, b in pairs if a + b >= 7), 36),
    }
    assert values["two-dice six"] == F(110, 36), values["two-dice six"]
    assert values["seven or more"] == F(210, 36), values["seven or more"]
    assert values["pips"] == F(7, 2)
    keys = ["six", "two-dice six", "pips", "seven or more"]
    order = sorted(values, key=lambda k: values[k])
    assert order == keys, order
    floats = [float(values[k]) for k in order]
    for lo, hi in zip(floats, floats[1:]):
        assert hi - lo > 0.3, (lo, hi)                # strictly, clearly ordered

    # match each key to exactly one item on offer, by what the item describes
    def match(key):
        if key == "six":
            hits = [it for it in q["items"] if "one roll shows" in it]
        elif key == "two-dice six":
            hits = [it for it in q["items"] if "either of two dice" in it]
        elif key == "pips":
            hits = [it for it in q["items"] if "every pip" in it]
        else:
            hits = [it for it in q["items"] if "seven or more" in it]
        assert len(hits) == 1, (key, hits)
        return hits[0]

    items = [match(k) for k in order]
    assert len(set(items)) == 4
    return {
        "order": items,
        "value": ", ".join(order),
        "notes": "fair values: " + "; ".join(
            "%s %s (%.3f)" % (k, values[k], float(values[k])) for k in order),
    }


def check_js_two_cards(q, data):
    """Two distinct numbers from 1..10, one revealed; keep it if it is at least
    `t`, otherwise switch. Enumerated over all 90 ordered pairs."""
    def win_rate(t):
        wins = 0
        total = 0
        for seen in range(1, 11):
            for other in range(1, 11):
                if seen == other:
                    continue
                total += 1
                if seen >= t:
                    wins += 1 if seen > other else 0
                else:
                    wins += 1 if other > seen else 0
        return F(wins, total)

    rates = {t: win_rate(t) for t in range(1, 12)}
    assert rates[1] == F(1, 2) and rates[11] == F(1, 2), rates   # always / never keep
    best = max(rates, key=lambda t: rates[t])
    assert best == 6 and rates[6] == F(7, 9), (best, rates[6])
    for t in range(2, 11):
        assert rates[t] > F(1, 2), (t, rates[t])
    beats_half = rates[6] > F(1, 2)

    def play():
        seen, other = random.sample(range(1, 11), 2)
        keep = seen >= 6
        return (seen > other) if keep else (other > seen)
    sim = mc_rate(play, 20000)
    assert abs(sim - float(rates[6])) < 0.02, (sim, float(rates[6]))
    return {
        "bool": bool(beats_half),
        "value": "true",
        "notes": "keep-if-at-least-t win rates: %s; best t=6 at %s (=%.4f); "
                 "every threshold from 2 to 10 beats a half; MC(20k) %.4f" % (
                     {t: str(rates[t]) for t in (1, 5, 6, 7, 11)}, rates[6],
                     float(rates[6]), sim),
    }


def check_js_bust(q, data):
    """Roll on, adding pips; a one wipes the pot. Monotone stopping problem, so
    the one-step rule is optimal: roll while the pot is worth less than the
    expected gain from one more roll."""
    cap = 400
    threshold = None
    for pot in range(0, 60):
        gain = F(sum(range(2, 7)), 6) - F(pot, 6)     # 5/6 * avg(2..6) - 1/6 * pot
        if gain <= 0:
            threshold = pot
            break
    assert threshold == 20, threshold
    assert F(sum(range(2, 7)), 6) == F(10, 3)         # 3 1/3 pips of gain
    # strictly better to roll below 20, strictly worse above it, indifferent at 20
    for pot in range(0, 20):
        assert F(sum(range(2, 7)), 6) - F(pot, 6) > 0, pot
    assert F(sum(range(2, 7)), 6) - F(20, 6) == 0
    for pot in range(21, 40):
        assert F(sum(range(2, 7)), 6) - F(pot, 6) < 0, pot

    def value_of(t):
        v = [0.0] * (cap + 8)
        for pot in range(cap, -1, -1):
            v[pot] = float(pot) if pot >= t else sum(
                v[pot + k] for k in range(2, 7)) / 6.0
        return v[0]
    scores = {t: value_of(t) for t in range(5, 36)}
    best = max(scores, key=lambda t: scores[t])
    assert scores[20] >= scores[best] - 1e-9, (scores[20], scores[best])
    assert 8.0 < scores[20] < 8.3, scores[20]
    assert scores[10] < scores[20] - 0.5 and scores[30] < scores[20] - 0.2

    def play():
        pot = 0
        while pot < 20:
            roll = random.randint(1, 6)
            if roll == 1:
                return 0
            pot += roll
        return pot
    sim = mc_mean(play, 20000)
    assert abs(sim - scores[20]) < 0.3, (sim, scores[20])
    return {
        "number": float(threshold),
        "value": "%d" % threshold,
        "notes": "one more roll is worth 10/3 pips and risks the pot with "
                 "probability 1/6, so it breaks even at a pot of %d; stopping "
                 "there the game is worth %.3f (stop at 10: %.3f, at 30: %.3f); "
                 "MC(20k) %.3f" % (threshold, scores[20], scores[10],
                                   scores[30], sim),
    }


def check_js_first_ace(q, data):
    """Position of the first ace in a shuffled deck: E[T] = sum P(T > k)."""
    def comb(n, k):
        return math.comb(n, k)
    exact = sum(F(comb(48, k), comb(52, k)) for k in range(0, 49))
    assert exact == F(53, 5), exact
    # the same number the other way: sum over positions of p * P(first ace at p)
    direct = sum(F(p) * F(comb(52 - p, 3), comb(52, 4)) for p in range(1, 50))
    assert direct == exact, (direct, exact)
    gaps = F(48, 5)
    assert gaps + 1 == exact, (gaps, exact)

    def play():
        deck = DECK[:]
        random.shuffle(deck)
        return deck.index(1) + 1
    sim = mc_mean(play, 20000)
    assert abs(sim - float(exact)) < 0.2, (sim, float(exact))
    return {
        "number": float(exact),
        "value": "%.1f" % float(exact),
        "notes": "E[first ace] = sum_k C(48,k)/C(52,k) = %s = %.3f; the four "
                 "aces cut 48 cards into five equal gaps of %s; MC(20k) %.3f" % (
                     exact, float(exact), gaps, sim),
    }


def check_js_fair_scan(q, data):
    pairs = [(a, b) for a in range(1, 7) for b in range(1, 7)]
    worth = {
        "pips": (F(7, 2), F(4)),
        "larger": (F(sum(max(a, b) for a, b in pairs), 36), F(4)),
        "six": (F(12, 6), F(2)),
        "total": (F(sum(a + b for a, b in pairs), 36), F(8)),
    }
    assert worth["larger"][0] == F(161, 36), worth["larger"][0]
    assert worth["total"][0] == 7
    edges = {k: v - price for k, (v, price) in worth.items()}
    assert edges["six"] == 0, edges["six"]
    positive = [k for k, e in edges.items() if e > 0]
    assert positive == ["larger"], positive
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(worth), (ids, list(worth))
    sim = mc_mean(lambda: max(random.randint(1, 6), random.randint(1, 6)), 20000)
    assert abs(sim - float(worth["larger"][0])) < 0.05, sim
    return {
        "region": positive[0],
        "value": "larger of two",
        "notes": "value minus price: " + "; ".join(
            "%s %s-%s=%s" % (k, worth[k][0], worth[k][1], edges[k])
            for k in ("pips", "larger", "six", "total")) +
            "; MC(20k) larger-of-two %.3f" % sim,
    }


# ---------------------------------------------------------------------------
# the Citadel set
# ---------------------------------------------------------------------------

def check_cit_recovery(q, data):
    left = F(6, 10)
    needed = (1 - left) / left
    assert needed == F(2, 3), needed
    pct = float(needed) * 100
    assert abs(left * (1 + needed) - 1) < 1e-12
    half = (1 - F(1, 2)) / F(1, 2)
    ninety = (1 - F(1, 10)) / F(1, 10)
    assert half == 1 and ninety == 9, (half, ninety)   # the explanation's examples
    return {
        "number": pct,
        "value": "%.1f" % pct,
        "notes": "0.6 left after a 40%% fall, so it must multiply by 1/0.6: a "
                 "gain of %s = %.4f%%; a half needs +100%%, ninety percent "
                 "needs +900%%" % (needed, pct),
    }


def check_cit_same_average(q, data):
    a = F(2) * F(1, 2)
    b = F(5, 4) * F(5, 4)
    assert a == 1, a
    assert b == F(25, 16), b
    avg_a = (F(1) + F(-1, 2)) / 2
    avg_b = (F(1, 4) + F(1, 4)) / 2
    assert avg_a == avg_b == F(1, 4), (avg_a, avg_b)   # same average, both 25%
    assert abs(float(b) - 1.5625) < 1e-12
    return {
        "choice": only_choice(q, "exactly where it started"),
        "value": "unchanged",
        "notes": "A: 2 x 0.5 = %s (unchanged); B: 1.25 x 1.25 = %s (+56.25%%); "
                 "the average yearly return of both is %s" % (a, b, avg_a),
    }


def check_cit_median_vs_mean(q, data):
    up, down, years = F(3, 2), F(3, 5), 20
    mean = 100 * ((up + down) / 2) ** years
    median = 100 * (up ** 10) * (down ** 10)
    assert (up + down) / 2 == F(21, 20), (up + down) / 2       # +5% a year on average
    assert median == 100 * (F(9, 10) ** 10), median
    assert abs(float(median) - 34.8678) < 1e-3, float(median)
    assert abs(float(mean) - 265.33) < 0.01, float(mean)
    got = nearest_choice(q, float(median))
    assert first_number(got) < first_number(nearest_choice(q, float(mean)))

    def play():
        pot = 100.0
        for _ in range(years):
            pot *= 1.5 if random.random() < 0.5 else 0.6
        return pot
    sample = sorted(play() for _ in range(4000))
    sim_median = (sample[1999] + sample[2000]) / 2
    assert abs(sim_median - float(median)) < 8, (sim_median, float(median))
    return {
        "choice": got,
        "value": "about £%d" % round(float(median)),
        "notes": "median run = ten ups and ten downs = 100 x 0.9^10 = %.3f, "
                 "while the mean over all runs is 100 x 1.05^20 = %.2f; "
                 "MC(4k) median %.2f" % (float(median), float(mean), sim_median),
    }


def check_cit_correlation_r2(q, data):
    r = 0.7
    explained = r * r
    assert abs(explained - 0.49) < 1e-9
    candidates = {"a third": 1 / 3.0, "half": 0.5, "seven tenths": 0.7,
                  "Nearly all": 0.95}
    best = min(candidates, key=lambda k: abs(candidates[k] - explained))
    assert best == "half", (best, explained)
    gaps = sorted(abs(v - explained) for v in candidates.values())
    assert gaps[0] < gaps[1] - 0.05, gaps
    assert abs(0.5 * 0.5 - 0.25) < 1e-9                # the explanation's aside
    return {
        "choice": only_choice(q, best),
        "value": "about half",
        "notes": "share of the variation explained is 0.7 x 0.7 = %.2f, nearest "
                 "to a half (a third %.3f, seven tenths %.3f); a correlation of "
                 "0.5 explains 0.25" % (explained, 1 / 3.0, 0.7),
    }


def check_cit_cloud_order(q, data):
    clouds = _premium_data(data)["clouds"]
    rs = {}
    for name, pts in clouds.items():
        assert len(pts) >= 40, (name, len(pts))
        rs[name] = _pearson([p[0] for p in pts], [p[1] for p in pts])
    order = sorted(rs, key=lambda k: rs[k])
    vals = [rs[k] for k in order]
    for lo, hi in zip(vals, vals[1:]):
        assert hi - lo > 0.15, (lo, hi)                # no two are close enough to argue
    assert min(vals) > 0 and max(vals) < 1
    items = ["Cloud %s" % name for name in order]
    assert set(items) == set(q["items"]), (items, q["items"])
    return {
        "order": items,
        "value": ", ".join(order),
        "notes": "correlations recomputed from vizData: " + ", ".join(
            "%s %.3f" % (k, rs[k]) for k in order),
    }


def check_cit_diversify(q, data):
    single, n = 20.0, 10
    combined = single / math.sqrt(n)
    assert abs(combined - 6.3246) < 1e-3, combined

    def play():
        rets = [random.gauss(5.0, single) for _ in range(n)]
        return sum(rets) / n
    sample = [play() for _ in range(20000)]
    mean = sum(sample) / len(sample)
    var = sum((x - mean) ** 2 for x in sample) / (len(sample) - 1)
    sim = math.sqrt(var)
    assert abs(sim - combined) < 0.25, (sim, combined)
    assert abs(mean - 5.0) < 0.25, mean                # the average is untouched
    return {
        "number": combined,
        "value": "%.1f" % combined,
        "notes": "independent strategies: swings fall by sqrt(n), 20/sqrt(10) = "
                 "%.4f; MC(20k) sd %.3f with mean %.2f (unchanged)" % (
                     combined, sim, mean),
    }


def check_cit_correlated_floor(q, data):
    single, rho = 20.0, 0.5

    def swings(n):
        return single * math.sqrt(rho + (1 - rho) / n)

    floor = single * math.sqrt(rho)
    assert abs(swings(10) - 14.832) < 1e-3, swings(10)
    assert abs(swings(1000) - 14.149) < 1e-3, swings(1000)
    assert abs(floor - 14.142) < 1e-3, floor
    assert swings(1000) > 0.7 * single                 # nowhere near "washed away"
    assert swings(1000) < swings(50) + 1e-9
    assert swings(50) - floor < 0.15
    washed_away = swings(1000) < 0.15 * single
    assert washed_away is False

    def play(n):
        common = random.gauss(0, math.sqrt(rho))
        own = [random.gauss(0, math.sqrt(1 - rho)) for _ in range(n)]
        return single * (common + sum(own) / n)
    sample = [play(50) for _ in range(20000)]
    mean = sum(sample) / len(sample)
    sim = math.sqrt(sum((x - mean) ** 2 for x in sample) / (len(sample) - 1))
    assert abs(sim - swings(50)) < 0.4, (sim, swings(50))
    return {
        "bool": bool(washed_away),
        "value": "false",
        "notes": "with every pair correlated 0.5: 10 strategies swing %.3f, 50 "
                 "swing %.3f, 1000 swing %.3f, and the floor is 20*sqrt(0.5) = "
                 "%.3f — never below seven tenths of one strategy; MC(20k, n=50)"
                 " sd %.3f" % (swings(10), swings(50), swings(1000), floor, sim),
    }


def check_cit_track_record(q, data):
    edge, steady, wild, days_steady = 1000.0, 1000.0, 10000.0, 20
    # same confidence = same edge-to-noise ratio, and noise falls with sqrt(days)
    confidence = edge / (steady / math.sqrt(days_steady))
    days_wild = (wild / edge * confidence) ** 2 / 1.0
    days_wild = days_steady * (wild / steady) ** 2
    assert abs(days_wild - 2000) < 1e-9, days_wild
    assert abs(edge / (wild / math.sqrt(days_wild)) - confidence) < 1e-9
    assert abs(confidence - 4.472) < 1e-3, confidence
    got = nearest_choice(q, days_wild)
    return {
        "choice": got,
        "value": "about %s days" % "{:,}".format(int(round(days_wild))),
        "notes": "20 days of the steady trader gives an edge-to-noise ratio of "
                 "%.3f; ten times the swings needs a hundred times the days to "
                 "match it: %.0f" % (confidence, days_wild),
    }


def check_cit_ruin(q, data):
    p, start = F(3, 5), 5
    q_lose = 1 - p
    ratio = q_lose / p
    assert ratio == F(2, 3)
    ruin = ratio ** start
    assert ruin == F(32, 243), ruin
    got = float(ruin)
    assert abs(got - 0.13168) < 1e-4, got
    # finite-target cross-check: ruin before reaching £400 is the same to 6 dp
    big = 400
    finite = (ratio ** start - ratio ** big) / (1 - ratio ** big)
    assert abs(float(finite) - got) < 1e-9, (float(finite), got)
    assert abs(float(ratio ** 10) - 0.0173) < 1e-3     # the explanation's £10 figure

    candidates = {"About 1 in 100": 0.01, "About 1 in 8": 0.125,
                  "About 1 in 3": 1 / 3.0, "About half": 0.5}
    assert set(candidates) == set(q["choices"]), q["choices"]
    best = min(candidates, key=lambda k: abs(candidates[k] - got))
    assert best == "About 1 in 8", (best, got)

    def play():
        pot = start
        for _ in range(4000):
            pot += 1 if random.random() < 0.6 else -1
            if pot == 0:
                return True
            if pot >= 120:
                return False
        return False
    sim = mc_rate(play, 6000)
    assert abs(sim - got) < 0.02, (sim, got)
    return {
        "choice": best,
        "value": "about 1 in 8",
        "notes": "gambler's ruin with p=0.6 from a bank of 5: (0.4/0.6)^5 = %s "
                 "= %.5f; from 10 it is %.5f; MC(6k lifetimes) %.4f" % (
                     ruin, got, float(ratio ** 10), sim),
    }


def check_cit_losing_year(q, data):
    mean, sd = 10.0, 15.0
    p_loss = _phi((0 - mean) / sd)
    assert abs(p_loss - 0.2525) < 1e-3, p_loss
    assert abs(mean / sd - 0.6667) < 1e-3
    claim = abs(p_loss - 0.25) < 0.03                  # "roughly one year in four"
    assert claim is True
    assert abs(p_loss - 1 / 3.0) > 0.05                # and not one in three
    sim = mc_rate(lambda: random.gauss(mean, sd) < 0, 20000)
    assert abs(sim - p_loss) < 0.02, (sim, p_loss)
    return {
        "bool": bool(claim),
        "value": "true",
        "notes": "a losing year needs the wobble to fall %.4f standard "
                 "deviations below the average, which happens %.4f of the time "
                 "— one year in four (a quarter is 0.25, a third 0.333); "
                 "MC(20k) %.4f" % (mean / sd, p_loss, sim),
    }


def check_cit_accuracy_trap(q, data):
    fc = _premium_data(data)["forecast"]
    rained, brenda = fc["rained"], fc["brenda"]
    n = len(rained)
    assert n == 100 and len(brenda) == n
    alan = [0] * n                                     # he says dry every day
    dry_days = n - sum(rained)
    acc_alan = sum(1 for i in range(n) if alan[i] == rained[i])
    acc_brenda = sum(1 for i in range(n) if brenda[i] == rained[i])
    assert acc_alan == 70 and dry_days == 70, (acc_alan, dry_days)
    assert acc_brenda == 66, acc_brenda
    assert acc_alan > acc_brenda                       # the trap
    assert len(set(alan)) == 1                         # Alan never varies
    says_rain = [i for i in range(n) if brenda[i] == 1]
    says_dry = [i for i in range(n) if brenda[i] == 0]
    rate_rain = sum(rained[i] for i in says_rain) / float(len(says_rain))
    rate_dry = sum(rained[i] for i in says_dry) / float(len(says_dry))
    base = sum(rained) / float(n)
    assert abs(rate_rain - 0.45) < 1e-9, rate_rain
    assert abs(rate_dry - 0.20) < 1e-9, rate_dry
    assert rate_rain > base > rate_dry                 # Brenda separates the days
    assert acc_alan == dry_days                        # Alan scores the climate
    return {
        "choice": only_choice(q, "Brenda, even though"),
        "value": "Brenda",
        "notes": "Alan: constant 'dry', %d/100 right, exactly the %d dry days. "
                 "Brenda: %d/100 right, but it rains %.0f%% of the days she "
                 "calls rain and %.0f%% of the days she calls dry, against a "
                 "base rate of %.0f%%" % (acc_alan, dry_days, acc_brenda,
                                          rate_rain * 100, rate_dry * 100,
                                          base * 100),
    }


def check_cit_mix_tap(q, data):
    sa, sb, rho = 20.0, 30.0, -0.3

    def swings(w):
        return math.sqrt(w * w * sa * sa + (1 - w) ** 2 * sb * sb +
                         2 * w * (1 - w) * rho * sa * sb)

    mixes = {"all_a": 1.0, "mostly_a": 0.7, "half": 0.5, "all_b": 0.0}
    sds = {k: swings(w) for k, w in mixes.items()}
    assert abs(sds["all_a"] - 20) < 1e-9 and abs(sds["all_b"] - 30) < 1e-9
    assert abs(sds["mostly_a"] - 14.19) < 0.01, sds["mostly_a"]
    assert abs(sds["half"] - 15.33) < 0.01, sds["half"]
    best = strict_min(sds)
    assert best == "mostly_a", (best, sds)
    assert sds[best] < min(sa, sb)                     # steadier than either fund
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(mixes), (ids, list(mixes))
    # the true optimum sits near 0.65, so 70/30 is the closest mix on offer
    grid = {round(w, 3): swings(w) for w in [i / 200.0 for i in range(201)]}
    w_star = min(grid, key=lambda w: grid[w])
    assert abs(w_star - 0.65) < 0.02, w_star
    assert abs(mixes[best] - w_star) < abs(mixes["half"] - w_star)

    def play(w):
        za = random.gauss(0, 1)
        zb = rho * za + math.sqrt(1 - rho * rho) * random.gauss(0, 1)
        return w * sa * za + (1 - w) * sb * zb
    sample = [play(0.7) for _ in range(20000)]
    m = sum(sample) / len(sample)
    sim = math.sqrt(sum((x - m) ** 2 for x in sample) / (len(sample) - 1))
    assert abs(sim - sds["mostly_a"]) < 0.5, (sim, sds["mostly_a"])
    return {
        "region": best,
        "value": "70% A",
        "notes": "swings: " + ", ".join("%s %.2f" % (k, sds[k]) for k in
                                        ("all_a", "mostly_a", "half", "all_b")) +
                 "; the continuous minimum sits at %.2f in A; MC(20k) 70/30 "
                 "%.2f" % (w_star, sim),
    }


CHECKERS = {
    "js_three_rolls": check_js_three_rolls,
    "js_market_edge": check_js_market_edge,
    "js_next_card": check_js_next_card,
    "js_decline": check_js_decline,
    "js_red_stop": check_js_red_stop,
    "js_st_petersburg": check_js_st_petersburg,
    "js_coupon": check_js_coupon,
    "js_order_bets": check_js_order_bets,
    "js_two_cards": check_js_two_cards,
    "js_bust": check_js_bust,
    "js_first_ace": check_js_first_ace,
    "js_fair_scan": check_js_fair_scan,
    "cit_recovery": check_cit_recovery,
    "cit_same_average": check_cit_same_average,
    "cit_median_vs_mean": check_cit_median_vs_mean,
    "cit_correlation_r2": check_cit_correlation_r2,
    "cit_cloud_order": check_cit_cloud_order,
    "cit_diversify": check_cit_diversify,
    "cit_correlated_floor": check_cit_correlated_floor,
    "cit_track_record": check_cit_track_record,
    "cit_ruin": check_cit_ruin,
    "cit_losing_year": check_cit_losing_year,
    "cit_accuracy_trap": check_cit_accuracy_trap,
    "cit_mix_tap": check_cit_mix_tap,
}
