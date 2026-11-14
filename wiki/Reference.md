<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->

# Reference

Every call a script can make, straight from `smart-fellas.d.ts`. These pages are made from that file each time it changes, so they always match it.

## Globals

- `game`: The match. See [Game](Reference-Game.md).
- `after`, `every`, `cancel`: see [Timers](Reference-Timers.md).
- `Vec`, `Maths`, `Random`, `Easing`, `Ease`, `tween`, `State`, `StateMachine`, `Store`, `store`, `log`: see [Helpers](Reference-Helpers.md).

## Pages

- [Player](Reference-Player.md): A player in the match.
- [Zone](Reference-Zone.md): A trigger box placed on the map, found by name with game.zone().
- [Piece](Reference-Piece.md): A piece of the map you named for scripts: in the add-on, add it to the group `script` (or `switch`, for one players can use, such as a lever).
- [Creature](Reference-Creature.md): A creature or food in the match, placed by the map or spawned by a script.
- [Game](Reference-Game.md): The match, as the script sees it.
- [Timers](Reference-Timers.md): `after`, `every` and `cancel`.
- [Helpers](Reference-Helpers.md): `Vec`, `Maths`, `Random`, `tween`, `StateMachine`, `store`, `log` and the rest.
- [Types](Reference-Types.md): the smaller types the calls take and give back.

## Notes from the top of the types file

Smart Fellas map scripts: the types and docs for everything a map's script can reach.

Keep this file in your map's scripts folder (Export puts a fresh copy there each time), and any
editor that knows TypeScript completes and checks your scripts as you type. Write each script as a
.ts file (or plain .js). Export and Test Map turn them into JavaScript for the game.

The modding wiki has a guide to every part, with examples to copy:
https://github.com/wildware-uk/smart-fellas-modding/wiki

Where a script runs is the folder it is in:
- Directly in the scripts folder: in the host's game only, which decides the match. What it changes reaches every player the way everything else does.
- In client/: on each player's own PC, for that player alone. Its messages and sounds are for that one screen. It can't change the match: anything else it asks for is ignored.
- In shared/: in the host's game for real, and on each player's own PC to guess ahead, so a door a player pulls starts moving at once on their screen. On a player's PC only its piece moves, turns, shows and hides happen, as a guess the host's game then confirms or puts right. Its messages and sounds come from the host's game. The copy on a player's PC hears only that player using a switch, and game.random() gives it different numbers, so let it guess from what it reads at the moment (where the door is now), not from counts it keeps.
- On a player's PC a script reads only what that player's game was sent: a player it wasn't sent has no position.

How a script runs:
- The scripts in one place are loaded at the start of the match, in name order, and share their globals. The host's game loads shared/ first, then its own. There is no import: the game loads them all itself.
- Register handlers once, at the top of a file. The game calls them each tick (64 a second).
- Actions such as door.moveTo() are queued and applied after your handlers finish, so what you read stays as the tick began.
- There is no clock (no Date) and no Math.random: use game.seconds and game.random(), or a Random of your own.
- Every script also has the helpers at the end of this file: Vec, Maths, Random, Ease, tween, StateMachine, store and log.
- A script that runs too long, uses too much memory, or throws and doesn't catch it is switched off for the rest of the match, and the host sees one line saying why.
- A bad argument (a name that doesn't exist, a point far outside the map) throws an Error you can catch. A handle to something that has gone does nothing and reads as gone.

Game modes use the same calls. A mode is a folder with a mode.json (its name, description, player
counts and the lobby settings it offers) and a scripts/ folder laid out as a map's. The host picks
the mode in the lobby, apart from the map, and the mode's scripts run beside the map's in a world
of their own: each numbers the players for itself. The mode's run first each tick.
Every round is played by a mode, Classic and Infected included: they ship as modes in the same
shape. The game has no win checks of its own: the mode ends the round with game.endRound(). A
round can't start until the mode's script is running. When the clock runs out (and isn't held),
the mode hears onTimeUp; if it doesn't end the round on that tick, the round ends as a draw. A
mode whose script stops ends a round being played as a draw, and the match goes back to Classic.

mode.json may also say, each optional:
- "minDivers", "minOctopuses": the fewest players on each team a round may start with (0);
- "teamLines": { "octopus": "...", "diver": "..." }, the lines under each team's name in the lobby (a team the mode adds says its own, in game.registerTeam), and "startLines" the same shape, the lines under the banner as the hunt starts (1 to 60 characters each);
- "look": "catches" or "turns" for the game's own octopuses-left count and results (Classic's, Infected's), or left out for the mode's own scoreboard and banner;
- "revives": true if the lobby's Revives setting applies: a netted octopus may be freed.
The calls marked "for game modes" change the round's rules. A map's script may use them too, and
the mode then hears what happened through its own events (onTeamChange, onRoundEnd).
The calls marked "on the host only" work only in the host's game: a client/ script's call does
nothing. The host's game decides them and sends them to the players they are for.
An object a call takes (a spec, a point) is read for the values it holds itself, as an object
literal or a Vec point does: a value from a getter, from its prototype or through a Proxy reads as
left out, so none of the script's own code runs inside a call.
