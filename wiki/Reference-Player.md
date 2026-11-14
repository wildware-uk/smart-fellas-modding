<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Player

A player in the match. The same player is always the same object, so === works. Once they have
left, `gone` is true, what they were reads as null, and what you ask of them does nothing.

## What you can read

### id

```ts
readonly id: number;
```

Their number in this match.

### name

```ts
readonly name: string;
```

The name they play under.

### gone

```ts
readonly gone: boolean;
```

Whether they have left the match.

### team

```ts
readonly team: Team | null;
```

Their side, or null once gone.

### life

```ts
readonly life: Life | null;
```

Where they are in the round, or null once gone.

### alive

```ts
readonly alive: boolean;
```

Whether they are alive and swimming.

### position

```ts
readonly position: Point | null;
```

Where they are, or null while they have no body (waiting, respawning, out or gone).

### energy

```ts
readonly energy: number | null;
```

Their energy, or null while they have no body (and once gone).

### isBot

```ts
readonly isBot: boolean;
```

Whether the player is one of the game's bots.

### score

```ts
readonly score: number;
```

Their score this round, as the match's scripts set it (0 at the start of each round).

### role

```ts
readonly role: string;
```

Their role this round, as the match's scripts set it ("" for none). Only the host's scripts know
it: it is never sent to players, so a mode can keep roles secret.

### botLevel

```ts
readonly botLevel: BotLevel | null;
```

How well this bot plays: it starts at the lobby's bot skill. null for a person, and in every
script on a player's PC, which isn't told. New in 1.7.0.

### speed

```ts
readonly speed: number | null;
```

Their speed as a share of normal: 1 is normal, 0 held still; null once gone. On the host it is
what scripts set; on a player's PC it is what that PC was sent for them (1 if nothing).

### data

```ts
readonly data: Store;
```

A store of values of their own, kept from round to round for the whole match. It is let go at
the first round start after they leave, so onLeave can still read it. Each set of scripts has
its own, as with store.

## What you can call

### moveTo

```ts
moveTo(x: number, y: number, z: number): void;
```

Moves them to a point within 1000 m of the map's middle.

### kill

```ts
kill(): void;
```

Kills them, as the game's own kills do: the kill scene, the score and the respawn all happen.

### addEnergy

```ts
addEnergy(points: number): void;
```

Gives them energy, or takes it away with a negative number: -1000 to 1000.

### say

```ts
say(text: string): void;
```

Shows them alone a message from the map: 1 to 120 characters, a few a second at most.

### setTeam

```ts
setTeam(team: Team): void;
```

Moves them to the other team, at any time (for game modes). One alive gets a fresh body at the
new team's start at once (from onRoundStart, at the start the round gives that team, as if they
had chosen it); one waiting for a round waits on the new team. They go back to the team they
chose when the lobby comes back. It takes effect after this tick: until the next one they still
read as on their old team.

### setRole

```ts
setRole(role: string): void;
```

Gives them a role for this round, kept on the host and shown nowhere by itself: 0 to 24
characters, "" for none (for game modes).

### setScore

```ts
setScore(points: number): void;
```

Sets their score: a whole number from -1000000000 to 1000000000 (for game modes).

### addScore

```ts
addScore(points: number): void;
```

Adds to their score, or takes away with a negative number (for game modes).

### respawn

```ts
respawn(x?: number, y?: number, z?: number): void;
```

Brings them back now, if they are out or waiting to respawn in a round being played: at a point
within 1000 m of the map's middle, or where their team comes back (for game modes).

### removeBot

```ts
removeBot(): void;
```

Takes this bot out of the match, and one fewer of its team's bots is asked for (bots only).

### setGoal

```ts
setGoal(goal: Goal, x?: number, y?: number, z?: number): void;
```

Gives this bot something to be after; "goTo" takes a point (bots only, for game modes).

### setBotLevel

```ts
setBotLevel(level: BotLevel): void;
```

Makes this bot play at `level` from now on: how fast it reacts, turns and aims, how much it
notices, and how hard it chases; the rest of its ways stay its own. Other bots keep theirs. It
stays through rounds until the mode is done, when the bot goes back to the level it joined at
(bots only, for game modes). New in 1.7.0.

### bite

```ts
bite(target: Player): void;
```

The creature they drive takes `target` in its jaws, as its own bite landing does: the catch, the
kill and its credit all happen, wherever the two are. Nothing happens unless both are alive in
a round being played, they drive a creature that bites (a shark), and its mouth is empty (for
game modes).

### setCell

```ts
setCell(column: string, value: number | string): void;
```

Sets their cell under one of the columns game.scoreboard() named: a number, or text of 0 to 16
characters (for game modes).

### setLine

```ts
setLine(text: string): void;
```

Shows them alone a line under the banner, until it is changed or a round starts, or the lobby
comes back: 0 to 80 characters, "" to clear it. It is on screen, not in chat (for game modes).

### setSpeed

```ts
setSpeed(share: number): void;
```

Sets their speed as a share of normal, 0 to 3: 0 holds them still (they can still look round and
use abilities), 1 is normal, 3 is three times as fast. It works for octopuses and divers: it
scales swimming and crawling, while dashes keep their own pace. A creature a player drives (a
shark on a mode's team) keeps its own speed. It stays until changed, and goes back to normal
when a round starts and when the lobby comes back (on the host only).

### playSound

```ts
playSound(sound: SoundName): void;
```

Plays one of the game's sounds for them alone, wherever they are (in a client/ script, on that player's own screen only).

### announce

```ts
announce(text: string, seconds?: number): void;
```

Shows them alone big text in the middle of the screen, as game.announce does for more players:
1 to 60 characters, for 0.5 to 15 seconds (3 if left out). It counts as a message from the map,
with the same limits as game.say (in a client/ script, on that player's own screen only).

### allow

```ts
allow(skill: Skill, allowed: boolean): void;
```

Switches one of their skills off, or on again with true. A skill switched off does nothing when
they use it: pressing it (or starting to hold smell) plays a soft "no", an octopus's button for
it shows faint, and a diver's crosshair dot dims. Switching grab off lets go of whatever they hold, and stops a grab on its way. Ink or a shot already on
its way finishes. It stays until changed, through deaths and respawns, and every skill comes
back as a round starts and when the lobby comes back, so switch them off in onRoundStart (on
the host only).

### allowed

```ts
allowed(skill: Skill): boolean | null;
```

Whether a skill works for them (true unless a script switched it off); null once gone. On a
player's PC it is what that PC was sent for them.
