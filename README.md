# Smart Fellas modding

The scripting API for [Smart Fellas](https://wildwarestudios.com/games/smart-fellas) maps and game
modes: the TypeScript types, worked examples, a game mode to start from, and
**[the modding wiki](https://github.com/wildware-uk/smart-fellas-modding/wiki)**.

## What you can make

- **Map scripts.** Make a map do things its pieces can't: a lever opens a door, a cave floods near
  the end of the round, eating a treasure wakes a shark. You build maps in Godot with the free
  [map maker](https://github.com/wildware-uk/smart-fellas-map-maker).
- **Game modes.** Set a match's rules: the teams (even new ones, playing as sharks), what a catch
  does, the scores, the clock, the bots, and who wins. Any mode plays on any map.

Both are written in TypeScript (or plain JavaScript), run in a sealed box on every PC, and are shared
on the Steam Workshop.

## Quick start

1. In the game, open **Workshop > Modes > My modes** and press **Open modes folder**.
2. Copy the [`mode_template`](mode_template) folder into it, and rename the copy.
3. Copy [`smart-fellas.d.ts`](smart-fellas.d.ts) and [`tsconfig.json`](tsconfig.json) into its
   `scripts/` folder, and open that folder in
   [VS Code](https://code.visualstudio.com): every call now completes as you type.
4. Change `scripts/mode.ts`. Here's a whole mode:

```ts
// Hot potato: every 20 seconds, the diver with the fewest catches is out of luck: they swap sides.
game.onMatchStart(() => {
  game.scoreboard("Catches");
});

game.onCaught((_octopus, by) => {
  if (by) {
    by.addScore(1);
    by.setCell("Catches", by.score + 1);
  }
});

every(20, () => {
  if (game.phase !== "play") {
    return;
  }
  const divers = game.players().filter((player) => player.team === "diver" && player.alive);
  divers.sort((a, b) => a.score - b.score);
  const unlucky = divers[0];
  if (unlucky && divers.length > 1) {
    unlucky.setTeam("octopus");
    game.say(`${unlucky.name} was too slow, and swims with the octopuses now!`);
  }
});

game.onTimeUp(() => {
  game.endRound("octopus", "timeUp");
});
```

5. Host a game on any map and pick your mode under **Game mode** in the lobby.

For a map script, the map maker puts the types file into your map's scripts folder for you. The
wiki's [Getting started](https://github.com/wildware-uk/smart-fellas-modding/wiki/Getting-Started)
walks through both.

## What's here

| | |
| --- | --- |
| [`smart-fellas.d.ts`](smart-fellas.d.ts) | every call a script can make, with what it does |
| [`tsconfig.json`](tsconfig.json) | the editor settings to put beside your scripts |
| [`examples/`](examples) | three map scripts to copy: a lever and door, a flooding cave, a treasure that wakes a shark |
| [`mode_template/`](mode_template) | a small working game mode, Catch Count, to make your own |
| [`wiki/`](wiki) | the wiki's pages, copied to [the wiki](https://github.com/wildware-uk/smart-fellas-modding/wiki) |
| [`tools/`](tools) | the checks below |

## The wiki

- [Getting started](https://github.com/wildware-uk/smart-fellas-modding/wiki/Getting-Started) and
  [How scripts run](https://github.com/wildware-uk/smart-fellas-modding/wiki/How-Scripts-Run)
- [Map scripts](https://github.com/wildware-uk/smart-fellas-modding/wiki/Map-Scripts) and
  [Game modes](https://github.com/wildware-uk/smart-fellas-modding/wiki/Game-Modes)
- [Players](https://github.com/wildware-uk/smart-fellas-modding/wiki/Players),
  [Events](https://github.com/wildware-uk/smart-fellas-modding/wiki/Events),
  [Timers](https://github.com/wildware-uk/smart-fellas-modding/wiki/Timers),
  [Creatures](https://github.com/wildware-uk/smart-fellas-modding/wiki/Creatures),
  [Sounds](https://github.com/wildware-uk/smart-fellas-modding/wiki/Sounds) and
  [Messages and HUD](https://github.com/wildware-uk/smart-fellas-modding/wiki/Messages-and-HUD)
- [Testing and publishing](https://github.com/wildware-uk/smart-fellas-modding/wiki/Testing-and-Publishing),
  [Common mistakes](https://github.com/wildware-uk/smart-fellas-modding/wiki/Common-Mistakes) and the
  [FAQ](https://github.com/wildware-uk/smart-fellas-modding/wiki/FAQ)
- The [Reference](https://github.com/wildware-uk/smart-fellas-modding/wiki/Reference): every call,
  made from the types file

## Every example is checked

`npm ci && npm run check` type-checks every example here against the types: the map scripts, the mode
template, and every code block in this README and the wiki. It also checks the wiki's reference pages
still match the types file. It runs on every change to this repository.

## Where this comes from

This is the API's own home: the game and the map maker take their copy of it from here, pinned to a
release. Bug reports and ideas are very welcome:
[open an issue](https://github.com/wildware-uk/smart-fellas-modding/issues/new). The API itself is
what the game understands, so a new call needs the game to learn it first; ask for it in an issue. For
help, and to show off what you made, come to the Smart Fellas Discord, linked from
[the map guide](https://wildwarestudios.com/games/smart-fellas/maps).

Every version, and what changed in it, is on the
[releases page](https://github.com/wildware-uk/smart-fellas-modding/releases) and in
[CHANGELOG.md](CHANGELOG.md).

## Licence

MIT: see [LICENSE](LICENSE). Use it, copy it, change it, in your maps and modes or anywhere else.

Smart Fellas modding, by [Wildware Studios](https://wildwarestudios.com).
