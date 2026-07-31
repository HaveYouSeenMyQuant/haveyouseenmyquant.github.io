/* Question bank — the single source of truth for the whole road.
 *
 * The object below is PURE JSON on purpose: site/verify_answers.py parses this
 * exact file (strips the assignment, json.loads the rest) and re-derives every
 * answer from scratch. Keep it JSON — no comments, no trailing commas, no
 * functions inside. Interactive visuals live in js/viz*.js, keyed by "viz".
 *
 * Question types:
 *   choice     choices[] + answer (index)
 *   truefalse  statement + answerBool
 *   number     answerNumber + tolerance (+ suffix, placeholder)
 *   order      items[] listed in the CORRECT order; the app scrambles them
 *   tap        regions[] + answerRegion; the visual reports the tap
 */
window.QQ_DATA = {
  "version": 2,
  "dailyGoalXp": 30,
  "heartsPerLesson": 4,
  "xp": { "perQuestion": 2, "lessonBonus": 10, "perfectBonus": 5 },
  "units": [
    {
      "id": "u1",
      "index": 1,
      "title": "Chance, first look",
      "subtitle": "Counting what can happen — and what usually does.",
      "colour": "#58a6ff",
      "free": true,
      "lessons": [
        {
          "id": "u1l1",
          "title": "What can happen",
          "questions": [
            {
              "id": "dice_difference",
              "type": "choice",
              "topic": "probability",
              "prompt": "Roll two ordinary dice and take the bigger minus the smaller. Which difference comes up most often?",
              "vizHint": "Tap a difference to light up every roll that gives it.",
              "viz": "diceDifference",
              "choices": ["0", "1", "2", "5"],
              "answer": 1,
              "answerValue": "1",
              "explain": "There are 36 equally likely rolls. A difference of zero needs a matching pair, and there are only six of those. A difference of one can happen ten ways, because each pair counts twice — four then five, and five then four. Zero feels special, so people pick it. One wins, ten to six."
            },
            {
              "id": "dice_sum",
              "type": "choice",
              "topic": "probability",
              "prompt": "Same two dice, but now add them. Which total comes up most often?",
              "vizHint": "Tap a total. The grid shows every roll that makes it.",
              "viz": "diceSum",
              "choices": ["6", "7", "8", "every total is equally likely"],
              "answer": 1,
              "answerValue": "7",
              "explain": "Seven is the only total you can make six different ways: 1+6, 2+5, 3+4 and each of those the other way round. Six and eight can each be made five ways. Two and twelve, only one way each. The grid is a diagonal band, and seven is the long diagonal through the middle."
            },
            {
              "id": "three_coins",
              "type": "number",
              "topic": "counting",
              "prompt": "Flip three coins. There are eight possible results in all. How many of them have exactly two heads?",
              "vizHint": "All eight results are listed. Tap one to check it.",
              "viz": "coinTriples",
              "answerNumber": 3,
              "tolerance": 0,
              "placeholder": "how many?",
              "answerValue": "3",
              "explain": "Write all eight out and you can count them: HHT, HTH and THH. Three of the eight. The trick is to notice you are really choosing which single coin is the tail — three coins, three choices."
            },
            {
              "id": "two_children",
              "type": "choice",
              "topic": "probability",
              "prompt": "A family has two children. You are told at least one of them is a girl. What is the chance both are girls?",
              "vizHint": "Tap to cross out the families that no longer fit.",
              "viz": "twoChildren",
              "choices": ["1 in 2", "1 in 3", "1 in 4", "you cannot say"],
              "answer": 1,
              "answerValue": "1/3",
              "explain": "Before you are told anything there are four equally likely families: boy-boy, boy-girl, girl-boy, girl-girl. 'At least one girl' only rules out boy-boy. Three families are left and just one of them is two girls. One in three — not one in two, because boy-girl and girl-boy are two different families and both survive."
            }
          ]
        },
        {
          "id": "u1l2",
          "title": "When chance surprises",
          "questions": [
            {
              "id": "socks_dark",
              "type": "number",
              "topic": "puzzles",
              "prompt": "A drawer holds ten black socks and ten blue socks, all mixed up. The room is pitch dark. How many socks must you take out to be certain you have a matching pair?",
              "vizHint": "Pull socks in the dark and see how bad it can get.",
              "viz": "sockDrawer",
              "answerNumber": 3,
              "tolerance": 0,
              "placeholder": "how many socks?",
              "answerValue": "3",
              "explain": "Two socks can be one of each colour, so two is not enough. But with three socks and only two colours, two of them must share a colour. Three is enough, and always enough — however unlucky you are."
            },
            {
              "id": "birthday_23",
              "type": "choice",
              "topic": "probability",
              "prompt": "People walk into a room one at a time. At what point does it become more likely than not that two of them share a birthday?",
              "vizHint": "Drag the slider to change how many people are in the room.",
              "viz": "birthdayRoom",
              "choices": ["23 people", "57 people", "183 people", "366 people"],
              "answer": 0,
              "answerValue": "23",
              "explain": "You are not asking about one person matching you. You are asking about every pair in the room, and 23 people make 253 pairs. Each pair is unlikely on its own, but there are so many of them that by 23 the odds tip over a half — 50.7%."
            },
            {
              "id": "monty_hall",
              "type": "choice",
              "topic": "probability",
              "prompt": "Three doors, a prize behind one. You pick a door. The host, who knows where the prize is, opens a different door and shows it is empty, then offers you the swap. What should you do?",
              "vizHint": "Play it, or run two hundred games at once and compare.",
              "viz": "montyHall",
              "choices": ["Stay — it makes no difference", "Stay — staying is better", "Switch — it wins two times in three", "Switch — it wins every time"],
              "answer": 2,
              "answerValue": "switch, 2/3",
              "explain": "Your first pick is right one time in three. That never changes. So the prize is behind one of the other two doors two times in three — and the host has just told you which of those two it is not. Switching hands you both of the other doors at once. Two in three."
            },
            {
              "id": "coin_streak",
              "type": "truefalse",
              "topic": "probability",
              "prompt": "Flip a fair coin one hundred times.",
              "statement": "You are more likely than not to see a run of five or more in a row — five heads running, or five tails running.",
              "vizHint": "Run a hundred flips. The longest run is highlighted.",
              "viz": "longestRun",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, and not marginally: it happens about 97 times in 100. A run of five starting at any given flip is a 1-in-16 shot, but there are 96 places for one to start. Long streaks are what real randomness looks like — which is exactly why a made-up sequence, with its careful alternation, looks fake to a statistician."
            },
            {
              "id": "hh_vs_ht",
              "type": "choice",
              "topic": "probability",
              "prompt": "Flip a coin until you have just seen heads then heads. Start again and flip until you see heads then tails. Which wait is longer on average?",
              "vizHint": "Run the two races and watch the averages settle.",
              "viz": "hhVsHt",
              "choices": ["Waiting for heads-heads", "Waiting for heads-tails", "They are exactly the same", "It depends on the first flip"],
              "answer": 0,
              "answerValue": "heads-heads (6 flips vs 4)",
              "explain": "Both pairs are equally likely on any given two flips, but heads-heads can trip over itself. Get a head, then a tail, and you are back to nothing — the tail is no use as a start. Whereas when you are hunting heads-tails, a miss means you got another head, and you are still one step in. On average: six flips for heads-heads, four for heads-tails."
            }
          ]
        }
      ]
    },
    {
      "id": "u2",
      "index": 2,
      "title": "Numbers that lie",
      "subtitle": "Spread, samples, and the traps hiding inside honest data.",
      "colour": "#d29922",
      "free": false,
      "lessons": [
        {
          "id": "u2l1",
          "title": "Spread and samples",
          "questions": [
            {
              "id": "coin_spread",
              "type": "choice",
              "topic": "statistics",
              "prompt": "Flip a fair coin 1000 times. You almost certainly won't get exactly 500 heads. Typically, how far off will you be?",
              "vizHint": "Run it a few hundred times and watch where the results land.",
              "viz": "coinSpread",
              "choices": ["About 2", "About 16", "About 50", "About 160"],
              "answer": 1,
              "answerValue": "about 16 (sd = 15.8)",
              "explain": "The gap grows like the square root of the number of flips: half the square root of a thousand is about sixteen. Flip a hundred times as often and the raw gap only gets ten times bigger, not a hundred — which is exactly why the fraction of heads closes in on a half while the raw count drifts further from the middle."
            },
            {
              "id": "hospital_boys",
              "type": "choice",
              "topic": "statistics",
              "prompt": "Two hospitals. The big one delivers about 100 babies a day, the small one about 15. Over a year, which records more days where more than 60% of the babies born were boys?",
              "vizHint": "Run a year of births through both hospitals.",
              "viz": "hospitalBirths",
              "choices": ["The big hospital", "The small hospital", "Both about the same", "Neither — 60% never happens"],
              "answer": 1,
              "answerValue": "the small hospital",
              "explain": "Small samples swing wildly. Fifteen babies means nine boys is enough to cross 60%, and that happens often. A hundred babies would need sixty-one boys, and that many flips of a fair coin almost never land that lopsided. The bigger the sample, the harder it is to stray far from half — so extremes are a small-sample phenomenon."
            },
            {
              "id": "mean_vs_median",
              "type": "choice",
              "topic": "statistics",
              "prompt": "Nine people are in a room and you write down what each of them earns. Then a billionaire walks in. Which summary of the room barely moves?",
              "vizHint": "Drag the last salary as far to the right as you like.",
              "viz": "dragOutlier",
              "choices": ["The average (the mean)", "The middle value (the median)", "Both move the same amount", "Neither moves"],
              "answer": 1,
              "answerValue": "the median",
              "explain": "The average adds everything up and divides, so one huge number drags it anywhere you want. The middle value only cares about the order — the billionaire is just one more person standing at the end of the queue, and the person in the middle hardly shifts. That is why 'average income' and 'typical income' are different questions."
            },
            {
              "id": "order_likelihood",
              "type": "order",
              "topic": "probability",
              "prompt": "Flip a fair coin ten times. Put these outcomes in order, from the least likely to the most likely.",
              "orderPrompt": "Tap them in order — least likely first.",
              "vizHint": "The bars show how many ways each result can happen.",
              "viz": "binomialBars",
              "items": ["Exactly 10 heads", "Exactly 8 heads", "Exactly 6 heads", "Exactly 5 heads"],
              "answerValue": "10 < 8 < 6 < 5 heads",
              "explain": "Count the ways. Ten heads happens exactly one way. Eight heads, 45 ways. Six heads, 210. Five heads, 252 — the most of any single count. There are 1024 outcomes in all, so five heads happens about a quarter of the time, and ten heads once in 1024."
            }
          ]
        },
        {
          "id": "u2l2",
          "title": "Traps in the data",
          "questions": [
            {
              "id": "faulty_bolt",
              "type": "choice",
              "topic": "probability",
              "prompt": "A factory has two machines. Machine A makes 80 of every 100 bolts, and 1 in 100 of its bolts is faulty. Machine B makes the other 20, and 5 in 100 of its bolts is faulty. You pick up a faulty bolt. How likely is it that machine B made it?",
              "vizHint": "Tap to throw away every bolt that isn't faulty.",
              "viz": "bayesBolts",
              "choices": ["About 5%", "About 20%", "About 56%", "About 83%"],
              "answer": 2,
              "answerValue": "10/18 = 55.6%",
              "explain": "Take a thousand bolts. Machine A makes eight hundred of them and eight come out faulty. Machine B makes two hundred and ten come out faulty. That is eighteen faulty bolts in all, and ten of them are B's — a bit over half. B makes a quarter as many bolts but five times the faults, so it just edges ahead."
            },
            {
              "id": "base_rate_test",
              "type": "choice",
              "topic": "probability",
              "prompt": "A disease affects 1 person in 1000. A test catches 99% of people who have it, and wrongly flags only 1% of people who don't. Your test comes back positive. How likely is it that you have the disease?",
              "vizHint": "Tap to keep only the people who tested positive.",
              "viz": "screenDots",
              "choices": ["About 99%", "About 50%", "About 9%", "About 1%"],
              "answer": 2,
              "answerValue": "about 9%",
              "explain": "Line up a thousand people. One has it, and the test almost certainly catches them: that is 1 true positive. The other 999 are healthy, and 1% of them get flagged anyway: about 10 false positives. So around 11 people test positive and only one of them is ill — about 9%. A very accurate test can still be mostly wrong when the thing it looks for is rare."
            },
            {
              "id": "p_hacking",
              "type": "number",
              "topic": "statistics",
              "prompt": "You run 20 completely useless experiments. Each one has a 1 in 20 chance of throwing up an exciting-looking result purely by luck. On average, how many exciting results will you get?",
              "vizHint": "Re-run the twenty experiments and watch the false alarms.",
              "viz": "twentyTests",
              "answerNumber": 1,
              "tolerance": 0,
              "placeholder": "how many?",
              "answerValue": "1",
              "explain": "Twenty tries at 1 in 20 gives one expected hit. That is the whole problem with testing lots of things and reporting only the winner: the winner is exactly what you would expect from a pile of nothing. Publishing that one result, and quietly dropping the other nineteen, is how noise becomes a headline."
            },
            {
              "id": "survivorship",
              "type": "tap",
              "topic": "statistics",
              "prompt": "Bombers come back from a raid covered in bullet holes. Engineers map where every hole is. Tap the part of the plane you should add armour to.",
              "vizHint": "Tap a part of the plane. The dots are the holes counted on the planes that came home.",
              "viz": "planeArmour",
              "regions": [
                { "id": "wings", "label": "Wings" },
                { "id": "fuselage", "label": "Fuselage" },
                { "id": "tail", "label": "Tail" },
                { "id": "engines", "label": "Engines" }
              ],
              "answerRegion": "engines",
              "answerValue": "engines",
              "explain": "You are only looking at the planes that made it back. A hole in the wing clearly did not stop them. The engines are almost unmarked, and that is not because engines don't get hit — it is because the planes hit there never returned to be counted. Armour the part with no holes. This is survivorship bias, and Abraham Wald worked it out in 1943."
            }
          ]
        }
      ]
    },
    {
      "id": "u3",
      "index": 3,
      "title": "Size, shape and growth",
      "subtitle": "Everyday maths where the intuition is usually wrong.",
      "colour": "#a371f7",
      "free": false,
      "lessons": [
        {
          "id": "u3l1",
          "title": "Size and shape",
          "questions": [
            {
              "id": "rectangle_area",
              "type": "choice",
              "topic": "optimisation",
              "prompt": "You have 40 metres of fence and want to enclose the largest possible rectangle. Which shape gives the biggest area?",
              "vizHint": "Drag the slider and watch the area.",
              "viz": "rectangleArea",
              "choices": ["19 by 1", "15 by 5", "12 by 8", "10 by 10"],
              "answer": 3,
              "answerValue": "10 by 10, area 100",
              "explain": "Forty metres of fence means the width and the height always add to twenty. So the area is the width times twenty minus the width — a hill that peaks exactly in the middle. Ten by ten, one hundred square metres. For a fixed perimeter the square always wins."
            },
            {
              "id": "shear_area",
              "type": "choice",
              "topic": "linear_algebra",
              "prompt": "Push the top edge of a square sideways, keeping the top and bottom exactly as far apart as before — like sliding a deck of cards. What happens to the area?",
              "vizHint": "Drag the top edge as far as you like.",
              "viz": "shearSquare",
              "choices": ["It grows", "It shrinks", "It stays exactly the same", "It depends how far you push"],
              "answer": 2,
              "answerValue": "unchanged",
              "explain": "Area is base times height, and sliding the top sideways changes neither one. Every card in the deck keeps its own area; the pile just leans. Slide it a mile and the area is still the same. That is what it means for this transformation to have determinant one."
            },
            {
              "id": "pizza_size",
              "type": "choice",
              "topic": "geometry",
              "prompt": "One 12-inch pizza, or two 8-inch pizzas, for the same money. Which gives you more pizza?",
              "vizHint": "Drag the slider to resize the big pizza and compare the areas.",
              "viz": "pizzaCompare",
              "choices": ["The single 12-inch", "The two 8-inch", "They are the same", "It depends on the crust"],
              "answer": 0,
              "answerValue": "the 12-inch (113 vs 101 sq in)",
              "explain": "Pizza is sold by width but eaten by area, and area goes up with the square of the width. A 12-inch is 113 square inches. An 8-inch is only 50, so two of them come to 101. The single big one wins — and by more than it looks, because doubling the width would give you four times the pizza, not two."
            },
            {
              "id": "rope_earth",
              "type": "choice",
              "topic": "geometry",
              "prompt": "A rope is pulled tight all the way round the Earth's equator. You add just one extra metre of rope and lift it evenly off the ground everywhere. How high does it sit?",
              "vizHint": "Change the size of the planet. Watch the gap.",
              "viz": "ropeGap",
              "choices": ["Far too little to see", "About the width of a hair", "About 16 centimetres", "About 16 metres"],
              "answer": 2,
              "answerValue": "1/(2π) m ≈ 16 cm",
              "explain": "The circumference is 2π times the radius, so adding one metre of rope adds one over 2π to the radius — about 16 centimetres. And notice what is missing from that sentence: the size of the planet. Do it around a tennis ball and you get the same 16 centimetres."
            }
          ]
        },
        {
          "id": "u3l2",
          "title": "How things grow",
          "questions": [
            {
              "id": "doubling_paper",
              "type": "choice",
              "topic": "growth",
              "prompt": "A sheet of paper is a tenth of a millimetre thick. Imagine you could fold it in half 42 times. How thick would it be?",
              "vizHint": "Drag the number of folds and watch it pass the landmarks.",
              "viz": "paperFolds",
              "choices": ["About as tall as a person", "About as tall as Everest", "Roughly to the edge of the atmosphere", "Past the Moon"],
              "answer": 3,
              "answerValue": "440,000 km — past the Moon",
              "explain": "Each fold doubles it, so 42 folds is 2 to the power 42 — about four and a half million million sheets. That comes to 440,000 kilometres, and the Moon is 384,000 away. Doubling feels slow for the first thirty folds and then leaves the planet in the last ten. That is what exponential growth does to intuition."
            },
            {
              "id": "pond_half",
              "type": "number",
              "topic": "growth",
              "prompt": "Lily pads on a pond double in area every day. On day 30 the pond is completely covered. On which day was it half covered?",
              "vizHint": "Step through the days and watch the pond.",
              "viz": "pondFill",
              "answerNumber": 29,
              "tolerance": 0,
              "placeholder": "which day?",
              "answerValue": "29",
              "explain": "Run the film backwards: halving each day, the day before full is half. Day 29. And on day 25 the pond looks fine — barely a twentieth covered — which is precisely the trap. Anything doubling spends almost all of its life looking like nothing much."
            },
            {
              "id": "compound_double",
              "type": "number",
              "topic": "growth",
              "prompt": "Money in an account grows by 6% each year, and the growth compounds. Roughly how many years until it has doubled? Give the nearest whole year.",
              "vizHint": "Change the rate and watch how long doubling takes.",
              "viz": "compoundCurve",
              "answerNumber": 12,
              "tolerance": 0.5,
              "placeholder": "years",
              "answerValue": "12 years (11.9 exactly)",
              "explain": "Twelve years — 11.9 to be exact. The quick way is the rule of 70: divide 70 by the percentage rate. Seventy over six is a bit under twelve. It works because doubling takes about 0.69 divided by the growth rate, and 0.69 is the natural logarithm of two."
            },
            {
              "id": "random_walk",
              "type": "choice",
              "topic": "probability",
              "prompt": "Someone takes 100 steps, each one a metre, each one in a completely random direction — forwards or backwards along a line. Typically, how far from the start do they end up?",
              "vizHint": "Run the walk again and again and watch where it lands.",
              "viz": "randomWalk",
              "choices": ["About 0 metres — the steps cancel", "About 10 metres", "About 50 metres", "About 100 metres"],
              "answer": 1,
              "answerValue": "about 10 m (sqrt of 100)",
              "explain": "On average you end up at the start, but that is not the same as ending up near it. The typical distance is the square root of the number of steps: the square root of 100 is 10. Take 10,000 steps and you drift 100 away, not 10,000. Random drift grows, but slowly — as a square root."
            }
          ]
        }
      ]
    },
    {
      "id": "u4",
      "index": 4,
      "title": "Bets and machines",
      "subtitle": "Sizing a bet, reading a model, knowing when to stop.",
      "colour": "#f78166",
      "free": false,
      "lessons": [
        {
          "id": "u4l1",
          "title": "Reading the odds",
          "questions": [
            {
              "id": "twenty_questions",
              "type": "choice",
              "topic": "information_theory",
              "prompt": "I am thinking of a whole number from 1 to 1000. You may only ask yes-or-no questions. How many do you need to be sure of it, in the worst case?",
              "vizHint": "Play it — halve the range and count your questions.",
              "viz": "binarySearch",
              "choices": ["10", "31", "100", "500"],
              "answer": 0,
              "answerValue": "10",
              "explain": "Each yes or no can at best halve what is left: a thousand, five hundred, two hundred and fifty, and so on. Ten halvings take a thousand down to one. And you cannot do it in nine, because nine answers only have five hundred and twelve possible patterns — fewer patterns than numbers, so two numbers would have to share one, and you could not tell them apart."
            },
            {
              "id": "kelly_fraction",
              "type": "number",
              "topic": "betting",
              "prompt": "A coin lands heads 60% of the time. You may bet any share of your money on heads, over and over: win and you double the stake, lose and it is gone. What percentage of your money should you stake each time to grow fastest in the long run?",
              "vizHint": "Drag the stake and watch a thousand simulated fortunes.",
              "viz": "kellyGrowth",
              "answerNumber": 20,
              "tolerance": 1,
              "placeholder": "percent of your money",
              "answerValue": "20%",
              "explain": "Twenty percent. Betting everything ruins you the first time you lose. Betting nothing goes nowhere. The stake that grows money fastest is the edge itself — you win 60 and lose 40, so the edge is 20 points, and that is the fraction. This is the Kelly criterion, and going past it makes you poorer, not richer."
            },
            {
              "id": "dice_reroll",
              "type": "number",
              "topic": "expectation",
              "prompt": "Roll a fair die and you are paid that many pounds. Before you see it you are offered one chance to reroll and take whatever the second roll gives. Playing perfectly, what is the game worth on average? Give it in pounds, to the penny.",
              "vizHint": "Slide the rule for when to reroll and watch the value.",
              "viz": "rerollThreshold",
              "answerNumber": 4.25,
              "tolerance": 0.01,
              "placeholder": "pounds, e.g. 3.50",
              "answerValue": "4.25",
              "explain": "A fresh roll is worth 3.5 on average, so reroll anything below that — a 1, 2 or 3 — and keep a 4, 5 or 6. Half the time you keep an average of 5, half the time you reroll and get 3.5. Half of 5 plus half of 3.5 is 4.25. Knowing when to walk away is worth 0.75 here."
            },
            {
              "id": "overfit_degree",
              "type": "choice",
              "topic": "machine_learning",
              "prompt": "Ten measurements, and three curves fitted through them. The wiggliest one passes through every single point exactly. Which curve will do best on new measurements it has never seen?",
              "vizHint": "Drag the wiggliness. Blue dots are what it learned from, gold dots are new.",
              "viz": "polyFit",
              "choices": ["The straight line", "The gentle curve", "The wiggly one through every point", "Whichever fits the ten points best"],
              "answer": 1,
              "answerValue": "the gentle curve (degree 3)",
              "explain": "The wiggly curve has not learned the pattern, it has memorised the noise — nudge the measurements slightly and it lurches. On new points it is the worst of the three. The straight line is too rigid to follow the real shape. The gentle curve sits between them, and its error on unseen points is the lowest. Fitting your data perfectly is a warning sign, not a goal."
            },
            {
              "id": "gradient_valley",
              "type": "tap",
              "topic": "machine_learning",
              "prompt": "A machine learns by always stepping downhill from where it is standing. It starts at the arrow. Tap the valley it will end up in.",
              "vizHint": "Tap a valley. You can also drop the ball and watch it roll.",
              "viz": "lossValleys",
              "regions": [
                { "id": "left", "label": "Left valley" },
                { "id": "middle", "label": "Middle valley" },
                { "id": "right", "label": "Right valley" }
              ],
              "answerRegion": "left",
              "answerValue": "left",
              "explain": "The left one — even though the middle valley is far deeper. Stepping downhill only ever uses the ground under your feet, so the ball rolls into the first valley it reaches and then stops: every direction from there is up. It has no way of knowing there is something better two hills away. That is a local minimum, and where you start decides where you finish."
            }
          ]
        }
      ]
    }
  ],
  "libraries": [
    {
      "id": "jane_street",
      "name": "Jane Street set",
      "blurb": "40 questions in the style of the Jane Street interview: expectation, market making, mental maths under time.",
      "questionCount": 40,
      "priceUsd": 19,
      "status": "locked"
    },
    {
      "id": "optiver_speed",
      "name": "Optiver speed round",
      "blurb": "The 80-in-8 arithmetic drill, plus the follow-up questions traders actually ask.",
      "questionCount": 30,
      "priceUsd": 19,
      "status": "soon"
    }
  ],
  "vizData": {
    "survivorshipHoles": { "wings": 42, "fuselage": 35, "tail": 28, "engines": 6 },
    "lossLandscape": {
      "start": -6.2,
      "wells": [
        { "id": "left", "centre": -4, "depth": 0.55, "width": 1.6, "from": -7, "to": -2.31 },
        { "id": "middle", "centre": 0, "depth": 1.0, "width": 1.6, "from": -2.31, "to": 2.22 },
        { "id": "right", "centre": 4, "depth": 0.7, "width": 1.6, "from": 2.22, "to": 7 }
      ],
      "bowl": 0.02
    },
    "polyFit": {
      "train": [[-1, 0.1744], [-0.78, 0.482], [-0.55, 0.4327], [-0.33, 0.2991], [-0.11, 0.0268], [0.11, -0.1411], [0.33, -0.2195], [0.55, -0.4128], [0.78, -0.3272], [1, -0.1751]],
      "test": [[-0.9, 0.3734], [-0.66, 0.4858], [-0.44, 0.2407], [-0.2, 0.2983], [0.2, -0.1622], [0.44, -0.3575], [0.66, -0.6364], [0.9, -0.5083]],
      "degrees": [1, 3, 9],
      "bestDegree": 3
    },
    "salaries": [21, 24, 26, 28, 31, 33, 36, 40, 47]
  }
};
