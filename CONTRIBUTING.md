# Contributing

Bug reports, ideas and fixes are welcome. Open an issue first for anything big.

## The parts

- `smart-fellas.d.ts`: the API. Each call's doc comment is what modders read in their editor and in
  the wiki's reference pages, so keep it plain and say each range.
- `examples/`, `mode_template/`: whole scripts modders copy.
- `wiki/`: the wiki. Each page is a file; links between pages are written `Page.md`. A workflow copies
  it into the GitHub wiki on every change to `main`. Never edit a `Reference*.md` page by hand: run
  `npm run reference` after changing the types file.

## Before a pull request

```
npm ci
npm run reference
npm run check
```

`npm run check` type-checks every example and every ```` ```ts ```` block in the README and the wiki,
each as a whole script, and refuses what the game lacks (`import`, `enum`, `Date`, `Math.random` and
so on). A block that only shows a shape, such as a folder or a `mode.json`, is written without `ts`.

## The API follows the game

The calls are what the game understands. A new call, or a change to what one does, needs the game to
learn it too, so it lands here together with a game release that knows it.

## Releases

Add the version's section at the top of `CHANGELOG.md`, then tag it: `git tag v1.2.0 && git push
origin v1.2.0`. The tag makes the GitHub Release, with the types file attached.
