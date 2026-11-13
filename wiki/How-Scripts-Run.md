# How scripts run

Read this page once. Most surprises come from one of these rules.

## Where a script runs: host, client and shared

Smart Fellas is played online. One player hosts the match, and the host's game decides everything:
who is where, who caught whom, who won. Every other player's game shows what the host's game sends.

Where a script runs is the folder it is in:

| Folder | Runs on | Use it for |
| --- | --- | --- |
| The scripts folder itself | the host's game only | everything that changes the match: doors, scores, rules, creatures |
| `client/` | each player's own PC | something only that player sees or hears: a tip, a sound |
| `shared/` | both: the host for real, each player to guess ahead | a door that should start moving the moment a player pulls its lever |

**Host scripts** decide. What they change reaches every player the way everything else in the game
does. Most scripts belong here.

**Client scripts** are for one screen. Their messages and sounds reach only that player. They can't
change the match: anything else they ask for is ignored. They also read only what that player's game
was sent: an octopus hiding too far away has no position there.

**Shared scripts** run on the host for real, and on each player's PC as a guess. On a player's PC
only their piece moves, turns, shows and hides happen, and the host's game then confirms or puts them
right. Their messages and sounds come from the host's game only, so nobody hears them twice. The copy
on a player's PC hears only that player using a switch, and `game.random()` gives it different
numbers. So a shared script should guess from what it can read now (where the door is), not from
counts it keeps.

## When a script runs

- **At the start of the match,** the game loads every script in a place, in name order. The host
  loads `shared/` first, then its own. Scripts in one place share their globals: what one defines at
  its top, the others can use. There's no `import`; the game loads them all itself.
- **Your handlers** are what runs after that. Register them once, at the top of a file:
  `game.onJoin(...)`, `every(5, ...)`, `zone.onEnter(...)`. The game calls them as things happen.
- **The game runs 64 ticks a second.** A tick is one step of the match. Events and timers run
  inside ticks.
- **Actions wait for the end of the tick.** `door.moveTo()`, `player.kill()` and the rest are queued
  and done after your handlers finish. What you read stays as the tick began, so reading
  `door.position` straight after `door.moveTo()` still gives the old place.
- **A script keeps its variables between rounds.** Reset what you need in `game.onRoundStart`. A new
  match starts every script fresh.

```ts
// Counts rounds. The count lives as long as the match: each round adds one.
let rounds = 0;

game.onRoundStart(() => {
  rounds += 1;
  game.say(`Round ${rounds}. Good luck!`);
});
```

## The sealed box

Every script runs in a sealed box: a JavaScript engine with nothing in it but this API. That's what
makes it safe to play a stranger's map.

- **No files, no network, no loading other code.** There's no `fetch`, `require` or `import`.
- **No clock.** `Date` isn't there. Use `game.seconds` (the match's time) and the timers.
- **No `Math.random`.** Use `game.random()`, a number from 0 up to 1. Each copy of a script has its
  own series: a `shared/` script on a player's PC gets different numbers from the host's.

## The limits, and why

A script shares the host's PC with the game itself. To keep the game smooth for everyone, each
script gets a fixed amount of work and memory.

| Limit | How much | Why |
| --- | --- | --- |
| Work each tick | about 1 millisecond of the engine's own steps | a tick is 15.6 ms, and the game needs the rest |
| Work to load a file | 200 ticks' worth | big tables at the top of a file are fine |
| Memory | 32 MB for all of a place's scripts | one runaway list can't eat the host's memory |
| Script size | 256 KB a file, 16 files, 1 MB in all | maps download fast |

Work is counted in steps, not time, so a slow PC and a fast one stop the same script at the same
point. A typical map script uses about a third of its work each tick.

**A script that breaks is switched off** for the rest of the match: one that runs too long, uses too
much memory, or throws an error it doesn't catch. The host sees one line saying why (for a client
script, that player does). The match plays on as if the map had no script. A mode whose script stops
ends a round being played as a draw, and the match goes back to Classic.

**A bad argument throws an Error you can catch:** a name that doesn't exist, a point far outside the
map, a number out of range. Each call's range is in the [Reference](Reference.md).

**A handle to something gone does nothing.** A player who left, a creature eaten: reading it gives
`null` (and `gone` is `true`), and asking it to do something does nothing. Check `gone` or `alive`
when you hold on to one.

```ts
// Catches a bad name instead of letting the script stop.
game.onMatchStart(() => {
  try {
    game.spawn("crab", 0, 0, 5000);
  } catch {
    game.say("That point is outside the map, so no crab.");
  }
});
```

## Map scripts and mode scripts together

A match can run both: the map's scripts and the mode's. They run side by side, each in a world of
its own, and each numbers the players for itself. The mode's run first each tick. A map's script may
use the calls marked "for game modes" too; the mode then hears what happened through its own events
(`onTeamChange`, `onRoundEnd`).
