<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Zone

A trigger box placed on the map, found by name with game.zone().

## What you can read

### name

```ts
readonly name: string;
```

Its name on the map.

## What you can call

### players

```ts
players(): Player[];
```

Every living player inside it now.

### onEnter

```ts
onEnter(handler: (player: Player) => void): void;
```

Calls `handler` each time a player swims in.

### onLeave

```ts
onLeave(handler: (player: Player) => void): void;
```

Calls `handler` each time a player swims out.

### onSpearEnter

```ts
onSpearEnter(handler: (thrower: Player | null) => void): void;
```

Calls `handler` when a spear flies in, with who threw it, if anyone still in the match did.

### onSpearLeave

```ts
onSpearLeave(handler: (thrower: Player | null) => void): void;
```

Calls `handler` when a spear leaves, with who threw it.
