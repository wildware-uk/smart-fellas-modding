# Events

An event is the game telling your script that something happened. You give it a function, a
*handler*, and the game calls it each time. Register handlers once, at the top of a file.

## Every event

| Event | Called when | Gives you |
| --- | --- | --- |
| `game.onMatchStart` | the match starts (once) | |
| `game.onRoundStart` | a round starts | |
| `game.onRoundEnd` | a round ends | the winning team, or `null` and the winning player, or `null` and `null` for a draw |
| `game.onTimeUp` | the round's clock runs out, in a game mode | |
| `game.onJoin`, `game.onLeave` | a player joins or leaves the match | the player |
| `game.onRespawn` | a player comes back after being out or waiting | the player |
| `game.onTeamChange` | a player moves to another team | the player, the old team, the new team |
| `game.onEat` | a player finishes eating | the player, and the food: `"crab"`, `"clam"`, `"shrimp"`, `"wrasse"` or `"lobster"` |
| `game.onCaught` | a player is caught | the player, who caught them (or `null`), and how: `"jaws"` or `"net"` |
| `game.onKilled` | a player is killed | the player, and who killed them (or `null`) |
| `game.onAbility`, `game.onAbilityLand` | a mode's ability is used, or its lunge lands | the user, the ability's id, the target |
| `game.onDash` | a player dashes (octopuses only) | the player |
| `game.onInk` | an octopus squirts ink | the player |
| `game.onGrab` | an octopus grabs at something | the player |
| `game.onShoot` | a diver fires either gun | the player |
| `zone.onEnter`, `zone.onLeave` | a player swims into or out of a zone | the player |
| `zone.onSpearEnter`, `zone.onSpearLeave` | a spear flies into or out of a zone | who threw it (or `null`) |
| `piece.onUse` | a player uses a switch | the player |

A `client/` script on a player's PC hears the match start, players join and leave, rounds start and
end, players it can see go in and out of zones, and its own player using a switch. Meals, catches,
kills, spears, dashes, ink, grabs and shots are heard on the host only.

`onDash`, `onInk`, `onGrab` and `onShoot` are new in API 1.1.0. `onDash`, `onInk` and `onGrab` are
for octopuses only: the ability keys of a team a mode added are heard with `onAbility`, as before.

## Example: a feast announcer

```ts
// Counts what everyone eats in a round, and names the hungriest octopus when it ends.
const meals = new Map<Player, number>();

game.onRoundStart(() => {
  meals.clear();
});

game.onEat((player, food) => {
  const eaten = (meals.get(player) ?? 0) + 1;
  meals.set(player, eaten);
  if (food === "lobster") {
    game.say(`${player.name} found a lobster!`);
  }
});

game.onRoundEnd(() => {
  let hungriest: Player | null = null;
  let most = 0;
  for (const [player, eaten] of meals) {
    if (!player.gone && eaten > most) {
      most = eaten;
      hungriest = player;
    }
  }
  if (hungriest) {
    game.say(`Hungriest this round: ${hungriest.name}, with ${most} meals.`);
  }
});
```

## Example: a bounty on the best diver

```ts
// Whoever catches the most octopuses in a round has a bounty: the octopus that kills them is told
// so, and gets a burst of energy for it.
const catches = new Map<Player, number>();
let marked: Player | null = null;

game.onRoundStart(() => {
  catches.clear();
  marked = null;
});

game.onCaught((_octopus, by) => {
  if (!by) {
    return;
  }
  const made = (catches.get(by) ?? 0) + 1;
  catches.set(by, made);
  if (made >= 2 && by !== marked && made > (marked ? catches.get(marked) ?? 0 : 0)) {
    marked = by;
    game.sayToTeam("octopus", `${by.name} has a bounty on them.`);
  }
});

game.onKilled((player, by) => {
  if (player === marked && by) {
    by.addEnergy(50);
    by.say("Bounty claimed!");
    marked = null;
  }
});
```

## Example: ink costs energy

```ts
// Each squirt of ink costs an octopus 5 energy, and every dash 2. A diver's tenth shot in a round
// is told to their team.
game.onInk((player) => {
  player.addEnergy(-5);
});

game.onDash((player) => {
  player.addEnergy(-2);
});

game.onShoot((diver) => {
  const shots = store.add(`shots:${diver.id}`);
  if (shots === 10) {
    game.sayToTeam("diver", `${diver.name} has fired 10 shots this round.`);
  }
});
```

## Order within a tick

Every event and timer that falls in one tick runs, then the game does what they asked for. So two
handlers in the same tick both read the world as the tick began. The mode's scripts run before the
map's.
