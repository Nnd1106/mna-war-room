/* ---------------------------------------------------------------------
 * director.js: runs a Deal File as a sequence of stages.
 *
 * A run is plain data: { file, seed, deal, st, idx }. Every stage type is an
 * engine in WR.sim[type] with init(run, stage) and auto(run, stage, policy).
 * Each stage draws from its own RNG seeded by (run seed, stage id), so the
 * hidden truth of a deal does not depend on the path the player takes; the
 * debrief replays the same seed with the coach policy to show the road not
 * taken.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const METERS = ['board', 'street', 'people', 'heat'];

  const D = WR.sim.director = {
    METERS,

    create(file, seed) {
      const run = {
        file, seed,
        deal: {
          meters: Object.assign({ board: 60, street: 55, people: 60, heat: 20 }, file.start && file.start.meters),
          flags: {}, days: 0, spend: 0,
          judgment: [], concepts: [], moments: [], exec: {}, news: [],
          ended: null,
        },
        st: {}, idx: -1, done: false,
      };
      run.truth = file.truth ? file.truth(WR.rng.sub(seed, 'truth'), file) : {};
      D.next(run);
      return run;
    },

    rng(run, stage, label) {
      return WR.rng.sub(run.seed, stage.id + (label ? ':' + label : ''));
    },

    stage(run) { return run.done ? null : run.file.stages[run.idx]; },

    /** Initialise the current stage's state on first entry. */
    enter(run) {
      const stage = D.stage(run);
      if (!stage) return null;
      if (!run.st[stage.id]) {
        const engine = WR.sim[stage.type];
        if (!engine) throw new Error('unknown stage type ' + stage.type);
        run.st[stage.id] = {};
        engine.init(run, stage);
        (stage.teaches || []).forEach((c) => D.teach(run, c));
      }
      return stage;
    },

    /** Move to the next applicable stage (or to a named one). */
    next(run, gotoId) {
      const stages = run.file.stages;
      if (run.deal.ended) { run.done = true; return null; }
      let i = gotoId ? stages.findIndex((s) => s.id === gotoId) : run.idx + 1;
      if (gotoId && i < 0) throw new Error('unknown stage ' + gotoId);
      while (i < stages.length && stages[i].when && !stages[i].when(run)) i++;
      if (i >= stages.length) { run.done = true; run.idx = stages.length; return null; }
      run.idx = i;
      return D.enter(run);
    },

    /** End the deal early with an outcome tag (walked, collapsed, blocked ...). */
    end(run, tag) { run.deal.ended = tag; run.done = true; },

    effects(run, fx) {
      if (!fx) return;
      const m = run.deal.meters;
      METERS.forEach((k) => { if (fx[k]) m[k] = U.clamp(m[k] + fx[k], 0, 100); });
      if (fx.days) run.deal.days += fx.days;
      if (fx.spend) run.deal.spend += fx.spend;
    },

    flags(run, set) { if (set) Object.assign(run.deal.flags, set); },

    teach(run, conceptId) {
      if (conceptId && !run.deal.concepts.includes(conceptId)) run.deal.concepts.push(conceptId);
    },

    moment(run, m) { run.deal.moments.push(m); },
    news(run, headline, tone) { run.deal.news.push({ headline, tone: tone || 'neutral', day: run.deal.days }); },

    verdict(run) {
      const v = run.file.resolve(run, WR.sim.score);
      v.seed = run.seed;
      v.concepts = run.deal.concepts.slice();
      v.moments = run.deal.moments.slice();
      v.meters = Object.assign({}, run.deal.meters);
      return v;
    },

    /** Play a whole file headlessly with a policy ('coach' or 'random'). */
    simulate(file, seed, policy, policySeed) {
      const run = D.create(file, seed);
      run.policyRng = WR.rng.sub(policySeed || seed, 'policy:' + policy);
      let guard = 0;
      while (!run.done) {
        const stage = D.stage(run);
        WR.sim[stage.type].auto(run, stage, policy);
        if (!run.done && D.stage(run) === stage) D.next(run);
        if (++guard > 200) throw new Error('simulate: stage loop did not terminate in ' + file.id);
      }
      return { run, verdict: D.verdict(run) };
    },
  };

  /* ---------------- brief: narrative-only stage ---------------- */
  WR.sim.brief = {
    init() {},
    auto() {},
  };

  /* ---------------- decision ---------------- */
  WR.sim.decision = {
    init(run, stage) { run.st[stage.id] = { chosen: null, result: null }; },

    q(opt, run) { const q = U.val(opt.q, run); return q === undefined ? 2 : q; },

    options(run, stage) {
      return stage.options.filter((o) => !o.requires || o.requires(run));
    },

    /** Apply an option. Returns { option, text, rolled } for display. */
    choose(run, stage, optionId) {
      const st = run.st[stage.id];
      if (st.chosen) throw new Error('decision already made: ' + stage.id);
      const opt = stage.options.find((o) => o.id === optionId);
      if (!opt || (opt.requires && !opt.requires(run))) throw new Error('option not available: ' + optionId);
      let text = U.val(opt.outcome, run) || '';
      let rolled = null;
      D.effects(run, opt.effects);
      D.flags(run, opt.set);
      if (opt.roll) {
        const p = U.clamp(U.val(opt.roll.p, run), 0, 1);
        const win = D.rng(run, stage, opt.id).chance(p);
        const branch = win ? opt.roll.win : opt.roll.lose;
        rolled = { p, win };
        D.effects(run, branch.effects);
        D.flags(run, branch.set);
        text = (text ? text + ' ' : '') + (U.val(branch.text, run) || '');
        if (branch.end) D.end(run, branch.end);
        if (branch.news) D.news(run, branch.news, win ? 'good' : 'bad');
      }
      (opt.teaches || []).forEach((cid) => D.teach(run, cid));
      if (opt.news) D.news(run, U.val(opt.news, run), opt.newsTone);
      run.deal.judgment.push({ stage: stage.id, title: stage.title, option: opt.id, label: opt.label, q: WR.sim.decision.q(opt, run), coach: opt.coach || '' });
      st.chosen = opt.id;
      st.result = { option: opt, text, rolled };
      if (opt.end) D.end(run, opt.end);
      st.goto = opt.goto || null;
      return st.result;
    },

    auto(run, stage, policy) {
      const opts = WR.sim.decision.options(run, stage);
      let pick;
      if (policy === 'coach') pick = opts.slice().sort((a, b) => WR.sim.decision.q(b, run) - WR.sim.decision.q(a, run))[0];
      else pick = run.policyRng.pick(opts);
      WR.sim.decision.choose(run, stage, pick.id);
      const goto = run.st[stage.id].goto;
      if (!run.done && goto) D.next(run, goto);
    },
  };

  /* ---------------- scoring helpers shared by every file ---------------- */
  const GRADES = [[90, 'A+'], [82, 'A'], [74, 'B+'], [66, 'B'], [58, 'C+'], [50, 'C'], [40, 'D'], [0, 'F']];
  WR.sim.score = {
    letter: (x) => GRADES.find(([min]) => x >= min)[1],
    /** Average decision quality, 0-100. */
    judgment(run) {
      const j = run.deal.judgment;
      return j.length ? U.mean(j.map((x) => x.q)) / 3 * 100 : 60;
    },
    execution(run) {
      const v = Object.values(run.deal.exec);
      return v.length ? U.mean(v) : 60;
    },
    stakeholders(run) {
      const m = run.deal.meters;
      return U.mean([m.board, m.street, m.people, 100 - m.heat]);
    },
    /** Combine the five dimensions into a verdict skeleton. */
    assemble(run, parts) {
      const dims = {
        strategy: U.clamp(parts.strategy === undefined ? WR.sim.score.judgment(run) : parts.strategy, 0, 100),
        price: U.clamp(parts.price, 0, 100),
        execution: U.clamp(parts.execution === undefined ? WR.sim.score.execution(run) : parts.execution, 0, 100),
        stakeholders: U.clamp(parts.stakeholders === undefined ? WR.sim.score.stakeholders(run) : parts.stakeholders, 0, 100),
        risk: U.clamp(parts.risk, 0, 100),
      };
      const overall = 0.22 * dims.strategy + 0.26 * dims.price + 0.22 * dims.execution + 0.15 * dims.stakeholders + 0.15 * dims.risk;
      const diff = run.file.difficulty || 2;
      return {
        dims, overall,
        grades: Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, WR.sim.score.letter(v)])),
        grade: WR.sim.score.letter(overall),
        xp: Math.round(overall * (0.8 + 0.2 * diff)),
        stars: overall >= 82 ? 3 : overall >= 62 ? 2 : overall >= 42 ? 1 : 0,
      };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
