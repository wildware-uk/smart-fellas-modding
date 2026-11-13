# Getting started

Five minutes from nothing to a script running in your map.

## What you need

- **Smart Fellas**, installed through Steam. The game runs your scripts.
- **The map maker**: the free Godot add-on, from
  [wildware-uk/smart-fellas-map-maker](https://github.com/wildware-uk/smart-fellas-map-maker). Its
  README says how to get it running. You only need it for map scripts: a game mode is just a folder.
- **An editor that knows TypeScript**, such as [VS Code](https://code.visualstudio.com). It's
  optional, but it completes every call as you type and underlines mistakes.

You don't need Node, npm or a TypeScript compiler. The game reads TypeScript itself.

## Your first map script

1. Open your map in Godot. Make a folder for its scripts beside it, such as `maps/my_map_scripts/`.
2. Select the map's top node. Under **Scripts** in the Inspector, choose that folder.
3. In that folder, make a file called `hello.ts` and put this in it:

```ts
// Greets every player as they join, and says how long the round has left every minute.
game.onJoin((player) => {
  player.say(`Welcome to my map, ${player.name}!`);
});

every(60, () => {
  if (game.phase === "play") {
    game.say(`${Math.round(game.timeLeft)} seconds left.`);
  }
});
```

4. Press **Test Map** above the 3D view. The game opens on your map with a few bots, and your
   message shows in the chat.

The first time you press Test Map or Export, the add-on puts `smart-fellas.d.ts` (the types file)
and a `tsconfig.json` into your scripts folder. Open that folder in VS Code and every call completes
as you type.

## Your first game mode

A mode is a folder in the game's modes folder.

1. In the game, open **Workshop > Modes > My modes** and press **Open modes folder**.
2. Copy the [`mode_template`](https://github.com/wildware-uk/smart-fellas-modding/tree/main/mode_template)
   folder from this repository into it, and rename the copy, say `my_mode`.
3. Copy `smart-fellas.d.ts` and `tsconfig.json` from this repository into its `scripts/`
   folder, so your editor knows the calls.
4. Host a game on any map, and pick **Catch Count** under **Game mode** in the lobby.

Now change `scripts/mode.ts` and `mode.json` into your own. [Game modes](Game-Modes.md) says how.

## Next

- [How scripts run](How-Scripts-Run.md): where a script runs, how often, and its limits. Read this
  one: it saves you hours.
- [Map scripts](Map-Scripts.md): doors, levers and trigger zones.
- [Game modes](Game-Modes.md): teams, rounds, scores and bots.
