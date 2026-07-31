# Site metrics — every event, and the question it answers

This is the funnel's equivalent of `analytics/content_registry.jsonl`: the list of
signals autoresearch optimises the site against, the way `loop_strategy.py`
optimises content arms. If it isn't here, we can't optimise it — so an event goes
in **before** the feature it measures ships.

**One module owns all of it: `js/analytics.js`.** Nothing else records anything.
Every event does two things:

1. appends to a capped ring buffer in `localStorage` (`qq.events.v1`, 800 events,
   oldest dropped) — this is what the debug drawer reads, and it keeps working
   with the network off;
2. goes to the sink, which by default is `window.sb.event` from
   `js/supabase-config.js` → a `POST` into the Supabase `events` table.

The sink is fire-and-forget and wrapped in a `try`. A learner mid-lesson must
never notice that a beacon failed, and unit 1 has to work in aeroplane mode.

**To see the live event stream in the browser:** add `?debug=1` to the URL, or tap
the small grey footer line three times. "copy events" puts the whole log on the
clipboard as JSON; the drawer's header shows which sink is live.

---

## The envelope

Every event carries the same wrapper, so any sink can join them without a schema:

| field | meaning |
|---|---|
| `name` | event name from the tables below |
| `ts` / `iso` | epoch ms / ISO 8601 |
| `sessionId` | one per tab session (`sessionStorage`) — the unit for session length |
| `anonId` | stable random id in `localStorage` — the unit for return visits. Not a person; a browser. |
| `visitNumber` | 1 on the first ever page load, +1 on each load after |
| `msSinceLoad` | time from page load to this event |
| `props` | the per-event fields below |

Into Supabase, `sessionId` becomes the `session_id` column and `anonId`,
`visitNumber` and `msSinceLoad` ride along inside `props`, so return visits are
countable without anyone logging in.

**Privacy rule, enforced by convention and reviewed on every change:** no raw
personal data in `props`, ever. The email wall logs `emailDomain` and
`emailLength`; the address itself lives in `QQStore` on the device and never
enters the event log or the events table. Keep it that way.

---

## The events

### Arrival, session, return

| event | props | why it exists / what it answers |
|---|---|---|
| `arrived` | `referrer`, `viewportW/H`, `isFirstEverVisit`, `visitNumber`, `hasEmail`, `xp`, `solvedTotal`, `utm`, `offline` | The top of the funnel. Every other rate is divided by this. `referrer` + `utm` say which Reel or CTA sent them, which is what makes site metrics steerable from content. |
| `return_visit` | `visitNumber`, `hoursSinceLastVisit`, `daysSinceFirstSeen`, `streak`, `xp`, `solvedTotal` | Retention. D1/D7 return rate, and whether returners are the ones with streaks. |
| `screen_viewed` | `screen` | Coarse navigation trace; lets us rebuild any route through the app without bespoke events. |
| `path_viewed` | `units`, `lessonsVisible`, `lessonsDone`, `xp`, `streak`, `hasEmail` | The landing surface rendered, and in what state. Denominator for "did they start a lesson". |
| `session_end` | `durationMs`, `questionsAnswered`, `reason` | Session length — one of the two headline retention numbers. Fires on `pagehide` and on tab-hide, so it survives a phone locking. |

### Playing a lesson

| event | props | why it exists / what it answers |
|---|---|---|
| `lesson_started` | `unitId`, `lessonId`, `questionCount`, `hearts`, `crownsBefore`, `replay` | **The activation event.** `lesson_started / arrived` is the single most important ratio on the site: did the Reel traffic engage at all. `replay` separates a first play from a crown grind. |
| `question_shown` | `unitId`, `lessonId`, `questionId`, `type`, `topic`, `viz`, `position`, `of`, `heartsLeft`, `isRetry`, `seenBefore` | Per-question denominator. Drop-off is `question_shown` at position *i* against *i+1* — this is what names the question that loses people. `type` lets us compare question formats against each other. |
| `viz_interacted` | `lessonId`, `questionId`, `viz`, `kind`, `type` | Does the interactive graphic get touched? The whole product thesis is that the visual is the teaching. A low interaction rate means the visual isn't inviting; if interaction correlates with first-try correctness, the thesis holds. First interaction per question only. |
| `answer_submitted` | `questionId`, `type`, `correct`, `given`, `attempt`, `firstTry`, `msToAnswer`, `vizInteracted`, `heartsLeft` | The quality signal per question. `given` on wrong answers shows *which* misconception is common — content research for the next video as much as for the site. `msToAnswer` finds the questions people stare at. |
| `question_requeued` | `lessonId`, `questionId` | A wrong answer sent back to the end of the queue. Counts how often the second look happens, which is the mechanic that makes a lesson teach rather than test. |
| `heart_lost` | `lessonId`, `questionId`, `heartsLeft`, `type` | Difficulty, measured in the currency the player feels. Hearts lost per lesson is the number to tune question order against. |
| `hearts_exhausted` | `unitId`, `lessonId`, `cleared`, `of`, `msInLesson` | The failure exit. If this is common on one lesson, that lesson is mis-ordered or a question is unfair. |
| `hearts_retry` | `lessonId` | They chose to go again after failing. The forgiving-vs-punishing dial is set by this over `hearts_exhausted`. |
| `lesson_abandoned` | `unitId`, `lessonId`, `questionId`, `cleared`, `of`, `heartsLeft`, `msInLesson` | Explicit quit. Distinguishes "left the tab" from "pressed the X", and pins the exact question they quit on. |
| `lesson_completed` | `unitId`, `lessonId`, `questions`, `firstTryCorrect`, `perfect`, `heartsLeft`, `answersGiven`, `msTotal`, `crowns`, `firstEverCompletion` | **The completion event.** `lesson_completed / lesson_started` is the retention number the whole road is designed for. `msTotal` says whether a lesson is the right length. |
| `unit_completed` | `unitId`, `index`, `free` | Unit 1 completion is the gate to the wall, so this is the wall's true denominator. |
| `celebration_shown` / `celebration_cta` | `lessonId`, `xp`, `perfect` / `action` | Did the reward land, and did they take the next step, hit the wall, or bail to the road. |

### The habit loop — XP, goal, streak

| event | props | why it exists / what it answers |
|---|---|---|
| `xp_earned` | `lessonId`, `xp`, `totalXp`, `todayXp`, `fromQuestions`, `fromLesson`, `fromPerfect` | The accumulation signal. Lets us check whether the XP curve is worth anything: does total XP predict a return visit better than raw questions answered? |
| `daily_goal_met` | `goalXp`, `todayXp`, `streak` | Duolingo's core habit loop. Are people hitting the goal, and does hitting it predict tomorrow? If the goal is set wrong this event is either universal or never. |
| `streak_continued` | `streak`, `best` | Fired the first time XP is earned on a new day. Streak length distribution, and where people fall off it. |
| `streak_broken` | `lostStreak`, `best` | Fired on arrival when the last active day is more than a day ago. **The most important retention signal we have** — it names the length at which streaks die, which is where a reminder would have to land. |

### The wall (email)

| event | props | why it exists / what it answers |
|---|---|---|
| `wall_shown` | `unitId`, `solvedTotal`, `xp`, `msSinceArrival` | Denominator for signup conversion. `msSinceArrival` shows how long a cold Reel visitor takes to reach the ask. |
| `email_attempted` | `valid` | Separates "wouldn't give an email" from "typed it wrong" — a validation problem looks like a conversion problem otherwise. |
| `email_submitted` | `emailDomain`, `emailLength`, `mode`, `unitId`, `solvedTotal`, `xp` | **The signup conversion event.** `email_submitted / wall_shown` is the number the wall's copy and placement get optimised against. `mode` is `magic-link` when Supabase really sent one and `local` when it fell back — so a broken mail provider shows up here rather than as a mysterious conversion drop. |
| `wall_dismissed` | `unitId` | Explicit refusal — the honest denominator partner to a submit. |
| `locked_lesson_tapped` | `unitId`, `lessonId`, `reason` | Demand for locked content, measured before building it. Repeated taps on a locked lesson are the strongest signal for what to write next. `reason` splits "needs an email" from "needs the previous lesson". |

### Paid libraries

| event | props | why it exists |
|---|---|---|
| `library_viewed` | `libraryId`, `status` | Impressions, so click-through has a denominator. |
| `library_clicked` | `libraryId`, `priceUsd`, `status` | Purchase intent, per named library and per price. The pre-payment version of the pricing bandit in `monetization/EXPERIMENTS.md`. |
| `library_interest` | `libraryId`, `stub` | Registered interest after the (stubbed) checkout. Until payments are live this is the only revenue-side signal we have, and it decides which library gets written first. |

### Plumbing

| event | props | why it exists |
|---|---|---|
| `sheet_shown` | `title` | Any modal explanation. |
| `debug_opened` | — | Distinguishes our own inspection traffic from real visitors. **Filter these sessions out of any analysis.** |

---

## The derived numbers to actually watch

Ratios, not counts. In rough order of how much they should change what we build:

| number | from | what it decides |
|---|---|---|
| **activation** | `lesson_started / arrived` | whether the landing surface works at all. If this is low, nothing downstream matters. |
| **first-lesson completion** | `lesson_completed(u1l1) / lesson_started(u1l1)` | whether the loop is satisfying and the right length. |
| **unit-1 completion** | `unit_completed(u1) / arrived` | the free experience end-to-end. The wall's denominator. |
| **signup conversion** | `email_submitted / wall_shown` | the wall's copy, placement and timing. |
| **per-question drop-off** | `question_shown` at *i+1* over *i* | which single question to rewrite or move. |
| **per-question difficulty** | mean `attempt`, mean `heart_lost` per question | question ordering within a lesson. |
| **visual pull** | `viz_interacted / question_shown`, split by `viz` | which visuals invite a touch — and, by comparing first-try correctness with and without, whether interaction actually teaches. |
| **D1 / D7 return** | `return_visit` with `hoursSinceLastVisit` bucketed | whether the streak machinery earns its keep. |
| **streak survival** | `streak_broken.lostStreak` distribution | the day a reminder would have to land. |
| **session length** | `session_end.durationMs` | whether there is enough road. |
| **library intent** | `library_clicked / library_viewed` | which paid set to build, and at what price. |

## What is deliberately NOT measured

- **No third-party analytics, no ad pixels, no fingerprinting.** One anonymous id
  in `localStorage`, which the player can clear from the debug drawer.
- **No email addresses in events.** Domain and length only.
- **No mouse/scroll heatmaps.** They would tell us less than
  `viz_interacted` does and cost far more trust.
- **No cross-site identity.** `anonId` is a browser, not a person, and it never
  leaves this origin.

## When you add a feature

Add its event here in the same commit, with the funnel question it answers in the
last column. An event with no question in that column is noise, and should be
deleted rather than documented.
