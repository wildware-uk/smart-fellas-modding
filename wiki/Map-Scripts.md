# Map scripts

A map script makes one map do things its pieces can't say on their own. It lives in a folder you
choose in Godot (select the map's top node, then **Scripts** in the Inspector), and travels with the
map wherever it goes: Test Map, My maps, lobbies and the Workshop.

## What a map script can reach

- **Pieces you name**, to move, turn, show and hide: doors, gates, falling rocks.
- **Switches**, pieces players can use, such as a lever.
- **Trigger zones**, invisible boxes that hear players and spears go in and out.
- Everything else in the API: [players](Players.md), [events](Events.md), [timers](Timers.md),
  [creatures](Creatures.md), [sounds](Sounds.md) and [messages](Messages-and-HUD.md).

## Name a piece

A script finds a piece by its name.

1. Select the piece in Godot, open the **Node** dock, then **Groups**.
2. Add it to the group `script`. Or, for a piece players can use (a lever), to `switch`.
3. Its node's name is its name in the map: lowercase letters, digits, dashes, underscores and dots,
   each name on one piece.

A player uses a switch by pressing Interact (the eat key) within 1.5 m of it. Interact does its other
jobs too, so keep food away from a switch, or one press both pulls the lever and starts a meal.
Painted pieces can't be named: place it by hand.

Pieces have no place until the match's first tick, so read `position` inside a handler, not at the
top of the file.

## A lever opens a door

Name a piece `door` (group `script`) and a piece `lever` (group `switch`).

```ts
// Pulling the lever opens the door for 20 seconds, then it shuts by itself.
const door = game.piece("door");
const lever = game.piece("lever");
let shut: Point | null = null;
let open = false;

lever?.onUse((player) => {
  if (!door || open) {
    return;
  }
  shut ??= door.position;
  if (!shut) {
    return;
  }
  open = true;
  door.moveTo(shut.x, shut.y + 4, shut.z, 2);
  game.playSoundAt("rockfall", shut.x, shut.y, shut.z);
  player.say("The door is open for 20 seconds.");
  after(20, () => {
    if (door && shut) {
      door.moveTo(shut.x, shut.y, shut.z, 2);
    }
    open = false;
  });
});
```

`examples/lever_and_door.ts` in this repository is a fuller version: it shuts the door at
the start of each round and says so when the door is open already.

### Make it feel instant: shared/

The door above moves when the host's game hears the lever, a moment after the player pulls it. Put the
script in `shared/` instead, and each player's own game moves the door at once as a guess, which the
host's game then confirms. Keep a shared script's logic to what it can read now: the copy on a
player's PC doesn't see other players pull the lever, and its `game.random()` gives other numbers.

```ts
// shared/gate.ts: the gate swings open the moment anyone pulls the lever, and swings back if it was open.
const gate = game.piece("gate");
const handle = game.piece("gate_lever");

handle?.onUse(() => {
  if (!gate || gate.turn === null) {
    return;
  }
  const opening = Math.abs(gate.turn) < 45;
  gate.turnTo(opening ? 90 : 0, 1.5);
});
```

## Trigger zones

A trigger zone is a box only the editor shows. In the **Map** panel, under **Map scripts**, press
**Add: Trigger zone** and click on the map. Size it with its dots, and rename it in the Scene panel:
its node's name is its name in the script. A map may have up to 256.

```ts
// A warm current: anyone resting in the "vent" zone gets a little energy every second.
const vent = game.zone("vent");

vent?.onEnter((player) => {
  player.say("Warm water. You feel better here.");
});

every(1, () => {
  for (const player of vent?.players() ?? []) {
    player.addEnergy(2);
  }
});
```

Zones hear spears too, with who threw them:

```ts
// A spear through the "bell" zone rings it for everyone.
const bell = game.zone("bell");

bell?.onSpearEnter((thrower) => {
  game.playSound("chime");
  if (thrower) {
    game.say(`${thrower.name} rang the bell!`);
  }
});
```

## Show and hide

A hidden piece is gone for everyone: nobody sees it or bumps into it.

```ts
// A rock fall seals the tunnel for the last minute of each round.
const rocks = game.piece("rock_fall");
let fallen = false;

game.onRoundStart(() => {
  rocks?.hide();
  fallen = false;
});

every(1, () => {
  if (!rocks || fallen || game.phase !== "play" || game.timeLeft > 60) {
    return;
  }
  fallen = true;
  rocks.show();
  const at = rocks.position;
  if (at) {
    game.playSoundAt("rockfall", at.x, at.y, at.z);
  }
  game.say("The tunnel has caved in!");
});
```

## More examples

In `examples/` in this repository, each ready to copy into a map's scripts folder:

- `lever_and_door.ts`: a lever opens a door for 20 seconds.
- `timed_flood.ts`: a cave floods in the last minute of every round, and sweeps away anyone below the
  water line.
- `treasure_wakes_the_shark.ts`: a crab grows near a point each round, and whoever eats it wakes a
  shark.
