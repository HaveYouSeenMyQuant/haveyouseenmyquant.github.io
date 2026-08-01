"""Checkers for unit 13 — what a yes or a no is worth.

Every answer here is counted rather than quoted. The 226 questions for a deck
come from finding the smallest power of two that clears 52 factorial, in exact
integers. The cleverest set of questions for four unequal suspects is found by
searching every way of splitting them, so no coding scheme is assumed. The
impossible compressor is a pigeonhole count. The broken lamp is found from the
three parity checks, and the code is first proved to be able to name any one of
the seven. The noisy wire is a binomial, and the squashed record is an entropy
with a real Huffman coder run on blocks to show the number is reachable.
"""

import heapq
import math
import random
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    strict_min,
)


def _info(data):
    assert "info" in data, "vizData.info is missing"
    return data["info"]


def _suspects(data):
    sus = _info(data)["suspects"]
    probs = {s["id"]: Fraction(s["num"], s["den"]) for s in sus}
    assert sum(probs.values()) == 1, probs
    return probs


def _best_cost(items, probs, memo=None):
    """Least expected number of yes-or-no questions to name which of `items` it
    is, searching every possible first split. Weights are un-normalised, so the
    result is a total cost, not an average."""
    if memo is None:
        memo = {}
    key = tuple(sorted(items))
    if key in memo:
        return memo[key]
    if len(key) <= 1:
        memo[key] = Fraction(0)
        return memo[key]
    total = sum(probs[i] for i in key)
    best = None
    n = len(key)
    for mask in range(1, 1 << (n - 1)):            # halve the search: side A holds key[0]
        left = tuple(key[i] for i in range(n) if mask >> i & 1)
        right = tuple(i for i in key if i not in left)
        if not left or not right:
            continue
        cost = total + _best_cost(left, probs, memo) + _best_cost(right, probs, memo)
        if best is None or cost < best:
            best = cost
    memo[key] = best
    return best


def _huffman_lengths(weights):
    """Code lengths from a real Huffman build — used to show a cost is
    reachable, never to define it."""
    pq = [(w, i) for i, w in enumerate(weights)]
    heapq.heapify(pq)
    depth = [0] * len(weights)
    groups = {i: [i] for i in range(len(weights))}
    nxt = len(weights)
    while len(pq) > 1:
        w1, i1 = heapq.heappop(pq)
        w2, i2 = heapq.heappop(pq)
        for m in groups[i1] + groups[i2]:
            depth[m] += 1
        groups[nxt] = groups[i1] + groups[i2]
        heapq.heappush(pq, (w1 + w2, nxt))
        nxt += 1
    return depth


# ---------------------------------------------------------------------------
# u13l1 — cutting the list in half
# ---------------------------------------------------------------------------

def check_deck_questions(q, data):
    n = data["markov"]["deck"] if "markov" in data else 52
    assert n == 52, n
    orders = math.factorial(n)
    k = 0
    while 2 ** k < orders:                          # smallest number of halvings
        k += 1
    assert k == 226, k
    assert 2 ** 225 < orders <= 2 ** 226
    assert 8e67 < orders < 8.1e67, orders
    derived = nearest_choice(q, k)
    # the choice that names the number of orders must NOT be the answer
    assert derived != "8 followed by 67 zeros"
    return {
        "choice": derived,
        "value": "226",
        "notes": "52! = %.3g; 2^225 falls short of it and 2^226 clears it, so 226 "
                 "halvings is the least that can name one order" % orders,
    }


def check_clever_questions(q, data):
    probs = _suspects(data)
    assert sorted(probs.values()) == [Fraction(1, 8), Fraction(1, 8),
                                      Fraction(1, 4), Fraction(1, 2)], probs
    best = _best_cost(tuple(probs), probs)
    assert best == Fraction(7, 4), best

    # Huffman reaches it, and so does the entropy — three routes, one number
    weights = [probs[k] for k in sorted(probs)]
    lengths = _huffman_lengths(weights)
    huff = sum(w * L for w, L in zip(weights, lengths))
    assert huff == best, (huff, best)
    entropy = -sum(float(w) * math.log2(float(w)) for w in weights)
    assert abs(entropy - float(best)) < 1e-12, entropy
    # splitting the list evenly instead costs a full 2
    even = 1 + _best_cost(('A', 'B'), probs) + _best_cost(('C', 'D'), probs)
    assert even == 2 > best, even
    return {
        "number": float(best),
        "value": "1.75",
        "notes": "search over every way of splitting the four: best is 7/4; a real "
                 "Huffman build gives lengths %s for the same 7/4, and the entropy "
                 "is %.6f. Splitting the list two-and-two costs %s." % (
                     lengths, entropy, even),
    }


def check_best_first_question(q, data):
    probs = _suspects(data)
    asked = {qq["id"]: tuple(qq["asks"]) for qq in _info(data)["questions"]}
    assert set(asked) == set(r["id"] for r in q["regions"]), asked
    cost = {}
    for qid, inside in asked.items():
        outside = tuple(s for s in probs if s not in inside)
        assert inside and outside, qid
        cost[qid] = 1 + _best_cost(inside, probs) + _best_cost(outside, probs)
    best = strict_min(cost)
    assert cost[best] == Fraction(7, 4) == _best_cost(tuple(probs), probs), cost
    # and it is the only offered question that splits the chances evenly
    splits = {qid: sum(probs[s] for s in inside) for qid, inside in asked.items()}
    assert splits[best] == Fraction(1, 2), splits
    assert [qid for qid, v in splits.items() if v == Fraction(1, 2)] == [best], splits
    return {
        "region": best,
        "value": "q_a",
        "notes": "expected questions after each opener %s; %r is the only one that "
                 "splits the chances in half (%s)" % (
                     {k: str(v) for k, v in cost.items()}, best,
                     {k: str(v) for k, v in splits.items()}),
    }


def check_no_free_lunch(q, data):
    """Pure counting: n-bit files number 2^n, and everything shorter than n bits
    numbers 2^n - 1 in total, so no scheme can shorten them all and stay
    reversible."""
    for n in range(1, 17):
        files = 2 ** n
        shorter = sum(2 ** k for k in range(n))     # lengths 0 .. n-1
        assert shorter == files - 1, (n, shorter, files)
        assert shorter < files
    # the same statement the other way round: try it and watch a clash appear
    n = 10
    used = {}
    clash = None
    for f in range(2 ** n):
        out = f >> 1                                # any shortening-by-one map
        if out in used:
            clash = (used[out], f, out)
            break
        used[out] = f
    assert clash is not None, "a shortening map with no clash would be a proof"
    return {
        "bool": True,
        "value": "true",
        "notes": "1024 ten-bit files against 1023 files shorter than ten bits; "
                 "any map that shortens them all must collide, and %d and %d both "
                 "land on %d in the first one tried" % clash,
    }


# ---------------------------------------------------------------------------
# u13l2 — getting it through
# ---------------------------------------------------------------------------

def check_hamming_find(q, data):
    ham = _info(data)["hamming"]
    rings = ham["rings"]
    lit = set(ham["lit"])
    lamps = sorted(set(l for r in rings for l in r["lamps"]))
    assert lamps == list(range(1, 8)), lamps
    assert lit <= set(lamps), lit

    # 1. the code can name any single lamp: every lamp sits in its own unique
    #    set of rings, and no lamp is in none of them
    sig = {l: tuple(1 if l in r["lamps"] else 0 for r in rings) for l in lamps}
    assert len(set(sig.values())) == len(lamps), sig
    assert all(any(s) for s in sig.values()), sig

    # 2. which rings come out odd
    bad = tuple(1 if len(set(r["lamps"]) & lit) % 2 else 0 for r in rings)
    assert any(bad), "nothing is wrong — the question has no answer"
    culprit = [l for l in lamps if sig[l] == bad]
    assert len(culprit) == 1, culprit
    region = "lamp%d" % culprit[0]
    ids = [r["id"] for r in q["regions"]]
    assert region in ids, (region, ids)

    # 3. and putting that lamp right leaves every ring even
    fixed = lit ^ {culprit[0]}
    assert all(len(set(r["lamps"]) & fixed) % 2 == 0 for r in rings), fixed
    return {
        "region": region,
        "value": "lamp6",
        "notes": "lit %s; ring parities %s (1 = odd); the only lamp with that "
                 "ring signature is %d, and flipping it back leaves all three "
                 "rings even" % (sorted(lit), bad, culprit[0]),
    }


def check_check_bits(q, data):
    m = _info(data)["message"]
    assert m == 16, m
    r = 0
    while 2 ** r < m + r + 1:                       # verdicts needed: all fine, or which bit
        r += 1
    assert r == 5, r
    assert 2 ** 4 < 16 + 4 + 1 and 2 ** 5 >= 16 + 5 + 1
    # the claim in the explanation, from the same rule
    big = 0
    while 2 ** big < 1000 + big + 1:
        big += 1
    assert big == 10, big
    return {
        "number": float(r),
        "value": "5",
        "notes": "with r checks the receiver can be told 2^r things and needs to "
                 "be told %d+r+1: four checks say 16 against 21 needed, five say "
                 "32 against 22. A thousand-bit message needs %d." % (m, big),
    }


def check_detect_vs_fix(q, data):
    """One parity bit over an n-bit word: flipping any single bit always changes
    the parity (so it is spotted) but the check has only two states, which is
    fewer than the n+1 verdicts needed to name the culprit."""
    n = 8
    for word in range(2 ** n):
        base = bin(word).count("1") % 2
        seen = set()
        for bit in range(n):
            flipped = word ^ (1 << bit)
            par = bin(flipped).count("1") % 2
            assert par != base, (word, bit)         # always detected
            seen.add(par)
        assert len(seen) == 1, seen                 # and always the same message
    verdicts_available, verdicts_needed = 2, n + 1
    assert verdicts_available < verdicts_needed
    return {
        "bool": True,
        "value": "true",
        "notes": "over all 256 eight-bit words, flipping any single bit always "
                 "flips the parity and always gives the same one bit of report: "
                 "2 possible verdicts against the %d needed to name a culprit" % (
                     verdicts_needed,),
    }


def check_repeat_three(q, data):
    inf = _info(data)
    p = Fraction(inf["wireNoise"]).limit_denominator(1000)
    copies = inf["copies"]
    assert p == Fraction(1, 10) and copies == 3, (p, copies)
    need = copies // 2 + 1
    wrong = sum(Fraction(math.comb(copies, k)) * p ** k * (1 - p) ** (copies - k)
                for k in range(need, copies + 1))
    assert wrong == Fraction(7, 250), wrong
    pct = float(wrong) * 100
    derived = nearest_choice(q, pct)
    assert float(wrong) < float(p) / 3, "the majority has to be a real improvement"

    trials, bad = 20000, 0
    for _ in range(trials):
        flips = sum(1 for _ in range(copies) if random.random() < float(p))
        bad += 1 if flips >= need else 0
    assert abs(bad / float(trials) - float(wrong)) < 0.006, bad / float(trials)
    return {
        "choice": derived,
        "value": "3%",
        "notes": "P(at least 2 of 3 flipped) = 7/250 = %.4f exactly; %d simulated "
                 "triples came out wrong %.4f of the time — a tripling of traffic "
                 "for a factor of %.1f" % (
                     float(wrong), trials, bad / float(trials), float(p / wrong)),
    }


def check_squash_the_record(q, data):
    coin = _info(data)["bentCoin"]
    p = coin["heads"]
    flips = coin["flips"]
    assert abs(p - 0.9) < 1e-9 and flips == 1000, (p, flips)
    h = -p * math.log2(p) - (1 - p) * math.log2(1 - p)
    total = h * flips
    assert abs(h - 0.4689955936) < 1e-9, h
    derived = nearest_choice(q, total)

    # reachable: run a real Huffman coder on blocks of flips and watch the cost
    # come down towards the entropy
    per_flip = {}
    for b in (1, 2, 4, 8):
        weights = []
        for k in range(2 ** b):
            ones = bin(k).count("1")
            weights.append(((1 - p) ** ones) * (p ** (b - ones)))
        lengths = _huffman_lengths(weights)
        per_flip[b] = sum(w * L for w, L in zip(weights, lengths)) / b
    assert per_flip[1] == 1.0, per_flip
    assert per_flip[2] > per_flip[4] > per_flip[8] > h, per_flip
    assert per_flip[8] - h < 0.01, per_flip
    return {
        "choice": derived,
        "value": "470",
        "notes": "entropy %.4f bits a flip, so %.0f bits for %d flips; a real "
                 "Huffman coder on blocks gets %.4f bits a flip at blocks of 4 and "
                 "%.4f at blocks of 8, closing on the entropy" % (
                     h, total, flips, per_flip[4], per_flip[8]),
    }


CHECKERS = {
    "deck_questions": check_deck_questions,
    "clever_questions": check_clever_questions,
    "best_first_question": check_best_first_question,
    "no_free_lunch": check_no_free_lunch,
    "hamming_find": check_hamming_find,
    "check_bits": check_check_bits,
    "detect_vs_fix": check_detect_vs_fix,
    "repeat_three": check_repeat_three,
    "squash_the_record": check_squash_the_record,
}
