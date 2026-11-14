# API version and changelog

## Which version

The API has version numbers like `1.2.0`, each one a release on the
[releases page](https://github.com/wildware-uk/smart-fellas-modding/releases), with the types file
attached. The game and the map maker each take a release of this repository, so the version the game
understands is the one it was built with.

- The **last number** goes up for fixes and clearer docs: nothing a script can tell.
- The **middle number** goes up when calls are added. Older scripts still work.
- The **first number** goes up when a call is taken away or changes what it does. The changelog says
  what to use instead.

## What changed

The newest version is **1.7.0**. It adds bot levels: `player.setBotLevel(level)` makes one bot play
`"easy"`, `"normal"` or `"hard"`, and `player.botLevel` reads it ([Game modes](Game-Modes.md#bots)).

Version 1.6.0 added markers on a player: `game.marker(id, { on: player })` rides over them
([HUD widgets and markers](HUD-Widgets-and-Markers.md#markers)). Calls since then read only the
values an object holds itself: a getter, a value from its prototype or a `Proxy` reads as left out.
Object literals and `Vec` points work as before, and so do scripts written for 1.0.0 to 1.5.0 that
pass them.

Version 1.5.0 added [Water and lights](Water-and-Lights.md):

- `game.setWater(spec, seconds?)` and `game.resetWater(seconds?)`: change the water's colour, how
  far anyone sees and how bright it is, fading in.
- `game.light(id, spec)` and `game.removeLight(id)`: coloured lights in the world.

Version 1.4.0 added [Menus and votes](Menus-and-Votes.md):

- `game.menu(id, spec, viewers?)` and `game.removeMenu(id, viewers?)`: a card of 2 to 5 choices
  players pick with the number keys.
- `game.onChoose(handler)`: hears each pick.
- `game.vote(spec, viewers?)`: asks a question and settles with the winner and the counts.
- `game.endRound(winner, why?, text?)`: your own line on the results.

Version 1.3.0 added [Rays and the ground](Rays-and-Ground.md):

- `game.raycast(from, to)`: where a straight line first meets the map.
- `game.lineOfSight(a, b)` and `game.groundBelow(point)`.
- `game.playArea`: the box players swim in.

Version 1.2.0 added, for one player ([Players](Players.md)):

- `player.allow(skill, allowed)` and `player.allowed(skill)`: switch their dash, ink, grab, smell
  or gun off, and back on.
- `player.data`: a store of values of their own, kept for the whole match.

Version 1.1.0 added:

- [Helpers](Helpers.md) every script has: `Vec`, `Maths`, `Random`, `Ease`, `tween`, `StateMachine`,
  `store` and `log`.
- [Finding things](Finding-Things.md): `game.playersNear`, `game.nearestPlayer`,
  `game.creaturesNear` and `game.nearestCreature`.
- [HUD widgets and markers](HUD-Widgets-and-Markers.md): `game.announce`, `game.widget`,
  `game.marker` and their `remove` calls, for everyone, a team, or one player.
- For one player: `player.setSpeed` and `player.speed`, `player.playSound` and `player.announce`
  ([Players](Players.md)).
- `game.playSoundForTeam` ([Sounds](Sounds.md)).
- The events `game.onDash`, `game.onInk`, `game.onGrab` and `game.onShoot` ([Events](Events.md)).

[CHANGELOG.md](https://github.com/wildware-uk/smart-fellas-modding/blob/main/CHANGELOG.md) says what
changed in each version, newest first.

## Keeping your scripts up to date

- **Maps:** the map maker puts a fresh `smart-fellas.d.ts` in your scripts folder each time you
  export, so your editor knows the calls the map maker was built with. Keep the add-on up to date:
  its Map panel says when a new version is out.
- **Modes:** copy `smart-fellas.d.ts` from here into your mode's `scripts/` folder again. Or download
  it straight from the newest release:
  <https://github.com/wildware-uk/smart-fellas-modding/releases/latest/download/smart-fellas.d.ts>
  If you installed the types with npm, run `npm update` in your `scripts/` folder instead.

Each release is also on npm as
[`@wildware/smart-fellas`](https://www.npmjs.com/package/@wildware/smart-fellas), at the same version.

A call that's new in this repository only works once the game has a release that knows it. If a call
in your editor does nothing in the game, update the game.
