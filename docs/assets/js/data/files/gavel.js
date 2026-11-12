/* Deal File 2: GAVEL. A banker-run auction and the winner's curse. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const S = () => WR.sim.score;

  WR.data.files.gavel = {
    id: 'gavel', n: 2, code: 'GAVEL', title: 'Best and Final', type: 'Banker-run auction',
    seat: 'Chief Strategy Officer, Northwind Logistics', difficulty: 2, unit: '$ m', image: 'gavel.jpg',
    tagline: 'A private-equity owner is selling a cold-storage network. Three other bidders want it. One of them wants it too much.',
    learn: ['How a two-round sale process works', 'Reading a vendor\'s numbers', 'Setting a walk-away before the room heats up', 'The winner\'s curse', 'Antitrust remedies'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'The teaser',
        text: [
          'A two-page teaser lands on your desk: "Project Glacier". Everyone in the industry knows it is <b>Polar Chain</b>, 41 temperature-controlled warehouses along the coast, owned for six years by the buyout firm Aldgate Capital. Aldgate\'s fund is at the end of its life and must sell.',
          'The bank running the sale has set out the process: a first round of non-binding bids on limited information, then a short list, a data room, and binding "best and final" offers. Guidance is whispered at around $1.5 billion.',
          'Northwind is the number-two cold-chain operator. Polar Chain would make it number one. Your chief executive would like that very much. So would the chief executive of your nearest rival, Kestrel Freight.',
        ],
        cast: [
          { name: 'Imogen Hart', role: 'Managing director at the bank running the sale', line: 'I can tell you there is strong interest. I cannot tell you from whom.' },
          { name: 'Dev Malhotra', role: 'CEO, Northwind (your boss)', line: 'If Kestrel gets this, we are number three for a decade.' },
        ],
        teaches: ['auction_process'],
      },
      {
        id: 'team', type: 'decision', title: 'Gearing up',
        prompt: 'The process letter gives you five weeks. How do you staff it?',
        options: [
          { id: 'full', label: 'A full deal team with outside accountants and lawyers', q: 3, effects: { spend: 6 }, set: { fullTeam: true },
            outcome: 'It costs $6 million whether you win or not. You will have nine analyst-days in the data room instead of six.',
            coach: 'In an auction the seller controls the information. The only edge you can buy is the ability to read it better than the others.' },
          { id: 'thin', label: 'A small in-house team to keep costs down', q: 1, effects: { board: 2 },
            outcome: 'The finance director approves of the thrift. Your team will have six analyst-days in the data room.',
            coach: 'Saving a few million on diligence for a billion-dollar bid is a false economy.' },
          { id: 'around', label: 'Call Polar Chain\'s CEO directly, around the bank', q: 0, effects: { heat: 12, street: -3 }, set: { offside: true },
            outcome: 'The CEO takes the call, says nothing useful and reports it to the bank. Imogen Hart reminds you, in writing, of the process rules.',
            coach: 'Going around the sell-side adviser breaks the process letter and gives the seller a reason to disfavour you.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'The data room', days: (run) => (run.deal.flags.fullTeam ? 9 : 6),
        intro: 'You made the short list. The data room opens with a glossy vendor due diligence report, paid for by the seller. Your analyst-days are limited; each level deeper in a workstream costs one day more.',
        streams: [
          { id: 'fin', name: 'Financials', desc: 'Adjusted EBITDA, leases, working capital' },
          { id: 'com', name: 'Commercial', desc: 'Customers, contracts, pipeline' },
          { id: 'ops', name: 'Assets', desc: 'Warehouses, refrigeration plant, land' },
          { id: 'leg', name: 'Legal and environment', desc: 'Permits, claims, ammonia safety' },
          { id: 'tec', name: 'Technology', desc: 'Warehouse management systems' },
        ],
        issues: [
          { id: 'addbacks', stream: 'fin', depth: 1, kind: 'flag', p: 0.8, impact: -70, chip: 0, title: 'Generous add-backs', text: 'A tenth of "adjusted EBITDA" is one-off costs that recur every year and savings that have not happened yet.', teaches: ['adjusted_ebitda'] },
          { id: 'leases', stream: 'fin', depth: 3, kind: 'flag', p: 0.4, impact: -80, chip: 0, title: 'Sale-and-leaseback rents step up', text: 'Nine warehouses were sold and leased back in year two. The rents rise sharply from next year, which the model ignores.' },
          { id: 'client', stream: 'com', depth: 1, kind: 'flag', p: 0.7, impact: -60, chip: 0, title: 'One customer is 28% of revenue', text: 'A supermarket chain accounts for over a quarter of revenue, and its contract is up for renewal in fourteen months.' },
          { id: 'pharma', stream: 'com', depth: 2, kind: 'gem', p: 0.5, impact: 70, title: 'Pharma contracts in final negotiation', text: 'Two vaccine distributors are close to signing ten-year contracts for ultra-cold capacity. The vendor report barely mentions them.' },
          { id: 'capex', stream: 'ops', depth: 2, kind: 'flag', p: 0.6, impact: -90, chip: 0, title: 'Deferred maintenance', text: 'Aldgate has under-spent on refrigeration plant for three years. A third of the compressors are past their design life.', teaches: ['red_flags'] },
          { id: 'land', stream: 'ops', depth: 3, kind: 'gem', p: 0.4, impact: 110, title: 'Port-side land carried at cost', text: 'Sixty acres beside two container ports sit on the books at their 1990s purchase price.' },
          { id: 'ammonia', stream: 'leg', depth: 2, kind: 'flag', p: 0.35, impact: -50, chip: 0, title: 'Ammonia leak claim', text: 'A leak at one site injured four workers last year. The claim and a regulatory order are both outstanding.' },
          { id: 'wms', stream: 'tec', depth: 1, kind: 'flag', p: 0.5, impact: -30, chip: 0, title: 'Warehouse software is end-of-life', text: 'The vendor stops supporting the warehouse management system in two years.' },
        ],
        coachPlan: ['fin', 'com', 'ops', 'ops', 'com'], coachDays: 9,
        teaches: ['dd_scope', 'vendor_dd'],
      },
      {
        id: 'price', type: 'pricing', title: 'Your number', ddStage: 'dd',
        intro: 'Before the bidding starts, decide what Polar Chain is worth to Northwind and where you stop. In the room, with the bank on the phone, it will be much harder to think.',
        market: 1500, standalone: { mid: 1550, noise: 0.03 }, cap: 9, integrationCost: 80, share: 0.85,
        synergies: [
          { id: 'network', name: 'Network density: fewer empty miles', kind: 'cost', runRate: 28, range: [0.6, 1.0], coach: 0.8 },
          { id: 'overhead', name: 'One head office, not two', kind: 'cost', runRate: 14, range: [0.8, 1.1], coach: 0.9 },
          { id: 'cross', name: 'Selling pharma cold chain to your customers', kind: 'revenue', runRate: 25, range: [0.1, 0.7], coach: 0.3 },
          { id: 'pricing', name: 'Firmer pricing where the networks overlap', kind: 'revenue', runRate: 15, range: [0.0, 0.5], coach: 0.15 },
          { id: 'capexavoid', name: 'Cancel your own planned warehouses', kind: 'capital', runRate: 10, range: [0.5, 1.0], coach: 0.7 },
        ],
        teaches: ['synergy_types'], teachesOnLock: ['walkaway', 'winners_curse'],
      },
      {
        id: 'auction', type: 'auction', title: 'The bidding', pricingStage: 'price', open: 1500, increment: 0.02, rounds: 4,
        intro: 'Four bidders remain. Each round, everyone still in must beat the standing high bid or drop out. The fourth round is sealed: one number each, best and final.',
        rivals: [
          { id: 'harbour', name: 'Harbour Infrastructure Partners', kind: 'Infrastructure fund', blurb: 'Patient money, strict return targets. Never the highest bidder twice.', value: [1500, 1700], hubris: [0, 0.03] },
          { id: 'kestrel', name: 'Kestrel Freight', kind: 'Strategic rival', blurb: 'Your competitor. Its CEO has told the press he "will not lose this one".', value: [1580, 1820], hubris: [0, 0.15] },
          { id: 'meridian', name: 'Meridian Sovereign Fund', kind: 'Sovereign wealth fund', blurb: 'Deep pockets and a new mandate for logistics assets.', value: [1420, 1720], hubris: [-0.02, 0.05] },
        ],
        teaches: ['auction_process'], teachesOnEnd: ['winners_curse'],
      },
      {
        id: 'spa', type: 'decision', title: 'The contract',
        prompt: 'You are the preferred bidder. The lawyers have 72 hours to finish the sale agreement. How hard do you push on protection?',
        options: [
          { id: 'protect', label: 'Insist on specific indemnities for what you found, and buy warranty insurance', q: 3, effects: { spend: 8 }, set: { protected: true },
            outcome: 'Aldgate grumbles, then agrees: a fund in wind-down cannot give long warranties, but it can fund an escrow for the issues you documented, and the insurer covers the rest.',
            coach: 'Diligence findings are only worth something if they turn into price or protection. A private-equity seller will not stand behind warranties for long, so insurance fills the gap.', teaches: ['spa_protection'] },
          { id: 'clean', label: 'Sign a clean contract quickly to keep the seller happy', q: 1, effects: { days: -5 },
            outcome: 'The contract is signed in two days. Everything you found in the data room is now your problem alone.',
            coach: 'After you have won, the seller needs you more than you need its goodwill.' },
          { id: 'retrade', label: 'Reopen the price: demand 4% off for "diligence findings"', q: 0, effects: { heat: 10, street: -4 },
            outcome: 'You tell the bank the price has to come down.',
            roll: { p: 0.3, win: { text: 'Aldgate, out of time, concedes most of it.', set: { retraded: true } }, lose: { text: 'Imogen Hart thanks you for your interest and calls the runner-up within the hour.', end: 'lost', news: 'Northwind dropped from Polar Chain sale after late price demand' } },
            coach: 'Retrading after winning burns your reputation with every bank on the street, and the seller usually has a runner-up waiting.' },
        ],
      },
      {
        id: 'reg', type: 'regulatory', title: 'The competition review', authority: 'The Competition Authority',
        intro: 'Number two is buying number three. The authority has two concerns, and you do not know exactly how seriously it takes either. Offer too little and you lose months; offer too much and you give away what you just paid for.',
        concerns: [
          { id: 'overlap', name: 'Overlap in two port cities', desc: 'Between you, you would hold most of the cold storage at Port Albany and Port Brisa.', severity: [8, 22] },
          { id: 'vertical', name: 'Access to pharma cold chain', desc: 'Rival distributors fear being shut out of ultra-cold capacity.', severity: [0, 12] },
        ],
        remedies: [
          { id: 'albany', name: 'Sell three warehouses at Port Albany', desc: 'To an approved buyer within six months.', cost: 45, fixes: { overlap: 12 } },
          { id: 'brisa', name: 'Sell the whole Port Brisa cluster', desc: 'Seven sites, including the newest.', cost: 90, fixes: { overlap: 16 } },
          { id: 'access', name: 'Open-access commitment for pharma capacity', desc: 'Published tariffs, an independent monitor.', cost: 15, fixes: { vertical: 12 } },
          { id: 'cap', name: 'Three-year price cap in overlap regions', desc: 'A behavioural promise; authorities like these less than divestments.', cost: 25, fixes: { overlap: 6, vertical: 3 } },
        ],
        intel: [
          { id: 'econ', name: 'Commission an economists\' market study', desc: 'Shows how the authority is likely to define the market around the ports.', days: 14, reveals: ['overlap'] },
          { id: 'prenotify', name: 'Hold pre-notification talks with the case team', desc: 'Listen to what they ask about.', days: 10, reveals: ['vertical'] },
        ],
        litigate: { p: 0.3, spend: 12 },
        teaches: ['antitrust'], teachesOnEnd: ['remedies'],
      },
    ],

    resolve(run) {
      return S().buyVerdict(run, {
        pricing: 'price',
        extraCost: (r) => {
          const dd = r.deal.dd || { found: [] };
          const stage = r.file.stages.find((s) => s.id === 'dd');
          const foundBad = stage.issues.filter((i) => dd.found.includes(i.id) && i.impact < 0).reduce((a, i) => a + i.impact, 0);
          let c = 0;
          if (r.deal.flags.protected) c += 0.6 * foundBad;   // documented problems are largely recovered from escrow and insurance
          if (r.deal.flags.retraded) c -= 0.04 * (r.deal.price || 0);
          return c;
        },
        texts: {
          lost_right: ['Outbid, and glad of it', 'Someone paid more for Polar Chain than it was worth to you. You kept your number while a rival lost his. That is the whole lesson of an auction.'],
          walked_right: ['You dropped out. Good.', 'The bidding passed what Polar Chain was worth to you and you stopped. The winner will spend years explaining the price.'],
          disaster: ['The winner\'s curse', 'You won the auction by being the bidder who was most wrong about the value. In a room of informed buyers, the highest estimate is usually a mistake.'],
        },
        headline: (tag, r) => ({
          triumph: 'Northwind takes Polar Chain and the top spot, at a price analysts call "sensible"',
          solid: 'Northwind completes Polar Chain purchase after regulatory conditions',
          overpaid: 'Northwind wins Polar Chain; shares slide on price',
          disaster: 'Northwind\'s Polar Chain prize turns sour as costs mount',
          walked_right: (r.deal.auction ? r.deal.auction.winner : 'Rival') + ' wins Polar Chain in "eye-watering" bid as Northwind steps aside',
          walked_wrong: (r.deal.auction ? r.deal.auction.winner : 'Rival') + ' picks up Polar Chain after Northwind drops out early',
          lost_right: (r.deal.auction ? r.deal.auction.winner : 'Rival') + ' outbids Northwind for Polar Chain; investors question price',
          lost_wrong: 'Northwind pipped for Polar Chain',
          blocked: 'Competition authority blocks Northwind\'s Polar Chain deal',
        }[tag] || 'Polar Chain sale concludes'),
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
