/* ---------------------------------------------------------------------
 * battle.js: a takeover fight played with tactic cards, from either side.
 *
 * One number decides it: the share of the register leaning towards the
 * bidder. Each round the other side has a move (you see a rumour, not the
 * move itself) and you play one card. A card that counters the move blunts
 * it. Cards cost war chest; some raise the price on the table; some end the
 * fight outright (a white knight, a settlement, a withdrawal).
 *
 * stage: { side:'attack'|'defend', rounds, support0, threshold, chest, price,
 *          cards:[{id,name,type,desc,cost,support:[lo,hi],bump,counters:[],effects,set,
 *                  once,ends,requires,q,teaches}],
 *          enemy:[{id,name,desc,tell,support:[lo,hi],bump,minRound,weight}] }
 * support numbers are always changes in the BIDDER's support.
 * writes run.deal.battle
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const D = WR.sim.director;

  const E = WR.sim.battle = {
    init(run, stage) {
      const rng = D.rng(run, stage);
      const st = run.st[stage.id] = {
        round: 1, support: U.val(stage.support0, run) + rng.range(-2, 2), chest: stage.chest, price: U.val(stage.price, run), price0: U.val(stage.price, run),
        played: [], enemyUsed: [], log: [], move: null, done: false, result: null,
      };
      st.move = E.drawMove(run, stage);
    },

    rounds: (stage) => stage.rounds || 5,
    threshold: (stage) => stage.threshold || 50,

    drawMove(run, stage) {
      const st = run.st[stage.id];
      const rng = D.rng(run, stage, 'move' + st.round);
      const pool = stage.enemy.filter((m) => !st.enemyUsed.includes(m.id) && (m.minRound || 1) <= st.round && (!m.requires || m.requires(run, st)));
      if (!pool.length) return null;
      const total = U.sum(pool.map((m) => m.weight || 1));
      let x = rng.next() * total;
      for (const m of pool) { x -= (m.weight || 1); if (x <= 0) return m.id; }
      return pool[pool.length - 1].id;
    },

    hand(run, stage) {
      const st = run.st[stage.id];
      return stage.cards.filter((c) => !(c.once !== false && st.played.includes(c.id)) && (!c.requires || c.requires(run, st)) && (c.from || 1) <= st.round)
        .map((c) => Object.assign({}, c, { affordable: (c.cost || 0) <= st.chest, q: c.q === undefined ? 2 : U.val(c.q, run, st) }));
    },

    play(run, stage, cardId) {
      const st = run.st[stage.id];
      if (st.done) throw new Error('battle over');
      const card = E.hand(run, stage).find((c) => c.id === cardId);
      if (!card || !card.affordable) throw new Error('card not playable: ' + cardId);
      const rng = D.rng(run, stage, 'res' + st.round);
      const move = stage.enemy.find((m) => m.id === st.move) || null;
      const countered = !!(move && (card.counters || []).includes(move.id));
      const mine = card.support ? rng.range(card.support[0], card.support[1]) : 0;
      let theirs = move ? rng.range(move.support[0], move.support[1]) : 0;
      if (countered) theirs *= 0.2;
      st.chest -= (card.cost || 0);
      if (card.bump) st.price *= (1 + card.bump);
      if (move && move.bump && !countered) st.price *= (1 + move.bump);
      const before = st.support;
      st.support = U.clamp(st.support + mine + theirs, 0, 100);
      st.played.push(card.id);
      if (move) st.enemyUsed.push(move.id);
      D.effects(run, card.effects); D.flags(run, card.set);
      D.effects(run, { days: 7, spend: card.cost || 0 });
      (card.teaches || []).forEach((c) => D.teach(run, c));
      run.deal.judgment.push({ stage: stage.id, title: stage.title + ', round ' + st.round, option: card.id, label: card.name, q: card.q, coach: card.coach || '' });
      const entry = { round: st.round, card: card.id, cardName: card.name, move: move ? move.id : null, moveName: move ? move.name : null, moveDesc: move ? move.desc : null, countered, mine, theirs, before, after: st.support, price: st.price };
      st.log.push(entry);
      if (card.ends) return E.finish(run, stage, card.ends, entry);
      if (st.round >= E.rounds(stage)) return E.finish(run, stage, null, entry);
      st.round += 1;
      st.move = E.drawMove(run, stage);
      return entry;
    },

    finish(run, stage, tag, entry) {
      const st = run.st[stage.id];
      const thr = E.threshold(stage);
      const bidderWins = !tag && st.support >= thr;
      const uplift = st.price / st.price0 - 1;
      const res = { side: stage.side, support: st.support, bidderWins, tag: tag || null, price: st.price, uplift, played: st.played.slice(), spent: stage.chest - st.chest, rounds: st.round };
      let s;
      if (stage.side === 'attack') {
        s = tag ? 45 : bidderWins ? 68 + U.clamp((st.support - thr) * 1.2, 0, 20) - Math.min(18, uplift * 100) + 12 : 30;
      } else {
        s = tag ? 78 : bidderWins ? 40 + Math.min(35, uplift * 220) : 82;
      }
      run.deal.exec[stage.id] = U.clamp(s, 0, 100);
      st.done = true; st.result = res;
      run.deal.battle = res;
      if (stage.side === 'attack') { run.deal.won = bidderWins; if (bidderWins) run.deal.price = st.price; else D.end(run, tag || 'failed'); }
      (stage.teachesOnEnd || []).forEach((c) => D.teach(run, c));
      if (entry) entry.result = res;
      return entry;
    },

    auto(run, stage, policy) {
      const st = run.st[stage.id];
      let guard = 0;
      while (!st.done && guard++ < 20) {
        const hand = E.hand(run, stage).filter((c) => c.affordable);
        if (!hand.length) { E.finish(run, stage, null, null); break; }
        let pick;
        if (policy === 'coach') {
          const score = (c) => c.q + ((c.counters || []).includes(st.move) ? 1.5 : 0);
          pick = hand.slice().sort((a, b) => score(b) - score(a))[0];
        } else pick = run.policyRng.pick(hand);
        E.play(run, stage, pick.id);
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
