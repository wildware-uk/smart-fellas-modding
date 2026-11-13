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

[CHANGELOG.md](https://github.com/wildware-uk/smart-fellas-modding/blob/main/CHANGELOG.md) says what
changed in each version, newest first.

## Keeping your scripts up to date

- **Maps:** the map maker puts a fresh `smart-fellas.d.ts` in your scripts folder each time you
  export, so your editor knows the calls the map maker was built with. Keep the add-on up to date:
  its Map panel says when a new version is out.
- **Modes:** copy `smart-fellas.d.ts` from here into your mode's `scripts/` folder again. Or download
  it straight from the newest release:
  <https://github.com/wildware-uk/smart-fellas-modding/releases/latest/download/smart-fellas.d.ts>

A call that's new in this repository only works once the game has a release that knows it. If a call
in your editor does nothing in the game, update the game.
