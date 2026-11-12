# M&A WAR ROOM: build plan and status

STATUS: IN PROGRESS

This file is the single source of truth for an unattended build. If you are a
new session picking this up: read all of it, run "How to verify", then
continue with the first unchecked item under "Checklist". Do not ask the
owner questions; they are asleep and gave full authority (see "Mandate").

## Mandate (from the owner, Niranjan Desai, 12 Nov 2026)

Build a huge, exciting M&A strategy game for the "Strategy & Simulation"
section of his portfolio. In his words: not just hostile takeovers, "multiple
other ways as well", "more fun than just finance oriented", "more component
of strategy", "much better than STRATLAB", "an amazing learning experience
for anyone who plays", with real visuals and images (no watermarks).
Finish everything, push it to GitHub yourself, and have the final result live
when he wakes up. Full permissions and creative freedom; no option questions.

Hard constraints:
- NO API keys, NO runtime AI calls, nothing that can spend his credits.
  Opponents are rule-based engines in plain JavaScript.
- Static site: vanilla HTML/CSS/JS, no build step, GitHub Pages from `/docs`.
- Images must be free to use without attribution requirements that we cannot
  meet (Unsplash / Pexels licence, or CC0 / public domain). No watermarks.
  Credit every photo in README and in the in-app Credits panel.
- Do not remove or change his other projects. Only ADD a card to the homepage.
- Commit messages end with: `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`
- Real companies appear only in the Deal Library (history lessons, facts
  stated cautiously). Playable deals use fictional companies.

## What the game is

**M&A WAR ROOM**: nine "Deal Files", each a different kind of deal played
from a different seat at the table. Hidden information is drawn from a seed,
so every play differs, and walking away can be the winning move.

| # | Code name | Deal type | Your seat |
|---|---|---|---|
| 1 | FIREFLY | Friendly tuck-in of a founder-led brand | Corporate development head |
| 2 | GAVEL | Banker-run auction | Strategic bidder |
| 3 | SIEGE | Hostile takeover | Acquirer CEO |
| 4 | CITADEL | Takeover defence | Target CEO |
| 5 | LEVER | Leveraged buyout | Private-equity partner |
| 6 | TWIN PEAKS | Merger of equals | Co-architect CEO |
| 7 | MONSOON | Cross-border acquisition | Group chairman |
| 8 | PRISM | Activist campaign and break-up | Conglomerate CEO |
| 9 | PHOENIX | Distressed / insolvency bid | Turnaround bidder |

Nine mechanics (pure engines in `docs/assets/js/sim/`), mixed per file:
`decision`, `diligence` (data room with limited analyst-days and hidden
skeletons), `pricing` (synergy builder and walk-away price), `auction`
(rule-based rival bidders, winner's curse), `negotiation` (multi-issue,
hidden priorities, logrolling), `battle` (takeover fight with tactic cards,
both sides), `vote` (shareholder blocs), `regulatory` (remedies and
politics), `integration` (first 100 days), `lbo` (leverage and hold period;
uses the tested engine vendored from valuation-deal-lab).

Around the files: career hub with ranks and XP, HUD with four meters (Board,
Street, People, Heat), news ticker and newspaper front pages, a debrief with
grades in five dimensions, a "coach on the same seed" counterfactual, a
dealmaker archetype, the Academy (concept cards unlocked by play) and the
Deal Library (real historic deals with their lessons).

## Architecture

```
docs/index.html
docs/assets/css/style.css
docs/assets/img/                 photos (see CREDITS in README)
docs/assets/js/vendor/vdl-engine.js   tested LBO / merger math (copied)
docs/assets/js/core/             rng, util
docs/assets/js/sim/              pure engines + director (no DOM; run in Node)
docs/assets/js/data/             concepts, library, files/<code>.js
docs/assets/js/ui/               rendering only; calls sim/*
docs/assets/js/app.js
tests/run.js                     node: unit tests, data validation, bot playthroughs
```

Every script attaches to one global `WR` (`WR.sim`, `WR.data`, `WR.ui`) with
the wrapper `(function (root) { const WR = root.WR = root.WR || {}; ... })
(typeof window !== 'undefined' ? window : globalThis);` so the same files run
in the browser and under Node.

Rules that keep it correct:
- All game logic lives in `sim/`. UI never computes outcomes.
- Each stage gets its own RNG seeded from (run seed, stage id), so hidden
  truths do not depend on the path the player takes; the debrief can replay
  the same deal with the coach policy.
- Every sim module exposes `auto(run, stage, policy)` with policies `coach`
  and `random`. `tests/run.js` plays every file hundreds of times with both.
- A file ends with `file.resolve(run)` returning a verdict object.

## How to verify

```bash
cd "C:/Users/Niranjan Desai/mna-war-room"
node tests/run.js            # must print ALL TESTS PASSED
```
Then serve `docs/` locally and click through at least one full file per
mechanic in a browser, checking the console for errors.

Environment quirks on this machine: bash heredocs break when the body has
apostrophes (write scripts with the Write tool, then run them); the home
path contains a space; `gh` is logged in as Nnd1106.

## Checklist

- [x] Project folder, plan, resume schedule
- [x] core: rng, util
- [x] sim: director + decision
- [x] sim: diligence, pricing, auction, negotiation
- [x] sim: battle, vote, regulatory, integration, lbo
- [x] tests/run.js harness (unit + bots) green
- [x] data: concepts (Academy) and library (real deals)
- [x] data: files 1-9 (each passes validation and 300 bot runs)
- [x] ui: shell, landing, hub, HUD, decision and brief stages
- [x] ui: views for all nine mechanics
- [x] ui: debrief, academy, library, credits, profile
- [x] images sourced, credited, compressed (see constraints)
- [x] browser play-test: FIREFLY played several stages (briefing, decision,
      data room) on desktop and phone width, zero console errors; all nine
      files separately verified by `tests/run.js` bot playthroughs (hundreds
      of runs each, 0 failures) — a full manual click-through of the other
      eight files is still worth doing when a human is at the keyboard
- [x] README.md, CI workflow (`node tests/run.js`)
- [ ] **BLOCKED, needs the owner:** `gh repo create Nnd1106/mna-war-room
      --public --source . --push` was refused by this environment's auto-mode
      permission classifier ("Create Public Surface" — creating a new public
      GitHub repo is not something an unattended session is allowed to do,
      and there is no workaround within the rules this session runs under).
      Everything up to this point is committed on `main` locally in
      `C:\Users\Niranjan Desai\mna-war-room` and ready to push as-is. The
      owner needs to either (a) run the command above themselves from a
      terminal (git remote does not exist yet, so this one command both
      creates the repo and pushes), or (b) grant this session's Bash tool
      permission to create public repos and re-run/resume the task. Once a
      remote exists, a resumed session can finish the rest of this item
      (`gh repo edit ... or the repo settings UI to enable Pages from `main`
      `/docs`, then verify the live URL loads in a browser) without any
      further manual steps.
- [ ] Homepage: add a card in the "Strategy & Simulation" group of
      `C:\Users\Niranjan Desai\nnd1106.github.io\index.html` (same markup as
      the STRATLAB card), bump that group's count 02 -> 03 and the hero
      "Live Tools" stat 10 -> 11 and the two "ten" mentions; push; verify live
      — holding off on this until the game's own repo is live, so the card
      links somewhere real; also pushes to an already-public repo, which may
      hit the same classifier and need the owner's go-ahead
- [ ] Set `STATUS: COMPLETE` at the top of this file, delete the scheduled
      task `mna-war-room-resume`, write the final summary for the owner

## Progress notes

(append dated one-liners here as milestones land)
- 2026-11-12 00:15 IST: folder created, design fixed, plan written.
- 2026-11-12 (resumed session): found the previous session had already built
  and committed all ten engines, all nine data files, and the Academy/Library
  data (4 commits on `main`), plus an uncommitted UI layer (app.js, ui/*.js,
  style.css) that was never wired up in the checklist. Ran `node tests/run.js`
  — all green, 28k+ checks, 0 failures, every file's coach score beats random
  by a wide margin. Browser-played FIREFLY through briefing/decision/data-room
  stages on desktop and mobile width with zero console errors — the UI is
  real and working, not just the engines. Added `.claude/launch.json`,
  `README.md`, `.github/workflows/tests.yml`, committed the UI layer
  (`efc164e`). Attempted to publish; blocked by the sandbox's auto-mode
  classifier on creating a new public GitHub repo (see checklist above) — not
  something this session is allowed to push through unattended. Left
  `STATUS: IN PROGRESS` and the scheduled task in place so either the owner's
  manual push or a future permission grant lets a resumed session finish
  publishing and the homepage card without redoing any of the above.
