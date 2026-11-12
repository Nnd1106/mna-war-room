# M&A War Room

A free browser game about mergers and acquisitions. Nine "Deal Files", nine
different seats at the table: a friendly tuck-in, a banker-run auction, a
hostile takeover, a takeover defence, a leveraged buyout, a merger of
equals, a cross-border acquisition, an activist break-up campaign, and a
distressed/insolvency bid.

Play it live: https://nnd1106.github.io/mna-war-room/

## What makes it different from a quiz

Every deal file draws its hidden facts — the skeleton in the data room, the
rival bidder's real ceiling, what the other side secretly cares about, the
recession that arrives in year two — from a seed. The same seed always
produces the same hidden truths, so you can replay a deal or share your
seed with someone else and compare choices. You are scored on the value you
captured, not on whether you closed: walking away from a bad price can be
the best grade in the file.

Ten rule-based game mechanics sit behind the nine files: a branching
decision tree, a data-room diligence budget, a synergy/pricing builder, a
rule-based rival-bidder auction, multi-issue negotiation with hidden
priorities, a takeover-defence battle with tactic cards, a shareholder
vote, a regulatory-remedies stage, a 100-day integration stage, and an LBO
engine (the tested leverage/return math vendored from this author's
[valuation-deal-lab](https://github.com/Nnd1106/valuation-deal-lab)
project). After each file, a debrief grades you on five dimensions, shows
everything that was hidden, and replays your exact seed through a "coach"
policy so you can see what the stronger line looked like.

Around the nine files: a career hub with ranks and XP, a HUD with four
meters (Board, Street, People, Heat), a news ticker and newspaper front
pages, 72 unlockable concept cards in the Academy, and a Deal Library of
22 real historic M&A deals with their lessons (real companies appear only
there, stated cautiously; every playable deal uses fictional companies).

## Why it's safe to run anywhere

- No API keys, no accounts, no server. Everything — including every
  "opponent" — is a deterministic, rule-based engine running in plain
  JavaScript in your browser. Nothing is sent anywhere.
- No build step. `docs/` is served as-is by GitHub Pages.

## Project layout

```
docs/index.html                       entry point (GitHub Pages serves /docs)
docs/assets/css/style.css
docs/assets/img/                      photos (see Credits below)
docs/assets/js/vendor/vdl-engine.js   LBO / merger math, vendored from valuation-deal-lab
docs/assets/js/core/                  seeded RNG, small utilities
docs/assets/js/sim/                   pure game engines (no DOM; run under Node too)
docs/assets/js/data/                  Academy concepts, Deal Library, the nine deal files
docs/assets/js/ui/                    rendering only — calls into sim/, never computes outcomes
docs/assets/js/app.js                 router and app shell
tests/run.js                          node: unit tests, data validation, thousands of bot playthroughs
```

Every script attaches to one global `WR` and is written to run unchanged in
a browser `<script>` tag or under plain Node, which is what lets
`tests/run.js` load the real game engines and play every file hundreds of
times with both a scripted "coach" policy and a random policy, checking
that playing well scores reliably higher than playing randomly.

## Running the tests

```bash
node tests/run.js
```

This runs the unit tests, validates every data file (concepts, library,
and all nine deal files), and bot-plays each of the nine files hundreds of
times end to end, printing a score summary and `ALL TESTS PASSED` on
success. It is also run on every push via GitHub Actions
(`.github/workflows/tests.yml`).

## Playing it locally

`docs/` is a static site with no build step. Serve it with anything, e.g.:

```bash
npx serve docs
```

## Credits

Every photo is published under the Unsplash Licence (free to use, no
permission or attribution required) and is credited anyway, both here and
in the in-app Credits panel: see
[`docs/assets/js/data/credits.js`](docs/assets/js/data/credits.js).

---

Built by Niranjan Desai, with Claude.
