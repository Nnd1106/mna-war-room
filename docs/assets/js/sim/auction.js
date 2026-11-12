/* ---------------------------------------------------------------------
 * auction.js: a banker-run sale process against rule-based rival bidders.
 *
 * Every rival has a private value for the asset and a streak of hubris; its
 * ceiling is value * (1 + hubris). Rounds are simultaneous: everyone still in
 * must beat the standing high bid by the increment or drop. The last round
 * is sealed "best and final". Winning above what the asset is truly worth to
 * you is the winner's curse, and the debrief says so.
 *
 * stage: { open, increment, rounds, pricingStage,
 *          rivals:[{id,name,kind,blurb,value:[lo,hi],hubris:[lo,hi]}] }
 * writes run.deal.auction, run.deal.won, run.deal.price
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  const E = WR.sim.auction = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const max = {};
      stage.rivals.forEach((r) => {
        const value = rng.range(r.value[0], r.value[1]);
        max[r.id] = value * (1 + rng.range(r.hubris[0], r.hubris[1]));
      });
      run.st[stage.id] = {
        round: 1, high: U.val(stage.open, run), leader: null, active: stage.rivals.map((r) => r.id), max,
        playerIn: true, lastBid: null, log: [], done: false, result: null,
      };
    },

    rounds: (stage) => stage.rounds || 3,
    inc: (stage) => stage.increment || 0.02,
    minBid(run, stage) { return Math.ceil(run.st[stage.id].high * (1 + E.inc(stage))); },
    isFinal(run, stage) { return run.st[stage.id].round >= E.rounds(stage); },

    truth(run, stage) {
      const ps = run.file.stages.find((s) => s.id === stage.pricingStage);
      if (!ps) return null;
      if (!run.st[ps.id]) { run.st[ps.id] = {}; WR.sim.pricing.init(run, ps); }
      return WR.sim.pricing.truth(run, ps);
    },

    /** Play one round. amount = null means the player drops out. */
    bid(run, stage, amount) {
      const st = run.st[stage.id];
      if (st.done) throw new Error('auction over');
      const rng = D.rng(run, stage, 'r' + st.round);
      const min = E.minBid(run, stage);
      const final = E.isFinal(run, stage);
      if (amount !== null && amount < min) throw new Error('bid below minimum');
      if (amount === null) st.playerIn = false; else st.lastBid = amount;
      const report = { round: st.round, final, bids: [], tells: [] };
      if (st.playerIn) report.bids.push({ who: 'you', name: 'You', amount });
      else report.bids.push({ who: 'you', name: 'You', amount: null });
      const stillIn = [];
      stage.rivals.forEach((r) => {
        if (!st.active.includes(r.id)) return;
        const cap = st.max[r.id];
        const noise = rng.next();
        if (cap < min) { report.bids.push({ who: r.id, name: r.name, amount: null }); return; }
        const b = final ? Math.max(min, cap * (0.95 + 0.05 * noise)) : Math.min(cap, min * (1 + 0.05 * noise));
        const rounded = Math.round(b);
        report.bids.push({ who: r.id, name: r.name, amount: rounded });
        stillIn.push(r.id);
        if (!final && rounded >= 0.93 * cap && rng.chance(0.7)) report.tells.push(r.name + ' asked the banker for more time. Their committee is said to be uneasy at this level.');
      });
      st.active = stillIn;
      const live = report.bids.filter((b) => b.amount !== null).sort((a, b) => b.amount - a.amount || (a.who === 'you' ? 1 : -1));
      if (live.length) { st.high = live[0].amount; st.leader = live[0].who; }
      report.high = st.high; report.leader = st.leader;
      report.remaining = st.active.length + (st.playerIn ? 1 : 0);
      st.log.push(report);
      if (!st.playerIn) return E.finish(run, stage, report, true);
      if (final || report.remaining <= 1) return E.finish(run, stage, report, false);
      st.round += 1;
      return report;
    },

    finish(run, stage, report, dropped) {
      const st = run.st[stage.id];
      const caps = stage.rivals.map((r) => ({ id: r.id, name: r.name, max: st.max[r.id] })).sort((a, b) => b.max - a.max);
      let won = false, price, winner;
      if (dropped) {
        // the rivals fight on without you: the strongest wins just above the runner-up
        const top = caps[0], second = caps[1] ? caps[1].max : st.high;
        price = Math.round(Math.min(top.max, Math.max(st.high, second * 1.01)));
        winner = top.name;
      } else {
        won = st.leader === 'you';
        price = st.high;
        winner = won ? 'You' : stage.rivals.find((r) => r.id === st.leader).name;
      }
      const t = E.truth(run, stage);
      const be = t ? t.breakEven : null;
      const res = { won, dropped, price, winner, topRival: caps[0].max, caps, breakEven: be, rounds: st.round };
      if (be !== null) {
        if (won) {
          const surplus = (be - price) / be;
          let s = surplus >= 0 ? 70 + Math.min(30, surplus * 200) : Math.max(0, 55 + surplus * 400);
          const over = (price - res.topRival) / res.topRival;
          if (over > 0.03) s -= Math.min(15, over * 100);
          res.curse = surplus < 0;
          run.deal.exec[stage.id] = U.clamp(s, 0, 100);
        } else {
          res.rightToLose = price > be;
          run.deal.exec[stage.id] = res.rightToLose ? 88 : 50;
        }
      }
      st.done = true; st.result = res; report.result = res;
      run.deal.auction = res; run.deal.won = won;
      if (won) run.deal.price = price;
      else D.end(run, dropped ? 'walked' : 'lost');
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      D.news(run, won ? 'Sale process ends: your bid of ' + price + ' carries the day' : winner + ' wins the auction at ' + price, won ? 'good' : 'neutral');
      return report;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      const t = E.truth(run, stage);
      const limit = policy === 'coach'
        ? (run.deal.walkAway || (t ? t.breakEven * 0.9 : st.high * 1.2))
        : (t ? t.breakEven : st.high * 1.3) * run.policyRng.range(0.8, 1.35);
      let guard = 0;
      while (!st.done && guard++ < 20) {
        const min = E.minBid(run, stage);
        if (min > limit) { E.bid(run, stage, null); break; }
        if (policy === 'coach') E.bid(run, stage, E.isFinal(run, stage) ? Math.round(Math.max(min, Math.min(limit, st.high * 1.06))) : min);
        else E.bid(run, stage, Math.round(Math.min(Math.max(limit, min), min * run.policyRng.range(1, 1.08))));
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
