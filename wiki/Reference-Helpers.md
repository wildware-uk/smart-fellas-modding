<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Helpers

Plain JavaScript every script has, on the host and on players' PCs alike. They change nothing in the match by themselves. See [Helpers](Helpers.md) for examples.

## Vec

Vector maths on points ({x, y, z}). Every call gives back a new point and leaves its inputs alone.

### Vec.of

```ts
of(x: number, y: number, z: number): Point;
```

A point from its three parts.

### Vec.zero

```ts
readonly zero: Point;
```

The point {0, 0, 0}.

### Vec.up

```ts
readonly up: Point;
```

The point {0, 1, 0}: one metre straight up.

### Vec.add

```ts
add(a: Point, b: Point): Point;
```

a and b added together.

### Vec.sub

```ts
sub(a: Point, b: Point): Point;
```

b taken away from a: the way from b to a.

### Vec.scale

```ts
scale(a: Point, by: number): Point;
```

a made `by` times as long.

### Vec.length

```ts
length(a: Point): number;
```

How long a is, in metres.

### Vec.distance

```ts
distance(a: Point, b: Point): number;
```

How far apart a and b are, in metres.

### Vec.normalize

```ts
normalize(a: Point): Point;
```

a made 1 long, pointing the same way; or Vec.zero if a has no length.

### Vec.dot

```ts
dot(a: Point, b: Point): number;
```

The dot product of a and b.

### Vec.cross

```ts
cross(a: Point, b: Point): Point;
```

The cross product of a and b: a point at right angles to both.

### Vec.lerp

```ts
lerp(a: Point, b: Point, t: number): Point;
```

The point `t` of the way from a to b: t 0 is a, 1 is b, 0.5 halfway.

### Vec.flat

```ts
flat(a: Point): Point;
```

a with y set to 0: for distances across the map, ignoring depth.

## Maths

Number helpers the built-in Math lacks.

### Maths.clamp

```ts
clamp(value: number, low: number, high: number): number;
```

value kept from low to high.

### Maths.lerp

```ts
lerp(from: number, to: number, t: number): number;
```

The number `t` of the way from `from` to `to`: t 0 is from, 1 is to.

### Maths.inverseLerp

```ts
inverseLerp(from: number, to: number, value: number): number;
```

How far value is from `from` to `to`, as 0 to 1 (not clamped: it can be below 0 or above 1).

### Maths.remap

```ts
remap(value: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
```

value moved from the range inLow to inHigh into the range outLow to outHigh.

### Maths.toRadians

```ts
toRadians(degrees: number): number;
```

Degrees to radians.

### Maths.toDegrees

```ts
toDegrees(radians: number): number;
```

Radians to degrees.

### Maths.wrapDegrees

```ts
wrapDegrees(degrees: number): number;
```

degrees brought into the range above -180 and up to 180.

### Maths.approach

```ts
approach(current: number, target: number, step: number): number;
```

current moved towards target by at most step, never past it.

## Random

Random numbers from a seed of your own: the same seed gives the same numbers, in the same order,
on every PC. Use game.random() for numbers nobody can guess ahead.

### new Random

```ts
constructor(seed: number);
```

A series of random numbers that starts from `seed`.

### Random.next

```ts
next(): number;
```

A number from 0 up to (not including) 1.

### Random.range

```ts
range(low: number, high: number): number;
```

A number from low up to (not including) high.

### Random.int

```ts
int(low: number, high: number): number;
```

A whole number from low to high, both included.

### Random.chance

```ts
chance(p: number): boolean;
```

true with the chance `p`: 0 never, 1 always, 0.25 one time in four.

### Random.pick

```ts
pick<T>(list: readonly T[]): T | undefined;
```

One item of the list, or undefined if it is empty.

### Random.shuffle

```ts
shuffle<T>(list: T[]): T[];
```

Shuffles the list in place and gives it back.

## Easing

An easing curve: takes t from 0 to 1 and gives back the eased value (0 at 0, 1 at 1).

```ts
type Easing = (t: number) => number;
```

## Ease

Easing curves, for tween() or to call yourself, as in Maths.lerp(a, b, Ease.outQuad(t)). "in"
starts slow, "out" ends slow, "inOut" does both. outBack goes a little past the end and settles
back, outBounce bounces, outElastic wobbles.

```ts
declare const Ease: {
  linear: Easing;
  inQuad: Easing;
  outQuad: Easing;
  inOutQuad: Easing;
  inCubic: Easing;
  outCubic: Easing;
  inOutCubic: Easing;
  inSine: Easing;
  outSine: Easing;
  inOutSine: Easing;
  outBack: Easing;
  outBounce: Easing;
  outElastic: Easing;
};
```

## tween

Calls `step` every tick for `seconds` (0 to 86400; anything else throws), with how far along it
is: 0 to 1, eased (Ease.linear if left out). The last call is always with 1, then `done` is
called. Gives back a timer: cancel() it to stop it early.

```ts
declare function tween(
  seconds: number,
  step: (t: number) => void,
  options?: { ease?: Easing; done?: () => void },
): TimerId;
```

## State

One state of a StateMachine. Each part is optional.

### State.enter

```ts
enter?(): void;
```

Called when the machine goes into this state.

### State.tick

```ts
tick?(seconds: number): void;
```

Called every tick while in this state, with the seconds since it went in.

### State.leave

```ts
leave?(): void;
```

Called when the machine leaves this state.

## StateMachine

A set of named states, in one at a time, ticked every tick by itself, whatever the match's phase
(in the lobby too). It goes into `start` at once. If a state calls go() on its own machine, give the machine's type by hand:
`const phases: StateMachine<"wait" | "play"> = new StateMachine({ ... }, "wait");`.

### new StateMachine

```ts
constructor(states: Record<S, State>, start: S);
```

The states by name, and the one to start in.

### StateMachine.state

```ts
readonly state: S;
```

The state it is in.

### StateMachine.seconds

```ts
readonly seconds: number;
```

Seconds since it went into the state it is in.

### StateMachine.go

```ts
go(state: S): void;
```

Leaves the state it is in and goes into `state`. Going into the same one starts it again.

### StateMachine.stop

```ts
stop(): void;
```

Stops ticking it, for good.

## Store

Values kept by name: the round's store, and each player's data.

### Store.get

```ts
get<T = unknown>(key: string, fallback?: T): T;
```

The value kept under `key`, or `fallback` if there is none.

### Store.set

```ts
set(key: string, value: unknown): void;
```

Keeps `value` under `key`.

### Store.add

```ts
add(key: string, by?: number): number;
```

Adds `by` (1 if left out) to the number kept under `key` (0 if none) and gives back the sum.

### Store.has

```ts
has(key: string): boolean;
```

Whether anything is kept under `key`.

### Store.delete

```ts
delete(key: string): boolean;
```

Forgets `key`. Says whether anything was kept under it.

### Store.keys

```ts
keys(): string[];
```

Every key with something kept under it.

### Store.clear

```ts
clear(): void;
```

Forgets everything.

## store

A store of values by name, for this round: it is emptied as each round starts, before your
onRoundStart runs. Each set of scripts has its own: the map's and the mode's don't share one, and
each PC's scripts have their own. For values about one player that last the match, use
player.data.

```ts
declare const store: Store;
```

## log

Writes a line to the game's log on the PC the script runs on: the host's for scripts on the host,
that player's own for client/ scripts. The log is the console, and the log file in the logs folder
beside the game's settings. Each line starts "map script:" or "mode script:", then the values
joined by spaces, objects as JSON. At most 20 lines a second; more are dropped. Each line is cut
at 200 characters.

```ts
declare function log(...values: unknown[]): void;
```
