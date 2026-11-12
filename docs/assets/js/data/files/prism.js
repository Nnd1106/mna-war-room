/* Deal File 8: PRISM. An activist campaign and a break-up. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const S = () => WR.sim.score;
  const fl = (run) => run.deal.flags;
  const MCAP = 12000;
  const SEP_COST = { quo: 0, spin: 1.5, sell: 1.5, full: 3 };
  const NAMES = { quo: 'Keep the group together', spin: 'Spin off Orion Health', sell: 'Sell Orion Home', full: 'Break up into three' };

  const net = (run, p) => run.truth[p] - SEP_COST[p];
  const best = (run) => Math.max.apply(null, Object.keys(SEP_COST).map((p) => net(run, p)));
  const planQ = (p) => (run) => { const d = best(run) - net(run, p); return d < 1.5 ? 3 : d < 5 ? 2 : d < 9 ? 1 : 0; };
  const ousted = (run) => !!(fl(run).capitulated || (run.deal.vote && run.deal.vote.vote && run.deal.vote.vote.passed));
  const est = (run, p, bias) => { const x = run.truth[p] + run.truth.noise[p] + (bias || 0); return (x >= 0 ? '+' : '') + x.toFixed(0) + '%'; };

  WR.data.files.prism = {
    id: 'prism', n: 8, code: 'PRISM', title: 'The Sum of the Parts', type: 'Activist campaign and break-up',
    seat: 'Chief Executive, Orion Industries', difficulty: 3, unit: '$ m', image: 'prism.jpg',
    tagline: 'A hedge fund owns six percent of your conglomerate and has published a 90-page letter explaining that it is worth more in pieces. It might be right.',
    learn: ['How activist investors work', 'The conglomerate discount and sum-of-the-parts', 'Spin-off, sale or status quo', 'Proxy contests and when to settle', 'Separating a company without breaking it'],
    truth(rng) {
      const t = { quo: rng.range(-4, 2), spin: rng.range(-3, 19), sell: rng.range(-5, 12), full: rng.range(-5, 26) };
      t.noise = { quo: rng.range(-2, 2), spin: rng.range(-3, 3), sell: rng.range(-3, 3), full: rng.range(-3, 3) };
      return t;
    },
    stages: [
      {
        id: 'brief', type: 'brief', title: 'A letter with a website',
        text: [
          '<b>Orion Industries</b> is three businesses under one roof. Orion Aerospace makes landing-gear components. Orion Home makes kitchen appliances. Orion Health makes surgical devices and is growing three times as fast as the other two. You have run the group for four years, and the shares have trailed the index for all of them.',
          'This morning <b>Cormorant Capital</b> disclosed a six percent stake and published an open letter titled "Unlocking Orion". Its argument: investors who want a fast-growing medical business will not buy it wrapped in toasters, so the whole trades at a discount to the sum of its parts. It wants four seats on your board and a break-up.',
          'Activists are sometimes vultures and sometimes the only people prepared to say what the board will not. The discount may be real or imagined; a separation may release value or destroy it. Your shareholders will decide whom to believe, and the honest question is which of you is right.',
        ],
        cast: [
          { name: 'Dana Whitlock', role: 'Founder, Cormorant Capital', line: 'I am not here to run your company. I am here to ask why nobody is.' },
          { name: 'Sir Malcolm Reyes', role: 'Your chair', line: 'We can win a fight with her. I would rather know first whether we should.' },
        ],
        teaches: ['activism', 'conglomerate_discount'],
      },
      {
        id: 'engage', type: 'decision', title: 'The first call',
        prompt: 'Dana Whitlock has asked for a meeting. The letter is trending on financial television.',
        options: [
          { id: 'listen', label: 'Meet her this week, with your chair, and listen', q: 3, effects: { street: 5, days: 5 }, set: { engaged: true },
            outcome: 'She talks for ninety minutes and has plainly done the work: plant by plant, margin by margin. You disagree with a third of it. You leave knowing exactly what she will tell your shareholders.',
            coach: 'Meeting an activist costs nothing and tells you their case before the market hears it. Refusing only confirms the story that the board does not listen.' },
          { id: 'ignore', label: 'Decline. The board does not take instructions from hedge funds', q: 0, effects: { street: -8, heat: 6 }, set: { stonewalled: true },
            outcome: 'Cormorant publishes your two-line refusal beside its 90-page letter. Three of your ten largest holders ask for meetings of their own.',
            coach: 'She owns six percent. Other shareholders own the rest, and they are watching how the board treats a fellow owner.' },
          { id: 'attack', label: 'Go on television and call Cormorant a short-term asset stripper', q: 1, effects: { heat: 14, people: 4, street: -4 }, set: { hostile: true },
            outcome: 'It plays well in the factories. It plays less well with institutions that have made money alongside Cormorant before.',
            coach: 'Name-calling rallies employees and little else. Investors want an answer to the argument, not to the person.' },
        ],
      },
      {
        id: 'review', type: 'decision', title: 'Is she right?',
        prompt: 'Before the board answers Cormorant in public, how do you test the case for a break-up?',
        options: [
          { id: 'real', label: 'A genuine strategic review: outside bank, every option on the table, reporting to the independent directors', q: 3, effects: { board: 6, spend: 8, days: 30 }, set: { review: true },
            outcome: 'For the first time, somebody values the three businesses separately, costs the separation and counts what the group really shares. Some of it is uncomfortable reading.',
            coach: 'The only good answer to "you are worth more apart" is to find out. If the review says she is right, you would rather be the one who announces it.', teaches: ['sotp'] },
          { id: 'deck', label: 'Have your strategy team prepare a robust defence of the group structure', q: 1, effects: { days: 10 }, set: { deck: true },
            outcome: 'Forty slides conclude that the group is stronger together. The people who wrote them work for the group.',
            coach: 'Asking the people who built a structure whether it should exist will get you a predictable answer.' },
          { id: 'none', label: 'No review. Announcing one would look like weakness', q: 0, effects: { board: -5 },
            outcome: 'You go into the campaign knowing no more about your own company\'s break-up value than Cormorant does. Possibly less.',
            coach: 'Refusing to look is not strength. It leaves the activist as the only one with numbers.' },
        ],
      },
      {
        id: 'plan', type: 'decision', title: 'The board\'s answer',
        prompt: (run) => {
          const f = fl(run);
          if (f.review) return 'The review estimates the change in shareholder value under each course, after costs, give or take three points:<br>&bull; Keep the group together: <b>' + est(run, 'quo') + '</b><br>&bull; Spin off Orion Health: <b>' + est(run, 'spin', -1.5) + '</b><br>&bull; Sell Orion Home: <b>' + est(run, 'sell', -1.5) + '</b><br>&bull; Break up into three: <b>' + est(run, 'full', -3) + '</b><br>Which does the board announce?';
          if (f.deck) return 'Your strategy team\'s deck says the group structure is worth keeping: it puts every separation option at "broadly neutral to negative". Cormorant\'s letter says a full break-up is worth +35%. Neither has shown you a disinterested number. Which course does the board announce?';
          return 'You have no numbers of your own. Cormorant claims a full break-up is worth +35%. Which course does the board announce?';
        },
        options: [
          { id: 'quo', label: 'Keep the group together, with a share buyback', q: planQ('quo'), set: { plan: 'quo' }, effects: { people: 4 },
            outcome: 'The board declares its confidence in the integrated model and announces a $600 million buyback.',
            coach: 'Staying together is right when the businesses really do share customers, technology or costs. It is wrong when the only thing they share is a head office.' },
          { id: 'spin', label: 'Spin off Orion Health to shareholders as a separate listed company', q: planQ('spin'), set: { plan: 'spin' }, effects: { street: 4 },
            outcome: 'Shareholders will receive shares in a pure medical-devices company. Aerospace and Home stay together.',
            coach: 'A spin-off lets the market value a fast grower on its own, tax-free, without needing a buyer. It works best when the business being spun really is different.', teaches: ['spin_off'] },
          { id: 'sell', label: 'Sell Orion Home and reinvest in the other two', q: planQ('sell'), set: { plan: 'sell' }, effects: { people: -4 },
            outcome: 'The appliance business goes up for sale. The proceeds will pay down debt and fund Health.',
            coach: 'A sale turns a business into cash, but tax and a buyer\'s bargaining power take their share. The price depends on who wants it that year.' },
          { id: 'full', label: 'Break the group into three independent companies', q: planQ('full'), set: { plan: 'full' }, effects: { street: 5, people: -8 },
            outcome: 'The board announces the end of Orion Industries as a group. Three companies, three boards, eighteen months.',
            coach: 'A full break-up releases the most value when the discount is large, and costs the most to carry out. It is also exactly what the activist asked for, which is not a reason for or against.' },
        ],
        teaches: ['sotp'],
      },
      {
        id: 'settle', type: 'decision', title: 'Seats at the table',
        prompt: (run) => 'Cormorant has nominated four directors for the annual meeting in six weeks. ' + (fl(run).plan === 'quo' ? 'Your plan rejects everything it asked for.' : 'Your plan gives it part of what it asked for.') + ' Do you fight the vote?',
        options: [
          { id: 'two', label: 'Settle: two seats for Cormorant\'s nominees and a standstill, in exchange for backing your plan', requires: (run) => fl(run).plan !== 'quo', q: 3, effects: { street: 5, heat: -6, board: -2 }, set: { settled: true }, goto: 'sep',
            outcome: 'Two experienced outsiders join the board. Cormorant signs a two-year standstill and praises "a constructive outcome". The campaign website comes down overnight.',
            coach: 'Most campaigns end in a settlement. When you already agree on the direction, a proxy fight spends money and goodwill to decide who gets the credit.', teaches: ['standstill'] },
          { id: 'fight', label: 'Fight. Let the shareholders vote', q: (run) => (fl(run).plan === 'quo' ? (best(run) - net(run, 'quo') < 3 ? 3 : 1) : 2), effects: { heat: 8, spend: 15 }, set: { fight: true },
            outcome: 'Both sides hire proxy solicitors. The next six weeks will be spent in other people\'s conference rooms.',
            coach: 'Fighting is right when you believe the activist\'s plan would destroy value and you can show why. It is a poor way to protect pride.', teaches: ['proxy_fight'] },
          { id: 'cave', label: 'Give Cormorant all four seats and let it lead the break-up', q: 0, effects: { board: -12, people: -8 }, set: { capitulated: true }, end: 'ousted',
            outcome: 'With four seats and two sympathetic incumbents, Cormorant controls the agenda. The new board\'s first act is to begin a search for your successor.',
            coach: 'Handing over control without a vote gives away the one thing shareholders had not yet decided to give.' },
        ],
      },
      {
        id: 'vote', type: 'vote', title: 'The proxy contest', threshold: 50, want: 'fail', time: 4, noise: 0.07, when: (run) => !!fl(run).fight,
        question: 'Cormorant\'s four nominees are elected to the board',
        intro: 'The bar shows the share of votes leaning towards Cormorant\'s nominees. Keep it under half. Blocks vote their whole holding one way, and the leanings shown are estimates.',
        blocs: [
          { id: 'index', name: 'Index funds', pct: 26, lean: 0.47, block: true, desc: 'Their stewardship teams decide. They care about board quality and responsiveness.', cares: ['governance'] },
          { id: 'active', name: 'Active funds', pct: 24, lean: 0.52, desc: 'Have held Orion for years and are tired of waiting.', cares: ['value'] },
          { id: 'hedge', name: 'Cormorant and friendly hedge funds', pct: 14, lean: 0.95, block: true, desc: 'Not for turning.', cares: [] },
          { id: 'proxy', name: 'Funds that follow the proxy advisers', pct: 12, lean: 0.5, block: true, desc: 'Vote as the two advisory firms recommend.', cares: ['advisers'] },
          { id: 'retail', name: 'Retail shareholders', pct: 16, lean: 0.3, desc: 'Tend to back management, if they vote at all.', cares: ['loyal'] },
          { id: 'staff', name: 'Employee shareholders', pct: 8, lean: 0.15, desc: 'Fear what a break-up means for them.', cares: ['jobs'] },
        ],
        mods: [
          { when: (run) => fl(run).plan !== 'quo', sway: { value: -0.12, advisers: -0.06, governance: -0.04 }, text: 'You have a plan of your own to release value. That answers much of Cormorant\'s case.' },
          { when: (run) => fl(run).plan === 'quo', sway: { value: 0.1, advisers: 0.06 }, text: 'Your answer is "more of the same". Value investors lean towards change.' },
          { when: (run) => !!fl(run).review, sway: { governance: -0.06, advisers: -0.06 }, text: 'The independent review shows the board did the work.' },
          { when: (run) => !!fl(run).engaged, sway: { governance: -0.05 }, text: 'You met Cormorant and listened. Stewardship teams noticed.' },
          { when: (run) => !!fl(run).stonewalled, sway: { governance: 0.1, advisers: 0.06 }, text: 'You refused even to meet a six percent holder. That is held against the board.' },
          { when: (run) => !!fl(run).hostile, sway: { governance: 0.06, jobs: -0.05 }, text: 'Your television attack rallied staff and irritated institutions.' },
        ],
        actions: [
          { id: 'top20', name: 'Meet the twenty largest holders with the numbers', cost: 1, sway: { value: -0.09 }, q: 3, desc: 'One hour each, chair and lead independent director in the room.' },
          { id: 'refresh', name: 'Appoint two new independent directors of your own', cost: 1, sway: { governance: -0.14 }, q: 3, desc: 'With medical-device and capital-allocation experience. It answers the charge of a stale board.', teaches: ['board_refresh'] },
          { id: 'advisers', name: 'Present to the proxy advisory firms', cost: 1, sway: { advisers: -0.14 }, q: 3, desc: 'Their recommendation moves a tenth of the register by itself.', teaches: ['proxy_adviser'] },
          { id: 'solicit', name: 'Hire a proxy solicitor and call every retail holder', cost: 1, reveals: true, sway: { loyal: -0.05 }, q: 2, desc: 'Learn the real numbers bloc by bloc, and get your supporters to actually vote.' },
          { id: 'pay', name: 'Tie executive pay to total shareholder return', cost: 1, sway: { governance: -0.05, value: -0.05 }, q: 2, desc: 'Put your own money where the plan is.' },
          { id: 'smear', name: 'Publish a dossier on Cormorant\'s failed campaigns', cost: 1, sway: { governance: 0.05, loyal: -0.04 }, effects: { heat: 12 }, q: 0, desc: 'Three companies it "fixed" that later went bankrupt.', coach: 'The vote is about your record, not hers. Institutions punish boards that campaign negatively.' },
          { id: 'delay', name: 'Postpone the annual meeting by two months', cost: 1, sway: { governance: 0.14, advisers: 0.1 }, effects: { heat: 10, street: -6 }, q: 0, desc: 'Buy time on a technicality.', coach: 'Manipulating the meeting date is the surest way to lose the governance vote.' },
        ],
        teaches: ['proxy_fight', 'shareholder_vote'],
      },
      {
        id: 'sep', type: 'integration', title: 'Taking it apart', capacity: 3, when: (run) => fl(run).plan !== 'quo' && !ousted(run),
        gauges: { capture: 'Separation readiness', morale: 'Morale', customers: 'Customers' },
        intro: 'A separation is an integration run backwards. Every shared system, contract, pension and patent has to end up on one side or the other, and both companies have to work on the first morning. Three units of attention per phase.',
        phases: ['Announcement', 'Month 4', 'Month 9', 'Month 15'],
        start: (run) => ({ capture: 0, morale: 58 + Math.round((run.deal.meters.people - 60) / 4) - (fl(run).plan === 'full' ? 6 : 0), customers: 82 }),
        initiatives: [
          { id: 'teams', name: 'Name each company\'s leadership now', track: 'people', cost: 1, morale: 10, capture: 6, until: 0, q: 3, desc: 'Everyone learns on the first day which company they belong to and who leads it.' },
          { id: 'tax', name: 'Secure the tax ruling', track: 'structure', cost: 1, capture: 12, until: 1, when: (run) => fl(run).plan !== 'sell', q: 3, desc: 'A spin-off is only tax-free if it is built that way from the start.', teaches: ['spin_off'] },
          { id: 'tsa', name: 'Transitional service agreements between the companies', track: 'structure', cost: 1, capture: 16, q: 3, desc: 'Who runs payroll, IT and treasury for whom, at what price, for how long.', teaches: ['tsa'] },
          { id: 'it', name: 'Clone and separate the IT systems', track: 'systems', cost: 2, capture: 22, from: 1, q: 3, desc: 'The long pole in every separation.', risk: { p: 0.2, text: 'Order data is corrupted in the split. A week of manual invoicing follows.', customers: -6 } },
          { id: 'capital', name: 'Give each company a balance sheet it can live with', track: 'structure', cost: 1, capture: 14, from: 1, q: 3, desc: 'Debt and pensions allocated by ability to carry them. Both rated investment grade.' },
          { id: 'dump', name: 'Load the group\'s debt and pensions onto the business being separated', track: 'structure', cost: 1, capture: 16, morale: -6, from: 1, q: 0, desc: 'Makes what you keep look wonderful.', risk: { p: 0.65, text: 'Rating agencies cut the new company to junk before it lists. The shares your holders receive open far below the bankers\' range.', capture: -24 }, coach: 'Your shareholders own both halves. Crippling one to flatter the other moves value from their left pocket to nowhere.' },
          { id: 'sale', name: 'Run a competitive sale for Orion Home', track: 'structure', cost: 2, capture: 20, from: 1, when: (run) => fl(run).plan === 'sell' || fl(run).plan === 'full', q: 3, desc: 'Trade buyers and private equity, two rounds, a proper data room.', teaches: ['auction_process'] },
          { id: 'quick', name: 'Sell Orion Home to the first serious bidder', track: 'structure', cost: 1, capture: 10, from: 1, when: (run) => fl(run).plan === 'sell' || fl(run).plan === 'full', q: 1, desc: 'A known private-equity firm, a fast answer.', coach: 'One bidder means one price: theirs.' },
          { id: 'stranded', name: 'Remove the stranded head-office costs', track: 'costs', cost: 1, capture: 14, morale: -5, from: 2, q: 3, desc: 'A head office built for three businesses cannot be left sitting on one.', teaches: ['stranded_costs'] },
          { id: 'cust', name: 'Tour the shared customers and move the contracts', track: 'customers', cost: 1, customers: 10, capture: 4, q: 2, desc: 'Hospitals and airlines want to know who they will be dealing with.' },
          { id: 'keep', name: 'Retention awards for the engineers both sides want', track: 'people', cost: 1, morale: 9, from: 1, q: 2, desc: 'Two hundred people whose skills do not divide neatly.', teaches: ['key_person'] },
        ],
        events: [
          { id: 'limbo', phase: 0, when: (s) => !s.done.includes('teams'), p: 0.85, text: 'Nobody knows which company they will work for. Recruiters do.', fx: { morale: -10 } },
          { id: 'poach', phase: 1, when: (s) => s.morale < 50, p: 0.75, text: 'A rival hires Orion Health\'s head of research and her team.', fx: { capture: -8, morale: -4 } },
          { id: 'notsa', phase: 2, when: (s) => !s.done.includes('tsa'), p: 0.9, text: 'With no service agreements in place, lawyers spend the summer arguing over who owns the payroll system.', fx: { capture: -10 } },
          { id: 'cust', phase: 2, when: (s) => s.customers < 72, p: 0.7, text: 'A hospital group puts its device contract out to tender, citing "uncertainty".', fx: { capture: -6, customers: -4 } },
          { id: 'clean', phase: 3, when: (s) => s.capture >= 70 && s.morale >= 55, p: 0.8, good: true, text: 'Both companies close their first quarter\'s books on time. Analysts initiate coverage with the word "clean".', fx: { capture: 6 } },
        ],
        teaches: ['spin_off'], teachesOnEnd: ['stranded_costs'],
      },
    ],

    resolve(run) {
      const f = fl(run), t = run.truth, plan = f.plan || 'quo', b = best(run);
      let realised, tag;
      if (ousted(run)) { realised = t.full * 0.5 - 4; tag = 'ousted'; }
      else if (plan === 'quo') { realised = t.quo; tag = b - net(run, 'quo') < 3 ? 'steady' : 'value_trap'; }
      else {
        const e = run.deal.integ ? U.clamp(run.deal.integ.factor / 0.8, 0.15, 1.1) : 0.6;
        realised = (t[plan] > 0 ? t[plan] * e : t[plan]) - (1 - Math.min(1, e)) * 5 - SEP_COST[plan];
        tag = realised >= 8 ? 'rerated' : realised >= 2 ? 'unlocked' : realised >= -2 ? 'flat' : 'botched';
      }
      let price = 90 + (realised - b) * 3.4;
      if (tag === 'ousted') price = Math.min(price, 50);
      const risk = 88 - Math.max(0, run.deal.meters.heat - 50) * 0.7 - (run.deal.integ && run.deal.integ.done.includes('dump') ? 20 : 0);
      const v = S().assemble(run, { price, risk });
      if (tag === 'ousted') { v.overall = Math.min(v.overall, 52); v.grade = S().letter(v.overall); v.stars = v.overall >= 42 ? 1 : 0; v.xp = Math.round(v.overall * 1.4); }
      const T = {
        rerated: ['Worth more apart', 'The discount was real, you chose the right way to close it, and you carried out the separation cleanly. Your shareholders now own businesses the market understands.', 'good'],
        unlocked: ['Some value released', 'The separation delivered a gain, though less than was there for the taking. Either a better option existed or the execution leaked.', 'good'],
        flat: ['A lot of work for nothing', 'After eighteen months of lawyers and bankers, your shareholders own roughly what they owned before, in more pieces.', 'bad'],
        botched: ['Broken up, and broken', 'The separation cost more than it released. The parts were worth more than the whole only if they still worked afterwards.', 'bad'],
        steady: ['The group was right', 'You kept Orion together, and the evidence says that was the best course available. The activist was wrong and you could show it.', 'good'],
        value_trap: ['The discount stays', 'You defended the structure and kept your board. Your shareholders are still waiting for value that a separation would have released.', 'bad'],
        ousted: ['Under new management', 'Cormorant now controls the board and is breaking the group up in a hurry, without you. A forced separation by people who never ran the businesses rarely fetches full value.', 'bad'],
      }[tag];
      v.outcome = { tag, title: T[0], text: T[1], tone: T[2] };
      v.done = tag !== 'ousted'; v.value = realised / 100 * MCAP;
      v.facts = [
        ['The course taken', tag === 'ousted' ? 'Forced break-up under a new board' : NAMES[plan]],
        ['Change in shareholder value', (realised >= 0 ? '+' : '') + realised.toFixed(1) + '% (' + U.money(realised / 100 * MCAP, '$ m') + ')'],
      ].concat(Object.keys(SEP_COST).map((p) => ['True worth of "' + NAMES[p] + '", done well', (net(run, p) >= 0 ? '+' : '') + net(run, p).toFixed(1) + '%']));
      v.headline = {
        rerated: 'Orion\'s parts soar as separate companies; chief executive vindicated',
        unlocked: 'Orion separation completes; investors see modest gains',
        flat: 'Orion break-up leaves shareholders where they started',
        botched: 'Orion\'s messy split wipes out the value it promised',
        steady: 'Orion sees off Cormorant and delivers as one group',
        value_trap: 'Orion wins the vote, but the shares go nowhere',
        ousted: 'Cormorant takes control of Orion; chief executive to leave',
      }[tag];
      return v;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
