<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Timers

Run something later, or again and again. Timers count the match's own time, so they keep step with the game. See [Timers](Timers.md) for examples.

## TimerId

```ts
type TimerId = number;
```

A number after() or every() gave back, for cancel().

## after

```ts
declare function after(seconds: number, handler: () => void): TimerId;
```

Calls `handler` once, `seconds` from now (0 to 86400; 0 is the next tick).

## every

```ts
declare function every(seconds: number, handler: () => void): TimerId;
```

Calls `handler` every `seconds` (0 to 86400; 0 is every tick), until cancelled.

## cancel

```ts
declare function cancel(timer: TimerId): boolean;
```

Stops a timer after() or every() gave back. Says whether it was still waiting.
