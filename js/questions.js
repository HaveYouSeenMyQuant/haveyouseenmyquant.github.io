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
      "subtitle": "What can happen, and how often.",
      "colour": "#58a6ff",
      "free": true,
      "lessons": [
        {
          "id": "u1l0",
          "title": "Your first win",
          "questions": [
            {
              "id": "two_coins_pair",
              "type": "choice",
              "topic": "probability",
              "prompt": "Flip two coins. Which is more likely: two heads, or one head and one tail?",
              "vizHint": "Two coins land four ways. Tap a result to light them up.",
              "viz": "twoCoinsGrid",
              "choices": ["Two heads", "One of each", "They are equally likely"],
              "answer": 1,
              "answerValue": "one of each (2 ways in 4)",
              "explain": "Two coins can land four ways, not three: heads-heads, heads-tails, tails-heads, tails-tails. One of each happens two of those four ways, twice as often as two heads. The trap is thinking of the coins as a pile rather than as a first coin and a second one."
            },
            {
              "id": "die_even_or_high",
              "type": "choice",
              "topic": "counting",
              "prompt": "Roll one ordinary die. Which is more likely: an even number, or a number bigger than four?",
              "vizHint": "Tap a description. The faces that match light up.",
              "viz": "dieEvenOrHigh",
              "choices": ["An even number", "A number bigger than four", "They are equally likely"],
              "answer": 0,
              "answerValue": "even (3 faces beat 2)",
              "explain": "Count the faces. Even gives you 2, 4 and 6 — three of the six. Bigger than four gives you only 5 and 6 — two of the six. Almost every probability question you will ever meet is this in disguise: count what wins, count what could happen, compare."
            },
            {
              "id": "best_spinner",
              "type": "tap",
              "topic": "probability",
              "prompt": "Three spinners, each with some gold on it. Tap the one that lands on gold most often.",
              "vizHint": "Tap a spinner. It tells you how much of it is gold.",
              "viz": "spinnerPick",
              "regions": [
                { "id": "left", "label": "Left" },
                { "id": "middle", "label": "Middle" },
                { "id": "right", "label": "Right" }
              ],
              "answerRegion": "middle",
              "answerValue": "middle",
              "explain": "The middle one: five of its twelve wedges are gold, against three and two on the others. Chance is just the share of the circle painted gold, so the biggest gold slice wins however the wedges are arranged. Spread the same gold into five thin slivers and nothing changes."
            },
            {
              "id": "streak_next_flip",
              "type": "choice",
              "topic": "probability",
              "prompt": "A fair coin has just landed heads five times in a row. What is the chance the next flip is heads?",
              "vizHint": "Run the real experiment: flip until five heads land in a row, then watch the next flip.",
              "viz": "afterFiveHeads",
              "choices": ["Much less than 1 in 2", "1 in 2", "Much more than 1 in 2"],
              "answer": 1,
              "answerValue": "1 in 2",
              "explain": "Still one in two. The coin has no memory and no sense of fairness owed — it cannot know what it just did. Five heads in a row is unlikely before you start, but once it has happened it is history, and history does not lean on the next flip. Betting against a streak is the oldest way to lose money there is."
            },
            {
              "id": "two_spins_gold",
              "type": "truefalse",
              "topic": "probability",
              "prompt": "A spinner is a quarter gold. You spin it twice.",
              "statement": "You are more likely than not to hit gold at least once.",
              "vizHint": "Spin the pair a few thousand times and watch where it settles.",
              "viz": "twoSpinsGold",
              "answerBool": false,
              "answerValue": "false",
              "explain": "A quarter plus a quarter looks like a half, but chances do not add like that — the two spins can both land on gold, and that outcome gets counted twice. Ask instead how often you miss both times: three quarters of three quarters, which is nine sixteenths. So gold appears seven times in sixteen, a shade under half."
            }
          ]
        },
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
              "choices": [
                "Stay — it makes no difference",
                "Stay — staying is better",
                "Switch — it wins two times in three",
                "Switch — it wins every time"
              ],
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
              "choices": [
                "Waiting for heads-heads",
                "Waiting for heads-tails",
                "They are exactly the same",
                "It depends on the first flip"
              ],
              "answer": 0,
              "answerValue": "heads-heads (6 flips vs 4)",
              "explain": "Both pairs are equally likely on any given two flips, but heads-heads can trip over itself. Get a head, then a tail, and you are back to nothing — the tail is no use as a start. Whereas when you are hunting heads-tails, a miss means you got another head, and you are still one step in. On average: six flips for heads-heads, four for heads-tails."
            }
          ]
        }
      ]
    },
    {
      "id": "u5",
      "index": 2,
      "title": "Counting without counting",
      "subtitle": "How many, without listing them all.",
      "colour": "#3fb950",
      "free": true,
      "lessons": [
        {
          "id": "u5l1",
          "title": "How many ways",
          "questions": [
            {
              "id": "handshakes_room",
              "type": "number",
              "topic": "counting",
              "prompt": "Ten people are in a room and every pair shakes hands exactly once. How many handshakes happen?",
              "vizHint": "Drag the number of people. Each lit square is one handshake.",
              "viz": "handshakeGrid",
              "answerNumber": 45,
              "tolerance": 0,
              "placeholder": "how many handshakes?",
              "answerValue": "45",
              "explain": "Each of the ten people shakes nine other hands, which sounds like ninety. But every handshake has just been counted twice, once from each side, so it is ninety halved: forty-five. The grid says the same thing — the diagonal is nobody shaking their own hand, and the two triangles either side are the same handshakes seen from both ends."
            },
            {
              "id": "queue_orders",
              "type": "choice",
              "topic": "counting",
              "prompt": "Five friends line up at a bus stop. How many different orders could the queue be in?",
              "vizHint": "Shuffle the queue over and over and watch how many different orders turn up.",
              "viz": "queueShuffles",
              "choices": ["20", "25", "120", "3125"],
              "answer": 2,
              "answerValue": "120",
              "explain": "Five people could go first, then four are left for second, then three, then two, then one. Multiply those and you get 120. Shuffle all afternoon and you will never find a 121st order. And it does not creep up: add one more friend and you are at 720."
            },
            {
              "id": "pizza_toppings",
              "type": "number",
              "topic": "counting",
              "prompt": "A pizza place lists ten toppings and you may take any of them, or none at all. How many different pizzas can you order?",
              "vizHint": "Drag the size of the menu. Every dot is one possible pizza.",
              "viz": "pizzaMenu",
              "answerNumber": 1024,
              "tolerance": 0,
              "placeholder": "how many pizzas?",
              "answerValue": "1024",
              "explain": "Go through the toppings one at a time. For each one you say yes or no, and each of those choices doubles the number of pizzas you could end up with. One topping, two pizzas. Two toppings, four. Ten toppings is two doubled ten times over — 1024, counting the plain one with nothing on it. Small menus hide enormous numbers."
            },
            {
              "id": "count_order_matters",
              "type": "order",
              "topic": "counting",
              "prompt": "Four different ways of picking people. Put them in order, from the fewest possibilities to the most.",
              "orderPrompt": "Tap them in order — fewest ways first.",
              "vizHint": "Tap one and every single possibility is listed out for you.",
              "viz": "waysChips",
              "items": [
                "Pick 2 of 5 friends to share a taxi",
                "Line 4 people up in a queue",
                "Hand gold, silver and bronze to 5 runners",
                "Make a 2-digit code from the digits 0 to 9"
              ],
              "answerValue": "10 < 24 < 60 < 100",
              "explain": "Two of five friends is only ten, because a taxi does not care who was chosen first. Medals do care — gold then silver is a different result from silver then gold — so five runners give sixty. Lining four people up is every order of everybody, 24. And a two-digit code is ten times ten, because digits are allowed to repeat. Does order matter, and can things repeat: that is nearly all of counting."
            }
          ]
        },
        {
          "id": "u5l2",
          "title": "Counting the clever way",
          "questions": [
            {
              "id": "grid_paths",
              "type": "number",
              "topic": "counting",
              "prompt": "You walk across a city grid to the corner three blocks east and three blocks north, never doubling back. How many different routes are there?",
              "vizHint": "Walk a route, or two hundred, and see how many different ones exist.",
              "viz": "gridRoutes",
              "answerNumber": 20,
              "tolerance": 0,
              "placeholder": "how many routes?",
              "answerValue": "20",
              "explain": "Every route is six moves: three easts and three norths in some order. So the only thing you are choosing is which three of the six moves are the easts, and there are twenty ways to do that. You can also read it off the map — write on each corner how many ways there are to reach it, adding the number to the left and the number below, and the far corner comes out 20."
            },
            {
              "id": "chessboard_squares",
              "type": "number",
              "topic": "counting",
              "prompt": "A chessboard is eight squares by eight. Counting the big ones as well as the little ones, how many squares are there on it altogether?",
              "vizHint": "Tap a size. Every square of that size lights up and gets counted.",
              "viz": "boardSquares",
              "answerNumber": 204,
              "tolerance": 0,
              "placeholder": "how many squares?",
              "answerValue": "204",
              "explain": "The 64 little ones are only the start. A two-by-two square can sit in 49 places, a three-by-three in 36, and so on down to the single eight-by-eight, which is the whole board. Add 64, 49, 36, 25, 16, 9, 4 and 1 and you get 204. Every count is a square number, because the top-left corner of each square can sit anywhere in a smaller grid of its own."
            },
            {
              "id": "at_least_one_six",
              "type": "choice",
              "topic": "probability",
              "prompt": "Throw four ordinary dice at once. How often will at least one of them show a six?",
              "vizHint": "Throw the four dice as many times as you like and watch the share settle.",
              "viz": "sixInFour",
              "choices": ["About 17%", "About 33%", "About 52%", "About 67%"],
              "answer": 2,
              "answerValue": "about 52%",
              "explain": "Count the failures instead. One die misses a six five times in six. For all four to miss you need five-sixths of five-sixths of five-sixths of five-sixths, which is about 48 throws in a hundred. So at least one six turns up the other 52. Four dice do not give you four-sixths of a chance — and 'at least one' is nearly always easier counted backwards."
            },
            {
              "id": "pigeonhole_hair",
              "type": "truefalse",
              "topic": "counting",
              "prompt": "About nine million people live in London, and nobody has more than about 150,000 hairs on their head.",
              "statement": "Somewhere in London there are certainly two people with exactly the same number of hairs on their head.",
              "vizHint": "Drop people into boxes one at a time and watch for the first box that doubles up.",
              "viz": "pigeonholeDrop",
              "answerBool": true,
              "answerValue": "true",
              "explain": "Certainly — and nobody has to count a single head. There are only about 150,000 possible hair counts, and nine million Londoners have to fit into them. Once you have more people than boxes, some box must hold two. In fact some box here holds at least sixty. This is the pigeonhole principle, and it gives you a certainty rather than a likelihood."
            },
            {
              "id": "seating_together",
              "type": "choice",
              "topic": "counting",
              "prompt": "Five friends sit in a row of five seats, but two of them insist on sitting next to each other. How many seating orders are there?",
              "vizHint": "Shuffle the row and watch how often the two land side by side.",
              "viz": "seatShuffles",
              "choices": ["24", "48", "60", "96"],
              "answer": 1,
              "answerValue": "48",
              "explain": "Tie the two of them together and treat the pair as one person. That leaves four things to put in a row, which is 24 ways, and the tied pair can be either way round, so double it: 48. Out of the 120 orders for five people, 48 have them side by side — two in every five, which is far more than most people expect."
            }
          ]
        },
        {
          "id": "u5l3",
          "title": "Do not count the same thing twice",
          "questions": [
            {
              "id": "banana_words",
              "type": "number",
              "topic": "counting",
              "prompt": "The letters in BANANA are shuffled. How many different-looking strings can you make?",
              "vizHint": "Shuffle the six tiles. The same-looking string can be made by many hidden swaps.",
              "viz": "bananaShuffles",
              "answerNumber": 60,
              "tolerance": 0,
              "placeholder": "how many strings?",
              "answerValue": "60",
              "explain": "Six different tiles would give 720 orders. But BANANA has three As and two Ns, and swapping those matching letters does not make a new-looking string. Each visible string has been counted twelve times: six swaps of the As, and two swaps of the Ns. So 720 shrinks to 60. The trap is counting labels the eye cannot see."
            },
            {
              "id": "round_table",
              "type": "choice",
              "topic": "counting",
              "prompt": "Six friends sit around a round table. Turning the whole table does not make a new seating order. How many different orders are there?",
              "vizHint": "Spin the table and shuffle it. A turn changes the seats, but not the circle.",
              "viz": "roundTableSpin",
              "choices": ["30", "120", "720", "5040"],
              "answer": 1,
              "answerValue": "120",
              "explain": "In a row there would be 720 orders. Around a round table, the same circle can be turned into six different seat numbers, so the row count has counted each real seating six times. Divide by six and you get 120. The trap is treating the chair labels as if they matter when only the neighbours do."
            },
            {
              "id": "checkpoint_paths",
              "type": "number",
              "topic": "counting",
              "prompt": "On a four by four city grid, you walk from the bottom-left corner to the top-right, only east or north. Your route must pass through the corner two blocks east and one block north from the start. How many routes can do that?",
              "vizHint": "Walk routes through the gold corner. The trip is two smaller trips stuck together.",
              "viz": "checkpointRoutes",
              "answerNumber": 30,
              "tolerance": 0,
              "placeholder": "how many routes?",
              "answerValue": "30",
              "explain": "To reach the gold corner you need three moves: two east and one north. That can happen three ways. From there to the finish you need five more moves: two east and three north. That can happen ten ways. Each first half can be glued to each second half, so it is three times ten: 30. The trap is adding the two counts instead of pairing them up."
            },
            {
              "id": "grid_rectangles",
              "type": "choice",
              "topic": "counting",
              "prompt": "A window is split into a grid four little squares wide and three little squares high. Counting every rectangle you can trace on the grid, how many rectangles are there?",
              "vizHint": "Pick two vertical grid lines and two horizontal grid lines. They frame one rectangle.",
              "viz": "rectanglePicker",
              "choices": ["12", "20", "60", "120"],
              "answer": 2,
              "answerValue": "60",
              "explain": "A rectangle is fixed by its left and right grid lines, and its bottom and top grid lines. There are five vertical grid lines, so ten ways to choose the two sides. There are four horizontal grid lines, so six ways to choose the top and bottom. Ten times six is 60. The trap is counting only the twelve little panes, or only the twenty squares."
            },
            {
              "id": "three_pairings",
              "type": "number",
              "topic": "counting",
              "prompt": "Six friends split into three pairs for a game. The pairs are not named, and the order inside a pair does not matter. How many different pairings are possible?",
              "vizHint": "Pair the six friends again and again. Swapping the pairs around does not make a new split.",
              "viz": "pairingSplits",
              "answerNumber": 15,
              "tolerance": 0,
              "placeholder": "how many pairings?",
              "answerValue": "15",
              "explain": "Pick a partner for the first person: five choices. Of the four people left, pick a partner for the next unpaired person: three choices. The final two are forced. Five times three is 15. The trap is lining everyone up first, then forgetting that pair order and pair names were never part of the question."
            }
          ]
        }
      ]
    },
    {
      "id": "u2",
      "index": 3,
      "title": "Numbers that lie",
      "subtitle": "Traps hiding inside honest data.",
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
              "choices": [
                "The big hospital",
                "The small hospital",
                "Both about the same",
                "Neither — 60% never happens"
              ],
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
              "choices": [
                "The average (the mean)",
                "The middle value (the median)",
                "Both move the same amount",
                "Neither moves"
              ],
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
      "id": "u6",
      "index": 4,
      "title": "What it's worth",
      "subtitle": "The price of a bet, before you take it.",
      "colour": "#e3b341",
      "free": true,
      "lessons": [
        {
          "id": "u6l1",
          "title": "What a game is worth",
          "questions": [
            {
              "id": "coin_game_value",
              "type": "number",
              "topic": "expectation",
              "prompt": "A game: flip a coin, win £10 for heads, pay £6 for tails. Played over and over, how much do you make per flip on average, in pounds?",
              "vizHint": "Flip it a few hundred times and watch the average per flip settle.",
              "viz": "coinGameFlips",
              "answerNumber": 2,
              "tolerance": 0.01,
              "placeholder": "pounds, e.g. 1.50",
              "answerValue": "£2 a flip",
              "explain": "Half the time you are up ten, half the time you are down six, and ten and minus six average out to two. Two pounds a flip is a number you will never actually see on a flip — you win ten or you lose six — but it is what a long evening comes to. That average is the only honest way to price a bet you can take many times."
            },
            {
              "id": "value_order",
              "type": "order",
              "topic": "expectation",
              "prompt": "Four games, all free to play. Put them in order, from the one worth least on average to the one worth most.",
              "orderPrompt": "Tap them in order — worst value first.",
              "vizHint": "Tap a game to see every outcome it has, and what it is worth a go.",
              "viz": "betChips",
              "items": [
                "A die roll that pays £12 for a six",
                "A coin flip that pays £6 for heads",
                "One card from a pack: £52 for an ace",
                "A five-slice spinner: £30 for the gold slice"
              ],
              "answerValue": "£2 < £3 < £4 < £6",
              "explain": "Each one is the chance of winning multiplied by the prize. A six comes up one throw in six, so twelve pounds is worth two. Heads is one flip in two, so six pounds is worth three. An ace is four cards in fifty-two, one in thirteen, so fifty-two pounds is worth four. And one slice in five of thirty pounds is six. The biggest prize on the list makes only the third best game."
            },
            {
              "id": "raffle_ticket",
              "type": "number",
              "topic": "expectation",
              "prompt": "A raffle sells 500 tickets and has one prize of £600. Forget what a ticket costs — what is a ticket worth on average, in pounds?",
              "vizHint": "Drag the number of tickets sold and watch what one of them is worth.",
              "viz": "raffleDial",
              "answerNumber": 1.2,
              "tolerance": 0.01,
              "placeholder": "pounds, e.g. 1.50",
              "answerValue": "£1.20",
              "explain": "One ticket in five hundred wins six hundred pounds, so a ticket returns six hundred divided by five hundred: one pound twenty. If it sells for two pounds you are handing over eighty pence each time, and the raffle keeps four hundred pounds of the thousand it takes. Every lottery, raffle and fruit machine lives in exactly that gap."
            },
            {
              "id": "fair_price_stall",
              "type": "tap",
              "topic": "expectation",
              "prompt": "A stall lets you roll two dice and pays £20 if they total seven. Tap the highest price at which the game is still worth playing.",
              "vizHint": "The dice keep rolling and the sevens are counted. Tap a price tag.",
              "viz": "stallDice",
              "regions": [
                { "id": "p2", "label": "£2" },
                { "id": "p3", "label": "£3" },
                { "id": "p4", "label": "£4" },
                { "id": "p5", "label": "£5" }
              ],
              "answerRegion": "p3",
              "answerValue": "£3",
              "explain": "Seven comes up six times in thirty-six throws — one in six — so a twenty-pound prize is worth twenty divided by six, three pounds thirty-three, every roll. Pay three and you make about thirty pence a go. Pay four and you lose about sixty-seven pence a go, however lucky you feel on the day. The size of the prize does not set the price; the average does."
            },
            {
              "id": "insurance_fair",
              "type": "truefalse",
              "topic": "expectation",
              "prompt": "Phone cover costs £6 a month. A replacement phone costs £500, and about one customer in 25 breaks theirs in a year.",
              "statement": "If the cover were priced at exactly what it pays out on average, it would cost under £2 a month.",
              "vizHint": "Run a year for thousands of customers and see what the insurer pays out each.",
              "viz": "insuranceYears",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True. In a year the insurer pays five hundred pounds to one customer in twenty-five, which is twenty pounds each on average — one pound sixty-seven a month. It charges six, more than three times as much. That gap is not simply a swindle: it covers their costs and buys you the certainty of never facing a five-hundred-pound bill at once. But it is worth knowing which side of the average you are standing on."
            }
          ]
        },
        {
          "id": "u6l2",
          "title": "Waiting and collecting",
          "questions": [
            {
              "id": "rolls_until_six",
              "type": "number",
              "topic": "expectation",
              "prompt": "You roll a die over and over until a six comes up. On average, how many rolls does that take?",
              "vizHint": "Run the wait a few hundred times and watch the average settle.",
              "viz": "rollsToSix",
              "answerNumber": 6,
              "tolerance": 0,
              "placeholder": "how many rolls?",
              "answerValue": "6",
              "explain": "Six. A six comes up one roll in six, and the average wait is always one divided by the chance. But 'six on average' hides a lot of drama: one time in six you get it on the very first roll, and about one time in nine you are still rolling after twelve. The die has no memory, so a long dry spell never makes a six more due."
            },
            {
              "id": "sticker_album",
              "type": "number",
              "topic": "expectation",
              "prompt": "An album has 50 different stickers and every pack holds one at random. On average, how many packs must you buy to complete it?",
              "vizHint": "Fill the album again and again and watch how many packs it takes.",
              "viz": "stickerPacks",
              "answerNumber": 225,
              "tolerance": 15,
              "placeholder": "how many packs?",
              "answerValue": "about 225 packs",
              "explain": "About 225 — four and a half packs for every sticker in the album. The start is easy, because almost any pack is new. The end is brutal: when you are missing only one, each pack has a one in fifty chance of being it, so that final sticker takes fifty packs on its own. Nearly two thirds of everything you buy goes on the last ten stickers."
            },
            {
              "id": "bus_wait",
              "type": "truefalse",
              "topic": "expectation",
              "prompt": "Buses on a route bunch up: half the gaps between them are 5 minutes and half are 15, so the average gap is 10 minutes. You turn up without checking the timetable.",
              "statement": "Your average wait is longer than five minutes — longer than half the average gap.",
              "vizHint": "Turn up at random times over and over and watch your average wait.",
              "viz": "busArrivals",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True: you wait six and a quarter minutes on average, not five. You are far more likely to arrive during a long gap than a short one, because the long gaps fill three quarters of the day even though they are only half of the gaps. The same trick fools every survey done on the spot — ask people on a bus how crowded their bus is and the crowded ones have more people to ask."
            },
            {
              "id": "hat_check",
              "type": "choice",
              "topic": "expectation",
              "prompt": "Thirty people leave their hats at a party and the hats are handed back completely at random. On average, how many people get their own hat back?",
              "vizHint": "Run the hand-back with 5, 12 and 30 people and compare the averages.",
              "viz": "hatRace",
              "choices": [
                "None — with thirty hats it almost never happens",
                "Exactly one",
                "About three",
                "About fifteen"
              ],
              "answer": 1,
              "answerValue": "exactly one",
              "explain": "Exactly one, on average — and it makes no difference whether there are thirty people or thirty thousand. Take the people one at a time: with thirty hats flying about, each person has a one in thirty chance of getting their own, and thirty people times one thirtieth is one. More people means more chances, but each chance is rarer, and the two cancel out perfectly."
            }
          ]
        }
      ]
    },
    {
      "id": "u3",
      "index": 5,
      "title": "Size, shape and growth",
      "subtitle": "Everyday maths, wrong intuitions.",
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
              "choices": [
                "Far too little to see",
                "About the width of a hair",
                "About 16 centimetres",
                "About 16 metres"
              ],
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
              "choices": [
                "About as tall as a person",
                "About as tall as Everest",
                "Roughly to the edge of the atmosphere",
                "Past the Moon"
              ],
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
              "choices": [
                "About 0 metres — the steps cancel",
                "About 10 metres",
                "About 50 metres",
                "About 100 metres"
              ],
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
      "index": 6,
      "title": "Bets and machines",
      "subtitle": "Size the bet. Know when to stop.",
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
              "choices": [
                "The straight line",
                "The gentle curve",
                "The wiggly one through every point",
                "Whichever fits the ten points best"
              ],
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
    },
    {
      "id": "u7",
      "index": 7,
      "title": "Given that\u2026",
      "subtitle": "What you just learned changes what is likely.",
      "colour": "#db61a2",
      "free": false,
      "lessons": [
        {
          "id": "u7l1",
          "title": "What you were told",
          "questions": [
                {
              "id": "two_aces_news",
              "type": "choice",
              "topic": "probability",
              "prompt": "Two cards are dealt from a shuffled deck. Which piece of news leaves a better chance that both of them are aces?",
              "vizHint": "Run both kinds of deal side by side and watch how often two aces turn up.",
              "viz": "aceNews",
              "choices": [
                "Hearing the first card is an ace",
                "Hearing at least one of them is an ace",
                "The two are worth exactly the same",
                "Neither one tells you anything"
              ],
              "answer": 0,
              "answerValue": "the first card is an ace (1 in 17, against 1 in 33)",
              "explain": "Naming the first card pins down a particular card, so the other one only has to be one of the three aces left among fifty-one — about one in seventeen. 'At least one is an ace' names nothing, and it lets in every hand carrying a single ace, which is the vast majority of them: one in thirty-three. Same word, twice the odds, because one version says which card it is talking about."
            },
                {
              "id": "taxi_witness",
              "type": "choice",
              "topic": "probability",
              "prompt": "In a town where 85 of every 100 cabs are green and the rest are blue, a witness who gets the colour right 8 times in 10 says the cab in the crash was blue. How likely is it that the cab really was blue?",
              "vizHint": "Send a witness past a street of cabs, then keep only the ones he called blue.",
              "viz": "taxiWitness",
              "choices": [
                "About 80%",
                "About 60%",
                "About 41%",
                "About 15%"
              ],
              "answer": 2,
              "answerValue": "about 41%",
              "explain": "Take a hundred cabs. Fifteen are blue and he correctly calls twelve of them blue. Eighty-five are green and he wrongly calls seventeen of those blue as well. So twenty-nine cabs get called blue and only twelve of them are — about 41%, less than a coin flip. When one thing is much rarer than another, the mistakes made about the common thing can outnumber the sightings of the rare one."
            },
                {
              "id": "clumsy_host",
              "type": "number",
              "topic": "probability",
              "prompt": "Three doors, one prize. You pick a door, and a host who has forgotten where the prize is opens another door at random — it happens to be empty. Out of 100 games like this, how many would switching win?",
              "vizHint": "Play it out. The games where the host accidentally opens the prize are thrown away.",
              "viz": "clumsyHost",
              "answerNumber": 50,
              "tolerance": 2,
              "placeholder": "out of 100",
              "answerValue": "50",
              "explain": "Fifty — a coin flip, not the famous two in three. A host who knows where the prize is tells you something every time he chooses; a host who has forgotten tells you nothing. Half the games where you had picked wrongly end with him opening the prize by accident, and those games are gone. Among the games that survive, the two closed doors are level. Same door open, same empty room, different odds — because what matters is how the news reached you."
            },
                {
              "id": "envelope_swap",
              "type": "truefalse",
              "topic": "probability",
              "prompt": "Two sealed envelopes, one holding exactly twice as much money as the other. You take one, and before opening it you are offered the swap.",
              "statement": "Swapping is worth taking: on average you come away with more than you are holding.",
              "vizHint": "Swap a few hundred times and watch where the gains and losses pile up.",
              "viz": "envelopeSwap",
              "answerBool": false,
              "answerValue": "false",
              "explain": "Swapping gains nothing, and it cannot: the two envelopes were never told apart, so there is nothing to prefer. The tempting sum says whatever you hold, the other envelope is double it half the time and half of it the other half, which averages a quarter more. But that quietly treats your envelope as a known amount and the other as a gamble, when both are the same gamble. And look where the argument leads — having swapped, it tells you to swap back."
            },
                {
              "id": "boy_weekday",
              "type": "choice",
              "topic": "probability",
              "prompt": "A woman tells you she has two children, and that one of them is a boy born on a weekday. What is the chance that both of her children are boys?",
              "vizHint": "Every equally likely pair of children is a square. Choose what you are told and watch the squares go out.",
              "viz": "boyWeekdayGrid",
              "choices": [
                "1 in 3 — the day is useless",
                "A bit under 4 in 10",
                "1 in 2",
                "9 in 10"
              ],
              "answer": 1,
              "answerValue": "45 in 115 — about 39%",
              "explain": "Without the day you would say one in three. 'Born on a weekday' sounds like idle detail, but it makes two-boy families easier to hear about: a family with two boys has two chances of owning a weekday boy, so it survives the news more often than a family with one boy does. Of the 115 equally likely families that fit, 45 are two boys — a bit under four in ten. The more detail a clue carries, the closer the answer creeps to one in two."
            }
          ]
        },
        {
          "id": "u7l2",
          "title": "How you found out",
          "questions": [
                {
              "id": "met_a_girl",
              "type": "choice",
              "topic": "probability",
              "prompt": "A neighbour has two children. You bump into one of them in the street and she is a girl — what is the chance the other one is a girl too?",
              "vizHint": "Run it: a random family, and you meet one of the two children at random.",
              "viz": "metAChild",
              "choices": [
                "1 in 3, same as before",
                "1 in 2",
                "1 in 4",
                "2 in 3"
              ],
              "answer": 1,
              "answerValue": "1 in 2",
              "explain": "One in two — even though being told 'at least one is a girl' would have made it one in three. The difference is how you found out. A two-girl family shows you a girl whichever child you happen to meet, while a mixed family only manages it half the time, so meeting a girl counts the two-girl families twice over. Who did the choosing — you, or the family — is part of the evidence."
            },
                {
              "id": "bertrand_boxes",
              "type": "choice",
              "topic": "probability",
              "prompt": "Three boxes: one holds two gold coins, one holds two silver, one holds one of each — you pick a box at random, pull out a coin without looking, and it is gold, so what is the chance the other coin in that box is gold too?",
              "vizHint": "Draw a coin. The tally only counts the draws that came out gold.",
              "viz": "goldBoxes",
              "choices": [
                "1 in 2",
                "2 in 3",
                "1 in 3",
                "3 in 4"
              ],
              "answer": 1,
              "answerValue": "2 in 3",
              "explain": "Two in three. Stop counting boxes and count coins: three of the six coins are gold, and two of those three live in the box with two gold coins. Pulling gold is twice as likely out of that box as out of the mixed one, so it deserves twice the weight. The instinct to say a half comes from counting boxes when the thing you actually reached for was a coin."
            },
                {
              "id": "workshop_split",
              "type": "truefalse",
              "topic": "statistics",
              "prompt": "Two bike workshops. On easy repairs A fixes a bigger share than B does, and on hard repairs A fixes a bigger share than B as well.",
              "statement": "Even so, B can end up fixing the bigger share of all the bikes it takes in.",
              "vizHint": "Tap a bar. The last pair lumps every job together.",
              "viz": "workshopSplit",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, and here it actually happens. A fixes 93% of the easy jobs and 73% of the hard ones against B's 87% and 69% — yet overall B fixes 83% to A's 78%. A takes in mostly hard bikes and B mostly easy ones, so the lumped-together numbers are really comparing A's hard week with B's easy one. Split the data and lump it together and the arrow can point opposite ways, which is what makes 'overall' such a dangerous word."
            },
                {
              "id": "stop_at_a_boy",
              "type": "number",
              "topic": "probability",
              "prompt": "In one country every family keeps having children until a boy arrives, and then stops. Out of every 100 children in that country, how many are girls?",
              "vizHint": "Add families and watch the running count of girls.",
              "viz": "stopAtBoy",
              "answerNumber": 50,
              "tolerance": 2,
              "placeholder": "how many girls?",
              "answerValue": "50",
              "explain": "Fifty. Every birth is still its own coin flip, and the rule decides how many children a family has, not what any one of them turns out to be. Each family ends with exactly one boy and, on average, one girl before him. A policy about when to stop can shuffle children between families, but it cannot bend the odds of the next baby."
            }
          ]
        }
      ]
    },
    {
      "id": "u8",
      "index": 8,
      "title": "Shapes and space",
      "subtitle": "Chance that lives in a picture.",
      "colour": "#d2a8ff",
      "free": false,
      "lessons": [
        {
          "id": "u8l1",
          "title": "Bigger than it looks",
          "questions": [
                {
              "id": "giant_weight",
              "type": "number",
              "topic": "geometry",
              "prompt": "A film monster is exactly a person's shape, but twice as tall. How many times heavier is it?",
              "vizHint": "Drag to make it taller. The bars are height, skin and weight.",
              "viz": "scaleAnimal",
              "answerNumber": 8,
              "tolerance": 0,
              "placeholder": "how many times?",
              "answerValue": "8",
              "explain": "Eight times. Doubling every length doubles the height, quadruples the skin, and multiplies the volume — and so the weight — by eight. But bone strength depends on how thick a bone is across, so it only goes up four times, leaving twice the load on every square centimetre. That is why nothing built like a person could ever stand sixty feet tall, and why ants are shaped nothing like elephants."
            },
                {
              "id": "glass_shapes",
              "type": "tap",
              "topic": "geometry",
              "prompt": "Three glasses, drawn to scale. Tap the one that holds the most.",
              "vizHint": "Tap a glass to fill it and see how much goes in.",
              "viz": "threeGlasses",
              "regions": [
                {
                  "id": "tall",
                  "label": "The tall one"
                },
                {
                  "id": "middle",
                  "label": "The middle one"
                },
                {
                  "id": "wide",
                  "label": "The wide one"
                }
              ],
              "answerRegion": "wide",
              "answerValue": "wide",
              "explain": "The short wide one, and not narrowly: about 600 millilitres against the tall one's 565. Height counts once, but width counts twice over, because it sets both how far across the surface is and how far back it goes. Our eyes read height and quietly ignore that, which is why a tall thin glass looks generous and pours short."
            },
                {
              "id": "ball_in_box",
              "type": "choice",
              "topic": "geometry",
              "prompt": "The biggest circle that fits inside a square covers about 79% of it — so how much of a cube-shaped box does the biggest ball inside it fill?",
              "vizHint": "Throw darts into the box and see how many land inside the ball.",
              "viz": "ballInBox",
              "choices": [
                "About 79% — the same",
                "About 65%",
                "About 52%",
                "About 33%"
              ],
              "answer": 2,
              "answerValue": "about 52%",
              "explain": "About 52% — a ball in its box is barely more than half full. Every extra dimension gives the corners somewhere new to hide: a square has four of them, a cube has eight, and each one is a fatter piece of nothing. Keep going up in dimensions and the ball's share collapses towards nothing at all, which is one reason high-dimensional data behaves so strangely."
            },
                {
              "id": "goat_corner",
              "type": "choice",
              "topic": "geometry",
              "prompt": "A goat is tied by a 10-metre rope to the outside corner of a square barn whose walls are each 10 metres long. How much of a full 10-metre circle of grass can it reach?",
              "vizHint": "Drag the rope longer and shorter and watch the grass it can reach.",
              "viz": "goatRope",
              "choices": [
                "The whole circle",
                "Three quarters of it",
                "Half of it",
                "A quarter of it"
              ],
              "answer": 1,
              "answerValue": "three quarters",
              "explain": "Three quarters. The barn blocks exactly the quarter it stands on, and the goat swings freely round the other three. The rope reaches the next corner with nothing left over, so it cannot bend round a wall at all. Lengthen it and two extra fans of grass open up beyond those corners — the reachable patch grows far faster than the rope does."
            }
          ]
        },
        {
          "id": "u8l2",
          "title": "Paths and pieces",
          "questions": [
                {
              "id": "snap_stick",
              "type": "number",
              "topic": "geometry",
              "prompt": "Snap a stick at two points chosen completely at random. Out of 100 goes, how often do the three pieces make a triangle?",
              "vizHint": "Snap one, or snap two hundred, and watch how often the pieces close up.",
              "viz": "snapStick",
              "answerNumber": 25,
              "tolerance": 3,
              "placeholder": "out of 100",
              "answerValue": "25",
              "explain": "About 25 — one time in four. Three pieces close into a triangle exactly when no piece is longer than the other two put together, which is the same as saying no piece is longer than half the stick. Usually one cut lands far from the other and leaves a long piece the two short ones cannot span. Draw the two cut positions as a point in a square and the winning region is a quarter of it."
            },
                {
              "id": "ant_room",
              "type": "choice",
              "topic": "geometry",
              "prompt": "A hall is 12 metres long, 4 wide and 5 high, and an ant crawls from a bottom corner to the far top corner keeping to the floor, walls and ceiling — how short can the walk be?",
              "vizHint": "Fold the room flat and the crawl becomes a straight line.",
              "viz": "unfoldRoom",
              "choices": [
                "21 metres",
                "17 metres",
                "15 metres",
                "13.6 metres"
              ],
              "answer": 2,
              "answerValue": "15 metres",
              "explain": "Fifteen metres. Unfold the room like a cardboard box and the shortest crawl becomes a straight line on the flat paper — and the fold that wins lays the 4-metre width and the 5-metre height end to end, giving a rectangle 12 by 9. Along the edges would be 21, and 13.6 is the flight straight through the air, which an ant cannot take. Which two faces you cross decides everything."
            },
                {
              "id": "meeting_window",
              "type": "number",
              "topic": "geometry",
              "prompt": "Two friends each turn up at a café at a random moment between one and two o'clock and each waits exactly a quarter of an hour before giving up. Out of 100 days, how often do they meet?",
              "vizHint": "Each day is a dot: one friend's time across, the other's up. Run some days.",
              "viz": "meetingSquare",
              "answerNumber": 44,
              "tolerance": 3,
              "placeholder": "out of 100",
              "answerValue": "44",
              "explain": "About 44 — nearly half, where most people guess a quarter. Put one friend's arrival across the page and the other's up it, and every day becomes a dot in a square. They meet in the band down the diagonal where the two times are within fifteen minutes, and that band is seven sixteenths of the square. A question about timing turned into a question about area."
            },
                {
              "id": "mobius_cut",
              "type": "truefalse",
              "topic": "geometry",
              "prompt": "Take a paper strip, give one end a half twist, and glue the two ends together.",
              "statement": "Cut it all the way along the middle and you end up with two separate rings.",
              "vizHint": "Walk along the top half and see where the join puts you.",
              "viz": "mobiusWalk",
              "answerBool": false,
              "answerValue": "false",
              "explain": "False — you get one ring, twice as long, with a full twist in it. The half twist glues the top half of the strip onto the bottom half, so the two things that look like opposite sides of the cut are one strip going round twice. Cut a plain untwisted loop the same way and you really do get two rings; the twist is what fuses them into one."
            },
                {
              "id": "peg_hole",
              "type": "choice",
              "topic": "geometry",
              "prompt": "Which wastes less room — a round peg in a square hole, or a square peg in a round hole?",
              "vizHint": "Throw darts at both and count how many land on the peg.",
              "viz": "pegDarts",
              "choices": [
                "The round peg in the square hole",
                "The square peg in the round hole",
                "They waste exactly the same",
                "It depends on how big they are"
              ],
              "answer": 0,
              "answerValue": "the round peg in the square hole (79% against 64%)",
              "explain": "The round peg in the square hole. A circle fills about 79% of the square drawn around it, while the biggest square inside a circle takes only about 64% — so the square peg leaves half as much again going spare. It is the same two shapes both times; all that changed is which one is on the inside. Corners are cheap to lose and expensive to fit."
            }
          ]
        }
      ]
    },
    {
      "id": "u9",
      "index": 9,
      "title": "Dots joined by lines",
      "subtitle": "What a network forces to be true.",
      "colour": "#56d4dd",
      "free": false,
      "lessons": [
        {
          "id": "u9l1",
          "title": "Friends and strangers",
          "questions": [
                {
              "id": "friend_paradox",
              "type": "number",
              "topic": "graphs",
              "prompt": "Everyone in this group of eight has three friends on average, but now ask each person how many friends each of their own friends has, and average every number you hear — what does it come to?",
              "vizHint": "Tap a person. You get their friend count, and their friends' counts.",
              "viz": "friendNetwork",
              "answerNumber": 4,
              "tolerance": 0,
              "placeholder": "friends, on average",
              "answerValue": "4",
              "explain": "Four, not three. Popular people appear on many lists — Ana gets named six times, the two loners once each — so the pile of numbers you collect is stacked with the well-connected. That is why your friends have more friends than you do, on average, and why the bus you are on is fuller than the average bus. Nothing is wrong with the group; the counting was done from the wrong end."
            },
                {
              "id": "odd_handshakes",
              "type": "truefalse",
              "topic": "graphs",
              "prompt": "People at a party shake hands, some a lot, some not at all, and at the end you count how many people shook an odd number of hands.",
              "vizHint": "Step through the handshakes and watch the odd tally.",
              "viz": "handshakeParity",
              "statement": "That count comes out even at every possible party.",
              "answerBool": true,
              "answerValue": "true",
              "explain": "Always even. Every handshake adds one to exactly two people's counts, so adding up everybody's count gives twice the number of handshakes — an even total. Throw away the people with even counts and the rest still has to add to an even total, and odd numbers only add to an even total if there is an even quantity of them. Watch the tally as you step: it moves by two, or not at all."
            },
                {
              "id": "six_degrees",
              "type": "choice",
              "topic": "graphs",
              "prompt": "Suppose everybody knows a hundred people and no two circles overlap — how many steps of friend-of-a-friend does it take to cover all eight billion people alive?",
              "vizHint": "Slide the number of steps and watch how far the news gets.",
              "viz": "sixDegrees",
              "choices": [
                "3 steps",
                "5 steps",
                "20 steps",
                "about a million steps"
              ],
              "answer": 1,
              "answerValue": "5",
              "explain": "Five. A hundred people, then ten thousand, then a million, then a hundred million, then ten billion — more than the planet holds. Each step multiplies rather than adds, so distance across a network grows like the number of digits in the population, not the population. Real circles overlap heavily, which costs a step or two, and that is where six degrees of separation comes from."
            },
                {
              "id": "party_of_six",
              "type": "number",
              "topic": "graphs",
              "prompt": "Every two people in a room are either friends or strangers — how many people must there be before you are guaranteed either three who all know each other or three who are all strangers?",
              "vizHint": "Tap a link to flip it. Try to avoid a matching trio.",
              "viz": "ramseyParty",
              "answerNumber": 6,
              "tolerance": 0,
              "placeholder": "how many people?",
              "answerValue": "6",
              "explain": "Six, and five is genuinely not enough — with five you can arrange the links so no such trio exists, and the visual lets you find that arrangement. With six, pick anyone: they have five links, so at least three of those links are the same kind, say three friends. If any two of those three are friends, there is your friendly trio; if none of them are, those three are a stranger trio. Order appears whether the room wants it or not."
            }
          ]
        },
        {
          "id": "u9l2",
          "title": "Wiring it up",
          "questions": [
                {
              "id": "exam_slots",
              "type": "number",
              "topic": "graphs",
              "prompt": "Five exams, and each one clashes with exactly two others because some students sit both — what is the fewest time slots the timetable can use?",
              "vizHint": "Pick how many slots, then tap an exam to move it. Clashes glow red.",
              "viz": "examColouring",
              "answerNumber": 3,
              "tolerance": 0,
              "placeholder": "how many slots?",
              "answerValue": "3",
              "explain": "Three. Two slots would mean alternating around the ring of clashes — morning, afternoon, morning, afternoon — but the ring has five exams in it, an odd number, so you arrive back at the start on the wrong slot and clash with yourself. Every odd ring needs three. No exam clashes with more than two others, and yet two is impossible: what decides it is the shape of the clashes, not how many each exam has."
            },
                {
              "id": "cheapest_cables",
              "type": "number",
              "topic": "optimisation",
              "prompt": "Six offices, with the cost in miles of every cable you could lay — what is the smallest total length of cable that leaves every office reachable from every other?",
              "vizHint": "Tap cables to lay or lift them. The readout tracks miles and stranded offices.",
              "viz": "cableNetwork",
              "answerNumber": 26,
              "tolerance": 0,
              "placeholder": "miles of cable",
              "answerValue": "26",
              "explain": "Twenty-six miles, using five cables — always one fewer than the number of offices, because a sixth would close a loop and a loop always has a cable you can cut for free. Keep taking the cheapest cable that joins two parts not yet linked and skip any that closes a loop: 3, 4, 5, 6, then 8. Grabbing the five cheapest instead — 3, 4, 5, 6, 7 — looks cheaper but the 7 closes a loop and leaves one office stranded. Greedy is exactly right here, which is rarer than it looks."
            },
                {
              "id": "postman_start",
              "type": "tap",
              "topic": "graphs",
              "prompt": "A postman has to walk every street on this map exactly once and finish at the Market — tap the junction he must set off from.",
              "vizHint": "Tap a junction to count the streets meeting there.",
              "viz": "postmanRound",
              "regions": [
                {
                  "id": "market",
                  "label": "Market"
                },
                {
                  "id": "mill",
                  "label": "Mill"
                },
                {
                  "id": "bridge",
                  "label": "Bridge"
                },
                {
                  "id": "church",
                  "label": "Church"
                },
                {
                  "id": "green",
                  "label": "Green"
                },
                {
                  "id": "school",
                  "label": "School"
                }
              ],
              "answerRegion": "mill",
              "answerValue": "mill",
              "explain": "The Mill. Count the streets meeting at each junction: every one is even except the Market and the Mill. At an even junction you arrive and leave in pairs, so a walk that uses every street once can only begin and end at odd junctions. He finishes at the Market, so the Mill is the only place left to start. Two odd junctions means it can be done at all; four means it cannot, which is precisely why nobody ever managed the seven bridges of Königsberg."
            },
                {
              "id": "random_connect",
              "type": "choice",
              "topic": "graphs",
              "prompt": "Twenty offices and no cables at all: you keep picking two offices at random and joining them — roughly how many cables before the whole lot is finally connected?",
              "vizHint": "Run the wiring a few thousand times and read the spread.",
              "viz": "randomWiring",
              "choices": [
                "about 19",
                "about 36",
                "about 90",
                "about 190 — every possible pair"
              ],
              "answer": 1,
              "answerValue": "about 36",
              "explain": "About 36 — under a fifth of the 190 pairs that exist. Nineteen would do it if you placed them by hand, but random cables keep landing between offices that are already joined. What holds you up at the end is the one lonely office nobody has picked yet, so the last link costs more than the first fifteen. Networks like this sit in scattered islands for ages and then join up almost all at once."
            },
                {
              "id": "ring_shortcuts",
              "type": "choice",
              "topic": "graphs",
              "prompt": "Twenty-four villages sit in a ring, each joined only to its two neighbours, so a typical trip is a bit over six hops — now add four extra roads between randomly chosen villages, and a typical trip becomes what?",
              "vizHint": "Add the shortcuts one at a time and watch the typical trip fall.",
              "viz": "ringShortcuts",
              "choices": [
                "still about 6",
                "about 5",
                "about 3.7",
                "about 1.5"
              ],
              "answer": 2,
              "answerValue": "about 3.7",
              "explain": "About 3.7 hops — four roads, one for every six that were already there, and the typical trip nearly halves. A road between two random villages is almost certainly a long one, and one long road shortens the journey for everyone near either end, not just for the two villages it joins. That is why a world of mostly local friendships still has short paths across it: a handful of far-flung links do all the work."
            }
          ]
        }
      ]
    },
    {
      "id": "u10",
      "index": 10,
      "title": "What it costs to run",
      "subtitle": "Questions, weighings, and how work grows.",
      "colour": "#f0883e",
      "free": false,
      "lessons": [
        {
          "id": "u10l1",
          "title": "The fewest moves",
          "questions": [
                {
              "id": "card_sorting",
              "type": "number",
              "topic": "algorithms",
              "prompt": "Five cards lie face down and your only move is to compare two of them — how many comparisons do you need to be certain of the full order, in the worst case?",
              "vizHint": "Tap two cards to compare them. The ladder shows what you know so far.",
              "viz": "cardCompare",
              "answerNumber": 7,
              "tolerance": 0,
              "placeholder": "comparisons",
              "answerValue": "7",
              "explain": "Seven. Five cards can lie in 120 different orders, and each comparison answers one yes-or-no question, so six comparisons can only tell 64 stories apart — not enough to name 120 orders. Seven can tell 128 apart, and seven really is achievable: compare two pairs, compare the two winners, then slot the remaining cards into that chain by halving. Inserting the cards one at a time is the obvious method and it costs eight."
            },
                {
              "id": "twelve_coins",
              "type": "number",
              "topic": "puzzles",
              "prompt": "Twelve coins, one of them fake, and you are not even told whether the fake is heavier or lighter — how many weighings on a balance make you certain which coin it is and which way it is off?",
              "vizHint": "Slide how many coins go on each pan and watch the worst case.",
              "viz": "coinWeighing",
              "answerNumber": 3,
              "tolerance": 0,
              "placeholder": "weighings",
              "answerValue": "3",
              "explain": "Three. There are 24 answers to sift — twelve coins, each either heavy or light — and a weighing has three outcomes: left down, right down, balanced. Three weighings can tell 27 stories apart, two can tell only nine, so two is hopeless before you start. Three works only if every weighing splits the survivors near enough evenly, which is why the first one is four against four: whichever way it tips, and even if it balances, eight possibilities remain."
            },
                {
              "id": "weigh_27",
              "type": "choice",
              "topic": "information_theory",
              "prompt": "Same balance scale and still three weighings, but this time you are told the fake coin is the heavy one — what is the biggest pile you could sift?",
              "vizHint": "Step through it: each weighing throws away two thirds of the pile.",
              "viz": "ternarySplit",
              "choices": [
                "12 coins",
                "18 coins",
                "27 coins",
                "81 coins"
              ],
              "answer": 2,
              "answerValue": "27",
              "explain": "Twenty-seven. Knowing the fake is heavy leaves one answer per coin instead of two, and three weighings still have only 27 possible patterns of outcome, so 27 is the ceiling — and it is reached: split into three piles of nine and weigh two of them, and the heavy pan, or the pile you left out if they balance, holds the coin. Nine, then three, then one. A balance is a question with three answers, so three of them cover three times three times three."
            },
                {
              "id": "egg_first_drop",
              "type": "tap",
              "topic": "algorithms",
              "prompt": "Two eggs, a hundred floors, and you want the highest floor an egg survives with as few drops as possible in the worst case — tap the floor to drop from first.",
              "vizHint": "Tap a floor. The readout gives the worst case that follows from it.",
              "viz": "eggDrops",
              "regions": [
                {
                  "id": "floor5",
                  "label": "Floor 5"
                },
                {
                  "id": "floor14",
                  "label": "Floor 14"
                },
                {
                  "id": "floor34",
                  "label": "Floor 34"
                },
                {
                  "id": "floor50",
                  "label": "Floor 50"
                }
              ],
              "answerRegion": "floor14",
              "answerValue": "floor14",
              "explain": "Floor 14. Halving is the wrong instinct here: drop from 50 and if it breaks you must test floors 1 to 49 one by one with your last egg, fifty drops in all. Start too low and you waste drops climbing. Fourteen balances the two: if it breaks you have thirteen floors to walk up by hand, and if it survives you go up thirteen, then twelve, then eleven, shortening the step each time so the total never passes fourteen. Fourteen drops covers a hundred floors."
            }
          ]
        },
        {
          "id": "u10l2",
          "title": "How the work grows",
          "questions": [
                {
              "id": "quadratic_time",
              "type": "choice",
              "topic": "algorithms",
              "prompt": "A program takes one second on a thousand records and its work grows like the square of the pile — how long does it take on a hundred thousand records?",
              "vizHint": "Slide the pile size. The pale line is what people expect.",
              "viz": "growthCurves",
              "choices": [
                "100 seconds",
                "about 3 hours",
                "about 5 days",
                "about 6 weeks"
              ],
              "answer": 1,
              "answerValue": "about 3 hours",
              "explain": "Ten thousand seconds — getting on for three hours. A hundred times the records is a hundred times a hundred the work, because squaring turns a factor of a hundred into a factor of ten thousand. This is the gap between a program that scales and one that quietly dies the week you get real customers: the machine did not slow down, the pile grew. Anything whose work grows like the square looks perfectly fine on test data."
            },
                {
              "id": "busiest_slot",
              "type": "choice",
              "topic": "algorithms",
              "prompt": "A hundred parcels are dropped into a hundred pigeonholes, each parcel landing in a hole picked at random — how full is the fullest hole likely to end up?",
              "vizHint": "Run the drop a few thousand times and read the fullest hole.",
              "viz": "hashBins",
              "choices": [
                "1 — roughly one each",
                "2",
                "4 or 5",
                "about 10"
              ],
              "answer": 2,
              "answerValue": "4 or 5",
              "explain": "Four or five — and about 37 of the hundred holes end up with nothing in them at all. One each is the average, but randomness clumps, and it is the fullest hole you end up waiting behind. Computers store things exactly this way: a hash table drops each item into a slot worked out from its name, and the slowest lookup in the table is set by the busiest slot, never by the average one."
            },
                {
              "id": "memo_staircase",
              "type": "choice",
              "topic": "algorithms",
              "prompt": "To count the routes up a forty-step staircase a computer keeps splitting the problem into two smaller staircases and never writes anything down, which costs over two hundred million pieces of work — how much is left if it jots down each staircase's answer the first time it meets it?",
              "vizHint": "Slide the staircase height. The pale line is the version with a notebook.",
              "viz": "memoWork",
              "choices": [
                "about 40",
                "about 4,000",
                "about a million",
                "still over a hundred million"
              ],
              "answer": 0,
              "answerValue": "about 40",
              "explain": "About forty — one line of notes per staircase size, and every time after the first is a lookup. Without the notebook the same small staircase gets solved millions of times over, because every split spawns two more splits below it. Two hundred million pieces of work become forty, and the notebook is forty lines long. That is the whole of dynamic programming, and it turns impossible jobs into instant ones without anybody buying a faster machine."
            },
                {
              "id": "parallel_cores",
              "type": "number",
              "topic": "algorithms",
              "prompt": "A ten-hour job splits neatly across as many cores as you like, apart from one hour of it that cannot be split at all — run it on a hundred cores and how many hours does it take?",
              "vizHint": "Slide the number of cores and watch the curve flatten.",
              "viz": "coreScaling",
              "answerNumber": 1.09,
              "tolerance": 0.02,
              "placeholder": "hours, e.g. 2.50",
              "answerValue": "1.09",
              "explain": "Just over an hour. The nine shareable hours come down to about five minutes between a hundred cores, and the stubborn hour is still an hour. So a hundred cores bought a speed-up of nine, not of a hundred, and a thousand cores would still leave you above an hour — the unshareable part is a floor you cannot buy your way under. Shrinking that part is worth more than doubling the machines."
            },
                {
              "id": "growth_order",
              "type": "order",
              "topic": "algorithms",
              "prompt": "Five jobs on the same pile of names, and the pile keeps growing.",
              "orderPrompt": "Tap them in order — the job whose work grows most gently first.",
              "vizHint": "Slide the pile size and watch the bars pull apart.",
              "viz": "growthLadder",
              "items": [
                "Finding one name in a sorted list",
                "Reading every name once",
                "Sorting the names",
                "Comparing every name with every other",
                "Trying every possible order of the names"
              ],
              "answerValue": "look-up, one pass, sorting, every pair, every order",
              "explain": "Looking a name up in a sorted list barely notices the pile: a million names take twenty halvings. Reading every name once is proportional, and sorting is only a little worse than reading — close enough that people treat it as free. Comparing every pair is where trouble starts, since ten times the names is a hundred times the work. Trying every order is beyond hopeless: ten names have three and a half million orders, and twenty names have more orders than there have been seconds since the dinosaurs."
            }
          ]
        }
      ]
    },
    {
      "id": "u11",
      "index": 11,
      "title": "Where it settles",
      "subtitle": "Chance with a memory, and where it ends up.",
      "colour": "#7ee787",
      "free": false,
      "lessons": [
        {
          "id": "u11l1",
          "title": "Round and round",
          "questions": [
            {
              "id": "ring_return",
              "type": "number",
              "topic": "markov",
              "prompt": "A frog sits on a ring of six lily pads and each second it hops to the pad on its left or its right, at random — on average, how many hops until it is back where it started?",
              "vizHint": "Hop the frog by hand, or run a few thousand trips and watch the average settle.",
              "viz": "ringFrog",
              "answerNumber": 6,
              "tolerance": 0,
              "placeholder": "hops",
              "answerValue": "6",
              "explain": "Six — and the reason is prettier than the arithmetic. In the long run the frog spends an equal share of its time on each of the six pads, one second in six on the pad you are watching, so it must be coming back once every six seconds on average. That holds for any ring: a hundred pads, a hundred hops. The average hides a mess, though — half of all returns take just two hops, and one in a hundred takes more than thirty."
            },
            {
              "id": "weather_steady",
              "type": "choice",
              "topic": "markov",
              "prompt": "In one town a rainy day is followed by rain half the time, while a dry day is followed by rain a quarter of the time — over a whole year, what share of days are rainy?",
              "vizHint": "Set what today looks like and step the town forward. The bar settles wherever it settles.",
              "viz": "chainSettle",
              "choices": [
                "25%",
                "33%",
                "40%",
                "50%"
              ],
              "answer": 1,
              "answerValue": "33%",
              "explain": "A third. In the long run the town has to gain rainy days exactly as fast as it loses them: it loses half of the rainy ones and converts a quarter of the dry ones, so a third rainy and two thirds dry is the only mix that balances. Notice you were never told what the weather is doing today and it did not matter — a chain like this forgets where it started, and the mix it drifts to is a property of the rules alone."
            },
            {
              "id": "chain_forgets",
              "type": "truefalse",
              "topic": "markov",
              "prompt": "The same town, with the same two rules about what follows what.",
              "statement": "Start it on a rainy day or start it on a dry one — after enough days the chance that it is raining is the same either way.",
              "vizHint": "Two towns, opposite starts, stepped side by side.",
              "viz": "twoStarts",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, and quickly — the gap between the two towns shrinks by a quarter every day, so after a fortnight you could not tell which one woke up in the rain. This forgetting is what makes long-run questions answerable at all, and it is why weather forecasts die at about a week: not because the sums get harder, but because by then the atmosphere has forgotten today."
            },
            {
              "id": "mouse_maze",
              "type": "number",
              "topic": "markov",
              "prompt": "Three rooms in a row: the first has one door, the middle has two, and the last has a door back to the middle and a door to the outside. A mouse starts in the first room and picks a door at random every minute — how many minutes on average until it is out?",
              "vizHint": "Step the mouse yourself, or run a thousand mice and read the average.",
              "viz": "mouseMaze",
              "answerNumber": 9,
              "tolerance": 0,
              "placeholder": "minutes",
              "answerValue": "9",
              "explain": "Nine. Call the waits from each room A, B and C. The far room is one minute from freedom half the time and one minute from the middle the other half, the middle room is a coin flip between the two others, and the first room has no choice at all. Untangle them and the far room is five minutes out, the middle eight, the first nine. The mouse spends most of its life walking back the way it came, which is why nine minutes buys you a journey of only two rooms."
            },
            {
              "id": "drunk_returns",
              "type": "truefalse",
              "topic": "markov",
              "prompt": "A drunk walks home across an endless grid of streets, one block at a time, each block picking north, south, east or west at random.",
              "statement": "He is certain to end up back where he started.",
              "vizHint": "Run walks and watch what share have found their way home by each step.",
              "viz": "walkReturns",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, with probability one — though he is in no hurry, and the share who have made it home creeps up like the logarithm rather than climbing. Add a third dimension and it collapses: a drunk bird flying at random through open air has about a one in three chance of never coming back to its perch, for ever. Two dimensions is exactly the boundary case, and streets happen to be flat."
            }
          ]
        },
        {
          "id": "u11l2",
          "title": "The long run",
          "questions": [
            {
              "id": "deuce_odds",
              "type": "choice",
              "topic": "markov",
              "prompt": "A tennis game at deuce goes on until someone is two points clear, and you win any single point 60% of the time — what is your chance of taking the game?",
              "vizHint": "Slide your chance of winning a point and watch the game odds follow.",
              "viz": "deuceDial",
              "choices": [
                "60%",
                "69%",
                "75%",
                "84%"
              ],
              "answer": 1,
              "answerValue": "69%",
              "explain": "About 69%. Deuce is a loop: win two and it is over, lose two and it is over, and split them and you are back at deuce with nothing changed. So only the pairs matter, and you take two in a row 36 times in a hundred against their 16 — 36 out of 52, near enough 69%. Small edges get amplified by anything that makes you repeat it: a 60% point becomes a 69% game, a 74% set and a 91% match."
            },
            {
              "id": "surfer_page",
              "type": "tap",
              "topic": "markov",
              "prompt": "Five websites link to each other as drawn — tap the page where a reader clicking random links for ever would spend the most time.",
              "vizHint": "Tap a page to let a reader loose from it, and watch where the visits pile up.",
              "viz": "surferGraph",
              "regions": [
                {
                  "id": "home",
                  "label": "Home"
                },
                {
                  "id": "blog",
                  "label": "Blog"
                },
                {
                  "id": "shop",
                  "label": "Shop"
                },
                {
                  "id": "news",
                  "label": "News"
                },
                {
                  "id": "ads",
                  "label": "Ads"
                }
              ],
              "answerRegion": "home",
              "answerValue": "home",
              "explain": "Home, with two fifths of all the traffic — even though Blog is the page with the most links pointing at it. Counting links is the wrong sum: Blog is pointed at three times but always by pages with better things to do, while Home is pointed at twice by pages that link nowhere else, so every visit they get is handed straight on. A link is worth what the page giving it is worth, divided by how many it gives away. That circular idea, solved, is what put Google ahead of every search engine that just counted links."
            },
            {
              "id": "gas_returns",
              "type": "number",
              "topic": "markov",
              "prompt": "Ten gas molecules bounce between the two halves of a box and every second one of them, chosen at random, swaps sides — starting with all ten on the left, how many seconds on average until all ten are on the left again?",
              "vizHint": "Let the box run. The counter keeps the record of every time it happens.",
              "viz": "gasBox",
              "answerNumber": 1024,
              "tolerance": 0,
              "placeholder": "seconds",
              "answerValue": "1024",
              "explain": "1,024 seconds — two to the ten, because in the long run the box spends one second in 1,024 with everything on the left, and a state you occupy one second in 1,024 is a state you return to every 1,024 seconds. So the gas does un-mix itself, over and over, and entropy turns out to be a statement about how long you are prepared to wait. The catch is the exponent: twenty molecules take a million seconds, and a real roomful takes longer than the universe has existed."
            },
            {
              "id": "riffle_seven",
              "type": "choice",
              "topic": "markov",
              "prompt": "How many ordinary riffle shuffles does it take before a deck of 52 cards is properly mixed?",
              "vizHint": "Riffle the deck yourself. The colours are where the cards started out.",
              "viz": "riffleMix",
              "choices": [
                "3",
                "7",
                "15",
                "52"
              ],
              "answer": 1,
              "answerValue": "7",
              "explain": "Seven, and the striking part is how suddenly it happens. After five shuffles the deck is still clearly the deck you started with; at seven almost all of that structure is gone; and shuffling on past seven buys you very little. Mixing does not fade away, it falls off a cliff. Card rooms that give the deck three shuffles are dealing hands that still remember the last one, which is exactly how a few players have made a living."
            }
          ]
        }
      ]
    },
    {
      "id": "u12",
      "index": 12,
      "title": "Knowing when to stop",
      "subtitle": "Rules for quitting, and what they are worth.",
      "colour": "#ff7b72",
      "free": false,
      "lessons": [
        {
          "id": "u12l1",
          "title": "The one that got away",
          "questions": [
            {
              "id": "secretary_skip",
              "type": "number",
              "topic": "optimal_stopping",
              "prompt": "A hundred candidates arrive one at a time in random order and each must be hired on the spot or lost for ever — how many should you see and turn down before hiring the next one who beats them all?",
              "vizHint": "Set where you stop looking, run a few hundred hiring rounds, and your own hit rate builds the curve.",
              "viz": "stopCurve",
              "answerNumber": 37,
              "tolerance": 0,
              "placeholder": "candidates",
              "answerValue": "37",
              "explain": "Thirty-seven. Turning people down is not waste, it is measurement: you are learning how good a good candidate looks. Stop looking too early and you hire someone decent before you know what decent means; look too long and the best one walks past you while you are still taking notes. The balance sits at a hundred divided by e, and the same number falls out whatever the pile size — 37% of it, every time."
            },
            {
              "id": "secretary_odds",
              "type": "choice",
              "topic": "optimal_stopping",
              "prompt": "Playing that rule on a hundred candidates, how often do you end up with the very best one of all?",
              "vizHint": "Run rounds and watch the three outcomes pile up: the best, someone else, or nobody at all.",
              "viz": "stopOutcomes",
              "choices": [
                "5%",
                "15%",
                "25%",
                "37%"
              ],
              "answer": 3,
              "answerValue": "37%",
              "explain": "37% — the same number twice over, and not a coincidence: both are one over e. That is far better than it has any right to be. One candidate in a hundred is the best, you must decide blind, and you still land them more than a third of the time. The other side of the ledger is worth knowing too: 37% of the time the best one was in your first thirty-seven, nobody afterwards ever beats them, and you go home with nobody at all."
            },
            {
              "id": "secretary_four",
              "type": "choice",
              "topic": "optimal_stopping",
              "prompt": "The same rule but only four candidates, seen in a random order — how often does the best possible plan land you the best of the four?",
              "vizHint": "All twenty-four orders at once. Move the cutoff and see which ones you win.",
              "viz": "allOrders",
              "choices": [
                "25%",
                "33%",
                "46%",
                "60%"
              ],
              "answer": 2,
              "answerValue": "46%",
              "explain": "Eleven times in twenty-four, near enough 46%. Turn down the first, then take the next one who beats them: you can check it by hand against all twenty-four orders, which is why four is the right size to see the machinery. Fewer candidates is an easier problem, not a harder one — the odds fall as the pile grows and level off at 37%, so a shortlist of four is genuinely the best position you will ever be in."
            },
            {
              "id": "skip_half",
              "type": "choice",
              "topic": "optimal_stopping",
              "prompt": "Back to a hundred candidates, but you turn down the first fifty instead of the first thirty-seven — what does that mistake cost you?",
              "vizHint": "Two cutoffs marked on the curve you built by running it.",
              "viz": "flatTop",
              "choices": [
                "it collapses to about 5%",
                "it drops to about 25%",
                "it drops to about 35%",
                "it actually does better"
              ],
              "answer": 2,
              "answerValue": "it drops to about 35%",
              "explain": "Almost nothing: 35% against 37%. The curve has a broad flat top — anything between about a quarter and a half of the way through is within two points of the best you can do. That is the useful half of the result and the half nobody quotes. You do not need to know that the answer is 37; you need to know that looking at a good few and then pouncing beats both of the instincts people actually have, which are to take the first decent one or to keep looking for ever."
            }
          ]
        },
        {
          "id": "u12l2",
          "title": "How you go broke",
          "questions": [
            {
              "id": "break_the_house",
              "type": "number",
              "topic": "betting",
              "prompt": "You have £5 and the house has £95, you flip a fair coin for £1 a time, and you play until one of you has nothing — what is your chance of taking the lot?",
              "vizHint": "Run the whole evening. The wall you hit is the wall you hit.",
              "viz": "ruinWalk",
              "answerNumber": 5,
              "tolerance": 0,
              "placeholder": "chance, in %",
              "answerValue": "5",
              "explain": "Five percent — exactly your share of the money on the table. A fair game moves money around without creating any, so on average you must end with the £5 you started with, and the only two endings are £0 and £100: the sums only balance if you reach £100 one time in twenty. The house needs no edge whatsoever to take your fiver off you. It only needs to be bigger than you are."
            },
            {
              "id": "ruin_length",
              "type": "number",
              "topic": "betting",
              "prompt": "Same fiver against the house's £95, same fair coin at £1 a flip — how many flips on average before one of you is cleaned out?",
              "vizHint": "Run evenings and watch how long they last.",
              "viz": "ruinLength",
              "answerNumber": 475,
              "tolerance": 0,
              "placeholder": "flips",
              "answerValue": "475",
              "explain": "475 — your £5 multiplied by their £95, which is the whole formula. A fair walk between two walls lasts the product of its two distances, so the same fiver against a house with £995 would last 4,975 flips. You are nineteen times out of twenty going to lose, and it is going to take all night, which is more or less the business model. Move to £5 a flip and both numbers shrink by twenty-five: same 5% chance, one twenty-fifth of the evening."
            },
            {
              "id": "roulette_ruin",
              "type": "number",
              "topic": "betting",
              "prompt": "Roulette pays even money on red, but 19 of its 37 slots are not red — betting £1 a spin from a bankroll of £100, how many spins on average before you are broke?",
              "vizHint": "Watch the bankroll drift, and slide what you started with.",
              "viz": "rouletteDrift",
              "answerNumber": 3700,
              "tolerance": 0,
              "placeholder": "spins",
              "answerValue": "3700",
              "explain": "3,700. The wheel takes one thirty-seventh of a pound off you per spin on average — under three pence — so a hundred pounds lasts a hundred times thirty-seven spins. That is the whole sum. At forty spins an hour it is nearly four days of play, which is why a night at the table feels survivable and a life at the table is not. The edge is invisible per spin and inescapable per thousand."
            },
            {
              "id": "martingale_double",
              "type": "choice",
              "topic": "betting",
              "prompt": "A fair coin, £1 on heads, and you double your bet after every loss until you win, which always nets £1 — with £1,023 in your pocket you can survive ten losses in a row, so what does the system make you a night?",
              "vizHint": "Play nights. The running average is the only line worth watching.",
              "viz": "martingaleLadder",
              "choices": [
                "£1 a night, nearly always",
                "about 50p a night",
                "nothing, on average",
                "it loses £1 a night"
              ],
              "answer": 2,
              "answerValue": "nothing, on average",
              "explain": "Nothing at all. You win your pound on 1,023 nights out of 1,024, and on the last one you lose 1,023 of them — the two sides balance to the penny, as they must in a fair game. Every betting system ever sold does this same trick: it converts a small chance of a large loss into a large chance of a small win, which feels like alchemy and is arithmetically a rearrangement. On a real wheel, with an edge, the rearrangement is worse than nothing."
            },
            {
              "id": "first_return",
              "type": "choice",
              "topic": "betting",
              "prompt": "A fair coin at £1 a flip, starting level — you are certain to be back at exactly level sooner or later, so how long does that take on average?",
              "vizHint": "Run returns and watch the running average. Give it time.",
              "viz": "returnWait",
              "choices": [
                "about 4 flips",
                "about 30 flips",
                "about a thousand flips",
                "there is no average — it is infinite"
              ],
              "answer": 3,
              "answerValue": "infinite",
              "explain": "There is no average. You return to level with certainty, and yet the wait has no mean at all: the average of your first thousand returns will look like a small number, the average of your first million will be much larger, and it keeps climbing for ever, because now and then a walk stays on one side for an astronomically long stretch. It is the cleanest example there is of something guaranteed to happen that is still not worth waiting for — and the reason a losing run can last so much longer than feels possible."
            }
          ]
        }
      ]
    },
    {
      "id": "u13",
      "index": 13,
      "title": "Twenty questions",
      "subtitle": "What a yes or a no is worth.",
      "colour": "#a5d6ff",
      "free": false,
      "lessons": [
        {
          "id": "u13l1",
          "title": "Cutting the list in half",
          "questions": [
            {
              "id": "deck_questions",
              "type": "choice",
              "topic": "information_theory",
              "prompt": "A deck of 52 cards has been shuffled into one particular order — how many yes-or-no questions does it take to pin down exactly which order it is in?",
              "vizHint": "Slide the deck size and watch the two bars — orders, and questions — pull apart.",
              "viz": "bitsLadder",
              "choices": [
                "52",
                "226",
                "2,600",
                "8 followed by 67 zeros"
              ],
              "answer": 1,
              "answerValue": "226",
              "explain": "226. There are about 8 followed by 67 zeros possible orders, and the best a question can ever do is halve the field, so what you need is the number of halvings that takes that monster down to one. Guessing a number from 1 to 1,000 took ten; the whole deck takes 226. The gap between those two numbers is the difference between a big list and a big pile of arrangements — and it is why any well-shuffled deck is almost certainly in an order no deck has ever been in before."
            },
            {
              "id": "clever_questions",
              "type": "number",
              "topic": "information_theory",
              "prompt": "One of four suspects did it, with chances of a half, a quarter, an eighth and an eighth — asking as cleverly as you can, how many yes-or-no questions do you need on average?",
              "vizHint": "Build the question tree by tapping. The readout costs it up for you.",
              "viz": "questionTree",
              "answerNumber": 1.75,
              "tolerance": 0.01,
              "placeholder": "questions, e.g. 2.50",
              "answerValue": "1.75",
              "explain": "One and three quarters. Ask about the likely suspect first: half the time you are done in a single question, and the unlucky eighths cost you three. Splitting the list evenly instead — 'is it one of these two?' — costs you two every time, so being clever saves a quarter of a question per case. The rule is to halve the probability, not the list, and no scheme on earth can beat 1.75 here: that number is the information in the answer."
            },
            {
              "id": "best_first_question",
              "type": "tap",
              "topic": "information_theory",
              "prompt": "The same four suspects with the same chances — tap the best question to ask first.",
              "vizHint": "Tap a question to see how it cuts the bar of probability, and what it costs in the end.",
              "viz": "splitPicker",
              "regions": [
                {
                  "id": "q_a",
                  "label": "Is it A?"
                },
                {
                  "id": "q_ab",
                  "label": "Is it A or B?"
                },
                {
                  "id": "q_c",
                  "label": "Is it C?"
                },
                {
                  "id": "q_bc",
                  "label": "Is it B or C?"
                }
              ],
              "answerRegion": "q_a",
              "answerValue": "q_a",
              "explain": "'Is it A?' — the only one of the four that splits the chances down the middle, because A alone carries half of them. It looks like the least ambitious question on the list, since a no leaves three suspects standing rather than two, but those three share only half the probability between them. Asking 'is it A or B?' feels more decisive and costs you a quarter of a question every time. A perfect question is one you genuinely cannot guess the answer to."
            },
            {
              "id": "no_free_lunch",
              "type": "truefalse",
              "topic": "information_theory",
              "prompt": "Someone is selling a compression program and will not say how it works.",
              "statement": "A program that makes every possible file at least one bit smaller cannot exist.",
              "vizHint": "Slide the file size and watch the shorter shelf run out of room.",
              "viz": "pigeonBoxes",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, and it is pure counting. There are 1,024 different ten-bit files but only 1,023 files shorter than ten bits in total, so any scheme that shortens all of them must give two files the same output — and then it cannot put either one back. Every real compressor lives with this: it shrinks the files people actually have, made of repeats and patterns, and pays for it by making random files slightly longer. Zip a zip file and watch it grow."
            }
          ]
        },
        {
          "id": "u13l2",
          "title": "Getting it through",
          "questions": [
            {
              "id": "hamming_find",
              "type": "tap",
              "topic": "information_theory",
              "prompt": "Seven lamps are wired so that each of the three rings always holds an even number of lit ones, and exactly one lamp has been flipped by mistake — tap the culprit.",
              "vizHint": "Each ring says whether its own count is odd or even. That is all you get, and it is enough.",
              "viz": "hammingRings",
              "regions": [
                {
                  "id": "lamp1",
                  "label": "1"
                },
                {
                  "id": "lamp2",
                  "label": "2"
                },
                {
                  "id": "lamp3",
                  "label": "3"
                },
                {
                  "id": "lamp4",
                  "label": "4"
                },
                {
                  "id": "lamp5",
                  "label": "5"
                },
                {
                  "id": "lamp6",
                  "label": "6"
                },
                {
                  "id": "lamp7",
                  "label": "7"
                }
              ],
              "answerRegion": "lamp6",
              "answerValue": "lamp6",
              "explain": "Lamp 6. Two of the rings come out odd and one comes out even, and only one lamp sits inside exactly those two rings and outside the third. Every lamp has its own signature of rings, so the pattern of failures names the culprit outright — three yes-or-no checks, eight possible verdicts, seven lamps and 'nothing is wrong'. This is a Hamming code, it is sixty years old, and something very like it is protecting the memory in the device you are reading this on."
            },
            {
              "id": "check_bits",
              "type": "number",
              "topic": "information_theory",
              "prompt": "A sixteen-bit message, and you want to be able to fix any single bit that gets flipped on the way — what is the fewest extra check bits that can do it?",
              "vizHint": "Slide the message length. The two bars are what the checks can say and what they must say.",
              "viz": "checkBitCurve",
              "answerNumber": 5,
              "tolerance": 0,
              "placeholder": "check bits",
              "answerValue": "5",
              "explain": "Five. The receiver has to be told one of twenty-two things — 'all fine', or which one of the twenty-one bits went wrong — and r check bits can only ever say two-to-the-r things. Four say sixteen, which is not enough; five say thirty-two, which is. The overhead melts away as messages grow: five checks protect sixteen bits, ten checks protect a thousand. Redundancy is cheap in bulk, which is why big files are protected and short ones are repeated."
            },
            {
              "id": "detect_vs_fix",
              "type": "truefalse",
              "topic": "information_theory",
              "prompt": "A message goes down the wire with one extra check bit stuck on the end.",
              "statement": "That one bit is enough to tell you something got flipped, but never enough to tell you which one.",
              "vizHint": "Tap any bit to flip it and see what the single check can say.",
              "viz": "parityBit",
              "answerBool": true,
              "answerValue": "true",
              "explain": "True, and the gap between spotting and mending is the whole of coding theory. One check bit has two states, so it can answer exactly one question: 'has something gone wrong?' To point at the culprit it would need as many states as there are bits, plus one for 'nothing'. That is why simple systems just ask for the message again, and why systems that cannot ask — a hard disk, a spacecraft, a scratched CD — pay for enough checks to repair the damage where it sits."
            },
            {
              "id": "repeat_three",
              "type": "choice",
              "topic": "information_theory",
              "prompt": "A wire flips one bit in ten. You send every bit three times and take the majority — what share of bits still come out wrong?",
              "vizHint": "Push bits through the noisy wire and count the survivors. Slide how many copies you send.",
              "viz": "majorityVote",
              "choices": [
                "10%",
                "3%",
                "1%",
                "0.1%"
              ],
              "answer": 1,
              "answerValue": "3%",
              "explain": "About 3%. The majority is only wrong when at least two of the three copies are wrong, which happens 2.8 times in a hundred. So you tripled the cost of everything you send and the errors went down by a factor of three and a half — a poor bargain, and the reason nobody builds it this way. Shannon's discovery was that the bargain does not have to be poor: with a properly designed code you can push the error rate as near zero as you like without ever tripling anything."
            },
            {
              "id": "squash_the_record",
              "type": "choice",
              "topic": "information_theory",
              "prompt": "A bent coin lands heads nine times in ten. You flip it a thousand times and write down the result — what is the fewest bits you can get away with, on average?",
              "vizHint": "Group the flips into blocks and let the coder do its work. The bar is what it actually used.",
              "viz": "squashStream",
              "choices": [
                "1,000",
                "900",
                "470",
                "100"
              ],
              "answer": 2,
              "answerValue": "470",
              "explain": "About 470 — under half. Surprise is what costs bits: a head is barely news at nine in ten and should cost far less than a whole bit, while the rare tail is worth about three and a half. You cannot spend a fraction of a bit on one flip, so the trick is to code flips in blocks — blocks of four already get you to 0.49 bits each, and longer blocks close on 0.469. That number is the entropy of the coin, and nothing will ever beat it."
            }
          ]
        }
      ]
    },
    {
      "id": "u14",
      "index": 14,
      "title": "Back of an envelope",
      "subtitle": "Numbers nobody can look up, guessed well.",
      "colour": "#e2c08d",
      "free": false,
      "lessons": [
        {
          "id": "u14l1",
          "title": "Chains of guesses",
          "questions": [
            {
              "id": "billion_seconds",
              "type": "choice",
              "topic": "estimation",
              "prompt": "A million seconds is about eleven and a half days — so how long is a billion seconds?",
              "vizHint": "Drag along the ladder of powers of ten and see what each one buys you.",
              "viz": "secondsLadder",
              "choices": [
                "about 3 months",
                "about 3 years",
                "about 32 years",
                "about 300 years"
              ],
              "answer": 2,
              "answerValue": "about 32 years",
              "explain": "About 32 years — and a trillion seconds is 32,000 years, which lands you before farming, before writing, before anything. The three words sound like siblings and they are nothing of the sort: a million seconds is a holiday, a billion is a working life, a trillion is the whole of human history several times over. Any number in the news is meaningless until you turn it into something you can stand next to."
            },
            {
              "id": "piano_tuners",
              "type": "choice",
              "topic": "estimation",
              "prompt": "London has 9 million people, about one in 200 owns a piano, each piano is tuned once a year, and a tuner does four a day for 250 days — how many piano tuners does London need?",
              "vizHint": "Drag any of the four assumptions and watch the answer move.",
              "viz": "fermiChain",
              "choices": [
                "about 5",
                "about 45",
                "about 450",
                "about 4,500"
              ],
              "answer": 1,
              "answerValue": "about 45",
              "explain": "About 45. Nine million over 200 is 45,000 pianos, a tuner gets through a thousand tunings a year, so 45 tuners. Not one of those four numbers is right — but the errors are as likely to be high as low, and a chain of four honest guesses lands far closer than anyone expects. The value of the method is not the answer, it is that you now know which of the four numbers to go and check."
            },
            {
              "id": "century_people",
              "type": "truefalse",
              "topic": "estimation",
              "prompt": "Two big numbers in units that have nothing to do with each other.",
              "statement": "There are more seconds in a century than there are people alive on Earth.",
              "vizHint": "Step through the sum one multiplication at a time and watch the bars.",
              "viz": "twoBars",
              "answerBool": false,
              "answerValue": "false",
              "explain": "False, and not by a little. A century is about 3.2 billion seconds and there are about 8 billion of us, so you would need two and a half centuries to give everyone alive one second of your attention. Almost everybody guesses this the other way round, because a century feels like an age and a population figure feels like a statistic. Turning both into the same units is most of what estimating is."
            },
            {
              "id": "little_law",
              "type": "number",
              "topic": "estimation",
              "prompt": "A pub holds 60 people at any moment through the evening and each of them stays about three quarters of an hour — how many people walk through the door in an hour?",
              "vizHint": "Slide how full it is and how long people stay. The door counts for itself.",
              "viz": "pubFlow",
              "answerNumber": 80,
              "tolerance": 0,
              "placeholder": "people an hour",
              "answerValue": "80",
              "explain": "Eighty. Sixty people each staying three quarters of an hour uses up 45 person-hours of pub every hour, and if 45 hours of drinking are being consumed per hour then 80 people an hour must be arriving to do it. Crowd equals arrivals times how long they stay — Little's law — and it holds for any queue at all, with no assumption about when anybody turns up: a hospital ward, a factory line, orders in a warehouse, jobs on a server."
            }
          ]
        },
        {
          "id": "u14l2",
          "title": "Counting what you cannot count",
          "questions": [
            {
              "id": "tag_the_fish",
              "type": "number",
              "topic": "estimation",
              "prompt": "You net 100 fish in a lake, tag them and put them back. A week later you net another 100 and four of them are tagged — how many fish are in the lake?",
              "vizHint": "Cast the net again and again. The tagged count wobbles — that wobble is your error bar.",
              "viz": "lakeNet",
              "answerNumber": 2500,
              "tolerance": 0,
              "placeholder": "fish",
              "answerValue": "2500",
              "explain": "2,500. Four in every hundred fish you caught were tagged, so tagged fish are about 4% of the lake — and you know exactly how many tagged fish there are, because you tagged them: 100. If 100 is 4%, the lake holds 2,500. Notice how little you had to know: nothing about the lake, the net or the fish, only that the second catch was a fair sample. The same trick counts wildlife, homeless populations, and the bugs still hiding in a piece of software."
            },
            {
              "id": "taxi_serials",
              "type": "number",
              "topic": "estimation",
              "prompt": "You are new in a city and the four taxis you have seen were numbered 12, 47, 89 and 104 — how many taxis does the city have?",
              "vizHint": "Drag your guess at the fleet size and watch four random taxis get sampled from it.",
              "viz": "serialGuess",
              "answerNumber": 129,
              "tolerance": 1,
              "placeholder": "taxis",
              "answerValue": "129",
              "explain": "About 129. Four numbers scattered over the fleet cut it into five stretches of roughly equal length — three between them, one below the smallest, one above the largest — so the biggest number you saw falls short of the total by about one stretch, and a stretch is 104 divided by 4. The estimate is 104 plus 26, less one. Britain ran exactly this sum on the gearbox numbers of captured German tanks: it said 246 a month, the spy reports said 1,400, and the German records found after the war said 245."
            },
            {
              "id": "benford_ones",
              "type": "choice",
              "topic": "estimation",
              "prompt": "Take a big pile of real-world numbers — river lengths, town populations, electricity bills — and look only at the first digit of each. How often is that digit a 1?",
              "vizHint": "Pick a source and tally its first digits. The pale curve is what the law predicts.",
              "viz": "firstDigits",
              "choices": [
                "11%",
                "20%",
                "30%",
                "50%"
              ],
              "answer": 2,
              "answerValue": "30%",
              "explain": "About 30%, and 9s turn up under 5% of the time. Anything that grows spends longer with a 1 at the front than with a 9, because getting from 1,000 to 2,000 is a doubling while getting from 9,000 to 10,000 is an 11% nudge. The giveaway that this is the only possible answer is that it does not care what units you use — measure the rivers in miles or kilometres and the same curve comes out."
            },
            {
              "id": "spot_the_fake",
              "type": "tap",
              "topic": "estimation",
              "prompt": "Three expense ledgers, and one of them was invented by a person trying to look random — tap the fake.",
              "vizHint": "Tap a ledger to tally its first digits against the curve.",
              "viz": "ledgerCheck",
              "regions": [
                {
                  "id": "ledgerA",
                  "label": "Ledger A"
                },
                {
                  "id": "ledgerB",
                  "label": "Ledger B"
                },
                {
                  "id": "ledgerC",
                  "label": "Ledger C"
                }
              ],
              "answerRegion": "ledgerC",
              "answerValue": "ledgerC",
              "explain": "Ledger C. Its first digits are spread far too evenly and it has only one number beginning with 1, where the other two have five and six — exactly the fingerprint of a person making numbers up, because people spread their digits out and steer away from starting a figure with a 1. The round endings give it away too. Tax authorities and auditors really do run this test, and it has put people in prison."
            },
            {
              "id": "errors_stack",
              "type": "choice",
              "topic": "estimation",
              "prompt": "You multiply three guessed numbers together and each one is typically 10% out either way — how far out is the answer likely to be?",
              "vizHint": "Run the three guesses thousands of times and read the spread of the answer.",
              "viz": "errorStack",
              "choices": [
                "about 3%",
                "about 10%",
                "about 17%",
                "about 30%"
              ],
              "answer": 2,
              "answerValue": "about 17%",
              "explain": "About 17%, not the 30% that adding them up would suggest. Errors combine the way the sides of a right-angled triangle do, not the way a bill does: some of your guesses run high while others run low and they partly cancel, so three of them give you root-three times one, not three times one. This is the licence for the whole business of estimating — chaining rough guesses together is far safer than it feels, and a fourth guess costs you almost nothing."
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
      "blurb": "Expectation, market making, and knowing what a game is worth.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Expectation",
        "Fair value and edge",
        "Optimal stopping",
        "Market making",
        "Adverse selection",
        "Card and dice games"
      ],
      "samples": [
        {
          "prompt": "You may roll a die up to three times, stopping whenever you like and taking the pounds shown on the roll you stop at — played well, what is the game worth?",
          "note": "Optimal stopping, worked backwards from the last roll."
        },
        {
          "prompt": "Cards are turned from a shuffled deck one at a time, and at any moment you may stop and bet a pound that the next card is red — so what is the game worth?",
          "note": "The stopping rule everybody believes in, and why it pays nothing."
        }
      ],
      "honestly": "Twelve questions, each with something to play with and an answer a machine re-derives — expect to get several of them wrong the first time.",
      "questions": [
        {
          "id": "js_three_rolls",
          "type": "number",
          "topic": "expectation",
          "prompt": "You may roll a die up to three times, stopping whenever you like and taking the pounds shown on the roll you stop at — played well, what is the game worth?",
          "vizHint": "Race three stopping rules against each other and watch the averages settle.",
          "viz": "jsThreeRolls",
          "answerNumber": 4.67,
          "tolerance": 0.1,
          "placeholder": "pounds",
          "answerValue": "4.67",
          "explain": "Work backwards. With only the last roll left you are stuck with the average, three and a half. With two rolls left you keep a four, five or six and reroll otherwise, which is worth four and a quarter. So on the first of three rolls you keep only a five or a six — a four is worth less than the four and a quarter you would be throwing away. That comes to four and two thirds, and every extra roll after that buys you less than the one before."
        },
        {
          "id": "js_market_edge",
          "type": "number",
          "topic": "expectation",
          "prompt": "You offer to buy at 9 and sell at 12 on the total of three dice, and a trader hits your bid and sells you the total at 9 — how much do you expect to make?",
          "vizHint": "Run the same trade over and over and watch your profit per go settle.",
          "viz": "jsMarketEdge",
          "answerNumber": 1.5,
          "tolerance": 0.05,
          "placeholder": "pounds",
          "answerValue": "1.5",
          "explain": "Three dice average ten and a half, so you have bought something worth ten and a half for nine: an edge of a pound and a half, on every trade you do at that price. Notice you lose on plenty of individual rolls — anything under nine and you are out of pocket — and it makes no difference. Your edge is the gap between the price you traded and what the thing is really worth."
        },
        {
          "id": "js_next_card",
          "type": "choice",
          "topic": "expectation",
          "prompt": "A shuffled deck is turned over one card at a time and before each card you call red or black — playing as well as you possibly can, how many of the 52 do you get right on average?",
          "vizHint": "Run whole decks under the best rule and watch the average settle.",
          "viz": "jsNextCard",
          "choices": [
            "26 — you cannot beat a coin flip",
            "About 30",
            "About 39",
            "About 45"
          ],
          "answer": 1,
          "answerValue": "about 30",
          "explain": "Always call whichever colour has more cards left. Early on that barely helps, because the deck is nearly even and you are close to a coin flip. Late on it helps enormously, and the final card you know for certain. Add it up across the whole deck and you get about thirty — counting what has gone is worth four free cards, and no more than that."
        },
        {
          "id": "js_decline",
          "type": "choice",
          "topic": "betting",
          "prompt": "A stranger suggests a game where you both roll a die in secret, he then decides whether the bet is on, and if it is the higher roll wins £10 from the other — he only says yes on a five or a six, so how do the rounds that actually happen go for you?",
          "vizHint": "Play the rounds he agrees to and watch your running average.",
          "viz": "jsDecline",
          "choices": [
            "You lose about £6.70 a round",
            "You lose about £2.20 a round",
            "It is a fair game — the die is fair",
            "You win about £1.70 a round"
          ],
          "answer": 0,
          "answerValue": "lose about £6.70",
          "explain": "The die is fair, the rules are symmetric, and you are still taken to pieces. He shows a five and you beat it one time in six; he shows a six and you never beat it. On the rounds that happen you hand over six pounds seventy on average — the two pounds twenty it costs you per round overall only looks smaller because he throws most rounds away. Whenever the other side chooses whether to trade, the trades you get are the ones you did not want."
        },
        {
          "id": "js_red_stop",
          "type": "choice",
          "topic": "betting",
          "prompt": "Cards are turned from a shuffled deck one at a time, and at any moment you may stop and bet a pound that the next card is red — you must bet before the deck runs out, so what is the game worth?",
          "vizHint": "Turn cards, watch the deck lean red or black, and bet whenever you like.",
          "viz": "jsRedStop",
          "choices": [
            "Nothing at all",
            "About 20p",
            "About 50p",
            "About £1"
          ],
          "answer": 0,
          "answerValue": "nothing",
          "explain": "It feels obvious that you wait for a black-heavy start and then pounce, and the chance really is above a half once more blacks have gone. The catch is that the deck only leans red because it might just as easily have leant black, and the times it leans the wrong way cost exactly what the good times pay. Work backwards from the last card and every position, under every waiting rule, comes out at zero. A bet whose odds move around is not the same thing as a bet you can beat."
        },
        {
          "id": "js_st_petersburg",
          "type": "choice",
          "topic": "expectation",
          "prompt": "A coin is flipped until it lands heads and you are paid £2 if that is the first flip, £4 if the second, £8 if the third and so on doubling, but the house can never pay out more than a million pounds — what is a seat at this game worth?",
          "vizHint": "Drag the size of the house's bank and watch what the game is worth.",
          "viz": "jsStPete",
          "choices": [
            "About £5",
            "About £21",
            "About £500",
            "It is worth an unlimited amount"
          ],
          "answer": 1,
          "answerValue": "about £21",
          "explain": "With no ceiling the average payout really is infinite: every doubling of the prize is exactly cancelled by the halving of its chance, so each further flip adds another pound, for ever. But every one of those pounds lives in a payout larger than any bank on earth. Cap the house at a million and only about twenty-one pounds of it survives; cap it at a billion and you get thirty-one. An average that lives entirely in outcomes nobody can pay is not a price."
        },
        {
          "id": "js_coupon",
          "type": "number",
          "topic": "expectation",
          "prompt": "You roll a die again and again until every one of the six faces has turned up at least once — how many rolls does that take on average?",
          "vizHint": "Collect the six faces thousands of times and watch the average settle.",
          "viz": "jsCoupon",
          "answerNumber": 14.7,
          "tolerance": 0.4,
          "placeholder": "rolls",
          "answerValue": "14.7",
          "explain": "The first face is free. The second takes about one and a fifth rolls, because five faces in six are still new. But the last missing face shows up one roll in six, so on its own it costs six rolls of waiting. Add the six waits and you get fourteen and seven tenths — nearly half of it spent hunting the final face. Collecting the last of anything is where all the time goes."
        },
        {
          "id": "js_order_bets",
          "type": "order",
          "topic": "expectation",
          "prompt": "Four bets, all settled on ordinary dice — put them in order of what they are worth.",
          "orderPrompt": "Tap them in order — cheapest first.",
          "items": [
            "£10 if one roll shows a six",
            "£10 if a six shows on either of two dice",
            "£1 for every pip on one roll",
            "£10 if two dice total seven or more"
          ],
          "vizHint": "Run all four bets side by side and watch their averages separate.",
          "viz": "jsOrderBets",
          "answerValue": "six, two-dice six, pips, seven or more",
          "explain": "The two in the middle are the surprise. A six somewhere on two dice pays out eleven times in thirty-six, worth just over three pounds — slightly less than simply being paid the pips, which averages three and a half. And seven or more is the biggest of the four not because seven is special but because 'or more' quietly hands you everything above it: twenty-one of the thirty-six rolls."
        },
        {
          "id": "js_two_cards",
          "type": "truefalse",
          "topic": "betting",
          "prompt": "Two different numbers from 1 to 10 are drawn at random onto two face-down cards, you turn one over, and you may keep it or switch to the other — you win if you end up holding the bigger number.",
          "statement": "There is a way of deciding that wins more than half the time.",
          "vizHint": "Drag the line you keep a card at and watch the win rate move.",
          "viz": "jsTwoCards",
          "answerBool": true,
          "answerValue": "true",
          "explain": "Keeping every card wins half the time, and so does switching every time — so it feels like the card you turned over told you nothing. It did: a nine is probably the bigger one, a two probably is not. Keep anything six or higher and switch otherwise and you win more than three times in four. Every line between the extremes beats a coin flip, so a single observation you were about to throw away was worth a great deal."
        },
        {
          "id": "js_bust",
          "type": "number",
          "topic": "betting",
          "prompt": "You keep rolling a die and adding the pips to a pot, but the moment a one comes up the whole pot is wiped out — how big does the pot have to be before another roll is no longer worth taking?",
          "vizHint": "Drag the pot you stop at and watch what the game is worth.",
          "viz": "jsBust",
          "answerNumber": 20,
          "tolerance": 0,
          "placeholder": "pips in the pot",
          "answerValue": "20",
          "explain": "One more roll adds four pips on average on the five faces that are safe, which works out at three and a third pips of gain. It also destroys the pot one time in six. Those two balance exactly when the pot is twenty: below that, roll; above it, walk away. Played that way the game is worth a little over eight pips, and almost everybody stops far too early."
        },
        {
          "id": "js_first_ace",
          "type": "number",
          "topic": "expectation",
          "prompt": "A shuffled deck is turned over one card at a time — on average, how far down the deck is the first ace?",
          "vizHint": "Shuffle thousands of decks and watch where the first ace lands.",
          "viz": "jsFirstAce",
          "answerNumber": 10.6,
          "tolerance": 0.3,
          "placeholder": "cards down",
          "answerValue": "10.6",
          "explain": "The four aces cut the other forty-eight cards into five piles: before the first ace, three gaps between aces, and the tail after the last. By symmetry each pile is the same size on average, forty-eight divided by five, which is nine and three fifths. Add the ace itself and the first one sits ten and three fifths cards down — much sooner than the thirteen most people expect."
        },
        {
          "id": "js_fair_scan",
          "type": "tap",
          "topic": "expectation",
          "prompt": "Four bets are on the table with their prices — tap the only one worth taking.",
          "vizHint": "Tap a bet and watch what it makes per go settle.",
          "viz": "jsFairScan",
          "regions": [
            {
              "id": "pips",
              "label": "£4: the pips"
            },
            {
              "id": "larger",
              "label": "£4: larger of two"
            },
            {
              "id": "six",
              "label": "£2: £12 for a six"
            },
            {
              "id": "total",
              "label": "£8: total of two"
            }
          ],
          "answerRegion": "larger",
          "answerValue": "larger of two",
          "explain": "The pips on one die average three and a half, so four pounds is a poor price. Twelve pounds for a six pays two on average and costs two — no edge either way, and no reason to play. The total of two dice averages seven, so eight is daylight robbery. The larger of two rolls is the one people undervalue: two attempts at a high number average nearly four and a half, so four pounds is free money."
        }
      ]
    },
    {
      "id": "citadel",
      "name": "Citadel set",
      "blurb": "Signal against noise, portfolios, and the arithmetic of risk.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Risk and swings",
        "Drawdowns",
        "Diversification",
        "Correlation",
        "Track records",
        "Signal against noise"
      ],
      "samples": [
        {
          "prompt": "A fund has a bad year and drops 40% — by what percentage does it have to rise to get back to where it started?",
          "note": "Why the hole gets steeper faster than it gets deeper."
        },
        {
          "prompt": "Two traders both average £1,000 a day, but one's swings are ten times the other's — how much longer a track record does the wild one need before you believe it?",
          "note": "Noise falls with the square root, so ten times the swings costs a hundred times the days."
        }
      ],
      "honestly": "Twelve questions on risk that a spreadsheet will not teach you — each one with a picture you can drive and an answer a machine re-derives.",
      "questions": [
        {
          "id": "cit_recovery",
          "type": "number",
          "topic": "growth",
          "prompt": "A fund has a bad year and drops 40% — by what percentage does it have to rise to get back to where it started?",
          "vizHint": "Drag the size of the fall and watch the climb you need.",
          "viz": "citRecovery",
          "answerNumber": 66.7,
          "tolerance": 0.8,
          "placeholder": "percent",
          "answerValue": "66.7",
          "explain": "After losing forty percent you hold sixty pence in the pound, and turning sixty back into a hundred means adding forty on top of sixty — two thirds of what is left, not the forty percent you lost. Gains and losses are measured from different starting points, which is why the hole gets steeper faster than it gets deeper: a half needs a double to repair, and ninety percent needs a ten-bagger."
        },
        {
          "id": "cit_same_average",
          "type": "choice",
          "topic": "growth",
          "prompt": "Fund A gains 100% one year then loses 50% the next, while fund B gains 25% two years running — both averaged 25% a year, so where is A's money now?",
          "vizHint": "Step through the two years and watch both piles of money.",
          "viz": "citTwoFunds",
          "choices": [
            "It is exactly where it started",
            "It is up 25%",
            "It is up 56%",
            "It is down 25%"
          ],
          "answer": 0,
          "answerValue": "unchanged",
          "explain": "Double your money and then halve it and you are back where you began, whatever the average of plus one hundred and minus fifty says. Fund B, with exactly the same average, is up fifty-six percent. The average of the yearly returns is not the return you earned, and the wilder the ride the bigger the gap — which is why an advert quoting the average year is not quoting your money."
        },
        {
          "id": "cit_median_vs_mean",
          "type": "choice",
          "topic": "growth",
          "prompt": "You put £100 into a bet that each year either gains 50% or loses 40% on the toss of a coin — after twenty years, what does a typical run leave you with?",
          "vizHint": "Run a few hundred twenty-year paths and see where most of them end up.",
          "viz": "citTypicalRun",
          "choices": [
            "About £35",
            "About £100",
            "About £265",
            "About £700"
          ],
          "answer": 0,
          "answerValue": "about £35",
          "explain": "The average across every possible run really is about two hundred and sixty-five pounds, because a handful of enormous runs drag it up. But a typical run has ten good years and ten bad ones, and a fifty percent gain paired with a forty percent loss leaves ninety pence in the pound — ten of those pairs turn your hundred into thirty-five. The average is carried by outcomes almost nobody gets, so with swings this big the typical result and the average result are different investments."
        },
        {
          "id": "cit_correlation_r2",
          "type": "choice",
          "topic": "statistics",
          "prompt": "Two things move together with a correlation of 0.7, which sounds like a strong link — how much of the wobble in one is actually accounted for by the other?",
          "vizHint": "Drag the cloud tighter and looser and see what each correlation really looks like.",
          "viz": "citCloudDial",
          "choices": [
            "About a third",
            "About half",
            "About seven tenths",
            "Nearly all of it"
          ],
          "answer": 1,
          "answerValue": "about half",
          "explain": "A correlation is not a percentage of anything. To get the share of the movement explained you multiply it by itself: seven tenths of seven tenths is about a half, so half the wobble is still the other thing's own business. Drag the cloud out to 0.7 and it still looks like a blob, which is the honest picture — and the correlation of a half that people call 'moderate' explains only a quarter."
        },
        {
          "id": "cit_cloud_order",
          "type": "order",
          "topic": "statistics",
          "prompt": "Four clouds of dots, each one a pile of measurements taken in pairs — put them in order of how strongly the two things are linked.",
          "orderPrompt": "Tap them in order — weakest link first.",
          "items": [
            "Cloud B",
            "Cloud D",
            "Cloud A",
            "Cloud C"
          ],
          "vizHint": "Tap a cloud to see it up close.",
          "viz": "citClouds",
          "answerValue": "B, D, A, C",
          "explain": "The eye is bad at this. B is a shapeless blob at about a tenth, D is about a third, A is six tenths, and only C — very nearly a straight line — is strong, at 0.85. Most people rate the weak ones far too high, because a slight tilt in a blob looks like a relationship. In markets nearly everything lives between B and D, which is why a chart that 'clearly shows' a link usually shows nothing you could trade."
        },
        {
          "id": "cit_diversify",
          "type": "number",
          "topic": "statistics",
          "prompt": "You run ten strategies at once, each averaging 5% a year with swings of about 20%, and none of them has anything to do with any other — what are the swings of the ten together?",
          "vizHint": "Drag the number of strategies and watch the swings fall.",
          "viz": "citDiversify",
          "answerNumber": 6.3,
          "tolerance": 0.4,
          "placeholder": "percent",
          "answerValue": "6.3",
          "explain": "The expected return stays at five percent — you gave up nothing at all. The swings fall by the square root of the number of strategies: the square root of ten is a bit over three, and twenty divided by that is a little over six. This is the closest thing to a free lunch in finance, the same expected return for a third of the pain, and it comes purely from not putting it all in one thing."
        },
        {
          "id": "cit_correlated_floor",
          "type": "truefalse",
          "topic": "statistics",
          "prompt": "The same ten strategies, except now every pair of them moves together with a correlation of a half.",
          "statement": "Adding more and more of them still washes almost all of the swings away.",
          "vizHint": "Drag the number of strategies; the gold line is the independent case.",
          "viz": "citFloor",
          "answerBool": false,
          "answerValue": "false",
          "explain": "False, and this is what breaks portfolios in a crisis. The part of each strategy that is its own is diversified away exactly as before, but the part they all share is not — it simply stays. With a correlation of a half the swings stop falling at about seven tenths of a single strategy's, around fourteen percent, and a thousand strategies get you no further than fifty do. Diversification buys you the private half and never the shared half."
        },
        {
          "id": "cit_track_record",
          "type": "choice",
          "topic": "statistics",
          "prompt": "Two traders both average £1,000 a day, but one's day-to-day swings are about £1,000 and the other's about £10,000, and twenty days is enough to convince you about the steady one — how long do you need for the wild one?",
          "vizHint": "Drag the number of days and see how wrong the measured average can still be.",
          "viz": "citTrackRecord",
          "choices": [
            "About 40 days",
            "About 200 days",
            "About 2,000 days",
            "About 20,000 days"
          ],
          "answer": 2,
          "answerValue": "about 2,000 days",
          "explain": "The noise in a measured average falls with the square root of the number of days, so swallowing ten times more noise needs a hundred times more days, not ten. Twenty days becomes two thousand — eight years of trading for the same confidence. It is also why the loudest track records tell you the least: the strategies with the biggest swings are exactly the ones whose records take a career to read."
        },
        {
          "id": "cit_ruin",
          "type": "choice",
          "topic": "betting",
          "prompt": "A trade wins you £1 six times in ten and loses £1 the other four, you start with £5, and you are finished for good if you ever reach zero — what is the chance you eventually go bust?",
          "vizHint": "Run hundreds of lifetimes and count how many die.",
          "viz": "citRuin",
          "choices": [
            "About 1 in 100",
            "About 1 in 8",
            "About 1 in 3",
            "About half"
          ],
          "answer": 1,
          "answerValue": "about 1 in 8",
          "explain": "A six-to-four edge is enormous and you still go broke about thirteen times in a hundred, because five pounds is not much of a cushion against a bad run at the start. Every extra pound of cushion multiplies your chance of surviving: start with ten and the risk falls under two in a hundred, start with twenty and it is nearly nothing. Your edge decides whether you win in the long run; the size of your stake decides whether you are still there for it."
        },
        {
          "id": "cit_losing_year",
          "type": "truefalse",
          "topic": "statistics",
          "prompt": "A strategy makes 10% a year on average, with the usual bell-shaped wobble of about 15% around it.",
          "statement": "Even so, it loses money in roughly one year in four.",
          "vizHint": "Run years of returns and count the red ones.",
          "viz": "citLosingYear",
          "answerBool": true,
          "answerValue": "true",
          "explain": "True. A losing year needs the wobble to come in worse than minus ten, which is two thirds of a typical wobble below the average, and that happens about twenty-five times in a hundred. A strategy earning two thirds of its own swing every year is genuinely excellent — and it still spends a quarter of its life apologising. Judging a manager on one year is a coin flip with extra steps."
        },
        {
          "id": "cit_accuracy_trap",
          "type": "choice",
          "topic": "machine_learning",
          "prompt": "Over a hundred days Alan forecast the weather correctly 70 times and Brenda only 66, but Alan said 'dry' every single day — whose forecasts are worth having?",
          "vizHint": "Light up the rainy days, then Alan's calls, then Brenda's.",
          "viz": "citForecast",
          "choices": [
            "Alan — being right more often is what matters",
            "Brenda, even though she is right less often",
            "They are worth exactly the same",
            "Neither of them tells you anything"
          ],
          "answer": 1,
          "answerValue": "Brenda",
          "explain": "It was dry on seventy of the hundred days, so Alan's seventy percent is precisely what you score by never thinking about the weather at all — his number measures the climate, not the forecaster. Brenda scores lower and is the only one saying anything: on the days she calls rain it rains nearly half the time, on the days she calls dry it rains one time in five. A forecast is worth having when the outcome changes depending on what it says."
        },
        {
          "id": "cit_mix_tap",
          "type": "tap",
          "topic": "statistics",
          "prompt": "Fund A swings about 20% a year and fund B about 30%, and they tend to move in opposite directions — tap the mix with the smallest swings.",
          "vizHint": "Tap a mix and watch twenty years of it wobble.",
          "viz": "citMix",
          "regions": [
            {
              "id": "all_a",
              "label": "All in A"
            },
            {
              "id": "mostly_a",
              "label": "70% A, 30% B"
            },
            {
              "id": "half",
              "label": "Half and half"
            },
            {
              "id": "all_b",
              "label": "All in B"
            }
          ],
          "answerRegion": "mostly_a",
          "answerValue": "70% A",
          "explain": "Mixing in the wilder fund makes you steadier, which is the part that sounds wrong. Because the two lean against each other, a seventy-thirty mix swings about fourteen percent — less than either fund on its own, and less than the even split, which takes on too much of B's bigger wobble. The right question about an investment is never how risky it is by itself, but which way it moves when everything else you hold is falling."
        }
      ]
    },
    {
      "id": "optiver_speed",
      "name": "Optiver speed round",
      "blurb": "Eighty sums in eight minutes, then the trading question.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Mental arithmetic against a clock",
        "Reading a spread",
        "Edge and where it comes from",
        "Percentages that do not undo",
        "Fractions and sixteenths",
        "Estimation to the right size"
      ],
      "samples": [
        {
          "prompt": "A market is 41 bid at 46 and you are certain the fair price is 44 — do you buy, sell, or stand aside?",
          "note": "The question that comes straight after the arithmetic."
        },
        {
          "prompt": "A price falls 20% — by what percentage must it rise to get back to where it started?",
          "note": "Why two equal-looking moves never cancel."
        }
      ],
      "honestly": "Twelve written, drawn and machine-checked questions on the arithmetic and the trading instinct behind the speed test — every one with an interactive picture.",
      "questions": [
        {
          "id": "opt_spread_read",
          "type": "choice",
          "topic": "betting",
          "prompt": "A market is 41 bid at 46 and you are certain the fair price is 44 — do you buy, sell, or stand aside?",
          "vizHint": "Drag your fair value through the market and watch both edges.",
          "viz": "optSpreadLadder",
          "choices": [
            "Buy — 44 is above the bid",
            "Sell — 44 is below the offer",
            "Stand aside — both trades lose money",
            "Either one — they are equally good"
          ],
          "answer": 2,
          "answerValue": "stand aside",
          "explain": "You can only buy at 46, which is two above what you think it is worth, and you can only sell at 41, which is three below. Both trades hand money away. The middle of the market is not a price anyone will give you — the only two prices on offer are the ends, and your fair value sits between them."
        },
        {
          "id": "opt_edge_pounds",
          "type": "number",
          "topic": "betting",
          "prompt": "The market is 41 bid at 46, you are sure the fair price is 50, and you buy at 46 — how much edge is that, per contract?",
          "vizHint": "Drag fair value and watch the edge on each side split apart.",
          "viz": "optEdgeCount",
          "answerNumber": 4,
          "tolerance": 0,
          "placeholder": "edge per contract",
          "answerValue": "4",
          "explain": "Edge is the gap between what you paid and what the thing is worth: 46 up to 50, so four. Not nine — the 41 bid is where somebody else would buy from you and has nothing to do with the trade you did. Not five either: the width of the market is a cost you can see, but edge is measured against fair value alone."
        },
        {
          "id": "opt_cross_cost",
          "type": "truefalse",
          "topic": "betting",
          "prompt": "A market is 99 bid at 101, and you buy at 101 and then change your mind and sell straight back.",
          "statement": "You are down the full width of the market, not half of it.",
          "vizHint": "Step the round trip through and watch the wallet.",
          "viz": "optRoundTrip",
          "answerBool": true,
          "answerValue": "true",
          "explain": "You paid 101 and received 99, so you are down two — the whole width. Each leg cost one against the middle and there were two legs. That is why crossing the market in and out all day means being right by more than the entire width just to break even, and why the patient trader who waits at the bid starts each trade a point ahead of the impatient one."
        },
        {
          "id": "opt_quote_width",
          "type": "choice",
          "topic": "betting",
          "prompt": "You must quote a two-way price on something you think is 500 but which could easily turn out to be 400 or 600, and you quote 495 at 505 — what happens next?",
          "vizHint": "Set your width, then let a hundred customers trade against it.",
          "viz": "optQuoteWidth",
          "choices": [
            "You collect the ten-wide spread whichever way they trade",
            "Nobody trades with you — the quote is too tight",
            "They trade the side you are wrong about, and ten wide nowhere near covers being a hundred out",
            "It is a coin flip — you win as often as you lose"
          ],
          "answer": 2,
          "answerValue": "you get picked off on the side you are wrong about",
          "explain": "The other side chooses which end to trade and will always choose the end that suits them. If the truth is 600 they lift your 505 and you are ninety-five down; if it is 400 they hit your 495 and you are ninety-five down again. A quote's width has to be paid for by how wrong you might be, not by how tight you would like to look."
        },
        {
          "id": "opt_percent_undo",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "A price falls 20% — by what percentage must it rise to get back to where it started?",
          "vizHint": "Drag the size of the fall and watch the climb back grow faster than it does.",
          "viz": "optRecoverBar",
          "answerNumber": 25,
          "tolerance": 0,
          "placeholder": "percent",
          "answerValue": "25",
          "explain": "Twenty-five. The fall takes a hundred down to eighty, and the climb back is twenty pounds measured against eighty, not against the hundred you started with. A percentage is always a percentage of something, and a loss shrinks the thing the next one is measured against. Which is why a half lost needs a double to undo, and nine tenths lost needs a tenfold rise."
        },
        {
          "id": "opt_percent_order",
          "type": "truefalse",
          "topic": "mental_maths",
          "prompt": "One book goes up 10% and then down 10%; another goes down 10% and then up 10%.",
          "statement": "The two books end up in different places.",
          "vizHint": "Run both orders side by side and watch them land together.",
          "viz": "optPercentOrder",
          "answerBool": false,
          "answerValue": "false",
          "explain": "Both end at 99 pence in the pound. Growing by a tenth and shrinking by a tenth is multiplying by 1.1 and by 0.9, and multiplication does not care which you do first. The thing to notice is not the order but the shortfall — two ten-percent moves that look like they cancel leave you a percent light, every time."
        },
        {
          "id": "opt_sixteenths_order",
          "type": "order",
          "topic": "mental_maths",
          "prompt": "American stocks were quoted in sixteenths until 2001 — put these four prices in order.",
          "orderPrompt": "Tap them in order — smallest first.",
          "items": [
            "3/8",
            "0.4",
            "7/16",
            "0.45"
          ],
          "vizHint": "Drag the marker along the ruler; every sixteenth is labelled both ways.",
          "viz": "optSixteenthRuler",
          "answerValue": "3/8, 0.4, 7/16, 0.45",
          "explain": "One sixteenth is 6.25 hundredths, so seven of them is 43.75 — just above four tenths. Three eighths is six sixteenths, 37.5 hundredths, just below. Learn the ladder once — a half is 50, a quarter 25, an eighth 12.5, a sixteenth 6.25 — and every old-fashioned price converts itself while you are still reading it."
        },
        {
          "id": "opt_births_estimate",
          "type": "choice",
          "topic": "counting",
          "prompt": "Eight billion people are alive and a life lasts about seventy-three years — roughly how many babies are born each second?",
          "vizHint": "Step down the chain: people, then a year, then a second.",
          "viz": "optBirthChain",
          "choices": [
            "About 0.3 a second",
            "About 4 a second",
            "About 40 a second",
            "About 400 a second"
          ],
          "answer": 1,
          "answerValue": "about 4 a second",
          "explain": "If the population is roughly steady then about one seventy-third of everybody has to be replaced each year — eight billion over seventy-three is a hundred and ten million births a year. A year holds about thirty-one and a half million seconds, so that is three or four a second. Two numbers you already knew, divided in the right order, land you inside a factor of two, which is all an estimate has to do."
        },
        {
          "id": "opt_basis_points",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "Your book is worth 4.2 million pounds and it is up 35 basis points today — how many pounds is that?",
          "vizHint": "Drag the basis points and watch the pounds keep pace.",
          "viz": "optBasisPoints",
          "answerNumber": 14700,
          "tolerance": 1,
          "placeholder": "pounds",
          "answerValue": "14700",
          "explain": "A basis point is a hundredth of one percent, so thirty-five of them is 0.35 percent. One percent of 4.2 million is 42,000; a third of that is 14,000, and the last half-hundredth adds 700. Traders talk in basis points precisely because it turns a percentage into moving a decimal point four places, which you can do while somebody is still talking."
        },
        {
          "id": "opt_maker_volume",
          "type": "number",
          "topic": "betting",
          "prompt": "You quote 99 bid at 101 all day, 400 contracts trade against you at a pound a point, half buying and half selling — what do you make?",
          "vizHint": "Let the tape run and watch where the money actually comes from.",
          "viz": "optMakerTape",
          "answerNumber": 400,
          "tolerance": 0,
          "placeholder": "pounds",
          "answerValue": "400",
          "explain": "Every trade earns you the distance from the middle out to your price — one point, one pound — whichever side it arrives on. Four hundred trades, four hundred pounds. Notice what is missing from that sum: any view about whether the price goes up or down. A market maker is paid for standing there, and the pay is volume times half the width."
        },
        {
          "id": "opt_pick_market",
          "type": "tap",
          "topic": "betting",
          "prompt": "Three screens show the same contract and you are sure it is worth 100 — tap the market that pays you to trade.",
          "vizHint": "Your fair value is the line. Tap the market that sits clear of it.",
          "viz": "optThreeMarkets",
          "regions": [
            {
              "id": "a",
              "label": "97 bid at 103"
            },
            {
              "id": "b",
              "label": "99 bid at 105"
            },
            {
              "id": "c",
              "label": "101 bid at 104"
            }
          ],
          "answerRegion": "c",
          "answerValue": "101 bid at 104",
          "explain": "A market only pays you when it sits entirely on one side of your fair value. Screen C bids 101, above the 100 you think it is worth, so you sell and keep a point. The tempting wrong answer is B: its middle is 102 and looks rich — but nobody trades at the middle, and the only price B will buy from you at is 99, which loses a point."
        },
        {
          "id": "opt_spread_percent",
          "type": "choice",
          "topic": "mental_maths",
          "prompt": "One share is 200 bid at 202 and another is 20 bid at 20.6 — which is the more expensive one to trade?",
          "vizHint": "Switch the ruler from pennies to percent and watch the bars swap.",
          "viz": "optSpreadPercent",
          "choices": [
            "The 200 at 202",
            "The 20 at 20.6",
            "They cost the same to trade",
            "It depends which way round you trade"
          ],
          "answer": 1,
          "answerValue": "the 20 at 20.6",
          "explain": "Two pence off a 201 price is one percent; six pence off a 20.3 price is nearly three. A spread only means anything next to the price it sits on, which is why nobody quotes width in pennies. Buy and sell the cheap-looking share once and you have given away three percent before the price has moved at all."
        }
      ]
    },
    {
      "id": "mental_maths",
      "name": "Mental maths under pressure",
      "blurb": "The tricks that turn a hard sum into an easy one.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Multiplying without writing anything down",
        "Squares and near-squares",
        "Percentages both ways round",
        "Fractions as decimals",
        "Estimating roots and growth",
        "Checking your own answer"
      ],
      "samples": [
        {
          "prompt": "47 times 53 — both numbers sit three away from fifty. Is it exactly nine less than fifty times fifty?",
          "note": "A rectangle cut and rearranged; the missing corner is the answer."
        },
        {
          "prompt": "You drive 60 miles out at 30 mph and 60 miles home at 60 mph — what is your average speed?",
          "note": "The fast shortcut, and exactly where it breaks."
        }
      ],
      "honestly": "Twelve written, drawn and machine-checked questions. Every one is a trick with a reason behind it, shown working in a picture you can drag.",
      "questions": [
        {
          "id": "mm_eleven_slide",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "To multiply by eleven you slide the two digits apart and drop their sum into the gap — so what is 78 times 11?",
          "vizHint": "Step it through: the digits slide, the sum drops in, the carry moves left.",
          "viz": "mmElevenSlide",
          "answerNumber": 858,
          "tolerance": 0,
          "placeholder": "the answer",
          "answerValue": "858",
          "explain": "Seven and eight slide apart and their sum, fifteen, goes in the gap — but fifteen will not fit in one slot, so the one carries left into the seven and makes it eight: 858. It works because eleven is ten plus one, so you are adding the number to a copy of itself shifted one place along. When the digits add to less than ten there is no carry at all: 36 goes straight to 396."
        },
        {
          "id": "mm_ends_in_five",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "Anything ending in five squares to something ending in 25 — for 85 squared, what are the digits in front of the 25?",
          "vizHint": "Drag the number and watch the square cut itself into a rectangle.",
          "viz": "mmFiveSquare",
          "answerNumber": 72,
          "tolerance": 0,
          "placeholder": "the front digits",
          "answerValue": "72",
          "explain": "Take the 8, multiply by the next number up, and 8 times 9 is 72 — so 85 squared is 7225. The picture is a square of side eighty-five: cut off the five-wide strip along one edge and lay it on top and you have an eighty by ninety rectangle, with a five by five square left over. 25 squared is 625, 65 squared is 4225, and you never multiply anything twice."
        },
        {
          "id": "mm_either_side",
          "type": "truefalse",
          "topic": "mental_maths",
          "prompt": "47 times 53 — both numbers sit three away from fifty.",
          "statement": "It comes to exactly nine less than fifty times fifty.",
          "vizHint": "Drag the gap. The corner that goes missing is the whole story.",
          "viz": "mmEitherSide",
          "answerBool": true,
          "answerValue": "true",
          "explain": "Take the fifty by fifty square, cut a three-wide strip off one side and lay it along the top: you now have a 47 by 53 rectangle, except for a three by three corner that is missing. Nine short of 2500, so 2491. Any pair either side of a round number goes the same way — 98 times 102 is ten thousand minus four."
        },
        {
          "id": "mm_percent_flip",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "Eight percent of 25 is awkward, but 25 percent of 8 is a quarter of eight — and they are the same number, so what is it?",
          "vizHint": "Tip the block on its side. Same squares, easier count.",
          "viz": "mmPercentFlip",
          "answerNumber": 2,
          "tolerance": 0,
          "placeholder": "the answer",
          "answerValue": "2",
          "explain": "Both are eight lots of twenty-five split over a hundred, so you may swap the two numbers whenever one way round is friendlier. Two. This turns nasty percentages into easy ones all day: 18 percent of 50 is 50 percent of 18, which is 9; 4 percent of 75 is 75 percent of 4, which is 3."
        },
        {
          "id": "mm_percent_ladder",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "A bill is 240 pounds and the service is 17.5 percent — take a tenth, then half of that, then half again, and add them up.",
          "vizHint": "Stack the pieces one at a time and watch the total climb.",
          "viz": "mmPercentLadder",
          "answerNumber": 42,
          "tolerance": 0,
          "placeholder": "pounds",
          "answerValue": "42",
          "explain": "A tenth is 24, five percent is half of that, and two and a half percent is half again: 24 plus 12 plus 6 is 42. Any percentage you meet can be built from a tenth and repeated halving, and both of those are things you can do without multiplying anything. Seventeen and a half was the old VAT rate, and this is precisely how shopkeepers did it in their heads."
        },
        {
          "id": "mm_halve_double",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "Halving one side of a multiplication and doubling the other leaves the answer alone — run that on 35 times 16 until it is easy, and what do you get?",
          "vizHint": "Squash and stretch the rectangle. Count the dots each time.",
          "viz": "mmHalveDouble",
          "answerNumber": 560,
          "tolerance": 0,
          "placeholder": "the answer",
          "answerValue": "560",
          "explain": "35 times 16 becomes 70 times 8, then 140 times 4, then 280 times 2, then 560 — and nothing is lost, because every step throws away exactly what it picks up. Picture a rectangle being squashed and stretched: the shape changes, the area cannot. It is the fastest way to deal with anything hiding a 16, a 25 or a 5."
        },
        {
          "id": "mm_sixteenth_tap",
          "type": "tap",
          "topic": "mental_maths",
          "prompt": "The ruler is marked in sixteenths — tap the mark that sits at exactly 0.375.",
          "vizHint": "Tap a tick on the ruler, or use the buttons underneath.",
          "viz": "mmSixteenthRuler",
          "regions": [
            {
              "id": "five",
              "label": "5/16"
            },
            {
              "id": "six",
              "label": "6/16"
            },
            {
              "id": "seven",
              "label": "7/16"
            },
            {
              "id": "eight",
              "label": "8/16"
            }
          ],
          "answerRegion": "six",
          "answerValue": "6/16",
          "explain": "Halve your way down the ladder: a half is 0.5, a quarter 0.25, an eighth 0.125, a sixteenth 0.0625. Three eighths is three lots of 0.125, which is 0.375 — and three eighths is six sixteenths. Six times 0.0625 lands in the same place, which is a free check that you climbed the ladder correctly."
        },
        {
          "id": "mm_compound_shortcut",
          "type": "choice",
          "topic": "growth",
          "prompt": "Three percent a year for twenty-five years — the quick answer multiplies them and says 75 percent bigger, so how far off is that?",
          "vizHint": "Drag the years and watch the quick answer fall behind the real one.",
          "viz": "mmCompoundGap",
          "choices": [
            "It is about right — 75 percent bigger",
            "About 90 percent bigger",
            "About 110 percent bigger — the money more than doubles",
            "About 300 percent bigger"
          ],
          "answer": 2,
          "answerValue": "about 110% bigger",
          "explain": "Multiplying the rate by the years is a fine estimate for a handful of years and badly low over decades, because each year's growth then grows in its turn. Three percent for twenty-five years multiplies your money by 2.09 — more than double, where the quick sum promised 1.75. The shortcut is safe while the total is small and leaks from the moment it gets near a doubling."
        },
        {
          "id": "mm_sqrt_estimate",
          "type": "number",
          "topic": "mental_maths",
          "prompt": "Sixty-four is eight squared, so the square root of seventy is a little over eight — add the leftover six divided by twice the eight, and what do you get?",
          "vizHint": "Drag your guess and watch its square close in on seventy.",
          "viz": "mmSqrtGuess",
          "answerNumber": 8.37,
          "tolerance": 0.05,
          "placeholder": "your estimate",
          "answerValue": "8.37",
          "explain": "Eight and three eighths — 8.375 — and the true root is 8.3666, so the estimate is out by one part in a thousand. The rule is always the same: find the nearest square below, then add what is left over divided by twice that root. It works because over a short stretch a square grows at a near-enough steady rate, so a small step sideways behaves like a straight line."
        },
        {
          "id": "mm_cast_nines",
          "type": "truefalse",
          "topic": "mental_maths",
          "prompt": "A free check on any multiplication: add up a number's digits over and over until one digit is left, and do it to both sides.",
          "statement": "Someone says 47 times 63 is 2861; this check catches it as wrong.",
          "vizHint": "Step through the digit sums on both sides and see them disagree.",
          "viz": "mmCastNines",
          "answerBool": true,
          "answerValue": "true",
          "explain": "47 folds down to 2 and 63 folds down to 9, so the answer must fold to whatever 2 times 9 does — eighteen, which folds to nine. But 2861 folds to eight, so it is wrong; the real answer is 2961. Folding digits like this is really the remainder after dividing by nine, and remainders survive multiplication. The check never proves an answer right — one wrong answer in nine slips past — but it costs two seconds and catches most slips."
        },
        {
          "id": "mm_average_speed",
          "type": "choice",
          "topic": "mental_maths",
          "prompt": "You drive 60 miles out at 30 mph and the same 60 miles home at 60 mph — what is your average speed for the trip?",
          "vizHint": "Drag the speed home. See how high the average can possibly go.",
          "viz": "mmAverageSpeed",
          "choices": [
            "40 mph",
            "42 mph",
            "45 mph",
            "50 mph"
          ],
          "answer": 0,
          "answerValue": "40 mph",
          "explain": "You spend two hours going out and one hour coming back, so the slow half of the trip counts double — averaging the two speeds is the fast, wrong answer. A hundred and twenty miles in three hours is forty. And drive home as fast as you like: the round trip can never average sixty, because you have already used two hours."
        },
        {
          "id": "mm_points_vs_percent",
          "type": "choice",
          "topic": "mental_maths",
          "prompt": "A fund raises its annual fee from 1 percent to 2 percent — how big a rise is that?",
          "vizHint": "Drag the new fee and watch the two ways of saying it come apart.",
          "viz": "mmPointsPercent",
          "choices": [
            "A rise of 1 percent",
            "A rise of 2 percent",
            "A rise of one percentage point, which doubles the fee",
            "Too small to matter either way"
          ],
          "answer": 2,
          "answerValue": "one percentage point, a 100% rise",
          "explain": "The fee went up by one percentage point, and that same move doubled it — a hundred percent more money leaving your pocket every year. Percent and percentage point are different units, and swapping them is how a doubling gets dressed up as a small change. The question to ask every time is: a percentage of what?"
        }
      ]
    },
    {
      "id": "two_sigma",
      "name": "Two Sigma set",
      "blurb": "Data, models, and the traps in between.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Overfitting and leakage",
        "Backtesting honestly",
        "Precision against recall",
        "Regression to the mean",
        "Confounding",
        "How much data is enough",
        "Splitting by time"
      ],
      "samples": [
        {
          "prompt": "One payment in every five hundred is fraud. A lazy model says 'not fraud' to every single payment. What percentage of payments does it get right?",
          "note": "Why accuracy is the wrong word for a rare event."
        },
        {
          "prompt": "A hundred salespeople, all equally good. Put the worst ten on a training course — how many improve next month?",
          "note": "Regression to the mean, mistaken for a result."
        }
      ],
      "honestly": "Twelve written questions, each one an interactive picture you drive yourself, and each answer re-derived by a machine before it reaches you.",
      "questions": [
        {
          "id": "ts_perfect_fit",
          "type": "truefalse",
          "topic": "machine_learning",
          "prompt": "Every morning the market prints a reference number that means nothing at all. A rule looks up yesterday's number in a table and copies whatever happened that day, and tuned on the last twenty days it called all twenty correctly.",
          "statement": "A rule that called all twenty past days right is more likely than not to call tomorrow right.",
          "vizHint": "Fit the table to twenty days, then play tomorrow.",
          "viz": "tsPerfectFit",
          "answerBool": false,
          "answerValue": "false",
          "explain": "The table has a slot for every possible reference number, so it can be bent to agree with any past you show it — fitting twenty days is not evidence, it is bookkeeping. Tomorrow's number is almost always one the table has never seen, and the rule is back to a coin flip. Fitting the past is free. The only score that counts is the one on days the model has never touched."
        },
        {
          "id": "ts_leakage",
          "type": "tap",
          "topic": "machine_learning",
          "prompt": "You are predicting which customers will cancel next month. One of these four columns is quietly telling you the answer.",
          "vizHint": "Tap a column to sort the sixteen customers by it and see who cancelled.",
          "viz": "tsLeakage",
          "regions": [
            {
              "id": "months",
              "label": "Months a customer"
            },
            {
              "id": "calls",
              "label": "Support calls"
            },
            {
              "id": "refund",
              "label": "Day the refund went out"
            },
            {
              "id": "plan",
              "label": "Which plan"
            }
          ],
          "answerRegion": "refund",
          "answerValue": "refund",
          "explain": "A refund only goes out after somebody has cancelled, so that column is the answer wearing a different hat — it splits all sixteen customers perfectly, and no honest column gets past eleven. A model built on it tests brilliantly and is useless on the day, because on the day the refund has not happened yet. Ask of every column: would I really have this number before the thing I am predicting happens?"
        },
        {
          "id": "ts_accuracy_trap",
          "type": "number",
          "topic": "machine_learning",
          "prompt": "One payment in every five hundred is fraud. A lazy model says 'not fraud' to every single payment. What percentage of payments does it get right?",
          "vizHint": "Run payments through the lazy model and watch its score climb.",
          "viz": "tsAccuracyTrap",
          "answerNumber": 99.8,
          "tolerance": 0.05,
          "placeholder": "per cent",
          "answerValue": "99.8",
          "explain": "It is right on all 499 honest payments and wrong on the one fraud: 99.8% right, having caught nothing at all. Accuracy is scored against the easy answer, and when one side is rare the easy answer is nearly always correct. That is why nobody serious quotes accuracy on a rare event — they quote how many of the rare ones you caught, and how much rubbish you flagged to catch them."
        },
        {
          "id": "ts_threshold_dial",
          "type": "number",
          "topic": "machine_learning",
          "prompt": "Two hundred payments, twelve of them fraud, each given a risk score. Drag the alert line down until the model catches nine of the twelve. How many payments is it flagging in total at that point?",
          "vizHint": "Drag the line. Caught and flagged both update as you go.",
          "viz": "tsThresholdDial",
          "answerNumber": 40,
          "tolerance": 0,
          "placeholder": "payments flagged",
          "answerValue": "40",
          "explain": "Nine of the twelve costs you forty alerts, and thirty-one of those forty are innocent. Precision and recall are not two numbers, they are one dial: drag it down and you catch more fraud while a larger share of your alerts are wrong. Catching all twelve here means flagging 122 of the 200 payments, which is not fraud detection, it is switching the business off."
        },
        {
          "id": "ts_rolling_windows",
          "type": "choice",
          "topic": "statistics",
          "prompt": "Two strategies, tested over the same twelve three-month stretches. One made money in eleven of them. The other made twice as much in total, but only in two of them. Which is better evidence of real skill?",
          "vizHint": "Step through the twelve stretches and watch both of them run.",
          "viz": "tsRollingWindows",
          "choices": [
            "The one that made money in eleven of the twelve",
            "The one that made twice as much overall",
            "The same — only the total matters",
            "Neither tells you anything"
          ],
          "answer": 0,
          "answerValue": "the steady one — 11 of 12",
          "explain": "Ask what pure luck does. A coin-flip strategy is up in eleven or more of twelve stretches about three times in a thousand, so that pattern is hard to fake. Being up in only two of twelve is what luck does almost every time — and there the whole profit came from two quarters, so one bad one would have erased it. A single split shows you the total. Rolling windows show you whether it kept happening."
        },
        {
          "id": "ts_regression_mean",
          "type": "choice",
          "topic": "statistics",
          "prompt": "A hundred salespeople, all exactly as good as each other, so every month's figures are pure luck. Take the worst ten this month and send them on a training course. How many of those ten do better next month?",
          "vizHint": "Pick the bottom ten of a hundred lucky months, then run the next month.",
          "viz": "tsRegressionMean",
          "choices": [
            "About five — luck cuts both ways",
            "About seven",
            "About nine or ten",
            "All ten, every time"
          ],
          "answer": 2,
          "answerValue": "about 9 or 10",
          "explain": "About nine and a half of the ten improve, and the course did nothing whatsoever. You picked them because they had a bad month, and a bad month is mostly bad luck, which does not repeat. Anything chosen for being extreme drifts back towards ordinary next time — so a treatment given to the worst always looks like it works, and the same treatment given to the best always looks like it harms them."
        },
        {
          "id": "ts_simpson",
          "type": "choice",
          "topic": "statistics",
          "prompt": "Across twelve corner shops, the ones that spend more on adverts sell less. Now split them into the six at busy stations and the six on quiet roads.",
          "vizHint": "Tap to colour the two kinds of shop and see each trend on its own.",
          "viz": "tsSimpson",
          "choices": [
            "Adverts still look bad in both groups",
            "Adverts look bad for one group and make no difference to the other",
            "Inside each group, more adverts means more sales",
            "The link vanishes completely"
          ],
          "answer": 2,
          "answerValue": "it flips — positive inside each group",
          "explain": "Station shops sell a lot and barely bother advertising; quiet-road shops advertise hard and still sell less. Thrown in one pile, the location does all the talking and adverts look harmful. Split by location and the real link appears: inside each group, more adverts means more sales. A pattern in a mixture can point the opposite way to the pattern inside every part of it, so always ask what else is different between the things you have lumped together."
        },
        {
          "id": "ts_time_split",
          "type": "choice",
          "topic": "machine_learning",
          "prompt": "You have three years of daily prices. You shuffle the days, hold back a random fifth as a test, and your model predicts them almost perfectly. Why should you not celebrate?",
          "vizHint": "Run both splits and compare how wrong the same model is.",
          "viz": "tsTimeSplit",
          "choices": [
            "Each held-back day sits between two training days that nearly give it away",
            "Shuffling adds noise the model cannot cope with",
            "A fifth is far too small a test set",
            "The model is fitting the average instead of the trend"
          ],
          "answer": 0,
          "answerValue": "the neighbouring days give it away",
          "explain": "Yesterday and tomorrow are the strongest hints anyone could have about today, and a random split hands the model both of them for nearly every test day. Hold back the last year instead and the very same model is about six times worse — that is its real skill. Anything with time in it must be split by time, or you are only measuring how well it fills a gap it was shown both sides of."
        },
        {
          "id": "ts_sample_size",
          "type": "choice",
          "topic": "statistics",
          "prompt": "A coin is very slightly bent: it lands heads 51 times in 100 on average. Roughly how many flips before you would reliably notice?",
          "vizHint": "Drag the number of flips and watch your chance of spotting it.",
          "viz": "tsSampleSize",
          "choices": [
            "About 400",
            "About 2,000",
            "About 20,000",
            "About a million"
          ],
          "answer": 2,
          "answerValue": "about 20,000",
          "explain": "At 20,000 flips you would catch a coin like that about four times in five. At 2,000 you would catch it about one time in seven, and at 400 you may as well flip a coin about it. Halving the edge you are hunting multiplies the data you need by four, which is why a small real effect and no effect at all look identical until the sample gets enormous."
        },
        {
          "id": "ts_dimensions",
          "type": "truefalse",
          "topic": "machine_learning",
          "prompt": "Five hundred customers. First you describe each one with two numbers, then with a hundred numbers, and each time you measure who is close to whom.",
          "statement": "With a hundred numbers each, a customer's nearest neighbour is almost as far away as their farthest.",
          "vizHint": "Tap a bar to see how near the nearest customer really is.",
          "viz": "tsDimensions",
          "answerBool": true,
          "answerValue": "true",
          "explain": "True. With two numbers the nearest customer sits at about 2% of the distance to the farthest; with a hundred that rises to about 70%, so everybody is roughly the same distance from everybody. Every extra column adds its own little difference to every pair, and those differences average out instead of piling up. 'Find me similar customers' quietly stops meaning anything once you feed it enough columns."
        },
        {
          "id": "ts_walk_correlation",
          "type": "choice",
          "topic": "statistics",
          "prompt": "Two share prices that are pure coin flips, with nothing whatsoever connecting them. Watch a year of both. How often will they look strongly linked — a correlation past 0.5, up or down?",
          "vizHint": "Run pairs of unconnected walks and watch the correlations pile up.",
          "viz": "tsWalkCorrelation",
          "choices": [
            "Almost never",
            "About one year in twenty",
            "About one year in ten",
            "About four years in ten"
          ],
          "answer": 3,
          "answerValue": "about 4 years in 10",
          "explain": "About four times in ten, from two things that have never met. A price that wanders keeps whatever drift it happened to pick up, so two wandering lines usually spend the year both drifting up, or both drifting down, and correlation reads that as a relationship. Correlation between two trending lines is close to meaningless, which is why people compare the day-to-day moves instead of the levels."
        },
        {
          "id": "ts_evidence_order",
          "type": "order",
          "topic": "statistics",
          "prompt": "Four people each set out to show that a coin is bent. Here is what each of them got.",
          "orderPrompt": "Tap them in order — weakest evidence that the coin is bent first.",
          "items": [
            "8 heads in 10 flips",
            "60 heads in 100 flips",
            "550 heads in 1,000 flips",
            "5,200 heads in 10,000 flips"
          ],
          "vizHint": "Run fair coins and see how often luck alone matches each result.",
          "viz": "tsEvidenceOrder",
          "answerValue": "8 in 10, 60 in 100, 550 in 1000, 5200 in 10000",
          "explain": "The biggest lead is the weakest evidence. Eight heads in ten happens to a fair coin about one time in nine; a mere 52% over ten thousand flips happens about once in fifteen thousand. What counts is not how far ahead the heads are in percentage terms, but how far ahead they are compared with the wobble you would expect from that many flips — and that wobble shrinks like the square root of the number of flips."
        }
      ]
    },
    {
      "id": "brainteaser_classics",
      "name": "Brainteaser classics",
      "blurb": "The canon, drawn rather than written.",
      "priceUsd": null,
      "status": "locked",
      "topics": [
        "Parity",
        "Information and coding",
        "Hats and deduction",
        "Scheduling under a constraint",
        "Backward induction",
        "Cycles and shuffles",
        "Searching a state space"
      ],
      "samples": [
        {
          "prompt": "A hundred lockers, all shut. Someone flips every locker, then every second one, then every third, a hundred times over. How many are left open?",
          "note": "Parity, and why squares are the odd ones out."
        },
        {
          "prompt": "A hundred passengers, one lost boarding pass. What is the chance the last passenger gets their own seat?",
          "note": "The answer that does not change with the size of the plane."
        }
      ],
      "honestly": "The twelve classics that are still worth asking, each one playable rather than read: burn the ropes, send the pairs across, follow the boxes. Every answer is re-derived by a machine.",
      "questions": [
        {
          "id": "bt_lockers",
          "type": "number",
          "topic": "puzzles",
          "prompt": "A hundred lockers, all shut. Someone walks the corridor a hundred times: the first pass flips every locker, the second flips every second one, the third every third, and so on to the hundredth. How many lockers are left open?",
          "vizHint": "Step through the passes and watch the doors flip.",
          "viz": "btLockers",
          "answerNumber": 10,
          "tolerance": 0,
          "placeholder": "lockers open",
          "answerValue": "10",
          "explain": "A locker is flipped once for every number that divides it, and it ends up open only if that count is odd. Divisors normally come in pairs — 3 and 6 both divide 18 — so the count is normally even. The exception is a square, where one pair is the same number twice: six times six is thirty-six, and that single unpaired divisor leaves the door open. Ten squares fit under a hundred, so ten doors stay open."
        },
        {
          "id": "bt_hats_line",
          "type": "number",
          "topic": "puzzles",
          "prompt": "A hundred prisoners stand in a line, each wearing a black or white hat and able to see only the hats in front. Starting from the back, each says one word — a colour — and lives if it matches their own hat. They may agree a plan beforehand. How many can they guarantee to save?",
          "vizHint": "Play the line and watch each deduction land.",
          "viz": "btHatsLine",
          "answerNumber": 99,
          "tolerance": 0,
          "placeholder": "how many are safe?",
          "answerValue": "99",
          "explain": "The one at the back counts the white hats in front of him and says 'white' if that count is even and 'black' if it is odd. He is gambling with his own life and has a fifty-fifty chance. Everyone else can count too: each of the ninety-nine tracks the colours already called and the hats still visible, and works out their own colour exactly. One word carries one yes-or-no, and one yes-or-no shared by the whole line is enough to save ninety-nine of them."
        },
        {
          "id": "bt_wine",
          "type": "number",
          "topic": "information_theory",
          "prompt": "A thousand bottles, exactly one of them poisoned. Anyone who sips the poison dies in twenty-four hours, and twenty-four hours is all you have. What is the fewest tasters you need to be certain which bottle it is?",
          "vizHint": "Drag to any bottle and see which tasters sip from it.",
          "viz": "btWine",
          "answerNumber": 10,
          "tolerance": 0,
          "placeholder": "tasters",
          "answerValue": "10",
          "explain": "Give every bottle its own pattern of sips: for each bottle, each taster either drinks from it or does not. A day later, the pattern of who died names the bottle — as long as no two bottles share a pattern. Ten tasters make 1,024 different patterns, which is enough for a thousand bottles. Nine make only 512, so two bottles would have to share, and you could not tell them apart. Each taster is one yes-or-no answer, and the answers all arrive at once."
        },
        {
          "id": "bt_bridge",
          "type": "number",
          "topic": "puzzles",
          "prompt": "Four people must cross a rickety bridge at night. At most two cross at a time, whoever crosses must carry the one torch, and a pair moves at the slower one's pace. They take 1, 2, 5 and 10 minutes. What is the fastest everyone can be across?",
          "vizHint": "Send the pairs across yourself and watch the clock.",
          "viz": "btBridge",
          "answerNumber": 17,
          "tolerance": 0,
          "placeholder": "minutes",
          "answerValue": "17",
          "explain": "The obvious plan — the fastest one ferries everybody — costs 19 minutes, because the ten-minute walker and the five-minute walker each cross on their own. The trick is to send the two slow ones together so their times overlap: 1 and 2 cross, 1 comes back, 5 and 10 cross together, 2 comes back, 1 and 2 cross again. Seventeen. What you are really minimising is the walking back, not the crossings."
        },
        {
          "id": "bt_ropes",
          "type": "order",
          "topic": "puzzles",
          "prompt": "Two ropes. Each takes exactly an hour to burn end to end, but neither burns at a steady rate, so half a rope is not half an hour. You have a lighter and nothing else.",
          "orderPrompt": "Tap the four moments in order — this is how you time forty-five minutes.",
          "items": [
            "Light both ends of the first rope, and one end of the second",
            "The first rope burns out — half an hour gone",
            "Light the second end of the second rope",
            "The second rope burns out — forty-five minutes"
          ],
          "vizHint": "Light any end you like and watch the clock run.",
          "viz": "btRopes",
          "answerValue": "45 minutes",
          "explain": "A rope lit at both ends is gone in thirty minutes however uneven it is, because between them the two flames still eat exactly one rope. So when the first rope dies, thirty minutes have passed and the second rope has exactly thirty minutes of burning left in it. Light its other end and that thirty becomes fifteen. Thirty and fifteen make forty-five — and burning from both ends is the only way to halve something you cannot measure."
        },
        {
          "id": "bt_boarding",
          "type": "choice",
          "topic": "probability",
          "prompt": "A hundred passengers board a full flight. The first has lost their boarding pass and sits in a random seat. Everyone after that takes their own seat if it is free, and a random free one if it is not. What is the chance the last passenger gets their own seat?",
          "vizHint": "Board one plane slowly, or run five hundred at once.",
          "viz": "btBoarding",
          "choices": [
            "1 in 100",
            "1 in 2",
            "1 in 3",
            "Almost none"
          ],
          "answer": 1,
          "answerValue": "1 in 2",
          "explain": "By the time the last passenger boards, exactly one seat is left, and it is either their own or the very first passenger's — every other seat gets claimed by its owner along the way. Each random choice that happens is equally likely to land on either of those two, so neither can be favoured. A half, and it stays a half for a plane of ten or a plane of a million."
        },
        {
          "id": "bt_pirates",
          "type": "number",
          "topic": "puzzles",
          "prompt": "Five pirates, ranked one to five, split 100 gold coins. The top pirate proposes a split and everyone votes; if at least half agree it stands, otherwise he goes overboard and the next in line proposes. All five are perfectly logical and want, in this order, to live and then to be rich. How many coins does the top pirate keep?",
          "vizHint": "Step down to two pirates and work your way back up.",
          "viz": "btPirates",
          "answerNumber": 98,
          "tolerance": 0,
          "placeholder": "coins",
          "answerValue": "98",
          "explain": "Work backwards. With two left the senior takes everything, since his own vote is half of two. So with three, the bottom pirate knows he gets nothing if the proposer dies, and a single coin buys his vote. With four, the same single coin buys whoever would get nothing next. With five, the top pirate needs two votes besides his own, and the two who would get nothing under the four-pirate plan each sell theirs for one coin. Ninety-eight, nothing, one, nothing, one."
        },
        {
          "id": "bt_jugs",
          "type": "number",
          "topic": "puzzles",
          "prompt": "A five-litre jug, a three-litre jug and a tap. Nothing is marked. A move is filling a jug, emptying a jug, or pouring one into the other until it is full or the other runs dry. What is the fewest moves that leaves you with exactly four litres?",
          "vizHint": "Pour it yourself — the counter tracks your moves.",
          "viz": "btJugs",
          "answerNumber": 6,
          "tolerance": 0,
          "placeholder": "moves",
          "answerValue": "6",
          "explain": "Fill the five and pour it into the three: two litres left. Empty the three, tip the two into it, fill the five again, and top the three up — it takes exactly one litre and leaves four. Six moves, and nothing shorter exists: a machine can walk every state these two jugs can reach, and four appears for the first time at move six. The quantities you can ever make are the ones you can build out of threes and fives."
        },
        {
          "id": "bt_switches",
          "type": "tap",
          "topic": "puzzles",
          "prompt": "Three switches outside a windowless room, one bulb inside, and you may open the door only once. You flip the first switch on, wait ten minutes, turn it off, flip the second on, and walk in. The bulb is dark, and cold to the touch.",
          "vizHint": "Tap a switch — and touch the bulb before you decide.",
          "viz": "btSwitches",
          "regions": [
            {
              "id": "a",
              "label": "The first switch"
            },
            {
              "id": "b",
              "label": "The second switch"
            },
            {
              "id": "c",
              "label": "The third switch"
            }
          ],
          "answerRegion": "c",
          "answerValue": "c",
          "explain": "A dark bulb rules out the second switch, which is on at this moment. A cold bulb rules out the first, which would have left it warm after ten minutes of burning. So it is the third — the one you never touched. Looking alone gives you two possible sights and you have three candidates, which can never work; warm-or-cold doubles that to four outcomes, and four is enough to separate three."
        },
        {
          "id": "bt_ants",
          "type": "truefalse",
          "topic": "puzzles",
          "prompt": "A metre-long pole with some ants on it, each walking at one centimetre a second in whatever direction it happens to face. When two ants meet head on, both turn around at once.",
          "statement": "However many ants there are and wherever they start, every ant is off the pole within a hundred seconds.",
          "vizHint": "Set up a line-up, play it, and watch the ghosts walk through.",
          "viz": "btAnts",
          "answerBool": true,
          "answerValue": "true",
          "explain": "True. Two ants bouncing off each other looks exactly like two identical ants walking straight through one another and swapping names — same picture, different labels. So no ant ever travels further than a single straight walk, and the longest straight walk along a metre of pole is a metre: a hundred seconds at a centimetre a second. Piling on more ants cannot slow anything down."
        },
        {
          "id": "bt_boxes",
          "type": "choice",
          "topic": "probability",
          "prompt": "A hundred prisoners, a hundred boxes with their names shuffled inside. Each may open fifty boxes hunting for their own name, and either everyone finds theirs or nobody goes free. They can agree a plan first but cannot communicate afterwards. What is their chance with the best plan?",
          "vizHint": "Follow the chain from your own number and see where it leads.",
          "viz": "btBoxes",
          "choices": [
            "About 1 in a million million",
            "About 1 in a hundred",
            "About 1 in 3",
            "1 in 2"
          ],
          "answer": 2,
          "answerValue": "about 1 in 3",
          "explain": "Opening boxes at random gives each prisoner a half, and a hundred halves multiplied together is a number with thirty noughts under it. Instead each prisoner starts at the box with their own number, reads the name inside, goes to that person's box, and keeps following. The shuffle is really a set of loops, and everybody succeeds exactly when no loop is longer than fifty. That turns a hundred separate pieces of bad luck into one shared piece — and it fails only about 69% of the time, leaving about 31%."
        },
        {
          "id": "bt_hat_pass",
          "type": "choice",
          "topic": "puzzles",
          "prompt": "Three players are each given a red or blue hat by a coin flip. Each can see the other two hats. At a signal, all three at the same moment must either say a colour or pass. They win if at least one speaks and nobody who speaks is wrong. What is the best they can do?",
          "vizHint": "Tap each of the eight line-ups and see who speaks.",
          "viz": "btHatPass",
          "choices": [
            "1 in 4",
            "1 in 2",
            "3 in 4",
            "They cannot beat a coin flip"
          ],
          "answer": 2,
          "answerValue": "3 in 4",
          "explain": "The plan: if you see two hats the same, say the other colour, and otherwise pass. Six of the eight line-ups have one odd hat out, and in those exactly one person speaks and is right. The other two line-ups are all-red and all-blue, where all three speak and all three are wrong. So they lose badly on two arrangements and win cleanly on six: three times in four. The trick is not to guess better — it is to pile all the wrong guesses onto the same two occasions."
        }
      ]
    }
  ],
  "vizData": {
    "markov": {
      "ringPads": 6,
      "weather": {
        "rainAfterRain": 0.5,
        "rainAfterDry": 0.25
      },
      "maze": {
        "rooms": [
          "First",
          "Middle",
          "Last"
        ],
        "doors": [
          [
            "First",
            "Middle"
          ],
          [
            "Middle",
            "Last"
          ],
          [
            "Last",
            "OUT"
          ]
        ],
        "start": "First"
      },
      "surfer": {
        "pages": [
          {
            "id": "home",
            "name": "Home",
            "x": 0.5,
            "y": 0.16
          },
          {
            "id": "ads",
            "name": "Ads",
            "x": 0.14,
            "y": 0.5
          },
          {
            "id": "blog",
            "name": "Blog",
            "x": 0.5,
            "y": 0.62
          },
          {
            "id": "shop",
            "name": "Shop",
            "x": 0.86,
            "y": 0.85
          },
          {
            "id": "news",
            "name": "News",
            "x": 0.86,
            "y": 0.5
          }
        ],
        "links": [
          [
            "home",
            "news"
          ],
          [
            "home",
            "shop"
          ],
          [
            "home",
            "blog"
          ],
          [
            "ads",
            "blog"
          ],
          [
            "blog",
            "home"
          ],
          [
            "shop",
            "home"
          ],
          [
            "news",
            "blog"
          ],
          [
            "news",
            "ads"
          ]
        ]
      },
      "gas": {
        "molecules": 10
      },
      "deuce": {
        "pointWin": 0.6
      },
      "deck": 52
    },
    "stopping": {
      "candidates": 100,
      "shortlist": 4,
      "sloppyCutoff": 50,
      "purse": 5,
      "houseCash": 95,
      "roulette": {
        "slots": 37,
        "reds": 18,
        "bankroll": 100
      },
      "martingale": {
        "maxDoubles": 10
      }
    },
    "info": {
      "suspects": [
        {
          "id": "A",
          "name": "A",
          "num": 1,
          "den": 2
        },
        {
          "id": "B",
          "name": "B",
          "num": 1,
          "den": 4
        },
        {
          "id": "C",
          "name": "C",
          "num": 1,
          "den": 8
        },
        {
          "id": "D",
          "name": "D",
          "num": 1,
          "den": 8
        }
      ],
      "questions": [
        {
          "id": "q_a",
          "asks": [
            "A"
          ]
        },
        {
          "id": "q_ab",
          "asks": [
            "A",
            "B"
          ]
        },
        {
          "id": "q_c",
          "asks": [
            "C"
          ]
        },
        {
          "id": "q_bc",
          "asks": [
            "B",
            "C"
          ]
        }
      ],
      "hamming": {
        "rings": [
          {
            "name": "left",
            "lamps": [
              1,
              4,
              5,
              7
            ]
          },
          {
            "name": "right",
            "lamps": [
              2,
              4,
              6,
              7
            ]
          },
          {
            "name": "bottom",
            "lamps": [
              3,
              5,
              6,
              7
            ]
          }
        ],
        "lit": [
          1,
          2,
          4,
          6
        ]
      },
      "message": 16,
      "wireNoise": 0.1,
      "copies": 3,
      "bentCoin": {
        "heads": 0.9,
        "flips": 1000
      }
    },
    "estimate": {
      "london": {
        "people": 9000000,
        "perPiano": 200,
        "tuningsPerDay": 4,
        "workDays": 250
      },
      "pub": {
        "inside": 60,
        "stayMinutes": 45
      },
      "lake": {
        "tagged": 100,
        "secondCatch": 100,
        "recaptured": 4
      },
      "taxis": [
        12,
        47,
        89,
        104
      ],
      "ledgers": [
        {
          "id": "ledgerA",
          "name": "Ledger A",
          "values": [
            123,
            138,
            310,
            588,
            659,
            762,
            840,
            1057,
            1109,
            1516,
            2435,
            2765,
            2918,
            3155,
            4575,
            4702,
            5191,
            9881
          ]
        },
        {
          "id": "ledgerB",
          "name": "Ledger B",
          "values": [
            100,
            116,
            159,
            220,
            267,
            329,
            887,
            1248,
            1488,
            1986,
            2259,
            3961,
            4173,
            4679,
            5620,
            6047,
            7977,
            9824
          ]
        },
        {
          "id": "ledgerC",
          "name": "Ledger C",
          "values": [
            325,
            445,
            525,
            675,
            699,
            820,
            1950,
            2800,
            2990,
            3800,
            4000,
            4450,
            5450,
            5750,
            6950,
            7250,
            7750,
            9950
          ]
        }
      ],
      "guessError": 0.1,
      "guessCount": 3
    },
    "spinners": [
      { "id": "left", "label": "Left", "slices": 12, "gold": 3 },
      { "id": "middle", "label": "Middle", "slices": 12, "gold": 5 },
      { "id": "right", "label": "Right", "slices": 12, "gold": 2 }
    ],
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
      "train": [
        [-1, 0.1744],
        [-0.78, 0.482],
        [-0.55, 0.4327],
        [-0.33, 0.2991],
        [-0.11, 0.0268],
        [0.11, -0.1411],
        [0.33, -0.2195],
        [0.55, -0.4128],
        [0.78, -0.3272],
        [1, -0.1751]
      ],
      "test": [
        [-0.9, 0.3734],
        [-0.66, 0.4858],
        [-0.44, 0.2407],
        [-0.2, 0.2983],
        [0.2, -0.1622],
        [0.44, -0.3575],
        [0.66, -0.6364],
        [0.9, -0.5083]
      ],
      "degrees": [1, 3, 9],
      "bestDegree": 3
    },
    "salaries": [21, 24, 26, 28, 31, 33, 36, 40, 47],
    "countval": {
      "waysScenarios": [
        {
          "short": "taxi",
          "label": "Pick 2 of 5 friends to share a taxi",
          "kind": "choose",
          "n": 5,
          "k": 2
        },
        { "short": "queue", "label": "Line 4 people up in a queue", "kind": "arrange", "n": 4, "k": 4 },
        {
          "short": "medals",
          "label": "Hand gold, silver and bronze to 5 runners",
          "kind": "arrange",
          "n": 5,
          "k": 3
        },
        {
          "short": "code",
          "label": "Make a 2-digit code from the digits 0 to 9",
          "kind": "repeat",
          "n": 10,
          "k": 2
        }
      ],
      "bets": [
        {
          "short": "die",
          "label": "A die roll that pays £12 for a six",
          "prize": 12,
          "outcomes": 6,
          "winners": 1,
          "faces": "die"
        },
        {
          "short": "coin",
          "label": "A coin flip that pays £6 for heads",
          "prize": 6,
          "outcomes": 2,
          "winners": 1,
          "faces": "coin"
        },
        {
          "short": "cards",
          "label": "One card from a pack: £52 for an ace",
          "prize": 52,
          "outcomes": 52,
          "winners": 4,
          "faces": "cards"
        },
        {
          "short": "spinner",
          "label": "A five-slice spinner: £30 for the gold slice",
          "prize": 30,
          "outcomes": 5,
          "winners": 1,
          "faces": "spinner"
        }
      ],
      "busGaps": [5, 15, 5, 15, 5, 15, 5, 15]
    },
    "premiumJs": {
      "clouds": {
        "A": [
          [
            63.5,
            65.7
          ],
          [
            75.7,
            72.9
          ],
          [
            42.9,
            44.3
          ],
          [
            49.0,
            59.5
          ],
          [
            67.5,
            46.7
          ],
          [
            38.0,
            47.1
          ],
          [
            60.1,
            61.1
          ],
          [
            61.2,
            36.2
          ],
          [
            64.8,
            55.1
          ],
          [
            59.1,
            60.8
          ],
          [
            58.4,
            61.9
          ],
          [
            33.2,
            40.8
          ],
          [
            43.0,
            40.1
          ],
          [
            52.9,
            61.4
          ],
          [
            44.1,
            52.2
          ],
          [
            47.5,
            39.4
          ],
          [
            40.5,
            20.3
          ],
          [
            56.4,
            42.5
          ],
          [
            52.2,
            44.0
          ],
          [
            43.0,
            30.1
          ],
          [
            52.9,
            63.6
          ],
          [
            40.9,
            25.0
          ],
          [
            67.8,
            66.2
          ],
          [
            69.7,
            82.2
          ],
          [
            64.6,
            70.4
          ],
          [
            43.4,
            36.6
          ],
          [
            69.8,
            55.5
          ],
          [
            53.5,
            42.7
          ],
          [
            69.8,
            82.1
          ],
          [
            51.0,
            55.3
          ],
          [
            52.5,
            35.0
          ],
          [
            46.3,
            63.8
          ],
          [
            41.3,
            66.6
          ],
          [
            63.7,
            64.4
          ],
          [
            73.8,
            69.1
          ],
          [
            73.4,
            63.3
          ],
          [
            68.9,
            54.6
          ],
          [
            44.6,
            52.0
          ],
          [
            61.2,
            49.1
          ],
          [
            59.4,
            50.2
          ],
          [
            55.7,
            65.2
          ],
          [
            78.5,
            66.3
          ],
          [
            44.4,
            62.3
          ],
          [
            36.5,
            45.8
          ],
          [
            47.0,
            45.5
          ],
          [
            30.2,
            42.4
          ],
          [
            48.5,
            36.4
          ],
          [
            75.7,
            57.6
          ],
          [
            56.7,
            52.1
          ],
          [
            50.9,
            57.7
          ]
        ],
        "B": [
          [
            49.2,
            52.3
          ],
          [
            54.1,
            11.2
          ],
          [
            55.2,
            67.1
          ],
          [
            59.9,
            31.3
          ],
          [
            53.5,
            57.3
          ],
          [
            35.8,
            46.1
          ],
          [
            72.3,
            51.9
          ],
          [
            21.2,
            51.4
          ],
          [
            43.7,
            18.5
          ],
          [
            65.8,
            56.4
          ],
          [
            37.3,
            51.9
          ],
          [
            21.7,
            55.5
          ],
          [
            36.4,
            26.8
          ],
          [
            63.5,
            40.1
          ],
          [
            39.3,
            71.1
          ],
          [
            34.9,
            43.4
          ],
          [
            62.3,
            59.7
          ],
          [
            65.0,
            39.6
          ],
          [
            48.7,
            71.0
          ],
          [
            40.1,
            46.3
          ],
          [
            52.6,
            53.5
          ],
          [
            45.9,
            71.5
          ],
          [
            58.1,
            68.8
          ],
          [
            24.5,
            43.6
          ],
          [
            53.2,
            69.5
          ],
          [
            46.9,
            42.9
          ],
          [
            69.3,
            66.3
          ],
          [
            59.6,
            71.4
          ],
          [
            40.9,
            62.9
          ],
          [
            47.5,
            36.4
          ],
          [
            32.3,
            45.7
          ],
          [
            66.5,
            53.8
          ],
          [
            33.8,
            37.8
          ],
          [
            48.8,
            46.9
          ],
          [
            60.7,
            56.0
          ],
          [
            59.1,
            57.5
          ],
          [
            54.7,
            65.0
          ],
          [
            36.2,
            50.7
          ],
          [
            31.6,
            36.0
          ],
          [
            34.3,
            84.6
          ],
          [
            65.6,
            68.5
          ],
          [
            34.2,
            59.9
          ],
          [
            30.6,
            69.9
          ],
          [
            50.6,
            38.2
          ],
          [
            48.2,
            66.3
          ],
          [
            39.1,
            41.3
          ],
          [
            49.9,
            75.4
          ],
          [
            40.1,
            55.0
          ],
          [
            41.9,
            81.3
          ],
          [
            63.0,
            55.3
          ]
        ],
        "C": [
          [
            31.7,
            36.2
          ],
          [
            56.2,
            59.7
          ],
          [
            52.4,
            51.5
          ],
          [
            45.1,
            41.6
          ],
          [
            68.0,
            53.0
          ],
          [
            46.0,
            53.4
          ],
          [
            24.4,
            27.9
          ],
          [
            64.1,
            71.0
          ],
          [
            69.6,
            83.3
          ],
          [
            54.6,
            48.6
          ],
          [
            45.1,
            48.6
          ],
          [
            28.5,
            36.9
          ],
          [
            62.4,
            51.3
          ],
          [
            34.2,
            43.8
          ],
          [
            44.2,
            50.6
          ],
          [
            43.0,
            33.4
          ],
          [
            67.9,
            64.4
          ],
          [
            61.8,
            67.1
          ],
          [
            68.9,
            59.8
          ],
          [
            74.0,
            61.3
          ],
          [
            54.0,
            65.3
          ],
          [
            31.3,
            37.6
          ],
          [
            57.8,
            55.6
          ],
          [
            36.8,
            55.3
          ],
          [
            44.7,
            30.9
          ],
          [
            78.8,
            79.4
          ],
          [
            56.0,
            47.8
          ],
          [
            43.5,
            42.5
          ],
          [
            42.7,
            47.7
          ],
          [
            35.3,
            42.2
          ],
          [
            54.3,
            51.9
          ],
          [
            42.1,
            43.9
          ],
          [
            30.0,
            35.3
          ],
          [
            16.7,
            24.7
          ],
          [
            43.7,
            47.7
          ],
          [
            56.4,
            60.2
          ],
          [
            32.2,
            40.2
          ],
          [
            44.6,
            26.1
          ],
          [
            45.4,
            60.2
          ],
          [
            83.9,
            82.8
          ],
          [
            55.5,
            55.4
          ],
          [
            45.7,
            51.4
          ],
          [
            64.3,
            60.8
          ],
          [
            54.6,
            67.2
          ],
          [
            47.6,
            49.6
          ],
          [
            53.6,
            50.5
          ],
          [
            24.3,
            30.9
          ],
          [
            44.6,
            38.5
          ],
          [
            78.5,
            74.5
          ],
          [
            39.8,
            33.8
          ]
        ],
        "D": [
          [
            36.7,
            29.3
          ],
          [
            52.8,
            43.4
          ],
          [
            47.0,
            33.6
          ],
          [
            50.9,
            50.8
          ],
          [
            59.5,
            56.1
          ],
          [
            65.8,
            58.0
          ],
          [
            100.6,
            56.5
          ],
          [
            12.3,
            31.9
          ],
          [
            59.5,
            54.8
          ],
          [
            47.8,
            75.5
          ],
          [
            68.4,
            44.9
          ],
          [
            48.7,
            42.4
          ],
          [
            32.1,
            29.9
          ],
          [
            44.0,
            34.4
          ],
          [
            48.8,
            50.4
          ],
          [
            57.2,
            36.7
          ],
          [
            62.6,
            27.3
          ],
          [
            53.3,
            57.6
          ],
          [
            41.1,
            37.1
          ],
          [
            50.6,
            45.7
          ],
          [
            43.3,
            64.9
          ],
          [
            27.3,
            34.8
          ],
          [
            49.7,
            51.8
          ],
          [
            36.8,
            49.3
          ],
          [
            66.9,
            67.7
          ],
          [
            42.6,
            50.3
          ],
          [
            74.4,
            58.5
          ],
          [
            37.9,
            50.7
          ],
          [
            49.2,
            39.3
          ],
          [
            65.2,
            49.5
          ],
          [
            52.6,
            58.9
          ],
          [
            47.8,
            32.7
          ],
          [
            66.7,
            47.2
          ],
          [
            45.7,
            43.9
          ],
          [
            43.9,
            59.8
          ],
          [
            49.5,
            44.4
          ],
          [
            67.8,
            57.1
          ],
          [
            46.4,
            48.8
          ],
          [
            45.3,
            46.8
          ],
          [
            40.7,
            51.7
          ],
          [
            67.3,
            39.6
          ],
          [
            40.4,
            55.9
          ],
          [
            49.2,
            42.4
          ],
          [
            40.3,
            51.2
          ],
          [
            45.7,
            24.3
          ],
          [
            35.7,
            38.0
          ],
          [
            40.2,
            39.3
          ],
          [
            34.4,
            46.2
          ],
          [
            57.1,
            59.6
          ],
          [
            56.8,
            34.1
          ]
        ]
      },
      "forecast": {
        "rained": [
          0,
          1,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          1,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          1,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          1,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          1,
          0,
          1,
          1,
          0,
          1,
          0,
          0
        ],
        "brenda": [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          1,
          1,
          1,
          1,
          0,
          1,
          1,
          1,
          0,
          1,
          1,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          1,
          1,
          0,
          1,
          1,
          1,
          0,
          0,
          1
        ]
      }
    },
    "premiumOpt": {
      "spread": {
        "bid": 41,
        "ask": 46,
        "fair": 44,
        "fairHigh": 50
      },
      "quote": {
        "guess": 500,
        "low": 400,
        "high": 600,
        "bid": 495,
        "ask": 505
      },
      "births": {
        "population": 8000000000,
        "lifeYears": 73,
        "secondsPerYear": 31557600
      },
      "marketFair": 100,
      "markets": [
        {
          "id": "a",
          "bid": 97,
          "ask": 103
        },
        {
          "id": "b",
          "bid": 99,
          "ask": 105
        },
        {
          "id": "c",
          "bid": 101,
          "ask": 104
        }
      ],
      "shares": [
        {
          "label": "200 at 202",
          "bid": 200,
          "ask": 202
        },
        {
          "label": "20 at 20.6",
          "bid": 20,
          "ask": 20.6
        }
      ],
      "maker": {
        "bid": 99,
        "ask": 101,
        "lots": 400,
        "poundsPerPoint": 1
      },
      "roundTrip": {
        "bid": 99,
        "ask": 101
      },
      "recover": {
        "fallPercent": 20
      },
      "basisPoints": {
        "book": 4200000,
        "bps": 35
      },
      "sixteenths": {
        "prices": [
          "3/8",
          "0.4",
          "7/16",
          "0.45"
        ]
      },
      "trip": {
        "miles": 60,
        "out": 30,
        "back": 60
      },
      "compound": {
        "rate": 0.03,
        "years": 25
      },
      "fee": {
        "before": 1,
        "after": 2
      }
    },
    "premium_ts": {
      "alerts": [
        [
          41.47,
          0
        ],
        [
          78.47,
          0
        ],
        [
          21.86,
          0
        ],
        [
          45.59,
          0
        ],
        [
          46.05,
          0
        ],
        [
          28.76,
          0
        ],
        [
          56.02,
          1
        ],
        [
          49.38,
          0
        ],
        [
          22.97,
          0
        ],
        [
          65.53,
          0
        ],
        [
          25.03,
          0
        ],
        [
          55.36,
          0
        ],
        [
          35.19,
          0
        ],
        [
          38.01,
          0
        ],
        [
          20.76,
          0
        ],
        [
          47.63,
          0
        ],
        [
          18.14,
          0
        ],
        [
          34.26,
          0
        ],
        [
          37.88,
          0
        ],
        [
          13.29,
          0
        ],
        [
          40.41,
          0
        ],
        [
          39.59,
          0
        ],
        [
          30.76,
          0
        ],
        [
          28.77,
          0
        ],
        [
          66.55,
          0
        ],
        [
          64.46,
          0
        ],
        [
          72.0,
          0
        ],
        [
          67.2,
          1
        ],
        [
          55.08,
          0
        ],
        [
          26.5,
          0
        ],
        [
          29.23,
          0
        ],
        [
          39.03,
          0
        ],
        [
          14.94,
          0
        ],
        [
          45.08,
          0
        ],
        [
          20.19,
          0
        ],
        [
          38.02,
          0
        ],
        [
          36.34,
          0
        ],
        [
          31.68,
          0
        ],
        [
          50.84,
          0
        ],
        [
          56.5,
          0
        ],
        [
          16.59,
          0
        ],
        [
          31.75,
          0
        ],
        [
          33.23,
          0
        ],
        [
          27.89,
          0
        ],
        [
          29.82,
          0
        ],
        [
          51.82,
          0
        ],
        [
          65.21,
          1
        ],
        [
          34.88,
          0
        ],
        [
          71.12,
          0
        ],
        [
          52.89,
          0
        ],
        [
          34.24,
          1
        ],
        [
          23.2,
          0
        ],
        [
          15.3,
          0
        ],
        [
          39.91,
          0
        ],
        [
          32.42,
          0
        ],
        [
          48.81,
          0
        ],
        [
          41.48,
          0
        ],
        [
          62.46,
          0
        ],
        [
          45.63,
          0
        ],
        [
          38.14,
          0
        ],
        [
          37.17,
          0
        ],
        [
          69.04,
          0
        ],
        [
          40.8,
          0
        ],
        [
          26.72,
          0
        ],
        [
          34.39,
          0
        ],
        [
          32.94,
          0
        ],
        [
          44.71,
          0
        ],
        [
          18.42,
          0
        ],
        [
          44.18,
          0
        ],
        [
          32.59,
          0
        ],
        [
          38.16,
          0
        ],
        [
          43.26,
          0
        ],
        [
          35.84,
          0
        ],
        [
          46.62,
          1
        ],
        [
          43.54,
          0
        ],
        [
          11.04,
          0
        ],
        [
          27.23,
          0
        ],
        [
          28.68,
          0
        ],
        [
          31.36,
          0
        ],
        [
          44.8,
          0
        ],
        [
          35.28,
          0
        ],
        [
          67.23,
          0
        ],
        [
          73.06,
          1
        ],
        [
          41.29,
          0
        ],
        [
          40.07,
          0
        ],
        [
          27.73,
          0
        ],
        [
          56.97,
          0
        ],
        [
          36.61,
          0
        ],
        [
          75.36,
          0
        ],
        [
          1.33,
          0
        ],
        [
          58.52,
          0
        ],
        [
          39.38,
          0
        ],
        [
          53.46,
          0
        ],
        [
          43.5,
          0
        ],
        [
          48.63,
          0
        ],
        [
          21.81,
          0
        ],
        [
          76.44,
          1
        ],
        [
          35.33,
          0
        ],
        [
          7.47,
          0
        ],
        [
          70.38,
          0
        ],
        [
          44.6,
          0
        ],
        [
          37.83,
          0
        ],
        [
          42.77,
          0
        ],
        [
          18.13,
          0
        ],
        [
          51.57,
          0
        ],
        [
          51.03,
          0
        ],
        [
          5.55,
          0
        ],
        [
          63.86,
          0
        ],
        [
          58.49,
          0
        ],
        [
          36.7,
          0
        ],
        [
          53.52,
          0
        ],
        [
          12.12,
          0
        ],
        [
          40.22,
          0
        ],
        [
          31.49,
          0
        ],
        [
          21.19,
          0
        ],
        [
          33.44,
          0
        ],
        [
          50.66,
          0
        ],
        [
          22.08,
          0
        ],
        [
          38.0,
          0
        ],
        [
          9.8,
          0
        ],
        [
          45.37,
          0
        ],
        [
          50.41,
          0
        ],
        [
          23.35,
          0
        ],
        [
          69.82,
          0
        ],
        [
          22.27,
          0
        ],
        [
          14.45,
          0
        ],
        [
          33.14,
          0
        ],
        [
          31.66,
          0
        ],
        [
          51.55,
          0
        ],
        [
          56.45,
          0
        ],
        [
          39.26,
          0
        ],
        [
          30.85,
          0
        ],
        [
          35.82,
          0
        ],
        [
          33.24,
          0
        ],
        [
          43.38,
          0
        ],
        [
          55.84,
          0
        ],
        [
          21.48,
          0
        ],
        [
          30.63,
          0
        ],
        [
          44.27,
          0
        ],
        [
          7.82,
          0
        ],
        [
          13.23,
          0
        ],
        [
          67.45,
          0
        ],
        [
          64.7,
          0
        ],
        [
          34.41,
          0
        ],
        [
          59.41,
          1
        ],
        [
          67.17,
          0
        ],
        [
          29.15,
          0
        ],
        [
          30.44,
          0
        ],
        [
          75.1,
          1
        ],
        [
          38.53,
          0
        ],
        [
          6.38,
          0
        ],
        [
          30.31,
          0
        ],
        [
          26.34,
          0
        ],
        [
          62.05,
          1
        ],
        [
          43.74,
          0
        ],
        [
          69.09,
          0
        ],
        [
          47.68,
          0
        ],
        [
          1.44,
          0
        ],
        [
          25.35,
          0
        ],
        [
          18.05,
          0
        ],
        [
          21.5,
          0
        ],
        [
          54.16,
          1
        ],
        [
          56.75,
          0
        ],
        [
          58.86,
          0
        ],
        [
          17.33,
          0
        ],
        [
          21.06,
          0
        ],
        [
          59.17,
          0
        ],
        [
          14.17,
          0
        ],
        [
          72.92,
          0
        ],
        [
          49.61,
          0
        ],
        [
          46.31,
          0
        ],
        [
          39.19,
          0
        ],
        [
          25.5,
          0
        ],
        [
          27.65,
          0
        ],
        [
          53.1,
          0
        ],
        [
          54.12,
          0
        ],
        [
          18.93,
          0
        ],
        [
          53.06,
          1
        ],
        [
          50.16,
          0
        ],
        [
          40.82,
          0
        ],
        [
          38.6,
          0
        ],
        [
          39.39,
          0
        ],
        [
          40.55,
          0
        ],
        [
          25.18,
          0
        ],
        [
          30.45,
          0
        ],
        [
          54.92,
          0
        ],
        [
          32.4,
          0
        ],
        [
          43.65,
          0
        ],
        [
          42.49,
          0
        ],
        [
          52.55,
          0
        ],
        [
          29.74,
          0
        ],
        [
          31.78,
          0
        ],
        [
          32.33,
          0
        ],
        [
          7.94,
          0
        ],
        [
          52.97,
          0
        ],
        [
          25.16,
          0
        ],
        [
          76.8,
          0
        ],
        [
          32.78,
          0
        ],
        [
          36.28,
          0
        ],
        [
          13.11,
          0
        ]
      ],
      "leakTable": [
        [
          3,
          1,
          0,
          1,
          0
        ],
        [
          14,
          0,
          0,
          2,
          0
        ],
        [
          2,
          4,
          11,
          1,
          1
        ],
        [
          26,
          1,
          0,
          3,
          0
        ],
        [
          7,
          3,
          0,
          2,
          0
        ],
        [
          1,
          2,
          4,
          1,
          1
        ],
        [
          19,
          5,
          0,
          2,
          0
        ],
        [
          5,
          0,
          0,
          1,
          0
        ],
        [
          9,
          1,
          22,
          3,
          1
        ],
        [
          31,
          2,
          0,
          3,
          0
        ],
        [
          4,
          1,
          17,
          2,
          1
        ],
        [
          12,
          3,
          0,
          1,
          0
        ],
        [
          2,
          0,
          0,
          2,
          0
        ],
        [
          22,
          0,
          26,
          3,
          1
        ],
        [
          8,
          2,
          0,
          1,
          0
        ],
        [
          6,
          5,
          9,
          2,
          1
        ]
      ],
      "shops": [
        [
          1,
          41,
          0
        ],
        [
          2,
          44,
          0
        ],
        [
          3,
          43,
          0
        ],
        [
          4,
          47,
          0
        ],
        [
          5,
          49,
          0
        ],
        [
          6,
          50,
          0
        ],
        [
          7,
          23,
          1
        ],
        [
          8,
          25,
          1
        ],
        [
          9,
          24,
          1
        ],
        [
          10,
          28,
          1
        ],
        [
          11,
          29,
          1
        ],
        [
          12,
          32,
          1
        ]
      ],
      "windows": {
        "steady": [
          0.8,
          0.6,
          1.1,
          -0.9,
          0.7,
          0.5,
          1.2,
          0.4,
          0.9,
          0.3,
          0.6,
          0.4
        ],
        "lumpy": [
          -0.7,
          -0.5,
          12.0,
          -0.6,
          -0.4,
          -0.8,
          -0.3,
          -0.6,
          7.2,
          -0.5,
          -0.7,
          -0.9
        ]
      },
      "studies": [
        [
          8,
          10
        ],
        [
          60,
          100
        ],
        [
          550,
          1000
        ],
        [
          5200,
          10000
        ]
      ]
    },
    "bayesgeo": {
      "workshop": {
        "A": {
          "easy": [
            81,
            87
          ],
          "hard": [
            192,
            263
          ]
        },
        "B": {
          "easy": [
            234,
            270
          ],
          "hard": [
            55,
            80
          ]
        }
      },
      "glasses": [
        {
          "id": "tall",
          "height": 20,
          "across": 6
        },
        {
          "id": "middle",
          "height": 15,
          "across": 7
        },
        {
          "id": "wide",
          "height": 12,
          "across": 8
        }
      ],
      "antRoom": {
        "length": 12,
        "width": 4,
        "height": 5
      }
    },
    "netalgo": {
      "friendNetwork": {
        "people": [
          "Ana",
          "Ben",
          "Cal",
          "Dee",
          "Eve",
          "Fin",
          "Gus",
          "Hal"
        ],
        "pos": [
          [
            0.44,
            0.44
          ],
          [
            0.76,
            0.46
          ],
          [
            0.24,
            0.74
          ],
          [
            0.72,
            0.78
          ],
          [
            0.58,
            0.13
          ],
          [
            0.3,
            0.2
          ],
          [
            0.08,
            0.46
          ],
          [
            0.12,
            0.96
          ]
        ],
        "links": [
          [
            0,
            1
          ],
          [
            0,
            2
          ],
          [
            0,
            3
          ],
          [
            0,
            4
          ],
          [
            0,
            5
          ],
          [
            0,
            6
          ],
          [
            1,
            2
          ],
          [
            1,
            3
          ],
          [
            1,
            4
          ],
          [
            1,
            5
          ],
          [
            2,
            3
          ],
          [
            2,
            7
          ]
        ]
      },
      "examClashes": {
        "exams": [
          "Maths",
          "Physics",
          "Chemistry",
          "Biology",
          "History"
        ],
        "pos": [
          [
            0.5,
            0.1
          ],
          [
            0.88,
            0.4
          ],
          [
            0.72,
            0.86
          ],
          [
            0.28,
            0.86
          ],
          [
            0.12,
            0.4
          ]
        ],
        "clashes": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            0
          ]
        ]
      },
      "cableNetwork": {
        "offices": [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F"
        ],
        "pos": [
          [
            0.2,
            0.15
          ],
          [
            0.8,
            0.18
          ],
          [
            0.1,
            0.55
          ],
          [
            0.88,
            0.6
          ],
          [
            0.5,
            0.45
          ],
          [
            0.46,
            0.9
          ]
        ],
        "cables": [
          [
            0,
            1,
            9
          ],
          [
            0,
            2,
            5
          ],
          [
            0,
            4,
            7
          ],
          [
            1,
            3,
            8
          ],
          [
            1,
            4,
            6
          ],
          [
            3,
            4,
            10
          ],
          [
            3,
            5,
            11
          ],
          [
            4,
            5,
            3
          ],
          [
            2,
            4,
            4
          ]
        ]
      },
      "postmanMap": {
        "junctions": [
          {
            "id": "market",
            "name": "Market",
            "x": 0.5,
            "y": 0.3
          },
          {
            "id": "mill",
            "name": "Mill",
            "x": 0.5,
            "y": 0.08
          },
          {
            "id": "bridge",
            "name": "Bridge",
            "x": 0.16,
            "y": 0.52
          },
          {
            "id": "church",
            "name": "Church",
            "x": 0.84,
            "y": 0.52
          },
          {
            "id": "green",
            "name": "Green",
            "x": 0.5,
            "y": 0.66
          },
          {
            "id": "school",
            "name": "School",
            "x": 0.5,
            "y": 0.9
          }
        ],
        "streets": [
          [
            "market",
            "mill"
          ],
          [
            "market",
            "bridge"
          ],
          [
            "market",
            "church"
          ],
          [
            "bridge",
            "church"
          ],
          [
            "bridge",
            "green"
          ],
          [
            "green",
            "church"
          ],
          [
            "bridge",
            "school"
          ],
          [
            "school",
            "church"
          ]
        ],
        "finishAt": "market"
      },
      "ringShortcuts": {
        "villages": 24,
        "shortcuts": [
          [
            0,
            12
          ],
          [
            5,
            17
          ],
          [
            3,
            15
          ],
          [
            8,
            20
          ]
        ]
      }
    }
  }
};
