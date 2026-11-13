# Players

`game.players()` gives every player in the match, people and bots. The same player is always the
same object, so `===` works, and you can keep one in a variable or a `Map`.

## What you can read

| | |
| --- | --- |
| `id`, `name` | their number in this match, and the name they play under |
| `team` | `"octopus"`, `"diver"`, or a team your mode added |
| `life` | `"alive"`, `"respawning"`, `"out"` or `"waiting"` |
| `alive` | whether they are alive and swimming |
| `position` | where they are, in metres (`y` is up), or `null` while they have no body |
| `energy` | their energy, or `null` while they have no body |
| `isBot` | whether the game's AI plays them |
| `score`, `role` | what your scripts set this round |
| `gone` | whether they have left. Then `team`, `life`, `position` and `energy` read as `null` |

On a player's own PC (a `client/` script), a player that PC wasn't sent has no position.

## What you can do

- `moveTo(x, y, z)`, `kill()`, `addEnergy(points)`, `respawn(x?, y?, z?)`
- `say(text)` and `setLine(text)`: see [Messages and HUD](Messages-and-HUD.md)
- For game modes: `setTeam`, `setRole`, `setScore`, `addScore`, `setCell`, `bite`, and for bots
  `setGoal` and `removeBot`. See [Game modes](Game-Modes.md).

Every call and its range is on the [Player reference](Reference-Player.md).

## Example: a king of the hill

```ts
// King of the hill: each second, the one player nearest the "summit" piece, within 6 m, scores a
// point. The first to 60 is told they rule the reef.
const summit = game.piece("summit");
const points = new Map<Player, number>();

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

game.onRoundStart(() => {
  points.clear();
});

every(1, () => {
  const top = summit?.position;
  if (!top || game.phase !== "play") {
    return;
  }
  let king: Player | null = null;
  let nearest = 6;
  for (const player of game.players()) {
    const at = player.position;
    if (player.alive && at && distance(at, top) < nearest) {
      nearest = distance(at, top);
      king = player;
    }
  }
  if (!king) {
    return;
  }
  const now = (points.get(king) ?? 0) + 1;
  points.set(king, now);
  if (now === 60) {
    game.say(`${king.name} rules the reef!`);
  }
});

game.onLeave((player) => {
  points.delete(player);
});
```

## Example: teleport pads

```ts
// Two zones, "pad_a" and "pad_b": swim into one and come out at the other, with a 3 second rest so
// nobody bounces back and forth.
const pads = [game.zone("pad_a"), game.zone("pad_b")];
const resting = new Set<Player>();

function sendTo(player: Player, pad: Zone | null): void {
  const to = pad === pads[0] ? game.piece("pad_a_exit") : game.piece("pad_b_exit");
  const at = to?.position;
  if (!at || resting.has(player)) {
    return;
  }
  resting.add(player);
  player.moveTo(at.x, at.y, at.z);
  game.playSoundAt("swell", at.x, at.y, at.z);
  after(3, () => resting.delete(player));
}

pads[0]?.onEnter((player) => sendTo(player, pads[1]));
pads[1]?.onEnter((player) => sendTo(player, pads[0]));
```

Mark where each pad lets out with a named piece (`pad_a_exit`, `pad_b_exit`), so you can move the
exits in Godot without touching the script.
