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
  js/auth.js            the email seam + the Supabase session (magic-link return,
                        storage, refresh, sign-out)
  js/sync.js            the cloud mirror: pull, merge, push progress + profile
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
| **The paid libraries themselves** | named, not written. Each one has a detail screen — topics, question count, two sample questions — reached by tapping its card; that screen is the only place a price ever appears. | Decide from `library_buy_tapped / library_detail_viewed` which one to write first: that ratio is measured *after* the player has seen the price, which `library_clicked` no longer is. |
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
