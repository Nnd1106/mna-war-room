/* ---------------------------------------------------------------------
 * negotiation.js: a multi-issue negotiation with hidden priorities.
 *
 * Each issue has a handful of options worth something to you and something
 * to the other side. What the other side really cares about (its weights) is
 * drawn from the seed out of a few profiles. A package is accepted when the
 * counterparty's weighted score clears its threshold. The skill being
 * taught is logrolling: give on what is cheap for you and dear to them.
 *
 * stage: { counterpart:{name,role}, rounds, probes, threshold, youWeights:{},
 *          issues:[{id,name,desc,options:[{id,label,you,them,price,set,effects}]}],
 *          profiles:[{id,weights:{issueId:w},tell}] }
 * writes run.deal.nego[stage.id] and, when an option carries a price, run.deal.price
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  const E = WR.sim.negotiation = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const profile = rng.pick(stage.profiles);
      run.st[stage.id] = {
        profile: profile.id, round: 1, probesLeft: stage.probes === undefined ? 2 : stage.probes,
        revealed: {}, history: [], counter: null, done: false, result: null,
      };
    },

    rounds: (stage) => stage.rounds || 5,
    profile(run, stage) { return stage.profiles.find((p) => p.id === run.st[stage.id].profile); },
    opt(stage, issueId, optId) { return stage.issues.find((i) => i.id === issueId).options.find((o) => o.id === optId); },

    youScore(stage, pkg) {
      const w = stage.youWeights || {};
      let num = 0, den = 0;
      stage.issues.forEach((i) => { const k = w[i.id] === undefined ? 1 : w[i.id]; num += k * E.opt(stage, i.id, pkg[i.id]).you; den += k; });
      return num / den;
    },
    themScore(run, stage, pkg) {
      const w = E.profile(run, stage).weights;
      let num = 0, den = 0;
      stage.issues.forEach((i) => { const k = w[i.id] === undefined ? 1 : w[i.id]; num += k * E.opt(stage, i.id, pkg[i.id]).them; den += k; });
      return num / den;
    },
    threshold(run, stage, round) { return U.val(stage.threshold, run) - 2 * ((round || run.st[stage.id].round) - 1); },

    packages(stage) {
      let out = [{}];
      stage.issues.forEach((i) => {
        const next = [];
        out.forEach((p) => i.options.forEach((o) => next.push(Object.assign({}, p, { [i.id]: o.id }))));
        out = next;
      });
      return out;
    },

    /** Best package for you that the other side would still accept at the given round. */
    best(run, stage, round) {
      const thr = E.threshold(run, stage, round);
      let best = null, bestYou = -1;
      E.packages(stage).forEach((p) => {
        if (E.themScore(run, stage, p) < thr) return;
        const y = E.youScore(stage, p);
        if (y > bestYou) { bestYou = y; best = p; }
      });
      return { pkg: best, you: bestYou };
    },

    /** Their counter-offer: the best package for them that gives you a slowly rising minimum. */
    counterOffer(run, stage) {
      const st = run.st[stage.id];
      const floor = 34 + 5 * st.round;
      let best = null, bestThem = -1;
      E.packages(stage).forEach((p) => {
        if (E.youScore(stage, p) < floor) return;
        const t = E.themScore(run, stage, p);
        if (t > bestThem) { bestThem = t; best = p; }
      });
      return best || E.packages(stage)[0];
    },

    /** Ask a careful question about one issue: learn how much they care (high / medium / low). */
    probe(run, stage, issueId) {
      const st = run.st[stage.id];
      if (st.done || st.probesLeft <= 0) throw new Error('no probes left');
      const w = E.profile(run, stage).weights;
      const ranked = stage.issues.map((i) => ({ id: i.id, w: w[i.id] === undefined ? 1 : w[i.id] })).sort((a, b) => b.w - a.w);
      const pos = ranked.findIndex((r) => r.id === issueId);
      const tier = pos < ranked.length / 3 ? 'high' : pos < (2 * ranked.length) / 3 ? 'medium' : 'low';
      st.probesLeft -= 1;
      st.revealed[issueId] = tier;
      return tier;
    },

    propose(run, stage, pkg) {
      const st = run.st[stage.id];
      if (st.done) throw new Error('negotiation over');
      const them = E.themScore(run, stage, pkg);
      const thr = E.threshold(run, stage);
      const entry = { round: st.round, pkg: Object.assign({}, pkg), you: E.youScore(stage, pkg), accepted: them >= thr };
      if (entry.accepted) { st.history.push(entry); return E.settle(run, stage, pkg, 'proposal'); }
      const w = E.profile(run, stage).weights;
      const gaps = stage.issues.map((i) => ({ issue: i, gap: (w[i.id] === undefined ? 1 : w[i.id]) * (100 - E.opt(stage, i.id, pkg[i.id]).them) })).sort((a, b) => b.gap - a.gap);
      entry.objection = gaps[0].issue.id;
      entry.warm = them >= thr - 8;
      st.history.push(entry);
      D.effects(run, { heat: 2, days: 3 });
      if (st.round >= E.rounds(stage)) {
        st.counter = E.counterOffer(run, stage);
        st.lastChance = true;
        return { accepted: false, objection: entry.objection, warm: entry.warm, counter: st.counter, lastChance: true };
      }
      st.round += 1;
      st.counter = E.counterOffer(run, stage);
      return { accepted: false, objection: entry.objection, warm: entry.warm, counter: st.counter, lastChance: false };
    },

    acceptCounter(run, stage) {
      const st = run.st[stage.id];
      if (st.done || !st.counter) throw new Error('no counter-offer on the table');
      return E.settle(run, stage, st.counter, 'counter');
    },

    walk(run, stage) { return E.close(run, stage, null, 'walk'); },

    settle(run, stage, pkg, how) {
      stage.issues.forEach((i) => {
        const o = E.opt(stage, i.id, pkg[i.id]);
        D.effects(run, o.effects); D.flags(run, o.set);
        if (o.price !== undefined) run.deal.price = o.price;
      });
      return E.close(run, stage, pkg, how);
    },

    close(run, stage, pkg, how) {
      const st = run.st[stage.id];
      const best = E.best(run, stage, E.rounds(stage));
      const agreed = !!pkg;
      const you = agreed ? E.youScore(stage, pkg) : 0;
      const res = { agreed, how, pkg, you, them: agreed ? E.themScore(run, stage, pkg) : 0, best: best.you, bestPkg: best.pkg, rounds: st.round, walked: how === 'walk', profile: st.profile };
      const floor = 30;
      run.deal.exec[stage.id] = agreed ? U.clamp(35 + 65 * (you - floor) / Math.max(1, best.you - floor), 20, 100) : (stage.walkOk ? 60 : 25);
      st.done = true; st.result = res;
      run.deal.nego = run.deal.nego || {};
      run.deal.nego[stage.id] = res;
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      if (!agreed && stage.failEnd) D.end(run, how === 'walk' ? 'walked' : stage.failEnd);
      return Object.assign({ accepted: agreed }, res);
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      if (policy === 'coach') {
        const b = E.best(run, stage, 1);
        if (b.pkg) E.propose(run, stage, b.pkg);
        if (!st.done) E.acceptCounter(run, stage);
        return;
      }
      const all = E.packages(stage);
      let guard = 0;
      while (!st.done && guard++ < 12) {
        if (st.counter && (st.lastChance || run.policyRng.chance(0.3))) { E.acceptCounter(run, stage); break; }
        if (run.policyRng.chance(0.05)) { E.walk(run, stage); break; }
        E.propose(run, stage, run.policyRng.pick(all));
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
