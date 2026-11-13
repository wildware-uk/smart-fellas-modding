# Timers

Three calls run code later, counted in the match's own time:

- `after(seconds, handler)` runs it once, `seconds` from now. 0 is the next tick.
- `every(seconds, handler)` runs it again and again, every `seconds`. 0 is every tick (64 a second).
- `cancel(timer)` stops one. It says whether it was still waiting.

`after` and `every` give back a number, a `TimerId`, for `cancel`. Seconds go from 0 to 86400 (a
day).

There's no `setTimeout` or `setInterval`, and no clock: `game.seconds` is the match's time in
seconds, and `game.ticks` in ticks.

## Example: a countdown

```ts
// Five, four, three, two, one: a countdown in the last five seconds of each round.
every(1, () => {
  const left = Math.ceil(game.timeLeft);
  if (game.phase === "play" && left >= 1 && left <= 5) {
    game.say(`${left}...`);
    game.playSound("chime");
  }
});
```

## Example: a tide that comes and goes

```ts
// A sandbank piece rises and sinks every 40 seconds, opening and closing a short cut.
const sandbank = game.piece("sandbank");
let low: Point | null = null;
let raised = false;

every(40, () => {
  if (!sandbank) {
    return;
  }
  low ??= sandbank.position;
  if (!low) {
    return;
  }
  raised = !raised;
  sandbank.moveTo(low.x, low.y + (raised ? 3 : 0), low.z, 8);
  game.say(raised ? "The tide is out: the sandbank rises." : "The tide comes in.");
});
```

## Example: stop a timer early

```ts
// A bonus: each round, for its first 30 seconds, every meal gives 10 extra energy. If anyone is
// caught first, the bonus ends there.
let bonus = false;
let ending: TimerId | null = null;

game.onRoundStart(() => {
  bonus = true;
  if (ending !== null) {
    cancel(ending);
  }
  ending = after(30, () => {
    bonus = false;
    ending = null;
  });
  game.say("Feeding frenzy: meals give extra energy for 30 seconds!");
});

game.onEat((player) => {
  if (bonus) {
    player.addEnergy(10);
  }
});

game.onCaught(() => {
  if (bonus && ending !== null) {
    cancel(ending);
    ending = null;
    bonus = false;
    game.say("The frenzy is over.");
  }
});
```

## Good to know

- Timers keep running between rounds. Check `game.phase` if one should act only while a round is
  played, or cancel it in `onRoundEnd`.
- A handler that runs every tick costs work every tick. `every(0.25, ...)` is plenty for most checks.
