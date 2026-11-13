# Game modes

A game mode sets a match's rules: who is on which team, what a catch does, what scores, the clock,
and who wins. Every round in Smart Fellas is played by a mode, the game's own Classic and Infected
included. The game has no win checks of its own: your mode ends each round.

Any mode plays on any map. The host picks the mode in the lobby, apart from the map.

## A mode is a folder

```
my_mode/
  mode.json        its name, description, player counts and lobby settings
  scripts/         TypeScript or JavaScript, laid out like a map's: client/ and shared/ work the same
  icons/           optional: pictures for the abilities it gives a team
  preview.png      optional: its picture on the Workshop and in the lobby, 16:9 is best
```

Start from [`mode_template`](https://github.com/wildware-uk/smart-fellas-modding/tree/main/mode_template)
in this repository. [Getting started](Getting-Started.md) says where to put it.

## mode.json

```json
{
  "name": "Tag Team",
  "description": "Catch an octopus to win a point for your side. Most points when time runs out wins.",
  "minPlayers": 2,
  "maxPlayers": 16,
  "minDivers": 1,
  "minOctopuses": 1,
  "teamLines": { "octopus": "Stay free as long as you can", "diver": "Every catch is a point" },
  "startLines": { "octopus": "Tag Team: don't get caught", "diver": "Tag Team: catch them all" },
  "revives": false,
  "settings": [
    { "name": "goal", "label": "Points to win", "type": "number", "min": 1, "max": 20, "step": 1, "default": 5 },
    { "name": "pace", "label": "Pace", "type": "choice", "choices": ["Calm", "Fast"], "default": "Calm" },
    { "name": "sharks", "label": "Sharks", "type": "toggle", "default": false }
  ]
}
```

| Field | Means |
| --- | --- |
| `name` | up to 32 characters |
| `description` | up to 200 characters |
| `minPlayers`, `maxPlayers` | the fewest a round starts with and the most the mode is for, bots included (2 and 32 if left out) |
| `minDivers`, `minOctopuses` | the fewest on each team a round may start with (0 if left out) |
| `teamLines` | the line under each team's name in the lobby, up to 60 characters |
| `startLines` | the line under the banner as the hunt starts, up to 60 characters |
| `look` | `"catches"` or `"turns"` to use the game's own octopuses-left count and results (Classic's, Infected's); leave it out for your own scoreboard and banner |
| `revives` | `true` if the lobby's Revives setting applies: a netted octopus may be freed by a teammate |
| `settings` | up to 8 lobby settings: a `number` (with `min`, `max`, `step`), a `choice` (up to 8 `choices`), or a `toggle`, each with a `label` and a `default` |

`mode.json` may hold up to 16 KB, and the game refuses fields it doesn't know, so a typo is caught.

## Read a lobby setting

`game.setting(name)` gives what the host chose: a number, the choice's name, or `true`/`false`.

```ts
// Reads the lobby's settings at the start of each round.
game.onRoundStart(() => {
  const goal = Number(game.setting("goal") ?? 5);
  const fast = game.setting("pace") === "Fast";
  game.banner(`First side to ${goal} points wins`);
  if (fast) {
    game.setTimeLeft(180);
  }
});
```

## Rounds

- `game.onRoundStart` runs as each round starts. Reset your counts here.
- **You end the round** with `game.endRound(winner, why?)`. The winner is a team, one player (where
  everyone plays for themselves), or `"draw"`.
- `game.onTimeUp` runs when the clock runs out. End the round on that tick, or it ends as a draw.
- `game.setTimeLeft`, `game.addTime` and `game.holdClock` change the clock.
- `why` picks one of the game's own lines for the results, such as `"timeUp"` or `"allCaught"`. It must
  fit the winner: `"allCaught"`, `"allTurned"` and `"octopusesLeft"` are the divers' wins, `"timeUp"`
  and `"diversLeft"` the octopuses'. Leave it out and the results say the mode decided.

## Scoring, the scoreboard and the banner

```ts
// Tag Team: every catch is a point for the divers' side, every 30 seconds free a point for the
// octopuses'. First to the goal wins; at time up, the side ahead wins.
game.onMatchStart(() => {
  game.scoreboard("Catches");
});

function goal(): number {
  return Number(game.setting("goal") ?? 5);
}

function check(): void {
  if (game.teamScore("diver") >= goal()) {
    game.endRound("diver");
  } else if (game.teamScore("octopus") >= goal()) {
    game.endRound("octopus");
  }
}

game.onRoundStart(() => {
  game.setTeamScore("diver", 0);
  game.setTeamScore("octopus", 0);
  game.banner(`First side to ${goal()} points wins`);
});

game.onCaught((_octopus, by) => {
  if (by && by.team === "diver") {
    by.addScore(1);
    by.setCell("Catches", by.score + 1);
    game.addTeamScore("diver", 1);
    check();
  }
});

every(30, () => {
  if (game.phase === "play") {
    game.addTeamScore("octopus", 1);
    check();
  }
});

game.onTimeUp(() => {
  const divers = game.teamScore("diver");
  const octopuses = game.teamScore("octopus");
  game.endRound(divers === octopuses ? "draw" : divers > octopuses ? "diver" : "octopus");
});
```

Scores and cells change after the tick, like every action, so `by.score` still reads the old score in
the same handler. That's why the example adds one.

The scoreboard lists every person. A bot shows only once your scripts give it a score or a cell, so
bots you leave alone stay off it.

## Teams, roles and what a catch does

- `player.setTeam(team)` moves a player to the other side at any time. They go back to the team they
  chose when the lobby comes back.
- `player.setRole(text)` gives a secret role, kept on the host and never sent to players. Read it
  back with `player.role`. Tell a player their role with `player.setLine` or `player.say`.
- `game.setFate(team, fate, seconds?)` says what being caught does to a team: `"out"`, `"held"` (a
  netted octopus stays in its net where a teammate could free it), `"respawn"`, or `"turn"` (back on
  the other team). Until you set it, octopuses are `"held"` and divers `"respawn"`.
- `game.setSpawn` and `game.clearSpawn` say where a team comes back.
- `game.closeTeam(team, why)` greys out a team's Join button in the lobby; `game.openTeam` opens it.
- `game.freeForAll(true)`: everyone plays for themselves.
- `game.loadout("diver", ...tools)`: what divers carry, from `"spear"`, `"net"`, `"sensor"` and `"torch"`.

```ts
// Roles: each round one octopus is secretly picked, and only it is told. Caught octopuses come back
// as divers after 5 seconds.
game.onMatchStart(() => {
  game.setFate("octopus", "turn", 5);
});

game.onRoundStart(() => {
  const octopuses = game.players().filter((player) => player.team === "octopus");
  if (octopuses.length === 0) {
    return;
  }
  const hunter = octopuses[Math.floor(game.random() * octopuses.length)];
  for (const player of octopuses) {
    player.setRole(player === hunter ? "picked" : "");
    player.setLine(player === hunter ? "You were picked. Keep it quiet." : "One of you was picked.");
  }
});

game.onTeamChange((player, from, to) => {
  if (from === "octopus" && to === "diver") {
    player.setLine("You were caught. Now you hunt.");
  }
});

game.onTimeUp(() => {
  game.endRound("octopus", "timeUp");
});
```

## Teams of your own

A mode may add up to two teams of its own, whose players each drive a creature. Call
`game.registerTeam` from `onMatchStart`. People join it in the lobby like any team, and bots fill it
with `game.setBots`.

```ts
// A team of sharks hunting octopuses beside the divers, with a lunge on the Dash key.
game.onMatchStart(() => {
  game.registerTeam("shark", {
    name: "Sharks",
    colour: "#a9d2ec",
    body: "shark",
    most: 3,
    line: "Hunt from below",
    startLine: "You are a shark: bite an octopus",
  });
  game.registerAbility("lunge", {
    team: "shark",
    slot: 1,
    name: "Lunge",
    cooldown: 8,
    range: 14,
    lunge: { speed: 22, metres: 14 },
  });
  game.setBots("shark", 1);
});

game.onAbilityLand((player, ability, target) => {
  if (ability === "lunge" && target.team === "octopus") {
    player.bite(target);
  }
});

game.onJoin((player) => {
  if (player.isBot && player.team === "shark") {
    player.setGoal("hunt");
  }
});

game.onTimeUp(() => {
  game.endRound("octopus", "timeUp");
});
```

The game shows an ability to its team as a round button with its key, its name and its cooldown, and
aims it: it goes off only at someone they can see near the middle of their screen. What it does is up
to your handlers. For a picture on the button, put a square PNG named after the ability's id in
`icons/`, such as `icons/lunge.png`: up to 512 KB and 1024 pixels across, and 8 in a mode. It's
drawn round, so keep what matters away from the corners.

## Bots

- `game.setBots(team, count)` asks for that many bots on a team. People always keep their places.
- `game.modeBots(team, true)` hides the host's bot count for that team in the lobby: your mode decides.
- `player.setGoal(goal)` tells a bot what to be after: `"own"` (its usual play), `"hide"`, `"flee"`,
  `"roam"`, `"hunt"`, or `"goTo"` with a point. A bot on a team your mode added heeds `"own"` and
  `"hunt"` only.
- `player.removeBot()` takes one bot out.

```ts
// Bots pick a fight: diver bots hunt, octopus bots run, and there are always two of each.
game.onMatchStart(() => {
  game.modeBots("diver", true);
  game.modeBots("octopus", true);
  game.setBots("diver", 2);
  game.setBots("octopus", 2);
});

game.onRoundStart(() => {
  for (const player of game.players()) {
    if (player.isBot) {
      player.setGoal(player.team === "diver" ? "hunt" : "flee");
    }
  }
});

game.onTimeUp(() => {
  game.endRound("octopus", "timeUp");
});
```

## More

- [Players](Players.md), [Events](Events.md) and [Messages and HUD](Messages-and-HUD.md) cover the
  calls above in more depth.
- [Testing and publishing](Testing-and-Publishing.md): try your mode, then put it on the Workshop.
- The [Game reference](Reference-Game.md) has every call, with its ranges.
