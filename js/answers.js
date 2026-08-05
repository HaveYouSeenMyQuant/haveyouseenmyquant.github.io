/* THE ANSWERS ARCHIVE — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Written by pipeline/build_answers.py out of analytics/posts.jsonl and the
 * caption / comment / module files each posted video already has. Re-run it
 * after every post:
 *
 *     python3 pipeline/build_answers.py
 *
 * Same inputs, byte-identical output — a re-run with nothing new is a no-op.
 * Every `a` and every `why` here is quoted from this repo; nothing was
 * written for the website, so nothing here can drift from what we published.
 *
 * src: "comment" = the worked answer we posted under the video
 *      "caption" = the video's own caption
 *      "module"  = the docstring of pipeline/questions/<slug>.py, whose
 *                  verify() is what proves the number
 */
window.QQ_ANSWERS = {
 "count": 145,
 "entries": [
  {
   "slug": "arrows_none_a_mix",
   "title": "Arrows that are not mixes of each other",
   "ts": "2026-08-05T03:15:00+00:00",
   "date": "5 Aug 2026",
   "topic": "linear_algebra",
   "q": null,
   "a": "Two on a flat page - and the clean way to see it is to count equations, not arrows.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Writing a target as so-much-of-A plus so-much-of-B is really two equations - one for the across direction, one for the up direction - in two unknowns, the two amounts."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two equations in two unknowns generally has exactly one solution. So on a flat page, ANY third arrow you draw can be built from your first two, and you can compute exactly how much of each it takes. It is never new."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The exception is when your two arrows point along the same line. Then the equations are not independent, they cannot reach off that line, and you never had two genuine directions to begin with."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So on a plane the count is 2. In three dimensions you get three equations and the count is 3, and in n dimensions it is n. The count is the number of dimensions, which is exactly what \"dimension\" means - and this is what \"linearly independent\" is for."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "orthogonal_shadow_zero",
   "title": "The shadow between two arrows vanishes at one angle",
   "ts": "2026-08-05T02:35:52+00:00",
   "date": "5 Aug 2026",
   "topic": "linear_algebra",
   "q": null,
   "a": "The shadow dies at exactly 90 degrees, and it is the only angle where it does.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The shadow's length is the dot product of the two arrows, divided by the length of the one you are projecting onto. With the fixed arrow at (4, 3), its own length is 5, so a unit arrow pointing the same way gives a shadow of exactly 5 - the whole arrow."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Open the angle and the shadow is 5 times the cosine of it. Cosine is 1 when they agree, and it falls away smoothly as the angle grows."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Cosine hits zero at 90 degrees and nowhere else in half a turn. So the shadow collapses to the tail exactly when the arrows are perpendicular, which is what a zero dot product means: no part of one arrow points along the other."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Keep swinging and the shadow does not stay at zero - it reappears pointing BACKWARD, because the cosine goes negative. That is why the dot product is signed, and why \"perpendicular\" is the clean dividing line between the two."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is the whole reason perpendicularity and a zero dot product are the same statement: one is the geometry, the other is the arithmetic that measures it."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "chain_rule_two_gears",
   "title": "Why chain-rule rates multiply",
   "ts": "2026-08-05T01:45:42+00:00",
   "date": "5 Aug 2026",
   "topic": "calculus",
   "q": null,
   "a": "Six units. You multiply the rates, you do not add them.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A nudges B twice as far, so B's rate with respect to A is 2. B nudges C three times as far, so C's rate with respect to B is 3. Move A by one unit and B moves 2; B moving 2 drags C by three times that, which is 6."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the chain rule: dC/dA equals dC/dB times dB/dA, so 3 times 2 is 6."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The tempting wrong answer is 5, from adding. Adding would be right if A pushed B and C independently - two separate contributions arriving at the same place. Here the linkage is in SERIES: everything A does to C has to travel through B, so B's effect is applied to A's effect rather than alongside it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is also why the units work out. \"Twice as far\" and \"three times as far\" are ratios, and ratios compose by multiplying - the B in dC/dB times dB/dA cancels exactly the way it does in fractions."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it is why deep networks train the way they do: the gradient reaching an early layer is the PRODUCT of every rate along the way, which is precisely why long chains of small numbers vanish and long chains of large ones explode."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "integral_area_fills",
   "title": "The area is the number the rectangles head toward",
   "ts": "2026-08-05T00:06:20+00:00",
   "date": "5 Aug 2026",
   "topic": "calculus",
   "q": null,
   "a": "They are heading for exactly 26/5, which is 5.2.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The curve is 0.7 + x/10 + 3(x-2) squared /10 + 8 sin(pi x/2)/25 on the interval 0 to 4. Split it into the polynomial part and the sine part and each becomes easy."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The polynomial integrates to exactly 26/5. The sine part integrates to exactly ZERO over this interval - it completes two half-waves that cancel, one above the axis and one below. So the whole hidden area is 26/5, with no approximation anywhere."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now watch how the rectangles approach it. Using midpoints, the total for n rectangles is exactly 26/5 minus 8/(5 n squared). At 4 rectangles you are 0.100 short; at 8, 0.025; at 16, 0.00625."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the pattern worth taking away: the error carries 1/n squared, so every time you halve the width you QUARTER the gap. Doubling the work buys four times the accuracy, which is why the jagged roof snaps onto the curve so fast."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Push n up and the gap goes to zero. The number the rectangles are heading for is the integral, and it is 5.2 exactly."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "lln_vs_clt_two_claims",
   "title": "Two coin-flip laws that people mash together",
   "ts": "2026-08-04T23:17:47+00:00",
   "date": "4 Aug 2026",
   "topic": "statistics",
   "q": null,
   "a": "The rescaled bell's width does not change at all. It is the same for every n.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two different things are happening at once and the rescale is what separates them."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The raw running average genuinely does close in on one half. Its variance after n flips is 1/(4n), so its typical distance from a half shrinks like 1 over 2 root n. That is the law of large numbers, and it is the left-hand picture."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The right-hand picture asks a different question: not how big the miss is, but what SHAPE it has. To see the shape you have to zoom in as the miss shrinks, and the correct zoom is exactly root n - which is precisely what the drawn quantity does."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Once you zoom by root n, the shrinking cancels perfectly. The second moment of the rescaled miss is exactly 1 for every n - 16, 64, 256, 512, all of them. So the bell does not narrow, does not widen, and does not drift."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "What it does do is become more BELL-shaped. The width is already fixed; the central limit theorem is a statement about the shape converging, not the spread. That is the distinction the two panels exist to separate: one quantity is vanishing, the other is standing still."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "four_from_three_and_five",
   "title": "Four litres from three and five",
   "ts": "2026-08-04T21:25:40+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Six moves. Here is the whole thing.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Fill the five. (0, 5) Pour the five into the three until the three is full. (3, 2) Empty the three. (0, 2) Pour the two litres across into the three. (2, 0) Fill the five again. (2, 5) Pour from the five into the three until the three is full — the three already holds two, so it takes exactly one litre, and five minus one is four. (3, 4)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Four litres, in the five-litre jug."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "There is a second solution of the same length that starts from the other jug: fill the three, tip it into the five, fill the three again, top the five up from it — the five takes two, leaving one in the three. Empty the five, move that one litre across, fill the three and add it: one plus three is four."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The idea underneath is the useful part. Every move adds a whole jug, removes a whole jug, or moves liquid between them, so every amount you can ever reach is a whole number of threes plus a whole number of fives — some 3x + 5y, where x and y may be negative because emptying counts as subtracting. The numbers of that form are exactly the multiples of the greatest common divisor of 3 and 5, which is 1. So with these two jugs you can make ANY whole number of litres up to five, and four is nothing special."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Change the jugs to 4 and 6 and the same reasoning kills the puzzle instantly: their gcd is 2, so only even amounts are reachable, and no sequence of moves however clever will ever produce five litres. That is the real question being asked — not \"can you find four\" but \"which amounts are reachable at all\", and the answer is decided by one gcd before you pour anything."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "worst_shot_goes_first",
   "title": "The worst shot goes first",
   "ts": "2026-08-04T20:47:23+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Fire into the air. Deliberately miss.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "It sounds like giving up your turn. It is the best move you have, and by a wide margin."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Work out what happens if you actually shoot at someone."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Shoot the deadly one and hit, and now it is the middling shooter's turn with only you left to aim at. They hit two times in three, and they are shooting first. You survive that duel about one time in seven."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Shoot the middling one and hit, and it is now the deadly one's turn with only you left. They never miss. You are dead with certainty."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both of your \"successes\" hand the next shot to somebody good, with you as the only target left. Hitting is the thing that gets you killed."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now miss on purpose. Nobody has been eliminated, and — this is the point — neither of the other two will waste their shot on you. You are the least dangerous person there. The middling shooter fires at the deadly one, because the deadly one is the bigger threat to them; the deadly one fires at the middling shooter for the same reason. They fight each other. One of them falls, and then you get the first shot at whoever is left."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Exact numbers, with both opponents playing sensibly:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "fire into the air     25/63   about 39.7%",
      "shoot the deadly one  59/189  about 31.2%",
      "shoot the middling    50/189  about 26.5%"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Missing on purpose is worth more than a quarter again as much as the obvious move."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The general lesson is worth more than the puzzle. Being the weakest player changed what the right move was: your advantage is that nobody considers you worth shooting, and firing a real shot throws that advantage away. Sometimes the strongest thing you can do with a turn is not use it."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "seven_bridges_one_walk",
   "title": "Seven bridges, one walk",
   "ts": "2026-08-04T18:54:50+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "No. It cannot be done, and the reason is a counting argument that takes one line once you see it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Forget the map. Ask only one thing about each piece of land: how many bridges touch it?"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now think about what a walk does at a piece of land it is passing through. It arrives on one bridge and it leaves on another. Arrive, leave. Arrive, leave. The bridges at that land get used in PAIRS."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The only lands where that fails are the one you start on and the one you finish on. On the starting land you leave without having arrived; on the finishing land you arrive without leaving. Everywhere else, in and out, always paired."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So a land touched by an ODD number of bridges can only be the start or the finish. A walk has exactly one start and one finish, so at most TWO lands may have an odd number of bridges."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Count them here. The big island has five bridges. The north bank has three, the south bank has three, the small island has three. All four are odd. Four lands needing to be an end, and only two ends available."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole proof, and notice what it never mentions: which bridge you take first, or the shape of the river, or how clever you are. It rules out every route at once, without checking any of them, which is what makes it a proof rather than a failed search."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Change one thing and it flips. Build one more bridge between two of the odd lands and those two become even, leaving exactly two odd lands — so a walk exists, and it must start at one of them and end at the other. Same town, one bridge different."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This little argument is where graph theory started. The lands became points, the bridges became lines between them, and the map — the thing everyone was staring at — turned out to be irrelevant. What mattered was how many lines met at each point."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "seven_links_one_cut",
   "title": "Seven links, seven days",
   "ts": "2026-08-04T18:05:32+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "One cut. Just one — the third link from either end.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Cut link 3 and the chain falls into three pieces: a single loose link, a piece of two, and a piece of four. 1, 2 and 4. (Cutting link 5 does the same thing by symmetry — it gives a four, a loose link and a two — so there are two right answers and they are mirror images.)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now watch what the innkeeper is holding at the end of each day, remembering that he gives change."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Day 1: hand him the 1. He holds 1. Day 2: hand him the 2 and take the 1 back. He holds 2. Day 3: hand him the 1 as well. He holds 1 + 2 = 3. Day 4: hand him the 4 and take back both the 1 and the 2. He holds 4. Day 5: hand him the 1. He holds 5. Day 6: hand him the 2, take back the 1. He holds 6. Day 7: hand him the 1. He holds 7."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every day settles exactly, and you cut once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason 1, 2, 4 works is that those are the powers of two, and every number from 1 to 7 is a sum of distinct powers of two — that is exactly what writing a number in binary means. 5 is 101, so it is 4 + 1, which is the piece of four plus the loose link. The innkeeper's daily total is just counting from 1 to 7 in binary, and you are handing him the bits."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why most people overshoot: they think about PAYING one link a day, so they look for seven things to hand over. The question is only ever what the innkeeper HOLDS at the end of the day, and change turns handing over into arithmetic in both directions. Once you can take pieces back, three pieces cover seven days."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The general rule is lovely too. With k cuts you get k loose links plus k+1 segments, and by choosing the segment sizes well you can settle a chain of up to (k+1) x 2^(k+1) - 1 links. One cut therefore covers up to 7 — seven links is exactly the largest chain that a single cut can handle, which is why the puzzle uses seven."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "fly_between_two_trains",
   "title": "The fly between two trains",
   "ts": "2026-08-04T17:22:36+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "75 kilometres. The fly flies for exactly one hour at 75 km/h, and that is the whole calculation.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Stop thinking about the fly's path and think about the CLOCK."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The two trains are 100 km apart and closing at 50 + 50 = 100 km/h. So they meet after exactly one hour. That is not affected by the fly in any way — the fly weighs nothing and changes nothing about the trains."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The fly is in the air for that entire hour, from the moment it sets off to the moment the trains meet. It never stops, never slows, never rests. It flies at a constant 75 km/h for one hour."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "75 kilometres."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The number of turns it makes is infinite, and it does not matter in the slightest. The path is a mess; the time is not."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "You can do it the long way. Each hop is shorter than the last by a constant factor, so the hop lengths form a geometric series, and summing it gives 75 km too. It takes considerably longer and it teaches you nothing you did not already have."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "There is a famous story attached. A mathematician was given this puzzle and answered immediately. \"Ah, you spotted the trick,\" said the asker — the trick being to use the time. \"What trick?\" he said. \"I summed the series.\""
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The real lesson is about choosing the frame. A quantity that looks impossible in one accounting can be trivial in another, and the skill being tested is noticing which quantity is actually pinned down. Here the fly's PATH is complicated and its TIME is fixed by something that has nothing to do with it."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "rock_out_of_the_boat",
   "title": "The rock out of the boat",
   "ts": "2026-08-04T16:15:03+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "The level goes DOWN.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nothing left the pond, which is exactly why almost everyone says \"the same\". But the water does not care how much mass is in the pond. It only responds to how much space is taken up below its surface, and that changes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the whole thing in two lines."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A FLOATING object pushes aside its own WEIGHT of water. That is what floating means: the boat sinks into the water until the water it has shoved out of the way weighs exactly as much as the boat and everything in it. While the rock is in the boat, the rock is being carried by something floating, so the water it displaces is its weight — call it m divided by the density of water."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A SUNKEN object pushes aside its own VOLUME. Once the rock is on the bottom it is not being carried by anything. It just occupies space: m divided by the density of rock."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the question becomes: which is bigger, m/rho_water or m/rho_rock? A rock is several times denser than water, so m/rho_rock is several times smaller. On the bottom it displaces less. Less displacement, lower level."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Put a number on it. Granite is about 2.7 times the density of water, so a rock that displaced 10 litres while riding in the boat displaces only about 3.7 litres on the bottom. Over 6 litres of displacement simply disappears, and the pond drops."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The formula is delta_h = (m/A) x (1/rho_rock - 1/rho_water), negative for anything denser than water."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two cases worth having, because they show the rule rather than the example. Throw a wooden plank overboard and the level does not move at all — it floats, so it goes on displacing its weight exactly as it did in the boat. And something with precisely the density of water also changes nothing, because for it, weight and volume displacement are the same number. Down, only for things that sink."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "ant_on_a_stretching_rope",
   "title": "The ant on the stretching rope",
   "ts": "2026-08-04T15:19:29+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Yes. The ant gets there. It always gets there, for any crawl speed and any stretch rate — and it takes about 10^43 seconds, which is longer than the universe has existed by an absurd margin.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both halves of that are worth having, and the first one is the surprise."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trick is to stop measuring in metres. Track the FRACTION of the rope that is behind the ant instead."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Stretching is uniform. It pulls the ant forward and the far end forward in exactly the same proportion, so the fraction behind the ant is completely unchanged by a stretch. Read that again, because it is the whole puzzle: the stretching, the thing that looks like it is defeating the ant, cannot change the quantity that decides the outcome. Only crawling changes it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So how much fraction does a crawl buy? During second n the rope is n metres long, and crawling 1 cm on an n-metre rope covers 1/(100n) of it. Add them up:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "fraction after n seconds = (1/100) x (1 + 1/2 + 1/3 + ... + 1/n)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That bracket is the harmonic series. It grows without limit — slowly, but it passes any number you name. So the fraction passes 1, and the ant arrives."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It needs the bracket to reach 100, and the harmonic series reaches 100 at around n = e^100, which is roughly 10^43 seconds."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason almost everyone says no is that they answer a different question. \"Is the ant falling behind?\" — yes, hopelessly, and further behind every second forever. \"Does the gap ahead of it grow?\" — yes, without limit. Both true. Neither is what was asked. An infinite process can lose ground forever and still arrive, and the harmonic series is the standard example of a sum whose terms shrink to nothing while the total goes to infinity."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "two_corners_off_the_board",
   "title": "Two corners off the board",
   "ts": "2026-08-04T14:22:59+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "No. It cannot be done — not by being clever, not ever.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Colour the board the way a chessboard is already coloured, and look at what a domino does. A domino covers two squares that share an edge, and two squares that share an edge are always opposite colours. So every domino, wherever you put it and whichever way you turn it, covers exactly one light square and one dark square. Thirty-one dominoes must therefore cover thirty-one light and thirty-one dark."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now look at the two corners you removed. Opposite corners of a chessboard are the same colour as each other. Taking both away leaves thirty of that colour and thirty-two of the other."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Thirty-one dominoes need 31 and 31. The board offers 30 and 32. There is no arrangement to find, because the obstruction has nothing to do with arrangement — you are asked to pair up squares that cannot be paired."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is worth more than the puzzle. The counting was a trap: 62 = 2 x 31 is true and completely useless, because it counts the wrong thing. The quantity that actually matters is the DIFFERENCE between the two colours, and that number never changes no matter how you lay the pieces. A quantity that cannot change is an invariant, and finding one is how you prove something is impossible rather than merely difficult — searching harder can never settle \"no\"."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One more thing, so the colour argument is not oversold. It rules this board out, but does having 31 of each guarantee success? Here, yes: remove any ONE light square and any ONE dark square, anywhere on the board, and a tiling always exists. That is Gomory's theorem, and it has a lovely proof — thread a closed loop through all 64 squares, remove two squares of opposite colours, and the loop falls into two arcs each of even length, which you simply pave along."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "wine_water_spoonful",
   "title": "A spoonful each way",
   "ts": "2026-08-04T13:28:08+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "They are exactly equal. There is precisely as much wine in the water as there is water in the wine.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not approximately. Not \"about the same\". Exactly, every time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The fast way to see it, with no algebra at all: both glasses end up holding exactly what they started with — one glass of liquid each. The wine glass is full. So whatever wine is missing from it must have been replaced by something, and the only other liquid in the room is water. The volume of wine that left equals the volume of water that arrived. Those two volumes are the two things you were asked to compare. They are the same number twice."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Notice what that argument never used. It never mentioned the size of the spoon. It never mentioned stirring. It never mentioned doing it once. Pour back and forth all day with a bucket, stir or do not stir, and as long as the two glasses finish level, the answer is still \"equal\"."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "If you want the algebra anyway: call a glass V and the spoon s. After moving s of wine across, the water glass holds V + s, of which s is wine, so the mixture is wine in fraction s/(V+s). The spoonful going back carries s x s/(V+s) of wine, leaving s - s^2/(V+s) = sV/(V+s) wine behind in the water. That same spoonful carries s x V/(V+s) = sV/(V+s) of water into the wine. Same expression, twice."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The algebra is correct but it is a worse answer, because it makes a general truth look like a coincidence of one particular procedure."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "last_one_standing_circle",
   "title": "Forty-one in a circle",
   "ts": "2026-08-04T12:50:13+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Position nineteen. Stand nineteenth and you are the one left.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The clean way to see it is in binary, and it is almost absurdly simple. Write the number of people in base two, take the leading 1 off the front, and stick it on the end. That is the safe place."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Forty-one is 101001 in binary. Move the leading 1 to the back and you get 010011, which is 19. That is the whole method."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why it works: if the circle size is exactly a power of two, the first person survives. Every second person going out halves a power of two into another power of two, and the counting always comes back round to where it started. So position 1 wins whenever n is 2, 4, 8, 16, 32 and so on."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For any other n, write it as a power of two plus a remainder: 41 = 32 + 9. Let the first 9 eliminations happen and you are left with exactly 32 people, with the count about to restart. Whoever is \"first\" in that reduced circle survives, and that person is at 2 times 9 plus 1 = 19 in the original numbering. The general formula is 2L + 1 where L is the remainder."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Checked both ways: running the elimination directly on 41 people gives 19, and it agrees with the binary rule for every circle size up to 500."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "three_jars_all_wrong",
   "title": "Three jars, every label wrong",
   "ts": "2026-08-04T12:11:36+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "One. A single fruit, and it has to come from the jar labelled MIXED.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Start by counting the worlds you are actually in. Three labels, all wrong, is a permutation with no fixed point - a derangement - and on three items there are exactly TWO of those. That is the whole search space."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "World one: the APPLES jar holds oranges, the ORANGES jar holds the mix, the MIXED jar holds apples. World two: the APPLES jar holds the mix, the ORANGES jar holds apples, the MIXED jar holds oranges."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now look at what each draw tells you. Reach into the jar labelled MIXED. In world one it gives an apple; in world two it gives an orange. The two worlds disagree, so whatever comes out names your world outright - and naming the world labels all three jars at once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The other two jars are useless for this, and that is the part people miss. The jar labelled APPLES holds oranges in one world and the MIXED jar in the other, so pulling an orange out of it leaves you exactly where you started. Same for the jar labelled ORANGES."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why the MIXED jar works is worth saying plainly: it is the only jar guaranteed to be PURE. Since its label is wrong, it cannot be the mix, so every fruit in it is the same kind - which means one fruit speaks for the whole jar. And zero draws is not enough, because both worlds are consistent with the labels before you touch anything."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "ants_on_a_pole",
   "title": "Ants on a pole",
   "ts": "2026-08-04T10:17:50+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "One minute at the very most - and for this particular line-up, 0.91 of a minute.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The move is to stop tracking which ant is which. When two identical ants meet and both turn round, the PICTURE is exactly the same as if they had walked straight through each other. The only thing that changed is the label, and the labels are not part of the question."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So replace the collisions with ants that ignore each other completely. Every ant then walks in a straight line at one metre a minute and falls off the end it was already facing. No interactions at all."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "An ant that far from its end takes exactly that distance in minutes. The pole clears when the LAST of these straight walkers falls off, so the answer is the largest distance any ant has to travel - and no ant is ever more than a whole pole-length from an end."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That caps it at one minute, whatever you do. Five ants or five hundred, all facing the same way or alternating, clustered or spread - the bound never moves."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For the line-up here the ant starting 0.09 from the left and facing right has the furthest to go, 0.91, so the pole is clear at 0.91 minutes. The one thing that IS lost in the swap is identity: the ant that falls off the right end is not the ant you were following, and no argument built on tracking individuals will get you there."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "camel_bananas_market",
   "title": "A camel, 3000 bananas and a market",
   "ts": "2026-08-04T08:24:50+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Five hundred and thirty-three. Not a thousand, and not zero - 533 bananas reach the market.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trick is that the cost per mile is not one banana, it is one banana PER TRIP, and how many trips you must make depends on how many bananas are still behind you."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "With 3000 bananas the camel can only shift them a mile by going forward, back, forward, back, forward - five crossings of that mile, so five bananas a mile. That rate holds until the pile drops to 2000, which takes 1000 bananas, so 200 miles. You are at mile 200 with 2000 bananas."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now only three crossings are needed per mile - forward, back, forward - so three bananas a mile. That holds until the pile drops to 1000, which takes another 1000 bananas over 333 and a third miles. You are at mile 533 and a third with 1000 bananas."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "From there the camel carries the lot in one go and eats one a mile. There are 466 and two thirds miles left, so it arrives with 1000 minus 466 and two thirds = 533 and a third bananas. Whole bananas: 533."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason to put bananas DOWN is what most people miss. Dropping a depot lets the camel stop paying the five-a-mile rate as soon as possible, and the whole solution is just three stretches at three different rates. Checked against every possible first depot position, no other plan does better."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "five_serials_how_many",
   "title": "Five serial numbers, how many exist?",
   "ts": "2026-08-04T08:08:33+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": null,
   "a": "Seventy-one. The batch is estimated at 71, not 60 - you add one average gap on top of the highest serial you saw.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The five serials sit at 4, 9, 42, 48 and 60. Look at the gaps: 4, 5, 33, 6 and 12. Lumpy - but they average 12 apart. Those five draws cut the range into six-ish stretches of similar size, and you have only measured the ones BELOW your maximum."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The stretch above the top serial is, on average, the same size as the ones you did measure. So the range does not end at 60 - it ends about one average gap further on."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The average gap is the maximum divided by the count: 60 over 5, which is 12. That gives the estimator N = m(1 + 1/k) - 1, and here 60 times 6/5 minus 1 is 71."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The minus one is because the serials start at 1 rather than 0. And this is not a rule of thumb - it is the minimum-variance unbiased estimator, exactly unbiased for every N and k, which you can check by enumerating every possible sample rather than simulating."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The naive answer, the maximum itself, is biased low by exactly the amount you just added: on average m falls short of N by (N-k)/(k+1). This is the German tank problem, and in the Second World War it estimated German tank production from captured gearbox serials far more accurately than the intelligence estimates did."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "staircase_never_shortens",
   "title": "A staircase that never gets shorter",
   "ts": "2026-08-04T07:30:39+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "This staircase never gets shorter. Answer's in bio - free, takes an email.",
   "a": "Count the pieces separately instead of looking at the shape.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every horizontal piece of the staircase points the same way, so all of them together add up to exactly one side of the square. The same is true of the vertical pieces and the other side. That is the whole sum: one side plus one side, which is 2, and the number of steps never enters it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now refine. Halving the steps doubles how many there are and halves each one, so both totals are untouched. That is why the picture changes and the number does not."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trap is assuming that if two shapes look the same, their lengths must be close. Area behaves that way; length does not. Length can be made to sit as close to the diagonal as you like while staying stubbornly at 2, because at every magnification the path is still made of horizontal and vertical pieces - it never once becomes slanted."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The diagonal is the square root of 2, about 1.414. The staircase is exactly 2 forever."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "ladder_midpoint_arc",
   "title": "A ladder slips down a wall",
   "ts": "2026-08-04T06:53:04+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "A ladder slips down a wall. Answer's in bio - free, takes an email.",
   "a": "A quarter circle, centred on the corner, with radius exactly half the ladder.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Forget the sliding and look at a single instant. The corner, the foot and the top form a RIGHT-ANGLED triangle, and the ladder is its hypotenuse."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now use the one fact that settles it: the midpoint of a hypotenuse is equidistant from all three vertices of a right triangle - it is the centre of the circle through them. So the midpoint sits half a hypotenuse from the corner, and the hypotenuse is the ladder, whose length never changes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A point at a fixed distance from a fixed corner traces a circle. Measured across 5,001 ladder angles, that distance does not vary by even 1e-12, and it equals L/2 to the same precision."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The contrast is the part worth keeping. A point one third of the way along is NOT special: its distance from the corner swings by roughly a third of the ladder over the same slide, and it traces an ellipse instead. Only the midpoint sits at the centre of that circle."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the whole thing collapses to one line of school geometry - and it feels surprising because both ends are accelerating differently the entire time, yet the middle is pinned."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "wheel_inside_wheel",
   "title": "A wheel rolling inside a wheel",
   "ts": "2026-08-04T06:15:34+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "A wheel rolls inside a wheel twice its size. Answer's in bio - free, takes an email.",
   "a": "A perfectly straight line - the diameter of the big circle.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two rotations are happening at once, and at exactly half the size they cancel. The small wheel's centre travels around the big circle, and rolling without slipping spins the small wheel backwards relative to that trip, at a rate of (R - r) divided by r."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Set r to half of R and that rate is exactly 1. So the marked point's own spin precisely undoes its orbit - one turn against one turn - and two circular motions add up to no circle at all."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Write the coordinates out and one of them collapses to zero identically: the point never leaves the line. Checked at 20,001 positions, its greatest distance from the diameter is under 1e-9, and it sweeps the full span from one edge to the other."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It works ONLY at exactly half. At ratios of 0.4, 0.45, 0.55 or 0.6 the trace bows away from straight by a clearly measurable amount, so this is a fact about that one ratio and not a coincidence of the numbers drawn."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The general family is called a hypocycloid, and this straight-line case has its own name - the Tusi couple - because it was known centuries before the algebra existed to write it down this way."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "two_turns_two_orders",
   "title": "Same two cube turns, reversed, end differently",
   "ts": "2026-08-04T05:36:30+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "Same two cube turns, reversed. Why do the endings split? Answer's in bio - free, takes an email.",
   "a": "They end up in genuinely different orientations. Rotations in three dimensions do not commute.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Take the cube. Turn it a quarter turn about one axis, then a quarter turn about another. Now start again from the same cube and do those two turns in the opposite order. The faces do not match, and it is not an artefact of the drawing - the two results differ by a real rotation."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason is that the second turn happens about an axis in the CURRENT frame, and the first turn has already moved that frame. So the same instruction means something different depending on what came before it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "As matrices it is immediate: composing rotations is multiplying matrices, and matrix multiplication is not commutative. AB and BA are different matrices, so they send the cube to different places."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two dimensions are the special case where this does not bite. Every planar rotation shares the same axis, the angles simply add, and order stops mattering - which is exactly why intuition built on turning things flat on a table lets you down in space."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is also why orientation in 3D is genuinely awkward to store: the order of the turns is part of the answer, so any system using angles has to fix a convention and stick to it."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "flip_the_skinny_triangle",
   "title": "The skinny triangle flip test",
   "ts": "2026-08-04T03:43:28+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "This skinny triangle flips when one dot falls inside a circle. Answer's in bio - takes an email.",
   "a": "Keep flipping and you always land on the same mesh - the one that makes the smallest angle in it as large as possible.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The circle test is the whole rule. Draw the circle through three corners of a triangle; if the fourth point lies INSIDE it, that pair of triangles is illegal and its shared diagonal should be flipped. If it lies outside, leave it alone."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Each legal flip strictly improves the mesh's list of angles, sorted smallest first. That is why the process cannot cycle - you can never return to a configuration you have already left - and with finitely many triangulations it must therefore stop."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Where it stops is the Delaunay triangulation. It is the unique triangulation with no point inside any triangle's circumcircle, and it MAXIMISES the minimum angle over every possible triangulation of those points."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is exactly the slivers vanishing on screen. Skinny triangles are the ones with tiny angles, and a rule that pushes the smallest angle upward is a rule that destroys slivers."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is also why the answer matters beyond the picture: the same criterion is what mesh generators, terrain models and finite-element solvers use, because long thin triangles are what make numerical methods fall apart."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "cone_unrolled_straight",
   "title": "A cone hides its straight shortest path",
   "ts": "2026-08-04T03:05:51+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "A cone hides its shortest walking path. Full answer in bio - free, takes an email.",
   "a": "Cut the cone open and the shortest path is a straight line on the flat sector - about 0.840 of the slant height.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Rolling a cone flat does not stretch anything. The distance between two points measured on the curved surface is exactly the distance measured on the flattened skin, because unrolling preserves lengths - the metric on the cone turns into the ordinary flat polar metric."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the shortest path on the cone is whatever becomes the straight segment when you unroll. Draw the sector, mark the two points at their radii, join them, and roll it back up. The bent-looking curve on the cone IS the straight line."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Getting the number is then the law of cosines in the sector: root of (rA squared plus rB squared minus 2 rA rB cos of the sector angle between them). That gives 0.840053."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Compare the tempting routes. Going over the tip is 1.500. Hugging the base is 1.687. The straight-sector path beats both by a wide margin, and a search over 80,000 random two-bend paths never found anything shorter than 0.840131."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The catch is the sector angle. A full turn around the base is NOT 360 degrees on the flat skin - here it is 108. That shrinkage is why the shortest route looks like it leans the wrong way."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "rolls_flat_not_round",
   "title": "A non-round shape that rolls a plank flat",
   "ts": "2026-08-04T02:28:22+00:00",
   "date": "4 Aug 2026",
   "topic": "geometry",
   "q": "This triangle rolls like a circle. Answer's in bio - costs an email.",
   "a": "The shape has to have CONSTANT WIDTH, and roundness has nothing to do with it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Squeeze the shape between two parallel lines and slide them until they touch. The plank rides on the top line and the ground is the bottom one, so the plank stays level exactly when that gap is the same in every direction."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A circle has this property, but it is not the only shape that does. Start with an equilateral triangle of side 1 and draw three arcs of radius 1, each centred at the opposite corner. In any direction one support line touches a corner while the other touches the arc centred at that same corner - and that arc is exactly 1 unit away. So the width is exactly 1, in every direction."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is a Reuleaux triangle, and it plainly has corners. Corners are fine. What would tip the plank is a change in WIDTH, not a change in curvature."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The centre still bobs up and down as it rolls, which is why this makes a terrible wheel and a perfectly good roller. A wheel needs a fixed axle; a roller only needs to keep its load level."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "There is a bonus fact that catches people out: every shape of constant width w has the same perimeter, pi times w - exactly the circle's. That is Barbier's theorem."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "rope_round_the_earth",
   "title": "Add one metre to a rope around Earth. How big is the gap?",
   "ts": "2026-08-04T01:39:18+00:00",
   "date": "4 Aug 2026",
   "topic": "puzzles",
   "q": "Solve this: add one metre around Earth. How big is the gap? Answer's in bio - costs an email.",
   "a": "About 16 centimetres - and it is exactly the same for the Earth and the tennis ball.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Do the algebra before picking any radius. A tight rope around a circle of radius R has length 2 pi R. Lift it by a gap h and it becomes a circle of radius R + h, with length 2 pi (R + h)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Subtract: the extra rope needed is 2 pi (R + h) minus 2 pi R, which is 2 pi h. The R has cancelled completely."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the extra length depends ONLY on the gap, never on what you are wrapping. Turn it round: one extra metre gives h = 1/(2 pi), which is 0.159 metres, about 16 cm - enough to crawl under."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The tennis ball gets the same 16 cm. So does a marble, and so does the Sun. The answer to \"how big is the object\" is that it does not enter the question."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason it feels impossible is that we expect a fixed addition to matter in proportion to the size, and circumference simply is not built that way - it is LINEAR in the radius, so a fixed extra length buys a fixed extra radius. The Earth's 40,000 km never appears in the arithmetic because it cancels against itself."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "medians_meet_balance_point",
   "title": "Three triangle medians meet at the same balance point",
   "ts": "2026-08-03T23:46:23+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "Three triangle lines should miss. Solve where they meet in bio - it costs an email.",
   "a": "The three medians always meet, and the meeting point sits two thirds of the way down each one from its vertex.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Put the three corners at A, B and C and just average them: the point (A + B + C)/3. Call it G."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Check that G lies on the median from A. The midpoint of BC is (B + C)/2, and G is A plus two thirds of the way from A to that midpoint - the arithmetic works out immediately. By symmetry the same argument works from B and from C, so all three medians pass through this one point. That is why they always meet: they all contain the average of the corners."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That construction also hands you the ratio. G divides each median 2:1, measured from the vertex - two thirds of the way along, one third left over."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is called the centroid, and it really is the balance point: cut the triangle out of card and it balances on that spot, because it is the average position of the whole shape."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is also why the ratio never changes as you drag the corners. An average does not care where the points are - it just moves with them."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "gaussian_band_pinches",
   "title": "A Gaussian-process band pinches wherever data lands",
   "ts": "2026-08-03T23:08:25+00:00",
   "date": "3 Aug 2026",
   "topic": "ml_fundamentals",
   "q": "A measured point makes uncertainty pinch. Solve the far-away band in bio - answer costs an email.",
   "a": "Far from every measurement, the band forgets the data entirely and returns to the prior.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The posterior at a new point is built from the kernel links between that point and each observation. Those links decay with distance, so as you move far from all of them, every link goes to zero."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "With all links zero, the update term vanishes: the posterior mean falls back to the prior mean, and the posterior variance falls back to the prior variance. Nothing about the observations reaches that far."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the band does not keep widening without limit, and it does not stay narrow either. It converges to a fixed width - the prior standard deviation, which here is exactly 1."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the honest reading of a Gaussian process far from data: it is not confident, and it is not infinitely uncertain. It has simply reverted to what you told it before you measured anything."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The pinch points are the mirror image of the same fact. At an observation the links are strongest, the update is largest, and with noiseless data the variance is driven to zero - which is why the band is stitched to the ground exactly where you measured."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "midpoints_make_parallelogram",
   "title": "What shape do four side midpoints always make?",
   "ts": "2026-08-03T21:15:07+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "Solve this: four midpoints hide one shape. Answer's in bio - it costs an email.",
   "a": "It is always a parallelogram - for every quadrilateral, however ugly, and even a non-convex one.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Draw one diagonal of the outer quadrilateral. It cuts the shape into two triangles, and two of your midpoints are the midpoints of two sides of the first triangle."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now use the midline theorem: the segment joining the midpoints of two sides of a triangle is parallel to the third side and exactly half its length. So that inner side is parallel to the diagonal, and half of it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Do the same on the other triangle. Its midline is also parallel to that same diagonal and also half its length. Two inner sides, both parallel to the same diagonal, both half of it - so they are parallel to each other and equal."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A quadrilateral with one pair of opposite sides both parallel and equal is a parallelogram. Repeat with the other diagonal and you get the second pair for free."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is Varignon's theorem, and the reason it never fails is that nothing in the argument used any property of the outer shape at all - only that it has two diagonals. Its area, incidentally, is always exactly half the original's."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "bias_variance_dartboard",
   "title": "Two dartboards hide the bias-variance trade-off",
   "ts": "2026-08-03T20:37:38+00:00",
   "date": "3 Aug 2026",
   "topic": "ml_fundamentals",
   "q": "Two dartboards hide the bias-variance trade. Full answer's in bio - free, takes an email.",
   "a": "It depends entirely on how many throws you get to average, and the crossover is exact.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Write the expected squared miss for an average of m throws: bias squared plus variance divided by m. Averaging shrinks the variance term - it divides by m - and does absolutely nothing to the bias term."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The tight thrower is off-centre by 0.8, so its bias squared is 0.64 and its variance is 0.16. The wide thrower is centred, so its bias squared is 0 and its variance is 2.56."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For a single throw: the tight thrower's error is 0.80 and the wide thrower's is 2.56. The tight one wins comfortably."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "But average four throws and it reverses: tight 0.68, wide 0.64. The exact crossover is m = 15/4, so from four throws onward the wide, centred thrower is better, and its lead only grows - at 16 throws it is 0.16 against 0.65."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the honest answer is: take the wide scattered thrower if you can average even four attempts, and the tight biased one only if you get a single shot. Spread is a problem you can pay to fix with more data. Bad aim is not - no amount of averaging removes it."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "shortest_path_off_wall",
   "title": "The shortest path that has to touch a wall",
   "ts": "2026-08-03T18:44:05+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "A wall-touch shortcut hides in a mirror. Solve it in bio - answer takes an email.",
   "a": "Reflect one of the points through the wall, and the problem stops being a minimisation.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Take B and mirror it to the other side of the wall, call it B'. For any touch point P on the wall, the distance from P to B is exactly the distance from P to B', because the wall is the perpendicular bisector of the segment BB'."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the length you are minimising, AP + PB, is the same number as AP + PB' - a path from A to a fixed point B' that happens to bend at P. The shortest such path is the straight one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That means the best touch point is simply where the straight segment from A to B' crosses the wall, and the minimum total length is the straight-line distance |AB'| itself. Nothing has to be differentiated."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The angle fact falls out for free. The straight line makes equal angles with the wall on either side of P, and reflecting B' back to B carries one of those angles onto the outgoing leg. So the angle the path arrives at equals the angle it leaves - the same law light obeys off a mirror."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole reason light takes this path: it is not obeying a rule about angles, it is taking the shortest route, and equal angles are what shortest looks like."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "backprop_blame_flows",
   "title": "Backpropagation: every edge gets its own share of the blame",
   "ts": "2026-08-03T17:56:10+00:00",
   "date": "3 Aug 2026",
   "topic": "ml_fundamentals",
   "q": "This network learns by sending blame backward. Answer's in bio - free, takes an email.",
   "a": "Blame flows backward in exactly the same shape it flowed forward.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The network starts by outputting 0.845 against a target of 1.2, so the miss is -0.355 and the squared loss is 0.0630. Every gradient below is that one miss, handed backward."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Each output edge gets blamed in proportion to the hidden value it carried: the hidden node holding 0.95 earns a gradient of -0.3373, and the one holding -0.45 earns +0.1598. Bigger contribution, bigger share of the blame - and the sign flips when the contribution was negative."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The input edges get the same treatment one layer further back: the blame arriving at each hidden node is multiplied by the input that fed it. That is why the edge from input 1 to hidden 1 carries -0.2485 while the edge from input 2 to hidden 1 carries exactly half of it, -0.1243 - input 2 is half the size of input 1."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now take one step of size 0.35 down every gradient at once. The output moves from 0.845 to about 1.1230, and the loss falls from 0.0630 to 0.0030 - a drop of more than 95% from a single nudge."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It does NOT land on 1.2. Gradient descent takes a step proportional to the slope, not a jump to the answer, so it closes most of the gap and leaves a little. That leftover is what the next step works on."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "angle_in_semicircle",
   "title": "One angle refuses to move in a sliding semicircle",
   "ts": "2026-08-03T17:18:17+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "A triangle goes wild but one angle will not move. Solve it in bio - answer takes an email.",
   "a": "TIP: Add the circle centre and draw the two radii to the slider and the diameter ends. That splits the moving triangle into two isosceles triangles, so the two changing base angles can be tracked from the same centre angle.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/angle_in_semicircle"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "kl_two_coins_apart",
   "title": "Two coins are separated by evidence, not by vote count",
   "ts": "2026-08-03T16:11:10+00:00",
   "date": "3 Aug 2026",
   "topic": "information_theory",
   "q": "Two coins can be close in heads and far in evidence. Solve it in bio - it costs an email.",
   "a": "TIP: Do not count heads minus tails. Use a likelihood score. One head adds a small push toward the 90% coin; one tail adds a much bigger push toward the fair coin. Compare each average push with the 100-to-1 gate.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/kl_two_coins_apart"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "same_perimeter_different_area",
   "title": "Same perimeter, wildly different area",
   "ts": "2026-08-03T15:14:22+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "Same fence, wildly different field. Solve it in bio - free, takes an email.",
   "a": "TIP: Keep the string length fixed and watch the bar for inside-space, not the width of the shape. Uneven shapes waste boundary; making the distances from the middle more even is the useful direction.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/same_perimeter_different_area"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "pca_direction_of_spread",
   "title": "A spinning line turns a cloud into shadows",
   "ts": "2026-08-03T10:57:16+00:00",
   "date": "3 Aug 2026",
   "topic": "ml_fundamentals",
   "q": "A spinning line turns dots into shadows. Solve the direction in bio - answer costs an email.",
   "a": "The direction at about 36.87 degrees - the 3-4-5 direction - and it wins because it is the top eigenvector of the covariance.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The bar you are watching is the variance of the shadows on the spinning line. Written down, that is u-transpose C u, where u is the unit direction and C is the cloud's covariance matrix. So the question is which unit direction maximises that quadratic form."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is exactly the eigenvector problem. The maximum equals the largest eigenvalue and is achieved at its eigenvector; the minimum is the smallest eigenvalue, at right angles to it. For this cloud the eigenvalues are 5.3825 and 0.68493, so the long axis carries 7.86 times the spread of the short one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Because the two are perpendicular, the spinning bar has exactly two maxima and two minima per full turn - which is why the animation looks like a smooth double pulse rather than something lumpier."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the number worth keeping: 5.3825 out of 5.3825 + 0.68493, about 89%, of all the variance in the cloud lives along that one direction. Project onto it and you throw away two numbers per point in exchange for 11% of the spread."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That trade is all PCA is - order the directions by how much spread they carry, then keep the front of the list."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "coin_covers_line",
   "title": "A coin exactly as wide as the floor gap",
   "ts": "2026-08-03T09:58:23+00:00",
   "date": "3 Aug 2026",
   "topic": "puzzles",
   "q": "A coin as wide as the floor gap looks like it should miss. Solve it in bio - answer costs an email.",
   "a": "Every single time. The probability is exactly 1, not something with a pi in it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Once the coin's diameter equals the line spacing, the angle stops mattering - a disk has no orientation. All that matters is where the centre lands between two lines."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Fold the picture down to one gap and measure the distance from the centre to the nearest line. That distance is somewhere between 0 and half a gap, uniformly. The coin touches a line whenever that distance is at most its radius - which is also half a gap."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the touching interval is the ENTIRE range of possible positions: length one half out of one half, a ratio of exactly 1. There is nowhere the centre can land that misses."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is the trap the setup is built on. It looks like Buffon's needle, where the answer famously carries a pi, but a needle's random ANGLE is what puts pi there - the crossing condition involves a sine. A coin has no angle to integrate over, so no pi appears anywhere."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Shrink the coin below the gap and it becomes interesting again: with diameter d and spacing s, the touching probability is simply d/s, still with no pi in sight. The pi was never about round things - it was about angles."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "max_likelihood_slide",
   "title": "Where does maximum likelihood put the bell curve?",
   "ts": "2026-08-03T09:14:00+00:00",
   "date": "3 Aug 2026",
   "topic": "statistics",
   "q": "Seven dots choose one bell curve. Solve where it peaks in bio - it costs an email.",
   "a": "TIP: Do not compare the bell curves by eye. Take logs first: multiplying the heights turns into adding the penalties. Then ask where the penalties on the left and right balance, without forgetting the far-away point.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/max_likelihood_slide"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "pizza_slice_two_cuts",
   "title": "Two off-centre right-angle pizza cuts; which opposite pair wins?",
   "ts": "2026-08-03T08:02:47+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "Two off-centre pizza cuts make a hidden winner. Solve it in bio - free to play, answer takes an email.",
   "a": "The pair containing the centre wins, and the margin is exactly 4ab.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Put the crossing point at (a, b) away from the centre in the cuts' own coordinates, with the pizza a unit circle. Let D be the area of one opposite pair minus the other."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Start with the cuts centred. By symmetry the four pieces are equal and D is zero. Now slide the vertical cut by a small amount: the only area that changes lives in that thin slice, and on it the length above the horizontal cut minus the length below is exactly -2b. So D changes at the rate 4b per unit slide."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Integrate that and D = 4ab, exactly. No approximation and no case analysis - just the product of the two offsets, times four."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So whenever the crossing point is off-centre in both directions, the pair that includes the pizza's centre is strictly bigger, and the further off-centre the crossing, the bigger the margin. With a = 1/4 and b = 1/3, the gap is exactly 1/3 of a unit of area."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The two cuts being PERPENDICULAR is what makes it this clean. It also means the answer never depends on how the cuts are rotated, only on how far the crossing point sits from the middle."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "matching_stable_pairs",
   "title": "Four ranked lists: can every red pair be killed?",
   "ts": "2026-08-03T06:28:12+00:00",
   "date": "3 Aug 2026",
   "topic": "graphs",
   "q": "Can four random rankings always avoid a red pair? Answer's in bio - free, takes an email.",
   "a": "TIP: Watch the receiving side. Once a receiver is holding an offer, they only ever trade up. So if someone has already been rejected by a receiver, that receiver cannot later be part of a red pair with them.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full worked answer - free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/matching_stable_pairs"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "change_of_basis_same_arrow",
   "title": "The arrow stayed still. Why did its numbers change?",
   "ts": "2026-08-03T06:00:14+00:00",
   "date": "3 Aug 2026",
   "topic": "linear_algebra",
   "q": "This arrow keeps still while the ruler moves. Solve it in bio - answer costs an email.",
   "a": "One third and seven thirds. The arrow never moved; only the ruler did.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "You are solving for the amounts a and b that satisfy a times (2, -1) plus b times (1, 1) equals (3, 2). That is two equations: 2a + b = 3 across, and -a + b = 2 up."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Subtract the second from the first and the b cancels: 3a = 1, so a = 1/3. Put that back and b = 2 + 1/3 = 7/3."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Check it. One third of (2, -1) is (2/3, -1/3); seven thirds of (1, 1) is (7/3, 7/3). Add them: (2/3 + 7/3, -1/3 + 7/3) = (3, 2). Exactly the arrow you started with."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the same arrow is \"(3, 2)\" in one basis and \"(1/3, 7/3)\" in the other. Neither is more real than the other - coordinates are a description, not the thing. What stayed fixed through all of it is the arrow."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole content of a change of basis, and it is why the matrix whose COLUMNS are the new basis vectors turns new coordinates into old ones. Going the other way, as here, means solving with it - which is the same as multiplying by its inverse."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "sieve_primes_fall",
   "title": "Why does the prime sieve stop after 7?",
   "ts": "2026-08-03T04:27:11+00:00",
   "date": "3 Aug 2026",
   "topic": "number_theory",
   "q": "The grid says stop after 7. Full answer's in bio - free, takes an email.",
   "a": "Because 7 squared is 49 and the next prime squared, 121, is already past 100.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Take any composite number up to 100. It factors into at least two pieces bigger than 1, and both cannot exceed 10 - if they did, their product would exceed 100. So EVERY composite up to 100 has a factor of at most 10."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That factor is either prime or it breaks down further into primes, so every composite up to 100 has a PRIME factor of at most 10. The primes at most 10 are 2, 3, 5 and 7 - exactly the four you crossed with."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So by the time you have swept the multiples of 7, every composite has already been struck out by one of the four, and anything still standing has no prime factor below 10. It cannot be composite, so it is prime."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The general rule is that you only ever need primes up to the square root of your limit. For 100 that is 10, so you stop at 7. For 1000 you would stop at 31."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The tell that you have gone far enough is the sweep for 11: its first uncrossed multiple would be 11 times 11, which is 121 - off the board entirely. There is nothing left for it to do."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "continued_fraction_squares",
   "title": "The continued fraction hiding inside a rectangle",
   "ts": "2026-08-03T03:59:05+00:00",
   "date": "3 Aug 2026",
   "topic": "number_theory",
   "q": "One rectangle never stops making squares. Full answer's in bio - free, takes an email.",
   "a": "The golden ratio - about 1.6180339887 - and it is the only ratio that repeats forever with the same cut every time.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule is: cut the largest square you can off a rectangle, keep the leftover, repeat. This is the Euclidean algorithm made visible, and the counts of squares at each stage ARE the continued fraction of the side ratio."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For 13 by 5 the counts are 2, 1, 1, 2 and it stops, because 13 and 5 are whole numbers with a common measure. Every rational ratio terminates - that is exactly what a common factor means geometrically."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now demand that ONE square comes off and the leftover is a smaller copy of the original. If the ratio is x, cutting one square leaves a rectangle of ratio 1/(x-1), and setting that equal to x gives x squared minus x minus 1 = 0."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The positive root is (1 + root 5)/2 = 1.6180339887. Its continued fraction is all ones, forever, which is another way of saying the picture never changes shape and never terminates."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is also why the golden ratio is called the most irrational number: all-ones is the slowest possible continued fraction to converge, so it is the ratio hardest to approximate well by fractions."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "roc_threshold_slide",
   "title": "A diagnostic threshold has no single best place",
   "ts": "2026-08-03T03:30:08+00:00",
   "date": "3 Aug 2026",
   "topic": "statistics",
   "q": "A test catches more sick people only by scaring more healthy ones. Solve the curve in bio - free, takes an email.",
   "a": "The area under the curve is a probability: the chance a randomly chosen sick person scores higher than a randomly chosen healthy one.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is what makes it useful. It is not an accuracy, and it is not tied to any particular cutoff - it summarises the whole trade-off curve in one number, which is exactly why you can compare two tests with it before deciding where to put the threshold."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Read the extremes. An area of 0.5 is a coin flip: the two score distributions overlap completely and the test carries no information. An area of 1.0 means every sick person outscores every healthy one, so some threshold separates them perfectly. Below 0.5 means your test is right but your sign is backwards."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For the two clouds drawn here it comes to 0.830109 - so about 83% of sick/healthy pairs are ranked the right way round. Checked three ways: the closed form for two equal-variance normals, Phi of the separation over root 2; a numerical integral agreeing to 4e-16; and 2,000,000 Monte Carlo pairs landing on 0.83023."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The practical point the sliding threshold is making: the curve is the menu and the area is the quality of the menu. Choosing WHERE to sit on it is a separate decision about what a miss costs versus what a false alarm costs."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "derivative_secant_collapse",
   "title": "What does a derivative actually measure?",
   "ts": "2026-08-03T02:24:02+00:00",
   "date": "3 Aug 2026",
   "topic": "calculus",
   "q": "The two points meet, but the line survives. Solve its steepness in bio - free, takes an email.",
   "a": "TIP: Do not try to use the two coincident points directly. Keep a tiny gap, compute the average climb across that gap, then ask what number those averages approach as the gap shrinks.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/derivative_secant_collapse"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "crt_two_gears",
   "title": "Three slot rings hide the Chinese remainder theorem",
   "ts": "2026-08-03T01:11:12+00:00",
   "date": "3 Aug 2026",
   "topic": "number_theory",
   "q": "Two slot rings hide a count. Answer's in bio - free, takes an email.",
   "a": "TIP: Track the tick count k, not the slots. A gold slot is back on top exactly when that ring's slot count divides k, so the machine is asking for one count that passes several divisibility tests at once.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/crt_two_gears"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "convex_hull_rubber_band",
   "title": "Which points does the rubber band touch?",
   "ts": "2026-08-03T00:42:48+00:00",
   "date": "3 Aug 2026",
   "topic": "geometry",
   "q": "Solve this: which points can a rubber band actually touch?",
   "a": "Eight of the fourteen. The band settles on A, B, C, D, E, F, G and H; the other six are strictly inside and never feel it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The test for a point being touched is local and needs no algorithm to state: a point is on the hull exactly when you can draw a straight line through it with EVERY other point on one side. That is what a taut band is - a supporting line at each contact."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Run that test on I, J, K, L, M and N and it fails for all of them. Each has points of the cloud on both sides of any line you draw through it, so the band passes over rather than around."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Notice what the interior points do NOT affect: nothing. You can slide any of the six anywhere inside the boundary and the band does not move. Only the outermost points carry any of the tension, which is why the hull is a summary of a cloud's extent and says nothing about its density."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The standard way to compute it is to sort the points and sweep, keeping a chain and discarding any point where the turn goes the wrong way - the same left-turn test, applied greedily. It runs in n log n, and the sort is the expensive part."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Convex hulls are the first step in a lot of geometry code precisely because they throw away the interior cheaply."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "least_squares_drop",
   "title": "Least squares: where does the line settle?",
   "ts": "2026-08-03T00:14:35+00:00",
   "date": "3 Aug 2026",
   "topic": "linear_algebra",
   "q": "A line can look right and still lose. Solve its best angle in bio - free, takes an email.",
   "a": "The slope that minimises the stacked area is 5/7, through the average point (0, 1/2).",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Write the total dropped-square area as a function of the slope m. Each dot contributes the square of its vertical miss, so the total is sum over points of (centred y minus m times x) squared."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Expand it and it is a quadratic in m: (sum x squared) m squared minus 2 (sum x times centred y) m plus (sum centred y squared). With these six points that is 28 m squared minus 40 m + 17.5."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A quadratic with a positive leading coefficient has exactly one minimum, at m = (sum x times centred y) / (sum x squared) = 20/28 = 5/7. No search, no iteration - one division."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole least-squares idea in miniature: the thing being minimised is quadratic in the unknown, so the answer is a single formula rather than a hunt, and it is unique."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two things worth noticing. Squaring is what makes it quadratic, and hence solvable in closed form - minimising the total ABSOLUTE miss instead has no such formula. And squaring is also why one far-off dot drags the line so hard: its miss counts by its square, so a dot twice as far off pulls four times as much."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "fourier_circles_draw",
   "title": "How many rotating circles does it take to draw a sharp square?",
   "ts": "2026-08-02T22:47:53+00:00",
   "date": "2 Aug 2026",
   "topic": "calculus",
   "q": "Solve the square hiding inside spinning circles.",
   "a": "No finite number. A truly sharp square needs infinitely many circles, and the reason is worth more than the answer.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Each circle contributes one sine wave. Adding finitely many sine waves gives a sum of smooth functions, which is itself smooth - and smooth curves do not have corners. So no finite stack of circles can produce a genuine right angle."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "What you get instead is a curve that hugs the square more and more closely everywhere except at the corners. The error in the flat parts falls away as you add circles, and the drawing becomes visually indistinguishable from a square long before it is one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "At the corners something stubborn happens. The overshoot beside a jump does not shrink towards zero as you add terms - it settles at about 9% of the jump and simply gets NARROWER. That is the Gibbs phenomenon, and it is why the corners keep a small permanent ear no matter how many circles you add."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the honest answer has two halves: infinitely many for exactness, and surprisingly few for a good picture. A handful of circles already looks square to the eye."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is exactly the trade every compression scheme makes. Keep the big low-frequency circles, discard the tiny fast ones, and accept a little ringing at the edges - which is what JPEG artefacts around sharp boundaries actually are."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "determinant_area_scale",
   "title": "One linear map, one area multiplier",
   "ts": "2026-08-02T21:34:26+00:00",
   "date": "2 Aug 2026",
   "topic": "linear_algebra",
   "q": "A slanted grid changes every area by one secret number. Answer's in bio — free, takes an email.",
   "a": "TIP: Do not follow the whole grid at once. Follow one unit square. Its image has side vectors equal to where the two grid steps land, and every other tile is just that image shifted somewhere else.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/determinant_area_scale"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "annealing_escapes_valley",
   "title": "The bad move that finds the better valley",
   "ts": "2026-08-02T21:06:28+00:00",
   "date": "2 Aug 2026",
   "topic": "optimization",
   "q": "The best move in this search is the one that looks wrong. Answer's in bio — free, takes an email.",
   "a": "Useful tip: annealing is not \"random search\". The random part is strongest only when the temperature is high. Once the temperature is low, the same rule becomes almost greedy again.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "On this landscape, look at the shallow dip and ask one question: how can a local rule ever cross a ridge if it is forbidden to move uphill?"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full transition table and the exact checks: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/annealing_escapes_valley"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "shortest_path_wavefront",
   "title": "The shortest route is not the one with the fewest roads",
   "ts": "2026-08-02T19:58:43+00:00",
   "date": "2 Aug 2026",
   "topic": "graphs",
   "q": "Solve this map before the wave reaches the finish.",
   "a": "Tip: do not choose the next road. Choose the next town whose arrival time is now impossible to improve.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "At the start, write 0 at S and send a wave down every road out of S. When the first new town lights up, freeze that time. From that town, send new waves onward. If a new wave gives a town a smaller time than the one it already has, replace the label; if it is larger, ignore it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The key observation is that once the smallest unsettled label is picked, every other unfinished route would have to add a positive road time before it could get there. So it cannot sneak in later with a smaller number."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Use that to reconstruct the route into T, but stop yourself from counting hops. The road drawn longest on the map is not the same thing as the slowest road."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full answer and the checked route: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/shortest_path_wavefront"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "euler_steps_converge",
   "title": "Arrow walks: what do Euler steps converge to?",
   "ts": "2026-08-02T19:30:59+00:00",
   "date": "2 Aug 2026",
   "topic": "calculus",
   "q": "A staircase can be aiming at a curve. Answer's in bio — free, takes an email.",
   "a": "They converge on e, which is 2.718281828... and the error halves every time you halve the step.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule is that the arrow's steepness equals your current height, started at height 1. Take one Euler step of size h: you multiply your height by (1 + h). Do that n times across one unit of distance, with h = 1/n, and you finish at exactly (1 + 1/n) to the power n."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That expression is the classic definition of e. One step lands at 2, two steps at 2.25, four at 2.44, sixteen at 2.638 - climbing towards 2.71828 and never quite arriving."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It never arrives because Euler's method always cuts the corner. The true curve keeps steepening between your sample points, and you walked using the arrow measured only at the start of each step, so you always land LOW."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The error has a clean shape: e minus (1 + 1/n) to the n is about e/(2n). That means halving the step halves the error - first order accuracy - which is why Euler's method needs so many steps to get a few decimals, and why better integrators exist."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the picture is honest: the jagged path really is heading for the smooth curve, just slowly."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "maybe_never_no",
   "title": "A checker that can lie yes, but never lie no",
   "ts": "2026-08-02T19:02:55+00:00",
   "date": "2 Aug 2026",
   "topic": "cs_systems",
   "q": "A checker that can lie \"yes\", but can never lie \"no\".",
   "a": "Not giving you the sizing rule — but here is the observation it falls out of, and you can get most of the way from it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Think about one single position in the row after everything has been inserted. Each item lights a handful of positions, so each insert gets a few independent chances to miss this one particular spot. Multiply those chances together across all the items and you have the probability this position is still dark."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now a false \"maybe\" is just: every position the query checks happens to be lit. Those checks are near enough independent, so it is that single-position probability, flipped and raised to the number of scramblers."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Write that down and something surprising falls out. More scramblers means more chances to catch a missing item — but it also means each insert lights more bits, so the row fills faster and every check is likelier to hit a lit one by accident. The two effects fight, so there is a best number of scramblers, and it is NOT \"as many as you can afford\"."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The tell: work out what fraction of the row is dark at that optimum. It comes out at an absurdly clean number, and the moment you see it the whole sizing rule drops out in one line."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Worth knowing before you use one: it never wrongly says no, so you can put it in front of an expensive lookup and only pay for the maybes. That is the entire reason it exists."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full derivation, the sizing rule and the optimal count — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/maybe_never_no"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "goat_grazes_half",
   "title": "A goat tied to the fence of a round field — how long a rope eats exactly half?",
   "ts": "2026-08-02T18:34:49+00:00",
   "date": "2 Aug 2026",
   "topic": "geometry",
   "q": "A goat is tied to a post on the fence of a round field. How long a rope lets it eat exactly half the grass?",
   "a": "The rope is about 1.1587 times the field's radius - 1.158728473 to nine decimals.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Set the field radius to 1 and put the post on the fence. The grazed patch is the overlap of two discs, and the two boundaries cross on the horizontal line y = r squared over 2, minus 1. That line splits the patch into two circular segments: below it the edge is the fence, above it the edge is the rope."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Each segment has a closed form. Adding them gives the grazed area as a function of r alone, and you set that equal to pi over 2 - half the field."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now the sting. The rope length r appears inside two inverse cosines AND multiplied outside them. There is no rearrangement that isolates it: no root, no substitution, nothing. The equation is genuinely transcendental, so the only honest route is to close in on the number."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is safe to do here because the grazed area increases strictly with r, so there is exactly one solution and no second answer hiding anywhere. Squeezing it gives r = 1.1587284730."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "For scale: a rope equal to the distance from the fence to the centre - r = 1 - only gets the goat 39.1% of the field. The answer is a good deal longer than most people's first guess."
     ]
    }
   ],
   "src": "answer"
  },
  {
   "slug": "seven_bits_one_flip",
   "title": "Seven bits, one flips, and the block says which",
   "ts": "2026-08-02T10:44:32+00:00",
   "date": "2 Aug 2026",
   "topic": "information_theory",
   "q": "Seven bits go down a wire, one of them flips, and the message can still tell you exactly which one.",
   "a": "Not going to hand you the position — but here is the observation that unlocks it, and it is the whole idea:",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Three overlapping circles cut the plane into exactly seven regions. Seven positions, seven regions — so every position sits in its own unique combination of circles. No two are alike."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is why the receiver never has to search. \"Which checks came out odd\" is not a hint about the broken bit; it is a name for it. There is exactly one region inside both of the circles that went odd and outside the one that stayed even, and that region holds exactly one position."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So: two circles odd, one even. Find the region that is inside both odd ones and outside the even one, and read off the number underneath it. That is your answer, and you can do it from the frame in the video."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two things worth knowing once you have it:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— The check bits are the ones sitting alone in each circle. That is not a coincidence, it is what makes the encoder trivial: choose your four message bits, then set each check so its own circle comes out even. Nothing else has to be recomputed."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— It breaks on two flips, and not gracefully. It does not report a problem — it confidently blames a third, innocent position and hands back a wrong message with no complaint. Worth thinking about why before you look that up."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full worked answer, the construction, and the exhaustive 128-case check — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/seven_bits_one_flip"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "diamond_or_circle_budget",
   "title": "Two ways to keep the dials small — only one switches a dial off",
   "ts": "2026-08-02T09:11:59+00:00",
   "date": "2 Aug 2026",
   "topic": "ml_fundamentals",
   "q": "Two ways to tell a model to keep its numbers small. One of them deletes a feature outright.",
   "a": "Not giving you the answer — but here is the one observation that cracks it, and you can do it in your head.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The constrained answer is the lowest-error point of the budget region. The error contours are nested ellipses growing out of the free best fit, so that point is simply wherever the growing ellipse FIRST touches the region."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now ask what a \"first touch\" needs at each kind of place on a boundary."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— At a smooth point, the ellipse and the boundary have to be tangent: their outward directions must agree exactly. That is one equation. Tilt the ellipse slightly — different data, differently correlated columns — and the touch point slides somewhere else. It is a knife edge."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— At a corner there is no single outward direction to match; a corner has a whole fan of them. So a corner keeps on winning across a RANGE of ellipse orientations rather than one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the entire difference. Now look at where each region's corners sit relative to the axes, and ask what it means for a coefficient when the answer lands exactly on an axis."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two things worth doing yourself before you look them up:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— Write the answer on the flat face of the diamond as a function of the budget t. With standardised columns it comes out linear in t, so you can read off the exact budget at which the second coefficient hits zero. It is a difference of two numbers you already have."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— For the circle, the answer is (X'X + m·I)^-1 X'y as m runs from 0 upwards. Write its second component as a fraction in m and find the m that makes it vanish. Then check whether that m is a penalty you could ever actually apply."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both coefficient paths, the exact threshold, the data, and the proof that the drawn touch point really is the constrained minimum — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/diamond_or_circle_budget"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "cube_root_seven_slides",
   "title": "Four slides down a curve pin the cube root of 7 to 21 decimals",
   "ts": "2026-08-02T07:45:05+00:00",
   "date": "2 Aug 2026",
   "topic": "optimization",
   "q": "Nobody can tell you the number whose cube is seven. Four slides down a curve can.",
   "a": "Not giving you the digits — but you can get the first two yourself in about a minute, on paper, and here is exactly how.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Start at x = 2. Two cubed is eight, so you are one too big."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The line you slide down is the one touching the curve at your guess. For y = x³ − 7 its steepness at x is 3x², which at x = 2 is 12. You are 1 above zero and descending 12 for every 1 you move left, so you move 1/12 to the left."
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    next guess = 2 − 1/12 = 23/12 = 1.91666…"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The true answer starts 1.9129…, so one slide has already bought you the integer part and the first decimal. Do it once more with the same rule — steepness 3x² at your new guess, divide the height you are above zero by it, step that far left — and four or five decimals appear at once. That is the doubling starting."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule in one line: subtract (how far above zero you are) divided by (how steep the curve is there)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two things worth noticing while you do it:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— You never need the answer to check your work. The error shrinks so fast that each guess agrees with the next to twice as many places, and that agreement IS the accuracy."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— It only doubles once you are close. Start where the curve is nearly flat, so the line you follow is nearly horizontal, and it will throw you a long way off. Worth working out where that happens for this curve."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "All 30 decimals, every exact fraction in the chain, and the proof the digit count doubles — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/cube_root_seven_slides"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "three_switches_one_look",
   "title": "Three switches, one bulb behind a closed door, one look",
   "ts": "2026-08-02T06:10:29+00:00",
   "date": "2 Aug 2026",
   "topic": "puzzles",
   "q": "Three switches, one bulb behind a closed door — and you only get to look inside once. Try it yourself.",
   "a": "Not giving you the answer — but here is the argument that turns this from guesswork into something you can reason your way to.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "START WITH THE COUNT, NOT WITH THE SWITCHES. There are three possible worlds: switch one is live, switch two is live, switch three is live. You get one look. If the only thing your look can come back with is \"lit\" or \"not lit\", that is two outcomes for three worlds, and no strategy repairs it — two boxes cannot hold three things. That is not a hint that the puzzle is hard. It is a proof that a light-only reading is impossible."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which flips the question. Don't ask \"which switch do I flip first?\" Ask: how many genuinely different states can that room be in when the door opens? You need at least three. Find three, and the flipping plan writes itself in about ten seconds."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "NOW THE LINE EVERYONE SKIMS. You may flip the switches as much as you like, AND wait as long as you like. Two freedoms. Almost everyone spends the first and completely ignores the second. Nothing about \"on or off\" gets better if you wait — a bulb that is on stays on. So ask yourself why a puzzle about a light bulb would go out of its way to hand you unlimited time. It is not padding. It is the whole thing."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two more things worth noticing once you have it:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— You get to choose what ALL THREE switches are doing at the moment the door opens, not just which one you touched last. That is more control over the final state than it first looks like, and it is where the extra readings come from."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— With two looks it is trivial (flip one, look, that settles it or eliminates it; flip another, look, done). The entire difficulty is compressing two readings into one, which is why the counting argument above is the right place to start."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full answer, the case table for all three worlds, and why the reading you end up with really is enough — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/three_switches_one_look"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "twelve_coins_three_weighings",
   "title": "Twelve coins, one is the wrong weight, three weighings",
   "ts": "2026-08-02T05:43:34+00:00",
   "date": "2 Aug 2026",
   "topic": "puzzles",
   "q": "Twelve coins, one is the wrong weight, and nobody tells you which way. Solve it in three weighings.",
   "a": "Not giving you the strategy — but here is the counting argument that tells you it is even possible, and it is most of the battle.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Twelve coins, and the odd one could be heavy OR light. So there are 24 possible worlds, not 12."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A balance has three outcomes, not two: left down, right down, level. So three weighings can distinguish at most 3 × 3 × 3 = 27 worlds. Two weighings reach only 9, and 9 < 24. So two is provably impossible for ANY strategy, however clever — and three leaves you 27 slots for 24 worlds, with three to spare."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That margin is what makes this hard. There is almost no slack, which means every weighing has to split the remaining possibilities into three nearly equal piles. Get one weighing that splits 24 into 12/8/4 and the worst branch has already killed you."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the real question is: how many coins go on each pan first? Try each option and count the worst pile it can leave you with. Only one number works, and once you have found it the rest of the puzzle follows from the same rule applied again."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One more thing worth noticing: after the first weighing you know things about coins you have not weighed, and about the DIRECTION a coin would be wrong in. A coin that was on the heavy side can only be heavy. Carrying that forward is what makes the later weighings cheap."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The full strategy, all three branches, and the exhaustive check over all 24 cases — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/twelve_coins_three_weighings"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "how_few_colours",
   "title": "Twelve exams, some clash — how few time slots do you need?",
   "ts": "2026-08-02T04:40:03+00:00",
   "date": "2 Aug 2026",
   "topic": "graphs",
   "q": "Twelve exams, some pairs clash. How few time slots do you need? Nobody solves this one in their head.",
   "a": "Not giving you the number — but here is the move that turns this from guesswork into something you can actually finish.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Do it in two halves, because a single number needs both of them."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "THE UPPER HALF: find a colouring that works. Don't go in reading order — that is exactly the order the video shows failing. Go in order of how busy each exam is: colour the ones with four clashes first, while you still have all your freedom, and leave the ones with only two clashes till last, because a quiet exam can nearly always be slotted in at the end. The two exams along the top of the picture clash with two others each; they will never be your problem. The tight part is the bottom."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "THE LOWER HALF: show that nothing smaller works. Three exams that all clash force three colours between them, and that much you can just see. Going below that is impossible; going below whatever number you land on is the bit you have to argue. \"I couldn't find one\" is not an argument. The argument that does work is forcing: fix a colour on one exam, follow the consequences round the picture — each exam whose neighbours already use every colour but one has no choice — and if every starting choice ends with two joined exams pushed onto the same colour, you are done."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And a check while you work: if your colouring uses k colours and you have also found a set of k exams that all clash with each other, stop. You have squeezed it from both sides and nothing more needs proving. If those two numbers do NOT meet, the gap is real work — which is the whole point of this one."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "new_road_slows_everyone",
   "title": "A new road that makes everybody's drive longer",
   "ts": "2026-08-02T04:13:05+00:00",
   "date": "2 Aug 2026",
   "topic": "paradox",
   "q": "A town opened a new road, free and instant. Every single journey got longer. Try it yourself",
   "a": "The tip for spotting this one coming: look at what the new road lets people STOP using.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "WHAT ACTUALLY CHANGED. Before it opened, every driver used exactly one road whose time depends on the crowd and one road whose time does not. That flat 45-minute road was doing real work — it was a brake. It made the two ways self-balancing, because the moment one narrow road got busier than the other, drivers moved back."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The new link doesn't add a lane. It lets every driver drop the flat road entirely and ride two crowd-sensitive roads instead of one. Twice the sensitivity, and no brake at all. That is the whole mechanism, and it is why \"more capacity\" can be the wrong instinct: capacity that changes which roads people can AVOID is not the same as capacity that carries more cars."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "HOW BAD CAN IT GET? Keep 40 drivers and a narrow road at a minute per car (so a full one is 40 minutes) and slide the wide road's flat time F:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "F = 41 -> 61 minutes becomes 80  (x1.31)",
      "F = 45 -> 65 becomes 80          (x1.23, the video)",
      "F = 50 -> 70 becomes 80          (x1.14)",
      "F = 59 -> 79 becomes 80          (x1.01)",
      "F = 60 -> 80 becomes 80          (no change)",
      "F = 65 -> 85 becomes 80          (the road HELPS)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Below F = 40 nobody would take the new road at all. So the paradox lives in a window, and the ratio is worst at the bottom of it: as F approaches 40, \"before\" approaches 60 and the ratio approaches 80/60 = 4/3. A free road can make every drive a THIRD longer. It cannot do worse than that here."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "AND THE ROAD ISN'T THE VILLAIN. If you could simply tell 6 of the 40 to use it and the other 34 to stay put, the town would burn 2,588 driver-minutes — less than the 2,600 it managed with no new road at all. Left to choose for themselves they burn 3,200. The road is fine. Uncoordinated self-interest is what costs."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Cities have run the experiment backwards. Seoul demolished the Cheonggyecheon elevated motorway in 2003 and journey times improved; New York closed 42nd Street for Earth Day 1990 expecting chaos and got smoother traffic."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play one yourself, free, no signup: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/new_road_slows_everyone"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "two_losers_one_winner",
   "title": "Two losing games that make a winner",
   "ts": "2026-08-02T02:41:06+00:00",
   "date": "2 Aug 2026",
   "topic": "paradox",
   "q": "Two gambling games. Each one loses you money on its own. Play them in a random order and you get rich.",
   "a": "The tip for seeing this one coming: stop asking whether a game is good, and ask where it leaves you standing.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Game two's coins are excellent. Hand them a balance spread evenly across the three remainders and they earn 5.67p a round. Game two loses because it never gets an even spread — its OWN play manufactures the spread it is then forced to play on. Look for that in any system where the next move depends on the current state."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "THE SELF-SABOTAGE, in one line: winning with the great coin moves you up one, and one above \"two past a multiple of three\" is a multiple of three. The good coin's reward is being handed the bad coin. The walk gets stuck in a two-step loop, 101 → 102 → 101, going nowhere while it bleeds."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "THE ARITHMETIC OF THE FLIP. Let p0 be the long-run share of rounds sitting on a multiple of three. The edge per round is"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  −0.81·p0 + 0.49·(1 − p0)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "which is positive exactly when p0 < 0.3769. Game two alone sits at 0.3836. It misses by seven thousandths. Mixing in a game that ignores your balance drags p0 to 0.3451, and that is all it takes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "WHAT MOST WRITE-UPS GET WRONG. Strict alternation LOSES here. I checked all of them exactly rather than trusting any:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  random 50/50      +1.5704 p/round  WINS",
      "  two-of-each       +1.4651          WINS",
      "  one,two,one,two   −0.6738          loses",
      "  game one alone    −1.0000          loses",
      "  game two alone    −0.8695          loses"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So \"just take turns\" is not the lesson: a fixed schedule can lock onto the very rhythm that traps game two (its two-step chain settles on 0.2347 / 0.0759 / 0.6895). The mixing has to break the pattern, not join it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "WHERE THIS BITES. Any strategy whose payoff depends on the state it has itself produced — a rule that moves the price it trades on, a policy that shapes the queue it serves, a scheme that generates its own training data. Testing each piece alone can mislead in both directions."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play one yourself, free, no signup: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/two_losers_one_winner"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "pipes_tightest_cut",
   "title": "How much water gets through this network of pipes?",
   "ts": "2026-08-02T01:28:16+00:00",
   "date": "2 Aug 2026",
   "topic": "graphs",
   "q": "Two pipes feed the top of this network and they can carry twenty between them. Far less than twenty comes out.",
   "a": "Not giving you the number — but here is the idea that turns it from guesswork into something you can just read off the picture.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Adding up the pipes leaving the source is wrong, and so is adding up the pipes arriving at the drain. Both are only upper bounds, and usually bad ones."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the one that is exact. Draw any line that separates the source from the drain, cutting the network in two. Everything that gets through must cross that line, so the total capacity of the pipes it cuts is a ceiling on the flow. Every possible line gives you a ceiling — and the true answer is the SMALLEST ceiling any line gives."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is not an approximation. The best flow and the tightest cut come out exactly equal, always, which is why you can find the answer by looking for the worst bottleneck rather than by routing anything."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So: try to find the line that cuts the least capacity. It is not near the source and it is not near the drain — it is somewhere in the middle, and in this network no pipe touching the source or the drain is part of it. Count what it cuts."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A check while you work: whatever number you get, try to actually push that much through. If you can, and you have found a cut of the same size, you are done — you have squeezed the answer from both sides and nothing else needs proving."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "biggest_square_tiles",
   "title": "Cut the biggest square off this rectangle, again and again",
   "ts": "2026-08-02T00:09:24+00:00",
   "date": "2 Aug 2026",
   "topic": "number_theory",
   "q": "Two numbers that look like they share nothing at all. Five squares later, out falls the length that measures both.",
   "a": "THE MECHANISM, in full.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rectangle is 1496 by 935. Cut off the biggest square that fits, over and over:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "1496 x 935  ->  cut a 935 square, leaving 561 x 935",
      " 561 x 935  ->  cut a 561 square, leaving 561 x 374",
      " 561 x 374  ->  cut a 374 square, leaving 187 x 374",
      " 187 x 374  ->  cut a 187 square, leaving 187 x 187",
      " 187 x 187  ->  already a square. Stop."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Five squares: 935, 561, 374, 187, 187. Their areas add to 1,398,760, and 1496 x 935 = 1,398,760 — so they tile the rectangle exactly, no overlaps and no gaps."
     ]
    },
    {
     "h": "WHY THE LAST SQUARE IS THE ANSWER",
     "t": "p",
     "lines": [
      "Suppose some length L fits a whole number of times into both sides of a rectangle. Cut a square off it. The square's side is one of those sides, so L fits into it too — and the leftover side is just one side minus the other, so L fits into that as well. Nothing is ever lost: the lengths that measure both sides of the NEW rectangle are exactly the lengths that measured both sides of the old one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Run that all the way to the end and you're holding a single square. The biggest length that measures a square's two sides is its own side. So the last square's side, 187, is the biggest length that measured 1496 and 935 all along."
     ]
    },
    {
     "h": "CHECK IT BY HAND",
     "t": "p",
     "lines": [
      "The only whole lengths that go into both 1496 and 935 are 1, 11, 17 and 187. 1496 = 8 x 187. 935 = 5 x 187. So forty 187-squares tile the rectangle — which is the last thing the video draws."
     ]
    },
    {
     "h": "THE OTHER CASE",
     "t": "p",
     "lines": [
      "Try 89 by 55. Same rule, and the squares march all the way down: 55, 34, 21, 13, 8, 5, 3, 2, 1, 1 — ten of them, ending on a square of side 1. That IS what \"these two share nothing\" looks like. Ten squares for two two-digit numbers, five squares for two four-digit ones: the count has almost nothing to do with how big the numbers are."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every number above was derived and checked three independent ways before this was posted — the cutting procedure, a brute-force search over every possible length, and a cell-by-cell sweep of all 1,398,760 unit cells of the rectangle proving the five squares cover each exactly once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full write-up and more like it: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/biggest_square_tiles"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "cube_unfold_shortcut",
   "title": "The shortest walk across the surface of a cube",
   "ts": "2026-08-01T23:29:51+00:00",
   "date": "1 Aug 2026",
   "topic": "puzzles",
   "q": "Everyone's route across a cube is too long. The best one crosses the edge at a spot nobody guesses.",
   "a": "The thing that makes this one click, without giving you the number:",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Stop thinking in 3D. A route across two faces stays exactly as long if you unfold those two faces flat — unfolding doesn't stretch anything, so every path keeps its length. And on a flat rectangle, the shortest route between opposite corners isn't a debate: it's the straight line."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the question \"what is the shortest walk over the surface?\" becomes \"how long is the diagonal of the flattened rectangle?\" — which you can do in your head."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two things worth noticing once you have it:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— The straight line crosses the shared edge exactly halfway up. On the folded cube that looks like a kink with no reason to be where it is; the reason only exists when the cube is flat."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "— Going through the inside of the cube is shorter still, but that's a hole, not a walk. Worth checking how much you'd save if you were allowed to tunnel."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Full working, every unfolding checked, and why no other route beats it — free, takes an email: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/cube_unfold_shortcut"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "three_rates_loop",
   "title": "Three ordinary exchange rates, one loop, and the money does not come back",
   "ts": "2026-08-01T22:46:04+00:00",
   "date": "1 Aug 2026",
   "topic": "finance",
   "q": "Three ordinary exchange rates. Send a million dollars round the loop and it doesn't come back a million.",
   "a": "$1,000,960. You end up $960 richer than you started, out of nothing.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is one multiplication: £782,000 x 1.28 = $1,000,960."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it isn't a million because the three rates multiply to 0.92 x 0.85 x 1.28 = 1.00096, not to 1. A round trip multiplies your money by the product of the three rates, so the only question that ever mattered is whether that product is 1. It is 3128/3125 — 0.096% too big."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trap is that the pile shrank twice on the way round: €920,000, then £782,000. Two legs down, one leg up, and none of that matters. Only the product does."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Go the other way and every rate becomes a division, so the loop multiplies by exactly 3125/3128 — the reciprocal. A million comes back as $999,040.92, a loss of $959.08. Not equal to the gain: losing x% of a smaller base never is."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why it is invisible: the first two quotes already fix the third. 1/(0.92 x 0.85) = 1.278772... dollars per pound. The quote is $1.28. It is 0.12 US cents too high. That is all a free $960 looks like."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Does it survive real costs? Every quote is really two — you give up half the spread on each of three legs — so the loop also gets multiplied by (1 - spread/2)^3:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  0 bp   ->   +$960.00",
      "  2 bp   ->   +$659.74",
      "  5 bp   ->   +$209.47",
      "  6.4 bp ->     -$0.61",
      "  20 bp  -> -$2,039.88"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Break-even is a full spread of 6.396 basis points per pair. Major pairs trade far tighter than that, so this edge would clear real costs comfortably — which is exactly why it does not exist. 0.096% between three major quotes is enormous, and it would be taken in milliseconds by machines whose whole job is watching for it. Real loop products sit at 1 to within a fraction of a basis point. The name, if you want to read further: triangular arbitrage. You never find one because everyone is already looking."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it is a ratio, not a jackpot: the same three rates turn $10,000 into $10,009.60."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Checked in exact fractions (loop = 3128/3125, forward x reverse = 1 exactly), recomputed at 60 digits, break-even solved as a cube root to 25 places, and 1.6 million simulated round trips agreed."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "minimum_payment_never_ends",
   "title": "The credit card minimum payment that takes 28 years",
   "ts": "2026-08-01T22:39:07+00:00",
   "date": "1 Aug 2026",
   "topic": "everyday",
   "q": "Your credit card's minimum payment gets smaller exactly as fast as your debt does.",
   "a": "The whole thing in text, in case you watched it on mute:",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "£3,000 on a card at 24.9% APR. The minimum payment is 1% of what you owe plus that month's interest, with a £5 floor — so it is a slice of the balance, and it shrinks as the balance shrinks."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the part almost nobody notices. Start the month owing B. The card adds interest rB, then takes 0.01B + rB off. What is left is:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "B + rB − (0.01B + rB) = 0.99B"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The interest cancels. Completely. The balance falls exactly 1% a month whatever the APR is — 20%, 25%, 30%, it makes no difference to the pace. The rate sets the price, not the speed. That is why it takes 341 months (28.4 years) and £5,394.92 of interest — nearly twice what was borrowed."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now freeze the first payment. £86.10, every month, never allowed to fall. Same money in month one, and the debt is gone in 57 months — 4 years and 9 months, £1,899.76 of interest. The only thing that changed is that the payment stopped shrinking."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The practical version: pay a fixed amount, not \"the minimum\". Any fixed amount."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play this one instead of reading it — the first unit is free, no signup: https://haveyouseenmyquant.github.io/?utm_source=ig_comment#answers/minimum_payment_never_ends"
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "meet_within_fifteen",
   "title": "Two friends, a random hour, a 15-minute wait — do they ever meet?",
   "ts": "2026-08-01T18:02:23+00:00",
   "date": "1 Aug 2026",
   "topic": "probability",
   "q": "Two friends, a random hour, a 15-minute wait — do they ever meet?",
   "a": "Exactly 7/16 — 43.75%. Just under a coin flip.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the whole argument, and it needs no algebra."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "They meet exactly when their two arrival times land within fifteen minutes of each other. Nothing else matters — not who gets there first, not where in the hour it happens."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So draw every possible pair of arrivals at once. One friend's time runs left to right, the other's runs bottom to top, and the square that makes — an hour on each side — holds every pair they could have had. Both turn up at random, so every point in it is equally likely, and a chance is now just an area."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "\"Within fifteen minutes\" is the band along the diagonal. What it leaves out is two corner triangles: one where she is more than fifteen minutes later than him, one where he is more than fifteen minutes later than her. Each has legs of forty-five minutes — three quarters of the hour — so each takes 1/2 x (3/4)^2 = 9/32 of the square, and the pair takes 9/16."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The band is the rest: 1 - 9/16 = 7/16 = 43.75%."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Four checks, none of which assumes that argument:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "exact area of the meeting hexagon from its six corners (shoelace, exact fractions): 7/16",
      "exact integral of the overlap length across the hour, in three straight pieces: 7/16",
      "exact counting on a minute grid, then finer: 0.450000 at 60 points, 0.438750 at 600, 0.437625 at 6,000, 0.437513 at 60,000",
      "10,000,000 simulated pairs: 0.437214, which is 1.8 standard errors from 7/16"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule in full: the first to arrive waits their fifteen minutes even if that runs past two o'clock — which is why the rails in the video carry on below the two o'clock mark."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The part people miss: waiting twice as long does not double your chances. Five minutes gives 23/144 = 16.0%. Ten gives 11/36 = 30.6%. Fifteen gives 7/16 = 43.75%. Thirty — half the hour — gives only 3/4. Each extra minute buys less than the last, because the strip you add along the diagonal keeps running out of room at the corners."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it is the ratio that counts, not the clock: fifteen minutes inside an hour is the same problem as one minute inside four, and both come out at 7/16."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "four_shadows",
   "title": "A ball's skin covers its own shadow exactly 4 times",
   "ts": "2026-08-01T17:08:37+00:00",
   "date": "1 Aug 2026",
   "topic": "geometry",
   "q": null,
   "a": "A ball's skin covers its own shadow exactly four times.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not two, not three. Peel the whole surface off a ball, lay it out flat, and it covers four copies of the circle the ball blocks out of the light."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Surface area is 4·π·r². The shadow is π·r². The radius cancels — so it is four for a marble, four for a football and four for the Earth."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Archimedes' reason: slide the skin straight outwards onto the tube that just fits round the ball and no area is lost, so the skin is a rectangle 2πr around by 2r tall."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "There's a whole road of these in my bio. Free to start."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "fourteen_new_records",
   "title": "A million random numbers, fourteen records",
   "ts": "2026-08-01T15:25:17+00:00",
   "date": "1 Aug 2026",
   "topic": "expectation_tricks",
   "q": "Numbers land one at a time, all random. How often does one beat everything before it?",
   "a": "A million numbers → about 14 times.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not fourteen thousand. Fourteen."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: the tenth number leads only if it's the biggest of the ten — one chance in ten. The millionth, one chance in a million. Add up all those chances and the total crawls: ten times more numbers buys you only about two more records. So a BILLION numbers still only reaches 21."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it wobbles — run it again and you get 11, or 17. Fourteen is the average, not a promise."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It's why records dry up in anything nobody is actually getting better at, and why \"best month ever\" quietly gets rarer without a single thing going wrong."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play the maths instead of reading it → link in bio. No signup."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "million_steps_798",
   "title": "A million random steps, 798 steps from home",
   "ts": "2026-08-01T12:50:52+00:00",
   "date": "1 Aug 2026",
   "topic": "random_walk",
   "q": null,
   "a": "Walk a million steps, each one left or right on a coin flip. On average you end up 798 steps from home.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not a million. Not zero. About eight hundred."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The reason: distance from the start doesn't grow with the number of steps, it grows with the SQUARE ROOT of the number of steps. Every step you take is as likely to undo an earlier one as to add to it, so the walk mostly cancels itself out."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which means four times as much walking gets you only twice as far. Ten thousand steps → 80. A million steps → 798. A hundred million steps → still under 8,000."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "It's why smoke spreads slowly, why a share price drifts instead of running away, and why a lost drunk is never as lost as you'd think."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play this instead of reading it → link in bio. No signup."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "no_best_die",
   "title": "Four dice, each beating the next 2 rolls in 3",
   "ts": "2026-08-01T11:25:47+00:00",
   "date": "1 Aug 2026",
   "topic": "paradox",
   "q": null,
   "a": "Four dice. Whichever one you pick, I can pick one that beats you 2 rolls in 3.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Look at the faces. The first beats the second. The second beats the third. The third beats the fourth. And the fourth beats the first — every one of those exactly 2 in 3, counted over all 36 outcomes, with no ties possible."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So \"better than\" does not have to line up, and there is no best die. Let the other person choose first."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play this instead of reading it → link in bio. No signup."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "snowflake_infinite_edge",
   "title": "An edge of infinite length around an area of exactly 1.6",
   "ts": "2026-08-01T10:35:26+00:00",
   "date": "1 Aug 2026",
   "topic": "geometry",
   "q": null,
   "a": "Keep pushing the middle of every side outwards and this edge gets longer forever. The area doesn't.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "It stops at 1.6× the triangle you started with."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule is the whole thing: take a triangle, push the middle third of every side out into a bump, then do it again on every new side. Forever."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every round replaces each side with four pieces, each a third as long. Four thirds. So the edge is 33% longer after every single round — 1.33, 1.78, 2.37, 3.16, 4.21, 5.62 — and it never stops. Do it a hundred times and the outline of a shape you could hold in your hand is over three trillion times its original length."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The area is a different story. Round 1 adds 3 new bumps. Round 2 adds 12 bumps, but each has a ninth of the area. Round 3 adds 48 bumps at a ninth of that. The count multiplies by 4, the size divides by 9 — so what gets added shrinks by 4/9 every round, and the total converges:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "1 → 1.333 → 1.481 → 1.547 → 1.577 → 1.590 → 1.595 → … → 1.6 exactly (8/5)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "An infinitely long edge, wrapped around an area you could measure with a ruler. Both are true at once, and nothing here is a trick — the edge really is unbounded, and the shape really does fit inside a circle drawn through the original triangle's corners."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both numbers in the video are measured, not typed in. Every frame builds the outline by actually applying the rule, then reads the edge counter off the total segment length and the area counter off the shoelace formula for that exact polygon. Checked three ways: exact rational arithmetic (edge (4/3)^n, area 8/5 − (3/5)(4/9)^n), the measured polygon agreeing with it to 2e-14, and a 2,000,000-point Monte-Carlo area count at 1.598 ± 0.003."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is why \"how long is a coastline?\" has no answer. Measure with a shorter ruler and you find more wiggles, and the number goes up — with no length it settles on."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Play the questions instead of reading them. Level 1 is open, no signup — link in bio."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "sixty_five_thousand_boxes",
   "title": "8 measurements, 500 patients, 65,536 boxes — 99% of them empty",
   "ts": "2026-08-01T10:07:47+00:00",
   "date": "1 Aug 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "Your model has never seen 99% of the situations you'll ask it about.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "500 patients. Eight measurements each. Split every measurement into four levels — low to high — and there are 65,536 different boxes a patient can land in."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "500 patients land in 500 of them. 65,036 boxes are empty."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One measurement gave you four boxes and 125 patients in each. To be that well covered at eight measurements you would need 8,192,000 patients."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every column you add multiplies the space by four. Your data does not multiply with it — so the model spends most of its life guessing in boxes it has never seen."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Free interactive version in bio. No account needed."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "eighteen_beats_two_twelves",
   "title": "One 18-inch pizza is 2.25 twelve-inch pizzas",
   "ts": "2026-08-01T09:24:37+00:00",
   "date": "1 Aug 2026",
   "topic": "everyday",
   "q": null,
   "a": "Two 12-inch pizzas do not add up to one 18-inch. They are not even close.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "An 18-inch is only half as wide again as a 12-inch. Width x1.5."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "But you eat the surface, and the surface goes up by 1.5 squared. So the big one is 2.25 twelve-inch pizzas."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "In square inches: 254.5 for the 18, 113.1 for the 12. Two twelves come to 226.2 — short by 28.3, which is exactly a quarter of a 12-inch pizza. Not roughly a quarter. Exactly."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is why one 12-inch pizza's worth of an 18-inch is a slice of exactly 160 degrees, and two of them leave 40 degrees over. The video cuts it 160 / 160 / 40, and that adds to 360."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same rule everywhere: double the width of anything flat and you get four times as much of it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "(Same thickness both times, and nothing here about price — just how much pizza there is.)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Stop reading maths and start playing it — first question free, no signup, no account: link in bio."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "lost_boarding_pass",
   "title": "100 seats, the first passenger sits at random — does the last one get their own seat?",
   "ts": "2026-08-01T09:05:04+00:00",
   "date": "1 Aug 2026",
   "topic": "probability",
   "q": "A hundred people board a plane and the first one sits in a random seat. Does the last passenger get their own?",
   "a": "Exactly 1/2. A coin flip — not 1 in 100.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the whole argument, and it needs no algebra."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Only two seats ever matter: the ticketless man's own seat (seat 1) and the last passenger's seat (seat 100)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So look at any random pick in the chain. Seat 1 and seat 100 are both still free at that moment — they have to be, or the chain would already have stopped. The picker is choosing uniformly, so seat 1 and seat 100 are equally likely."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That makes \"which of those two gets taken first\" a straight 50/50."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "If seat 1 goes first, the chain stops and everyone left finds their own seat empty — including the last passenger. If seat 100 goes first, he is out of luck. Nothing else can happen. So the answer is 1/2."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Three checks, none of which assumes that argument:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "exact enumeration of the entire process with fractions, for 2, 3, 4 ... up to 10 passengers: every single one comes out at exactly 1/2",
      "200,000 simulated 100-seat flights: 50.13% (standard error 0.11%)",
      "change the plane: 3 seats, 5, 20, 100, 1000 — still 1/2 every time"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The part people miss: everyone else is fine. Passenger k gets their own seat with probability (n-k+1)/(n-k+2). The second passenger 99/100. The fiftieth 51/52. The ninety-ninth 2/3. Only the very last one is down to a coin flip, because he is the only person who can still be beaten to his seat at the final moment."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is why \"1 in 100\" feels right and is wrong: the odds are not spread over a hundred seats, they are concentrated on two."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "thousand_cores",
   "title": "A job that is 95% parallel, on a thousand cores — how much faster?",
   "ts": "2026-08-01T07:41:32+00:00",
   "date": "1 Aug 2026",
   "topic": "cs_systems",
   "q": "95% of this job splits across cores. Throw a thousand cores at it and it does NOT get a thousand times faster.",
   "a": "19.6 times faster. Not a thousand.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The arithmetic, in minutes. The job is 60 minutes. 5% of it — 3 minutes — has to run in order on one core, and nothing can help it. The other 95% — 57 minutes — splits perfectly."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Put 1000 cores on it:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "the 57 minutes becomes 57/1000 = 3.42 seconds",
      "the 3 minutes stays 3 minutes",
      "total = 3 min 3.4 s",
      "60 / 3.057 = 19.63x"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now the part that stings. However many cores you buy, those 3 minutes never go away, so you can never beat 60/3 = 20x. Your thousand cores got you 19.63 of the 20 that exist, and 98% of the machine is doing nothing."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And you never needed them. 19 cores: 3 + 57/19 = 3 + 3 = 6 minutes, which is exactly 10x. So the first 19 cores buy you half of all the speed there is, and the next 981 buy the other half."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The general rule, with a fraction s of the work stuck in order:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  time(p) = s + (1 - s)/p",
      "  speedup(p) = 1 / (s + (1 - s)/p)",
      "  ceiling = 1/s, no matter what you spend"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "At s = 5%:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  1 core ....... 60.00 min .... 1.00x",
      "  2 cores ...... 31.50 min .... 1.90x",
      "  4 cores ...... 17.25 min .... 3.48x",
      "  8 cores ...... 10.13 min .... 5.93x",
      "  19 cores ...... 6.00 min ... 10.00x",
      "  100 cores ..... 3.57 min ... 16.81x",
      "  1000 cores .... 3.06 min ... 19.63x",
      "  1,000,000 ..... 3.00 min ... 20.00x"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is Amdahl's law, and 19.63x is the optimistic figure: it assumes the 57 minutes divides into 1000 exactly equal pieces with zero coordination. Simulate it with realistically uneven chunks thrown at the cores at random and the job waits for the unluckiest core — about 19.44x. The formula is an upper bound you never quite reach."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The practical reading: the way to make a parallel program fast is almost never more cores. It is shrinking the 5%."
     ]
    }
   ],
   "src": "comment",
   "road": {
    "qid": "parallel_cores",
    "lesson": "u10l2",
    "unit": 10,
    "prompt": "A ten-hour job splits neatly across as many cores as you like, apart from one hour of it that cannot be split at all — run it on a hundred cores and how many hours does it take?"
   }
  },
  {
   "slug": "ninety_nine_in_line",
   "title": "99 people in the line — and the checkout is keeping up",
   "ts": "2026-07-31T21:44:01+00:00",
   "date": "31 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "A checkout that serves every single person who turns up still ends up with 99 people in the line.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "It is not too slow. It is just never idle."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One checkout, shoppers arriving at random, each taking a random time to serve. Take the fraction of time the checkout is busy, and the average number of people in the shop is pinned to it:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "busy 50% → 1 person",
      "busy 90% → 9",
      "busy 99% → 99"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So ten percent more shoppers takes the line from 9 to 99. Eleven times the queue for a tenth more customers."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And nothing is broken at 99%. Everyone gets served, the line does not grow forever, the shop is not overloaded. It is simply long."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "What makes it long is randomness. Shoppers arrive in clumps, and the only time a checkout can claw back the backlog is while it is standing empty. Idle time is the shock absorber — and at 99% busy there is 1% of it left."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same checkout, same 99% busy, three different worlds (all simulated for the video):"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "arrivals random, service times random → you wait about 99 service times",
      "arrivals random, service times exact → 49.5",
      "arrivals on the clock, service exact → nobody waits at all. Zero."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Identical load, and one of them has no queue. The queue was never the load. It was the variability, and what absorbs variability is slack."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which is why hospital planners warn about running wards much above 85% full, why a motorway collapses the moment it fills rather than gradually, and why the one machine your day depends on should never be the busiest thing you own."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A model, not a measurement of any real shop: one server, arrivals at random, random service times. The numbers come out of the balance equations and are checked by simulation."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "hundred_lockers",
   "title": "A hundred lockers, a hundred people — which end up open?",
   "ts": "2026-07-31T21:15:22+00:00",
   "date": "31 Jul 2026",
   "topic": "puzzles",
   "q": "A hundred lockers, all shut. A hundred people walk past. Which lockers end up open?",
   "a": "Exactly ten lockers stay open — 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. The perfect squares.",
   "why": [
    {
     "h": "WHY A LOCKER ENDS OPEN",
     "t": "p",
     "lines": [
      "Person k touches locker n only when k divides n. So locker n gets flipped once for each of its divisors, and nothing else happens to it. It starts shut, so:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "flipped an EVEN number of times -> back to shut",
      "flipped an ODD number of times -> open"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The whole puzzle is now one question: which numbers have an odd number of divisors?"
     ]
    },
    {
     "h": "DIVISORS COME IN PAIRS",
     "t": "p",
     "lines": [
      "Pick any divisor d of n, and n/d is a divisor too. They come as a couple, d x (n/d). 12 = 1x12, 2x6, 3x4 -> six divisors -> even -> locker 12 ends SHUT. 7 = 1x7 -> two divisors -> shut. 40 = 1x40, 2x20, 4x10, 5x8 -> eight -> shut. This pairing is why nearly every locker ends up closed again: whoever opens it, someone else comes along and shuts it."
     ]
    },
    {
     "h": "WHERE THE PAIRING BREAKS",
     "t": "p",
     "lines": [
      "A pair fails to be two different numbers in exactly one case: when d = n/d, i.e. n = d x d. A square has one divisor standing alone in the middle, so its divisor count is odd. 36 = 1x36, 2x18, 3x12, 4x9, 6x6 -> nine divisors, because 6 has no partner -> locker 36 ends OPEN. 100 = 1x100, 2x50, 4x25, 5x20, 10x10 -> nine -> OPEN. Every non-square pairs up perfectly and closes. Every square has one unmatched divisor and stays open."
     ]
    },
    {
     "h": "SO",
     "t": "p",
     "lines": [
      "Open lockers = the squares from 1 to 100 = 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. Ten of them."
     ]
    },
    {
     "h": "TWO THINGS WORTH NOTICING",
     "t": "p",
     "lines": [
      "The order of the people is irrelevant. Only how many times each locker is flipped matters, and that is fixed. Shuffle the hundred people any way you like and the same ten lockers are open. It scales: with N lockers the number left open is floor(sqrt(N)). A thousand lockers leaves 31 open. A million leaves a thousand."
     ]
    },
    {
     "h": "CHECKED",
     "t": "p",
     "lines": [
      "I simulated all 482 individual flips directly, counted divisor parity separately, and listed the squares — all three give the identical set. Then I re-ran it with the people in five random orders (same answer every time) and for 10, 25, 50, 250 and 1000 lockers (3, 5, 7, 15, 31 open — exactly floor(sqrt(N)) each time)."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "important_links_to_you",
   "title": "A page is important if important pages link to it",
   "ts": "2026-07-31T20:05:22+00:00",
   "date": "31 Jul 2026",
   "topic": "graphs",
   "q": null,
   "a": "One page has a single link pointing at it. Another has three. The single-link page ends up twice as important.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "How do you rank pages when the rule eats itself? A page counts as important if important pages link to it — so you would need the answer before you could work out the answer."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The way out is to stop looking for a starting point. Give every page the same share of importance. Then let every page hand its share along its outgoing links, split evenly between them. Do it again. And again. The shares swing about for a few rounds and then stop moving, and where they stop is the ranking."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The graph here is 7 pages and 13 links. The page that wins collects one link — but that link comes from a well-connected hub that spends its entire share on that single link. The page that loses collects three links, from pages almost nobody links to. Final shares: 26% against 13%, exactly two to one. A fourth page collects four links and still lands below the winner."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every circle's size is its share, live. The gold is importance in flight: once a round, every page fires a bead down each of its links at once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is the founding idea behind ranking the web by links — not a description of how any search engine ranks today."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "nearest_one_wins",
   "title": "Colour every spot by its nearest dot and the map draws itself",
   "ts": "2026-07-31T19:00:21+00:00",
   "date": "31 Jul 2026",
   "topic": "geometry",
   "q": null,
   "a": "Five shops on a map. Colour every spot by whichever shop is nearest — and the borders come out perfectly straight.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nobody drew a single line."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's the surprising part. Regions this clean look designed — someone with a ruler carving the town into districts. The only rule here is \"go to the nearest shop\", and the straight edges fall out of it on their own."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why straight? Take any two shops. The places that belong to neither one more than the other are the places that are exactly the same distance from both — and that set of places is a straight line. Every border in the picture is one of those. Where three of them meet you get a corner, and the map ends up as flat-sided patches with no curves anywhere."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "You can watch it happen: colour spreads out of all five shops at the same speed, and wherever two of those spreading circles collide they stop dead in a straight crease — the crease is where the two arrivals tie."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Then move one shop. Every border around it re-forms at once, because nothing is stored: the map is just \"who's nearest\", recomputed everywhere. Add a sixth and it cuts its own patch out of its neighbours."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "How it's computed, honestly:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "every frame is a 540 × 723 grid over the map — 390,420 cells — each coloured by the true nearest shop. No boundary is drawn from a formula; the bright edges are simply the cells whose neighbour has a different owner.",
      "the straight-edge claim is measured, not asserted: at ~2,400 places where two neighbouring cells disagree, the crossing point was found and its distances to the two owning shops compared. Max difference: 0.002 of a pixel.",
      "fit a straight line through each border's crossing points and the worst point sits 0.0013 pixels off it.",
      "when a shop moves, the whole grid is recomputed for that frame — nothing is tweened."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same idea behind phone coverage maps, which warehouse ships your parcel, and which weather station \"counts\" for your postcode."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "is_the_forecast_honest",
   "title": "How to check a forecaster without knowing the future",
   "ts": "2026-07-31T18:04:29+00:00",
   "date": "31 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "You can't tell if a 70% forecast was right. But you can grade a thousand of them, without ever knowing the future.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Someone says 70% chance of rain. It rains. Were they right? Nothing about that one day says yes or no. A single probability cannot be graded."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So don't grade one. Grade the record."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Take every day they ever forecast and throw it onto a pile by the number they attached: the 10 pile, the 30 pile, the 70 pile. Then, inside each pile, count how often it actually rained."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "If the 70 pile rained on about 70% of its days, that number means what it says. Do it at every level and the five answers draw a line. An honest record climbs the straight one. Someone who always sounds too sure draws a flatter line that pulls away from it, saying 90 when reality is nearer 73, and 10 when reality is nearer 27."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole test. It needs nothing but their past record, and no forecast of the future anywhere in it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "In the video: 4,000 simulated days for each of two forecasters, about 800 days behind every bar. The honest one's piles rained 10.4, 28.0, 51.0, 70.9 and 91.0% of the time -- close to the straight line but not dead on it, because 800 days still wobble by a point or two. The too-sure one's piles rained 27.8, 41.5, 49.1, 58.0 and 71.6% of the time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which one would you trust with a 90%?"
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "learns_from_the_score",
   "title": "Nobody taught it how — it only ever heard how well",
   "ts": "2026-07-31T17:03:08+00:00",
   "date": "31 Jul 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "Nobody ever told this thing how to balance the pole. It only ever heard how well it did.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's the whole trick."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A cart on a rail, a pole hinged on top. The thing driving it was never told what the pole is, what a push does, or which way to go. All it can do is shove the cart left or right — and when the pole falls, one number comes back: how long it stayed up. No answer, no correction, no hint about which push was the bad one."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Then it nudges itself toward whatever it was doing before a bigger number, and away from what came before a smaller one. Repeat."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Attempt 1: 0.24 seconds. Attempt 50: 1.18 seconds. Attempt 500: the full 10 seconds the run allows — it doesn't fall at all."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Everything here is a real run, not a drawing of one:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "the world is the standard cart-pole: gravity 9.8, cart 1 kg, pole 0.1 kg, half-length 0.5 m, pushes of ±10 N, stepped every 0.02 s. An attempt ends at 12° from upright, at 2.4 m from centre, or after 500 steps.",
      "the learner is one logistic unit over the four numbers it can see, updated after each attempt by plain score-weighted reinforcement. Learning rate 0.02, discount 0.99, seed 20, all weights starting at zero — so attempt 1 really is a coin flip at every step.",
      "every frame is a genuine simulator state from that run, and the stopwatch shows the true score. Failed attempts play slightly slower than real time so the topple reads; the ten-second one plays faster. The stopwatch is honest either way.",
      "mean over the first 50 attempts: 0.58 s. Over the last 50: 6.73 s."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Lucky run? I re-ran the identical setup on 60 seeds. All 60 learn — every one improves, every one ends above a 2-second average, median improvement 7.7x. What IS better than typical is this attempt 500: it hits the cap, which only 2 of 60 seeds do on that exact attempt. Seed 20 was picked for that, on criteria fixed before the scan."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A toy, not a claim about how big modern systems get trained — but the same idea, at a size you can watch."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "twenty_questions_rule",
   "title": "A rule learned by asking yes-or-no questions",
   "ts": "2026-07-31T16:07:15+00:00",
   "date": "31 Jul 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "Two colours of dot, mixed so no straight line can separate them. A machine learns the rule by asking yes-or-no questions.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's the whole method."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One question at a time — \"is it left of here?\" — and each question cuts the space in two. It tries every possible cut and keeps the one that leaves both sides closest to a single colour. Then it does the same thing again inside each piece."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Four cuts later the space is five boxes, and each box is almost entirely one colour. No formula, no curve to fit. Just yes or no, over and over, until the answer falls out."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "What's left is a rule a person can read straight off the picture: gold in the top-left corner, gold in the bottom-right, blue everywhere between."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The numbers, honestly:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "the best straight line anywhere on this data gets 84%, and still puts 25 of the 160 dots on the wrong side. That's why a line won't do.",
      "the four cuts get 97.5% — 156 of 160 dots land in a box whose majority colour is their own.",
      "that is accuracy on exactly the dots the cuts were fitted to. Nothing here claims anything about new dots.",
      "every cut is chosen by the same stated rule, greedily: take the cut anywhere in the picture that raises size-weighted purity the most. Not one line is hand-placed.",
      "5% of the labels were flipped on purpose, so no rule can be perfect. The four dots left in the wrong box are still on screen at the end — \"almost all one colour\" is a measurement, not a figure of speech."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "resample_your_own_data",
   "title": "How far off is your average? Ask your own data",
   "ts": "2026-07-31T15:07:45+00:00",
   "date": "31 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "You can work out how far off your average might be without collecting a single extra measurement.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the trick. You have one sample — forty measurements — and you take its average. To find out how much that average could have wobbled, build fake samples out of the sample you already have: pick one of your forty at random, write it down, PUT IT BACK, and repeat forty times. Because everything goes back in, some measurements come up twice or three times and some never come up at all, so every fake sample is genuinely different from the real one. Average each one. The spread of those averages is your answer."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The simulation in the video, so you can check it:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "one real sample of 40, from a world whose true noise spread is 1 — a number the method never sees",
      "20,000 fake samples, each 40 draws with replacement",
      "spread of the fake averages: 0.15672",
      "textbook value on the same sample: 0.15891",
      "the truth, which neither may look at: 0.15811"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So the trick reproduces the formula to within 1.4% without ever being told the formula. Repeat the whole thing on 300 fresh samples and the two agree to about 2% on any given sample."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Where it does NOT work, because this is not magic:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "It can only reflect what your one sample happens to contain. A sample that came out tighter than the world it came from gives you a tighter answer, and nothing inside the data can tell you that happened.",
      "It does badly with very small samples — with eight or ten measurements there simply isn't enough in there to re-draw from.",
      "It fails for some quantities, extremes especially. The largest value in a fake sample can never exceed the largest value you actually measured, so the wobble of a maximum comes out far too small.",
      "It cannot fix a biased sample. If the measurements were collected badly, every fake sample inherits exactly the same bias, and the answer comes back looking reassuringly precise and being wrong."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "what_95_percent_means",
   "title": "A 95% range is not what almost everyone thinks it is",
   "ts": "2026-07-31T13:53:25+00:00",
   "date": "31 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "A 95% range does not mean there's a 95% chance the true value is inside it. Almost everyone reads it that way.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The true value is fixed. Your range is already drawn. That one range either contains it or it doesn't — there is no 95 about it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The 95 only means something across repeats. Take a fresh sample, build a fresh range by the same rule, over and over: about 95 out of every 100 of those ranges contain the true value. It describes the recipe, not the one range in front of you."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The simulation in the video, so you can check it:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "the thing being measured really is 0, and every measurement is 0 plus noise of known spread 1",
      "one go = 25 fresh measurements",
      "the rule for the range = the average of those 25, plus or minus 1.96 × 1 ÷ √25, i.e. average ± 0.392",
      "because the noise spread is known, the chance a range built this way contains the true value is exactly 0.95 — not approximately. A 2,000,000-repetition check measured 0.94995."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The hundred ranges on screen are one fixed seed. 95 of them contain the true value; 5 miss it entirely — and the closest miss clears the line by 0.012, because misses are almost always marginal. Nothing is exaggerated to make a gap look bigger than it is."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Worth being precise about one thing: this is about the range you get from that rule. A Bayesian credible interval is a different object, built a different way, and it genuinely can be read as \"95% chance the value is in here\". The misreading is applying that sentence to a range that was never built to support it."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "words_as_points",
   "title": "A machine gives every word a place on a map",
   "ts": "2026-07-31T12:57:55+00:00",
   "date": "31 Jul 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "Every word gets a place on a map. Nobody chose the places — and yet dog lands next to cat, miles from bread.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The positions in this clip are real, not drawn by hand. They are the published GloVe word vectors — 50 numbers per word, trained on Wikipedia and Gigaword, released by Stanford in 2014 — flattened onto two directions so they fit on a phone. Both projections are stated in the code, and every dot on screen comes straight out of them. No product's internals are being shown, and nothing was nudged to look nicer."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Where do the places come from? Only from which words turn up in the same company. Nothing was labelled and no one placed anything. Words used in the same kind of sentence end up in the same part of the map: the three animal words score 0.70 to 0.92 alike, the three food words 0.81 to 0.84, and every animal-food pair sits right down at 0.16 to 0.40."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Then the strange part. Directions carry meaning too. Take the step from man to woman, put that same step on king, and the closest word to where you land — out of all 400,000 words in the file — is queen."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Small print, because this one gets oversold: the arithmetic is not exact. The miss is about as long as the step itself, and the two steps sit roughly 53 degrees apart. Queen genuinely wins the nearest-word contest, but this parallel structure is a tendency that emerges from what was read, not a law that always holds. The gap you can see on screen is the real gap."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "spam_dial_tradeoff",
   "title": "Catch more spam, lose more real mail — the dial you cannot win",
   "ts": "2026-07-31T11:31:22+00:00",
   "date": "31 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "A stricter spam filter doesn't just catch more spam. It also throws away more of your real email.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "There is one dial. Every email gets a score for how spammy it looks, and anything above the dial goes to the junk folder. Move the dial and you don't get \"better\" — you get a different pair of mistakes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The simulation in the video: 40 real emails and 40 spam, scored on how spammy they look. Same 80 emails, three settings:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "strict — 0 spam got through, but 26 real emails binned",
      "middle — 7 spam through, 7 real emails binned",
      "loose — 0 real emails binned, but 34 spam through"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Turning it up strictly cuts the spam getting through AND strictly raises the real mail thrown away. Across every setting in between, the best you can do is 12 mistakes in total. Never zero."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the condition that makes all of that true, because it matters: the two groups OVERLAP on the score. Some real email looks spammier than some spam. If they didn't overlap — if every spam scored above every real email — you could park the dial in the gap and make both counts zero, and there would be no trade at all. The trade is a fact about the overlap, not about filters."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which is why the right setting is never \"the accurate one\". It depends on which mistake costs you more. A junk folder can afford to eat one email a month. A cancer screen cannot afford to miss one case, so it is set to raise false alarms on purpose, and the follow-up test sorts them out. Same dial, opposite ends."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Simulated data, not a description of how any real email provider works."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "twenty_tests_one_wins",
   "title": "Test twenty things that do nothing and one will look real",
   "ts": "2026-07-31T09:59:52+00:00",
   "date": "31 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "Test twenty things that do nothing, and one of them will still look like a discovery.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The usual bar for calling a result real is a one-in-twenty chance of seeing it when nothing is going on. So run twenty tests on twenty things that genuinely have no effect, and you should EXPECT about one to clear the bar anyway."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Everything in this video is simulated with no effect anywhere: twenty tests, each comparing two groups of 30 measurements drawn from the same distribution. On the seed we rendered, exactly one cleared the bar. Show only that one and it reads as a finding."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The honest numbers, across repeats: the count clearing the bar averages exactly 1, and at least one clears it 64% of the time. Not guaranteed — but often enough that \"we found something\" always deserves the question: how many things did you test?"
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "p_hacking",
    "lesson": "u2l2",
    "unit": 3,
    "prompt": "You run 20 completely useless experiments. Each one has a 1 in 20 chance of throwing up an exciting-looking result purely by luck. On average, how many exciting results will you get?"
   }
  },
  {
   "slug": "attention_which_word",
   "title": "How a language model works out which word \"it\" means",
   "ts": "2026-07-31T09:03:53+00:00",
   "date": "31 Jul 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "The trophy didn't fit in the suitcase because it was too big. What is \"it\"? You knew instantly. A computer doesn't.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now swap one word. \"Because it was too small.\" Suddenly \"it\" means the suitcase. Same sentence, opposite answer."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So how does a language model get this right? Every word gets to look at every other word and decide how much each one matters. The word \"it\" sends out its looks, and the strongest one lands on \"trophy\". Change big to small and that strongest look swings across to \"suitcase\". Nobody wrote that rule down — it was learned, just from reading."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One thing to be straight about: what you are watching is the mechanism illustrated, not a trace from a real system. The strengths of those arcs come from one simple rule written into the code, printed in full when the module runs — they are not measured inside anybody's model, and no model is named. What is not made up is the sentence itself: one adjective really does flip what \"it\" refers to, and that is exactly the problem the machine has to solve."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "gps_clock_drift",
   "title": "Switch off one correction and your phone is kilometres out by tonight",
   "ts": "2026-07-31T08:30:36+00:00",
   "date": "31 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "Your phone finds you by timing signals from space — and the clocks up there don't tick at the same rate as yours.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A GPS satellite sits 26,560 km from Earth's centre and moves at 3.874 km/s. Two things happen to its clock, and they pull opposite ways:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "moving fast makes it run SLOW — −7.2 millionths of a second a day",
      "sitting high up makes it run FAST — +45.7 millionths of a second a day"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Height wins. Net: the satellite clock gains +38.5 millionths of a second every day."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That sounds like nothing. It isn't, because the whole method is timing. Light travels 30 cm in a billionth of a second, so:"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "38.5 millionths of a second × the speed of light = 11,543 m ≈ 11.5 km"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Roughly what a day of uncorrected drift amounts to. Not a precise error budget — a real receiver solves for its own clock alongside its position using several satellites at once, so it's messier than one multiplication — but that is the scale, and it is why the correction exists."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And it never happens. The satellites' atomic clocks are manufactured deliberately running slow, so that once they are up there, at that speed and that height, they tick at exactly the right rate. Someone had to work that out before the first one launched."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The small print:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "Gravitational term = (GM/c²)(1/R_earth − 1/r) with mean Earth radius 6,371 km; kinematic term = −v²/2c². Cross-checked against the rotating-geoid reference (which folds in Earth's spin and oblateness): +38.57 a day, a 0.2% difference. Both land on the standard published ~38.",
      "Every number on screen was computed, not quoted."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "socks_in_the_dark",
   "title": "A drawer of socks in four colours, in the dark — how many to be sure of a pair?",
   "ts": "2026-07-31T07:28:36+00:00",
   "date": "31 Jul 2026",
   "topic": "puzzles",
   "q": "A drawer of socks in four colours. The light is off. How many must you grab to be sure two of them match?",
   "a": "5 socks.",
   "why": [
    {
     "h": "THE SETUP, EXACTLY",
     "t": "p",
     "lines": [
      "Four colours in the drawer, plenty of every colour, all jumbled, and you cannot see. You take socks out one at a time and you want two of the SAME colour. The count has to work every single time, not most of the time."
     ]
    },
    {
     "h": "WHY 4 IS NOT ENOUGH",
     "t": "p",
     "lines": [
      "Picture the worst possible luck: first sock red, second gold, third green, fourth blue. Four socks, four colours, no pair. That is not a freak case you can wave away - there is at least one sock of every colour in there, so it really can come out that way. An answer that can fail even once is not a guarantee."
     ]
    },
    {
     "h": "WHY 5 ALWAYS WORKS",
     "t": "p",
     "lines": [
      "Now take one more. There are only four colours, so that fifth sock is red, gold, green or blue - and in the worst case you are already holding one of each. It has to match one of them. There is no way to lay out five socks in four colours without two of them being the same, so no run of bad luck can beat you. The fifth sock's odds never enter into it: it has nowhere else to go."
     ]
    },
    {
     "h": "THE DRAWER SIZE IS IRRELEVANT",
     "t": "p",
     "lines": [
      "5 is the answer whether the drawer holds 20 socks or 20,000. The only number that matters is how many COLOURS there are. With C colours the worst case is one of each - C socks, still no pair - and the very next sock must repeat one of them. So the answer is always C + 1. Ten colours: eleven socks. Two colours: three socks."
     ]
    },
    {
     "h": "WHY IT FEELS LIKE A PROBABILITY QUESTION",
     "t": "p",
     "lines": [
      "Most people start estimating - how likely is a pair after three, after four - and by four you are very probably fine. But \"very probably\" is not what was asked. Asked for a guarantee, the answer needs no probability at all. Just counting."
     ]
    },
    {
     "h": "CHECKED BY BRUTE FORCE",
     "t": "p",
     "lines": [
      "All 256 ways to draw 4 socks from 4 colours: 24 of them have no pair. All 1024 ways to draw 5: not a single one is pair-free. Re-run with 1, 2, 5, 9 and 50 socks of each colour, and with lopsided drawers like 2/7/3/8 - the answer comes back 5 every time."
     ]
    }
   ],
   "src": "comment",
   "road": {
    "qid": "socks_dark",
    "lesson": "u1l2",
    "unit": 1,
    "prompt": "A drawer holds ten black socks and ten blue socks, all mixed up. The room is pitch dark. How many socks must you take out to be certain you have a matching pair?"
   }
  },
  {
   "slug": "inflation_halves_it",
   "title": "A calm 2% a year halves what your cash buys in one working life",
   "ts": "2026-07-31T06:00:20+00:00",
   "date": "31 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "The Bank of England AIMS for 2% inflation. At exactly that rate, £100 left sitting in cash buys half as much 35 years later.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not a crisis. Not the 1970s. The target — the calm, everything-going-to-plan number."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "£100 · 2% a year · what it buys = 100 × 1.02⁻ᵗ"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "Year 10 → £82",
      "Year 20 → £67",
      "Year 30 → £55",
      "Year 35 → £50  ← half gone (exactly 35.00 years: ln2 ÷ ln1.02 = 35.0028)",
      "Year 40 → £45"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The number printed on the note never changes. What the note fetches does. Nobody ever feels 2% in a single year — it's about the size of a rounding error on a weekly shop — and that is exactly why it works: 35 years of \"you'd never notice\" is half of everything."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "One working life is enough to do it once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The small print, because this is about money and I'd rather say it than have it assumed:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "This is a constant-rate simplification about CASH LEFT IDLE — the same £100 sitting still, nothing added, nothing invested. Real inflation moves year to year, differs by what you actually buy, and wages and investments often rise with it or beyond it. Nothing here is a claim about anyone's living standards.",
      "2% is the Bank of England's CPI target, chosen deliberately because it is the *least* dramatic defensible number. The UK's long-run average since 1949 is nearer 3.6%, which halves it in 19.6 years and leaves £24 after 40. The point is that even the on-target rate does this.",
      "Every figure above is 100 × 1.02⁻ᵗ, checked three ways (closed form, forty successive divisions, and a bisection for the halving time).",
      "Not financial advice. It's arithmetic about what a fixed pile of cash fetches over time."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "compound_double",
    "lesson": "u3l2",
    "unit": 5,
    "prompt": "Money in an account grows by 6% each year, and the growth compounds. Roughly how many years until it has doubled? Give the nearest whole year."
   }
  },
  {
   "slug": "mortgage_interest_first",
   "title": "For years, almost every pound of a mortgage payment is interest",
   "ts": "2026-07-31T05:34:43+00:00",
   "date": "31 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "Borrow £250,000 and you'll hand the bank £188,443 in interest — and for 11 years, most of each payment IS the interest.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "£250,000 · 25 years · 5% a year Monthly payment: £1,461"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The payment never changes. The split does."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Month 1: £1,042 of it is interest, £420 comes off the house. The interest is charged on what you still owe, and at the start you owe nearly all of it — so barely a third of the payment is buying you any of the house."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "As the balance falls the interest shrinks and the other part grows. Slowly. It is not until month 135 — eleven years and three months in — that the part paying off the house is finally the bigger half. By then you have paid £121,431 in interest and still owe £174,132 of the original £250,000."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Over the full 25 years: paid £438,443 · house £250,000 · interest £188,443 That's 75% of what you borrowed, and 43% of every pound you ever paid."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The small print, because this is about money and I'd rather say it than have it assumed:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "Worked out payment by payment, all 300 of them. Balance after the last one: £0.0000000014. The repayment parts add up to £250,000 to the same rounding.",
      "A repayment mortgage at a rate that never moves for 25 years, with no fees and no overpayments. UK mortgages are normally fixed for 2–5 years and then revert to something else, so a 25-year fixed rate is a simplification — the shape of the split is the point, not the exact pound figure.",
      "The rate matters enormously. Same loan at 3%: £105,658 of interest and the crossover comes at month 24. At 7%: £280,084 and month 182.",
      "Not financial advice, and not an argument for or against a mortgage. It's arithmetic about how a repayment schedule works."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "overbooked_flight",
   "title": "Airlines sell more seats than the plane has",
   "ts": "2026-07-31T05:03:40+00:00",
   "date": "31 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "Airlines sell more tickets than the plane has seats — and the maths says they should.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A 100-seat plane. Say each booked passenger turns up independently with probability 0.9."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Sell exactly 100 tickets and 10 seats fly empty on the average flight. A genuinely full plane happens about once in 37,600 departures."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Sell 105 and the whole spread of arrivals slides up against the seat line. Average empty seats fall from 10 to 5.5 — and the chance that more than 100 people turn up, so someone gets bumped, is 1.67%. About 1 flight in 60."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every figure computed exactly from the binomial distribution, no normal approximation."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Simplified model, on purpose: real airlines estimate no-show rates per route and per fare class, ask for volunteers and pay compensation, and people travelling together clearly don't show up independently. This is why the practice exists — not a defence of how any particular airline runs it."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "ten_hats_in_a_line",
   "title": "Ten people in a line, a black or white hat each — how many are saved?",
   "ts": "2026-07-30T21:31:48+00:00",
   "date": "30 Jul 2026",
   "topic": "puzzles",
   "q": "Ten people in a line. Each gets a black or white hat. You only see the hats in front. How many can be saved?",
   "a": "9 of the 10 are saved for certain. The last one is a straight 50/50, and no plan can ever do better than that.",
   "why": [
    {
     "h": "THE RULES, EXACTLY",
     "t": "p",
     "lines": [
      "All ten face the same way. You see every hat ahead of you and nothing else - never your own, never behind. From the back forward, each says one word, black or white, everyone hears it, and the right word saves you. The plan is agreed before the hats go on; after that the one word is all you get. The hats are chosen by someone who knows the plan, so the count has to hold for all 1024 arrangements."
     ]
    },
    {
     "h": "THE PLAN",
     "t": "p",
     "lines": [
      "The person at the back counts the black hats among the nine in front of them. If that count is odd they say \"black\". If it is even they say \"white\". That word is not a guess about their own hat - it is a report on everybody else's, and it is the one they sacrifice."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The next person has heard the report and can see the eight hats in front of them. They count the black ones they can see. The report covered nine hats; they can see eight of them; the only one missing is their own. If their own count is already odd-or-even in the way the report said, their hat must be white, otherwise it is black. They know it exactly, and they say it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Everyone after that does the same: take the report, cross off every colour already called out behind them (those were all correct), cross off every hat they can see ahead, and what is left is their own hat. Nine people, nine certainties."
     ]
    },
    {
     "h": "WHY THE TENTH CANNOT BE SAVED",
     "t": "p",
     "lines": [
      "The back person's word is decided entirely by the nine hats they can see, so it is fixed before their own hat matters. Whoever places the hats knows the plan, looks at those nine, works out what the back person will say, and then puts the opposite colour on them. Nothing can beat 50/50 there."
     ]
    },
    {
     "h": "CHECKED BY SIMULATION",
     "t": "p",
     "lines": [
      "All 2^10 = 1024 arrangements: the nine in front are correct in 1024 of 1024. The back person is correct in 512 of 1024. And for each of the 512 patterns of the nine front hats, exactly one of the two choices for the back hat makes them wrong - which is the proof that the tenth is a coin flip."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "two_eggs_hundred_floors",
   "title": "A hundred floors, two eggs: find the floor where they break",
   "ts": "2026-07-30T20:22:06+00:00",
   "date": "30 Jul 2026",
   "topic": "puzzles",
   "q": "A 100-floor tower. Two eggs. Somewhere there's a floor where an egg starts to break. Find it — how few drops?",
   "a": "14 drops. And the trick is that the steps SHRINK.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rules exactly: identical eggs, and one floor F such that an egg dropped from F or above breaks, while below F it survives and can be reused. F is somewhere in 1 to 100 and you must name it exactly. A broken egg is gone. The count must work for EVERY possible F."
     ]
    },
    {
     "h": "THE STRATEGY",
     "t": "p",
     "lines": [
      "Drop the first egg from floor 14. If it survives, go up 13 to floor 27. Then up 12 to 39, then 11 to 50, then 10 to 60, then 9, 8, 7, 6, 5, 4 - floors 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99. The moment it breaks, walk the gap below it upward with the second egg, one floor at a time."
     ]
    },
    {
     "h": "WHY THE STEPS SHRINK",
     "t": "p",
     "lines": [
      "Every drop of the first egg is a drop already spent. Start at 14: if it breaks you have 13 left and 13 floors to walk - exactly enough. If it survives you have used one, so the next gap can only afford 13 steps, so you step 13. Survive again and you can afford 12. The shrinking keeps the total at 14 wherever the egg breaks."
     ]
    },
    {
     "h": "WHY 14 IS THE MINIMUM",
     "t": "p",
     "lines": [
      "With d drops and two eggs the biggest building you can ever handle is 1 + d(d+1)/2 floors. Thirteen drops covers 92 - not enough. Fourteen covers 106. So 14 is provably the best possible, and a dynamic program over (floors, eggs) agrees."
     ]
    },
    {
     "h": "WHY THE OBVIOUS METHODS LOSE",
     "t": "list",
     "lines": [
      "One floor at a time from the bottom: correct, but up to 99 drops.",
      "Halving: if the first egg breaks at 50 you have one egg and 49 floors to test one by one. Worst case 50. Halving needs to halve again, and one egg cannot.",
      "Every 10th floor then walk up: best of the fixed steps, still 19 worst case. Fixed steps waste the fact that the walk gets cheaper as you climb."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why 99 and not 100 for a single egg: if it survives floor 99 then 100 is the answer by elimination, so you never pay for the last one."
     ]
    }
   ],
   "src": "comment",
   "road": {
    "qid": "egg_first_drop",
    "lesson": "u10l1",
    "unit": 10,
    "prompt": "Two eggs, a hundred floors, and you want the highest floor an egg survives with as few drops as possible in the worst case — tap the floor to drop from first."
   }
  },
  {
   "slug": "bridge_torch_17",
   "title": "Four people, one torch, seventeen minutes",
   "ts": "2026-07-30T19:21:26+00:00",
   "date": "30 Jul 2026",
   "topic": "puzzles",
   "q": "Four people, one torch, a bridge that holds two. They cross in 1, 2, 5 and 10 minutes. Get all four over in 17.",
   "a": "Send the two slow ones across TOGETHER.",
   "why": [
    {
     "h": null,
     "t": "pre",
     "lines": [
      "1 and 2 cross                    2 min   → clock 2",
      "1 comes back with the torch      1 min   → clock 3",
      "5 and 10 cross together         10 min   → clock 13",
      "2 comes back with the torch      2 min   → clock 15",
      "1 and 2 cross                    2 min   → clock 17"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "All four across in exactly 17 minutes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The whole puzzle turns on one idea: 5 and 10 must make their trip at the same time. A pair costs the SLOWER one's time, so if 5 and 10 ever cross separately you pay 10 minutes once and 5 minutes again — 15 minutes of walking for two people. Send them together and the 5 rides along inside the 10 for free. To set that up you need your two fast walkers already waiting on the far side to ferry the torch back, which is what the first two moves are for."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why the obvious approach fails: most people make the fastest person the escort and shuttle everyone over one at a time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "1 and 10 cross (10) → 1 back (1) → 1 and 5 cross (5) → 1 back (1) → 1 and 2 cross (2). Total 19."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That feels efficient because the return trips are as cheap as possible — only 1 ever walks back, costing 1 minute a time. But it makes the 10 cross alone with an escort, so the 10 and the 5 are paid for separately. The 17-minute answer deliberately spends a more expensive return trip (2 minutes instead of 1) to buy the chance to bundle the 5 and the 10 into a single crossing. Two minutes worse on returns, five minutes better on crossings."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And 17 really is the best possible. Exhaustive search over every legal sequence of crossings — any one or two people, torch always carried, pair priced at the slower walker — gives a minimum of exactly 17 minutes, and exactly two sequences achieve it: the one above, and the same thing with the first two return trips swapped (2 comes back at step 2, 1 comes back at step 4). Nothing in between 17 and 19 is even reachable: 18 minutes is impossible."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "huffman_shrink",
   "title": "The same sentence, a quarter smaller, with nothing thrown away",
   "ts": "2026-07-30T18:02:13+00:00",
   "date": "30 Jul 2026",
   "topic": "information_theory",
   "q": null,
   "a": "A quarter of this sentence was never needed — and nothing at all gets thrown away.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "26% smaller."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Normally every letter costs the same amount of space. But letters aren't equally common. In \"e is everywhere and z is almost never there\" — 43 characters, 17 different symbols — the e turns up nine times, the space eight, and the z exactly once."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "So stop paying the same for all of them. Give the common ones short codes and the rare ones long ones: e gets 01, the space gets 110, and the z gets 10110. The whole sentence goes from 215 bits to 159."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "What the 26% is measured against: a fixed-width code over the 17 symbols the sentence actually uses — 5 bits each — which is the honest comparison. (It's also 5 bits if you allow the full a–z plus space, so nothing is being flattered here.) Against 8-bit ASCII it would read 53.8%, but most of that is just the four bits per byte nobody was using in the first place."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And nothing is lost, because no short code is the start of a longer one. That's why the run of bits at the end decodes straight back with no separators, no markers, and no ambiguity — the same 43 characters, exactly."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is Huffman coding. It's the entropy-coding stage of DEFLATE, which is what compresses every ZIP and gzip file, and baseline JPEG uses it too."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "hash_one_step_lookup",
   "title": "Finding one name in a million without searching",
   "ts": "2026-07-30T17:33:45+00:00",
   "date": "30 Jul 2026",
   "topic": "cs_systems",
   "q": null,
   "a": "Finding one name in a million doesn't mean searching through a million. You can jump straight to it.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here's the trick, shown with 10 slots instead of a million."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Take a name and add up its letters, A is 1, B is 2, all the way to Z is 26. MAYA is 13+1+25+1 = 40. Take the last digit of that total — 0 — and that's the slot the name lives in. Drop it in."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "LEO 32 → slot 2 · SAM 33 → slot 3 · RAY 44 → slot 4 · IVY 56 → slot 6 · LUCA 37 → slot 7 · NOAH 38 → slot 8"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Want LUCA back later? Add its letters again, get 37, go to slot 7. It's sitting there. You never looked at a single other name."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Then THEO: 20+8+5+15 = 48, last digit 8 — and NOAH is already in slot 8. Two names, one slot. That's a collision, and collisions are the normal case, not a rare accident: 8 names dropped into 10 slots average about 3 colliding pairs. It costs you almost nothing — both names hang in slot 8, and to find one you check just those two."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The part that actually matters is what happens as the pile grows. Give a million names a million slots and each slot still holds about one name, so a lookup touches roughly 1.5 names — at ten names, at a million, at a billion. The work doesn't grow with the pile. Checking one at a time would average half a million comparisons."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's a hash table. It's how your phone finds a contact the instant you type it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which surprised you more — that it works, or that collisions are normal? 👇"
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "start_early_stop_early",
   "title": "Ten years of saving, then stop, beats thirty years of saving",
   "ts": "2026-07-30T16:47:42+00:00",
   "date": "30 Jul 2026",
   "topic": "finance",
   "q": null,
   "a": "She paid into her pot for ten years and then stopped forever. He paid in for thirty. She retired with more.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same £200 a month, same 8% a year, both finish at 65."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Anna pays in from 25 to 35 — £24,000 — and never adds another penny after that. Her pot just sits there for thirty years. Ben starts the month Anna stops and pays in every month to 65 — £72,000. Three times as much money in."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "At 65: Anna £402,797 Ben £300,059"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Anna is £102,738 ahead on a third of the money. Nothing grew faster for her — both pots grow at exactly the same rate. Her first £200 simply had forty years to work instead of thirty, and each year's growth spends the rest of the time growing too. Ben's £72,000 never gets the long runway."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The small print, because this is about money and I'd rather say it than have it assumed:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "8% a year nominal, compounded monthly, worked out month by month. No tax, no fees, and a return that never varies — none of which is real life. Real returns swing about, and inflation means £402,797 in 2066 does not buy what it buys today. This is an illustration of how time works, not a forecast and not a promise.",
      "It also has a threshold. Below about 6.1% a year, Ben wins — his extra £48,000 outweighs Anna's extra decade. Above it, Anna wins, and the higher the return the wider the gap.",
      "Not financial advice. It's arithmetic about time."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "compound_double",
    "lesson": "u3l2",
    "unit": 5,
    "prompt": "Money in an account grows by 6% each year, and the growth compounds. Roughly how many years until it has doubled? Give the nearest whole year."
   }
  },
  {
   "slug": "eigenvectors_dont_turn",
   "title": "The two directions a stretch never turns",
   "ts": "2026-07-30T15:40:46+00:00",
   "date": "30 Jul 2026",
   "topic": "linear_algebra",
   "q": null,
   "a": "Stretch and shear space and almost every arrow swings away from where it pointed. Two never turn at all.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "24 arrows leave the same point, one every 15°, all the same length. Then space gets pulled about. Watch what happens: the arrows are dragged round, most of them a long way — the median swing is 41°, and one arrow ends up 71° from where it started."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Except four of them. Two directions and their opposites come out pointing at exactly the angle they went in at. One pair is 2.2× longer. The other pair is 0.65× as long. Neither has turned by a thousandth of a degree."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Those are the eigenvectors, and the two numbers are the eigenvalues. Both positive here on purpose — a negative one would flip its arrow end for end, and then \"it doesn't turn\" would be a lie."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Honest detail you can see in the video: an arrow starting 15° from the stretched direction only swings 9°, because the map pulls every direction toward that one. That is why the two survivors get marked rather than left to the field alone."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The map is [[0.65, 1.55], [0, 2.2]]. Every arrow on screen is its real image — nothing is drawn by hand."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "poisoned_wine_ten",
   "title": "1,000 bottles, one poisoned, ten tasters, one round",
   "ts": "2026-07-30T15:08:42+00:00",
   "date": "30 Jul 2026",
   "topic": "puzzles",
   "q": "1,000 bottles of wine. Exactly one is poisoned. You get 10 tasters and ONE round of testing. Find the bad bottle.",
   "a": "Ten yes/no reactions are exactly enough to name one bottle in a thousand.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Number the bottles 1 to 1000, and number the tasters 1 to 10. Give taster 1 the value 1, taster 2 the value 2, taster 3 the value 4, and keep doubling: 8, 16, 32, 64, 128, 256, and taster 10 gets 512."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every number from 1 to 1000 can be written as a sum of those ten values in exactly one way. So for each bottle, work out which values add up to its number, and pour that bottle into the glass of every taster holding one of those values."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now everyone drinks their whole collection at once. Hours later, add up the values of the tasters who reacted. That sum IS the bottle number."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Example. Bottle 573 = 512 + 32 + 16 + 8 + 4 + 1, so it goes to tasters 10, 6, 5, 4, 3 and 1. Those six react and the other four do not. Read their values back: 512 + 32 + 16 + 8 + 4 + 1 = 573. Done, in one round."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "WHY TEN IS ENOUGH. Each taster either reacts or does not — two outcomes each. Ten tasters therefore give 2 x 2 x ... ten times = 1024 possible patterns of reactions. 1024 is more than 1000, so there are enough distinct patterns to hand every bottle its own, and the scheme above does exactly that (24 patterns simply go unused)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "WHY NINE CANNOT. Nine tasters give only 2^9 = 512 patterns, and there are 1000 possible culprits. By the pigeonhole principle at least two bottles must produce the same pattern of reactions, and when that pattern turns up you cannot tell which of the two it was. This is true of ANY scheme, not just this one, because in a single round the entire result is a fixed function of which bottle is bad. So ten is not merely sufficient — it is the minimum."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And notice what the one-round rule kills. If you could test, wait, and test again, you would split the thousand in half, then in half again, and one taster would find it in ten rounds. The reaction takes hours, so you only get one shot. The trick is to run all ten of those halvings simultaneously, on ten different people — which is exactly what the doubling values do."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "kmeans_converging",
   "title": "A machine finds the groups nobody told it about",
   "ts": "2026-07-30T13:33:26+00:00",
   "date": "30 Jul 2026",
   "topic": "ml_fundamentals",
   "q": null,
   "a": "Nobody labelled a single dot — and three badly-placed markers still walk themselves into the middle of the groups 🤯",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two rules, repeated: every dot takes the colour of its nearest marker, then every marker slides to the middle of its own colour. Four moves and it's done — the grouping was already in the data."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "(It doesn't always work: drop the markers badly enough and about 1 start in 10 gets stuck.)"
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "giant_component_jump",
   "title": "Join random pairs of dots — nothing, nothing, then one blob",
   "ts": "2026-07-30T12:40:38+00:00",
   "date": "30 Jul 2026",
   "topic": "graphs",
   "q": null,
   "a": "120 dots. After 60 random links the biggest connected group is 22 dots. After 120 it's 97. Watch where it flips.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Join two random dots. Then two more. For ages you get scraps — a chain here, a pair there, and the biggest island barely grows. Then the islands stop growing and start swallowing each other, and almost everything ends up in one piece."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The counter on the right is the biggest island, live, after every single link."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "random_connect",
    "lesson": "u9l2",
    "unit": 9,
    "prompt": "Twenty offices and no cables at all: you keep picking two offices at random and joining them — roughly how many cables before the whole lot is finally connected?"
   }
  },
  {
   "slug": "taylor_sine_terms",
   "title": "A wave built out of nothing but powers of x",
   "ts": "2026-07-30T11:03:44+00:00",
   "date": "30 Jul 2026",
   "topic": "calculus",
   "q": null,
   "a": "A straight line can imitate a wave. You just keep adding pieces — eight of them, and you can't tell it from the real thing.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Start with a straight line through the middle. It has no wiggle in it at all, and yet near the centre it sits exactly on top of the wave. Then it lets go and shoots off."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Add one curved piece and it bends back and holds on further. Add another, and another. Every piece extends the stretch where the two curves are indistinguishable — and the extension is almost exactly the same size every time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is how far the copy stays within 0.01 of the wave, measured from the middle:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "1 piece → 0.39",
      "2 pieces → 1.04",
      "3 pieces → 1.76",
      "4 pieces → 2.50",
      "5 pieces → 3.25",
      "6 pieces → 4.00",
      "7 pieces → 4.75",
      "8 pieces → 5.50"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Roughly +0.75 of extra reach per piece, forever. That is the honest catch too: no matter how many pieces you stack, the copy always escapes eventually — you only ever push the escape point further out. Watch the last few seconds and you can see the eight-piece copy peel away at both edges and fly off the frame."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nothing here is fitted. Each piece is a fixed power of x with a fixed coefficient, added on top of the last."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "(For the curious: this is the Taylor series for sine, one term at a time.)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Would you have guessed plain powers could do that? Follow for one clean math idea a day."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "thousand_days_weekday",
   "title": "1,000 days from a Monday — what day is it?",
   "ts": "2026-07-30T10:06:18+00:00",
   "date": "30 Jul 2026",
   "topic": "number_theory",
   "q": "Start on a Monday. What day is it 1,000 days later? No calendar, no calculator — you can do this one in your head.",
   "a": "Sunday.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A week is a wheel of seven days, so every 7 days you land back exactly where you started. Split 1,000 into whole weeks plus whatever is left over:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "  7 x 142 = 994        142 whole turns of the wheel — these change nothing",
      "  1,000 - 994 = 6      six days left over"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Those 142 turns put you right back on Monday. Now walk the six leftover days: Tue, Wed, Thu, Fri, Sat, SUNDAY."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Check it against a real calendar: Monday 3 August 2026 plus 1,000 days is Sunday 29 April 2029."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The same trick works for any number of days. Divide by 7, throw away the whole weeks, step forward by the remainder. 100 days from a Monday? 100 = 98 + 2, so two steps: Wednesday. 365 days? 365 = 364 + 1, one step — which is exactly why your birthday moves forward one weekday each ordinary year, and two after a leap year."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "overfitting_perfect_fit",
   "title": "The curve that fits your data perfectly is the worst one",
   "ts": "2026-07-30T09:54:51+00:00",
   "date": "30 Jul 2026",
   "topic": "statistics",
   "q": null,
   "a": "This curve fits every single measurement exactly. Zero error. It's the worst one on the screen.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Twelve temperature readings taken through one day. Underneath them is one simple smooth arc — cool in the morning, warm in the afternoon — and every reading lands a little off it, because measuring is never exact."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Make a curve flexible enough and you can bend it through all twelve exactly."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Average miss on those twelve readings:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "wiggly curve — 0.00°",
      "gentle curve — 0.85°"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The wiggly one looks perfect. Then ten fresh readings arrive from the same day, at new times."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Average miss on the ten new readings:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "wiggly curve — 2.67°",
      "gentle curve — 0.86°"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Three times worse. On the very first new reading the wiggly curve predicts 25° and the thermometer says 16° — nine degrees out. The gentle curve is 1.6° out, and it's the closer of the two on 8 of the 10."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The wiggly curve never learned the pattern. It memorised the wobble. Wobble doesn't repeat, so the moment you ask about a time it hasn't seen, it's lost."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's overfitting — and it's why nobody judges a model on the data it was trained on. A perfect score on what you've already seen is not evidence of anything."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "(Seed 58544, both curves fitted, all four numbers computed. The ordering holds in 1,500 of 1,500 independent redraws, not just this one.)"
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "overfit_degree",
    "lesson": "u4l1",
    "unit": 6,
    "prompt": "Ten measurements, and three curves fitted through them. The wiggliest one passes through every single point exactly. Which curve will do best on new measurements it has never seen?"
   }
  },
  {
   "slug": "kelly_bet_sizing",
   "title": "A winning coin can still wipe you out",
   "ts": "2026-07-30T09:32:34+00:00",
   "date": "30 Jul 2026",
   "topic": "probability",
   "q": null,
   "a": "This coin lands heads 60% of the time — and betting half your money on it every flip still leaves you with $33.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Three players. One coin, one shared sequence of 100 flips. Heads doubles your stake, tails loses it. The only difference between them is how much of their money they put on each flip:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "bets 10% → $1,000 becomes $4,501",
      "bets 20% → $1,000 becomes $7,490",
      "bets 50% → $1,000 becomes $33"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nobody got unlucky. That run is 60 heads out of 100 — exactly the median outcome — and the 50% player still ends with 3% of what they started with. Across 20,000 simulated runs they finish below their starting money 77% of the time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: money multiplies. Lose half, and you need to double just to get back. String a few of those together and the winning coin can't dig you out."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A good bet is only half the decision. How much you put on it is the other half."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Which of the three would you have been? Follow for one clean math idea a day."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "kelly_fraction",
    "lesson": "u4l1",
    "unit": 6,
    "prompt": "A coin lands heads 60% of the time. You may bet any share of your money on heads, over and over: win and you double the stake, lose and it is gone. What percentage of your money should you stake each time to grow fastest in the long run?"
   }
  },
  {
   "slug": "two_ropes_45",
   "title": "Two ropes, one lighter: measure exactly 45 minutes",
   "ts": "2026-07-30T08:56:47+00:00",
   "date": "30 Jul 2026",
   "topic": "puzzles",
   "q": "Two ropes. Each burns end to end in exactly one hour — but unevenly. One lighter. Measure exactly 45 minutes.",
   "a": "Light three ends, not two.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Light rope A at BOTH ends and rope B at ONE end, all at the same moment."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Rope A is now being eaten from both directions at once, so whatever is left of it is disappearing at twice the usual pace. It takes an hour to burn from one end, so lit from both it is gone in exactly 30 minutes — and that is true no matter how unevenly it burns, because the two flames together always consume the whole rope in the time one flame would need for all of it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The instant rope A dies, 30 minutes have passed. Rope B has been burning from one end the whole time, so it has exactly 30 minutes of burning left in it. Now light rope B's other end too. Its remaining 30 minutes worth is being eaten from both directions, so it takes 15."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "30 + 15 = 45 minutes, exactly, from the first spark to the last."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why the obvious move fails: \"burn half a rope\" would only give you half an hour if the rope burned at a steady rate — and it does not. On the rope in the video the flame reaches the halfway point after 40.5 minutes, not 30. Length tells you nothing about time here. The only thing you can trust is that a whole rope is one hour, and the trick is that lighting both ends turns \"one hour of rope\" into \"half an hour of clock\" without ever needing to know where the halfway point in TIME is."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Note you never measure anything, cut anything, or fold anything. You just use the fact that two flames burn a rope twice as fast as one."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "optimisers_local_minimum",
   "title": "Two searchers, one hill: the greedy one gets stuck",
   "ts": "2026-07-30T07:57:36+00:00",
   "date": "30 Jul 2026",
   "topic": "optimization",
   "q": null,
   "a": "Always stepping downhill is exactly what gets you stuck 🔴🔵",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Two markers, released from the same point on the same hill, both hunting for the lowest place on it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "🔴 only ever takes the downhill step. It walks into the first dip it meets, the ground there is flat, so it stops. As far as it can tell, it is finished. Depth reached: 0.78."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "🔵 carries its speed. It reaches that same dip already moving, rolls up the far side, crests the ridge, and drops into the valley next door. Depth reached: 3.11 — four times deeper. Even at the top of its overshoot up the far wall it is still lower than where 🔴 gave up."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the whole trick: a search that never accepts a worse step can never leave the first place that looks good. Being willing to go the wrong way for a moment is what gets you to the bottom."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The hill is f(x) = 0.10x² − exp(−((x+1.55)/0.85)²) − 3.6·exp(−((x−2.25)/1.05)²). Its first dip sits at x = −1.444 and the real bottom at x = +2.183. Both paths in the video are the actual iterates of the two searches — nothing is drawn by hand."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "gradient_valley",
    "lesson": "u4l1",
    "unit": 6,
    "prompt": "A machine learns by always stepping downhill from where it is standing. It starts at the arrow. Tap the valley it will end up in."
   }
  },
  {
   "slug": "chaos_double_pendulum",
   "title": "Two pendulums, one hundredth of a degree apart",
   "ts": "2026-07-30T07:23:36+00:00",
   "date": "30 Jul 2026",
   "topic": "physics",
   "q": null,
   "a": "Two pendulums. One starts a hundredth of a degree further over. For three seconds they are the same pendulum.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Then they aren't. And nothing pushed them apart."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both are hanging arms, one swinging from the end of the other. Same lengths, same weights, same gravity, same equations. The only difference is where they start: 0.01° at the upper joint, which puts the two tips 0.17 mm apart — less than a fifth of a millimetre."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That gap doubles, and doubles, and doubles, roughly every quarter of a second. After 2.7 seconds you can see two pendulums. After 3.6 they are a fifth of their own reach apart. By the end of the clip they are on opposite sides of the pivot, 2.8 metres apart, with nothing left in common."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nothing random happened. Run it again from exactly the same numbers and you get exactly the same video. The catch is that \"exactly\" is impossible in the real world — every measurement you could ever make of a real pendulum is rounded off somewhere, and this thing takes that rounding and blows it up into the whole picture."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That is the entire reason nobody can tell you the weather in three weeks. The forecast isn't badly written. The atmosphere is one of these."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The clip is a real simulation, not an animation: the equations of motion integrated with a small fixed step, energy conserved to about one part in 90 billion, and both paths re-run at a quarter of the step size and again with a completely different integrator — so the split is physics, not arithmetic."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "tax_brackets_myth",
   "title": "A raise cannot cut your take-home pay",
   "ts": "2026-07-30T02:43:45+00:00",
   "date": "30 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "A pay rise pushes you into a higher tax bracket and leaves you with LESS. Almost everyone believes this. It's false.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Only the pounds ABOVE the threshold pay the higher rate. UK income tax, 2026/27: the first £12,570 is tax-free, the next £37,700 pays 20p in the pound, and only what spills over £50,270 pays 40p. Each bucket fills to its own limit before a single pound reaches the next one — so a raise only ever lands in the top bucket, and the buckets underneath never change."
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "£58,000 → income tax £10,632",
      "£60,000 → income tax £11,432"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That £2,000 raise costs £800 in tax and leaves £1,200 in your pocket. It cannot leave you worse off."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The honest small print, before someone beats me to it: between £100,000 and £125,140 your tax-free allowance is withdrawn at £1 for every £2 you earn, so the marginal rate there hits 60% — and past about £116,760 that same withdrawal tips you into the 45% band and it reaches 67.5%. Even there you keep roughly 30p of every extra pound, so take-home still goes UP, just by far less than you'd expect. National Insurance is a separate 8% / 2%, and the real cliff edges above £100k are benefits like tax-free childcare, not income tax."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "great_circle_flight",
   "title": "London to Tokyo: which route is shorter?",
   "ts": "2026-07-30T01:22:29+00:00",
   "date": "30 Jul 2026",
   "topic": "geometry",
   "q": "London to Tokyo: one of these two routes is 1,820 km shorter. Which one?",
   "a": "Route 2 — the one that looks like a ridiculous detour.",
   "why": [
    {
     "h": null,
     "t": "pre",
     "lines": [
      "Great circle (route 2), London Heathrow to Tokyo Haneda ... 9,591 km",
      "Straight line on the flat map (route 1) .................. 11,411 km",
      "Route 1 is 1,820 km longer — 19% extra, about two more hours in the air."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The shortest path between two points on a sphere is an arc of the great circle through them. That arc peaks at 71.0 degrees north, off the Arctic coast of Siberia — 4.5 degrees inside the Arctic Circle. It only looks bent because a flat map has to stretch the sphere to make it lie down, and the stretching is worst near the poles: on a flat lat/long map every degree of longitude is drawn the same width at the equator and in the Arctic, when up there a degree is really less than a third as wide. The map makes the polar shortcut look long."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The numbers: spherical Earth, mean radius 6371 km, haversine distance. London Heathrow 51.4700 N, 0.4543 W. Tokyo Haneda 35.5533 N, 139.7811 E. Route 1 = linear interpolation in latitude and longitude, measured along the sphere. Central angle of route 2 = 86.26 degrees."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "phantom_traffic_jam",
   "title": "A traffic jam with no cause - and it travels backwards",
   "ts": "2026-07-29T23:45:38+00:00",
   "date": "29 Jul 2026",
   "topic": "everyday",
   "q": null,
   "a": "This traffic jam has no cause. No crash, no roadworks - and it is travelling backwards.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "14 cars on a loop, every one at the same speed with the same gap. One driver taps the brake for a single second, then drives on normally. The car behind reacts a moment late, so it brakes a little harder. The next one harder still. Thirteen seconds later, cars are at a standstill - and nobody did anything wrong."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now the strange part. Not one car ever moves backwards. The jam does - it slides upstream through the traffic at about 14 km/h."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why that number? Stopped cars sit about 8 metres apart, and each driver takes about 2 seconds to pull away after the one in front. 8 metres every 2 seconds. Neither number knows anything about how fast you drive - so the wave crawls upstream at the same speed whether the traffic is doing 30 or 100."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And the driver who started it? Long gone, back up to speed. On a loop, his own jam comes round and catches him again."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "(Simulated with the Intelligent Driver Model plus a real driver reaction delay. The 14 km/h was measured off the simulation, not quoted - and it matches what gets measured on real motorways.)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Free 5-puzzle sample in bio if you want more of these."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "svd_circle_to_ellipse",
   "title": "A circle can only ever become an ellipse",
   "ts": "2026-07-29T23:32:48+00:00",
   "date": "29 Jul 2026",
   "topic": "linear_algebra",
   "q": null,
   "a": "A matrix can't squash a circle into any shape it likes. It's always an ellipse.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Stretch it, shear it, spin it — the ring of dots never comes out wobbly. And that one fact tells you everything a transformation can do: turn it, stretch two perpendicular directions, turn it again. Three moves. One of them is just two numbers."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Those two directions and those two numbers are the singular value decomposition — the machinery behind PCA, image compression and least squares. No formula needed to see it."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "you_exist_odds",
   "title": "The odds you exist — the one part you can actually compute",
   "ts": "2026-07-29T06:44:14+00:00",
   "date": "29 Jul 2026",
   "topic": "relatable",
   "q": null,
   "a": "About 250 million swimmers. One egg. You are what happened next.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here is the one part you can actually compute, with the assumptions on screen: about 250 million sperm in one ejaculate, and about 1 million eggs a woman is born with (the low end of the usual 1-2 million). So one specific child of one specific couple is one sperm in 250,000,000 and one egg in 1,000,000 = 250 trillion to one, about 1 in 10^14. The exponent is rounded DOWN, so that is an understatement."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now zoom out. That whole race is a single dot on your family tree, and every ancestor you have won it too. You plus 10 generations of ancestors is 2^11 - 1 = 2,047 conceptions, so that single factor alone compounds to (2.5 x 10^14)^2047 - a number with 29,473 digits, i.e. more than 10^29,000. That assumes those 2,046 ancestor slots are 2,046 different people."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is only the conception lottery. It says nothing about the odds your parents met, which is exactly the part the famous viral version of this stat invents - so we left that number out entirely."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "And the part that needs no arithmetic: every ancestor you have, back through roughly 3.7 billion years of life on Earth, lived long enough to reproduce. Not one broke the chain."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "bertrand_chord_paradox",
   "title": "One question, three correct answers: Bertrand's paradox",
   "ts": "2026-07-29T06:35:41+00:00",
   "date": "29 Jul 2026",
   "topic": "geometry_prob",
   "q": "Draw a line at random across a circle. Is it longer than the side of the triangle that fits inside?",
   "a": "The answer is 1/2. And 1/3. And 1/4. All three are correct.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A chord beats the triangle's side exactly when its midpoint sits closer than half a radius to the centre. So everything hangs on what \"at random\" means:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "two uniform points on the rim → the second must land on the far 120° arc → 1/3",
      "a uniform direction, then a uniform point along that radius → 1/2",
      "a midpoint uniform over the disc's area → the inner circle is a quarter of it → 1/4"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Each rule is perfectly uniform — just uniform over a different thing. None of them is the answer, and none is wrong. The question never said HOW to pick the line. That's Bertrand's paradox (1889), and it's why every well-posed probability question has to state its sampling rule."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "popular_vote_paradox",
   "title": "52% of the votes, 2 of 5 seats — the wasted-vote arithmetic",
   "ts": "2026-07-28T22:08:38+00:00",
   "date": "28 Jul 2026",
   "topic": "topical",
   "q": null,
   "a": "A party can win more votes than the other side and still end up with fewer seats 🗳️",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "An invented country, five districts, 100 voters each. Whoever gets the most votes in a district takes that seat."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Party A: 70 + 70 + 40 + 40 + 40 = 260 Party B: 30 + 30 + 60 + 60 + 60 = 240"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "260 out of 500 is 52% of every vote cast — and A takes 2 seats out of 5."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: a district only needs 51 votes. Anything on top of that, plus every vote in a district you lose, wins nothing. A wastes 19 + 19 + 40 + 40 + 40 = 158 votes; B wastes 30 + 30 + 9 + 9 + 9 = 87. (158 + 87 + 5×51 = 500, so every ballot is accounted for.) A's support is packed 70–30 where it already wins; B's is spread just thick enough to carry three districts 60–40."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same 500 votes, different distribution, different chamber. Party A and Party B are made up — this is arithmetic about counting seats district by district, not a claim about any real election."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "illusion_motion",
   "title": "Cafe wall — eleven parallel lines your eyes refuse to believe",
   "ts": "2026-07-28T21:54:46+00:00",
   "date": "28 Jul 2026",
   "topic": "illusions",
   "q": null,
   "a": "Every grey line here is perfectly parallel. You won't believe it until the tiles slide back at the end 👀",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is the Café Wall illusion — the real wall is in Bristol, and the tiling made so many people stop and argue that a vision lab ended up studying it."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nothing in this video is tilted. Every mortar line is drawn as a flat horizontal rectangle at a fixed height, all evenly spaced. The only thing that ever changes is the sideways position of the tiles."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Your visual system builds each black-white-grey corner into a tiny tilted cue, then merges them along the row into one long slope. Shift alternate rows by half a tile and the slopes flip direction each line — so you get wedges that taper and converge out of eleven lines that are mathematically parallel."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The red rulers in the middle of the clip are dead straight and sit exactly on the mortar. The illusion survives them. It even survives you knowing."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "monty_hall_10s",
   "title": "Monty Hall: 2/3 or 1/2 depending on what the host knew",
   "ts": "2026-07-28T21:14:05+00:00",
   "date": "28 Jul 2026",
   "topic": "paradox",
   "q": "Everyone argues about Monty Hall, but nobody asks the one question that decides the answer: did the host know?",
   "a": "It depends on the host. A host who KNOWS where the car is and can never open it → switching wins 2/3. A host who does not know, opens one of the other two at random and happens to reveal a goat → switching wins exactly 1/2.",
   "why": [
    {
     "h": null,
     "t": "list",
     "lines": [
      "The host KNOWS where the car is and can never open it → switching wins 2/3.",
      "The host does NOT know, opens one of the other two at random, and it happens to be a goat → switching wins exactly 1/2."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why the second one is a coin flip: conditioning on \"a goat got revealed\", you picked the car → 1/3 × 1 = 1/3 you picked a goat → 2/3 × 1/2 = 1/3 Equal weight, so 50/50. (And 1/3 of the time the clueless host just opens the car and kills the round.)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The evidence was never \"there's a goat behind that door\". It was \"a host who was avoiding the car chose THAT door\". Take his knowledge away and the evidence disappears."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "clumsy_host",
    "lesson": "u7l1",
    "unit": 7,
    "prompt": "Three doors, one prize. You pick a door, and a host who has forgotten where the prize is opens another door at random — it happens to be empty. Out of 100 games like this, how many would switching win?"
   }
  },
  {
   "slug": "breaking_news_odds_12s",
   "title": "BREAKING: did Argentina cheat at the World Cup? (12s cut)",
   "ts": "2026-07-28T20:44:46+00:00",
   "date": "28 Jul 2026",
   "topic": "topical",
   "q": null,
   "a": "Did Argentina cheat at the World Cup? A 5-of-5 run of calls is 3% for one named team — but 64% for SOMEBODY ⚽",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The look-elsewhere effect in 12 seconds. If every contested call were a coin flip, a team you named BEFORE kickoff taking all 5 its way is 1/32 ≈ 3%. Nobody named a team first — we watched all 32, then picked the one that looked worst. P(some team of 32 does it) = 1 − (31/32)^32 ≈ 64%, and the expected number of teams with a \"perfect\" run is exactly 1, every tournament. Figures as reported by analysts, which found no proof of deliberate favouritism. Nobody has to be cheating — that's just what randomness looks like."
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "p_hacking",
    "lesson": "u2l2",
    "unit": 3,
    "prompt": "You run 20 completely useless experiments. Each one has a 1 in 20 chance of throwing up an exciting-looking result purely by luck. On average, how many exciting results will you get?"
   }
  },
  {
   "slug": "breaking_news_odds",
   "title": "BREAKING: did Argentina cheat at the World Cup? (64%)",
   "ts": "2026-07-28T20:12:33+00:00",
   "date": "28 Jul 2026",
   "topic": "topical",
   "q": null,
   "a": "Did Argentina cheat at the World Cup? Run the honest test and the answer gets boring fast ⚽",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "As reported by analysts: only 2 of Argentina's 7 matches were free of refereeing controversy, and 4 VAR interventions on fouls went in their favour. On those same reported numbers the highest favourable-VAR rate wasn't theirs — Mexico's was higher (7.8 vs 6.7) — and those analyses concluded the evidence does not prove deliberate favouritism."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here's the test almost nobody runs: the look-elsewhere effect. If every contested call were a coin flip, one team you named BEFORE kickoff taking all 5 of 5 its way is 1/32 ≈ 3%. Suspicious. But nobody named a team first — we scanned all 32, then picked the one that looked worst. P(some team of 32 does it) = 1 − (31/32)^32 ≈ 64%, and the expected number of teams with a \"perfect\" run is exactly 1. A striking run somewhere is what a fair tournament looks like, every single time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Nobody has to be cheating. That's not a scandal, that's arithmetic — and it's the bar any bias claim has to clear 📌"
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "p_hacking",
    "lesson": "u2l2",
    "unit": 3,
    "prompt": "You run 20 completely useless experiments. Each one has a 1 in 20 chance of throwing up an exciting-looking result purely by luck. On average, how many exciting results will you get?"
   }
  },
  {
   "slug": "referee_bias_test",
   "title": "How you would actually test 'the refs are favouring them'",
   "ts": "2026-07-28T19:34:53+00:00",
   "date": "28 Jul 2026",
   "topic": "real_world",
   "q": null,
   "a": "Every World Cup someone looks like the refs' favourite. The maths has a much duller explanation ⚽",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "As reported by analysts: only 2 of Argentina's 7 matches were free of refereeing controversy, and 4 VAR interventions on fouls went in their favour. But on the same reported numbers the highest favourable-VAR rate wasn't theirs — Mexico's was higher (7.8 vs 6.7) — and the most decisions going against a side went to Croatia (6.5) and Iran (6.4). Those analyses concluded the evidence does not prove deliberate favouritism."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Here's the test almost nobody runs — the look-elsewhere effect. If every contested call were a coin flip, one team you named BEFORE kickoff getting 5 of 5 its way is 1/32 ≈ 3%. Suspicious. But nobody named a team first; we scanned all 32 and then picked the one that looked worst. P(some team of 32 does it) = 1 − (31/32)^32 ≈ 64%, and the expected number of teams with a \"perfect\" run is exactly 1. So a striking run somewhere is what a fair tournament looks like — every single time."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Not a defence, not an accusation. Just the bar any bias claim has to clear 📌"
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "p_hacking",
    "lesson": "u2l2",
    "unit": 3,
    "prompt": "You run 20 completely useless experiments. Each one has a 1 in 20 chance of throwing up an exciting-looking result purely by luck. On average, how many exciting results will you get?"
   }
  },
  {
   "slug": "berksons_paradox",
   "title": "Berkson's paradox — selection invents a correlation",
   "ts": "2026-07-28T18:33:24+00:00",
   "date": "28 Jul 2026",
   "topic": "bayes_stats",
   "q": null,
   "a": "Two traits with nothing to do with each other — until you look only at the people you'd actually date",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "In the population, r = 0.00. Inside the dating pool, r = −0.45. Same people."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The rule does all the work: you'd date anyone in the top 40% on kindness OR the top 40% on interesting, and skip the ones who are neither. That deletes the bottom-left corner of the cloud — and what's left tilts. If someone is kind enough to make your cut, they never needed to be interesting, so on average they're less interesting. The trade-off is manufactured by your filter, not by people."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's Berkson's paradox: condition on a collider — something both traits feed into — and you invent a correlation that does not exist."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Same illusion behind \"why are talented people always so unreliable?\" You only ever meet the ones who cleared a talent-or-reliability bar. Berkson found it in 1946 in hospital records: two unrelated diseases look linked among admitted patients, because being admitted needs one or the other."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Checked two ways: the exact correlation on that region is −0.4497, and 200,000 uniform draws (seed 20260728) give population r = −0.0035 and selected r = −0.4525. 64% of people survive the filter 📌"
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "pirate_game_98",
   "title": "5 pirates, 100 coins — the boss keeps 98",
   "ts": "2026-07-28T17:54:20+00:00",
   "date": "28 Jul 2026",
   "topic": "game_theory",
   "q": "Five pirates have to split 100 gold coins, and the ruthless one at the top walks away with almost all of them",
   "a": "98 · 0 · 1 · 0 · 1 — the senior pirate keeps 98 and buys one vote each from the two who would get nothing next round. It passes 3–2.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Label the pirates 1 (most senior) to 5. Work backwards from the smallest game."
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "2 left → 4 proposes 100 · 0. He votes for himself, that's 1 of 2, a tie passes. So pirate 5 gets NOTHING here — remember that.",
      "3 left → 3 needs 2 votes. Pirate 5 gets 0 next round, so 1 coin buys him. 99 · 0 · 1.",
      "4 left → 2 needs 2 votes. Pirate 4 gets 0 next round, so 1 coin buys him. 99 · 0 · 1 · 0.",
      "5 left → 1 needs 3 votes. Next round pirates 3 and 5 both get 0, so a single coin buys each of them."
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    98 · 0 · 1 · 0 · 1     passes 3–2"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why he can't be greedier: at 99 he can only pay one pirate, so he gets 2 votes out of 5 and it fails. 98 is exactly optimal."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trick is that a vote is priced at the continuation value plus one coin — and the whole ladder is built on the fact that with 2 pirates left, the last one gets zero."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "knight_return_168",
   "title": "A random knight takes exactly 168 moves to come home",
   "ts": "2026-07-28T17:05:33+00:00",
   "date": "28 Jul 2026",
   "topic": "markov_chains",
   "q": null,
   "a": "A knight wandering at random takes way longer to find its way home than anyone guesses ♞",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "168 moves, on average — and that's exact, not a simulation."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: a random walk on a graph has stationary distribution π(v) = deg(v)/2E, so the mean first return time to v is exactly 2E/deg(v). The knight's graph on an 8×8 board has 168 edges, so 2E = 336. A corner square has only 2 legal moves → 336/2 = 168. A centre square has 8 → 336/8 = 42. Four times faster, same board, same walk."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "one_in_a_million",
   "title": "A 1-in-a-million event happens 8,000 times a day",
   "ts": "2026-07-28T16:14:15+00:00",
   "date": "28 Jul 2026",
   "topic": "real_world",
   "q": null,
   "a": "A \"1 in a million\" event happens 8,000 times a day 🌍",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The law of truly large numbers, real-world framing, for @have_you_seen_my_quant. Hook = a shock number in the first second: an event with odds of 1 in 1,000,000 happens **8,000 times every day** on Earth."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "All arithmetic below is exact and independently checked:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "population N = 8e9 (approx. world population), per-person daily p = 1e-6"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "      expected hits/day  = N*p           = 8,000",
      "      expected hits/year = N*p*365       = 2,920,000"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "P(it happens to NOBODY today) = (1 - 1e-6)^(8e9)"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "      = exp(8e9 * ln(1 - 1e-6)) = 4.39e-3475      (log10 = -3474.3576)",
      "    so we quote ~4 x 10^-3475 on screen and \"ten to the minus three thousand",
      "    four hundred seventy-five\" in narration."
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "coin-flip crowd size: 1-(1-p)^n = 1/2  =>  n = ln2 / -ln(1-p) = 693,146.8"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    (the familiar ln2/p = 693,147.2 — we show 693,147)"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "at p = 1e-9 (one in a BILLION): N*p = 8 per day, 2,920 per year."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "ten_heads_2046",
   "title": "2046 vs 1024 — two coin patterns, same odds, double the wait",
   "ts": "2026-07-28T15:24:02+00:00",
   "date": "28 Jul 2026",
   "topic": "expectation_tricks",
   "q": null,
   "a": "Two coin patterns with identical odds — but one takes twice as long to show up 🪙",
   "why": [
    {
     "h": null,
     "t": "pre",
     "lines": [
      "HHHHHHHHHH → 2046 flips on average",
      "HHHHHHHHHT → 1024 flips"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Both patterns have exactly the same 1-in-1024 chance in any 10-flip window, so the wait \"should\" be the same. It isn't."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trick is self-overlap. Getting 9 heads in a row takes 1022 flips on average. Then:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "chasing a TAIL — extra heads keep your nine, and the first tail finishes the job: 1022 + 2 = 1024",
      "chasing a 10th HEAD — one tail wipes out all nine and you restart: 2 × (1022 + 1) = 2046"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A pattern that overlaps itself arrives in clumps, so you wait longer for the first one. Same probability ≠ same waiting time — that's the whole trap."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Save this one for your next interview 🧠"
     ]
    }
   ],
   "src": "caption",
   "road": {
    "qid": "hh_vs_ht",
    "lesson": "u1l2",
    "unit": 1,
    "prompt": "Flip a coin until you have just seen heads then heads. Start again and flip until you see heads then tails. Which wait is longer on average?"
   }
  },
  {
   "slug": "arcsine_law_10s",
   "title": "22% of fair coin games: one player leads 97% of the time",
   "ts": "2026-07-28T14:34:56+00:00",
   "date": "28 Jul 2026",
   "topic": "random_walk",
   "q": null,
   "a": "In 22% of fair coin games, ONE player is ahead 97% of the time 🪙 (a near 50/50 split? just 6%)",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "That's the arcsine law: P(share of time in the lead ≤ x) = (2/π)·arcsin(√x). The density 1/(π√(x(1−x))) is U-shaped, so a near-even lead split is the LEAST likely outcome and one side hogging the lead is the MOST likely. A fair game rarely feels fair."
     ]
    }
   ],
   "src": "caption"
  },
  {
   "slug": "shuffle_52_factorial",
   "title": "52! — the number of ways to shuffle a deck",
   "ts": "2026-07-28T13:44:00+00:00",
   "date": "28 Jul 2026",
   "topic": "combinatorics",
   "q": "Shuffle a deck of cards. That exact order has almost certainly never existed before in history 🃏",
   "a": "52! = 52 × 51 × 50 × … × 1 = 80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000 — exactly 68 digits, ≈ 8.07 × 10^67.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: the top card can be any of 52, the next any of the 51 left, the next 50… multiply them all and you get 52 factorial."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "🌌 How absurd is that? If all 8 billion people alive shuffled one deck every second since the Big Bang (13.787 billion years ≈ 4.35 × 10^17 seconds), we'd have produced ~3.5 × 10^27 orderings — under 10^-40 of the total. So a properly shuffled deck is almost certainly an order that has never existed and never will again."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "📘 Free 5-puzzle sample + the full pack → link in bio."
     ]
    }
   ],
   "src": "comment",
   "road": {
    "qid": "queue_orders",
    "lesson": "u5l1",
    "unit": 2,
    "prompt": "Five friends line up at a bus stop. How many different orders could the queue be in?"
   }
  },
  {
   "slug": "ballot_never_tied",
   "title": "Final vote 7-3. Was the winner ahead the whole count?",
   "ts": "2026-07-28T11:54:01+00:00",
   "date": "28 Jul 2026",
   "topic": "random_walk",
   "q": "Final vote: A 7 — B 3. The ballots are counted one at a time in a random order. What's the probability A was strictly AHEAD the entire count — never tied, never behind?",
   "a": "2/5 — just 40%. (Most people guess 70-80%.)",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Bertrand's ballot theorem: if the winner gets a votes and the loser b, the chance the winner is strictly ahead at EVERY point of the count is (a − b) / (a + b) = (7 − 3) / 10 = 2/5."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Why: A's running lead is a ±1 random walk from 0 to +4 in 10 steps. By the reflection principle, the paths that touch 0 after the start are exactly TWICE the paths whose first vote is B → P(bad) = 2 × 3/10 = 6/10, so P(ahead all the way) = 4/10 = 40%."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "✅ Brute force agrees: 48 of the 120 possible counting orders stay ahead (Monte-Carlo: 0.3999)."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "📘 Free 5-puzzle sample + the full pack → link in bio."
     ]
    }
   ],
   "src": "comment"
  },
  {
   "slug": "lottery_ev",
   "title": "The $800M jackpot: buy 100 tickets?",
   "ts": "2026-07-28T11:09:02+00:00",
   "date": "28 Jul 2026",
   "topic": "real_world",
   "q": "The $800M jackpot: buy 100 tickets?",
   "a": "No. Even at an $800M headline the expected value of a $2 ticket is about −$1.45, because the cash value after tax and splitting is nearer $160M and the odds are 1 in 292,201,338.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Topical hook: a record jackpot has crossed $800 million and everyone's buying tickets. The relatable-but-wrong instinct is \"100 tickets = a decent shot.\""
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The math nobody wants to hear:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "Odds of one ticket winning are about 1 in 300 million (Powerball is"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    1 in 292,201,338). 100 tickets only lift you to ~1 in 3 million — still,",
      "    for all practical purposes, zero."
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "The advertised $800M is a mirage: it's the annuity, not cash; the cash"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    value is roughly half, taxes take ~37%+, and at record jackpots you often",
      "    have to SPLIT the pot. The value a winning ticket actually delivers is",
      "    closer to ~$160M."
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "So even at an $800M headline, expected value per ticket is negative:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "        EV = P(win) * J_effective - price",
      "           ~ (1/3e8) * 160e6 - 2  ~  $0.55 - $2  =  -$1.45  < 0."
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "Buying 100 * (a chance of ~nothing) is still ~nothing: a fixed-seed sim of"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    200,000 lifetimes each buying 100 tickets wins the jackpot zero times and",
      "    returns $0 against $40M spent."
     ]
    }
   ],
   "src": "module",
   "road": {
    "qid": "raffle_ticket",
    "lesson": "u6l1",
    "unit": 4,
    "prompt": "A raffle sells 500 tickets and has one prize of £600. Forget what a ticket costs — what is a ticket worth on average, in pounds?"
   }
  },
  {
   "slug": "boy_tuesday_short",
   "title": "A boy born on Tuesday — can you solve it?",
   "ts": "2026-07-28T07:00:05+00:00",
   "date": "28 Jul 2026",
   "topic": "paradox",
   "q": "A woman has two children. One is a boy born on a Tuesday. What's the probability that BOTH are boys?",
   "a": "It's 13/27 (≈ 48%). Not 1/2, not 1/3.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Treat each child as (gender + day of week) → 2 × 7 = 14 equally likely types. For two kids that's 14 × 14 = 196 equally likely (older, younger) combinations."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "We're told at least one child is a boy born on Tuesday (call it B-Tue). Count those combos:"
     ]
    },
    {
     "h": null,
     "t": "list",
     "lines": [
      "first child B-Tue → 14",
      "second child B-Tue → 14",
      "minus the 1 where BOTH are B-Tue (counted twice)"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "= 14 + 14 − 1 = 27 possible worlds."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Now, how many of those 27 have TWO boys? A boy + a day = 7 boy-types, so pairs of boys with at least one B-Tue = 7 + 7 − 1 = 13."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "P(both boys | one is a boy born on Tuesday) = 13 / 27 ≈ 0.48."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "🤯 The mind-bender: a totally \"irrelevant\" detail (Tuesday) makes the two-boys case harder to double-count, pushing the answer from 1/3 UP toward 1/2. The more specific the clue about the boy, the closer to 1/2 you get. If you'd been told nothing about the day, it's the classic 1/3."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Comment \"13/27\" if you got it 😉"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "📘 Full 38-puzzle pack + free sample → link in bio."
     ]
    }
   ],
   "src": "comment",
   "road": {
    "qid": "boy_weekday",
    "lesson": "u7l1",
    "unit": 7,
    "prompt": "A woman tells you she has two children, and that one of them is a boy born on a weekday. What is the chance that both of her children are boys?"
   }
  },
  {
   "slug": "simpsons_paradox",
   "title": "Help every group, hurt overall — Simpson's paradox",
   "ts": "2026-07-27T00:18:52+00:00",
   "date": "27 Jul 2026",
   "topic": "real_world",
   "q": "Can a treatment beat another in every subgroup and still lose overall?",
   "a": "Yes. Treatment A beats B on mild cases (95% v 90%) AND on severe cases (50% v 45%), and still loses overall, 59% to 81%.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A trend that shows up in each subgroup can REVERSE when the groups are pooled, because of a lurking (confounding) variable and unequal group sizes."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Clean, neutral medical example. Treatment A vs Treatment B, patients split into mild and severe cases:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "                 mild cases          severe cases        combined",
      "    Treatment A  19/20 = 95%         40/80 = 50%          59/100 = 59%",
      "    Treatment B  72/80 = 90%          9/20 = 45%          81/100 = 81%"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "A beats B for mild AND for severe, yet B wins overall. The reason is the mix: A was given mostly to severe (hard-to-cure) patients, B mostly to mild (easy) ones, so A's pooled rate is dragged down by all the tough cases even though it was the better choice inside every group."
     ]
    }
   ],
   "src": "module",
   "road": {
    "qid": "workshop_split",
    "lesson": "u7l2",
    "unit": 7,
    "prompt": "Two bike workshops. On easy repairs A fixes a bigger share than B does, and on hard repairs A fixes a bigger share than B as well."
   }
  },
  {
   "slug": "arcsine_law",
   "title": "In a fair coin game, who's in the lead? Almost never 50/50.",
   "ts": "2026-07-26T23:24:56+00:00",
   "date": "26 Jul 2026",
   "topic": "random_walk",
   "q": null,
   "a": "In a fair coin game, who's in the lead? Almost never 50/50.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Track cumulative heads-minus-tails in a long fair coin game — a symmetric random walk. Intuition says that in a fair game the lead should trade back and forth, so each player leads about half the time. That intuition is spectacularly wrong. By the arcsine law, the fraction of TIME one player spends in the lead is LEAST likely to be near one half and MOST likely to be near 0 or 1: one player usually leads almost the entire game."
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    P(fraction of time in lead <= x) = (2/pi) arcsin(sqrt(x))",
      "    density f(x) = 1 / (pi sqrt(x(1-x)))  — U-shaped, blows up at 0 and 1."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "random_walk_stocks",
   "title": "Can you tell a real stock chart from pure randomness?",
   "ts": "2026-07-26T22:34:51+00:00",
   "date": "26 Jul 2026",
   "topic": "random_walk",
   "q": "Can you tell a real stock chart from pure randomness?",
   "a": "No. A pure coin-flip walk produces convincing \"trends\", \"support levels\" and \"patterns\" that are nothing but noise.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Topical hook — everyone has an opinion on stocks and crypto right now. A pure coin-flip random walk (price_{t+1} = price_t +/- 1, each step 50/50) produces charts that look exactly like real price series: convincing \"trends\", \"support levels\" and \"patterns\" that are, in fact, pure noise."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "This is the random-walk model of markets: short-term moves are close to unpredictable, and E[price tomorrow | everything so far] = price today (a martingale). The honest point is NOT that markets are perfectly efficient — it is that randomness fools us, so most chart \"patterns\" people trade on are illusions our brains impose on noise, and short-term prediction is extremely hard. Educational, accurate, NOT investment advice."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "hundred_prisoners",
   "title": "100 prisoners, 100 boxes — the 31% miracle",
   "ts": "2026-07-26T20:47:25+00:00",
   "date": "26 Jul 2026",
   "topic": "",
   "q": "100 prisoners must each find their own number among 100 boxes, opening at most 50 each, and every one of them has to succeed. What are the odds?",
   "a": "About 31%. Following the loop — open your own number, then the box matching the number you find — beats random guessing's (1/2)^100.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "100 prisoners must each find their own number among 100 boxes; each may open at most 50 boxes, and EVERY prisoner must succeed or all are executed. Random guessing gives survival (1/2)^100 ≈ 0. Yet the \"follow the loop\" strategy — open your own number's box, then the box matching the number you find, chaining along a cycle — gives survival ≈ 31%."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The trick: label the box you open by its position and the slip inside by its number, and the boxes decompose into cycles of a random permutation. A prisoner following his loop returns to his own number in exactly (cycle length) steps, so he succeeds iff his cycle is ≤ 50 long. EVERYONE succeeds iff the permutation has NO cycle longer than 50. Since a permutation of 100 has at most one cycle longer than 50, P(some cycle > 50) = sum_{k=51}^{100} 1/k ≈ ln 2 ≈ 0.69, so survival ≈ 1 - 0.69 ≈ 0.31."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "polya_recurrence",
   "title": "The drunk always finds home. The lost drone never does.",
   "ts": "2026-07-26T19:54:06+00:00",
   "date": "26 Jul 2026",
   "topic": "random_walk",
   "q": null,
   "a": "The drunk always finds home. The lost drone never does.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "The direct sequel to the drunkard's walk. A symmetric random walk on a flat grid (2D) returns to its start with probability 1 — it is RECURRENT. Lift the same random walk into 3D space and it becomes TRANSIENT: it comes home only with probability ~0.3405, escaping forever about two thirds of the time. That is Polya's theorem. The intuition: the chance of being back at the origin after 2n steps decays like 1/n^{d/2}; summed over all time that diverges in 1D and 2D (certain return) but converges in 3D (escape)."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "birthday_problem",
   "title": "The Birthday Problem — how few people?",
   "ts": "2026-07-26T18:54:10+00:00",
   "date": "26 Jul 2026",
   "topic": "counting",
   "q": "The birthday paradox — how few people until two share a birthday?",
   "a": "23 people. Not 183 — that is where the chance of a shared birthday passes 50%.",
   "why": [],
   "src": "module",
   "road": {
    "qid": "birthday_23",
    "lesson": "u1l2",
    "unit": 1,
    "prompt": "People walk into a room one at a time. At what point does it become more likely than not that two of them share a birthday?"
   }
  },
  {
   "slug": "two_players_first_six",
   "title": "Two players race to roll a 6 — does going first help?",
   "ts": "2026-07-26T15:46:32+00:00",
   "date": "26 Jul 2026",
   "topic": "gamblers",
   "q": "Two players race to roll a 6 — does going first help?",
   "a": "Going first helps: P(A wins) = (1/6)/(1 − 25/36) = 6/11 ≈ 0.545.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "Players A and B alternate rolling a fair die; the first to roll a 6 wins, and A goes first. Because A gets the first shot, A is the favourite:"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    P(A) = 1/6 + (5/6)^2 P(A)      # A wins now, or both miss and it recurses",
      "    P(A) = (1/6) / (1 - 25/36) = (1/6)/(11/36) = 6/11 ≈ 0.545."
     ]
    }
   ],
   "src": "module"
  },
  {
   "slug": "two_children",
   "title": "The boy-girl paradox — at least one boy",
   "ts": "2026-07-26T14:38:23+00:00",
   "date": "26 Jul 2026",
   "topic": "paradox",
   "q": "A family has two children and at least one is a boy. What is the chance both are boys?",
   "a": "1/3, not 1/2. Four equally likely families {BB, BG, GB, GG}; \"at least one boy\" rules out GG, leaving three, of which exactly one is BB.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A family has two children. You're told at least one is a boy. The probability that both are boys is 1/3, not 1/2. The centrepiece is a 2x2 grid of the four equally-likely families {BB, BG, GB, GG}; conditioning on \"at least one boy\" rules out GG, leaving 3 cells, of which exactly one is BB."
     ]
    }
   ],
   "src": "module",
   "road": {
    "qid": "two_children",
    "lesson": "u1l1",
    "unit": 1,
    "prompt": "A family has two children. You are told at least one of them is a girl. What is the chance both are girls?"
   }
  },
  {
   "slug": "st_petersburg",
   "title": "The St. Petersburg paradox",
   "ts": "2026-07-26T14:10:26+00:00",
   "date": "26 Jul 2026",
   "topic": "paradox",
   "q": "Flip a fair coin until the first heads. If it lands on flip k you win $2^k. What is the game worth?",
   "a": "The expected payout is infinite — every term is worth exactly $1 and there are infinitely many — yet almost nobody would pay even $20 to play.",
   "why": [
    {
     "h": null,
     "t": "p",
     "lines": [
      "A coin game: flip a fair coin until the first heads. If the first heads lands on flip k, you win 2^k dollars. The expected payout is"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    E = sum_{k=1}^inf (1/2^k)(2^k) = 1 + 1 + 1 + ... = infinity."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "Every term is worth exactly one dollar because the prize doubles (2^k) exactly as fast as its probability halves (1/2^k), so the sum diverges. Yet almost nobody would pay even $20 to play."
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "The resolution is diminishing marginal value: value the LOG of the payout, not the payout. Under log utility"
     ]
    },
    {
     "h": null,
     "t": "pre",
     "lines": [
      "    E[ln X] = sum (1/2^k) ln 2^k = ln2 * sum k/2^k = 2 ln2 = ln 4,"
     ]
    },
    {
     "h": null,
     "t": "p",
     "lines": [
      "so the certainty-equivalent is e^{ln 4} = $4. Infinite expected dollars, but only a few dollars of expected utility."
     ]
    }
   ],
   "src": "module"
  }
 ],
 "featured": "pizza_slice_two_cuts"
};
