"""Shared tools for the answer checkers.

site/verify_answers.py owns the harness and the unit-1..4 checkers. Every other
question's checker lives in a module beside this one and is picked up
automatically; each module must export a CHECKERS dict of {question_id: fn}.

A checker is  fn(q, data) -> dict  and must return exactly one of
    {"choice": <the choice text>}   for type "choice"
    {"bool": True/False}            for type "truefalse"
    {"number": <float>}             for type "number"
    {"order": [<items in order>]}   for type "order"
    {"region": <region id>}         for type "tap"
plus "value" (must equal the question's answerValue, character for character)
and "notes" (the working, printed under -v).

Rules, not suggestions:
  * DERIVE the answer here. Never read it out of `q` and hand it back.
  * Exact where an exact derivation exists (enumeration, Fraction, DP, closed
    form). Monte Carlo is a CROSS-CHECK, not the derivation, unless nothing
    exact is possible — and then say so in the notes.
  * Keep every Monte Carlo under ~30k trials. The whole suite has to stay fast.
  * The harness reseeds `random` per question, so a checker is reproducible on
    its own and does not depend on what ran before it.
"""

import math
import random
import re
from fractions import Fraction


# --------------------------------------------------------------- choices ---

def first_number(text):
    """The first number written in a choice, e.g. 'About 16' -> 16.0."""
    m = re.search(r"-?\d+(?:\.\d+)?", text.replace(",", ""))
    if m is None:
        raise AssertionError("no number in choice %r" % text)
    return float(m.group(0))


def nearest_choice(q, target, parse=first_number):
    """The offered choice closest to a number we derived. It must win outright;
    a tie means the question cannot be answered and that is a failure."""
    vals = [parse(c) for c in q["choices"]]
    gaps = sorted(abs(v - target) for v in vals)
    assert gaps[0] < gaps[1], "two choices are equally close to %r" % target
    return q["choices"][min(range(len(vals)), key=lambda i: abs(vals[i] - target))]


def only_choice(q, needle):
    """The single offered choice containing `needle` (case-insensitive)."""
    hits = [c for c in q["choices"] if needle.lower() in c.lower()]
    assert len(hits) == 1, "%d choices contain %r" % (len(hits), needle)
    return hits[0]


def choice_by(q, predicate):
    """The single offered choice satisfying a predicate."""
    hits = [c for c in q["choices"] if predicate(c)]
    assert len(hits) == 1, "%d choices match" % len(hits)
    return hits[0]


# ------------------------------------------------------------ randomness ---

def fair_bits(n):
    """Number of heads in n fair flips, taken from real random bits."""
    heads, remaining = 0, n
    while remaining:
        k = min(63, remaining)
        heads += bin(random.getrandbits(k)).count("1")
        remaining -= k
    return heads


def mc_mean(trial, n=20000):
    """Mean of n independent trials."""
    total = 0.0
    for _ in range(n):
        total += trial()
    return total / n


def mc_rate(trial, n=20000):
    """Proportion of n trials that come out true."""
    hits = 0
    for _ in range(n):
        hits += 1 if trial() else 0
    return hits / float(n)


def mc_argmax(trial, options, n=6000):
    """Which option wins on average, by simulating each of them."""
    scores = {o: mc_mean(lambda o=o: trial(o), n) for o in options}
    best = max(scores, key=scores.get)
    return best, scores


# -------------------------------------------------------------- counting ---

def binom_pmf(n, k, p=Fraction(1, 2)):
    """Exact binomial probability as a Fraction."""
    p = Fraction(p)
    return math.comb(n, k) * p ** k * (1 - p) ** (n - k)


def binom_tail(n, kmin, p=Fraction(1, 2)):
    """Exact P(X >= kmin) for Binomial(n, p)."""
    return sum(binom_pmf(n, k, p) for k in range(kmin, n + 1))


def expect(dist):
    """Expectation of {value: probability}, exactly."""
    return sum(Fraction(v) * Fraction(pr) for v, pr in dist.items())


def normalise(weights):
    """{outcome: weight} -> {outcome: exact probability}."""
    total = sum(Fraction(w) for w in weights.values())
    assert total > 0
    return {k: Fraction(w) / total for k, w in weights.items()}


def dice_space(n=2, sides=6):
    """Every ordered roll of n dice."""
    import itertools
    return list(itertools.product(range(1, sides + 1), repeat=n))


def close(a, b, tol):
    return abs(float(a) - float(b)) <= tol


def strict_max(mapping):
    """argmax of a dict, asserting the winner is strict."""
    best = max(mapping, key=mapping.get)
    rest = sorted(v for k, v in mapping.items() if k != best)
    assert not rest or rest[-1] < mapping[best], "no strict maximum in %r" % (mapping,)
    return best


def strict_min(mapping):
    best = min(mapping, key=mapping.get)
    rest = sorted(v for k, v in mapping.items() if k != best)
    assert not rest or rest[0] > mapping[best], "no strict minimum in %r" % (mapping,)
    return best
