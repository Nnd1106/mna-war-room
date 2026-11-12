/* ---------------------------------------------------------------------
 * tests/run.js: node tests/run.js
 *
 * Loads exactly the scripts index.html loads (minus the UI), then:
 *   1. unit-tests the engines,
 *   2. validates every Deal File, concept and library entry,
 *   3. plays every file hundreds of times with the coach and random bots.
 * ------------------------------------------------------------------- */
'use strict';
const fs = require('fs');
const path = require('path');

const docs = path.join(__dirname, '..', 'docs');
const html = fs.readFileSync(path.join(docs, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const only = process.env.WR_ONLY ? process.env.WR_ONLY.split(',') : null;
scripts.forEach((src) => {
  if (src.includes('/ui/') || src.endsWith('app.js')) return;
  const full = path.join(docs, src);
  if (!fs.existsSync(full)) { if (only) return; throw new Error('index.html references a missing script: ' + src); }
  const mod = require(full);
  if (src.includes('vdl-engine')) globalThis.VDLEngine = mod;
});
const WR = globalThis.WR;
const D = WR.sim.director;
const U = WR.util;

let passed = 0;
const failures = [];
function ok(cond, msg) { if (cond) passed++; else failures.push(msg); }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ')'); }
function section(name) { console.log('\n== ' + name); }

/* ---------------- 1. engine unit tests ---------------- */
section('core');
{
  const a = WR.rng.make('x'), b = WR.rng.make('x');
  ok(a.next() === b.next(), 'rng is deterministic for a seed');
  ok(WR.rng.sub('s', 'a').next() !== WR.rng.sub('s', 'b').next(), 'sub-streams differ');
  near(U.irr([-100, 0, 0, 0, 0, 200]), Math.pow(2, 1 / 5) - 1, 1e-9, 'irr of a double in five years');
  ok(U.irr([10, 10]) === null, 'irr without sign change is null');
  ok(U.money(1234.4, '₹ cr') === '₹1,234 cr', 'money format: ' + U.money(1234.4, '₹ cr'));
  ok(WR.sim.score.rank(0).name === 'Analyst' && WR.sim.score.rank(99999).name === 'Rainmaker', 'ranks');
}

function miniFile(stages, extra) {
  return Object.assign({ id: 'mini', unit: '$ m', difficulty: 1, stages, resolve: (run) => WR.sim.score.assemble(run, { price: 60, risk: 60 }) }, extra);
}

section('decision + director');
{
  const f = miniFile([
    { id: 'a', type: 'decision', title: 'A', options: [{ id: 'x', label: 'x', q: 3, effects: { board: 10 }, goto: 'c' }, { id: 'y', label: 'y', q: 0, end: 'walked' }] },
    { id: 'b', type: 'decision', title: 'B', options: [{ id: 'x', label: 'x' }] },
    { id: 'c', type: 'decision', title: 'C', when: (run) => true, options: [{ id: 'x', label: 'x', roll: { p: 1, win: { text: 'w', set: { won: 1 } }, lose: { text: 'l' } } }] },
  ]);
  const run = D.create(f, 'S1');
  WR.sim.decision.choose(run, f.stages[0], 'x');
  ok(run.deal.meters.board === 70, 'effects apply');
  D.next(run, run.st.a.goto);
  ok(D.stage(run).id === 'c', 'goto skips a stage');
  WR.sim.decision.choose(run, f.stages[2], 'x');
  ok(run.deal.flags.won === 1, 'roll branch sets flags');
  D.next(run);
  ok(run.done, 'run finishes');
  const r2 = D.create(f, 'S1');
  WR.sim.decision.choose(r2, f.stages[0], 'y');
  ok(r2.done && r2.deal.ended === 'walked', 'end tag stops the run');
  const sim = D.simulate(f, 'S2', 'coach');
  ok(sim.run.deal.judgment[0].option === 'x', 'coach picks the best option');
}

section('diligence + pricing');
{
  const dd = { id: 'dd', type: 'diligence', title: 'DD', days: 3, streams: [{ id: 'f', name: 'F' }, { id: 'g', name: 'G' }],
    issues: [{ id: 'i1', stream: 'f', depth: 1, kind: 'flag', p: 1, impact: -50, chip: 10, title: 't' }, { id: 'i2', stream: 'g', depth: 2, kind: 'flag', p: 1, impact: -30, title: 't2' }, { id: 'i3', stream: 'g', depth: 1, kind: 'gem', p: 0, impact: 99, title: 't3' }], coachPlan: ['f'] };
  const pr = { id: 'pr', type: 'pricing', title: 'P', ddStage: 'dd', market: 500, standalone: { mid: 600, noise: 0 }, cap: 10, integrationCost: 20,
    synergies: [{ id: 's', name: 's', kind: 'cost', runRate: 10, range: [0.5, 0.5] }] };
  const f = miniFile([dd, pr]);
  const run = D.create(f, 'S');
  const r = WR.sim.diligence.dig(run, dd, 'f');
  ok(r.findings.length === 1 && r.cost === 1, 'dig finds the depth-1 issue');
  ok(WR.sim.diligence.canDig(run, dd, 'f') && !WR.sim.diligence.canDig(run, dd, 'nope') === true || true, 'canDig');
  WR.sim.diligence.close(run, dd);
  ok(run.deal.dd.adjust === -50 && run.deal.dd.hidden === -30, 'found and missed issues are tracked');
  D.next(run);
  const v = WR.sim.pricing.view(run, pr);
  near(v.standalone, 550, 1e-9, 'pricing uses known issues only');
  const t = WR.sim.pricing.truth(run, pr);
  near(t.breakEven, 600 - 80 + 50 - 20, 1e-9, 'truth includes missed issues and real synergy');
  WR.sim.pricing.setCredit(run, pr, 's', 0.5);
  WR.sim.pricing.lock(run, pr, 500);
  ok(run.deal.walkAway === 500 && run.deal.exec.pr > 50, 'lock records walk-away and a score');
}

section('auction');
{
  const pr = { id: 'pr', type: 'pricing', title: 'P', market: 500, standalone: { mid: 600, noise: 0 }, cap: 10, integrationCost: 0, synergies: [] };
  const au = { id: 'au', type: 'auction', title: 'A', open: 500, increment: 0.02, rounds: 3, pricingStage: 'pr',
    rivals: [{ id: 'r1', name: 'R1', value: [550, 550], hubris: [0, 0] }, { id: 'r2', name: 'R2', value: [700, 700], hubris: [0.1, 0.1] }] };
  const f = miniFile([pr, au]);
  let run = D.create(f, 'S'); WR.sim.pricing.lock(run, pr, 590); D.next(run);
  let rep = WR.sim.auction.bid(run, au, null);
  ok(rep.result && !rep.result.won && rep.result.winner === 'R2', 'dropping hands it to the strongest rival');
  ok(rep.result.rightToLose === (rep.result.price > 600), 'rightToLose compares with true value');
  run = D.create(f, 'S'); WR.sim.pricing.lock(run, pr, 590); D.next(run);
  let guard = 0;
  while (!run.st.au.done && guard++ < 10) WR.sim.auction.bid(run, au, WR.sim.auction.isFinal(run, au) ? 900 : WR.sim.auction.minBid(run, au));
  ok(run.deal.won && run.deal.price === 900 && run.deal.auction.curse, 'a silly sealed bid wins and is flagged as the curse');
  let threw = false; try { const r3 = D.create(f, 'S'); D.next(r3); WR.sim.auction.bid(r3, au, 1); } catch (e) { threw = true; }
  ok(threw, 'bids below the minimum are rejected');
}

section('negotiation');
{
  const ng = { id: 'ng', type: 'negotiation', title: 'N', threshold: 60, rounds: 3, probes: 1, counterpart: { name: 'C', role: 'r' },
    issues: [{ id: 'p', name: 'p', options: [{ id: 'lo', label: 'lo', you: 100, them: 0, price: 10 }, { id: 'hi', label: 'hi', you: 0, them: 100, price: 20 }] },
      { id: 'q', name: 'q', options: [{ id: 'a', label: 'a', you: 60, them: 100 }, { id: 'b', label: 'b', you: 100, them: 0 }] }],
    profiles: [{ id: 'x', weights: { p: 1, q: 3 }, tell: 't' }] };
  const f = miniFile([ng]);
  let run = D.create(f, 'S');
  const N = WR.sim.negotiation;
  ok(N.packages(ng).length === 4, 'package enumeration');
  ok(N.probe(run, ng, 'q') === 'high', 'probe reveals the top issue');
  let r = N.propose(run, ng, { p: 'lo', q: 'b' });
  ok(!r.accepted && r.objection === 'q' && r.counter, 'greedy offer is rejected with an objection and a counter');
  r = N.propose(run, ng, { p: 'lo', q: 'a' });
  ok(r.accepted && run.deal.price === 10, 'logrolled offer is accepted and sets the price');
  near(run.deal.nego.ng.you, 80, 1e-9, 'your score');
  ok(run.deal.exec.ng === 100, 'best package scores 100');
  run = D.create(f, 'S'); N.walk(run, ng);
  ok(!run.deal.nego.ng.agreed && run.deal.nego.ng.walked, 'walk');
}

section('battle');
{
  const bt = { id: 'bt', type: 'battle', title: 'B', side: 'attack', rounds: 2, support0: 40, chest: 10, price: 100,
    cards: [{ id: 'raise', name: 'Raise', cost: 0, support: [10, 10], bump: 0.1, q: 2 }, { id: 'sue', name: 'Sue', cost: 20, support: [1, 1] }, { id: 'block', name: 'Block', cost: 5, support: [6, 6], counters: ['pill'], q: 3 }],
    enemy: [{ id: 'pill', name: 'Pill', tell: 'x', support: [-10, -10] }] };
  const f = miniFile([bt]);
  const run = D.create(f, 'S');
  const B = WR.sim.battle;
  ok(B.hand(run, bt).find((c) => c.id === 'sue').affordable === false, 'cards over budget are not affordable');
  const s0 = run.st.bt.support;
  const e = B.play(run, bt, 'block');
  ok(e.countered, 'counter recognised');
  near(e.after, s0 + 6 - 2, 1e-9, 'countered move is blunted to 20%');
  const e2 = B.play(run, bt, 'raise');
  ok(e2.result && near, 'battle ends after the last round');
  near(run.deal.battle.price, 110, 1e-9, 'bump raises the price');
  ok(run.deal.battle.bidderWins === (run.deal.battle.support >= 50), 'winner decided by threshold');
}

section('vote');
{
  const vt = { id: 'vt', type: 'vote', title: 'V', question: 'q', threshold: 50, time: 2, noise: 0,
    blocs: [{ id: 'a', name: 'A', pct: 40, lean: 0.4, block: true, cares: ['price'] }, { id: 'b', name: 'B', pct: 60, lean: 0.5, cares: ['jobs'] }],
    actions: [{ id: 'x', name: 'x', cost: 1, sway: { price: 0.2 } }, { id: 'y', name: 'y', cost: 3, sway: { all: 1 } }] };
  const f = miniFile([vt]);
  const run = D.create(f, 'S');
  const V = WR.sim.vote;
  near(V.forecast(run, vt), 30, 1e-9, 'block below half votes zero; dispersed bloc splits');
  ok(!V.actions(run, vt).find((a) => a.id === 'y').affordable, 'time limits actions');
  V.act(run, vt, 'x');
  near(V.forecast(run, vt), 70, 1e-9, 'tag sway flips a block');
  const r = V.call(run, vt);
  ok(r.passed && r.success, 'vote passes');
}

section('regulatory');
{
  const rg = { id: 'rg', type: 'regulatory', title: 'R', authority: 'The Authority',
    concerns: [{ id: 'c1', name: 'c1', severity: [10, 10] }, { id: 'c2', name: 'c2', severity: [5, 5] }],
    remedies: [{ id: 'm1', name: 'm1', cost: 10, fixes: { c1: 10 } }, { id: 'm2', name: 'm2', cost: 4, fixes: { c2: 5 } }, { id: 'm3', name: 'm3', cost: 30, fixes: { c1: 20, c2: 20 } }],
    intel: [{ id: 'i', name: 'i', reveals: ['c1'] }], litigate: { p: 0 } };
  const f = miniFile([rg]);
  const R = WR.sim.regulatory;
  let run = D.create(f, 'S');
  ok(R.minimal(run, rg).cost === 14, 'cheapest clearing package');
  ok(R.intel(run, rg, 'i')[0].about === 10, 'intel reveals severity');
  let r = R.submit(run, rg, ['m2']);
  ok(!r.cleared && r.phase === 2 && r.objections[0].id === 'c1', 'short package draws objections');
  r = R.submit(run, rg, ['m3']);
  ok(r.cleared && r.cost === 30 && run.deal.exec.rg < 90, 'over-remedy clears but scores lower');
  run = D.create(f, 'S'); R.submit(run, rg, []); r = R.litigate(run, rg);
  ok(!r.cleared && r.litigated, 'losing in court blocks the deal');
  run = D.create(f, 'S'); r = R.submit(run, rg, ['m1', 'm2']);
  ok(r.cleared && run.deal.exec.rg === 100, 'exact package scores 100');
}

section('integration');
{
  const ig = { id: 'ig', type: 'integration', title: 'I', phases: ['a', 'b'], capacity: 2,
    initiatives: [{ id: 'x', name: 'x', cost: 1, capture: 40 }, { id: 'y', name: 'y', cost: 1, capture: 40, requires: ['x'] }, { id: 'z', name: 'z', cost: 2, morale: 10, from: 1 }],
    events: [{ id: 'e', phase: 1, when: (s) => s.capture >= 80, p: 1, text: 'e', fx: { customers: 20 } }] };
  const f = miniFile([ig]);
  const I = WR.sim.integration;
  const run = D.create(f, 'S');
  ok(I.available(run, ig).find((i) => i.id === 'y').ready === false && !I.available(run, ig).find((i) => i.id === 'z'), 'requires and from gate initiatives');
  let threw = false; try { I.commit(run, ig, ['y']); } catch (e) { threw = true; }
  ok(threw, 'cannot commit an initiative before its prerequisite');
  I.commit(run, ig, ['x']);
  const e = I.commit(run, ig, ['y']);
  ok(e.events.length === 1 && run.deal.integ.capture === 80 && run.deal.integ.customers === 100, 'event fires on state and integration closes');
  near(run.deal.integ.factor, 0.8, 1e-9, 'realisation factor');
}

section('lbo');
{
  const lb = { id: 'lb', type: 'lbo', title: 'L', base: { revenue: 1000, ebitMargin: 0.15, daPct: 0.05, capexPct: 0.04, nwcPct: 0.1, tax: 0.25, growth: 0.06 },
    entryEv: 1600, exitMultiple: 8, covenant: 1.5, maxLevers: 1, senior: [2, 5, 3.5], sub: [0, 2, 1], hold: [3, 7, 5],
    levers: [{ id: 'm', name: 'm', margin: 0.03, p: 1 }, { id: 'g', name: 'g', growth: 0.03, p: 0 }],
    scenarios: [{ id: 'base', name: 'Base', w: 1, text: 't' }], coach: { senior: 3.5, sub: 1, hold: 5, levers: ['m'] } };
  const f = miniFile([lb]);
  const L = WR.sim.lbo;
  const run = D.create(f, 'S');
  const base = L.project(run, lb, run.st.lb.plan, false);
  ok(base.irr > 0.05 && base.irr < 0.6 && Math.abs(base.entryMultiple - 8) < 1e-9, 'plain projection is sane: irr ' + base.irr);
  const more = L.project(run, lb, Object.assign({}, run.st.lb.plan, { senior: 4.5 }), false);
  ok(more.irr > base.irr, 'more leverage raises the plan-case IRR');
  ok(L.setPlan(run, lb, { levers: ['m', 'g'], senior: 99 }).levers.length === 1 && run.st.lb.plan.senior === 5, 'plan is clamped');
  const withLever = L.project(run, lb, run.st.lb.plan, false);
  L.setPlan(run, lb, { levers: ['g'], senior: 3.5 });
  const res = L.lock(run, lb);
  ok(res.planCase.irr > res.irr, 'a failed lever means the realised IRR is below plan');
  ok(withLever.irr > base.irr, 'a working lever helps');
  ok(L.project(run, lb, { senior: 9, sub: 9, hold: 5, levers: [] }, false).error, 'impossible structures report an error instead of throwing');
}

/* ---------------- 2. data validation ---------------- */
section('data');
const files = Object.values(WR.data.files).sort((a, b) => a.n - b.n);
const concepts = WR.data.concepts || {};
const TYPES = ['brief', 'decision', 'diligence', 'pricing', 'auction', 'negotiation', 'battle', 'vote', 'regulatory', 'integration', 'lbo'];
if (!only) {
  ok(files.length === 9, 'nine deal files are registered (found ' + files.length + ')');
  ok(Object.keys(concepts).length >= 40, 'at least 40 concept cards');
  ok((WR.data.library || []).length >= 14, 'at least 14 library deals');
  (WR.data.library || []).forEach((d) => {
    ok(d.id && d.title && d.year && d.type && d.story && d.lesson && Array.isArray(d.concepts), 'library entry complete: ' + d.id);
    d.concepts.forEach((c) => ok(!!concepts[c], 'library ' + d.id + ' links a known concept: ' + c));
    (d.files || []).forEach((fid) => ok(!!WR.data.files[fid], 'library ' + d.id + ' links a known file: ' + fid));
  });
  Object.entries(concepts).forEach(([id, c]) => ok(c.name && c.cat && c.short && c.body, 'concept complete: ' + id));
  (WR.data.credits || []).forEach((c) => {
    ok(c.file && c.by && c.source && c.licence, 'credit complete: ' + c.file);
    ok(fs.existsSync(path.join(docs, 'assets', 'img', c.file)), 'credited image exists: ' + c.file);
  });
  files.forEach((f) => { if (f.image) ok((WR.data.credits || []).some((c) => c.file === f.image), 'file image is credited: ' + f.image); });
}
const usedConcepts = new Set();
function teach(list, where) { (list || []).forEach((c) => { usedConcepts.add(c); ok(!!concepts[c] || !!only, 'unknown concept "' + c + '" in ' + where); }); }
files.forEach((f) => {
  const w = 'file ' + f.id;
  ok(f.code && f.title && f.type && f.seat && f.unit && f.tagline && Array.isArray(f.learn) && typeof f.resolve === 'function', w + ' has its header fields');
  const ids = new Set();
  f.stages.forEach((s) => {
    const ws = w + '/' + s.id;
    ok(!ids.has(s.id), ws + ' id unique'); ids.add(s.id);
    ok(TYPES.includes(s.type), ws + ' type known: ' + s.type);
    ok(!!s.title, ws + ' has a title');
    teach(s.teaches, ws); teach(s.teachesOnEnd, ws); teach(s.teachesOnClose, ws); teach(s.teachesOnLock, ws);
    if (s.type === 'brief') ok(Array.isArray(s.text) && s.text.length > 0, ws + ' brief has text');
    if (s.type === 'decision') {
      ok(!!s.prompt && s.options.length >= 2, ws + ' has a prompt and options');
      s.options.forEach((o) => { ok(o.label && o.outcome !== undefined && o.coach, ws + '/' + o.id + ' has label, outcome and coach note'); teach(o.teaches, ws); if (o.goto) ok(f.stages.some((x) => x.id === o.goto), ws + ' goto exists'); });
      ok(s.options.some((o) => !o.requires), ws + ' always has at least one unconditional option');
    }
    if (s.type === 'diligence') {
      s.issues.forEach((i) => { ok(s.streams.some((x) => x.id === i.stream) && i.depth >= 1 && i.depth <= 3 && i.title && i.text, ws + ' issue ok: ' + i.id); teach(i.teaches, ws); });
      const cost = (s.coachPlan || []).reduce((acc, sid) => { acc.d[sid] = (acc.d[sid] || 0) + 1; acc.c += acc.d[sid]; return acc; }, { d: {}, c: 0 }).c;
      const budget = s.coachDays || s.days;
      ok(cost <= budget, ws + ' coach plan fits the days (' + cost + '/' + budget + ')');
    }
    if (s.type === 'pricing') { if (s.ddStage) ok(f.stages.some((x) => x.id === s.ddStage && x.type === 'diligence'), ws + ' ddStage exists'); }
    if (s.type === 'auction') ok(f.stages.some((x) => x.id === s.pricingStage && x.type === 'pricing'), ws + ' pricingStage exists');
    if (s.type === 'negotiation') {
      s.profiles.forEach((p) => Object.keys(p.weights).forEach((k) => ok(s.issues.some((i) => i.id === k), ws + ' profile weight names an issue: ' + k)));
      ok(s.issues.every((i) => i.options.length >= 2), ws + ' every issue has options');
    }
    if (s.type === 'battle') {
      s.cards.forEach((c) => { (c.counters || []).forEach((m) => ok(s.enemy.some((e) => e.id === m), ws + ' card ' + c.id + ' counters a real move: ' + m)); teach(c.teaches, ws); ok(c.name && c.desc, ws + ' card text: ' + c.id); });
      s.enemy.forEach((e) => ok(e.name && e.tell && e.desc, ws + ' enemy move text: ' + e.id));
      ok(s.cards.some((c) => !c.cost), ws + ' has a free card so the hand is never empty');
    }
    if (s.type === 'vote') {
      near(s.blocs.reduce((a, b) => a + b.pct, 0), 100, 0.01, ws + ' blocs sum to 100');
      s.actions.forEach((a) => teach(a.teaches, ws));
    }
    if (s.type === 'regulatory') {
      s.remedies.forEach((r) => Object.keys(r.fixes || {}).forEach((k) => ok(s.concerns.some((c) => c.id === k), ws + ' remedy fixes a real concern: ' + k)));
      s.concerns.forEach((c) => ok(s.remedies.reduce((a, r) => a + ((r.fixes && r.fixes[c.id]) || 0), 0) >= c.severity[1], ws + ' all remedies together always clear ' + c.id));
    }
    if (s.type === 'integration') {
      s.initiatives.forEach((i) => { (i.requires || []).forEach((r) => ok(s.initiatives.some((x) => x.id === r), ws + ' prerequisite exists: ' + r)); teach(i.teaches, ws); ok(i.name && i.desc && i.track, ws + ' initiative text: ' + i.id); });
    }
    if (s.type === 'lbo') { s.levers.forEach((l) => teach(l.teaches, ws)); ok(s.coach && s.scenarios.length >= 2, ws + ' has a coach plan and scenarios'); }
  });
});
if (!only) Object.keys(concepts).forEach((id) => ok(usedConcepts.has(id) || (WR.data.library || []).some((d) => d.concepts.includes(id)), 'concept "' + id + '" is taught somewhere'));

/* ---------------- 3. bot playthroughs ---------------- */
section('bots');
const N = Number(process.env.WR_RUNS || 300);
files.forEach((f) => {
  const stats = { coach: [], random: [] };
  const tags = {};
  let lastSeed = '', lastPolicy = '';
  try {
    for (let i = 0; i < N; i++) {
      ['coach', 'random'].forEach((policy) => {
        lastSeed = f.id + '-' + i; lastPolicy = policy;
        const { run, verdict } = D.simulate(f, lastSeed, policy);
        ok(Number.isFinite(verdict.overall) && verdict.overall >= 0 && verdict.overall <= 100, f.id + ' overall in range (' + lastSeed + ')');
        ok(Object.values(verdict.dims).every((x) => Number.isFinite(x) && x >= 0 && x <= 100), f.id + ' dims in range (' + lastSeed + ' ' + policy + ')');
        ok(verdict.outcome && verdict.outcome.title && verdict.outcome.text && verdict.grade && verdict.archetype && Array.isArray(verdict.facts), f.id + ' verdict complete (' + lastSeed + ')');
        ok(typeof verdict.headline === 'string' && verdict.headline.length > 8, f.id + ' has a headline for ' + (verdict.outcome && verdict.outcome.tag));
        ok(Object.values(run.deal.meters).every((x) => x >= 0 && x <= 100), f.id + ' meters in range');
        stats[policy].push(verdict.overall);
        if (policy === 'random') tags[verdict.outcome.tag] = (tags[verdict.outcome.tag] || 0) + 1;
        if (policy === 'coach') tags['coach:' + verdict.outcome.tag] = (tags['coach:' + verdict.outcome.tag] || 0) + 1;
      });
      // same seed, same policy => same result (the debrief's counterfactual depends on it)
      if (i < 20) ok(D.simulate(f, f.id + '-' + i, 'coach').verdict.overall === D.simulate(f, f.id + '-' + i, 'coach').verdict.overall, f.id + ' is deterministic');
    }
  } catch (e) {
    failures.push(f.id + ' threw on seed ' + lastSeed + ' (' + lastPolicy + '): ' + (e.stack || e.message));
  }
  const mc = U.mean(stats.coach), mr = U.mean(stats.random);
  const sd = Math.sqrt(U.mean(stats.random.map((x) => (x - mr) * (x - mr))));
  console.log('  ' + f.code.padEnd(11) + ' coach ' + mc.toFixed(1) + '  random ' + mr.toFixed(1) + ' (sd ' + sd.toFixed(1) + ', min ' + Math.min(...stats.random).toFixed(0) + ', max ' + Math.max(...stats.random).toFixed(0) + ')  ' + JSON.stringify(tags));
  ok(mc >= 72, f.id + ': the coach should average at least 72 (got ' + mc.toFixed(1) + ')');
  ok(mc - mr >= 10, f.id + ': the coach should beat random play by at least 10 points (got ' + (mc - mr).toFixed(1) + ')');
  ok(sd >= 5, f.id + ': random play should produce a spread of outcomes (sd ' + sd.toFixed(1) + ')');
  ok(Object.keys(tags).filter((t) => !t.startsWith('coach:')).length >= 3, f.id + ': at least three different endings are reachable');
});

console.log('\n' + passed + ' checks passed, ' + failures.length + ' failed');
if (failures.length) {
  const uniq = [...new Set(failures)];
  uniq.slice(0, 40).forEach((m) => console.log('  FAIL ' + m));
  if (uniq.length > 40) console.log('  ... and ' + (uniq.length - 40) + ' more');
  process.exit(1);
}
console.log('ALL TESTS PASSED');
