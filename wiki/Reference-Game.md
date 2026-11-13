<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Game

The match, as the script sees it.

## What you can read

### ticks

```ts
readonly ticks: number;
```

The match's time, in ticks: 64 a second.

### seconds

```ts
readonly seconds: number;
```

The match's time, in seconds.

### phase

```ts
readonly phase: Phase;
```

Where the match is: in the lobby, playing a round, or showing its results.

### timeLeft

```ts
readonly timeLeft: number;
```

How long the round has left, in seconds.

## What you can call

### players

```ts
players(): Player[];
```

Every player in the match, by number.

### random

```ts
random(): number;
```

A number from 0 up to (not including) 1, the same series for the same match.

### endRound

```ts
endRound(winner: Team | Player | "draw", why?: EndWhy): void;
```

Ends the round, with `winner` the team that won it, or one player (where everyone plays for
themselves, in a game mode), or "draw" for nobody. The results say why with the game's own line
named by `why`, or else that the map (or the game mode) decided. `why` must fit the winning
team: "allCaught", "allTurned" and "octopusesLeft" are the divers' wins, "timeUp" and
"diversLeft" the octopuses'.

### addTime

```ts
addTime(seconds: number): void;
```

Adds time to the round, or takes it away with a negative number: -3600 to 3600 seconds.

### zone

```ts
zone(name: string): Zone | null;
```

The trigger zone with this name, or null if the map has none.

### zones

```ts
zones(): Zone[];
```

Every trigger zone on the map.

### piece

```ts
piece(name: string): Piece | null;
```

The piece with this name, or null if no piece is named that.

### pieces

```ts
pieces(): Piece[];
```

Every piece named for scripts.

### creatures

```ts
creatures(kind?: CreatureKind): Creature[];
```

Every creature and food in the match, or only those of one kind.

### spawn

```ts
spawn(kind: CreatureKind, x: number, y: number, z: number): Creature;
```

Asks the game for a creature or food near a point within 1000 m of the map's middle, and gives
back its handle at once. The game puts it where such a thing can be:
- food grows on the free food spot nearest the point that suits it, if one is within 10 m
  (crabs on sand or rock, shrimp on sand, clams on rock), and doesn't grow back once eaten;
- a shark joins its loop round the map at the point nearest yours;
- an eel or a groper goes beside the rock nearest the point;
- a lionfish hovers at the point, lifted clear of any rock, and a flounder lies on the seabed
  under it, if the seabed is within 50 m. Every player sees them, players who join later too.
Sharks, eels and gropers come only while a round is being played. If the game finds no place,
the handle reads as gone from the next tick. A script may have at most 1 shark, 4 eels, 4
gropers, 256 of each food and 256 fish it spawned alive at once; asking for more throws.

### playersNear

```ts
playersNear(point: Point, radius: number, team?: Team): Player[];
```

Living players with a position within `radius` metres of `point`, nearest first; only `team`'s if
given. On a player's PC it finds only the players that PC was sent.

### nearestPlayer

```ts
nearestPlayer(point: Point, team?: Team, except?: Player): Player | null;
```

The nearest living player with a position, of `team` if given, leaving out `except` (say, the
player asking); or null if there is none.

### creaturesNear

```ts
creaturesNear(point: Point, radius: number, kind?: CreatureKind): Creature[];
```

Living creatures and food within `radius` metres of `point`, nearest first; only `kind`'s if given.

### nearestCreature

```ts
nearestCreature(point: Point, kind?: CreatureKind): Creature | null;
```

The nearest living creature or food, of `kind` if given; or null if there is none.

### say

```ts
say(text: string): void;
```

Shows everyone a message from the map: 1 to 120 characters, a few a second at most.

### sayToTeam

```ts
sayToTeam(team: Team, text: string): void;
```

Shows one team a message from the map.

### playSound

```ts
playSound(sound: SoundName): void;
```

Plays one of the game's sounds for everyone, wherever they are. A few a second at most.

### playSoundForTeam

```ts
playSoundForTeam(team: Team, sound: SoundName): void;
```

Plays one of the game's sounds for one team only, wherever they are (on the host only).

### playSoundAt

```ts
playSoundAt(sound: SoundName, x: number, y: number, z: number): void;
```

Plays one of the game's sounds at a point, heard by whoever is near.

### sounds

```ts
sounds(): SoundName[];
```

The names of the sounds a map can play.

### setting

```ts
setting(name: string): SettingValue | null;
```

The value of the game mode's lobby setting with this name in its mode.json, as the host chose
it, or null if it has none (for game modes; a map's script reads null).

### teamScore

```ts
teamScore(team: Team): number;
```

A team's score this round, as the match's scripts set it.

### setTeamScore

```ts
setTeamScore(team: Team, points: number): void;
```

Sets a team's score: a whole number from -1000000000 to 1000000000 (for game modes).

### addTeamScore

```ts
addTeamScore(team: Team, points: number): void;
```

Adds to a team's score, or takes away with a negative number (for game modes).

### freeForAll

```ts
freeForAll(on: boolean): void;
```

Everyone plays for themselves: nobody is anyone's teammate. No names over rivals' heads, no
shared pings, team chat or diver radio, every diver may hurt every other whatever the lobby's
friendly fire says, and diver bots fight rival divers as well as hunting octopuses (for game
modes).

### loadout

```ts
loadout(team: "diver", ...tools: Tool[]): void;
```

What divers carry, from "spear" (the spear gun), "net" (the net gun), "sensor" (motion sensors)
and "torch" (the lamp), each once, with at least one gun. With one gun only, divers get that gun
whatever the lobby's Gun setting, and the lobby shows it as set by the mode. What they lack isn't
on their screen. Until a script calls it, divers carry everything (for game modes).

### closeTeam

```ts
closeTeam(team: Team, why: string): void;
```

Closes a team to people in the lobby: its Join button greys out with `why` (1 to 60 characters)
under it, and asking to join it is refused. Nobody already on it is moved; use setTeam for that
(for game modes).

### openTeam

```ts
openTeam(team: Team): void;
```

Opens a team closed by closeTeam again (for game modes).

### registerTeam

```ts
registerTeam(id: string, team: TeamSpec): void;
```

Adds a team of the mode's own, or changes one it added: `id` (1 to 16 lower-case letters) is
what every call that takes a team calls it from then on. Its players each drive a creature of
`team.body`; bots fill it with setBots, and people join it in the lobby like any team. A mode may
add 2. Call it from onMatchStart: a mode being left takes its teams with it, and anyone on one
goes back to the octopuses or the divers (for game modes).

### registerAbility

```ts
registerAbility(id: string, ability: AbilitySpec): void;
```

Gives a team the mode added an ability, or changes one it gave: `id` (1 to 16 lower-case
letters) is what onAbility and onAbilityLand call it. A team may have 2, one in each slot. The
game does the key, the HUD button, the cooldown and the aiming; what the ability does is up to
the handlers. Call it from onMatchStart, after registerTeam (for game modes).

For a picture of its own on the button, put a square PNG named after the id in the mode's
`icons` folder, beside `scripts`: `icons/quickdash.png` for the id "quickdash". Up to 512 KB
and 1024 pixels across each, and 8 in a mode; it is drawn round, so keep what matters away from the corners. Without
one the button shows a plain arrow.

### modeBots

```ts
modeBots(team: Team, on: boolean): void;
```

The mode alone decides how many bots a team has, with setBots: the lobby hides the host's bot
count for that team and says the mode sets it (for game modes).

### setBots

```ts
setBots(team: Team, count: number): void;
```

Asks for `count` bots on a team, 0 to 32. The lobby keeps that many, and a round being played
gets or loses them at once. People always keep their places: no more bots join than the
team's cap in the lobby, the game's 32 players and the mode's maxPlayers have room for (for
game modes).

### setFate

```ts
setFate(team: Team, fate: Fate, seconds?: number): void;
```

What being caught or killed does to a team's players, with the wait for "respawn" and "turn": 0
to 600 seconds, or the lobby's respawn time when left out (for game modes). Until a script sets
it, octopuses are "held" and divers "respawn". A player who turns is marked as turned for the
rest of the round, on the scoreboard and the results.

### setSpawn

```ts
setSpawn(team: Team, x: number, y: number, z: number): void;
```

Where a team's players come back, at a point within 1000 m of the map's middle (for game modes).

### clearSpawn

```ts
clearSpawn(team: Team): void;
```

A team's players come back at their own start points again (for game modes).

### setTimeLeft

```ts
setTimeLeft(seconds: number): void;
```

Sets the time left in a round being played: 0 to 86400 seconds (for game modes).

### holdClock

```ts
holdClock(held: boolean): void;
```

Holds the round's clock still, or lets it run again (for game modes).

### scoreboard

```ts
scoreboard(...columns: string[]): void;
```

Names the live scoreboard's columns, up to 6 of 1 to 16 characters, each once, shown beside each
player's name and score during the round and on the results. None hides it (for game modes).
Every person is listed; a bot only once the match's scripts give it a score or a cell
(setScore, addScore, setCell), even 0 or "", so bots a mode leaves alone stay off.

### banner

```ts
banner(text: string): void;
```

Shows everyone a banner across the top: 0 to 80 characters, "" to clear it (for game modes).

### announce

```ts
announce(text: string, seconds?: number, viewers?: Viewers): void;
```

Shows big text in the middle of the screen: 1 to 60 characters, for `seconds` (0.5 to 15, 3 if
left out). A new one replaces the one showing. It counts as a message from the map, towards the
same limits as game.say: at most 3 a tick and 6 a second for any one player, and a call that
would go over throws. `viewers` is one team or one player; leave it out for everyone (on the
host only).

### widget

```ts
widget(id: string, spec: WidgetSpec, viewers?: Viewers): void;
```

Shows a HUD widget in the column on the left of the screen, under the banner, or changes the
one with this id: `id` is 1 to 16 letters, digits, - or _. At most 8 widgets show on any
player's screen: a 9th isn't shown on that screen (no error), and changing or removing those
already there always works. They stay until removed, or until the lobby comes back. A call that
changes nothing sends nothing, so it is fine to call it every tick. A "timer" counts down by
itself: asking for it again with the same seconds doesn't restart it; new seconds do.
`viewers` is one team or one player; leave it out for everyone (on the host only).

### removeWidget

```ts
removeWidget(id: string, viewers?: Viewers): void;
```

Takes the widget with this id off the screens of `viewers`, or everyone's if left out (on the
host only).

### marker

```ts
marker(id: string, spec: MarkerSpec, viewers?: Viewers): void;
```

Shows a marker in the world, or moves or changes the one with this id (ids as for widget). At
most 16 show on any player's screen: a 17th isn't shown on that screen (no error), and changing
or removing those already there always works. `viewers` is one team or one player; leave it out
for everyone (on the host only).

### removeMarker

```ts
removeMarker(id: string, viewers?: Viewers): void;
```

Takes the marker with this id off the screens of `viewers`, or everyone's if left out (on the
host only).

### onMatchStart

```ts
onMatchStart(handler: () => void): void;
```

Calls `handler` once, when the match starts.

### onRoundStart

```ts
onRoundStart(handler: () => void): void;
```

Calls `handler` when a round starts.

### onRoundEnd

```ts
onRoundEnd(handler: (winner: Team | null, player: Player | null) => void): void;
```

Calls `handler` when a round ends, with the team that won it, or null and the player who won it,
or null and null for a draw.

### onRespawn

```ts
onRespawn(handler: (player: Player) => void): void;
```

Calls `handler` when a player comes back in a round being played, after being out or waiting
to respawn. The lobby's warm-up bodies aren't respawns.

### onTeamChange

```ts
onTeamChange(handler: (player: Player, from: Team, to: Team) => void): void;
```

Calls `handler` when a player moves to the other team, whatever moved them.

### onTimeUp

```ts
onTimeUp(handler: () => void): void;
```

Calls `handler` when the round's clock runs out, in a game mode. End the round on that tick, or
it ends as a draw.

### onJoin

```ts
onJoin(handler: (player: Player) => void): void;
```

Calls `handler` when a player joins the match.

### onLeave

```ts
onLeave(handler: (player: Player) => void): void;
```

Calls `handler` when a player leaves the match. Their handle reads as gone from then on.

### onEat

```ts
onEat(handler: (player: Player, food: FoodKind) => void): void;
```

Calls `handler` when a player finishes eating something.

### onCaught

```ts
onCaught(handler: (player: Player, by: Player | null, how: Catch) => void): void;
```

Calls `handler` when a player is caught, with who caught them, if a player did.

### onKilled

```ts
onKilled(handler: (player: Player, by: Player | null) => void): void;
```

Calls `handler` when a player is killed, with who killed them, if a player did.

### onAbility

```ts
onAbility(handler: (player: Player, ability: string, target: Player) => void): void;
```

Calls `handler` when a player uses one of the mode's abilities (game.registerAbility), with its
id and who it was aimed at. Its cooldown has started; a lunge, if it has one, is on its way.

### onAbilityLand

```ts
onAbilityLand(handler: (player: Player, ability: string, target: Player) => void): void;
```

Calls `handler` when an ability's lunge reaches who it was aimed at.

### onDash

```ts
onDash(handler: (player: Player) => void): void;
```

Calls `handler` when an octopus dashes. Heard on the host only. onDash, onInk and onGrab are
for octopuses only: a mode's own team's ability keys are heard with onAbility.

### onInk

```ts
onInk(handler: (player: Player) => void): void;
```

Calls `handler` when an octopus squirts ink. Heard on the host only.

### onGrab

```ts
onGrab(handler: (player: Player) => void): void;
```

Calls `handler` when an octopus grabs at something. Heard on the host only.

### onShoot

```ts
onShoot(handler: (player: Player) => void): void;
```

Calls `handler` when a diver fires either gun. Heard on the host only.
