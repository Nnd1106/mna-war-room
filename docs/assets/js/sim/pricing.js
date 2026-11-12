/* ---------------------------------------------------------------------
 * pricing.js: the valuation console.
 *
 * The player decides how much of each claimed synergy to believe (credit
 * 0-100%) and sets a walk-away price. The engine knows the truth: the real
 * stand-alone value (management case, plus every issue that really exists,
 * plus a little noise) and the factor by which each synergy will actually
 * come in before integration.
 *
 * All values are totals in the file's money unit (equity value).
 *
 * stage: { market, standalone:{mid, noise}, cap, integrationCost,
 *          synergies:[{id,name,kind:'cost'|'revenue'|'capital',runRate,range:[lo,hi],coach}],
 *          ddStage: id of the diligence stage whose findings adjust the estimate }
 * writes run.deal.pricing and run.deal.walkAway
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  const E = WR.sim.pricing = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const factors = {};
      stage.synergies.forEach((s) => { factors[s.id] = rng.range(s.range[0], s.range[1]); });
      const noise = rng.normal(0, stage.standalone.noise === undefined ? 0.03 : stage.standalone.noise);
      const credits = Object.fromEntries(stage.synergies.map((s) => [s.id, s.kind === 'revenue' ? 0.5 : 0.75]));
      run.st[stage.id] = { factors, noise: U.clamp(noise, -0.08, 0.08), credits, walkAway: null, locked: false };
    },

    /** Sum of the value impacts of every issue that truly exists in the linked data room. */
    issueTruth(run, stage) {
      const ddStage = run.file.stages.find((s) => s.id === stage.ddStage);
      if (!ddStage) return 0;
      if (!run.st[ddStage.id]) { run.st[ddStage.id] = {}; WR.sim.diligence.init(run, ddStage); }
      const present = run.st[ddStage.id].present;
      return U.sum(ddStage.issues.filter((it) => present[it.id]).map((it) => it.impact || 0));
    },

    /** Truth, for scoring and debrief only. */
    truth(run, stage) {
      const st = run.st[stage.id];
      const standalone = stage.standalone.mid * (1 + st.noise) + E.issueTruth(run, stage);
      const synergyPV = U.sum(stage.synergies.map((s) => s.runRate * st.factors[s.id] * stage.cap));
      return { standalone, synergyPV, factors: st.factors, breakEven: standalone + synergyPV - stage.integrationCost };
    },

    /** What the player can see and compute. */
    view(run, stage, credits) {
      const st = run.st[stage.id];
      const c = credits || st.credits;
      const known = run.deal.dd ? run.deal.dd.adjust : 0;
      const standalone = stage.standalone.mid + known;
      const rows = stage.synergies.map((s) => ({
        id: s.id, name: s.name, kind: s.kind, runRate: s.runRate, credit: c[s.id],
        claimedPV: s.runRate * stage.cap, creditedPV: s.runRate * c[s.id] * stage.cap,
      }));
      const synergyPV = U.sum(rows.map((r) => r.creditedPV));
      const breakEven = standalone + synergyPV - stage.integrationCost;
      return {
        market: stage.market, standalone, known, rows, synergyPV,
        claimedPV: U.sum(rows.map((r) => r.claimedPV)), integrationCost: stage.integrationCost,
        breakEven, premiumAtBreakEven: breakEven / stage.market - 1,
        // a disciplined bidder keeps a share of the synergies for its own shareholders
        suggested: standalone + 0.5 * synergyPV - stage.integrationCost,
      };
    },

    setCredit(run, stage, synergyId, credit) {
      const st = run.st[stage.id];
      if (st.locked) throw new Error('pricing locked');
      st.credits[synergyId] = U.clamp(credit, 0, 1);
    },

    /** Lock in the model and the walk-away price. */
    lock(run, stage, walkAway) {
      const st = run.st[stage.id];
      if (st.locked) return run.deal.pricing;
      const v = E.view(run, stage);
      const t = E.truth(run, stage);
      st.walkAway = walkAway;
      st.locked = true;
      run.deal.walkAway = walkAway;
      run.deal.pricing = {
        stage: stage.id, market: stage.market, estStandalone: v.standalone, believedPV: v.synergyPV,
        breakEven: v.breakEven, walkAway, credits: Object.assign({}, st.credits),
      };
      // calibration: how close the player's break-even is to the true one, and whether
      // the walk-away sits at or below the truth (above it is how value gets destroyed)
      const err = (walkAway - t.breakEven) / t.breakEven;
      let score = 100 - Math.abs(v.breakEven / t.breakEven - 1) * 220;
      if (err > 0) score -= err * 260;
      run.deal.exec[stage.id] = U.clamp(score, 0, 100);
      (stage.teachesOnLock || []).forEach((cid) => D.teach(run, cid));
      return run.deal.pricing;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      if (policy === 'coach') {
        stage.synergies.forEach((s) => { st.credits[s.id] = s.coach === undefined ? (s.kind === 'revenue' ? 0.25 : s.kind === 'capital' ? 0.5 : 0.75) : s.coach; });
        E.lock(run, stage, E.view(run, stage).suggested);
      } else {
        stage.synergies.forEach((s) => { st.credits[s.id] = run.policyRng.pick([0, 0.25, 0.5, 0.75, 1]); });
        const v = E.view(run, stage);
        E.lock(run, stage, v.breakEven * run.policyRng.range(0.85, 1.25));
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
