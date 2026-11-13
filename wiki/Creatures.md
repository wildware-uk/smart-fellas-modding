# Creatures

`game.creatures()` gives every creature and piece of food in the match, placed by the map or spawned
by a script. `game.creatures("crab")` gives only crabs. The same one is always the same object.

The kinds are `"shark"`, `"eel"`, `"groper"`, `"flounder"`, `"lionfish"`, `"crab"`, `"clam"` and
`"shrimp"`.

Each has an `id`, its `kind`, whether it is `alive`, its `position`, and whether it is `gone` (eaten,
killed or removed; then its position reads `null`). `creature.remove()` takes it out of the match on
every player's screen.

## Spawn one

`game.spawn(kind, x, y, z)` asks the game for one near a point, and gives back its handle at once. The
game puts it where such a thing can be:

- **Food** grows on the free food spot nearest the point that suits it, if one is within 10 m: crabs
  on sand or rock, shrimp on sand, clams on rock. It doesn't grow back once eaten. Food only grows on
  a map's food spots, so spawn it near a food patch.
- **A shark** joins its loop round the map at the point nearest yours.
- **An eel or a groper** goes beside the rock nearest the point.
- **A lionfish** hovers at the point, clear of any rock. **A flounder** lies on the seabed under the
  point, if the seabed is within 50 m.

Sharks, eels and gropers come only while a round is being played. If the game finds no place, the
handle reads as `gone` from the next tick.

**Limits:** a script may have at most 1 shark, 4 eels, 4 gropers, 256 of each food and 256 fish it
spawned alive at once. Asking for more throws an Error.

## Example: a shark hunts the last minute

```ts
// With a minute left, a shark comes out of the deep, and it goes again when the round ends.
let shark: Creature | null = null;

every(1, () => {
  if (game.phase !== "play" || game.timeLeft > 60 || (shark && !shark.gone)) {
    return;
  }
  shark = game.spawn("shark", 0, 10, 0);
  game.say("Something big is coming...");
  game.playSound("roar");
});

game.onRoundEnd(() => {
  shark?.remove();
  shark = null;
});
```

## Example: a crab rush

```ts
// Every 45 seconds, five crabs grow round a random food patch spot, picked from the crabs the map
// already has.
every(45, () => {
  if (game.phase !== "play") {
    return;
  }
  const crabs = game.creatures("crab").filter((crab) => crab.alive);
  if (crabs.length === 0) {
    return;
  }
  const near = crabs[Math.floor(game.random() * crabs.length)].position;
  if (!near) {
    return;
  }
  for (let count = 0; count < 5; count += 1) {
    try {
      game.spawn("crab", near.x + game.random() * 6 - 3, near.y, near.z + game.random() * 6 - 3);
    } catch {
      break;
    }
  }
  game.say("A crab rush! Get them while they last.");
});
```

## Example: count what's left

```ts
// Tells everyone when the reef's last clam is gone.
let told = false;

game.onRoundStart(() => {
  told = false;
});

game.onEat((_player, food) => {
  if (food === "clam" && !told && game.creatures("clam").every((clam) => !clam.alive)) {
    told = true;
    game.say("That was the last clam on the reef.");
  }
});
```

Every call and its range is on the [Creature reference](Reference-Creature.md) and, for `spawn` and
`creatures`, the [Game reference](Reference-Game.md).
