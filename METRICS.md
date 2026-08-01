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
| `arrived` | `entryPath`, `referrer`, `viewportW/H`, `isFirstEverVisit`, `visitNumber`, `hasEmail`, `xp`, `solvedTotal`, `utm`, `offline` | The top of the funnel. Every other rate is divided by this. `referrer` + `utm` say which Reel or CTA sent them, which is what makes site metrics steerable from content. **`entryPath` is on the envelope of the funnel's first event on purpose:** every downstream rate can be split by which opening the visitor got. |
| `entry_path_chosen` | `entryPath`, `straightToQuestion`, `landedOnAnswers`, `deepLinkSlug`, `lessonId`, `solvedTotal`, `xp` | Which opening this visit got, decided once in `boot()` before anything is drawn. See the table below for the values. `*-forced` is a `?answers=1` / `?play=1` / `?road=1` override, which must be **excluded** from any comparison because it is us, not a visitor. |

**`entryPath`, the whole vocabulary.** It rides on `arrived` as well, which is
what makes every downstream rate splittable by which door the visitor came
through. A new opening gets a NEW value; never re-point an existing one.

| value | who gets it | what they see first |
|---|---|---|
| `answers` | no hash, nothing solved, no email, no session | the answers archive, as a list. **The default from 2026-08-02.** |
| `answers-deep-link` | `#answers/<slug>` | that one answer, open, at the top. Outranks everything, including progress. |
| `answers-link` | bare `#answers` | the archive list |
| `road` | anybody with progress, an email or a session | the road, where their streak is |
| `question` | nothing solved **and** the archive is unavailable | dropped straight into question 1. The 2026-08-01 default; now only a fallback. |
| `answers-forced` / `road-forced` / `question-forced` | `?answers=1` / `?road=1` / `?play=1` | whatever was forced — **us, testing. Exclude.** |
| `first_question_handoff` | `lessonId`, `questionId`, `solvedTotal`, `answeredCount`, `msInLesson` | The straight-to-question opening handing over to the road after the first answer. Fires once per visitor at most. `first_question_handoff / entry_path_chosen(question)` is the share who answered anything at all — the number the whole change exists to move. |
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
| `level_up_played` | `lessonId`, `nextLessonId`, `reduced`, `skipped`, `msShown` | The celebration on the road: the finished node stamping shut, the path inking forward, the next node waking. Fired once, when it ends. `skipped` is the one that matters — a reward people tap through is a delay wearing a costume, and if it climbs, shorten it or cut it. `reduced` counts the players on `prefers-reduced-motion`, who get a plain fade. |

### The wall (email)

**There are TWO email asks and they are different products.** Every event in this
section carries `wallKind`, and **any number computed without splitting on it is
meaningless** — one is a request, the other is a gate, and averaging them hides
both.

| `wallKind` | when | what it is |
|---|---|---|
| `soft` | straight after the **first lesson** is finished, once per device, ever | A request. Nothing is locked, "Not now" returns the player to exactly what they were doing, and the pitch is the streak and XP they have just started building. |
| `hard` | entering **unit 2** (tapping a locked lesson, or the celebration CTA) | The gate. Unchanged, and still the only place the road actually stops. |
| `answers` | opening any answer in the **answers archive** (`js/answers_ui.js`) | A different person entirely: cold off a Reel, has solved nothing, came for one specific answer. See *The answers gate* below. |

A new ask gets a NEW `wallKind`. **Never reuse `soft` or `hard` for a surface
that is not the road**, and never total the kinds: they are asked of different
populations, so a pooled rate mostly measures which one fired more often.

| event | props | why it exists / what it answers |
|---|---|---|
| `wall_shown` | `wallKind`, `unitId`, `lessonsDone`, `streak`, `solvedTotal`, `xp`, `msSinceArrival` | Denominator for signup conversion, **per kind**. `msSinceArrival` shows how long a cold Reel visitor takes to reach the ask — which the soft prompt exists to shorten. `lessonsDone` is the sanity check that soft really is firing at 1. |
| `email_attempted` | `wallKind`, `valid` | Separates "wouldn't give an email" from "typed it wrong" — a validation problem looks like a conversion problem otherwise. |
| `email_submitted` | `wallKind`, `emailDomain`, `emailLength`, `mode`, `unitId`, `lessonsDone`, `streak`, `solvedTotal`, `xp` | **The signup conversion event.** `mode` is `magic-link` when Supabase really sent one and `local` when it fell back — so a broken mail provider shows up here rather than as a mysterious conversion drop. |
| `wall_dismissed` | `wallKind`, `unitId`, `lessonsDone` | Explicit refusal — the honest denominator partner to a submit. On the soft prompt a dismissal costs nothing and must not be read as a lost user; on the hard wall it is a stop. |
| `locked_lesson_tapped` | `unitId`, `lessonId`, `reason` | Demand for locked content, measured before building it. Repeated taps on a locked lesson are the strongest signal for what to write next. `reason` splits "needs an email" from "needs the previous lesson". |

The question the split is there to answer: **does asking early win more addresses
than it costs in annoyance?** Read together —
`email_submitted(soft) / wall_shown(soft)` against
`email_submitted(hard) / wall_shown(hard)`, and then `lesson_started` **after** a
`wall_dismissed(soft)`. If the soft prompt converts and the dismissers keep
playing, it is free. If dismissers stop playing, it is not, whatever it converts.

### Accounts and the cloud mirror (`js/auth.js`, `js/sync.js`)

The half of the funnel that used to be invisible: the wall asks for an email, but
until now nothing recorded whether anyone ever came *back* through the link. These
close that loop.

| event | props | why it exists / what it answers |
|---|---|---|
| `signin_link_opened` | `via`, `solvedTotal` | **The other half of signup conversion.** `signin_link_opened / email_submitted(mode=magic-link)` is the click-through on the magic link — the number that says whether the emails land in inboxes at all. `via` is `magic-link` (tokens in the fragment), `token-hash` or `pkce`. |
| `signin_link_failed` | `via`, `error` | They clicked a link and it did not work — expired, already used, or a provider error. A spike here is a broken email template or a redirect allow-list that no longer matches, and it is otherwise invisible. |
| `signed_in` | `via`, `solvedTotal`, `xp` | A session became live, whether from a link (`via` = the flow) or restored from storage (`via: 'restored'`). The denominator for "how many players are actually accounts". |
| `signed_out` | `reason`, `solvedTotal` | `reason: 'refresh-rejected'` means the provider refused a refresh token — if that is common, sessions are dying early and people are silently losing their cross-device progress. |
| `sync_pulled` | `reason`, `questionsGained`, `changed`, `remoteSolved`, `remoteXp`, `localXp` | Every merge, with both sides' numbers. `questionsGained > 0` is a device learning about progress made elsewhere — the proof that cross-device is worth anything. |
| `sync_merged_in` | `questionsGained`, `xp` | Fired only when a merge actually brought questions in, so the rate can be read without filtering. |
| `sync_pushed` / `sync_failed` | `reason`, `solved`, `xp`, `error` | Whether the mirror is keeping up. `sync_failed` is not a player-visible failure — localStorage already has everything — but a sustained rate means progress is only ever on one device. |
| `sync_account_switched` | `hadPrevious` | A second account signed in on a browser that had synced someone else. Rare and worth watching: it is the one case where local progress is deliberately cleared. |

Signed-in events also carry the auth user id into the `events.user_id` column, so
a person's funnel can be joined to their `profiles` row. Anonymous events — still
the majority, and the whole point of unit 1 — carry `null` there, as before.

### Paid libraries

**The price moved.** The road and the library list show the word PREMIUM and no
number; the price, what you get and the buy button live on the library's own
detail screen, one tap in. So the funnel is now three steps, and the step that
was previously invisible — *saw the price and walked away* — is the interesting
one:

```
library_viewed  ->  library_clicked  ->  library_detail_viewed  ->  library_buy_tapped
   (card seen)      (card tapped)        (price on screen)          (intent, priced)
                                                \-> library_detail_dismissed (saw the price, left)
```

| event | props | why it exists |
|---|---|---|
| `library_viewed` | `libraryId`, `status` | Impressions of the card, so click-through has a denominator. No price is on screen at this point, by design. |
| `library_clicked` | `libraryId`, `priceUsd`, `status`, `from` | Curiosity, **not** purchase intent any more — it now means "opened the detail view", and the player has still seen no number. |
| `library_detail_viewed` | `libraryId`, `priceUsd`, `status`, `topics`, `samples` | The first moment a price is visible. The true denominator for anything about pricing. |
| `library_buy_tapped` | `libraryId`, `priceUsd`, `status`, `msOnDetail`, `paymentsLive` | **Priced purchase intent** — they read the price, the samples and the topics, and pressed the button anyway. This is the number a price change should be judged on. `msOnDetail` says whether they decided instantly or had to be convinced. |
| `library_detail_dismissed` | `libraryId`, `priceUsd`, `msOnDetail`, `buyTapped` | Left the detail view. With `buyTapped:false` this is the price rejection we previously could not see at all. |
| `library_interest` | `libraryId`, `stub` | Registered interest after checkout returns. While payments are not live this is the only revenue-side signal we have, and it decides which library gets written first. |
| `library_set_started` | `libraryId` | A **member** pressed "Play this set". The retention question on the paid side: does a membership get used more than once, and which set gets replayed? Fires only for someone `QQPay.owns()` says already has it, so it can never be confused with intent. |

### The answers archive

The other door into the site, and the one most Reel traffic will use. A video
withholds its answer and points at `#answers/<slug>`; the visitor lands on that
one answer, already open. So this is a funnel in its own right, and its whole
point is the last step — whether an answer turns into a question played.

```
answers_opened  ->  answers_entry_opened  ->  answers_play_clicked  ->  lesson_started
 (deepLink:true)     (browsed to another)     (the conversion)
```

| event | props | why it exists |
|---|---|---|
| `answers_opened` | `slug`, `deepLink`, `how`, `unknownSlug`, `gated`, `utm` | The archive was shown. `deepLink:true` with `how:'load'` is a viewer arriving straight off a video, which is the traffic this page exists for; `how:'entry'` is the 2026-08-02 default landing (no hash, nothing solved); `how:'tab'` is somebody already on the site who went looking. **`unknownSlug:true` means a video is pointing at an answer we have not generated** — a broken link in a caption, and otherwise invisible. `gated` is whether this visitor still owes us an email. |
| `answers_entry_opened` | `slug`, `src`, `gated` | An entry expanded from the list, so the archive is being browsed rather than bounced off. `src` (`comment` / `caption` / `module`) says which kind of source people actually open. |
| `answers_play_clicked` | `slug`, `lessonId`, `questionId`, `lock`, `gated` | **The conversion the archive exists for.** `answers_play_clicked / answers_opened` is the number to judge every link a video makes. `lock` is `null` when the lesson started, `'sequence'` or `'email'` when it was locked and they were put on the road instead — a high locked share means the questions we link to are too far along the road. |

#### Leaving an answer, onto the road (2026-08-02)

From 2026-08-02 the archive is where a cold visitor **lands**, so the end of an
answer is the moment that decides whether they ever touch the product. When
they leave one — collapse it, or reach the bottom of one they have unlocked —
the road's next question appears underneath it, with its actual words on it.

It is an offer, not a wall: it is inserted *below* the card, the answer stays
open, "Not now" removes the offer and nothing else, and it fires **at most once
per page load** whatever the trigger.

```
answer_unlocked / answers_entry_opened
   ->  answers_road_question_shown  ->  answers_road_question_started  ->  lesson_started
                                    ->  answers_road_question_dismissed
```

| event | props | why it exists |
|---|---|---|
| `answers_road_question_shown` | `slug`, `trigger`, `unitId`, `lessonId`, `questionId`, `firstOnRoad`, `gated`, `entryPath`, `utm` | The denominator for the exit transition. `trigger` is `closed` (they collapsed the answer) or `read_end` (they reached the bottom of an unlocked one) — two different moments, and if one converts and the other does not, only this says so. `gated:true` is somebody who never paid the email and is being offered the road anyway, which is deliberate. `firstOnRoad:true` means the offer really was question 1, i.e. a genuinely cold visitor. |
| `answers_road_question_started` | same, plus `msShown` | **The number the landing change lives or dies on.** `started / shown` is whether landing readers on the archive turns them into players. `lesson_started` follows on its own through `QQApp.openLesson`, so the road's own funnel picks them up unchanged. |
| `answers_road_question_dismissed` | same, plus `msShown` | The honest denominator partner. A dismissal costs the reader nothing, so a high rate is a signal to change the moment or the wording, never a reason to make the offer harder to refuse. |

`analytics/site_metrics.py` prints this as its own funnel, split by `trigger`
and `gated`, and per day. It is deliberately **not** hung off `answer_unlocked`:
the offer is also shown to people who never unlocked anything, so that ratio
would exceed 100% and mean nothing.

#### The answers gate (2026-08-02)

From 2026-08-02 no video carries its answer anywhere, so this page is the only
place one exists — and reading it costs an email. The question, the topic and
the *shape* of the working (`whySteps`, reading time) are free and immediate;
the answer lede and the working are behind `QQAuth.hasAccess()`. One address
opens every answer for ever, so this is one ask per visitor, **not one per
entry** — count it per session, never per event.

```
arrived  ->  answers_opened  ->  answer_gate_shown  ->  email_submitted(answers)  ->  answer_unlocked
                                  (the ask)             (the point of it)           (they read it)
```

| event | props | why it exists |
|---|---|---|
| `answer_gate_shown` | `wallKind:'answers'`, `slug`, `topic`, `utm`, `arrival`, `deepLink`, `whySteps`, `hasRoadQuestion`, `archiveSize` | **The denominator for the second reward signal.** `arrival` is `deep_link` (straight off a reel to one answer) or `browse` (found in the archive) — two different intents that convert differently and must never be pooled. `utm` is the `utm_source` that brought them, so a gate can be attributed to the comment or the bio link that caused it. Fired once per entry per page load. |
| `answer_unlocked` | `slug`, `topic`, `how`, `utm`, `whySteps`, `signedIn` | An answer was actually opened and read by someone with access. `how` is `just_unlocked` (they paid at this entry), `deep_link` or `browse`. This is the consumption signal: an email that never comes back and reads anything is worth much less than one that does. |

`email_attempted` and `email_submitted` carry `wallKind:'answers'` here, plus
every prop above, so **an email captured at the gate is separable from one
captured on the road** in a single query. `analytics/site_metrics.py` prints
this funnel, the split by `wallKind`, the split by `arrival`/`utm`, which
answers people came for, and arrivals → gate → email **per day**.

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
| **the opening, judged** | `lesson_started / arrived`, `answer_gate_shown / arrived` and `email_submitted / arrived`, all **split by `entryPath`** | the numbers that say which front door works. The baseline to beat is **33%** `arrived -> lesson_started`, measured with the road as the front door (program.md, *The first tap is the whole funnel*). `question` was the first attempt at beating it; `answers` is the second, and it trades a share of first taps for a shot at an email, so all three ratios have to be read together — a landing that halves activation and doubles signups is not obviously worse, and a landing that does neither is obviously wrong. Compare on **new visitors only** (`solvedTotal = 0` at `arrived`), drop the `-forced` rows, and give it a week. If it beats nothing, put the previous one back: this is a bet, not a belief. `analytics/site_metrics.py` prints the whole table. |
| **reader → player** | `answers_road_question_started / answers_road_question_shown` | whether landing someone on the archive produces a player or only a reader. This is the specific thing the 2026-08-02 landing change is betting on; if it is near zero the archive is a dead end and the road should go back to being the front door. |
| **first-lesson completion** | `lesson_completed(u1l1) / lesson_started(u1l1)` | whether the loop is satisfying and the right length. |
| **unit-1 completion** | `unit_completed(u1) / arrived` | the free experience end-to-end. The wall's denominator. |
| **signup conversion** | `email_submitted / wall_shown`, **split by `wallKind`** | the wall's copy, placement and timing. Never pool the two kinds: the soft prompt is asked of everyone who finishes one lesson, the hard wall only of the few who finish a whole unit, so pooling them mostly measures which one fired more often. |
| **cost of asking early** | `lesson_started` after `wall_dismissed(soft)`, over all `wall_dismissed(soft)` | whether the early ask is free. If people who say "not now" carry on playing, keep it; if they leave, the address was not worth it. |
| **link click-through** | `signin_link_opened / email_submitted(mode=magic-link)` | whether the sign-in emails are arriving and being opened. A low number here is a mail problem, not a product problem. |
| **cross-device rate** | `sync_pulled` with `questionsGained > 0` over `signed_in` | whether accounts are actually being used on more than one device — the thing the whole sync layer is for. |
| **per-question drop-off** | `question_shown` at *i+1* over *i* | which single question to rewrite or move. |
| **per-question difficulty** | mean `attempt`, mean `heart_lost` per question | question ordering within a lesson. |
| **visual pull** | `viz_interacted / question_shown`, split by `viz` | which visuals invite a touch — and, by comparing first-try correctness with and without, whether interaction actually teaches. |
| **D1 / D7 return** | `return_visit` with `hoursSinceLastVisit` bucketed | whether the streak machinery earns its keep. |
| **streak survival** | `streak_broken.lostStreak` distribution | the day a reminder would have to land. |
| **session length** | `session_end.durationMs` | whether there is enough road. |
| **library curiosity** | `library_clicked / library_viewed` | whether a PREMIUM card without a price is worth opening at all. |
| **priced intent** | `library_buy_tapped / library_detail_viewed` | which paid set to build, and at what price. This is the pricing number now — the old `library_clicked` ratio was measured before anyone had seen a price. |

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
