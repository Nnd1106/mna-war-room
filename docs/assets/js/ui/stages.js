/* ---------------------------------------------------------------------
 * stages.js: views for brief, decision, diligence, pricing, auction and
 * negotiation stages. Each view is fn(run, stage, ctx) -> element, where
 * ctx = { sync(), advance(), next(label) }. Views never compute outcomes.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const UI = WR.ui;
  const h = UI.h;
  const S = WR.sim;
  const V = UI.stages;
  const val = (v, run) => U.val(v, run);

  function intro(run, stage) {
    const t = val(stage.intro, run);
    return t ? h('p', { class: 'stage-intro', html: t }) : null;
  }
  UI.stageIntro = intro;

  /* ---------------- brief ---------------- */
  V.brief = function (run, stage, ctx) {
    return h('div', { class: 'view brief' },
      h('div', { class: 'brief-text' }, stage.text.map((p) => h('p', { html: p }))),
      stage.cast ? h('div', { class: 'cast' }, stage.cast.map((c) => h('figure', { class: 'cast-card' },
        h('div', { class: 'avatar' }, c.name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(-2).map((w) => w[0]).join('')),
        h('figcaption', null, h('b', null, c.name), h('span', { class: 'role' }, c.role), h('blockquote', null, '“' + c.line + '”'))))) : null,
      ctx.next('Begin'));
  };

  /* ---------------- decision ---------------- */
  V.decision = function (run, stage, ctx) {
    const el = h('div', { class: 'view decision' });
    const E = S.decision;
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      el.appendChild(h('p', { class: 'prompt', html: val(stage.prompt, run) }));
      if (!st.chosen) {
        el.appendChild(h('div', { class: 'options' }, E.options(run, stage).map((o, i) => h('button', { class: 'option', type: 'button', onclick: () => choose(o.id) },
          h('span', { class: 'opt-key' }, String.fromCharCode(65 + i)), h('span', { class: 'opt-label' }, o.label)))));
        return;
      }
      const r = st.result, o = r.option;
      const q = UI.qLabel(E.q(o, run));
      el.appendChild(h('div', { class: 'options done' }, E.options(run, stage).concat(E.options(run, stage).some((x) => x.id === o.id) ? [] : [o]).map((x, i) => h('div', { class: 'option ' + (x.id === o.id ? 'picked' : 'faded') },
        h('span', { class: 'opt-key' }, String.fromCharCode(65 + i)), h('span', { class: 'opt-label' }, x.label)))));
      el.appendChild(h('div', { class: 'result' },
        h('p', { class: 'outcome', html: r.text }),
        r.rolled ? h('div', { class: 'roll ' + (r.rolled.win ? 'win' : 'lose') }, 'The odds were about ' + Math.round(r.rolled.p * 100) + '%. ' + (r.rolled.win ? 'It came off.' : 'It did not come off.')) : null,
        st.fx,
        h('div', { class: 'coach-note ' + q[1] }, h('div', { class: 'coach-head' }, UI.icon('cap'), h('b', null, 'The coach: '), h('span', { class: 'q ' + q[1] }, q[0])), h('p', null, o.coach)),
        o.teaches ? h('div', { class: 'chips' }, o.teaches.map(UI.conceptChip)) : null));
      el.appendChild(ctx.next());
    }
    function choose(id) {
      const before = UI.snap(run), days = run.deal.days;
      E.choose(run, stage, id);
      const extra = [];
      if (run.deal.days !== days) extra.push(UI.chip(UI.signed(run.deal.days - days) + ' days', 'neutral'));
      run.st[stage.id].fx = UI.fxChips(before, run.deal.meters, extra);
      ctx.sync(); draw();
    }
    draw();
    return el;
  };

  /* ---------------- diligence ---------------- */
  V.diligence = function (run, stage, ctx) {
    const el = h('div', { class: 'view diligence' });
    const E = S.diligence;
    let last = null;
    function finding(it) {
      return h('div', { class: 'finding ' + (it.kind === 'gem' ? 'gem' : 'flag') },
        h('div', { class: 'finding-head' }, UI.icon(it.kind === 'gem' ? 'gem' : 'flag'), h('b', null, it.title), h('span', { class: 'impact' }, (it.impact > 0 ? '+' : '') + UI.money(it.impact, run))),
        h('p', null, it.text),
        it.chip ? h('div', { class: 'note' }, 'A bargaining chip worth about ' + UI.money(it.chip, run) + ' at the table.') : null);
    }
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id], s = E.summary(run, stage);
      el.appendChild(intro(run, stage));
      el.appendChild(h('div', { class: 'dd-top' },
        h('div', { class: 'days' }, h('span', { class: 'kicker' }, 'Analyst-days left'), h('div', { class: 'pips' }, Array.from({ length: st.days0 }, (_, i) => h('i', { class: i < st.daysLeft ? 'on' : '' }))), h('b', null, st.daysLeft + ' of ' + st.days0)),
        h('div', { class: 'dd-sum' }, h('span', { class: 'kicker' }, 'What you know so far'), h('b', { class: s.adjust < 0 ? 'neg' : s.adjust > 0 ? 'pos' : '' }, (s.adjust > 0 ? '+' : '') + UI.money(s.adjust, run)), h('span', null, ' to the value estimate, from ' + s.found.length + ' finding' + (s.found.length === 1 ? '' : 's')))));
      el.appendChild(h('div', { class: 'streams' }, stage.streams.map((sm) => {
        const d = st.depth[sm.id], cost = E.nextCost(run, stage, sm.id), can = E.canDig(run, stage, sm.id);
        const found = stage.issues.filter((i) => i.stream === sm.id && st.found.includes(i.id));
        return h('div', { class: 'stream' + (last && last.stream === sm.id ? ' active' : '') },
          h('div', { class: 'stream-head' }, h('b', null, sm.name), h('div', { class: 'depth' }, [1, 2, 3].map((k) => h('i', { class: k <= d ? 'on' : '', title: 'Depth ' + k })))),
          h('p', { class: 'muted' }, sm.desc),
          found.length ? h('div', { class: 'stream-found' }, found.map((f) => UI.chip(f.title, f.kind === 'gem' ? 'good' : 'bad'))) : null,
          st.closed ? null : (cost === null ? h('div', { class: 'note' }, 'Fully examined.') :
            UI.btn(d === 0 ? 'Open the files (1 day)' : 'Dig deeper (' + cost + ' days)', () => dig(sm.id), 'small' + (can ? '' : ' disabled'), can ? {} : { disabled: true })));
      })));
      if (last) {
        const sm = stage.streams.find((x) => x.id === last.stream);
        el.appendChild(h('div', { class: 'dd-log' }, h('div', { class: 'kicker' }, sm.name + ', depth ' + last.depth),
          last.findings.length ? last.findings.map(finding) : h('p', { class: 'muted' }, 'Your team finds nothing new at this level. That is information too.')));
      }
      if (!st.closed) {
        el.appendChild(h('div', { class: 'actions' }, UI.btn(st.daysLeft > 0 ? 'Close the data room with ' + st.daysLeft + ' day' + (st.daysLeft === 1 ? '' : 's') + ' unused' : 'Close the data room', close, st.daysLeft > 0 ? 'ghost' : 'primary')));
      } else {
        el.appendChild(h('div', { class: 'result' },
          h('p', { class: 'outcome' }, 'The data room is closed. You go forward with ' + s.found.length + ' finding' + (s.found.length === 1 ? '' : 's') + ' and an adjustment of ' + (s.adjust > 0 ? '+' : '') + UI.money(s.adjust, run) + ' to the seller\'s numbers. Whatever else is in there, you will learn about after closing.'),
          s.found.length ? h('div', { class: 'findings' }, s.found.map(finding)) : null));
        el.appendChild(ctx.next());
      }
    }
    function dig(id) { const r = E.dig(run, stage, id); last = { stream: id, depth: r.depth, findings: r.findings }; ctx.sync(); draw(); }
    function close() { E.close(run, stage); last = null; ctx.sync(); draw(); }
    draw();
    return el;
  };

  /* ---------------- pricing ---------------- */
  V.pricing = function (run, stage, ctx) {
    const el = h('div', { class: 'view pricing' });
    const E = S.pricing;
    let walk = null;
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id], v = E.view(run, stage);
      if (walk === null) walk = Math.round(v.suggested);
      el.appendChild(intro(run, stage));
      if (st.locked) {
        const p = run.deal.pricing;
        el.appendChild(h('div', { class: 'result' }, h('p', { class: 'outcome' }, 'Your model is locked. On your numbers the business is worth up to ' + UI.money(p.breakEven, run) + ' to you, and you have told the board you will not pay more than ' + UI.money(p.walkAway, run) + '. How right you were, you find out at the end.')));
        el.appendChild(ctx.next());
        return;
      }
      el.appendChild(h('div', { class: 'syn-table' },
        h('div', { class: 'syn-row head' }, h('span', null, 'Claimed synergy'), h('span', null, 'A year'), h('span', null, 'How much you believe'), h('span', null, 'Value credited')),
        v.rows.map((r) => {
          const out = h('span', { class: 'mono' }, UI.money(r.creditedPV, run));
          const pct = h('b', { class: 'mono pct' }, Math.round(r.credit * 100) + '%');
          return h('div', { class: 'syn-row' },
            h('span', null, h('b', null, r.name), h('em', { class: 'kind k-' + r.kind }, r.kind === 'cost' ? 'cost saving' : r.kind === 'revenue' ? 'extra revenue' : 'capital')),
            h('span', { class: 'mono' }, UI.money(r.runRate, run)),
            h('span', { class: 'slider' }, h('input', { type: 'range', min: 0, max: 100, step: 5, value: Math.round(r.credit * 100), 'aria-label': 'Credit for ' + r.name,
              oninput: (e) => { E.setCredit(run, stage, r.id, Number(e.target.value) / 100); pct.textContent = e.target.value + '%'; },
              onchange: () => draw() }), pct),
            out);
        })));
      const lo = Math.round(stage.market * 0.9), hi = Math.round(Math.max(v.breakEven * 1.25, stage.market * 1.6));
      const walkOut = h('b', { class: 'mono big' }, UI.money(walk, run));
      const prem = h('span', { class: 'muted' });
      const verdict = h('div', { class: 'walk-note' });
      const paint = () => {
        walkOut.textContent = UI.money(walk, run);
        prem.textContent = ' a premium of ' + U.pct(walk / stage.market - 1) + ' to the market';
        const gap = v.breakEven - walk;
        verdict.className = 'walk-note ' + (gap < 0 ? 'bad' : gap < 0.25 * v.synergyPV ? 'warn' : 'good');
        verdict.textContent = gap < 0 ? 'Above your own estimate of what it is worth. On your numbers, you would be paying the seller more than all the value you create.'
          : gap < 0.25 * v.synergyPV ? 'Close to your break-even. Nearly all the synergies would go to the seller, and any mistake in your estimate comes out of your shareholders.'
            : 'You keep ' + UI.money(gap, run) + ' of the value for your own shareholders, if your estimates are right.';
      };
      el.appendChild(h('div', { class: 'bridge' },
        h('div', { class: 'bridge-row' }, h('span', null, 'Market value today'), h('b', { class: 'mono' }, UI.money(v.market, run))),
        h('div', { class: 'bridge-row' }, h('span', null, 'Stand-alone value: management case' + (v.known ? ' with your diligence findings (' + (v.known > 0 ? '+' : '') + UI.money(v.known, run) + ')' : '')), h('b', { class: 'mono' }, UI.money(v.standalone, run))),
        h('div', { class: 'bridge-row' }, h('span', null, 'Synergies you believe, valued at ' + stage.cap + 'x (claimed: ' + UI.money(v.claimedPV, run) + ')'), h('b', { class: 'mono pos' }, '+' + UI.money(v.synergyPV, run))),
        h('div', { class: 'bridge-row' }, h('span', null, 'One-off integration costs'), h('b', { class: 'mono neg' }, '−' + UI.money(v.integrationCost, run))),
        h('div', { class: 'bridge-row total' }, h('span', null, 'The most it is worth to you (break-even)'), h('b', { class: 'mono' }, UI.money(v.breakEven, run)))));
      el.appendChild(h('div', { class: 'walk' },
        h('div', { class: 'kicker' }, 'Your walk-away price'),
        h('div', null, walkOut, prem),
        h('input', { type: 'range', min: lo, max: hi, step: Math.max(1, Math.round((hi - lo) / 200)), value: walk, 'aria-label': 'Walk-away price', oninput: (e) => { walk = Number(e.target.value); paint(); } }),
        verdict,
        h('p', { class: 'muted small' }, 'Synergies are created by the buyer. A disciplined bidder pays for the business and shares only part of the synergies with the seller.')));
      paint();
      el.appendChild(h('div', { class: 'actions' }, UI.btn('Lock the model and the walk-away price', () => { E.lock(run, stage, walk); ctx.sync(); draw(); }, 'primary')));
    }
    draw();
    return el;
  };

  /* ---------------- auction ---------------- */
  V.auction = function (run, stage, ctx) {
    const el = h('div', { class: 'view auction' });
    const E = S.auction;
    let amount = null;
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      const min = E.minBid(run, stage), final = E.isFinal(run, stage);
      el.appendChild(intro(run, stage));
      const lastRep = st.log[st.log.length - 1];
      el.appendChild(h('div', { class: 'bidders' }, stage.rivals.map((r) => {
        const inIt = st.active.includes(r.id);
        const lb = lastRep ? lastRep.bids.find((b) => b.who === r.id) : null;
        return h('div', { class: 'bidder ' + (inIt ? '' : 'out') }, h('div', { class: 'bidder-head' }, h('b', null, r.name), UI.chip(inIt ? 'In' : 'Out', inIt ? 'good' : 'bad')),
          h('div', { class: 'muted small' }, r.kind), h('p', null, r.blurb),
          lb ? h('div', { class: 'mono' }, lb.amount === null ? 'Dropped out' : 'Last bid: ' + UI.money(lb.amount, run)) : null);
      })));
      if (st.log.length) {
        el.appendChild(h('div', { class: 'rounds-log' }, st.log.map((rep) => h('div', { class: 'round-rep' },
          h('div', { class: 'kicker' }, 'Round ' + rep.round + (rep.final ? ' (best and final)' : '')),
          h('div', { class: 'bid-list' }, rep.bids.slice().sort((a, b) => (b.amount || 0) - (a.amount || 0)).map((b) => h('div', { class: 'bid ' + (b.who === 'you' ? 'you' : '') + (b.amount === null ? ' drop' : '') },
            h('span', null, b.name), h('b', { class: 'mono' }, b.amount === null ? 'out' : UI.money(b.amount, run))))),
          rep.tells.map((t) => h('p', { class: 'tell' }, UI.icon('eye'), t))))));
      }
      if (st.done) {
        const r = st.result;
        el.appendChild(h('div', { class: 'result' }, h('p', { class: 'outcome' },
          r.won ? 'The bank calls at 7 p.m. You are the preferred bidder at ' + UI.money(r.price, run) + '.'
            : r.dropped ? 'You are out. ' + r.winner + ' goes on to win at ' + UI.money(r.price, run) + '.'
              : r.winner + ' wins with ' + UI.money(r.price, run) + '. Your final bid was not enough.'),
          run.deal.walkAway ? h('p', { class: 'muted' }, 'Your walk-away price was ' + UI.money(run.deal.walkAway, run) + '.' + (r.won && r.price > run.deal.walkAway ? ' You went past it.' : '')) : null));
        el.appendChild(ctx.next(r.won ? 'Continue' : 'See how it ended'));
        return;
      }
      if (amount === null || amount < min) amount = min;
      const max = Math.round(min * 1.35);
      const out = h('b', { class: 'mono big' }, UI.money(amount, run));
      const warn = h('div', { class: 'walk-note' });
      const paint = () => {
        out.textContent = UI.money(amount, run);
        const w = run.deal.walkAway;
        warn.className = 'walk-note ' + (w && amount > w ? 'bad' : 'good');
        warn.textContent = w ? (amount > w ? 'This is ' + UI.money(amount - w, run) + ' above the walk-away price you set.' : 'Inside your walk-away price of ' + UI.money(w, run) + '.') : '';
      };
      el.appendChild(h('div', { class: 'bid-box' },
        h('div', { class: 'kicker' }, 'Round ' + st.round + ' of ' + E.rounds(stage) + (final ? ': sealed, best and final' : '')),
        h('div', { class: 'bid-facts' }, h('span', null, 'Standing high bid ', h('b', { class: 'mono' }, UI.money(st.high, run))), h('span', null, 'Minimum to stay in ', h('b', { class: 'mono' }, UI.money(min, run))), h('span', null, 'Bidders left ', h('b', { class: 'mono' }, String(st.active.length + 1)))),
        h('div', null, 'Your bid: ', out),
        h('input', { type: 'range', min, max, step: Math.max(1, Math.round((max - min) / 100)), value: amount, 'aria-label': 'Your bid', oninput: (e) => { amount = Number(e.target.value); paint(); } }),
        warn,
        h('div', { class: 'actions' }, UI.btn(final ? 'Submit sealed bid' : 'Place bid', () => bid(amount), 'primary'), UI.btn('Drop out', () => bid(null), 'ghost danger'))));
      paint();
    }
    function bid(a) { E.bid(run, stage, a); amount = null; ctx.sync(); draw(); }
    draw();
    return el;
  };

  /* ---------------- negotiation ---------------- */
  V.negotiation = function (run, stage, ctx) {
    const el = h('div', { class: 'view negotiation' });
    const E = S.negotiation;
    const pkg = {};
    stage.issues.forEach((i) => { pkg[i.id] = i.options.slice().sort((a, b) => b.you - a.you)[0].id; });
    let reply = null;
    const tierText = { high: 'Matters a great deal to them', medium: 'Matters somewhat', low: 'They hardly care' };
    function pkgLine(p) { return stage.issues.map((i) => h('div', { class: 'pk' }, h('span', { class: 'muted' }, i.name), h('b', null, E.opt(stage, i.id, p[i.id]).label))); }
    function draw() {
      el.innerHTML = '';
      const st = run.st[stage.id];
      el.appendChild(intro(run, stage));
      el.appendChild(h('div', { class: 'nego-top' },
        h('div', { class: 'cast-card slim' }, h('div', { class: 'avatar' }, stage.counterpart.name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(-2).map((w) => w[0]).join('')), h('figcaption', null, h('b', null, stage.counterpart.name), h('span', { class: 'role' }, stage.counterpart.role))),
        h('div', { class: 'nego-stats' }, h('span', null, 'Round ', h('b', null, Math.min(st.round, E.rounds(stage)) + ' of ' + E.rounds(stage))), h('span', null, 'Careful questions left ', h('b', null, String(st.probesLeft))))));
      if (st.done) {
        const r = st.result;
        el.appendChild(h('div', { class: 'result' },
          h('p', { class: 'outcome' }, r.agreed ? (r.how === 'counter' ? 'You accept their terms. Hands are shaken.' : stage.counterpart.name + ' looks at the page for a long moment, then nods. You have a deal.') : 'You stand up, thank ' + stage.counterpart.name + ' and leave. There is no deal.'),
          r.agreed ? h('div', { class: 'package final' }, pkgLine(r.pkg)) : null,
          r.agreed ? h('p', { class: 'muted' }, 'On your own priorities this package scores ' + Math.round(r.you) + ' out of 100. Whether a better one was available, you will see in the debrief.') : null));
        el.appendChild(ctx.next(r.agreed ? 'Continue' : 'See how it ended'));
        return;
      }
      if (reply) {
        const iss = stage.issues.find((i) => i.id === reply.objection);
        el.appendChild(h('div', { class: 'reply ' + (reply.warm ? 'warm' : 'cold') },
          h('p', null, h('b', null, stage.counterpart.name + ': '), reply.warm ? '“We are not far apart. But I cannot accept this on ' + iss.name.toLowerCase() + '.”' : '“No. And least of all on ' + iss.name.toLowerCase() + '.”'),
          reply.lastChance ? h('p', { class: 'warn-text' }, 'That was your last round. Their counter-offer below is final: take it or walk.') : null));
      }
      if (st.counter) {
        el.appendChild(h('div', { class: 'counter' }, h('div', { class: 'kicker' }, 'Their counter-offer (worth ' + Math.round(E.youScore(stage, st.counter)) + ' of 100 to you)'),
          h('div', { class: 'package' }, pkgLine(st.counter)),
          h('div', { class: 'actions' }, UI.btn('Accept their counter-offer', () => { E.acceptCounter(run, stage); ctx.sync(); draw(); }, st.lastChance ? 'primary' : ''),
            st.lastChance ? null : UI.btn('Start from their offer', () => { Object.assign(pkg, st.counter); draw(); }, 'ghost'))));
      }
      if (!st.lastChance) {
        el.appendChild(h('div', { class: 'issues' }, stage.issues.map((i) => h('div', { class: 'issue' },
          h('div', { class: 'issue-head' }, h('b', null, i.name), h('span', { class: 'muted small' }, i.desc),
            st.revealed[i.id] ? UI.chip(tierText[st.revealed[i.id]], 'tier-' + st.revealed[i.id]) : (st.probesLeft > 0 ? UI.btn('Sound them out', () => { E.probe(run, stage, i.id); ctx.sync(); draw(); }, 'tiny ghost') : null)),
          h('div', { class: 'issue-opts' }, i.options.map((o) => h('button', { type: 'button', class: 'iopt ' + (pkg[i.id] === o.id ? 'on' : ''), onclick: () => { pkg[i.id] = o.id; draw(); } },
            h('span', null, o.label), h('span', { class: 'you-bar', title: 'Value to you: ' + o.you + ' of 100' }, h('i', { style: { width: o.you + '%' } })))))))));
        el.appendChild(h('div', { class: 'nego-foot' },
          h('div', null, 'This package is worth ', h('b', { class: 'mono' }, Math.round(E.youScore(stage, pkg)) + ' of 100'), ' to you. The bars show what each option is worth on your side. What it is worth to them, you have to work out.'),
          h('div', { class: 'actions' }, UI.btn('Put this package on the table', propose, 'primary'), UI.btn('Walk away', () => { E.walk(run, stage); ctx.sync(); draw(); }, 'ghost danger'))));
      } else {
        el.appendChild(h('div', { class: 'actions' }, UI.btn('Walk away', () => { E.walk(run, stage); ctx.sync(); draw(); }, 'ghost danger')));
      }
      if (st.history.length) {
        el.appendChild(h('details', { class: 'history' }, h('summary', null, 'Offers so far (' + st.history.length + ')'),
          st.history.map((x) => h('div', { class: 'hist' }, h('span', { class: 'muted' }, 'Round ' + x.round + ': '), stage.issues.map((i) => E.opt(stage, i.id, x.pkg[i.id]).label).join(' · '), x.accepted ? ' (accepted)' : ' (rejected)'))));
      }
    }
    function propose() {
      const r = E.propose(run, stage, pkg);
      reply = r.accepted ? null : r;
      ctx.sync(); draw();
    }
    draw();
    return el;
  };
})(typeof window !== 'undefined' ? window : globalThis);
