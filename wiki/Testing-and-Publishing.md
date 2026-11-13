# Testing and publishing

## Check as you type

Open your scripts folder in an editor that knows TypeScript, such as VS Code, with
`smart-fellas.d.ts` and `tsconfig.json` in it. Every call completes as you type, and a wrong name or a
wrong kind of value is underlined before you ever start the game. Hover a call to read what it does.

The game itself doesn't type-check: it only blanks the types out. So the editor is where type
mistakes are caught.

## Test a map script: Test Map

In Godot, press **Test Map** above the 3D view.

1. The add-on exports the map and asks the game to build its scripts. A script that won't build is
   named with its file and line, and the map doesn't open. The line is the same in your `.ts` file:
   building only blanks out the types, so every line stays where it was.
2. The game opens on your map, hosted on your PC alone, with two octopus bots and two diver bots.
3. Play it. Messages from your script show in the chat.
4. If your script stops, you see one line saying why: it ran too long, used too much memory, or
   threw an error (with the error's own words). Fix it and press Test Map again: a second test closes
   the first one's game.

Test Map needs Smart Fellas installed through Steam. The map maker's README says how it finds the
game.

## Test a game mode

1. Keep your mode's folder in the game's modes folder (**Workshop > Modes > My modes > Open modes
   folder**).
2. Host a game on any map, or press **Test Map** in Godot, and pick your mode under **Game mode** in
   the lobby.
3. The game reads the modes folder again each time you open My modes, host, or open the lobby panel.
   After changing a script, open the lobby panel again (Tab) and pick the mode again.

A round can't start until the mode's script is running. If it stops, a round being played ends as a
draw and the match goes back to Classic, and the host sees why.

## Tips for testing

- **Bots** fill the teams, so you can test alone. A mode can ask for more with `game.setBots`.
- **Say what's happening** while you build: a `game.say` in each handler shows the order things
  happen in. Take them out before you publish.
- **Test a round's end,** not only its start: `game.setTimeLeft(20)` in `onRoundStart` gets you there
  fast. Remove it afterwards.
- **Test with a friend** for `client/` and `shared/` scripts: a second player's PC is sent less than
  the host knows, so some mistakes only show there.

## Publish to the Steam Workshop

**A map:** press **Export Map** in Godot. It shows in the game under **Workshop > Maps > My maps**,
where you name it, pick its picture and publish it. Its scripts go with it. On **Browse**, a map with
scripts is marked as scripted.

**A mode:** in **Workshop > Modes > My modes**, your mode is listed. Press **Edit & publish**, give it
a title and a description, and publish it. Add a `preview.png` (up to 1 MB, 16:9 is best) for its
picture. Players subscribe to it from **Browse**, under the **Modes** tab, and a player who joins your
game without it can get it from the mode's card in the lobby.

Everyone in a game needs the same files: the game checks every player's copy of the map and the mode
matches the host's.

## Before you publish

- [ ] It type-checks in your editor with no underlines.
- [ ] You played a whole round, start to end, and a second round after it.
- [ ] Your test messages and shortened clocks are gone.
- [ ] Every `game.piece` and `game.zone` name matches a name in your map.
- [ ] Each message is short and plain: players read it mid-chase.
