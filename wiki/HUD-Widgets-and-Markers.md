# HUD widgets and markers

Three ways to put things on players' screens beyond chat and the banner: big announcements in the
middle, widgets down the left side, and markers in the world. New in API 1.1.0.

The host's game decides them and sends them to the players they are for. A `client/` script may use
them too, as it may `say`: what it shows is on that player's own screen alone.

## Who sees it

Each call takes `viewers` last:

- leave it out, and everyone sees it;
- give a team, such as `"diver"`, and that team sees it;
- give a player, and that player alone sees it.

## Announcements

`game.announce(text, seconds?, viewers?)` shows big text in the middle of the screen: 1 to 60
characters, for 0.5 to 15 seconds (3 if left out). A new one replaces the one showing.
`player.announce(text, seconds?)` is the same for one player.

An announcement counts as a message from the map, so it shares the limits of `game.say`: at most 3 a
tick and 6 a second for any one player. A call that would go over throws an Error, as `say` does.

```ts
// A big "Last minute!" for everyone, and the divers alone get a push.
let told = false;

game.onRoundStart(() => {
  told = false;
});

every(1, () => {
  if (game.phase === "play" && !told && game.timeLeft <= 60) {
    told = true;
    game.announce("Last minute!", 3);
    game.announce("Find them, fast!", 3, "diver");
  }
});
```

## Widgets

`game.widget(id, spec, viewers?)` shows a widget in a column on the left of the screen, under the
banner, or changes the one with that `id`. There are four kinds:

| `kind` | Shows | Uses |
| --- | --- | --- |
| `"text"` | a line of text | `text`, 0 to 40 characters |
| `"bar"` | a bar that fills up | `value`, from 0 to `max` (1 if left out) |
| `"counter"` | a number | `value` (whole numbers shown without decimals) |
| `"timer"` | a countdown, as m:ss | `seconds` to count down from, 0 to 86400; it stops at 0:00 |

Each may have a `label` above it (0 to 24 characters) and a `colour` (`"#rrggbb"`, white if left
out).

- `id` is 1 to 16 letters, digits, `-` or `_`. Call `widget` again with the same id to change it.
- At most 8 widgets show on any player's screen. A 9th isn't shown on that screen, with no error.
  Changing or removing the ones already there always works.
- They stay until `game.removeWidget(id, viewers?)` takes them off, or the lobby comes back.
- A call that changes nothing sends nothing, so it is fine to call it every tick. When a script
  changes a lot at once, each player is sent a few changes a tick, and the latest of each wins.
- A player who joins later sees the widgets and markers showing for everyone and for their team.
  One who moves to another team (`player.setTeam`) swaps the old team's for the new team's; what
  was shown to them alone stays.
- A map's script and a mode's script never share an id: each has its own widgets and markers.
- A `client/` script's own widgets and markers have their own room: they never take the host's.
- A timer counts down by itself. Asking for it again with the same `seconds` doesn't restart it, so
  calling it every tick is fine; change `seconds` to restart it.

```ts
// Each player sees their own meals this round, and everyone sees how many octopuses are left.
every(0.5, () => {
  if (game.phase !== "play") {
    return;
  }
  const octopuses = game.players().filter((player) => player.team === "octopus");
  const left = octopuses.filter((player) => player.alive).length;
  game.widget("left", { kind: "counter", label: "Octopuses left", value: left, colour: "#ff8844" });
});

game.onEat((player) => {
  const meals = store.add(`meals:${player.id}`);
  game.widget("meals", { kind: "bar", label: "Meals (goal 10)", value: Math.min(meals, 10), max: 10 }, player);
});

game.onRoundStart(() => {
  game.widget("clock", { kind: "timer", label: "Time left", seconds: game.timeLeft });
});

game.onRoundEnd(() => {
  game.removeWidget("left");
  game.removeWidget("meals");
  game.removeWidget("clock");
});
```

## Markers

`game.marker(id, spec, viewers?)` draws a marker at a point in the world, or moves or changes the one
with that `id`. Players see it through rock, with how far away it is under it.

- `at`: the point, within 1000 m of the map's middle.
- `label`: the text over it, 0 to 24 characters.
- `colour`: `"#rrggbb"`, white if left out.

Ids are as for widgets. At most 16 markers show on any player's screen; a 17th isn't shown there,
with no error. `game.removeMarker(id, viewers?)`
takes one off.

```ts
// The divers see a marker on the octopus with the most energy, moving with them.
every(0.25, () => {
  if (game.phase !== "play") {
    return;
  }
  const octopuses = game.players().filter((player) => player.team === "octopus" && player.position);
  octopuses.sort((a, b) => (b.energy ?? 0) - (a.energy ?? 0));
  const top = octopuses[0];
  if (top?.position) {
    game.marker("fattest", { at: top.position, label: "Well fed", colour: "#ff4444" }, "diver");
  } else {
    game.removeMarker("fattest", "diver");
  }
});
```

To glide a marker smoothly from one spot to another, move it every tick with
[`tween`](Helpers.md#tween-and-ease).

## A whole mode

[King of the Reef](https://github.com/wildware-uk/smart-fellas-modding/tree/main/examples/showcase_mode)
uses all of these: a hill marker that glides between spots, a countdown, the leader's name, each
player's own points bar, and announcements as the hill opens and moves.

## See also

- [Messages and HUD](Messages-and-HUD.md): chat, the banner, the scoreboard and a player's own line.
- The [Game reference](Reference-Game.md), for every call and its ranges.
