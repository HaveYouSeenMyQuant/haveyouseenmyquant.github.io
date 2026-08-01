"""Checkers for unit 7 ("Given that…") and unit 8 ("Shapes and space").

Every answer here is re-derived from scratch: by enumerating the whole sample
space where one exists, by exact Fractions, or by exact geometry. Monte Carlo
only ever cross-checks a number that was already derived another way.
"""

import itertools
import math
import random
from fractions import Fraction

from checks._helpers import (mc_mean, mc_rate, nearest_choice, strict_max,
                             strict_min)


# ---------------------------------------------------------------------------
# u7l1 — what you were told
# ---------------------------------------------------------------------------

def check_two_aces_news(q, data):
    """Every ordered two-card deal, counted twice over: once conditioned on the
    first card being an ace, once on either card being one."""
    deck = range(52)                              # cards 0..3 are the aces
    n_first = both_first = n_any = both_any = 0
    for a, b in itertools.permutations(deck, 2):
        two = a < 4 and b < 4
        if a < 4:
            n_first += 1
            both_first += two
        if a < 4 or b < 4:
            n_any += 1
            both_any += two
    assert n_first == 4 * 51 and n_any == 52 * 51 - 48 * 47, (n_first, n_any)
    p_first = Fraction(both_first, n_first)
    p_any = Fraction(both_any, n_any)
    assert p_first == Fraction(1, 17), p_first
    assert p_any == Fraction(1, 33), p_any
    assert p_first > p_any

    claims = {
        "Hearing the first card is an ace": p_first,
        "Hearing at least one of them is an ace": p_any,
    }
    for c in claims:
        assert c in q["choices"], c
    best = strict_max(claims)

    N, kf, hf, ka, ha = 30_000, 0, 0, 0, 0
    for _ in range(N):
        a = random.randrange(52)
        b = random.randrange(51)
        if b >= a:
            b += 1
        two = a < 4 and b < 4
        if a < 4:
            kf += 1
            hf += two
        if a < 4 or b < 4:
            ka += 1
            ha += two
    mc_f, mc_a = hf / kf, ha / ka
    assert abs(mc_f - float(p_first)) < 0.02, (mc_f, float(p_first))
    assert abs(mc_a - float(p_any)) < 0.02, (mc_a, float(p_any))
    return {
        "choice": best,
        "value": "the first card is an ace (1 in %d, against 1 in %d)" % (
            p_first.denominator, p_any.denominator),
        "notes": "all 2652 ordered deals: %d/%d = %s when the first is an ace, "
                 "%d/%d = %s when either is; MC(%d) %.4f and %.4f" % (
                     both_first, n_first, p_first, both_any, n_any, p_any,
                     N, mc_f, mc_a),
    }


def check_taxi_witness(q, data):
    blue, right = Fraction(15, 100), Fraction(80, 100)
    said_blue = blue * right + (1 - blue) * (1 - right)
    post = (blue * right) / said_blue
    assert post == Fraction(12, 29), post
    pct = float(post) * 100
    assert abs(pct - 41.3793) < 1e-3, pct
    # the per-hundred story the explanation tells
    assert Fraction(100) * blue * right == 12
    assert Fraction(100) * (1 - blue) * (1 - right) == 17
    assert 12 + 17 == 29
    assert post < Fraction(1, 2), "the witness should be more likely wrong than right"

    N, pos, really = 30_000, 0, 0
    for _ in range(N):
        is_blue = random.random() < float(blue)
        says_blue = is_blue if random.random() < float(right) else not is_blue
        if says_blue:
            pos += 1
            really += is_blue
    mc = really / pos * 100
    assert abs(mc - pct) < 3.0, (mc, pct)
    return {
        "choice": nearest_choice(q, pct),
        "value": "about %d%%" % round(pct),
        "notes": "exact P(blue | called blue) = 12/29 = %.3f%%; per 100 cabs: 12 true "
                 "calls against 17 false ones; MC(%d) = %.2f%% over %d calls" % (
                     pct, N, mc, pos),
    }


def check_clumsy_host(q, data):
    """Exhaustive over prize, pick and which door the forgetful host opens —
    with the games he spoils by opening the prize thrown away."""
    kept = win = Fraction(0)
    spoiled = Fraction(0)
    for car in range(3):
        for pick in range(3):
            for opened in [d for d in range(3) if d != pick]:
                w = Fraction(1, 9) * Fraction(1, 2)
                if opened == car:
                    spoiled += w
                    continue
                kept += w
                win += w * ((3 - pick - opened) == car)
    assert kept + spoiled == 1
    assert spoiled == Fraction(1, 3), spoiled
    assert kept == Fraction(2, 3), kept
    p = win / kept
    assert p == Fraction(1, 2), p

    # the same board with a host who knows: the familiar two in three
    knowing = Fraction(0)
    for car in range(3):
        for pick in range(3):
            opts = [d for d in range(3) if d != pick and d != car]
            for opened in opts:
                knowing += Fraction(1, 9) * Fraction(1, len(opts)) * \
                    ((3 - pick - opened) == car)
    assert knowing == Fraction(2, 3), knowing
    assert p < knowing

    N, played, wins = 30_000, 0, 0
    for _ in range(N):
        car, pick = random.randrange(3), random.randrange(3)
        opened = random.choice([d for d in range(3) if d != pick])
        if opened == car:
            continue
        played += 1
        wins += (3 - pick - opened) == car
    mc = wins / played * 100
    assert abs(mc - 50) < 3.0, mc
    return {
        "number": float(p) * 100,
        "value": "50",
        "notes": "exhaustive: 1/3 of games are spoiled when he opens the prize; over "
                 "the surviving 2/3, P(switch wins) = %s. A knowing host gives %s. "
                 "MC(%d, %d survived) = %.2f%%" % (p, knowing, N, played, mc),
    }


def check_envelope_swap(q, data):
    """The pair is (a, 2a) for a hidden a. Whatever a is, swapping is a wash."""
    pairs = [(5, 10), (10, 20), (20, 40), (40, 80)]
    keep = swap = Fraction(0)
    for lo, hi in pairs:
        assert hi == 2 * lo
        pair_gain = Fraction(0)
        for mine in (lo, hi):
            w = Fraction(1, 2 * len(pairs))
            other = hi if mine == lo else lo
            keep += w * mine
            swap += w * other
            pair_gain += Fraction(1, 2) * (other - mine)
        assert pair_gain == 0, (lo, hi, pair_gain)      # a wash pair by pair too
    assert keep == swap, (keep, swap)
    assert swap - keep == 0
    # the tempting sum, written out: it claims a quarter more, for any holding
    claimed = keep * Fraction(5, 4)
    assert claimed > swap, "the 'gain a quarter' claim should overshoot"
    # and it is symmetric, so it would recommend swapping back forever
    assert (Fraction(1, 2) * 2 + Fraction(1, 2) * Fraction(1, 2)) == Fraction(5, 4)

    def gain():
        lo, hi = random.choice(pairs)
        mine = lo if random.random() < 0.5 else hi
        return (hi if mine == lo else lo) - mine

    mc = mc_mean(gain, 20_000)
    assert abs(mc) < 1.0, mc
    derived = swap > keep
    assert derived is False
    return {
        "bool": derived,
        "value": "false",
        "notes": "over hidden pairs %s: E[keep] = E[swap] = %s, so the average gain "
                 "from swapping is exactly 0 (and 0 pair by pair). The 'quarter more' "
                 "sum would give %s. MC(20000) mean gain = %.3f" % (
                     pairs, keep, claimed, mc),
    }


def check_boy_weekday(q, data):
    """All 196 equally likely (child, child) pairs: sex times day of birth."""
    kids = [(s, d) for s in "BG" for d in range(7)]
    assert len(kids) == 14

    def weekday_boy(k):
        return k[0] == "B" and k[1] < 5                # Monday..Friday

    fit = both = 0
    for a in kids:
        for b in kids:
            if weekday_boy(a) or weekday_boy(b):
                fit += 1
                both += a[0] == "B" and b[0] == "B"
    assert (fit, both) == (115, 45), (fit, both)
    p = Fraction(both, fit)
    assert p == Fraction(9, 23), p

    # the plain version, for contrast: "at least one boy" alone
    plain_fit = sum(1 for a in kids for b in kids if a[0] == "B" or b[0] == "B")
    plain_both = sum(1 for a in kids for b in kids if a[0] == "B" and b[0] == "B")
    assert Fraction(plain_both, plain_fit) == Fraction(1, 3)
    assert Fraction(1, 3) < p < Fraction(1, 2), p

    claims = {
        "1 in 3 — the day is useless": 1 / 3.0,
        "A bit under 4 in 10": 0.39,
        "1 in 2": 0.5,
        "9 in 10": 0.9,
    }
    assert set(claims) == set(q["choices"]), sorted(q["choices"])
    derived = nearest_choice(q, float(p), parse=lambda c: claims[c])

    N, kept, hits = 30_000, 0, 0
    for _ in range(N):
        fam = [(random.randrange(2), random.randrange(7)) for _ in range(2)]
        if any(c[0] == 0 and c[1] < 5 for c in fam):    # 0 == boy
            kept += 1
            hits += all(c[0] == 0 for c in fam)
    mc = hits / kept
    assert abs(mc - float(p)) < 0.025, (mc, float(p))
    return {
        "choice": derived,
        "value": "%d in %d — about %d%%" % (both, fit, round(float(p) * 100)),
        "notes": "196 equally likely families; %d fit the news and %d of those are two "
                 "boys -> %s = %.4f (plain 'at least one boy' gives 1/3); MC(%d, %d "
                 "kept) = %.4f" % (fit, both, p, float(p), N, kept, mc),
    }


# ---------------------------------------------------------------------------
# u7l2 — how you found out
# ---------------------------------------------------------------------------

def check_met_a_girl(q, data):
    """Eight equally likely stories: which family, and which child you met."""
    cases = [(fam, met) for fam in itertools.product("BG", repeat=2) for met in (0, 1)]
    assert len(cases) == 8
    girl_met = [(fam, met) for fam, met in cases if fam[met] == "G"]
    assert len(girl_met) == 4
    both = [c for c in girl_met if c[0] == ("G", "G")]
    assert len(both) == 2, both
    p = Fraction(len(both), len(girl_met))
    assert p == Fraction(1, 2), p

    # being TOLD 'at least one is a girl' is the other question, and gives 1/3
    told = [fam for fam in itertools.product("BG", repeat=2) if "G" in fam]
    p_told = Fraction(sum(1 for f in told if f == ("G", "G")), len(told))
    assert p_told == Fraction(1, 3)
    assert p > p_told

    claims = {"1 in 3, same as before": 1 / 3.0, "1 in 2": 0.5,
              "1 in 4": 0.25, "2 in 3": 2 / 3.0}
    assert set(claims) == set(q["choices"]), sorted(q["choices"])
    derived = nearest_choice(q, float(p), parse=lambda c: claims[c])

    N, kept, hits = 30_000, 0, 0
    for _ in range(N):
        fam = (random.randrange(2), random.randrange(2))     # 1 == girl
        met = fam[random.randrange(2)]
        if met == 1:
            kept += 1
            hits += fam == (1, 1)
    mc = hits / kept
    assert abs(mc - 0.5) < 0.02, mc
    return {
        "choice": derived,
        "value": "1 in %d" % (p.denominator // p.numerator),
        "notes": "8 equally likely (family, child you met) stories; 4 show a girl and "
                 "2 of those are girl-girl -> %s. Being told instead gives %s. "
                 "MC(%d, %d kept) = %.4f" % (p, p_told, N, kept, mc),
    }


def check_bertrand_boxes(q, data):
    """Six equally likely coins, not three equally likely boxes."""
    boxes = [("G", "G"), ("S", "S"), ("G", "S")]
    draws = [(b, i) for b in boxes for i in (0, 1)]
    assert len(draws) == 6
    gold = [(b, i) for b, i in draws if b[i] == "G"]
    assert len(gold) == 3, gold
    other_gold = [(b, i) for b, i in gold if b[1 - i] == "G"]
    assert len(other_gold) == 2, other_gold
    p = Fraction(len(other_gold), len(gold))
    assert p == Fraction(2, 3), p

    claims = {"1 in 2": 0.5, "2 in 3": 2 / 3.0, "1 in 3": 1 / 3.0, "3 in 4": 0.75}
    assert set(claims) == set(q["choices"]), sorted(q["choices"])
    derived = nearest_choice(q, float(p), parse=lambda c: claims[c])

    N, kept, hits = 30_000, 0, 0
    for _ in range(N):
        b = boxes[random.randrange(3)]
        i = random.randrange(2)
        if b[i] == "G":
            kept += 1
            hits += b[1 - i] == "G"
    mc = hits / kept
    assert abs(mc - float(p)) < 0.025, (mc, float(p))
    return {
        "choice": derived,
        "value": "%d in %d" % (p.numerator, p.denominator),
        "notes": "6 equally likely coin draws; 3 come out gold and 2 of those sit in "
                 "the gold-gold box -> %s; MC(%d, %d gold draws) = %.4f" % (
                     p, N, kept, mc),
    }


def check_workshop_split(q, data):
    """Simpson's reversal, from the counts the picture draws."""
    d = data["bayesgeo"]["workshop"]
    def r(pair):
        return Fraction(pair[0], pair[1])
    a_easy, a_hard = r(d["A"]["easy"]), r(d["A"]["hard"])
    b_easy, b_hard = r(d["B"]["easy"]), r(d["B"]["hard"])
    a_all = Fraction(d["A"]["easy"][0] + d["A"]["hard"][0],
                     d["A"]["easy"][1] + d["A"]["hard"][1])
    b_all = Fraction(d["B"]["easy"][0] + d["B"]["hard"][0],
                     d["B"]["easy"][1] + d["B"]["hard"][1])
    assert a_easy > b_easy, (a_easy, b_easy)
    assert a_hard > b_hard, (a_hard, b_hard)
    reversed_overall = b_all > a_all
    assert reversed_overall, (a_all, b_all)
    # the percentages the explanation quotes
    pct = lambda x: round(float(x) * 100)
    assert (pct(a_easy), pct(a_hard), pct(a_all)) == (93, 73, 78)
    assert (pct(b_easy), pct(b_hard), pct(b_all)) == (87, 69, 83)
    # and the reason: the two workshops take in opposite mixes of work
    a_hard_share = Fraction(d["A"]["hard"][1], d["A"]["easy"][1] + d["A"]["hard"][1])
    b_hard_share = Fraction(d["B"]["hard"][1], d["B"]["easy"][1] + d["B"]["hard"][1])
    assert a_hard_share > Fraction(1, 2) > b_hard_share, (a_hard_share, b_hard_share)
    # every job is harder than every easy job, for both shops
    assert a_hard < a_easy and b_hard < b_easy
    return {
        "bool": reversed_overall,
        "value": "true",
        "notes": "A beats B on easy (%d%% vs %d%%) and on hard (%d%% vs %d%%), yet "
                 "overall B wins %d%% to %d%%; A's intake is %.0f%% hard work against "
                 "B's %.0f%%" % (pct(a_easy), pct(b_easy), pct(a_hard), pct(b_hard),
                                 pct(b_all), pct(a_all),
                                 float(a_hard_share) * 100, float(b_hard_share) * 100),
    }


def check_stop_at_a_boy(q, data):
    """A family has k girls then a boy, with probability (1/2)^(k+1). The
    country-wide share of girls is total girls over total children."""
    KMAX = 200
    probs = [Fraction(1, 2) ** (k + 1) for k in range(KMAX)]
    tail = Fraction(1, 2) ** KMAX
    assert 1 - sum(probs) == tail
    e_girls = sum(k * probs[k] for k in range(KMAX))
    e_kids = sum((k + 1) * probs[k] for k in range(KMAX))
    assert abs(e_girls - 1) < Fraction(1, 2 ** 100), e_girls
    assert abs(e_kids - 2) < Fraction(1, 2 ** 100), e_kids
    share = e_girls / e_kids
    assert abs(share - Fraction(1, 2)) < Fraction(1, 2 ** 90), share
    # the per-FAMILY average fraction is a different number entirely: 1 - ln 2
    per_family = sum(Fraction(k, k + 1) * probs[k] for k in range(KMAX))
    assert abs(float(per_family) - (1 - math.log(2))) < 1e-9, float(per_family)

    N, girls, kids = 20_000, 0, 0
    for _ in range(N):
        g = 0
        while random.getrandbits(1):
            g += 1
        girls += g
        kids += g + 1
    mc = girls / kids * 100
    assert abs(mc - 50) < 2.0, mc
    return {
        "number": float(share) * 100,
        "value": "50",
        "notes": "E[girls per family] = %s and E[children per family] = %s, so girls "
                 "are %s of all children. (The average of the per-family fraction is a "
                 "different number, 1 - ln2 = %.4f.) MC(%d families, %d children) = "
                 "%.2f%%" % (e_girls.limit_denominator(10 ** 6),
                             e_kids.limit_denominator(10 ** 6),
                             share.limit_denominator(10 ** 6),
                             float(per_family), N, kids, mc),
    }


# ---------------------------------------------------------------------------
# u8l1 — bigger than it looks
# ---------------------------------------------------------------------------

def check_giant_weight(q, data):
    """Scale a lumpy voxel body by two: every cube becomes eight cubes. The
    ratio is exact and combinatorial, not a formula quoted back."""
    body = set()
    for x in range(5):
        for y in range(4):
            for z in range(11):
                if z > 8 and (x < 1 or x > 3 or y < 1 or y > 2):
                    continue                       # a head, narrower than the body
                if z < 4 and 1 < x < 3:
                    continue                       # the gap between two legs
                body.add((x, y, z))
    assert len(body) > 100
    doubled = set()
    for (x, y, z) in body:
        for dx in (0, 1):
            for dy in (0, 1):
                for dz in (0, 1):
                    doubled.add((2 * x + dx, 2 * y + dy, 2 * z + dz))
    weight_ratio = Fraction(len(doubled), len(body))
    assert weight_ratio == 8, weight_ratio

    # bone thickness is an area, and areas only go up four times
    cross = set((x, y) for (x, y, z) in body)
    cross2 = set()
    for (x, y) in cross:
        for dx in (0, 1):
            for dy in (0, 1):
                cross2.add((2 * x + dx, 2 * y + dy))
    area_ratio = Fraction(len(cross2), len(cross))
    assert area_ratio == 4, area_ratio
    assert weight_ratio / area_ratio == 2       # twice the load per unit of bone

    # a smooth body at a fixed grain agrees: lattice points inside a ball of
    # radius 12, against one of radius 24 (deterministic, no seed involved)
    def lattice_ball(r):
        c = 0
        for x in range(-r, r + 1):
            for y in range(-r, r + 1):
                rem = r * r - x * x - y * y
                if rem < 0:
                    continue
                c += 2 * int(math.isqrt(rem)) + 1
        return c

    small, big = lattice_ball(12), lattice_ball(24)
    smooth = big / float(small)
    assert abs(smooth - 8.0) < 0.15, (small, big, smooth)
    return {
        "number": float(weight_ratio),
        "value": "8",
        "notes": "a %d-voxel body scaled by 2 becomes %d voxels (ratio %s), while its "
                 "cross-section goes from %d to %d (ratio %s); a smooth ball counted on "
                 "a fixed grid goes %d -> %d, a factor of %.3f" % (
                     len(body), len(doubled), weight_ratio, len(cross), len(cross2),
                     area_ratio, small, big, smooth),
    }


def check_glass_shapes(q, data):
    glasses = data["bayesgeo"]["glasses"]
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(g["id"] for g in glasses), (ids, glasses)
    vol = {}
    for g in glasses:
        vol[g["id"]] = math.pi * (g["across"] / 2.0) ** 2 * g["height"]
    best = strict_max(vol)
    tallest = max(glasses, key=lambda g: g["height"])["id"]
    assert best != tallest, "the tallest glass should not be the biggest"
    ordered = sorted(vol.values())
    assert ordered[-1] - ordered[-2] > 20, ordered      # a clear margin, not a whisker
    assert abs(vol["tall"] - 565.49) < 0.01, vol["tall"]
    assert abs(vol["middle"] - 577.27) < 0.01, vol["middle"]
    assert abs(vol["wide"] - 603.19) < 0.01, vol["wide"]
    return {
        "region": best,
        "value": best,
        "notes": "volumes in ml: %s; the tallest is %r but the biggest is %r, ahead by "
                 "%.0f ml" % ({k: round(v) for k, v in vol.items()}, tallest, best,
                              ordered[-1] - ordered[-2]),
    }


def check_ball_in_box(q, data):
    ball = math.pi / 6.0                    # ball of diameter d inside a cube of side d
    circle = math.pi / 4.0                  # the 79% the prompt quotes
    assert abs(circle - 0.785398) < 1e-6, circle
    assert abs(ball - 0.523599) < 1e-6, ball
    assert round(circle * 100) == 79, circle
    assert ball < circle and ball > 0.5
    pct = ball * 100
    mc = mc_rate(lambda: (random.uniform(-1, 1) ** 2 + random.uniform(-1, 1) ** 2 +
                          random.uniform(-1, 1) ** 2) <= 1, 30_000)
    assert abs(mc - ball) < 0.02, (mc, ball)
    return {
        "choice": nearest_choice(q, pct),
        "value": "about %d%%" % round(pct),
        "notes": "circle in a square = pi/4 = %.4f (the 79%% in the prompt); ball in a "
                 "cube = pi/6 = %.4f; MC(30000 darts) = %.4f" % (circle, ball, mc),
    }


def check_goat_corner(q, data):
    side, rope = 10.0, 10.0
    # the barn fills the whole quadrant the rope is tied into, out to 10 m in both
    # directions, so exactly one of the four quarters of the circle is blocked
    assert rope <= side, "a longer rope would bend round the corners"
    blocked = Fraction(1, 4)
    reach = 1 - blocked
    assert reach == Fraction(3, 4), reach
    area = float(reach) * math.pi * rope ** 2
    assert abs(area - 235.6194) < 1e-3, area
    left_over = rope - side
    assert left_over == 0, "nothing left to wrap round either corner"

    # a longer rope really does open up more than three quarters
    longer = 15.0
    bigger = 0.75 * math.pi * longer ** 2 + 2 * 0.25 * math.pi * (longer - side) ** 2
    assert bigger > 0.75 * math.pi * longer ** 2

    N, on_disc, reachable = 30_000, 0, 0
    for _ in range(N):
        x = random.uniform(-rope, rope)
        y = random.uniform(-rope, rope)
        if x * x + y * y > rope * rope:
            continue
        on_disc += 1
        if not (x > 0 and y > 0):              # the barn sits in the first quadrant
            reachable += 1
    mc = reachable / on_disc
    assert abs(mc - float(reach)) < 0.02, (mc, float(reach))

    words = {Fraction(1, 1): "The whole circle", Fraction(3, 4): "Three quarters of it",
             Fraction(1, 2): "Half of it", Fraction(1, 4): "A quarter of it"}
    assert set(words.values()) == set(q["choices"]), sorted(q["choices"])
    return {
        "choice": words[reach],
        "value": "three quarters",
        "notes": "the barn blocks exactly one quadrant and the rope has %.0f m spare to "
                 "bend round a corner, so the goat gets %s of the circle = %.2f m2; "
                 "MC(%d points on the disc) = %.4f" % (
                     left_over, reach, area, on_disc, mc),
    }


# ---------------------------------------------------------------------------
# u8l2 — paths and pieces
# ---------------------------------------------------------------------------

def check_snap_stick(q, data):
    """Two cuts at x and y in the unit square. The three pieces close into a
    triangle exactly when none of them is longer than half the stick."""
    def shoelace(pts):
        s = Fraction(0)
        for i in range(len(pts)):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % len(pts)]
            s += x1 * y2 - x2 * y1
        return abs(s) / 2

    half = Fraction(1, 2)
    lower = [(Fraction(0), half), (half, half), (half, Fraction(1))]   # x < y
    upper = [(half, Fraction(0)), (half, half), (Fraction(1), half)]   # y < x
    area = shoelace(lower) + shoelace(upper)
    assert shoelace(lower) == Fraction(1, 8), shoelace(lower)
    assert area == Fraction(1, 4), area

    def works(x, y):
        lo, hi = min(x, y), max(x, y)
        p = (lo, hi - lo, 1 - hi)
        return max(p) < half

    # the two triangles really are the winning region: check on a fine grid
    n, inside, wrong = 200, 0, 0
    for i in range(n):
        for j in range(n):
            x = Fraction(2 * i + 1, 2 * n)
            y = Fraction(2 * j + 1, 2 * n)
            ok = works(x, y)
            inside += ok
            in_tri = (x < half < y and y - x < half) or (y < half < x and x - y < half)
            wrong += ok != in_tri
    assert wrong == 0, wrong
    grid = inside / float(n * n)
    assert abs(grid - 0.25) < 0.01, grid

    mc = mc_rate(lambda: works(random.random(), random.random()), 20_000)
    assert abs(mc - 0.25) < 0.02, mc
    return {
        "number": float(area) * 100,
        "value": "25",
        "notes": "the winning region is two triangles of area 1/8, total %s of the "
                 "square; a %dx%d grid agrees on every cell and gives %.4f; MC(20000) "
                 "= %.4f" % (area, n, n, grid, mc),
    }


def check_ant_room(q, data):
    """Unfold the box: three ways to lay two faces flat, three lengths."""
    r = data["bayesgeo"]["antRoom"]
    L, W, H = float(r["length"]), float(r["width"]), float(r["height"])
    routes = {
        "across the floor, up the long wall": (W, H, L),
        "across the floor, up the end wall": (L, H, W),
        "up the end wall, across the ceiling": (L, W, H),
    }
    lengths = {}
    for name, (a1, a2, b) in routes.items():
        closed = math.hypot(b, a1 + a2)
        # the same route walked as two straight legs, minimised over where it
        # crosses the shared edge — this is what the unfolding is claiming
        steps = 20_000
        best = min(math.hypot(b * i / steps, a1) + math.hypot(b * (1 - i / steps), a2)
                   for i in range(steps + 1))
        assert abs(best - closed) < 1e-3, (name, best, closed)
        lengths[name] = closed
    shortest = strict_min(lengths)
    best = lengths[shortest]
    assert abs(best - 15.0) < 1e-9, best
    assert abs(lengths["across the floor, up the end wall"] - math.sqrt(305)) < 1e-9
    assert abs(lengths["up the end wall, across the ceiling"] - math.sqrt(281)) < 1e-9

    # a third face cannot help: floor, then the long wall, then the ceiling
    grid, best3 = 120, 1e9
    for i in range(grid + 1):
        t1 = L * i / grid
        for j in range(grid + 1):
            t2 = L * j / grid
            d = math.hypot(t1, W) + math.hypot(t2 - t1, H) + abs(L - t2)
            best3 = min(best3, d)
    assert best3 >= best - 1e-9, (best3, best)

    edges = L + W + H
    through_air = math.sqrt(L * L + W * W + H * H)
    assert abs(edges - 21.0) < 1e-9
    assert through_air < best, "the straight line through the air is the trap"
    assert abs(through_air - 13.6015) < 1e-3, through_air
    return {
        "choice": nearest_choice(q, best),
        "value": "%g metres" % best,
        "notes": "unfoldings: %s -> shortest %r at %.4f m (checked leg by leg over "
                 "20000 crossing points, and a three-face route cannot beat it: %.4f). "
                 "Along the edges is %.0f m and straight through the air %.3f m" % (
                     {k: round(v, 3) for k, v in lengths.items()}, shortest, best,
                     best3, edges, through_air),
    }


def check_meeting_window(q, data):
    wait = Fraction(1, 4)                     # a quarter of the hour-long window
    miss = (1 - wait) ** 2                    # the two corner triangles, together
    p = 1 - miss
    assert p == Fraction(7, 16), p
    pct = float(p) * 100
    assert abs(pct - 43.75) < 1e-12
    assert p < Fraction(1, 2) and p > Fraction(1, 4)

    def meets():
        return abs(random.random() - random.random()) <= 0.25

    mc = mc_rate(meets, 20_000) * 100
    assert abs(mc - pct) < 3.0, (mc, pct)
    return {
        "number": pct,
        "value": "%d" % round(pct),
        "notes": "the square minus two corner triangles of side 3/4: 1 - (3/4)^2 = %s "
                 "= %.2f%%; MC(20000 days) = %.2f%%" % (p, pct, mc),
    }


def check_mobius_cut(q, data):
    """Model the band as a ring of cells, glue the ends (with a flip for the
    Mobius band, without for a plain loop), remove the middle column, and count
    the pieces with a union-find."""
    def pieces(around, across, flip):
        cut = across // 2
        cells = [(i, j) for i in range(around) for j in range(across) if j != cut]
        idx = dict((c, k) for k, c in enumerate(cells))
        parent = list(range(len(cells)))

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        def union(a, b):
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb

        for (i, j) in cells:
            if (i, j + 1) in idx:
                union(idx[(i, j)], idx[(i, j + 1)])
            if i + 1 < around:
                if (i + 1, j) in idx:
                    union(idx[(i, j)], idx[(i + 1, j)])
            else:                                   # the glued seam
                partner = (0, across - 1 - j) if flip else (0, j)
                if partner in idx:
                    union(idx[(i, j)], idx[partner])
        roots = set(find(k) for k in range(len(cells)))
        sizes = {}
        for k in range(len(cells)):
            sizes[find(k)] = sizes.get(find(k), 0) + 1
        return len(roots), sorted(sizes.values()), cells, idx, find

    around, across = 24, 5
    n_mob, sizes_mob, cells, idx, find = pieces(around, across, True)
    n_cyl, sizes_cyl = pieces(around, across, False)[:2]
    assert n_cyl == 2, n_cyl                      # the untwisted loop does fall apart
    assert sizes_cyl == [around * 2, around * 2]
    assert n_mob == 1, n_mob                      # the twisted one does not
    assert sizes_mob == [around * (across - 1)]
    # the survivor is twice as long: one piece covering both halves all the way round
    assert find(idx[(0, 0)]) == find(idx[(0, across - 1)])
    derived = n_mob == 2
    assert derived is False
    return {
        "bool": derived,
        "value": "false",
        "notes": "ring of %d x %d cells with the middle column cut away: glued with a "
                 "flip it stays in %d piece of %d cells (both halves joined), glued "
                 "flat it falls into %d pieces of %s" % (
                     around, across, n_mob, sizes_mob[0], n_cyl, sizes_cyl),
    }


def check_peg_hole(q, data):
    round_in_square = math.pi / 4.0            # circle inside the square around it
    square_in_round = 2.0 / math.pi            # biggest square inside that circle
    assert abs(round_in_square - 0.785398) < 1e-6, round_in_square
    assert abs(square_in_round - 0.636620) < 1e-6, square_in_round
    fits = {
        "The round peg in the square hole": round_in_square,
        "The square peg in the round hole": square_in_round,
    }
    for c in fits:
        assert c in q["choices"], c
    best = strict_max(fits)
    assert fits[best] / min(fits.values()) > 1.2, fits

    def round_peg():
        x, y = random.uniform(-1, 1), random.uniform(-1, 1)
        return x * x + y * y <= 1

    def square_peg():
        while True:
            x, y = random.uniform(-1, 1), random.uniform(-1, 1)
            if x * x + y * y <= 1:
                break
        h = math.sqrt(0.5)
        return abs(x) <= h and abs(y) <= h

    mc_r = mc_rate(round_peg, 20_000)
    mc_s = mc_rate(square_peg, 20_000)
    assert abs(mc_r - round_in_square) < 0.02, mc_r
    assert abs(mc_s - square_in_round) < 0.02, mc_s
    assert mc_r > mc_s
    return {
        "choice": best,
        "value": "%s (%d%% against %d%%)" % (
            best[0].lower() + best[1:], round(round_in_square * 100),
            round(square_in_round * 100)),
        "notes": "circle in its square = pi/4 = %.4f, square in its circle = 2/pi = "
                 "%.4f; darts give %.4f and %.4f" % (
                     round_in_square, square_in_round, mc_r, mc_s),
    }


CHECKERS = {
    "two_aces_news": check_two_aces_news,
    "taxi_witness": check_taxi_witness,
    "clumsy_host": check_clumsy_host,
    "envelope_swap": check_envelope_swap,
    "boy_weekday": check_boy_weekday,
    "met_a_girl": check_met_a_girl,
    "bertrand_boxes": check_bertrand_boxes,
    "workshop_split": check_workshop_split,
    "stop_at_a_boy": check_stop_at_a_boy,
    "giant_weight": check_giant_weight,
    "glass_shapes": check_glass_shapes,
    "ball_in_box": check_ball_in_box,
    "goat_corner": check_goat_corner,
    "snap_stick": check_snap_stick,
    "ant_room": check_ant_room,
    "meeting_window": check_meeting_window,
    "mobius_cut": check_mobius_cut,
    "peg_hole": check_peg_hole,
}
