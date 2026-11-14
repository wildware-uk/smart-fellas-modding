# Changelog

What changed in the Smart Fellas scripting API, its examples and its wiki, newest first.

## 1.3.0

Calls added; scripts written for 1.0.0 to 1.2.0 work as they did. Each needs a game that knows API
1.3.0.

- Rays through the map: `game.raycast(from, to)` settles with where a straight line first meets the
  map's rock, sand or pieces (a new type, `RayHit`), or null. Players and creatures are let through.
- Built on it: `game.lineOfSight(a, b)`, `game.groundBelow(point)` and `game.randomGroundPoint()`.
- `game.playArea`: the box players swim in (a new type, `PlayArea`).
- Wiki: a new page, Rays and the ground, with examples.

## 1.2.0

Calls added; scripts written for 1.0.0 and 1.1.0 work as they did. Each needs a game that knows API
1.2.0.

- `player.allow(skill, allowed)` switches one player's dash, ink, grab, smell or gun off, or back
  on, until the round ends; `player.allowed(skill)` reads it back. A new type, `Skill`, names them.
- `player.data`: a store of values for one player, kept from round to round for the whole match.
  The store's calls now have a type of their own, `Store`.
- Wiki: the Players page explains both, with examples.

## 1.1.0

Calls added; scripts written for 1.0.0 work as they did. Each needs a game that knows API 1.1.0.

- Helpers in every script: `Vec` (maths on points), `Maths` (clamp, lerp, remap and more), `Random`
  (random numbers from a seed, the same on every PC), `Ease` and `tween` (smooth movement over
  time), `StateMachine` (named phases, one at a time), `store` (values for this round, emptied as
  each round starts) and `log` (a line in the game's log).
- Finding things near a point: `game.playersNear`, `game.nearestPlayer`, `game.creaturesNear` and
  `game.nearestCreature`.
- On screen, for everyone, one team or one player: `game.announce` (big text in the middle),
  `game.widget` and `game.removeWidget` (text, bars, counters and countdowns on the left), and
  `game.marker` and `game.removeMarker` (markers in the world, seen through rock).
- For one player: `player.setSpeed` and `player.speed`, `player.playSound` and `player.announce`.
- `game.playSoundForTeam`: a sound for one team only.
- New events: `game.onDash`, `game.onInk`, `game.onGrab` and `game.onShoot`.
- A new example mode, King of the Reef (`examples/showcase_mode`), that uses most of the above.
- Wiki: new pages Helpers, Finding things, and HUD widgets and markers; a Helpers reference page.

## 1.0.0

- The scripting API for Smart Fellas maps and game modes in a repository of its own: the types file,
  the map script examples, the game mode template and the wiki.
