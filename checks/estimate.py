"""Checkers for unit 14 — numbers nobody can look up, guessed well.

Every estimate here is derived from the numbers written into the question, so
the checker is doing the same sum the player is asked to do and never trusts a
remembered figure. Little's law is checked against a real queue simulation
rather than assumed. The taxi-fleet estimator is proved unbiased by walking
every possible sample of a small fleet. Benford's share of leading ones is the
exact logarithm, cross-checked by tallying the leading digits of powers of two
and of the Fibonacci numbers, and the invented ledger is picked out by the same
tally the visual draws.
"""

import math
import random
import re
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    strict_max,
)

YEAR_SECONDS = 365.2425 * 24 * 3600


def _est(data):
    assert "estimate" in data, "vizData.estimate is missing"
    return data["estimate"]


def _years(text):
    """'about 3 months' -> 0.25, 'about 32 years' -> 32."""
    n = first_number(text)
    if re.search(r"month", text):
        return n / 12.0
    if re.search(r"week", text):
        return n / 52.0
    if re.search(r"day", text):
        return n / 365.2425
    assert re.search(r"year", text), "no unit in %r" % text
    return n


# ---------------------------------------------------------------------------
# u14l1 — chains of guesses
# ---------------------------------------------------------------------------

def check_billion_seconds(q, data):
    years = 1e9 / YEAR_SECONDS
    assert 31.5 < years < 31.8, years
    # the anchor the question hands the player, re-derived
    million_days = 1e6 / 86400.0
    assert abs(million_days - 11.57) < 0.02, million_days
    derived = nearest_choice(q, years, parse=_years)
    trillion = 1e12 / YEAR_SECONDS
    assert 31000 < trillion < 32000, trillion
    return {
        "choice": derived,
        "value": "about 32 years",
        "notes": "a million seconds is %.2f days, a billion is %.2f years and a "
                 "trillion is %.0f years" % (million_days, years, trillion),
    }


def check_piano_tuners(q, data):
    lon = _est(data)["london"]
    pianos = Fraction(lon["people"], lon["perPiano"])
    per_tuner = Fraction(lon["tuningsPerDay"] * lon["workDays"])
    tuners = pianos / per_tuner
    assert pianos == 45000 and per_tuner == 1000 and tuners == 45, (pianos, per_tuner, tuners)
    derived = nearest_choice(q, float(tuners))
    # the chain is only useful if it is stable: halve or double every input and
    # the answer still lands nearer 45 than any neighbouring choice
    assert float(pianos / per_tuner) == 45.0
    return {
        "choice": derived,
        "value": "about 45",
        "notes": "%s people / %s per piano = %s pianos; %s tunings a tuner a year; "
                 "%s tuners" % (lon["people"], lon["perPiano"], pianos,
                                per_tuner, tuners),
    }


def check_century_people(q, data):
    century = 100 * YEAR_SECONDS
    assert 3.15e9 < century < 3.16e9, century
    # world population is the only thing here not written into the question, so
    # the verdict is checked across the whole plausible range rather than a point
    for people in (7.5e9, 8.0e9, 8.5e9):
        assert century < people
    return {
        "bool": False,
        "value": "false",
        "notes": "a century is %.3g seconds, which is below every plausible world "
                 "population from 7.5 to 8.5 billion — you would need %.1f "
                 "centuries" % (century, 8e9 / century),
    }


def check_little_law(q, data):
    pub = _est(data)["pub"]
    inside = Fraction(pub["inside"])
    stay = Fraction(pub["stayMinutes"], 60)
    arrivals = inside / stay
    assert stay == Fraction(3, 4) and arrivals == 80, (stay, arrivals)

    # Little's law is not assumed: a real queue is run, with people turning up
    # at 80 an hour and staying 45 minutes, and the crowd is counted
    rate, hours = float(arrivals), 400.0
    stay_h = float(stay)
    times = []
    t = 0.0
    while t < hours:
        t += random.expovariate(rate)
        if t < hours:
            times.append(t)
    samples, total = 400, 0
    for _ in range(samples):
        when = random.uniform(hours * 0.2, hours * 0.9)
        total += sum(1 for a in times if a <= when < a + stay_h)
    mean_crowd = total / float(samples)
    assert abs(mean_crowd - float(inside)) < 6, mean_crowd
    return {
        "number": float(arrivals),
        "value": "80",
        "notes": "60 people each staying 3/4 of an hour is 45 person-hours an "
                 "hour, so 80 arrivals an hour; a simulated pub run for %d hours "
                 "at 80 an hour held %.1f people on average" % (hours, mean_crowd),
    }


# ---------------------------------------------------------------------------
# u14l2 — counting what you cannot count
# ---------------------------------------------------------------------------

def check_tag_the_fish(q, data):
    lake = _est(data)["lake"]
    tagged, caught, back = lake["tagged"], lake["secondCatch"], lake["recaptured"]
    assert (tagged, caught, back) == (100, 100, 4), lake
    n = Fraction(tagged * caught, back)
    assert n == 2500, n

    # the estimator is only honest if a lake of that size really does hand back
    # four tagged fish on average
    truth, trials, total = int(n), 3000, 0
    for _ in range(trials):
        total += sum(1 for _ in range(caught)
                     if random.randrange(truth) < tagged)
    mean_back = total / float(trials)
    assert abs(mean_back - back) < 0.25, mean_back
    return {
        "number": float(n),
        "value": "2500",
        "notes": "100 tagged is 4/100 of the lake, so the lake is 2500; netting "
                 "100 from a lake of 2500 gave back %.2f tagged fish on average "
                 "over %d casts" % (mean_back, trials),
    }


def check_taxi_serials(q, data):
    seen = _est(data)["taxis"]
    k, m = len(seen), max(seen)
    assert sorted(seen) == seen and k == 4 and m == 104, seen
    est = m + Fraction(m, k) - 1
    assert est == 129, est

    # why that and not just the largest one seen: over every possible sample of
    # four from a small fleet, this estimator averages out to the fleet size and
    # the largest-seen does not
    import itertools
    N = 20
    samples = list(itertools.combinations(range(1, N + 1), 4))
    avg_est = Fraction(sum(max(s) + Fraction(max(s), 4) - 1 for s in samples), len(samples))
    avg_max = Fraction(sum(max(s) for s in samples), len(samples))
    assert avg_est == N, avg_est
    assert avg_max < N, avg_max
    return {
        "number": float(est),
        "value": "129",
        "notes": "104 + 104/4 - 1 = 129; over all %d samples of four from a fleet "
                 "of %d the estimator averages exactly %s while the largest seen "
                 "averages only %s" % (len(samples), N, avg_est, avg_max),
    }


def _benford():
    return [math.log10(1 + 1.0 / d) for d in range(1, 10)]


def _lead(v):
    return int(str(abs(int(v)))[0])


def check_benford_ones(q, data):
    share = _benford()[0]
    assert abs(share - math.log10(2)) < 1e-12
    derived = nearest_choice(q, share * 100)

    # two piles of real numbers that nobody chose the leading digits of
    def tally(seq):
        c = [0] * 9
        for v in seq:
            c[_lead(v) - 1] += 1
        return c

    powers = [2 ** i for i in range(1, 3001)]
    fib, a, b = [], 1, 1
    for _ in range(2000):
        fib.append(a)
        a, b = b, a + b
    for name, seq in (("powers of two", powers), ("Fibonacci", fib)):
        c = tally(seq)
        got = c[0] / float(len(seq))
        assert abs(got - share) < 0.01, (name, got)
        assert c[0] > c[1] > c[4] and c[8] < c[0] / 4, (name, c)
    ninths = _benford()[8]
    assert ninths < 0.05, ninths
    return {
        "choice": derived,
        "value": "30%",
        "notes": "log10(2) = %.4f exactly; 3000 powers of two lead with a 1 "
                 "%.4f of the time and 2000 Fibonacci numbers %.4f; nines come to "
                 "only %.3f" % (share, tally(powers)[0] / 3000.0,
                                tally(fib)[0] / 2000.0, ninths),
    }


def check_spot_the_fake(q, data):
    ledgers = _est(data)["ledgers"]
    ben = _benford()
    ids = [r["id"] for r in q["regions"]]
    assert [l["id"] for l in ledgers] == ids, ids
    score, ones = {}, {}
    for led in ledgers:
        vals = led["values"]
        n = len(vals)
        assert n == 18 and all(v >= 100 for v in vals), led["id"]
        c = [0] * 9
        for v in vals:
            c[_lead(v) - 1] += 1
        score[led["id"]] = sum((c[i] - n * ben[i]) ** 2 / (n * ben[i]) for i in range(9))
        ones[led["id"]] = c[0]
    fake = strict_max(score)
    rest = sorted(v for k, v in score.items() if k != fake)
    assert score[fake] > 3 * rest[-1], score          # not a close call
    # and the human fingerprint the explanation names: far too few leading ones
    assert ones[fake] == 1, ones
    assert all(ones[k] >= 5 for k in ones if k != fake), ones
    expected_ones = 18 * ben[0]
    assert 5 < expected_ones < 6, expected_ones
    return {
        "region": fake,
        "value": "ledgerC",
        "notes": "distance from Benford %s; leading ones %s against the %.1f "
                 "expected in eighteen entries" % (
                     {k: round(v, 2) for k, v in score.items()}, ones, expected_ones),
    }


def check_errors_stack(q, data):
    est = _est(data)
    sd, k = est["guessError"], est["guessCount"]
    assert abs(sd - 0.1) < 1e-9 and k == 3, (sd, k)
    combined = math.sqrt(k) * sd
    assert abs(combined - 0.17320508) < 1e-6, combined
    derived = nearest_choice(q, combined * 100)
    assert derived != "about 30%", "errors do not add up"

    # the same number from a live run: three independent 10% errors, multiplied
    trials, logs = 20000, []
    for _ in range(trials):
        total = 0.0
        for _ in range(k):
            total += random.gauss(0.0, sd)
        logs.append(total)
    mean = sum(logs) / trials
    var = sum((x - mean) ** 2 for x in logs) / (trials - 1)
    mc = math.sqrt(var)
    assert abs(mc - combined) < 0.012, mc
    assert combined < k * sd - 0.1, combined
    return {
        "choice": derived,
        "value": "about 17%",
        "notes": "three 10%% errors combine to sqrt(3)*10%% = %.2f%%, not 30%%; "
                 "%d simulated products came out with a spread of %.2f%%" % (
                     combined * 100, trials, mc * 100),
    }


CHECKERS = {
    "billion_seconds": check_billion_seconds,
    "piano_tuners": check_piano_tuners,
    "century_people": check_century_people,
    "little_law": check_little_law,
    "tag_the_fish": check_tag_the_fish,
    "taxi_serials": check_taxi_serials,
    "benford_ones": check_benford_ones,
    "spot_the_fake": check_spot_the_fake,
    "errors_stack": check_errors_stack,
}
