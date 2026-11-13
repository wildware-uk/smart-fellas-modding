# Common mistakes

## Reading a piece's position at the top of the file

Pieces have no place until the match's first tick, so this reads `null`:

```ts
// Wrong: read at load, before the first tick.
const door = game.piece("door");
const startedAt = door?.position;
```

Read it inside a handler, the first time you need it, and keep it:

```ts
// Right: read once a player pulls the lever, and kept from then on.
const door = game.piece("door");
let shut: Point | null = null;

game.piece("lever")?.onUse(() => {
  shut ??= door?.position ?? null;
});
```

## Expecting an action to show at once

Actions are done after your handlers finish, so what you read stays as the tick began:

```ts
// Both lines read the same old score, so this says the score before the point.
game.onEat((player) => {
  player.addScore(1);
  player.say(`You have ${player.score} points.`);
});
```

Keep your own count, or say `player.score + 1`.

## Forgetting the round started again

A script keeps its variables for the whole match, across rounds. Reset per-round counts in
`game.onRoundStart`, or the second round starts with the first round's scores.

## Registering handlers inside handlers

```ts
// Wrong: every round adds one more handler, so the third round says it three times.
game.onRoundStart(() => {
  game.onEat((player) => player.say("Yum."));
});
```

Register every handler once, at the top of a file.

## Holding on to someone who left

A player who leaves, or a creature that is eaten, reads as `gone`. Its `position` is `null`, and what
you ask of it does nothing. Check before using one you kept:

```ts
// Keeps a "leader" only while they are still in the match.
let leader: Player | null = null;

every(5, () => {
  if (leader?.gone) {
    leader = null;
  }
  leader ??= game.players().find((player) => player.alive) ?? null;
});
```

## Using Date or Math.random

They aren't there. `game.seconds` is the match's time, and `game.random()` gives a number from 0 up
to 1.

## import, export, enum, namespace

A script can't `import` or `export`: the game loads every script in a folder side by side, and what
one defines at its top the others can use. `enum`, `namespace` and constructor parameter fields
(`constructor(private x: number)`) are refused, because they need code made for them. Use a union of
strings (`type Mood = "calm" | "angry"`) instead of an enum.

## Too much work in one tick

`every(0, ...)` runs 64 times a second. A loop over every player and every creature in it is fine; a
loop inside a loop inside it may not be. Most checks are fine four times a second: `every(0.25, ...)`.

## A typo in a name

`game.zone("Vault")` and a zone called `vault` are different names: `zone` gives `null`, and with
`?.` your script quietly does nothing. While testing, say so when a name isn't found:

```ts
// Says which names the map is missing, once, as the match starts.
game.onMatchStart(() => {
  for (const name of ["vault", "gate1", "gate2"]) {
    if (!game.zone(name)) {
      game.say(`No zone called ${name} on this map.`);
    }
  }
});
```

## Writing a client script that changes the match

A `client/` script runs on one player's PC. Only its messages and sounds do anything: a `kill()` or a
`moveTo()` there is ignored. Put anything that changes the match in the scripts folder itself.
