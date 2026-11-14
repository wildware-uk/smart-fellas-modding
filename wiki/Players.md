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
| `speed` | their speed as a share of normal: 1 is normal, 0 is held still. On a player's PC, what it was sent (1 if nothing) |
| `allowed(skill)` | whether a skill works for them: `true` unless a script switched it off |
| `invisible` | whether a script made them invisible, on the host; `null` on a player's PC |
| `data` | a store of values of their own, kept for the whole match |
| `gone` | whether they have left. Then `team`, `life`, `position` and `energy` read as `null` |

On a player's own PC (a `client/` script), a player that PC wasn't sent has no position.

## What you can do

- `moveTo(x, y, z)`, `kill()`, `addEnergy(points)`, `respawn(x?, y?, z?)`
- `say(text)` and `setLine(text)`: see [Messages and HUD](Messages-and-HUD.md)
- For game modes: `setTeam`, `setRole`, `setScore`, `addScore`, `setCell`, `bite`, and for bots
  `setGoal`, `setBotLevel` and `removeBot`. See [Game modes](Game-Modes.md).
- `setSpeed(share)` (on the host only), `playSound(sound)` and `announce(text, seconds?)`. See below.
- `allow(skill, allowed)` (on the host only): switch one of their skills off or on. See below.
- `setInvisible(invisible)` (on the host only): hide them from everyone else, or show them again.
  See below.

To find the players near a point, use `game.playersNear` and `game.nearestPlayer`: see
[Finding things](Finding-Things.md).

## Speed, sounds and announcements for one player

New in API 1.1.0. `setSpeed` works on the host only; in a `client/` script, `playSound` and
`announce` are for that player's own screen, as `say` is:

- `setSpeed(share)` sets how fast they swim and crawl, as a share of normal: 0 to 3. 0 holds them
  still (they can still look round and use abilities), 1 is normal. It works for octopuses and
  divers; dashes keep their own pace, and a creature a player drives (a shark on a mode's team)
  keeps its own speed. It stays until changed, and goes back to normal when a round starts and when
  the lobby comes back. `speed` reads it back, on the host and on players' PCs.
- `announce` counts as a message from the map, with the same limits as `say`.
- `playSound(sound)` plays one of the game's [sounds](Sounds.md) for them alone.
- `announce(text, seconds?)` shows them alone big text in the middle of the screen: see
  [HUD widgets and markers](HUD-Widgets-and-Markers.md).

```ts
// Whoever is caught is dazed: they swim at half speed for 5 seconds after they come back.
game.onRespawn((player) => {
  player.setSpeed(0.5);
  player.announce("Dazed...", 2);
  player.playSound("groan");
  after(5, () => {
    player.setSpeed(1);
  });
});
```

## Switching skills off

New in API 1.2.0, on the host only. `allow(skill, false)` switches one skill off for that player
alone, and `allow(skill, true)` gives it back. The skills are an octopus's `"dash"`, `"ink"`,
`"grab"` and `"smell"`, and a diver's `"shoot"` (whichever gun they carry).

- A skill switched off does nothing when they use it: pressing it (or starting to hold smell) plays
  a soft "no", an octopus's button for it shows faint, and a diver's crosshair dot dims.
- Switching `"grab"` off lets go of whatever they hold. Ink or a shot already on its way finishes.
- It stays through deaths and respawns, and every skill comes back as a round starts and when the
  lobby comes back. Switch skills off in `onRoundStart`.
- `allowed(skill)` reads it back, on the host and on players' PCs.

```ts
// Divers can't shoot for the first 20 seconds of each round, so octopuses get a head start, and
// octopuses can't smell, so they hide by sight alone.
game.onRoundStart(() => {
  for (const player of game.players()) {
    if (player.team === "diver") {
      player.allow("shoot", false);
      player.announce("Hold fire...", 3);
      after(20, () => player.allow("shoot", true));
    } else if (player.team === "octopus") {
      player.allow("smell", false);
    }
  }
});
```

## Invisible players

New in API 1.8.0, on the host only. `setInvisible(true)` hides a player from everyone else, and
`setInvisible(false)` shows them again.

- No other player's PC is sent their body, as if they were far away. So nobody else sees them,
  their name or a marker on them, and a changed game on someone's PC can't find them either.
- They still see themselves and everyone else.
- They stay solid, and the game's bots still sense them.
- It stays through deaths and respawns, and everyone is seen again as a round starts and when the
  lobby comes back. Make players invisible in `onRoundStart`.
- `invisible` reads it back on the host. On a player's PC it is `null`: that PC isn't told.

```ts
// The hunter is invisible for the first 30 seconds of each round, then everyone sees them.
game.onRoundStart(() => {
  const hunter = game.players().find((player) => player.team === "diver");
  if (!hunter) return;
  hunter.setInvisible(true);
  hunter.setLine("You are invisible for 30 seconds");
  after(30, () => {
    hunter.setInvisible(false);
    hunter.setLine("");
  });
});
```

## Data of their own

New in API 1.2.0. `player.data` is a store of values for that one player, with the same calls as
[`store`](Helpers.md#store): `get(key, fallback?)`, `set`, `add`, `has`, `delete`, `keys` and
`clear`. It differs from `store` in what it lasts for:

- It is kept from round to round, for the whole match, where `store` empties each round.
- It is let go at the first round start after the player leaves, so `onLeave` can still read it.
- Each set of scripts has its own: the map's and the mode's don't share it, and each PC's scripts
  have their own.

```ts
// Count each player's wins over the match, and say so when they leave.
game.onRoundEnd((winner) => {
  for (const player of game.players()) {
    if (player.team === winner) player.data.add("wins");
  }
});
game.onLeave((player) => {
  game.say(`${player.name} leaves with ${player.data.get("wins", 0)} wins`);
});
```

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
