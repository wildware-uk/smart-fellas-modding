<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Types

The smaller types the calls take and give back.

## Point

```ts
interface Point {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
```

A point in the map, in metres. y is up.

## RayHit

```ts
interface RayHit {
  readonly point: Point;
  readonly normal: Point;
  readonly distance: number;
}
```

Where a ray first met the map: from `game.raycast` and `game.groundBelow`.

## PlayArea

```ts
interface PlayArea {
  readonly min: Point;
  readonly max: Point;
}
```

The box players swim in, from its lowest corner to its highest.

## Team

```ts
type Team = "octopus" | "diver" | (string & {});
```

A side in a match: the octopuses (Smart Fellas), the divers (Fart Smellas), or a team the game
mode added with game.registerTeam, by the id it gave it.

## TeamSpec

```ts
interface TeamSpec {
  name: string;
  colour: string;
  body: "shark";
  most: number;
  spawns?: "octopus" | "diver";
  line?: string;
  startLine?: string;
}
```

A team a game mode adds of its own (game.registerTeam).

## AbilitySpec

```ts
interface AbilitySpec {
  team: Team;
  slot: 1 | 2;
  name: string;
  cooldown: number;
  range: number;
  lunge?: { speed: number; metres: number };
}
```

An ability a game mode gives one of its own teams (game.registerAbility). The game shows it on
the HUD of that team's players with its key, its name and its cooldown, and aims it for them: it
goes off only when someone they can see (not hidden, behind rock or in ink) is near the middle
of their screen and within `range`.

## Tool

```ts
type Tool = "spear" | "net" | "sensor" | "torch";
```

A tool a diver may carry (game.loadout).

## Skill

```ts
type Skill = "dash" | "ink" | "grab" | "smell" | "shoot";
```

Something a player does that a script may switch off for them alone, with player.allow(): an
octopus's dash, ink, grab and smell, and a diver's gun ("shoot", whichever gun they carry).

## Life

```ts
type Life = "alive" | "respawning" | "out" | "waiting";
```

Where a player is in the round.

## Phase

```ts
type Phase = "lobby" | "play" | "results";
```

Where the match is.

## Catch

```ts
type Catch = "jaws" | "net";
```

How a player was caught: in a creature's jaws, or in a diver's net.

## FoodKind

```ts
type FoodKind = "crab" | "clam" | "shrimp" | "wrasse" | "lobster";
```

Food a player can eat.

## CreatureKind

```ts
type CreatureKind =
  | "shark"
  | "eel"
  | "groper"
  | "flounder"
  | "lionfish"
  | "crab"
  | "clam"
  | "shrimp";
```

The creatures and food a script can find with game.creatures(), spawn and remove.

## SoundName

```ts
type SoundName =
  | "groan"
  | "drip"
  | "rockfall"
  | "whale"
  | "boom"
  | "swell"
  | "hiss"
  | "chime"
  | "roar"
  | "thunk";
```

The sounds a map can play. game.sounds() lists them too.

## Fate

```ts
type Fate = "out" | "held" | "respawn" | "turn";
```

What being caught or killed does to a player of a team (for game modes):
- "out": out for the rest of the round;
- "held": out, and a netted octopus stays in its net where a teammate could free it;
- "respawn": back after the wait, at the team's spawn;
- "turn": back after the wait, on the other team.

## Goal

```ts
type Goal = "own" | "hide" | "flee" | "roam" | "hunt" | "goTo";
```

What a bot is after (for game modes). The bot's own brain still swims it there.
- "own": its usual play: an octopus hides, a diver hunts;
- "hide": an octopus hides as usual; a diver keeps still;
- "flee": away from the nearest foe it can see;
- "roam": wanders about;
- "hunt": a diver hunts as usual; an octopus goes after the nearest diver it can see;
- "goTo": swims to a point and stays there.

A bot on a team the mode added (game.registerTeam) heeds "own" and "hunt" only. With "own" its
creature swims on its own brain, as a wild one does. With "hunt" the bot plays it as a person
would, through the same controls: it goes for the nearest player of another team it can see
(nobody hidden, behind rock or in ink), bites when it is close, uses its team's abilities
(game.registerAbility) when they are ready, and between chases looks round the food patches that
have food on them.

## EndWhy

```ts
type EndWhy = "allCaught" | "allTurned" | "timeUp" | "diversLeft" | "octopusesLeft";
```

One of the game's own lines for why a round ended, for game.endRound():
- "allCaught": every octopus was caught (speared, netted, starved or eaten);
- "allTurned": every octopus was caught and turned into a diver;
- "timeUp": time ran out and the octopuses survived;
- "diversLeft": every diver left;
- "octopusesLeft": every octopus left.

## SettingValue

```ts
type SettingValue = number | string | boolean;
```

The value of one of a game mode's lobby settings: a number, a choice's name, or a toggle.

## Viewers

```ts
type Viewers = Team | Player;
```

Who sees something on screen (game.announce, game.widget, game.marker): one team, or one player.
Leave it out for everyone.

## WidgetSpec

```ts
interface WidgetSpec {
  kind: "text" | "bar" | "counter" | "timer";
  label?: string;
  text?: string;
  value?: number;
  max?: number;
  seconds?: number;
  colour?: string;
}
```

One HUD widget (game.widget), drawn in a column on the left of the screen, under the banner.

## MenuSpec

```ts
interface MenuSpec {
  title: string;
  choices: string[];
  seconds?: number;
}
```

A menu (game.menu): a card on the right of the screen with a title over 2 to 5 choices. Players
pick one with the number keys 1 to 5 (on the top row or the number pad), which picks nothing
else while it shows; picking closes it for them.

## VoteResult

```ts
interface VoteResult {
  readonly winner: string | null;
  readonly index: number | null;
  readonly counts: readonly number[];
}
```

How a vote (game.vote) came out.

## VoteSpec

```ts
interface VoteSpec {
  title: string;
  choices: string[];
  seconds: number;
}
```

What game.vote asks: like a menu, but `seconds` must be given, from 1 to 600.

## MarkerSpec

```ts
interface MarkerSpec {
  at: Point;
  label?: string;
  colour?: string;
}
```

A marker (game.marker) at a point in the world, seen through rock, with its distance under it.
