/* Deal File 1: FIREFLY. A friendly tuck-in of a founder-led brand. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const S = () => WR.sim.score;

  WR.data.files.firefly = {
    id: 'firefly', n: 1, code: 'FIREFLY', title: 'The Founder\'s Brand', type: 'Friendly tuck-in acquisition',
    seat: 'Head of Corporate Development, Kaveri Consumer', difficulty: 1, unit: '₹ cr', image: 'firefly.jpg',
    tagline: 'A beloved millet-snack brand, a founder who is not sure she wants to sell, and a board that wants growth.',
    learn: ['How to approach a founder', 'Scoping due diligence', 'Which synergies to believe', 'Trading across issues', 'The first 100 days'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'The mandate',
        text: [
          'Kaveri Consumer sells biscuits and noodles in every kirana store in the country, and its growth has stalled at four percent. Your chief executive has circled one name on the strategy deck: <b>Firefly Foods</b>, a seven-year-old millet-snack brand with a cult following in the metros, built by its founder Meera Rao from a rented kitchen in Indiranagar.',
          'Firefly last raised money at a valuation of ₹900 crore. It is growing at 45 percent a year, barely breaks even, and is stocked in only 30,000 outlets. Kaveri reaches four million.',
          'Meera has turned down two approaches before. Your job is to find out whether there is a deal here that is good for Kaveri, and to walk away if there is not.',
        ],
        cast: [
          { name: 'Meera Rao', role: 'Founder and CEO, Firefly Foods', line: 'I did not build this to watch it become a line extension.' },
          { name: 'Arvind Shastri', role: 'CEO, Kaveri Consumer (your boss)', line: 'Get me this brand. But do not embarrass me on price.' },
        ],
        teaches: ['stakeholder_map'],
      },
      {
        id: 'approach', type: 'decision', title: 'The first approach',
        prompt: 'How do you open the conversation with Meera Rao?',
        options: [
          { id: 'dinner', label: 'Ask for a quiet dinner and mostly listen', q: 3, effects: { people: 6, days: 10 }, set: { rapport: true },
            outcome: 'Meera talks for two hours about farmers, recipes and the investors who want an exit. You say little. She agrees to open the books.',
            coach: 'Founders sell to people before they sell to companies. Listening first buys trust and information for free.', teaches: ['approach'] },
          { id: 'banker', label: 'Send a formal letter through your investment banker', q: 1, effects: { days: 14, heat: 4 },
            outcome: 'The letter is correct and cold. Meera forwards it to her investors, who start calling other buyers. You get access, but so might others.',
            coach: 'A formal approach is safe but tells a founder she is a transaction. It also invites competition.' },
          { id: 'lowball', label: 'Send a term sheet at ₹850 crore to anchor low', q: 0, effects: { people: -10, heat: 10, days: 7 }, set: { insulted: true },
            outcome: 'Meera reads the number, below her last round, as an insult. Her reply is one line long. It takes Arvind\'s personal call to get you back in the room.',
            coach: 'Anchoring works on price. Opening below the last funding round with a founder who does not need to sell destroys the relationship you need later.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'The data room', days: 9,
        intro: 'Firefly has opened a data room for three weeks. Your team has nine analyst-days. Going deeper in a workstream costs more each time: 1, then 2, then 3 days.',
        streams: [
          { id: 'fin', name: 'Financials', desc: 'Quality of earnings, working capital, related parties' },
          { id: 'com', name: 'Commercial', desc: 'Customers, channels, repeat rates, pipeline' },
          { id: 'ops', name: 'Operations', desc: 'Manufacturing, sourcing, quality' },
          { id: 'ppl', name: 'People and culture', desc: 'Key talent, attrition, incentives' },
          { id: 'leg', name: 'Legal and IP', desc: 'Trademarks, licences, notices, contracts' },
        ],
        issues: [
          { id: 'stuffing', stream: 'fin', depth: 2, kind: 'flag', p: 0.5, impact: -70, chip: 50, title: 'Channel stuffing', text: 'A fifth of last quarter\'s sales went to three distributors on 120-day credit, and returns are spiking. Real growth is closer to 30 percent than 45.', teaches: ['red_flags'] },
          { id: 'loans', stream: 'fin', depth: 3, kind: 'flag', p: 0.35, impact: -45, chip: 35, title: 'Loans to a promoter entity', text: 'Firefly has lent ₹45 crore to a packaging company owned by the founder\'s family. It is unlikely to come back.' },
          { id: 'repeat', stream: 'com', depth: 2, kind: 'gem', p: 0.6, impact: 80, title: 'Exceptional repeat rate', text: 'Sixty-two percent of online customers reorder within 60 days, twice the category norm. The brand is stronger than management\'s own deck claims.' },
          { id: 'export', stream: 'com', depth: 3, kind: 'gem', p: 0.4, impact: 50, title: 'Signed export pipeline', text: 'Two Gulf retail chains have signed letters of intent that are not in the forecast.' },
          { id: 'copack', stream: 'ops', depth: 1, kind: 'flag', p: 0.7, impact: -40, chip: 30, title: 'Single co-packer', text: 'Eighty percent of volume comes from one contract manufacturer whose agreement can be ended on 90 days\' notice.' },
          { id: 'product', stream: 'ppl', depth: 2, kind: 'flag', p: 0.5, impact: -30, chip: 15, title: 'Head of product has one foot out', text: 'The person behind every hit recipe holds no unvested equity and has been interviewing.', teaches: ['key_person'] },
          { id: 'tm', stream: 'leg', depth: 2, kind: 'flag', p: 0.6, impact: -60, chip: 40, title: 'The trademark belongs to the founder', text: 'The Firefly word mark is registered in Meera Rao\'s own name and licensed to the company year by year.', teaches: ['red_flags'] },
          { id: 'label', stream: 'leg', depth: 1, kind: 'flag', p: 0.4, impact: -20, chip: 10, title: 'Labelling notice', text: 'The food regulator has issued a notice over a "no added sugar" claim. A relabelling will be needed.' },
        ],
        coachPlan: ['fin', 'fin', 'leg', 'leg', 'com', 'com'],
        teaches: ['dd_scope'], teachesOnClose: ['red_flags'],
      },
      {
        id: 'price', type: 'pricing', title: 'What is it worth to Kaveri?', ddStage: 'dd',
        intro: 'Your bankers have listed the synergies. Decide how much of each claim you believe, then set the price above which you will walk away.',
        market: 900, standalone: { mid: 950, noise: 0.03 }, cap: 8, integrationCost: 60,
        synergies: [
          { id: 'reach', name: 'Firefly through Kaveri\'s distribution', kind: 'revenue', runRate: 30, range: [0.3, 0.9], coach: 0.5 },
          { id: 'buy', name: 'Joint procurement of grains and packaging', kind: 'cost', runRate: 12, range: [0.7, 1.1], coach: 0.8 },
          { id: 'cross', name: 'Cross-selling into modern trade', kind: 'revenue', runRate: 18, range: [0.1, 0.7], coach: 0.3 },
          { id: 'back', name: 'Shared back office', kind: 'cost', runRate: 6, range: [0.8, 1.1], coach: 0.9 },
        ],
        teaches: ['synergy_types'], teachesOnLock: ['walkaway'],
      },
      {
        id: 'talks', type: 'negotiation', title: 'Across the table from Meera', rounds: 5, probes: 2, failEnd: 'collapsed',
        threshold: (run) => 62 + (run.deal.flags.insulted ? 6 : 0) - (run.deal.flags.rapport ? 4 : 0),
        intro: 'Five issues are on the table. Meera will not tell you which of them matter most to her. You have two careful questions and five rounds.',
        counterpart: { name: 'Meera Rao', role: 'Founder, Firefly Foods' },
        youWeights: { price: 2.5, structure: 1.5, role: 1.5, brand: 1, team: 1 },
        issues: [
          { id: 'price', name: 'Headline price', desc: 'For 100 percent of Firefly', options: [
            { id: 'p1', label: '₹960 crore', you: 100, them: 15, price: 960 }, { id: 'p2', label: '₹1,020 crore', you: 75, them: 50, price: 1020 },
            { id: 'p3', label: '₹1,090 crore', you: 45, them: 78, price: 1090 }, { id: 'p4', label: '₹1,160 crore', you: 12, them: 100, price: 1160 }] },
          { id: 'structure', name: 'How it is paid', desc: 'Cash now, or part of it earned later', options: [
            { id: 's1', label: 'All cash at closing', you: 30, them: 100 }, { id: 's2', label: '20% as a three-year earn-out', you: 72, them: 62, set: { earnout: true } },
            { id: 's3', label: '35% as a three-year earn-out', you: 100, them: 25, set: { earnout: true } }] },
          { id: 'role', name: 'Meera\'s role', desc: 'What the founder does after closing', options: [
            { id: 'r1', label: 'Leaves at closing', you: 20, them: 30 }, { id: 'r2', label: 'Stays as CEO for two years with real autonomy', you: 100, them: 100, set: { founderStays: true } },
            { id: 'r3', label: 'Stays, reporting to a Kaveri category head', you: 60, them: 10, set: { founderStays: true } }] },
          { id: 'brand', name: 'The brand', desc: 'How independent Firefly remains', options: [
            { id: 'b1', label: 'Folded into the Kaveri master brand', you: 55, them: 0, set: { brandFolded: true } }, { id: 'b2', label: 'Brand kept, back end shared', you: 100, them: 72 },
            { id: 'b3', label: 'Separate subsidiary, own everything', you: 35, them: 100 }] },
          { id: 'team', name: 'The team', desc: 'What Firefly\'s 240 people get', options: [
            { id: 't1', label: 'Standard Kaveri terms', you: 100, them: 10 }, { id: 't2', label: 'Stock options rolled into Kaveri', you: 72, them: 70, set: { teamKept: true } },
            { id: 't3', label: 'Rollover plus a two-year job guarantee', you: 40, them: 100, set: { teamKept: true } }] },
        ],
        profiles: [
          { id: 'legacy', weights: { brand: 3, role: 2.5, team: 2, price: 1, structure: 1 }, tell: 'What she cared about most was what happens to the brand and to her place in it. Price came second.' },
          { id: 'exit', weights: { price: 3, structure: 2.5, role: 0.5, brand: 1, team: 1 }, tell: 'Her early investors wanted out. Price and cash at closing mattered far more than anything else.' },
          { id: 'team', weights: { team: 3, role: 2, price: 1.5, brand: 1.5, structure: 1 }, tell: 'She had promised her first 50 employees they would be looked after. The team terms were the key.' },
        ],
        teaches: ['logrolling'], teachesOnEnd: ['earnout', 'batna'],
      },
      {
        id: 'sign', type: 'decision', title: 'Sign, or walk?',
        prompt: (run) => run.deal.nego && run.deal.nego.talks.agreed
          ? 'You have a handshake at ₹' + run.deal.price + ' crore. Your walk-away price was ₹' + Math.round(run.deal.walkAway) + ' crore. The board meets tomorrow.'
          : 'The talks ended without a handshake. Arvind wants to know what happens now.',
        options: [
          { id: 'sign', label: 'Recommend the deal to the board', requires: (run) => !!(run.deal.nego && run.deal.nego.talks.agreed), q: 3, effects: { board: 4 },
            outcome: (run) => run.deal.price > run.deal.walkAway ? 'The board approves, though the audit committee chair notes aloud that the price is above the limit you set yourself.' : 'The board approves in twenty minutes. The price is inside your own limit, and you can show your working.',
            coach: 'Signing is right when the price is at or under a walk-away you set before you fell in love with the deal.', news: 'Kaveri Consumer to acquire Firefly Foods', newsTone: 'good' },
          { id: 'walk', label: 'Recommend that Kaveri walks away', q: 2, end: 'walked', effects: { board: -4 },
            outcome: 'You tell Arvind that there is no price at which this works. He is silent for a while, then asks you to put it in writing.',
            coach: 'Walking away is a decision, not a failure. Whether it was right depends on what the business was really worth.', teaches: ['walkaway'] },
        ],
      },
      {
        id: 'int', type: 'integration', title: 'The first hundred days', capacity: 3,
        intro: 'The deal has closed. You have three units of management attention in each phase. Synergies do not capture themselves, and neither do people stay by themselves.',
        phases: ['Day 1', 'Day 30', 'Day 60', 'Day 100'],
        start: (run) => ({ capture: 0, morale: run.deal.flags.founderStays ? 66 : 48, customers: run.deal.flags.brandFolded ? 70 : 82 }),
        initiatives: [
          { id: 'townhall', name: 'Day 1 town hall with Meera on stage', track: 'people', cost: 1, morale: 10, until: 0, q: 3, desc: 'Tell 240 people what changes and what does not, on the first morning.', teaches: ['integration_100'] },
          { id: 'retain', name: 'Retention grants for the top 20', track: 'people', cost: 1, morale: 8, capture: 2, until: 1, q: 3, desc: 'Lock in the people the value walks around in.', teaches: ['key_person'] },
          { id: 'recipe', name: 'Ring-fence the product team', track: 'people', cost: 1, morale: 6, customers: 5, q: 3, desc: 'Nobody from Kaveri touches the recipes or the brand voice.', teaches: ['culture'] },
          { id: 'dist', name: 'Plug Firefly into Kaveri distribution', track: 'synergy', cost: 2, capture: 30, customers: -2, from: 1, q: 3, desc: 'The reason for the deal: four million outlets.' },
          { id: 'buy', name: 'Joint procurement', track: 'synergy', cost: 1, capture: 18, from: 1, q: 3, desc: 'Buy grains and packaging on Kaveri\'s contracts.' },
          { id: 'mergesales', name: 'Merge the two sales forces now', track: 'synergy', cost: 1, capture: 14, morale: -15, customers: -8, q: 0, desc: 'One sales team from week one.', risk: { p: 0.5, text: 'Firefly\'s metro sales leads resign together and join a rival.', capture: -8, customers: -6 }, coach: 'Speed is good; merging customer-facing teams before anyone knows their job is not.' },
          { id: 'logo', name: 'Put the Kaveri logo on the pack', track: 'synergy', cost: 1, capture: 5, morale: -8, customers: -10, q: 0, desc: 'Signal the new ownership on shelf.', coach: 'The customers bought Firefly because it was not Kaveri.' },
          { id: 'erp', name: 'Move Firefly onto Kaveri\'s ERP', track: 'systems', cost: 2, capture: 12, customers: -3, from: 2, q: 2, desc: 'One system for orders, stock and billing.', risk: { p: 0.35, text: 'The cut-over fails for a week. Orders go missing.', customers: -10 } },
          { id: 'cross', name: 'Cross-selling pilot in modern trade', track: 'synergy', cost: 1, capture: 15, from: 2, requires: ['dist'], q: 3, desc: 'Joint shelf deals with the big chains.' },
          { id: 'back', name: 'Consolidate the back office', track: 'synergy', cost: 1, capture: 12, morale: -4, from: 2, q: 2, desc: 'Finance, payroll and legal move to Kaveri\'s shared services.' },
          { id: 'listen', name: 'Customer listening tour', track: 'customers', cost: 1, customers: 8, q: 2, desc: 'Visit the top 30 retail and online accounts in person.' },
          { id: 'council', name: 'Joint culture council', track: 'people', cost: 1, morale: 7, from: 1, q: 2, desc: 'Ten people from each side, with a real budget.' },
        ],
        events: [
          { id: 'founderout', phase: 0, when: (s) => s.morale < 55, p: 0.8, text: 'With Meera gone or sidelined, the office WhatsApp group fills with rumours of job cuts.', fx: { morale: -8 } },
          { id: 'quit', phase: 1, when: (s) => s.morale < 52, p: 0.75, text: 'The head of product resigns and takes three people along.', fx: { capture: -8, customers: -5, morale: -5 } },
          { id: 'delist', phase: 2, when: (s) => s.customers < 70, p: 0.7, text: 'A premium grocery chain cuts Firefly\'s shelf space, citing "confusion about where the brand is going".', fx: { capture: -6, customers: -4 } },
          { id: 'idea', phase: 3, when: (s) => s.morale >= 70, p: 0.7, good: true, text: 'The Firefly team pitches a millet breakfast range built on Kaveri\'s factories. Nobody asked them to.', fx: { capture: 6 } },
        ],
        teaches: ['integration_100'], teachesOnEnd: ['culture'],
      },
    ],

    resolve(run) {
      return S().buyVerdict(run, {
        pricing: 'price',
        ask: () => 1090,
        extraCost: (r) => (r.deal.flags.earnout ? -15 : 0),
        headline: (tag) => ({
          triumph: 'Kaveri\'s Firefly bet lights up: snack brand doubles reach in a year',
          solid: 'Kaveri folds Firefly in quietly; growth returns',
          overpaid: 'Analysts question the price Kaveri paid for Firefly',
          disaster: 'Kaveri writes down Firefly as founder team departs',
          walked_right: 'Firefly stays independent after Kaveri walks; growth slows',
          walked_wrong: 'Rival snaps up Firefly after Kaveri blinks',
          collapsed: 'Firefly talks end; founder says brand "not for sale"',
        }[tag] || 'Kaveri and Firefly part ways'),
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
