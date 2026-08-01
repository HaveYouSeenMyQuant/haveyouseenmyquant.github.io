"""Checkers for unit 11 — chains with a memory, and where they settle.

Nothing here is quoted from a textbook. The ring, the weather, the maze and the
websites are all solved as linear systems in exact Fractions, straight from the
same numbers the visuals draw from (QQ_DATA.vizData.markov). The gas box is
solved twice over — once by its stationary distribution and once by an
independent hitting-time system — because 1,024 is the sort of answer that
looks like it was assumed. The recurrence of a two-dimensional random walk is
derived from the standard criterion, by showing the return sum diverges. The
seven riffle shuffles come from the Bayer–Diaconis distribution built out of
Eulerian numbers, in exact integer arithmetic.

Monte Carlo appears only as a cross-check, and every one of them is small.
"""

import math
import random
from fractions import Fraction

from checks._helpers import (
    first_number,
    nearest_choice,
    strict_max,
)


def _mk(data):
    assert "markov" in data, "vizData.markov is missing"
    return data["markov"]


def _solve(rows):
    """Exact Gauss-Jordan. rows is an augmented n x (n+1) matrix of Fractions."""
    n = len(rows)
    M = [list(r) for r in rows]
    for c in range(n):
        p = next((r for r in range(c, n) if M[r][c] != 0), None)
        assert p is not None, "singular system"
        M[c], M[p] = M[p], M[c]
        pv = M[c][c]
        M[c] = [v / pv for v in M[c]]
        for r in range(n):
            if r != c and M[r][c] != 0:
                fac = M[r][c]
                M[r] = [a - fac * b for a, b in zip(M[r], M[c])]
    return [M[i][n] for i in range(n)]


def _stationary(trans):
    """Stationary distribution of an n x n row-stochastic Fraction matrix."""
    n = len(trans)
    for row in trans:
        assert sum(row) == 1, "row does not sum to 1: %s" % (row,)
    rows = []
    for j in range(n - 1):                       # balance equations, one dropped
        rows.append([trans[i][j] - (Fraction(1) if i == j else Fraction(0))
                     for i in range(n)] + [Fraction(0)])
    rows.append([Fraction(1)] * n + [Fraction(1)])
    pi = _solve(rows)
    assert sum(pi) == 1 and all(p >= 0 for p in pi), pi
    for j in range(n):                           # and check the dropped one too
        assert sum(pi[i] * trans[i][j] for i in range(n)) == pi[j]
    return pi


# ---------------------------------------------------------------------------
# u11l1 — round and round
# ---------------------------------------------------------------------------

def check_ring_return(q, data):
    n = _mk(data)["ringPads"]
    assert n == 6, n

    # 1. hitting times: h[i] = expected hops from pad i to pad 0, solved exactly
    rows = []
    for i in range(1, n):
        row = [Fraction(0)] * (n - 1) + [Fraction(1)]
        row[i - 1] = Fraction(1)
        for nb in ((i - 1) % n, (i + 1) % n):
            if nb != 0:
                row[nb - 1] -= Fraction(1, 2)
        rows.append(row)
    h = [Fraction(0)] + _solve(rows)
    assert h == [Fraction(0)] + [Fraction(i * (n - i)) for i in range(1, n)], h
    ret = 1 + (h[1] + h[n - 1]) / 2

    # 2. the same number from the stationary distribution, which is what makes
    #    it a rule rather than an accident: every pad is visited 1/n of the time
    trans = [[Fraction(1, 2) if (j - i) % n in (1, n - 1) else Fraction(0)
              for j in range(n)] for i in range(n)]
    pi = _stationary(trans)
    assert all(p == Fraction(1, n) for p in pi), pi
    assert ret == 1 / pi[0] == n, (ret, pi[0])

    # 3. and a small simulation, walking the ring for real
    trips, hops = 3000, 0
    for _ in range(trips):
        at, k = 0, 0
        while True:
            at = (at + (1 if random.getrandbits(1) else -1)) % n
            k += 1
            if at == 0:
                break
        hops += k
    mc = hops / float(trips)
    assert abs(mc - n) < 1.2, mc
    return {
        "number": float(ret),
        "value": "6",
        "notes": "hitting times %s; stationary 1/6 on every pad so the return "
                 "time is 6; %d simulated trips averaged %.2f" % (
                     [str(x) for x in h], trips, mc),
    }


def _weather(data):
    w = _mk(data)["weather"]
    rr = Fraction(w["rainAfterRain"]).limit_denominator(1000)
    dr = Fraction(w["rainAfterDry"]).limit_denominator(1000)
    assert rr == Fraction(1, 2) and dr == Fraction(1, 4), (rr, dr)
    # states: 0 = rainy, 1 = dry
    return [[rr, 1 - rr], [dr, 1 - dr]]


def check_weather_steady(q, data):
    trans = _weather(data)
    pi = _stationary(trans)
    assert pi[0] == Fraction(1, 3), pi
    pct = float(pi[0]) * 100
    derived = nearest_choice(q, pct)

    # cross-check: a long simulated run of the town's own weather
    at, rainy, days = 0, 0, 20000
    for _ in range(days):
        p = trans[at][0]
        at = 0 if random.random() < float(p) else 1
        rainy += 1 if at == 0 else 0
    assert abs(rainy / float(days) - 1 / 3.0) < 0.02, rainy / float(days)
    return {
        "choice": derived,
        "value": "33%",
        "notes": "balance: pi_rain = pi_rain/2 + (1-pi_rain)/4 gives exactly 1/3; "
                 "%d simulated days came out %.1f%% rainy" % (days, 100.0 * rainy / days),
    }


def check_chain_forgets(q, data):
    trans = _weather(data)
    pi = _stationary(trans)
    # start from certainty either way and push both forward, exactly
    a, b = [Fraction(1), Fraction(0)], [Fraction(0), Fraction(1)]
    gaps = []
    for _ in range(40):
        a = [sum(a[i] * trans[i][j] for i in range(2)) for j in range(2)]
        b = [sum(b[i] * trans[i][j] for i in range(2)) for j in range(2)]
        gaps.append(abs(a[0] - b[0]))
    # the gap shrinks by exactly the same factor every day and heads to zero
    ratios = set(gaps[i + 1] / gaps[i] for i in range(len(gaps) - 1))
    assert ratios == {Fraction(1, 4)}, ratios
    assert gaps[0] == Fraction(1, 4) and gaps[13] < Fraction(1, 10 ** 8), gaps[13]
    assert abs(a[0] - pi[0]) < Fraction(1, 10 ** 20)
    assert abs(b[0] - pi[0]) < Fraction(1, 10 ** 20)
    same = True
    return {
        "bool": same,
        "value": "true",
        "notes": "the gap between the two starts is exactly 1/4 on day 1 and is "
                 "multiplied by 1/4 every day after; by day 14 it is under 1e-8 "
                 "and both towns sit on the stationary 1/3",
    }


def check_mouse_maze(q, data):
    maze = _mk(data)["maze"]
    rooms, doors, start = maze["rooms"], maze["doors"], maze["start"]
    adj = {r: [] for r in rooms}
    for a, b in doors:
        if a in adj:
            adj[a].append(b)
        if b in adj:
            adj[b].append(a)
    assert adj["First"] == ["Middle"], adj
    assert sorted(adj["Middle"]) == ["First", "Last"], adj
    assert sorted(adj["Last"]) == ["Middle", "OUT"], adj

    idx = {r: i for i, r in enumerate(rooms)}
    rows = []
    for r in rooms:
        row = [Fraction(0)] * len(rooms) + [Fraction(1)]
        row[idx[r]] = Fraction(1)
        for nb in adj[r]:
            if nb != "OUT":
                row[idx[nb]] -= Fraction(1, len(adj[r]))
        rows.append(row)
    e = _solve(rows)
    got = dict(zip(rooms, e))
    assert got["Last"] == 5 and got["Middle"] == 8 and got["First"] == 9, got

    runs, total = 4000, 0
    for _ in range(runs):
        at, steps = start, 0
        while at != "OUT":
            at = random.choice(adj[at])
            steps += 1
        total += steps
    mc = total / float(runs)
    assert abs(mc - 9) < 0.8, mc
    return {
        "number": float(got[start]),
        "value": "9",
        "notes": "exact waits %s; %d simulated mice averaged %.2f minutes" % (
            {k: str(v) for k, v in got.items()}, runs, mc),
    }


def check_drunk_returns(q, data):
    """Recurrent iff the expected number of visits to the start is infinite,
    i.e. iff the sum of the return probabilities diverges. In two dimensions
    P(back at the start after 2n steps) = (C(2n,n)/4^n)^2, and n times that
    tends to 1/pi — so the series behaves like the harmonic one and diverges."""
    # C(2n,n)/4^n, built up one step at a time so nothing overflows
    central, partial, tail = 1.0, 0.0, []
    for n in range(1, 2001):
        central *= (2 * n - 1) / float(2 * n)
        partial += central * central
        if n in (100, 400, 1000, 2000):
            tail.append(n * central * central)
    assert abs(central - 1 / math.sqrt(math.pi * 2000)) < 1e-5, central
    for v in tail:
        assert abs(v - 1 / math.pi) < 0.01, (v, 1 / math.pi)
    # harmonic comparison: the sum past 2000 is at least (1/pi - eps) * ln(N/2000)
    assert partial > 2.0, partial
    assert partial + (1 / math.pi - 0.01) * math.log(10 ** 9 / 2000.0) > 6, partial

    # and the contrast the explanation claims: three dimensions does NOT come back
    def walk_returns(dim, steps):
        pos = [0] * dim
        for _ in range(steps):
            d = random.randrange(dim)
            pos[d] += 1 if random.getrandbits(1) else -1
            if not any(pos):
                return True
        return False
    trials, steps = 500, 1200
    two = sum(1 for _ in range(trials) if walk_returns(2, steps))
    three = sum(1 for _ in range(trials) if walk_returns(3, steps))
    assert two > three + 60, (two, three)
    assert three / float(trials) < 0.45, three
    return {
        "bool": True,
        "value": "true",
        "notes": "n*P(back at 2n) -> 1/pi in 2D (%.4f at n=2000 against %.4f), so "
                 "the visit count diverges and the walk is recurrent; %d/%d "
                 "simulated 2D walks came home within %d steps against only "
                 "%d/%d in 3D" % (tail[-1], 1 / math.pi, two, trials, steps, three, trials),
    }


# ---------------------------------------------------------------------------
# u11l2 — the long run
# ---------------------------------------------------------------------------

def check_deuce_odds(q, data):
    p = Fraction(_mk(data)["deuce"]["pointWin"]).limit_denominator(100)
    assert p == Fraction(3, 5), p
    qq = 1 - p
    # solve the deuce loop as a chain: D = deuce, A = advantage me, B = advantage them
    # D -> A with p, B with q ; A -> win with p, D with q ; B -> D with p, lose with q
    rows = [
        [Fraction(1), -p, -qq, Fraction(0)],          # D = p*A + q*B
        [-qq, Fraction(1), Fraction(0), p],           # A = p*1 + q*D
        [-p, Fraction(0), Fraction(1), Fraction(0)],  # B = p*D + q*0
    ]
    win = _solve(rows)[0]
    closed = p * p / (p * p + qq * qq)
    assert win == closed == Fraction(9, 13), (win, closed)
    derived = nearest_choice(q, float(win) * 100)

    wins, runs = 0, 8000
    for _ in range(runs):
        lead = 0
        while abs(lead) < 2:
            lead += 1 if random.random() < float(p) else -1
        wins += 1 if lead > 0 else 0
    assert abs(wins / float(runs) - float(win)) < 0.02, wins / float(runs)
    return {
        "choice": derived,
        "value": "69%",
        "notes": "chain solved: 9/13 = %.4f, same as p^2/(p^2+q^2); %d simulated "
                 "deuces gave %.3f" % (float(win), runs, wins / float(runs)),
    }


def _surfer(data):
    s = _mk(data)["surfer"]
    ids = [p["id"] for p in s["pages"]]
    out = {i: [] for i in ids}
    indeg = {i: 0 for i in ids}
    for a, b in s["links"]:
        assert a in out and b in indeg and a != b, (a, b)
        out[a].append(b)
        indeg[b] += 1
    for i in ids:
        assert out[i], "%s links nowhere" % i
    return ids, out, indeg


def check_surfer_page(q, data):
    ids, out, indeg = _surfer(data)
    n = len(ids)
    idx = {p: i for i, p in enumerate(ids)}
    trans = [[Fraction(0)] * n for _ in range(n)]
    for a in ids:
        for b in out[a]:
            trans[idx[a]][idx[b]] += Fraction(1, len(out[a]))
    pi = _stationary(trans)
    share = {p: pi[idx[p]] for p in ids}
    best = strict_max(share)
    assert share[best] == Fraction(2, 5), share
    # the point of the question: it is NOT the most linked-to page
    linkiest = strict_max(indeg)
    assert linkiest != best, (linkiest, best)
    assert indeg[best] < indeg[linkiest], indeg
    ids_set = set(r["id"] for r in q["regions"])
    assert ids_set == set(ids), (ids_set, ids)

    # a real surfer, clicking at random
    visits = {p: 0 for p in ids}
    at, steps = ids[0], 20000
    for _ in range(steps):
        at = random.choice(out[at])
        visits[at] += 1
    mc = max(visits, key=visits.get)
    assert mc == best, (visits, best)
    return {
        "region": best,
        "value": "home",
        "notes": "steady state %s; in-links %s (most-linked is %r, which loses); "
                 "%d simulated clicks landed most often on %r" % (
                     {k: str(v) for k, v in share.items()}, indeg, linkiest, steps, mc),
    }


def check_gas_returns(q, data):
    n = _mk(data)["gas"]["molecules"]
    assert n == 10, n
    # states 0..n = how many are on the left
    trans = [[Fraction(0)] * (n + 1) for _ in range(n + 1)]
    for k in range(n + 1):
        if k > 0:
            trans[k][k - 1] += Fraction(k, n)          # one of the left ones moves
        if k < n:
            trans[k][k + 1] += Fraction(n - k, n)      # one of the right ones moves
    pi = _stationary(trans)
    assert all(pi[k] == Fraction(math.comb(n, k), 2 ** n) for k in range(n + 1)), pi
    by_stationary = 1 / pi[n]

    # independently: expected hops to reach n, from n's own neighbours
    rows = []
    for i in range(n):                                  # unknowns h[0..n-1]
        row = [Fraction(0)] * n + [Fraction(1)]
        row[i] = Fraction(1)
        for j in range(n + 1):
            if trans[i][j] and j != n:
                row[j] -= trans[i][j]
        rows.append(row)
    h = _solve(rows)
    by_hitting = 1 + sum(trans[n][j] * h[j] for j in range(n))
    assert by_stationary == by_hitting == 1024, (by_stationary, by_hitting)

    # cross-check the stationary claim by letting the box run
    left, steps, hits = n, 60000, 0
    for _ in range(steps):
        left += -1 if random.random() < left / float(n) else 1
        hits += 1 if left == n else 0
    rate = hits / float(steps)
    assert 0.4 / 1024 < rate < 2.2 / 1024, rate
    return {
        "number": float(by_stationary),
        "value": "1024",
        "notes": "stationary share of the all-left state is 1/1024 so the return "
                 "time is 1024; the hitting-time system agrees exactly; %d "
                 "simulated seconds were all-left %.5f of the time (1/1024 = "
                 "%.5f)" % (steps, rate, 1 / 1024.0),
    }


def _eulerian_row(n):
    """A(n, k) for k = 0..n-1: how many permutations of n have k descents."""
    row = [1]
    for i in range(2, n + 1):
        nxt = [0] * i
        for k in range(i):
            nxt[k] = (k + 1) * (row[k] if k < len(row) else 0) + \
                     (i - k) * (row[k - 1] if 0 < k <= len(row) else 0)
        row = nxt
    return row


def check_riffle_seven(q, data):
    """Bayer and Diaconis: after k riffles a deck of n has a chance
    C(2^k + n - r, n) / 2^(kn) of being in any one arrangement with r rising
    sequences, and A(n, r-1) arrangements have r of them. That gives the exact
    distance from a properly mixed deck, in integer arithmetic."""
    n = _mk(data)["deck"]
    assert n == 52, n
    A = _eulerian_row(n)
    assert sum(A) == math.factorial(n), "Eulerian row is wrong"
    fact = math.factorial(n)
    dist = {}
    for k in range(1, 11):
        two = 2 ** k
        tv = Fraction(0)
        for r in range(1, n + 1):
            a = A[r - 1]
            if not a:
                continue
            pr = Fraction(math.comb(two + n - r, n), two ** n)
            tv += a * abs(pr - Fraction(1, fact))
        dist[k] = tv / 2
    for k in range(1, 5):
        assert dist[k] > Fraction(999, 1000), (k, float(dist[k]))
    first_half = min(k for k in dist if dist[k] < Fraction(1, 2))
    assert first_half == 7, dist
    # a cliff, not a slope: five shuffles is still 0.92, eight is 0.17
    assert dist[5] > Fraction(9, 10) and dist[8] < Fraction(1, 5), dist
    derived = nearest_choice(q, first_half)
    return {
        "choice": derived,
        "value": "7",
        "notes": "distance from random: " + ", ".join(
            "%d:%.3f" % (k, float(dist[k])) for k in range(4, 10)) +
                 " — first below a half at 7",
    }


CHECKERS = {
    "ring_return": check_ring_return,
    "weather_steady": check_weather_steady,
    "chain_forgets": check_chain_forgets,
    "mouse_maze": check_mouse_maze,
    "drunk_returns": check_drunk_returns,
    "deuce_odds": check_deuce_odds,
    "surfer_page": check_surfer_page,
    "gas_returns": check_gas_returns,
    "riffle_seven": check_riffle_seven,
}
