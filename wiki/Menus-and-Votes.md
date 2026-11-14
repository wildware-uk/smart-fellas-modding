# Menus and votes

A menu is a card on the right of a player's screen: a title over 2 to 5 choices. The player picks
one with the number keys 1 to 5. New in API 1.4.0.

| Call | Does |
| --- | --- |
| `game.menu(id, spec, viewers?)` | opens a menu for `viewers` (a team or a player), or everyone |
| `game.removeMenu(id, viewers?)` | closes it for those who still have it |
| `game.onChoose(handler)` | runs when a player picks: the player, the menu's id, the choice's place (0 for the first) and its text |
| `game.vote(spec, viewers?)` | asks a question and settles with how it came out |

`spec` is `{ title, choices, seconds }`. The title is up to 60 characters, each choice up to 30.
`seconds` (up to 600) closes the menu by itself and counts down under it; leave it out and the menu
stays until the player picks or you close it.

- **One menu at a time.** A new menu takes the place of the one a player has.
- **Picking closes it** for that player, and your handler hears the pick once. To let them pick
  again (a shop, say), open the menu again in the handler.
- **The number keys pick while it shows.** They do nothing else then (an octopus's saved looks
  wait), and nothing at all while chat or the pause menu is open.
- A menu reaches who is in the match now: a player who joins later isn't shown it. The lobby
  closes every menu.
- Only host scripts open menus: in a `client/` script `game.menu` does nothing.
- Picking needs a keyboard for now.

## Votes

`game.vote({ title, choices, seconds })` opens a menu for each person and gives back a promise. It
settles when `seconds` are up (1 to 600, which you must give) or when every person shown it has
answered, with:

- `winner`: the choice with the most answers, or `null` when nobody answered or the top is a tie;
- `index`: where the winner is in `choices`, or `null`;
- `counts`: how many picked each choice.

Each person's first pick counts. Bots never answer, and aren't waited for. A vote's menu has an id
starting `vote-`, and its picks reach `game.onChoose` too.

## Example: pick a side

```ts
// As a round starts, every octopus picks where to start.
const dens = { North: Vec.of(0, -20, 60), South: Vec.of(0, -20, -60) };

game.onRoundStart(() => {
  game.menu("den", { title: "Where do you start?", choices: ["North", "South"], seconds: 10 }, "octopus");
});

game.onChoose((player, menu, choice, text) => {
  if (menu !== "den") {
    return;
  }
  const at = dens[text as keyof typeof dens];
  player.moveTo(at.x, at.y, at.z);
});
```

## Example: vote for a fast round

```ts
game.onRoundStart(() => {
  game.vote({ title: "Fast round?", choices: ["Yes", "No"], seconds: 10 }).then((result) => {
    if (result.winner !== "Yes") {
      return;
    }
    for (const player of game.players()) {
      player.setSpeed(1.5);
    }
    game.announce("Fast round!");
  });
});
```

## Your own line on the results

`game.endRound(winner, why?, text?)` takes your own words for the results screen, up to 80
characters, in place of the game's line. Pass `null` for `why` to give only your words:

```ts
game.endRound("diver", null, "The divers found the treasure");
```

Every call is on the [Game reference](Reference-Game.md).
