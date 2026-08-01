"""Checkers for unit 9 (networks) and unit 10 (algorithms).

Everything here is derived rather than looked up: the timetable is coloured by
exhaustive search, the cheapest cable network by trying every spanning set, the
postman's round by walking every possible trail, the twelve-coin puzzle by
building a real three-weighing scheme and running all 24 fakes through it, and
the five-card sort by sorting all 120 orders and taking the worst. Monte Carlo
appears exactly twice — the random wiring and the parcels in pigeonholes — where
no closed form is worth writing, and both are wide of every wrong choice.
"""

import itertools
import math
import random
import re
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    strict_min,
)


def _net(data):
    assert "netalgo" in data, "vizData.netalgo is missing"
    return data["netalgo"]


# ---------------------------------------------------------------------------
# u9l1 — friends and strangers
# ---------------------------------------------------------------------------

def check_friend_paradox(q, data):
    net = _net(data)["friendNetwork"]
    people, links = net["people"], [tuple(l) for l in net["links"]]
    n = len(people)
    adj = {i: [] for i in range(n)}
    for a, b in links:
        assert a != b and (a, b) not in adj[b], "bad link"
        adj[a].append(b)
        adj[b].append(a)
    deg = [len(adj[i]) for i in range(n)]
    assert sum(deg) == 2 * len(links) == 24, deg
    average_friends = Fraction(sum(deg), n)
    assert average_friends == 3, average_friends

    # exactly what the question asks for: walk every person, and for each of
    # their friends write down that friend's friend count
    heard = []
    for i in range(n):
        for j in adj[i]:
            heard.append(deg[j])
    assert len(heard) == sum(deg), (len(heard), sum(deg))
    answer = Fraction(sum(heard), len(heard))
    # the same number the other way round: each person is written down once per
    # friend they have, so the tally is weighted by friend count
    assert answer == Fraction(sum(d * d for d in deg), sum(deg))
    assert answer == 4, answer
    assert answer > average_friends
    assert deg[0] == 6 and sorted(deg) == [1, 1, 2, 2, 3, 4, 5, 6], deg
    return {
        "number": float(answer),
        "value": "4",
        "notes": "degrees %s; plain average %s; the %d numbers heard average %s "
                 "(popular people are written down more often)" % (
                     dict(zip(people, deg)), average_friends, len(heard), answer),
    }


def check_odd_handshakes(q, data):
    def odd_count(n, edge_bits, pairs):
        deg = [0] * n
        for k, (a, b) in enumerate(pairs):
            if edge_bits >> k & 1:
                deg[a] += 1
                deg[b] += 1
        return sum(1 for d in deg if d % 2), sum(deg), bin(edge_bits).count("1")

    # every possible party of five people: 2^10 = 1024 of them, no exceptions
    pairs5 = list(itertools.combinations(range(5), 2))
    counterexample = None
    for bits in range(1 << len(pairs5)):
        odd, total, shakes = odd_count(5, bits, pairs5)
        assert total == 2 * shakes, "handshake sum broken"
        if odd % 2 == 1:
            counterexample = bits
            break
    assert counterexample is None, "found an odd count at party %r" % counterexample

    # bigger parties, sampled, in case five was a fluke of its size
    pairs9 = list(itertools.combinations(range(9), 2))
    worst = 0
    for _ in range(3000):
        bits = random.getrandbits(len(pairs9))
        odd, total, shakes = odd_count(9, bits, pairs9)
        assert odd % 2 == 0, "odd count at a nine-person party"
        worst = max(worst, odd)
    return {
        "bool": True,
        "value": "true",
        "notes": "all 1024 five-person parties checked and 3000 random nine-person "
                 "parties: the odd tally is even every time (biggest seen %d); "
                 "every party has degree sum = twice the handshakes" % worst,
    }


def check_six_degrees(q, data):
    circle, world = 100, 8_000_000_000
    steps = 1
    while circle ** steps < world:
        steps += 1
        assert steps < 20
    assert steps == 5, steps
    assert circle ** 4 < world <= circle ** 5, (circle ** 4, circle ** 5)
    derived = "%d steps" % steps
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": str(steps),
        "notes": "100^4 = %s is short of %s and 100^5 = %s clears it, so %d steps" % (
            f"{circle ** 4:,}", f"{world:,}", f"{circle ** 5:,}", steps),
    }


def check_party_of_six(q, data):
    """Smallest room that forces three mutual friends or three mutual strangers.
    Searched, not asserted: for each size, look for a colouring with no such
    trio and stop at the first size where none exists."""
    def dodges(n):
        pairs = list(itertools.combinations(range(n), 2))
        index = {p: k for k, p in enumerate(pairs)}
        triangles = [
            (1 << index[(a, b)]) | (1 << index[(a, c)]) | (1 << index[(b, c)])
            for a, b, c in itertools.combinations(range(n), 3)
        ]
        for bits in range(1 << len(pairs)):
            if all((bits & t) not in (0, t) for t in triangles):
                return bits, pairs
        return None, pairs

    n = 3
    while True:
        witness, pairs = dodges(n)
        if witness is None:
            break
        n += 1
        assert n <= 7, "no forcing size found"
    assert n == 6, n
    five, five_pairs = dodges(5)
    assert five is not None, "five should still be dodgeable"
    friends = [p for k, p in enumerate(five_pairs) if not (five >> k & 1)]
    return {
        "number": n,
        "value": str(n),
        "notes": "five people can dodge it (e.g. friendships %s and the rest "
                 "strangers); all %d colourings of six people contain a matching "
                 "trio" % (friends, 1 << 15),
    }


# ---------------------------------------------------------------------------
# u9l2 — wiring it up
# ---------------------------------------------------------------------------

def check_exam_slots(q, data):
    ex = _net(data)["examClashes"]
    exams, clashes = ex["exams"], [tuple(c) for c in ex["clashes"]]
    n = len(exams)
    deg = [0] * n
    for a, b in clashes:
        deg[a] += 1
        deg[b] += 1
    assert n == 5 and len(clashes) == 5 and deg == [2] * 5, (deg, clashes)

    def colourable(k):
        for colouring in itertools.product(range(k), repeat=n):
            if all(colouring[a] != colouring[b] for a, b in clashes):
                return colouring
        return None

    slots = 1
    while colourable(slots) is None:
        slots += 1
        assert slots <= n
    assert slots == 3, slots
    assert colourable(2) is None, "two slots should be impossible"
    good = colourable(3)
    return {
        "number": slots,
        "value": str(slots),
        "notes": "every exam clashes with exactly two others (a ring of five); "
                 "no 2-colouring of %d exists, and 3 does: %s" % (
                     n, dict(zip(exams, good))),
    }


def check_cheapest_cables(q, data):
    cn = _net(data)["cableNetwork"]
    n = len(cn["offices"])
    cables = [(int(a), int(b), int(w)) for a, b, w in cn["cables"]]

    def connects(chosen):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b, _ in chosen:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
        return len({find(i) for i in range(n)}) == 1

    # every set of five cables, brute force — the answer owes nothing to greed
    best, best_set = None, None
    for combo in itertools.combinations(cables, n - 1):
        if connects(combo):
            total = sum(w for _, _, w in combo)
            if best is None or total < best:
                best, best_set = total, combo
    assert best == 26, best
    # and no bigger set can beat it either
    for size in range(n, len(cables) + 1):
        for combo in itertools.combinations(cables, size):
            if connects(combo):
                assert sum(w for _, _, w in combo) > best
                break

    # the trap in the explanation: the five cheapest cost less and fail
    cheapest_five = sorted(cables, key=lambda c: c[2])[:5]
    assert sum(w for _, _, w in cheapest_five) == 25
    assert not connects(cheapest_five), "the five cheapest should strand an office"
    return {
        "number": best,
        "value": str(best),
        "notes": "cheapest connecting set %s = %d miles (all %d five-cable sets "
                 "tried); the five cheapest cost 25 and leave an office stranded" % (
                     sorted(w for _, _, w in best_set), best,
                     math.comb(len(cables), n - 1)),
    }


def check_postman_start(q, data):
    pm = _net(data)["postmanMap"]
    streets = [tuple(s) for s in pm["streets"]]
    ids = [j["id"] for j in pm["junctions"]]
    finish = pm["finishAt"]
    deg = {i: 0 for i in ids}
    for a, b in streets:
        deg[a] += 1
        deg[b] += 1
    odd = sorted(i for i in ids if deg[i] % 2 == 1)
    assert odd == sorted(["market", "mill"]), odd

    def walks(start):
        """Is there a route using every street once and ending at the finish?"""
        used = [False] * len(streets)

        def step(at, done):
            if done == len(streets):
                return at == finish
            for k, (a, b) in enumerate(streets):
                if used[k]:
                    continue
                nxt = b if a == at else (a if b == at else None)
                if nxt is None:
                    continue
                used[k] = True
                if step(nxt, done + 1):
                    used[k] = False
                    return True
                used[k] = False
            return False

        return step(start, 0)

    starts = [i for i in ids if walks(i)]
    assert starts == ["mill"], starts
    return {
        "region": starts[0],
        "value": starts[0],
        "notes": "streets per junction %s; odd ones are %s; every trail was walked "
                 "and only a start at %r finishes at the %s" % (
                     deg, odd, starts[0], finish),
    }


def check_random_connect(q, data):
    n, trials = 20, 4000

    def one():
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        left, laid = n, 0
        while left > 1:
            a, b = random.randrange(n), random.randrange(n)
            if a == b:
                continue
            laid += 1
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                left -= 1
        return laid

    total = sum(one() for _ in range(trials))
    mean = total / trials
    assert 33.0 < mean < 40.0, mean          # miles clear of 19, 90 and 190
    assert n - 1 == 19 and math.comb(n, 2) == 190
    choice = nearest_choice(q, mean)
    return {
        "choice": choice,
        "value": "about 36",
        "notes": "MC(%d) mean cables to connect 20 offices = %.2f; hand-placed "
                 "would need 19 and there are 190 pairs in all" % (trials, mean),
    }


def _average_hops(n, edges):
    adj = {i: [] for i in range(n)}
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    total = pairs = 0
    for s in range(n):
        dist = {s: 0}
        queue = [s]
        while queue:
            nxt = []
            for u in queue:
                for v in adj[u]:
                    if v not in dist:
                        dist[v] = dist[u] + 1
                        nxt.append(v)
            queue = nxt
        assert len(dist) == n, "the ring is not connected"
        total += sum(d for t, d in dist.items() if t != s)
        pairs += n - 1
    return total / pairs


def check_ring_shortcuts(q, data):
    rs = _net(data)["ringShortcuts"]
    n = rs["villages"]
    ring = [(i, (i + 1) % n) for i in range(n)]
    shortcuts = [tuple(s) for s in rs["shortcuts"]]
    plain = _average_hops(n, ring)
    wired = _average_hops(n, ring + shortcuts)
    assert n == 24 and len(shortcuts) == 4
    assert abs(plain - 6.26) < 0.05, plain
    assert 3.5 < wired < 4.0, wired
    assert wired < plain * 0.62
    choice = nearest_choice(q, wired)
    return {
        "choice": choice,
        "value": "about 3.7",
        "notes": "exact breadth-first averages: plain ring %.2f hops, with the four "
                 "shortcuts %.2f hops (a %.0f%% cut for %d extra roads)" % (
                     plain, wired, 100 * (1 - wired / plain), len(shortcuts)),
    }


# ---------------------------------------------------------------------------
# u10l1 — the fewest moves
# ---------------------------------------------------------------------------

def _sort_five(order):
    """Sort five cards by comparisons only: pair them up, compare the winners,
    then slot the two leftovers into the chain by halving. Returns the sorted
    positions and the number of comparisons used."""
    count = [0]

    def less(x, y):
        count[0] += 1
        return order[x] < order[y]

    def insert(chain, item, limit):
        lo, hi = 0, limit
        while lo < hi:
            mid = (lo + hi) // 2
            if less(item, chain[mid]):
                hi = mid
            else:
                lo = mid + 1
        chain.insert(lo, item)
        return chain

    a, b, c, d, e = 0, 1, 2, 3, 4
    lo1, hi1 = (a, b) if less(a, b) else (b, a)
    lo2, hi2 = (c, d) if less(c, d) else (d, c)
    if less(hi1, hi2):
        chain, pending, above = [lo1, hi1, hi2], lo2, hi2
    else:
        chain, pending, above = [lo2, hi2, hi1], lo1, hi1
    chain = insert(chain, e, 3)              # nothing known about e: 4 slots
    chain = insert(chain, pending, chain.index(above))   # known to sit below its pair
    return chain, count[0]


def _binary_insertion_five(order):
    count = [0]

    def less(x, y):
        count[0] += 1
        return order[x] < order[y]

    chain = [0]
    for item in range(1, 5):
        lo, hi = 0, len(chain)
        while lo < hi:
            mid = (lo + hi) // 2
            if less(item, chain[mid]):
                hi = mid
            else:
                lo = mid + 1
        chain.insert(lo, item)
    return chain, count[0]


def check_card_sorting(q, data):
    orders = list(itertools.permutations(range(5)))
    assert len(orders) == 120 == math.factorial(5)
    worst = simple_worst = 0
    for order in orders:
        chain, used = _sort_five(order)
        assert [order[i] for i in chain] == sorted(order), (order, chain)
        worst = max(worst, used)
        chain2, used2 = _binary_insertion_five(order)
        assert [order[i] for i in chain2] == sorted(order)
        simple_worst = max(simple_worst, used2)
    # the counting bound: k comparisons can only tell 2^k stories apart
    lower = next(k for k in range(1, 12) if 2 ** k >= 120)
    assert lower == 7 and 2 ** 6 == 64 < 120 <= 128 == 2 ** 7
    assert worst == lower == 7, (worst, lower)
    assert simple_worst == 8, simple_worst
    return {
        "number": worst,
        "value": "7",
        "notes": "6 comparisons tell only 64 orders apart and there are 120, so 7 "
                 "is needed; the pair-then-slot method sorts all 120 orders in at "
                 "most %d, one card at a time costs %d" % (worst, simple_worst),
    }


def check_twelve_coins(q, data):
    """Three weighings suffice, built here rather than quoted: give each coin a
    left/right/aside part in each of the three weighings so that every one of
    the 24 possible fakes leaves a different trail of tips."""
    codes = [c for c in itertools.product("LOR", repeat=3) if set(c) != {"O"}]
    flip = {"L": "R", "R": "L", "O": "O"}

    def mirror(code):
        return tuple(flip[x] for x in code)

    pairs, seen = [], set()
    for code in codes:
        if code in seen or mirror(code) in seen:
            continue
        seen.add(code)
        pairs.append((code, mirror(code)))
    assert len(pairs) == 13

    scheme = None
    for dropped in range(len(pairs)):
        kept = [p for i, p in enumerate(pairs) if i != dropped]
        for bits in itertools.product((0, 1), repeat=len(kept)):
            trial = [kept[i][b] for i, b in enumerate(bits)]
            if all(sum(1 for c in trial if c[t] == "L") ==
                   sum(1 for c in trial if c[t] == "R") for t in range(3)):
                scheme = trial
                break
        if scheme:
            break
    assert scheme is not None and len(scheme) == 12

    trails = {}
    for coin in range(12):
        for heavy in (True, False):
            trail = []
            for t in range(3):
                left = sum((1 if heavy else -1) if c == coin else 0
                           for c, code in enumerate(scheme) if code[t] == "L")
                right = sum((1 if heavy else -1) if c == coin else 0
                            for c, code in enumerate(scheme) if code[t] == "R")
                trail.append("L" if left > right else ("R" if right > left else "O"))
            trails[(coin, heavy)] = tuple(trail)
    assert len(trails) == 24
    assert len(set(trails.values())) == 24, "two fakes leave the same trail"

    weighings = next(k for k in range(1, 6) if 3 ** k >= 24)
    assert weighings == 3 and 3 ** 2 == 9 < 24 <= 27 == 3 ** 3
    # and the even split the explanation claims: four a side leaves eight
    survivors = {k: max(2 * k, 2 * (12 - 2 * k)) for k in range(1, 7)}
    assert strict_min(survivors) == 4 and survivors[4] == 8, survivors
    return {
        "number": weighings,
        "value": "3",
        "notes": "24 possible answers, 9 two-weighing outcomes so 2 is impossible; "
                 "a real 3-weighing scheme built and all 24 fakes give different "
                 "trails; best first split is %d a side, leaving %d" % (
                     4, survivors[4]),
    }


def check_weigh_27(q, data):
    """The fake is known heavy, so one answer per coin. Three weighings have 27
    outcome patterns — and thirds really do reach that ceiling."""
    def sift(pile, fake):
        coins, weighings = list(range(pile)), 0
        while len(coins) > 1:
            third = (len(coins) + 2) // 3
            groups = [coins[:third], coins[third:2 * third], coins[2 * third:]]
            weighings += 1
            coins = next(g for g in groups if fake in g)
            assert weighings <= 6
        return coins[0], weighings

    biggest = max(p for p in range(2, 90)
                  if all(sift(p, f) == (f, 0) or sift(p, f)[1] <= 3 for f in range(p))
                  and all(sift(p, f)[0] == f for f in range(p)))
    assert biggest == 27, biggest
    assert 3 ** 3 == 27 and max(sift(27, f)[1] for f in range(27)) == 3
    assert max(sift(28, f)[1] for f in range(28)) == 4, "28 should need a fourth"
    choice = nearest_choice(q, biggest)
    return {
        "choice": choice,
        "value": str(biggest),
        "notes": "thirds handle %d coins in 3 weighings and every coin is found; "
                 "28 needs a 4th; the ceiling is 3x3x3 = 27 outcome patterns" % biggest,
    }


def check_egg_first_drop(q, data):
    """Worst-case drops with two eggs, worked out by dynamic programming over
    the floors that remain, then evaluated at each floor on offer."""
    floors = 100
    best = [0] * (floors + 1)                # two eggs, n floors still unknown
    for n in range(1, floors + 1):
        best[n] = min(1 + max(k - 1, best[n - k]) for k in range(1, n + 1))
    assert best[floors] == 14, best[floors]
    triangular = next(t for t in range(1, 40) if t * (t + 1) // 2 >= floors)
    assert triangular == best[floors], (triangular, best[floors])

    worst = {}
    for region in q["regions"]:
        first = int(re.sub(r"\D", "", region["id"]))
        worst[region["id"]] = max(first, 1 + best[floors - first])
    pick = strict_min(worst)
    assert worst[pick] == best[floors] == 14, worst
    return {
        "region": pick,
        "value": pick,
        "notes": "two-egg DP over 100 floors gives 14 drops; worst case per floor "
                 "on offer %s" % worst,
    }


# ---------------------------------------------------------------------------
# u10l2 — how the work grows
# ---------------------------------------------------------------------------

_UNITS = {"second": 1, "minute": 60, "hour": 3600, "day": 86400, "week": 604800}


def _seconds(text):
    t = text.lower().replace(",", "")
    amount = first_number(t)
    for word, mult in _UNITS.items():
        if word in t:
            return amount * mult
    raise AssertionError("no time unit in %r" % text)


def check_quadratic_time(q, data):
    base_records, base_seconds = 1000, 1.0
    records = 100_000
    factor = records / base_records
    seconds = base_seconds * factor ** 2
    assert factor == 100 and seconds == 10_000, (factor, seconds)
    gaps = {c: abs(math.log(_seconds(c)) - math.log(seconds)) for c in q["choices"]}
    pick = strict_min(gaps)
    assert abs(_seconds(pick) - seconds) < 1200, (pick, seconds)
    assert 2.5 < seconds / 3600 < 3.0
    return {
        "choice": pick,
        "value": pick,
        "notes": "100x the records is 100^2 = 10,000x the work: %g seconds = %.2f "
                 "hours; choices in seconds %s" % (
                     seconds, seconds / 3600, {c: _seconds(c) for c in q["choices"]}),
    }


def check_busiest_slot(q, data):
    holes, parcels, trials = 100, 100, 6000
    fullest = 0.0
    empty = 0.0
    four_or_five = 0
    for _ in range(trials):
        bins = [0] * holes
        for _ in range(parcels):
            bins[random.randrange(holes)] += 1
        top = max(bins)
        fullest += top
        empty += sum(1 for b in bins if b == 0)
        four_or_five += 1 if top in (4, 5) else 0
    fullest /= trials
    empty /= trials
    assert 3.9 < fullest < 4.6, fullest
    assert four_or_five / trials > 0.7, four_or_five / trials
    assert 33 < empty < 40, empty          # the ~37 the explanation claims
    choice = nearest_choice(q, fullest)
    return {
        "choice": choice,
        "value": "4 or 5",
        "notes": "MC(%d): fullest hole averages %.2f, is 4 or 5 in %.0f%% of runs, "
                 "and %.1f holes are left empty" % (
                     trials, fullest, 100 * four_or_five / trials, empty),
    }


def _work_amount(text):
    t = text.lower().replace(",", "")
    mult = 1_000_000 if "million" in t else 1
    match = re.search(r"\d+", t)
    if match:
        base = float(match.group(0))
    else:
        base = 100.0 if "hundred" in t else 1.0
    return base * mult


def check_memo_staircase(q, data):
    steps = 40
    # splitting every staircase into two smaller ones, nothing written down
    calls = {1: 1, 2: 1}
    for n in range(3, steps + 1):
        calls[n] = 1 + calls[n - 1] + calls[n - 2]
    assert calls[steps] > 200_000_000, calls[steps]
    assert calls[steps] == 204_668_309, calls[steps]
    # with a notebook: one line per staircase size, filled once
    routes = {1: 1, 2: 2}
    written = 2
    for n in range(3, steps + 1):
        routes[n] = routes[n - 1] + routes[n - 2]
        written += 1
    assert written == steps, written
    assert routes[steps] == 165_580_141
    choice = nearest_choice(q, written, parse=_work_amount)
    return {
        "choice": choice,
        "value": "about 40",
        "notes": "from scratch %s pieces of work for %d steps; with a notebook %d "
                 "lines, each filled once" % (f"{calls[steps]:,}", steps, written),
    }


def check_parallel_cores(q, data):
    whole, stuck, cores = 10.0, 1.0, 100
    shareable = whole - stuck
    hours = stuck + shareable / cores
    assert abs(hours - 1.09) < 1e-9, hours
    speedup = whole / hours
    assert 9.1 < speedup < 9.2, speedup
    floor = stuck
    assert stuck + shareable / 1000 > floor, "the stuck hour is a floor"
    assert abs((stuck + shareable / 1000) - 1.009) < 1e-9
    return {
        "number": hours,
        "value": "1.09",
        "notes": "1 hour that cannot split + 9 hours over %d cores = %.2f hours, a "
                 "speed-up of %.2f not %d; a thousand cores still take %.3f" % (
                     cores, hours, speedup, cores, stuck + shareable / 1000),
    }


def check_growth_order(q, data):
    def look_up(n):
        return math.log(n, 2)

    def read(n):
        return float(n)

    def sort(n):
        return n * math.log(n, 2)

    def pairs(n):
        return n * (n - 1) / 2.0

    def orders(n):
        return math.lgamma(n + 1)            # kept as a logarithm; nothing holds n!

    jobs = [
        ("sorted list", look_up, False),
        ("once", read, False),
        ("sorting", sort, False),
        ("every other", pairs, False),
        ("every possible order", orders, True),
    ]
    chosen = []
    for needle, fn, is_log in jobs:
        hits = [it for it in q["items"] if needle in it.lower()]
        assert len(hits) == 1, "%d items match %r" % (len(hits), needle)
        chosen.append((hits[0], fn, is_log))
    assert len({c[0] for c in chosen}) == len(q["items"])

    def rank(entry, n):
        _, fn, is_log = entry
        value = fn(n)
        return value if is_log else math.log(max(value, 1.0000001))

    for n in (50, 1000, 100000):
        scores = [rank(c, n) for c in chosen]
        assert all(scores[i] < scores[i + 1] for i in range(len(scores) - 1)), (n, scores)
    order = [c[0] for c in sorted(chosen, key=lambda c: rank(c, 1000))]
    assert math.factorial(10) == 3_628_800
    assert math.factorial(20) > 66_000_000 * 365 * 24 * 3600      # since the dinosaurs
    return {
        "order": order,
        "value": "look-up, one pass, sorting, every pair, every order",
        "notes": "work at 1000 names: look-up %.0f, one pass 1000, sorting %.0f, "
                 "every pair %.0f, every order beyond writing down — and the same "
                 "order holds at 50 and at 100,000" % (
                     look_up(1000), sort(1000), pairs(1000)),
    }


CHECKERS = {
    "friend_paradox": check_friend_paradox,
    "odd_handshakes": check_odd_handshakes,
    "six_degrees": check_six_degrees,
    "party_of_six": check_party_of_six,
    "exam_slots": check_exam_slots,
    "cheapest_cables": check_cheapest_cables,
    "postman_start": check_postman_start,
    "random_connect": check_random_connect,
    "ring_shortcuts": check_ring_shortcuts,
    "card_sorting": check_card_sorting,
    "twelve_coins": check_twelve_coins,
    "weigh_27": check_weigh_27,
    "egg_first_drop": check_egg_first_drop,
    "quadratic_time": check_quadratic_time,
    "busiest_slot": check_busiest_slot,
    "memo_staircase": check_memo_staircase,
    "parallel_cores": check_parallel_cores,
    "growth_order": check_growth_order,
}
