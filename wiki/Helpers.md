# Helpers

Every script has a few helpers built in: maths on points, random numbers from a seed, smooth
movement over time, phases that follow one another, a store for the round, and a log. They are plain
JavaScript. They work on the host and on players' PCs alike, and change nothing in the match by
themselves. New in API 1.1.0.

| Helper | What it does |
| --- | --- |
| `Vec` | maths on points: add, take away, scale, distance, lerp and more |
| `Maths` | number helpers: clamp, lerp, remap, approach, degrees and radians |
| `Random` | random numbers from a seed: the same seed gives the same numbers on every PC |
| `Ease` | easing curves: smooth starts and stops, bounces, wobbles |
| `tween(seconds, step, options?)` | calls `step` every tick for a while, with how far along it is |
| `StateMachine` | named states, one at a time: what to do going in, every tick, and going out |
| `store` | values by name for this round, emptied as each round starts (for one player's values over the match, see `player.data` in [Players](Players.md)) |
| `log(...values)` | a line in the game's log, for finding bugs |

Every one of them, with its ranges, is on the [Helpers reference](Reference-Helpers.md).

## Vec and Maths

`Vec` works on points, the `{ x, y, z }` that `player.position` gives. Every call gives back a new
point. `Vec.flat(a)` sets `y` to 0, for distances across the map that ignore depth.

```ts
// Pulls every octopus within 20 m a metre closer to the "whirlpool" piece, each second.
const whirlpool = game.piece("whirlpool");

every(1, () => {
  const middle = whirlpool?.position;
  if (!middle || game.phase !== "play") {
    return;
  }
  for (const player of game.playersNear(middle, 20, "octopus")) {
    const at = player.position;
    if (!at) {
      continue;
    }
    const pull = Vec.scale(Vec.normalize(Vec.sub(middle, at)), 1);
    const to = Vec.add(at, pull);
    player.moveTo(to.x, to.y, to.z);
  }
});
```

`Maths.clamp`, `Maths.lerp`, `Maths.remap` and `Maths.approach` save writing the same few lines
again and again. `Maths.wrapDegrees` keeps a turn between -180 and 180.

## Random

`game.random()` gives numbers nobody can guess ahead. A `Random` of your own gives numbers from a
seed: the same seed gives the same numbers, in the same order, on every PC. It also has `int`,
`chance`, `pick` and `shuffle`.

```ts
// Each round, one random diver is the captain. With a Random, pick() does the choosing.
let random = new Random(7);

game.onRoundStart(() => {
  random = new Random(Math.floor(game.random() * 1000000));
  const divers = game.players().filter((player) => player.team === "diver");
  const captain = random.pick(divers);
  if (captain) {
    captain.setRole("captain");
    game.say(`${captain.name} is the divers' captain.`);
  }
});
```

## tween and Ease

`tween(seconds, step, options?)` calls `step` every tick for `seconds`, with how far along it is,
from 0 to 1. `seconds` is 0 to 86400; anything else throws. The last call is always with 1. Give it an `ease` to change how it speeds up and slows
down, and a `done` to run at the end. It gives back a timer, so `cancel()` stops it early.

```ts
// A gate piece sinks into the floor over 3 seconds, with a little bounce at the bottom.
const gate = game.piece("gate");

game.onRoundStart(() => {
  const top = gate?.position;
  if (!gate || !top) {
    return;
  }
  tween(
    3,
    (t) => {
      const y = Maths.lerp(top.y, top.y - 4, t);
      gate.moveTo(top.x, y, top.z);
    },
    { ease: Ease.outBounce, done: () => game.say("The gate is open!") },
  );
});
```

A piece's own `moveTo(x, y, z, seconds)` glides it too, in a straight line at an even speed. Use
`tween` for curves and for moving things that have no glide of their own, such as a marker.

## StateMachine

A `StateMachine` holds a set of named states and is in one at a time. Each state may say what to do
going in (`enter`), every tick while in it (`tick`, with the seconds since it went in), and going out
(`leave`). `go(name)` moves it to another state. It ticks by itself, every tick, whatever the
match's phase (in the lobby too).

If a state calls `go()` on its own machine, write the machine's type out, as below. TypeScript can't
work it out otherwise.

```ts
// A round in three steps: hide for 20 seconds, then hunt, then a last-minute rush.
type Step = "hide" | "hunt" | "rush";

const steps: StateMachine<Step> = new StateMachine<Step>(
  {
    hide: {
      enter() {
        game.banner("Octopuses: hide!");
      },
      tick(seconds) {
        if (seconds >= 20) {
          steps.go("hunt");
        }
      },
    },
    hunt: {
      enter() {
        game.banner("Divers: hunt!");
      },
      tick() {
        if (game.timeLeft <= 60) {
          steps.go("rush");
        }
      },
    },
    rush: {
      enter() {
        game.banner("Last minute!");
        game.playSound("roar");
      },
    },
  },
  "hide",
);

game.onRoundStart(() => {
  steps.go("hide");
});
```

`steps.state` is the state it is in, and `steps.seconds` how long it has been there. `stop()` stops
it for good.

## store

`store` keeps values by name for the round. It empties itself as each round starts, before your
`onRoundStart` runs, so there is nothing to reset. `store.add(key)` counts up by one and gives back
the new count.

Each set of scripts has a store of its own: the map's scripts and the mode's scripts don't share
one, and each PC's scripts have their own.

```ts
// Counts each player's meals this round, and cheers every fifth one.
game.onEat((player) => {
  const meals = store.add(`meals:${player.id}`);
  if (meals % 5 === 0) {
    player.say(`${meals} meals this round!`);
  }
});
```

`store.get(key, fallback)` reads a value, or `fallback` if there is none. `store.set`, `has`,
`delete`, `keys` and `clear` do what they say.

## log

`log(...values)` writes a line to the game's log on the PC the script runs on: the host's for
scripts on the host, and that player's own for `client/` scripts. The log is the console, and the log
file in the `logs` folder beside the game's settings. Each line starts `map script:` or
`mode script:`, then the values joined by spaces, with objects written as JSON. Use it to see what
your script is doing while you test.

```ts
game.onCaught((player, by, how) => {
  log("caught:", player.name, "by", by?.name ?? "nobody", "with", how);
});
```

At most 20 lines a second; more are dropped. Each line is cut at 200 characters.
