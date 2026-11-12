/* ---------------------------------------------------------------------
 * lbo.js: structuring a leveraged buyout.
 *
 * The player chooses senior and junior leverage, the hold period and up to
 * a few value-creation levers. The projection is the tested LBO engine from
 * the Valuation & Deal Lab (vendor/vdl-engine.js). The plan case assumes
 * the levers work and the world behaves; the realised case draws a macro
 * scenario and rolls each lever. Too much debt in a downturn breaches the
 * covenant and the lenders take the keys.
 *
 * stage: { base:{revenue,ebitMargin,daPct,capexPct,nwcPct,tax,growth}, entryEv (number or fn(run)),
 *          exitMultiple, covenant, maxLevers, senior:[min,max,def], sub:[min,max,def], hold:[min,max,def],
 *          rates:{senior,sub}, levers:[{id,name,desc,growth,margin,capex,p,q,teaches}],
 *          scenarios:[{id,name,w,growth,exit,rate,text}], coach:{senior,sub,hold,levers:[]} }
 * writes run.deal.lbo
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;
  const engine = () => root.VDLEngine;

  const E = WR.sim.lbo = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const total = U.sum(stage.scenarios.map((s) => s.w));
      let x = rng.next() * total, scenario = stage.scenarios[stage.scenarios.length - 1].id;
      for (const s of stage.scenarios) { x -= s.w; if (x <= 0) { scenario = s.id; break; } }
      const worked = {};
      stage.levers.forEach((l) => { worked[l.id] = rng.chance(l.p === undefined ? 0.7 : l.p); });
      run.st[stage.id] = {
        scenario, worked, done: false, result: null,
        plan: { senior: stage.senior[2], sub: stage.sub[2], hold: stage.hold[2], levers: [] },
      };
    },

    entryEv(run, stage) { return U.val(stage.entryEv, run); },
    ebitda(stage) { return stage.base.revenue * (stage.base.ebitMargin + stage.base.daPct); },

    args(run, stage, plan, real) {
      const st = run.st[stage.id];
      const b = stage.base;
      const sc = real ? stage.scenarios.find((s) => s.id === st.scenario) : { growth: 0, exit: 0, rate: 0 };
      let growth = b.growth + (sc.growth || 0), margin = b.ebitMargin, capex = b.capexPct;
      stage.levers.filter((l) => plan.levers.includes(l.id)).forEach((l) => {
        capex += l.capex || 0;
        if (real && !st.worked[l.id]) return;
        growth += l.growth || 0; margin += l.margin || 0;
      });
      const rates = stage.rates || { senior: 0.09, sub: 0.13 };
      return {
        entry_ev: E.entryEv(run, stage), ebitda_ltm: E.ebitda(stage), fee_pct: 0.02,
        senior_x: plan.senior, sub_x: plan.sub, hold_years: plan.hold, n_years: Math.max(plan.hold, 7),
        growth_start: growth, growth_terminal: Math.min(growth, 0.05), high_growth_years: 5,
        margin_start: b.ebitMargin, margin_target: margin, margin_converge_years: 3,
        capex_pct: capex, capex_pct_terminal: capex, tax_rate: b.tax, da_pct: b.daPct, nwc_pct: b.nwcPct,
        base_revenue: b.revenue, senior_amort_pct: 0.05, senior_rate: rates.senior + (sc.rate || 0), sub_rate: rates.sub + (sc.rate || 0),
        sweep_pct: 0.75, interest_on_average: true, exit_multiple: stage.exitMultiple + (sc.exit || 0),
      };
    },

    /** Run the engine; returns a compact summary or { error } when the structure is impossible. */
    project(run, stage, plan, real) {
      try {
        const r = engine().runLbo(E.args(run, stage, plan, real));
        const cover = Math.min.apply(null, r.rows.map((x) => (x.interest_cover === null ? 99 : x.interest_cover)));
        return {
          irr: r.irr, moic: r.moic, equity: r.sources_uses.sponsor_equity, debt: r.sources_uses.senior_debt + r.sources_uses.sub_debt,
          leverage: r.sources_uses.leverage_x, entryMultiple: r.sources_uses.entry_multiple, exitEquity: r.exit_equity,
          minCover: cover, shortfall: r.liquidity_shortfall, breach: r.liquidity_shortfall || cover < (stage.covenant || 1.5),
          rows: r.rows.map((x) => ({ year: x.year, revenue: x.revenue, ebitda: x.ebitda, debt: x.total_debt, cover: x.interest_cover, cfads: x.cfads })),
          attribution: r.attribution,
        };
      } catch (e) {
        return { error: e.message || String(e) };
      }
    },

    setPlan(run, stage, patch) {
      const st = run.st[stage.id];
      if (st.done) throw new Error('structure locked');
      const p = Object.assign({}, st.plan, patch);
      p.senior = U.clamp(p.senior, stage.senior[0], stage.senior[1]);
      p.sub = U.clamp(p.sub, stage.sub[0], stage.sub[1]);
      p.hold = Math.round(U.clamp(p.hold, stage.hold[0], stage.hold[1]));
      p.levers = (p.levers || []).filter((id) => stage.levers.some((l) => l.id === id)).slice(0, stage.maxLevers || 3);
      st.plan = p;
      return p;
    },

    lock(run, stage) {
      const st = run.st[stage.id];
      if (st.done) return st.result;
      const planCase = E.project(run, stage, st.plan, false);
      if (planCase.error) throw new Error('structure does not work: ' + planCase.error);
      let real = E.project(run, stage, st.plan, true);
      if (real.error) real = { irr: null, moic: 0, breach: true, shortfall: true, minCover: 0, rows: [] };
      let irr = real.irr, moic = real.moic;
      if (real.breach) { moic = Math.max(0, real.moic * (real.shortfall ? 0.1 : 0.45)); irr = moic > 0 ? Math.pow(moic, 1 / st.plan.hold) - 1 : -1; }
      if (irr === null) irr = -1;
      const scenario = stage.scenarios.find((s) => s.id === st.scenario);
      const res = {
        plan: Object.assign({}, st.plan), planCase: { irr: planCase.irr, moic: planCase.moic }, irr, moic,
        breach: !!real.breach, wiped: !!real.shortfall, minCover: real.minCover, scenario: scenario.id, scenarioName: scenario.name, scenarioText: scenario.text,
        worked: stage.levers.filter((l) => st.plan.levers.includes(l.id)).map((l) => ({ id: l.id, name: l.name, ok: st.worked[l.id] })),
        equity: planCase.equity, attribution: real.attribution || null,
      };
      const pts = [[-1, 5], [0, 30], [0.08, 50], [0.15, 70], [0.2, 85], [0.25, 96], [0.4, 100]];
      let s = 5;
      for (let i = 1; i < pts.length; i++) {
        if (irr <= pts[i][0]) { s = U.lerp(pts[i - 1][1], pts[i][1], (irr - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); break; }
        s = pts[i][1];
      }
      run.deal.exec[stage.id] = U.clamp(s, 0, 100);
      stage.levers.filter((l) => st.plan.levers.includes(l.id)).forEach((l) => {
        (l.teaches || []).forEach((c) => D.teach(run, c));
        run.deal.judgment.push({ stage: stage.id, title: stage.title, option: l.id, label: l.name, q: l.q === undefined ? 2 : l.q, coach: l.coach || '' });
      });
      st.done = true; st.result = res;
      run.deal.lbo = res;
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      return res;
    },

    auto(run, stage, policy) {
      if (policy === 'coach') E.setPlan(run, stage, stage.coach);
      else {
        const r = run.policyRng;
        E.setPlan(run, stage, {
          senior: U.round(r.range(stage.senior[0], stage.senior[1]), 1), sub: U.round(r.range(stage.sub[0], stage.sub[1]), 1),
          hold: r.int(stage.hold[0], stage.hold[1]), levers: r.shuffle(stage.levers.map((l) => l.id)).slice(0, r.int(0, stage.maxLevers || 3)),
        });
        if (E.project(run, stage, run.st[stage.id].plan, false).error) E.setPlan(run, stage, { senior: stage.senior[0], sub: stage.sub[0] });
      }
      E.lock(run, stage);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
