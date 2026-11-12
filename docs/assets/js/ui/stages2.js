/* ---------------------------------------------------------------------
 * stages2.js: views for battle, vote, regulatory, integration and lbo.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const UI = WR.ui;
  const h = UI.h;
  const S = WR.sim;
  const V = UI.stages;
  const intro = UI.stageIntro;
  const range = (r) => UI.signed(Math.round(r[0])) + ' to ' + UI.signed(Math.round(r[1]));

  /* ---------------- battle ---------------- */
  V.battle = function (run, stage, ctx) {
    const el = h('div', { class: 'view battle' });
    const E = S.battle;
    const attack = stage.side === 'attack';
    let last = null;
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id], thr = E.threshold(stage);
      el.appendChild(intro(run, stage));
      el.appendChild(h('div', { class: 'front' },
        h('div', { class: 'front-label' }, h('span', null, attack ? 'Shares leaning your way' : 'Shares leaning towards the bidder'), h('b', { class: 'mono big ' + ((st.support >= thr) === attack ? 'pos' : 'neg') }, st.support.toFixed(1) + '%')),
        UI.bar(st.support, { cls: 'front-bar ' + (attack ? 'mine' : 'theirs'), mark: thr, markLabel: thr + '% needed' }),
        h('div', { class: 'front-facts' },
          h('span', null, 'Round ', h('b', null, Math.min(st.round, E.rounds(stage)) + ' of ' + E.rounds(stage))),
          h('span', null, 'War chest ', h('b', { class: 'mono' }, UI.money(st.chest, run))),
          h('span', null, 'Offer on the table ', h('b', { class: 'mono' }, UI.money(st.price, run)), st.price > st.price0 ? h('em', { class: 'muted' }, ' (+' + U.pct(st.price / st.price0 - 1, 1) + ')') : null),
          attack && run.deal.walkAway ? h('span', null, 'Your limit ', h('b', { class: 'mono' }, UI.money(run.deal.walkAway, run))) : null)));
      if (last) {
        el.appendChild(h('div', { class: 'clash' },
          h('div', { class: 'clash-side you' }, h('div', { class: 'kicker' }, 'You played'), h('b', null, last.cardName), h('span', { class: 'mono' }, last.mine ? UI.signed(last.mine, 1) + ' pts' : 'no direct effect')),
          last.moveName ? h('div', { class: 'clash-side them' }, h('div', { class: 'kicker' }, 'They played'), h('b', null, last.moveName), h('p', null, last.moveDesc),
            h('span', { class: 'mono' }, UI.signed(last.theirs, 1) + ' pts'), last.countered ? UI.chip('Countered: blunted to a fifth', 'good') : null) : null,
          h('div', { class: 'clash-net' }, 'Support moved from ' + last.before.toFixed(1) + '% to ', h('b', null, last.after.toFixed(1) + '%'))));
      }
      if (st.done) {
        const r = st.result;
        let text;
        if (attack) text = r.tag === 'walked' ? 'You withdraw the offer. The fight is over.' : r.bidderWins ? 'Acceptances pass ' + thr + ' percent. The company is yours, at ' + UI.money(r.price, run) + '.' : 'The offer closes with ' + r.support.toFixed(1) + ' percent. Not enough. The bid lapses.';
        else text = r.tag === 'knight' ? 'A white knight steps in. The company will be sold, but not to the bidder at your gates.' : r.tag === 'settled' ? 'You pick up the telephone. The fight ends and the negotiation begins.' : r.bidderWins ? 'The bidder passes ' + thr + ' percent. Your shareholders have decided over your head.' : 'The offer lapses at ' + r.support.toFixed(1) + ' percent. You have seen them off.';
        el.appendChild(h('div', { class: 'result' }, h('p', { class: 'outcome' }, text)));
        el.appendChild(ctx.next());
        return;
      }
      const move = stage.enemy.find((m) => m.id === st.move);
      if (move) el.appendChild(h('div', { class: 'intel' }, UI.icon('eye'), h('div', null, h('div', { class: 'kicker' }, 'Intelligence, round ' + st.round), h('p', null, move.tell))));
      el.appendChild(h('div', { class: 'hand' }, E.hand(run, stage).map((c) => h('button', { type: 'button', class: 'card t-' + c.type + (c.affordable ? '' : ' disabled'), disabled: !c.affordable, onclick: () => play(c.id) },
        h('div', { class: 'card-top' }, h('span', { class: 'card-type' }, c.type), c.cost ? h('span', { class: 'card-cost mono' }, UI.money(c.cost, run)) : h('span', { class: 'card-cost mono' }, 'free')),
        h('b', { class: 'card-name' }, c.name), h('p', null, c.desc),
        h('div', { class: 'card-fx' },
          c.support ? UI.chip((attack ? 'Your support ' : 'Bidder support ') + range(c.support), 'neutral') : null,
          c.bump ? UI.chip('Raises the price ' + U.pct(c.bump), 'bad') : null,
          c.ends ? UI.chip('Ends the fight', 'warn') : null)))));
    }
    function play(id) { last = E.play(run, stage, id); ctx.sync(); draw(); }
    draw();
    return el;
  };

  /* ---------------- vote ---------------- */
  V.vote = function (run, stage, ctx) {
    const el = h('div', { class: 'view vote' });
    const E = S.vote;
    const wantPass = stage.want !== 'fail';
    let lastMoved = null;
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      const lean = st.polled ? st.real : st.est;
      el.appendChild(intro(run, stage));
      if (st.done) {
        const r = st.result;
        el.appendChild(h('div', { class: 'tally ' + (r.success ? 'good' : 'bad') },
          h('div', { class: 'kicker' }, stage.question), h('div', { class: 'tally-num mono' }, r.forPct.toFixed(1) + '% for'),
          UI.bar(r.forPct, { cls: 'front-bar ' + (wantPass ? 'mine' : 'theirs'), mark: stage.threshold, markLabel: stage.threshold + '% needed' }),
          h('p', { class: 'outcome' }, (r.passed ? 'The resolution passes.' : 'The resolution fails.') + ' ' + (r.success ? 'That is the result you wanted.' : 'That is not the result you wanted.'))));
        el.appendChild(h('div', { class: 'blocs' }, stage.blocs.map((b) => h('div', { class: 'bloc' }, h('div', { class: 'bloc-head' }, h('b', null, b.name), h('span', { class: 'mono' }, b.pct + '%')),
          UI.bar(100 * r.by[b.id] / b.pct, { cls: 'lean' }), h('div', { class: 'muted small' }, (100 * r.by[b.id] / b.pct).toFixed(0) + '% of this bloc voted for')))));
        el.appendChild(ctx.next(r.success || !stage.failEnd ? 'Continue' : 'See how it ended'));
        return;
      }
      const f = E.forecast(run, stage);
      el.appendChild(h('div', { class: 'front' },
        h('div', { class: 'front-label' }, h('span', null, stage.question), h('b', { class: 'mono big ' + ((f >= stage.threshold) === wantPass ? 'pos' : 'neg') }, f.toFixed(1) + '%')),
        UI.bar(f, { cls: 'front-bar ' + (wantPass ? 'mine' : 'theirs'), mark: stage.threshold, markLabel: stage.threshold + '% needed' }),
        h('div', { class: 'front-facts' }, h('span', null, st.polled ? 'Based on the solicitor\'s real count' : 'Forecast from published leanings, which may be wrong'), h('span', null, 'Needed: ', h('b', null, (wantPass ? 'at least ' : 'under ') + stage.threshold + '%')), h('span', null, 'Weeks left ', h('b', null, String(st.timeLeft))))));
      if (st.notes.length) el.appendChild(h('ul', { class: 'notes' }, st.notes.map((n) => h('li', null, n))));
      el.appendChild(h('div', { class: 'blocs' }, stage.blocs.map((b) => {
        const l = U.clamp(lean[b.id], 0, 1);
        const mv = lastMoved && lastMoved[b.id];
        return h('div', { class: 'bloc' + (mv ? ' moved' : '') },
          h('div', { class: 'bloc-head' }, h('b', null, b.name), h('span', { class: 'mono' }, b.pct + '%'), b.block ? UI.chip('votes as a block', 'neutral') : null),
          UI.bar(100 * l, { cls: 'lean', mark: 50 }),
          h('div', { class: 'muted small' }, 'Leaning ' + Math.round(100 * l) + '% for' + (mv ? ' (' + UI.signed(Math.round(100 * mv)) + ')' : '') + '. ' + b.desc));
      })));
      el.appendChild(h('div', { class: 'hand' }, E.actions(run, stage).map((a) => h('button', { type: 'button', class: 'card' + (a.affordable ? '' : ' disabled'), disabled: !a.affordable, onclick: () => act(a.id) },
        h('div', { class: 'card-top' }, h('span', { class: 'card-type' }, 'campaign'), h('span', { class: 'card-cost mono' }, (a.cost || 1) + (a.cost > 1 ? ' weeks' : ' week'))),
        h('b', { class: 'card-name' }, a.name), h('p', null, a.desc)))));
      el.appendChild(h('div', { class: 'actions' }, UI.btn('Call the vote', () => { E.call(run, stage); ctx.sync(); draw(); }, st.timeLeft > 0 ? 'ghost' : 'primary')));
    }
    function act(id) { lastMoved = E.act(run, stage, id).moved; ctx.sync(); draw(); }
    draw();
    return el;
  };

  /* ---------------- regulatory ---------------- */
  V.regulatory = function (run, stage, ctx) {
    const el = h('div', { class: 'view regulatory' });
    const E = S.regulatory;
    const picked = new Set();
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      el.appendChild(intro(run, stage));
      if (st.done) {
        const r = st.result;
        el.appendChild(h('div', { class: 'result' }, h('p', { class: 'outcome' },
          r.abandoned ? 'You withdraw the notification. The deal is dead.' : r.cleared ? (r.litigated ? 'The court overturns the objections. The deal is cleared without conditions.' : stage.authority + ' clears the deal' + (r.cost ? ', on conditions that cost you ' + UI.money(r.cost, run) + ' of value.' : ' unconditionally.'))
            : r.litigated ? 'The court sides with ' + stage.authority + '. The deal is prohibited.' : stage.authority + ' prohibits the deal.')));
        el.appendChild(ctx.next(r.cleared ? 'Continue' : 'See how it ended'));
        return;
      }
      const ids = Array.from(picked);
      if (st.phase === 2) el.appendChild(h('div', { class: 'objections' }, h('div', { class: 'kicker' }, 'Statement of objections: second and final phase'),
        st.objections.map((o) => h('p', null, h('b', null, o.name + ': '), o.level === 'serious' ? 'your offer falls well short.' : 'your offer falls a little short.'))));
      el.appendChild(h('div', { class: 'concerns' }, stage.concerns.map((c) => {
        const cover = U.sum(stage.remedies.filter((r) => picked.has(r.id)).map((r) => (r.fixes && r.fixes[c.id]) || 0));
        const k = st.known[c.id];
        return h('div', { class: 'concern' }, h('b', null, c.name), h('p', { class: 'muted' }, c.desc),
          h('div', { class: 'sev' }, h('span', null, 'Seriousness: somewhere from ' + c.severity[0] + ' to ' + c.severity[1] + ' points'), k ? UI.chip('Your read: ' + k.level + ', about ' + k.about, 'tier-' + (k.level === 'high' ? 'high' : k.level === 'medium' ? 'medium' : 'low')) : null),
          UI.bar(cover, { max: c.severity[1], cls: 'cover', mark: c.severity[0] }),
          h('div', { class: 'muted small' }, 'Your remedies cover ' + cover + ' points'));
      })));
      if (st.phase === 1 && (stage.intel || []).length) el.appendChild(h('div', { class: 'intel-row' }, stage.intel.map((it) => st.intelUsed.includes(it.id) ? null : h('button', { type: 'button', class: 'card small', onclick: () => { E.intel(run, stage, it.id); ctx.sync(); draw(); } },
        h('div', { class: 'card-top' }, h('span', { class: 'card-type' }, 'homework'), h('span', { class: 'card-cost mono' }, (it.days || 10) + ' days')), h('b', { class: 'card-name' }, it.name), h('p', null, it.desc)))));
      el.appendChild(h('div', { class: 'remedies' }, stage.remedies.map((r) => h('label', { class: 'remedy ' + (picked.has(r.id) ? 'on' : '') },
        h('input', { type: 'checkbox', checked: picked.has(r.id), onchange: (e) => { if (e.target.checked) picked.add(r.id); else picked.delete(r.id); draw(); } }),
        h('div', null, h('b', null, r.name), h('p', { class: 'muted' }, r.desc),
          h('div', { class: 'chips' }, Object.keys(r.fixes || {}).map((k) => UI.chip(stage.concerns.find((c) => c.id === k).name.split(' ').slice(0, 3).join(' ') + ': ' + r.fixes[k] + ' pts', 'neutral')), UI.chip('Costs ' + UI.money(r.cost, run), 'bad')))))));
      el.appendChild(h('div', { class: 'nego-foot' },
        h('div', null, 'Remedies offered: ', h('b', null, String(ids.length)), ', costing ', h('b', { class: 'mono' }, UI.money(E.cost(stage, ids), run)), ' of deal value.'),
        h('div', { class: 'actions' },
          UI.btn(st.phase === 1 ? 'Submit to ' + stage.authority : 'Submit the revised offer', () => { E.submit(run, stage, ids); ctx.sync(); draw(); }, 'primary'),
          st.phase === 2 ? UI.btn('Fight it in court (about ' + Math.round(100 * ((stage.litigate && stage.litigate.p) || 0.3)) + '% chance)', () => { E.litigate(run, stage); ctx.sync(); draw(); }, 'ghost') : null,
          st.phase === 2 ? UI.btn('Abandon the deal', () => { E.abandon(run, stage); ctx.sync(); draw(); }, 'ghost danger') : null)));
    }
    draw();
    return el;
  };

  /* ---------------- integration ---------------- */
  V.integration = function (run, stage, ctx) {
    const el = h('div', { class: 'view integration' });
    const E = S.integration;
    const G = Object.assign({ capture: 'Synergy capture', morale: 'Morale', customers: 'Customers' }, stage.gauges || {});
    let picks = [];
    function gauges(st, prev) {
      return h('div', { class: 'gauges' }, ['capture', 'morale', 'customers'].map((k) => {
        const d = prev ? Math.round(st[k] - prev[k]) : 0;
        return h('div', { class: 'gauge g-' + k }, h('div', { class: 'gauge-top' }, h('span', null, G[k]), h('b', { class: 'mono' }, Math.round(st[k])), d ? h('span', { class: 'delta ' + (d > 0 ? 'up' : 'down') }, UI.signed(d)) : null),
          UI.bar(st[k], { cls: k === 'capture' ? 'gold' : st[k] < 45 ? 'bad' : st[k] < 60 ? 'warn' : '' }));
      }));
    }
    function fx(i) {
      return ['capture', 'morale', 'customers'].filter((k) => i[k]).map((k) => UI.chip(G[k] + ' ' + UI.signed(i[k]), i[k] > 0 ? 'good' : 'bad'));
    }
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      const lastLog = st.log[st.log.length - 1];
      el.appendChild(intro(run, stage));
      el.appendChild(h('div', { class: 'phases' }, stage.phases.map((p, i) => h('span', { class: 'phase ' + (i < st.phase ? 'done' : i === st.phase && !st.closed ? 'now' : '') }, p))));
      el.appendChild(gauges(st, lastLog ? lastLog.before : null));
      if (lastLog) {
        el.appendChild(h('div', { class: 'phase-report' }, h('div', { class: 'kicker' }, 'What happened in "' + lastLog.name + '"'),
          lastLog.chosen.length ? h('p', null, 'You committed to: ' + lastLog.chosen.map((id) => stage.initiatives.find((x) => x.id === id).name).join('; ') + '.') : h('p', null, 'You committed to nothing. Drift has a cost.'),
          lastLog.risks.map((r) => h('p', { class: 'event bad' }, UI.icon('flag'), r.text)),
          lastLog.events.map((e) => h('p', { class: 'event ' + (e.good ? 'good' : 'bad') }, UI.icon(e.good ? 'gem' : 'flag'), e.text))));
      }
      if (st.closed) {
        const r = st.result;
        el.appendChild(h('div', { class: 'result' }, h('p', { class: 'outcome' }, 'The programme is over. ' + G.capture + ' stands at ' + Math.round(r.capture) + ', ' + G.morale.toLowerCase() + ' at ' + Math.round(r.morale) + ' and ' + G.customers.toLowerCase() + ' at ' + Math.round(r.customers) + '.')));
        el.appendChild(ctx.next('See the verdict'));
        return;
      }
      const cap = E.capacity(stage);
      const used = U.sum(picks.map((id) => (stage.initiatives.find((x) => x.id === id).cost || 1)));
      el.appendChild(h('div', { class: 'capacity' }, h('span', { class: 'kicker' }, 'Management attention, ' + stage.phases[st.phase]), h('div', { class: 'pips big' }, Array.from({ length: cap }, (_, i) => h('i', { class: i < used ? 'on' : '' }))), h('b', null, used + ' of ' + cap + ' used')));
      const avail = E.available(run, stage);
      el.appendChild(h('div', { class: 'hand' }, avail.map((i) => {
        const on = picks.includes(i.id), c = i.cost || 1;
        const blocked = !i.ready || (!on && used + c > cap);
        return h('button', { type: 'button', class: 'card t-' + i.track + (on ? ' on' : '') + (blocked ? ' disabled' : ''), disabled: blocked, onclick: () => { picks = on ? picks.filter((x) => x !== i.id) : picks.concat(i.id); draw(); } },
          h('div', { class: 'card-top' }, h('span', { class: 'card-type' }, i.track), h('span', { class: 'card-cost' }, Array.from({ length: c }, () => h('i', { class: 'pip' })))),
          h('b', { class: 'card-name' }, i.name), h('p', null, i.desc),
          h('div', { class: 'card-fx' }, fx(i), i.risk ? UI.chip('Risky', 'warn') : null,
            !i.ready ? UI.chip('Needs: ' + (i.requires || []).map((r) => stage.initiatives.find((x) => x.id === r).name).join(', '), 'neutral') : null,
            i.until !== undefined && i.until === st.phase ? UI.chip('Last chance', 'neutral') : null));
      })));
      el.appendChild(h('div', { class: 'actions' }, UI.btn(picks.length ? 'Commit and move on' : 'Do nothing this phase', () => { E.commit(run, stage, picks); picks = []; ctx.sync(); draw(); }, picks.length ? 'primary' : 'ghost')));
    }
    draw();
    return el;
  };

  /* ---------------- lbo ---------------- */
  V.lbo = function (run, stage, ctx) {
    const el = h('div', { class: 'view lbo' });
    const E = S.lbo;
    function slider(label, key, lim, step, fmt, plan) {
      const out = h('b', { class: 'mono' }, fmt(plan[key]));
      return h('label', { class: 'lbo-slider' }, h('span', null, label, ' ', out),
        h('input', { type: 'range', min: lim[0], max: lim[1], step, value: plan[key], oninput: (e) => { out.textContent = fmt(Number(e.target.value)); }, onchange: (e) => { E.setPlan(run, stage, { [key]: Number(e.target.value) }); draw(); } }));
    }
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      el.appendChild(intro(run, stage));
      if (st.done) {
        const r = st.result;
        el.appendChild(h('div', { class: 'result' },
          h('div', { class: 'kicker' }, 'The world you got: ' + r.scenarioName), h('p', { class: 'outcome' }, r.scenarioText),
          h('div', { class: 'levers-out' }, r.worked.map((w) => h('div', { class: 'lever-out ' + (w.ok ? 'good' : 'bad') }, UI.icon(w.ok ? 'check' : 'cross'), w.name + (w.ok ? ': delivered' : ': did not deliver')))),
          r.breach ? h('p', { class: 'event bad' }, UI.icon('flag'), 'Interest cover fell to ' + r.minCover.toFixed(2) + 'x, below the covenant of ' + (stage.covenant || 1.5).toFixed(2) + 'x. The lenders took control.') : h('p', { class: 'event good' }, UI.icon('check'), 'The covenants held: interest cover never fell below ' + r.minCover.toFixed(2) + 'x.'),
          UI.kv([['Plan-case return', U.pct(r.planCase.irr, 1) + ' a year, ' + r.planCase.moic.toFixed(2) + 'x'], ['Before diligence surprises, you made', (r.irr <= -1 ? 'a total loss' : U.pct(r.irr, 1) + ' a year, ' + r.moic.toFixed(2) + 'x')]])));
        el.appendChild(ctx.next('See the verdict'));
        return;
      }
      const plan = st.plan;
      const p = E.project(run, stage, plan, false);
      const ev = E.entryEv(run, stage), ebitda = E.ebitda(stage), cov = stage.covenant || 1.5;
      el.appendChild(h('div', { class: 'lbo-grid' },
        h('div', { class: 'lbo-controls' },
          h('div', { class: 'kicker' }, 'Capital structure'),
          slider('Senior debt', 'senior', stage.senior, 0.1, (x) => x.toFixed(1) + 'x EBITDA', plan),
          slider('Junior debt', 'sub', stage.sub, 0.1, (x) => x.toFixed(1) + 'x EBITDA', plan),
          slider('Hold period', 'hold', stage.hold, 1, (x) => x + ' years', plan),
          h('div', { class: 'kicker' }, 'Value-creation plan: choose up to ' + (stage.maxLevers || 3)),
          h('div', { class: 'levers' }, stage.levers.map((l) => {
            const on = plan.levers.includes(l.id), full = !on && plan.levers.length >= (stage.maxLevers || 3);
            return h('label', { class: 'remedy ' + (on ? 'on' : '') + (full ? ' disabled' : '') },
              h('input', { type: 'checkbox', checked: on, disabled: full, onchange: (e) => { E.setPlan(run, stage, { levers: e.target.checked ? plan.levers.concat(l.id) : plan.levers.filter((x) => x !== l.id) }); draw(); } }),
              h('div', null, h('b', null, l.name), h('p', { class: 'muted' }, l.desc),
                h('div', { class: 'chips' }, l.growth ? UI.chip('Growth ' + UI.signed(100 * l.growth, 1) + ' pts', 'good') : null, l.margin ? UI.chip('Margin ' + UI.signed(100 * l.margin, 1) + ' pts', l.margin > 0 ? 'good' : 'bad') : null, l.capex ? UI.chip('Needs capex', 'neutral') : null)));
          }))),
        h('div', { class: 'lbo-out' },
          h('div', { class: 'kicker' }, 'Plan case: if everything works and the world behaves'),
          p.error ? h('p', { class: 'event bad' }, UI.icon('flag'), 'This structure does not work: ' + p.error) : [
            h('div', { class: 'lbo-big' }, h('div', null, h('span', { class: 'muted' }, 'Return'), h('b', { class: 'mono' }, p.irr === null ? 'n/a' : U.pct(p.irr, 1))), h('div', null, h('span', { class: 'muted' }, 'Money multiple'), h('b', { class: 'mono' }, p.moic.toFixed(2) + 'x')), h('div', null, h('span', { class: 'muted' }, 'Equity cheque'), h('b', { class: 'mono' }, UI.money(p.equity, run)))),
            UI.kv([
              ['Enterprise value at entry', UI.money(ev, run) + ' (' + (ev / ebitda).toFixed(1) + 'x EBITDA of ' + UI.money(ebitda, run) + ')'],
              ['Debt', UI.money(p.debt, run) + ' (' + (plan.senior + plan.sub).toFixed(1) + 'x)'],
              ['Exit assumed at', stage.exitMultiple.toFixed(1) + 'x EBITDA after ' + plan.hold + ' years'],
            ]),
            h('div', { class: 'cover ' + (p.minCover < cov ? 'bad' : p.minCover < cov * 1.25 ? 'warn' : 'good') },
              h('div', null, 'Lowest interest cover in the plan: ', h('b', { class: 'mono' }, p.minCover.toFixed(2) + 'x'), '. Covenant: ', h('b', { class: 'mono' }, cov.toFixed(2) + 'x'), '.'),
              UI.bar(Math.min(p.minCover, cov * 3), { max: cov * 3, mark: cov, cls: 'cover' }),
              h('p', { class: 'muted small' }, p.minCover < cov ? 'The plan itself breaches the covenant. No lender will sign this.' : p.minCover < cov * 1.25 ? 'Very little headroom. A weak year or a rise in rates breaks the covenant.' : 'Headroom of ' + U.pct(p.minCover / cov - 1) + ' above the covenant in the plan case.')),
            h('table', { class: 'yr' }, h('thead', null, h('tr', null, ['Year', 'EBITDA', 'Debt', 'Cover'].map((x) => h('th', null, x)))),
              h('tbody', null, p.rows.slice(0, plan.hold).map((r) => h('tr', null, h('td', null, String(r.year)), h('td', { class: 'mono' }, U.fmt(r.ebitda)), h('td', { class: 'mono' }, U.fmt(r.debt)), h('td', { class: 'mono' }, r.cover === null ? 'n/a' : r.cover.toFixed(1) + 'x'))))),
          ],
          h('p', { class: 'muted small' }, 'Possible worlds: ' + stage.scenarios.map((s) => s.name.toLowerCase()).join(', ') + '. Each lever may or may not deliver.'))));
      el.appendChild(h('div', { class: 'actions' }, UI.btn('Sign the financing and close', () => { E.lock(run, stage); ctx.sync(); draw(); }, 'primary' + (p.error ? ' disabled' : ''), p.error ? { disabled: true } : {})));
    }
    draw();
    return el;
  };
})(typeof window !== 'undefined' ? window : globalThis);
