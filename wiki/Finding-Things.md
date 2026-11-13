# Finding things

Four calls on `game` find who and what is near a point. They save looping over every player and
working out distances yourself. New in API 1.1.0.

| Call | Gives back |
| --- | --- |
| `game.playersNear(point, radius, team?)` | living players within `radius` metres, nearest first; only `team`'s if given |
| `game.nearestPlayer(point, team?, except?)` | the nearest living player, of `team` if given, leaving out `except`; or `null` |
| `game.creaturesNear(point, radius, kind?)` | living creatures and food within `radius` metres, nearest first; only `kind` if given |
| `game.nearestCreature(point, kind?)` | the nearest living creature or food, of `kind` if given; or `null` |

- Only players with a position count: someone waiting, respawning or out has none.
- `except` leaves one player out, most often the one you're asking about, so you don't find them
  nearest to themselves.
- Every script can use them. On a player's PC (a `client/` script) they find only what that PC was
  sent.

Every call is on the [Game reference](Reference-Game.md).

## Example: who is nearest the treasure

```ts
// Every 5 seconds, tells the diver nearest the "treasure" piece that they're getting warm.
const treasure = game.piece("treasure");

every(5, () => {
  const at = treasure?.position;
  if (!at || game.phase !== "play") {
    return;
  }
  const nearest = game.nearestPlayer(at, "diver");
  if (nearest) {
    nearest.say("You're getting warm...");
  }
});
```

## Example: a buddy alarm

```ts
// When an octopus inks, its nearest teammate within 30 m hears about it.
game.onInk((player) => {
  const at = player.position;
  if (!at) {
    return;
  }
  const buddy = game.nearestPlayer(at, "octopus", player);
  if (buddy?.position && Vec.distance(buddy.position, at) <= 30) {
    buddy.say(`${player.name} inked nearby. Trouble?`);
  }
});
```

## Example: crabs around a player

```ts
// When a diver fires, any crab within 8 m of them scuttles away (it is removed).
game.onShoot((diver) => {
  const at = diver.position;
  if (!at) {
    return;
  }
  for (const crab of game.creaturesNear(at, 8, "crab")) {
    crab.remove();
  }
});
```
