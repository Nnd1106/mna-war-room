/* Deal File 7: MONSOON. A cross-border acquisition. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const S = () => WR.sim.score;
  const fl = (run) => run.deal.flags;

  WR.data.files.monsoon = {
    id: 'monsoon', n: 7, code: 'MONSOON', title: 'A Long Way from Pune', type: 'Cross-border acquisition',
    seat: 'Group Chairman, Sahyadri Engineering', difficulty: 3, unit: '€ m', image: 'monsoon.jpg',
    tagline: 'An Indian engineering group wants a 140-year-old German toolmaker. The family will sell. The town, the works council and the ministry have not been asked yet.',
    learn: ['Why cross-border deals fail on things that are not in the model', 'Pensions, works councils and co-determination', 'Currency risk between signing and closing', 'Foreign-investment screening', 'When not to integrate'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'Schwarzenfels, population 31,000',
        text: [
          '<b>Falkenrath Präzision</b> has made machine tools in the same Swabian valley since 1884. Its five-axis grinding machines are the ones other toolmakers buy. The fifth generation of the Falkenrath family has no successor who wants the job, and has let it be known that the right buyer would be welcome.',
          'You chair Sahyadri Engineering of Pune: tractors, castings and auto components, ₹40,000 crore of revenue and a board that wants technology India cannot yet build. Falkenrath would give you that, and a brand that opens doors in Stuttgart and Detroit. Its market value is about €1.2 billion.',
          'Buyers from far away tend to lose money in three ways. They miss liabilities that every local knows about. They alarm people who can stop the deal: employees, ministers, customers. And after closing they either smother what they bought or never touch it at all.',
        ],
        cast: [
          { name: 'Dr Clemens Falkenrath', role: 'Chairman and family shareholder', line: 'My great-great-grandfather is buried within sight of the factory gate. Please bear that in mind.' },
          { name: 'Brigitte Maurer', role: 'Chair of the works council', line: 'We have read about your company. Now we would like to read your plans.' },
        ],
        teaches: ['cross_border'],
      },
      {
        id: 'team', type: 'decision', title: 'Who goes to Germany?',
        prompt: 'The first meetings will set the tone for everything after. Who leads for Sahyadri?',
        options: [
          { id: 'local', label: 'A small team led by your German-speaking strategy head, with Stuttgart lawyers and a local pensions actuary', q: 3, effects: { people: 6, spend: 4 }, set: { localTeam: true },
            outcome: 'The first meeting is held in German, in the works canteen, at the family\'s suggestion. Your people know what a works council is before they meet one.',
            coach: 'In a foreign deal, local advisers are not a cost. They are the only way to see the risks that do not appear in English.' },
          { id: 'hq', label: 'Your trusted Pune deal team and the London office of a global bank', q: 1, effects: { people: -4 },
            outcome: 'The team is excellent and has closed a dozen deals in India. It schedules the first management presentation on a regional public holiday.',
            coach: 'Deal skill travels. Knowledge of labour law, pensions and local custom does not.' },
          { id: 'seller', label: 'Save time: rely on the seller\'s advisers and their information pack', q: 0, effects: { board: -5 }, set: { blind: true },
            outcome: 'The pack is beautifully produced. Your own analysts will have fewer days in the data room, and nobody to explain what they find.',
            coach: 'The seller\'s adviser is paid by the seller.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'The data room', days: (run) => (fl(run).blind ? 6 : fl(run).localTeam ? 9 : 8), coachDays: 9,
        intro: 'The numbers are audited and orderly. The risks are in German employment law, in a pension scheme older than your company, and in a small division that sells to customers you have never met.',
        streams: [
          { id: 'fin', name: 'Financials and pensions', desc: 'Earnings quality, pension promises, tax' },
          { id: 'ppl', name: 'Labour', desc: 'Works agreements, site guarantees, key engineers' },
          { id: 'com', name: 'Customers and contracts', desc: 'Change-of-control clauses, order book' },
          { id: 'tec', name: 'Technology and licences', desc: 'Patents, export controls, software' },
        ],
        issues: [
          { id: 'pension', stream: 'fin', depth: 2, kind: 'flag', p: 0.75, impact: -110, chip: 70, title: 'Unfunded pension promises', text: 'Falkenrath pays pensions directly from its own cash, as many German firms do. On realistic assumptions the promise is €110 million larger than the balance sheet shows.', teaches: ['pension_liability'] },
          { id: 'site', stream: 'ppl', depth: 1, kind: 'flag', p: 0.8, impact: -50, chip: 20, title: 'Site guarantee until 2031', text: 'A works agreement rules out compulsory redundancies and any transfer of production out of Schwarzenfels for seven years. Your sourcing plan assumed otherwise.', teaches: ['works_council'] },
          { id: 'coc', stream: 'com', depth: 2, kind: 'flag', p: 0.5, impact: -90, chip: 50, title: 'Change-of-control clauses', text: 'Two aerospace customers may cancel their framework contracts if Falkenrath passes to a non-European owner.', teaches: ['red_flags'] },
          { id: 'orders', stream: 'com', depth: 1, kind: 'gem', p: 0.5, impact: 60, title: 'A record order book', text: 'Electric-vehicle makers have ordered grinding lines two years ahead. The forecast in the sale documents is a year old.' },
          { id: 'export', stream: 'tec', depth: 2, kind: 'flag', p: 0.6, impact: -40, chip: 15, title: 'Dual-use export licences', text: 'A small unit makes machines for turbine blades that fall under export-control rules. A foreign owner will draw the ministry\'s attention.', teaches: ['fdi_review'] },
          { id: 'software', stream: 'tec', depth: 3, kind: 'gem', p: 0.45, impact: 90, title: 'Control software nobody has priced', text: 'Falkenrath\'s machine-control software could be licensed to other toolmakers. The family never tried.' },
          { id: 'engineers', stream: 'ppl', depth: 2, kind: 'flag', p: 0.5, impact: -45, chip: 15, title: 'Forty people hold the know-how', text: 'The grinding process lives in the heads of forty master engineers, a third of whom can retire within five years.', teaches: ['key_person'] },
        ],
        coachPlan: ['fin', 'fin', 'ppl', 'com', 'com', 'tec'],
        teaches: ['dd_scope'],
      },
      {
        id: 'price', type: 'pricing', title: 'What is it worth in rupees?', ddStage: 'dd',
        intro: 'Your bankers have a slide with a large synergy number on it. Decide which of those synergies would survive a seven-hour flight, then set your limit.',
        market: 1200, standalone: { mid: 1340, noise: 0.04 }, cap: 8, integrationCost: 70, share: 0.6,
        synergies: [
          { id: 'sourcing', name: 'Castings and components from Pune', kind: 'cost', runRate: 22, range: [0.3, 0.9], coach: 0.55 },
          { id: 'asia', name: 'Selling Falkenrath machines through your Asian network', kind: 'revenue', runRate: 30, range: [0.3, 0.9], coach: 0.5 },
          { id: 'tech', name: 'Falkenrath technology in your own plants', kind: 'capital', runRate: 18, range: [0.4, 1.0], coach: 0.6 },
          { id: 'move', name: 'Moving assembly to a low-cost site', kind: 'cost', runRate: 25, range: [0.0, 0.3], coach: 0.05 },
        ],
        teaches: ['synergy_types'], teachesOnLock: ['walkaway'],
      },
      {
        id: 'talks', type: 'negotiation', title: 'The family', rounds: 5, probes: 2, failEnd: 'collapsed',
        threshold: (run) => 62 - (fl(run).localTeam ? 4 : 0) + (fl(run).blind ? 3 : 0) - Math.min(4, (run.deal.dd ? run.deal.dd.chips : 0) / 50),
        intro: 'Dr Falkenrath negotiates for the family. Price is on the table, and so is the future of a town. He will not say which he would trade for which.',
        counterpart: { name: 'Dr Clemens Falkenrath', role: 'Chairman, Falkenrath Präzision' },
        youWeights: { price: 3, jobs: 1, lead: 1.5, name: 1, stake: 1 },
        issues: [
          { id: 'price', name: 'Price for the equity', desc: 'For the shares being sold, on a 100 percent basis', options: [
            { id: 'p1', label: '€1,300m', you: 100, them: 10, price: 1300 }, { id: 'p2', label: '€1,390m', you: 72, them: 48, price: 1390 },
            { id: 'p3', label: '€1,480m', you: 42, them: 78, price: 1480 }, { id: 'p4', label: '€1,570m', you: 10, them: 100, price: 1570 }] },
          { id: 'jobs', name: 'Schwarzenfels', desc: 'Commitments on the site and its 2,400 jobs', options: [
            { id: 'j0', label: 'Only what the law requires', you: 100, them: 5, effects: { people: -8 } }, { id: 'j1', label: 'Honour the existing guarantee to 2031', you: 80, them: 60, effects: { people: 4 } },
            { id: 'j2', label: 'Extend it to 2036 and fund a new training centre', you: 45, them: 100, effects: { people: 10 }, set: { jobsDeal: true } }] },
          { id: 'lead', name: 'Who runs Falkenrath', desc: 'Management after closing', options: [
            { id: 'l0', label: 'A Sahyadri executive as managing director', you: 60, them: 5, set: { expatBoss: true } }, { id: 'l1', label: 'The German management stays, reporting to a joint board', you: 100, them: 80, set: { localBoss: true } },
            { id: 'l2', label: 'Full operating independence for ten years', you: 35, them: 100, set: { localBoss: true, handsOff: true } }] },
          { id: 'name', name: 'Name and headquarters', desc: 'What is written over the gate', options: [
            { id: 'n0', label: '"Sahyadri Falkenrath", group functions move to Pune', you: 70, them: 0 }, { id: 'n1', label: 'Falkenrath name and headquarters stay as they are', you: 100, them: 85 }] },
          { id: 'stake', name: 'The family\'s stake', desc: 'How much they keep', options: [
            { id: 's0', label: 'You buy 100 percent', you: 80, them: 55 }, { id: 's1', label: 'The family keeps 15 percent and a board seat for five years', you: 100, them: 80, set: { familyStays: true } }] },
        ],
        profiles: [
          { id: 'town', weights: { jobs: 3.5, name: 2, lead: 1.5, price: 1, stake: 0.5 }, tell: 'He cared most about what the town would say of his family in twenty years. Jobs and the name were worth more to him than a hundred million euros.' },
          { id: 'money', weights: { price: 3.5, stake: 1, jobs: 1, lead: 0.5, name: 0.5 }, tell: 'Eleven cousins wanted their money. Sentiment was for the press release; price was for the family meeting.' },
          { id: 'craft', weights: { lead: 3.5, name: 1.5, jobs: 1.5, price: 1.5, stake: 1 }, tell: 'He feared head-office managers who had never ground a tool. Leave his engineers in charge and he would have moved on almost anything else.' },
        ],
        teaches: ['logrolling'], teachesOnEnd: ['batna', 'cross_border'],
      },
      {
        id: 'fx', type: 'decision', title: 'Rupees today, euros in five months',
        prompt: (run) => 'You have signed at €' + (run.deal.price || 0).toLocaleString('en-IN') + ' million. Closing waits on the ministry, perhaps five months away. Your money is in rupees. What do you do about the exchange rate?',
        options: [
          { id: 'natural', label: 'Borrow half the price in euros against Falkenrath\'s own euro earnings, and hedge the rest with a deal-contingent forward', q: 3, effects: { spend: 6 }, set: { hedged: true },
            outcome: 'Euro debt is serviced by euro profits, and the forward falls away at no cost if the ministry says no. The treasurer sleeps.',
            coach: 'Match the currency of the debt to the currency of the cash flows, and hedge the gap between signing and closing with something that dies if the deal does.', teaches: ['fx_risk'] },
          { id: 'forward', label: 'Buy the full amount forward today with a plain forward contract', q: 2, effects: { spend: 3 }, set: { hedged: true, plainForward: true },
            outcome: 'The rate is locked. If the deal is blocked you will own a very large currency position and no company.',
            coach: 'A plain forward removes the rate risk but leaves you exposed if the deal fails to close.' },
          { id: 'none', label: 'Leave it. The rupee has been steady all year', q: 0,
            outcome: 'You decide the cost of hedging is money for nothing.',
            roll: { p: 0.45, win: { text: 'The rupee holds. You saved the fee and learned the wrong lesson.' }, lose: { text: 'Oil spikes in month three and the rupee falls seven percent. The same company now costs you a hundred million euros more.', set: { fxLoss: true }, effects: { board: -8, street: -5 }, news: 'Sahyadri\'s German deal gets dearer as rupee slides' } },
            coach: 'Between signing and closing you have a fixed liability in a foreign currency. Not hedging it is a currency bet with the acquisition as the stake.', teaches: ['fx_risk'] },
        ],
      },
      {
        id: 'reg', type: 'regulatory', title: 'The ministry', authority: 'The Federal Ministry',
        intro: 'Foreign-investment screening is not competition law. The questions are about security and public order, and the review is as much political as legal. You do not know how seriously the ministry takes each concern.',
        concerns: [
          { id: 'security', name: 'Turbine-blade machines', desc: 'Dual-use technology passing to a non-European owner.', severity: [4, 18] },
          { id: 'jobs', name: 'A regional champion', desc: 'The state premier faces an election; the newspapers have discovered Schwarzenfels.', severity: [2, 14], shift: (run) => (fl(run).jobsDeal ? -6 : 0) + (run.deal.meters.people < 50 ? 4 : 0) },
        ],
        remedies: [
          { id: 'ring', name: 'Ring-fence the turbine unit', desc: 'A separate company with German directors and a security agreement.', cost: 25, fixes: { security: 10 } },
          { id: 'sell', name: 'Sell the turbine unit to a European buyer', desc: 'Lose three percent of revenue and the ministry\'s main worry.', cost: 70, fixes: { security: 18 } },
          { id: 'pledge', name: 'Binding investment and jobs pledge', desc: 'A public contract with the state: €120 million of investment, jobs to 2034.', cost: 35, fixes: { jobs: 9 } },
          { id: 'boardde', name: 'A supervisory board with a German majority', desc: 'Including a seat for the state bank.', cost: 20, fixes: { jobs: 6, security: 3 } },
        ],
        intel: [
          { id: 'counsel', name: 'Former ministry official as counsel', desc: 'Someone who knows how the security team reads a file.', days: 10, reveals: ['security'] },
          { id: 'premier', name: 'Call on the state premier', desc: 'Listen for what he needs to be able to say in public.', days: 7, reveals: ['jobs'] },
        ],
        litigate: { p: 0.15, spend: 10 },
        teaches: ['fdi_review'], teachesOnEnd: ['remedies'],
      },
      {
        id: 'int', type: 'integration', title: 'How close is close enough?', capacity: 3,
        intro: 'You own a company seven thousand kilometres away whose value is its people and its name. Integrate too much and you break it. Integrate nothing and you paid a premium for a postcard.',
        phases: ['Day 1', 'Month 4', 'Month 10', 'Month 18'],
        start: (run) => ({ capture: 0, morale: 58 + (fl(run).localBoss ? 8 : -8) + Math.round((run.deal.meters.people - 60) / 4), customers: 80 }),
        initiatives: [
          { id: 'gate', name: 'Stand at the factory gate on Day 1', track: 'people', cost: 1, morale: 10, until: 0, q: 3, desc: 'You, in person, at the 6 a.m. shift change, with Dr Falkenrath beside you.', teaches: ['integration_100'] },
          { id: 'office', name: 'A small integration office, half German', track: 'people', cost: 1, morale: 5, capture: 6, until: 0, q: 3, desc: 'Six people, one of them from the works council.', teaches: ['light_touch'] },
          { id: 'expats', name: 'Send forty managers from Pune', track: 'people', cost: 1, capture: 8, morale: -16, until: 1, q: 0, desc: 'Put your own people into every function.', coach: 'Flooding an acquired company with head-office managers tells its best people that they have been conquered.' },
          { id: 'cust', name: 'Visit every aerospace and automotive customer', track: 'customers', cost: 1, customers: 12, until: 1, q: 3, desc: 'Before a competitor does it for you.' },
          { id: 'asia', name: 'Falkenrath machines in your Asian sales network', track: 'synergy', cost: 2, capture: 30, from: 1, q: 3, desc: 'Their product, your reach. Nothing in Germany has to change.' },
          { id: 'sourcing', name: 'Qualify Pune castings for German machines', track: 'synergy', cost: 1, capture: 16, from: 1, when: (run) => !fl(run).handsOff, q: 3, desc: 'Their engineers set the standard; your foundry meets it.' },
          { id: 'exchange', name: 'Engineer exchange: sixty people each way', track: 'people', cost: 1, capture: 16, morale: 6, from: 1, q: 3, desc: 'This is how technology actually transfers.', teaches: ['culture'] },
          { id: 'move', name: 'Move final assembly to Pune', track: 'synergy', cost: 2, capture: 14, morale: -22, customers: -10, from: 1, q: 0, desc: 'The sums look compelling.', risk: { p: 0.7, text: 'The works council goes to the labour court, the premier goes on television, and two customers ask whether "Made in Germany" still applies.', capture: -12, customers: -8 }, coach: 'The customers pay for the name on the casting. Moving the work destroys the thing you bought.' },
          { id: 'erp', name: 'Put Falkenrath on the group ERP and reporting calendar', track: 'systems', cost: 1, capture: 5, morale: -8, from: 1, q: 1, desc: 'Monthly packs in the Pune format, due on day three.', coach: 'Controls matter, but imposing every group process on a business you bought for being different is how light touch becomes heavy hand.' },
          { id: 'software', name: 'Licence the control software to other toolmakers', track: 'synergy', cost: 1, capture: 12, from: 2, when: (run) => !!(run.deal.dd && run.deal.dd.found.includes('software')), q: 3, desc: 'The opportunity you found in the data room.' },
          { id: 'academy', name: 'Fund the apprentice academy', track: 'people', cost: 1, morale: 9, capture: 4, from: 2, q: 2, desc: 'The next forty master engineers have to come from somewhere.' },
        ],
        events: [
          { id: 'boss', phase: 0, when: (s, run) => !!fl(run).expatBoss, p: 0.8, text: 'The new managing director\'s first all-hands is delivered in English with slides. The works council asks for the minutes in German.', fx: { morale: -8 } },
          { id: 'leave', phase: 1, when: (s) => s.morale < 50, p: 0.75, text: 'Nine senior engineers take early retirement together. Two start consulting for a Swiss competitor.', fx: { capture: -10, morale: -4 } },
          { id: 'lost', phase: 2, when: (s) => s.customers < 72, p: 0.7, text: 'An aerospace customer exercises its right to re-tender.', fx: { capture: -8, customers: -5 } },
          { id: 'idle', phase: 2, when: (s, run) => !!fl(run).handsOff && s.capture < 30, p: 1, text: 'Eighteen months in, the two companies have exchanged Christmas cards and little else.', fx: { capture: -4 } },
          { id: 'proud', phase: 3, when: (s) => s.morale >= 68, p: 0.75, good: true, text: 'A joint Pune-Schwarzenfels team launches a machine at the Hanover fair. The local paper calls Sahyadri "our Indians".', fx: { capture: 8, customers: 4 } },
        ],
        teaches: ['light_touch'], teachesOnEnd: ['culture'],
      },
    ],

    resolve(run) {
      return S().buyVerdict(run, {
        pricing: 'price',
        ask: () => 1480,
        extraCost: (r) => (fl(r).fxLoss ? 0.07 * (r.deal.price || 0) : 0) + (fl(r).familyStays ? -20 : 0),
        texts: {
          blocked: ['Verboten', 'The ministry prohibited the acquisition. Five months, the advisers\' fees and a good deal of goodwill are gone.'],
          collapsed: ['The family says no', 'Dr Falkenrath thanked you for your interest and sold to a foundation instead. You never found out what he wanted, because you did not ask.'],
        },
        headline: (tag) => ({
          triumph: 'From Pune to Swabia: Sahyadri\'s Falkenrath deal hailed as a model',
          solid: 'Falkenrath settles in under Indian ownership; order book grows',
          overpaid: 'Sahyadri investors question the price of German prestige',
          disaster: 'Engineers leave, customers waver: Sahyadri\'s German adventure sours',
          blocked: 'Berlin blocks sale of Falkenrath to Indian group',
          collapsed: 'Falkenrath family ends talks with Sahyadri',
        }[tag] || 'Sahyadri and Falkenrath go separate ways'),
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
