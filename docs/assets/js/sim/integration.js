/* ---------------------------------------------------------------------
 * integration.js: the first hundred days after closing.
 *
 * Three gauges: synergy capture (how much of the plan is locked in), morale
 * and customer retention. Each phase the player spends limited management
 * capacity on initiatives; some need earlier groundwork, some carry a risk.
 * Then events fire depending on the state of the gauges: neglect people and
 * the best ones leave; rush systems and customers feel it.
 *
 * stage: { phases:[name], capacity, start:{capture,morale,customers},
 *          initiatives:[{id,name,track,desc,cost,capture,morale,customers,from,until,
 *                        requires:[],risk:{p,text,capture,morale,customers},q,teaches}],
 *          events:[{id,phase,p,when,text,good,fx:{capture,morale,customers}}] }
 * writes run.deal.integ
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;
  const KEYS = ['capture', 'morale', 'customers'];

  function apply(st, fx) {
    if (!fx) return;
    KEYS.forEach((k) => { if (fx[k]) st[k] = U.clamp(st[k] + fx[k], 0, 100); });
  }

  const E = WR.sim.integration = {
    init(run, stage) {
      const s = Object.assign({ capture: 0, morale: 60, customers: 80 }, U.val(stage.start, run));
      run.st[stage.id] = { phase: 0, capture: s.capture, morale: s.morale, customers: s.customers, done: [], log: [], closed: false, result: null };
    },

    capacity: (stage) => stage.capacity || 3,

    available(run, stage) {
      const st = run.st[stage.id];
      return stage.initiatives.filter((i) => !st.done.includes(i.id) && (i.from || 0) <= st.phase && (i.until === undefined || i.until >= st.phase))
        .map((i) => Object.assign({}, i, { ready: (i.requires || []).every((r) => st.done.includes(r)) }));
    },

    /** Commit this phase's initiatives. Returns what happened. */
    commit(run, stage, ids) {
      const st = run.st[stage.id];
      if (st.closed) throw new Error('integration closed');
      const avail = E.available(run, stage);
      const chosen = ids.map((id) => avail.find((i) => i.id === id));
      if (chosen.some((c) => !c || !c.ready)) throw new Error('initiative not available');
      if (U.sum(chosen.map((c) => c.cost || 1)) > E.capacity(stage)) throw new Error('over capacity');
      const rng = D.rng(run, stage, 'p' + st.phase);
      const entry = { phase: st.phase, name: stage.phases[st.phase], chosen: ids.slice(), risks: [], events: [], before: { capture: st.capture, morale: st.morale, customers: st.customers } };
      chosen.forEach((c) => {
        apply(st, c);
        st.done.push(c.id);
        (c.teaches || []).forEach((cid) => D.teach(run, cid));
        run.deal.judgment.push({ stage: stage.id, title: stage.title + ', ' + stage.phases[st.phase], option: c.id, label: c.name, q: c.q === undefined ? 2 : c.q, coach: c.coach || '' });
        const hit = c.risk ? rng.chance(c.risk.p) : false;
        if (hit) { apply(st, c.risk); entry.risks.push({ id: c.id, text: c.risk.text }); }
      });
      if (!chosen.length) apply(st, { morale: -3, customers: -2 });
      (stage.events || []).filter((e) => e.phase === st.phase || e.phase === undefined).forEach((e) => {
        const roll = rng.next();
        if (e.when && !e.when(st)) return;
        if (roll < (e.p === undefined ? 1 : e.p)) { apply(st, e.fx); entry.events.push({ id: e.id, text: e.text, good: !!e.good }); }
      });
      entry.after = { capture: st.capture, morale: st.morale, customers: st.customers };
      st.log.push(entry);
      st.phase += 1;
      D.effects(run, { days: 25 });
      if (st.phase >= stage.phases.length) E.close(run, stage);
      return entry;
    },

    close(run, stage) {
      const st = run.st[stage.id];
      if (st.closed) return st.result;
      let factor = (st.capture / 100) * (0.6 + 0.4 * st.customers / 100);
      if (st.morale < 40) factor *= 0.85;
      const res = { capture: st.capture, morale: st.morale, customers: st.customers, factor, done: st.done.slice() };
      run.deal.exec[stage.id] = U.clamp(0.55 * st.capture + 0.2 * st.morale + 0.25 * st.customers + 8, 0, 100);
      D.effects(run, { people: Math.round((st.morale - 60) / 3) });
      st.closed = true; st.result = res;
      run.deal.integ = res;
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      return res;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      let guard = 0;
      while (!st.closed && guard++ < 12) {
        let left = E.capacity(stage);
        const picks = [];
        let pool = E.available(run, stage).filter((i) => i.ready);
        if (policy === 'coach') pool.sort((a, b) => (b.q === undefined ? 2 : b.q) - (a.q === undefined ? 2 : a.q));
        else pool = run.policyRng.shuffle(pool);
        pool.forEach((i) => {
          const c = i.cost || 1;
          if (c > left) return;
          if (policy === 'coach' && (i.q === undefined ? 2 : i.q) < 2) return;
          if (policy !== 'coach' && run.policyRng.chance(0.25)) return;
          picks.push(i.id); left -= c;
        });
        E.commit(run, stage, picks);
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
