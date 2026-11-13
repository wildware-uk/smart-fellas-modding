<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Piece

A piece of the map you named for scripts: in the add-on, add it to the group `script` (or
`switch`, for one players can use, such as a lever). Its node's name is its name here.

## What you can read

### name

```ts
readonly name: string;
```

Its name on the map.

### isSwitch

```ts
readonly isSwitch: boolean;
```

Whether players can use it (it is in the `switch` group).

### position

```ts
readonly position: Point | null;
```

Where it is, or null before the match's first tick.

### turn

```ts
readonly turn: number | null;
```

Which way it faces, in degrees round the up axis, or null before the first tick.

### shown

```ts
readonly shown: boolean | null;
```

Whether it is shown, or null before the first tick.

## What you can call

### moveTo

```ts
moveTo(x: number, y: number, z: number, seconds?: number): void;
```

Moves it to a point within 1000 m of the map's middle, at once or gliding over 0 to 60 seconds.
It is solid on its way, like anything else that moves.

### turnTo

```ts
turnTo(degrees: number, seconds?: number): void;
```

Turns it to face `degrees` round the up axis (-3600 to 3600), at once or over 0 to 60 seconds.

### show

```ts
show(): void;
```

Shows it, solid again.

### hide

```ts
hide(): void;
```

Hides it: nobody sees it or bumps into it.

### onUse

```ts
onUse(handler: (player: Player) => void): void;
```

Calls `handler` each time a player uses it: they press Interact (the eat key) within 1.5 m.
Only a switch can be used; asking this of any other piece throws.
