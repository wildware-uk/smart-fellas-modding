# Sounds

A script plays the game's own sounds. It can't bring sounds of its own.

| Name | Sounds like |
| --- | --- |
| `"groan"` | rock groaning, deep in a cave |
| `"drip"` | water dripping in a cave |
| `"rockfall"` | rocks tumbling down |
| `"whale"` | a far-off whale call |
| `"boom"` | a deep boom, like a big fish calling |
| `"swell"` | a swell of water, as a shark draws near |
| `"hiss"` | a hiss, like an eel's |
| `"chime"` | a short bright chime |
| `"roar"` | a beast's roar |
| `"thunk"` | a hard thunk, like a spear striking wood |

`game.sounds()` lists them too.

- `game.playSound(name)` plays it for everyone, wherever they are.
- `game.playSoundAt(name, x, y, z)` plays it at a point, heard by whoever is near.
- `game.playSoundForTeam(team, name)` plays it for one team only, wherever they are (on the host
  only; new in API 1.1.0).
- `player.playSound(name)` plays it for one player alone (on the host only; new in API 1.1.0).

A few sounds a second at most; more are dropped. In a `client/` script, a sound is for that player
alone.

## Example: an eerie cave

```ts
// The "cave" zone drips and groans around whoever is inside, every 12 seconds or so.
const cave = game.zone("cave");

every(12, () => {
  const inside = cave?.players() ?? [];
  if (inside.length === 0) {
    return;
  }
  const someone = inside[Math.floor(game.random() * inside.length)];
  const at = someone.position;
  if (at) {
    game.playSoundAt(game.random() < 0.5 ? "drip" : "groan", at.x, at.y + 3, at.z);
  }
});
```

## Example: a warning for one team

```ts
// When a shark appears, the octopuses hear a swell and the divers hear nothing.
every(1, () => {
  if (game.phase !== "play") {
    return;
  }
  const sharks = game.creatures("shark").length;
  if (sharks > store.get("sharks", 0)) {
    game.playSoundForTeam("octopus", "swell");
  }
  store.set("sharks", sharks);
});
```

## Example: a sound for one player only

From the host, `player.playSound` plays a sound for that player alone:

```ts
// The diver who makes a catch hears a chime.
game.onCaught((_octopus, by) => {
  by?.playSound("chime");
});
```

A `client/` script can do the same for its own player. Put this in `client/`. It runs on each player's own PC, so the chime is theirs alone.

```ts
// client/welcome.ts: a soft chime and a tip for each player as their round starts.
game.onRoundStart(() => {
  game.playSound("chime");
  game.say("Tip: pull the lever by the wreck to open the vault.");
});
```
