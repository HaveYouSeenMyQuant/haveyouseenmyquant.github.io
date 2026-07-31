# the road — a Duolingo-shaped course in probability and maths

The channel's funnel. Someone arrives from a Reel, lands on a winding path of
short lessons, plays one without an account, and is asked for an email only once
unit 1 is behind them. Paid question libraries sit off to the side and never
paywall the road.

Live at **https://gaspardol.github.io/quant-road/**, served from the public repo
`gaspardol/quant-road`. This directory is the source.

```
site/
  index.html            every screen, as static markup
  css/style.css         the whole stylesheet
  js/questions.js       THE question bank — pure JSON, the source of truth
  js/app.js             path, lesson loop, hearts, XP, wall, libraries
  js/store.js           persistent player state (localStorage)
  js/analytics.js       every event, and the one sink seam
  js/auth.js            the email seam
  js/payments.js        the money seam
  js/supabase-config.js project URL + publishable key + a tiny REST helper
  js/viz.js             canvas kit + 7 visuals
  js/viz_chance.js      8 visuals
  js/viz_stats.js       7 visuals
  js/viz_growth.js      8 visuals
  verify_answers.py     re-derives all 30 answers from scratch
  schema.sql            the Supabase tables and their Row Level Security
  METRICS.md            every event and the funnel question it answers
```

## Running it

Double-click `index.html`. That is the whole build step: no npm, no bundler, no
framework, no CDN, no web fonts, nothing fetched from anywhere. It works offline
and it works from `file://`.

For anything involving the network (the Supabase beacon, the magic-link call) use
a local server, because browsers treat `file://` as an opaque origin:

```
cd site && python3 -m http.server 8770     # then open http://localhost:8770
```

Deploying is `git push` to the Pages repo. There is no server-side code and there
never will be — GitHub Pages does not run any.

## Checking the questions

```
python3 site/verify_answers.py        # 30/30, about 1.3 s, stdlib only
python3 site/verify_answers.py -v     # shows the working for each one
```

Every question has a checker that re-derives its answer independently — exactly
where an exact derivation exists (enumeration, `Fraction`, dynamic programming,
optimal stopping), and by Monte Carlo as a cross-check. **A question with no
checker is a failure, not a skip.** These go on a public site under our name, and
a wrong answer costs more than a missing feature. If you add a question and
cannot write a genuine checker for it, cut the question.

## What is real, and what is not

**Real, working now:**

- 30 questions across 4 units and 7 lessons, every one with its own interactive
  visual, every answer machine-verified.
- The whole Duolingo loop: a path you land on mid-road, lessons of 4–5 questions,
  a progress bar, 4 hearts, immediate right/wrong feedback with an explanation,
  wrong answers requeued to the end of the lesson, an out-of-hearts screen you can
  retry from, a completion screen with confetti, XP, crowns and a daily-goal ring,
  and a streak that persists across days.
- Five question types: pick-the-answer, true/false, type-a-number, put-in-order,
  and tap-the-right-part-of-the-picture.
- Unit 1 (9 questions) fully playable with **no login, no email, no network**.
- The email wall after unit 1, which unlocks the rest of the road.
- Analytics: every funnel event goes to the live Supabase `events` table, and to a
  local ring buffer you can read in the browser with `?debug=1`.

**Stubbed or waiting on the user:**

| thing | state | what has to happen |
|---|---|---|
| **Email sign-in** | half real. `js/auth.js` calls Supabase `/auth/v1/otp`. If the provider accepts, the player is told a link is coming (`mode: magic-link`); if it refuses, the address is kept on the device and the player is told exactly that (`mode: local`). The road unlocks either way. | In the Supabase dashboard: **Authentication → Providers → Email** on; **Authentication → URL Configuration** → add `https://gaspardol.github.io/quant-road/` to the redirect allow-list; ideally set real SMTP, since the built-in sender is rate-limited to a handful an hour. |
| **Accounts / cross-device progress** | not built. Progress lives in `localStorage` under `qq.state.v2`. `schema.sql` already has `profiles` and `progress` tables with RLS, but nothing writes to them yet. | Needs the above first. Then `QQAuth.currentUser()` returns a real session and `js/store.js` mirrors itself to `progress`, keyed by `auth.uid()`. |
| **Payments** | stub. `QQPay.checkout()` records local interest and opens an honest sheet saying nothing was charged. | Create the payment processor account, do the identity/bank verification, create one product per library, paste the resulting public Payment Link into `js/payments.js`. Entitlement must then be decided server-side, not in that file — a browser can lie. |
| **The paid libraries themselves** | named and priced, not written. | Decide from `library_clicked` which one to write first. |
| **Units 2–4 unlocking in order** | works, but note that the sequence rule means unit 3 needs unit 2 finished. | Nothing — this is deliberate. |

**Three files, three seams.** `js/auth.js`, `js/payments.js` and
`js/analytics.js` are the only places a backend appears. Each has one documented
function to swap and a header comment saying exactly what a real implementation
looks like. Everything keeps working with all three at their defaults.

## Secrets

`js/supabase-config.js` holds the project URL and the **publishable** key. Both
are public by design; Row Level Security in `schema.sql` is what makes that safe —
anonymous callers may insert an event and nothing else, and no policy lets anyone
read another person's row.

**Never put the secret key or the database password anywhere in `site/`.** GitHub
Pages serves every byte of this repo to the public. They belong in
`~/.config/quantvideos.env` at `0600`, used only from the local machine.

## Adding a question

1. Add it to the right lesson in `js/questions.js`. Keep that file **pure JSON**
   after the assignment — `verify_answers.py` parses it with `json.loads`.
2. Pick a `type` (`choice`, `truefalse`, `number`, `order`, `tap`) and fill in the
   fields that type needs. `answerValue` is the canonical string the verifier
   asserts against, whatever the type.
3. Write the visual in one of the `js/viz_*.js` files:
   `QQViz.register('myViz', function (host, api) { ... })`. Use `QQViz.kit` for
   the canvas plumbing. It must be interactive — a slider, a drag, a tap, or a
   re-runnable simulation. A picture of a formula is not a visual.
4. Write a checker in `verify_answers.py` and run it.
5. Add any new event to `METRICS.md` in the same commit.

## Design rules that are not negotiable

- **Unit 1 free, for ever, with no account and no network.** The wall goes after
  it, never before.
- **Money only ever buys a separate named library.** Nothing in `payments.js` can
  lock a road lesson; it does not even know lessons exist.
- **Every question is drawn, not written.** Same instinct as the videos: animate
  the thing, don't write the formula.
- **Mobile first, designed and tested at 390×844.** Everything reachable
  one-handed; tap targets at least 42px.
- **Hearts are forgiving.** They exist to slow you down and make you look at the
  picture, not to punish you. Running out costs nothing but a retry.
- **Nothing lies to the player.** If the email did not send, the screen says so.
