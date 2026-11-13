# FAQ

**Do I need to know TypeScript?**
No. Plain JavaScript works too: name the file `.js`. TypeScript adds the types, so your editor can
tell you about a mistake before you run the game.

**Do I need Node, npm or a compiler?**
No. The game reads `.ts` files itself. You only need an editor, and the map maker for maps.

**Can my script read files, use the internet or see the player's computer?**
No. Scripts run in a sealed box with nothing but this API, on every PC. That's what makes it safe to
play a stranger's map.

**Can I bring my own sounds or models with a script?**
A script can play the game's own sounds only (see [Sounds](Sounds.md)). Models go in the map, through
the map maker.

**Can I split my script into several files?**
Yes. Every file in a folder is loaded, in name order, and they share their globals. There's no
`import`: define something at the top of one file and use it in another.

**Can a map have a script and a game mode at once?**
Yes. Both run, side by side, each in a world of its own. The mode's scripts run first each tick.

**Why did my script stop?**
It ran too long, used too much memory, or threw an error it didn't catch. The host sees one line
saying which. See [How scripts run](How-Scripts-Run.md) for the limits.

**Why is a player's position null?**
They have no body right now (waiting, respawning, out, or gone), or, in a `client/` script, that
player's game wasn't sent them.

**How do I make something random?**
`game.random()` gives a number from 0 up to 1. `Math.floor(game.random() * list.length)` picks from
a list.

**How do I keep something between matches?**
You can't. Each match starts every script fresh, and there are no files to save to.

**Where do I report a bug in the API, or ask for a new call?**
[Open an issue](https://github.com/wildware-uk/smart-fellas-modding/issues/new) on this repository.
Say what you called, what you expected and what happened. For help, come to the Smart Fellas Discord,
linked from [the map guide](https://wildwarestudios.com/games/smart-fellas/maps).

**Can I change this wiki?**
It's made from the `wiki/` folder of the repository, so edits on the wiki itself are overwritten.
Open a pull request on that folder, or an issue, instead.
