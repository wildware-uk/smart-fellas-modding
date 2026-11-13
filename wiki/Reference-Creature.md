<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Creature

A creature or food in the match, placed by the map or spawned by a script. The same one is always
the same object. Once it has gone (eaten, killed or removed), `gone` is true and it reads as null.

## What you can read

### id

```ts
readonly id: number;
```

Its number in this match.

### kind

```ts
readonly kind: CreatureKind;
```

What it is.

### gone

```ts
readonly gone: boolean;
```

Whether it is no longer in the match.

### alive

```ts
readonly alive: boolean;
```

Whether it is alive.

### position

```ts
readonly position: Point | null;
```

Where it is, or null once gone.

## What you can call

### remove

```ts
remove(): void;
```

Takes it out of the match, on every player's screen.
