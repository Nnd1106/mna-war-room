/* ---------------------------------------------------------------------
 * vote.js: winning (or defeating) a shareholder vote, bloc by bloc.
 *
 * Each bloc has a lean between 0 and 1. Institutions with block:true vote
 * their whole holding one way; dispersed holders split in proportion. The
 * true lean is the published lean plus noise the player cannot see unless a
 * proxy solicitor is hired. A limited number of campaign actions move blocs
 * through what each one cares about.
 *
 * stage: { question, threshold, want:'pass'|'fail', time, noise,
 *          blocs:[{id,name,pct,lean,block,desc,cares:[tag]}],
 *          actions:[{id,name,desc,cost,sway:{blocIdOrTag:delta},effects,set,reveals,requires,q,teaches}],
 *          mods:[{when,sway,text}] }
 * writes run.deal.vote[stage.id]
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  function swayFor(bloc, sway) {
    let d = sway[bloc.id] || 0;
    (bloc.cares || []).forEach((t) => { d += sway[t] || 0; });
    if (sway.all) d += sway.all;
    return d;
  }

  const E = WR.sim.vote = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const est = {}, real = {}, notes = [];
      stage.blocs.forEach((b) => { est[b.id] = b.lean; real[b.id] = b.lean + rng.range(-1, 1) * (stage.noise === undefined ? 0.08 : stage.noise); });
      (stage.mods || []).forEach((m) => {
        if (!m.when(run)) return;
        stage.blocs.forEach((b) => { const d = swayFor(b, m.sway); est[b.id] += d; real[b.id] += d; });
        notes.push(m.text);
      });
      run.st[stage.id] = { est, real, notes, timeLeft: stage.time, taken: [], polled: false, done: false, result: null };
    },

    actions(run, stage) {
      const st = run.st[stage.id];
      return stage.actions.filter((a) => !st.taken.includes(a.id) && (!a.requires || a.requires(run)))
        .map((a) => Object.assign({}, a, { affordable: (a.cost || 1) <= st.timeLeft }));
    },

    tally(stage, lean) {
      let forV = 0, total = 0;
      const by = {};
      stage.blocs.forEach((b) => {
        const l = U.clamp(lean[b.id], 0, 1);
        const share = b.block ? (l >= 0.5 ? 1 : 0) : l;
        by[b.id] = share * b.pct; forV += by[b.id]; total += b.pct;
      });
      return { forPct: 100 * forV / total, by };
    },

    /** The player's forecast from what is visible (true leans once polled). */
    forecast(run, stage) {
      const st = run.st[stage.id];
      return E.tally(stage, st.polled ? st.real : st.est).forPct;
    },

    act(run, stage, actionId) {
      const st = run.st[stage.id];
      const a = E.actions(run, stage).find((x) => x.id === actionId);
      if (st.done || !a || !a.affordable) throw new Error('action not available: ' + actionId);
      st.timeLeft -= (a.cost || 1);
      st.taken.push(a.id);
      const moved = {};
      stage.blocs.forEach((b) => { const d = swayFor(b, a.sway || {}); if (d) { st.est[b.id] += d; st.real[b.id] += d; moved[b.id] = d; } });
      if (a.reveals) st.polled = true;
      D.effects(run, a.effects); D.flags(run, a.set);
      D.effects(run, { days: 5 * (a.cost || 1) });
      (a.teaches || []).forEach((c) => D.teach(run, c));
      run.deal.judgment.push({ stage: stage.id, title: stage.title, option: a.id, label: a.name, q: a.q === undefined ? 2 : a.q, coach: a.coach || '' });
      return { action: a, moved };
    },

    call(run, stage) {
      const st = run.st[stage.id];
      if (st.done) return st.result;
      const t = E.tally(stage, st.real);
      const passed = t.forPct >= stage.threshold;
      const success = passed === (stage.want !== 'fail');
      const margin = Math.abs(t.forPct - stage.threshold);
      const res = { forPct: t.forPct, by: t.by, passed, success, threshold: stage.threshold, taken: st.taken.slice() };
      run.deal.exec[stage.id] = success ? U.clamp(70 + margin * 1.5, 0, 100) : U.clamp(50 - margin * 2, 15, 50);
      st.done = true; st.result = res;
      run.deal.vote = run.deal.vote || {};
      run.deal.vote[stage.id] = res;
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      return res;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      const sign = stage.want === 'fail' ? -1 : 1;
      let guard = 0;
      while (st.timeLeft > 0 && guard++ < 20) {
        const open = E.actions(run, stage).filter((a) => a.affordable);
        if (!open.length) break;
        let pick;
        if (policy === 'coach') {
          const base = E.tally(stage, st.real).forPct;
          const gain = (a) => {
            const lean = Object.assign({}, st.real);
            stage.blocs.forEach((b) => { lean[b.id] += swayFor(b, a.sway || {}); });
            return sign * (E.tally(stage, lean).forPct - base) / (a.cost || 1);
          };
          const ranked = open.map((a) => ({ a, g: gain(a) })).sort((x, y) => y.g - x.g);
          if (ranked[0].g <= 0.01) break;
          pick = ranked[0].a;
        } else {
          if (run.policyRng.chance(0.15)) break;
          pick = run.policyRng.pick(open);
        }
        E.act(run, stage, pick.id);
      }
      E.call(run, stage);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
