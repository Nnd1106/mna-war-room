/* Deal File 5: LEVER. A leveraged buyout of a corporate carve-out. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const S = () => WR.sim.score;
  const fl = (run) => run.deal.flags;
  const leverP = (base) => (run) => U.clamp(base + (fl(run).aligned ? 0.12 : 0) - (fl(run).salaried ? 0.1 : 0) + (fl(run).newCeo === 'good' ? 0.08 : 0) - (fl(run).newCeo === 'bad' ? 0.2 : 0), 0.05, 0.95);

  WR.data.files.lever = {
    id: 'lever', n: 5, code: 'LEVER', title: 'Other People\'s Money', type: 'Leveraged buyout',
    seat: 'Partner, Ironbridge Capital', difficulty: 2, unit: '$ m', image: 'lever.jpg',
    tagline: 'A conglomerate is shedding its diagnostics arm. Buy it with as much debt as it can carry, and not a dollar more.',
    learn: ['How an LBO makes its return', 'Carve-outs and transitional services', 'Aligning management with sweet equity', 'How much debt is too much', 'Why the exit matters as much as the entry'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'The orphan division',
        text: [
          '<b>Solace Diagnostics</b> runs 310 pathology labs and collection centres. It belongs to Castellan Industries, a conglomerate that makes cables, paint and, for reasons nobody remembers, blood tests. Castellan\'s new chief executive has promised investors a simpler group. Solace is for sale.',
          'Solace earns about $176 million of EBITDA on $800 million of revenue, and has been starved of investment for years. Your fund, Ironbridge Capital, would buy it mostly with borrowed money, improve it for five years or so and sell it. Your investors expect twenty percent a year.',
          'A buyout return comes from three places: paying down debt with the company\'s own cash, growing the profits, and selling at a higher multiple than you paid. Only the first two are in your hands. Debt magnifies everything, in both directions.',
        ],
        cast: [
          { name: 'Gareth Lindqvist', role: 'Chief Financial Officer, Castellan Industries', line: 'I have a board meeting in nine weeks and I would like this off my desk before it.' },
          { name: 'Dr Asha Menon', role: 'Managing Director, Solace Diagnostics', line: 'Twelve years of asking head office for a new lab system. Are you going to be any different?' },
        ],
        teaches: ['lbo_basics', 'carve_out'],
      },
      {
        id: 'angle', type: 'decision', title: 'Getting to the table',
        prompt: 'Castellan has not hired a bank yet. How do you approach the sale?',
        options: [
          { id: 'direct', label: 'Go to the CFO now with a fully financed proposal and ask for six weeks of exclusivity', q: 3, effects: { days: 10, board: 4 }, set: { exclusive: true },
            outcome: 'Gareth Lindqvist likes certainty more than he likes the last dollar. He grants exclusivity on condition you can close before his board meeting.',
            coach: 'A proprietary deal avoids an auction. Sellers will trade some price for speed and certainty, which is the cheapest thing a prepared buyer can offer.' },
          { id: 'wait', label: 'Wait for the formal auction and bid with everyone else', q: 1, effects: { days: 30 },
            outcome: 'Castellan hires a bank. Seven funds receive the information memorandum on the same morning as you.',
            coach: 'An auction is where returns go to die. If you can see a deal before it is a process, move.' },
          { id: 'club', label: 'Team up with a rival fund to share the cheque and remove a competitor', q: 2, effects: { days: 15 }, set: { club: true },
            outcome: 'Halcyon Partners takes forty percent. One fewer bidder, one more opinion on every decision for the next five years.',
            coach: 'Club deals reduce competition and spread risk, but two sponsors rarely agree on when to sell.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'Inside the carve-out', days: 8,
        intro: 'Solace has never been a stand-alone company: its accounts are an extract from Castellan\'s ledger. You have eight analyst-days. What you find becomes a price chip in the negotiation; what you miss comes out of your own equity later.',
        streams: [
          { id: 'fin', name: 'Carve-out financials', desc: 'Allocated costs, stand-alone costs, cash conversion' },
          { id: 'com', name: 'Commercial', desc: 'Referring doctors, hospital contracts, pricing' },
          { id: 'ops', name: 'Labs and systems', desc: 'Equipment, IT, accreditation' },
          { id: 'ppl', name: 'People', desc: 'Pathologists, management, pensions' },
          { id: 'leg', name: 'Legal and regulatory', desc: 'Licences, billing practices, leases' },
        ],
        issues: [
          { id: 'standalone', stream: 'fin', depth: 1, kind: 'flag', p: 0.85, impact: -70, chip: 60, title: 'Stand-alone costs are understated', text: 'Castellan charges Solace almost nothing for treasury, legal, payroll and IT. On its own, Solace will need $9 million a year of costs that are not in the numbers.', teaches: ['carve_out'] },
          { id: 'capex', stream: 'ops', depth: 2, kind: 'flag', p: 0.6, impact: -60, chip: 45, title: 'Analysers past replacement', text: 'A third of the lab analysers are beyond their service life. Castellan has deferred the spend three years running.' },
          { id: 'it', stream: 'ops', depth: 1, kind: 'flag', p: 0.7, impact: -40, chip: 30, title: 'No lab system of its own', text: 'Solace runs on a corner of Castellan\'s ERP. Separating it will take eighteen months, not the six in the seller\'s plan.', teaches: ['tsa'] },
          { id: 'billing', stream: 'leg', depth: 2, kind: 'flag', p: 0.3, impact: -90, chip: 70, title: 'Referral fees to doctors', text: 'Two regions pay "consultancy fees" to referring physicians. A regulator would call them something else.', teaches: ['red_flags'] },
          { id: 'hospital', stream: 'com', depth: 2, kind: 'gem', p: 0.5, impact: 60, title: 'Hospital outsourcing pipeline', text: 'Four hospital groups have asked Solace to run their in-house labs. Castellan never funded the bids.' },
          { id: 'paths', stream: 'ppl', depth: 2, kind: 'flag', p: 0.45, impact: -35, chip: 20, title: 'Senior pathologists near retirement', text: 'Eleven of the forty lead pathologists retire within three years and there is no succession plan.', teaches: ['key_person'] },
          { id: 'leases', stream: 'leg', depth: 1, kind: 'gem', p: 0.4, impact: 30, title: 'Below-market leases', text: 'Sixty collection centres sit on long leases signed a decade ago at half today\'s rents.' },
        ],
        coachPlan: ['fin', 'ops', 'ops', 'leg', 'leg'],
        teaches: ['dd_scope'],
      },
      {
        id: 'mgmt', type: 'decision', title: 'The people who will run it',
        prompt: 'Dr Menon and her team have never owned a share in anything. What do you offer them?',
        options: [
          { id: 'sweet', label: 'Ten percent of the equity on favourable terms, vesting over four years, if they invest some of their own money', q: 3, effects: { people: 8 }, set: { aligned: true },
            outcome: 'Dr Menon remortgages her flat to buy in. For the first time in twelve years she asks to see the capital budget line by line.',
            coach: 'Sweet equity makes managers think like owners. It is the cheapest lever in private equity, and the one the whole plan depends on.', teaches: ['mgmt_equity'] },
          { id: 'salary', label: 'Keep them on salary with a cash bonus; the equity stays with the fund', q: 0, effects: { people: -6 }, set: { salaried: true },
            outcome: 'Management notes that the fund will make several hundred million dollars from their work, and that they will make a bonus.',
            coach: 'You are asking a team to work harder than ever under more debt than ever. Paying them like employees gets you employees.' },
          { id: 'replace', label: 'Bring in a chief executive from your own bench of operating partners', q: 1, effects: { people: -4 },
            outcome: 'You install a former consumer-goods chief executive above Dr Menon.',
            roll: { p: 0.45, win: { text: 'He turns out to be a quick study, and keeps her as his number two.', set: { newCeo: 'good', aligned: true } }, lose: { text: 'He has never set foot in a pathology lab. Dr Menon resigns within the quarter and two regional heads follow.', set: { newCeo: 'bad' }, effects: { people: -10 } } },
            coach: 'Replacing a capable manager with an outsider is a coin toss with the company as the stake. Do it when management is the problem, not as a habit.' },
        ],
      },
      {
        id: 'talks', type: 'negotiation', title: 'The price of an orphan', rounds: 5, probes: 2, failEnd: 'collapsed',
        threshold: (run) => 60 - (fl(run).exclusive ? 4 : 0) + (fl(run).club ? 2 : 0),
        intro: 'Enterprise value, and four things that matter almost as much. Gareth Lindqvist will not tell you which of them his board cares about.',
        counterpart: { name: 'Gareth Lindqvist', role: 'CFO, Castellan Industries' },
        youWeights: { price: 3, tsa: 1.5, note: 1.5, staff: 0.5, speed: 1 },
        issues: [
          { id: 'price', name: 'Enterprise value', desc: 'Before any reductions for what you found in diligence', options: [
            { id: 'p1', label: '$1,640m (9.3x)', you: 100, them: 10, price: 1640 }, { id: 'p2', label: '$1,720m (9.8x)', you: 74, them: 45, price: 1720 },
            { id: 'p3', label: '$1,800m (10.2x)', you: 45, them: 75, price: 1800 }, { id: 'p4', label: '$1,880m (10.7x)', you: 12, them: 100, price: 1880 }] },
          { id: 'tsa', name: 'Transitional services', desc: 'How long Castellan keeps running IT, payroll and treasury for Solace', options: [
            { id: 't1', label: 'Six months', you: 15, them: 100 }, { id: 't2', label: 'Twelve months', you: 60, them: 65 }, { id: 't3', label: 'Twenty-four months at cost', you: 100, them: 20, set: { tsaLong: true } }] },
          { id: 'note', name: 'Vendor loan note', desc: 'Castellan leaves part of the price in as a loan', options: [
            { id: 'n0', label: 'None: all cash', you: 30, them: 100 }, { id: 'n1', label: '$100m, repaid at exit', you: 75, them: 55, set: { vendorNote: true } }, { id: 'n2', label: '$200m, repaid at exit', you: 100, them: 20, set: { vendorNote: true } }] },
          { id: 'staff', name: 'Commitments to staff', desc: 'Promises Castellan can announce', options: [
            { id: 's0', label: 'None', you: 100, them: 20 }, { id: 's1', label: 'No lab closures for two years', you: 70, them: 75, effects: { people: 4 } }, { id: 's2', label: 'No redundancies for three years', you: 25, them: 100, effects: { people: 8 }, set: { noCuts: true } }] },
          { id: 'speed', name: 'Timetable', desc: 'When the money arrives', options: [
            { id: 'q1', label: 'Sign and close inside eight weeks', you: 55, them: 100 }, { id: 'q2', label: 'Close in four months, after separation planning', you: 100, them: 35 }] },
        ],
        profiles: [
          { id: 'clean', weights: { speed: 3, note: 2.5, tsa: 1.5, price: 1.5, staff: 0.5 }, tell: 'He wanted a clean, fast exit before his board meeting. He would have taken a lower price for all cash in eight weeks.' },
          { id: 'headline', weights: { price: 3.5, note: 0.5, tsa: 1, staff: 1, speed: 1 }, tell: 'His chief executive had told analysts a number. The headline price was everything; a vendor loan that kept the headline high cost him nothing.' },
          { id: 'legacy', weights: { staff: 3, price: 2, tsa: 1, note: 1, speed: 1 }, tell: 'Castellan is the largest employer in two of Solace\'s towns. What the press release said about jobs mattered more than the last fifty million.' },
        ],
        teaches: ['tsa'], teachesOnEnd: ['logrolling'],
      },
      {
        id: 'lbo', type: 'lbo', title: 'Building the structure',
        intro: 'Choose how much to borrow, how long to hold and where the growth will come from. The plan case assumes the world behaves. It will not tell you which world you get.',
        base: { revenue: 800, ebitMargin: 0.17, daPct: 0.05, capexPct: 0.045, nwcPct: 0.08, tax: 0.25, growth: 0.05 },
        entryEv: (run) => (run.deal.price || 1800) - (run.deal.dd ? run.deal.dd.chips : 0),
        exitMultiple: 9.8, covenant: 1.75, maxLevers: 3,
        senior: [2, 5.5, 4], sub: [0, 2.5, 1], hold: [3, 7, 5], rates: { senior: 0.085, sub: 0.125 },
        levers: [
          { id: 'procure', name: 'Consolidate labs and reagent buying', desc: 'Close duplicate labs in six cities; one reagent contract.', margin: 0.025, p: leverP(0.75), q: 3, teaches: ['value_creation'] },
          { id: 'rollup', name: 'Buy and build', desc: 'Acquire forty small independent labs at low multiples and plug them in.', growth: 0.04, capex: 0.01, p: leverP(0.6), fail: { growth: 0.005 }, q: 3, teaches: ['buy_and_build'] },
          { id: 'hospital', name: 'Run hospitals\' in-house labs', desc: 'Long outsourcing contracts with hospital groups.', growth: 0.03, margin: -0.004, p: (run) => U.clamp(leverP(0.6)(run) + (run.deal.dd && run.deal.dd.found.includes('hospital') ? 0.2 : 0), 0, 0.95), q: 3 },
          { id: 'home', name: 'Home collection and an app', desc: 'A direct-to-patient channel in the metros.', growth: 0.03, capex: 0.008, p: leverP(0.5), fail: { margin: -0.006 }, q: 2 },
          { id: 'price', name: 'Raise test prices eight percent', desc: 'The quickest way to more profit.', margin: 0.03, p: () => 0.35, fail: { growth: -0.04 }, q: 0, coach: 'Referring doctors and insurers notice price rises at once. When it fails you lose volume, not just the increase.' },
          { id: 'slash', name: 'Cut fifteen percent of staff', desc: 'Costs out in the first hundred days.', margin: 0.03, p: (run) => (fl(run).noCuts ? 0.05 : 0.45), fail: { growth: -0.035, margin: -0.005 }, q: 1, coach: 'Cutting muscle with the fat is how buyouts earn their reputation. Turnaround times slip, and doctors send samples elsewhere.' },
        ],
        scenarios: [
          { id: 'base', name: 'Steady growth', w: 5, text: 'The economy behaved. Volumes grew roughly as planned and buyers paid normal multiples at exit.' },
          { id: 'slump', name: 'Recession in year two', w: 2, growth: -0.07, exit: -1.5, text: 'A recession cut elective testing and insurers squeezed tariffs. Exit multiples fell by a turn and a half.' },
          { id: 'rates', name: 'Rate shock', w: 2, rate: 0.03, exit: -1.0, text: 'Interest rates rose three points. Floating-rate debt cost far more, and buyers paid less.' },
          { id: 'boom', name: 'Healthcare boom', w: 1, growth: 0.02, exit: 1.5, text: 'Diagnostics became the market\'s favourite sector just as you came to sell.' },
        ],
        coach: { senior: 3.8, sub: 0.8, hold: 5, levers: ['procure', 'rollup', 'hospital'] },
        teaches: ['leverage', 'covenant'], teachesOnEnd: ['exit_multiple', 'value_creation'],
      },
    ],

    resolve(run) {
      const L = run.deal.lbo, dd = run.deal.dd, f = fl(run);
      if (!L) {
        const v = S().assemble(run, { price: 45, risk: 70 });
        v.overall = Math.min(v.overall, 55); v.grade = S().letter(v.overall); v.stars = v.overall >= 42 ? 1 : 0; v.xp = Math.round(v.overall);
        v.outcome = { tag: 'collapsed', title: 'No deal', text: 'Castellan lost patience and called a bank. Solace will be sold in an auction you now have to win like everyone else.', tone: 'bad' };
        v.done = false; v.value = 0;
        v.facts = [['Rounds of talks', String(run.deal.nego && run.deal.nego.talks ? run.deal.nego.talks.rounds : 0)]];
        v.headline = 'Castellan to auction Solace after exclusive talks fail';
        return v;
      }
      // what diligence missed comes out of the equity at exit; the separation hurts if the TSA was too short
      const hit = (dd ? dd.hidden : 0) - (f.tsaLong ? 0 : 25) + (f.vendorNote ? 10 : 0);
      let moic = Math.max(0, L.moic + hit / Math.max(1, L.equity));
      let irr = moic > 0 ? Math.pow(moic, 1 / L.plan.hold) - 1 : -1;
      const pts = [[-1, 5], [0, 32], [0.08, 52], [0.15, 70], [0.2, 84], [0.25, 95], [0.4, 100]];
      let price = 5;
      for (let i = 1; i < pts.length; i++) { if (irr <= pts[i][0]) { price = U.lerp(pts[i - 1][1], pts[i][1], (irr - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); break; } price = pts[i][1]; }
      const lev = L.plan.senior + L.plan.sub;
      const risk = S().riskBase(run, 1800) - Math.max(0, lev - 4.8) * 22;
      const tag = L.breach ? 'keys' : irr >= 0.25 ? 'homerun' : irr >= 0.15 ? 'solid' : irr >= 0 ? 'meh' : 'loss';
      const v = S().assemble(run, { price, risk });
      const T = {
        homerun: ['A fund-maker', 'You paid a fair price, used sensible debt and backed levers that worked. Your investors more than doubled their money.', 'good'],
        solid: ['A good buyout', 'Not every lever worked and the world was not always kind, but the structure held and the return beat the cost of the money.', 'good'],
        meh: ['Money back, plus a little', 'Five years of work for a return your investors could have had from an index fund. The entry price or the plan was too hopeful.', 'bad'],
        loss: ['A loss', 'You sold for less than you put in. The debt was serviced, but the equity bore every disappointment.', 'bad'],
        keys: ['The lenders take the keys', 'Earnings fell, interest did not, and the covenant broke. The banks now own Solace. Leverage did exactly what it always does: it magnified the outcome.', 'bad'],
      }[tag];
      v.outcome = { tag, title: T[0], text: T[1], tone: T[2] };
      v.done = true; v.value = (moic - 1) * L.equity;
      v.facts = [
        ['Entry enterprise value', U.money(WR.sim.lbo.entryEv(run, run.file.stages.find((s) => s.id === 'lbo')), '$ m')],
        ['Debt at entry', (L.plan.senior + L.plan.sub).toFixed(1) + 'x EBITDA'],
        ['Equity cheque', U.money(L.equity, '$ m')],
        ['The world you got', L.scenarioName],
        ['Plan-case return', U.pct(L.planCase.irr, 1) + ' a year'],
        ['Realised return', (irr <= -1 ? 'total loss' : U.pct(irr, 1) + ' a year') + ' (' + moic.toFixed(2) + 'x money)'],
      ];
      v.headline = {
        homerun: 'Ironbridge sells Solace for more than twice its money',
        solid: 'Ironbridge exits Solace Diagnostics with "solid" return',
        meh: 'Ironbridge sells Solace after long hold; return said to be modest',
        loss: 'Ironbridge takes a loss on Solace sale',
        keys: 'Lenders seize Solace Diagnostics as buyout debt proves too heavy',
      }[tag];
      return v;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
