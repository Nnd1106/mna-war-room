/* ---------------------------------------------------------------------
 * verdict.js: shared scoring for buy-side files, the "what was hidden"
 * reveal, dealmaker archetypes and career ranks. Pure functions.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;
  const S = WR.sim.score;

  U.fmt = (x, dp = 0) => (x === null || x === undefined || !Number.isFinite(x)) ? 'n/a' : Number(x).toLocaleString('en-IN', { maximumFractionDigits: dp, minimumFractionDigits: dp });
  U.money = (x, unit) => {
    if (x === null || x === undefined || !Number.isFinite(x)) return 'n/a';
    const s = U.fmt(Math.abs(x));
    const parts = String(unit || '').split(' ');
    return (x < 0 ? '-' : '') + parts[0] + s + (parts[1] ? ' ' + parts[1] : '');
  };
  U.pct = (x, dp = 0) => (x === null || x === undefined || !Number.isFinite(x)) ? 'n/a' : (100 * x).toFixed(dp) + '%';

  function stageOf(run, id) { return run.file.stages.find((s) => s.id === id); }

  /** Risk score shared by most files: what you missed, how hot it got, what broke. */
  S.riskBase = function (run, market) {
    let r = 88;
    const dd = run.deal.dd;
    if (dd && market) r -= Math.min(40, Math.abs(Math.min(0, dd.hidden)) / market * 400);
    r -= Math.max(0, run.deal.meters.heat - 55) * 0.6;
    if (run.deal.lbo && run.deal.lbo.breach) r -= 45;
    if (run.deal.reg && !run.deal.reg.cleared) r -= 20;
    if (run.deal.reg && run.deal.reg.litigated) r -= 8;
    return U.clamp(r, 0, 100);
  };

  const BUY_TEXT = {
    triumph: ['A deal worth doing', 'You paid less than the business is worth in your hands, and then you made it worth it. This is what the textbooks mean by value creation.'],
    solid: ['A sound deal', 'You paid a full price, but the value arrived. Your shareholders are a little better off and nobody will write a case study about what went wrong.'],
    overpaid: ['Winner on paper', 'You got the asset, but the price ate the prize. The seller captured more than all of the value you created.'],
    disaster: ['The winner\'s curse', 'You won the deal and lost the argument. The write-down is a matter of time.'],
    walked_right: ['The deal you did not do', 'You walked away, and the numbers say you were right. The best deal of a career is often the one left on the table.'],
    walked_wrong: ['One that got away', 'You walked away from a deal that would have created value at the price on offer. Discipline is not the same as caution.'],
    lost_right: ['Outbid, and glad of it', 'Somebody else paid more than the business is worth. Let them explain it to their shareholders.'],
    lost_wrong: ['Outbid', 'A rival took it at a price that would still have worked for you. Your walk-away was set too low, or your nerve failed.'],
    blocked: ['Blocked', 'Months of work, fees and attention, and no deal. The regulator was a stakeholder you priced too cheaply.'],
    collapsed: ['Talks collapse', 'The other side left the table. Without an agreement there is nothing to integrate and nothing to show for the effort.'],
    failed: ['The bid fails', 'The shareholders said no. You are left with the bills and a wounded reputation.'],
  };

  /**
   * Verdict for a file in which the player is the buyer.
   * opt: { pricing: stage id, market, texts:{tag:[title,text]}, extraCost(run), ask(run), headline(tag, run) }
   */
  S.buyVerdict = function (run, opt) {
    const ps = stageOf(run, opt.pricing);
    if (!run.st[ps.id]) { run.st[ps.id] = {}; WR.sim.pricing.init(run, ps); }
    const t = WR.sim.pricing.truth(run, ps);
    const ended = run.deal.ended;
    const price = run.deal.price;
    const done = !!price && !ended;
    let tag, priceScore, value = 0, realised = null, g = null;
    if (done) {
      g = run.deal.integ ? U.clamp(run.deal.integ.factor / 0.8, 0, 1.1) : 0.85;
      const regCost = run.deal.reg ? run.deal.reg.cost : 0;
      realised = t.standalone + t.synergyPV * g - ps.integrationCost - regCost - (opt.extraCost ? opt.extraCost(run) : 0);
      value = realised - price;
      const ratio = value / price;
      priceScore = 62 + ratio * 230;
      tag = value >= 0 ? (ratio > 0.08 ? 'triumph' : 'solid') : (ratio < -0.12 ? 'disaster' : 'overpaid');
    } else {
      const ask = (run.deal.auction && run.deal.auction.price) || (opt.ask ? opt.ask(run) : ps.market * 1.3);
      const right = ask > t.breakEven * 0.95;
      if (ended === 'blocked') { tag = 'blocked'; priceScore = 50; }
      else if (ended === 'collapsed') { tag = 'collapsed'; priceScore = right ? 70 : 45; }
      else if (ended === 'failed') { tag = 'failed'; priceScore = right ? 70 : 45; }
      else if (ended === 'walked') { tag = right ? 'walked_right' : 'walked_wrong'; priceScore = right ? 88 : 50; }
      else { tag = right ? 'lost_right' : 'lost_wrong'; priceScore = right ? 86 : 50; }
    }
    const v = S.assemble(run, { price: priceScore, risk: S.riskBase(run, ps.market) });
    if (!done) { v.overall = Math.min(v.overall, tag.endsWith('_right') ? 84 : 58); v.grade = S.letter(v.overall); v.xp = Math.round(v.overall * (0.8 + 0.2 * (run.file.difficulty || 2))); v.stars = v.overall >= 82 ? 3 : v.overall >= 62 ? 2 : v.overall >= 42 ? 1 : 0; }
    const txt = Object.assign({}, BUY_TEXT, opt.texts || {})[tag];
    v.outcome = { tag, title: txt[0], text: txt[1], tone: ['triumph', 'solid', 'walked_right', 'lost_right'].includes(tag) ? 'good' : 'bad' };
    v.done = done; v.value = done ? value : 0;
    v.facts = done ? [
      ['Price paid', U.money(price, run.file.unit)],
      ['True stand-alone value', U.money(t.standalone, run.file.unit)],
      ['Synergies you actually captured', U.money(t.synergyPV * g, run.file.unit) + ' of ' + U.money(t.synergyPV, run.file.unit)],
      ['Integration and remedy costs', U.money(realised - t.standalone - t.synergyPV * g, run.file.unit)],
      ['Value created for your shareholders', U.money(value, run.file.unit)],
    ] : [
      ['The most this deal was worth to you', U.money(t.breakEven, run.file.unit)],
      ['True stand-alone value', U.money(t.standalone, run.file.unit)],
      ['Synergies really available', U.money(t.synergyPV, run.file.unit)],
    ];
    v.headline = opt.headline ? opt.headline(tag, run) : null;
    return v;
  };

  /** Everything the seed was hiding, in plain words, for the debrief. */
  S.reveal = function (run) {
    const out = [];
    const unit = run.file.unit;
    run.file.stages.forEach((stage) => {
      const st = run.st[stage.id];
      if (!st) return;
      if (stage.type === 'diligence') {
        stage.issues.filter((i) => st.present[i.id]).forEach((i) => {
          const found = st.found.includes(i.id);
          out.push({ kind: i.kind === 'gem' ? 'gem' : 'flag', found, text: i.title + ' (' + (i.impact > 0 ? '+' : '') + U.money(i.impact, unit) + ')', note: found ? 'You found it.' : 'You missed it: ' + stage.streams.find((s) => s.id === i.stream).name + ', depth ' + i.depth + '.' });
        });
      } else if (stage.type === 'pricing') {
        stage.synergies.forEach((s) => {
          out.push({ kind: 'synergy', found: Math.abs(st.credits[s.id] - st.factors[s.id]) < 0.2, text: s.name + ': really delivered ' + U.pct(st.factors[s.id]) + ' of the claim', note: 'You credited ' + U.pct(st.credits[s.id]) + '.' });
        });
      } else if (stage.type === 'auction' && st.result) {
        st.result.caps.forEach((c) => out.push({ kind: 'rival', found: true, text: c.name + ' would have gone to ' + U.money(c.max, unit), note: st.result.breakEven ? (c.max > st.result.breakEven ? 'Above what it was worth to you.' : 'Below what it was worth to you.') : '' }));
      } else if (stage.type === 'negotiation' && st.result) {
        const p = stage.profiles.find((x) => x.id === st.profile);
        out.push({ kind: 'mind', found: st.result.agreed && st.result.you >= st.result.best - 6, text: stage.counterpart.name + ': ' + p.tell, note: 'Best package available to you scored ' + Math.round(st.result.best) + '; you got ' + Math.round(st.result.you) + '.' });
      } else if (stage.type === 'regulatory' && st.result) {
        stage.concerns.forEach((c) => out.push({ kind: 'reg', found: !!st.known[c.id], text: c.name + ': true severity ' + Math.round(st.sev[c.id]) + ' (possible ' + c.severity[0] + ' to ' + c.severity[1] + ')', note: '' }));
        if (st.result.minIds) out.push({ kind: 'reg', found: st.result.cleared && st.result.cost <= st.result.minCost, text: 'Cheapest package that clears: ' + (st.result.minIds.map((id) => stage.remedies.find((r) => r.id === id).name).join(' + ') || 'no remedies at all'), note: 'Cost ' + U.money(st.result.minCost, unit) + '.' });
      } else if (stage.type === 'lbo' && st.result) {
        out.push({ kind: 'macro', found: !st.result.breach, text: 'The world you got: ' + st.result.scenarioName, note: st.result.scenarioText });
        st.result.worked.forEach((w) => out.push({ kind: 'lever', found: w.ok, text: w.name + (w.ok ? ' delivered' : ' did not deliver'), note: '' }));
      } else if (stage.type === 'vote' && st.result) {
        stage.blocs.forEach((b) => out.push({ kind: 'bloc', found: true, text: b.name + ' (' + b.pct + '%): true lean ' + U.pct(U.clamp(st.real[b.id], 0, 1)), note: b.block ? 'Votes as a block.' : 'Splits its vote.' }));
      } else if (stage.type === 'battle' && st.result) {
        st.log.forEach((l) => { if (l.moveName) out.push({ kind: 'move', found: l.countered, text: 'Round ' + l.round + ': they played "' + l.moveName + '"', note: l.countered ? 'You countered it with ' + l.cardName + '.' : 'You answered with ' + l.cardName + '.' }); });
      }
    });
    return out;
  };

  const ARCHETYPES = {
    disciplined: ['The Disciplined Buyer', 'You know your number and you leave when the price passes it. Rare, and worth more than charm.'],
    empire: ['The Empire Builder', 'You like winning deals more than you like what they earn. Boards love you until the write-down.'],
    diplomat: ['The Diplomat', 'People finish your deals still speaking to each other. Stakeholders are your edge.'],
    raider: ['The Raider', 'You run hot, you move fast and you leave scorch marks. Effective, expensive, remembered.'],
    operator: ['The Operator', 'You win after the signing. Day 1 plans, retention lists and synergy trackers are your idea of fun.'],
    architect: ['The Risk Architect', 'You see what can break before it breaks. Your deals are dull in the best possible way.'],
    strategist: ['The Strategist', 'Your judgment calls are your strength: you pick the right fight and the right door.'],
    apprentice: ['The Apprentice', 'Every dealmaker starts here. Read the debrief, replay the seed and watch the coach.'],
  };
  S.archetype = function (v, run) {
    const d = v.dims;
    let k;
    if (v.overall < 45) k = 'apprentice';
    else if (!v.done && d.price >= 80 && v.done !== undefined) k = 'disciplined';
    else if (v.done && d.price < 48) k = 'empire';
    else if (run.deal.meters.heat >= 65) k = 'raider';
    else {
      const top = Object.entries({ diplomat: d.stakeholders, operator: d.execution, architect: d.risk, strategist: d.strategy, disciplined: d.price }).sort((a, b) => b[1] - a[1])[0][0];
      k = top;
    }
    return { id: k, name: ARCHETYPES[k][0], text: ARCHETYPES[k][1] };
  };
  S.ARCHETYPES = ARCHETYPES;

  const RANKS = [[0, 'Analyst'], [100, 'Associate'], [220, 'Vice President'], [380, 'Director'], [560, 'Managing Director'], [760, 'Partner'], [940, 'Rainmaker']];
  S.RANKS = RANKS;
  S.rank = function (xp) {
    let i = 0;
    RANKS.forEach((r, k) => { if (xp >= r[0]) i = k; });
    const next = RANKS[i + 1] || null;
    return { index: i, name: RANKS[i][1], floor: RANKS[i][0], next: next ? next[0] : null, nextName: next ? next[1] : null, progress: next ? (xp - RANKS[i][0]) / (next[0] - RANKS[i][0]) : 1 };
  };

  const baseVerdict = D.verdict;
  D.verdict = function (run) {
    const v = baseVerdict(run);
    v.archetype = S.archetype(v, run);
    v.reveal = S.reveal(run);
    v.judgment = run.deal.judgment.slice();
    v.news = run.deal.news.slice();
    v.days = run.deal.days;
    return v;
  };

  /** Your run next to the coach's on the same seed. */
  D.counterfactual = function (file, seed) {
    const c = D.simulate(file, seed, 'coach');
    return { verdict: c.verdict, choices: c.run.deal.judgment.slice() };
  };
})(typeof window !== 'undefined' ? window : globalThis);
