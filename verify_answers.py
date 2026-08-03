#!/usr/bin/env python3
"""Independent correctness check for every question on the site.

Run:   python site/verify_answers.py          (stdlib only, no conda needed)
       python site/verify_answers.py -v       (show the working)

It reads site/js/questions.js — the same file the site plays from — and for each
question re-derives the answer from scratch here, exactly where an exact answer
exists (Fractions, or enumeration of every case) and by Monte Carlo where that
only cross-checks it. It then asserts that the derivation agrees with BOTH the
marked answer for that question's TYPE (a choice index, a boolean, a number and
its tolerance, an ordering, a tapped region) AND the canonical `answerValue`.
If a question's wording or numbers ever change, this fails loudly.

Every question in the bank must have a checker below; an unchecked question is a
failure, not a pass.

Each checker returns a dict of what it derived:
    {"choice": str} | {"bool": bool} | {"number": float} |
    {"order": [str]} | {"region": str}
plus "value" (the canonical string) and "notes" (the working, shown under -v).
main() decides which of those it needs by looking at q["type"].
"""

import importlib
import itertools
import json
import math
import os
import random
import re
import sys
import time
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
"""The bank the site plays from. QQ_BANK points the harness at a candidate bank
instead — how a new slice of questions gets checked before it is merged in."""
QUESTIONS_JS = os.environ.get("QQ_BANK") or os.path.join(HERE, "js", "questions.js")
CHECKS_DIR = os.path.join(HERE, "checks")
if HERE not in sys.path:
    sys.path.insert(0, HERE)

VERBOSE = "-v" in sys.argv or "--verbose" in sys.argv
SERIAL = "-j1" in sys.argv or "--serial" in sys.argv
ONLY = None
for _a in sys.argv[1:]:
    if _a.startswith("--only="):
        ONLY = set(_a.split("=", 1)[1].split(","))

"""Every question is seeded from its own id, so a Monte Carlo cross-check is
reproducible on its own and does not depend on what ran before it. Override the
run with QQ_SEED=<n> to prove no answer here is an accident of one seed."""
SEED = os.environ.get("QQ_SEED", "20260731")
random.seed(SEED)

TYPES = ("choice", "truefalse", "number", "order", "tap")


def load_bank():
    """Parse the pure-JSON payload out of questions.js."""
    with open(QUESTIONS_JS, "r", encoding="utf-8") as fh:
        src = fh.read()
    m = re.search(r"window\.QQ_DATA\s*=\s*(\{.*\});\s*$", src, re.S)
    if not m:
        raise SystemExit("could not find `window.QQ_DATA = {...};` in questions.js")
    return json.loads(m.group(1))


def all_questions(bank):
    """Every question the site can put in front of anyone, in play order:
    units -> lessons -> questions, and then every premium library set.

    A paid question is checked exactly as hard as a free one. Someone who has
    paid is the last person who should be shown a wrong answer."""
    out = []
    for unit in bank.get("units", []):
        for lesson in unit.get("lessons", []):
            for q in lesson.get("questions", []):
                out.append((unit["id"], lesson["id"], q))
    for lib in bank.get("libraries", []):
        for q in lib.get("questions", []):
            out.append((lib["id"], lib["id"], q))
    return out


def load_extra_checkers(into):
    """Pick up every checks/*.py module beside this file. Each one exports a
    CHECKERS dict; a question id claimed twice is a failure, not a merge."""
    if not os.path.isdir(CHECKS_DIR):
        return
    for name in sorted(os.listdir(CHECKS_DIR)):
        if not name.endswith(".py") or name.startswith("_"):
            continue
        mod = importlib.import_module("checks." + name[:-3])
        table = getattr(mod, "CHECKERS", None)
        if not isinstance(table, dict):
            raise SystemExit("checks/%s has no CHECKERS dict" % name)
        for qid, fn in table.items():
            if qid in into:
                raise SystemExit("two checkers for %r (checks/%s)" % (qid, name))
            into[qid] = fn


# ---------------------------------------------------------------------------
# small helpers shared by the checkers
# ---------------------------------------------------------------------------

def first_number(text):
    """The first number written in a choice, e.g. 'About 16' -> 16.0."""
    m = re.search(r"-?\d+(?:\.\d+)?", text)
    if m is None:
        raise AssertionError("no number in choice %r" % text)
    return float(m.group(0))


def nearest_choice(q, target, parse=first_number):
    """The offered choice closest to a number we derived, and it must be a
    strict winner — a tie would mean the question cannot be answered."""
    vals = [parse(c) for c in q["choices"]]
    gaps = sorted(abs(v - target) for v in vals)
    assert gaps[0] < gaps[1], "two choices are equally close to %r" % target
    return q["choices"][min(range(len(vals)), key=lambda i: abs(vals[i] - target))]


def only_choice(q, needle):
    """The single offered choice containing `needle` (case-insensitive)."""
    hits = [c for c in q["choices"] if needle.lower() in c.lower()]
    assert len(hits) == 1, "%d choices contain %r" % (len(hits), needle)
    return hits[0]


def fair_bits(n):
    """Number of heads in n fair flips, taken from real random bits."""
    heads, remaining = 0, n
    while remaining:
        k = min(63, remaining)
        heads += bin(random.getrandbits(k)).count("1")
        remaining -= k
    return heads


def polyfit(pts, deg):
    """Least-squares polynomial fit: normal equations solved by Gauss-Jordan
    with partial pivoting. Deliberately identical to QQViz.kit.polyfit in
    js/viz.js, so the site and this script cannot disagree."""
    n = deg + 1
    A = []
    for i in range(n):
        row = [sum(p[0] ** (i + j) for p in pts) for j in range(n)]
        row.append(sum(p[1] * p[0] ** i for p in pts))
        A.append(row)
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(A[r][c]))
        A[c], A[p] = A[p], A[c]
        if abs(A[c][c]) < 1e-14:
            continue
        for r in range(n):
            if r == c:
                continue
            f = A[r][c] / A[c][c]
            for k in range(c, n + 1):
                A[r][k] -= f * A[c][k]
    return [A[i][n] / A[i][i] if abs(A[i][i]) > 1e-14 else 0.0 for i in range(n)]


def polyval(co, x):
    return sum(c * x ** i for i, c in enumerate(co))


def mse(co, pts):
    return sum((polyval(co, x) - y) ** 2 for x, y in pts) / len(pts)


# ---------------------------------------------------------------------------
# unit 1 — chance, first look
# ---------------------------------------------------------------------------

def check_dice_difference(q, data):
    counts = {}
    for a in range(1, 7):
        for b in range(1, 7):
            d = abs(a - b)
            counts[d] = counts.get(d, 0) + 1
    assert sum(counts.values()) == 36
    assert counts == {0: 6, 1: 10, 2: 8, 3: 6, 4: 4, 5: 2}, counts
    best = max(counts, key=counts.get)
    assert sorted(counts.values())[-2] < counts[best], "no strict argmax"
    N = 120_000
    sim = {}
    for _ in range(N):
        d = abs(random.randrange(1, 7) - random.randrange(1, 7))
        sim[d] = sim.get(d, 0) + 1
    sim_best = max(sim, key=sim.get)
    assert sim_best == best, (sim_best, best)
    return {
        "choice": str(best),
        "value": str(best),
        "notes": "exact counts by difference %s; argmax=%d; MC(%d) argmax=%d" % (
            counts, best, N, sim_best),
    }


def check_dice_sum(q, data):
    counts = {}
    for a in range(1, 7):
        for b in range(1, 7):
            counts[a + b] = counts.get(a + b, 0) + 1
    assert sum(counts.values()) == 36
    assert counts == {2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
                      8: 5, 9: 4, 10: 3, 11: 2, 12: 1}, counts
    best = max(counts, key=counts.get)
    assert best == 7 and counts[7] == 6
    assert sorted(counts.values())[-2] < counts[best], "no strict argmax"
    N = 120_000
    sim = {}
    for _ in range(N):
        s = random.randrange(1, 7) + random.randrange(1, 7)
        sim[s] = sim.get(s, 0) + 1
    sim_best = max(sim, key=sim.get)
    assert sim_best == best, (sim_best, best)
    return {
        "choice": str(best),
        "value": str(best),
        "notes": "exact counts by total %s; argmax=%d (%d ways); MC(%d) argmax=%d" % (
            counts, best, counts[best], N, sim_best),
    }


def check_three_coins(q, data):
    triples = list(itertools.product("HT", repeat=3))
    assert len(triples) == 8
    two_heads = [t for t in triples if t.count("H") == 2]
    assert sorted("".join(t) for t in two_heads) == ["HHT", "HTH", "THH"]
    # the same count read the other way round: choose which coin is the tail
    assert len(two_heads) == math.comb(3, 2) == math.comb(3, 1)
    return {
        "number": len(two_heads),
        "value": str(len(two_heads)),
        "notes": "all 8 triples enumerated; exactly two heads in %s -> %d = C(3,2)" % (
            ["".join(t) for t in two_heads], len(two_heads)),
    }


def check_two_children(q, data):
    families = list(itertools.product("BG", repeat=2))
    assert len(families) == 4
    fits = [f for f in families if "G" in f]
    assert len(fits) == 3 and ("B", "B") not in fits
    both = [f for f in fits if f == ("G", "G")]
    exact = Fraction(len(both), len(fits))
    assert exact == Fraction(1, 3), exact
    N, kept, hit = 200_000, 0, 0
    for _ in range(N):
        f = (random.getrandbits(1), random.getrandbits(1))
        if 1 in f:                       # 1 == girl
            kept += 1
            hit += f == (1, 1)
    mc = hit / kept
    assert abs(mc - float(exact)) < 0.01, (mc, float(exact))
    derived = "1 in %d" % round(1 / float(exact))
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": "1/3",
        "notes": "families %s; 'at least one girl' leaves %d, of which 1 is GG -> %s; "
                 "MC(%d) = %.4f" % (["".join(f) for f in families], len(fits), exact, N, mc),
    }


def check_socks_dark(q, data):
    # pigeonhole, done by exhaustive search rather than by assertion: for each k,
    # can an adversary deal k socks from two colours with no matching pair?
    colours = ("black", "blue")
    stock = 10                                  # ten of each; k stays well under it

    def adversary_can_dodge(k):
        for draw in itertools.product(colours, repeat=k):
            if any(draw.count(c) > stock for c in colours):
                continue
            if all(draw.count(c) <= 1 for c in colours):
                return draw
        return None

    k = 1
    while adversary_can_dodge(k) is not None:
        k += 1
        assert k <= 6, "no k found"
    counterexample = adversary_can_dodge(k - 1)
    assert k == 3, k
    assert counterexample is not None, "k-1 should still be dodgeable"
    assert adversary_can_dodge(3) is None
    return {
        "number": k,
        "value": str(k),
        "notes": "k=2 has the counterexample %s (no pair); every one of the 2^3 "
                 "three-sock deals repeats a colour, so k=%d" % (list(counterexample), k),
    }


def check_birthday_23(q, data):
    def p_share(n):
        p = Fraction(1)
        for i in range(n):
            p *= Fraction(365 - i, 365)
        return 1 - p

    smallest = next(n for n in range(1, 366) if p_share(n) >= Fraction(1, 2))
    assert smallest == 23, smallest
    assert p_share(22) < Fraction(1, 2) <= p_share(23)
    assert abs(float(p_share(23)) - 0.5073) < 1e-3, float(p_share(23))
    N, hits = 60_000, 0
    for _ in range(N):
        seen = set()
        for _ in range(23):
            b = random.randrange(365)
            if b in seen:
                hits += 1
                break
            seen.add(b)
    mc = hits / N
    assert abs(mc - float(p_share(23))) < 0.02, (mc, float(p_share(23)))
    derived = "%d people" % smallest
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": str(smallest),
        "notes": "exact P(22)=%.4f < 0.5 <= P(23)=%.4f, and 23 is the smallest such n; "
                 "MC(%d) at n=23 = %.4f" % (
                     float(p_share(22)), float(p_share(23)), N, mc),
    }


def check_monty_hall(q, data):
    # exhaustive: car position x initial pick x (host's choice where he has one)
    stay_wins = switch_wins = cases = 0
    for car in range(3):
        for pick in range(3):
            opens = [d for d in range(3) if d != car and d != pick]
            for opened in opens:                # weight each host choice equally
                other = next(d for d in range(3) if d != pick and d != opened)
                w = Fraction(1, len(opens))
                cases += 1
                stay_wins += w * (pick == car)
                switch_wins += w * (other == car)
    total = Fraction(9)
    p_stay, p_switch = Fraction(stay_wins) / total, Fraction(switch_wins) / total
    assert p_stay == Fraction(1, 3), p_stay
    assert p_switch == Fraction(2, 3), p_switch
    assert p_stay + p_switch == 1
    N, sw, st = 100_000, 0, 0
    for _ in range(N):
        car, pick = random.randrange(3), random.randrange(3)
        opened = random.choice([d for d in range(3) if d != car and d != pick])
        other = next(d for d in range(3) if d != pick and d != opened)
        st += pick == car
        sw += other == car
    assert abs(sw / N - 2 / 3) < 0.01, sw / N
    assert abs(st / N - 1 / 3) < 0.01, st / N
    switchers = [c for c in q["choices"] if c.lower().startswith("switch")]
    assert len(switchers) == 2, switchers
    assert p_switch < 1, "switching does not win every time"
    derived = only_choice(q, "two times in three")
    assert derived in switchers
    return {
        "choice": derived,
        "value": "switch, 2/3",
        "notes": "exhaustive over %d car/pick/host cases: P(win|stay)=%s, "
                 "P(win|switch)=%s; MC(%d) stay=%.4f switch=%.4f" % (
                     cases, p_stay, p_switch, N, st / N, sw / N),
    }


def check_coin_streak(q, data):
    # exact: count length-100 sequences with NO run of 5 identical faces. Such a
    # sequence is a composition of 100 into run lengths 1..4, times 2 for the
    # face the first run uses.
    n, runmax = 100, 4
    comp = [0] * (n + 1)
    comp[0] = 1
    for m in range(1, n + 1):
        comp[m] = sum(comp[m - k] for k in range(1, runmax + 1) if m - k >= 0)
    no_run = 2 * comp[n]
    p = Fraction(2 ** n - no_run, 2 ** n)
    assert abs(float(p) - 0.9717) < 1e-3, float(p)
    assert p > Fraction(1, 2), "the statement claims more likely than not"
    N, hits = 40_000, 0
    for _ in range(N):
        bits = bin(random.getrandbits(n))[2:].rjust(n, "0")
        if "00000" in bits or "11111" in bits:
            hits += 1
    mc = hits / N
    assert abs(mc - float(p)) < 0.01, (mc, float(p))
    derived = bool(p > Fraction(1, 2))
    return {
        "bool": derived,
        "value": "true" if derived else "false",
        "notes": "exact DP: %d of 2^100 sequences have no run of 5, so "
                 "P(run>=5) = %.6f; MC(%d) = %.4f" % (no_run, float(p), N, mc),
    }


def check_hh_vs_ht(q, data):
    # Exact expected waiting times by first-step analysis.
    # states: 0 = no progress, 1 = seen a head
    #   e0 = 1 + 1/2 e1 + 1/2 e0                       (a tail keeps you at 0)
    #   HH: e1 = 1 + 1/2*0 + 1/2 e0   (a tail throws the progress away)
    #   HT: e1 = 1 + 1/2*0 + 1/2 e1   (another head keeps you one step in)
    def solve(same_pattern):
        if same_pattern:                       # HH: e1 = 1 + e0/2, e0 = 2 + e1
            e0 = Fraction(3) / (Fraction(1) - Fraction(1, 2))
            e1 = 1 + Fraction(1, 2) * e0
            assert e0 == 2 + e1
        else:                                   # HT: e1 = 1 + e1/2 -> 2
            e1 = Fraction(2)
            e0 = 2 + e1
            assert e1 == 1 + Fraction(1, 2) * e1
        return e0

    e_hh, e_ht = solve(True), solve(False)
    assert e_hh == 6 and e_ht == 4, (e_hh, e_ht)
    assert e_hh > e_ht

    def sim(target):
        N, tot = 60_000, 0
        for _ in range(N):
            flips, prev = 0, ""
            while True:
                c = "H" if random.getrandbits(1) else "T"
                flips += 1
                if prev + c == target:
                    break
                prev = c
            tot += flips
        return tot / N

    s_hh, s_ht = sim("HH"), sim("HT")
    assert abs(s_hh - 6) < 0.15, s_hh
    assert abs(s_ht - 4) < 0.15, s_ht
    assert s_hh > s_ht
    return {
        "choice": only_choice(q, "heads-heads"),
        "value": "heads-heads (6 flips vs 4)",
        "notes": "exact E[HH]=%s E[HT]=%s; MC(60k each) HH=%.3f HT=%.3f" % (
            e_hh, e_ht, s_hh, s_ht),
    }


def check_marble_after_red(q, data):
    balls = ("R1", "R2", "B1", "B2")
    kept = []
    red_second = []
    for first in balls:
        for second in balls:
            if second == first:
                continue
            if first.startswith("R"):
                kept.append((first, second))
                if second.startswith("R"):
                    red_second.append((first, second))
    exact = Fraction(len(red_second), len(kept))
    assert exact == Fraction(1, 3), exact
    return {
        "choice": only_choice(q, "1 in 3"),
        "value": "1/3",
        "notes": "ordered first/second draws after first red: %d cases, %d have red next -> %s" % (
            len(kept), len(red_second), exact),
    }


def check_gold_bag_position(q, data):
    tokens = ("G", "A", "B")                  # A and B are the two hidden grey tokens
    counts = [0, 0, 0]
    orders = list(itertools.permutations(tokens))
    for order in orders:
        counts[order.index("G")] += 1
    assert len(orders) == 6 and counts == [2, 2, 2], counts
    return {
        "choice": only_choice(q, "all three"),
        "value": "all three positions equally likely",
        "notes": "six hidden orders of G,A,B put gold in positions left/middle/right %s" % counts,
    }


def check_domino_double_six(q, data):
    tiles = [(a, b) for a in range(7) for b in range(a, 7)]
    doubles = [t for t in tiles if t[0] == t[1]]
    sixes = [t for t in tiles if 6 in t]
    assert len(tiles) == 28
    assert len(doubles) == len(sixes) == 7, (doubles, sixes)
    return {
        "choice": only_choice(q, "equally likely"),
        "value": "7 each out of 28",
        "notes": "double-six set enumerated: %d doubles and %d tiles containing six, out of %d" % (
            len(doubles), len(sixes), len(tiles)),
    }


def check_minute_neighbours(q, data):
    outcomes = [(a, b) for a in range(1, 6) for b in range(1, 6)]
    same = [p for p in outcomes if p[0] == p[1]]
    apart = [p for p in outcomes if abs(p[0] - p[1]) == 1]
    assert len(outcomes) == 25
    assert len(same) == 5 and len(apart) == 8, (same, apart)
    assert len(apart) > len(same)
    return {
        "choice": only_choice(q, "one minute apart"),
        "value": "one minute apart (8 ways vs 5)",
        "notes": "ordered minute pairs: same=%d, one-apart=%d, total=%d" % (
            len(same), len(apart), len(outcomes)),
    }


def check_random_day_month(q, data):
    lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    long_days = sum(d for d in lengths if d == 31)
    short_days = sum(d for d in lengths if d != 31)
    assert sum(lengths) == 365
    assert long_days == 217 and short_days == 148, (long_days, short_days)
    assert Fraction(long_days, 365) > Fraction(1, 2)
    return {
        "choice": only_choice(q, "31-day"),
        "value": "31-day month (217 days vs 148)",
        "notes": "ordinary-year month lengths give %d days in 31-day months and %d shorter-month days" % (
            long_days, short_days),
    }


def check_balloon_letter(q, data):
    slots = list("BALLOON")
    hits = [i for i, ch in enumerate(slots, start=1) if ch == "O"]
    assert len(slots) == 7
    assert hits == [5, 6], hits
    return {
        "number": len(hits),
        "value": str(len(hits)),
        "notes": "seven letter slots enumerated from BALLOON; O appears in slots %s -> %d" % (
            hits, len(hits)),
    }


def check_pin_match_sum(q, data):
    pins = [(a, b) for a in range(10) for b in range(10)]
    matching = [p for p in pins if p[0] == p[1]]
    sum9 = [p for p in pins if p[0] + p[1] == 9]
    assert len(pins) == 100
    assert len(matching) == len(sum9) == 10, (matching, sum9)
    assert set(matching) != set(sum9), "different rules should tie, not match case-for-case"
    return {
        "choice": only_choice(q, "equally likely"),
        "value": "10 each out of 100",
        "notes": "two-digit PINs enumerated: matching digits=%d, digit sum 9=%d, total=%d" % (
            len(matching), len(sum9), len(pins)),
    }


def check_ace_in_two_draws(q, data):
    deck = ("A", "B1", "B2", "B3")
    deals = list(itertools.permutations(deck, 2))
    ace_first = [d for d in deals if d[0] == "A"]
    ace_seen = [d for d in deals if "A" in d]
    p_first = Fraction(len(ace_first), len(deals))
    p_seen = Fraction(len(ace_seen), len(deals))
    assert len(deals) == 12
    assert p_first == Fraction(1, 4), p_first
    assert p_seen == Fraction(1, 2), p_seen
    assert p_seen > p_first
    return {
        "choice": only_choice(q, "appears in your two cards"),
        "value": "ace in two cards (1/2 vs 1/4)",
        "notes": "ordered two-card deals from A,B1,B2,B3: ace first=%d/%d=%s; "
                 "ace in either drawn slot=%d/%d=%s" % (
                     len(ace_first), len(deals), p_first,
                     len(ace_seen), len(deals), p_seen),
    }


def check_traffic_light_time(q, data):
    seconds = list(range(60))
    counts = {
        "green": sum(1 for s in seconds if 0 <= s < 25),
        "amber": sum(1 for s in seconds if 25 <= s < 30),
        "red": sum(1 for s in seconds if 30 <= s < 60),
    }
    assert counts == {"green": 25, "amber": 5, "red": 30}, counts
    best = max(counts, key=counts.get)
    assert best == "red"
    assert sorted(counts.values())[-2] < counts[best], "no strict maximum"
    return {
        "choice": best,
        "value": "red (30 seconds out of 60)",
        "notes": "one-minute cycle enumerated by second: %s; strict max=%s" % (
            counts, best),
    }


def check_page_starts_ends_one(q, data):
    pages = list(range(1, 101))
    starts = [p for p in pages if str(p).startswith("1")]
    ends = [p for p in pages if str(p).endswith("1")]
    assert len(pages) == 100
    assert len(starts) == 12, starts
    assert len(ends) == 10, ends
    assert len(starts) > len(ends)
    return {
        "choice": only_choice(q, "starts with 1"),
        "value": "starts with 1 (12 pages vs 10)",
        "notes": "pages 1..100 enumerated: starts with 1=%d %s; ends with 1=%d %s" % (
            len(starts), starts, len(ends), ends),
    }


# ---------------------------------------------------------------------------
# unit 2 — numbers that lie
# ---------------------------------------------------------------------------

def check_coin_spread(q, data):
    n = 1000
    sd = math.sqrt(n) / 2.0                      # sd of (heads - n/2)
    mad = sd * math.sqrt(2 / math.pi)            # mean absolute deviation
    assert abs(sd - 15.811) < 0.01, sd
    assert abs(mad - 12.616) < 0.01, mad
    trials = 10_000
    tot = 0.0
    for _ in range(trials):
        tot += abs(fair_bits(n) - n / 2)
    mc = tot / trials
    assert abs(mc - mad) < 0.5, (mc, mad)
    # the nearest offered choice must be the marked one on BOTH readings
    by_sd = nearest_choice(q, sd)
    by_mad = nearest_choice(q, mad)
    assert by_sd == by_mad, (by_sd, by_mad)
    return {
        "choice": by_sd,
        "value": "about 16 (sd = 15.8)",
        "notes": "sd = sqrt(1000)/2 = %.2f; mean|dev| = %.2f; MC(%d sets of 1000 "
                 "real flips) mean|dev| = %.2f" % (sd, mad, trials, mc),
    }


def check_hospital_boys(q, data):
    # "more than 60%": 9/15 is exactly 60%, so the small hospital needs >= 10;
    # the big one needs >= 61 of 100.
    def tail(n, kmin):
        return Fraction(sum(math.comb(n, k) for k in range(kmin, n + 1)), 2 ** n)

    small_min = min(k for k in range(16) if Fraction(k, 15) > Fraction(3, 5))
    big_min = min(k for k in range(101) if Fraction(k, 100) > Fraction(3, 5))
    assert (small_min, big_min) == (10, 61), (small_min, big_min)
    p_small, p_big = tail(15, small_min), tail(100, big_min)
    assert p_small > p_big
    assert float(p_small) / float(p_big) > 5, float(p_small) / float(p_big)
    assert abs(float(p_small) - 0.1509) < 1e-3, float(p_small)
    assert abs(float(p_big) - 0.0176) < 1e-3, float(p_big)
    days, s_days, b_days = 100_000, 0, 0
    for _ in range(days):
        s_days += fair_bits(15) >= small_min
        b_days += fair_bits(100) >= big_min
    assert s_days > b_days
    assert abs(s_days / days - float(p_small)) < 0.01, s_days / days
    assert abs(b_days / days - float(p_big)) < 0.01, b_days / days
    return {
        "choice": only_choice(q, "small"),
        "value": "the small hospital",
        "notes": "exact: small needs >=%d of 15, P=%.4f; big needs >=%d of 100, "
                 "P=%.4f (%.1fx rarer); MC(%d days each) %.4f vs %.4f" % (
                     small_min, float(p_small), big_min, float(p_big),
                     float(p_small) / float(p_big), days,
                     s_days / days, b_days / days),
    }


def check_mean_vs_median(q, data):
    base = sorted(data["salaries"])
    assert len(base) == 9, base

    def mean(xs):
        return sum(xs) / len(xs)

    def median(xs):
        s = sorted(xs)
        m = len(s) // 2
        return s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2.0

    m0, d0 = mean(base), median(base)
    rich = base + [1_000_000]
    d_mean, d_med = abs(mean(rich) - m0), abs(median(rich) - d0)
    assert d_med > 0 or d_mean > 0
    assert d_mean > 100 * d_med, (d_mean, d_med)
    # sweep the outlier: the median's total travel stays bounded, the mean's does not
    sweep = [10 ** k for k in range(2, 11)]
    means = [mean(base + [x]) for x in sweep]
    meds = [median(base + [x]) for x in sweep]
    assert max(meds) - min(meds) <= 1.0, "median moved %r" % (max(meds) - min(meds))
    assert max(abs(v - d0) for v in meds) <= 1.5
    assert max(means) - min(means) > 1e8, "mean only spanned %r" % (
        max(means) - min(means))
    return {
        "choice": only_choice(q, "median"),
        "value": "the median",
        "notes": "mean %.2f -> %.2f (moves %.2f), median %.2f -> %.2f (moves %.2f), "
                 "ratio %.0fx; sweeping the outlier to 1e10 the median spans %.2f "
                 "while the mean spans %.3g" % (
                     m0, mean(rich), d_mean, d0, median(rich), d_med,
                     d_mean / d_med, max(meds) - min(meds), max(means) - min(means)),
    }


def check_order_likelihood(q, data):
    # read the head counts back out of the items, then order them ourselves
    ks = [int(re.search(r"\d+", it).group(0)) for it in q["items"]]
    assert len(set(ks)) == len(ks), ks
    by_k = dict(zip(ks, q["items"]))
    ways = {k: math.comb(10, k) for k in ks}
    assert ways == {10: 1, 8: 45, 6: 210, 5: 252}, ways
    ordered_ks = sorted(ks, key=lambda k: ways[k])
    counts = [ways[k] for k in ordered_ks]
    assert all(a < b for a, b in zip(counts, counts[1:])), counts
    assert sum(math.comb(10, k) for k in range(11)) == 1024
    return {
        "order": [by_k[k] for k in ordered_ks],
        "value": " < ".join(str(k) for k in ordered_ks) + " heads",
        "notes": "C(10,k) = %s, strictly increasing least-to-most-likely as %s" % (
            {k: ways[k] for k in ordered_ks}, ordered_ks),
    }


def check_faulty_bolt(q, data):
    pA, pB = Fraction(80, 100), Fraction(20, 100)
    fA, fB = Fraction(1, 100), Fraction(5, 100)
    post = (pB * fB) / (pA * fA + pB * fB)
    assert post == Fraction(5, 9), post
    pct = float(post) * 100
    # per-1000 population arithmetic, as the explanation states it
    assert 800 * 1 // 100 == 8 and 200 * 5 // 100 == 10
    assert Fraction(10, 18) == post
    N, faulty, fromB = 300_000, 0, 0
    for _ in range(N):
        b = random.random() < 0.2
        bad = random.random() < (0.05 if b else 0.01)
        if bad:
            faulty += 1
            fromB += b
    mc = fromB / faulty * 100
    assert abs(mc - pct) < 3.0, (mc, pct)
    return {
        "choice": nearest_choice(q, pct),
        "value": "10/18 = 55.6%",
        "notes": "exact 5/9 = %.2f%%; per-1000: 8 faulty from A, 10 from B, 10/18; "
                 "MC(%d) = %.2f%%" % (pct, N, mc),
    }


def check_base_rate_test(q, data):
    prev, sens, fpr = Fraction(1, 1000), Fraction(99, 100), Fraction(1, 100)
    post = (prev * sens) / (prev * sens + (1 - prev) * fpr)
    assert post == Fraction(11, 122), post
    pct = float(post) * 100
    assert abs(pct - 9.0164) < 1e-3, pct
    # the per-1000 story in the explanation
    assert abs(1 / (1 + 999 * 0.01) * 100 - 9.0) < 0.2
    N, pos, ill = 200_000, 0, 0
    for _ in range(N):
        sick = random.random() < float(prev)
        flagged = random.random() < (float(sens) if sick else float(fpr))
        if flagged:
            pos += 1
            ill += sick
    mc = ill / pos * 100
    assert abs(mc - pct) < 3.0, (mc, pct)
    return {
        "choice": nearest_choice(q, pct),
        "value": "about 9%",
        "notes": "exact P(ill|+) = 11/122 = %.4f%%; MC(%d) = %.2f%% over %d "
                 "positives" % (pct, N, mc, pos),
    }


def check_p_hacking(q, data):
    n, p = 20, Fraction(1, 20)
    exact = sum(k * math.comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n + 1))
    assert exact == Fraction(1), exact
    assert exact == n * p
    N, tot = 40_000, 0
    pf = float(p)
    for _ in range(N):
        tot += sum(1 for _ in range(n) if random.random() < pf)
    mc = tot / N
    assert abs(mc - float(exact)) < 0.03, (mc, float(exact))
    return {
        "number": float(exact),
        "value": "1",
        "notes": "E[Binomial(20, 1/20)] = sum k C(20,k) p^k q^(20-k) = %s = n*p; "
                 "MC(%d batches) mean = %.4f" % (exact, N, mc),
    }


def check_survivorship(q, data):
    holes = data["survivorshipHoles"]
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(holes), (ids, sorted(holes))
    least = min(holes, key=holes.get)
    others = sorted(v for k, v in holes.items() if k != least)
    assert holes[least] < others[0], "no strict minimum"
    assert least == "engines", least
    return {
        "region": least,
        "value": least,
        "notes": "holes counted on the planes that came back: %s; strict minimum is "
                 "%r with %d, so that is the unarmoured spot" % (
                     holes, least, holes[least]),
    }


# ---------------------------------------------------------------------------
# unit 3 — size, shape and growth
# ---------------------------------------------------------------------------

def check_rectangle_area(q, data):
    # perimeter 40 -> w + h = 20. maximise w*(20-w) over the offered shapes and
    # over a fine grid.
    def area(w):
        return w * (20 - w)

    offered = {}
    for c in q["choices"]:
        w, h = (int(x) for x in re.findall(r"\d+", c))
        assert 2 * (w + h) == 40, "%s is not a 40m perimeter" % c
        offered[c] = w
    best_label = max(offered, key=lambda k: area(offered[k]))
    areas = sorted(area(v) for v in offered.values())
    assert areas[-2] < areas[-1], "two shapes tie for the biggest area"
    grid_best = max((area(w / 1000.0), w / 1000.0) for w in range(1, 20000))
    assert abs(grid_best[1] - 10.0) < 1e-2, grid_best
    assert abs(grid_best[0] - 100.0) < 1e-3, grid_best
    return {
        "choice": best_label,
        "value": "10 by 10, area 100",
        "notes": "areas %s; continuous max at w=%.3f area=%.3f" % (
            {k: area(v) for k, v in offered.items()}, grid_best[1], grid_best[0]),
    }


def check_shear_area(q, data):
    # Shear (x, y) -> (x + k*y, y) applied to the unit square. Shoelace area for
    # many k, including big ones, must stay exactly 1.
    def shoelace(pts):
        s = 0.0
        for i in range(len(pts)):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % len(pts)]
            s += x1 * y2 - x2 * y1
        return abs(s) / 2.0

    square = [(0, 0), (1, 0), (1, 1), (0, 1)]
    worst = 0.0
    for _ in range(2000):
        k = random.uniform(-1000, 1000)
        sheared = [(x + k * y, y) for (x, y) in square]
        worst = max(worst, abs(shoelace(sheared) - 1.0))
    assert worst < 1e-9, worst
    for k in (-7, -1, 0, 0.5, 3, 1000):
        det = 1 * 1 - k * 0
        assert det == 1
    return {
        "choice": only_choice(q, "stays exactly the same"),
        "value": "unchanged",
        "notes": "shoelace area of the sheared unit square over 2000 random k in "
                 "[-1000,1000]: max deviation %.2e; det = 1 throughout" % worst,
    }


def check_pizza_size(q, data):
    one = math.pi * 6 ** 2
    two = 2 * math.pi * 4 ** 2
    assert abs(one - 113.10) < 0.01, one
    assert abs(two - 100.53) < 0.01, two
    assert one > two
    # break-even: pi (d/2)^2 = 2 pi 4^2  ->  d = 8*sqrt(2) = 11.31
    breakeven = 8 * math.sqrt(2)
    assert abs(math.pi * (breakeven / 2) ** 2 - two) < 1e-9
    assert abs(breakeven - 11.3137) < 1e-3, breakeven
    assert 12 > breakeven, "12 inches is not past the break-even"
    assert math.pi * (11.0 / 2) ** 2 < two, "11 inches should lose"
    return {
        "choice": only_choice(q, "12-inch"),
        "value": "the 12-inch (113 vs 101 sq in)",
        "notes": "areas: one 12-inch = %.2f sq in, two 8-inch = %.2f sq in; "
                 "break-even diameter = 8*sqrt(2) = %.4f in, and 12 is past it" % (
                     one, two, breakeven),
    }


def check_rope_earth(q, data):
    # gap = (C + 1)/(2 pi) - C/(2 pi) = 1/(2 pi), whatever the radius
    gap = 1.0 / (2 * math.pi)
    assert abs(gap - 0.15915) < 1e-5, gap
    radii = [0.033, 1.0, 6.371e6, 6.96e8]        # tennis ball ... a star
    for r in radii:
        c = 2 * math.pi * r
        r2 = (c + 1.0) / (2 * math.pi)
        assert abs((r2 - r) - gap) < 1e-9 * max(1.0, r), (r, r2 - r)
    lengths = {                                  # what each choice claims, in metres
        "Far too little to see": 0.0,
        "About the width of a hair": 1e-4,
        "About 16 centimetres": 0.16,
        "About 16 metres": 16.0,
    }
    assert set(lengths) == set(q["choices"]), sorted(q["choices"])
    derived = nearest_choice(q, gap, parse=lambda c: lengths[c])
    return {
        "choice": derived,
        "value": "1/(2π) m ≈ 16 cm",
        "notes": "gap = 1/(2pi) = %.5f m = %.2f cm, identical for radii %s "
                 "(tennis ball to star)" % (gap, gap * 100, radii),
    }


def check_doubling_paper(q, data):
    t = 0.0001                                    # 0.1 mm, in metres
    moon = 384_400_000.0                          # metres
    thick42 = t * 2 ** 42
    thick41 = t * 2 ** 41
    assert abs(thick42 / 1000 - 439804.65) < 0.01, thick42 / 1000
    assert abs(thick41 / 1000 - 219902.33) < 0.01, thick41 / 1000
    assert thick42 > moon, (thick42, moon)
    assert thick41 < moon, (thick41, moon)
    first = next(n for n in range(1, 100) if t * 2 ** n > moon)
    assert first == 42, first
    landmarks = {                                  # metres, in the order offered
        "About as tall as a person": 1.7,
        "About as tall as Everest": 8848.0,
        "Roughly to the edge of the atmosphere": 100_000.0,
        "Past the Moon": moon,
    }
    assert set(landmarks) == set(q["choices"]), sorted(q["choices"])
    passed = [c for c, h in landmarks.items() if thick42 > h]
    assert len(passed) == 4, passed                # it clears every landmark
    derived = max(landmarks, key=lambda c: landmarks[c])
    return {
        "choice": derived,
        "value": "440,000 km — past the Moon",
        "notes": "0.1mm * 2^42 = %.0f km; the Moon is %.0f km, and 41 folds gives "
                 "%.0f km, so 42 is the first fold past it" % (
                     thick42 / 1000, moon / 1000, thick41 / 1000),
    }


def check_pond_half(q, data):
    full = 30
    cover = {d: Fraction(2) ** (d - full) for d in range(1, full + 1)}
    assert cover[full] == 1
    halves = [d for d in cover if cover[d] == Fraction(1, 2)]
    assert halves == [29], halves
    assert cover[29] * 2 == cover[30]
    assert cover[25] == Fraction(1, 32) and float(cover[25]) < 0.04
    return {
        "number": halves[0],
        "value": str(halves[0]),
        "notes": "coverage(d) = 2^(d-30): day 29 is the unique day at exactly 1/2, "
                 "and day 25 is only %.2f%% covered" % (float(cover[25]) * 100),
    }


def check_compound_double(q, data):
    r = 0.06
    t = math.log(2) / math.log(1 + r)
    assert abs(t - 11.8957) < 1e-3, t
    assert (1 + r) ** 12 >= 2 > (1 + r) ** 11
    assert round(t) == 12, t
    assert abs(t - 12) <= q["tolerance"], (t, q["tolerance"])
    rule70 = 70 / (r * 100)
    assert abs(rule70 - t) < 0.5, (rule70, t)
    return {
        "number": t,
        "value": "12 years (11.9 exactly)",
        "notes": "1.06^t = 2 -> t = %.4f, nearest whole year 12 (off by %.3f, "
                 "inside the tolerance of %s); rule of 70 gives %.3f" % (
                     t, abs(t - 12), q["tolerance"], rule70),
    }


def check_random_walk(q, data):
    n = 100
    rms = math.sqrt(sum(math.comb(n, k) * (2 * k - n) ** 2 for k in range(n + 1)) / 2 ** n)
    mad = sum(math.comb(n, k) * abs(2 * k - n) for k in range(n + 1)) / 2 ** n
    assert abs(rms - 10.0) < 1e-9, rms
    assert abs(mad - 7.9589) < 1e-3, mad
    N, tot, sq = 40_000, 0.0, 0.0
    for _ in range(N):
        pos = 2 * fair_bits(n) - n
        tot += abs(pos)
        sq += pos * pos
    mc_mad, mc_rms = tot / N, math.sqrt(sq / N)
    assert abs(mc_mad - mad) < 0.2, (mc_mad, mad)
    assert abs(mc_rms - rms) < 0.3, (mc_rms, rms)
    by_rms = nearest_choice(q, rms)
    by_mad = nearest_choice(q, mad)
    assert by_rms == by_mad, (by_rms, by_mad)
    return {
        "choice": by_rms,
        "value": "about 10 m (sqrt of 100)",
        "notes": "exact RMS distance = %.4f and exact mean |distance| = %.4f (from "
                 "the binomial, no normal approximation); MC(%d) %.3f and %.3f" % (
                     rms, mad, N, mc_mad, mc_rms),
    }


# ---------------------------------------------------------------------------
# unit 4 — bets and machines
# ---------------------------------------------------------------------------

def check_twenty_questions(q, data):
    n = 1000
    lower = math.ceil(math.log2(n))
    assert lower == 10
    assert 2 ** 9 == 512 < n <= 1024 == 2 ** 10
    worst = 0
    for target in range(1, n + 1):
        lo, hi, asked = 1, n, 0
        while lo < hi:
            mid = (lo + hi) // 2
            asked += 1
            if target <= mid:
                hi = mid
            else:
                lo = mid + 1
        assert lo == target
        worst = max(worst, asked)
    assert worst == 10, worst
    return {
        "choice": str(worst),
        "value": str(worst),
        "notes": "information bound: 2^9=512 < 1000 <= 1024=2^10 so 10 are "
                 "necessary; binary search worst case over all 1000 targets = %d, "
                 "so 10 suffice" % worst,
    }


def check_kelly_fraction(q, data):
    p = 0.6

    def growth(f):
        if f >= 1:
            return float("-inf")
        return p * math.log(1 + f) + (1 - p) * math.log(1 - f)

    grid = max(range(0, 1000), key=lambda i: growth(i / 1000.0))
    f_grid = grid / 1000.0
    f_closed = 2 * p - 1
    assert abs(f_grid - f_closed) < 1e-3, (f_grid, f_closed)
    assert abs(f_closed - 0.20) < 1e-12, f_closed
    for other in (0.10, 0.30, 0.50):
        assert growth(f_closed) > growth(other), other
    assert growth(1.0) == float("-inf"), "betting everything is ruin"
    return {
        "number": f_closed * 100,
        "value": "20%",
        "notes": "argmax of 0.6 log(1+f) + 0.4 log(1-f): grid gives f=%.3f, closed "
                 "form 2p-1 gives f=%.3f; growth %.5f beats %.5f/%.5f/%.5f at "
                 "0.1/0.3/0.5, and f=1 is ruin" % (
                     f_grid, f_closed, growth(f_closed),
                     growth(0.10), growth(0.30), growth(0.50)),
    }


def check_dice_reroll(q, data):
    fresh = sum(Fraction(k) for k in range(1, 7)) / 6
    assert fresh == Fraction(7, 2)

    def value_of_threshold(t):
        """Keep the first roll iff it is >= t, else take a fresh roll."""
        return sum(Fraction(r) if r >= t else fresh for r in range(1, 7)) / 6

    best_t = max(range(1, 8), key=value_of_threshold)
    best = value_of_threshold(best_t)
    assert best_t == 4, best_t
    assert best == Fraction(17, 4) == Fraction(85, 20), best
    # the same number the way the explanation tells it
    assert (Fraction(5) + fresh) / 2 == best
    # 4 must be a strict optimum
    assert all(value_of_threshold(t) < best for t in range(1, 8) if t != 4)
    N, tot = 100_000, 0
    for _ in range(N):
        r = random.randrange(1, 7)
        tot += r if r >= best_t else random.randrange(1, 7)
    mc = tot / N
    assert abs(mc - float(best)) < 0.03, (mc, float(best))
    return {
        "number": float(best),
        "value": "4.25",
        "notes": "E[fresh roll] = 7/2, so reroll below it; every threshold rule "
                 "1..7 gives %s and t=%d wins with %s = %.2f; MC(%d) = %.4f" % (
                     [str(value_of_threshold(t)) for t in range(1, 8)],
                     best_t, best, float(best), N, mc),
    }


def check_overfit_degree(q, data):
    pf = data["polyFit"]
    train, test = pf["train"], pf["test"]
    assert len(train) == 10 and len(test) == 8
    fits = {}
    for d in pf["degrees"]:
        co = polyfit(train, d)
        fits[d] = (mse(co, train), mse(co, test))
    assert sorted(fits) == [1, 3, 9], sorted(fits)
    assert fits[9][0] < 1e-12, fits[9][0]              # memorises every point
    assert fits[9][0] < fits[3][0] < fits[1][0]        # training error only falls
    best = min(fits, key=lambda d: fits[d][1])
    assert best == 3, (best, fits)
    assert fits[3][1] < fits[1][1] and fits[3][1] < fits[9][1]
    assert pf["bestDegree"] == best, (pf["bestDegree"], best)
    labels = {1: "The straight line",
              3: "The gentle curve",
              9: "The wiggly one through every point"}
    assert set(labels.values()) <= set(q["choices"]), q["choices"]
    return {
        "choice": labels[best],
        "value": "the gentle curve (degree 3)",
        "notes": "least squares on 10 training points: " + "; ".join(
            "deg %d train %.3e test %.5f" % (d, fits[d][0], fits[d][1])
            for d in sorted(fits)) + " -> best test error at degree %d" % best,
    }


def check_gradient_valley(q, data):
    land = data["lossLandscape"]
    wells, bowl, start = land["wells"], land["bowl"], land["start"]

    def f(x):
        return bowl * x * x - sum(
            w["depth"] * math.exp(-((x - w["centre"]) ** 2) / w["width"]) for w in wells)

    def df(x):
        return 2 * bowl * x + sum(
            w["depth"] * math.exp(-((x - w["centre"]) ** 2) / w["width"])
            * (2 * (x - w["centre"]) / w["width"]) for w in wells)

    lo, hi, step = min(w["from"] for w in wells), max(w["to"] for w in wells), 1e-4
    n = int(round((hi - lo) / step))
    xs = [lo + i * step for i in range(n + 1)]
    ys = [f(x) for x in xs]
    minima = [(xs[i], ys[i]) for i in range(1, len(xs) - 1)
              if ys[i] < ys[i - 1] and ys[i] <= ys[i + 1]]
    assert len(minima) == 3, [round(m[0], 3) for m in minima]
    deepest = min(minima, key=lambda m: m[1])
    assert abs(deepest[0]) < 0.05, deepest        # the middle well is the deepest
    # each well's bracket holds exactly one of them
    holder = {}
    for w in wells:
        inside = [m for m in minima if w["from"] <= m[0] <= w["to"]]
        assert len(inside) == 1, (w["id"], inside)
        holder[w["id"]] = inside[0]
    assert abs(holder["middle"][1] - deepest[1]) < 1e-12, "middle is not deepest"
    # gradient descent from the arrow, small steps, until it stops moving
    x, lr = start, 0.005
    for _ in range(500_000):
        nx = x - lr * df(x)
        if abs(nx - x) < 1e-11:
            x = nx
            break
        x = nx
    resting = [w for w in wells if w["from"] <= x <= w["to"]]
    assert len(resting) == 1, (x, resting)
    landed = resting[0]["id"]
    assert landed == "left", (landed, x)
    assert landed != "middle", "the answer must not be the global minimum"
    assert abs(x - holder[landed][0]) < 1e-3, (x, holder[landed][0])
    return {
        "region": landed,
        "value": landed,
        "notes": "three local minima at %s; deepest is x=%.3f (f=%.4f) in the "
                 "middle well; descent from %.2f rests at x=%.4f, inside [%s, %s] "
                 "= %r" % (
                     [round(m[0], 3) for m in minima], deepest[0], deepest[1],
                     start, x, resting[0]["from"], resting[0]["to"], landed),
    }


CHECKERS = {
    "dice_difference": check_dice_difference,
    "dice_sum": check_dice_sum,
    "three_coins": check_three_coins,
    "two_children": check_two_children,
    "socks_dark": check_socks_dark,
    "birthday_23": check_birthday_23,
    "monty_hall": check_monty_hall,
    "coin_streak": check_coin_streak,
    "hh_vs_ht": check_hh_vs_ht,
    "marble_after_red": check_marble_after_red,
    "gold_bag_position": check_gold_bag_position,
    "domino_double_six": check_domino_double_six,
    "minute_neighbours": check_minute_neighbours,
    "random_day_month": check_random_day_month,
    "balloon_letter": check_balloon_letter,
    "pin_match_sum": check_pin_match_sum,
    "ace_in_two_draws": check_ace_in_two_draws,
    "traffic_light_time": check_traffic_light_time,
    "page_starts_ends_one": check_page_starts_ends_one,
    "coin_spread": check_coin_spread,
    "hospital_boys": check_hospital_boys,
    "mean_vs_median": check_mean_vs_median,
    "order_likelihood": check_order_likelihood,
    "faulty_bolt": check_faulty_bolt,
    "base_rate_test": check_base_rate_test,
    "p_hacking": check_p_hacking,
    "survivorship": check_survivorship,
    "rectangle_area": check_rectangle_area,
    "shear_area": check_shear_area,
    "pizza_size": check_pizza_size,
    "rope_earth": check_rope_earth,
    "doubling_paper": check_doubling_paper,
    "pond_half": check_pond_half,
    "compound_double": check_compound_double,
    "random_walk": check_random_walk,
    "twenty_questions": check_twenty_questions,
    "kelly_fraction": check_kelly_fraction,
    "dice_reroll": check_dice_reroll,
    "overfit_degree": check_overfit_degree,
    "gradient_valley": check_gradient_valley,
}

"""Everything past unit 4 — and every premium set — lives in checks/*.py, one
module per slice of the bank, merged in here at import time so the workers see
the same table. Splitting the file changes nothing about the rule: a question
with no checker fails the run."""
load_extra_checkers(CHECKERS)


# ---------------------------------------------------------------------------
# assertions the harness makes, per type
# ---------------------------------------------------------------------------

def assert_shape(q):
    """Structural checks every question must pass, whatever it derives to."""
    for field in ("id", "type", "topic", "prompt", "viz", "explain", "answerValue"):
        assert isinstance(q.get(field), str) and q[field].strip(), \
            "missing or empty %r" % field
    assert q["type"] in TYPES, "unknown type %r" % q["type"]

    if q["type"] == "choice":
        assert len(q["choices"]) >= 2, "needs at least two choices"
        assert len(set(q["choices"])) == len(q["choices"]), "duplicate choices"
        assert all(c.strip() for c in q["choices"]), "blank choice"
        assert isinstance(q["answer"], int) and 0 <= q["answer"] < len(q["choices"]), \
            "answer index %r out of range" % q.get("answer")
    elif q["type"] == "truefalse":
        assert isinstance(q.get("statement"), str) and q["statement"].strip(), \
            "truefalse needs a statement"
        assert isinstance(q.get("answerBool"), bool), "answerBool must be a boolean"
    elif q["type"] == "number":
        assert isinstance(q.get("answerNumber"), (int, float)) and \
            not isinstance(q["answerNumber"], bool), "answerNumber must be a number"
        assert "tolerance" in q, "number questions need a tolerance"
        assert isinstance(q["tolerance"], (int, float)) and q["tolerance"] >= 0, \
            "tolerance %r" % q["tolerance"]
    elif q["type"] == "order":
        assert len(q["items"]) >= 3, "order needs at least three items"
        assert len(set(q["items"])) == len(q["items"]), "duplicate items"
        assert all(it.strip() for it in q["items"]), "blank item"
    elif q["type"] == "tap":
        ids = [r["id"] for r in q["regions"]]
        assert len(ids) >= 2, "tap needs at least two regions"
        assert len(set(ids)) == len(ids), "duplicate region ids"
        assert all(r.get("label", "").strip() for r in q["regions"]), "blank label"
        assert q.get("answerRegion") in ids, \
            "answerRegion %r is not one of %s" % (q.get("answerRegion"), ids)


def assert_derived(q, got):
    """Match a checker's derivation against what the bank marks correct."""
    kind = q["type"]
    if kind == "choice":
        assert "choice" in got, "checker returned no choice text"
        marked = q["choices"][q["answer"]]
        assert got["choice"] in q["choices"], \
            "derived %r is not even on offer" % got["choice"]
        assert got["choice"] == marked, \
            "derived %r but the site marks %r" % (got["choice"], marked)
        shown = marked
    elif kind == "truefalse":
        assert "bool" in got, "checker returned no boolean"
        assert got["bool"] == q["answerBool"], \
            "derived %r but answerBool is %r" % (got["bool"], q["answerBool"])
        shown = "TRUE" if q["answerBool"] else "FALSE"
    elif kind == "number":
        assert "number" in got, "checker returned no number"
        gap = abs(float(got["number"]) - float(q["answerNumber"]))
        assert gap <= q["tolerance"] + 1e-12, \
            "derived %r but answerNumber is %r (gap %.6g > tolerance %r)" % (
                got["number"], q["answerNumber"], gap, q["tolerance"])
        shown = "%g" % q["answerNumber"]
    elif kind == "order":
        assert "order" in got, "checker returned no ordering"
        assert got["order"] == q["items"], \
            "derived order %r but items are %r" % (got["order"], q["items"])
        shown = " < ".join(q["items"])
    elif kind == "tap":
        assert "region" in got, "checker returned no region"
        ids = [r["id"] for r in q["regions"]]
        assert got["region"] in ids, "derived region %r is not in %s" % (
            got["region"], ids)
        assert got["region"] == q["answerRegion"], \
            "derived %r but answerRegion is %r" % (got["region"], q["answerRegion"])
        shown = q["answerRegion"]
    else:                                        # pragma: no cover - guarded above
        raise AssertionError("unknown type %r" % kind)

    assert got.get("value") == q["answerValue"], \
        "derived value %r but answerValue is %r" % (got.get("value"), q["answerValue"])
    return shown


def run_one(job):
    """Check one question, in this process or a worker. Never raises: it
    reports. Seeded from the question id so the result cannot depend on which
    other questions ran first, or on how many cores this machine has."""
    qid, q, data = job
    random.seed("%s|%s" % (qid, SEED))
    checker = CHECKERS.get(qid)
    if checker is None:
        return (qid, False, None, None,
                "NO CHECKER — every question must be verified here")
    try:
        assert_shape(q)
        got = checker(q, data)
        shown = assert_derived(q, got)
        return (qid, True, shown, got.get("notes", ""), None)
    except AssertionError as e:
        return (qid, False, None, None, str(e) or e.__class__.__name__)
    except Exception as e:                      # a broken checker is a failure
        return (qid, False, None, None, "%s: %s" % (e.__class__.__name__, e))


def main():
    started = time.time()
    bank = load_bank()
    rows = all_questions(bank)
    if not rows:
        raise SystemExit("no questions found under units[].lessons[].questions[]")
    data = bank.get("vizData", {})

    failures = []
    seen_ids = {}
    by_type = {}
    jobs, order = [], []
    for unit_id, lesson_id, q in rows:
        qid = q.get("id", "<no id>")
        by_type[q.get("type", "?")] = by_type.get(q.get("type", "?"), 0) + 1
        if qid in seen_ids:
            failures.append("%s: duplicate id (also in %s)" % (qid, seen_ids[qid]))
            print("FAIL  %-22s duplicate id" % qid)
            continue
        seen_ids[qid] = lesson_id
        if ONLY and qid not in ONLY:
            continue
        jobs.append((qid, q, data))
        order.append((qid, q))

    """Checkers are independent by construction — each one derives one answer
    and reseeds its own randomness — so they fan out across cores. One core is
    a flag away when a traceback matters more than the wall clock."""
    results = {}
    if SERIAL or len(jobs) < 8:
        for job in jobs:
            r = run_one(job)
            results[r[0]] = r
    else:
        try:
            from concurrent.futures import ProcessPoolExecutor
            workers = min(os.cpu_count() or 4, 12)
            with ProcessPoolExecutor(max_workers=workers) as pool:
                for r in pool.map(run_one, jobs, chunksize=2):
                    results[r[0]] = r
        except Exception as e:                  # any pool trouble: just do it here
            print("(parallel run unavailable: %s — falling back to one core)" % e)
            results = {}
            for job in jobs:
                r = run_one(job)
                results[r[0]] = r

    for qid, q in order:
        _, ok, shown, notes, err = results[qid]
        if ok:
            print("PASS  %-22s %-10s %s" % (qid, q["type"], shown))
            if VERBOSE:
                print("        %s" % notes)
        else:
            failures.append("%s: %s" % (qid, err))
            print("FAIL  %-22s %s" % (qid, err))

    # every checker must correspond to a live question
    for qid in CHECKERS:
        if qid not in seen_ids:
            failures.append("%s: checker with no question" % qid)

    print("-" * 66)
    breakdown = ", ".join("%s %d" % (t, by_type[t]) for t in TYPES if t in by_type)
    unknown = sorted(t for t in by_type if t not in TYPES)
    if unknown:
        breakdown += ", " + ", ".join("%s %d (UNKNOWN)" % (t, by_type[t]) for t in unknown)
    took = time.time() - started
    if failures:
        print("%d FAILURE(S) out of %d questions" % (len(failures), len(rows)))
        for f in failures:
            print("  - %s" % f)
        print("by type: %s" % breakdown)
        return 1
    free = sum(len(l.get("questions", []))
               for u in bank.get("units", []) for l in u.get("lessons", []))
    premium = sum(len(lib.get("questions", [])) for lib in bank.get("libraries", []))
    print("all %d questions verified in %.1fs — %d on the road, %d in the "
          "premium sets" % (len(rows), took, free, premium))
    print("by type: %s" % breakdown)
    warn_near_duplicates(bank)
    return 0


# ---------------------------------------------------------------------------
# novelty — a different property from correctness, and the one nothing checked
# ---------------------------------------------------------------------------
# Added 2026-08-03. On 2026-08-02 a new free question, `reroll_threshold`, was
# added to unit 6 and every check above passed it: the answer was right and
# independently derived. It was still a repeat — `dice_reroll` had taught the
# same insight in unit 4 all along, and both explanations literally said "a
# fresh roll averages 3.5, so keep a 4, 5 or 6". It was caught by eye, which is
# not a system.
#
# The video side has had "One idea, one video — no repeats" as an explicit rule
# since 2026-07-29. The road had no equivalent. This is it.
#
# A WARNING, NEVER A GATE. Overlapping words are evidence of a repeat, not proof
# of one: two genuinely different questions can share a setup (dice, coins, a
# queue) and the honest call needs a person. A gate that blocks a build on a
# guess costs more than it saves, so this prints and returns 0.
_STOP = set("""a an and are as at be been but by can do does for from get give given
had has have how if in into is it its many much no not of on one or our out over per
question same say see should so than that the their them then there these they this
those to two up was were what when where which who why will with would you your
what's it's average worth pounds pound tap which more less most least
""".split())


# House style writes numbers as words in the narration voice and as digits in
# the terse ones, so the SAME sentence appears as "a fresh roll averages 3.5"
# and "a fresh die roll averages three and a half". The first version of this
# detector compared bare words and scored that pair at zero — it missed the
# exact repeat it was written for. Numbers are normalised to digits first.
_NUMWORD = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
    "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
    "eleven": "11", "twelve": "12", "twenty": "20", "thirty": "30",
    "forty": "40", "fifty": "50", "hundred": "100", "thousand": "1000",
    "half": "0.5", "quarter": "0.25", "third": "0.33", "double": "2",
    "twice": "2", "dice": "die", "rolls": "roll", "rolled": "roll",
    "flips": "flip", "coins": "coin", "cards": "card", "numbers": "number",
}


def _content_words(text):
    t = (text or "").lower()
    t = re.sub(r"(\d)\s+and\s+a\s+half", r"\1.5", t)      # "3 and a half"
    words = re.findall(r"[a-z]+|\d+(?:\.\d+)?", t)
    out = set()
    for w in words:
        w = _NUMWORD.get(w, w)
        if w in _STOP:
            continue
        if len(w) > 2 or w.replace(".", "").isdigit():
            out.add(w)
    # "three and a half" -> 3 . 0.5 ; collapse it to the number it says
    if "3" in out and "0.5" in out:
        out.discard("0.5"); out.add("3.5")
    return out


def warn_near_duplicates(bank, threshold=0.33):
    """Threshold set by testing against the pair that motivated this, not by
    taste: dice_reroll ~ reroll_threshold scores 0.344 on their explanations,
    so anything above 0.34 misses the one real repeat we know about. At 0.33
    the live bank of 207 raises 6 flags — Monty variants, boy-girl variants,
    two gambler's-ruin questions — every one of which is worth a human glance
    and none of which is noise. Raise it and you stop catching repeats; lower
    it and the list stops being read."""
    qs = []
    for u in bank.get("units", []):
        for l in u.get("lessons", []):
            for q in l.get("questions", []):
                qs.append((q.get("id"), u.get("id"), q.get("prompt", ""),
                           q.get("explain", "")))
    hits = []
    for i in range(len(qs)):
        for j in range(i + 1, len(qs)):
            a, b = qs[i], qs[j]
            # The prompt says what is asked; the explanation says what is
            # TAUGHT. reroll_threshold and dice_reroll asked different things
            # and taught the same thing, so weight the explanation equally.
            for field, ai, bi in (("prompt", 2, 2), ("explain", 3, 3)):
                wa, wb = _content_words(a[ai]), _content_words(b[bi])
                if len(wa) < 5 or len(wb) < 5:
                    continue
                jac = len(wa & wb) / len(wa | wb)
                if jac >= threshold:
                    hits.append((jac, a[0], a[1], b[0], b[1], field))
                    break
    if not hits:
        return
    hits.sort(reverse=True)
    print("\n%d possible repeat(s) — SAME IDEA, not a wrong answer. Judge each "
          "by hand; this is a warning, not a failure:" % len(hits))
    for jac, aid, au, bid, bu, field in hits[:12]:
        print("  %.0f%% %s overlap:  %s (%s)  ~  %s (%s)"
              % (jac * 100, field, aid, au, bid, bu))


if __name__ == "__main__":
    sys.exit(main())
