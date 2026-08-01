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
  css/style.css         the stylesheet for everything except the mascot
  js/questions.js       THE question bank — pure JSON, the source of truth
  js/app.js             path, lesson loop, hearts, XP, wall, libraries
  js/answers.js         THE ANSWERS ARCHIVE — generated, never edited by hand
  js/answers_ui.js      the answers screen, and the #answers/<slug> route
  js/mascot.js          Flip, the mascot — waits on the road, walks, reacts
  css/mascot.css        everything Flip needs, and nothing else needs
  js/store.js           persistent player state (localStorage)
  js/analytics.js       every event, and the one sink seam
  js/auth.js            the email seam + the Supabase session (magic-link return,
                        storage, refresh, sign-out)
  js/sync.js            the cloud mirror: pull, merge, push progress + profile
  js/payments.js        the money seam
  js/supabase-config.js project URL + publishable key + a tiny REST helper
  js/viz.js             canvas kit + 7 visuals
  js/viz_lab.js         the reusable engines (sim, dial, grid, dots, graph, race…)
  js/viz_chance.js      js/viz_stats.js   js/viz_growth.js   js/viz_onramp.js
  js/viz_countval.js    js/viz_bayesgeo.js  js/viz_netalgo.js
  js/viz_markov.js      js/viz_stopping.js  js/viz_info.js   js/viz_estimate.js
  js/viz_premium_js.js  js/viz_premium_opt.js  js/viz_premium_ts.js
  verify_answers.py     re-derives all 197 answers from scratch
  checks/*.py           the checkers, one module per slice of the bank
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

## The answers archive

**From 2026-08-02 a video withholds its answer everywhere** — not on screen, not
in the caption, not in the first comment. This page is the only place an answer
exists, and **reading one costs an email** (`program.md`, *The answer is never
free*). The question, the topic and the shape of the working are free and
immediate; the answer lede and the working are behind `QQAuth.hasAccess()` —
the same predicate the road's wall uses, so one address opens every answer for
ever. It is one ask per visitor, not one per entry.

**The road is not gated by any of this.** Unit 1 is free, no login, no wall,
and the "play this one" button stays on the free side of the gate: somebody who
would rather solve it than be told is worth more than an email, not less.

```
python3 pipeline/build_answers.py          # rewrites site/js/answers.js
python3 pipeline/build_answers.py --check  # report only, writes nothing
```

**Run it after every post.** It reads `analytics/posts.jsonl` for what is
actually live, then takes each entry's words from that video's own
`videos/<date>/<slug>.comment.txt`, its caption, or the docstring of
`pipeline/questions/<slug>.py` — in that order, and says on the page which one
it used. Nothing is written for the website, so nothing on the page can drift
from what we published. A posted video it cannot source an answer for is
**reported and skipped**, never guessed at. Same inputs give a byte-identical
file, so a re-run with nothing new is a no-op.

Two routes, and the deep link is the point:

- `#answers` — the list, newest first, searchable.
- `#answers/<slug>` — that one answer, open, at the top of the page. This is
  what a caption links to, so **the question and the gate — or the answer, for
  a visitor who already has access — have to be readable without scrolling at
  390px**. The archive's own header and search bar are hidden in this mode for
  exactly that reason. Check it after any change to the card.

Two things the gate must keep doing, both easy to break:

- **Never quote an entry's headings in the teaser.** They are lifted from what
  we published and routinely give the answer away — "WHY 14 IS THE MINIMUM".
  Only *counts* derived from the working are safe to show.
- **Keep `a` out of the search index while locked** (`_findLocked` in
  `answers_ui.js`), or the search box becomes a way to confirm the answer
  without paying for it.

Where a video's idea is also a question on the road, the entry offers it —
`ROAD` in `build_answers.py`, and the build fails if an id there is not in
`js/questions.js`. If the lesson is locked the button says so and puts the
visitor on the road rather than showing them a sheet saying no.

`verify_answers.py` knows nothing about any of this; the archive is published
prose, the question bank is the thing that gets re-derived.

## Checking the questions

```
python3 site/verify_answers.py        # 197/197, about 1.1 s, stdlib only
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

- 197 questions, every one with its own interactive visual and every answer
  machine-verified: 125 on the free road, and 72 across six named premium
  sets — Jane Street, Citadel, Optiver speed round, Mental maths under
  pressure, Two Sigma and Brainteaser classics. The conditional-probability,
  geometric-probability, network and algorithm material that was briefly sold
  as the SIG and Jump Trading sets now lives on the road, as units 7–10, where
  it was originally drafted: engagement is the site's problem, not
  monetisation, and a longer free road is worth more than two more paid sets.
- **The road runs to fourteen units.** It used to stop at ten, which anyone who
  actually engaged finished in about two sittings — and then the streak, the
  daily goal and the crowns had nothing left to retain them for. Units 11–14 are
  the hardest on the road and are meant to feel like it: *Where it settles*
  (chains with a memory, steady states, mixing), *Knowing when to stop* (the
  secretary problem, ruin, betting systems), *Twenty questions* (information,
  coding, error correction) and *Back of an envelope* (Fermi chains,
  capture-recapture, Benford). Same product, though: one sentence, one drawn
  answer, never algebra on the screen.
- **A mascot that travels the road with you.** Flip, a gold coin on two legs,
  drawn as inline SVG in `js/mascot.js` — no image files, no fonts, works from
  `file://`. It stands at the node you are meant to play next, so "where do I
  start" is answered by a character standing there rather than by copy. Tap that
  node and a door opens in it and Flip walks through, which is what carries you
  into the lesson. During a lesson it stands in the answer bar beside the button —
  measured to never cover a question, a graphic or an option at 390px. Finish, and
  it comes back out and walks the road to the next node, which is the reward. Its
  position is **derived from progress on every render**, never remembered, so a
  reload, a fast-tapped run of lessons or a walk interrupted half way all leave it
  standing where the road says it belongs. `aria-hidden`, `pointer-events: none`,
  transforms and opacity only; under `prefers-reduced-motion` it simply appears at
  the right node with no walking, no door and no blinking.
- **First-timers start in a question, not on the map.** A visitor with no progress
  at all is put straight into question 1 and sees the road only *after* they have
  answered it — with their own answer already showing on the first node and Flip
  walking out of the door onto it. Anyone with any history lands on the road as
  before, because their streak and their place on it are why they came back.
  `?road=1` and `?play=1` force either opening for testing, and every visit records
  which one it got so the change can be judged and reverted rather than assumed.
- The whole Duolingo loop: a path you land on mid-road, lessons of 4–5 questions,
  a progress bar, 4 hearts, immediate right/wrong feedback with an explanation,
  wrong answers requeued to the end of the lesson, an out-of-hearts screen you can
  retry from, a completion screen with confetti, XP, crowns and a daily-goal ring,
  and a streak that persists across days.
- Five question types: pick-the-answer, true/false, type-a-number, put-in-order,
  and tap-the-right-part-of-the-picture.
- Unit 1 (9 questions) fully playable with **no login, no email, no network**.
- A level-up on the road after every lesson: the node you just beat stamps shut
  with a tick, throws a few sparks in the unit's colour, inks the path forward
  and wakes the next node. Under 1.2s, skippable with a tap, and a plain fade
  under `prefers-reduced-motion`.
- **Two email asks, and only one of them is a wall.** A *soft* prompt after the
  **first lesson** — about keeping the streak and XP you have just started,
  dismissible with "Not now", asked once per device ever, and it hands you back
  to exactly what you were doing. The *hard* wall stays where it was, at unit 2.
  Every event from that screen carries `wallKind` so the two never get pooled.
- **Sign-in that survives.** Open the emailed link and the session is captured,
  the tokens are scrubbed out of the URL, and it is restored (and refreshed) on
  every later visit. Progress made before signing in is merged up, not thrown
  away, and progress made on another device comes down.
- Analytics: every funnel event goes to the live Supabase `events` table, and to a
  local ring buffer you can read in the browser with `?debug=1`.

**Stubbed or waiting on the user:**

| thing | state | what has to happen |
|---|---|---|
| **Email sign-in** | real, both directions. `js/auth.js` calls `/auth/v1/otp` to send the link, and handles the **return**: it reads the session out of the URL (fragment tokens, `?token_hash=`, or `?code=`), strips the credentials out of the address bar with `replaceState` before anything else runs, stores the session, restores it on later loads, and refreshes it with `grant_type=refresh_token`. A refresh the provider rejects degrades to signed-out rather than erroring. | Ideally real SMTP: the built-in sender is rate-limited to a handful an hour. Keep the redirect allow-list (**Authentication → URL Configuration**) in step with wherever the site is served from — a link that comes back to an address not on that list lands on the site URL instead. |
| **Accounts / cross-device progress** | real. `js/sync.js` pulls `progress` + `profiles`, merges them into the local store, and pushes the result back. The merge takes the better of local and remote per question — solved beats unsolved, fewer attempts wins, XP earned since the last confirmed push is added rather than dropped — so a phone that played unit 1 anonymously and then signed in keeps everything, and so does an account opened on a new laptop. `localStorage` is still written first and the sync runs in the background; offline just means the push retries later. | Nothing. Hearts are the one thing not synced: they are per-lesson and refill every start, so `profiles.hearts` stays at its default until hearts become a real cross-session currency. |
| **Payments** | stub. `QQPay.checkout()` records local interest and opens an honest sheet saying nothing was charged. | Create the payment processor account, do the identity/bank verification, create one product per library, paste the resulting public Payment Link into `js/payments.js`. Entitlement must then be decided server-side, not in that file — a browser can lie. |
| **The paid libraries themselves** | written. Six sets, twelve questions each, every one drawn and machine-verified exactly like the road. A member gets a **Play this set** button on the detail screen and the set is dealt out as a shuffled lesson. Non-members still see the same door: topics, two real sample questions, and the only price in the app. | Nothing to build. Watch `library_set_started` against `library_detail_viewed` to see which sets a membership is actually bought for. |
| **Units 2–14 unlocking in order** | works, but note that the sequence rule means unit 3 needs unit 2 finished, and so on up to unit 14. | Nothing — this is deliberate. |

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

1. Add it to the right lesson — or to the right `libraries[].questions` — in
   `js/questions.js`. Keep that file **pure JSON** after the assignment;
   `verify_answers.py` parses it with `json.loads`, and it checks a paid
   question exactly as hard as a free one.
2. Pick a `type` (`choice`, `truefalse`, `number`, `order`, `tap`) and fill in the
   fields that type needs. `answerValue` is the canonical string the verifier
   asserts against, whatever the type.
3. Write the visual in one of the `js/viz_*.js` files:
   `QQViz.register('myViz', function (host, api) { ... })`. Use `QQViz.kit` for
   the canvas plumbing. It must be interactive — a slider, a drag, a tap, or a
   re-runnable simulation. A picture of a formula is not a visual.
4. Write a checker — in `verify_answers.py` for the early units, otherwise in the
   right `checks/*.py` module, which the harness picks up automatically — and
   run it. A checker with no question fails the run just as loudly as a
   question with no checker.
5. Add any new event to `METRICS.md` in the same commit.

## Design rules that are not negotiable

- **Unit 1 free, for ever, with no account and no network.** The *wall* goes
  after it, never before. An email may be **asked for** earlier — once, softly,
  after the first lesson — but asking is not walling: if the player says "not
  now" they carry on through the whole of unit 1 exactly as before. If a change
  ever makes that "not now" cost them anything, the change is wrong.
- **Money only ever buys a separate named library.** Nothing in `payments.js` can
  lock a road lesson; it does not even know lessons exist.
- **No price on the road.** Wherever a library is merely listed it says PREMIUM
  and nothing else. The number, what you get and the buy button live on that
  library's own screen, which the player has to choose to open.
- **Every question is drawn, not written.** Same instinct as the videos: animate
  the thing, don't write the formula.
- **Mobile first, designed and tested at 390×844.** Everything reachable
  one-handed; tap targets at least 42px.
- **Hearts are forgiving.** They exist to slow you down and make you look at the
  picture, not to punish you. Running out costs nothing but a retry.
- **Nothing lies to the player.** If the email did not send, the screen says so.
