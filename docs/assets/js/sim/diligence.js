/* ---------------------------------------------------------------------
 * diligence.js: the data room.
 *
 * The player has a fixed number of analyst-days. Each workstream can be dug
 * to depth 1, 2 or 3 (costing 1, 2 and 3 days). Issues are hidden at a
 * given workstream and depth; whether an issue really exists is drawn from
 * the seed. Found issues adjust the value estimate and become bargaining
 * chips; issues that exist but are not found surface after closing.
 *
 * stage: { days, streams:[{id,name,desc}], issues:[{id,stream,depth,kind:'flag'|'gem',
 *          title,text,impact,chip,p,after}], hints:[{who,text}], coachPlan:[streamId...] }
 * writes run.deal.dd = { found, missed, adjust, chips, hidden, daysUsed }
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;
  const COST = [1, 2, 3];

  const E = WR.sim.diligence = {
    COST,

    init(run, stage) {
      const rng = D.rng(run, stage);
      const present = {};
      stage.issues.forEach((it) => { present[it.id] = rng.chance(it.p === undefined ? 1 : it.p); });
      run.st[stage.id] = {
        daysLeft: stage.days, depth: Object.fromEntries(stage.streams.map((s) => [s.id, 0])),
        present, found: [], log: [], closed: false,
      };
    },

    nextCost(run, stage, streamId) {
      const d = run.st[stage.id].depth[streamId];
      return d >= 3 ? null : COST[d];
    },

    canDig(run, stage, streamId) {
      const st = run.st[stage.id];
      const c = E.nextCost(run, stage, streamId);
      return !st.closed && c !== null && c <= st.daysLeft;
    },

    /** Dig one level deeper in a workstream. Returns { depth, cost, findings: [issue...] }. */
    dig(run, stage, streamId) {
      const st = run.st[stage.id];
      if (!E.canDig(run, stage, streamId)) throw new Error('cannot dig ' + streamId);
      const cost = E.nextCost(run, stage, streamId);
      st.daysLeft -= cost;
      st.depth[streamId] += 1;
      const depth = st.depth[streamId];
      const findings = stage.issues.filter((it) => it.stream === streamId && it.depth === depth && st.present[it.id]);
      findings.forEach((it) => st.found.push(it.id));
      const entry = { stream: streamId, depth, cost, findings: findings.map((f) => f.id) };
      st.log.push(entry);
      return { depth, cost, findings };
    },

    /** Running view of what the player knows. */
    summary(run, stage) {
      const st = run.st[stage.id];
      const found = stage.issues.filter((it) => st.found.includes(it.id));
      return {
        daysLeft: st.daysLeft, daysUsed: stage.days - st.daysLeft,
        found,
        adjust: U.sum(found.map((f) => f.impact || 0)),
        chips: U.sum(found.filter((f) => f.kind !== 'gem').map((f) => f.chip || 0)),
      };
    },

    close(run, stage) {
      const st = run.st[stage.id];
      if (st.closed) return run.deal.dd;
      st.closed = true;
      const s = E.summary(run, stage);
      const real = stage.issues.filter((it) => st.present[it.id]);
      const missed = real.filter((it) => !st.found.includes(it.id));
      const weightAll = U.sum(real.map((it) => Math.abs(it.impact || 0)));
      const weightFound = U.sum(s.found.map((it) => Math.abs(it.impact || 0)));
      run.deal.dd = {
        found: s.found.map((f) => f.id), missed: missed.map((f) => f.id),
        adjust: s.adjust, chips: s.chips,
        hidden: U.sum(missed.map((f) => f.impact || 0)),
        daysUsed: s.daysUsed,
      };
      run.deal.exec[stage.id] = weightAll > 0 ? 35 + 65 * weightFound / weightAll : 85;
      D.effects(run, { days: s.daysUsed });
      (stage.teachesOnClose || []).forEach((cid) => D.teach(run, cid));
      s.found.forEach((f) => (f.teaches || []).forEach((cid) => D.teach(run, cid)));
      return run.deal.dd;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      if (policy === 'coach') {
        (stage.coachPlan || []).forEach((sid) => { if (E.canDig(run, stage, sid)) E.dig(run, stage, sid); });
      } else {
        let guard = 0;
        while (st.daysLeft > 0 && guard++ < 50) {
          const open = stage.streams.filter((s) => E.canDig(run, stage, s.id));
          if (!open.length || run.policyRng.chance(0.12)) break;
          E.dig(run, stage, run.policyRng.pick(open).id);
        }
      }
      E.close(run, stage);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
