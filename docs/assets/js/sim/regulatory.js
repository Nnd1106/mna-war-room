/* ---------------------------------------------------------------------
 * regulatory.js: getting a deal past the competition authority.
 *
 * The authority has concerns, each with a severity the player cannot see
 * exactly. Remedies (divestments, commitments) fix some of a concern at a
 * cost in deal value. Offer too little and you get a statement of
 * objections and one more try; offer too much and you gave away value you
 * did not have to. In the second phase you may also litigate.
 *
 * stage: { authority, concerns:[{id,name,desc,severity:[lo,hi]}],
 *          remedies:[{id,name,desc,cost,fixes:{concernId:x}}],
 *          intel:[{id,name,desc,days,reveals:[concernId]}], litigate:{p} }
 * writes run.deal.reg
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  const E = WR.sim.regulatory = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const sev = {};
      stage.concerns.forEach((c) => { sev[c.id] = rng.range(c.severity[0], c.severity[1]); });
      run.st[stage.id] = { sev, phase: 1, known: {}, intelUsed: [], offered: [], objections: null, done: false, result: null };
    },

    residual(run, stage, remedyIds) {
      const st = run.st[stage.id];
      const out = {};
      stage.concerns.forEach((c) => {
        const fix = U.sum(stage.remedies.filter((r) => remedyIds.includes(r.id)).map((r) => (r.fixes && r.fixes[c.id]) || 0));
        out[c.id] = Math.max(0, st.sev[c.id] - fix);
      });
      return out;
    },
    clears(run, stage, ids) { return Object.values(E.residual(run, stage, ids)).every((x) => x <= 0); },
    cost(stage, ids) { return U.sum(stage.remedies.filter((r) => ids.includes(r.id)).map((r) => r.cost)); },

    /** Cheapest package that would have cleared (for scoring and the debrief). */
    minimal(run, stage) {
      const n = stage.remedies.length;
      let best = null, bestCost = Infinity;
      for (let mask = 0; mask < (1 << n); mask++) {
        const ids = stage.remedies.filter((r, i) => mask & (1 << i)).map((r) => r.id);
        const c = E.cost(stage, ids);
        if (c < bestCost && E.clears(run, stage, ids)) { bestCost = c; best = ids; }
      }
      return { ids: best, cost: best ? bestCost : null };
    },

    /** Commission work that narrows down how serious a concern is. */
    intel(run, stage, intelId) {
      const st = run.st[stage.id];
      const it = (stage.intel || []).find((x) => x.id === intelId);
      if (st.done || !it || st.intelUsed.includes(intelId)) throw new Error('intel not available');
      st.intelUsed.push(intelId);
      D.effects(run, { days: it.days || 10, spend: it.spend || 0 });
      it.reveals.forEach((cid) => {
        const c = stage.concerns.find((x) => x.id === cid);
        const t = (st.sev[cid] - c.severity[0]) / Math.max(1e-9, c.severity[1] - c.severity[0]);
        st.known[cid] = { level: t < 0.34 ? 'low' : t < 0.67 ? 'medium' : 'high', about: Math.round(st.sev[cid]) };
      });
      return it.reveals.map((cid) => Object.assign({ id: cid }, st.known[cid]));
    },

    submit(run, stage, remedyIds) {
      const st = run.st[stage.id];
      if (st.done) throw new Error('review over');
      st.offered = remedyIds.slice();
      if (E.clears(run, stage, remedyIds)) return E.finish(run, stage, true, false);
      if (st.phase === 1) {
        const res = E.residual(run, stage, remedyIds);
        st.objections = stage.concerns.filter((c) => res[c.id] > 0).map((c) => ({ id: c.id, name: c.name, gap: res[c.id], level: res[c.id] > 12 ? 'serious' : 'modest' }));
        st.phase = 2;
        D.effects(run, { days: 45, heat: 8, street: -4 });
        D.news(run, stage.authority + ' issues a statement of objections', 'bad');
        return { cleared: false, phase: 2, objections: st.objections };
      }
      return E.finish(run, stage, false, false);
    },

    litigate(run, stage) {
      const st = run.st[stage.id];
      if (st.done || st.phase !== 2) throw new Error('nothing to litigate yet');
      const p = U.clamp((stage.litigate && stage.litigate.p) || 0.3, 0, 1);
      const win = D.rng(run, stage, 'court').chance(p);
      D.effects(run, { days: 120, heat: 10, spend: (stage.litigate && stage.litigate.spend) || 0 });
      return E.finish(run, stage, win, true);
    },

    abandon(run, stage) { return E.finish(run, stage, false, false, true); },

    finish(run, stage, cleared, litigated, abandoned) {
      const st = run.st[stage.id];
      const min = E.minimal(run, stage);
      const cost = cleared ? E.cost(stage, st.offered) : 0;
      const res = { cleared, litigated: !!litigated, abandoned: !!abandoned, phase: st.phase, remedies: st.offered.slice(), cost, minCost: min.cost, minIds: min.ids, sev: Object.assign({}, st.sev) };
      const scale = stage.scale || Math.max(1, U.sum(stage.remedies.map((r) => r.cost)) / 2);
      let s = 15;
      if (cleared) s = U.clamp(100 - 60 * Math.max(0, cost - (litigated ? 0 : min.cost)) / scale - (st.phase === 2 ? 10 : 0) - (litigated ? 6 : 0), 40, 100);
      else if (abandoned) s = 35;
      run.deal.exec[stage.id] = s;
      st.done = true; st.result = res;
      run.deal.reg = res;
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      D.news(run, cleared ? stage.authority + ' clears the deal' + (cost ? ' with conditions' : '') : stage.authority + ' blocks the deal', cleared ? 'good' : 'bad');
      return Object.assign({ phase: st.phase }, res);
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      if (policy === 'coach') {
        (stage.intel || []).forEach((it) => E.intel(run, stage, it.id));
        const min = E.minimal(run, stage);
        E.submit(run, stage, min.ids || stage.remedies.map((r) => r.id));
        return;
      }
      const pickSet = () => stage.remedies.filter(() => run.policyRng.chance(0.45)).map((r) => r.id);
      const first = pickSet();
      E.submit(run, stage, first);
      if (st.done) return;
      const roll = run.policyRng.next();
      if (roll < 0.25) E.litigate(run, stage);
      else if (roll < 0.35) E.abandon(run, stage);
      else E.submit(run, stage, Array.from(new Set(first.concat(pickSet(), pickSet()))));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
