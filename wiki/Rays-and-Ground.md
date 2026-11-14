# Rays and the ground

These calls on `game` ask the map what is in the way. They work for any map shape, caves too.
New in API 1.3.0.

| Call | Settles with |
| --- | --- |
| `game.raycast(from, to)` | where a straight line from `from` to `to` first meets the map, or `null` |
| `game.lineOfSight(a, b)` | `true` when nothing of the map stands between `a` and `b` |
| `game.groundBelow(point)` | the ground straight under `point`, or `null` |
| `game.randomGroundPoint()` | a point on the ground somewhere in the play area, or `null` |
| `game.playArea` | the box players swim in: `{ min, max }`, its lowest and highest corners (not a promise) |

A hit has `point` (where it met the map), `normal` (which way that surface faces: `y` is 1 on flat
ground) and `distance` (metres from the start).

- **Rays see only the map:** rock, sand and the map's pieces. Players, creatures, plants and the
  play area's edge are let through. So a ray never tells you where a hidden player is.
- **The answer comes next tick.** The game casts rays once your tick is done, and the answer
  arrives a sixty-fourth of a second later. Each call gives back a promise: `await` it inside an
  `async` function, or use `.then`.
- **Limits:** at most 32 rays a tick (`randomGroundPoint` uses 6, the others 1). More throws an
  error you can catch. Both ends must be within 1000 m of the map's middle.
- `randomGroundPoint` picks its spots with `game.random()`, so a match with the same seed picks the
  same spots. Spots under solid rock (say, over a cave's roof) are skipped.
- Every script can use them, `client/` scripts too.

Every call is on the [Game reference](Reference-Game.md).

## Example: food rains down at random

```ts
// Every 20 seconds of play, a crab appears somewhere on the seabed.
every(20, async () => {
  if (game.phase !== "play") {
    return;
  }
  const spot = await game.randomGroundPoint();
  if (spot) {
    game.spawn("crab", spot.x, spot.y, spot.z);
  }
});
```

## Example: a lookout that needs a clear view

```ts
// The "lighthouse" piece warns divers about an octopus only when rock isn't in the way.
const lighthouse = game.piece("lighthouse");

every(3, async () => {
  const eye = lighthouse?.position;
  if (!eye || game.phase !== "play") {
    return;
  }
  const octopus = game.nearestPlayer(eye, "octopus");
  const at = octopus?.position;
  if (at && Vec.distance(eye, at) < 40 && (await game.lineOfSight(eye, at))) {
    game.sayToTeam("diver", "The lighthouse saw something move!");
  }
});
```

## Example: a marker on the ground under a zone

```ts
// Puts the "goal" marker on the seabed under a point above the middle of the map.
game.onRoundStart(async () => {
  const above = Vec.of(0, game.playArea.max.y - 1, 0);
  const ground = await game.groundBelow(above);
  if (ground) {
    game.marker("goal", { at: ground.point, label: "Goal", colour: "#ffcc00" });
  }
});
```
