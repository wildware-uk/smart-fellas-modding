#!/usr/bin/env bash
# Usage: tools/publish-wiki.sh
#
# Copies wiki/ into this repository's GitHub wiki, as one commit, when anything in it changed. Links
# between pages are written Page.md, so they work in wiki/ here too; the wiki's own links have no .md.
# Run by .github/workflows/check.yml on main, with GH_TOKEN and GITHUB_REPOSITORY set.
#
# GitHub makes a wiki's store only when its first page is made on the website. Until then this says so
# and leaves with 0, and the next run fills it.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${GH_TOKEN:?GH_TOKEN must be set}" "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY must be set}"
wiki=$(mktemp -d)
trap 'rm -rf "$wiki"' EXIT
if ! git clone -q "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git" "$wiki" 2>/dev/null; then
    echo "::warning::The wiki has no first page yet. Open the Wiki tab on GitHub, press \"Create the first page\" and save it as it is, then run this workflow again."
    exit 0
fi
find "$wiki" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
for page in wiki/*.md; do
    sed -E 's/\]\(([A-Za-z0-9_-]+)\.md(#[^)]*)?\)/](\1\2)/g' "$page" >"$wiki/$(basename "$page")"
done
cd "$wiki"
git add -A
if git diff --cached --quiet; then
    echo "The wiki already matches."
    exit 0
fi
git -c user.name="Wildware Studios" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
    commit -q -m "Wiki from ${GITHUB_SHA:-the repository}"
git push -q origin HEAD
echo "Published the wiki."
