# Water and lights

A host script can change the water everyone swims in, and put up lights in the world. Every player
sees the same, players who join later get it too, and the lobby puts the map back as it was. New in
API 1.5.0.

| Call | Does |
| --- | --- |
| `game.setWater(spec, seconds?)` | changes the water's colour, how far you see and how bright it is |
| `game.resetWater(seconds?)` | gives back the map's own water |
| `game.light(id, spec)` | puts up a light, or moves or changes the one with this id |
| `game.removeLight(id)` | takes it down |

## The water

`spec` is `{ colour, visibility, light }`, and anything you leave out stays as the map has it:

- `colour`: what far things fade into, `"#rrggbb"`.
- `visibility`: how far anyone sees, 5 to 300 metres. Bots see through it as far as players do.
- `light`: how bright it is, as a share of the map's own light, 0 to 2. Use 0.2 for dim water.
  Unless you give `colour` too, the haze dims or brightens with it.

`seconds` (0 to 60) fades the change in; leave it out for at once. A new call starts from the water
shown then, so you can chain changes.

```ts
// A storm rolls in over ten seconds, and clears a minute later.
game.onRoundStart(() => {
  game.setWater({ colour: "#3a4a52", visibility: 25, light: 0.4 }, 10);
  after(60, () => game.resetWater(10));
});
```

## Lights

`spec` is `{ at, colour, strength, range }`:

- `at`: where it is, within 1000 m of the map's middle.
- `colour`: `"#rrggbb"`, white if left out.
- `strength`: 0 to 10. 1, the default, is about as bright as a diver's torch.
- `range`: how far it reaches, 1 to 40 metres (10 if left out).

Ids are 1 to 16 letters, digits, `-` or `_`. Calling `game.light` again with the same id moves or
changes that light. At most 16 lights are up at once, the map's and the mode's together: one more
isn't put up, with no error. Lights cast no shadows.

```ts
// A beacon over the middle of the map that blinks once a second.
let lit = false;
every(1, () => {
  lit = !lit;
  if (lit) {
    game.light("beacon", { at: Vec.of(0, 8, 0), colour: "#ffcc33", strength: 3 });
  } else {
    game.removeLight("beacon");
  }
});
```

## Limits

- Host scripts only: in a `client/` script these calls do nothing.
- At most 32 water and light calls a tick; more throws an error you can catch.
