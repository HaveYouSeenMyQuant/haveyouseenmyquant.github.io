"""Answer checkers for the counting (unit 5) and expectation (unit 6) slice.

Every answer here is re-derived from scratch: by full enumeration where the
sample space is small enough to walk (dice throws, permutations of five people,
every square on a chessboard), by exact Fraction arithmetic where it is not, and
by Monte Carlo only ever as a cross-check on top. Nothing reads an answer out of
the question and hands it back.
"""

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
)


# ---------------------------------------------------------------------------
# unit 5 — counting without counting
# ---------------------------------------------------------------------------

def check_handshakes_room(q, data):
    people = list(range(10))
    pairs = list(itertools.combinations(people, 2))
    n = len(pairs)
    assert n == 45, n
    assert len(set(pairs)) == n
    # the double-counting story in the explanation: 10 people x 9 hands = 90 ends
    ends = sum(len([p for p in pairs if person in p]) for person in people)
    assert ends == 90 == 2 * n, ends
    # and it is the same count for every room size, so the picture cannot lie
    for k in range(2, 13):
        assert len(list(itertools.combinations(range(k), 2))) == k * (k - 1) // 2
    return {
        "number": n,
        "value": str(n),
        "notes": "all pairs of 10 people enumerated -> %d; each person appears in 9 of "
                 "them, 90 handshake-ends = 2 x %d" % (n, n),
    }


def check_queue_orders(q, data):
    perms = list(itertools.permutations("ABCDE"))
    n = len(perms)
    assert n == 120 == math.factorial(5), n
    assert len(set(perms)) == n
    # the three distractors are the three classic wrong models
    assert 5 * 4 == 20 and 5 ** 2 == 25 and 5 ** 5 == 3125
    # real shuffling never turns up a 121st order
    seen = set()
    for _ in range(20_000):
        a = list("ABCDE")
        random.shuffle(a)
        seen.add(tuple(a))
    assert len(seen) == n, len(seen)
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "5! = %d orders, enumerated and all distinct; 20k real shuffles found "
                 "exactly %d of them and never a new one" % (n, len(seen)),
    }


def check_pizza_toppings(q, data):
    menu = 10
    every = set(itertools.product([0, 1], repeat=menu))
    n = len(every)
    assert n == 1024 == 2 ** menu, n
    # the same total counted the other way: how many have exactly k toppings
    by_size = [math.comb(menu, k) for k in range(menu + 1)]
    assert sum(by_size) == n, by_size
    assert by_size[0] == 1, "the plain pizza has to be in there"
    # each extra topping doubles it
    for m in range(1, menu + 1):
        assert len(set(itertools.product([0, 1], repeat=m))) == 2 * len(
            set(itertools.product([0, 1], repeat=m - 1)))
    return {
        "number": n,
        "value": str(n),
        "notes": "every yes/no pattern over 10 toppings enumerated -> %d distinct "
                 "pizzas; by number of toppings that is %s, summing to %d" % (
                     n, by_size, sum(by_size)),
    }


def _ways(scenario):
    """Every possibility for one scenario, listed out."""
    pool = range(scenario["n"])
    k = scenario["k"]
    kind = scenario["kind"]
    if kind == "choose":
        return list(itertools.combinations(pool, k))
    if kind == "arrange":
        return list(itertools.permutations(pool, k))
    if kind == "repeat":
        return list(itertools.product(pool, repeat=k))
    raise AssertionError("unknown kind %r" % kind)


def check_count_order_matters(q, data):
    scen = data["countval"]["waysScenarios"]
    labels = [s["label"] for s in scen]
    assert len(labels) == len(set(labels)) == 4, labels
    assert set(labels) == set(q["items"]), (sorted(labels), sorted(q["items"]))
    counts = {}
    for s in scen:
        ways = _ways(s)
        assert len(set(ways)) == len(ways), s["label"]
        counts[s["label"]] = len(ways)
    assert sorted(counts.values()) == [10, 24, 60, 100], counts
    ordered = sorted(counts, key=counts.get)
    vals = [counts[lab] for lab in ordered]
    assert all(a < b for a, b in zip(vals, vals[1:])), vals
    # the point of the question: picking 2 of 5 is far smaller than ordering 3 of 5
    assert counts[labels[0]] * 6 == counts[labels[2]], (counts[labels[0]], counts[labels[2]])
    return {
        "order": ordered,
        "value": " < ".join(str(v) for v in vals),
        "notes": "enumerated: %s; strictly increasing as %s" % (
            {lab: counts[lab] for lab in ordered}, vals),
    }


def check_grid_paths(q, data):
    east = north = 3
    # dynamic programming over the lattice, exactly as the explanation describes
    ways = [[0] * (east + 1) for _ in range(north + 1)]
    ways[0][0] = 1
    for r in range(north + 1):
        for c in range(east + 1):
            if r or c:
                ways[r][c] = (ways[r - 1][c] if r else 0) + (ways[r][c - 1] if c else 0)
    total = ways[north][east]
    assert total == 20, ways
    # brute force: every sequence of six moves with three easts
    seqs = [s for s in itertools.product("EN", repeat=east + north) if s.count("E") == east]
    assert len(seqs) == total == math.comb(6, 3), (len(seqs), total)
    assert ways[1][1] == 2 and ways[2][2] == 6, ways
    return {
        "number": total,
        "value": str(total),
        "notes": "lattice DP corner counts %s -> %d; the %d six-move sequences with "
                 "three easts agree, and C(6,3)=%d" % (
                     ways, total, len(seqs), math.comb(6, 3)),
    }


def check_chessboard_squares(q, data):
    N = 8
    per_size = {}
    total = 0
    for size in range(1, N + 1):
        spots = [(r, c) for r in range(N - size + 1) for c in range(N - size + 1)]
        assert len(spots) == (N - size + 1) ** 2
        per_size[size] = len(spots)
        total += len(spots)
    assert per_size == {1: 64, 2: 49, 3: 36, 4: 25, 5: 16, 6: 9, 7: 4, 8: 1}, per_size
    assert total == 204, total
    assert total == sum(k * k for k in range(1, N + 1))
    assert total > N * N, "the little ones are not the whole story"
    return {
        "number": total,
        "value": str(total),
        "notes": "placements by size %s (top-left corner anywhere in a smaller grid); "
                 "they sum to %d, against %d if you only count the little ones" % (
                     per_size, total, N * N),
    }


def check_at_least_one_six(q, data):
    space = list(itertools.product(range(1, 7), repeat=4))
    assert len(space) == 1296
    hits = sum(1 for t in space if 6 in t)
    exact = Fraction(hits, len(space))
    assert hits == 671, hits
    assert exact == 1 - Fraction(5, 6) ** 4 == Fraction(671, 1296), exact
    pct = float(exact) * 100
    assert abs(pct - 51.7747) < 1e-3, pct
    assert pct < 100 * 4 / 6, "four dice do not give four sixths"
    mc = mc_rate(lambda: any(random.randrange(1, 7) == 6 for _ in range(4)), 20_000)
    assert abs(mc * 100 - pct) < 3.0, (mc, pct)
    return {
        "choice": nearest_choice(q, pct),
        "value": "about 52%",
        "notes": "all 1296 throws of four dice enumerated: %d contain a six -> %s = "
                 "%.4f%%; the naive 4/6 would be %.1f%%; MC(20k) = %.2f%%" % (
                     hits, exact, pct, 100 * 4 / 6, mc * 100),
    }


def check_pigeonhole_hair(q, data):
    people = 9_000_000
    boxes = 150_000 + 1                    # hair counts 0 .. 150,000 inclusive
    derived = people > boxes
    assert derived is True
    fullest = -(-people // boxes)          # ceiling: some box holds at least this many
    assert fullest == 60, fullest
    # the principle itself, proved exhaustively on small cases rather than asserted
    for m in range(1, 6):                  # boxes
        for n in range(1, 8):              # things
            always_repeats = all(
                len(set(a)) < n for a in itertools.product(range(m), repeat=n))
            assert always_repeats == (n > m), (m, n)
    return {
        "bool": bool(derived),
        "value": "true",
        "notes": "%s people into %s possible hair counts: more things than boxes, so a "
                 "repeat is forced, and some box holds at least %d. Checked "
                 "exhaustively for every m<=5 boxes and n<=7 things: a repeat is "
                 "unavoidable exactly when n > m" % (
                     "{:,}".format(people), "{:,}".format(boxes), fullest),
    }


def check_seating_together(q, data):
    perms = list(itertools.permutations(range(5)))
    assert len(perms) == 120
    adjacent = [p for p in perms if abs(p.index(0) - p.index(1)) == 1]
    n = len(adjacent)
    assert n == 48, n
    # the same number the way the explanation tells it: glue the pair, then flip it
    assert 2 * math.factorial(4) == n
    assert Fraction(n, 120) == Fraction(2, 5)
    mc = mc_rate(lambda: _adjacent_shuffle(), 20_000)
    assert abs(mc - 0.4) < 0.02, mc
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "all 120 orders of five people enumerated: %d put the pair side by "
                 "side = 2 x 4! and exactly 2/5 of them; MC(20k) = %.3f" % (n, mc),
    }


def _adjacent_shuffle():
    a = list(range(5))
    random.shuffle(a)
    return abs(a.index(0) - a.index(1)) == 1


def check_banana_words(q, data):
    letters = "BANANA"
    visible = {"".join(p) for p in itertools.permutations(letters)}
    n = len(visible)
    labelled = math.factorial(len(letters))
    repeats = math.factorial(3) * math.factorial(2)
    assert n == 60, n
    assert labelled // repeats == n, (labelled, repeats, n)
    assert len(set(itertools.permutations(range(len(letters))))) == labelled
    # every visible string is made by the same hidden swaps of the three As and two Ns
    fibres = {}
    for p in itertools.permutations(range(len(letters))):
        word = "".join(letters[i] for i in p)
        fibres[word] = fibres.get(word, 0) + 1
    assert set(fibres.values()) == {repeats}, set(fibres.values())
    return {
        "number": n,
        "value": str(n),
        "notes": "enumerated all labelled orders of BANANA: %d hidden orders collapse "
                 "to %d visible strings; each visible string appears %d times because "
                 "the three As and two Ns can be swapped invisibly" % (
                     labelled, n, repeats),
    }


def check_round_table(q, data):
    n_people = 6
    perms = list(itertools.permutations(range(n_people)))

    def canon(p):
        rots = [p[i:] + p[:i] for i in range(n_people)]
        return min(rots)

    circles = {canon(p) for p in perms}
    n = len(circles)
    assert n == math.factorial(n_people) // n_people == 120, n
    assert len(perms) == n * n_people
    # Mirrors are not rotations: left and right neighbours have swapped.
    assert canon((0, 1, 2, 3, 4, 5)) != canon((0, 5, 4, 3, 2, 1))
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "all %d labelled seatings enumerated; after identifying the %d "
                 "rotations of each circle, %d circular orders remain" % (
                     len(perms), n_people, n),
    }


def check_checkpoint_paths(q, data):
    east = north = 4
    checkpoint = (2, 1)
    seqs = []
    for s in itertools.product("EN", repeat=east + north):
        if s.count("E") != east:
            continue
        x = y = 0
        hit = False
        for step in s:
            if step == "E":
                x += 1
            else:
                y += 1
            if (x, y) == checkpoint:
                hit = True
        if hit:
            seqs.append(s)
    n = len(seqs)
    before = math.comb(sum(checkpoint), checkpoint[0])
    after_e = east - checkpoint[0]
    after_n = north - checkpoint[1]
    after = math.comb(after_e + after_n, after_e)
    assert n == before * after == 30, (n, before, after)
    assert before + after != n, "the two halves are paired, not added"
    return {
        "number": n,
        "value": str(n),
        "notes": "enumerated all 4E/4N routes and kept those through %s -> %d; "
                 "split count is C(3,2)=%d before and C(5,2)=%d after, product %d" % (
                     checkpoint, n, before, after, before * after),
    }


def check_grid_rectangles(q, data):
    width, height = 4, 3
    rects = [
        (x0, x1, y0, y1)
        for x0 in range(width)
        for x1 in range(x0 + 1, width + 1)
        for y0 in range(height)
        for y1 in range(y0 + 1, height + 1)
    ]
    n = len(rects)
    by_lines = math.comb(width + 1, 2) * math.comb(height + 1, 2)
    squares = [
        r for r in rects
        if r[1] - r[0] == r[3] - r[2]
    ]
    assert n == by_lines == 60, (n, by_lines)
    assert len(squares) == 20, len(squares)
    assert width * height == 12
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "enumerated all left/right/top/bottom grid-line choices -> %d "
                 "rectangles; choosing 2 of 5 vertical lines and 2 of 4 horizontal "
                 "lines gives %d; only %d of them are squares" % (
                     n, by_lines, len(squares)),
    }


def check_three_pairings(q, data):
    people = tuple(range(6))

    def matchings(xs):
        if not xs:
            return [()]
        first = xs[0]
        out = []
        for i in range(1, len(xs)):
            partner = xs[i]
            rest = xs[1:i] + xs[i + 1:]
            for tail in matchings(rest):
                out.append(((first, partner),) + tail)
        return out

    pairings = matchings(people)
    normalised = {
        tuple(sorted(tuple(sorted(p)) for p in m))
        for m in pairings
    }
    n = len(normalised)
    assert len(pairings) == n == 15, (len(pairings), n)
    formula = math.factorial(6) // (2 ** 3 * math.factorial(3))
    assert formula == n
    assert 5 * 3 == n
    return {
        "number": n,
        "value": str(n),
        "notes": "recursive exact matching gives %d splits; equivalently 6! divided "
                 "by 2^3 inside-pair orders and 3! pair orders, or 5 choices then "
                 "3 choices" % n,
    }


def check_red_folder_middle(q, data):
    folders = range(5)
    red = 0
    orders = [p for p in itertools.permutations(folders) if p[0] != red and p[-1] != red]
    n = len(orders)
    by_position = sum(
        1 for pos in range(1, 4)
        for p in itertools.permutations([f for f in folders if f != red])
    )
    assert n == by_position == 3 * math.factorial(4) == 72, (n, by_position)
    assert len(set(orders)) == n
    assert all(0 < p.index(red) < 4 for p in orders)
    return {
        "number": n,
        "value": str(n),
        "notes": "enumerated all 5-folder orders and kept red away from the two ends "
                 "-> %d; equivalently 3 middle positions x 4! other orders" % n,
    }


def check_pack_or_leave_books(q, data):
    books = tuple(range(7))
    packed = list(itertools.combinations(books, 3))
    left = list(itertools.combinations(books, 4))
    complements = {
        tuple(sorted(set(books) - set(p)))
        for p in packed
    }
    n = len(packed)
    assert n == len(left) == len(complements) == 35, (n, len(left), len(complements))
    assert set(left) == complements
    assert math.comb(7, 3) == math.comb(7, 4) == n
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "enumerated C(7,3) packed sets -> %d; their complements are exactly "
                 "the C(7,4) left-at-home sets, so the two counts agree" % n,
    }


def check_smoothie_three_fruits(q, data):
    fruits = range(8)
    combos = list(itertools.combinations(fruits, 3))
    ordered = list(itertools.permutations(fruits, 3))
    n = len(combos)
    assert n == 56 == math.comb(8, 3), n
    assert len(ordered) == 336
    assert len(ordered) // math.factorial(3) == n
    fibres = {}
    for p in ordered:
        key = tuple(sorted(p))
        fibres[key] = fibres.get(key, 0) + 1
    assert set(fibres.values()) == {6}, set(fibres.values())
    derived = str(n)
    assert derived in q["choices"], derived
    return {
        "choice": derived,
        "value": derived,
        "notes": "enumerated %d unordered triples from 8 fruits. The %d ordered "
                 "three-fruit lists collapse six-to-one onto those same smoothies" % (
                     n, len(ordered)),
    }


def check_must_include_omar(q, data):
    volunteers = range(10)
    omar = 0
    committees = [c for c in itertools.combinations(volunteers, 5) if omar in c]
    choose_rest = list(itertools.combinations([v for v in volunteers if v != omar], 4))
    n = len(committees)
    rebuilt = {tuple(sorted((omar,) + c)) for c in choose_rest}
    assert n == 126 == math.comb(9, 4), n
    assert set(committees) == rebuilt
    assert math.comb(10, 5) == 252 and Fraction(n, math.comb(10, 5)) == Fraction(1, 2)
    return {
        "number": n,
        "value": str(n),
        "notes": "enumerated all 5-person committees from 10 and kept the ones with "
                 "Omar -> %d; choosing Omar plus 4 of the other 9 gives the same set" % n,
    }


def check_trail_network_paths(q, data):
    graph = {
        "Start": ["A", "B"],
        "A": ["C", "D"],
        "B": ["D", "E"],
        "C": ["Finish"],
        "D": ["Finish"],
        "E": ["Finish"],
        "Finish": [],
    }

    def routes(node):
        if node == "Finish":
            return [("Finish",)]
        out = []
        for nxt in graph[node]:
            for tail in routes(nxt):
                out.append((node,) + tail)
        return out

    all_routes = routes("Start")
    n = len(all_routes)
    assert n == 4, all_routes
    assert len(set(all_routes)) == n
    via_a = [r for r in all_routes if r[1] == "A"]
    via_b = [r for r in all_routes if r[1] == "B"]
    assert len(via_a) == len(via_b) == 2
    assert ("Start", "A", "D", "Finish") in all_routes
    assert ("Start", "B", "D", "Finish") in all_routes
    return {
        "number": n,
        "value": str(n),
        "notes": "DFS over the directed trail map gives routes %s; D is shared, but "
                 "Start-A-D-Finish and Start-B-D-Finish are different routes" % (
                     all_routes,),
    }


# ---------------------------------------------------------------------------
# unit 6 — what it's worth
# ---------------------------------------------------------------------------

def check_coin_game_value(q, data):
    outcomes = {10: Fraction(1, 2), -6: Fraction(1, 2)}
    assert sum(outcomes.values()) == 1
    ev = sum(Fraction(v) * p for v, p in outcomes.items())
    assert ev == Fraction(2), ev
    assert 10 not in (float(ev),) and -6 != float(ev), "the average is not an outcome"
    mc = mc_mean(lambda: 10 if random.getrandbits(1) else -6, 20_000)
    assert abs(mc - float(ev)) < 0.25, mc
    return {
        "number": float(ev),
        "value": "£2 a flip",
        "notes": "half of +10 and half of -6 gives exactly %s a flip; MC(20k) = "
                 "%.3f" % (ev, mc),
    }


def check_value_order(q, data):
    bets = data["countval"]["bets"]
    labels = [b["label"] for b in bets]
    assert len(labels) == len(set(labels)) == 4, labels
    assert set(labels) == set(q["items"]), (sorted(labels), sorted(q["items"]))
    values = {}
    for b in bets:
        assert 0 < b["winners"] < b["outcomes"] or b["outcomes"] == 2
        values[b["label"]] = Fraction(b["prize"]) * Fraction(b["winners"], b["outcomes"])
    assert sorted(values.values()) == [2, 3, 4, 6], values
    ordered = sorted(values, key=values.get)
    vals = [values[lab] for lab in ordered]
    assert all(a < b for a, b in zip(vals, vals[1:])), vals
    # the point of the question: the biggest prize is not the best game
    biggest = max(bets, key=lambda b: b["prize"])
    assert biggest["prize"] == 52
    assert ordered.index(biggest["label"]) == 2, ordered
    # Monte Carlo cross-check on each game
    for b in bets:
        mc = mc_mean(
            lambda b=b: b["prize"] if random.randrange(b["outcomes"]) < b["winners"] else 0,
            6_000)
        assert abs(mc - float(values[b["label"]])) < 0.6, (b["label"], mc)
    return {
        "order": ordered,
        "value": " < ".join("£%d" % v for v in vals),
        "notes": "chance x prize: %s; the £52 prize is only the third best game" % (
            {lab: "£%s" % values[lab] for lab in ordered}),
    }


def check_raffle_ticket(q, data):
    tickets, prize = 500, 600
    value = Fraction(prize, tickets)
    assert value == Fraction(6, 5), value
    assert abs(float(value) - 1.2) < 1e-12
    # the numbers the explanation quotes
    price = 2
    assert Fraction(price) - value == Fraction(4, 5), "80p a ticket"
    assert tickets * price - prize == 400, "the raffle keeps £400"
    mc = mc_mean(lambda: prize if random.randrange(tickets) == 0 else 0, 20_000)
    assert abs(mc - float(value)) < 0.6, mc
    return {
        "number": float(value),
        "value": "£1.20",
        "notes": "one winner in %d tickets for a £%d prize -> %s = £1.20 a ticket; at "
                 "£2 the buyer loses 80p and the raffle keeps £400; MC(20k) = "
                 "£%.3f" % (tickets, prize, value, mc),
    }


def check_fair_price_stall(q, data):
    rolls = list(itertools.product(range(1, 7), repeat=2))
    assert len(rolls) == 36
    sevens = [r for r in rolls if sum(r) == 7]
    assert len(sevens) == 6, sevens
    p_seven = Fraction(len(sevens), len(rolls))
    assert p_seven == Fraction(1, 6)
    worth = 20 * p_seven
    assert worth == Fraction(10, 3), worth
    prices = {r["id"]: Fraction(int(first_number(r["label"]))) for r in q["regions"]}
    assert sorted(prices.values()) == [2, 3, 4, 5], prices
    affordable = [pid for pid, pr in prices.items() if pr < worth]
    best = max(affordable, key=lambda pid: prices[pid])
    assert prices[best] == 3, prices[best]
    # and the next one up is a losing game
    dearer = [pid for pid, pr in prices.items() if pr > prices[best]]
    assert all(prices[pid] > worth for pid in dearer), prices
    mc = mc_mean(
        lambda: 20 if random.randrange(1, 7) + random.randrange(1, 7) == 7 else 0,
        20_000)
    assert abs(mc - float(worth)) < 0.35, mc
    return {
        "region": best,
        "value": "£%d" % prices[best],
        "notes": "6 of the 36 throws total seven, so a roll is worth 20/6 = £%.2f; £3 "
                 "leaves +£%.2f a go and £4 leaves -£%.2f; MC(20k) = £%.3f" % (
                     float(worth), float(worth) - 3, 4 - float(worth), mc),
    }


def check_insurance_fair(q, data):
    replacement, breakage_rate = Fraction(500), Fraction(1, 25)
    yearly = replacement * breakage_rate
    assert yearly == Fraction(20), yearly
    monthly = yearly / 12
    assert monthly == Fraction(5, 3), monthly
    derived = monthly < 2
    assert abs(float(monthly) - 1.6667) < 1e-3, float(monthly)
    charged = Fraction(6)
    assert charged / monthly == Fraction(18, 5), charged / monthly
    assert float(charged / monthly) > 3, "the explanation says more than three times"
    mc = mc_mean(lambda: 500 if random.random() < 1 / 25.0 else 0, 20_000)
    assert abs(mc - float(yearly)) < 3.0, mc
    return {
        "bool": bool(derived),
        "value": "true",
        "notes": "£500 to one customer in 25 is £%s a year = £%.2f a month, under the "
                 "£2 claimed; the £6 charged is %.1fx that; MC(20k customer-years) "
                 "mean payout £%.2f" % (yearly, float(monthly),
                                        float(charged / monthly), mc),
    }


def check_rolls_until_six(q, data):
    p = Fraction(1, 6)
    # first-step analysis: e = 1 + (1-p) e
    e = Fraction(1) / p
    assert e == 6, e
    assert e == 1 + (1 - p) * e
    # the same number as a truncated exact series
    series = sum(Fraction(k) * (1 - p) ** (k - 1) * p for k in range(1, 500))
    assert abs(float(series) - 6) < 1e-6, float(series)
    # the two facts the explanation quotes
    assert p == Fraction(1, 6)
    still_going = (1 - p) ** 12
    assert abs(float(still_going) - 0.1122) < 1e-3, float(still_going)
    assert abs(1 / float(still_going) - 9) < 1.0, "about one time in nine"
    mc = mc_mean(_wait_for_six, 20_000)
    assert abs(mc - float(e)) < 0.25, mc
    return {
        "number": float(e),
        "value": "6",
        "notes": "e = 1 + (5/6)e -> e = %s; truncated series = %.6f; P(still rolling "
                 "after 12) = %.4f; MC(20k) = %.3f" % (
                     e, float(series), float(still_going), mc),
    }


def _wait_for_six():
    n = 1
    while random.randrange(1, 7) != 6:
        n += 1
    return n


def check_sticker_album(q, data):
    n = 50
    exact = sum(Fraction(n, k) for k in range(1, n + 1))     # n * H_n
    val = float(exact)
    assert abs(val - 224.9603) < 1e-3, val
    assert abs(val - q["answerNumber"]) <= q["tolerance"], (val, q["tolerance"])
    # the two claims in the explanation
    assert float(Fraction(n, 1)) == 50, "the last sticker alone takes 50 packs"
    last_ten = float(sum(Fraction(n, k) for k in range(1, 11)))
    assert 0.6 < last_ten / val < 0.7, last_ten / val
    mc = mc_mean(lambda: _collect(n), 1_500)
    assert abs(mc - val) < 12.0, (mc, val)
    return {
        "number": val,
        "value": "about 225 packs",
        "notes": "exact 50 x (1 + 1/2 + ... + 1/50) = %.4f packs; the final sticker "
                 "alone is 50 of them and the last ten are %.0f%% of the total; "
                 "MC(1500 albums) = %.1f" % (val, last_ten / val * 100, mc),
    }


def _collect(n):
    have, got, packs = set(), 0, 0
    while got < n:
        s = random.randrange(n)
        packs += 1
        if s not in have:
            have.add(s)
            got += 1
    return packs


def check_bus_wait(q, data):
    gaps = data["countval"]["busGaps"]
    assert set(gaps) == {5, 15}, gaps
    assert gaps.count(5) == gaps.count(15), gaps
    mean_gap = Fraction(sum(gaps), len(gaps))
    assert mean_gap == 10, mean_gap
    # a random arrival lands in a gap in proportion to its length, and waits half of it
    total = sum(gaps)
    wait = sum(Fraction(g, total) * Fraction(g, 2) for g in gaps)
    assert wait == Fraction(25, 4), wait
    assert float(wait) == 6.25
    long_share = Fraction(sum(g for g in gaps if g == 15), total)
    assert long_share == Fraction(3, 4), long_share
    derived = wait > mean_gap / 2
    assert derived is True
    mc = mc_mean(lambda: _bus_wait(gaps), 20_000)
    assert abs(mc - float(wait)) < 0.2, mc
    return {
        "bool": bool(derived),
        "value": "true",
        "notes": "long gaps fill %s of the timetable though they are half the gaps, so "
                 "the average wait is %s = %.2f min against half the average gap = "
                 "%.2f; MC(20k arrivals) = %.3f" % (
                     long_share, wait, float(wait), float(mean_gap) / 2, mc),
    }


def _bus_wait(gaps):
    total = sum(gaps)
    t = random.random() * total
    edge = 0.0
    for g in gaps:
        if t < edge + g:
            return edge + g - t
        edge += g
    return 0.0


def check_hat_check(q, data):
    # exact for every small party: the average number of fixed points is 1
    for n in range(1, 8):
        fixed = sum(sum(1 for i, v in enumerate(p) if v == i)
                    for p in itertools.permutations(range(n)))
        assert Fraction(fixed, math.factorial(n)) == 1, (n, fixed)
    # so it does not depend on the size of the party — check the actual 30 by MC
    mc = mc_mean(lambda: _own_hats(30), 20_000)
    assert abs(mc - 1.0) < 0.06, mc
    none_at_all = mc_rate(lambda: _own_hats(30) == 0, 10_000)
    assert 0.30 < none_at_all < 0.44, none_at_all       # ~1/e, so "never" is wrong
    derived = only_choice(q, "exactly one")
    return {
        "choice": derived,
        "value": "exactly one",
        "notes": "enumerated every shuffle for parties of 1..7: the mean number of "
                 "people with their own hat is exactly 1 in each; MC(20k) at 30 "
                 "people = %.4f, and nobody gets theirs only %.1f%% of the time" % (
                     mc, none_at_all * 100),
    }


def _own_hats(n):
    hats = list(range(n))
    random.shuffle(hats)
    return sum(1 for i, v in enumerate(hats) if v == i)


def check_jackpot_average(q, data):
    cards, prize = 1000, 10_000
    value = Fraction(prize, cards)
    assert value == 10, value
    assert 999 * 0 + prize == 10_000
    typical = Fraction(999, cards)
    assert typical > Fraction(99, 100), typical
    mc = mc_mean(lambda: prize if random.randrange(cards) == 0 else 0, 20_000)
    assert abs(mc - float(value)) < 9.0, mc
    return {
        "number": float(value),
        "value": "£10",
        "notes": "one £%s winner across %s equally likely cards gives %s = £%s per "
                 "card, while %s of cards pay nothing; MC(20k) = £%.2f" % (
                     "{:,}".format(prize), "{:,}".format(cards), prize, value,
                     typical, mc),
    }


def check_double_until_heads_cap(q, data):
    cap = 10
    rows = []
    for k in range(1, cap + 1):
        prize = 2 ** (k - 1)
        chance = Fraction(1, 2 ** k)
        rows.append(Fraction(prize) * chance)
    assert all(r == Fraction(1, 2) for r in rows), rows
    value = sum(rows)
    assert value == 5, value
    no_heads = Fraction(1, 2 ** cap)
    assert no_heads * 0 == 0
    mc = mc_mean(_double_until_heads_cap_trial, 20_000)
    assert abs(mc - float(value)) < 0.6, mc
    return {
        "number": float(value),
        "value": "£5",
        "notes": "for each first-heads time k=1..%d, payout 2^(k-1) times chance "
                 "1/2^k is exactly 1/2; ten such rows sum to £%s, and no-heads "
                 "probability %s contributes £0; MC(20k) = £%.3f" % (
                     cap, value, no_heads, mc),
    }


def _double_until_heads_cap_trial():
    for k in range(1, 11):
        if random.randrange(2) == 0:
            return 2 ** (k - 1)
    return 0


def check_sure_or_longshot(q, data):
    sure = Fraction(3)
    longshot = Fraction(1, 4) * 20
    assert longshot == 5 and longshot > sure, (sure, longshot)
    assert Fraction(3, 4) > Fraction(1, 2), "the long shot usually pays nothing"
    mc_sure = mc_mean(lambda: 3, 5_000)
    mc_long = mc_mean(lambda: 20 if random.randrange(4) == 0 else 0, 20_000)
    assert abs(mc_sure - float(sure)) < 1e-12, mc_sure
    assert abs(mc_long - float(longshot)) < 0.35, mc_long
    derived = only_choice(q, "one-in-four")
    return {
        "choice": derived,
        "value": "the one-in-four chance",
        "notes": "sure thing is £%s; the long shot is 1/4 x £20 = £%s, despite "
                 "paying nothing 3/4 of the time; MC long shot(20k) = £%.3f" % (
                     sure, longshot, mc_long),
    }


def check_wait_for_two_sixes(q, data):
    # State 0: no useful previous roll. State 1: the last roll was a six.
    # e1 = 1 + (5/6)e0, e0 = 1 + (1/6)e1 + (5/6)e0.
    e0 = Fraction(42)
    e1 = Fraction(36)
    assert e1 == 1 + Fraction(5, 6) * e0
    assert e0 == 1 + Fraction(1, 6) * e1 + Fraction(5, 6) * e0
    mc = mc_mean(_wait_for_two_sixes, 20_000)
    assert abs(mc - float(e0)) < 1.4, mc
    # exhaustive finite-state probabilities up to a long cutoff agree with the mean
    dist = {(0, 0): Fraction(1)}       # (state, done) -> probability before a flip
    mean = Fraction(0)
    for step in range(1, 1000):
        nxt = {}
        for (state, done), pr in dist.items():
            if done:
                nxt[(state, done)] = nxt.get((state, done), Fraction(0)) + pr
                continue
            if state == 1:
                mean += step * pr * Fraction(1, 6)
                nxt[(0, 0)] = nxt.get((0, 0), Fraction(0)) + pr * Fraction(5, 6)
            else:
                nxt[(1, 0)] = nxt.get((1, 0), Fraction(0)) + pr * Fraction(1, 6)
                nxt[(0, 0)] = nxt.get((0, 0), Fraction(0)) + pr * Fraction(5, 6)
        dist = nxt
    assert abs(float(mean) - 42) < 1e-7, float(mean)
    return {
        "number": float(e0),
        "value": "42",
        "notes": "solving e1 = 1 + 5e0/6 and e0 = 1 + e1/6 + 5e0/6 gives e0 = "
                 "%s; finite-state sum to 1000 rolls gives %.8f; MC(20k) = %.3f" % (
                     e0, float(mean), mc),
    }


def _wait_for_two_sixes():
    flips, streak = 0, 0
    while streak < 2:
        flips += 1
        if random.randrange(1, 7) == 6:
            streak += 1
        else:
            streak = 0
    return flips


def check_divided_by_die(q, data):
    payouts = [Fraction(12, face) for face in range(1, 7)]
    value = sum(payouts) / 6
    assert payouts == [Fraction(12), Fraction(6), Fraction(4), Fraction(3),
                       Fraction(12, 5), Fraction(2)], payouts
    assert value == Fraction(49, 10), value
    wrong_ratio = Fraction(12, 1) / (sum(Fraction(i) for i in range(1, 7)) / 6)
    assert wrong_ratio == Fraction(24, 7) and wrong_ratio != value, wrong_ratio
    mc = mc_mean(lambda: 12 / random.randrange(1, 7), 20_000)
    assert abs(mc - float(value)) < 0.08, mc
    return {
        "number": float(value),
        "value": "£4.90",
        "notes": "mean of the six payouts %s is %s = £%.2f; dividing £12 by "
                 "the average roll would give %s, which is a different question; "
                 "MC(20k) = £%.3f" % (
                     [str(p) for p in payouts], value, float(value), wrong_ratio, mc),
    }


CHECKERS = {
    "handshakes_room": check_handshakes_room,
    "queue_orders": check_queue_orders,
    "pizza_toppings": check_pizza_toppings,
    "count_order_matters": check_count_order_matters,
    "grid_paths": check_grid_paths,
    "chessboard_squares": check_chessboard_squares,
    "at_least_one_six": check_at_least_one_six,
    "pigeonhole_hair": check_pigeonhole_hair,
    "seating_together": check_seating_together,
    "banana_words": check_banana_words,
    "round_table": check_round_table,
    "checkpoint_paths": check_checkpoint_paths,
    "grid_rectangles": check_grid_rectangles,
    "three_pairings": check_three_pairings,
    "red_folder_middle": check_red_folder_middle,
    "pack_or_leave_books": check_pack_or_leave_books,
    "smoothie_three_fruits": check_smoothie_three_fruits,
    "must_include_omar": check_must_include_omar,
    "trail_network_paths": check_trail_network_paths,
    "coin_game_value": check_coin_game_value,
    "value_order": check_value_order,
    "raffle_ticket": check_raffle_ticket,
    "fair_price_stall": check_fair_price_stall,
    "insurance_fair": check_insurance_fair,
    "rolls_until_six": check_rolls_until_six,
    "sticker_album": check_sticker_album,
    "bus_wait": check_bus_wait,
    "hat_check": check_hat_check,
    "jackpot_average": check_jackpot_average,
    "double_until_heads_cap": check_double_until_heads_cap,
    "sure_or_longshot": check_sure_or_longshot,
    "wait_for_two_sixes": check_wait_for_two_sixes,
    "divided_by_die": check_divided_by_die,
}
