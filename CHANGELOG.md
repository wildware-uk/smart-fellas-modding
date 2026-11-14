# Changelog

What changed in the Smart Fellas scripting API, its examples and its wiki, newest first.

## 1.6.0

Calls added; scripts written for 1.0.0 to 1.5.0 work as they did. Each needs a game that knows API
1.6.0.

- Markers on players: `MarkerSpec` takes `on: player` in place of `at`, and the marker rides over
  them. A screen shows it only while it is sent that player's body.
- The objects a call takes (a marker's, a widget's, a menu's, the water's, a light's, a team's, an
  ability's, and points) are read for the values they hold themselves. A value that comes from a
  getter, from the object's prototype or through a `Proxy` reads as left out, and a script's own code
  never runs inside a call. Object literals and `Vec` points work as before.
- Wiki: an example on HUD widgets and markers.

## 1.5.0

Calls added; scripts written for 1.0.0 to 1.4.0 work as they did. Each needs a game that knows API
1.5.0.

- The water: `game.setWater(spec, seconds?)` changes its colour, how far anyone sees through it and
  how bright it is, fading in over the seconds given (a new type, `WaterSpec`);
  `game.resetWater(seconds?)` gives back the map's own.
- Lights: `game.light(id, spec)` puts up a coloured light in the world, or moves or changes it (a
  new type, `LightSpec`); `game.removeLight(id)` takes it down. At most 16 at once.
- Wiki: a new page, Water and lights, with examples.

## 1.4.0

Calls added; scripts written for 1.0.0 to 1.3.0 work as they did. Each needs a game that knows API
1.4.0.

- Menus: `game.menu(id, spec, viewers?)` opens a card of 2 to 5 choices (a new type, `MenuSpec`)
  that players pick with the number keys 1 to 5; `game.removeMenu(id, viewers?)` closes it.
- `game.onChoose(handler)` hears each pick: the player, the menu's id, the choice's place and its
  text.
- `game.vote(spec, viewers?)` asks a question as a menu and settles with how it came out (new types,
  `VoteSpec` and `VoteResult`).
- `game.endRound(winner, why?, text?)` takes the script's own line for the results; `why` may be
  `null`.
- Wiki: a new page, Menus and votes, with examples.

## 1.3.0

Calls added; scripts written for 1.0.0 to 1.2.0 work as they did. Each needs a game that knows API
1.3.0.

- Rays through the map: `game.raycast(from, to)` settles with where a straight line first meets the
  map's rock, sand or pieces (a new type, `RayHit`), or null. Players and creatures are let through.
- Built on it: `game.lineOfSight(a, b)` and `game.groundBelow(point)`.
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
