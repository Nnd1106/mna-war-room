/* Deal File 3: SIEGE. A hostile takeover from the bidder's chair. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const S = () => WR.sim.score;
  const lostQuarry = (run) => !!(run.st.fight && run.st.fight.log && run.st.fight.log.some((l) => l.move === 'crownjewel' && !l.countered));

  WR.data.files.siege = {
    id: 'siege', n: 3, code: 'SIEGE', title: 'Over the Board\'s Head', type: 'Hostile takeover',
    seat: 'Chief Executive, Titan Aggregates', difficulty: 3, unit: '$ m', image: 'siege.jpg',
    tagline: 'Their board has said no twice. Their shareholders have not been asked. You have a war chest, five weeks and no data room.',
    learn: ['Toeholds and bear hugs', 'Valuing a target from the outside', 'Takeover defences and how to answer them', 'Why hostile deals cost more', 'Integrating after a fight'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'Two refusals',
        text: [
          'Titan Aggregates has wanted <b>Halvorsen Cement</b> for three years. The plants sit side by side across the northern corridor; together they would run fuller kilns and shorter truck routes than either can alone.',
          'Twice you have written privately to Halvorsen\'s chairman, Henrik Halvorsen, grandson of the founder. Twice the board has replied that the company is "not for sale". The family holds 22 percent. Institutions hold 45 percent and have watched the share price go nowhere for five years. Retail investors hold the rest.',
          'Halvorsen\'s market value is $4.0 billion. Your board has authorised you to go over the directors\' heads to the shareholders. A hostile bid means no data room, a public fight and a price that only goes one way.',
        ],
        cast: [
          { name: 'Henrik Halvorsen', role: 'Chairman, Halvorsen Cement', line: 'My grandfather built this company. It is not a spare part for yours.' },
          { name: 'Rosalind Achebe', role: 'Your lead banker', line: 'Hostile bids are won on price and lost on patience. Decide now what you will not pay.' },
        ],
        teaches: ['hostile_bid'],
      },
      {
        id: 'toehold', type: 'decision', title: 'Before anyone knows',
        prompt: 'The market is quiet. Do you buy Halvorsen shares before you make a move?',
        options: [
          { id: 'toe', label: 'Quietly buy 4.9%, just under the disclosure line', q: 3, effects: { days: 12, spend: 0 }, set: { toehold: true },
            outcome: 'Over twelve trading days your brokers pick up 4.9 percent at close to the undisturbed price. Nobody notices.',
            coach: 'A toehold bought cheaply lowers your average cost, gives you votes, and pays for your expenses if a rival outbids you.', teaches: ['toehold'] },
          { id: 'none', label: 'Buy nothing; keep your hands clean', q: 1,
            outcome: 'You start the fight with no shares and no votes.',
            coach: 'There is nothing improper about a toehold below the disclosure threshold. Starting with nothing just makes everything dearer.' },
          { id: 'grab', label: 'Buy as much as you can, as fast as you can', q: 1, effects: { heat: 10, days: 6 }, set: { toehold: true, runup: true },
            outcome: 'You cross the disclosure threshold within a week. The filing sends Halvorsen up 11 percent and its board straight to its lawyers.',
            coach: 'Crossing the disclosure line announces your intentions and moves the price against you before you have made an offer.' },
        ],
      },
      {
        id: 'price', type: 'pricing', title: 'Valuing from the outside',
        intro: 'There is no data room in a hostile bid. You have annual reports, plant visits from the road and your own industry knowledge. Decide what Halvorsen is worth to Titan and set your limit. Your board will hold you to it.',
        market: 4000, standalone: { mid: 4100, noise: 0.06 }, cap: 8, integrationCost: 250, share: 0.8,
        synergies: [
          { id: 'kilns', name: 'Clinker swaps and fuller kilns', kind: 'cost', runRate: 120, range: [0.6, 1.0], coach: 0.8 },
          { id: 'overhead', name: 'Head office and procurement', kind: 'cost', runRate: 50, range: [0.7, 1.1], coach: 0.85 },
          { id: 'discipline', name: 'Better pricing in the north', kind: 'revenue', runRate: 60, range: [0.0, 0.5], coach: 0.2 },
          { id: 'quarry', name: 'Their limestone for your plants', kind: 'capital', runRate: 40, range: [0.4, 1.0], coach: 0.6 },
        ],
        teaches: ['control_premium'], teachesOnLock: ['walkaway'],
      },
      {
        id: 'open', type: 'decision', title: 'The opening move',
        prompt: 'How do you start the public phase?',
        options: [
          { id: 'bearhug', label: 'A public "bear hug" letter: a generous price and an offer to talk', q: 3, effects: { street: 4, heat: 6 }, set: { bearhug: true },
            outcome: 'The letter is on every terminal by 7 a.m.: a 15 percent premium, warm words for the family and an invitation to negotiate. Halvorsen\'s shareholders now know there is a bid, and the board must explain why it will not talk.',
            coach: 'A bear hug puts the board under pressure from its own shareholders while you still look reasonable.', teaches: ['bear_hug'], news: 'Titan goes public with $4.6bn approach for Halvorsen', newsTone: 'neutral' },
          { id: 'tender', label: 'Skip the letter; launch a tender offer at once', q: 2, effects: { heat: 12 },
            outcome: 'The offer document goes straight to shareholders. The clock starts, and so does the hostility.',
            coach: 'Fast, but you give up the chance to look like the reasonable party, and the board unites against you.', teaches: ['tender_offer'], news: 'Titan launches hostile tender for Halvorsen', newsTone: 'neutral' },
          { id: 'third', label: 'Write privately to the chairman a third time', q: 0, effects: { days: 21, board: -5 }, set: { warned: true },
            outcome: 'Three weeks pass. The reply is the same, but Halvorsen has used the time to hire defence advisers and brief friendly journalists.',
            coach: 'A third private approach tells the target what is coming and gives it time to prepare.' },
        ],
      },
      {
        id: 'fight', type: 'battle', title: 'The fight for the register', side: 'attack', rounds: 5, threshold: 50, chest: 100,
        support0: (run) => 36 + (run.deal.flags.toehold ? 4 : 0) + (run.deal.flags.bearhug ? 3 : 0) - (run.deal.flags.warned ? 4 : 0),
        price: (run) => 4600 * (run.deal.flags.runup ? 1.03 : 1),
        intro: 'You need acceptances from over half the shares. Each week Halvorsen makes a move and you play one card. Your board will not let you raise the offer beyond your walk-away price.',
        cards: [
          { id: 'roadshow', name: 'Institutional roadshow', type: 'investors', cost: 10, support: [4, 7], q: 3, desc: 'Meet the top fifteen holders in person with the industrial logic.', counters: ['results'] },
          { id: 'proxy', name: 'Nominate your own directors', type: 'board', cost: 20, support: [4, 8], q: 3, desc: 'Call a shareholder meeting to replace the directors who refuse to talk.', counters: ['justsayno', 'pill'], teaches: ['proxy_fight'] },
          { id: 'jobs', name: 'Public pledges on plants and jobs', type: 'pr', cost: 0, support: [2, 4], effects: { people: 6 }, q: 3, desc: 'Commit in writing to keep every kiln running for three years.', counters: ['politics'] },
          { id: 'raise', name: 'Raise the offer by 5%', type: 'price', cost: 0, support: [7, 11], bump: 0.05, once: false, q: 2, desc: 'The one argument every shareholder understands.',
            requires: (run, st) => st.price * 1.05 <= (run.deal.walkAway || Infinity), coach: 'Raising works, but every point you add is value handed to their shareholders. Use it last, and never past your limit.' },
          { id: 'letter', name: 'Open letter on the board\'s record', type: 'pr', cost: 0, support: [2, 6], effects: { heat: 6 }, q: 2, desc: 'Five years of flat returns, set out in one page of charts.', counters: ['justsayno'] },
          { id: 'court', name: 'Challenge the defences in court', type: 'legal', cost: 25, support: [0, 3], q: 2, desc: 'Ask the court to strike down measures that deny shareholders a choice.', counters: ['pill', 'crownjewel'] },
          { id: 'cash', name: 'Make the offer all cash, fully financed', type: 'price', cost: 15, support: [3, 6], q: 2, desc: 'Remove any doubt that the money is there.', counters: ['whiteknight'], teaches: ['cash_vs_stock'] },
          { id: 'smear', name: 'Brief the press against the family', type: 'pr', cost: 0, support: [-2, 5], effects: { heat: 15, people: -8 }, q: 0, desc: 'Private jets, relatives on the payroll.', coach: 'Personal attacks harden the family, unsettle employees you are about to inherit and rarely move institutions.' },
          { id: 'withdraw', name: 'Withdraw the offer', type: 'exit', cost: 0, ends: 'walked', q: 1, from: 2, desc: 'Walk away with your toehold and your dignity.', coach: 'Withdrawing is right when the price needed to win has passed what the business is worth.' },
        ],
        enemy: [
          { id: 'justsayno', name: 'Just say no', tell: 'Halvorsen has called a press conference.', desc: 'The board unanimously rejects the offer as one that "fundamentally undervalues" the company.', support: [-5, -2], weight: 3 },
          { id: 'pill', name: 'Shareholder rights plan', tell: 'Their lawyers were seen at a late board meeting.', desc: 'A poison pill: if anyone passes 20 percent without board approval, everyone else can buy new shares at half price.', support: [-8, -4], minRound: 2, weight: 2 },
          { id: 'whiteknight', name: 'A white knight', tell: 'A Swiss building-materials group has hired a bank.', desc: 'A friendly rival bidder appears with the board\'s blessing.', support: [-10, -5], minRound: 3, weight: 2 },
          { id: 'crownjewel', name: 'Crown-jewel sale', tell: 'Halvorsen is said to be talking to a quarry operator.', desc: 'The board agrees to sell the northern limestone quarries, the asset you wanted most, to a third party.', support: [-4, -1], minRound: 2, weight: 1 },
          { id: 'politics', name: 'A political campaign', tell: 'The regional governor has asked for a briefing.', desc: 'Unions and local politicians rally against "asset strippers" and plant closures.', support: [-6, -3], weight: 2 },
          { id: 'results', name: 'Surprise results', tell: 'Halvorsen has moved its results announcement forward.', desc: 'Strong quarterly numbers and a raised forecast, timed to the day.', support: [-5, -2], weight: 2 },
        ],
        teaches: ['poison_pill', 'white_knight'], teachesOnEnd: ['hostile_bid'],
      },
      {
        id: 'int', type: 'integration', title: 'After the fight', capacity: 3,
        intro: 'You won. Now you own a company whose managers spent two months being told you were the enemy. You have three units of attention per phase.',
        phases: ['Day 1', 'Month 3', 'Month 9'],
        start: (run) => ({ capture: 0, morale: Math.max(20, 46 - Math.round(run.deal.meters.heat / 6) + Math.round((run.deal.meters.people - 60) / 4)), customers: 78 }),
        initiatives: [
          { id: 'visit', name: 'Visit every plant in the first fortnight', track: 'people', cost: 1, morale: 12, until: 0, q: 3, desc: 'You, in person, on the kiln floor, answering questions.', teaches: ['integration_100'] },
          { id: 'keep', name: 'Keep their best operators in charge', track: 'people', cost: 1, morale: 9, capture: 3, until: 0, q: 3, desc: 'Name Halvorsen\'s plant heads to the combined team on Day 1.', teaches: ['key_person'] },
          { id: 'purge', name: 'Replace their senior management', track: 'people', cost: 1, morale: -16, capture: 8, until: 0, q: 0, desc: 'They fought you. Clear them out.', coach: 'The people who fought hardest for the old owner usually know the plants best.' },
          { id: 'swap', name: 'Clinker swap programme', track: 'synergy', cost: 2, capture: 34, q: 3, desc: 'Run the kilns as one network.' },
          { id: 'proc', name: 'Combine procurement', track: 'synergy', cost: 1, capture: 16, q: 3, desc: 'One fuel contract, one bag supplier.' },
          { id: 'hq', name: 'Close the Halvorsen head office', track: 'synergy', cost: 1, capture: 14, morale: -9, from: 1, q: 2, desc: 'Three hundred jobs in the town that carries the family\'s name.' },
          { id: 'dealers', name: 'Dealer reassurance tour', track: 'customers', cost: 1, customers: 10, q: 2, desc: 'Their dealers were told you would cut them off.' },
          { id: 'quarry', name: 'Link their limestone to your plants', track: 'synergy', cost: 2, capture: 18, from: 1, when: (run) => !lostQuarry(run), q: 3, desc: 'Conveyor links and haul roads between sites.' },
          { id: 'price', name: 'Push through a price rise', track: 'synergy', cost: 1, capture: 8, customers: -12, from: 1, q: 0, desc: 'Use the new market position.', risk: { p: 0.5, text: 'The competition authority opens an inquiry into regional cement prices.', capture: -10 }, coach: 'Pricing "synergies" are the ones most likely to vanish, and to attract a regulator.' },
          { id: 'safety', name: 'One safety standard across all sites', track: 'people', cost: 1, morale: 7, from: 1, q: 2, desc: 'A shared cause both workforces believe in.' },
        ],
        events: [
          { id: 'exodus', phase: 0, when: (s) => s.morale < 45, p: 0.8, text: 'Six of Halvorsen\'s plant managers resign in the first month. A competitor hires four of them.', fx: { capture: -10, morale: -5 } },
          { id: 'strike', phase: 1, when: (s) => s.morale < 40, p: 0.7, text: 'A two-week strike at the largest plant.', fx: { capture: -10, customers: -8 } },
          { id: 'dealers', phase: 1, when: (s) => s.customers < 72, p: 0.7, text: 'A dealer network in the north switches to an importer.', fx: { capture: -6, customers: -5 } },
          { id: 'pride', phase: 2, when: (s) => s.morale >= 62, p: 0.7, good: true, text: 'A joint team from both companies sets a group record for kiln uptime.', fx: { capture: 6 } },
        ],
        teaches: ['integration_100'], teachesOnEnd: ['culture'],
      },
    ],

    resolve(run) {
      return S().buyVerdict(run, {
        pricing: 'price',
        ask: (r) => (r.deal.battle ? r.deal.battle.price * 1.08 : 5300),
        extraCost: (r) => (lostQuarry(r) ? 150 : 0) + (r.deal.flags.toehold ? -60 : 0) + (r.deal.battle ? r.deal.battle.spent : 0),
        texts: {
          failed: ['The siege fails', 'Fewer than half the shares came your way. You have spent the war chest, shown your hand and strengthened the board you wanted to remove.'],
          walked_right: ['You lifted the siege', 'You withdrew when the price of winning passed the value of the prize. Hostile bidders who cannot do that become cautionary tales.'],
          walked_wrong: ['You blinked', 'You withdrew from a fight you could have won at a price that still made sense.'],
        },
        headline: (tag) => ({
          triumph: 'Titan wins Halvorsen after five-week battle; kilns to run as one',
          solid: 'Titan takes control of Halvorsen as shareholders accept raised offer',
          overpaid: 'Titan wins Halvorsen, but at what price?',
          disaster: 'Titan\'s hostile victory sours as Halvorsen managers walk out',
          failed: 'Halvorsen sees off Titan: bid lapses short of 50%',
          walked_right: 'Titan withdraws Halvorsen bid, citing "price discipline"',
          walked_wrong: 'Titan abandons Halvorsen pursuit',
        }[tag] || 'Titan and Halvorsen: the battle ends'),
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
