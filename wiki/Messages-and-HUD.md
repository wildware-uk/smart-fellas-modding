# Messages and HUD

How a script talks to players.

| Call | Who sees it | Where |
| --- | --- | --- |
| `game.say(text)` | everyone | the chat, marked as from the map |
| `game.sayToTeam(team, text)` | one team | the chat |
| `player.say(text)` | that player | the chat |
| `game.banner(text)` | everyone | a banner across the top of the screen (for game modes) |
| `player.setLine(text)` | that player | a line under the banner, until changed or the round starts (for game modes) |
| `game.scoreboard(...columns)` | everyone | the live scoreboard's columns (for game modes) |
| `player.setCell(column, value)` | everyone | that player's cell in a scoreboard column (for game modes) |
| `game.announce(text, seconds?, viewers?)` | everyone, a team, or a player | big text in the middle of the screen (on the host only) |
| `player.announce(text, seconds?)` | that player | big text in the middle of the screen (on the host only) |
| `game.widget(id, spec, viewers?)` | everyone, a team, or a player | a text line, bar, counter or countdown on the left, under the banner (on the host only) |
| `game.marker(id, spec, viewers?)` | everyone, a team, or a player | a marker at a point in the world, seen through rock (on the host only) |

- Chat messages are 1 to 120 characters, and a few a second at most. They pass through each player's
  own chat filter.
- A banner is 0 to 80 characters; `""` clears it. A player's line is the same.
- The scoreboard takes up to 6 columns of 1 to 16 characters. Cells hold a number, or text of 0 to 16
  characters. Calling `game.scoreboard()` with none hides it.

In a `client/` script, `game.say` is for that player alone.

Announcements, widgets and markers are new in API 1.1.0. They have a page of their own:
[HUD widgets and markers](HUD-Widgets-and-Markers.md).

## Example: a race with a live scoreboard

```ts
// A race through three zones in order: "gate1", "gate2", "gate3". Each player's next gate is on the
// scoreboard, and their own line says where to go. First through all three wins.
const gates = [game.zone("gate1"), game.zone("gate2"), game.zone("gate3")];
const next = new Map<Player, number>();

game.onMatchStart(() => {
  game.scoreboard("Gate");
});

function show(player: Player): void {
  const gate = next.get(player) ?? 0;
  player.setCell("Gate", gate + 1);
  player.setLine(`Swim through gate ${gate + 1}`);
}

game.onRoundStart(() => {
  next.clear();
  game.banner("Race! Through the three gates in order");
  for (const player of game.players()) {
    show(player);
  }
});

gates.forEach((zone, index) => {
  zone?.onEnter((player) => {
    if ((next.get(player) ?? 0) !== index) {
      return;
    }
    if (index === gates.length - 1) {
      game.say(`${player.name} wins the race!`);
      game.endRound(player);
      return;
    }
    next.set(player, index + 1);
    player.say(`Gate ${index + 1}!`);
    show(player);
  });
});

game.onTimeUp(() => {
  game.endRound("draw");
});
```

## Example: tell a team

```ts
// Warns the divers when an octopus eats near the "vault" zone.
const vault = game.zone("vault");

game.onEat((player) => {
  if (vault?.players().includes(player)) {
    game.sayToTeam("diver", "Something is feeding in the vault.");
  }
});
```
