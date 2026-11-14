# Smart Fellas modding

Welcome. This wiki shows you how to script your own maps and game modes for
[Smart Fellas](https://wildwarestudios.com/games/smart-fellas), the online game of octopuses against
divers.

Scripts are small programs written in TypeScript (or plain JavaScript). A **map script** makes a map
do things its pieces can't: a lever opens a door, a cave floods near the end of the round, eating a
treasure wakes a shark. A **game mode** sets a match's rules: the teams, what a catch does, the
scores, the clock and who wins. Any mode plays on any map.

## Start here

1. [Getting started](Getting-Started.md): your first script, running in five minutes.
2. [How scripts run](How-Scripts-Run.md): where a script runs, how often, and its limits.
3. [Map scripts](Map-Scripts.md) or [Game modes](Game-Modes.md), whichever you're making.

## By topic

Each page has a whole script you can copy and run.

- [Players](Players.md): find players, move them, score them, give them roles, change their speed.
- [Events](Events.md): hear the match start, players join, eat, get caught.
- [Timers](Timers.md): do something later, or every few seconds.
- [Creatures](Creatures.md): find, spawn and remove creatures and food.
- [Sounds](Sounds.md): play the game's sounds, for everyone or at a spot.
- [Messages and HUD](Messages-and-HUD.md): say things, banners, the scoreboard, a player's own line.
- [HUD widgets and markers](HUD-Widgets-and-Markers.md): big announcements, bars, counters,
  countdowns and markers in the world.
- [Finding things](Finding-Things.md): the players and creatures near a point.
- [Rays and the ground](Rays-and-Ground.md): what stands in the way, and the ground under a point.
- [Helpers](Helpers.md): maths on points, seeded random numbers, smooth movement, phases, a store
  for the round, and a log.

## When you're done

- [Testing and publishing](Testing-and-Publishing.md): try it in the game, then share it on the Steam Workshop.
- [Common mistakes](Common-Mistakes.md) and the [FAQ](FAQ.md).
- [API version and changelog](API-Version-and-Changelog.md).

## Every call

The [Reference](Reference.md) lists every call a script can make. It is made from
`smart-fellas.d.ts`, the types file, each time that changes, so it always matches the game.
