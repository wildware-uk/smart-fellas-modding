# HUD widgets and markers

Three ways to put things on players' screens beyond chat and the banner: big announcements in the
middle, widgets down the right side, and markers in the world. New in API 1.1.0.

All of them work on the host only. The host's game decides them and sends them to the players they
are for; a `client/` script's call does nothing.

## Who sees it

Each call takes `viewers` last:

- leave it out, and everyone sees it;
- give a team, such as `"diver"`, and that team sees it;
- give a player, and that player alone sees it.

## Announcements

`game.announce(text, seconds?, viewers?)` shows big text in the middle of the screen: 1 to 60
characters, for 0.5 to 15 seconds (3 if left out). A new one replaces the one showing. At most 2 a
second reach any one player; more are dropped. `player.announce(text, seconds?)` is the same for one
player.

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

`game.widget(id, spec, viewers?)` shows a widget in a column on the right of the screen, or changes the
one with that `id`. There are four kinds:

| `kind` | Shows | Uses |
| --- | --- | --- |
| `"text"` | a line of text | `text`, 0 to 40 characters |
| `"bar"` | a bar that fills up | `value`, from 0 to `max` (1 if left out) |
| `"counter"` | a number | `value` (whole numbers shown without decimals) |
| `"timer"` | a countdown, as m:ss | `seconds` to count down from, 0 to 86400; it stops at 0:00 |

Each may have a `label` above it (0 to 24 characters) and a `colour` (`"#rrggbb"`, white if left
out).

- `id` is 1 to 16 letters, digits, `-` or `_`. Call `widget` again with the same id to change it.
- At most 8 widgets on any player's screen.
- They stay until `game.removeWidget(id, viewers?)` takes them off, or the lobby comes back.
- A call that changes nothing sends nothing, so it is fine to call it every tick.
- A timer counts down by itself. Set it once, not every tick.

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

Ids are as for widgets. At most 16 markers on any player's screen. `game.removeMarker(id, viewers?)`
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
