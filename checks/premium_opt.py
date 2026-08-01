"""Checkers for the two speed sets: "Optiver speed round" and "Mental maths
under pressure".

Everything here is arithmetic, so almost everything is derived EXACTLY —
Fractions and enumeration, never floating point where a Fraction will do. The
one Monte Carlo (the too-tight quote) also has a closed form beside it, and the
two are asserted to agree.

Every checker re-derives the trick as well as the answer: if the explanation
claims the two strips of an 85-square come to 800, this file asserts 800.
"""

import math
import random
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    only_choice,
    strict_max,
)


def _d(data):
    """Our slice of the bank's vizData."""
    d = (data or {}).get("premiumOpt")
    assert d, "vizData['premiumOpt'] is missing"
    return d


def _frac(text):
    """'3/8' or '0.45' -> an exact Fraction."""
    text = text.strip()
    if "/" in text:
        top, bottom = text.split("/")
        return Fraction(int(top), int(bottom))
    return Fraction(text)


def _digit_root(n):
    """Add the digits until one is left (1..9, and 0 only for 0)."""
    n = abs(int(n))
    while n > 9:
        n = sum(int(c) for c in str(n))
    return n


# ===========================================================================
# Optiver speed round
# ===========================================================================

def check_opt_spread_read(q, data):
    m = _d(data)["spread"]
    bid, ask, fair = m["bid"], m["ask"], m["fair"]
    buy_edge = fair - ask                       # you can only buy at the ask
    sell_edge = bid - fair                      # you can only sell at the bid
    assert (bid, ask, fair) == (41, 46, 44)
    assert buy_edge == -2 and sell_edge == -3
    assert buy_edge < 0 and sell_edge < 0, "one side would actually pay"
    assert bid < fair < ask, "fair value is not inside the market"
    return {
        "choice": only_choice(q, "Stand aside"),
        "value": "stand aside",
        "notes": "buy at %d: %+d, sell at %d: %+d - both negative" % (
            ask, buy_edge, bid, sell_edge),
    }


def check_opt_edge_pounds(q, data):
    m = _d(data)["spread"]
    ask, fair = m["ask"], m["fairHigh"]
    edge = fair - ask
    assert edge == 4
    assert fair - m["bid"] == 9, "the whole-market number should be 9"
    assert ask - m["bid"] == 5, "the width should be 5"
    return {
        "number": float(edge),
        "value": "4",
        "notes": "paid %d, worth %d, edge %d (not %d, not %d)" % (
            ask, fair, edge, fair - m["bid"], ask - m["bid"]),
    }


def check_opt_cross_cost(q, data):
    m = _d(data)["roundTrip"]
    bid, ask = m["bid"], m["ask"]
    width = ask - bid
    pnl = bid - ask                             # buy at the ask, sell at the bid
    mid = Fraction(bid + ask, 2)
    assert Fraction(ask) - mid == Fraction(width, 2), "each leg should cost half"
    assert pnl == -width, "the round trip should cost the whole width"
    full_width = (pnl == -width)
    return {
        "bool": bool(full_width),
        "value": "true" if full_width else "false",
        "notes": "buy %d sell %d -> %+d, and the width is %d" % (ask, bid, pnl, width),
    }


def check_opt_quote_width(q, data):
    m = _d(data)["quote"]
    lo, hi, bid, ask = m["low"], m["high"], m["bid"], m["ask"]
    span = hi - lo

    # closed form: the counterparty trades only when it suits them, so your
    # P&L is minus the area of the two tails outside your quote
    up = Fraction((hi - ask) ** 2, 2 * span)
    down = Fraction((bid - lo) ** 2, 2 * span)
    exact = -(up + down)
    assert up == down == Fraction(9025, 400), "each tail should be 22.5625"
    assert float(exact) < -40, "a ten-wide quote should bleed badly"

    # nothing you can ever win: the trade only happens on the losing side
    p_win = 0.0

    # Monte Carlo cross-check of the same model
    total, trades = 0.0, 0
    for _ in range(8000):
        truth = random.uniform(lo, hi)
        if truth > ask:
            total += ask - truth
            trades += 1
        elif truth < bid:
            total += truth - bid
            trades += 1
    mc = total / 8000.0
    assert abs(mc - float(exact)) < 4.0, "MC %.2f vs exact %.2f" % (mc, float(exact))

    # widen the quote past the whole range of possibilities and it stops losing
    wide_bid, wide_ask = lo - 1, hi + 1
    wide_pnl, wide_trades = 0.0, 0
    for _ in range(2000):
        truth = random.uniform(lo, hi)
        if truth > wide_ask:
            wide_pnl += wide_ask - truth
            wide_trades += 1
        elif truth < wide_bid:
            wide_pnl += truth - wide_bid
            wide_trades += 1
    assert wide_trades == 0 and wide_pnl == 0.0, \
        "a quote wider than the uncertainty should never be picked off"

    return {
        "choice": only_choice(q, "wrong about"),
        "value": "you get picked off on the side you are wrong about",
        "notes": "expected %.2f a customer (MC %.2f), chance of profit %.0f%%" % (
            float(exact), mc, p_win * 100),
    }


def check_opt_percent_undo(q, data):
    fall = Fraction(_d(data)["recover"]["fallPercent"], 100)
    after = 1 - fall
    rise = (1 - after) / after
    assert after == Fraction(4, 5)
    assert rise == Fraction(1, 4), "the climb back should be a quarter"
    pct = rise * 100
    assert after * (1 + rise) == 1, "it should land exactly back at the start"
    return {
        "number": float(pct),
        "value": "25",
        "notes": "100 -> 80, and 20 on a base of 80 is %s = %s%%" % (rise, pct),
    }


def check_opt_percent_order(q, data):
    up, down = Fraction(11, 10), Fraction(9, 10)
    a = 1 * up * down
    b = 1 * down * up
    assert a == b == Fraction(99, 100)
    different = (a != b)
    return {
        "bool": bool(different),
        "value": "true" if different else "false",
        "notes": "both orders land on %s of the pound" % a,
    }


def check_opt_sixteenths_order(q, data):
    prices = _d(data)["sixteenths"]["prices"]
    assert sorted(prices) == sorted(q["items"]), "bank and vizData disagree"
    order = sorted(prices, key=_frac)
    vals = [_frac(p) for p in order]
    for i in range(len(vals) - 1):
        assert vals[i] < vals[i + 1], "two prices tie: %s" % order
    assert _frac("7/16") == Fraction(7, 16) == Fraction(4375, 10000)
    assert _frac("3/8") == Fraction(375, 1000)
    return {
        "order": order,
        "value": ", ".join(order),
        "notes": " < ".join("%s=%s" % (p, float(v)) for p, v in zip(order, vals)),
    }


def check_opt_births_estimate(q, data):
    b = _d(data)["births"]
    per_year = Fraction(b["population"], b["lifeYears"])
    per_second = per_year / b["secondsPerYear"]
    assert 1.0e8 < float(per_year) < 1.2e8, "should be about 110 million a year"
    assert 3.0 < float(per_second) < 4.0
    return {
        "choice": nearest_choice(q, float(per_second)),
        "value": "about 4 a second",
        "notes": "%.0f a year, %.2f a second" % (float(per_year), float(per_second)),
    }


def check_opt_basis_points(q, data):
    b = _d(data)["basisPoints"]
    pounds = Fraction(b["book"]) * Fraction(b["bps"], 10000)
    assert Fraction(b["book"], 100) == 42000, "one percent should be 42,000"
    assert pounds == 14700
    return {
        "number": float(pounds),
        "value": "14700",
        "notes": "%d bp = %s%% of %d = %s" % (
            b["bps"], float(Fraction(b["bps"], 100)), b["book"], pounds),
    }


def check_opt_maker_volume(q, data):
    m = _d(data)["maker"]
    bid, ask, lots, ppp = m["bid"], m["ask"], m["lots"], m["poundsPerPoint"]
    mid = Fraction(bid + ask, 2)
    from_a_buyer = Fraction(ask) - mid          # they lift your offer
    from_a_seller = mid - Fraction(bid)         # they hit your bid
    assert from_a_buyer == from_a_seller == 1, "half the width should be 1"
    # enumerate every possible split of the day's flow: the total never moves
    totals = set()
    for buys in range(0, lots + 1, 40):
        sells = lots - buys
        totals.add(buys * from_a_buyer * ppp + sells * from_a_seller * ppp)
    assert totals == {400}, "the answer should not depend on the mix: %s" % totals
    return {
        "number": 400.0,
        "value": "400",
        "notes": "%d lots x half the width (%s) x £%d = 400, whatever the mix" % (
            lots, from_a_buyer, ppp),
    }


def check_opt_pick_market(q, data):
    d = _d(data)
    fair = d["marketFair"]
    edges = {}
    for m in d["markets"]:
        # the best you can do: sell at their bid, or buy at their ask
        edges[m["id"]] = max(m["bid"] - fair, fair - m["ask"])
    winners = [k for k, v in edges.items() if v > 0]
    assert len(winners) == 1, "exactly one market must pay: %s" % edges
    best = strict_max(edges)
    assert best == winners[0]
    chosen = [m for m in d["markets"] if m["id"] == best][0]
    trap = [m for m in d["markets"] if m["id"] == "b"][0]
    assert Fraction(trap["bid"] + trap["ask"], 2) > fair, "B's middle should look rich"
    assert trap["bid"] - fair < 0, "but B's bid should still lose money"
    ids = [r["id"] for r in q["regions"]]
    assert set(ids) == set(edges), "regions and vizData disagree"
    return {
        "region": best,
        "value": "%d bid at %d" % (chosen["bid"], chosen["ask"]),
        "notes": "best edge per screen: %s" % edges,
    }


def check_opt_spread_percent(q, data):
    shares = _d(data)["shares"]
    rel = {}
    for s in shares:
        width = Fraction(str(s["ask"])) - Fraction(str(s["bid"]))
        mid = (Fraction(str(s["ask"])) + Fraction(str(s["bid"]))) / 2
        rel[s["label"]] = width / mid * 100
    widest_in_pennies = strict_max(
        {s["label"]: Fraction(str(s["ask"])) - Fraction(str(s["bid"])) for s in shares})
    dearest = strict_max(rel)
    assert widest_in_pennies != dearest, "the two rulers should disagree"
    assert 0.9 < float(rel["200 at 202"]) < 1.1
    assert 2.8 < float(rel["20 at 20.6"]) < 3.1
    return {
        "choice": only_choice(q, "20 at 20.6"),
        "value": "the 20 at 20.6",
        "notes": "%s" % {k: round(float(v), 2) for k, v in rel.items()},
    }


# ===========================================================================
# Mental maths under pressure
# ===========================================================================

def check_mm_eleven_slide(q, data):
    n, tens, units = 78, 7, 8
    assert n == tens * 10 + units
    middle = tens + units
    by_trick = tens * 100 + middle * 10 + units       # carry handled by place value
    plain = n * 11
    assert middle == 15, "the digits should sum to 15"
    assert by_trick == plain == 858
    assert 36 * 11 == 3 * 100 + 9 * 10 + 6 == 396, "the no-carry case"
    return {
        "number": float(plain),
        "value": "858",
        "notes": "7 | 7+8 | 8 = 7|15|8, carry the one -> 858",
    }


def check_mm_ends_in_five(q, data):
    a = 8
    n = a * 10 + 5
    square = n * n
    front, back = divmod(square, 100)
    assert n == 85 and square == 7225
    assert back == 25, "a five-ender must end in 25"
    assert front == a * (a + 1) == 72, "the front should be 8 x 9"
    # the picture: big block + two strips + corner
    assert (a * 10) ** 2 + 2 * (a * 10 * 5) + 25 == square
    assert (a * 10) ** 2 == 6400 and 2 * (a * 10 * 5) == 800
    for other in (25, 65):
        b = other // 10
        assert other * other == b * (b + 1) * 100 + 25
    return {
        "number": float(front),
        "value": "72",
        "notes": "6400 + 800 + 25 = 7225, so the front is %d = 8x9" % front,
    }


def check_mm_either_side(q, data):
    k = 3
    left, right = 50 - k, 50 + k
    product = left * right
    claim = 50 * 50 - k * k
    assert (left, right) == (47, 53)
    assert product == claim == 2491
    assert 98 * 102 == 10000 - 4, "the same trick further out"
    exactly_nine_less = (product == 2500 - 9)
    return {
        "bool": bool(exactly_nine_less),
        "value": "true" if exactly_nine_less else "false",
        "notes": "47x53 = %d, and 2500 - 9 = %d" % (product, claim),
    }


def check_mm_percent_flip(q, data):
    one_way = Fraction(8, 100) * 25
    other_way = Fraction(25, 100) * 8
    assert one_way == other_way == 2
    assert Fraction(18, 100) * 50 == Fraction(50, 100) * 18 == 9
    assert Fraction(4, 100) * 75 == Fraction(75, 100) * 4 == 3
    return {
        "number": float(one_way),
        "value": "2",
        "notes": "8%% of 25 = %s = 25%% of 8" % one_way,
    }


def check_mm_percent_ladder(q, data):
    bill = Fraction(240)
    tenth = bill / 10
    five = tenth / 2
    two_half = five / 2
    ladder = tenth + five + two_half
    straight = bill * Fraction(175, 1000)
    assert (tenth, five, two_half) == (24, 12, 6)
    assert ladder == straight == 42
    return {
        "number": float(ladder),
        "value": "42",
        "notes": "24 + 12 + 6 = %s, and 17.5%% of 240 = %s" % (ladder, straight),
    }


def check_mm_halve_double(q, data):
    chain = [(35, 16)]
    while chain[-1][1] > 1:
        a, b = chain[-1]
        assert b % 2 == 0
        chain.append((a * 2, b // 2))
    products = set(a * b for a, b in chain)
    assert products == {560}, "the area moved: %s" % products
    assert chain[-1] == (560, 1)
    return {
        "number": 560.0,
        "value": "560",
        "notes": " -> ".join("%dx%d" % p for p in chain),
    }


def check_mm_sixteenth_tap(q, data):
    target = Fraction(375, 1000)
    hits = []
    for r in q["regions"]:
        top, bottom = r["label"].split("/")
        assert int(bottom) == 16, "the ruler is in sixteenths"
        if Fraction(int(top), int(bottom)) == target:
            hits.append((r["id"], int(top)))
    assert len(hits) == 1, "%d ticks sit at 0.375" % len(hits)
    rid, top = hits[0]
    assert Fraction(1, 16) == Fraction(625, 10000), "a sixteenth is 0.0625"
    assert Fraction(top, 16) == Fraction(3, 8) == 6 * Fraction(625, 10000)
    return {
        "region": rid,
        "value": "%d/16" % top,
        "notes": "3/8 = 0.375 = %d sixteenths" % top,
    }


def check_mm_compound_shortcut(q, data):
    c = _d(data)["compound"]
    rate, years = Fraction(str(c["rate"])), c["years"]
    factor = (1 + rate) ** years
    really = (factor - 1) * 100
    quick = rate * years * 100
    assert quick == 75
    assert 108 < float(really) < 111, "should be about 110% bigger"
    assert factor > 2, "the money should more than double"
    # the same shortcut is fine over a handful of years
    short = ((1 + rate) ** 3 - 1) * 100
    assert abs(float(short) - float(rate * 3 * 100)) < 0.5
    return {
        "choice": nearest_choice(q, float(really)),
        "value": "about 110% bigger",
        "notes": "1.03^25 = %.4f, so %.1f%% bigger, not %d%%" % (
            float(factor), float(really), quick),
    }


def check_mm_sqrt_estimate(q, data):
    base, target = 8, 70
    leftover = target - base * base
    estimate = base + Fraction(leftover, 2 * base)
    truth = math.sqrt(target)
    assert leftover == 6
    assert estimate == Fraction(67, 8) == Fraction(8375, 1000)
    assert abs(float(estimate) - truth) < 0.01, "the trick should be very close"
    assert float(estimate) ** 2 > target, "the estimate always overshoots slightly"
    return {
        "number": float(estimate),
        "value": "%.2f" % truth,
        "notes": "8 + 6/16 = %s, true root %.4f" % (float(estimate), truth),
    }


def check_mm_cast_nines(q, data):
    a, b, claimed = 47, 63, 2861
    left = _digit_root(_digit_root(a) * _digit_root(b))
    assert _digit_root(a) == 2 and _digit_root(b) == 9
    assert _digit_root(2 * 9) == 9
    assert _digit_root(claimed) == 8
    caught = left != _digit_root(claimed)
    real = a * b
    assert real == 2961
    assert _digit_root(real) == left, "the real answer must pass the check"
    return {
        "bool": bool(caught),
        "value": "true" if caught else "false",
        "notes": "sides fold to %d, but 2861 folds to %d (2961 folds to %d)" % (
            left, _digit_root(claimed), _digit_root(real)),
    }


def check_mm_average_speed(q, data):
    t = _d(data)["trip"]
    miles, out, back = t["miles"], t["out"], t["back"]
    hours = Fraction(miles, out) + Fraction(miles, back)
    average = Fraction(2 * miles) / hours
    naive = Fraction(out + back, 2)
    assert hours == 3 and average == 40
    assert naive == 45 and naive != average, "the fast wrong answer is 45"
    # however fast you come home, the round trip cannot reach twice the slow leg
    for fast in (120, 600, 100000):
        cap = Fraction(2 * miles) / (Fraction(miles, out) + Fraction(miles, fast))
        assert cap < 2 * out, "round trip beat twice the slow speed"
    return {
        "choice": nearest_choice(q, float(average)),
        "value": "40 mph",
        "notes": "%s hours for %d miles -> %s mph (not %s)" % (
            hours, 2 * miles, average, naive),
    }


def check_mm_points_vs_percent(q, data):
    fee = _d(data)["fee"]
    before, after = Fraction(fee["before"]), Fraction(fee["after"])
    points = after - before
    relative = (after / before - 1) * 100
    assert points == 1 and relative == 100
    picked = only_choice(q, "percentage point")
    assert "doubles" in picked, "the winning choice must say the fee doubles"
    return {
        "choice": picked,
        "value": "one percentage point, a %d%% rise" % int(relative),
        "notes": "1%% -> 2%% is %s point and %s%% more money" % (points, relative),
    }


CHECKERS = {
    "opt_spread_read": check_opt_spread_read,
    "opt_edge_pounds": check_opt_edge_pounds,
    "opt_cross_cost": check_opt_cross_cost,
    "opt_quote_width": check_opt_quote_width,
    "opt_percent_undo": check_opt_percent_undo,
    "opt_percent_order": check_opt_percent_order,
    "opt_sixteenths_order": check_opt_sixteenths_order,
    "opt_births_estimate": check_opt_births_estimate,
    "opt_basis_points": check_opt_basis_points,
    "opt_maker_volume": check_opt_maker_volume,
    "opt_pick_market": check_opt_pick_market,
    "opt_spread_percent": check_opt_spread_percent,
    "mm_eleven_slide": check_mm_eleven_slide,
    "mm_ends_in_five": check_mm_ends_in_five,
    "mm_either_side": check_mm_either_side,
    "mm_percent_flip": check_mm_percent_flip,
    "mm_percent_ladder": check_mm_percent_ladder,
    "mm_halve_double": check_mm_halve_double,
    "mm_sixteenth_tap": check_mm_sixteenth_tap,
    "mm_compound_shortcut": check_mm_compound_shortcut,
    "mm_sqrt_estimate": check_mm_sqrt_estimate,
    "mm_cast_nines": check_mm_cast_nines,
    "mm_average_speed": check_mm_average_speed,
    "mm_points_vs_percent": check_mm_points_vs_percent,
}
